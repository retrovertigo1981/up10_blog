import type { InstagramPost } from "@up10/api-client";

import { ButtonLink } from "./ui/button";
import { Image } from "./ui/image";
import { SectionHeading } from "./ui/section-heading";

const INSTAGRAM_URL = "https://www.instagram.com/up10.cl/";

export function InstagramGrid({ posts }: { posts: InstagramPost[] }) {
  if (posts.length === 0) {
    return (
      <section aria-labelledby="instagram-title" className="container-up10 py-16 lg:py-24">
        <SectionHeading
          id="instagram-title"
          eyebrow="/ @up10.cl"
          action={{ label: "Ver más en Instagram", href: INSTAGRAM_URL }}
        >
          INSTAGRAM
        </SectionHeading>

        <div
          data-reveal
          className="border-wine/20 bg-paper rounded-card mt-10 flex flex-col items-start gap-4 border p-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-heading text-wine text-xl uppercase">Síguenos en Instagram</p>
            <p className="text-ink/70 mt-1 text-sm leading-relaxed">
              Las últimas publicaciones de la cuenta aparecerán aquí.
            </p>
          </div>
          <ButtonLink to={INSTAGRAM_URL} variant="primary">
            Ver @up10.cl →
          </ButtonLink>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="instagram-title" className="container-up10 py-16 lg:py-24">
      <SectionHeading
        id="instagram-title"
        eyebrow="/ @up10.cl"
        action={{ label: "Ver más en Instagram", href: INSTAGRAM_URL }}
      >
        INSTAGRAM
      </SectionHeading>

      <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {posts.slice(0, 10).map((post) => (
          <li key={post.id} data-reveal>
            <a
              href={post.permalink}
              target="_blank"
              rel="noreferrer noopener"
              className="group block"
              aria-label={post.caption ?? "Ver publicación en Instagram"}
            >
              <Image
                data={post.image}
                ratio="1:1"
                className="rounded-card"
                imgClassName="transition-transform duration-300 group-hover:scale-[1.04]"
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
