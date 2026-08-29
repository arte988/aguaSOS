export function LeyendaRiesgoCompacta() {
  return (
    <div className="rounded-lg bg-white/90 px-3 py-2 text-xs text-slate-700 shadow-sm">
      <p className="font-semibold text-sky-950">Riesgo de escasez</p>
      <div className="mt-1 flex items-center gap-2">
        <span className="shrink-0">Menor</span>
        <span
          className="h-2 min-w-16 flex-1 rounded-full"
          style={{
            background:
              "linear-gradient(to right, #38bdf8, #fde047, #fb923c, #ef4444, #dc2626)",
          }}
          aria-hidden
        />
        <span className="shrink-0">Mayor</span>
      </div>
      <p className="mt-1 text-[11px] leading-snug text-slate-600">
        Zonas más cálidas concentran más reportes recientes de falta de agua.
      </p>
    </div>
  );
}
