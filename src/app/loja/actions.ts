"use server";

import { revalidatePath } from "next/cache";
import { configured, serverSupabase } from "@/lib/supabase-server";

export async function createShopOrder(input: { items: { variantId: string; quantity: number }[]; fulfillmentMethod: "retirada" | "entrega"; notes?: string }) {
  if (!configured) return { error: "A loja ainda não está configurada." };
  if (!Array.isArray(input.items) || !input.items.length) return { error: "Seu carrinho está vazio." };

  const supabase = await serverSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Entre na sua conta para finalizar o pedido." };

  const safeItems = input.items
    .filter((item) => typeof item.variantId === "string" && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99)
    .map((item) => ({ variant_id: item.variantId, quantity: item.quantity }));
  if (safeItems.length !== input.items.length) return { error: "Há um item inválido no carrinho." };

  const { data, error } = await supabase.rpc("place_shop_order", {
    p_items: safeItems,
    p_fulfillment_method: input.fulfillmentMethod,
    p_notes: String(input.notes ?? "").trim().slice(0, 1000) || null,
  });

  if (error) return { error: error.message };
  const order = Array.isArray(data) ? data[0] : data;
  if (!order?.order_number) return { error: "Não foi possível criar o pedido." };

  revalidatePath("/loja");
  revalidatePath("/conta");
  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  return { orderNumber: order.order_number as string, totalCents: order.total_cents as number };
}