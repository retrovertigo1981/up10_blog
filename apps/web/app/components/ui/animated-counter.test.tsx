import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { StatsBar } from "../stats-bar";
import { AnimatedCounter } from "./animated-counter";

describe("AnimatedCounter", () => {
  it("renderiza el valor final desde el servidor cuando la animación está desactivada", () => {
    const html = renderToStaticMarkup(
      <AnimatedCounter value={2018} format="plain" animate={false} />,
    );

    expect(html).toContain("2018");
    expect(html).not.toContain(">0<");
  });

  it("mantiene el contador animado para las cifras que no son estáticas", () => {
    const html = renderToStaticMarkup(<AnimatedCounter value={136000} prefix="+" />);

    expect(html).toContain("+136.000");
    expect(html).toContain(">+0<");
  });
});

describe("StatsBar", () => {
  it("muestra el año fijo sin pasar por cero", () => {
    const html = renderToStaticMarkup(
      <StatsBar
        stats={[
          {
            id: 3,
            label: "Conectando con la música desde",
            shortLabel: "Desde",
            value: 2018,
            format: "plain",
            animated: false,
          },
        ]}
      />,
    );

    expect(html).toContain("2018");
    expect(html).not.toContain(">0<");
  });
});
