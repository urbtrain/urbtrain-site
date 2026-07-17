import { AdminGate, AdminLayout } from "@/components/admin-layout";
import { getAdminAccess } from "@/lib/admin";
import { serverSupabase } from "@/lib/supabase-server";
import { updateOrderStatus } from "../actions";

const labels: Record<string, string> = { new: "Novo", in_conversation: "Em conversa", confirmed: "Confirmado", ready_for_pickup: "Pronto para retirada", delivered: "Entregue", cancelled: "Cancelado", expired: "Expirado" };

export default async function OrdersPage() {
  const access = await getAdminAccess(); if (access.state !== "admin") return <AdminGate access={access} />;
  const supabase = await serverSupabase();
  await supabase.rpc("release_expired_shop_orders");
  const { data: orders } = await supabase.from("orders").select("id,order_number,customer_name,whatsapp,fulfillment_method,status,total_cents,created_at,reservation_expires_at,order_items(product_name,variant_label,quantity)").order("created_at", { ascending: false });
  return <AdminLayout active="/admin/pedidos" title="Pedidos"><section className="admin-section">
    <div className="admin-section-head"><div><p className="eyebrow dark">Operação</p><h2>Acompanhar pedidos</h2><p className="muted">Pedidos novos reservam o estoque por 24 horas. Ao entregar, o saldo físico é baixado.</p></div><span>{orders?.length ?? 0} no total</span></div>
    <div className="admin-records">{(orders ?? []).map((order) => <article className="admin-record order-record" key={order.id}>
      <div><strong>{order.order_number || `#${order.id.slice(0, 8)}`} · {order.customer_name}</strong><span>{order.whatsapp || "Sem WhatsApp"} · {order.fulfillment_method}</span><small>{(order.order_items ?? []).map((item) => `${item.quantity}× ${item.product_name}${item.variant_label ? ` (${item.variant_label})` : ""}`).join(", ")}</small></div>
      <strong>R$ {(order.total_cents / 100).toFixed(2).replace(".", ",")}</strong>
      <form action={updateOrderStatus}><input type="hidden" name="id" value={order.id} /><select name="status" defaultValue={order.status}>{Object.entries(labels).map(([value, label]) => <option key={value} value={value} disabled={["cancelled", "expired", "delivered"].includes(order.status) && value !== order.status}>{label}</option>)}</select><button className="button">Atualizar</button></form>
    </article>)}</div>
  </section></AdminLayout>;
}