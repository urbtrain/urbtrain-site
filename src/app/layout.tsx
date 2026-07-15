import "./globals.css";
import "./theme.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "URBTRAIN | A rua \u00e9 nossa",
  description: "Corrida, comunidade e impacto social em Linhares.",
  icons: {
    icon: [{ url: "/icon-192.png", type: "image/png", sizes: "192x192" }],
    shortcut: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#090909",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
