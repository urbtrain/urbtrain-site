import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "URBTRAIN",
    short_name: "URBTRAIN",
    description: "Corrida, comunidade e impacto social em Linhares.",
    start_url: "/",
    display: "standalone",
    background_color: "#090909",
    theme_color: "#090909",
    icons: [
      { src: "/pwa-splash-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/pwa-splash-icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/pwa-splash-icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/pwa-splash-icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
