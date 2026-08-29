import type { ButtonHTMLAttributes, ReactNode } from "react";

type Tono = "neutro" | "pendiente" | "aprobado" | "rechazado";

export function Chip({
  tono = "neutro",
  seleccionado = false,
  className = "",
  children,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tono?: Tono;
  seleccionado?: boolean;
  children: ReactNode;
}) {
  const base =
    "inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chorro disabled:cursor-not-allowed disabled:opacity-60";

  const reposo: Record<Tono, string> = {
    neutro: "border border-pila bg-papel text-pozo",
    pendiente: "border border-aviso/40 bg-aviso/10 text-aviso",
    aprobado: "border border-chorro/30 bg-pila text-pozo",
    rechazado: "border border-sequia/30 bg-sequia/10 text-sequia",
  };

  const activo = seleccionado
    ? "border-pozo bg-pozo text-white"
    : reposo[tono];

  return (
    <button type={type} className={`${base} ${activo} ${className}`} {...props}>
      {children}
    </button>
  );
}
