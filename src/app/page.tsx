
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
      <h1 className="text-4xl font-bold mb-4">
        Laboratorio 10 - Next.js
      </h1>

      <p className="text-gray-300 mb-8">
        Aplicación con App Router, SSG e ISR
      </p>

      <Link
        href="/pokemon"
        className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold"
      >
        Ver Pokédex
      </Link>
    </main>
  );
}
