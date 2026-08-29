# Modelo de datos — aguaSOS (Convex)

> Backend: **Convex 1.45**. Cada tabla recibe automáticamente `_id` y `_creationTime`;
> no se declaran campos redundantes de fecha de creación.
> Convex **no tiene constraints de unicidad** — la unicidad se garantiza dentro de la
> mutation, que corre en una transacción serializable.

## 1. Vista general

```
              ┌──────────────┐
              │   usuarios   │◄──────────── Clerk (identidad) vía clerkUserId
              └──────┬───────┘
       ┌─────────────┼──────────────┬────────────────┐
       │             │              │                │
       ▼             ▼              ▼                ▼
┌─────────────┐ ┌──────────┐ ┌────────────┐  ┌──────────────┐
│  reportes   │ │ fuentes  │ │  apiKeys   │  │   alertas    │
│  Escasez    │ │Suministro│ │            │  │  Emergencia  │
└──────┬──────┘ └────┬─────┘ └────────────┘  └──────┬───────┘
       │             │                              │
       └──────┬──────┴──────────────────────────────┘
              ▼
        ┌──────────┐        ┌──────────────┐
        │  zonas   │◄───────│  riesgoZona  │  (agregado materializado)
        └────┬─────┘        └──────────────┘
             │ padreId (auto-referencia)
             └── departamento → municipio → distrito
```

## 2. Tablas

### `usuarios`

Perfil de aplicación. **Clerk es la fuente de verdad de la identidad**; Convex lo es del rol y del perfil.

| Campo | Tipo | Notas |
|---|---|---|
| `clerkUserId` | `v.string()` | Sujeto del JWT de Clerk. Único (validado en la mutation). |
| `rol` | `v.union(literal)` | `"miembro"` \| `"consumidor"` \| `"suministrador"` \| `"admin"` |
| `nombre` | `v.string()` | |
| `apellidos` | `v.optional(v.string())` | |
| `email` | `v.string()` | Espejo de Clerk, para contacto y export CSV. |
| `telefono` | `v.optional(v.string())` | Obligatorio para `suministrador`. |
| `tipoOrganizacion` | `v.optional(v.union(literal))` | Solo `consumidor`: `"universidad"` \| `"ong_humanitaria"` \| `"ong_otra"` \| `"gobierno"` \| `"cuerpo_socorro"` |
| `organizacion` | `v.optional(v.string())` | Nombre de la institución. |
| `estadoVerificacion` | `v.union(literal)` | `"pendiente"` \| `"aprobado"` \| `"rechazado"`. `miembro` nace `"aprobado"`; `consumidor` y `suministrador` requieren revisión de admin. |

**Índices:** `by_clerk ["clerkUserId"]`, `by_rol_estado ["rol", "estadoVerificacion"]`

> **Decisión:** el rol vive **solo** en Convex, no duplicado en `publicMetadata` de Clerk.
> Dos fuentes de verdad para autorización es la fuente clásica de bugs de permisos.
> `proxy.ts` solo decide *sesión sí / sesión no*; el rol se verifica dentro de cada
> función de Convex.
> *Techo:* obliga a un round-trip a Convex antes de pintar el layout por rol.
> *Upgrade path:* si molesta el parpadeo, espejar el rol en un claim del JWT de Clerk
> y dejar Convex como validador final.

---

### `zonas`

Catálogo administrativo de El Salvador, auto-referenciado.

| Campo | Tipo | Notas |
|---|---|---|
| `tipo` | `v.union(literal)` | `"departamento"` \| `"municipio"` \| `"distrito"` |
| `nombre` | `v.string()` | |
| `codigo` | `v.string()` | Código oficial. Único por tipo. |
| `padreId` | `v.optional(v.id("zonas"))` | Ausente solo en departamentos. |
| `centroide` | `v.object({ lat: v.number(), lng: v.number() })` | Para centrar el mapa y anclar el badge de emergencia. |
| `poblacion` | `v.optional(v.number())` | Denominador del umbral de emergencia. |

**Índices:** `by_tipo ["tipo"]`, `by_padre ["padreId"]`, `by_codigo ["codigo"]`

> El **cantón** no se cataloga: se guarda como texto libre en el reporte.
> `ponytail:` son más de 2.000 cantones y no hay catálogo oficial digital estable.
> *Techo:* no se puede agregar riesgo a nivel cantón ni deduplicar nombres mal escritos.
> *Upgrade path:* sembrar `zonas` con `tipo: "canton"` cuando exista la fuente.

> **Verificar antes de sembrar:** la reorganización territorial vigente agrupa los antiguos
> municipios en 44 municipios y los convierte en **distritos**, sobre 14 departamentos.
> Contrastar el seed contra el catálogo oficial (ISDEM / DIGESTYC) antes de cargarlo —
> no lo des por bueno desde este documento.

---

### `reportesEscasez`

El corazón del sistema. Se escribe una vez y **no se muta con el tiempo**: el decaimiento
se calcula al leer.

| Campo | Tipo | Notas |
|---|---|---|
| `autorId` | `v.optional(v.id("usuarios"))` | Ausente ⇒ reporte de invitado. |
| `claveIdempotencia` | `v.string()` | `crypto.randomUUID()` generado **en el cliente** al encolar. Impide duplicados al reintentar desde la cola offline. |
| `escasezDesde` | `v.number()` | Timestamp: desde cuándo se produce la escasez. |
| `lat` / `lng` | `v.number()` | Punto elegido en el mapa o tomado del GPS. |
| `precisionM` | `v.optional(v.number())` | Precisión del GPS en metros. |
| `distritoId` | `v.id("zonas")` | Denormalizado desde el punto para poder indexar y agregar. |
| `canton` | `v.optional(v.string())` | Texto libre. |
| `personasRango` | `v.union(literal)` | `"1-5"` \| `"6-20"` \| `"21-100"` \| `"101-500"` \| `"500+"` |
| `personasEst` | `v.number()` | Punto medio del rango. Es lo que entra al cálculo. |
| `menores` | `v.number()` | |
| `impacto` | `v.union(literal)` | `"casa"` \| `"pasaje"` \| `"comunidad"` |
| `afectacionEconomica` | `v.array(v.union(...))` | Unión discriminada, ver abajo. Puede ir vacío. |
| `severidadBase` | `v.number()` | **Calculado en la mutation** y congelado. Ver §3. |
| `estado` | `v.union(literal)` | `"publicado"` \| `"oculto"` \| `"rechazado"` — moderación. |

`afectacionEconomica[]` es una unión discriminada:

```ts
v.array(
  v.union(
    v.object({
      tipo: v.literal("siembra"),
      cultivo: v.string(),
      hectareas: v.number(),
      porcentajePerdida: v.number(),   // 0–100
    }),
    v.object({
      tipo: v.literal("otra"),
      descripcion: v.string(),
    }),
  ),
)
```

**Índices:**

- `by_idempotencia ["claveIdempotencia"]` — lookup obligatorio antes de insertar
- `by_autor ["autorId"]` — historial del usuario
- `by_distrito ["distritoId"]` — agregación de riesgo
- `by_lat ["lat"]` — barrido por bounding box (ver §4)

> **Por qué no hay campo `activo`:** sería un booleano que cambia solo con el paso del
> tiempo y obligaría a un job que reescriba filas todos los días. `activo` es una
> **función pura de `severidadBase` y `_creationTime`**, evaluada al leer.
> Cero escrituras, cero deriva entre el flag y la realidad.

---

### `fuentesSuministro`

| Campo | Tipo | Notas |
|---|---|---|
| `propietarioId` | `v.id("usuarios")` | Rol `suministrador`. |
| `nombreLugar` | `v.string()` | |
| `lat` / `lng` | `v.number()` | |
| `distritoId` | `v.id("zonas")` | |
| `canton` | `v.optional(v.string())` | |
| `tiposSuministro` | `v.array(v.union(literal))` | `"embotellada"` \| `"pozo"` \| `"nacimiento"` \| `"tanque"` \| `"donacion"` — múltiple. |
| `tieneTransporte` | `v.boolean()` | |
| `contactoNombre` | `v.string()` | |
| `contactoTelefono` | `v.string()` | Es el dato que consume el miembro de comunidad. |
| `contactoEmail` | `v.optional(v.string())` | |
| `disponible` | `v.boolean()` | Interruptor rápido del suministrador. |
| `verificada` | `v.boolean()` | La marca el admin. |

**Índices:** `by_propietario ["propietarioId"]`, `by_lat ["lat"]`, `by_distrito ["distritoId"]`

> El teléfono de contacto se muestra **público** en el mapa: es el requisito del proyecto.
> Hay que decirlo explícitamente en el formulario de alta y guardar el consentimiento.

---

### `riesgoZona`

Agregado materializado por distrito. Una fila por zona.

| Campo | Tipo | Notas |
|---|---|---|
| `zonaId` | `v.id("zonas")` | Único (validado en la mutation). |
| `riesgo` | `v.number()` | Σ de pesos decaídos al momento del cálculo. |
| `reportesActivos` | `v.number()` | |
| `personasAfectadas` | `v.number()` | |
| `nivel` | `v.union(literal)` | `"normal"` \| `"vigilancia"` \| `"emergencia"` |
| `calculadoEn` | `v.number()` | |

**Índices:** `by_zona ["zonaId"]`, `by_nivel ["nivel"]`

> `ponytail:` se recalcula la zona entera al insertar un reporte, y todas las zonas
> una vez al día por cron.
> *Techo:* O(reportes del distrito) por recálculo — irrelevante con miles de filas,
> problemático con millones.
> *Upgrade path:* `@convex-dev/aggregate`, que mantiene sumas incrementales en un árbol.

---

### `apiKeys`

| Campo | Tipo | Notas |
|---|---|---|
| `propietarioId` | `v.id("usuarios")` | Solo `consumidor` aprobado o `admin`. |
| `nombre` | `v.string()` | Etiqueta que pone el usuario. |
| `hash` | `v.string()` | **SHA-256 del token.** El token en claro se muestra una sola vez y no se guarda. |
| `prefijo` | `v.string()` | Primeros 8 caracteres, para que el usuario identifique la llave en la UI. |
| `ultimoUso` | `v.optional(v.number())` | |
| `revocadaEn` | `v.optional(v.number())` | Revocación lógica; nunca se borra la fila. |

**Índices:** `by_hash ["hash"]`, `by_propietario ["propietarioId"]`

---

### `alertasEmergencia`

Historial de transiciones de nivel. Es lo que ve el tablero de gobierno.

| Campo | Tipo | Notas |
|---|---|---|
| `zonaId` | `v.id("zonas")` | |
| `nivel` | `v.union(literal)` | `"vigilancia"` \| `"emergencia"` |
| `riesgoAlAbrir` | `v.number()` | |
| `cerradaEn` | `v.optional(v.number())` | Ausente ⇒ alerta abierta. |
| `reconocidaPor` | `v.optional(v.id("usuarios"))` | |
| `reconocidaEn` | `v.optional(v.number())` | |

**Índices:** `by_zona ["zonaId"]`, `by_abiertas ["cerradaEn"]`

---

## 3. Algoritmo de riesgo hídrico

Vive en `convex/model/riesgo.ts` como **TypeScript puro sin `ctx`**, así el cliente lo
importa y pinta exactamente el mismo número que calcula el servidor. Una sola definición.

```ts
export const VIDA_MEDIA_DIAS = 14;
export const UMBRAL_ACTIVO = 0.5;

const PESO_IMPACTO = { casa: 1, pasaje: 3, comunidad: 9 } as const;

/** Se calcula una vez, en la mutation, y se congela en la fila. */
export function severidadBase(r: {
  impacto: keyof typeof PESO_IMPACTO;
  personasEst: number;
  menores: number;
  afectacionEconomica: Afectacion[];
}): number {
  const personas = Math.max(r.personasEst, 1);
  const factorPersonas = 1 + Math.log10(1 + personas);                 // amortigua números grandes
  const factorMenores = 1 + 0.5 * Math.min(r.menores / personas, 1);   // 1.0 – 1.5
  const economico = Math.min(
    10,
    r.afectacionEconomica.reduce(
      (acc, a) => acc + (a.tipo === "siembra" ? (a.hectareas * a.porcentajePerdida) / 100 : 1),
      0,
    ),
  );

  return PESO_IMPACTO[r.impacto] * factorPersonas * factorMenores + economico;
}

/** Decaimiento exponencial por antigüedad. */
export function peso(severidadBase: number, creadoEn: number, ahora: number): number {
  const dias = (ahora - creadoEn) / 86_400_000;
  return severidadBase * Math.pow(0.5, dias / VIDA_MEDIA_DIAS);
}

export const estaActivo = (p: number) => p >= UMBRAL_ACTIVO;

/** El nº de reportes entra por la suma: más reportes ⇒ más riesgo. */
export const riesgoZona = (pesos: number[]) => pesos.reduce((a, b) => a + b, 0);

export function nivel(riesgo: number, poblacion = 0) {
  const umbral = Math.max(30, poblacion * 0.002);
  if (riesgo >= umbral) return "emergencia";
  if (riesgo >= umbral * 0.5) return "vigilancia";
  return "normal";
}
```

Los tres factores que pide el requisito quedan cubiertos:

| Requisito | Dónde entra |
|---|---|
| Antigüedad | `Math.pow(0.5, dias / VIDA_MEDIA_DIAS)` — vida media de 14 días |
| Impacto | `PESO_IMPACTO` (1 / 3 / 9) × personas × menores + económico |
| Número de reportes | La suma en `riesgoZona` — cada reporte aporta su peso |

> `ponytail:` los coeficientes (14 días, 1/3/9, el 0,002 del umbral) son heurísticos
> **sin calibración de campo**.
> *Techo:* el umbral de emergencia puede disparar de más o de menos en su primera temporada seca.
> *Upgrade path:* moverlos a una tabla `parametros` editable por admin y ajustarlos contra
> series históricas de ANDA / MARN **antes** de conectar cualquier notificación externa.

### Cuándo se recalcula

El decaimiento **solo baja** el riesgo. Eso hace el disparo asimétrico y barato:

- **Entrar** en vigilancia/emergencia solo puede ocurrir al insertar un reporte
  → se recalcula la zona en la misma mutation, transaccionalmente.
- **Salir** solo puede ocurrir por el paso del tiempo
  → un cron diario (`convex/crons.ts`) barre las zonas con `nivel != "normal"` y las cierra.

No hace falta un job que recorra todas las zonas cada hora.

### Check obligatorio

`convex/model/riesgo.test.ts` — un solo archivo, sin framework, con asserts:

1. Un reporte de `comunidad` pesa más que uno de `casa` con las mismas personas.
2. `peso()` a los 14 días es exactamente la mitad de `severidadBase`.
3. Diez reportes pequeños superan el umbral que uno solo no alcanza (requisito 2.3).
4. `nivel()` no devuelve `"emergencia"` con riesgo 0.

Si esas cuatro pasan, el algoritmo hace lo que dice el requisito.

---

## 4. Consultas geoespaciales

**Decisión: sin componente geoespacial en el MVP.** El Salvador entra en un rectángulo de
~21.000 km² y el volumen del piloto son miles de filas, no millones.

```ts
// Bounding box: índice sobre lat, filtro de lng en memoria.
const enCaja = await ctx.db
  .query("fuentesSuministro")
  .withIndex("by_lat", (q) => q.gte("lat", sur).lte("lat", norte))
  .filter((q) => q.and(q.gte(q.field("lng"), oeste), q.lte(q.field("lng"), este)))
  .collect();

// "Más cercanos": haversine sobre los candidatos de la caja, ordenar, tomar 5.
```

> `ponytail:` índice por una sola dimensión + filtro en memoria.
> *Techo:* degrada cuando una banda de latitud contiene decenas de miles de filas
> (no ocurre a escala El Salvador).
> *Upgrade path:* `@convex-dev/geospatial` (beta, v0.2.1) — expone `insert`, `query` con
> `shape: { type: "rectangle" }` y `nearest`. La migración toca solo dos funciones.

---

## 5. Notas de seguridad

- **Nunca** se guarda una API key en claro. Se genera, se muestra una vez, se guarda el SHA-256.
- El endpoint público de la API devuelve datos **agregados por distrito**, no coordenadas
  exactas de hogares. Un reporte de escasez con impacto `casa` y lat/lng exacto es un dato
  sensible sobre una vivienda concreta.
- El mapa público **redondea** el punto de los reportes a ~500 m (3 decimales) antes de
  exponerlo. Las coordenadas exactas solo las ven `admin` y el propio autor.
- El teléfono de las fuentes de suministro **sí** es público — es el propósito de la tabla —
  y se pide consentimiento explícito en el alta.
