import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fetchWithRetry } from "../src/lib/api-request.mjs";
import { collectCatalog } from "../src/lib/character-catalog.mjs";

const directory = resolve(".cache/portal-dex");
const snapshot = resolve(directory, `${randomUUID()}.json`);
try {
  console.log(
    "[catálogo] Descargando páginas reales: concurrencia 1, pausa 250 ms, máximo 3 intentos por página.",
  );
  let attempts = 0;
  const pages = await collectCatalog(async (page) => {
    if (page > 1) await delay(250);
    const response = await fetchWithRetry(
      `https://rickandmortyapi.com/api/character?page=${page}`,
      { cache: "no-store" },
      {
        fetch: (url, options) => {
          attempts++;
          return fetch(url, { ...options, signal: AbortSignal.timeout(20000) });
        },
      },
    );
    if (!response.ok)
      throw new Error(
        `No se pudo descargar la página ${page} del catálogo (HTTP ${response.status}).`,
      );
    const data = await response.json();
    console.log(`[catálogo] Página ${page}/${data.info.pages}`);
    return data;
  });
  await mkdir(directory, { recursive: true });
  await writeFile(snapshot, JSON.stringify({ pages }), { flag: "wx" });
  console.log(
    `[catálogo] ${pages[0].info.count} personajes, ${pages.length} páginas, ${attempts} solicitudes HTTP. Los detalles no consultarán la API durante el build.`,
  );
  // Only this child and its workers receive the snapshot path. npm start / ISR
  // never receive it, so production cannot keep serving a frozen build catalog.
  const child = spawn(
    process.execPath,
    [resolve("node_modules/next/dist/bin/next"), "build", "--webpack"],
    {
      stdio: "inherit",
      env: { ...process.env, PORTAL_DEX_BUILD_SNAPSHOT: snapshot },
    },
  );
  process.exitCode = await new Promise((resolveExit, reject) => {
    child.once("error", reject);
    child.once("exit", (code) => resolveExit(code ?? 1));
  });
} catch (error) {
  console.error("[build]", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  // No stale snapshot is reused by a later build, even after a build failure.
  await rm(snapshot, { force: true });
}
