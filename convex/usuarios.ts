import { v } from "convex/values";
import type { UserIdentity } from "convex/server";
import type { MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import {
  getCurrentRol,
  getCurrentUserOrNull,
  getIdentity,
} from "./lib/auth";
import {
  estadoVerificacionValidator,
  rolUsuarioValidator,
  tipoOrganizacionValidator,
} from "./lib/literals";

const usuarioPublicoValidator = v.object({
  _id: v.id("usuarios"),
  _creationTime: v.number(),
  clerkUserId: v.string(),
  rol: rolUsuarioValidator,
  nombre: v.string(),
  apellidos: v.optional(v.string()),
  email: v.string(),
  telefono: v.optional(v.string()),
  tipoOrganizacion: v.optional(tipoOrganizacionValidator),
  organizacion: v.optional(v.string()),
  estadoVerificacion: estadoVerificacionValidator,
});

function perfilDesdeIdentity(identity: UserIdentity): {
  nombre: string;
  apellidos?: string;
  email: string;
} {
  const partes = (identity.name ?? "").trim().split(/\s+/).filter(Boolean);
  const email = identity.email ?? "";

  if (partes.length === 0) {
    return { nombre: "Usuario", email };
  }

  const [nombre, ...resto] = partes;
  return {
    nombre: nombre ?? "Usuario",
    ...(resto.length > 0 ? { apellidos: resto.join(" ") } : {}),
    email,
  };
}

async function upsertDesdeIdentity(ctx: MutationCtx, identity: UserIdentity) {
  const clerkUserId = identity.subject;
  const perfil = perfilDesdeIdentity(identity);

  const existente = await ctx.db
    .query("usuarios")
    .withIndex("by_clerk", (q) => q.eq("clerkUserId", clerkUserId))
    .unique();

  if (existente) {
    const patch: {
      nombre?: string;
      apellidos?: string;
      email?: string;
    } = {};

    if (identity.name?.trim()) {
      patch.nombre = perfil.nombre;
      if (perfil.apellidos !== undefined) {
        patch.apellidos = perfil.apellidos;
      }
    }
    if (identity.email) {
      patch.email = perfil.email;
    }

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch("usuarios", existente._id, patch);
    }

    return existente._id;
  }

  return await ctx.db.insert("usuarios", {
    clerkUserId,
    rol: "miembro",
    nombre: perfil.nombre,
    ...(perfil.apellidos !== undefined ? { apellidos: perfil.apellidos } : {}),
    email: perfil.email,
    estadoVerificacion: "aprobado",
  });
}

export const identidad = query({
  args: {},
  returns: v.union(
    v.object({
      subject: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    const identity = await getIdentity(ctx);
    if (!identity) {
      return null;
    }
    return { subject: identity.subject };
  },
});

export const yo = query({
  args: {},
  returns: v.union(usuarioPublicoValidator, v.null()),
  handler: async (ctx) => {
    return await getCurrentUserOrNull(ctx);
  },
});

export const rolActual = query({
  args: {},
  returns: v.union(rolUsuarioValidator, v.null()),
  handler: async (ctx) => {
    return await getCurrentRol(ctx);
  },
});

export const obtenerPorClerk = query({
  args: { clerkUserId: v.string() },
  returns: v.union(usuarioPublicoValidator, v.null()),
  handler: async (ctx, args) => {
    const identity = await getIdentity(ctx);
    if (!identity) {
      return null;
    }
    if (identity.subject !== args.clerkUserId) {
      throw new Error("Unauthorized: solo puedes leer tu propio perfil");
    }

    return await ctx.db
      .query("usuarios")
      .withIndex("by_clerk", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();
  },
});

export const sincronizar = mutation({
  args: {},
  returns: v.id("usuarios"),
  handler: async (ctx) => {
    const identity = await getIdentity(ctx);
    if (!identity) {
      throw new Error("Not authenticated");
    }
    return await upsertDesdeIdentity(ctx, identity);
  },
});
