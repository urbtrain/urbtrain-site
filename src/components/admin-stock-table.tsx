"use client";

import { useState, useTransition } from "react";
import { adjustStock, updateProduct } from "@/app/admin/actions";

export type StockRow = {
  variantId: string;
  productId: string;
  productName: string;
  category: string;
  priceCents: number;
  variantLabel: string;
  sku: string | null;
  stock: number;
  reserved: number;
  lowStockThreshold: number;
  productActive: boolean;
  imagePath: string | null;
  description: string | null;
};

const money = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

export function AdminStockTable({ rows }: { rows: StockRow[] }) {
  const [movement, setMovement] = useState<StockRow | null>(null);
  const [editing, setEditing] = useState<StockRow | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  function submitMovement(formData: FormData) {
    setFeedback("");
    startTransition(async () => {
      try {
        await adjustStock(formData);
        setMovement(null);
        setFeedback("Movimentação registrada.");
      } catch (error) { setFeedback(error instanceof Error ? error.message : "Não foi possível registrar."); }
    });
  }

  function submitProduct(formData: FormData) {
    setFeedback("");
    startTransition(async () => {
      try {
        await updateProduct(formData);
        setEditing(null);
        setFeedback("Produto atualizado.");
      } catch (error) { setFeedback(error instanceof Error ? error.message : "Não foi possível atualizar."); }
    });
  }

  return <>
    {feedback && <p className="admin-feedback" role="status">{feedback}</p>}
    <div className="admin-table-scroll">
      <table className="admin-stock-table">
        <thead><tr><th>Produto</th><th>Variação</th><th>SKU</th><th>Disponível</th><th>Reservado</th><th>Físico</th><th>Status</th><th>Ação</th></tr></thead>
        <tbody>{rows.map((row) => {
          const available = Math.max(0, row.stock - row.reserved);
          const low = available <= row.lowStockThreshold;
          return <tr key={row.variantId}>
            <td><strong>{row.productName}</strong><span>{row.category} · {money(row.priceCents)}</span></td>
            <td>{row.variantLabel}</td><td>{row.sku || "—"}</td>
            <td className={low ? "stock-warning" : ""}>{available}</td><td>{row.reserved}</td><td>{row.stock}</td>
            <td><span className={row.productActive ? "admin-visibility is-published" : "admin-visibility"}>{row.productActive ? (low ? "Baixo" : "Ativo") : "Arquivado"}</span></td>
            <td><div className="admin-table-actions"><button className="admin-action-button" type="button" onClick={() => setMovement(row)}>Movimentar</button><button className="admin-action-button" type="button" onClick={() => setEditing(row)}>Editar</button></div></td>
          </tr>;
        })}</tbody>
      </table>
    </div>

    {movement && <div className="admin-modal-backdrop" role="presentation" onMouseDown={() => !isPending && setMovement(null)}>
      <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="movement-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="admin-modal-close" type="button" onClick={() => setMovement(null)} aria-label="Fechar">×</button>
        <p className="eyebrow dark">Movimentação de estoque</p><h2 id="movement-title">{movement.productName} · {movement.variantLabel}</h2>
        <p className="muted">Físico: {movement.stock} · Reservado: {movement.reserved} · Disponível: {Math.max(0, movement.stock - movement.reserved)}</p>
        <form action={submitMovement} className="admin-form">
          <input type="hidden" name="variant_id" value={movement.variantId} />
          <label>Quantidade<input name="quantity_delta" type="number" required placeholder="Ex.: 10 ou -2" /></label>
          <label className="wide">Motivo<input name="reason" minLength={2} required placeholder="Ex.: entrada de novo lote" /></label>
          <button className="button" disabled={isPending}>{isPending ? "Salvando..." : "Registrar movimento"}</button>
        </form>
      </section>
    </div>}

    {editing && <div className="admin-modal-backdrop" role="presentation" onMouseDown={() => !isPending && setEditing(null)}>
      <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="edit-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="admin-modal-close" type="button" onClick={() => setEditing(null)} aria-label="Fechar">×</button>
        <p className="eyebrow dark">Catálogo</p><h2 id="edit-title">Editar produto</h2>
        <form action={submitProduct} className="admin-form">
          <input type="hidden" name="id" value={editing.productId} />
          <label>Nome<input name="name" required defaultValue={editing.productName} /></label>
          <label>Categoria<input name="category" defaultValue={editing.category} /></label>
          <label>Preço (R$)<input name="price" type="number" min="0" step="0.01" required defaultValue={(editing.priceCents / 100).toFixed(2)} /></label>
          <label>Imagem (caminho ou URL)<input name="image_path" defaultValue={editing.imagePath || ""} placeholder="/produto.jpg" /></label>
          <label className="wide">Descrição<textarea name="description" defaultValue={editing.description || ""} /></label>
          <label className="check"><input name="active" type="checkbox" defaultChecked={editing.productActive} /> Produto ativo</label>
          <button className="button" disabled={isPending}>{isPending ? "Salvando..." : "Salvar produto"}</button>
        </form>
      </section>
    </div>}
  </>;
}