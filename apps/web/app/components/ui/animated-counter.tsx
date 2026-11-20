import { useEffect, useRef, useState } from "react";

const formatter = new Intl.NumberFormat("es-CL");

export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 800,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const animate = () => {
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

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting) || hasAnimated.current) return;

        hasAnimated.current = true;
        observer.disconnect();

        if (reduced) {
          setDisplay(value);
          return;
        }

        animate();
      },
      { threshold: 0.4 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      <span aria-hidden="true">
        {prefix}
        {formatter.format(display)}
        {suffix}
      </span>
      <span className="sr-only">
        {prefix}
        {formatter.format(value)}
        {suffix}
      </span>
    </span>
  );
}
