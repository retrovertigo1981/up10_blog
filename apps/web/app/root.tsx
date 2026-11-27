import { useEffect } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import { INTRO_GATE_SCRIPT } from "~/components/intro/intro-gate";
import { IntroSequence } from "~/components/intro/intro-sequence";
import { SiteFooter } from "~/components/site-footer";
import { SiteHeader } from "~/components/site-header";
import { Providers } from "~/providers";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.ico", sizes: "any" },
  {
    rel: "preload",
    href: "/fonts/integral-cf/IntegralCF-DemiBold.woff2",
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
];

export const meta: Route.MetaFunction = () => [
  { title: "UP10 — Más música, menos problemas" },
  {
    name: "description",
    content:
      "Revista musical, productora de eventos y plataforma de contenido sobre música chilena y latinoamericana.",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FAE3B9" />
        <script dangerouslySetInnerHTML={{ __html: INTRO_GATE_SCRIPT }} />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="site-content">{children}</div>
        <IntroSequence />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  useEffect(() => {
    function dedupeHeadTags() {
      const selectors = ["title", 'link[rel="canonical"]', "meta[property]", "meta[name]"];
      const nodes = selectors.flatMap((selector) =>
        Array.from(document.head.querySelectorAll(selector)),
      );
      const seen = new Map<string, Element>();

      for (const node of nodes) {
        const key =
          node.tagName === "TITLE"
            ? "title"
            : node.tagName === "LINK"
              ? `link:${node.getAttribute("rel")}`
              : `meta:${node.getAttribute("property") ?? node.getAttribute("name")}`;

        const previous = seen.get(key);

        if (previous) {
          previous.remove();
        }

        seen.set(key, node);
      }
    }

    dedupeHeadTags();

    const observer = new MutationObserver(dedupeHeadTags);
    observer.observe(document.head, { childList: true });

    return () => observer.disconnect();
  }, []);

  return (
    <Providers>
      <a
        href="#contenido"
        className="bg-wine text-cream rounded-button sr-only px-4 py-2 focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50"
      >
        Saltar al contenido
      </a>
      <SiteHeader />
      <main id="contenido">
        <Outlet />
      </main>
      <SiteFooter />
    </Providers>
  );
}

// Se muestra mientras el SPA hidrata y se piden los datos al CMS.
// También es el contenido estático inicial de index.html.
export function HydrateFallback() {
  return (
    <main className="container-up10 flex min-h-dvh flex-col items-center justify-center gap-5">
      <img
        src="/brand/logo-wordmark.png"
        alt="UP10"
        width={80}
        height={40}
        className="h-10 w-auto"
      />
      <p className="text-ink/50 text-xs uppercase tracking-[0.2em]">Cargando…</p>
    </main>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Algo salió mal";
  let details = "No pudimos cargar esta página. Intenta nuevamente.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : `Error ${error.status}`;
    details =
      error.status === 404
        ? "La página que buscas no existe o cambió de dirección."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="container-up10 flex min-h-[60vh] flex-col justify-center py-24">
      <p className="font-heading text-wine text-7xl">{message}</p>
      <p className="text-ink/70 mt-4 max-w-lg text-lg">{details}</p>
      <a href="/" className="bg-wine text-cream rounded-button mt-8 w-fit px-6 py-3 font-semibold">
        Volver a la portada
      </a>
      {stack && (
        <pre className="bg-paper rounded-card mt-10 w-full overflow-x-auto p-4 text-sm">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
