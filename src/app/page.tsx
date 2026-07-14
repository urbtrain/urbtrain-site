import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Shell } from "@/components/shell";
import { money, products, stats } from "@/lib/content";

const pillars = [
  ["01", "Corra junto", "Todo ritmo tem lugar na rua."],
  ["02", "Crie conexoes", "Treino tambem e encontro."],
  ["03", "Cause impacto", "Movimento que volta para a cidade."],
];

export default function Home() {
  return (
    <Shell>
      <main className="home-page">
        <section className="home-hero">
          <Image className="home-hero-image" src="/hero.webp" alt="Corredores da URBTRAIN" fill priority sizes="100vw" />
          <div className="home-hero-shade" />
          <div className="shell home-hero-content">
            <ScrollReveal className="home-hero-intro">
              <p className="eyebrow">Linhares, ES. Desde 2025.</p>
              <h1>
                A rua
                <br />
                <span>e nossa.</span>
              </h1>
              <p className="home-hero-copy">Uma comunidade feita para correr, pertencer e transformar a cidade em movimento.</p>
              <div className="actions">
                <Link className="button home-hero-button" href="/agenda">
                  Ver proximos treinos
                </Link>
                <Link className="text-action" href="/galeria">
                  Ver a comunidade <span aria-hidden="true">-&gt;</span>
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal className="home-hero-side" delay={180}>
              <span>URB / 01</span>
              <p>Movimento urbano para todos os ritmos.</p>
            </ScrollReveal>
          </div>
          <a className="home-scroll-cue" href="#movimento" aria-label="Ir para a proxima secao">
            <span />
          </a>
        </section>

        <section className="home-marquee" aria-label="Pilares da URBTRAIN">
          <div>Corrida <i /> Comunidade <i /> Impacto <i /> Linhares <i /> Corrida <i /> Comunidade <i /> Impacto</div>
        </section>

        <section className="section home-intro" id="movimento">
          <div className="shell home-intro-grid">
            <ScrollReveal>
              <p className="eyebrow dark">Mais que treino</p>
              <h2>Um movimento que encontra voce onde voce esta.</h2>
            </ScrollReveal>
            <ScrollReveal delay={120} className="home-intro-copy">
              <p className="lead">A URBTRAIN junta quem corre pela primeira vez, quem quer evoluir e quem sabe que a cidade fica melhor quando a gente ocupa as ruas junto.</p>
              <Link className="text-action dark-action" href="/agenda">
                Conheca a agenda <span aria-hidden="true">-&gt;</span>
              </Link>
            </ScrollReveal>
          </div>
        </section>

        <section className="home-image-statement">
          <Image src="/community.webp" alt="Comunidade URBTRAIN reunida" fill sizes="100vw" />
          <div className="shell home-image-statement-content">
            <ScrollReveal>
              <p className="eyebrow">Comunidade em movimento</p>
              <p className="statement">Cada km vira historia, amizade e vontade de voltar.</p>
            </ScrollReveal>
          </div>
        </section>

        <section className="section home-numbers">
          <div className="shell">
            <ScrollReveal className="home-section-header">
              <p className="eyebrow dark">Na rua, de verdade</p>
              <h2>Numeros que carregam historia.</h2>
            </ScrollReveal>
            <div className="home-stat-grid">
              {stats.map(([value, label], index) => (
                <ScrollReveal key={label} delay={index * 90}>
                  <div className="home-stat">
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section home-pillars-section">
          <div className="shell">
            <ScrollReveal className="home-section-header split-heading">
              <div>
                <p className="eyebrow dark">Nosso jeito</p>
                <h2>O que move a URBTRAIN.</h2>
              </div>
              <p>Sem pressa para caber em um unico ritmo. Com espaco para chegar, permanecer e fazer parte.</p>
            </ScrollReveal>
            <div className="home-pillars">
              {pillars.map(([number, title, text], index) => (
                <ScrollReveal key={number} delay={index * 100}>
                  <article>
                    <span>{number}</span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section home-shop-section">
          <div className="shell">
            <ScrollReveal className="home-shop-heading">
              <div>
                <p className="eyebrow dark">Estilo URBTRAIN</p>
                <h2>Vista o movimento.</h2>
              </div>
              <Link className="text-action dark-action" href="/loja">
                Ir para loja <span aria-hidden="true">-&gt;</span>
              </Link>
            </ScrollReveal>
            <div className="home-product-grid">
              {products.slice(0, 3).map((product, index) => (
                <ScrollReveal key={product.id} delay={index * 90}>
                  <article className="home-product">
                    <Image src={product.image} alt={product.name} width={800} height={800} />
                    <div>
                      <p className="eyebrow dark">{product.category}</p>
                      <h3>{product.name}</h3>
                      <strong>{money(product.price)}</strong>
                    </div>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="home-final-cta">
          <Image src="/impact.webp" alt="Acao social da URBTRAIN" fill sizes="100vw" />
          <div className="home-final-cta-shade" />
          <div className="shell home-final-cta-content">
            <ScrollReveal>
              <p className="eyebrow">O proximo km comeca agora</p>
              <h2>Chega junto.</h2>
              <p>Encontre um treino, conheca a galera e faca parte da rua.</p>
              <Link className="button home-hero-button" href="/agenda">
                Encontrar um treino
              </Link>
            </ScrollReveal>
          </div>
        </section>
      </main>
    </Shell>
  );
}
