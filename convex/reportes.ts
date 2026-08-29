import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getCurrentUserOrNull } from "./lib/auth";
import {
  afectacionEconomicaValidator,
  impactoEspacialValidator,
  estadoReporteValidator,
  personasRangoValidator,
} from "./lib/literals";
import { cargarDistrito, resolverDistritoPorPunto } from "./lib/resolverDistrito";
import {
  validarAfectacion,
  validarCanton,
  validarClaveIdempotencia,
  validarCoordenadas,
  validarEscasezDesde,
  validarMenores,
  validarPrecision,
} from "./lib/validarReporte";
import { recalcularRiesgoZona } from "./lib/recalcularRiesgoZona";
import { personasEstDesdeRango } from "./model/personasEst";
import { estaActivo, peso, severidadBase } from "./model/riesgo";

const crearArgs = {
  claveIdempotencia: v.string(),
  lat: v.number(),
  lng: v.number(),
  precisionM: v.optional(v.number()),
  canton: v.optional(v.string()),
  escasezDesde: v.number(),
  personasRango: personasRangoValidator,
  menores: v.number(),
  impacto: impactoEspacialValidator,
  afectacionEconomica: v.array(afectacionEconomicaValidator),
  distritoId: v.optional(v.id("zonas")),
};

const resultadoCrearValidator = v.object({
  reporteId: v.id("reportesEscasez"),
  distrito: v.optional(v.object({ nombre: v.string() })),
  fuentesCercanas: v.optional(
    v.array(
      v.object({
        nombreLugar: v.string(),
        tiposSuministro: v.array(v.string()),
        tieneTransporte: v.boolean(),
        contactoTelefono: v.string(),
        distanciaKm: v.number(),
        disponible: v.optional(v.boolean()),
      }),
    ),
  ),
});

async function resolverDistritoFinal(
  ctx: Parameters<typeof cargarDistrito>[0],
  args: { lat: number; lng: number; distritoId?: Id<"zonas"> },
) {
  const porPunto = resolverDistritoPorPunto();

  if (args.distritoId) {
    const zona = await cargarDistrito(ctx, args.distritoId);
    if (porPunto.distritoId && porPunto.distritoId !== args.distritoId) {
      throw new Error("distritoId no corresponde al punto");
    }
    return zona;
  }

  if (!porPunto.distritoId) {
    throw new Error(porPunto.motivo);
  }

  return await cargarDistrito(ctx, porPunto.distritoId);
}

export const crear = mutation({
  args: crearArgs,
  returns: resultadoCrearValidator,
  handler: async (ctx, args) => {
    const ahora = Date.now();
    validarClaveIdempotencia(args.claveIdempotencia);
    validarCoordenadas(args.lat, args.lng);
    validarPrecision(args.precisionM);
    validarCanton(args.canton);
    validarEscasezDesde(args.escasezDesde, ahora);
    validarAfectacion(args.afectacionEconomica);

    const personasEst = personasEstDesdeRango(args.personasRango);
    validarMenores(args.menores, personasEst);

    const existente = await ctx.db
      .query("reportesEscasez")
      .withIndex("by_idempotencia", (q) =>
        q.eq("claveIdempotencia", args.claveIdempotencia),
      )
      .unique();

    if (existente) {
      const distrito = await cargarDistrito(ctx, existente.distritoId);
      return {
        reporteId: existente._id,
        distrito: { nombre: distrito.nombre },
        fuentesCercanas: [],
      };
    }

    const distrito = await resolverDistritoFinal(ctx, args);
    const autor = await getCurrentUserOrNull(ctx);
    const severidad = severidadBase({
      impacto: args.impacto,
      personasEst,
      menores: args.menores,
      afectacionEconomica: args.afectacionEconomica,
    });

    const reporteId = await ctx.db.insert("reportesEscasez", {
      ...(autor ? { autorId: autor._id } : {}),
      claveIdempotencia: args.claveIdempotencia,
      escasezDesde: args.escasezDesde,
      lat: args.lat,
      lng: args.lng,
      ...(args.precisionM !== undefined ? { precisionM: args.precisionM } : {}),
      distritoId: distrito._id,
      ...(args.canton ? { canton: args.canton.trim() } : {}),
      personasRango: args.personasRango,
      personasEst,
      menores: args.menores,
      impacto: args.impacto,
      afectacionEconomica: args.afectacionEconomica,
      severidadBase: severidad,
      estado: "publicado",
    });

    await recalcularRiesgoZona(ctx, distrito._id, ahora);

    return {
      reporteId,
      distrito: { nombre: distrito.nombre },
      fuentesCercanas: [],
    };
  },
});

export const obtener = query({
  args: {
    reporteId: v.id("reportesEscasez"),
    ahora: v.number(),
  },
  returns: v.union(
    v.object({
      _id: v.id("reportesEscasez"),
      _creationTime: v.number(),
      autorId: v.optional(v.id("usuarios")),
      claveIdempotencia: v.string(),
      escasezDesde: v.number(),
      lat: v.number(),
      lng: v.number(),
      precisionM: v.optional(v.number()),
      distritoId: v.id("zonas"),
      canton: v.optional(v.string()),
      personasRango: personasRangoValidator,
      personasEst: v.number(),
      menores: v.number(),
      impacto: impactoEspacialValidator,
      afectacionEconomica: v.array(afectacionEconomicaValidator),
      severidadBase: v.number(),
      estado: estadoReporteValidator,
      peso: v.number(),
      activo: v.boolean(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const fila = await ctx.db.get("reportesEscasez", args.reporteId);
    if (!fila) {
      return null;
    }
    const p = peso(fila.severidadBase, fila._creationTime, args.ahora);
    return {
      ...fila,
      peso: p,
      activo: estaActivo(p),
    };
  },
});
