import Link from "next/link";
import { FuentesCercanas } from "../_components/FuentesCercanas";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    lat?: string | string[];
    lng?: string | string[];
    reporteId?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const latCrudo = Array.isArray(params.lat) ? params.lat[0] : params.lat;
  const lngCrudo = Array.isArray(params.lng) ? params.lng[0] : params.lng;
  const folioCrudo = Array.isArray(params.reporteId) ? params.reporteId[0] : params.reporteId;
  const lat = Number(latCrudo);
  const lng = Number(lngCrudo);
  const puntoValido = Number.isFinite(lat) && Number.isFinite(lng);
  const folio = folioCrudo?.trim() || null;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8">
      {puntoValido ? (
        <FuentesCercanas lat={lat} lng={lng} />
      ) : (
        <p className="text-base text-foreground">
          No recibimos el punto del reporte. Volvé a enviarlo desde el formulario.
        </p>
      )}

      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-wide text-chorro">
          Reportar que no hay agua
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-pozo">
          Tu reporte quedó enviado
        </h1>
        {folio ? (
          <p className="font-mono text-base text-pozo">Folio {folio}</p>
        ) : null}
        <p className="text-base leading-7 text-foreground">
          Estos son los suministradores más cercanos. El botón llama directo.
        </p>
      </header>

      <Link
        href="/reportar"
        className="inline-flex min-h-11 items-center justify-center text-base font-semibold text-chorro underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pozo"
      >
        Enviar otro reporte
      </Link>
    </main>
  );
}
