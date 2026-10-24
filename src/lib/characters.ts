import "server-only";
import { readFileSync } from "node:fs";
import { cache } from "react";
import type { Character, CharacterResponse } from "@/types/character";
import { fetchWithRetry } from "./api-request.mjs";
import { collectCatalog, validateCatalog } from "./character-catalog.mjs";

export const API = "https://rickandmortyapi.com/api/character";
let buildCatalog:
  { pages: CharacterResponse[]; byId: Map<string, Character> } | undefined;
function getBuildCatalog() {
  const path = process.env.PORTAL_DEX_BUILD_SNAPSHOT;
  if (!path) return null;
  if (!buildCatalog) {
    const { pages } = JSON.parse(readFileSync(path, "utf8")) as {
      pages: CharacterResponse[];
    };
    validateCatalog(pages);
    buildCatalog = {
      pages,
      byId: new Map(
        pages.flatMap((page) =>
          page.results.map(
            (character) => [String(character.id), character] as const,
          ),
        ),
      ),
    };
  }
  return buildCatalog;
}

export async function getCharacters(
  page = 1,
  mode: "ssg" | "ssr" = "ssg",
): Promise<CharacterResponse> {
  // SSR must always remain live; it never reads the static build snapshot.
  const catalog = mode === "ssg" ? getBuildCatalog() : null;
  if (catalog) {
    const data = catalog.pages[page - 1];
    if (!data)
      throw new Error(`Página ${page} ausente del catálogo de compilación.`);
    return data;
  }
  const response = await fetchWithRetry(
    `${API}?page=${page}`,
    mode === "ssr" ? { cache: "no-store" } : { cache: "force-cache" },
  );
  if (!response.ok)
    throw new Error(
      `No se pudieron cargar los personajes (HTTP ${response.status}).`,
    );
  return response.json();
}
export const getCharacter = cache(
  async (id: string): Promise<Character | null> => {
    const catalog = getBuildCatalog();
    if (catalog) return catalog.byId.get(id) ?? null;
    const response = await fetchWithRetry(`${API}/${id}`, {
      next: { revalidate: 864000 },
    });
    if (response.status === 404) return null;
    if (!response.ok)
      throw new Error(
        `No se pudo cargar el personaje (HTTP ${response.status}).`,
      );
    return response.json();
  },
);
export async function getAllCharacterIds() {
  const pages =
    getBuildCatalog()?.pages ??
    (await collectCatalog((page: number) => getCharacters(page)));
  return pages.flatMap((page: CharacterResponse) =>
    page.results.map(({ id }) => ({ id: String(id) })),
  );
}
