/** Validate all pages before exposing any build data. */
export function validateCatalog(pages) {
  const first = pages[0];
  if (
    !first ||
    !Number.isInteger(first.info?.pages) ||
    first.info.pages < 1 ||
    pages.length !== first.info.pages
  ) {
    throw new Error(
      "La paginación de personajes está incompleta. Vuelve a compilar.",
    );
  }
  const characters = pages.flatMap((page) => page.results);
  const ids = characters.map((character) => character?.id);
  if (
    characters.length !== first.info.count ||
    ids.some((id) => !Number.isSafeInteger(id) || id < 1) ||
    new Set(ids).size !== ids.length ||
    pages.some(
      (page) =>
        page.info.count !== first.info.count ||
        page.info.pages !== first.info.pages,
    )
  ) {
    throw new Error(
      "La paginación de personajes está incompleta o contiene IDs duplicados. Vuelve a compilar.",
    );
  }
  return pages;
}

/** Sequential requests: one API page in flight, regardless of Next's worker count. */
export async function collectCatalog(loadPage) {
  const first = await loadPage(1);
  const pages = [first];
  if (!Number.isInteger(first.info?.pages) || first.info.pages < 1) {
    throw new Error("La API no devolvió una cantidad válida de páginas.");
  }
  for (let page = 2; page <= first.info.pages; page++)
    pages.push(await loadPage(page));
  return validateCatalog(pages);
}
