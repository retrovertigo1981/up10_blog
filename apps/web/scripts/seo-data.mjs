const API_URL = (process.env.VITE_API_URL ?? "https://api.up10.cl/wp-json/up10/v1").replace(
  /\/$/,
  "",
);

export const SITE_URL = (process.env.VITE_SITE_URL ?? "https://up10.cl").replace(/\/$/, "");

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
