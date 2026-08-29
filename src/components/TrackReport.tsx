"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  emergencyLabel,
  findReport,
  formatDate,
  type WaterReport,
} from "@/lib/reports";
import { StatusBadge } from "@/components/AlertsList";

export function TrackReport() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("codigo") ?? "";
  const [code, setCode] = useState(initialCode);
  const [report, setReport] = useState<WaterReport | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!initialCode) return;
    const found = findReport(initialCode);
    setReport(found ?? null);
    setSearched(true);
    setCode(initialCode);
  }, [initialCode]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReport(findReport(code) ?? null);
    setSearched(true);
  }

  return (
    <div className="space-y-6">
      {initialCode && report ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-900">
          <p className="font-semibold">Reporte enviado</p>
          <p className="mt-1 text-sm">
            Guarda tu código <span className="font-mono font-bold">{report.code}</span>{" "}
            para consultar el estado más tarde.
          </p>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className="input flex-1"
          placeholder="Ej. SOS-A7K2"
          aria-label="Código de reporte"
        />
        <button
          type="submit"
          className="rounded-full bg-sky-700 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-800"
        >
          Consultar
        </button>
      </form>

      {searched && report ? (
        <article className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-sm font-semibold text-sky-800">{report.code}</p>
              <h2 className="mt-1 text-xl font-semibold text-sky-950">
                {emergencyLabel(report.type)}
              </h2>
            </div>
            <StatusBadge status={report.status} />
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <Info label="Lugar" value={`${report.neighborhood}, ${report.municipality}`} />
            <Info label="Fecha" value={formatDate(report.createdAt)} />
            <Info label="Personas afectadas" value={String(report.peopleAffected)} />
            <Info label="Quien reportó" value={report.name} />
          </dl>
          <p className="mt-4 text-sm leading-6 text-slate-600">{report.description}</p>
        </article>
      ) : null}

      {searched && !report ? (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          No encontramos un reporte con ese código. Revisa que esté bien escrito.
        </p>
      ) : null}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 font-medium text-sky-950">{value}</dd>
    </div>
  );
}
