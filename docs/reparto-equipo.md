# Reparto del trabajo — 5 personas, 3 h 30 min

> **Este documento reemplaza al plan de 20 días.** El anterior sigue en el historial
> (commit `7c93c14`) y sirve para después del hackathon. Para hoy no sirve: pedía ~700
> horas-persona y quedan **17,5** (3,5 h × 5).
>
> Estado real del repo al escribir esto: `create-next-app` sin tocar, sin `convex`,
> sin `@clerk/nextjs`, sin `maplibre-gl`. Todo lo de abajo se construye desde cero.

---

## 0. La única pregunta que importa

**¿Qué ve el jurado?** Esto, y nada más:

> Un vecino sin cuenta abre la app, marca su casa en el mapa, dice cuántas personas
> están sin agua y lo envía. Acto seguido ve los tres suministradores más cercanos con
> su teléfono. Cambiamos a la vista de mapa y su reporte ya está pintado; el distrito
> con más reportes está en rojo.

Todo lo que no sea ese guion **se corta**. No se pospone: se corta hoy y no se menciona.

### La lista de cortes

| Se corta | Por qué |
|---|---|
| **Cola offline, IndexedDB, service worker, manifest** | Dos días de trabajo. Es la mitad cara de la Etapa 4 y no aparece en el guion. |
| **`claveIdempotencia`** | Existía *para* la cola offline. Sin cola, un `disabled` en el botón cubre el doble clic. |
| **Pipeline de PMTiles** | Se sustituye por tiles raster de OSM: 10 líneas, sin key, sin build. Ver §4. |
| **Tabla `zonas` + seed de 14 dept / 44 mun / distritos** | Pasa a ser un array TS de ~12 distritos con centroide, en `convex/model/constantes.ts`. |
| **Tabla `riesgoZona` + `crons.ts` + `alertasEmergencia`** | El riesgo se calcula **al leer**, en la query del mapa. Elimina el recálculo transaccional, el cron y una tabla. |
| **Onboarding, roles, guard, `mis-reportes`, admin** | Nada de esto sale en el guion. |
| **Tablero analítico, filtros de fecha, leyenda** | Ídem. |
| **CSV, API keys, `/v1`, moderación** | Ya estaban fuera del MVP. |
| **Formulario multipaso (5 pasos)** | Una sola página con todos los campos. El multipaso es 3× el código y 0× la demo. |

El esquema baja de **7 tablas a 2**: `reportesEscasez` y `fuentesSuministro`
(+ `usuarios` solo si Clerk sobrevive al §5).

> `ponytail:` el riesgo por distrito se calcula recorriendo todos los reportes en cada
> lectura del mapa.
> *Techo:* O(reportes totales) por render — irrelevante con las decenas de filas de hoy.
> *Upgrade path:* la tabla `riesgoZona` materializada que ya está diseñada en
> `modelo-datos.md`.

---

## 1. Los primeros 20 minutos (bloqueantes — nadie escribe UI hasta que esto exista)

| Min | Quién | Qué | Cómo se sabe que está |
|---|---|---|---|
| **0–3** | Convex | `npm i convex maplibre-gl @clerk/nextjs`, commit `chore: deps`, publicar | Los otros 4 actualizan **antes de escribir una línea** |
| **3–8** | Convex | `npx convex dev`, commitear `convex/_generated`, y **pegar `NEXT_PUBLIC_CONVEX_URL` y `CONVEX_DEPLOYMENT` en el chat del equipo** | Los 5 apuntan al **mismo** deployment. Si no, el mapa de la Vía 2 nunca verá los reportes de la Vía 1. |
| **8–20** | Convex | `schema.ts` (2 tablas), `model/constantes.ts` (distritos, rangos, tipos), y **firmas vacías** de las 5 funciones | Las vías importan `api.*` y compila |
| **8–20** | Vía 2 | `SelectorPunto` con su firma final, cuerpo = recuadro gris con dos inputs | Vías 1 y 3 escriben contra ella desde el minuto 20 |
| **8–20** | Vía 3 | `Boton` y `Campo`. Dos componentes. No hay tercero. | |

**A partir del minuto 20 nadie espera a nadie.** Ese es el único objetivo de este bloque.

Las 5 funciones de Convex, con su firma cerrada al minuto 20:

```ts
reportes.crear      (datos del formulario)     → Id<"reportesEscasez">
reportes.mapa       ()                         → GeoJSON FeatureCollection, peso ya calculado
fuentes.crear       (datos del alta)           → Id<"fuentesSuministro">
fuentes.listar      ()                         → GeoJSON FeatureCollection
fuentes.masCercanas ({ lat, lng, n: 3 })       → Fuente[]
```

```tsx
// src/components/mapa/SelectorPunto.tsx — dueño: Vía 2
export type Punto = { lat: number; lng: number };
export function SelectorPunto(props: {
  valor: Punto | null;
  onChange: (p: Punto) => void;
}): React.ReactNode;
```

> **`reportes.mapa` devuelve el peso ya decaído dentro del GeoJSON.** Así `riesgo.ts` vive
> solo en el servidor y la Vía 2 no importa nada de `convex/model/`. Una dependencia entre
> vías menos que en el plan de 20 días.

---

## 2. Las tres vías (minuto 20 → 150)

La regla del plan anterior sobrevive intacta, y hoy importa más que nunca:

> **Un fichero, un dueño.** Si necesitás tocar un fichero ajeno, no lo tocás: pedís la firma.

### Vía 1 · Reporte — *el camino crítico*

| Fichero | |
|---|---|
| `src/app/reportar/page.tsx` | formulario de una sola página |
| `src/app/reportar/gracias/page.tsx` | confirmación + las 3 fuentes más cercanas con teléfono |

Campos, y solo estos: punto (`<SelectorPunto>`) · rango de personas · menores ·
impacto (casa / pasaje / comunidad) · desde cuándo. La afectación económica es **un
textarea opcional**, no la unión discriminada de `modelo-datos.md`.

Consume: `<SelectorPunto>` (V2), `Boton` y `Campo` (V3), `reportes.crear` y
`fuentes.masCercanas` (Convex).

**Orden:** que el formulario envíe y guarde antes del minuto 90. La pantalla de gracias
después. Un formulario que guarda sin pantalla bonita es demo; una pantalla bonita que no
guarda no es nada.

---

### Vía 2 · Mapa

| Fichero | |
|---|---|
| `src/components/mapa/SelectorPunto.tsx` | **primero, stub, minuto 20** |
| `src/components/mapa/MapaBase.tsx` | MapLibre + estilo raster de OSM (§4) |
| `src/components/mapa/CapaRiesgo.tsx` | capa `heatmap`, `heatmap-weight` = `peso` del GeoJSON |
| `src/components/mapa/CapaFuentes.tsx` | marcadores con popup: nombre y teléfono |
| `src/app/mapa/page.tsx` | el mapa público |

**Orden:** stub (min 20) → `MapaBase` que renderiza (min 60) → `SelectorPunto` real
(min 90, desbloquea a V1 y V3) → capas (min 150).

Si a la hora `MapaBase` no pinta, decilo en voz alta: es el mayor riesgo del plan y hay
un plan B en §5.

---

### Vía 3 · Fuentes, portada y demo

| Fichero | |
|---|---|
| `src/components/ui/Boton.tsx` · `Campo.tsx` | **primero, minuto 20**. Dos. No hay tercero. |
| `src/app/page.tsx` | portada: título y dos botones grandes, *Reportar* y *Ver el mapa* |
| `src/app/fuentes/nueva/page.tsx` | alta de fuente — cierra el ciclo del guion |
| `src/app/globals.css` | tokens; congelado en el minuto 40 |
| `scripts/datos-demo.ts` | **el entregable que siempre se olvida** — ver §3 |

Vía 3 es además quien **integra**: actualiza desde el tronco cada 15 minutos, es la
primera en detectar que algo no compila, y es la dueña del ensayo final.

---

## 3. Los datos de demo no son opcionales

Un mapa vacío no demuestra nada, y sembrarlo a mano delante del jurado se ve fatal.
Vía 3 escribe, entre el minuto 60 y el 120, un script que inserte:

- **~25 reportes** repartidos en 4 distritos, con `_creationTime` escalonado entre hoy y
  hace 20 días — así el decaimiento se **ve** en el mapa.
- **Un distrito claramente en rojo** (8–10 reportes de `comunidad`, recientes). Ese es el
  que se enseña.
- **6 fuentes de suministro** con teléfonos plausibles, dos de ellas cerca del punto que
  se va a marcar en el formulario durante la demo — para que `fuentes.masCercanas`
  devuelva algo bonito.

Se corre en el minuto 150, después del freeze. Antes no: cualquier cambio de esquema lo
invalida.

---

## 4. El estilo del mapa, para que la Vía 2 no pierda 30 minutos

Sin PMTiles, sin key, sin cuenta. Pegar tal cual:

```ts
// src/components/mapa/estilo.ts — dueño: Vía 2
export const ESTILO = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
} as const;

export const CENTRO_SV = { lng: -88.9, lat: 13.75, zoom: 8 };
```

> `ponytail:` tiles raster públicos de OSM, sin caché propia.
> *Techo:* la política de uso de OSM no admite tráfico de producción, y sin red no hay mapa.
> *Upgrade path:* el pipeline de `.pmtiles` que describe el plan de 20 días.

---

## 5. Los dos riesgos que pueden matar la demo

**Clerk.** El plan anterior ya lo decía: `proxy.ts` es la pieza de mayor riesgo técnico
del proyecto. Hoy, además, **no está en el guion** — el reporte se hace como invitado.

> **Timebox de 60 minutos.** Si al minuto 60 no hay un login que funcione, Auth abandona
> Clerk, el alta de fuente queda abierta igual que el reporte, y esa persona pasa a ser
> segundo par de manos de la Vía 2, que es la más cargada. Esto no se negocia en el
> minuto 120: se decide en el 60.

**MapLibre.** Es la única dependencia pesada y el único código que puede no arrancar.

> Si al minuto 90 `MapaBase` no pinta: `SelectorPunto` se queda en dos inputs de lat/lng
> con un botón *«usar mi ubicación»* (`navigator.geolocation`, cinco líneas), y el mapa
> público se sustituye por una lista de distritos ordenada por riesgo con un badge de
> color. Feo, pero el guion entero se puede contar igual.

---

## 6. Integración: sin PRs

Cinco ramas y cinco PRs en 3,5 horas son media hora de merges en el peor momento posible.

- **Todo el mundo trabaja sobre `master`.** Los ficheros son disjuntos: no hay choque.
- Traer y publicar **cada 15 minutos**, aunque esté a medias.
- Si aparece un conflicto, es la señal de que alguien tocó territorio ajeno. Se revierte
  y se pide la firma.
- **Nadie corre `npm i` después del minuto 3.** Si te falta una dependencia, la instala
  Convex, que es quien posee `package.json`.

---

## 7. Calendario

| Min | Auth | Convex | V1 · Reporte | V2 · Mapa | V3 · Fuentes y demo |
|---|---|---|---|---|---|
| **0–20** | Clerk (timebox) | deps, `convex dev`, esquema, **firmas vacías**, URL al chat | maqueta del formulario | **`SelectorPunto` stub** | **`Boton`, `Campo`**, tokens |
| **20–60** | Clerk (timebox) | `riesgo.ts` y `reportes.crear` | formulario completo | `MapaBase` pintando | portada |
| **60–90** | ✅ o corta y apoya a V2 | `fuentes.crear`, `fuentes.masCercanas` | **envío funcionando** | `SelectorPunto` real | alta de fuente |
| **90–150** | apoyo | `reportes.mapa`, `fuentes.listar` (GeoJSON) | pantalla de gracias con fuentes cercanas | `CapaRiesgo` y `CapaFuentes` | `datos-demo.ts` |
| **150–180** | — | **congelado** | **congelado** | **congelado** | siembra los datos, integra, arregla lo roto |
| **180–210** | Los cinco: se ensaya el guion del §0 en un móvil real, dos veces |

**Minuto 150 = freeze.** Después de esa marca no se empieza nada nuevo; solo se arregla
lo que rompe el guion. Los últimos 30 minutos son de ensayo, no de código: una demo que
falla en vivo vale menos que una demo con la mitad de features que sale entera.
