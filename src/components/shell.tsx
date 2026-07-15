"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const minimal = pathname === "/login" || pathname === "/cadastro";

  return (
    <>
      <AppSidebar minimal={minimal} />
      <div className={minimal ? "app-frame auth-frame" : "app-frame"}>
        {children}
        <footer className="footer"><div className="shell">URBTRAIN - A RUA E NOSSA - Linhares, ES</div></footer>
      </div>
    </>
  );
}
