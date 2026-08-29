export function ClerkNoConfigurado({ accion }: { accion: string }) {
  return (
    <div className="max-w-md rounded-2xl border border-sky-200 bg-white p-6 text-left">
      <p className="font-semibold text-sky-950">Las cuentas aún no están habilitadas.</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Para {accion} hace falta configurar{" "}
        <code className="rounded bg-sky-100 px-1.5 py-0.5 font-mono text-[0.85em] text-sky-800">
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
        </code>{" "}
        en <code className="font-mono">.env.local</code>. Mientras tanto podés reportar y
        consultar el mapa sin cuenta.
      </p>
    </div>
  );
}
