import Link from "next/link";
import { Shell } from "@/components/shell";
import { money } from "@/lib/content";
import { configured, serverSupabase } from "@/lib/supabase-server";

const orderStatusLabels = {
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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function Admin() {
  if (!configured) {
    return (
      <Shell>
        <main className="shell section">
          <h1>Painel</h1>
          <p className="notice">Configure o Supabase para ativar o painel.</p>
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
        <main className="shell section">
          <h1>Acesso restrito</h1>
          <p>Entre com uma conta de administrador.</p>
          <Link className="button" href="/login">
            Entrar
          </Link>
        </main>
      </Shell>
    );
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

  if (profile?.role !== "admin") {
    return (
      <Shell>
        <main className="shell section">
          <h1>Acesso restrito</h1>
          <p className="notice">Esta area e exclusiva para administradores da URBTRAIN.</p>
        </main>
      </Shell>
    );
  }

  const [{ data: orders }, { data: events }, { data: products }, { data: gallery }, { data: members }] = await Promise.all([
    supabase
      .from("orders")
      .select("id,customer_name,whatsapp,fulfillment_method,status,total_cents,created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("training_events")
      .select("id,title,starts_at,location,published")
      .order("starts_at", { ascending: true }),
    supabase.from("products").select("id,name,price_cents,active").order("created_at", { ascending: false }),
    supabase.from("gallery_items").select("id,caption,position,published").order("position", { ascending: true }),
    supabase.from("profiles").select("id,full_name,email,role,created_at").order("created_at", { ascending: false }),
  ]);

  const safeOrders = orders || [];
  const safeEvents = events || [];
  const safeProducts = products || [];
  const safeGallery = gallery || [];
  const safeMembers = members || [];
  const openOrders = safeOrders.filter((order) => order.status === "new" || order.status === "in_conversation");
  const confirmedRevenue = safeOrders
    .filter((order) => order.status === "confirmed" || order.status === "delivered")
    .reduce((total, order) => total + order.total_cents, 0);
  const publishedEvents = safeEvents.filter((event) => event.published).length;
  const activeProducts = safeProducts.filter((product) => product.active).length;

  return (
    <Shell>
      <main className="shell section admin-page">
        <header className="admin-hero">
          <div>
            <p className="eyebrow dark">Administracao</p>
            <h1>Controle URBTRAIN</h1>
          </div>
          <nav className="admin-nav" aria-label="Navegacao do painel">
            <a href="#pedidos">Pedidos</a>
            <a href="#agenda">Agenda</a>
            <a href="#conteudo">Conteudo</a>
            <a href="#membros">Membros</a>
          </nav>
        </header>

        <section className="admin-summary" aria-label="Resumo operacional">
          <article>
            <span>Pedidos em aberto</span>
            <strong>{openOrders.length}</strong>
          </article>
          <article>
            <span>Faturamento confirmado</span>
            <strong>{money(confirmedRevenue)}</strong>
          </article>
          <article>
            <span>Treinos publicados</span>
            <strong>{publishedEvents}</strong>
          </article>
          <article>
            <span>Produtos ativos</span>
            <strong>{activeProducts}</strong>
          </article>
        </section>

        <section className="admin-section" id="pedidos">
          <div className="admin-section-head">
            <div>
              <p className="eyebrow dark">Operacao</p>
              <h2>Pedidos recentes</h2>
            </div>
            <span>{safeOrders.length} no total</span>
          </div>
          {safeOrders.length ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Pedido</th>
                    <th>Entrega</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {safeOrders.slice(0, 8).map((order) => {
                    const status = order.status as keyof typeof orderStatusLabels;

                    return (
                      <tr key={order.id}>
                        <td>
                          <strong>{order.customer_name}</strong>
                          <span>{order.whatsapp}</span>
                        </td>
                        <td>
                          <strong>#{order.id.slice(0, 8)}</strong>
                          <span>{formatDate(order.created_at)}</span>
                        </td>
                        <td>{order.fulfillment_method}</td>
                        <td>
                          <span className={`account-status status-${status}`}>{orderStatusLabels[status]}</span>
                        </td>
                        <td>{money(order.total_cents)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-empty">Nenhum pedido registrado.</div>
          )}
        </section>

        <div className="admin-columns">
          <section className="admin-section" id="agenda">
            <div className="admin-section-head">
              <div>
                <p className="eyebrow dark">Programacao</p>
                <h2>Agenda</h2>
              </div>
              <span>{safeEvents.length} eventos</span>
            </div>
            <div className="admin-list">
              {safeEvents.length ? (
                safeEvents.slice(0, 6).map((event) => (
                  <article key={event.id}>
                    <div>
                      <strong>{event.title}</strong>
                      <span>{formatDateTime(event.starts_at)} · {event.location}</span>
                    </div>
                    <span className={`admin-visibility ${event.published ? "is-published" : ""}`}>
                      {event.published ? "Publicado" : "Rascunho"}
                    </span>
                  </article>
                ))
              ) : (
                <div className="admin-empty">Nenhum treino cadastrado.</div>
              )}
            </div>
          </section>

          <section className="admin-section" id="conteudo">
            <div className="admin-section-head">
              <div>
                <p className="eyebrow dark">Catalogo</p>
                <h2>Conteudo</h2>
              </div>
              <span>{safeGallery.filter((item) => item.published).length} imagens publicadas</span>
            </div>
            <div className="admin-list">
              {safeProducts.length ? (
                safeProducts.slice(0, 4).map((product) => (
                  <article key={product.id}>
                    <div>
                      <strong>{product.name}</strong>
                      <span>{money(product.price_cents)}</span>
                    </div>
                    <span className={`admin-visibility ${product.active ? "is-published" : ""}`}>
                      {product.active ? "Ativo" : "Oculto"}
                    </span>
                  </article>
                ))
              ) : (
                <div className="admin-empty">Nenhum produto cadastrado.</div>
              )}
            </div>
          </section>
        </div>

        <section className="admin-section" id="membros">
          <div className="admin-section-head">
            <div>
              <p className="eyebrow dark">Comunidade</p>
              <h2>Membros</h2>
            </div>
            <span>{safeMembers.length} cadastrados</span>
          </div>
          {safeMembers.length ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Papel</th>
                    <th>Cadastro</th>
                  </tr>
                </thead>
                <tbody>
                  {safeMembers.slice(0, 8).map((member) => (
                    <tr key={member.id}>
                      <td>{member.full_name || "Sem nome"}</td>
                      <td>{member.email || "Sem e-mail"}</td>
                      <td>
                        <span className={`admin-visibility ${member.role === "admin" ? "is-published" : ""}`}>
                          {member.role === "admin" ? "Admin" : "Membro"}
                        </span>
                      </td>
                      <td>{formatDate(member.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-empty">Nenhum membro cadastrado.</div>
          )}
        </section>
      </main>
    </Shell>
  );
}
