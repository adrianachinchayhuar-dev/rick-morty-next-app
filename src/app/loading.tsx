export default function Loading() {
  return (
    <main
      className="shell py-16"
      role="status"
      aria-label="Cargando personajes"
    >
      <p className="eyebrow mb-8">ABRIENDO EL PORTAL…</p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            className="aspect-[3/4] animate-pulse rounded-2xl bg-white/5"
            key={i}
          />
        ))}
      </div>
    </main>
  );
}
