import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import type { NivelAlerta, NivelRiesgo } from "./literals";

function esNivelAlerta(nivel: NivelRiesgo): nivel is NivelAlerta {
  return nivel === "vigilancia" || nivel === "emergencia";
}

async function alertasAbiertasDeZona(
  ctx: MutationCtx,
  zonaId: Id<"zonas">,
) {
  const filas = await ctx.db
    .query("alertasEmergencia")
    .withIndex("by_zona", (q) => q.eq("zonaId", zonaId))
    .take(64);
  return filas.filter((fila) => fila.cerradaEn === undefined);
}

async function cerrar(
  ctx: MutationCtx,
  alertaId: Id<"alertasEmergencia">,
  ahora: number,
) {
  await ctx.db.patch("alertasEmergencia", alertaId, { cerradaEn: ahora });
}

/**
 * Historial de transiciones. No borra filas.
 * Una sola alerta abierta por zona+nivel.
 */
export async function transicionarAlertas(
  ctx: MutationCtx,
  args: {
    zonaId: Id<"zonas">;
    nivel: NivelRiesgo;
    riesgo: number;
    ahora: number;
  },
) {
  const abiertas = await alertasAbiertasDeZona(ctx, args.zonaId);
  const objetivo = esNivelAlerta(args.nivel) ? args.nivel : null;

  for (const abierta of abiertas) {
    if (objetivo === null || abierta.nivel !== objetivo) {
      await cerrar(ctx, abierta._id, args.ahora);
    }
  }

  if (objetivo === null) {
    return;
  }

  const yaAbierta = abiertas.some(
    (abierta) =>
      abierta.nivel === objetivo && abierta.cerradaEn === undefined,
  );
  if (yaAbierta) {
    return;
  }

  await ctx.db.insert("alertasEmergencia", {
    zonaId: args.zonaId,
    nivel: objetivo,
    riesgoAlAbrir: args.riesgo,
  });
}
