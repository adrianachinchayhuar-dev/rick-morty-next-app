
import Link from "next/link";
import {
  IoSearchOutline,
  IoArrowBackOutline,
} from "react-icons/io5";

export default function PokemonNotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-purple-900 to-black text-white px-6">
      <div className="max-w-lg w-full bg-white/10 border border-purple-400/30 rounded-2xl p-10 text-center shadow-2xl">

        <IoSearchOutline
          size={75}
          className="text-yellow-400 mx-auto mb-5"
        />

        <h1 className="text-7xl font-extrabold text-purple-300 mb-4">
          404
        </h1>

        <h2 className="text-3xl font-bold mb-4">
          ¡Pokémon no encontrado!
        </h2>

        <p className="text-gray-300 mb-8">
          El Pokémon que estás buscando no existe
          o la información solicitada no está disponible.
        </p>

        <Link
          href="/pokemon"
          className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold"
        >
          <IoArrowBackOutline size={20} />
          Volver a la Pokédex
        </Link>

      </div>
    </main>
  );
}
