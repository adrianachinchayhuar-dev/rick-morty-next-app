# Portal Dex — Rick and Morty

Aplicación académica de la Semana 10: cuatro estrategias de renderizado con datos reales de [Rick and Morty API](https://rickandmortyapi.com/documentation/). Interfaz oscura adaptable, acentos de portal, tarjetas con imágenes diferidas y navegación al detalle.

## Tecnologías e instalación

Next.js 16.4.3 (App Router), React 19.3, TypeScript y Tailwind CSS 4. Los comandos de desarrollo y build utilizan Webpack con el adaptador oficial `@tailwindcss/postcss`. Este cambio resuelve el fallo reproducido del proceso CSS de Turbopack en Windows. No se activan `cacheComponents` ni `partialPrefetching`.

Requiere Node.js 20.9 o posterior y acceso HTTPS a `rickandmortyapi.com` desde el servidor y el navegador.

```bash
npm ci
npm run dev
```

Abre http://localhost:3000. Para producción:

```bash
npm run lint
npm test
npm run build
npm start
```

## Rutas y estrategias

| Ruta                     | Técnica   | Comportamiento                                                                         |
| ------------------------ | --------- | -------------------------------------------------------------------------------------- |
| `/`                      | Estática  | Presentación y accesos a las tres demostraciones                                       |
| `/characters/ssr?page=1` | SSR       | Consulta desde el servidor con `cache: 'no-store'` en cada solicitud; listado paginado |
| `/characters/ssg`        | SSG       | Primera página de personajes generada durante el build con `cache: 'force-cache'`      |
| `/search`                | CSR       | Contenedor estático con buscador cliente; el navegador obtiene resultados de la API    |
| `/characters/[id]`       | SSG + ISR | Todos los detalles se generan en el build y se revalidan tras 864000 segundos          |

**SSR** conviene cuando queremos consultar los datos al recibir una solicitud. El servidor entrega HTML con personajes sin esperar a que el navegador ejecute la búsqueda. El uso de `no-store` evita la caché de datos de Next.js. En desarrollo, HMR puede reutilizar respuestas; verifica la estrategia en producción.

**SSG** permite entregar rápidamente HTML preparado durante la compilación. El listado muestra la primera página real de la API; para recorrer todo el catálogo se utilizan SSR o la búsqueda. Su contenido cambia al reconstruir o invalidar su caché.

**CSR** permite buscar sin recargar la página. El componente usa `useState`, `useEffect`, filtros por nombre, estado, tipo y género, debounce de 400 ms y `AbortController`. Cada cambio reinicia la paginación; se cancelan tanto el temporizador como la solicitud anterior. Se distinguen carga, respuesta vacía (404 de la API), error de conexión y resultados. Limpiar y reintentar están disponibles. Los valores de tipo y nombre corresponden a los textos de la API, normalmente en inglés.

**ISR** combina la rapidez de SSG con actualizaciones posteriores. `generateStaticParams()` devuelve todos los IDs del catálogo completo validado; no se limita a los primeros 20 ni supone un total fijo. Los detalles mantienen `export const revalidate = 864000` y `dynamic = 'force-static'`. Durante el build reutilizan el catálogo descargado; en producción consultan el endpoint individual con `next: { revalidate: 864000 }`, sin `no-store`. Al visitar una página pasada esa ventana, Next.js puede servir la versión anterior mientras regenera en segundo plano. No es una tarea programada exacta cada 10 días. `generateStaticParams` no vuelve a ejecutarse durante ISR; nuevos IDs válidos se pueden generar al visitarlos y se incluyen en el siguiente build.

## Build sin una solicitud por personaje

`npm run build` ejecuta `scripts/build.mjs`, que descarga **todas** las páginas de la API de forma secuencial. Con los datos actuales son 42 solicitudes para 826 personajes, frente a las 42 consultas de páginas más hasta 826 consultas individuales de la implementación anterior (868 solicitudes base). La reducción es aproximadamente del 95 %, sin contar reintentos ni posibles respuestas de caché.

1. La descarga tiene concurrencia 1 y deja 250 ms entre páginas. Cada respuesta ya contiene los detalles completos de hasta 20 personajes.
2. Comprueba el número de páginas, el total de personajes y la unicidad de los IDs. Si falla una página o falta un ID, termina con error: no publica un catálogo parcial.
3. Guarda esas respuestas reales en un archivo temporal único bajo `.cache/portal-dex/`, excluido de Git. No contiene datos simulados ni reutiliza descargas de builds anteriores.
4. Inicia Next con la variable interna `PORTAL_DEX_BUILD_SNAPSHOT` **solo en el proceso hijo de compilación**. Todos los workers leen el mismo archivo y mantienen un índice de personajes en memoria. `generateStaticParams()`, `generateMetadata()`, los detalles y el listado SSG lo reutilizan sin solicitudes adicionales.
5. El archivo se elimina al terminar, tanto si Next tiene éxito como si falla. No configures esa variable en Vercel ni en `npm start`: el servidor de producción y las regeneraciones ISR usan la API real, sin depender del catálogo temporal. `cache()` de React comparte la consulta del personaje entre página y metadatos dentro de una renderización.

Las consultas del servidor y del build admiten como máximo tres intentos ante errores de conexión, HTTP 429 o fallos HTTP transitorios (500, 502, 503, 504). Esperan 1 y 2 segundos, o más si `Retry-After` lo exige (segundos o fecha HTTP). Si exige más de 30 segundos, se detiene el intento con un mensaje para repetir más tarde; nunca se reintenta antes de lo indicado. Cada intento de descarga del catálogo tiene un límite de 20 segundos. Un 404 de detalle conserva su significado de personaje inexistente.

El listado SSR sigue usando `no-store` y omite expresamente el catálogo temporal. La búsqueda CSR, sus filtros y paginación no cambian. Usa `npm run build` también en Vercel; ejecutar directamente `next build` omite la preparación y vuelve a la estrategia de consultas individuales.

Los detalles incluyen ID, nombre, estado, especie, tipo, género, imagen, origen y ubicación con sus URLs, enlaces a cada episodio, URL del personaje y fecha de creación. Los episodios se identifican por el ID real presente en su URL; no se inventan títulos.

## Organización

- `src/types/character.ts`: interfaces de la API.
- `src/lib/characters.ts`: acceso del servidor, caché y recorrido completo de paginación.
- `src/lib/character-catalog.mjs`: recorrido y validación del catálogo paginado.
- `src/lib/api-request.mjs`: reintentos limitados y respeto de `Retry-After`.
- `scripts/build.mjs`: descarga única, catálogo temporal compartido y ejecución de Next.
- `src/components/characters.tsx`: tarjetas compartidas y encabezados.
- `src/app/search/search.tsx`: consultas CSR, filtros y paginación.
- `src/app/characters/`: listados y detalle con metadatos por personaje.
- `src/app/{loading,error,not-found}.tsx`: carga, error con reintento y 404.
- `src/app/globals.css`: Tailwind, tema, portal CSS y movimiento reducido.
- `next.config.ts`: dominio y ruta de imágenes autorizados para `next/image`.
- `postcss.config.mjs`: integración oficial de Tailwind CSS.
- `tests/characters.test.mjs`: pruebas aisladas de paginación completa, errores, IDs duplicados y caché. Sus respuestas sintéticas se usan únicamente en pruebas, nunca en la aplicación.

Se conserva la estructura App Router, la configuración de TypeScript/Tailwind y los patrones de tarjetas y estados. El laboratorio original no se modifica.

## Validación manual

1. Ejecuta lint y build con conexión disponible. El resumen de Next debe identificar el listado SSR como dinámico, el listado SSG como estático y los detalles como SSG con revalidación de 10 días.
2. Comprueba que el número de detalles en `.next/prerender-manifest.json` coincida con `info.count` de la API; abre los IDs inicial, intermedio y último. No se fija el total en el código.
3. Con `npm start`, navega a SSR, cambia de página y verifica su consulta desde el servidor.
4. En `/search`, escribe `rick`, combina estado, tipo y género y navega entre páginas. En las herramientas de red del navegador, comprueba que las consultas se realizan directamente a la API, tras 400 ms, sin recarga completa.
5. Escribe rápidamente para comprobar la cancelación de consultas anteriores. Busca un texto inexistente para el estado vacío. Desconecta la red, espera la solicitud y comprueba error y reintento.
6. Abre `/characters/0`, un ID inexistente y una ruta desconocida para verificar el 404. Revisa móvil, teclado, imágenes diferidas y preferencia de movimiento reducido.
7. Para comprobar ISR en producción consulta el manifiesto (`initialRevalidateSeconds: 864000`) y los encabezados/cache de Next. La regeneración efectiva requiere que transcurra el intervalo y llegue una solicitud.

## Desplegar en Vercel

1. Cuando decidas publicarlo, sube el proyecto a tu repositorio e impórtalo en Vercel.
2. Selecciona Next.js, raíz de este proyecto, instalación `npm ci` y build `npm run build`. Mantén el directorio de salida automático.
3. Usa una versión de Node compatible con Next.js 16. No se necesitan claves ni variables de entorno.
4. Confirma que el entorno de build de Vercel pueda consultar las páginas de la API. Los detalles se generan con esos mismos datos. Un bloqueo persistente HTTP 429/Cloudflare o un fallo DNS todavía puede impedir la descarga completa, aunque ahora son muchas menos solicitudes.
5. Tras el despliegue, repite las pruebas de rutas, CSR y caché. No uses exportación estática (`output: 'export'`), porque SSR e ISR necesitan el runtime de Next.js.

No se realizan commits, push ni despliegues automáticamente.

## Resultado real de validación (24 de octubre de 2026)

- **`npm run build`: exitoso, código de salida 0**, con datos reales. Descargó 42 páginas mediante exactamente 42 solicitudes HTTP y obtuvo los 826 personajes, sin reintentos ni consultas individuales adicionales durante el prerenderizado.
- Next compiló correctamente, superó TypeScript y generó **833/833 páginas**. Su resumen identifica 826 detalles SSG, el listado SSG estático, la búsqueda estática con componente CSR y el listado SSR dinámico.
- Se verificó `.next/prerender-manifest.json`: contiene exactamente **826 rutas de detalle** y todas tienen `initialRevalidateSeconds: 864000`. El listado SSG tiene revalidación `false`; el listado SSR no figura como página prerenderizada.
- Se comprobó el HTML generado para `/characters/1` (Rick Sanchez), `/characters/377` (Voltematron) y `/characters/826` (Butter Robot), incluidos sus IDs y metadatos.
- El archivo temporal del catálogo se eliminó al terminar y su variable interna no se incluyó en `config.env` del servidor de producción.
- Con `npm start` y el catálogo temporal ya eliminado, `/`, `/search`, `/characters/ssg` y los detalles 1, 377 y 826 respondieron **HTTP 200** con `x-nextjs-cache: HIT`.
- `npm run lint` y la comprobación TypeScript finalizaron sin errores. `npm test` superó diez pruebas aisladas: paginación completa, reutilización del catálogo en workers separados para los 826 personajes, SSR sin caché, ISR, errores HTTP e integridad de IDs, además de reintentos limitados y `Retry-After` tanto numérico como fecha. Las respuestas de prueba nunca se utilizan en la aplicación.
- No se encontraron referencias al laboratorio anterior en los archivos actuales del proyecto. No se modificaron la búsqueda CSR ni el diseño visual.

La regeneración efectiva de ISR requiere esperar la ventana de diez días y recibir una solicitud; se verificaron su configuración y el manifiesto, no el transcurso del intervalo. La API sigue siendo externa: un bloqueo persistente en builds futuros, en SSR, en CSR o en las imágenes puede requerir esperar y repetir la operación. No se han realizado despliegues.
