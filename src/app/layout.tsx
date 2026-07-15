import "./globals.css";
import "./theme.css";
import "./splash.css";
import type { Metadata, Viewport } from "next";
import { AppLaunchScreen } from "@/components/app-launch-screen";

export const metadata: Metadata = {
  title: "URBTRAIN | A rua é nossa",
  description: "Corrida, comunidade e impacto social em Linhares.",
  icons: { icon: [{ url: "/icon-192.png", type: "image/png", sizes: "192x192" }], shortcut: "/icon-192.png", apple: "/icon-192.png" },
  appleWebApp: { capable: true, title: "URBTRAIN", statusBarStyle: "black-translucent", startupImage: [{ url: "/Splash-Mobile.png" }] },
};

export const viewport: Viewport = { themeColor: "#090909" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body><AppLaunchScreen />{children}</body></html>;
}