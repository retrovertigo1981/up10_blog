import type {
  Author,
  Category,
  EditorialTag,
  EventSummary,
  HomePayload,
  InstagramPost,
  Page,
  Partner,
  Post,
  PostSummary,
  Seo,
  Stat,
  Track,
} from "@up10/api-client";

const img = (src: string, width: number, height: number, alt: string) => ({
  src,
  width,
  height,
  alt,
  srcset: "",
  focalPoint: "center" as const,
});

const heroImage = img("/mocks/hero-3x2.svg", 1600, 1067, "Fotografía principal de prueba");
const featureImage = img("/mocks/feature-4x3.svg", 1200, 900, "Fotografía de reportaje");
const unpluggedImage = img("/mocks/unplugged-4x3.svg", 1200, 900, "Sesión Unplugged");
const standard = [
  img("/mocks/standard-16x9-a.svg", 1280, 720, "Fotografía de nota A"),
  img("/mocks/standard-16x9-b.svg", 1280, 720, "Fotografía de nota B"),
  img("/mocks/standard-16x9-c.svg", 1280, 720, "Fotografía de nota C"),
  img("/mocks/standard-16x9-d.svg", 1280, 720, "Fotografía de nota D"),
  img("/mocks/standard-16x9-e.svg", 1280, 720, "Fotografía de nota E"),
  img("/mocks/standard-16x9-f.svg", 1280, 720, "Fotografía de nota F"),
];

const categories: Category[] = [
  { id: 1, name: "Actualidad musical", slug: "actualidad-musical" },
  { id: 2, name: "Música chilena", slug: "musica-chilena" },
  { id: 3, name: "Música internacional", slug: "musica-internacional" },
  { id: 4, name: "Conciertos y festivales", slug: "conciertos-festivales" },
  { id: 5, name: "Lanzamientos", slug: "lanzamientos" },
  { id: 6, name: "Entrevistas", slug: "entrevistas" },
  { id: 7, name: "Industria musical", slug: "industria-musical" },
  { id: 8, name: "Cultura y entretenimiento", slug: "cultura-entretenimiento" },
  { id: 9, name: "Estrenos", slug: "estrenos" },
  { id: 10, name: "Estrenos | Música Latina", slug: "estrenos-musica-latina" },
  { id: 11, name: "Uncategorized", slug: "uncategorized" },
];

const editorialSignals: Record<"breaking" | "show" | "fashion", EditorialTag> = {
  breaking: { id: 1, name: "Última hora", slug: "ultima-hora" },
  show: { id: 2, name: "Espectáculo", slug: "espectaculo" },
  fashion: { id: 3, name: "Moda", slug: "moda" },
};

const authors: Author[] = [
  {
    id: 1,
    name: "Redacción UP10",
    slug: "redaccion",
    bio: "Equipo editorial de UP10.",
    avatar: img("/mocks/avatar.svg", 200, 200, "Avatar de Redacción UP10"),
  },
  {
    id: 2,
    name: "Camila Rojas",
    slug: "camila-rojas",
    bio: "Periodista musical. Cubre escena local y festivales.",
    avatar: img("/mocks/avatar.svg", 200, 200, "Avatar de Camila Rojas"),
  },
  {
    id: 3,
    name: "Ignacio Fuentes",
    slug: "ignacio-fuentes",
    bio: "Crítico y entrevistador. Industria y lanzamientos.",
    avatar: img("/mocks/avatar.svg", 200, 200, "Avatar de Ignacio Fuentes"),
  },
];

const seo = (title: string): Seo => ({
  title,
  description: "Contenido de prueba para validar el diseño de UP10.CL.",
  noindex: false,
});

type PostSeed = {
  title: string;
  dek: string;
  category: number;
  tipo: PostSummary["tipo"];
  author: number;
  image: PostSummary["cover"];
  featured?: boolean;
  signals?: EditorialTag[];
};

const seeds: PostSeed[] = [
  {
    title: "Lorem ipsum dolor sit amet: la noche que cambió la música chilena para siempre",
    dek: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.",
    category: 1,
    tipo: "noticia",
    author: 1,
    image: heroImage,
    featured: true,
  },
  {
    title: "Suspenden la segunda jornada del festival por alerta meteorológica en Chile",
    dek: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa.",
    category: 4,
    tipo: "noticia",
    author: 3,
    image: featureImage,
    signals: [editorialSignals.breaking, editorialSignals.show],
  },
  {
    title: "Cinco discos que marcaron el año en Chile",
    dek: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.",
    category: 2,
    tipo: "entrevista",
    author: 2,
    image: standard[0]!,
    signals: [editorialSignals.show],
  },
  {
    title: "La moda del vinilo vuelve a las tiendas chilenas",
    dek: "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt.",
    category: 4,
    tipo: "noticia",
    author: 1,
    image: standard[1]!,
    signals: [editorialSignals.fashion],
  },
  {
    title: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum",
    dek: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi.",
    category: 6,
    tipo: "entrevista",
    author: 2,
    image: standard[2]!,
  },
  {
    title: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia",
    dek: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias.",
    category: 3,
    tipo: "noticia",
    author: 3,
    image: standard[3]!,
  },
  {
    title:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
    dek: "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.",
    category: 7,
    tipo: "reportaje",
    author: 1,
    image: standard[4]!,
  },
  {
    title: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit",
    dek: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore.",
    category: 8,
    tipo: "entrevista",
    author: 2,
    image: standard[5]!,
  },
  {
    title: "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet",
    dek: "Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus.",
    category: 2,
    tipo: "noticia",
    author: 3,
    image: standard[0]!,
  },
  {
    title: "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit",
    dek: "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.",
    category: 4,
    tipo: "noticia",
    author: 1,
    image: standard[1]!,
  },
];

const slugify = (title: string) =>
  title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 70);

const posts: PostSummary[] = seeds.map((seed, index) => ({
  id: index + 1,
  slug: `${slugify(seed.title)}`,
  title: seed.title,
  dek: seed.dek,
  cover: seed.image,
  category: categories[seed.category - 1]!,
  tipo: seed.tipo,
  author: authors[seed.author - 1]!,
  publishedAt: new Date(Date.UTC(2026, 10, 20 - index, 12, 0, 0)).toISOString(),
  readingTime: 4 + (index % 6),
  isFeatured: Boolean(seed.featured),
  signals: seed.signals ?? [],
  isBreaking: (seed.signals ?? []).some((signal) => signal.slug === "ultima-hora"),
}));

const html = (title: string) => `
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, con música chilena, ñandú y acentos: canción, producción, año.</p>
  <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
  <h2>${title}</h2>
  <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.</p>
  <blockquote>La música merece una presentación a la altura de su valor cultural.</blockquote>
  <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.</p>
`;

export const mockPosts: Post[] = posts.map((post) => ({
  ...post,
  html: html(post.title),
  gallery: [],
  tags: ["música", "chile", "escena local"],
  related: posts.filter((item) => item.id !== post.id).slice(0, 3),
  seo: seo(post.title),
  updatedAt: post.publishedAt,
}));

const interviews = posts.filter((post) => post.tipo === "entrevista").slice(0, 3);

const top10Seed: {
  title: string;
  movement: Track["movement"];
  previousPosition: number | null;
}[] = [
  { title: "Lorem ipsum dolor", movement: "same", previousPosition: 1 },
  { title: "Consectetur adipiscing", movement: "up", previousPosition: 4 },
  { title: "Sed do eiusmod", movement: "new", previousPosition: null },
  { title: "Tempor incididunt", movement: "down", previousPosition: 2 },
  { title: "Ut labore et dolore", movement: "up", previousPosition: 7 },
  { title: "Magna aliqua", movement: "down", previousPosition: 3 },
  { title: "Ut enim ad minim", movement: "same", previousPosition: 7 },
  { title: "Quis nostrud", movement: "up", previousPosition: 10 },
  { title: "Exercitation ullamco", movement: "down", previousPosition: 6 },
  { title: "Laboris nisi", movement: "new", previousPosition: null },
];

const top10: Track[] = top10Seed.map((seed, index) => ({
  position: index + 1,
  previousPosition: seed.previousPosition,
  movement: seed.movement,
  isNew: seed.movement === "new",
  title: seed.title,
  artist: `Artista ${String.fromCharCode(65 + index)}`,
  cover: img("/mocks/track-1x1.svg", 400, 400, `Portada de ${seed.title}`),
  spotifyUrl: "https://open.spotify.com/playlist/3Iq8oHfADX6oHPi8jYs4vH",
  source: "manual",
}));

const instagram: InstagramPost[] = Array.from({ length: 10 }, (_, index) => {
  const variant = ["a", "b", "c"][index % 3];
  return {
    id: `ig-${index + 1}`,
    image: img(`/mocks/ig-1x1-${variant}.svg`, 800, 800, `Publicación de Instagram ${index + 1}`),
    caption: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    permalink: "https://www.instagram.com/up10.cl/",
    type: index % 4 === 0 ? "carousel" : "image",
    publishedAt: new Date(Date.UTC(2026, 10, 18 - index, 10, 0, 0)).toISOString(),
  };
});

const stats: Stat[] = [
  {
    id: 1,
    label: "Seguidores en Instagram",
    shortLabel: "Seguidores",
    value: 136000,
    prefix: "+",
  },
  {
    id: 2,
    label: "Visualizaciones últimos 3 meses",
    shortLabel: "Vistas",
    value: 27,
    suffix: "M",
    prefix: "+",
  },
  {
    id: 3,
    label: "Conectando con la música desde",
    shortLabel: "Desde",
    value: 2018,
    format: "plain",
    animated: false,
  },
];

const partners: Partner[] = [
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
].map((name, index) => ({ id: index + 1, name }));

const unplugged: Page = {
  slug: "unplugged",
  title: "UP10 Unplugged",
  hero: {
    title: "UP10 Unplugged",
    subtitle: "Más de 50 sesiones íntimas con artistas de la escena chilena.",
    image: unpluggedImage,
  },
  html: html("Sesiones que acercan artistas y audiencias"),
  seo: seo("UP10 Unplugged"),
};

const podcast: Page = {
  slug: "podcast",
  title: "UP10 Podcast",
  hero: {
    title: "UP10 Podcast",
    subtitle: "Conversaciones sobre música, creatividad e industria.",
  },
  html: html("Próximamente"),
  seo: seo("UP10 Podcast"),
};

const awards: Page = {
  slug: "awards",
  title: "UP10 Awards",
  hero: { title: "UP10 Awards", subtitle: "10 categorías, 10 nominados." },
  html: html("Próximamente"),
  seo: seo("UP10 Awards"),
};

const events: EventSummary[] = [
  {
    id: 1,
    slug: "trap-fest-chile-2026",
    title: "Trap Fest Chile 2026",
    date: "2026-12-15T19:00:00Z",
    time: "19:00",
    venue: "Movistar Arena",
    city: "Santiago",
    image: standard[0]!,
    ticketUrl: "https://example.com/entradas",
    status: "upcoming",
  },
  {
    id: 2,
    slug: "reggaeton-night",
    title: "Reggaetón Night",
    date: "2026-12-22T19:00:00Z",
    time: "19:00",
    venue: "Teatro Caupolicán",
    city: "Santiago",
    image: standard[1]!,
    status: "upcoming",
  },
  {
    id: 3,
    slug: "hip-hop-all-stars",
    title: "Hip Hop All Stars",
    date: "2027-01-05T19:00:00Z",
    time: "19:00",
    venue: "Club Chocolate",
    city: "Santiago",
    image: standard[2]!,
    ticketUrl: "https://example.com/entradas",
    status: "upcoming",
  },
];

const latest = posts.slice(0, 10);
const breaking = latest.find((post) => post.isBreaking);
const hero = breaking
  ? [breaking, ...latest.filter((post) => post.id !== breaking.id)].slice(0, 3)
  : latest.slice(0, 3);

export const mockHome: HomePayload = {
  hero,
  latest,
  interviews,
  events,
  top10,
  instagram,
  stats,
  partners,
  unplugged,
  projects: [podcast, awards],
};

export const mockCategories = categories;
export const mockPages = { unplugged, podcast, awards };
