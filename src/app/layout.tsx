import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "URBTRAIN | A rua é nossa",
  description: "Corrida, comunidade e impacto social em Linhares.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}