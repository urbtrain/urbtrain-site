"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

const text = (value: FormDataEntryValue | null, max = 500) => String(value ?? "").trim().slice(0, max);
const number = (value: FormDataEntryValue | null, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
function refresh(...paths: string[]) { paths.forEach((path) => revalidatePath(path)); }

export async function updateMember(formData: FormData) {
  const { access, supabase } = await requireAdmin();
  const id = text(formData.get("id"), 80); const role = text(formData.get("role"), 20);
  if (!id || id === access.userId) throw new Error("Não é permitido alterar seu próprio papel.");
  if (role !== "admin" && role !== "customer") throw new Error("Papel inválido.");
  const { data: target } = await supabase.from("profiles").select("role").eq("id", id).maybeSingle();
  if (target?.role === "admin" && role !== "admin") {
    const { count } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "admin");
    if ((count ?? 0) <= 1) throw new Error("A URBTRAIN precisa manter ao menos um administrador.");
  }
  const { error } = await supabase.from("profiles").update({ full_name: text(formData.get("full_name"), 120) || null, whatsapp: text(formData.get("whatsapp"), 30) || null, role }).eq("id", id);
  if (error) throw new Error(error.message); refresh("/admin", "/admin/usuarios");
}

export async function saveEvent(formData: FormData) {
  const { supabase } = await requireAdmin(); const id = text(formData.get("id"), 80);
  const values = { title: text(formData.get("title"), 140), starts_at: text(formData.get("starts_at"), 40), location: text(formData.get("location"), 140), maps_url: text(formData.get("maps_url"), 500) || null, description: text(formData.get("description"), 1000) || null, published: formData.get("published") === "on" };
  if (!values.title || !values.starts_at || !values.location) throw new Error("Preencha título, data e local.");
  const query = id ? supabase.from("training_events").update(values).eq("id", id) : supabase.from("training_events").insert(values);
  const { error } = await query; if (error) throw new Error(error.message); refresh("/admin", "/admin/agenda", "/agenda");
}
export async function archiveEvent(formData: FormData) { const { supabase } = await requireAdmin(); const { error } = await supabase.from("training_events").update({ published: false }).eq("id", text(formData.get("id"), 80)); if (error) throw new Error(error.message); refresh("/admin", "/admin/agenda", "/agenda"); }

export async function updateOrderStatus(formData: FormData) {
  const { supabase } = await requireAdmin(); const status = text(formData.get("status"), 30); const allowed = ["new", "in_conversation", "confirmed", "delivered", "cancelled"];
  if (!allowed.includes(status)) throw new Error("Status inválido."); const { error } = await supabase.from("orders").update({ status }).eq("id", text(formData.get("id"), 80)); if (error) throw new Error(error.message); refresh("/admin", "/admin/pedidos", "/conta");
}

export async function saveProduct(formData: FormData) {
  const { supabase } = await requireAdmin(); const name = text(formData.get("name"), 140); const labels = text(formData.get("variants"), 300).split(",").map((label) => label.trim()).filter(Boolean);
  if (!name || !labels.length) throw new Error("Informe nome e ao menos uma variação.");
  const { data: product, error } = await supabase.from("products").insert({ name, description: text(formData.get("description"), 1000) || null, price_cents: Math.max(0, Math.round(number(formData.get("price")) * 100)), active: formData.get("active") === "on" }).select("id").single();
  if (error || !product) throw new Error(error?.message ?? "Não foi possível criar o produto.");
  const { error: variantsError } = await supabase.from("product_variants").insert(labels.map((label) => ({ product_id: product.id, label, stock_quantity: Math.max(0, Math.round(number(formData.get("initial_stock")))), low_stock_threshold: Math.max(0, Math.round(number(formData.get("low_stock_threshold"), 3))) })));
  if (variantsError) throw new Error(variantsError.message); refresh("/admin", "/admin/loja", "/loja");
}
export async function archiveProduct(formData: FormData) { const { supabase } = await requireAdmin(); const { error } = await supabase.from("products").update({ active: false }).eq("id", text(formData.get("id"), 80)); if (error) throw new Error(error.message); refresh("/admin", "/admin/loja", "/loja"); }
export async function adjustStock(formData: FormData) {
  const { access, supabase } = await requireAdmin(); const id = text(formData.get("variant_id"), 80); const delta = Math.trunc(number(formData.get("quantity_delta"))); const reason = text(formData.get("reason"), 160);
  if (!id || !delta || reason.length < 2) throw new Error("Informe uma variação, quantidade e motivo.");
  const { data: variant, error: readError } = await supabase.from("product_variants").select("stock_quantity").eq("id", id).single();
  if (readError || !variant) throw new Error("Variação não encontrada."); const next = variant.stock_quantity + delta; if (next < 0) throw new Error("O saldo não pode ficar negativo.");
  const { error } = await supabase.from("product_variants").update({ stock_quantity: next }).eq("id", id); if (error) throw new Error(error.message);
  const { error: movementError } = await supabase.from("stock_movements").insert({ product_variant_id: id, quantity_delta: delta, reason, created_by: access.userId }); if (movementError) throw new Error(movementError.message); refresh("/admin", "/admin/loja");
}

export async function uploadGalleryItem(formData: FormData) {
  const { supabase } = await requireAdmin(); const file = formData.get("file");
  if (!(file instanceof File) || !file.size) throw new Error("Selecione uma imagem."); const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type) || file.size > 8 * 1024 * 1024) throw new Error("Use JPEG, PNG ou WebP de até 8 MB.");
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"; const path = `${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from("gallery").upload(path, file, { contentType: file.type, upsert: false }); if (uploadError) throw new Error(uploadError.message);
  const { data: publicUrl } = supabase.storage.from("gallery").getPublicUrl(path);
  const { error } = await supabase.from("gallery_items").insert({ image_path: publicUrl.publicUrl, alt_text: text(formData.get("alt_text"), 180), caption: text(formData.get("caption"), 300) || null, position: Math.max(0, Math.trunc(number(formData.get("position")))), published: formData.get("published") === "on" });
  if (error) throw new Error(error.message); refresh("/admin", "/admin/galeria", "/galeria");
}
export async function archiveGalleryItem(formData: FormData) { const { supabase } = await requireAdmin(); const { error } = await supabase.from("gallery_items").update({ published: false }).eq("id", text(formData.get("id"), 80)); if (error) throw new Error(error.message); refresh("/admin", "/admin/galeria", "/galeria"); }
