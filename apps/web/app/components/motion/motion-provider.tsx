import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { LenisOptions } from "lenis";
import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, useState } from "react";
import { useLocation, useNavigationType } from "react-router";

const LENIS_OPTIONS: LenisOptions = {
  autoRaf: false,
  lerp: 0.1,
  smoothWheel: true,
  syncTouch: false,
  anchors: { offset: -96 },
  stopInertiaOnNavigate: true,
  respectReducedMotion: true,
};

/** Preferencia de movimiento reducido, resuelta en cliente para no romper la hidratación. */
function useReducedMotionPreference() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);

    update();
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

function MotionEngine() {
  const lenis = useLenis();
  const location = useLocation();
  const navigationType = useNavigationType();

  // Sincroniza Lenis con el ticker de GSAP y con ScrollTrigger.
  useEffect(() => {
    if (!lenis) return;

    gsap.registerPlugin(ScrollTrigger);

    const onScroll = () => ScrollTrigger.update();
    const tick = (time: number) => lenis.raf(time * 1000);

    lenis.on("scroll", onScroll);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.off("scroll", onScroll);
    };
  }, [lenis]);

  // Revelados y parallax por ruta. El contenido queda visible si no hay JS o
  // si el usuario prefiere movimiento reducido.
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");

      if (items.length > 0) {
        // Solo ocultamos lo que está por debajo del pliegue: lo visible al
        // cargar no debe parpadear ni retrasar el LCP.
        const belowFold = items.filter(
          (item) => item.getBoundingClientRect().top > window.innerHeight * 0.88,
        );

        if (belowFold.length > 0) {
          gsap.set(belowFold, { y: 24, opacity: 0 });
        }

        ScrollTrigger.batch(items, {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              y: 0,
              opacity: 1,
              duration: 0.7,
              ease: "power3.out",
              stagger: 0.08,
              overwrite: true,
            }),
        });
      }
    });

    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const images = gsap.utils.toArray<HTMLElement>("[data-parallax]");

      images.forEach((image) => {
        const trigger = image.parentElement;
        if (!trigger) return;

        gsap.fromTo(
          image,
          { yPercent: -4, scale: 1.08 },
          {
            yPercent: 4,
            ease: "none",
            scrollTrigger: {
              trigger,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          },
        );
      });
    });

    const refresh = () => ScrollTrigger.refresh();
    const fontReady = document.fonts?.ready;
    fontReady?.then(refresh).catch(() => undefined);
    const timeout = window.setTimeout(refresh, 250);

    return () => {
      window.clearTimeout(timeout);
      mm.revert();
    };
  }, [location.pathname]);

  // Al cambiar de ruta, recalcula posiciones. En navegaciones nuevas vuelve
  // arriba; en back/forward deja que ScrollRestoration haga su trabajo.
  useEffect(() => {
    if (!lenis) return;

    ScrollTrigger.refresh();

    if (navigationType !== "POP" && !location.hash) {
      lenis.scrollTo(0, { immediate: true });
    }
  }, [lenis, location.pathname, location.hash, navigationType]);

  return null;
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotionPreference();

  if (reduced) return <>{children}</>;

  return (
    <ReactLenis root options={LENIS_OPTIONS}>
      <MotionEngine />
      {children}
    </ReactLenis>
  );
}
