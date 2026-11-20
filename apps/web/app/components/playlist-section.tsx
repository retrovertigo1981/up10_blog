import { ButtonLink } from "./ui/button";
import { SectionHeading } from "./ui/section-heading";

export function PlaylistSection({
  playlistUrl,
  embedUrl,
}: {
  playlistUrl: string;
  embedUrl: string;
}) {
  return (
    <section
      aria-labelledby="top10-title"
      className="text-cream bg-[linear-gradient(130deg,#000000_0%,#57000B_100%)] py-16 lg:py-24"
    >
      <div className="container-up10 grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <SectionHeading id="top10-title" eyebrow="/ En rotación" tone="cream">
            UP10 PLAYLIST
          </SectionHeading>

          <p className="text-cream/75 mt-6 max-w-md text-base leading-relaxed">
            Nuestra selección curada semanalmente. Los sonidos que están sonando en los estudios, en
            los autos y en las calles. Actualizada cada viernes.
          </p>

          <ButtonLink to={playlistUrl} variant="inverse" className="mt-8">
            Seguir en Spotify →
          </ButtonLink>
        </div>

        <div className="rounded-card overflow-hidden">
          <iframe
            title="Playlist UP10 TOP 10 en Spotify"
            src={embedUrl}
            width="100%"
            height={500}
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            className="block w-full"
          />
        </div>
      </div>
    </section>
  );
}
