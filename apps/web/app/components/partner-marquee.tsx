import type { Partner } from "@up10/api-client";
import { useState } from "react";

function PartnerName({ partner }: { partner: Partner }) {
  return (
    <span className="font-heading font-normal text-wine/80 text-xl tracking-wide uppercase">
      {partner.name}
    </span>
  );
}

export function PartnerMarquee({ partners }: { partners: Partner[] }) {
  const [paused, setPaused] = useState(false);

  if (partners.length === 0) return null;

  return (
    <section aria-labelledby="partners-title" className="border-wine/15 border-y py-14">
      <div className="container-up10">
        <h2
          id="partners-title"
          className="font-heading font-normal text-wine text-center text-[clamp(1.5rem,3vw,2.25rem)] uppercase"
        >
          Marcas que han confiado en UP10
        </h2>
      </div>

      <div className="marquee relative mt-8 hidden overflow-hidden sm:block">
        <div
          className="marquee-track flex w-max items-center"
          style={{ animationPlayState: paused ? "paused" : undefined }}
        >
          <ul className="flex items-center gap-14">
            {partners.map((partner) => (
              <li key={partner.id} className="shrink-0 opacity-70">
                <PartnerName partner={partner} />
              </li>
            ))}
          </ul>

          <ul aria-hidden="true" className="flex items-center gap-14 pl-14">
            {partners.map((partner) => (
              <li key={`dup-${partner.id}`} className="shrink-0 opacity-70">
                <PartnerName partner={partner} />
              </li>
            ))}
          </ul>
        </div>

        <div
          aria-hidden="true"
          className="from-cream pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l to-transparent"
        />

        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
          className="border-wine/20 text-wine hover:bg-wine hover:text-cream absolute top-1/2 right-4 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border transition-colors"
        >
          <span className="sr-only">{paused ? "Reanudar marcas" : "Pausar marcas"}</span>
          <span aria-hidden="true" className="text-[10px] leading-none">
            {paused ? "▶" : "❚❚"}
          </span>
        </button>
      </div>

      <ul className="container-up10 mt-8 grid grid-cols-2 gap-4 sm:hidden">
        {partners.map((partner) => (
          <li key={`grid-${partner.id}`} className="text-center">
            <PartnerName partner={partner} />
          </li>
        ))}
      </ul>
    </section>
  );
}
