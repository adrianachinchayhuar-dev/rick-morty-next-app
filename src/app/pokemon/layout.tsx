import { ReactNode } from "react";
import { Metadata } from "next";
import { IoGameController } from "react-icons/io5";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pokédex - Next.js",
  description: "Explora el mundo Pokémon",
};

interface PokemonLayoutProps {
  children: ReactNode;
}

export default function PokemonLayout({ children }: PokemonLayoutProps) {
  return (
    <div className="min-h-screen bg-linear-to-br to-purple-900">
      <nav className="bg-black bg-opacity-30 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* <a
            href="/pokemon"
            className="text-white text-2xl font-bold hover:text-yellow-300 transition"
          >
            <IoGameController size={30} className="inline-block" /> Pokédex Next.js
          </a> */}
          
          <Link
            href="/pokemon"
            className="text-white text-2xl font-bold hover:text-purple-500 transition"
          >
            <IoGameController size={30} className="inline-block" /> Pokédex Next.js
          </Link> 
        </div>
      </nav>
      {children}
    </div>
  );
}
