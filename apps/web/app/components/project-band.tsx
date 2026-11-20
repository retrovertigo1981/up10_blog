import type { Page } from "@up10/api-client";

import { ButtonLink } from "./ui/button";
import { Image } from "./ui/image";

export function ProjectBand({ page }: { page: Page }) {
  return (
    <section aria-labelledby="unplugged-title" className="bg-paper py-16 lg:py-24">
      <div className="container-up10 grid items-center gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
        {page.hero.image ? (
          <Image data={page.hero.image} ratio="4:3" />
        ) : (
          <div className="bg-wine rounded-card aspect-[4/3] w-full" aria-hidden="true" />
        )}

        <div>
          <p className="font-heading text-wine text-sm uppercase tracking-[0.12em]">
            / Proyecto propio
          </p>

          <h2
            id="unplugged-title"
            className="font-heading text-wine mt-3 text-[clamp(2.5rem,5vw,4rem)] font-normal uppercase leading-none"
          >
            {page.title}
          </h2>

          <p className="text-ink/75 mt-5 max-w-md text-[17px] leading-relaxed">
            {page.hero.subtitle}
          </p>

          <p className="text-ink/60 mt-4 max-w-md text-sm leading-relaxed">
            Más de 50 sesiones íntimas que conectan artistas y audiencias. Una nueva etapa con
            grabaciones propias está en camino.
          </p>

          <ButtonLink to="/unplugged" variant="primary" className="mt-8">
            Conocer Unplugged →
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
