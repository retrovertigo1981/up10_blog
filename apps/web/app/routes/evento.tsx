import type { Route } from "./+types/evento";

import { ApiClientError } from "@up10/api-client";

import { EventPage } from "~/components/event-page";
import { api, siteUrl } from "~/lib/api";

async function loadEvent(slug: string) {
  try {
    const { data } = await api.event(slug);
    return { event: data };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      throw new Response("Evento no encontrado", { status: 404 });
    }

    throw error;
  }
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return loadEvent(params.slug);
}
clientLoader.hydrate = import.meta.env.VITE_LIVE_CONTENT !== "false";

export const meta: Route.MetaFunction = ({ loaderData }) => {
  const event = loaderData?.event;

  if (!event) {
    return [{ title: "Evento — UP10" }];
  }

  const canonical = `${siteUrl}/eventos/${event.slug}`;

  return [
    { title: `${event.seo.title} — UP10` },
    { name: "description", content: event.seo.description },
    { property: "og:type", content: "article" },
    { property: "og:title", content: event.seo.title },
    { property: "og:description", content: event.seo.description },
    { property: "og:url", content: canonical },
    { property: "og:image", content: event.image.src },
    ...(event.seo.noindex ? [{ name: "robots", content: "noindex" }] : []),
    { tagName: "link", rel: "canonical", href: canonical },
  ];
};

export default function Evento({ loaderData }: Route.ComponentProps) {
  return <EventPage event={loaderData.event} />;
}
