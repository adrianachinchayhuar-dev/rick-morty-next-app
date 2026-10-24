import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Portal Dex | Rick and Morty",
    template: "%s | Portal Dex",
  },
  description: "Archivo de Rick and Morty con SSR, SSG, CSR e ISR.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="site-header">
          <nav
            aria-label="Navegación principal"
            className="shell flex flex-wrap items-center justify-between gap-5 py-5"
          >
            <Link
              href="/"
              className="flex items-center gap-3 text-xl font-black"
            >
              <span className="logo-portal" aria-hidden />
              PORTAL<span className="text-lime-300">DEX</span>
            </Link>
            <div className="flex flex-wrap gap-5 text-sm text-slate-300">
              <Link href="/">Inicio</Link>
              <Link href="/characters/ssg">Explorar · SSG</Link>
              <Link href="/characters/ssr">En vivo · SSR</Link>
              <Link href="/search" className="text-lime-300">
                Buscar ↗
              </Link>
            </div>
          </nav>
        </header>
        {children}
        <footer className="shell mt-16 flex flex-wrap justify-between gap-4 border-t border-white/10 py-8 text-xs text-slate-400">
          <p>PORTAL DEX · Archivo del multiverso</p>
          <p>
            Semana 10 / Next.js ·{" "}
            <a
              href="https://rickandmortyapi.com/documentation/"
              target="_blank"
              rel="noreferrer"
            >
              Rick and Morty API ↗
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
