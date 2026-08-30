/**
 * Contrato con Convex (dueño de convex/**). Preguntas bloqueantes:
 *
 * 1. ¿`zonas` está sembrada? Sin distritoId no entra ningún reporte.
 * 2. Firma exacta de `reportes.crear` y `fuentes.masCercanas`, y el
 *    NEXT_PUBLIC_CONVEX_URL del deployment compartido.
 * 3. ¿`personasEst` y `severidadBase` los deriva el servidor? Este cliente
 *    manda `personasRango` y no calcula esos campos.
 * 4. ¿Aceptan `claveIdempotencia` y `afectacionEconomica: []`?
 *
 * Convex rechaza argumentos que no estén en el validador: no se mandan
 * campos "por si acaso".
 */
import type { DatosReporte, FuenteCercana, ResultadoCrear } from "./tipos";

interface ClienteHttp {
  mutation: (nombre: string, args: Record<string, unknown>) => Promise<unknown>;
  query: (nombre: string, args: Record<string, unknown>) => Promise<unknown>;
}

function urlConvex(): string | null {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  return url && url.length > 0 ? url : null;
}

function esModuloAusente(error: unknown): boolean {
  const mensaje = error instanceof Error ? error.message : String(error);
  return /Cannot find module|MODULE_NOT_FOUND|Failed to fetch dynamically imported module|Failed to resolve module/i.test(
    mensaje,
  );
}

async function obtenerCliente(): Promise<ClienteHttp | null> {
  const url = urlConvex();
  if (!url) return null;

  try {
    const modulo = (await import(
      /* turbopackOptional: true */ "convex/browser"
    )) as {
      ConvexHttpClient: new (deploymentUrl: string) => ClienteHttp;
    };
    return new modulo.ConvexHttpClient(url);
  } catch (error) {
    if (esModuloAusente(error)) return null;
    throw error;
  }
}

function extraerResultadoCrear(resultado: unknown): ResultadoCrear {
  if (typeof resultado === "string") {
    return { reporteId: resultado };
  }
  if (resultado && typeof resultado === "object") {
    const cuerpo = resultado as {
      reporteId?: string;
      _id?: string;
      distrito?: { nombre: string };
      fuentesCercanas?: FuenteCercana[];
    };
    const reporteId = cuerpo.reporteId ?? cuerpo._id;
    if (typeof reporteId === "string") {
      return {
        reporteId,
        distrito: cuerpo.distrito,
        fuentesCercanas: cuerpo.fuentesCercanas,
      };
    }
  }
  throw new Error("Convex devolvió un resultado inesperado al crear el reporte");
}

export async function crearReporteEnConvex(
  datos: DatosReporte,
): Promise<ResultadoCrear> {
  const cliente = await obtenerCliente();
  if (!cliente) {
    throw new Error(
      "El servicio de reportes no está configurado. Falta NEXT_PUBLIC_CONVEX_URL.",
    );
  }

  const resultado = await cliente.mutation("reportes:crear", {
    claveIdempotencia: datos.claveIdempotencia,
    lat: datos.lat,
    lng: datos.lng,
    ...(datos.precisionM !== undefined ? { precisionM: datos.precisionM } : {}),
    ...(datos.canton ? { canton: datos.canton } : {}),
    escasezDesde: datos.escasezDesde,
    personasRango: datos.personasRango,
    menores: datos.menores,
    impacto: datos.impacto,
    afectacionEconomica: datos.afectacionEconomica,
  });

  return extraerResultadoCrear(resultado);
}

export async function fuentesCercanasEnConvex(args: {
  lat: number;
  lng: number;
}): Promise<FuenteCercana[] | null> {
  const cliente = await obtenerCliente();
  if (!cliente) return null;

  const resultado = await cliente.query("fuentes:masCercanas", {
    lat: args.lat,
    lng: args.lng,
    n: 3,
  });

  if (!Array.isArray(resultado)) {
    throw new Error("fuentes.masCercanas no devolvió una lista");
  }

  return resultado as FuenteCercana[];
}

export function convexEstaConfigurado(): boolean {
  return urlConvex() !== null;
}
