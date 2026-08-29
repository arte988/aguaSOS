import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { cargarDistrito } from "./lib/resolverDistrito";
import { validarCoordenadas } from "./lib/validarReporte";
import { tipoSuministroValidator } from "./lib/literals";
import { cajaAlrededor, haversineKm } from "./model/geo";

const MAX_CERCANAS = 3;
const RADIO_CAJA_KM = 100;
const MAX_CANDIDATOS_BANDA = 512;

const fuenteCercanaValidator = v.object({
  nombreLugar: v.string(),
  tiposSuministro: v.array(tipoSuministroValidator),
  tieneTransporte: v.boolean(),
  contactoTelefono: v.string(),
  distanciaKm: v.number(),
  disponible: v.optional(v.boolean()),
});

/**
 * Más cercanas por haversine dentro de una caja ~100 km.
 * Índice `by_lat` + filtro de lng/disponible en memoria.
 * Techo: si hay >512 filas en la banda de latitud, pueden quedar fuera
 * candidatas. A escala El Salvador no ocurre. Sin índice geoespacial.
 */
export const masCercanas = query({
  args: {
    lat: v.number(),
    lng: v.number(),
    n: v.optional(v.number()),
  },
  returns: v.array(fuenteCercanaValidator),
  handler: async (ctx, args) => {
    validarCoordenadas(args.lat, args.lng);
    const limite = Math.min(
      MAX_CERCANAS,
      Math.max(1, Math.floor(args.n ?? MAX_CERCANAS)),
    );

    const caja = cajaAlrededor(args.lat, args.lng, RADIO_CAJA_KM);
    const banda = await ctx.db
      .query("fuentesSuministro")
      .withIndex("by_lat", (q) =>
        q.gte("lat", caja.sur).lte("lat", caja.norte),
      )
      .take(MAX_CANDIDATOS_BANDA);

    const origen = { lat: args.lat, lng: args.lng };
    const candidatas = banda.filter(
      (fuente) =>
        fuente.disponible &&
        fuente.lng >= caja.oeste &&
        fuente.lng <= caja.este &&
        fuente.tiposSuministro.length >= 1,
    );

    const ranqueadas = candidatas
      .map((fuente) => ({
        nombreLugar: fuente.nombreLugar,
        tiposSuministro: fuente.tiposSuministro,
        tieneTransporte: fuente.tieneTransporte,
        contactoTelefono: fuente.contactoTelefono,
        distanciaKm:
          Math.round(
            haversineKm(origen, { lat: fuente.lat, lng: fuente.lng }) * 10,
          ) / 10,
        disponible: fuente.disponible,
      }))
      .sort((a, b) => a.distanciaKm - b.distanciaKm);

    return ranqueadas.slice(0, limite);
  },
});

export const insertar = internalMutation({
  args: {
    propietarioId: v.id("usuarios"),
    nombreLugar: v.string(),
    lat: v.number(),
    lng: v.number(),
    distritoId: v.id("zonas"),
    canton: v.optional(v.string()),
    tiposSuministro: v.array(tipoSuministroValidator),
    tieneTransporte: v.boolean(),
    contactoNombre: v.string(),
    contactoTelefono: v.string(),
    contactoEmail: v.optional(v.string()),
    disponible: v.boolean(),
    verificada: v.boolean(),
  },
  returns: v.id("fuentesSuministro"),
  handler: async (ctx, args) => {
    validarCoordenadas(args.lat, args.lng);
    if (args.tiposSuministro.length < 1) {
      throw new Error("tiposSuministro requiere al menos un tipo");
    }
    await cargarDistrito(ctx, args.distritoId);
    const propietario = await ctx.db.get("usuarios", args.propietarioId);
    if (!propietario) {
      throw new Error("Propietario no encontrado");
    }

    return await ctx.db.insert("fuentesSuministro", {
      propietarioId: args.propietarioId,
      nombreLugar: args.nombreLugar,
      lat: args.lat,
      lng: args.lng,
      distritoId: args.distritoId,
      ...(args.canton ? { canton: args.canton } : {}),
      tiposSuministro: args.tiposSuministro,
      tieneTransporte: args.tieneTransporte,
      contactoNombre: args.contactoNombre,
      contactoTelefono: args.contactoTelefono,
      ...(args.contactoEmail ? { contactoEmail: args.contactoEmail } : {}),
      disponible: args.disponible,
      verificada: args.verificada,
    });
  },
});
