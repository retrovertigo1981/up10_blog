import type { Image as ImageData } from "@up10/api-client";

import { cn } from "~/lib/cn";

const ratios = {
  "1:1": "aspect-square",
  "4:5": "aspect-[4/5]",
  "4:3": "aspect-[4/3]",
  "16:9": "aspect-video",
  "3:2": "aspect-[3/2]",
} as const;

export type ImageRatio = keyof typeof ratios;

export function Image({
  data,
  ratio = "16:9",
  priority = false,
  lowPriority = false,
  sizes,
  className,
  imgClassName,
  fill = false,
  parallax = false,
}: {
  data: ImageData;
  ratio?: ImageRatio;
  priority?: boolean;
  lowPriority?: boolean;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  fill?: boolean;
  /** Añade un parallax corto en desktop mediante GSAP. */
  parallax?: boolean;
}) {
  if (import.meta.env.DEV && !data.alt) {
    throw new Error(`La imagen ${data.src} no tiene texto alternativo.`);
  }

  const image = (
    <picture className="block h-full w-full">
      {data.webp ? (
        <source type="image/webp" srcSet={data.webp.srcset || data.webp.src} sizes={sizes} />
      ) : null}
      <img
        data-parallax={parallax ? "" : undefined}
        src={data.src}
        alt={data.alt}
        width={data.width}
        height={data.height}
        srcSet={data.srcset || undefined}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : lowPriority ? "low" : undefined}
        decoding="async"
        style={{ objectPosition: data.focalPoint ?? "center" }}
        className={cn("h-full w-full object-cover", imgClassName)}
      />
    </picture>
  );

  if (fill) {
    return <div className={cn("bg-wine/20 absolute inset-0", className)}>{image}</div>;
  }

  return (
    <div className={cn("bg-wine/10 rounded-card overflow-hidden", ratios[ratio], className)}>
      {image}
    </div>
  );
}
