"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { AccountSignOut } from "@/components/account-sign-out";
import { AdminNavLink } from "@/components/admin-nav-link";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/agenda", label: "Agenda" },
  { href: "/loja", label: "Loja" },
  { href: "/galeria", label: "Galeria" },
  { href: "/conta", label: "Conta" },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="nav">
        <div className="shell nav-in">
          <Link className="brand" href="/" onClick={() => setOpen(false)}>
            <Image src="/logo.png" alt="URBTRAIN" width={38} height={38} priority />
            URBTRAIN
          </Link>
          <button
            className="menu-toggle"
            type="button"
            aria-label="Abrir menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
          <nav className={`links ${open ? "open" : ""}`} aria-label="Navegacao principal">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={pathname === link.href ? "active" : ""}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <AdminNavLink />
            <AccountSignOut />
          </nav>
        </div>
      </header>
      {children}
      <footer className="footer">
        <div className="shell">URBTRAIN - A RUA E NOSSA - Linhares, ES</div>
      </footer>
    </>
  );
}
