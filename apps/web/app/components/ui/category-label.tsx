import { Link } from "react-router";

import { cn } from "~/lib/cn";

export function CategoryLabel({
  name,
  slug,
  tone = "wine",
  className,
}: {
  name: string;
  slug: string;
  tone?: "wine" | "cream";
  className?: string;
}) {
  return (
    <Link
      to={`/categoria/${slug}`}
      className={cn(
        "font-heading text-[clamp(0.875rem,1.5vw,1.5rem)] uppercase tracking-[0.05em] transition-opacity hover:opacity-70",
        tone === "wine" ? "text-wine" : "text-cream",
        className,
      )}
    >
      {name}
    </Link>
  );
}
