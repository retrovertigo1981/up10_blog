import { Play } from "lucide-react";
import { useState } from "react";

export function YouTubeLite({ id, title }: { id: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="rounded-card aspect-video overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Reproducir video: ${title}`}
      className="rounded-card group relative aspect-video w-full overflow-hidden bg-black"
    >
      <img
        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover opacity-80 transition-opacity duration-300 group-hover:opacity-100"
      />

      <span className="absolute inset-0 flex items-center justify-center">
        <span className="bg-wine text-cream flex size-16 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105">
          <Play className="size-7" fill="currentColor" aria-hidden="true" />
        </span>
      </span>
    </button>
  );
}
