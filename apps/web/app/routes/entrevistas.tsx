import type { Route } from "./+types/entrevistas";

import { ArchivePage } from "~/components/archive-page";
import { api, siteUrl } from "~/lib/api";
import { getPageFromRequest } from "~/lib/request";

async function loadInterviews(page: number) {
  const { data, meta } = await api.posts({ tipo: "entrevista", page, perPage: 12 });

  return { posts: data, pagination: meta?.pagination ?? null, page };
}

export async function loader({ request }: Route.LoaderArgs) {
  return loadInterviews(getPageFromRequest(request));
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return loadInterviews(getPageFromRequest(request));
}
clientLoader.hydrate = import.meta.env.VITE_LIVE_CONTENT !== "false";

export const meta: Route.MetaFunction = ({ loaderData }) => {
  const page = loaderData?.page ?? 1;
  const title = page > 1 ? `Entrevistas — página ${page} — UP10` : "Entrevistas — UP10";
  const description =
    "Conversaciones con artistas, productores y protagonistas de la industria musical.";
  const canonical = `${siteUrl}/entrevistas${page > 1 ? `?page=${page}` : ""}`;

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: canonical },
    { tagName: "link", rel: "canonical", href: canonical },
  ];
};

export default function Entrevistas({ loaderData }: Route.ComponentProps) {
  return (
    <ArchivePage
      eyebrow="/ Formato"
      title="Entrevistas"
      description="Conversaciones con artistas, productores y protagonistas de la escena musical."
      posts={loaderData.posts}
      pagination={loaderData.pagination}
      basePath="/entrevistas"
      emptyTitle="Aún no hay entrevistas"
      emptyDescription="Estamos preparando las primeras conversaciones. Mientras tanto, revisa las últimas noticias."
    />
  );
}
