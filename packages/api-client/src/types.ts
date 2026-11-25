/**
 * Tipos del contrato de API.
 * Fuente de verdad: docs/specs/02-contrato-api.md
 */

export type ImageFocalPoint = "center" | "top" | "bottom" | "left" | "right";

export type Image = {
  src: string;
  width: number;
  height: number;
  alt: string;
  srcset: string;
  credit?: string;
  /** Punto de recorte para que la misma foto funcione en hero y bento. */
  focalPoint?: ImageFocalPoint;
  /** MIME real del archivo original (para OG y compatibilidad). */
  mimeType?: string;
  /** Versión WebP generada por WordPress, si existe. */
  webp?: {
    src: string;
    srcset: string;
  };
};

export type Author = {
  id: number;
  name: string;
  slug: string;
  bio?: string;
  avatar?: Image;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  count?: number;
};

export type ContentType = "noticia" | "entrevista" | "reportaje";

/** Etiqueta editorial curada: última hora, espectáculo, moda, etc. */
export type EditorialTag = {
  id: number;
  name: string;
  slug: string;
};

export type Seo = {
  title: string;
  description: string;
  ogImage?: Image;
  canonical?: string;
  noindex: boolean;
};

export type Pagination = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type PostSummary = {
  id: number;
  slug: string;
  title: string;
  dek?: string;
  cover: Image;
  category: Category;
  tipo: ContentType;
  author: Author;
  publishedAt: string;
  readingTime: number;
  isFeatured: boolean;
  /** Etiquetas editoriales curadas. */
  signals: EditorialTag[];
  /** Deriva de la señal `ultima-hora`; se prioriza en el hero. */
  isBreaking: boolean;
};

export type Post = PostSummary & {
  html: string;
  gallery: Image[];
  video?: { provider: "youtube"; id: string };
  tags: string[];
  related: PostSummary[];
  seo: Seo;
  updatedAt: string;
};

export type EventSummary = {
  id: number;
  slug: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  image: Image;
  ticketUrl?: string;
  status: "upcoming" | "past";
};

export type Event = EventSummary & {
  lineup: { name: string; url?: string }[];
  descriptionHtml: string;
  seo: Seo;
};

export type TrackMovement = "up" | "down" | "same" | "new";

export type Track = {
  position: number;
  /** Posición en el snapshot anterior; null si es nueva. */
  previousPosition?: number | null;
  movement: TrackMovement;
  isNew: boolean;
  title: string;
  artist: string;
  cover: Image;
  spotifyUrl: string;
  source: "spotify" | "manual";
};

export type Partner = {
  id: number;
  name: string;
  logo?: Image;
  url?: string;
};

export type Stat = {
  id: number;
  label: string;
  /** Versión corta para la barra compacta. */
  shortLabel?: string;
  value: number;
  prefix?: string;
  suffix?: string;
  /** "plain" evita el separador de miles, por ejemplo para un año. */
  format?: "number" | "plain";
  /** Si es false, la cifra se muestra fija desde el primer render. Default: true. */
  animated?: boolean;
};

export type InstagramPost = {
  id: string;
  image: Image;
  caption?: string;
  permalink: string;
  type: "image" | "carousel" | "video";
  publishedAt: string;
};

export type Page = {
  slug: string;
  title: string;
  hero: { title: string; subtitle?: string; image?: Image };
  html: string;
  seo: Seo;
};

export type HomePayload = {
  /** Las 3 noticias más recientes, en orden. */
  hero: PostSummary[];
  /** Las 10 más recientes; las 3 primeras son el hero. */
  latest: PostSummary[];
  interviews: PostSummary[];
  events: EventSummary[];
  top10: Track[];
  instagram: InstagramPost[];
  stats: Stat[];
  partners: Partner[];
  unplugged: Page | null;
  projects: Page[];
};

export type PostListQuery = {
  page?: number;
  perPage?: number;
  category?: string;
  tipo?: ContentType;
  tag?: string;
  /** Filtra por etiqueta editorial, por ejemplo `ultima-hora`. */
  signal?: string;
  exclude?: number[];
  orderBy?: "date" | "title";
  order?: "asc" | "desc";
};

export type EventListQuery = {
  scope?: "upcoming" | "past" | "all";
  page?: number;
  perPage?: number;
};

export type SearchQuery = {
  q: string;
  page?: number;
  perPage?: number;
};

export type NewsletterPayload = {
  email: string;
  consent: boolean;
  source?: string;
  website?: string;
};
