import { useEffect, useRef, useState } from "react";

const formatter = new Intl.NumberFormat("es-CL");

function formatValue(value: number, format: "number" | "plain") {
  return format === "plain" ? String(value) : formatter.format(value);
}

export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 900,
  format = "number",
  animate = true,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  /** "plain" evita el separador de miles, por ejemplo para un año. */
  format?: "number" | "plain";
  /** Si es false, la cifra se muestra fija desde el primer render. */
  animate?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);
  const [display, setDisplay] = useState(() => (animate ? 0 : value));

  useEffect(() => {
    if (!animate) return;

    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const runAnimation = () => {
      const start = performance.now();

      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        setDisplay(Math.round(value * eased));

        if (progress < 1) {
          frame = requestAnimationFrame(tick);
        }
      };

      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (hasAnimated.current) return;
      hasAnimated.current = true;

      if (reduced) {
        setDisplay(value);
        return;
      }

      runAnimation();
    };

    // En la primera visita los stats esperan a que termine la intro y el telón
    // se haya levantado. En un refresh normal (sin intro) animan al entrar en
    // pantalla como siempre.
    const introActive = document.documentElement.dataset.intro === "on";
    if (introActive) {
      const onIntroDone = () => start();
      const fallback = window.setTimeout(() => {
        if (document.documentElement.dataset.intro !== "on") start();
      }, 13000);

      window.addEventListener("up10:intro-done", onIntroDone);

      return () => {
        window.removeEventListener("up10:intro-done", onIntroDone);
        window.clearTimeout(fallback);
        cancelAnimationFrame(frame);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        start();
      },
      { threshold: 0.4 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration, animate]);

  const finalText = `${prefix}${formatValue(value, format)}${suffix}`;

  if (!animate) {
    return <span className="tabular-nums">{finalText}</span>;
  }

  return (
    <span ref={ref} className="inline-grid justify-items-center tabular-nums">
      {/* Reserva el ancho final para que el número no empuje la etiqueta al contar. */}
      <span aria-hidden="true" className="invisible col-start-1 row-start-1">
        {finalText}
      </span>
      <span aria-hidden="true" className="col-start-1 row-start-1">
        {prefix}
        {formatValue(display, format)}
        {suffix}
      </span>
      <span className="sr-only">{finalText}</span>
    </span>
  );
}
