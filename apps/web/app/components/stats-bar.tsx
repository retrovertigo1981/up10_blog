import type { Stat } from "@up10/api-client";

import { cn } from "~/lib/cn";

import { SocialLinks } from "./social-links";

const formatter = new Intl.NumberFormat("es-CL");

function formatStat(stat: Stat) {
  const value = stat.format === "plain" ? String(stat.value) : formatter.format(stat.value);
  return `${stat.prefix ?? ""}${value}${stat.suffix ?? ""}`;
}

export function StatsBar({ stats }: { stats: Stat[] }) {
  if (stats.length === 0) return null;

  return (
    <section aria-labelledby="stats-title" className="border-wine/15 bg-paper border-b">
      <div className="container-up10 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2">
        <h2 id="stats-title" className="sr-only">
          UP10 en números
        </h2>

        <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:gap-x-5">
          {stats.map((stat, index) => (
            <div
              key={stat.id}
              className={cn(
                "flex items-baseline gap-1.5",
                index > 0 && "sm:border-wine/15 sm:border-l sm:pl-5",
              )}
            >
              <dd className="font-heading text-wine text-[clamp(1rem,1.8vw,1.35rem)] leading-none">
                {formatStat(stat)}
              </dd>
              <dt className="text-ink/60 text-[10px] tracking-[0.08em] uppercase sm:text-[11px]">
                {stat.shortLabel ?? stat.label}
              </dt>
            </div>
          ))}
        </dl>

        <SocialLinks className="ms-auto -mr-2" iconSize={17} />
      </div>
    </section>
  );
}
