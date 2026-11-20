import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router";

import { cn } from "~/lib/cn";

type Variant = "primary" | "secondary" | "inverse" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-button font-display font-semibold uppercase tracking-[0.08em] transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-wine text-cream hover:bg-wine/90",
  secondary: "border border-wine text-wine hover:bg-wine hover:text-cream",
  inverse: "bg-cream text-wine hover:bg-paper",
  ghost: "text-wine underline decoration-2 underline-offset-4 hover:text-wine/70",
};

const sizes: Record<Size, string> = {
  sm: "min-h-9 px-4 py-2 text-[11px]",
  md: "min-h-11 px-5 py-3 text-[13px]",
  lg: "min-h-12 px-6 py-3.5 text-sm",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return <button className={buttonClasses({ variant, size, className })} {...props} />;
}

export function ButtonLink({
  to,
  children,
  variant = "primary",
  size = "md",
  className,
}: {
  to: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  const isExternal = to.startsWith("http");

  if (isExternal) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noreferrer noopener"
        className={buttonClasses({ variant, size, className })}
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={to} className={buttonClasses({ variant, size, className })}>
      {children}
    </Link>
  );
}
