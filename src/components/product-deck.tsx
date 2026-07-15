"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { money } from "@/lib/content";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
};

export function ProductDeck({ products }: { products: readonly Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function move(direction: number) {
    const next = Math.min(Math.max(activeIndex + direction, 0), products.length - 1);
    const card = trackRef.current?.children.item(next) as HTMLElement | null;
    card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    setActiveIndex(next);
  }

  function updateActive() {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    const left = track.getBoundingClientRect().left;
    const closest = cards.reduce((best, card, index) => {
      const distance = Math.abs(card.getBoundingClientRect().left - left);
      return distance < best.distance ? { index, distance } : best;
    }, { index: 0, distance: Number.POSITIVE_INFINITY });
    setActiveIndex(closest.index);
  }

  return (
    <div className="product-deck" aria-label={"Produtos em destaque"}>
      <div className="product-deck-status">
        <span>{"0"}{activeIndex + 1} / {"0"}{products.length}</span>
        <div className="product-deck-progress" aria-hidden="true"><i style={{ width: ((activeIndex + 1) / products.length) * 100 + "%" }} /></div>
      </div>
      <div className="product-deck-track" ref={trackRef} onScroll={updateActive}>
        {products.map((product) => (
          <article className="card product" key={product.id}>
            <Image src={product.image} alt={product.name} width={800} height={800} />
            <div className="product-info">
              <p className="eyebrow dark">{product.category}</p>
              <h3>{product.name}</h3>
              <strong>{money(product.price)}</strong>
            </div>
          </article>
        ))}
      </div>
      <div className="product-deck-controls">
        <button type="button" onClick={() => move(-1)} disabled={activeIndex === 0} aria-label="Produto anterior">{"←"}</button>
        <span aria-live="polite">{"0"}{activeIndex + 1} de {"0"}{products.length}</span>
        <button type="button" onClick={() => move(1)} disabled={activeIndex === products.length - 1} aria-label={"Próximo produto"}>{"→"}</button>
      </div>
      <div className="product-deck-link"><Link className="button" href="/loja">Ver loja completa</Link></div>
    </div>
  );
}
