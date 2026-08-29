"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { precargarCartografia } from "@/components/mapa/precargar";

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/mapa", label: "Mapa" },
  { href: "/reportar", label: "Reportar" },
  { href: "/recursos", label: "Recursos" },
];

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-sky-100/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-700 text-sm text-white">
            SOS
          </span>
          <span className="text-lg text-sky-950">
            agua<span className="text-rose-600">SOS</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={item.href === "/mapa" ? precargarCartografia : undefined}
                onFocus={item.href === "/mapa" ? precargarCartografia : undefined}
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-sky-100 text-sky-900"
                    : "text-slate-600 hover:bg-sky-50 hover:text-sky-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="ml-2 flex items-center gap-2">
            {clerkEnabled ? (
              <>
                <Show when="signed-out">
                  <SignInButton>
                    <button
                      type="button"
                      className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-sky-50 hover:text-sky-900"
                    >
                      Iniciar sesión
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button
                      type="button"
                      className="rounded-full bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"
                    >
                      Registrarse
                    </button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <UserButton />
                </Show>
              </>
            ) : null}
            <Link
              href="/reportar"
              className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
            >
              Reportar
            </Link>
          </div>
        </nav>

        <button
          type="button"
          className="rounded-lg p-2 text-sky-900 md:hidden"
          aria-expanded={open}
          aria-label="Abrir menú"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="block h-0.5 w-5 bg-current" />
          <span className="mt-1 block h-0.5 w-5 bg-current" />
          <span className="mt-1 block h-0.5 w-5 bg-current" />
        </button>
      </div>

      {open ? (
        <nav className="border-t border-sky-100 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                onTouchStart={item.href === "/mapa" ? precargarCartografia : undefined}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-sky-50"
              >
                {item.label}
              </Link>
            ))}
            {clerkEnabled ? (
              <>
                <Show when="signed-out">
                  <SignInButton>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-sky-50"
                    >
                      Iniciar sesión
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-lg bg-sky-700 px-3 py-2 text-center text-sm font-semibold text-white"
                    >
                      Registrarse
                    </button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <div className="px-3 py-2">
                    <UserButton />
                  </div>
                </Show>
              </>
            ) : null}
            <Link
              href="/reportar"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-lg bg-rose-600 px-3 py-2 text-center text-sm font-semibold text-white"
            >
              Reportar
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
