# Reparto del trabajo — 5 personas, 3 vías paralelas

Dos plazas ya están asignadas:

| Plaza | Territorio | Nadie más lo toca |
|---|---|---|
| **Auth** | Clerk, `src/proxy.ts`, `convex/auth.config.ts`, `src/app/layout.tsx` (providers) | ✔ |
| **Convex** | Todo `convex/**`, `tsconfig.json` (alias), el algoritmo de riesgo | ✔ |

Quedan **tres personas para el resto**, que es el frontend completo más la PWA.

---

## El principio que evita los choques

No se reparte por *feature*, se reparte por **fichero**. Dos personas con features distintas
que editan el mismo `layout.tsx` chocan igual. La regla es:

> **Un fichero, un dueño.** Un componente, un fichero.
> Si necesitás tocar un fichero que no es tuyo, no lo tocás: pedís la firma.

Con eso, un conflicto de git es estructuralmente improbable. Lo que sí puede pasar es que
alguien **espere** a otro — y eso se resuelve con los contratos del día 1 (§4).

---

## 1. Las tres vías

### Vía 1 · Captura
**El reporte y todo lo que lo hace llegar.** Es el camino crítico del producto y la vía
más cargada.

| Posee | |
|---|---|
| `src/app/(publico)/reportar/**` | formulario multipaso + `_components/` |
| `src/app/(publico)/reportar/gracias/**` | confirmación + fuentes cercanas |
| `src/lib/colaOffline.ts` | cola IndexedDB |
| `src/hooks/useColaOffline.ts` | encolar / vaciar |
| `src/components/EstadoConexion.tsx` | banner + contador de pendientes |
| `src/app/manifest.ts` · `public/sw.js` | PWA |
| `next.config.ts` | **un solo edit**: `experimental.useOffline` |

**Por qué el formulario y la cola offline van juntos:** la cola existe *para* el formulario.
Separarlos obliga a dos personas a negociar el traspaso de la `claveIdempotencia` a través de
una frontera de equipo — que es justo donde se rompe la idempotencia y el mapa acaba
duplicando reportes.

**Consume de otros:** `<SelectorPunto>` (Vía 2), `Boton`/`Campo`/`Chip` (Vía 3),
`reportes.crear` y `fuentes.masCercanas` (Convex).

---

### Vía 2 · Cartografía
**MapLibre y las tres capas.** Es una habilidad autocontenida y el bundle más pesado de la
aplicación: un solo dueño, un solo sitio.

| Posee | |
|---|---|
| `src/components/mapa/**` | `MapaBase`, `CapaRiesgo`, `CapaEmergencia`, `CapaFuentes`, `SelectorPunto`, `tipos.ts`, `tiles.ts` |
| `src/app/(publico)/mapa/**` | mapa público de fuentes |
| `src/app/(app)/tablero/**` | mapa analítico + filtros de fecha |
| `public/tiles/**` | el pipeline de `.pmtiles` |

**Entrega antes que nada** (día 1) la firma final de `SelectorPunto`, aunque el cuerpo sea un
recuadro gris con dos inputs. Dos vías dependen de ella.

**Consume de otros:** `convex/model/riesgo.ts` para pintar el peso decaído (import de solo
lectura), y las tres queries GeoJSON de Convex.

---

### Vía 3 · Cuentas y shell
**Todo lo que rodea a una sesión iniciada**, más las primitivas visuales.

| Posee | |
|---|---|
| `src/app/(auth)/**` | páginas de ingreso, registro y onboarding |
| `src/app/(app)/layout.tsx` | shell, navegación por rol, guard |
| `src/app/(app)/mis-reportes/**` | historial con el peso decaído visible |
| `src/app/(app)/fuentes/**` | alta y gestión de fuentes de suministro |
| `src/app/(app)/admin/**` | aprobación de cuentas |
| `src/components/ui/**` | `Boton`, `Campo`, `Chip` — y nada más hasta la semana 3 |
| `src/app/globals.css` | tokens de Tailwind, congelado tras el día 2 |
| `src/lib/formato.ts` | fechas y números en es-SV |

Ojo con la frontera: la persona de **Auth** posee la *configuración* de Clerk
(`proxy.ts`, providers, JWT template). La Vía 3 posee las *pantallas* que hay detrás.

**Consume de otros:** `<SelectorPunto>` para el alta de fuente, y las mutations de usuarios y
fuentes.

---

## 2. Ficheros compartidos: dueño y regla

Estos son los únicos puntos donde dos personas podrían chocar. Cada uno tiene un dueño
nombrado y una fecha de congelación.

| Fichero | Dueño | Regla |
|---|---|---|
| `src/app/layout.tsx` | Auth | Se escribe el día 1 (providers + fuentes) y **se congela**. |
| `src/proxy.ts` | Auth | Nadie más lo abre. |
| `convex/**` | Convex | Las vías solo importan el `api` generado. |
| `tsconfig.json` | Convex | Añade el alias `@convex/*` el día 1. |
| `package.json` | Vía 3 coordina | **Todas** las dependencias se añaden en un solo commit el día 1. Después, quien necesite una avisa antes. |
| `next.config.ts` | Vía 1 | Un único edit en todo el proyecto. |
| `src/app/globals.css` | Vía 3 | Tokens el día 1–2, congelado después. |
| `public/sw.js` | Vía 1 | Vía 2 **no** lo edita — ver §5. |

---

## 3. Quién define qué

Los choques semánticos duelen más que los de git: dos formateadores de fecha distintos no dan
conflicto en el merge, dan un bug en la demo. Un dueño por concepto.

| Concepto | Lo define | Los demás |
|---|---|---|
| El tipo `Punto { lat, lng }` | Vía 2 · `components/mapa/tipos.ts` | importan |
| Color de cada nivel de riesgo | Vía 2 · `components/mapa/tipos.ts` | Vía 3 lo usa en el badge |
| Fechas y números en es-SV | Vía 3 · `lib/formato.ts` | importan |
| Rangos de personas, tipos de suministro, niveles de impacto | Convex · `model/constantes.ts` | los tres importan |
| Peso decaído de un reporte | Convex · `model/riesgo.ts` | Vía 2 lo pinta, Vía 3 lo muestra |
| Copys en español | Vía 3 | los tres proponen, Vía 3 unifica |

Nadie redefine un concepto de otro. Si te falta un campo, lo pedís al dueño.

---

## 4. Los contratos del día 1

Esto es lo único que puede dejar a alguien parado. Todo tiene que existir —aunque sea
vacío— antes de que termine el día 2.

| Contrato | Lo publica | Día |
|---|---|---|
| Firmas vacías (`return null`) de **todas** las queries y mutations | Convex | 1 |
| `convex/model/constantes.ts` con enums y rangos | Convex | 1 |
| `src/app/layout.tsx` con `ClerkProvider` + `ConvexProviderWithClerk` | Auth | 1 |
| `src/proxy.ts` funcionando con Clerk | Auth | 1–2 |
| `<SelectorPunto>` con su firma final, cuerpo stub | Vía 2 | 1 |
| Tokens de Tailwind + `Boton`, `Campo`, `Chip` | Vía 3 | 2 |
| Todas las dependencias instaladas en un commit | Vía 3 | 1 |

La firma de `SelectorPunto`, que es la más consumida:

```tsx
// src/components/mapa/SelectorPunto.tsx — dueño: Vía 2
export function SelectorPunto(props: {
  valor: Punto | null;
  onChange: (p: Punto & { precisionM?: number }) => void;
  centroInicial?: Punto;
}): React.ReactNode;
```

Vías 1 y 3 escriben contra esa firma desde el día 1. Vía 2 le pone el mapa el día 3.
Es el mismo patrón que usa Convex con sus funciones vacías: **la firma primero, el cuerpo
después**, y así nadie espera a nadie.

---

## 5. El único choque real: la semana 4

En la etapa offline, Vía 1 escribe `public/sw.js` y Vía 2 quiere que ese service worker
cachee los tiles del mapa. Es el único punto del plan donde dos vías necesitan el mismo
fichero.

**Resolución:** `sw.js` es de Vía 1, sin excepciones. Vía 2 expone lo que quiere cachear:

```ts
// src/components/mapa/tiles.ts — dueño: Vía 2
export const URLS_A_CACHEAR: string[] = [ /* estilo, sprite, glyphs, pmtiles */ ];
```

Vía 1 lo importa y ya. Vía 2 nunca abre `sw.js`.

---

## 6. Calendario en paralelo

Sobre los 20 días hábiles de `roadmap.md`. Las cinco columnas avanzan a la vez.

| Días | Auth | Convex | Vía 1 · Captura | Vía 2 · Cartografía | Vía 3 · Cuentas |
|---|---|---|---|---|---|
| **1–2** | `proxy.ts`, providers, JWT template | Esquema, seed de zonas, **firmas vacías** | Maqueta de los 5 pasos | `SelectorPunto` stub, spike de MapLibre | Deps, tokens, `Boton`/`Campo`/`Chip` |
| **3–7** | Roles en el JWT, pruebas de sesión | `riesgo.ts` + asserts, `reportes.crear`, `fuentes.masCercanas` | Formulario completo + borrador en `localStorage` | `MapaBase` real, `SelectorPunto` con mapa, pipeline de tiles | Onboarding, shell, guard de rol |
| **8–12** | Estados `pendiente` / `aprobado` | Queries GeoJSON, `crons.ts` | Pantalla de confirmación + fuentes cercanas | Las tres capas, filtros de fecha, leyenda | `mis-reportes` con peso decaído |
| **13–16** | Auditoría de permisos | `fuentes.crear`, `usuarios.aprobar` | Cola IndexedDB + `useColaOffline` | Tablero analítico | Alta de fuente, gestión, admin |
| **17–19** | — | Verificar idempotencia | `sw.js`, manifest, contador de pendientes | Cacheo de tiles (vía `tiles.ts`) | Pasada de accesibilidad |
| **20** | — | Datos de demo escalonados | Prueba en modo avión | Rendimiento del bundle del mapa | Revisión de copys + guion |

---

## 7. Integración

- Una rama por vía: `via/captura`, `via/mapa`, `via/cuentas`. PRs pequeños contra `master`.
- Como los ficheros son disjuntos, los merges no chocan. Si aparece un conflicto, **es la
  señal de que alguien tocó territorio ajeno** — no se resuelve el conflicto, se revierte y
  se pide la firma.
- Deploy de preview por rama desde el día 1, para que las cinco personas vean el mismo estado.

## 8. Si alguien termina antes

Vía 3 es la más ligera de las tres. Si se libera, en este orden:

1. **Descarga CSV** (`src/app/api/exportar/reportes/route.ts`) — medio día, desbloquea a los
   consumidores de información.
2. **Moderación de reportes** — el campo `estado` ya existe en el esquema.
3. **Creación de API_KEY** — la UI; el endpoint `/v1` es de Convex.

Ninguna de las tres toca ficheros de las otras vías.
