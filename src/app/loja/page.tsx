import { Shell } from "@/components/shell";
import { ShopClient, type ShopProduct } from "@/components/shop-client";
import { configured, serverSupabase } from "@/lib/supabase-server";

export default async function Loja() {
  let products: ShopProduct[] = [];
  if (configured) {
    const supabase = await serverSupabase();
    const { data } = await supabase
      .from("products")
      .select("id,name,category,description,image_path,price_cents,product_variants(id,label,stock_quantity,reserved_quantity,active)")
      .eq("active", true)
      .order("created_at", { ascending: false });

    products = (data ?? []).map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category || "URB Shop",
      description: product.description,
      imagePath: product.image_path,
      priceCents: product.price_cents,
      variants: (product.product_variants ?? [])
        .filter((variant) => variant.active)
        .map((variant) => ({ id: variant.id, label: variant.label, stock: variant.stock_quantity, reserved: variant.reserved_quantity })),
    })).filter((product) => product.variants.length);
  }

  return <Shell><main>
    <section className="page-hero"><div className="shell"><p className="eyebrow">URB Shop</p><h1>Vista o movimento</h1><p>Produtos reais, estoque atualizado e reserva pelo site.</p></div></section>
    <section className="section"><div className="shell">
      {!configured ? <div className="notice">A loja está sendo configurada.</div> : <ShopClient products={products} />}
    </div></section>
  </main></Shell>;
}