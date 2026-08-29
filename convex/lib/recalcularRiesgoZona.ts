import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import {
  estaActivo,
  nivel,
  peso,
  riesgoZona as sumarPesos,
} from "../model/riesgo";
import { transicionarAlertas } from "./transicionarAlertas";

const MAX_REPORTES_DISTRITO = 512;

/**
 * Recalcula el agregado de un distrito.
 * Complejidad: O(R) lecturas del distrito (tope 512) + 1 upsert.
 * No usa agregaciones incrementales.
 *
 * personasAfectadas: Σ personasEst de reportes publicados y activos.
 * El modelo no escribe la ecuación; personasEst es el único conteo de personas.
 */
export async function recalcularRiesgoZona(
  ctx: MutationCtx,
  zonaId: Id<"zonas">,
  ahora: number,
) {
  const zona = await ctx.db.get("zonas", zonaId);
  if (!zona) {
    throw new Error("Zona no encontrada");
  }

  const reportes = await ctx.db
    .query("reportesEscasez")
    .withIndex("by_distrito", (q) => q.eq("distritoId", zonaId))
    .take(MAX_REPORTES_DISTRITO);

  const activos = reportes.filter((reporte) => {
    if (reporte.estado !== "publicado") {
      return false;
    }
    return estaActivo(peso(reporte.severidadBase, reporte._creationTime, ahora));
  });

  const pesos = activos.map((reporte) =>
    peso(reporte.severidadBase, reporte._creationTime, ahora),
  );
  const riesgo = sumarPesos(pesos);
  const personasAfectadas = activos.reduce(
    (acc, reporte) => acc + reporte.personasEst,
    0,
  );
  const fila = {
    zonaId,
    riesgo,
    reportesActivos: activos.length,
    personasAfectadas,
    nivel: nivel(riesgo, zona.poblacion ?? 0),
    calculadoEn: ahora,
  };

  const existente = await ctx.db
    .query("riesgoZona")
    .withIndex("by_zona", (q) => q.eq("zonaId", zonaId))
    .unique();

  let riesgoId: Id<"riesgoZona">;
  if (existente) {
    await ctx.db.patch("riesgoZona", existente._id, fila);
    riesgoId = existente._id;
  } else {
    riesgoId = await ctx.db.insert("riesgoZona", fila);
  }

  await transicionarAlertas(ctx, {
    zonaId,
    nivel: fila.nivel,
    riesgo: fila.riesgo,
    ahora,
  });

  return riesgoId;
}
