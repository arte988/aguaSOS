import type { UserIdentity } from "convex/server";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { RolUsuario } from "./literals";

type Ctx = QueryCtx | MutationCtx;

export async function getIdentity(ctx: Ctx): Promise<UserIdentity | null> {
  return await ctx.auth.getUserIdentity();
}

export async function getCurrentUserOrNull(
  ctx: Ctx,
): Promise<Doc<"usuarios"> | null> {
  const identity = await getIdentity(ctx);
  if (!identity) {
    return null;
  }

  return await ctx.db
    .query("usuarios")
    .withIndex("by_clerk", (q) => q.eq("clerkUserId", identity.subject))
    .unique();
}

export async function getCurrentUser(ctx: Ctx): Promise<Doc<"usuarios">> {
  const user = await getCurrentUserOrNull(ctx);
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}

export async function getCurrentRol(ctx: Ctx): Promise<RolUsuario | null> {
  const user = await getCurrentUserOrNull(ctx);
  return user?.rol ?? null;
}

export async function requireRol(
  ctx: Ctx,
  roles: RolUsuario[],
): Promise<Doc<"usuarios">> {
  const user = await getCurrentUser(ctx);
  if (!roles.includes(user.rol)) {
    throw new Error("Unauthorized: rol insuficiente");
  }
  return user;
}
