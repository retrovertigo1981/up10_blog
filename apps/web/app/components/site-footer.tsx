import { Link } from "react-router";

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

const social = [
  { label: "Instagram", href: "https://www.instagram.com/up10.cl/" },
  { label: "TikTok", href: "https://www.tiktok.com/@up10.cl" },
  { label: "Facebook", href: "https://www.facebook.com/up10.cl" },
  { label: "YouTube", href: "https://www.youtube.com/@up10" },
];

export function SiteFooter() {
  return (
    <footer className="border-wine bg-cream mt-24 border-t">
      <div className="container-up10 grid gap-12 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
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
        </div>

        <nav aria-label="Secciones">
          <h2 className="font-heading text-wine text-lg tracking-wide">SECCIONES</h2>
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

        <div className="space-y-8">
          <nav aria-label="Institucional">
            <h2 className="font-heading text-wine text-lg tracking-wide">UP10</h2>
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

          <nav aria-label="Redes sociales">
            <h2 className="font-heading text-wine text-lg tracking-wide">REDES</h2>
            <ul className="mt-4 space-y-2">
              {social.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-ink/80 hover:text-wine text-[15px]"
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
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
