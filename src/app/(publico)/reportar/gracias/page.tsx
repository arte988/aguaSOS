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
  const lat = Number(latCrudo);
  const lng = Number(lngCrudo);
  const puntoValido = Number.isFinite(lat) && Number.isFinite(lng);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-wide text-sky-700 dark:text-sky-300">
          Reporte enviado
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-sky-950 dark:text-sky-50">
          Gracias. Ya quedó registrado.
        </h1>
        <p className="text-base leading-7 text-zinc-700 dark:text-zinc-300">
          Estos son los suministradores más cercanos. El botón llama directo.
        </p>
      </header>

      {puntoValido ? (
        <FuentesCercanas lat={lat} lng={lng} />
      ) : (
        <p className="text-base text-zinc-700 dark:text-zinc-300">
          No recibimos el punto del reporte. Volvé a enviarlo desde el formulario.
        </p>
      )}

      <Link
        href="/reportar"
        className="inline-flex min-h-11 items-center justify-center text-base font-semibold text-sky-800 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 dark:text-sky-300"
      >
        Enviar otro reporte
      </Link>
    </main>
  );
}
