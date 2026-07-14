import Image from "next/image";
import Link from "next/link";

import { Shell } from "@/components/shell";

const items = [
  ["Camisa URBTRAIN", "produto-camisa.webp", "R$ 79,90"],
  ["Bone URB", "produto-bone.webp", "R$ 49,90"],
  ["Meias esportivas", "produto-meia.webp", "R$ 29,90"],
  ["Top URBTRAIN", "produto-top.webp", "R$ 69,90"],
] as const;

export default function Loja() {
  return (
    <Shell>
      <main className="shell section">
        <p className="eyebrow">URB Shop</p>
        <h1>VISTA O MOVIMENTO</h1>
        <div className="grid">
          {items.map(([name, image, price]) => (
            <article className="card product" key={name}>
              <Image src={`/${image}`} alt={name} width={800} height={800} sizes="(max-width: 700px) 100vw, 33vw" />
              <h3>{name}</h3>
              <p>{price}</p>
              <Link className="button" href="/login">
                Entrar para comprar
              </Link>
            </article>
          ))}
        </div>
      </main>
    </Shell>
  );
}
