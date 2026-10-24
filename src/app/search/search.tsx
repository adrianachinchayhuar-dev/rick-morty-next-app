"use client";
import { useEffect, useState } from "react";
import { CharacterGrid } from "@/components/characters";
import type { CharacterResponse } from "@/types/character";

const initial = { name: "", status: "", type: "", gender: "", page: 1 };
export default function Search() {
  const [filters, setFilters] = useState(initial);
  const [result, setResult] = useState<{
    key: string;
    data: CharacterResponse | null;
    error: string;
  }>({ key: "", data: null, error: "" });
  const [retry, setRetry] = useState(0);
  const query = new URLSearchParams();
  for (const [name, value] of Object.entries(filters))
    if (String(value).trim()) query.set(name, String(value).trim());
  const key = query.toString() + "&retry=" + retry;
  const loading = result.key !== key;

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const parameters = new URLSearchParams(key);
        parameters.delete("retry");
        const response = await fetch(
          `https://rickandmortyapi.com/api/character/?${parameters}`,
          { signal: controller.signal },
        );
        if (response.status === 404) {
          if (!controller.signal.aborted)
            setResult({ key, data: null, error: "" });
          return;
        }
        if (!response.ok)
          throw new Error(`La API respondió con HTTP ${response.status}.`);
        const data: CharacterResponse = await response.json();
        if (!controller.signal.aborted) setResult({ key, data, error: "" });
      } catch (error) {
        if (!controller.signal.aborted)
          setResult({
            key,
            data: null,
            error:
              error instanceof Error
                ? `No pudimos cargar los resultados. ${error.message}`
                : "No pudimos conectar con la API.",
          });
      }
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key]);

  function update(name: keyof typeof initial, value: string) {
    setFilters((current) => ({ ...current, [name]: value, page: 1 }));
  }
  return (
    <>
      <form
        onSubmit={(event) => event.preventDefault()}
        className="mb-8 grid gap-4 rounded-2xl border border-white/10 bg-[#131b19] p-5 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_auto]"
      >
        <label>
          Nombre
          <input
            type="search"
            value={filters.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="Rick, Morty, Summer…"
          />
        </label>
        <label>
          Estado
          <select
            value={filters.status}
            onChange={(event) => update("status", event.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="alive">Vivo</option>
            <option value="dead">Muerto</option>
            <option value="unknown">Desconocido</option>
          </select>
        </label>
        <label>
          Tipo
          <input
            value={filters.type}
            onChange={(event) => update("type", event.target.value)}
            placeholder="Ej. Parasite"
          />
        </label>
        <label>
          Género
          <select
            value={filters.gender}
            onChange={(event) => update("gender", event.target.value)}
          >
            <option value="">Todos los géneros</option>
            <option value="female">Femenino</option>
            <option value="male">Masculino</option>
            <option value="genderless">Sin género</option>
            <option value="unknown">Desconocido</option>
          </select>
        </label>
        <button
          type="button"
          className="button self-end"
          onClick={() => setFilters(initial)}
        >
          Limpiar
        </button>
      </form>
      <div
        aria-live="polite"
        aria-atomic="true"
        className="mb-6 text-sm text-slate-400"
      >
        {loading
          ? "Buscando una señal…"
          : result.error
            ? "La conexión se ha interrumpido."
            : result.data
              ? `${result.data.info.count} coincidencias · Página ${filters.page} de ${result.data.info.pages}`
              : "No hay coincidencias. Prueba con otros filtros."}
      </div>
      {loading ? (
        <div
          role="status"
          aria-label="Cargando resultados"
          className="grid grid-cols-2 gap-5 lg:grid-cols-4"
        >
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="aspect-[3/4] animate-pulse rounded-2xl bg-white/5"
            />
          ))}
        </div>
      ) : result.error ? (
        <div role="alert" className="feature-card">
          <p>{result.error}</p>
          <button
            className="button mt-5"
            onClick={() => setRetry((value) => value + 1)}
          >
            Reintentar
          </button>
        </div>
      ) : result.data ? (
        <>
          <CharacterGrid characters={result.data.results} />
          <nav
            aria-label="Paginación de búsqueda"
            className="mt-8 flex items-center justify-between gap-3"
          >
            <button
              className="button"
              disabled={!result.data.info.prev}
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  page: current.page - 1,
                }))
              }
            >
              ← Anterior
            </button>
            <span className="text-sm text-slate-400">
              {filters.page} / {result.data.info.pages}
            </span>
            <button
              className="button"
              disabled={!result.data.info.next}
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  page: current.page + 1,
                }))
              }
            >
              Siguiente →
            </button>
          </nav>
        </>
      ) : (
        <div className="feature-card">
          <h2 className="text-xl font-bold">
            Ninguna variante en estas coordenadas.
          </h2>
          <p className="mt-3 text-slate-400">
            Prueba otro nombre o elimina algún filtro.
          </p>
        </div>
      )}
    </>
  );
}
