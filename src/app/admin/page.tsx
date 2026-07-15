import Link from "next/link";
import { AdminGate, AdminLayout } from "@/components/admin-layout";
import { getAdminAccess } from "@/lib/admin";
import { serverSupabase } from "@/lib/supabase-server";

export default async function AdminPage() {
  const access = await getAdminAccess(); if (access.state !== "admin") return <AdminGate access={access} />;
  const supabase = await serverSupabase();
  const [{ count: members }, { count: openOrders }, { count: drafts }, { data: variants }, { count: pendingGallery }] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["new", "in_conversation"]),
    supabase.from("training_events").select("id", { count: "exact", head: true }).eq("published", false),
    supabase.from("product_variants").select("stock_quantity,low_stock_threshold"),
    supabase.from("gallery_items").select("id", { count: "exact", head: true }).eq("published", false),
  ]);
  const lowStock = (variants ?? []).filter((variant) => variant.stock_quantity <= variant.low_stock_threshold).length;
  const cards: { title: string; text: string; value: number; label: string; href: string }[] = [
    { title: "Usuários", text: "Membros e papéis", value: members ?? 0, label: "cadastros", href: "/admin/usuarios" },
    { title: "Agenda", text: "Treinos e publicação", value: drafts ?? 0, label: "rascunhos", href: "/admin/agenda" },
    { title: "Pedidos", text: "Operação da loja", value: openOrders ?? 0, label: "em aberto", href: "/admin/pedidos" },
    { title: "Loja e estoque", text: "Catálogo e inventário", value: lowStock, label: "itens em atenção", href: "/admin/loja" },
    { title: "Galeria", text: "Imagens da comunidade", value: pendingGallery ?? 0, label: "pendentes", href: "/admin/galeria" },
  ];
  return <AdminLayout active="/admin" title="Controle URBTRAIN"><section className="admin-hub" aria-label="Controles administrativos">{cards.map(({ title, text, value, label, href }) => <Link className="admin-module-card" href={href} key={href}><span>{text}</span><h2>{title}</h2><strong>{value}</strong><small>{label}</small><b>Gerenciar →</b></Link>)}</section></AdminLayout>;
}