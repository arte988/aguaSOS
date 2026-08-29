import { Children, cloneElement, isValidElement, type ReactNode } from "react";

export function Campo({
  id,
  label,
  pista,
  error,
  children,
}: {
  id: string;
  label: string;
  pista?: string;
  error?: string;
  children: ReactNode;
}) {
  const pistaId = pista ? `${id}-pista` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const descritoPor = [pistaId, errorId].filter(Boolean).join(" ") || undefined;

  const control = Children.map(children, (hijo) => {
    if (!isValidElement<{ id?: string; "aria-describedby"?: string }>(hijo)) {
      return hijo;
    }
    return cloneElement(hijo, {
      id: hijo.props.id ?? id,
      "aria-describedby": hijo.props["aria-describedby"] ?? descritoPor,
    });
  });

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-base font-medium text-pozo">
        {label}
      </label>
      {control}
      {pista ? (
        <p id={pistaId} className="text-sm text-foreground/70">
          {pista}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm text-sequia" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
