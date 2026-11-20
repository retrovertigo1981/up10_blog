import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import { SiteFooter } from "~/components/site-footer";
import { SiteHeader } from "~/components/site-header";
import { Providers } from "~/providers";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.ico", sizes: "any" },
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
    <html lang="es-CL">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FAE3B9" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
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
