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

export const personasRangoValidator = v.union(
  v.literal("1-5"),
  v.literal("6-20"),
  v.literal("21-100"),
  v.literal("101-500"),
  v.literal("500+"),
);

export const impactoEspacialValidator = v.union(
  v.literal("casa"),
  v.literal("pasaje"),
  v.literal("comunidad"),
);

export const estadoReporteValidator = v.union(
  v.literal("publicado"),
  v.literal("oculto"),
  v.literal("rechazado"),
);

export const afectacionSiembraValidator = v.object({
  tipo: v.literal("siembra"),
  cultivo: v.string(),
  hectareas: v.number(),
  porcentajePerdida: v.number(),
});

export const afectacionOtraValidator = v.object({
  tipo: v.literal("otra"),
  descripcion: v.string(),
});

export const afectacionEconomicaValidator = v.union(
  afectacionSiembraValidator,
  afectacionOtraValidator,
);

export type PersonasRango =
  | "1-5"
  | "6-20"
  | "21-100"
  | "101-500"
  | "500+";

export type ImpactoEspacial = "casa" | "pasaje" | "comunidad";

export type AfectacionEconomica =
  | {
      tipo: "siembra";
      cultivo: string;
      hectareas: number;
      porcentajePerdida: number;
    }
  | { tipo: "otra"; descripcion: string };

export const tipoSuministroValidator = v.union(
  v.literal("embotellada"),
  v.literal("pozo"),
  v.literal("nacimiento"),
  v.literal("tanque"),
  v.literal("donacion"),
);

export const nivelRiesgoValidator = v.union(
  v.literal("normal"),
  v.literal("vigilancia"),
  v.literal("emergencia"),
);

export type NivelRiesgo = "normal" | "vigilancia" | "emergencia";

export const nivelAlertaValidator = v.union(
  v.literal("vigilancia"),
  v.literal("emergencia"),
);

export type NivelAlerta = "vigilancia" | "emergencia";

export type TipoSuministro =
  | "embotellada"
  | "pozo"
  | "nacimiento"
  | "tanque"
  | "donacion";
