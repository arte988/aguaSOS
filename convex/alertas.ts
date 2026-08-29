import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";
import { nivelAlertaValidator } from "./lib/literals";

const alertaPublicaValidator = v.object({
  _id: v.id("alertasEmergencia"),
  _creationTime: v.number(),
  zonaId: v.id("zonas"),
  nivel: nivelAlertaValidator,
  riesgoAlAbrir: v.number(),
  cerradaEn: v.optional(v.number()),
  reconocidaPor: v.optional(v.id("usuarios")),
  reconocidaEn: v.optional(v.number()),
});

export const listarPorZona = query({
  args: { zonaId: v.id("zonas") },
  returns: v.array(alertaPublicaValidator),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("alertasEmergencia")
      .withIndex("by_zona", (q) => q.eq("zonaId", args.zonaId))
      .take(64);
  },
});

export const reconocer = mutation({
  args: { alertaId: v.id("alertasEmergencia") },
  returns: v.id("alertasEmergencia"),
  handler: async (ctx, args) => {
    const usuario = await getCurrentUser(ctx);
    const alerta = await ctx.db.get("alertasEmergencia", args.alertaId);
    if (!alerta) {
      throw new Error("Alerta no encontrada");
    }
    if (alerta.reconocidaPor !== undefined) {
      return alerta._id;
    }
    await ctx.db.patch("alertasEmergencia", args.alertaId, {
      reconocidaPor: usuario._id,
      reconocidaEn: Date.now(),
    });
    return args.alertaId;
  },
});
