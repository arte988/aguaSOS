"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Chip } from "@/components/ui/Chip";
import {
  borrarBorrador,
  leerBorradorCliente,
  leerBorradorServidor,
  parchearBorrador,
  suscribirBorrador,
} from "../_lib/borrador";
import { CLASE_INPUT } from "../_lib/clases";
import { IMPACTOS, RANGOS_PERSONAS } from "../_lib/constantes";
import { hoyLocalYmd, ymdAEpochMsLocal } from "../_lib/fechas";
import { puntoListo } from "../_lib/tipos";
import { useEnviarReporte } from "../_lib/useEnviarReporte";
import {
  ENLACES_ERROR,
  ORDEN_ERRORES,
  mapearAfectacion,
  parsearMenores,
  validarBorrador,
  type CampoError,
  type ErroresFormulario,
} from "../_lib/validar";
import { TarjetaPregunta } from "./TarjetaPregunta";
import { Ubicacion } from "./Ubicacion";

function quitarError(errores: ErroresFormulario, campo: CampoError): ErroresFormulario {
  if (!(campo in errores)) return errores;
  const siguiente = { ...errores };
  delete siguiente[campo];
  return siguiente;
}

export function FormularioReporte() {
  const router = useRouter();
  const enviar = useEnviarReporte();
  const resumenRef = useRef<HTMLDivElement>(null);
  const enfocarResumen = useRef(false);
  const borrador = useSyncExternalStore(
    suscribirBorrador,
    leerBorradorCliente,
    leerBorradorServidor,
  );
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<ErroresFormulario>({});
  const [errorRed, setErrorRed] = useState<string | null>(null);

  const camposConError = ORDEN_ERRORES.filter((campo) => errores[campo]);

  useEffect(() => {
    if (!enfocarResumen.current || camposConError.length === 0) return;
    enfocarResumen.current = false;
    resumenRef.current?.focus();
  }, [camposConError.length]);

  function limpiar(campo: CampoError) {
    setErrores((actual) => quitarError(actual, campo));
  }

  function validarMenores(crudo: string) {
    if (parsearMenores(crudo) === null) {
      setErrores((actual) => ({ ...actual, menores: ENLACES_ERROR.menores.texto }));
      return;
    }
    limpiar("menores");
  }

  function validarFecha(crudo: string) {
    if (!crudo) {
      setErrores((actual) => ({ ...actual, escasezDesde: ENLACES_ERROR.escasezDesde.texto }));
      return;
    }
    try {
      ymdAEpochMsLocal(crudo);
      limpiar("escasezDesde");
    } catch {
      setErrores((actual) => ({ ...actual, escasezDesde: "Indicá una fecha válida." }));
    }
  }

  async function onSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErrorRed(null);

    const encontrados = validarBorrador(borrador);
    if (Object.keys(encontrados).length > 0) {
      enfocarResumen.current = true;
      setErrores(encontrados);
      return;
    }

    const { punto, personasRango, impacto, escasezDesde, menores, canton, afectacion, claveIdempotencia } =
      borrador;
    if (!puntoListo(punto) || !personasRango || !impacto) return;

    const menoresNumero = parsearMenores(menores);
    if (menoresNumero === null) return;

    setEnviando(true);
    try {
      const resultado = await enviar({
        claveIdempotencia,
        lat: punto.lat,
        lng: punto.lng,
        ...(punto.precisionM !== undefined ? { precisionM: punto.precisionM } : {}),
        ...(canton.trim() ? { canton: canton.trim() } : {}),
        escasezDesde: ymdAEpochMsLocal(escasezDesde),
        personasRango,
        menores: menoresNumero,
        impacto,
        afectacionEconomica: mapearAfectacion(afectacion),
      });

      borrarBorrador();

      const params = new URLSearchParams({
        lat: String(punto.lat),
        lng: String(punto.lng),
        reporteId: resultado.reporteId,
      });
      router.push(`/reportar/gracias?${params.toString()}`);
    } catch (err) {
      setErrorRed(
        err instanceof Error
          ? err.message
          : "No se pudo enviar el reporte. Revisá la conexión e intentá de nuevo.",
      );
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      {camposConError.length > 0 ? (
        <div
          ref={resumenRef}
          role="alert"
          tabIndex={-1}
          aria-labelledby="resumen-error-titulo"
          className="rounded-2xl border border-sequia/30 bg-papel p-4 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sequia"
        >
          <h2 id="resumen-error-titulo" className="text-lg font-semibold text-sequia">
            Hay un problema
          </h2>
          <ul className="mt-2 flex flex-col gap-1">
            {camposConError.map((campo) => (
              <li key={campo}>
                <a
                  href={ENLACES_ERROR[campo].href}
                  className="text-base text-sequia underline-offset-4 hover:underline"
                >
                  {errores[campo]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div aria-live="polite" aria-atomic="true" className="min-h-0">
        {errorRed ? (
          <p className="rounded-2xl border border-sequia/30 bg-papel p-4 text-base text-sequia">
            {errorRed} Revisá la conexión e intentá de nuevo con el mismo botón.
          </p>
        ) : null}
      </div>

      <TarjetaPregunta id="ubicacion" respondida={puntoListo(borrador.punto)}>
        <Ubicacion
          valor={borrador.punto}
          error={errores.punto}
          onChange={(punto) => {
            parchearBorrador({ punto });
            if (puntoListo(punto)) limpiar("punto");
          }}
        />
      </TarjetaPregunta>

      <TarjetaPregunta id="personas" respondida={Boolean(borrador.personasRango)}>
        <fieldset>
          <legend className="mb-3 text-xl font-semibold text-pozo">
            ¿Cuántas personas están sin agua?
          </legend>
          <div className="flex flex-wrap gap-2">
            {RANGOS_PERSONAS.map((rango) => {
              const seleccionado = borrador.personasRango === rango.valor;
              return (
                <Chip
                  key={rango.valor}
                  seleccionado={seleccionado}
                  aria-pressed={seleccionado}
                  onClick={() => {
                    parchearBorrador({ personasRango: rango.valor });
                    limpiar("personas");
                  }}
                >
                  {rango.etiqueta}
                </Chip>
              );
            })}
          </div>
          {errores.personas ? (
            <p id="personas-error" className="mt-2 text-sm text-sequia" role="alert">
              {errores.personas}
            </p>
          ) : null}
        </fieldset>
      </TarjetaPregunta>

      <TarjetaPregunta respondida={parsearMenores(borrador.menores) !== null}>
        <Campo
          id="menores"
          label="¿Cuántos son niños o niñas?"
          pista="Si no hay menores, dejalo en 0."
          error={errores.menores}
        >
          <input
            name="menores"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            required
            aria-invalid={Boolean(errores.menores)}
            value={borrador.menores}
            onChange={(evento) => {
              const valor = evento.target.value;
              parchearBorrador({ menores: valor });
              if (parsearMenores(valor) !== null) limpiar("menores");
            }}
            onBlur={(evento) => validarMenores(evento.target.value)}
            className={CLASE_INPUT}
          />
        </Campo>
      </TarjetaPregunta>

      <TarjetaPregunta id="impacto" respondida={Boolean(borrador.impacto)}>
        <fieldset>
          <legend className="mb-3 text-xl font-semibold text-pozo">
            ¿A qué alcanza la falta de agua?
          </legend>
          <div className="flex flex-col gap-2">
            {IMPACTOS.map((opcion) => {
              const seleccionado = borrador.impacto === opcion.valor;
              return (
                <button
                  key={opcion.valor}
                  type="button"
                  aria-pressed={seleccionado}
                  onClick={() => {
                    parchearBorrador({ impacto: opcion.valor });
                    limpiar("impacto");
                  }}
                  className={`min-h-11 rounded-2xl px-4 py-3 text-left motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pozo ${
                    seleccionado
                      ? "border-l-4 border-l-pila bg-pozo text-white"
                      : "border border-pila bg-papel text-pozo"
                  }`}
                >
                  <span className="block text-base font-semibold">{opcion.etiqueta}</span>
                  <span
                    className={`block text-sm ${seleccionado ? "text-pila" : "text-foreground/70"}`}
                  >
                    {opcion.ejemplo}
                  </span>
                </button>
              );
            })}
          </div>
          {errores.impacto ? (
            <p id="impacto-error" className="mt-2 text-sm text-sequia" role="alert">
              {errores.impacto}
            </p>
          ) : null}
        </fieldset>
      </TarjetaPregunta>

      <TarjetaPregunta respondida={Boolean(borrador.escasezDesde)}>
        <Campo
          id="escasezDesde"
          label="¿Desde cuándo hay escasez?"
          error={errores.escasezDesde}
        >
          <input
            name="escasezDesde"
            type="date"
            required
            max={hoyLocalYmd()}
            aria-invalid={Boolean(errores.escasezDesde)}
            value={borrador.escasezDesde}
            onChange={(evento) => {
              const valor = evento.target.value;
              parchearBorrador({ escasezDesde: valor });
              if (valor) limpiar("escasezDesde");
            }}
            onBlur={(evento) => validarFecha(evento.target.value)}
            className={CLASE_INPUT}
          />
        </Campo>
      </TarjetaPregunta>

      <TarjetaPregunta respondida={Boolean(borrador.canton.trim())}>
        <Campo
          id="canton"
          label="Cantón o colonia (opcional)"
          pista="Texto libre. No hace falta que coincida con un catálogo."
        >
          <input
            name="canton"
            type="text"
            autoComplete="address-level3"
            value={borrador.canton}
            onChange={(evento) => parchearBorrador({ canton: evento.target.value })}
            className={CLASE_INPUT}
          />
        </Campo>
      </TarjetaPregunta>

      <TarjetaPregunta respondida={Boolean(borrador.afectacion.trim())}>
        <Campo
          id="afectacion"
          label="Afectación económica (opcional)"
          pista="Si se perdió siembra u otro ingreso, describilo. Si no, dejalo vacío."
        >
          <textarea
            name="afectacion"
            rows={3}
            value={borrador.afectacion}
            onChange={(evento) => parchearBorrador({ afectacion: evento.target.value })}
            className={`${CLASE_INPUT} py-2`}
          />
        </Campo>
      </TarjetaPregunta>

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-pila bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm motion-reduce:transition-none">
        <Boton type="submit" disabled={enviando} className="w-full motion-reduce:transition-none">
          {enviando ? "Enviando el reporte…" : "Enviar el reporte"}
        </Boton>
      </div>
    </form>
  );
}
