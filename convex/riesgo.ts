import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { recalcularRiesgoZona } from "./lib/recalcularRiesgoZona";
import { nivelRiesgoValidator } from "./lib/literals";

const riesgoPublicoValidator = v.object({
  _id: v.id("riesgoZona"),
  _creationTime: v.number(),
  zonaId: v.id("zonas"),
  riesgo: v.number(),
  reportesActivos: v.number(),
  personasAfectadas: v.number(),
  nivel: nivelRiesgoValidator,
  calculadoEn: v.number(),
});

export const obtenerPorZona = query({
  args: { zonaId: v.id("zonas") },
  returns: v.union(riesgoPublicoValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("riesgoZona")
      .withIndex("by_zona", (q) => q.eq("zonaId", args.zonaId))
      .unique();
  },
});

/** Para cron futuro o pruebas. No muta reportes. */
export const recalcular = internalMutation({
  args: {
    zonaId: v.id("zonas"),
    ahora: v.number(),
  },
  returns: v.id("riesgoZona"),
  handler: async (ctx, args) => {
    return await recalcularRiesgoZona(ctx, args.zonaId, args.ahora);
  },
});
