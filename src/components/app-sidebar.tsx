"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { browserSupabase, configured } from "@/lib/supabase-browser";

const items = [["/", "Início", "⌂"], ["/agenda", "Agenda", "◫"], ["/loja", "Loja", "▣"], ["/galeria", "Galeria", "◈"], ["/conta", "Conta", "◯"]] as const;
function initials(name: string) { return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }

export function AppSidebar({ minimal = false }: { minimal?: boolean }) {
  const pathname = usePathname(); const router = useRouter();
  const [pinned, setPinned] = useState(false); const [hovered, setHovered] = useState(false);
  const [mobile, setMobile] = useState(false); const [open, setOpen] = useState(false);
  const [account, setAccount] = useState<{name:string; avatar?:string; admin:boolean} | null>(null);
  useEffect(() => { const media = matchMedia("(max-width: 760px)"); const sync = () => setMobile(media.matches); sync(); media.addEventListener("change", sync); return () => media.removeEventListener("change", sync); }, []);
  useEffect(() => {
    if (!configured || minimal) return;
    let alive = true; const supabase = browserSupabase();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (alive) setAccount(null); return; }
      const { data: profile } = await supabase.from("profiles").select("full_name,role").eq("id", user.id).maybeSingle();
      if (alive) setAccount({ name: profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email || "Membro URBTRAIN", avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture, admin: profile?.role === "admin" });
    }
    void load(); const { data: { subscription } } = supabase.auth.onAuthStateChange(() => void load());
    return () => { alive = false; subscription.unsubscribe(); };
  }, [minimal]);
  useEffect(() => { if (!open) return; const handler = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); }; document.addEventListener("keydown", handler); return () => document.removeEventListener("keydown", handler); }, [open]);
  async function logout() { await browserSupabase().auth.signOut(); setAccount(null); setOpen(false); router.push("/login"); router.refresh(); }
  if (minimal) return <aside className="auth-sidebar"><Link className="auth-sidebar-brand" href="/"><Image src="/logo.png" alt="URBTRAIN" width={36} height={36} priority /><span>URBTRAIN</span></Link><Link href="/" className="auth-sidebar-back">← Voltar ao início</Link></aside>;
  const expanded = mobile ? open : pinned || hovered;
  return <><button className="mobile-menu-button" aria-label="Abrir navegação" aria-expanded={open} onClick={() => setOpen(true)}>☰</button>{open && <button className="sidebar-backdrop" aria-label="Fechar navegação" onClick={() => setOpen(false)} />}
    <aside className="app-sidebar" data-expanded={expanded} onMouseEnter={() => !mobile && setHovered(true)} onMouseLeave={() => !mobile && setHovered(false)} aria-label="Navegação principal">
      <div className="sidebar-top"><Link className="sidebar-brand" href="/"><Image src="/logo.png" alt="URBTRAIN" width={38} height={38} priority /><span>URBTRAIN</span></Link><button className="sidebar-control" aria-label={mobile ? "Fechar navegação" : "Fixar navegação"} onClick={() => mobile ? setOpen(false) : setPinned(!pinned)}>{mobile ? "×" : <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={pinned ? "m9 18 6-6-6-6" : "m15 18-6-6 6-6"} /></svg>}</button></div>
      <nav className="sidebar-nav">{items.map(([href, label, icon]) => <Link key={href} href={href} onClick={() => setOpen(false)} className={pathname === href ? "active" : ""} aria-current={pathname === href ? "page" : undefined}><b>{icon}</b><span>{label}</span></Link>)}{account?.admin && <Link href="/admin" onClick={() => setOpen(false)} className={pathname === "/admin" ? "active" : ""}><b>▦</b><span>Painel</span></Link>}</nav>
      <div className="sidebar-account">{account ? <><Link className="sidebar-profile" href="/conta"><span className="sidebar-avatar">{account.avatar ? <Image src={account.avatar} alt="" width={44} height={44} /> : initials(account.name)}</span><span className="sidebar-user-name">{account.name}</span></Link><button className="sidebar-signout" onClick={logout}><b>↪</b><span>Sair</span></button></> : <div className="sidebar-guest"><span className="sidebar-avatar guest">◯</span><div><Link href="/login">Entrar</Link><Link href="/cadastro">Criar conta</Link></div></div>}</div>
    </aside></>;
}




