import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "aguaSOS",
    short_name: "aguaSOS",
    description: "Reportá escasez de agua y encontrá suministradores cercanos.",
    start_url: "/reportar",
    display: "standalone",
    background_color: "#f0f9ff",
    theme_color: "#075985",
    lang: "es-SV",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
