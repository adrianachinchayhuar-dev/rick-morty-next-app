import { setTimeout as delay } from "node:timers/promises";

// At most three attempts. Never retry before the API's Retry-After deadline.
export async function fetchWithRetry(url, options = {}, dependencies = {}) {
  const request = dependencies.fetch ?? globalThis.fetch;
  const sleep = dependencies.sleep ?? delay;
  const now = dependencies.now ?? Date.now;
  for (let attempt = 0; attempt < 3; attempt++) {
    let response;
    try {
      response = await request(url, options);
    } catch (error) {
      if (attempt === 2) throw error;
      await sleep(1000 * 2 ** attempt);
      continue;
    }
    if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 2) {
      return response;
    }
    const retryAfter = response.headers?.get("retry-after");
    let wait = 1000 * 2 ** attempt;
    if (retryAfter) {
      const seconds = Number(retryAfter);
      const deadline = Number.isFinite(seconds)
        ? seconds * 1000
        : Date.parse(retryAfter) - now();
      if (Number.isFinite(deadline)) wait = Math.max(wait, deadline);
    }
    // A long block needs a later build, not an early retry or an endless wait.
    if (wait > 30000) {
      await response.body?.cancel();
      throw new Error(
        `HTTP ${response.status}: Retry-After exige esperar más de 30 segundos. Reintenta el build más tarde.`,
      );
    }
    await response.body?.cancel();
    await sleep(wait);
  }
  throw new Error("No se pudo completar la consulta a la API.");
}
