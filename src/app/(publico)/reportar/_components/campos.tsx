"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

interface CampoProps {
  id: string;
  label: string;
  pista?: string;
  error?: string;
  children: ReactNode;
}

export function Campo({ id, label, pista, error, children }: CampoProps) {
  const pistaId = pista ? `${id}-pista` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-base font-medium text-sky-950 dark:text-sky-100">
        {label}
      </label>
      {children}
      {pista ? (
        <p id={pistaId} className="text-sm text-zinc-600 dark:text-zinc-400">
          {pista}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: "primario" | "secundario";
}

export function Boton({
  variante = "primario",
  className = "",
  children,
  ...props
}: BotonProps) {
  const base =
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl px-4 text-base font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 disabled:cursor-not-allowed disabled:opacity-60";
  const estilos =
    variante === "primario"
      ? "bg-sky-800 text-white hover:bg-sky-900 dark:bg-sky-600 dark:hover:bg-sky-500"
      : "border border-sky-300 bg-white text-sky-900 hover:bg-sky-50 dark:border-sky-700 dark:bg-zinc-900 dark:text-sky-100 dark:hover:bg-zinc-800";

  return (
    <button type="button" className={`${base} ${estilos} ${className}`} {...props}>
      {children}
    </button>
  );
}
