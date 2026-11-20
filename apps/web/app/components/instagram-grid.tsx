import type { InstagramPost } from "@up10/api-client";

import { Image } from "./ui/image";
import { SectionHeading } from "./ui/section-heading";

export function InstagramGrid({ posts }: { posts: InstagramPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="instagram-title" className="container-up10 py-16 lg:py-24">
      <SectionHeading
        id="instagram-title"
        eyebrow="/ @up10.cl"
        action={{ label: "Ver más en Instagram", href: "https://www.instagram.com/up10.cl/" }}
      >
        INSTAGRAM
      </SectionHeading>

      <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {posts.slice(0, 10).map((post) => (
          <li key={post.id}>
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
