import type { TipoZona } from "../lib/literals";

/**
 * Catálogo oficial de zonas: 14 departamentos → municipios → distritos.
 *
 * Este archivo está vacío a propósito. El repo no incluye ISDEM/DIGESTYC,
 * GeoJSON ni centroides verificados. No se inventan coordenadas ni códigos.
 *
 * Cuando exista la fuente oficial, rellenar este arreglo (padres primero)
 * y volver a ejecutar `npx convex run internal.zonas.seed`.
 */
export type ZonaCatalogoFila = {
  tipo: TipoZona;
  nombre: string;
  codigo: string;
  codigoPadre: string | null;
  centroideLat: number;
  centroideLng: number;
  poblacion?: number;
};

export const ZONAS_CATALOGO: ZonaCatalogoFila[] = [];
