import type { PostSummary } from "@up10/api-client";
import { Link } from "react-router";

import { cn } from "~/lib/cn";

import { Image } from "./ui/image";

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "short",
});

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

type Variant = "hero" | "feature" | "standard" | "compact" | "overlay";

const titleSizes: Record<Exclude<Variant, "overlay">, string> = {
  hero: "text-[clamp(2rem,4vw,2.625rem)] leading-[1.05]",
  feature: "text-[clamp(1.5rem,2.4vw,1.875rem)] leading-[1.12]",
  standard: "text-[clamp(1.25rem,1.9vw,1.625rem)] leading-[1.12]",
  compact: "text-[1.0625rem] leading-[1.18]",
};

/** Integral CF no tiene minúsculas reales: se reserva para el hero. */
const displayTitle = "font-display uppercase";
const secondaryTitle = "font-heading font-normal normal-case";

export function ArticleCard({
  post,
  variant = "standard",
  priority = false,
  className,
}: {
  post: PostSummary;
  variant?: Variant;
  priority?: boolean;
  className?: string;
}) {
  const titleFont = variant === "hero" ? displayTitle : secondaryTitle;

  if (variant === "overlay") {
    return (
      <article
        data-reveal
        className={cn("bg-wine rounded-card @container group relative overflow-hidden", className)}
      >
        <Link
          to={`/noticias/${post.slug}`}
          className="focus-visible:outline-cream flex h-full flex-col justify-end focus-visible:outline-2 focus-visible:outline-offset-[-4px]"
        >
          <Image
            data={post.cover}
            fill
            priority={priority}
            imgClassName="transition-transform duration-500 group-hover:scale-[1.04]"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/15 transition-opacity duration-300 group-hover:opacity-95"
          />

          <div className="relative flex flex-col gap-2 p-[clamp(1rem,3cqi,1.5rem)]">
            <p className="font-heading text-cream/85 text-[clamp(0.65rem,1.3cqi,0.8rem)] uppercase tracking-[0.1em]">
              {post.category.name}
            </p>

            <h3
              className={cn(
                "text-cream group-hover:text-paper line-clamp-4 text-[clamp(1.35rem,5cqi,2.75rem)] leading-[1.08] transition-colors",
                titleFont,
              )}
            >
              {post.title}
            </h3>
          </div>
        </Link>
      </article>
    );
  }

  const Heading = variant === "hero" ? "h1" : "h3";
  const ratio = variant === "feature" ? "4:3" : variant === "hero" ? "3:2" : "16:9";

  if (variant === "compact") {
    return (
      <article data-reveal className={cn("group", className)}>
        <Link to={`/noticias/${post.slug}`} className="flex items-start gap-4">
          <Image
            data={post.cover}
            ratio="1:1"
            className="w-20 shrink-0"
            imgClassName="transition-transform duration-300 group-hover:scale-[1.04]"
          />
          <div className="min-w-0">
            <p className="font-heading text-wine text-xs uppercase tracking-[0.05em]">
              {post.category.name}
            </p>
            <Heading
              className={cn(
                "group-hover:text-wine mt-1 line-clamp-3 transition-colors",
                titleFont,
                titleSizes.compact,
              )}
            >
              {post.title}
            </Heading>
            <p className="text-ink/50 mt-2 text-xs">
              {formatDate(post.publishedAt)} · {post.readingTime} min
            </p>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article data-reveal className={cn("group", className)}>
      <Link to={`/noticias/${post.slug}`} className="block">
        <Image
          data={post.cover}
          ratio={ratio}
          priority={priority}
          imgClassName="transition-transform duration-300 group-hover:scale-[1.03]"
        />

        <div className={cn(variant === "hero" ? "mt-6" : "mt-4")}>
          <p className="font-heading text-wine text-[0.95rem] uppercase tracking-[0.05em]">
            {post.category.name}
          </p>
          <Heading
            className={cn(
              "group-hover:text-wine mt-2 transition-colors",
              titleFont,
              titleSizes[variant],
            )}
          >
            {post.title}
          </Heading>

          {variant === "hero" ? (
            <p className="text-ink/75 mt-4 max-w-[32ch] text-[17px] leading-relaxed lg:text-xl">
              {post.dek}
            </p>
          ) : null}

          <p className="text-ink/50 mt-3 text-[13px]">
            {post.author.name} · {formatDate(post.publishedAt)} · {post.readingTime} min
          </p>
        </div>
      </Link>
    </article>
  );
}
