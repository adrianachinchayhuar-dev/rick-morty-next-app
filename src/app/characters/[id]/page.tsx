import type { Metadata } from "next";
import { CharacterImage } from "@/components/character-image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCharacter, getAllCharacterIds } from "@/lib/characters";
import { FiExternalLink } from "react-icons/fi";

export const revalidate = 864000;
export const dynamic = "force-static";
export async function generateStaticParams() {
  return getAllCharacterIds();
}
type Props = { params: Promise<{ id: string }> };
async function characterFor(id: string) {
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) notFound();
  const character = await getCharacter(id);
  if (!character) notFound();
  return character;
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const character = await characterFor((await params).id);
  return {
    title: character.name,
    description: `${character.name}: ${character.species}. Detalle del archivo interdimensional.`,
  };
}
export default async function CharacterDetail({ params }: Props) {
  const c = await characterFor((await params).id);
  const fields = [
    ["ID", c.id],
    ["Estado", c.status],
    ["Especie", c.species],
    ["Tipo", c.type || "No especificado"],
    ["Género", c.gender],
    [
      "Creado en la API",
      new Intl.DateTimeFormat("es-PE", {
        dateStyle: "long",
        timeZone: "UTC",
      }).format(new Date(c.created)),
    ],
  ];
  return (
    <main className="shell py-12">
      <Link
        className="text-sm text-slate-400 hover:text-lime-300"
        href="/characters/ssg"
      >
        ← Volver al catálogo
      </Link>
      <div className="mt-10 grid gap-10 md:grid-cols-[minmax(220px,350px)_1fr]">
        <div>
          <CharacterImage
            src={c.image}
            name={c.name}
            eager
            sizes="(max-width: 768px) 90vw, 350px"
          />
          <p className="mt-5 font-mono text-xs text-slate-400">
            EXPEDIENTE #{String(c.id).padStart(3, "0")}
          </p>
        </div>
        <section>
          <p className="eyebrow">SSG + ISR / REVALIDACIÓN: 10 DÍAS</p>
          <h1 className="mt-4 text-4xl font-black sm:text-5xl">{c.name}</h1>
          <dl className="mt-8 grid gap-3 sm:grid-cols-2">
            {fields.map(([label, value]) => (
              <div className="detail-field" key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
            {[
              { label: "Origen", ...c.origin },
              { label: "Última ubicación", ...c.location },
            ].map((location) => (
              <div className="detail-field" key={location.label}>
                <dt>{location.label}</dt>
                <dd>
                  {location.name}
                  {location.url ? (
                    <a
                      className="mt-2 block text-xs text-lime-300"
                      href={location.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver ubicación
                      <FiExternalLink
                        aria-hidden="true"
                        size={12}
                        className="ml-1 inline-block align-baseline"
                      />
                    </a>
                  ) : (
                    <p className="mt-2 text-xs text-slate-500">
                      Sin URL disponible
                    </p>
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <a
            className="mt-5 block break-all text-sm text-lime-300"
            href={c.url}
            target="_blank"
            rel="noreferrer"
          >
            Ver datos en la API
            <FiExternalLink
              aria-hidden="true"
              size={14}
              className="ml-1 inline-block align-baseline"
            />
          </a>
          <p className="mt-3 text-xs text-slate-500">
            Fecha original: {c.created}
          </p>
        </section>
      </div>
      <section className="mt-12">
        <h2 className="text-2xl font-bold">
          Apariciones{" "}
          <span className="text-lime-300">/ {c.episode.length}</span>
        </h2>
        <p className="mt-3 text-sm text-slate-400">
          Consulta cada episodio en la API pública.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {c.episode.map((url) => (
            <a
              className="button"
              href={url}
              key={url}
              target="_blank"
              rel="noreferrer"
            >
              Episodio {url.split("/").pop()} ↗
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
