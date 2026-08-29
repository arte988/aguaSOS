import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  afectacionEconomicaValidator,
  estadoReporteValidator,
  estadoVerificacionValidator,
  impactoEspacialValidator,
  nivelAlertaValidator,
  nivelRiesgoValidator,
  personasRangoValidator,
  rolUsuarioValidator,
  tipoOrganizacionValidator,
  tipoSuministroValidator,
  tipoZonaValidator,
} from "./lib/literals";

export default defineSchema({
  usuarios: defineTable({
    clerkUserId: v.string(),
    rol: rolUsuarioValidator,
    nombre: v.string(),
    apellidos: v.optional(v.string()),
    email: v.string(),
    telefono: v.optional(v.string()),
    tipoOrganizacion: v.optional(tipoOrganizacionValidator),
    organizacion: v.optional(v.string()),
    estadoVerificacion: estadoVerificacionValidator,
  })
    .index("by_clerk", ["clerkUserId"])
    .index("by_rol_estado", ["rol", "estadoVerificacion"]),

  zonas: defineTable({
    tipo: tipoZonaValidator,
    nombre: v.string(),
    codigo: v.string(),
    padreId: v.optional(v.id("zonas")),
    centroideLat: v.number(),
    centroideLng: v.number(),
    poblacion: v.optional(v.number()),
  })
    .index("by_tipo", ["tipo"])
    .index("by_padre", ["padreId"])
    .index("by_codigo", ["codigo"])
    .index("by_tipo_and_codigo", ["tipo", "codigo"]),

  reportesEscasez: defineTable({
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
  })
    .index("by_idempotencia", ["claveIdempotencia"])
    .index("by_autor", ["autorId"])
    .index("by_distrito", ["distritoId"])
    .index("by_lat", ["lat"]),

  fuentesSuministro: defineTable({
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
  })
    .index("by_propietario", ["propietarioId"])
    .index("by_lat", ["lat"])
    .index("by_distrito", ["distritoId"]),

  riesgoZona: defineTable({
    zonaId: v.id("zonas"),
    riesgo: v.number(),
    reportesActivos: v.number(),
    personasAfectadas: v.number(),
    nivel: nivelRiesgoValidator,
    calculadoEn: v.number(),
  })
    .index("by_zona", ["zonaId"])
    .index("by_nivel", ["nivel"]),

  alertasEmergencia: defineTable({
    zonaId: v.id("zonas"),
    nivel: nivelAlertaValidator,
    riesgoAlAbrir: v.number(),
    cerradaEn: v.optional(v.number()),
    reconocidaPor: v.optional(v.id("usuarios")),
    reconocidaEn: v.optional(v.number()),
  })
    .index("by_zona", ["zonaId"])
    .index("by_cerradaEn", ["cerradaEn"]),

  apiKeys: defineTable({
    propietarioId: v.id("usuarios"),
    nombre: v.string(),
    hash: v.string(),
    prefijo: v.string(),
    ultimoUso: v.optional(v.number()),
    revocadaEn: v.optional(v.number()),
  })
    .index("by_hash", ["hash"])
    .index("by_propietario", ["propietarioId"]),

  waterReports: defineTable({
    title: v.string(),
    description: v.string(),
    kind: v.union(
      v.literal("outage"),
      v.literal("contamination"),
      v.literal("leak"),
      v.literal("flood"),
      v.literal("other")
    ),
    status: v.union(
      v.literal("open"),
      v.literal("acknowledged"),
      v.literal("resolved")
    ),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),
});
