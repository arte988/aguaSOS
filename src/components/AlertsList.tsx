"use client";

import { useEffect, useState } from "react";
import {
  STATUS_LABEL,
  emergencyLabel,
  formatDate,
  getAllReports,
  type WaterReport,
} from "@/lib/reports";

export function AlertsList() {
  const [reports, setReports] = useState<WaterReport[]>([]);

  useEffect(() => {
    setReports(getAllReports());
  }, []);

  if (reports.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-sky-200 bg-white px-5 py-10 text-center text-slate-600">
        Todavía no hay alertas. Sé el primero en reportar.
      </p>
    );
  }

  return (
    <ul className="grid gap-4">
      {reports.map((report) => (
        <li
          key={report.id}
          className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                {emergencyLabel(report.type)}
              </p>
              <h2 className="mt-1 text-lg font-semibold text-sky-950">
                {report.neighborhood}, {report.municipality}
              </h2>
            </div>
            <StatusBadge status={report.status} />
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{report.description}</p>
          <p className="mt-4 text-xs text-slate-500">
            {report.peopleAffected} personas afectadas · {formatDate(report.createdAt)} ·{" "}
            {report.code}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function StatusBadge({ status }: { status: WaterReport["status"] }) {
  const styles = {
    recibido: "bg-amber-50 text-amber-800",
    en_revision: "bg-sky-50 text-sky-800",
    atendido: "bg-emerald-50 text-emerald-800",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
