# Organización de carpetas — aguaSOS

Next.js **16.3.3** (App Router, Turbopack por defecto) + Convex + Clerk.

Estrategia elegida entre las tres que documenta Next: **"split project files by feature or
route"** — lo compartido en `src/components` y `src/lib`, lo específico de una ruta colocado
en la ruta. Con un equipo pequeño y 2–4 semanas, evita el archivo `components/` de 60 ficheros
sin dueño.

```
aguaSOS/
├── convex/                          ← Backend. Raíz propia, fuera de src/.
│   ├── _generated/                  ← Generado por Convex. No editar.
│   ├── convex.config.ts             ← defineApp() + componentes (rate-limiter)
│   ├── auth.config.ts               ← provider Clerk: { domain, applicationID: "convex" }
│   ├── schema.ts                    ← defineSchema con las 7 tablas
│   ├── http.ts                      ← httpRouter(): API pública /v1 autenticada por API_KEY
│   ├── crons.ts                     ← cierre diario de alertas por decaimiento
│   │
│   ├── model/                       ← TS puro, sin ctx. Importable desde el cliente.
│   │   ├── riesgo.ts                ← severidadBase / peso / riesgoZona / nivel
│   │   ├── riesgo.test.ts           ← asserts, sin framework
│   │   ├── geo.ts                   ← bbox(), haversine(), redondearPunto()
│   │   └── constantes.ts            ← rangos de personas, tipos de suministro, umbrales
│   │
│   ├── lib/                         ← Helpers CON ctx, compartidos entre funciones
│   │   ├── auth.ts                  ← usuarioActual(), requiereRol()
│   │   └── apiKeys.ts               ← hash, verificación, marcado de uso
│   │
│   ├── usuarios.ts                  ← query/mutation por dominio, un archivo cada uno
│   ├── reportes.ts
│   ├── fuentes.ts
│   ├── zonas.ts
│   ├── riesgo.ts
│   ├── alertas.ts
│   ├── apiKeys.ts
│   └── seed.ts                      ← internalMutation: carga el catálogo de zonas
│
├── src/
│   ├── proxy.ts                     ← ⚠️ En Next 16 se llama proxy, NO middleware.
│   │                                   Al mismo nivel que app/ ⇒ src/proxy.ts.
│   │                                   Runtime nodejs fijo; edge no está soportado.
│   ├── app/
│   │   ├── layout.tsx               ← ClerkProvider + ConvexProviderWithClerk
│   │   ├── page.tsx                 ← Landing: mapa público + CTA "Reportar escasez"
│   │   ├── globals.css
│   │   ├── manifest.ts              ← Manifest PWA (convención de archivo de Next)
│   │   ├── icon.png / apple-icon.png
│   │   │
│   │   ├── (publico)/               ← Sin sesión. Route group: no aparece en la URL.
│   │   │   ├── reportar/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── _components/     ← _ = privada, fuera del routing
│   │   │   │   │   ├── FormularioReporte.tsx
│   │   │   │   │   ├── PasoUbicacion.tsx
│   │   │   │   │   ├── PasoAfectacion.tsx
│   │   │   │   │   └── PasoEconomia.tsx
│   │   │   │   └── gracias/page.tsx ← Confirmación + fuentes más cercanas
│   │   │   └── mapa/page.tsx        ← Mapa público de fuentes
│   │   │
│   │   ├── (auth)/
│   │   │   ├── layout.tsx           ← Layout centrado, sin shell de app
│   │   │   ├── ingresar/[[...rest]]/page.tsx    ← <SignIn /> de Clerk
│   │   │   ├── registrarse/[[...rest]]/page.tsx ← <SignUp />
│   │   │   └── onboarding/page.tsx  ← Elegir rol + tipo de organización
│   │   │
│   │   ├── (app)/                   ← Requiere sesión
│   │   │   ├── layout.tsx           ← Shell + guard de rol
│   │   │   ├── mis-reportes/page.tsx
│   │   │   ├── tablero/
│   │   │   │   ├── page.tsx         ← Mapa analítico + filtros de fecha
│   │   │   │   ├── loading.tsx
│   │   │   │   └── _components/FiltrosRango.tsx
│   │   │   ├── fuentes/
│   │   │   │   ├── page.tsx         ← Mis fuentes (suministrador)
│   │   │   │   └── nueva/page.tsx
│   │   │   ├── api-keys/page.tsx
│   │   │   └── admin/
│   │   │       ├── usuarios/page.tsx    ← Aprobar consumidores/suministradores
│   │   │       └── reportes/page.tsx    ← Moderación
│   │   │
│   │   └── api/
│   │       └── exportar/reportes/route.ts  ← CSV en streaming, auth por sesión Clerk
│   │
│   ├── components/                  ← Compartido por 2+ rutas. Si lo usa una sola, va en _components/
│   │   ├── ui/                      ← Boton, Campo, Hoja, Chip, Badge
│   │   ├── mapa/
│   │   │   ├── MapaBase.tsx         ← MapLibre + PMTiles; "use client", dynamic import
│   │   │   ├── CapaRiesgo.tsx       ← heatmap ponderado por peso decaído
│   │   │   ├── CapaEmergencia.tsx   ← polígonos/badges de zonas en emergencia
│   │   │   ├── CapaFuentes.tsx      ← marcadores + popup con teléfono
│   │   │   └── SelectorPunto.tsx    ← Elegir ubicación en el formulario
│   │   └── EstadoConexion.tsx       ← Banner offline + contador de la cola
│   │
│   ├── lib/
│   │   ├── colaOffline.ts           ← IndexedDB: encolar / listar / vaciar
│   │   ├── csv.ts                   ← Serialización + escapado
│   │   └── formato.ts               ← Fechas, números, nombres de zona en es-SV
│   │
│   └── hooks/
│       ├── useColaOffline.ts        ← Encola o envía según navigator.onLine
│       └── useRolActual.ts
│
├── public/
│   ├── sw.js                        ← Service worker: cachea shell + tiles
│   └── tiles/el-salvador.pmtiles    ← ~30–60 MB. Ver nota de LFS abajo.
│
├── docs/                            ← Este directorio
├── next.config.ts
├── proxy.ts ✗                       ← NO aquí: app/ vive en src/, así que proxy también
└── package.json
```

## Decisiones y por qué

### `convex/model/` es TypeScript puro

Sin `ctx`, sin imports de `convex/server`. Eso permite que **el cliente importe el mismo
módulo** que usa el backend y pinte exactamente el mismo peso de riesgo. Una sola definición
del algoritmo, cero deriva entre lo que muestra el mapa y lo que guarda la base.

Añadir a `tsconfig.json`:

```json
"paths": {
  "@/*": ["./src/*"],
  "@convex/*": ["./convex/*"]
}
```

`convex/lib/` es lo contrario: helpers que **sí** reciben `ctx` y por tanto solo corren en Convex.

### `src/proxy.ts`, no `src/middleware.ts`

Next 16 renombró `middleware` a `proxy`. El archivo va **al mismo nivel que `app/`** — como
`app/` está en `src/`, el archivo es `src/proxy.ts`. El runtime es `nodejs` y **no es
configurable**: `edge` no está soportado en `proxy`.

```ts
// src/proxy.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const esPrivada = createRouteMatcher(["/mis-reportes(.*)", "/tablero(.*)", "/fuentes(.*)", "/api-keys(.*)", "/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (esPrivada(req)) await auth.protect();
});
```

> **Verificar contra los docs de Clerk 7.x + Next 16** antes de escribirlo: Clerk exporta
> `clerkMiddleware`, y Next 16 deprecó el *named export* `middleware` pero sigue aceptando
> el default export. Si Clerk aún no publicó guía para `proxy.ts`, la salida es envolverlo:
> `export function proxy(req: NextRequest) { return clerkMiddleware(...)(req) }`.
> Es la única pieza del stack donde las dos versiones pueden no haberse encontrado todavía.

### Route groups: tres, por nivel de acceso

`(publico)`, `(auth)` y `(app)`. No cambian la URL, pero dan tres layouts distintos:
el público sin shell, el de auth centrado, el de app con navegación y guard de rol.
Es exactamente el caso de uso que documenta Next para route groups.

### `_components/` colocado vs. `src/components/`

Regla simple: **si lo usa una sola ruta, vive en el `_components/` de esa ruta.** Cuando una
segunda ruta lo necesita, se mueve a `src/components/`. El prefijo `_` lo saca del routing,
así que no hay riesgo de exponer una URL por accidente.

### El mapa es `"use client"` con `dynamic()`

MapLibre toca `window` en el import. El componente `MapaBase` se carga con
`next/dynamic` y `ssr: false`; todo lo demás de la página se sigue renderizando en el servidor.

### `public/tiles/*.pmtiles`

Un `.pmtiles` de El Salvador pesa decenas de MB. **No lo metas en git.** Dos salidas:

1. Servirlo desde un bucket (R2/S3) con `Range` habilitado y apuntar el cliente ahí —
   es lo que PMTiles espera y es lo recomendable.
2. Si tiene que estar en el repo, Git LFS. Añade `*.pmtiles filter=lfs` a `.gitattributes`.

Para la demo también sirve el estilo público de Protomaps sin auto-hospedaje.

## Archivos raíz que se añaden

| Archivo | Para qué |
|---|---|
| `.env.local` | `NEXT_PUBLIC_CONVEX_URL`, claves de Clerk, `NEXT_PUBLIC_TILES_URL` |
| `.gitattributes` | Git LFS para `.pmtiles`, si se toma esa vía |
| `src/proxy.ts` | Guard de sesión de Clerk |
| `src/app/manifest.ts` | Manifest PWA |
| `public/sw.js` | Service worker |

`next.config.ts` crece con:

```ts
const nextConfig: NextConfig = {
  turbopack: { root: path.resolve(__dirname) },
  experimental: {
    useOffline: true,   // reintento automático de navegaciones y Server Actions al volver la red
  },
};
```

> `experimental.useOffline` es **experimental** en 16.3.3. Cubre navegaciones RSC y Server
> Actions; **no** cubre `fetch()` directo desde el cliente ni una recarga completa estando
> sin red — eso sigue necesitando el service worker. Ver `docs/roadmap-detallado.md` §Etapa 4.
