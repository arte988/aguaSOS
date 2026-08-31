# ADR: Resolución territorial de reportes mediante PIP

**Estado:** accepted  
**Fecha:** 2026-08-29

`distritoId` es obligatorio en reportes y fuentes **publicados**. La asignación `lat/lng → distritoId` es autoridad del servidor y, en producción, se hará por point-in-polygon (PIP) sobre geometrías oficiales. Hoy el schema ya exige el distrito; el resolver PIP **no está implementado**; el catálogo oficial está vacío; el código vigente es fail-closed.

Este ADR no describe un sistema que ya resuelve polígonos. Describe la decisión para no “arreglar” el hueco con atajos que rompen el modelo de riesgo.

## Contexto

El modelo (`docs/modelo-datos.md`, `convex/schema.ts`) trata el **distrito** como unidad de agregación: reportes, `riesgoZona`, `alertasEmergencia`, fuentes, estadísticas y mapa. El cantón es texto libre, no catálogo.

`reportes:crear` no inserta si no hay distrito. `resolverDistritoPorPunto()` devuelve `distritoId: null` (no hay geometrías). `ZONAS_CATALOGO` está `[]` a propósito. En el deployment de desarrollo hay filas `Prueba`, `F4`, `R5`, `A6`: **no son catálogo oficial**.

El E2E happy-path espera `/mapa?reporteId=` y falla porque Convex rechaza el punto sin cobertura. No se debe tapar eso con un mock de Convex ni con `distritoId` opcional.

El roadmap (BE-1.4) mencionó “centroide más cercano” como MVP. Ese atajo **no se adopta** para producción.

## Decisión

1. Un reporte o fuente **publicado** lleva `distritoId` obligatorio. No se persiste publicado sin distrito.
2. La resolución `lat/lng → distritoId` ocurre en **Convex**. El cliente no elige ni inventa un id. Puede mostrar el nombre **después** de que el servidor resuelva.
3. En producción el método es **PIP** sobre `Polygon` / `MultiPolygon` oficiales. Los centroides sirven para mapa, badge y umbrales de población — **no** para pertenencia territorial.
4. **Fail-closed:** fuera de polígonos, sin cobertura, inconsistencia o imposibilidad de resolver → el backend **rechaza**. No insertar “sin distrito”. No “más cercano”. No inventar. No promover datos de prueba a oficiales.
5. El catálogo oficial (cuando exista) incluye departamentos, municipios, distritos, códigos, nombres, `padreId`, población cuando corresponda, centroides **verificados**, y geometrías de fuente documentada y versionada (el proyecto cita ISDEM / DIGESTYC; el dataset aún no está en el repo).
6. E2E: no mockear Convex entero. CI usará un **fixture territorial identificado**. Happy path: polígono fixture → punto interior → `distritoId` → reporte → mapa. Otro caso: fail-closed sin cobertura.

## Estado intermedio (hoy)

| Pieza | Estado |
|---|---|
| Schema `distritoId` / `zonaId` | Preparado, obligatorio en documentos publicados |
| PIP | **No implementado** |
| `ZONAS_CATALOGO` | Vacío |
| `resolverDistritoPorPunto` | Fail-closed (siempre `null`) |
| Catálogo oficial + geometrías | Pendiente |
| Filas cloud `Prueba` / `F4` / `R5` / `A6` | Prueba; no oficiales |

Hasta FASE B, `reportes:crear` seguirá rechazando puntos que no traigan un `distritoId` coherente **y** no puedan resolverse por punto (hoy: todos).

## Roadmap

| Fase | Qué |
|---|---|
| **A** | Catálogo y geometrías territoriales oficiales, procedencia versionada; no mezclar filas de prueba |
| **B** | Resolver PIP (`resolverDistrito`, `zonas.buscarPorPunto`, almacenamiento de polígonos) |
| **C** | Integración con `reportes` y `fuentes` (sigue la autoridad en servidor; UX de error de cobertura, no de “conexión”) |
| **D** | E2E con fixture + caso fail-closed |
| **E** | Validación (`tsc`, lint, build, E2E, Convex en desarrollo — no `deploy` de producción como prueba) |

## Alternativas rechazadas

1. **`distritoId` opcional.** El riesgo y las alertas dejan de tener unidad. Dos clases de reporte; el mapa de calor miente.
2. **Distrito más cercano por centroide.** Fronteras falsas; el E2E (`13.7, -89.2`) ni siquiera cae cerca de los centroides de prueba. Sesga umbrales de emergencia.
3. **Selección manual obligatoria en la UI.** El usuario de SOS no es cartógrafo; un id mal elegido es tan grave como el centroide. La UI puede *mostrar* lo resuelto, no *imponer* el id.
4. **Mock completo de Convex en el E2E.** El test pasaría con el mock local y fallaría en cuanto exista URL de Convex (estado actual). Oculta la dependencia BE-0.6.
5. **Filas `Prueba` / `F4` / `R5` / `A6` como producción.** Códigos y geometrías no oficiales; contaminan agregados y el seed.

## Consecuencias

**Ventajas:** integridad territorial; riesgo y alertas sobre la misma unidad; estadísticas y trazabilidad; comportamiento seguro si faltan datos.

**Costos:** hay que conseguir y versionar el catálogo y las geometrías; PIP tiene coste (hoy no hay índice espacial en Convex); hacen falta fixtures de CI; el release del happy-path público **depende** de que exista cobertura territorial — coherente con BE-0.6.

## Relación con el código

No cambia este ADR: `convex/schema.ts`, `convex/reportes.ts`, `e2e/reportar.spec.ts`. La implementación de PIP es trabajo posterior (FASES A–B).
