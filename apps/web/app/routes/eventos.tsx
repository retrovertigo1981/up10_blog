import type { Route } from "./+types/eventos";

import { Link } from "react-router";

import { EventCard } from "~/components/event-card";
import { EmptyState } from "~/components/ui/empty-state";
import { api, siteUrl } from "~/lib/api";
import { cn } from "~/lib/cn";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const scopeParam = new URL(request.url).searchParams.get("scope");
  const scope = scopeParam === "past" ? "past" : "upcoming";
  const { data } = await api.events({ scope });

  return { events: data, scope };
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  const past = loaderData?.scope === "past";
  const title = past ? "Eventos pasados — UP10" : "Eventos — UP10";
  const description =
    "Próximos conciertos, festivales y fechas de la escena musical chilena y latinoamericana.";
  const canonical = `${siteUrl}/eventos${past ? "?scope=past" : ""}`;

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

export default function Eventos({ loaderData }: Route.ComponentProps) {
  const past = loaderData.scope === "past";

  return (
    <section className="container-up10 py-14 lg:py-20">
      <header className="border-wine/15 border-b pb-8">
        <p className="font-heading text-wine text-sm uppercase tracking-[0.12em]">/ Agenda</p>
        <h1 className="font-heading text-wine mt-3 text-[clamp(3rem,7vw,6rem)] font-normal uppercase leading-none">
          Eventos
        </h1>
        <p className="text-ink/70 mt-4 max-w-2xl text-lg leading-relaxed">
          Próximos conciertos, festivales y fechas de la escena musical chilena y latinoamericana.
        </p>
      </header>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          to="/eventos"
          className={cn(
            "border-wine/25 text-wine rounded-button inline-flex min-h-10 items-center border px-4 text-xs uppercase tracking-[0.08em] transition-colors",
            !past && "bg-wine text-cream border-wine",
          )}
        >
          Próximos
        </Link>
        <Link
          to="/eventos?scope=past"
          className={cn(
            "border-wine/25 text-wine rounded-button inline-flex min-h-10 items-center border px-4 text-xs uppercase tracking-[0.08em] transition-colors",
            past && "bg-wine text-cream border-wine",
          )}
        >
          Pasados
        </Link>
      </div>

      {loaderData.events.length > 0 ? (
        <div className="mt-10 grid gap-5">
          {loaderData.events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={past ? "Aún no hay eventos pasados" : "Aún no hay eventos"}
          description={
            past
              ? "Cuando se realicen los primeros eventos, aparecerán aquí."
              : "Estamos preparando la agenda. Mientras tanto, revisa las últimas noticias."
          }
          cta={{ label: "Volver a la portada", href: "/" }}
        />
      )}
    </section>
  );
}
