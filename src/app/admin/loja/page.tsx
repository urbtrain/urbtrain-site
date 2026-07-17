import { AdminGate, AdminLayout } from "@/components/admin-layout";
import { AdminStockTable, type StockRow } from "@/components/admin-stock-table";
import { getAdminAccess } from "@/lib/admin";
import { serverSupabase } from "@/lib/supabase-server";
import { archiveProduct, saveProduct } from "../actions";

export default async function ShopPage() {
  const access = await getAdminAccess();
  if (access.state !== "admin") return <AdminGate access={access} />;
  const supabase = await serverSupabase();
  const [{ data: products }, { data: movements }] = await Promise.all([
    supabase.from("products").select("id,name,category,description,image_path,price_cents,active,product_variants(id,label,sku,stock_quantity,reserved_quantity,low_stock_threshold,active)").order("created_at", { ascending: false }),
    supabase.from("stock_movements").select("id,quantity_delta,reserved_delta,movement_type,reason,created_at,product_variants(label,products(name))").order("created_at", { ascending: false }).limit(12),
  ]);
  const rows: StockRow[] = (products ?? []).flatMap((product) => (product.product_variants ?? []).map((variant) => ({
    variantId: variant.id, productId: product.id, productName: product.name, category: product.category || "Geral", priceCents: product.price_cents,
    variantLabel: variant.label, sku: variant.sku, stock: variant.stock_quantity, reserved: variant.reserved_quantity,
    lowStockThreshold: variant.low_stock_threshold, productActive: product.active && variant.active, imagePath: product.image_path, description: product.description,
  })));

  return <AdminLayout active="/admin/loja" title="Loja e estoque">
    <section id="novo" className="admin-section">
      <div className="admin-section-head"><div><p className="eyebrow dark">Catálogo</p><h2>Novo produto</h2></div></div>
      <form className="admin-form" action={saveProduct}>
        <label>Nome<input name="name" required /></label><label>Categoria<input name="category" placeholder="Vestuário" /></label>
        <label>Preço (R$)<input name="price" type="number" min="0" step="0.01" required /></label><label>Imagem (caminho ou URL)<input name="image_path" placeholder="/produto-camisa.webp" /></label>
        <label>Variações<input name="variants" placeholder="P, M, G" required /></label><label>Estoque inicial por variação<input name="initial_stock" type="number" min="0" defaultValue="0" /></label>
        <label>Alerta de estoque baixo<input name="low_stock_threshold" type="number" min="0" defaultValue="3" /></label><label className="wide">Descrição<textarea name="description" /></label>
        <label className="check"><input name="active" type="checkbox" defaultChecked /> Produto ativo</label><button className="button">Criar produto</button>
      </form>
    </section>

    <section className="admin-section">
      <div className="admin-section-head"><div><p className="eyebrow dark">Inventário</p><h2>Estoque por variação</h2><p className="muted">Use as ações da linha para movimentar o saldo ou editar o produto.</p></div><span>{rows.length} variações</span></div>
      <AdminStockTable rows={rows} />
      <h3 className="admin-subtitle">Últimas movimentações</h3>
      <div className="admin-list">{(movements ?? []).map((movement) => <article key={movement.id}>
        <div><strong>{movement.product_variants?.[0]?.products?.[0]?.name ?? "Produto"} · {movement.product_variants?.[0]?.label ?? "Variação"}</strong><span>{movement.reason} · {movement.movement_type}</span></div>
        <strong className={movement.quantity_delta > 0 || movement.reserved_delta > 0 ? "stock-in" : "stock-out"}>{movement.quantity_delta ? `${movement.quantity_delta > 0 ? "+" : ""}${movement.quantity_delta}` : `${movement.reserved_delta > 0 ? "+" : ""}${movement.reserved_delta} reservado`}</strong>
      </article>)}</div>
    </section>

    <section className="admin-section">
      <div className="admin-section-head"><div><p className="eyebrow dark">Catálogo</p><h2>Arquivar produto</h2></div></div>
      <div className="admin-records">{(products ?? []).map((product) => <article className="admin-record" key={product.id}><div><strong>{product.name}</strong><span>{product.active ? "Ativo" : "Arquivado"}</span></div>{product.active && <form action={archiveProduct}><input type="hidden" name="id" value={product.id} /><button className="button admin-secondary">Arquivar</button></form>}</article>)}</div>
    </section>
  </AdminLayout>;
}