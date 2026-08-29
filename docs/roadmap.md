# Etapas del desarrollo — aguaSOS

**Alcance elegido:** hackathon / demo, 4 semanas (20 días hábiles).
**Stack:** Next.js 16.3.3 · React 19.2 · TypeScript · Clerk · Convex · MapLibre GL + PMTiles.

---

## Una advertencia antes de empezar

Elegiste **PWA offline** dentro de una ventana de 4 semanas. Es la decisión correcta para el
problema — reportar escasez de agua ocurre justo donde no hay señal — pero es también la
pieza más cara del plan: cola en IndexedDB, idempotencia, service worker y tiles cacheados.

Por eso el plan la pone en la **Etapa 4**, después de que el flujo completo funcione online.
Si en el día 16 vas retrasado, la Etapa 4 se recorta a su mitad barata (banner de conexión +
`experimental.useOffline`, que Next ya trae) y la cola en IndexedDB pasa a evolución. La demo
sigue en pie.

Lo que **no** entra en el MVP, por tu propia elección de alcance:

| Fuera del MVP | Por qué se puede sacar |
|---|---|
| Creación de API_KEY | Ningún consumidor real la va a usar en una demo. El diseño ya está en `modelo-datos.md`. |
| Descarga CSV | Un botón de 4 horas — se añade en cualquier momento sin tocar nada más. |
| Notificaciones externas (email/SMS) | Elegiste dashboard + badge: el umbral se ve dentro de la plataforma. |
| Panel de admin completo | Aprobación manual desde el dashboard de Convex durante la demo. |
| Moderación de reportes | El campo `estado` ya existe en el esquema; la UI espera. |

El **algoritmo de riesgo sí entra en el MVP**, aunque el CSV no: sin él no hay mapa de
intensidad, y el mapa es la mitad de la demo.

---

## Etapa 0 — Cimientos (días 1–2)

Poner en pie el esqueleto que todo lo demás asume.

- Convex conectado (`npx convex dev`), `schema.ts` con las 7 tablas y sus índices.
- Clerk configurado + `convex/auth.config.ts` apuntando al issuer de Clerk.
- `ClerkProvider` + `ConvexProviderWithClerk` en el root layout.
- `src/proxy.ts` con `clerkMiddleware` — **la pieza de mayor riesgo técnico del proyecto**
  (ver `estructura-carpetas.md`). Resuélvela el día 1, no el día 15.
- `convex/seed.ts`: catálogo de zonas (14 departamentos → 44 municipios → distritos) con
  centroides. Contrastado contra la fuente oficial.
- Deploy a Vercel desde el primer día, con preview por rama.

**Listo cuando:** un usuario se registra, `usuarios` tiene su fila con rol, y el deploy
de preview levanta. Sin UI bonita todavía.

---

## Etapa 1 — Reporte de escasez, extremo a extremo (días 3–7)

El flujo que define el producto. Se construye **como invitado**, sin login, porque ese es
el camino crítico del requisito.

- `convex/model/riesgo.ts` + su archivo de asserts. Escríbelo antes que la UI: es la
  única lógica no trivial del backend.
- Mutation `reportes.crear` — valida, calcula `severidadBase`, resuelve `distritoId` desde
  el punto, verifica `claveIdempotencia`, inserta y recalcula `riesgoZona` en la misma
  transacción.
- Formulario multipaso: ubicación → personas afectadas → impacto → afectación económica → fecha.
- Query `fuentes.masCercanas` (bounding box + haversine).
- Pantalla de confirmación con las fuentes cercanas en lista **y** en mapa.

**Listo cuando:** un invitado envía un reporte desde el móvil y recibe la lista de
suministradores más cercanos. Es la demo mínima vendible.

---

## Etapa 2 — Mapas (días 8–12)

- `MapaBase` con MapLibre GL + PMTiles, centrado en El Salvador.
- **Capa de riesgo:** heatmap de MapLibre ponderado por el peso decaído de cada reporte.
- **Capa de emergencia:** zonas con `nivel != "normal"` marcadas sobre su centroide.
- **Capa de fuentes:** marcadores con popup (nombre, tipo, teléfono, transporte sí/no).
- Filtros de rango de fechas.
- `convex/crons.ts`: barrido diario que cierra alertas cuyo riesgo ya decayó.

**Listo cuando:** los reportes de la Etapa 1 se ven como calor en el mapa y un distrito
con suficientes reportes muestra su badge de emergencia.

---

## Etapa 3 — Suministradores y roles (días 13–16)

- Onboarding: al registrarse se elige rol; `consumidor` y `suministrador` quedan `pendiente`.
- Alta de fuente de suministro con selector de punto en el mapa y **consentimiento explícito
  de publicación del teléfono**.
- Gestión: listar mis fuentes, alternar `disponible`.
- Historial de reportes del miembro logueado.
- Guard de rol en `(app)/layout.tsx` y en cada función de Convex.

**Listo cuando:** un suministrador se registra, publica una fuente, y esa fuente aparece
en el resultado de la Etapa 1 para un reporte cercano. El ciclo se cierra.

---

## Etapa 4 — Offline (días 17–19)

Se ataca en dos mitades, en este orden, para poder parar a la mitad:

**Mitad barata (medio día, hazla siempre):**
- `experimental.useOffline` en `next.config.ts` + hook `useOffline()` en el banner de conexión.
  Next reintenta solo las navegaciones RSC y las Server Actions cuando vuelve la red.
- `manifest.ts` e iconos → la app se instala en la pantalla de inicio.

**Mitad cara (2 días, es la que se recorta si vas tarde):**
- Cola en IndexedDB: si el envío falla, el reporte se guarda con su `claveIdempotencia`.
- Vaciado automático al recuperar conexión, con la mutation deduplicando por esa clave.
- Service worker cacheando el shell de la app y los tiles del mapa.
- Contador visible de reportes pendientes de sincronizar.

**Listo cuando:** con el modo avión activado se puede llenar y enviar un reporte, y al
volver la señal aparece en el mapa — una sola vez, aunque se reintente.

---

## Etapa 5 — Pulido y demo (día 20)

- Accesibilidad del formulario: labels reales, foco visible, errores anunciados.
  No es opcional: los usuarios objetivo entran desde móviles baratos.
- Textos en español de El Salvador, revisados por alguien de allá.
- Datos de demo sembrados en varios distritos, con fechas escalonadas para que el
  decaimiento se vea en el mapa.
- Guion de la demo: invitado reporta → mapa se enciende → suministrador aparece → badge de
  emergencia salta.

---

## Después del hackathon (evolución)

En orden de valor por esfuerzo:

1. **CSV** — medio día, desbloquea a los consumidores de información.
2. **API_KEY + `/v1` en `convex/http.ts`** — 2 días, con rate limiting.
3. **Moderación de reportes** — la protección contra el primer troll.
4. **Notificaciones externas** — solo después de calibrar el umbral contra datos reales.
   Un email de emergencia hídrica falso a una institución de gobierno cuesta credibilidad
   que no se recupera.
5. **Impresión de reporte de comunidad** (la "evolución" del requisito 1.1.2.4).
6. **`@convex-dev/geospatial`** cuando el bounding box deje de rendir.
