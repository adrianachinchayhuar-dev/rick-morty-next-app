"use client";

import Image from "next/image";
import { useState } from "react";

export function CharacterImage({
  src,
  name,
  sizes,
  eager = false,
}: {
  src: string;
  name: string;
  sizes: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <div role="img" aria-label={`Imagen de ${name} no disponible`} className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-xl bg-lime-300/5 p-6 text-center">
      <span aria-hidden className="logo-portal" />
      <span className="text-sm text-slate-400">Imagen no disponible</span>
    </div>
  ) : (
    <Image src={src} alt={name} width={300} height={300} sizes={sizes} loading={eager ? "eager" : "lazy"} onError={() => setFailed(true)} className="aspect-square w-full rounded-xl object-cover transition duration-500 group-hover:scale-105" />
  );
}
