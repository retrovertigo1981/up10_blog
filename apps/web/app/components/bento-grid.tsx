import type { PostSummary } from "@up10/api-client";

import { cn } from "~/lib/cn";

import { ArticleCard } from "./article-card";

/**
 * Mosaico editorial inspirado en la referencia de Figma:
 * columna izquierda alta, derecha con una pieza ancha y dos pequeñas,
 * y una fila inferior de tres piezas. Con 10 noticias en portada,
 * el hero toma las 3 más recientes y aquí quedan las 7 restantes.
 */
export function BentoGrid({ posts, className }: { posts: PostSummary[]; className?: string }) {
  const [lead, ...rest] = posts;
  const rightTop = rest[0];
  const rightSmall = rest.slice(1, 3);
  const bottom = rest.slice(3);

  if (!lead) return null;

  return (
    <div className={cn("grid gap-6 md:grid-cols-2", className)}>
      <ArticleCard
        post={lead}
        variant="overlay"
        priority
        className="min-h-[440px] md:col-span-2 md:min-h-[520px] lg:col-span-1 lg:min-h-[640px]"
      />

      <div className="grid gap-6 md:col-span-2 lg:col-span-1">
        {rightTop ? (
          <ArticleCard
            post={rightTop}
            variant="overlay"
            className="min-h-[260px] lg:min-h-[300px]"
          />
        ) : null}

        {rightSmall.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {rightSmall.map((post) => (
              <ArticleCard
                key={post.id}
                post={post}
                variant="overlay"
                className="min-h-[260px] lg:min-h-[316px]"
              />
            ))}
          </div>
        ) : null}
      </div>

      {bottom.length > 0 ? (
        <div
          className={cn(
            "grid gap-6 md:col-span-2",
            bottom.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3",
          )}
        >
          {bottom.map((post) => (
            <ArticleCard
              key={post.id}
              post={post}
              variant="overlay"
              className="min-h-[220px] lg:min-h-[260px]"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
