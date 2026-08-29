import type { Metadata } from "next";
import { AlertsList } from "@/components/AlertsList";

export const metadata: Metadata = {
  title: "Alertas",
};

export default function AlertsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-sky-950">
        Alertas activas
      </h1>
      <p className="mt-2 text-slate-600">
        Reportes recientes de cortes, fugas y otras emergencias de agua.
      </p>
      <div className="mt-8">
        <AlertsList />
      </div>
    </main>
  );
}
