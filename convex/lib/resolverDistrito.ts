import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type Ctx = QueryCtx | MutationCtx;

export const DISTRITO_NO_DISPONIBLE = {
  distritoId: null,
  metodo: "no_disponible" as const,
  motivo:
    "No hay geometrías de distrito en el proyecto. No se asigna distrito por centroide más cercano.",
};

export function resolverDistritoPorPunto(): {
  distritoId: Id<"zonas"> | null;
  metodo: "no_disponible";
  motivo: string;
} {
  return DISTRITO_NO_DISPONIBLE;
}

export async function cargarDistrito(
  ctx: Ctx,
  distritoId: Id<"zonas">,
): Promise<Doc<"zonas">> {
  const zona = await ctx.db.get("zonas", distritoId);
  if (!zona) {
    throw new Error("Distrito no encontrado");
  }
  if (zona.tipo !== "distrito") {
    throw new Error("La zona no es un distrito");
  }
  return zona;
}
