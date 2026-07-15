"use client";

import { useRef, useState } from "react";

type Value = readonly [string, string];

export function ValueDeck({ values }: { values: readonly Value[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function move(direction: number) {
    const next = Math.min(Math.max(activeIndex + direction, 0), values.length - 1);
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
    <div className="value-deck" aria-label={"Valores da URBTRAIN"}>
      <div className="value-deck-status">
        <span>{"0"}{activeIndex + 1} / {"0"}{values.length}</span>
        <div className="value-deck-progress" aria-hidden="true"><i style={{ width: ((activeIndex + 1) / values.length) * 100 + "%" }} /></div>
      </div>
      <div className="value-deck-track" ref={trackRef} onScroll={updateActive}>
        {values.map(([title, text], index) => (
          <article className="card value-card" key={title}>
            <span>{"0"}{index + 1}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <div className="value-deck-controls">
        <button type="button" onClick={() => move(-1)} disabled={activeIndex === 0} aria-label="Valor anterior">{"←"}</button>
        <span aria-live="polite">{"0"}{activeIndex + 1} de {"0"}{values.length}</span>
        <button type="button" onClick={() => move(1)} disabled={activeIndex === values.length - 1} aria-label={"Próximo valor"}>{"→"}</button>
      </div>
    </div>
  );
}
