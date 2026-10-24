import { CharacterImage } from "@/components/character-image";
import Link from "next/link";
import type { Character } from "@/types/character";

export function CharacterGrid({ characters }: { characters: Character[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {characters.map((character) => (
        <Link
          prefetch={false}
          href={`/characters/${character.id}`}
          className="character-card group"
          key={character.id}
        >
          <div className="relative overflow-hidden rounded-xl">
            <CharacterImage
              src={character.image}
              name={character.name}
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 23vw"
            />
            <span className="image-id">
              #{String(character.id).padStart(3, "0")}
            </span>
          </div>
          <div className="pt-4">
            <p className="mb-2 text-xs tracking-widest text-slate-400">
              {character.species}
            </p>
            <h2 className="text-lg font-bold group-hover:text-lime-300">
              {character.name}
            </h2>
            <p className="mt-3 flex items-center gap-2 text-sm text-slate-300">
              <span
                className={`status-dot ${character.status.toLowerCase()}`}
              />
              {
                { Alive: "Vivo", Dead: "Muerto", unknown: "Desconocido" }[
                  character.status
                ]
              }
              <span className="ml-auto text-lime-300" aria-hidden>
                ↗
              </span>
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
export function PageHeading({
  badge,
  title,
  description,
}: {
  badge: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-9">
      <p className="eyebrow">{badge}</p>
      <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
