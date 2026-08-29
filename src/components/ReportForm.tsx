"use client";

import { useRouter } from "next/navigation";
import { FormEvent, type ReactNode, useState } from "react";
import {
  EMERGENCY_TYPES,
  generateCode,
  saveReport,
  type EmergencyType,
} from "@/lib/reports";

const INITIAL = {
  type: "sin_servicio" as EmergencyType,
  name: "",
  phone: "",
  municipality: "",
  neighborhood: "",
  address: "",
  description: "",
  peopleAffected: "1",
};

export function ReportForm() {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState("");

  function update(field: keyof typeof INITIAL, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const peopleAffected = Number(form.peopleAffected);

    if (
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.municipality.trim() ||
      !form.neighborhood.trim() ||
      !form.description.trim()
    ) {
      setError("Completa los campos obligatorios para enviar el reporte.");
      return;
    }

    if (!Number.isFinite(peopleAffected) || peopleAffected < 1) {
      setError("Indica al menos una persona afectada.");
      return;
    }

    const report = saveReport({
      id: crypto.randomUUID(),
      code: generateCode(),
      type: form.type,
      name: form.name.trim(),
      phone: form.phone.trim(),
      municipality: form.municipality.trim(),
      neighborhood: form.neighborhood.trim(),
      address: form.address.trim(),
      description: form.description.trim(),
      peopleAffected,
      createdAt: new Date().toISOString(),
      status: "recibido",
    });

    router.push(`/seguimiento?codigo=${report.code}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <fieldset className="grid gap-3">
        <legend className="mb-1 text-sm font-semibold text-sky-950">
          Tipo de emergencia
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {EMERGENCY_TYPES.map((type) => (
            <label
              key={type.id}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm ${
                form.type === type.id
                  ? "border-sky-600 bg-sky-50 text-sky-950"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <input
                type="radio"
                name="type"
                value={type.id}
                checked={form.type === type.id}
                onChange={() => update("type", type.id)}
                className="accent-sky-700"
              />
              {type.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tu nombre" required>
          <input
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            className="input"
            placeholder="Nombre y apellido"
          />
        </Field>
        <Field label="Teléfono" required>
          <input
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            className="input"
            placeholder="0000-0000"
            inputMode="tel"
          />
        </Field>
        <Field label="Municipio" required>
          <input
            value={form.municipality}
            onChange={(event) => update("municipality", event.target.value)}
            className="input"
            placeholder="Ej. San Salvador"
          />
        </Field>
        <Field label="Colonia o comunidad" required>
          <input
            value={form.neighborhood}
            onChange={(event) => update("neighborhood", event.target.value)}
            className="input"
            placeholder="Ej. Las Palmas"
          />
        </Field>
      </div>

      <Field label="Dirección o punto de referencia">
        <input
          value={form.address}
          onChange={(event) => update("address", event.target.value)}
          className="input"
          placeholder="Calle, pasaje o cerca de..."
        />
      </Field>

      <Field label="Personas afectadas" required>
        <input
          type="number"
          min={1}
          value={form.peopleAffected}
          onChange={(event) => update("peopleAffected", event.target.value)}
          className="input max-w-40"
        />
      </Field>

      <Field label="Describe lo que está pasando" required>
        <textarea
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          className="input min-h-32 resize-y"
          placeholder="Desde cuándo no hay agua, si hay fuga, olor, color, etc."
        />
      </Field>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-700 sm:w-auto"
      >
        Enviar reporte
      </button>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-sky-950">
        {label}
        {required ? <span className="text-rose-600"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
