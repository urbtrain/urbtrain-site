"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { browserSupabase, configured } from "@/lib/supabase-browser";

type IconName = "home" | "calendar" | "bag" | "gallery" | "user" | "panel";
const items = [
  ["/", "In\u00edcio", "home"], ["/agenda", "Agenda", "calendar"], ["/loja", "Loja", "bag"],
  ["/galeria", "Galeria", "gallery"], ["/conta", "Conta", "user"],
] as const;

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    home: <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" />,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4m10-4v4M3 10h18" /></>,
    bag: <><path d="M5 8h14l-1 13H6Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    gallery: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m21 16-5-5L5 21" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    panel: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
function MenuStateIcon({ pinned }: { pinned: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 7h14M5 12h14M5 17h14" />{pinned && <path d="M3 4v16" />}</svg>;
}
function initials(name: string) { return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }

export function AppSidebar({ minimal = false }: { minimal?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState<{ name: string; avatar?: string; admin: boolean } | null>(null);

  useEffect(() => {
    const media = matchMedia("(max-width: 760px)");
    const sync = () => setMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!configured || minimal) return;
    let alive = true;
    const supabase = browserSupabase();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (alive) setAccount(null); return; }
      const { data: profile } = await supabase.from("profiles").select("full_name,role").eq("id", user.id).maybeSingle();
      if (alive) setAccount({ name: profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email || "Membro URBTRAIN", avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture, admin: profile?.role === "admin" });
    }
    void load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => void load());
    return () => { alive = false; subscription.unsubscribe(); };
  }, [minimal]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function logout() {
    await browserSupabase().auth.signOut();
    setAccount(null);
    setOpen(false);
    router.push("/login");
    router.refresh();
  }

  if (minimal) return <aside className="auth-sidebar"><Link className="auth-sidebar-brand" href="/"><Image src="/logo.png" alt="URBTRAIN" width={36} height={36} priority /><span>URBTRAIN</span></Link><Link href="/" className="auth-sidebar-back">{"\u2190 Voltar ao in\u00edcio"}</Link></aside>;

  const expanded = mobile ? open : pinned || hovered;
  const controlLabel = mobile ? "Fechar navega\u00e7\u00e3o" : pinned ? "Soltar menu" : "Fixar menu";

  return <>
    <button className="mobile-menu-button" type="button" aria-label="Abrir navega\u00e7\u00e3o" aria-expanded={open} onClick={() => setOpen(true)}><MenuStateIcon pinned={false} /></button>
    {open && <button className="sidebar-backdrop" type="button" aria-label="Fechar navega\u00e7\u00e3o" onClick={() => setOpen(false)} />}
    <aside className="app-sidebar" data-expanded={expanded} onMouseEnter={() => !mobile && setHovered(true)} onMouseLeave={() => !mobile && setHovered(false)} aria-label="Navega\u00e7\u00e3o principal">
      <div className="sidebar-top">
        <Link className="sidebar-brand" href="/"><Image src="/logo.png" alt="URBTRAIN" width={38} height={38} priority /><span>URBTRAIN</span></Link>
        <button className="sidebar-control" type="button" title={controlLabel} aria-label={controlLabel} aria-pressed={!mobile && pinned} onClick={() => mobile ? setOpen(false) : setPinned((value) => !value)}>
          {mobile ? <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 6 12 12M18 6 6 18" /></svg> : <MenuStateIcon pinned={pinned} />}
        </button>
      </div>
      <nav className="sidebar-nav">{items.map(([href, label, icon]) => <Link key={href} href={href} onClick={() => setOpen(false)} className={pathname === href ? "active" : ""} aria-current={pathname === href ? "page" : undefined}><Icon name={icon} /><span>{label}</span></Link>)}{account?.admin && <Link href="/admin" onClick={() => setOpen(false)} className={pathname === "/admin" ? "active" : ""}><Icon name="panel" /><span>Painel</span></Link>}</nav>
      <div className="sidebar-account">{account ? <><Link className="sidebar-profile" href="/conta"><span className="sidebar-avatar">{account.avatar ? <Image src={account.avatar} alt="" width={44} height={44} /> : initials(account.name)}</span><span className="sidebar-user-name">{account.name}</span></Link><button className="sidebar-signout" type="button" onClick={logout}><span aria-hidden="true">{"\u2192"}</span><span>Sair</span></button></> : <div className="sidebar-guest"><span className="sidebar-avatar guest"><Icon name="user" /></span><div><Link href="/login">Entrar</Link></div></div>}</div>
    </aside>
  </>;
}
