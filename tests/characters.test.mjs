import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { fetchWithRetry } from "../src/lib/api-request.mjs";
import * as catalogHelpers from "../src/lib/character-catalog.mjs";

// Synthetic responses are only test fixtures; the application always uses the API.
function library(fetch, snapshot) {
  const exports = {};
  const code = ts.transpileModule(
    fs.readFileSync("src/lib/characters.ts", "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    },
  ).outputText;
  vm.runInNewContext(code, {
    exports,
    require: (name) => {
      if (name === "server-only") return {};
      if (name === "react") return { cache: (fn) => fn };
      if (name === "node:fs")
        return { readFileSync: () => JSON.stringify(snapshot) };
      if (name === "./character-catalog.mjs") return catalogHelpers;
      if (name === "./api-request.mjs")
        return {
          fetchWithRetry: (url, options) =>
            fetchWithRetry(url, options, { fetch, sleep: async () => {} }),
        };
      throw new Error(`Unexpected import: ${name}`);
    },
    process: {
      env: snapshot ? { PORTAL_DEX_BUILD_SNAPSHOT: "test-only-snapshot" } : {},
    },
    fetch,
  });
  return exports;
}

test("static params include every API page and preserve nonconsecutive IDs", async () => {
  const calls = [];
  const api = library(async (url) => {
    const page = Number(new URL(url).searchParams.get("page"));
    calls.push(page);
    return {
      ok: true,
      json: async () => ({
        info: { pages: 42, count: 42 },
        results: [{ id: page * 3 }],
      }),
    };
  });
  const ids = await api.getAllCharacterIds();
  assert.equal(ids.length, 42);
  assert.equal(ids[41].id, "126");
  assert.deepEqual(
    calls,
    Array.from({ length: 42 }, (_, i) => i + 1),
  );
});

test("all 826 details and metadata reuse paginated build data across separate workers", async () => {
  const pages = Array.from({ length: 42 }, (_, index) => ({
    info: { count: 826, pages: 42 },
    results: Array.from({ length: index === 41 ? 6 : 20 }, (_, offset) => ({
      id: index * 20 + offset + 1,
    })),
  }));
  const noNetwork = async () => {
    throw new Error("Build details must not request the API");
  };
  const firstWorker = library(noNetwork, { pages });
  const secondWorker = library(noNetwork, { pages });
  const ids = await firstWorker.getAllCharacterIds();
  assert.equal(ids.length, 826);
  for (const { id } of ids) {
    assert.equal((await firstWorker.getCharacter(id)).id, Number(id));
    assert.equal((await secondWorker.getCharacter(id)).id, Number(id));
  }
  assert.equal((await secondWorker.getCharacters()).results.length, 20);
  assert.equal(await firstWorker.getCharacter("999999"), null);
});

test("SSR bypasses the build catalog and keeps no-store", async () => {
  let calls = 0;
  const pages = [{ info: { count: 1, pages: 1 }, results: [{ id: 1 }] }];
  const api = library(
    async (_url, options) => {
      calls++;
      assert.equal(options.cache, "no-store");
      return { ok: true, json: async () => ({ live: true }) };
    },
    { pages },
  );
  assert.equal((await api.getCharacters(1, "ssr")).live, true);
  assert.equal(calls, 1);
});

test("429 respects Retry-After seconds and retries only twice", async () => {
  let calls = 0;
  const waits = [];
  const response = await fetchWithRetry(
    "test-only",
    {},
    {
      fetch: async () => {
        calls++;
        return new Response("", {
          status: 429,
          headers: { "Retry-After": "3" },
        });
      },
      sleep: async (milliseconds) => waits.push(milliseconds),
    },
  );
  assert.equal(response.status, 429);
  assert.equal(calls, 3);
  assert.deepEqual(waits, [3000, 3000]);
});

test("Retry-After HTTP date is respected before a successful retry", async () => {
  let calls = 0;
  const waits = [];
  await fetchWithRetry(
    "test-only",
    {},
    {
      fetch: async () =>
        ++calls === 1
          ? new Response("", {
              status: 429,
              headers: { "Retry-After": "Thu, 01 Jan 1970 00:00:05 GMT" },
            })
          : new Response("{}"),
      sleep: async (milliseconds) => waits.push(milliseconds),
      now: () => 1000,
    },
  );
  assert.equal(calls, 2);
  assert.deepEqual(waits, [4000]);
});

test("a long Retry-After stops without retrying early", async () => {
  let calls = 0;
  await assert.rejects(
    fetchWithRetry(
      "test-only",
      {},
      {
        fetch: async () => {
          calls++;
          return new Response("", {
            status: 429,
            headers: { "Retry-After": "120" },
          });
        },
        sleep: async () => assert.fail("Must not sleep or retry early"),
      },
    ),
    /Retry-After/,
  );
  assert.equal(calls, 1);
});

test("a failed intermediate page rejects instead of publishing partial paths", async () => {
  const api = library(async (url) =>
    new URL(url).searchParams.get("page") === "2"
      ? { ok: false, status: 429 }
      : {
          ok: true,
          json: async () => ({
            info: { pages: 3, count: 3 },
            results: [{ id: 1 }],
          }),
        },
  );
  await assert.rejects(api.getAllCharacterIds(), /HTTP 429/);
});

test("missing and duplicate IDs reject an incomplete static catalog", async () => {
  for (const [count, results] of [
    [2, [{ id: 1 }]],
    [2, [{ id: 1 }, { id: 1 }]],
  ]) {
    const api = library(async () => ({
      ok: true,
      json: async () => ({ info: { pages: 1, count }, results }),
    }));
    await assert.rejects(api.getAllCharacterIds(), /incompleta/);
  }
});

test("a missing detail is distinct from a service failure", async () => {
  const missing = library(async () => ({ ok: false, status: 404 }));
  assert.equal(await missing.getCharacter("999999"), null);
  const unavailable = library(async () => ({ ok: false, status: 503 }));
  await assert.rejects(unavailable.getCharacter("1"), /HTTP 503/);
});

test("SSR never uses the static cache and details retain ten-day ISR", async () => {
  const requests = [];
  const api = library(async (url, options) => {
    requests.push({ url, options });
    return { ok: true, json: async () => ({}) };
  });
  await api.getCharacters(2, "ssr");
  await api.getCharacters(1, "ssg");
  await api.getCharacter("1");
  assert.equal(requests[0].options.cache, "no-store");
  assert.equal(requests[1].options.cache, "force-cache");
  assert.equal(requests[2].options.next.revalidate, 864000);
  assert.equal(requests[2].options.cache, undefined);
});
