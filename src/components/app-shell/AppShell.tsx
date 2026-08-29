"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { appNavItems } from "./nav";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isMapRoute = pathname === "/mapa" || pathname.startsWith("/mapa/");

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <header className="z-20 flex h-14 shrink-0 items-center border-b border-sky-200/80 bg-sky-50 px-4 dark:border-zinc-800 dark:bg-zinc-950">
        <Link href="/" className="text-sm font-semibold tracking-tight text-sky-800 dark:text-sky-300">
          aguaSOS
        </Link>
      </header>

      <div className="flex min-h-0 min-w-0 flex-1">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-sky-200/80 bg-sky-50/80 py-4 dark:border-zinc-800 dark:bg-zinc-950 md:flex">
          <nav className="flex flex-col gap-1 px-3" aria-label="Principal">
            {appNavItems.map((item) => {
              const active = !item.disabled && isActive(pathname, item.href);
              if (item.disabled) {
                return (
                  <span
                    key={item.label}
                    className="cursor-not-allowed rounded-md px-3 py-2 text-sm text-zinc-400 dark:text-zinc-600"
                  >
                    {item.label}
                  </span>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? "rounded-md bg-sky-700 px-3 py-2 text-sm font-medium text-white dark:bg-sky-800"
                      : "rounded-md px-3 py-2 text-sm text-sky-900 hover:bg-sky-100 dark:text-sky-200 dark:hover:bg-zinc-900"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main
          className={
            isMapRoute
              ? "min-h-0 min-w-0 flex-1 overflow-hidden"
              : "min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
          }
        >
          {children}
        </main>
      </div>

      <nav
        className="flex shrink-0 border-t border-sky-200/80 bg-sky-50 dark:border-zinc-800 dark:bg-zinc-950 md:hidden"
        aria-label="Móvil"
      >
        {appNavItems
          .filter((item) => !item.disabled)
          .map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "flex-1 py-3 text-center text-xs font-semibold text-sky-700 dark:text-sky-300"
                    : "flex-1 py-3 text-center text-xs text-zinc-500 dark:text-zinc-400"
                }
              >
                {item.label}
              </Link>
            );
          })}
      </nav>
    </div>
  );
}
