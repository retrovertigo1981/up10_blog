import type { Post } from "@up10/api-client";
import { Link } from "react-router";

import { ArticleBody } from "./article-body";
import { ArticleCard } from "./article-card";
import { Gallery } from "./gallery";
import { JsonLd } from "./json-ld";
import { ShareButtons } from "./share-buttons";
import { YouTubeLite } from "./youtube-lite";
import { Breadcrumbs } from "./ui/breadcrumbs";
import { BreakingBadge } from "./ui/breaking-badge";
import { CategoryLabel } from "./ui/category-label";
import { Image } from "./ui/image";
import { SectionHeading } from "./ui/section-heading";
import { siteUrl } from "~/lib/api";

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "long",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export function ArticlePage({ post }: { post: Post }) {
  const articleUrl = `${siteUrl}/noticias/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        headline: post.title,
        description: post.seo.description,
        image: [post.seo.ogImage?.src ?? post.cover.src],
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        articleSection: post.category.name,
        inLanguage: "es-CL",
        author: {
          "@type": "Person",
          name: post.author.name,
        },
        publisher: {
          "@type": "Organization",
          name: "UP10",
          url: siteUrl,
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": articleUrl,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Inicio",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Noticias",
            item: `${siteUrl}/noticias`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.category.name,
            item: `${siteUrl}/categoria/${post.category.slug}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: post.title,
            item: articleUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      <article className="container-up10 py-10 lg:py-16">
        <div className="mx-auto max-w-4xl">
          <Breadcrumbs
            items={[
              { label: "Inicio", href: "/" },
              { label: "Noticias", href: "/noticias" },
              { label: post.category.name, href: `/categoria/${post.category.slug}` },
              { label: post.title },
            ]}
          />

          <header className="mt-6">
            <div className="flex flex-wrap items-center gap-3">
              <CategoryLabel
                name={post.category.name}
                slug={post.category.slug}
                className="text-sm"
              />

              {post.isBreaking ? <BreakingBadge /> : null}

              {post.tipo !== "noticia" ? (
                <span className="font-heading text-ink/60 text-xs uppercase tracking-[0.12em]">
                  {post.tipo}
                </span>
              ) : null}
            </div>

            <h1 className="font-heading text-wine mt-4 text-[clamp(2.4rem,5vw,4.5rem)] font-normal leading-[1.03]">
              {post.title}
            </h1>

            <p className="text-ink/60 mt-5 text-sm">
              Por {post.author.name} · {formatDate(post.publishedAt)} · {post.readingTime} min de
              lectura
            </p>
          </header>
        </div>

        <div className="mx-auto mt-10 max-w-6xl">
          <Image
            data={post.cover}
            ratio="16:9"
            priority
            sizes="(min-width: 1024px) 1152px, 100vw"
          />
        </div>

        <div className="mx-auto mt-10 max-w-3xl">
          <ArticleBody html={post.html} />

          {post.video ? (
            <div className="mt-10">
              <YouTubeLite id={post.video.id} title={post.title} />
            </div>
          ) : null}

          {post.gallery.length > 0 ? (
            <div className="mt-10">
              <Gallery images={post.gallery} />
            </div>
          ) : null}

          <div className="border-wine/15 mt-10 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
            <ShareButtons url={articleUrl} title={post.title} />

            {post.tags.length > 0 ? (
              <ul aria-label="Etiquetas" className="flex flex-wrap items-center gap-2">
                {post.tags.map((tag) => (
                  <li key={tag}>
                    <Link
                      to={`/buscar?q=${encodeURIComponent(tag)}`}
                      className="border-wine/25 text-wine hover:bg-wine hover:text-cream rounded-button inline-flex min-h-9 items-center border px-3 text-xs transition-colors"
                    >
                      #{tag}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        {post.related.length > 0 ? (
          <section aria-labelledby="relacionadas" className="mx-auto mt-16 max-w-6xl">
            <SectionHeading id="relacionadas">Relacionadas</SectionHeading>

            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {post.related.map((related) => (
                <ArticleCard key={related.id} post={related} variant="standard" />
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </>
  );
}
