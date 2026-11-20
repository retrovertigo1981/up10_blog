import { Link } from "react-router";
import type { Route } from "./+types/home";

export const meta: Route.MetaFunction = () => [
  { title: "UP10 — Revista musical" },
  {
    name: "description",
    content: "Noticias, entrevistas, rankings y eventos de la música chilena y latinoamericana.",
  },
];

const placeholderPosts = [
  { category: "Música chilena", title: "Los sonidos que están marcando la escena local" },
  { category: "Entrevistas", title: "Conversamos con una de las voces del momento" },
  { category: "Lanzamientos", title: "Lo nuevo de la semana, en diez escuchas" },
] as const;

export default function Home() {
  return (
    <>
      <section className="container-up10 pb-16 pt-10 lg:pt-16">
        <p className="font-heading text-wine text-base tracking-[0.05em]">/ NOTICIAS</p>

        <div className="mt-6 grid items-end gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <h1 className="text-[clamp(2rem,4vw,2.625rem)] leading-[1.05]">
              Music Awards Santander 2026: dónde ver EN VIVO la premiación desde Chile
            </h1>
            <p className="text-ink/75 mt-5 max-w-[26rem] text-[17px] leading-relaxed lg:text-xl">
              Este viernes 20 de noviembre se celebra una nueva edición de los premios, con
              destacados artistas internacionales.
            </p>
            <a
              href="#ultimo"
              className="text-wine mt-6 inline-block text-[17px] underline decoration-2 underline-offset-[6px]"
            >
              Leer reportaje →
            </a>
          </div>

          <div
            className="bg-wine rounded-card min-h-[320px] w-full lg:min-h-[440px]"
            role="img"
            aria-label="Espacio reservado para la fotografía principal"
          >
            <div className="flex h-full min-h-[320px] items-end p-6 lg:min-h-[440px]">
              <span className="text-cream/70 font-heading text-sm tracking-[0.15em]">
                FOTOGRAFÍA PRINCIPAL
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="border-wine bg-paper overflow-hidden border-y py-3">
        <div className="container-up10 font-heading flex flex-wrap items-center gap-x-8 gap-y-2 text-sm tracking-wide">
          <span aria-hidden="true">●</span>
          <span>Kidd Keo suelta Back to the Bone</span>
          <span aria-hidden="true">●</span>
          <span>Movida Urbana: guía del fin de semana</span>
          <span aria-hidden="true">●</span>
          <span>Bad Bunny anuncia tour sudamericano</span>
        </div>
      </div>

      <section id="ultimo" className="container-up10 py-16 lg:py-24">
        <div className="flex items-end justify-between gap-6">
          <h2 className="font-heading text-[clamp(2.5rem,6vw,5rem)] leading-none">LO ÚLTIMO</h2>
          <Link to="/noticias" className="text-ink/70 hover:text-wine hidden text-sm sm:block">
            Ver archivo →
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {placeholderPosts.map((post) => (
            <article key={post.title} className="group">
              <div className="bg-wine/10 rounded-card aspect-[4/3] w-full" aria-hidden="true" />
              <p className="font-heading text-wine mt-4 text-sm uppercase tracking-[0.05em]">
                {post.category}
              </p>
              <h3 className="mt-2 text-xl leading-tight group-hover:underline group-hover:underline-offset-4">
                {post.title}
              </h3>
            </article>
          ))}
        </div>

        <p className="text-ink/50 mt-12 max-w-2xl text-sm">
          Sprint 0: estructura base del frontend. Las secciones completas, los datos reales y el
          resto de las rutas se implementan en los sprints 1 a 3 según{" "}
          <code className="bg-paper rounded px-1.5 py-0.5">docs/plan-desarrollo-up10.md</code>.
        </p>
      </section>
    </>
  );
}
