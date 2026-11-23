/* El clic en el backdrop complementa el cierre nativo de <dialog> (Esc) y el
   botón de cerrar. La regla de a11y no modela el comportamiento de <dialog>. */
/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useLenis } from "lenis/react";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router";

import { cn } from "~/lib/cn";

const primaryNav = [
  { label: "Actualidad", href: "/noticias" },
  { label: "Música chilena", href: "/categoria/musica-chilena" },
  { label: "Internacional", href: "/categoria/musica-internacional" },
  { label: "Entrevistas", href: "/entrevistas" },
  { label: "Eventos", href: "/eventos" },
  { label: "TOP 10", href: "/top10" },
] as const;

const secondaryNav = [
  { label: "Lanzamientos", href: "/categoria/lanzamientos" },
  { label: "Industria musical", href: "/categoria/industria-musical" },
  { label: "Cultura y entretenimiento", href: "/categoria/cultura-entretenimiento" },
  { label: "UP10 Unplugged", href: "/unplugged" },
  { label: "Podcast", href: "/podcast" },
  { label: "Awards", href: "/awards" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" },
] as const;

const social = [
  { label: "Instagram", href: "https://www.instagram.com/up10.cl/" },
  { label: "TikTok", href: "https://www.tiktok.com/@up10.cl" },
  { label: "YouTube", href: "https://www.youtube.com/@up10" },
] as const;

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon({ open = false }: { open?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      {open ? (
        <>
          <path d="m6 6 12 12" />
          <path d="m18 6-12 12" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}

export function SiteHeader() {
  const menuRef = useRef<HTMLDialogElement>(null);
  const searchRef = useRef<HTMLDialogElement>(null);
  const menuTimeline = useRef<gsap.core.Timeline | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const lenis = useLenis();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useGSAP(
    () => {
      const dialog = menuRef.current;
      if (!dialog) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const select = gsap.utils.selector(dialog);
        const timeline = gsap.timeline({
          paused: true,
          defaults: { ease: "power3.out" },
        });

        timeline
          .from(select("[data-menu-logo], [data-menu-close]"), {
            y: -8,
            autoAlpha: 0,
            duration: 0.2,
            stagger: 0.04,
          })
          .from(
            select("[data-menu-primary] li"),
            { y: 14, autoAlpha: 0, duration: 0.24, stagger: 0.035 },
            "-=0.08",
          )
          .from(select("[data-menu-eyebrow]"), { y: 8, autoAlpha: 0, duration: 0.18 }, "-=0.12")
          .from(
            select("[data-menu-secondary] li"),
            { y: 10, autoAlpha: 0, duration: 0.2, stagger: 0.02 },
            "-=0.08",
          )
          .from(
            select("[data-menu-footer] > *"),
            { y: 10, autoAlpha: 0, duration: 0.2, stagger: 0.05 },
            "-=0.08",
          );

        menuTimeline.current = timeline;

        return () => {
          timeline.kill();
          menuTimeline.current = null;
        };
      });
    },
    { scope: menuRef },
  );

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function openMenu() {
    if (menuRef.current?.open) return;

    lenis?.stop();
    menuRef.current?.showModal();
    setMenuOpen(true);

    window.requestAnimationFrame(() => {
      menuTimeline.current?.eventCallback("onReverseComplete", null).timeScale(1).restart();
    });
  }

  function closeMenu({ immediate = false }: { immediate?: boolean } = {}) {
    const dialog = menuRef.current;
    if (!dialog?.open) return;

    setMenuOpen(false);

    const timeline = menuTimeline.current;

    if (immediate || !timeline || timeline.progress() === 0 || prefersReducedMotion()) {
      dialog.close();
      return;
    }

    timeline
      .timeScale(2.5)
      .eventCallback("onReverseComplete", () => {
        dialog.close();
      })
      .reverse();
  }

  function openSearch() {
    lenis?.stop();
    searchRef.current?.showModal();
  }

  function closeSearch() {
    searchRef.current?.close();
    lenis?.start();
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    closeSearch();
    navigate(term ? `/buscar?q=${encodeURIComponent(term)}` : "/buscar");
  }

  return (
    <header
      className={cn(
        "bg-wine border-cream/15 sticky top-0 z-50 border-b transition-shadow duration-300",
        scrolled && "shadow-[0_2px_12px_rgba(0,0,0,0.18)]",
      )}
    >
      <div className="container-up10 flex h-[72px] items-center justify-between gap-4 lg:h-[88px]">
        <Link to="/" className="shrink-0" aria-label="UP10, ir a la portada">
          <img
            src="/brand/logo-wordmark.png"
            alt="UP10"
            width={80}
            height={40}
            className="h-8 w-auto lg:h-10"
          />
        </Link>

        <nav aria-label="Navegación principal" className="hidden lg:block">
          <ul className="flex items-center gap-6 xl:gap-8">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className="nav-underline font-display text-cream/90 hover:text-cream text-[13px] uppercase tracking-[0.1em] transition-colors"
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            type="button"
            onClick={openSearch}
            aria-label="Buscar"
            className="text-cream hover:bg-cream/10 rounded-button flex size-10 items-center justify-center transition-colors"
          >
            <SearchIcon />
          </button>

          <Link
            to="/#newsletter"
            className="bg-cream text-wine rounded-button font-display hidden min-h-10 items-center px-5 text-[12px] font-semibold uppercase tracking-[0.08em] transition-opacity hover:opacity-90 sm:inline-flex"
          >
            Suscribirse
          </Link>

          <button
            type="button"
            onClick={openMenu}
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            aria-haspopup="dialog"
            className="text-cream hover:bg-cream/10 rounded-button flex size-10 items-center justify-center transition-colors"
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {/* Panel de navegación */}
      <dialog
        ref={menuRef}
        aria-label="Menú de navegación"
        className="drawer bg-wine text-cream"
        onCancel={(event) => {
          event.preventDefault();
          closeMenu();
        }}
        onClose={() => {
          setMenuOpen(false);
          lenis?.start();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeMenu();
        }}
      >
        <div data-lenis-prevent className="flex h-full flex-col overflow-y-auto p-6 lg:p-8">
          <div className="flex items-center justify-between">
            <Link
              data-menu-logo
              to="/"
              onClick={() => closeMenu({ immediate: true })}
              aria-label="UP10, ir a la portada"
            >
              <img
                src="/brand/logo-wordmark.png"
                alt="UP10"
                width={80}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <button
              data-menu-close
              type="button"
              onClick={() => closeMenu()}
              aria-label="Cerrar menú"
              className="text-cream hover:bg-cream/10 rounded-button flex size-10 items-center justify-center"
            >
              <MenuIcon open />
            </button>
          </div>

          <nav aria-label="Secciones principales" className="mt-10 lg:hidden">
            <ul data-menu-primary className="space-y-3">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    onClick={() => closeMenu({ immediate: true })}
                    className="menu-link font-heading hover:text-cream/70 text-3xl uppercase"
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav
            aria-label="Más secciones"
            className={cn("border-cream/15 mt-10 border-t pt-6", "lg:mt-12")}
          >
            <p
              data-menu-eyebrow
              className="font-heading text-cream/50 mb-4 text-xs uppercase tracking-[0.15em]"
            >
              Más secciones
            </p>
            <ul data-menu-secondary className="grid gap-2">
              {secondaryNav.map((item) => (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    onClick={() => closeMenu({ immediate: true })}
                    className="menu-link font-display hover:text-cream/70 text-lg"
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div data-menu-footer className="mt-auto pt-10">
            <Link
              to="/#newsletter"
              onClick={() => closeMenu({ immediate: true })}
              className="bg-cream text-wine rounded-button font-display inline-flex min-h-11 items-center px-5 text-[12px] font-semibold uppercase tracking-[0.08em]"
            >
              Suscribirse al pulso →
            </Link>

            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
              {social.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-cream/60 hover:text-cream text-sm"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </dialog>

      {/* Buscador */}
      <dialog
        ref={searchRef}
        aria-label="Buscar en UP10"
        className="search-dialog bg-paper text-ink rounded-card"
        onClose={() => lenis?.start()}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeSearch();
        }}
      >
        <form onSubmit={handleSearch} className="p-6">
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="site-search" className="font-heading text-wine text-lg uppercase">
              Buscar
            </label>
            <button
              type="button"
              onClick={closeSearch}
              aria-label="Cerrar buscador"
              className="text-wine hover:bg-wine/10 rounded-button flex size-9 items-center justify-center"
            >
              <MenuIcon open />
            </button>
          </div>

          <input
            id="site-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Artistas, notas, eventos…"
            className="border-wine/30 rounded-button focus:border-wine mt-4 h-12 w-full border bg-transparent px-4 text-base outline-none"
          />

          <button
            type="submit"
            className="bg-wine text-cream rounded-button mt-4 inline-flex min-h-11 w-full items-center justify-center px-5 text-[12px] font-semibold uppercase tracking-[0.08em]"
          >
            Buscar
          </button>

          <p className="text-ink/50 mt-3 text-center text-xs">
            El buscador estará disponible con el contenido completo.
          </p>
        </form>
      </dialog>
    </header>
  );
}
