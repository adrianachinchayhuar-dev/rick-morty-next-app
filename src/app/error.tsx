"use client";
import Link from "next/link";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="shell py-24">
      <p className="eyebrow">SEÑAL INTERRUMPIDA</p>
      <h1 className="mt-4 text-4xl font-bold">
        No pudimos conectar con el multiverso.
      </h1>
      <p className="mt-5 max-w-xl text-slate-400">
        La API no está disponible o hubo un error al cargar sus datos. Comprueba
        tu conexión y vuelve a intentarlo.
      </p>
      <div className="mt-8 flex gap-4">
        <button className="button primary" onClick={reset}>
          Reintentar
        </button>
        <Link className="button" href="/">
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
