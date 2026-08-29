import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-sky-100 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="font-semibold text-sky-950">aguaSOS</span> — ayuda comunitaria
          cuando falta el agua.
        </p>
        <div className="flex gap-4">
          <Link href="/reportar" className="hover:text-sky-800">
            Reportar
          </Link>
          <Link href="/recursos" className="hover:text-sky-800">
            Recursos
          </Link>
        </div>
      </div>
    </footer>
  );
}
