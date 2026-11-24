import { ButtonLink } from "./button";

export function EmptyState({
  title,
  description,
  cta,
}: {
  title: string;
  description: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div className="border-wine/20 bg-paper rounded-card mt-10 border p-8 text-center">
      <p className="font-heading text-wine text-2xl uppercase">{title}</p>
      <p className="text-ink/60 mx-auto mt-3 max-w-lg">{description}</p>

      {cta ? (
        <ButtonLink to={cta.href} className="mt-6">
          {cta.label} →
        </ButtonLink>
      ) : null}
    </div>
  );
}
