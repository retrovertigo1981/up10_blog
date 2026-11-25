import type { Partner } from "@up10/api-client";

export type PartnerLogo = {
  src: string;
  width: number;
  height: number;
};

/** Los PNG vienen exportados sobre un canvas común de 340×144. */
const LOGO_WIDTH = 340;
const LOGO_HEIGHT = 144;

const logoFiles: Record<string, string> = {
  "warner-music-group": "warner-music-group.png",
  "sony-music": "sony-music.png",
  universal: "universal.png",
  "rimas-publishing": "rimas-publishing.png",
  lotus: "lotus.png",
  "iguana-producciones": "iguana-producciones.png",
  "bizarro-live-entertainment": "bizarro-live-entertainment.png",
  "lollapalooza-chile": "lollapalooza-chile.png",
  "la-junta": "la-junta.png",
  "casa-parlante": "casa-parlante.png",
  "fenix-entertainment": "fenix-entertainment.png",
  "premios-musa": "premios-musa.png",
};

/** Nombres que la API puede devolver de forma abreviada. */
const aliases: Record<string, string> = {
  warner: "warner-music-group",
  sony: "sony-music",
  "universal-music": "universal",
  rimas: "rimas-publishing",
  iguana: "iguana-producciones",
  bizarro: "bizarro-live-entertainment",
  lollapalooza: "lollapalooza-chile",
  fenix: "fenix-entertainment",
};

export function partnerSlug(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "y")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Logo local de respaldo. Se usa cuando la API no trae `logo` o cuando la
 * portada se genera sin acceso al CMS.
 */
export function localPartnerLogo(name: string): PartnerLogo | null {
  const slug = partnerSlug(name);
  const key = aliases[slug] ?? slug;
  const file = logoFiles[key];

  return file
    ? {
        src: `/logos/${file}`,
        width: LOGO_WIDTH,
        height: LOGO_HEIGHT,
      }
    : null;
}

/** Catálogo de respaldo para que la sección nunca quede vacía. */
export const FALLBACK_PARTNERS: Partner[] = [
  "Warner Music Group",
  "Sony Music",
  "Universal Music",
  "Rimas Publishing",
  "Lotus",
  "Iguana Producciones",
  "Bizarro Live Entertainment",
  "Lollapalooza Chile",
  "La Junta",
  "Casa Parlante",
  "Fenix Entertainment",
  "Premios Musa",
].map((name, index) => ({ id: -(index + 1), name }));
