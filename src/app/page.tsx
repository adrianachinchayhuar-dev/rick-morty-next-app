import Link from "next/link";
const techniques = [
  {
    label: "01 / SSR",
    title: "Una nueva señal. Cada visita.",
    description:
      "Personajes consultados desde el servidor en cada solicitud, sin caché.",
    href: "/characters/ssr",
    action: "Ver listado en vivo",
  },
  {
    label: "02 / SSG",
    title: "El multiverso, listo para explorar.",
    description:
      "Un catálogo generado durante la compilación y servido como contenido estático.",
    href: "/characters/ssg",
    action: "Explorar el catálogo",
  },
  {
    label: "03 / CSR",
    title: "Encuentra tu variante.",
    description:
      "Busca y combina filtros desde tu navegador, sin recargar la página.",
    href: "/search",
    action: "Abrir el buscador",
  },
];
export default function Home() {
  return (
    <main className="shell">
      <section className="hero relative grid items-center gap-10 overflow-hidden py-20 lg:grid-cols-[1.3fr_1fr] lg:py-28">
        <div className="relative z-10">
          <p className="eyebrow">ARCHIVO INTERDIMENSIONAL / C-137</p>
          <h1 className="mt-6 text-6xl font-black leading-[1.02] tracking-tighter sm:text-7xl lg:text-8xl">
            Un portal.
            <br />
            Infinitas <span className="text-lime-300">historias.</span>
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-relaxed text-slate-400">
            Humanos, aliens y versiones alternativas. Explora a los personajes
            de Rick and Morty y descubre quién habita al otro lado.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="/characters/ssg" className="button primary">
              Explorar personajes ↗
            </Link>
            <Link href="/search" className="button">
              Buscar una variante
            </Link>
          </div>
          <p className="mt-9 font-mono text-xs text-slate-500">
            ● DATOS DE LA API PÚBLICA · SIN DATOS SIMULADOS
          </p>
        </div>
        <div className="portal-scene" aria-hidden>
          <div className="portal-ring" />
          <span className="portal-label">
            DESTINO: DESCONOCIDO
            <br />
            COORDENADAS / ∞
          </span>
        </div>
      </section>
      <section className="border-t border-white/10 py-12">
        <p className="eyebrow">ELIGE TU PUNTO DE ENTRADA</p>
        <h2 className="mt-3 mb-8 text-3xl font-bold">
          Tres formas de explorar.
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {techniques.map((item) => (
            <Link key={item.label} href={item.href} className="feature-card">
              <p className="eyebrow">{item.label}</p>
              <h3 className="mt-6 text-2xl font-bold">{item.title}</h3>
              <p className="mt-4 leading-relaxed text-slate-400">
                {item.description}
              </p>
              <p className="mt-8 text-sm font-semibold text-lime-300">
                {item.action} ↗
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-lime-300/15 bg-lime-300/5 p-6 text-sm leading-relaxed text-slate-300">
          <strong className="text-lime-300">
            04 / ISR · Un archivo que se renueva.
          </strong>{" "}
          Los detalles se generan para todos los personajes y pueden regenerarse
          tras 10 días (864000 segundos), cuando reciben una visita.
        </div>
      </section>
    </main>
  );
}
