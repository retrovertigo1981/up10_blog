import type { Route } from "./+types/home";

import { BentoGrid } from "~/components/bento-grid";
import { FeatureRow } from "~/components/feature-row";
import { HeroCarousel } from "~/components/hero-carousel";
import { InstagramGrid } from "~/components/instagram-grid";
import { NewsletterSection } from "~/components/newsletter-section";
import { PartnerMarquee } from "~/components/partner-marquee";
import { ProjectBand } from "~/components/project-band";
import { ProjectCards } from "~/components/project-cards";
import { StatsBar } from "~/components/stats-bar";
import { PlaylistSection } from "~/components/playlist-section";
import { ComingSoon } from "~/components/ui/coming-soon";
import { SectionHeading } from "~/components/ui/section-heading";
import { api, siteUrl } from "~/lib/api";
import { defaultOgMetadata } from "~/lib/seo";

const PLAYLIST_ID = "3Iq8oHfADX6oHPi8jYs4vH";
const PLAYLIST_URL = `https://open.spotify.com/playlist/${PLAYLIST_ID}`;
const PLAYLIST_EMBED = `https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?utm_source=generator&theme=0`;

async function loadHome() {
  const { data } = await api.home();
  return { home: data };
}

export async function loader() {
  return loadHome();
}

export async function clientLoader() {
  return loadHome();
}
clientLoader.hydrate = import.meta.env.VITE_LIVE_CONTENT !== "false";

export const meta: Route.MetaFunction = () => {
  const title = "UP10 — Revista musical chilena";
  const description =
    "Noticias, entrevistas, rankings y eventos de la música chilena y latinoamericana. Más música, menos problemas.";

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: siteUrl },
    { property: "og:locale", content: "es_CL" },
    ...defaultOgMetadata(),
    { tagName: "link", rel: "canonical", href: siteUrl },
  ];
};

export default function Home({ loaderData }: Route.ComponentProps) {
  const { home } = loaderData;
  const heroIds = new Set(home.hero.map((post) => post.id));
  const bentoPosts = home.latest.filter((post) => !heroIds.has(post.id));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "UP10",
        url: siteUrl,
        sameAs: [
          "https://www.instagram.com/up10.cl/",
          "https://www.tiktok.com/@up10.cl",
          "https://www.facebook.com/up10.cl",
          "https://www.youtube.com/@up10",
        ],
      },
      {
        "@type": "WebSite",
        name: "UP10",
        url: siteUrl,
        inLanguage: "es-CL",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {home.stats.length > 0 ? <StatsBar stats={home.stats} /> : null}

      {home.hero.length > 0 ? (
        <HeroCarousel posts={home.hero} />
      ) : (
        <ComingSoon
          variant="band"
          title="La música vuelve pronto"
          description="Estamos preparando la nueva portada de UP10. Mientras tanto, síguenos en Instagram."
          cta={{ label: "Ver Instagram", href: "https://www.instagram.com/up10.cl/" }}
        />
      )}

      <section aria-labelledby="ultimo-title" className="container-up10 py-16 lg:py-24">
        <SectionHeading id="ultimo-title" action={{ label: "Ver archivo", href: "/noticias" }}>
          LO ÚLTIMO
        </SectionHeading>

        <BentoGrid posts={bentoPosts} className="mt-10" />
      </section>

      <PlaylistSection playlistUrl={PLAYLIST_URL} embedUrl={PLAYLIST_EMBED} />

      <FeatureRow posts={home.interviews} />

      <div className="flex flex-col">
        <div className="order-2 lg:order-1">
          <InstagramGrid posts={home.instagram} />
        </div>

        <div className="order-1 lg:order-2">
          {home.unplugged ? (
            <ProjectBand page={home.unplugged} />
          ) : (
            <ComingSoon
              variant="band"
              title="Unplugged vuelve pronto"
              description="Más de 50 sesiones íntimas. Estamos preparando una nueva etapa con grabaciones propias."
              cta={{ label: "Ver Instagram", href: "https://www.instagram.com/up10.cl/" }}
            />
          )}
        </div>
      </div>

      <ProjectCards projects={home.projects} />

      <PartnerMarquee partners={home.partners} />

      <NewsletterSection />
    </>
  );
}
