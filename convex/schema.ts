import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  estadoVerificacionValidator,
  rolUsuarioValidator,
  tipoOrganizacionValidator,
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
