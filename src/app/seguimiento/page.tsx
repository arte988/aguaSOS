import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackReport } from "@/components/TrackReport";

export const metadata: Metadata = {
  title: "Seguimiento",
};

export default function TrackingPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-sky-950">
        Seguimiento de reporte
      </h1>
      <p className="mt-2 text-slate-600">
        Ingresa el código que recibiste al enviar tu emergencia, por ejemplo SOS-A7K2.
      </p>
      <div className="mt-8 rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-8">
        <Suspense fallback={<p className="text-sm text-slate-500">Cargando…</p>}>
          <TrackReport />
        </Suspense>
      </div>
    </main>
  );
}
