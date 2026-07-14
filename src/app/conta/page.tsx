import Image from "next/image";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { money } from "@/lib/content";
import { configured, serverSupabase } from "@/lib/supabase-server";

const statusLabels = {
  new: "Novo",
  in_conversation: "Em conversa",
  confirmed: "Confirmado",
  delivered: "Entregue",
  cancelled: "Cancelado",
} as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function Conta() {
  if (!configured) {
    return (
      <Shell>
        <main className="shell section">
          <h1>Sua conta</h1>
          <p className="notice">Configure o Supabase para ativar sua conta e histórico de pedidos.</p>
        </main>
      </Shell>
    );
  }

  const supabase = await serverSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Shell>
        <main className="shell section account-page">
          <p className="eyebrow dark">Minha conta</p>
          <h1>Sua área URBTRAIN</h1>
          <div className="card account-empty">
            <h2>Entre para acompanhar seu movimento.</h2>
            <p>Veja seus pedidos, dados de contato e atalhos da comunidade em um só lugar.</p>
            <Link className="button" href="/login">
              Entrar
            </Link>
          </div>
        </main>
      </Shell>
    );
  }

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("full_name,whatsapp,role").eq("id", user.id).maybeSingle(),
    supabase
      .from("orders")
      .select("id,status,total_cents,created_at,fulfillment_method,order_items(product_name,variant_label,quantity)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const displayName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    "Membro URBTRAIN";
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const initials = String(displayName)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5527999999999";

  return (
    <Shell>
      <main className="shell section account-page">
        <section className="account-hero">
          <div className="account-identity">
            <div className="account-avatar" aria-hidden="true">
              {avatarUrl ? <Image src={avatarUrl} alt="" width={96} height={96} /> : <span>{initials}</span>}
            </div>
            <div>
              <p className="eyebrow dark">Minha conta</p>
              <h1>{displayName}</h1>
              <p className="muted">{user.email}</p>
            </div>
          </div>
        </section>

        <section className="account-layout">
          <div className="account-main">
            <div className="account-section-title">
              <div>
                <p className="eyebrow dark">Histórico</p>
                <h2>Seus pedidos</h2>
              </div>
              <Link className="button account-secondary" href="/loja">
                Ver loja
              </Link>
            </div>

            {orders?.length ? (
              <div className="account-orders">
                {orders.map((order) => {
                  const status = order.status as keyof typeof statusLabels;

                  return (
                    <article className="card account-order" key={order.id}>
                      <div className="account-order-head">
                        <div>
                          <strong>Pedido #{order.id.slice(0, 8)}</strong>
                          <span>{formatDate(order.created_at)}</span>
                        </div>
                        <span className={`account-status status-${status}`}>{statusLabels[status]}</span>
                      </div>
                      <div className="account-order-items">
                        {order.order_items.map((item) => (
                          <p key={`${order.id}-${item.product_name}-${item.variant_label}`}>
                            {item.quantity}x {item.product_name}
                            {item.variant_label ? ` · ${item.variant_label}` : ""}
                          </p>
                        ))}
                      </div>
                      <div className="account-order-foot">
                        <span>{order.fulfillment_method}</span>
                        <strong>{money(order.total_cents)}</strong>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="card account-empty">
                <h2>Seu histórico começa no primeiro drop.</h2>
                <p>Quando você comprar na URB Shop, seus pedidos aparecem aqui com status e resumo dos itens.</p>
                <div className="actions">
                  <Link className="button" href="/loja">
                    Ir para loja
                  </Link>
                  <Link className="button account-secondary" href={`https://wa.me/${whatsappNumber}`}>
                    Falar no WhatsApp
                  </Link>
                </div>
              </div>
            )}
          </div>

          <aside className="account-sidebar" aria-label="Resumo da conta">
            <article className="card account-profile-card">
              <p className="eyebrow dark">Dados</p>
              <dl>
                <div>
                  <dt>Nome</dt>
                  <dd>{displayName}</dd>
                </div>
                <div>
                  <dt>WhatsApp</dt>
                  <dd>{profile?.whatsapp || "Complete na próxima compra"}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{profile?.role === "admin" ? "Admin URBTRAIN" : "Membro URBTRAIN"}</dd>
                </div>
              </dl>
            </article>

            <article className="card account-shortcuts">
              <p className="eyebrow dark">Atalhos</p>
              <Link href="/agenda">Próximos treinos</Link>
              <Link href="/galeria">Galeria</Link>
              <Link href="/loja">URB Shop</Link>
              <Link href={`https://wa.me/${whatsappNumber}`}>WhatsApp</Link>
            </article>

            {profile?.role === "admin" && (
              <article className="card account-admin-card">
                <p className="eyebrow dark">Administração</p>
                <h3>Painel URBTRAIN</h3>
                <p>Gerencie pedidos, agenda, loja e galeria.</p>
                <Link className="button" href="/admin">
                  Abrir painel
                </Link>
              </article>
            )}
          </aside>
        </section>
      </main>
    </Shell>
  );
}
