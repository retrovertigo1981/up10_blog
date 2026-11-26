const API_URL = (process.env.VITE_API_URL ?? "https://api.up10.cl/wp-json/up10/v1").replace(
  /\/$/,
  "",
);

const USE_MOCKS = process.env.VITE_USE_MOCKS === "true";

export const SITE_URL = (process.env.VITE_SITE_URL ?? "https://up10.cl").replace(/\/$/, "");

/**
 * Categorías disponibles en los mocks. Mantener en sync con `app/mocks/index.ts`.
 * En modo mocks no se consulta la API real, para que el build sea determinista.
 */
const MOCK_CATEGORY_SLUGS = [
  "actualidad-musical",
  "musica-chilena",
  "musica-internacional",
  "conciertos-festivales",
  "lanzamientos",
  "entrevistas",
  "industria-musical",
  "cultura-entretenimiento",
  "estrenos",
  "estrenos-musica-latina",
  "uncategorized",
];

/**
 * Una nota de los mocks para que la ruta dinámica `/noticias/:slug`
 * quede cubierta por el prerender y el validador de React Router no falle.
 */
const MOCK_POSTS = [
  {
    slug: "cinco-discos-que-marcaron-el-ano-en-chile",
    title: "Cinco discos que marcaron el año en Chile",
    dek: "",
    publishedAt: "2026-11-20T12:00:00.000Z",
    category: { name: "Música chilena" },
    author: { name: "UP10" },
  },
];

export const INSTITUTIONAL_PATHS = [
  "nosotros",
  "unplugged",
  "podcast",
  "awards",
  "contacto",
  "privacidad",
  "terminos",
];

async function getJson(path) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${path}`);
  }

  return response.json();
}

async function getAllPosts() {
  const posts = [];
  let page = 1;
  let totalPages;

  do {
    const payload = await getJson(`/posts?perPage=24&page=${page}`);
    posts.push(...(payload.data ?? []));
    totalPages = payload.meta?.pagination?.totalPages ?? 1;
    page += 1;
  } while (page <= totalPages && page <= 20);

  return posts;
}

async function getPage(slug) {
  try {
    const payload = await getJson(`/pages/${slug}`);
    return payload.data ?? null;
  } catch {
    return null;
  }
}

export async function getSeoData() {
  if (USE_MOCKS) {
    return {
      posts: MOCK_POSTS,
      categories: MOCK_CATEGORY_SLUGS.map((slug, index) => ({ id: index + 1, slug })),
      events: [],
      pages: [],
      siteUrl: SITE_URL,
    };
  }

  const [posts, categories, events, pages] = await Promise.all([
    getAllPosts(),
    getJson("/categories"),
    getJson("/events?scope=all"),
    Promise.all(INSTITUTIONAL_PATHS.map(getPage)),
  ]);

  return {
    posts,
    categories: categories.data ?? [],
    events: events.data ?? [],
    pages: pages.filter(Boolean),
    siteUrl: SITE_URL,
  };
}

export function getPrerenderPaths(data) {
  const paths = [
    "/",
    "/noticias",
    "/top10",
    "/entrevistas",
    "/eventos",
    "/styleguide",
    ...INSTITUTIONAL_PATHS.map((slug) => `/${slug}`),
    ...data.categories.map((category) => `/categoria/${category.slug}`),
    ...data.posts.map((post) => `/noticias/${post.slug}`),
    // Los detalles de evento se agregan cuando existan eventos y su loader.
  ];

  return [...new Set(paths)];
}
