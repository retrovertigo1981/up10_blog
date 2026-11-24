import type { Pagination as PaginationData, PostSummary } from "@up10/api-client";

import { ArticleCard } from "./article-card";
import { Pagination } from "./pagination";
import { EmptyState } from "./ui/empty-state";

export function ArchivePage({
  eyebrow,
  title,
  description,
  posts,
  pagination,
  basePath,
  emptyTitle,
  emptyDescription,
}: {
  eyebrow: string;
  title: string;
  description: string;
  posts: PostSummary[];
  pagination: PaginationData | null;
  basePath: string;
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <section className="container-up10 py-14 lg:py-20">
      <header className="border-wine/15 border-b pb-8">
        <p className="font-heading text-wine text-sm uppercase tracking-[0.12em]">{eyebrow}</p>
        <h1 className="font-heading text-wine mt-3 text-[clamp(3rem,7vw,6rem)] font-normal uppercase leading-none">
          {title}
        </h1>
        <p className="text-ink/70 mt-4 max-w-2xl text-lg leading-relaxed">{description}</p>
      </header>

      {posts.length > 0 ? (
        <>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <ArticleCard
                key={post.id}
                post={post}
                variant={index === 0 ? "feature" : "standard"}
                priority={index === 0}
                className={index === 0 ? "sm:col-span-2 lg:col-span-2" : undefined}
              />
            ))}
          </div>

          <Pagination
            page={pagination?.page ?? 1}
            totalPages={pagination?.totalPages ?? 1}
            basePath={basePath}
          />
        </>
      ) : (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          cta={{ label: "Volver a la portada", href: "/" }}
        />
      )}
    </section>
  );
}
