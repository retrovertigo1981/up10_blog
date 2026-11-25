import type { Route } from "./+types/categoria";

import { ArchivePage } from "~/components/archive-page";
import { api, siteUrl } from "~/lib/api";
import { defaultOgMetadata } from "~/lib/seo";
import { getPageFromRequest } from "~/lib/request";

async function loadCategory(slug: string | undefined, page: number) {
  if (!slug) {
    throw new Response("Sección no encontrada", { status: 404 });
  }

  const [categories, posts] = await Promise.all([
    api.categories(),
    api.posts({ category: slug, page, perPage: 12 }),
  ]);

  const category =
    categories.data.find((item) => item.slug === slug) ?? posts.data[0]?.category ?? null;

  if (!category) {
    throw new Response("Sección no encontrada", { status: 404 });
  }

  return {
    category,
    posts: posts.data,
    pagination: posts.meta?.pagination ?? null,
    page,
  };
}

export async function loader({ params, request }: Route.LoaderArgs) {
  return loadCategory(params.slug, getPageFromRequest(request));
}

export async function clientLoader({ params, request }: Route.ClientLoaderArgs) {
  return loadCategory(params.slug, getPageFromRequest(request));
}
clientLoader.hydrate = import.meta.env.VITE_LIVE_CONTENT !== "false";

export const meta: Route.MetaFunction = ({ loaderData }) => {
  const page = loaderData?.page ?? 1;
  const category = loaderData?.category;
  const name = category?.name ?? "Sección";
  const title = page > 1 ? `${name} — página ${page} — UP10` : `${name} — UP10`;
  const description = category
    ? `Noticias y artículos de ${category.name} en UP10.`
    : "Sección de UP10.";
  const canonical = category
    ? `${siteUrl}/categoria/${category.slug}${page > 1 ? `?page=${page}` : ""}`
    : siteUrl;

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: canonical },
    ...defaultOgMetadata(),
    { tagName: "link", rel: "canonical", href: canonical },
  ];
};

export default function Categoria({ loaderData }: Route.ComponentProps) {
  const { category } = loaderData;

  return (
    <ArchivePage
      eyebrow="/ Sección"
      title={category.name}
      description={`Todas las notas de ${category.name} en UP10.`}
      posts={loaderData.posts}
      pagination={loaderData.pagination}
      basePath={`/categoria/${category.slug}`}
      emptyTitle="Esta sección está en preparación"
      emptyDescription="Todavía no hay publicaciones en esta sección. Mientras tanto, puedes revisar las últimas noticias."
    />
  );
}
