import { cn } from "~/lib/cn";

export function BreakingBadge({
  tone = "wine",
  className,
}: {
  tone?: "wine" | "cream";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "rounded-button font-heading inline-flex items-center px-2.5 py-1 text-[11px] uppercase leading-none tracking-[0.12em]",
        tone === "wine" ? "bg-wine text-cream" : "bg-cream text-wine",
        className,
      )}
    >
      Última hora
    </span>
  );
}
