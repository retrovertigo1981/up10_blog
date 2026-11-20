import type { ReactNode } from "react";
import { Link } from "react-router";

import { cn } from "~/lib/cn";

export function SectionHeading({
  children,
  eyebrow,
  action,
  id,
  className,
  tone = "wine",
}: {
  children: ReactNode;
  eyebrow?: string;
  action?: { label: string; href: string };
  id?: string;
  className?: string;
  tone?: "wine" | "cream";
}) {
  return (
    <div className={cn("flex items-end justify-between gap-6", className)}>
      <div>
        {eyebrow ? (
          <p
            className={cn(
              "font-heading mb-2 text-sm uppercase tracking-[0.12em]",
              tone === "wine" ? "text-wine" : "text-cream/80",
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <h2
          id={id}
          className={cn(
            "font-heading max-w-[14ch] text-[clamp(2.5rem,6vw,5rem)] font-normal uppercase leading-[0.95]",
            tone === "wine" ? "text-wine" : "text-cream",
          )}
        >
          {children}
        </h2>
      </div>

      {action ? (
        action.href.startsWith("http") ? (
          <a
            href={action.href}
            target="_blank"
            rel="noreferrer noopener"
            className={cn(
              "hidden shrink-0 pb-2 text-[13px] uppercase tracking-[0.06em] underline decoration-2 underline-offset-4 sm:block",
              tone === "wine" ? "text-ink/70 hover:text-wine" : "text-cream/80 hover:text-cream",
            )}
          >
            {action.label} →
          </a>
        ) : (
          <Link
            to={action.href}
            className={cn(
              "hidden shrink-0 pb-2 text-[13px] uppercase tracking-[0.06em] underline decoration-2 underline-offset-4 sm:block",
              tone === "wine" ? "text-ink/70 hover:text-wine" : "text-cream/80 hover:text-cream",
            )}
          >
            {action.label} →
          </Link>
        )
      ) : null}
    </div>
  );
}
