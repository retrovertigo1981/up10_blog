import type { Route } from "./+types/page";

import { Link } from "react-router";

import { ApiClientError } from "@up10/api-client";

import { ArticleBody } from "~/components/article-body";
import { Breadcrumbs } from "~/components/ui/breadcrumbs";
import { Image } from "~/components/ui/image";
import { api, siteUrl } from "~/lib/api";
import { institutionalPage } from "~/lib/institutional";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const slug =
    new URL(request.url).pathname
      .replace(/^\/+|\/+$/g, "")
      .split("/")
      .pop() ?? "";

  try {
    const { data } = await api.page(slug);
    return { page: data, slug };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      return { page: null, slug };
    }

    throw error;
  }
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  const page = loaderData?.page;
  const fallback = institutionalPage(loaderData?.slug ?? "");

  if (!page) {
    return [
      { title: `${fallback.title} — UP10` },
      { name: "description", content: fallback.description },
      { name: "robots", content: "noindex" },
    ];
  }

  const canonical = `${siteUrl}/${page.slug}`;

  return [
    { title: `${page.seo.title} — UP10` },
    { name: "description", content: page.seo.description },
    { property: "og:type", content: "website" },
    { property: "og:title", content: page.seo.title },
    { property: "og:description", content: page.seo.description },
    { property: "og:url", content: canonical },
    ...(page.seo.noindex ? [{ name: "robots", content: "noindex" }] : []),
    { tagName: "link", rel: "canonical", href: canonical },
  ];
};

export default function PageRoute({ loaderData }: Route.ComponentProps) {
  const { page, slug } = loaderData;
  const fallback = institutionalPage(slug);

  if (!page) {
    return (
      <section className="container-up10 flex min-h-[60vh] flex-col justify-center py-24">
        <p className="font-heading text-wine text-sm uppercase tracking-[0.12em]">
          / En preparación
        </p>

        <h1 className="font-heading text-wine mt-3 text-[clamp(3rem,7vw,6rem)] font-normal uppercase leading-none">
          {fallback.title}
        </h1>

        <p className="text-ink/70 mt-5 max-w-lg text-lg leading-relaxed">{fallback.description}</p>

        <p className="text-ink/50 mt-3 max-w-lg text-sm">
          Estamos trabajando en esta sección. Mientras tanto, puedes volver a la portada.
        </p>

        <Link
          to="/"
          className="bg-wine text-cream rounded-button mt-8 inline-flex min-h-11 w-fit items-center px-5 text-[12px] font-semibold uppercase tracking-[0.08em]"
        >
          Volver a la portada
        </Link>
      </section>
    );
  }

  return (
    <article className="container-up10 py-10 lg:py-16">
      <div className="mx-auto max-w-4xl">
        <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: page.hero.title }]} />

        <header className="mt-6">
          <p className="font-heading text-wine text-sm uppercase tracking-[0.12em]">/ UP10</p>

          <h1 className="font-heading text-wine mt-3 text-[clamp(2.6rem,6vw,5rem)] font-normal leading-[1.02]">
            {page.hero.title}
          </h1>

          {page.hero.subtitle ? (
            <p className="text-ink/70 mt-4 max-w-2xl text-lg leading-relaxed">
              {page.hero.subtitle}
            </p>
          ) : null}
        </header>
      </div>

      {page.hero.image ? (
        <div className="mx-auto mt-10 max-w-5xl">
          <Image
            data={page.hero.image}
            ratio="16:9"
            priority
            sizes="(min-width: 1024px) 1024px, 100vw"
          />
        </div>
      ) : null}

      <div className="mx-auto mt-10 max-w-3xl">
        <ArticleBody
          html={page.html}
          emptyMessage="El contenido de esta página aún no está disponible."
        />
      </div>
    </article>
  );
}
