import type { PostSummary } from "@up10/api-client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";

import { cn } from "~/lib/cn";

import { formatDate } from "./article-card";
import { Image } from "./ui/image";

const AUTOPLAY_MS = 6000;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function HeroSlide({
  post,
  priority,
}: {
  post: PostSummary;
  priority: boolean;
}) {
  return (
    <div className="container-up10 grid h-full items-end gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
      <div>
        <p className="font-heading text-wine text-base tracking-[0.05em]">/ NOTICIAS</p>

        <p className="font-heading text-wine mt-3 text-[0.95rem] tracking-[0.05em] uppercase">
          {post.category.name}
        </p>

        <h2 className="mt-3 text-[clamp(2rem,4vw,2.625rem)] leading-[1.05]">
          <Link
            to={`/noticias/${post.slug}`}
            className="hover:text-wine transition-colors"
          >
            {post.title}
          </Link>
        </h2>

        <p className="text-ink/75 mt-5 max-w-[32ch] text-[17px] leading-relaxed lg:text-xl">
          {post.dek}
        </p>

        <Link
          to={`/noticias/${post.slug}`}
          className="text-wine mt-6 inline-block text-sm uppercase tracking-[0.06em] underline decoration-2 underline-offset-[6px] lg:text-base"
        >
          Leer reportaje →
        </Link>

        <p className="text-ink/50 mt-5 text-[13px]">
          {post.author.name} · {formatDate(post.publishedAt)} · {post.readingTime} min de lectura
        </p>
      </div>

      <Link to={`/noticias/${post.slug}`} className="group block">
        <Image
          data={post.cover}
          ratio="3:2"
          priority={priority}
          lowPriority={!priority}
          imgClassName="transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </Link>
    </div>
  );
}

export function HeroCarousel({ posts }: { posts: PostSummary[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [interacting, setInteracting] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const goTo = useCallback(
    (next: number) => {
      const track = trackRef.current;
      if (!track || posts.length === 0) return;

      const clamped = Math.max(0, Math.min(next, posts.length - 1));

      track.scrollTo({
        left: clamped * track.clientWidth,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });

      setIndex(clamped);
      setStatus(`Noticia ${clamped + 1} de ${posts.length}`);
    },
    [posts.length],
  );

  // Sincroniza el marcador cuando el usuario arrastra o hace scroll nativo.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = Math.round(track.scrollLeft / track.clientWidth);
        setIndex((current) => (next === current ? current : next));
      });
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const playing = !interacting && !reduced && posts.length > 1;

  useEffect(() => {
    if (!playing) return;

    const id = window.setInterval(() => {
      const track = trackRef.current;
      if (!track) return;

      const next = (index + 1) % posts.length;
      track.scrollTo({
        left: next * track.clientWidth,
        behavior: "smooth",
      });
      setIndex(next);
      setStatus(`Noticia ${next + 1} de ${posts.length}`);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(id);
  }, [playing, index, posts.length]);

  if (posts.length === 0) return null;

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Noticias destacadas"
      className="pt-10 pb-10 lg:pt-16 lg:pb-12"
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setInteracting(false);
        }
      }}
    >
      <h1 className="sr-only">UP10 — Últimas noticias de música</h1>

      <div
        ref={trackRef}
        role="group"
        aria-label="Noticias destacadas"
        className="hero-track flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {posts.map((post, position) => (
          <div
            key={post.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${position + 1} de ${posts.length}`}
            inert={position !== index ? true : undefined}
            className="w-full shrink-0 snap-start snap-always"
          >
            <HeroSlide post={post} priority={position === 0} />
          </div>
        ))}
      </div>

      <div className="container-up10 mt-6 flex flex-wrap items-center gap-5">
        <div role="group" aria-label="Elegir noticia" className="flex items-center gap-1">
          {posts.map((post, position) => (
            <button
              key={post.id}
              type="button"
              onClick={() => goTo(position)}
              aria-label={`Ir a la noticia ${position + 1}: ${post.title}`}
              aria-current={position === index ? "true" : undefined}
              className="group flex min-h-6 min-w-6 items-center px-1 py-2.5"
            >
              <span
                className={cn(
                  "block h-1 w-10 origin-center rounded-full transition-transform",
                  position === index
                    ? "bg-wine scale-y-150"
                    : "bg-wine/25 group-hover:bg-wine/50",
                )}
              />
            </button>
          ))}
        </div>

        <p role="status" aria-live="polite" className="sr-only">
          {status}
        </p>
      </div>
    </section>
  );
}
