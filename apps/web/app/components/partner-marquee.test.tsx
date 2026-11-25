import type { Partner } from "@up10/api-client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PartnerMarquee } from "./partner-marquee";

const partners: Partner[] = [
  { id: 1, name: "Warner Music Group" },
  { id: 2, name: "Sony Music" },
  { id: 3, name: "Universal Music" },
  { id: 4, name: "Rimas Publishing" },
  { id: 5, name: "Lotus" },
  { id: 6, name: "Iguana Producciones" },
  { id: 7, name: "Bizarro Live Entertainment" },
  { id: 8, name: "Lollapalooza Chile" },
  { id: 9, name: "La Junta" },
  { id: 10, name: "Casa Parlante" },
  { id: 11, name: "Fenix Entertainment" },
  { id: 12, name: "Premios Musa" },
];

describe("PartnerMarquee", () => {
  it("muestra el título y los logos locales de las marcas", () => {
    const html = renderToStaticMarkup(<PartnerMarquee partners={partners} />);

    expect(html).toContain("Marcas que han confiado en UP10");
    expect(html).toContain('alt="Warner Music Group"');
    expect(html).toContain("/logos/warner-music-group.png");
    expect(html).toContain("/logos/premios-musa.png");
  });

  it("usa el nombre como respaldo cuando no hay logo", () => {
    const html = renderToStaticMarkup(
      <PartnerMarquee partners={[{ id: 99, name: "Marca sin logo" }]} />,
    );

    expect(html).toContain("Marca sin logo");
    expect(html).not.toContain("/logos/marca-sin-logo.png");
  });
});
