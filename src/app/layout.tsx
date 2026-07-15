import "./globals.css";
import "./theme.css";
import "./admin-dashboard.css";
import "./internal-headers.css";
import "./splash.css";
import type { Metadata, Viewport } from "next";
import { AppLaunchScreen } from "@/components/app-launch-screen";

export const metadata: Metadata = {
  title: "URBTRAIN | A rua é nossa",
  description: "Corrida, comunidade e impacto social em Linhares.",
  icons: { icon: [{ url: "/urbtrain-app-icon.svg", type: "image/png", sizes: "192x192" }], shortcut: "/urbtrain-app-icon.svg", apple: "/urbtrain-app-icon.svg" },
  appleWebApp: { capable: true, title: "URBTRAIN", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { themeColor: "#090909" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body><AppLaunchScreen />{children}</body></html>;
}