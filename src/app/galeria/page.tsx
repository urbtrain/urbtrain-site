import Image from "next/image";

import { Shell } from "@/components/shell";

const images = ["community.webp", "team.webp", "media.webp", "impact.webp", "closing.webp"];

export default function Galeria() {
  return (
    <Shell>
      <main className="shell section">
        <p className="eyebrow">Galeria</p>
        <h1>EM MOVIMENTO</h1>
        <div className="grid">
          {images.map((image) => (
            <Image
              key={image}
              src={`/${image}`}
              alt="Registro da comunidade URBTRAIN"
              width={800}
              height={800}
              sizes="(max-width: 700px) 100vw, 33vw"
              style={{ height: "auto", width: "100%" }}
            />
          ))}
        </div>
      </main>
    </Shell>
  );
}
