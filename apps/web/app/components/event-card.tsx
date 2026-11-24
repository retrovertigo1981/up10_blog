import type { EventSummary } from "@up10/api-client";
import { Link } from "react-router";

import { cn } from "~/lib/cn";

import { ButtonLink } from "./ui/button";
import { Image } from "./ui/image";

const dayFormatter = new Intl.DateTimeFormat("es-CL", {
  day: "2-digit",
  timeZone: "America/Santiago",
});

const monthFormatter = new Intl.DateTimeFormat("es-CL", {
  month: "short",
  timeZone: "America/Santiago",
});

function eventDate(value: string) {
  const date = new Date(value);

  return {
    day: dayFormatter.format(date),
    month: monthFormatter.format(date).replace(".", ""),
  };
}

export function EventCard({ event, className }: { event: EventSummary; className?: string }) {
  const date = eventDate(event.date);

  return (
    <article
      data-reveal
      className={cn(
        "from-wine to-wine/70 text-cream rounded-card grid overflow-hidden bg-gradient-to-br via-black sm:grid-cols-[110px_minmax(0,1fr)_220px]",
        className,
      )}
    >
      <div className="flex items-center justify-center gap-2 bg-black/25 p-4 sm:flex-col sm:gap-0">
        <span className="font-heading text-3xl uppercase leading-none">{date.day}</span>
        <span className="font-heading text-cream/70 text-sm uppercase tracking-[0.12em]">
          {date.month}
        </span>
      </div>

      <div className="flex min-w-0 flex-col justify-center gap-2 p-5">
        <p className="font-heading text-cream/70 text-xs uppercase tracking-[0.1em]">
          {event.time} hrs · {event.city}
        </p>

        <h3 className="font-heading text-xl uppercase leading-tight">
          <Link to={`/eventos/${event.slug}`} className="hover:text-paper transition-colors">
            {event.title}
          </Link>
        </h3>

        <p className="text-cream/70 text-sm">
          {event.venue}
          {event.city ? ` · ${event.city}` : null}
        </p>

        {event.ticketUrl ? (
          <ButtonLink to={event.ticketUrl} variant="inverse" size="sm" className="mt-2 w-fit">
            Entradas →
          </ButtonLink>
        ) : (
          <span className="border-cream/30 text-cream/60 rounded-button mt-2 inline-flex min-h-9 w-fit items-center border px-4 text-[11px] uppercase tracking-[0.08em]">
            Entradas próximamente
          </span>
        )}
      </div>

      <div className="relative min-h-44 sm:min-h-full">
        <Image data={event.image} fill sizes="(min-width: 640px) 220px, 100vw" />
      </div>
    </article>
  );
}
