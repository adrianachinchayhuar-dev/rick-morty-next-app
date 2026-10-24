import { getCharacters } from "@/lib/characters";
import { CharacterGrid, PageHeading } from "@/components/characters";
export const metadata = { title: "Catálogo SSG" };
export default async function Page() {
  const data = await getCharacters();
  return (
    <main className="shell py-12">
      <PageHeading
        badge="02 / STATIC SITE GENERATION"
        title="Archivo del multiverso"
        description="SSG · Primera página generada durante el build con force-cache. Explora todos los resultados y aplica filtros en el buscador CSR."
      />
      <p className="mb-6 text-sm text-slate-400">
        {data.results.length} personajes en esta selección · {data.info.count}{" "}
        en el archivo
      </p>
      <CharacterGrid characters={data.results} />
    </main>
  );
}
