import type { Route } from "./+types/noticias";

import { ArchivePage } from "~/components/archive-page";
import { api, siteUrl } from "~/lib/api";
import { defaultOgMetadata } from "~/lib/seo";
import { getPageFromRequest } from "~/lib/request";

async function loadPosts(page: number) {
  const { data, meta } = await api.posts({ page, perPage: 12 });

  return { posts: data, pagination: meta?.pagination ?? null, page };
}

export async function loader({ request }: Route.LoaderArgs) {
  return loadPosts(getPageFromRequest(request));
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return loadPosts(getPageFromRequest(request));
}
clientLoader.hydrate = import.meta.env.VITE_LIVE_CONTENT !== "false";

export const meta: Route.MetaFunction = ({ loaderData }) => {
  const page = loaderData?.page ?? 1;
  const title = page > 1 ? `Noticias — página ${page} — UP10` : "Noticias — UP10";
  const description =
    "Toda la actualidad musical, entrevistas, lanzamientos y conciertos de la escena chilena y latinoamericana.";
  const canonical = `${siteUrl}/noticias${page > 1 ? `?page=${page}` : ""}`;

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

export default function Noticias({ loaderData }: Route.ComponentProps) {
  return (
    <ArchivePage
      eyebrow="/ Archivo"
      title="Noticias"
      description="Toda la actualidad musical, ordenada de la más reciente a la más antigua."
      posts={loaderData.posts}
      pagination={loaderData.pagination}
      basePath="/noticias"
      emptyTitle="Aún no hay noticias"
      emptyDescription="Estamos preparando las primeras publicaciones. Vuelve pronto o revisa la portada."
    />
  );
}
