import { Link } from "react-router";

import { SocialLinks } from "./social-links";

const sections = [
  { label: "Noticias", href: "/noticias" },
  { label: "Entrevistas", href: "/entrevistas" },
  { label: "Eventos", href: "/eventos" },
  { label: "TOP 10", href: "/top10" },
];

const institutional = [
  { label: "Nosotros", href: "/nosotros" },
  { label: "Unplugged", href: "/unplugged" },
  { label: "Podcast", href: "/podcast" },
  { label: "Awards", href: "/awards" },
];

export function SiteFooter() {
  return (
    <footer className="border-wine bg-cream mt-24 border-t">
      <div className="container-up10 grid gap-12 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <img
            src="/brand/logo-mark.svg"
            alt=""
            width={28}
            height={31}
            className="mb-4 h-9 w-auto"
          />
          <p className="font-heading text-wine text-4xl">MÁS MÚSICA, MENOS PROBLEMAS.</p>
          <p className="text-ink/70 mt-4 max-w-sm text-[15px]">
            Revista musical, productora de eventos y plataforma de contenido sobre cultura musical
            chilena y latinoamericana.
          </p>
          <a
            href="mailto:prensa@up10.cl"
            className="text-wine mt-6 inline-block text-[15px] underline underline-offset-4"
          >
            prensa@up10.cl
          </a>

          <SocialLinks className="mt-4 -ml-2" label="Redes sociales de UP10" />
        </div>

        <nav aria-label="Secciones">
          <h2 className="font-heading text-wine text-lg font-normal tracking-wide">SECCIONES</h2>
          <ul className="mt-4 space-y-2">
            {sections.map((item) => (
              <li key={item.href}>
                <Link to={item.href} className="text-ink/80 hover:text-wine text-[15px]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Institucional">
          <h2 className="font-heading text-wine text-lg font-normal tracking-wide">UP10</h2>
          <ul className="mt-4 space-y-2">
            {institutional.map((item) => (
              <li key={item.href}>
                <Link to={item.href} className="text-ink/80 hover:text-wine text-[15px]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-wine-soft container-up10 flex flex-col gap-2 border-t py-6 text-[13px] md:flex-row md:items-center md:justify-between">
        <p className="text-ink/60">
          © {new Date().getFullYear()} UP10. Todos los derechos reservados.
        </p>
        <div className="flex gap-5">
          <Link to="/privacidad" className="text-ink/60 hover:text-wine">
            Privacidad
          </Link>
          <Link to="/terminos" className="text-ink/60 hover:text-wine">
            Términos
          </Link>
        </div>
      </div>
    </footer>
  );
}
