"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createShopOrder } from "@/app/loja/actions";
import { money } from "@/lib/content";

export type ShopProduct = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  imagePath: string | null;
  priceCents: number;
  variants: { id: string; label: string; stock: number; reserved: number }[];
};

type CartItem = { variantId: string; name: string; label: string; priceCents: number; quantity: number };

export function ShopClient({ products }: { products: ShopProduct[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [fulfillmentMethod, setFulfillmentMethod] = useState<"retirada" | "entrega">("retirada");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("urbtrain-shop-cart");
      if (saved) setCart(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    window.localStorage.setItem("urbtrain-shop-cart", JSON.stringify(cart));
  }, [cart]);

  const variantsById = useMemo(() => new Map(products.flatMap((product) => product.variants.map((variant) => [variant.id, variant]))), [products]);
  const total = cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  function available(variant: ShopProduct["variants"][number]) {
    return Math.max(0, variant.stock - variant.reserved);
  }

  function add(product: ShopProduct) {
    const variant = product.variants.find((item) => item.id === (selected[product.id] || product.variants[0]?.id));
    if (!variant || available(variant) < 1) return;
    setCart((items) => {
      const current = items.find((item) => item.variantId === variant.id);
      if (current) {
        if (current.quantity >= available(variant)) return items;
        return items.map((item) => item.variantId === variant.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...items, { variantId: variant.id, name: product.name, label: variant.label, priceCents: product.priceCents, quantity: 1 }];
    });
  }

  function changeQuantity(item: CartItem, delta: number) {
    const variant = variantsById.get(item.variantId);
    if (!variant) return;
    setCart((items) => items.flatMap((current) => {
      if (current.variantId !== item.variantId) return [current];
      const quantity = current.quantity + delta;
      if (quantity <= 0) return [];
      if (quantity > available(variant)) return [current];
      return [{ ...current, quantity }];
    }));
  }

  function finish() {
    setMessage("");
    startTransition(async () => {
      const result = await createShopOrder({
        items: cart.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
        fulfillmentMethod,
        notes,
      });
      if ("error" in result) {
        setMessage(result.error || "Não foi possível finalizar o pedido.");
        return;
      }
      setCart([]);
      setNotes("");
      setMessage(`Pedido ${result.orderNumber} reservado. Nossa equipe vai confirmar pelo WhatsApp.`);
      const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5527999999999";
      const text = encodeURIComponent(`Olá, URBTRAIN! Acabei de criar o pedido ${result.orderNumber}, no valor de ${money(result.totalCents)}.`);
      window.open(`https://wa.me/${whatsapp}?text=${text}`, "_blank", "noopener,noreferrer");
    });
  }

  return <div className="shop-layout">
    <div className="grid">
      {products.map((product) => {
        const chosen = product.variants.find((item) => item.id === (selected[product.id] || product.variants[0]?.id));
        const stock = chosen ? available(chosen) : 0;
        return <article className="card product" key={product.id}>
          {product.imagePath ? <div className="shop-product-image"><img src={product.imagePath} alt={product.name} /></div> : <div className="shop-product-image shop-product-placeholder">URBTRAIN</div>}
          <div className="product-info">
            <p className="eyebrow dark">{product.category}</p>
            <h3>{product.name}</h3>
            {product.description && <p className="muted shop-product-description">{product.description}</p>}
            <strong>{money(product.priceCents)}</strong>
            <label className="shop-variant-label">Variação
              <select value={chosen?.id ?? ""} onChange={(event) => setSelected({ ...selected, [product.id]: event.target.value })}>
                {product.variants.map((variant) => <option key={variant.id} value={variant.id} disabled={available(variant) < 1}>{variant.label} {available(variant) < 1 ? "— esgotado" : `— ${available(variant)} disponível(is)`}</option>)}
              </select>
            </label>
            <button className="button" style={{ width: "100%", marginTop: 12 }} disabled={!chosen || stock < 1} onClick={() => add(product)}>
              {stock < 1 ? "Esgotado" : "Adicionar ao carrinho"}
            </button>
          </div>
        </article>;
      })}
    </div>

    {!products.length && <div className="card shop-empty"><h2>Novos produtos em breve.</h2><p>O catálogo está sendo preparado pela equipe URBTRAIN.</p></div>}

    <aside className="card shop-cart" aria-live="polite">
      <p className="eyebrow dark">Carrinho</p>
      <h2>Seu pedido</h2>
      {!cart.length ? <p className="muted">Escolha seus produtos e variações para começar.</p> : <>
        <div className="shop-cart-items">
          {cart.map((item) => <div className="shop-cart-row" key={item.variantId}>
            <div><strong>{item.name}</strong><span>{item.label}</span></div>
            <div className="shop-quantity"><button type="button" onClick={() => changeQuantity(item, -1)} aria-label={"Remover uma unidade de " + item.name}>−</button><span>{item.quantity}</span><button type="button" onClick={() => changeQuantity(item, 1)} aria-label={"Adicionar uma unidade de " + item.name}>+</button></div>
            <strong>{money(item.priceCents * item.quantity)}</strong>
          </div>)}
        </div>
        <div className="shop-total"><strong>Total</strong><strong>{money(total)}</strong></div>
        <label className="shop-variant-label">Recebimento
          <select value={fulfillmentMethod} onChange={(event) => setFulfillmentMethod(event.target.value as "retirada" | "entrega")}>
            <option value="retirada">Retirar com a equipe</option><option value="entrega">Combinar entrega</option>
          </select>
        </label>
        <label className="shop-variant-label">Observação (opcional)
          <textarea value={notes} maxLength={1000} onChange={(event) => setNotes(event.target.value)} placeholder="Ex.: melhor horário para contato" />
        </label>
        <button className="button" disabled={isPending} onClick={finish}>{isPending ? "Reservando..." : "Finalizar pedido"}</button>
        <p className="muted shop-checkout-note">O estoque fica reservado por 24 horas. Pagamento e entrega serão confirmados pela equipe.</p>
      </>}
      {message && <p className="shop-message">{message}</p>}
    </aside>
  </div>;
}