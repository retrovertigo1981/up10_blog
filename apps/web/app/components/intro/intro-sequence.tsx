import { useGSAP } from "@gsap/react";
import { CustomEase } from "gsap/CustomEase";
import { SlowMo } from "gsap/EasePack";
import { gsap } from "gsap";
import { useRef } from "react";
import { useLocation } from "react-router";

import { INTRO_STORAGE_KEY } from "./intro-gate";
import { IntroLogo } from "./intro-logo";
import { IntroWave } from "./intro-wave";

import "./intro.css";

const LOGO_VIEWBOX_HEIGHT = 254.363;

gsap.registerPlugin(CustomEase);

const EASE_SCALE = CustomEase.create(
  "introScaleEase",
  "M0,0 C0.445,0 0.39,0.583 0.426,0.707 0.457,0.816 0.424,1 1,1",
);
const EASE_SLOW = SlowMo.config(0.25, 0.95, false);

const SOLO_WORDS = [
  { key: "welcome", text: "Bienvenidos" },
  { key: "al", text: "al" },
  { key: "universe", text: "Universo" },
  { key: "de", text: "de" },
] as const;

function CurtainCap({ position }: { position: "top" | "bottom" }) {
  const path = position === "top" ? "M 0 12 C 30 0 70 0 100 12 Z" : "M 0 0 C 30 12 70 12 100 0 Z";

  return (
    <svg
      className={`intro-curtain__cap intro-curtain__cap--${position}`}
      viewBox="0 0 100 12"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d={path} fill="currentColor" />
    </svg>
  );
}

function IntroWord({ text, word }: { text: string; word: string }) {
  return (
    <span className="intro-word intro-solo" data-intro-word={word}>
      {Array.from(text).map((character, index) =>
        character === " " ? (
          <span key={`${word}-space-${index}`} className="intro-char intro-char--space" />
        ) : (
          <span key={`${word}-${index}`} className="intro-char" data-intro-char>
            {character}
          </span>
        ),
      )}
    </span>
  );
}

export function IntroSequence() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const rootRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const finishedRef = useRef(false);

  useGSAP(
    () => {
      if (!isHome) return;

      const root = document.documentElement;
      if (root.dataset.intro !== "on") return;

      const scope = rootRef.current;
      const front = frontRef.current;
      const back = backRef.current;
      if (!scope || !front || !back) return;

      const stage = scope.querySelector<HTMLElement>("[data-intro-stage]");
      const logo = scope.querySelector<HTMLElement>("[data-intro-logo]");
      const strokeLayer = scope.querySelector<SVGSVGElement>("[data-intro-stroke]");
      const fillRect = scope.querySelector<SVGRectElement>("[data-intro-fill-rect]");
      const shutter = scope.querySelector<HTMLElement>("[data-intro-wave-shutter]");
      const waves = Array.from(scope.querySelectorAll<SVGGElement>("[data-intro-wave]"));
      const words = SOLO_WORDS.map(({ key }) =>
        scope.querySelector<HTMLElement>(`[data-intro-solo="${key}"] .intro-word`),
      );
      const chars = SOLO_WORDS.map(({ key }) =>
        Array.from(
          scope.querySelectorAll<HTMLElement>(`[data-intro-solo="${key}"] [data-intro-char]`),
        ),
      );

      if (
        !stage ||
        !logo ||
        !strokeLayer ||
        !fillRect ||
        !shutter ||
        words.some((word) => !word) ||
        chars.some((list) => list.length === 0) ||
        waves.length === 0
      ) {
        return;
      }

      const site = document.getElementById("site-content");
      const theme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
      const previousTheme = theme?.content ?? "#FAE3B9";

      site?.setAttribute("inert", "");
      root.classList.add("intro-lock");
      if (theme) theme.content = "#57000B";

      const strokePaths = Array.from(strokeLayer.querySelectorAll("path"));
      const lengths = strokePaths.map((path) => {
        try {
          return path.getTotalLength();
        } catch {
          return 0;
        }
      });
      let safetyTimer = 0;
      let timeline: gsap.core.Timeline | null = null;

      const finish = () => {
        if (finishedRef.current) return;
        finishedRef.current = true;

        window.clearTimeout(safetyTimer);
        const forced = root.dataset.introForce === "on";

        root.removeAttribute("data-intro");
        root.removeAttribute("data-intro-force");
        root.classList.remove("intro-lock");

        if (!forced) {
          try {
            window.localStorage.setItem(INTRO_STORAGE_KEY, "1");
          } catch {
            /* Sin almacenamiento: la intro vuelve a mostrarse la próxima vez. */
          }
        }

        site?.removeAttribute("inert");
        if (theme) theme.content = previousTheme;

        window.scrollTo(0, 0);
        window.dispatchEvent(new Event("up10:intro-done"));
      };

      gsap.set(shutter, { scaleX: 1.15, transformOrigin: "right center" });
      gsap.set(waves, { xPercent: -3, scaleY: 1, transformOrigin: "50% 50%" });
      gsap.set(back, { scale: 1.035, transformOrigin: "50% 50%" });
      gsap.set(strokeLayer, { opacity: 0 });
      gsap.set(strokePaths, {
        strokeDasharray: (index: number) => `${lengths[index]} ${lengths[index]}`,
        strokeDashoffset: (index: number) => lengths[index],
      });
      gsap.set(fillRect, { attr: { y: LOGO_VIEWBOX_HEIGHT, height: 0 } });

      gsap.set(words, { yPercent: 26, opacity: 0, scale: 1.12 });
      gsap.set(chars.flat(), { yPercent: 36, opacity: 0, scale: 1.05 });

      timeline = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.out" },
        onComplete: finish,
      });

      const enterWord = (index: number, start: number, duration: number) => {
        const word = words[index];
        const wordChars = chars[index];
        if (!word) return;

        timeline
          .to(word, { yPercent: 0, opacity: 1, duration, ease: EASE_SLOW }, start)
          .to(word, { scale: 1, duration, ease: EASE_SCALE }, start)
          .to(
            wordChars,
            {
              yPercent: 0,
              opacity: 1,
              scale: 1,
              duration: duration - 0.05,
              stagger: 0.022,
              ease: "power3.out",
            },
            start,
          );
      };

      const exitWord = (index: number, at: number) => {
        const word = words[index];
        if (!word) return;
        timeline.to(
          word,
          { yPercent: -24, opacity: 0, scale: 0.97, duration: 0.32, ease: "power2.inOut" },
          at,
        );
      };

      timeline
        .to(shutter, { scaleX: 0, duration: 1.8, ease: "power2.inOut" }, 0.05)
        .to(waves, { xPercent: 4, duration: 1.8, ease: "power2.inOut" }, 0.05);

      // La primera palabra aparece y la onda se retira.
      timeline.to(waves, { opacity: 0, duration: 0.35, ease: "sine.out" }, 1.8);

      enterWord(0, 1.8, 0.6);
      exitWord(0, 2.7);
      enterWord(1, 3.05, 0.5);
      exitWord(1, 3.8);
      enterWord(2, 4.15, 0.65);
      exitWord(2, 5.1);
      enterWord(3, 5.45, 0.5);
      exitWord(3, 6.2);

      timeline
        .set(strokeLayer, { opacity: 1 }, 6.55)
        .to(
          strokePaths,
          {
            strokeDashoffset: 0,
            duration: 0.7,
            stagger: 0.04,
            ease: "power2.inOut",
          },
          6.55,
        )
        .to(
          fillRect,
          {
            attr: { y: 0, height: LOGO_VIEWBOX_HEIGHT },
            duration: 0.4,
            ease: "power3.inOut",
          },
          7.25,
        )
        .to(strokeLayer, { opacity: 0, duration: 0.18, ease: "power2.in" }, 7.6)
        .to(logo, { scale: 1.012, duration: 0.2, yoyo: true, repeat: 1, ease: "sine.inOut" }, 7.7)
        // El logo queda solo, un instante más, antes del telón.
        .to(front, { yPercent: -112, duration: 0.85, ease: "power3.inOut" }, 8.3)
        .to(back, { yPercent: -112, duration: 1.15, ease: "power2.inOut" }, 8.45)
        .to(back, { scale: 1, duration: 1.15, ease: "power2.inOut" }, 8.45);

      timeline.play(0);
      safetyTimer = window.setTimeout(finish, 12000);

      return () => {
        window.clearTimeout(safetyTimer);
        timeline?.kill();
        site?.removeAttribute("inert");
        if (theme) theme.content = previousTheme;
        root.classList.remove("intro-lock");
        /* No se retira data-intro: en StrictMode el efecto se monta dos veces y
           el segundo montaje debe encontrar el gate activo. Si la intro se
           abandona, el timeout del gate limpia el atributo. */
      };
    },
    { scope: rootRef, dependencies: [isHome] },
  );

  if (!isHome) return null;

  return (
    <div className="intro" ref={rootRef} aria-hidden="true">
      <div className="intro-curtain intro-curtain--back" ref={backRef}>
        <div className="intro-curtain__panel" />
        <CurtainCap position="top" />
        <CurtainCap position="bottom" />
      </div>

      <div className="intro-curtain intro-curtain--front" ref={frontRef}>
        <div className="intro-curtain__panel">
          <div className="intro-stage" data-intro-stage>
            <IntroWave />
            <div className="intro-wave-shutter" data-intro-wave-shutter />

            <div className="intro-message">
              {SOLO_WORDS.map(({ key, text }) => (
                <div key={key} className="intro-solo-word" data-intro-solo={key}>
                  <IntroWord text={text} word={key} />
                </div>
              ))}

              <div className="intro-logo-solo">
                <IntroLogo />
              </div>
            </div>
          </div>
        </div>

        <CurtainCap position="top" />
        <CurtainCap position="bottom" />
      </div>
    </div>
  );
}
