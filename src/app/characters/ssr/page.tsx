import Link from "next/link";
import { notFound } from "next/navigation";
import { getCharacters } from "@/lib/characters";
import { CharacterGrid, PageHeading } from "@/components/characters";
export const metadata = { title: "Personajes en vivo SSR" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: value = "1" } = await searchParams;
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value)))
    notFound();
  const page = Number(value);
  const first = await getCharacters(1, "ssr");
  if (page > first.info.pages) notFound();
  const data = page === 1 ? first : await getCharacters(page, "ssr");
  return (
    <main className="shell py-12">
      <PageHeading
        badge="01 / SERVER SIDE RENDERING"
        title="Una señal en tiempo real"
        description="SSR · Datos obtenidos desde el servidor en cada solicitud con no-store. Esta página no se sirve desde la caché estática."
      />
      <p className="mb-6 text-sm text-slate-400">
        {data.info.count} personajes · Página {page} de {data.info.pages}
      </p>
      <CharacterGrid characters={data.results} />
      <nav
        aria-label="Paginación SSR"
        className="mt-8 flex justify-between gap-4"
      >
        {page > 1 ? (
          <Link className="button" href={"?page=" + (page - 1)}>
            ← Anterior
          </Link>
        ) : (
          <span />
        )}
        {data.info.next && (
          <Link className="button" href={"?page=" + (page + 1)}>
            Siguiente →
          </Link>
        )}
      </nav>
    </main>
  );
}
