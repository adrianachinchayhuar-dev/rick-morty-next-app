import Link from "next/link";
export default function NotFound() {
  return (
    <main className="shell py-24">
      <p className="eyebrow">404 / COORDENADAS INVÁLIDAS</p>
      <h1 className="mt-5 text-5xl font-black">
        Este portal no lleva a ninguna parte.
      </h1>
      <p className="mt-5 text-slate-400">
        La página o el personaje solicitado no existe.
      </p>
      <Link className="button primary mt-8" href="/">
        Volver al inicio ↗
      </Link>
    </main>
  );
}
