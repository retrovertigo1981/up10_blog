import { Link, useLocation } from "react-router";

import type { Route } from "./+types/stub";

const titles: Record<string, { title: string; description: string }> = {
  "/noticias": {
    title: "Noticias",
    description: "Toda la actualidad musical, ordenada por fecha.",
  },
  "/entrevistas": {
    title: "Entrevistas",
    description: "Conversaciones con artistas y protagonistas de la industria.",
  },
  "/eventos": {
    title: "Eventos",
    description: "Próximos conciertos, festivales y fechas de la escena.",
  },
  "/top10": {
    title: "UP10 TOP 10",
    description: "El ranking semanal conectado a nuestra playlist de Spotify.",
  },
  "/nosotros": {
    title: "Nosotros",
    description: "Quiénes somos, nuestra historia y nuestros proyectos.",
  },
  "/unplugged": {
    title: "UP10 Unplugged",
    description: "Sesiones íntimas con artistas de la escena chilena.",
  },
  "/podcast": {
    title: "UP10 Podcast",
    description: "Conversaciones sobre música, creatividad e industria.",
  },
  "/awards": {
    title: "UP10 Awards",
    description: "10 categorías, 10 nominados.",
  },
  "/buscar": {
    title: "Buscar",
    description: "El buscador estará disponible con el contenido completo.",
  },
  "/contacto": {
    title: "Contacto",
    description: "Escríbenos a prensa@up10.cl o por WhatsApp.",
  },
  "/privacidad": {
    title: "Política de privacidad",
    description: "Tratamiento de datos personales conforme a la Ley 21.719.",
  },
  "/terminos": {
    title: "Términos de uso",
    description: "Condiciones de uso del sitio UP10.CL.",
  },
};

export const meta: Route.MetaFunction = () => [
  { title: "En preparación — UP10" },
  { name: "robots", content: "noindex" },
];

export default function Stub() {
  const { pathname } = useLocation();

  const key =
    Object.keys(titles).find((path) => pathname === path || pathname.startsWith(`${path}/`)) ??
    "/noticias";
  const content = titles[key] ?? { title: "UP10", description: "" };

  return (
    <section className="container-up10 flex min-h-[60vh] flex-col justify-center py-24">
      <p className="font-heading text-wine text-sm uppercase tracking-[0.12em]">/ En preparación</p>

      <h1 className="font-heading text-wine mt-3 text-[clamp(3rem,7vw,6rem)] font-normal uppercase leading-none">
        {content.title}
      </h1>

      <p className="text-ink/70 mt-5 max-w-lg text-lg leading-relaxed">{content.description}</p>

      <p className="text-ink/50 mt-3 max-w-lg text-sm">
        Esta sección se implementa en el Sprint 3. Mientras tanto, puedes volver a la portada.
      </p>

      <Link
        to="/"
        className="bg-wine text-cream rounded-button mt-8 inline-flex min-h-11 w-fit items-center px-5 text-[12px] font-semibold uppercase tracking-[0.08em]"
      >
        Volver a la portada
      </Link>
    </section>
  );
}
