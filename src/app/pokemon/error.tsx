
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { IoAlertCircleOutline, IoRefreshOutline } from "react-icons/io5";

export default function PokemonError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error en la Pokédex:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-950 to-black text-white px-6">
      <div className="max-w-lg w-full bg-white/10 rounded-2xl p-10 text-center shadow-2xl border border-purple-500/30">
        <IoAlertCircleOutline
          size={75}
          className="text-red-400 mx-auto mb-5"
        />

        <h1 className="text-3xl font-bold mb-4">
          ¡Ocurrió un error!
        </h1>

        <p className="text-gray-300 mb-6">
          No pudimos cargar la información de los Pokémon.
          Intenta nuevamente.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => reset()}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            <IoRefreshOutline size={20} />
            Reintentar
          </button>

          <Link
            href="/"
            className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-semibold"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
