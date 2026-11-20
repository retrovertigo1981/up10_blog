import { Link } from "react-router";
import { cn } from "~/lib/cn";

const primaryNav = [
  { label: "Actualidad", href: "/noticias" },
  { label: "Música chilena", href: "/categoria/musica-chilena" },
  { label: "Internacional", href: "/categoria/musica-internacional" },
  { label: "Entrevistas", href: "/entrevistas" },
  { label: "Eventos", href: "/eventos" },
  { label: "TOP 10", href: "/top10" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-wine-soft bg-paper sticky top-0 z-50 border-b">
      <div className="container-up10 flex h-[72px] items-center justify-between gap-6 lg:h-[88px]">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-3"
          aria-label="UP10, ir a la portada"
        >
          <img src="/brand/logo-mark.svg" alt="" width={32} height={36} className="h-9 w-auto" />
          <span className="text-wine font-display text-lg uppercase tracking-[0.12em]">UP10</span>
        </Link>

        <nav aria-label="Navegación principal" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "text-wine font-display text-[13px] uppercase tracking-[0.1em]",
                    "hover:text-wine/70 transition-colors",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="border-wine text-wine hover:bg-wine hover:text-cream rounded-button border px-4 py-2 text-[13px] font-semibold uppercase tracking-wide transition-colors"
          >
            Buscar
          </button>
          <a
            href="#newsletter"
            className="bg-wine text-cream rounded-button hidden px-5 py-2 text-[13px] font-semibold uppercase tracking-wide transition-opacity hover:opacity-90 sm:inline-block"
          >
            Suscribirse
          </a>
          <button
            type="button"
            className="border-wine text-wine rounded-button border px-3 py-2 lg:hidden"
            aria-label="Abrir menú"
          >
            <span aria-hidden="true">☰</span>
          </button>
        </div>
      </div>
    </header>
  );
}
