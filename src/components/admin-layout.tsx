import Link from "next/link";
import { ReactNode } from "react";
import { Shell } from "@/components/shell";
import { AdminAccess } from "@/lib/admin";

const modules = [
  ["/admin", "Painel"], ["/admin/usuarios", "Usuários"], ["/admin/agenda", "Agenda"],
  ["/admin/pedidos", "Pedidos"], ["/admin/loja", "Loja e estoque"], ["/admin/galeria", "Galeria"],
] as const;

export function AdminGate({ access }: { access: AdminAccess }) {
  if (access.state === "admin") return null;
  const copy = access.state === "unconfigured" ? ["Painel", "Configure o Supabase para ativar o painel."] : access.state === "anonymous" ? ["Acesso restrito", "Entre com uma conta de administrador."] : ["Acesso restrito", "Esta área é exclusiva para administradores da URBTRAIN."];
  return <Shell><main className="shell section"><h1>{copy[0]}</h1><p className="notice">{copy[1]}</p>{access.state === "anonymous" && <Link className="button" href="/login">Entrar</Link>}</main></Shell>;
}

export function AdminLayout({ active, title, eyebrow = "Administração", children }: { active: string; title: string; eyebrow?: string; children: ReactNode }) {
  return <Shell><main className="shell section admin-page"><header className="admin-hero"><div><p className="eyebrow dark">{eyebrow}</p><h1>{title}</h1></div></header><nav className="admin-nav admin-module-nav" aria-label="Módulos administrativos">{modules.map(([href, label]) => <Link key={href} href={href} aria-current={active === href ? "page" : undefined} className={active === href ? "active" : ""}>{label}</Link>)}</nav>{active !== "/admin" && <Link className="admin-back" href="/admin">← Voltar ao Painel</Link>}{children}</main></Shell>;
}
