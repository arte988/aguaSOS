import { v } from "convex/values";
import { ZONAS_CATALOGO } from "./catalogo/zonasCatalogo";
import { internalMutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { tipoZonaValidator } from "./lib/literals";

const zonaPublicaValidator = v.object({
  _id: v.id("zonas"),
  _creationTime: v.number(),
  tipo: tipoZonaValidator,
  nombre: v.string(),
  codigo: v.string(),
  padreId: v.optional(v.id("zonas")),
  centroideLat: v.number(),
  centroideLng: v.number(),
  poblacion: v.optional(v.number()),
});

export const listarPorTipo = query({
  args: { tipo: tipoZonaValidator },
  returns: v.array(zonaPublicaValidator),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("zonas")
      .withIndex("by_tipo", (q) => q.eq("tipo", args.tipo))
      .take(512);
  },
});

export const obtener = query({
  args: { zonaId: v.id("zonas") },
  returns: v.union(zonaPublicaValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get("zonas", args.zonaId);
  },
});

/**
 * Abstracción punto → distrito.
 *
 * No hay polígonos oficiales en el repo. Asignar el centroide más cercano
 * sería una frontera falsa. Hasta tener shapefiles ISDEM/DIGESTYC, esta
 * query no inventa un distritoId.
 */
export const buscarPorPunto = query({
  args: {
    lat: v.number(),
    lng: v.number(),
  },
  returns: v.object({
    distritoId: v.union(v.id("zonas"), v.null()),
    metodo: v.literal("no_disponible"),
    motivo: v.string(),
  }),
  handler: async () => {
    return {
      distritoId: null,
      metodo: "no_disponible" as const,
      motivo:
        "No hay geometrías de distrito en el proyecto. No se asigna distrito por centroide más cercano.",
    };
  },
});

export const seed = internalMutation({
  args: {},
  returns: v.object({
    inserted: v.number(),
    skipped: v.number(),
    catalogoVacio: v.boolean(),
  }),
  handler: async (ctx) => {
    if (ZONAS_CATALOGO.length === 0) {
      return { inserted: 0, skipped: 0, catalogoVacio: true };
    }

    const idsPorClave = new Map<string, Id<"zonas">>();
    let inserted = 0;
    let skipped = 0;

    for (const fila of ZONAS_CATALOGO) {
      const existente = await ctx.db
        .query("zonas")
        .withIndex("by_tipo_and_codigo", (q) =>
          q.eq("tipo", fila.tipo).eq("codigo", fila.codigo),
        )
        .unique();

      if (existente) {
        idsPorClave.set(`${fila.tipo}:${fila.codigo}`, existente._id);
        skipped += 1;
        continue;
      }

      if (fila.tipo === "departamento") {
        if (fila.codigoPadre !== null) {
          throw new Error(
            `Departamento ${fila.codigo} no debe tener codigoPadre`,
          );
        }
      } else if (!fila.codigoPadre) {
        throw new Error(`${fila.tipo} ${fila.codigo} requiere codigoPadre`);
      }

      let padreId: Id<"zonas"> | undefined;
      if (fila.codigoPadre) {
        const tipoPadre =
          fila.tipo === "municipio" ? "departamento" : "municipio";
        padreId =
          idsPorClave.get(`${tipoPadre}:${fila.codigoPadre}`) ??
          (
            await ctx.db
              .query("zonas")
              .withIndex("by_tipo_and_codigo", (q) =>
                q.eq("tipo", tipoPadre).eq("codigo", fila.codigoPadre!),
              )
              .unique()
          )?._id;
        if (!padreId) {
          throw new Error(
            `Padre ${tipoPadre}:${fila.codigoPadre} no existe para ${fila.codigo}`,
          );
        }
      }

      const id = await ctx.db.insert("zonas", {
        tipo: fila.tipo,
        nombre: fila.nombre,
        codigo: fila.codigo,
        ...(padreId ? { padreId } : {}),
        centroideLat: fila.centroideLat,
        centroideLng: fila.centroideLng,
        ...(fila.poblacion !== undefined ? { poblacion: fila.poblacion } : {}),
      });
      idsPorClave.set(`${fila.tipo}:${fila.codigo}`, id);
      inserted += 1;
    }

    return { inserted, skipped, catalogoVacio: false };
  },
});
