import type { Stat } from "@up10/api-client";

import { cn } from "~/lib/cn";

import { SocialLinks } from "./social-links";
import { AnimatedCounter } from "./ui/animated-counter";

export function StatsBar({ stats }: { stats: Stat[] }) {
  if (stats.length === 0) return null;

  return (
    <section aria-labelledby="stats-title" className="border-wine/15 bg-paper border-b">
      <div className="container-up10 flex flex-col gap-2 py-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:py-3.5">
        <h2 id="stats-title" className="sr-only">
          UP10 en números
        </h2>

        <dl className="grid grid-cols-3 items-stretch lg:flex lg:flex-1 lg:items-center lg:justify-evenly">
          {stats.map((stat, index) => (
            <div
              key={stat.id}
              className={cn(
                "flex flex-col-reverse items-center justify-center gap-1 px-2 text-center sm:px-4 lg:px-6",
                index > 0 && "border-wine/15 border-l",
              )}
            >
              <dt className="text-ink/60 text-[9.5px] uppercase leading-none tracking-[0.1em] sm:text-[10.5px] lg:text-[11px]">
                {stat.shortLabel ?? stat.label}
              </dt>
              <dd className="font-heading text-wine text-[clamp(1.35rem,4.8vw,1.5rem)] leading-none lg:text-[clamp(1.5rem,2vw,1.75rem)]">
                <AnimatedCounter
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  format={stat.format === "plain" ? "plain" : "number"}
                />
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex items-center justify-center gap-1.5 lg:justify-end lg:gap-3.5">
          <p className="text-wine font-display text-[9.5px] font-bold uppercase leading-tight tracking-[0.12em] sm:text-[10.5px] lg:whitespace-nowrap lg:text-[11px]">
            Síguenos y no te pierdas nada
          </p>
          <SocialLinks
            className="shrink-0 gap-0 lg:gap-1"
            label="Síguenos y no te pierdas nada: redes sociales de UP10"
            iconSize={16}
            buttonClassName="size-8 lg:size-10"
          />
        </div>
      </div>
    </section>
  );
}
