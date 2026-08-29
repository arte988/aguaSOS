import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { getCurrentUser } from "./lib/auth";
import {
  generarToken,
  prefijoDeToken,
  sha256Hex,
} from "./lib/apiKeyCrypto";

function puedeEmitirApiKey(usuario: Doc<"usuarios">): boolean {
  if (usuario.rol === "admin") {
    return true;
  }
  return (
    usuario.rol === "consumidor" && usuario.estadoVerificacion === "aprobado"
  );
}

const clavePublicaValidator = v.object({
  _id: v.id("apiKeys"),
  _creationTime: v.number(),
  propietarioId: v.id("usuarios"),
  nombre: v.string(),
  prefijo: v.string(),
  ultimoUso: v.optional(v.number()),
  revocadaEn: v.optional(v.number()),
});

export const crear = mutation({
  args: { nombre: v.string() },
  returns: v.object({
    apiKeyId: v.id("apiKeys"),
    token: v.string(),
    prefijo: v.string(),
  }),
  handler: async (ctx, args) => {
    const usuario = await getCurrentUser(ctx);
    if (!puedeEmitirApiKey(usuario)) {
      throw new Error("Unauthorized: solo consumidor aprobado o admin");
    }

    const nombre = args.nombre.trim();
    if (nombre.length === 0) {
      throw new Error("nombre inválido");
    }

    for (let intento = 0; intento < 3; intento += 1) {
      const token = generarToken();
      const hash = await sha256Hex(token);
      const choque = await ctx.db
        .query("apiKeys")
        .withIndex("by_hash", (q) => q.eq("hash", hash))
        .unique();
      if (choque) {
        continue;
      }

      const prefijo = prefijoDeToken(token);
      const apiKeyId = await ctx.db.insert("apiKeys", {
        propietarioId: usuario._id,
        nombre,
        hash,
        prefijo,
      });

      return { apiKeyId, token, prefijo };
    }

    throw new Error("No se pudo generar un hash único");
  },
});

export const listarMias = query({
  args: {},
  returns: v.array(clavePublicaValidator),
  handler: async (ctx) => {
    const usuario = await getCurrentUser(ctx);
    const filas = await ctx.db
      .query("apiKeys")
      .withIndex("by_propietario", (q) => q.eq("propietarioId", usuario._id))
      .take(64);
    return filas.map((fila) => ({
      _id: fila._id,
      _creationTime: fila._creationTime,
      propietarioId: fila.propietarioId,
      nombre: fila.nombre,
      prefijo: fila.prefijo,
      ...(fila.ultimoUso !== undefined ? { ultimoUso: fila.ultimoUso } : {}),
      ...(fila.revocadaEn !== undefined ? { revocadaEn: fila.revocadaEn } : {}),
    }));
  },
});

export const revocar = mutation({
  args: { apiKeyId: v.id("apiKeys") },
  returns: v.id("apiKeys"),
  handler: async (ctx, args) => {
    const usuario = await getCurrentUser(ctx);
    const clave = await ctx.db.get("apiKeys", args.apiKeyId);
    if (!clave) {
      throw new Error("API key no encontrada");
    }
    if (clave.propietarioId !== usuario._id && usuario.rol !== "admin") {
      throw new Error("Unauthorized");
    }
    if (clave.revocadaEn !== undefined) {
      return clave._id;
    }
    await ctx.db.patch("apiKeys", args.apiKeyId, { revocadaEn: Date.now() });
    return args.apiKeyId;
  },
});

export const validar = mutation({
  args: { token: v.string() },
  returns: v.object({
    apiKeyId: v.id("apiKeys"),
    propietarioId: v.id("usuarios"),
    nombre: v.string(),
  }),
  handler: async (ctx, args) => {
    if (args.token.trim().length === 0) {
      throw new Error("API key inválida");
    }

    const hash = await sha256Hex(args.token);
    const clave = await ctx.db
      .query("apiKeys")
      .withIndex("by_hash", (q) => q.eq("hash", hash))
      .unique();

    if (!clave) {
      throw new Error("API key inválida");
    }
    if (clave.revocadaEn !== undefined) {
      throw new Error("API key revocada");
    }

    await ctx.db.patch("apiKeys", clave._id, { ultimoUso: Date.now() });
    return {
      apiKeyId: clave._id,
      propietarioId: clave.propietarioId,
      nombre: clave.nombre,
    };
  },
});
