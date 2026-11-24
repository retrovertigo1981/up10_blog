import DOMPurify from "dompurify";

import { cn } from "~/lib/cn";

const PURIFY_OPTIONS = {
  USE_PROFILES: { html: true },
  ADD_TAGS: ["iframe"],
  ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "target"],
};

export function ArticleBody({
  html,
  className,
  emptyMessage = "El contenido de esta nota aún no está disponible.",
}: {
  html: string;
  className?: string;
  emptyMessage?: string;
}) {
  if (!html.trim()) {
    return <p className={cn("text-ink/60", className)}>{emptyMessage}</p>;
  }

  const clean = typeof window === "undefined" ? html : DOMPurify.sanitize(html, PURIFY_OPTIONS);

  return (
    <div className={cn("article-body", className)} dangerouslySetInnerHTML={{ __html: clean }} />
  );
}
