export type AppNavItem = {
  href: string;
  label: string;
  disabled?: boolean;
};

export const appNavItems: AppNavItem[] = [
  { href: "/", label: "Inicio" },
  { href: "/mapa", label: "Mapa" },
  { href: "/reportes", label: "Reportes", disabled: true },
  { href: "/estadisticas", label: "Estadísticas", disabled: true },
  { href: "/configuracion", label: "Configuración", disabled: true },
];
