import type { PostSummary } from "@up10/api-client";

import { ArticleCard } from "./article-card";
import { SectionHeading } from "./ui/section-heading";

export function FeatureRow({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="entrevistas-title" className="container-up10 py-16 lg:py-24">
      <SectionHeading
        id="entrevistas-title"
        eyebrow="/ Conversaciones"
        action={{ label: "Ver todas", href: "/entrevistas" }}
      >
        ENTREVISTAS
      </SectionHeading>

      <div className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible">
        {posts.slice(0, 3).map((post) => (
          <ArticleCard
            key={post.id}
            post={post}
            className="w-[85%] shrink-0 snap-start sm:w-[60%] lg:w-auto"
          />
        ))}
      </div>
    </section>
  );
}
