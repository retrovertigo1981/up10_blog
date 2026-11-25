import type { Image } from "@up10/api-client";

import { siteUrl } from "./api";

export const defaultOgImage = `${siteUrl}/brand/og-default.jpg`;

export function imageMimeType(image: Image) {
  if (image.mimeType) {
    return image.mimeType;
  }

  const clean = image.src.split("?")[0].toLowerCase();

  if (clean.endsWith(".png")) return "image/png";
  if (clean.endsWith(".webp")) return "image/webp";
  if (clean.endsWith(".gif")) return "image/gif";

  return "image/jpeg";
}

export function defaultOgMetadata() {
  return [
    { property: "og:image", content: defaultOgImage },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:type", content: "image/jpeg" },
    { property: "og:image:alt", content: "UP10 — Más música, menos problemas." },
  ];
}
