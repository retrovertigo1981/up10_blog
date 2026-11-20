import type { Route } from "./+types/styleguide";

export const meta: Route.MetaFunction = () => [
  { title: "Style guide — UP10" },
  { name: "robots", content: "noindex" },
];

const colors = [
  { name: "cream", value: "#FAE3B9", className: "bg-cream", text: "text-ink" },
  { name: "wine", value: "#57000B", className: "bg-wine", text: "text-cream" },
  { name: "paper", value: "#FFF8E8", className: "bg-paper", text: "text-ink" },
  { name: "ink", value: "#000000", className: "bg-ink", text: "text-paper" },
] as const;

export default function Styleguide() {
  return (
    <div className="container-up10 space-y-16 py-16">
      <header>
        <p className="font-heading text-wine text-sm tracking-[0.1em]">/ INTERNO</p>
        <h1 className="mt-3 text-4xl">Style guide</h1>
        <p className="text-ink/70 mt-3 max-w-2xl">
          Referencia viva de tokens y componentes. No indexada. Se amplía en cada sprint.
        </p>
      </header>

      <section aria-labelledby="color">
        <h2 id="color" className="text-2xl">
          Color
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {colors.map((color) => (
            <div
              key={color.name}
              className={`rounded-card border-wine-soft border p-6 ${color.className} ${color.text}`}
            >
              <p className="font-heading uppercase tracking-wide">{color.name}</p>
              <p className="mt-1 font-mono text-sm opacity-80">{color.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="type">
        <h2 id="type" className="text-2xl">
          Tipografía
        </h2>
        <div className="mt-6 space-y-6">
          <p className="font-heading text-[clamp(2.5rem,6vw,5rem)] leading-none">
            APERTURA DE SECCIÓN
          </p>
          <p className="font-display text-[2.625rem] leading-[1.05]">
            Titular principal en Integral CF
          </p>
          <p className="font-display text-2xl">Título de tarjeta</p>
          <p className="font-heading text-xl uppercase tracking-[0.05em]">Etiqueta de categoría</p>
          <p className="max-w-2xl text-xl leading-relaxed">
            Cuerpo de lectura. Carrois Gothic se usa por ahora; la tipografía definitiva se decide
            con el cliente.
          </p>
          <p className="text-ink/60 text-sm">Metadatos · Autor · Fecha · 5 min de lectura</p>
        </div>
      </section>

      <section aria-labelledby="components">
        <h2 id="components" className="text-2xl">
          Componentes
        </h2>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button className="bg-wine text-cream rounded-button px-6 py-3 text-sm font-semibold uppercase tracking-wide">
            Botón primario
          </button>
          <button className="border-wine text-wine rounded-button border px-6 py-3 text-sm font-semibold uppercase tracking-wide">
            Botón secundario
          </button>
          <span className="bg-paper rounded-card border-wine-soft border px-4 py-2 text-sm">
            Tarjeta
          </span>
          <span className="to-wine rounded-card text-cream bg-gradient-to-br from-black px-4 py-2 text-sm">
            Degradado nocturno
          </span>
        </div>
      </section>
    </div>
  );
}
