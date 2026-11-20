import { Link } from "react-router";

import { cn } from "~/lib/cn";

type Cta = { label: string; href: string };

function SmartLink({ cta, className }: { cta: Cta; className?: string }) {
  const isExternal = cta.href.startsWith("http");

  if (isExternal) {
    return (
      <a
        href={cta.href}
        target="_blank"
        rel="noreferrer noopener"
        className={cn(
          "bg-cream text-wine rounded-button inline-flex min-h-11 items-center px-5 py-3 text-[13px] font-semibold uppercase tracking-[0.08em] transition-opacity hover:opacity-85",
          className,
        )}
      >
        {cta.label} →
      </a>
    );
  }

  return (
    <Link
      to={cta.href}
      className={cn(
        "bg-cream text-wine rounded-button inline-flex min-h-11 items-center px-5 py-3 text-[13px] font-semibold uppercase tracking-[0.08em] transition-opacity hover:opacity-85",
        className,
      )}
    >
      {cta.label} →
    </Link>
  );
}

function Badge() {
  return (
    <span className="bg-wine text-cream rounded-button font-heading inline-block px-2.5 py-1 text-[11px] uppercase tracking-[0.12em]">
      Próximamente
    </span>
  );
}

export function ComingSoon({
  variant,
  title,
  description,
  cta,
  className,
}: {
  variant: "band" | "card" | "inline";
  title: string;
  description: string;
  cta?: Cta;
  className?: string;
}) {
  if (variant === "band") {
    return (
      <section className={cn("bg-wine text-cream py-16 lg:py-24", className)}>
        <div className="container-up10 flex flex-col items-start gap-5">
          <Badge />
          <p className="font-heading max-w-[18ch] text-[clamp(2.5rem,5vw,4rem)] uppercase leading-none">
            {title}
          </p>
          <p className="text-cream/80 max-w-xl text-base leading-relaxed">{description}</p>
          {cta ? <SmartLink cta={cta} /> : null}
        </div>
      </section>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={cn(
          "border-wine/25 bg-paper rounded-card flex flex-col items-start gap-3 border p-6",
          className,
        )}
      >
        <Badge />
        <p className="font-display text-wine text-xl leading-tight">{title}</p>
        <p className="text-ink/70 text-sm leading-relaxed">{description}</p>
        {cta ? (
          <Link
            to={cta.href}
            className="text-wine mt-1 text-sm underline decoration-2 underline-offset-4"
          >
            {cta.label} →
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-wine/20 bg-paper rounded-card flex flex-wrap items-center justify-between gap-4 border px-5 py-4",
        className,
      )}
    >
      <div>
        <p className="font-display text-wine text-base">{title}</p>
        <p className="text-ink/60 mt-1 text-sm">{description}</p>
      </div>
      {cta ? (
        <Link to={cta.href} className="text-wine text-sm underline decoration-2 underline-offset-4">
          {cta.label} →
        </Link>
      ) : null}
    </div>
  );
}
