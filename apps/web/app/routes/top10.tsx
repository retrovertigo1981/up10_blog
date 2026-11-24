import type { Route } from "./+types/top10";

import { TrackRow } from "~/components/track-row";
import { ButtonLink } from "~/components/ui/button";
import { ComingSoon } from "~/components/ui/coming-soon";
import { api, siteUrl } from "~/lib/api";

const syncedFormatter = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "long",
  timeStyle: "short",
});

// Se ejecuta en el navegador para mostrar el ranking actual del CMS.
export async function clientLoader() {
  const { data, meta } = await api.top10();
  return {
    tracks: data,
    playlistUrl: meta?.playlistUrl,
    syncedAt: meta?.syncedAt,
  };
}

export const meta: Route.MetaFunction = () => [
  { title: "UP10 TOP 10 — Ranking semanal" },
  {
    name: "description",
    content: "Las 10 canciones del momento según UP10. Ranking actualizado cada semana.",
  },
  { tagName: "link", rel: "canonical", href: `${siteUrl}/top10` },
];

export default function Top10({ loaderData }: Route.ComponentProps) {
  const { tracks, playlistUrl, syncedAt } = loaderData;

  return (
    <section className="container-up10 py-14 lg:py-20">
      <div className="grid w-full min-w-0 gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <p className="font-heading text-wine text-sm uppercase tracking-[0.12em]">/ Ranking</p>

          <h1 className="font-heading text-wine mt-3 text-[clamp(3rem,7vw,6rem)] uppercase leading-none">
            UP10 TOP 10
          </h1>

          <p className="text-ink/70 mt-5 max-w-xl text-lg leading-relaxed">
            Las 10 canciones del momento, ordenadas por la playlist oficial de UP10. Cada semana se
            actualiza con los movimientos y las nuevas entradas.
          </p>

          {playlistUrl ? (
            <ButtonLink to={playlistUrl} variant="primary" className="mt-8">
              Abrir playlist en Spotify →
            </ButtonLink>
          ) : null}
        </div>

        <div className="min-w-0">
          {tracks.length > 0 ? (
            <>
              <ol className="min-w-0 space-y-3">
                {tracks.map((track) => (
                  <TrackRow key={track.position} track={track} />
                ))}
              </ol>

              <p className="text-ink/50 mt-6 text-xs">
                Datos de Spotify.
                {syncedAt ? ` Actualizado el ${syncedFormatter.format(new Date(syncedAt))}.` : null}
              </p>
            </>
          ) : (
            <ComingSoon
              variant="card"
              title="El ranking vuelve pronto"
              description="Estamos actualizando la playlist oficial. Mientras tanto, puedes escucharla en Spotify."
              cta={playlistUrl ? { label: "Abrir en Spotify", href: playlistUrl } : undefined}
            />
          )}
        </div>
      </div>
    </section>
  );
}
