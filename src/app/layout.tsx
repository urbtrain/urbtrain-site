import "./globals.css";
import "./theme.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "URBTRAIN | A rua é nossa",
  description: "Corrida, comunidade e impacto social em Linhares.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
