import type { Route } from "./+types/buscar";

import { Form } from "react-router";

import { ArticleCard } from "~/components/article-card";
import { EmptyState } from "~/components/ui/empty-state";
import { api } from "~/lib/api";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const query = (new URL(request.url).searchParams.get("q") ?? "").trim();

  if (!query) {
    return { query, posts: [] };
  }

  const { data } = await api.search({ q: query, perPage: 24 });

  return { query, posts: data };
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  const query = loaderData?.query;
  const title = query ? `Buscar: ${query} — UP10` : "Buscar — UP10";

  return [
    { title },
    { name: "robots", content: "noindex" },
    { name: "description", content: "Busca noticias, entrevistas y artistas en UP10." },
  ];
};

export default function Buscar({ loaderData }: Route.ComponentProps) {
  const { query, posts } = loaderData;

  return (
    <section className="container-up10 py-14 lg:py-20">
      <header className="border-wine/15 border-b pb-8">
        <p className="font-heading text-wine text-sm uppercase tracking-[0.12em]">/ Buscador</p>
        <h1 className="font-heading text-wine mt-3 text-[clamp(3rem,7vw,6rem)] font-normal uppercase leading-none">
          Buscar
        </h1>
        <p className="text-ink/70 mt-4 max-w-2xl text-lg leading-relaxed">
          Encuentra noticias, entrevistas y artistas en el archivo de UP10.
        </p>
      </header>

      <Form method="get" action="/buscar" className="mt-8 flex max-w-2xl gap-3">
        <label htmlFor="buscar-q" className="sr-only">
          Buscar en UP10
        </label>
        <input
          key={query}
          id="buscar-q"
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Artistas, notas, entrevistas…"
          className="border-wine/30 rounded-button focus:border-wine h-12 min-w-0 flex-1 border bg-transparent px-4 text-base outline-none"
        />
        <button
          type="submit"
          className="bg-wine text-cream rounded-button font-display inline-flex min-h-12 items-center px-6 text-[13px] font-semibold uppercase tracking-[0.08em]"
        >
          Buscar
        </button>
      </Form>

      {query ? (
        posts.length > 0 ? (
          <>
            <p className="text-ink/60 mt-8 text-sm">
              {posts.length} {posts.length === 1 ? "resultado" : "resultados"} para “{query}”.
            </p>

            <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, index) => (
                <ArticleCard
                  key={post.id}
                  post={post}
                  variant={index === 0 ? "feature" : "standard"}
                  className={index === 0 ? "sm:col-span-2 lg:col-span-2" : undefined}
                />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            title="Sin resultados"
            description={`No encontramos notas para “${query}”. Prueba con otro término o revisa las últimas noticias.`}
            cta={{ label: "Ver noticias", href: "/noticias" }}
          />
        )
      ) : (
        <p className="text-ink/50 mt-10 text-base">
          Escribe un término para buscar en las notas, entrevistas y archivo.
        </p>
      )}
    </section>
  );
}
