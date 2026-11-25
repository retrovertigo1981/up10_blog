import type { Partner } from "@up10/api-client";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";

import { FALLBACK_PARTNERS, localPartnerLogo } from "~/lib/partner-logos";

const ROW_A_SPEED = 34; // px/s
const ROW_B_SPEED = 24; // px/s

type Direction = "left" | "right";

function splitRows(partners: Partner[]): [Partner[], Partner[]] {
  const first: Partner[] = [];
  const second: Partner[] = [];

  partners.forEach((partner, index) => {
    (index % 2 === 0 ? first : second).push(partner);
  });

  return [first, second];
}

function PartnerLogo({ partner }: { partner: Partner }) {
  const remote = partner.logo;
  const local = remote ? null : localPartnerLogo(partner.name);
  const src = remote?.src ?? local?.src;
  const width = remote?.width ?? local?.width ?? 340;
  const height = remote?.height ?? local?.height ?? 144;

  if (!src) {
    return (
      <span className="font-heading text-cream/80 inline-block text-xl uppercase tracking-wide">
        {partner.name}
      </span>
    );
  }

  const webp = remote?.webp;

  return (
    <picture>
      {webp ? (
        <source
          type="image/webp"
          srcSet={webp.srcset || webp.src}
          sizes="(min-width: 1024px) 156px, (min-width: 640px) 132px, 104px"
        />
      ) : null}
      <img
        src={src}
        alt={partner.name}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className="h-10 w-[104px] object-contain opacity-80 transition-opacity duration-300 hover:opacity-100 sm:h-12 sm:w-[132px] lg:h-14 lg:w-[156px]"
      />
    </picture>
  );
}

function MarqueeRow({
  partners,
  copies,
  direction,
  speed,
}: {
  partners: Partner[];
  copies: number;
  direction: Direction;
  speed: number;
}) {
  const items = useMemo(
    () =>
      Array.from({ length: copies }, (_, copy) =>
        partners.map((partner) => ({ partner, copy })),
      ).flat(),
    [partners, copies],
  );

  return (
    <div className="marquee-row relative overflow-hidden py-1">
      <ul
        data-marquee-track
        data-copies={copies}
        data-direction={direction}
        data-speed={speed}
        className="marquee-track flex w-max items-center"
      >
        {items.map(({ partner, copy }) => (
          <li
            key={`${copy}-${partner.id}-${partner.name}`}
            aria-hidden={copy > 0 ? true : undefined}
            className="shrink-0 pr-10 sm:pr-14 lg:pr-20"
          >
            <PartnerLogo partner={partner} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PartnerMarquee({ partners }: { partners: Partner[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const timelines = useRef<gsap.core.Tween[]>([]);
  const pausedRef = useRef(false);
  const [hovering, setHovering] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [inView, setInView] = useState(true);
  const [documentVisible, setDocumentVisible] = useState(true);

  const list = partners.length > 0 ? partners : FALLBACK_PARTNERS;
  const [rowA, rowB] = useMemo(() => splitRows(list), [list]);
  const listKey = useMemo(
    () => list.map((partner) => `${partner.id}:${partner.name}`).join("|"),
    [list],
  );

  // Cantidad mínima de copias para que el loop no muestre huecos en pantallas
  // anchas y para que una lista corta siga llenando la fila.
  const copiesA = Math.max(4, Math.ceil(24 / Math.max(1, rowA.length)));
  const copiesB = Math.max(4, Math.ceil(24 / Math.max(1, rowB.length)));

  const paused = hovering || focusWithin || !inView || !documentVisible;

  useEffect(() => {
    pausedRef.current = paused;
    timelines.current.forEach((timeline) => timeline.paused(paused));
  }, [paused]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? true),
      { rootMargin: "200px 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setDocumentVisible(!document.hidden);

    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const mm = gsap.matchMedia();

      const build = () => {
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          const tracks = gsap.utils.toArray<HTMLElement>("[data-marquee-track]", section);

          const tweens = tracks.map((track) => {
            const copies = Number(track.dataset.copies ?? 4);
            const direction = track.dataset.direction === "right" ? "right" : "left";
            const speed = Number(track.dataset.speed ?? 32);
            const setWidth = track.scrollWidth / Math.max(1, copies);
            const duration = Math.max(8, setWidth / Math.max(1, speed));
            const shift = -100 / Math.max(1, copies);

            gsap.set(track, { xPercent: direction === "right" ? shift : 0 });

            const tween = gsap.to(track, {
              xPercent: direction === "right" ? 0 : shift,
              duration,
              ease: "none",
              repeat: -1,
              force3D: true,
            });

            tween.paused(pausedRef.current);
            return tween;
          });

          timelines.current = tweens;

          return () => {
            tweens.forEach((tween) => tween.kill());
            timelines.current = [];
          };
        });
      };

      build();

      let frame = 0;
      const onResize = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          mm.revert();
          build();
        });
      };

      window.addEventListener("resize", onResize, { passive: true });

      return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("resize", onResize);
        mm.revert();
        timelines.current = [];
      };
    },
    { scope: sectionRef, dependencies: [listKey] },
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="partners-title"
      className="bg-wine text-cream overflow-hidden py-16 lg:py-24"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocusCapture={() => setFocusWithin(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocusWithin(false);
        }
      }}
    >
      <div className="container-up10">
        <div data-reveal className="mx-auto max-w-3xl text-center">
          <p className="font-heading text-cream/75 text-sm uppercase tracking-[0.14em]">/ Marcas</p>
          <h2
            id="partners-title"
            className="font-heading mt-3 text-[clamp(1.75rem,3.6vw,3rem)] font-normal uppercase leading-[0.95]"
          >
            Marcas que han confiado en UP10
          </h2>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:gap-4 lg:mt-14 lg:gap-6">
        <MarqueeRow partners={rowA} copies={copiesA} direction="left" speed={ROW_A_SPEED} />
        {rowB.length > 0 ? (
          <MarqueeRow partners={rowB} copies={copiesB} direction="right" speed={ROW_B_SPEED} />
        ) : null}
      </div>
    </section>
  );
}
