import type { Event } from "@up10/api-client";

import { ArticleBody } from "./article-body";
import { JsonLd } from "./json-ld";
import { ButtonLink } from "./ui/button";
import { Breadcrumbs } from "./ui/breadcrumbs";
import { Image } from "./ui/image";

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "full",
  timeZone: "America/Santiago",
});

function eventDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export function EventPage({ event }: { event: Event }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.date,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: [event.image.src],
    description: event.seo.description,
    location: {
      "@type": "Place",
      name: event.venue,
      address: {
        "@type": "PostalAddress",
        addressLocality: event.city,
        addressCountry: "CL",
      },
    },
    ...(event.ticketUrl
      ? {
          offers: {
            "@type": "Offer",
            url: event.ticketUrl,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      <article className="container-up10 py-10 lg:py-16">
        <div className="mx-auto max-w-4xl">
          <Breadcrumbs
            items={[
              { label: "Inicio", href: "/" },
              { label: "Eventos", href: "/eventos" },
              { label: event.title },
            ]}
          />

          <header className="mt-6">
            <p className="font-heading text-wine text-sm uppercase tracking-[0.12em]">/ Evento</p>

            <h1 className="font-heading text-wine mt-3 text-[clamp(2.4rem,5vw,4.5rem)] font-normal leading-[1.03]">
              {event.title}
            </h1>

            <p className="text-ink/70 mt-5 text-base">
              {eventDate(event.date)} · {event.time} hrs
            </p>

            <p className="text-ink/60 mt-1 text-sm">
              {event.venue}
              {event.city ? ` · ${event.city}` : null}
            </p>

            {event.ticketUrl ? (
              <ButtonLink to={event.ticketUrl} className="mt-6">
                Comprar entradas →
              </ButtonLink>
            ) : (
              <span className="border-wine/25 text-wine/60 rounded-button mt-6 inline-flex min-h-11 items-center border px-5 text-[11px] uppercase tracking-[0.08em]">
                Entradas próximamente
              </span>
            )}
          </header>
        </div>

        <div className="mx-auto mt-10 max-w-5xl">
          <Image
            data={event.image}
            ratio="16:9"
            priority
            sizes="(min-width: 1024px) 1024px, 100vw"
          />
        </div>

        <div className="mx-auto mt-10 max-w-3xl">
          <ArticleBody
            html={event.descriptionHtml}
            emptyMessage="La descripción del evento aún no está disponible."
          />

          {event.lineup.length > 0 ? (
            <section aria-labelledby="lineup" className="border-wine/15 mt-10 border-t pt-8">
              <h2 id="lineup" className="font-heading text-wine text-2xl font-normal uppercase">
                Line-up
              </h2>

              <ul className="mt-4 flex flex-wrap gap-2">
                {event.lineup.map((artist) => (
                  <li key={artist.name}>
                    {artist.url ? (
                      <a
                        href={artist.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="border-wine/25 text-wine hover:bg-wine hover:text-cream rounded-button inline-flex min-h-9 items-center border px-3 text-sm transition-colors"
                      >
                        {artist.name}
                      </a>
                    ) : (
                      <span className="border-wine/25 text-wine rounded-button inline-flex min-h-9 items-center border px-3 text-sm">
                        {artist.name}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </article>
    </>
  );
}
