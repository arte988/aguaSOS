import type { Metadata } from "next";
import { ReportForm } from "@/components/ReportForm";

export const metadata: Metadata = {
  title: "Reportar emergencia",
};

export default function ReportPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-sky-950">
        Reportar emergencia
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Cuéntanos qué está pasando. Te daremos un código para dar seguimiento.
      </p>
      <div className="mt-8 rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-8">
        <ReportForm />
      </div>
    </main>
  );
}
