import type { Page } from "@up10/api-client";
import { Link } from "react-router";

import { cn } from "~/lib/cn";

export function ProjectCards({ projects }: { projects: Page[] }) {
  if (projects.length === 0) return null;

  return (
    <section aria-labelledby="projects-title" className="container-up10 py-16 lg:py-24">
      <h2 id="projects-title" className="sr-only">
        Próximos proyectos
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        {projects.slice(0, 2).map((project, index) => (
          <article
            key={project.slug}
            className={cn(
              "rounded-card flex flex-col overflow-hidden",
              index % 2 === 0 ? "bg-wine text-cream" : "bg-paper border-wine/20 border",
            )}
          >
            <div className="p-7 lg:p-9">
              <span
                className={cn(
                  "rounded-button font-heading inline-block px-2.5 py-1 text-[11px] uppercase tracking-[0.12em]",
                  index % 2 === 0 ? "bg-cream text-wine" : "bg-wine text-cream",
                )}
              >
                Próximamente
              </span>

              <h3
                className={cn(
                  "font-heading mt-5 text-[clamp(2rem,3.5vw,3rem)] font-normal uppercase leading-none",
                  index % 2 === 0 ? "text-cream" : "text-wine",
                )}
              >
                {project.title}
              </h3>

              <p
                className={cn(
                  "mt-4 max-w-sm text-base leading-relaxed",
                  index % 2 === 0 ? "text-cream/75" : "text-ink/70",
                )}
              >
                {project.hero.subtitle}
              </p>

              <Link
                to={`/${project.slug}`}
                className={cn(
                  "mt-6 inline-block text-[13px] uppercase tracking-[0.06em] underline decoration-2 underline-offset-4",
                  index % 2 === 0 ? "text-cream" : "text-wine",
                )}
              >
                Conocer más →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
