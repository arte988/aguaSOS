import { Suspense } from "react";
import { MapaFuentesPublico } from "@/components/mapa/MapaFuentesPublico";

export default function MapaPage() {
  return (
    <div className="absolute inset-0 min-h-0 w-full">
      <Suspense
        fallback={
          <div className="grid h-full min-h-80 w-full place-items-center bg-sky-50 text-sm text-sky-900">
            Cargando mapa…
          </div>
        }
      >
        <MapaFuentesPublico />
      </Suspense>
    </div>
  );
}
