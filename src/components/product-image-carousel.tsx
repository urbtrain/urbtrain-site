"use client";

import Image from "next/image";
import { useState } from "react";

type Props = { images?: readonly string[]; image: string; alt: string };

export function ProductImageCarousel({ images, image, alt }: Props) {
  const slides = images?.length ? images : [image];
  const [active, setActive] = useState(0);
  const multiple = slides.length > 1;

  function move(direction: number) {
    setActive((index) => (index + direction + slides.length) % slides.length);
  }

  return <div className="product-carousel">
    <Image src={slides[active]} alt={active === 1 ? `${alt} — Passaporte de Doador` : alt} width={800} height={800} />
    {multiple && <>
      <button className="product-carousel-button previous" type="button" onClick={() => move(-1)} aria-label="Imagem anterior">←</button>
      <button className="product-carousel-button next" type="button" onClick={() => move(1)} aria-label="Próxima imagem">→</button>
      <span className="product-carousel-count">{active + 1}/{slides.length}</span>
    </>}
  </div>;
}
