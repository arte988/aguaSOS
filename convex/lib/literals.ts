import { v } from "convex/values";

export const tipoZonaValidator = v.union(
  v.literal("departamento"),
  v.literal("municipio"),
  v.literal("distrito"),
);

export type TipoZona = "departamento" | "municipio" | "distrito";

export const rolUsuarioValidator = v.union(
  v.literal("miembro"),
  v.literal("consumidor"),
  v.literal("suministrador"),
  v.literal("admin"),
);

export const tipoOrganizacionValidator = v.union(
  v.literal("universidad"),
  v.literal("ong_humanitaria"),
  v.literal("ong_otra"),
  v.literal("gobierno"),
  v.literal("cuerpo_socorro"),
);

export const estadoVerificacionValidator = v.union(
  v.literal("pendiente"),
  v.literal("aprobado"),
  v.literal("rechazado"),
);

export type RolUsuario = "miembro" | "consumidor" | "suministrador" | "admin";
