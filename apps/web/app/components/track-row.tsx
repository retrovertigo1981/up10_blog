import type { Track } from "@up10/api-client";
import { SiSpotify } from "@icons-pack/react-simple-icons";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

import { Image } from "./ui/image";

function Movement({ track }: { track: Track }) {
  if (track.movement === "new") {
    return (
      <span className="bg-cream text-wine rounded-button px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.08em] uppercase">
        Nuevo
      </span>
    );
  }

  if (track.movement === "same" || track.previousPosition == null) {
    return (
      <span className="text-cream/30 flex items-center" aria-label="Se mantiene en la misma posición">
        <Minus className="size-3" aria-hidden="true" />
      </span>
    );
  }

  const diff = Math.abs(track.previousPosition - track.position);
  const isUp = track.movement === "up";

  return (
    <span className="text-cream/70 flex items-center gap-0.5 text-[11px] tabular-nums">
      <span className="sr-only">
        {isUp ? `Subió ${diff}` : `Bajó ${diff}`} {diff === 1 ? "posición" : "posiciones"}
      </span>
      {isUp ? (
        <ArrowUp className="size-3" aria-hidden="true" />
      ) : (
        <ArrowDown className="size-3" aria-hidden="true" />
      )}
      <span aria-hidden="true">{diff}</span>
    </span>
  );
}

export function TrackRow({ track }: { track: Track }) {
  return (
    <li className="bg-[linear-gradient(130deg,#000000_0%,#57000B_100%)] rounded-card flex min-w-0 items-center gap-3 px-4 py-3 text-cream">
      <span className="font-heading text-cream/50 w-7 shrink-0 text-xl tabular-nums">
        {String(track.position).padStart(2, "0")}
      </span>

      <Image
        data={track.cover}
        ratio="1:1"
        className="w-12 shrink-0 rounded-md"
        imgClassName="rounded-md"
      />

      <div className="min-w-0 flex-1">
        <p className="font-display text-cream truncate text-base">{track.title}</p>
        <p className="text-cream/60 truncate text-sm">{track.artist}</p>
      </div>

      <Movement track={track} />

      <a
        href={track.spotifyUrl}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={`Escuchar ${track.title} de ${track.artist} en Spotify`}
        className="text-cream/60 hover:text-cream shrink-0 p-2"
      >
        <SiSpotify size={16} aria-hidden="true" />
      </a>
    </li>
  );
}
