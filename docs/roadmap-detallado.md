# Etapas detalladas — Frontend y Backend

Complemento de `roadmap.md`. Aquí está el detalle por tarea y, sobre todo, **el contrato
entre las dos mitades**: qué firma de función de Convex desbloquea qué pantalla.

Con Convex el contrato no se negocia en un documento: `convex/_generated/api.d.ts` se
regenera al guardar y el frontend rompe en TypeScript en el momento en que el backend
cambia una firma. Aprovéchalo — **define las firmas vacías el primer día de cada etapa**
(`return null` como cuerpo) y el frontend arranca contra tipos reales desde el minuto uno.

Leyenda: **BE** = Convex · **FE** = Next/React · **⛓** = bloquea a la otra mitad.

---

## Etapa 0 — Cimientos (días 1–2)

### Backend

| # | Tarea | Detalle |
|---|---|---|
| BE-0.1 | Proyecto Convex | `npx convex dev`. `NEXT_PUBLIC_CONVEX_URL` en `.env.local`. |
| BE-0.2 | ⛓ `convex/schema.ts` | Las 7 tablas con sus índices, tal cual `modelo-datos.md`. Es lo primero que se escribe: todo lo demás tipa contra esto. |
| BE-0.3 | `convex/auth.config.ts` | `providers: [{ domain: <issuer de Clerk>, applicationID: "convex" }]`. El JWT template en Clerk debe llamarse `convex`. |
| BE-0.4 | `convex/lib/auth.ts` | `usuarioActual(ctx)` → lee `ctx.auth.getUserIdentity()` y resuelve la fila de `usuarios` por `by_clerk`. `requiereRol(ctx, roles[])` lanza si no cuadra. |
| BE-0.5 | `usuarios.sincronizar` | Mutation idempotente: si no existe fila para el `clerkUserId`, la crea con rol `miembro`. Se llama desde el cliente al montar. |
| BE-0.6 | ⛓ `convex/seed.ts` | `internalMutation` que carga `zonas`. **Consigue el catálogo oficial antes del día 1** — sin zonas no hay `distritoId`, y sin `distritoId` no hay reporte. Es la dependencia externa del proyecto. |

### Frontend

| # | Tarea | Detalle |
|---|---|---|
| FE-0.1 | Providers en `src/app/layout.tsx` | `<ClerkProvider>` envolviendo `<ConvexProviderWithClerk useAuth={useAuth}>`. |
| FE-0.2 | ⚠️ `src/proxy.ts` | Clerk + Next 16. **Empieza por aquí.** Si `clerkMiddleware` no funciona como default export en `proxy.ts`, envuélvelo en una función `proxy`. Timeboxea 3 horas; si se atasca, la salida temporal es proteger solo del lado cliente con `<SignedIn>` / `<SignedOut>` y volver luego. |
| FE-0.3 | Rutas de auth | `(auth)/ingresar/[[...rest]]` y `(auth)/registrarse/[[...rest]]` con los componentes de Clerk. Catch-all opcional, o Clerk no puede enrutar sus pasos internos. |
| FE-0.4 | Shell + tokens de diseño | Tailwind v4: paleta, tipografía, contenedor. Móvil primero — el usuario objetivo entra desde un teléfono. |
| FE-0.5 | Deploy Vercel | Variables de entorno de Convex y Clerk. Preview por rama desde el día 1. |

**Contrato de la etapa:** `api.usuarios.sincronizar` y el módulo `zonas` sembrado.

---

## Etapa 1 — Reporte de escasez (días 3–7)

Es la etapa donde el backend va por delante. El frontend puede maquetar los pasos del
formulario en paralelo, pero necesita `zonas.buscarPorPunto` para el paso de ubicación.

### Backend

| # | Tarea | Detalle |
|---|---|---|
| BE-1.1 | `convex/model/riesgo.ts` | TS puro. `severidadBase`, `peso`, `estaActivo`, `riesgoZona`, `nivel`. Sin `ctx`, sin imports de Convex — el cliente lo importa igual. |
| BE-1.2 | `convex/model/riesgo.test.ts` | Los 4 asserts de `modelo-datos.md` §3. Sin framework: un archivo que se corre con `node --test` o `tsx`. Si esto pasa, el algoritmo cumple el requisito 2. |
| BE-1.3 | `convex/model/geo.ts` | `haversine(a, b)`, `bbox(centro, km)`, `redondearPunto(p, 3)`. |
| BE-1.4 | ⛓ `zonas.buscarPorPunto` | `(lat, lng) → { distrito, municipio, departamento }`. MVP: distrito con el centroide más cercano. `ponytail:` no usa polígonos reales. *Techo:* falla cerca de fronteras entre distritos. *Upgrade path:* point-in-polygon con los shapefiles oficiales. |
| BE-1.5 | ⛓ `reportes.crear` | El corazón. En una sola transacción: valida → resuelve `distritoId` → `severidadBase()` → **lookup por `by_idempotencia`** (si existe, devuelve el `_id` existente y no inserta) → inserta → recalcula `riesgoZona` de ese distrito → si cruza umbral, abre `alertasEmergencia`. |
| BE-1.6 | ⛓ `fuentes.masCercanas` | `(lat, lng, limite=5)` → bbox de ~25 km sobre `by_lat`, filtro de `lng`, haversine, orden, corte. Devuelve nombre, tipos, teléfono, transporte y distancia en km. |
| BE-1.7 | `reportes.mios` | Historial por `by_autor`. Devuelve el peso decaído ya calculado. |
| BE-1.8 | Rate limiting | `@convex-dev/rate-limiter` sobre `reportes.crear`. El endpoint acepta invitados: sin límite, un script lo llena en minutos. **No lo dejes para después.** |

### Frontend

| # | Tarea | Detalle |
|---|---|---|
| FE-1.1 | `FormularioReporte` | Multipaso con estado local. Un paso por pantalla en móvil. Guarda el borrador en `localStorage` en cada cambio de paso — si el navegador mata la pestaña, no se pierde. |
| FE-1.2 | `PasoUbicacion` | `navigator.geolocation` + `SelectorPunto` en mapa para corregir. Guarda `precisionM`. Fallback a selección manual si se deniega el permiso. |
| FE-1.3 | `PasoAfectacion` | Rango de personas (chips, no input numérico), nº de menores, impacto (casa / pasaje / comunidad) con ejemplos en el texto. |
| FE-1.4 | `PasoEconomia` | Lista dinámica de afectaciones. Siembra → cultivo + hectáreas + % pérdida. Otra → descripción libre. Se puede saltar. |
| FE-1.5 | `PasoFechas` | Fecha del reporte y "desde cuándo hay escasez". Selector de fecha nativo, no una librería. |
| FE-1.6 | ⛓ Envío | Genera `claveIdempotencia` con `crypto.randomUUID()` **al montar el formulario**, no al enviar — así el reintento reusa la misma clave. |
| FE-1.7 | `gracias/page.tsx` | Confirmación + fuentes cercanas en lista y mapa. Botón de llamar (`tel:`) directo en cada tarjeta. |
| FE-1.8 | Accesibilidad | Cada campo con `<label>` real, errores con `aria-live`, objetivos táctiles de 44 px. |

**Contrato de la etapa:**

```ts
reportes.crear({ claveIdempotencia, lat, lng, precisionM?, canton?, escasezDesde,
                 personasRango, menores, impacto, afectacionEconomica[] })
  → { reporteId, distrito: { nombre }, fuentesCercanas: FuenteCercana[] }
```

Que `crear` devuelva ya las fuentes cercanas ahorra un round-trip y quita una condición de
carrera en la pantalla de confirmación.

---

## Etapa 2 — Mapas (días 8–12)

Aquí se invierte: el frontend lleva el peso y el backend solo alimenta.

### Backend

| # | Tarea | Detalle |
|---|---|---|
| BE-2.1 | ⛓ `riesgo.puntosMapa` | `(bbox, desde?, hasta?)` → GeoJSON `FeatureCollection` de puntos con `properties.peso` ya decaído y **coordenadas redondeadas a 3 decimales**. Es lo que consume el heatmap. |
| BE-2.2 | ⛓ `riesgo.zonasPorNivel` | Zonas con `nivel != "normal"` + centroide + riesgo + nº de reportes activos + personas afectadas. |
| BE-2.3 | ⛓ `fuentes.enCaja` | Fuentes `disponible: true` dentro del bbox, como GeoJSON. |
| BE-2.4 | `convex/crons.ts` | Diario: recorre `riesgoZona` con `by_nivel != "normal"`, recalcula, y cierra en `alertasEmergencia` las que bajaron. Solo cierra — abrir es trabajo de `reportes.crear`. |
| BE-2.5 | Límites de lectura | `puntosMapa` debe topar resultados (p. ej. 5.000 puntos). Una query de Convex tiene límite de documentos leídos; a escala de demo no se toca, pero el tope evita la sorpresa. |

### Frontend

| # | Tarea | Detalle |
|---|---|---|
| FE-2.1 | ⛓ `MapaBase` | MapLibre GL v6 + `pmtiles` como protocolo. `"use client"` y `next/dynamic` con `ssr: false` — MapLibre toca `window` en el import. Centrado en El Salvador, con `maxBounds`. |
| FE-2.2 | `CapaRiesgo` | Layer `heatmap` nativo de MapLibre con `heatmap-weight` leyendo `properties.peso`. Es GPU: miles de puntos sin despeinarse. |
| FE-2.3 | `CapaEmergencia` | Círculos graduados o badges sobre el centroide de cada zona en alerta. Rojo para `emergencia`, ámbar para `vigilancia`. Con etiqueta de texto, no solo color — daltonismo. |
| FE-2.4 | `CapaFuentes` | Marcadores por tipo de suministro + popup con teléfono, transporte y botón de llamar. |
| FE-2.5 | `FiltrosRango` | Rango de fechas + toggles de capa. El estado vive en la URL (`searchParams`) para poder compartir una vista. Recuerda: en Next 16 `searchParams` es una **Promise**. |
| FE-2.6 | Leyenda | Qué significa la intensidad, en palabras. Un heatmap sin leyenda es decoración. |
| FE-2.7 | Presupuesto de tiles | Medir el peso del `.pmtiles`. Si pasa de ~60 MB, recortar el zoom máximo. |

**Contrato de la etapa:** las tres queries devuelven **GeoJSON directamente consumible** por
`map.addSource({ type: "geojson", data })`. Sin capa de transformación en el cliente.

---

## Etapa 3 — Suministradores y roles (días 13–16)

### Backend

| # | Tarea | Detalle |
|---|---|---|
| BE-3.1 | `usuarios.completarOnboarding` | Fija `rol`, `tipoOrganizacion`, `organizacion`, `telefono`. `miembro` → `aprobado`; `consumidor` y `suministrador` → `pendiente`. |
| BE-3.2 | ⛓ `fuentes.crear` | `requiereRol(["suministrador"])`. Resuelve `distritoId`, exige `consentimientoTelefono: true`. Nace `verificada: false`. |
| BE-3.3 | `fuentes.mias` / `fuentes.alternarDisponible` | Por `by_propietario`, con verificación de propiedad en cada mutation. |
| BE-3.4 | `usuarios.aprobar` | `requiereRol(["admin"])`. En el MVP puede ejecutarse desde el dashboard de Convex. |
| BE-3.5 | Auditoría de permisos | Recorrer **todas** las funciones y confirmar que cada una llama a `usuarioActual` o `requiereRol`. Una query pública que devuelve `usuarios` completo es la fuga clásica. Media hora bien gastada. |

### Frontend

| # | Tarea | Detalle |
|---|---|---|
| FE-3.1 | `onboarding/page.tsx` | Selector de rol con explicación de cada uno. Si `consumidor`, pide tipo de organización (las 5 categorías del requisito). |
| FE-3.2 | ⛓ `fuentes/nueva` | Formulario con `SelectorPunto`, tipos de suministro (multi-selección), transporte, contacto. **Casilla de consentimiento explícita** sobre publicar el teléfono en el mapa. |
| FE-3.3 | `fuentes/page.tsx` | Mis fuentes, con toggle de disponibilidad. |
| FE-3.4 | `mis-reportes/page.tsx` | Historial con el peso decaído visible: "este reporte ya perdió el 70 % de su efecto". Enseña el algoritmo sin explicarlo. |
| FE-3.5 | `(app)/layout.tsx` | Guard de rol + navegación que cambia por rol. Estado `pendiente` → pantalla de "tu cuenta está en revisión". |

---

## Etapa 4 — Offline (días 17–19)

### Mitad barata — medio día, no se recorta

| # | Tarea | Detalle |
|---|---|---|
| FE-4.1 | `experimental.useOffline: true` | En `next.config.ts`. Next mantiene pendientes las navegaciones RSC y las Server Actions y las reintenta al volver la red, en vez de lanzar error. |
| FE-4.2 | `EstadoConexion` | Hook `useOffline()` de `next/…` en un banner fijo. Más fiable que `navigator.onLine`, que devuelve `true` con WiFi sin internet. |
| FE-4.3 | `src/app/manifest.ts` | Convención de archivo de Next. Nombre, iconos, `display: "standalone"`, `theme_color`. |
| FE-4.4 | `loading.tsx` por ruta | Sin Cache Components, el fallback de segmento es lo que sostiene la navegación offline. |

### Mitad cara — 2 días, es lo que se recorta si vas tarde

| # | Tarea | Detalle |
|---|---|---|
| FE-4.5 | `lib/colaOffline.ts` | IndexedDB con un solo object store: `{ claveIdempotencia, payload, intentos, creadoEn }`. API mínima: `encolar`, `listar`, `eliminar`. Sin librería — es la API nativa y son ~60 líneas. |
| FE-4.6 | `useColaOffline` | Intenta enviar; si falla por red, encola. Escucha `online` y vacía la cola en serie. Backoff simple entre intentos. |
| FE-4.7 | Contador de pendientes | Badge visible: "2 reportes esperando conexión". Sin esto el usuario cree que perdió su reporte. |
| FE-4.8 | `public/sw.js` | Cachea el shell de la app y los tiles del mapa. Registro manual, sin `next-pwa`. |
| BE-4.1 | Verificar idempotencia | **La prueba que importa de toda la etapa:** llamar a `reportes.crear` dos veces con la misma `claveIdempotencia` debe dejar **una** fila y devolver el mismo `_id`. Un assert en `riesgo.test.ts` o una prueba manual con la consola de Convex. |

> `experimental.useOffline` **no** cubre `fetch()` desde el cliente ni una recarga completa
> estando sin red. Convex mantiene su propia reconexión por WebSocket. La cola de IndexedDB
> es lo único que garantiza que un reporte llenado en modo avión llegue.

---

## Etapa 5 — Pulido (día 20)

| # | Tarea |
|---|---|
| 5.1 | Pasada de accesibilidad: navegación por teclado, foco visible, contraste ≥ 4.5:1, `lang="es"`. |
| 5.2 | Textos revisados por alguien de El Salvador. "Pasaje", "cantón" y "colonia" tienen que sonar correctos. |
| 5.3 | Datos de demo: reportes en 5–6 distritos con fechas escalonadas (hoy, hace 7 días, hace 21) para que el decaimiento se **vea**. |
| 5.4 | Rendimiento en 3G: `next build` y revisar el peso del bundle del mapa. Es la ruta más pesada, con diferencia. |
| 5.5 | Guion de demo de 5 minutos. |

---

## Trabajo en paralelo

Si son dos personas, el corte natural es **BE / FE con las firmas definidas primero**:

| Días | Backend | Frontend |
|---|---|---|
| 1–2 | Schema, auth, seed | Providers, `proxy.ts`, shell |
| 3–7 | `riesgo.ts`, `reportes.crear`, `fuentes.masCercanas` | Formulario multipaso (maqueta contra firmas vacías) |
| 8–12 | Queries GeoJSON, cron | MapLibre + las 3 capas |
| 13–16 | Roles, `fuentes.crear`, auditoría | Onboarding, alta de fuente, historial |
| 17–19 | Verificar idempotencia | Cola offline + service worker |
| 20 | Datos de demo | Accesibilidad y pulido |

Si es **una sola persona**, el orden es el mismo pero la Etapa 4 se hace en su mitad barata
y punto: la cola en IndexedDB no cabe en 20 días de una persona sin sacrificar el mapa,
y el mapa es lo que se demuestra.
