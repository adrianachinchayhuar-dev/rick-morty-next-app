import { PageHeading } from "@/components/characters";
import Search from "./search";
export const metadata = { title: "Buscar personajes CSR" };
export default function SearchPage() {
  return (
    <main className="shell py-12">
      <PageHeading
        badge="03 / CLIENT SIDE RENDERING"
        title="Encuentra tu variante"
        description="CSR · Tu navegador consulta la API y actualiza los resultados sin recargar la página. Combina los filtros para cruzar el multiverso."
      />
      <Search />
    </main>
  );
}
