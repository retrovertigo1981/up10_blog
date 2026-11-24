import { writeFile } from "node:fs/promises";

import { getSeoData, SITE_URL } from "./seo-data.mjs";

function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function isoDate(value) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function absolute(path) {
  return `${SITE_URL}${path === "/" ? "/" : path}`;
}

async function generate() {
  const { posts, categories, events, pages } = await getSeoData();

  const latestPost = posts[0]?.publishedAt;
  const urls = [
    { path: "/", lastmod: latestPost },
    { path: "/noticias", lastmod: latestPost },
    { path: "/top10" },
    { path: "/entrevistas", lastmod: latestPost },
    { path: "/eventos" },
    ...pages.map((page) => ({ path: `/${page.slug}` })),
    ...categories
      .filter((category) => (category.count ?? 0) > 0)
      .map((category) => ({ path: `/categoria/${category.slug}` })),
    ...posts.map((post) => ({ path: `/noticias/${post.slug}`, lastmod: post.publishedAt })),
    ...events.map((event) => ({ path: `/eventos/${event.slug}`, lastmod: event.date })),
  ];

  const unique = new Map();

  for (const item of urls) {
    if (!unique.has(item.path)) {
      unique.set(item.path, item);
    }
  }

  const sitemapEntries = [...unique.values()]
    .map((item) => {
      const lastmod = isoDate(item.lastmod);
      return `  <url>\n    <loc>${escapeXml(absolute(item.path))}</loc>${
        lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : ""
      }\n  </url>`;
    })
    .join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`;

  const rssItems = posts
    .slice(0, 20)
    .map((post) => {
      const link = absolute(`/noticias/${post.slug}`);
      const pubDate = isoDate(post.publishedAt);
      const published = pubDate ? new Date(pubDate).toUTCString() : "";

      return `    <item>\n      <title>${escapeXml(post.title)}</title>\n      <link>${escapeXml(
        link,
      )}</link>\n      <guid isPermaLink="true">${escapeXml(link)}</guid>${
        published ? `\n      <pubDate>${escapeXml(published)}</pubDate>` : ""
      }\n      <description>${escapeXml(post.dek ?? "")}</description>\n      <category>${escapeXml(
        post.category?.name ?? "",
      )}</category>\n      <author>${escapeXml(post.author?.name ?? "UP10")}</author>\n    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n  <channel>\n    <title>UP10</title>\n    <link>${escapeXml(
    SITE_URL,
  )}</link>\n    <description>Más música, menos problemas.</description>\n    <language>es-cl</language>\n    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n    <atom:link href="${escapeXml(
    `${SITE_URL}/rss.xml`,
  )}" rel="self" type="application/rss+xml" />\n${rssItems}\n  </channel>\n</rss>\n`;

  const robots = `User-agent: *\nAllow: /\nDisallow: /buscar\nDisallow: /styleguide\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;

  await Promise.all([
    writeFile(new URL("../public/sitemap.xml", import.meta.url), sitemap, "utf8"),
    writeFile(new URL("../public/rss.xml", import.meta.url), rss, "utf8"),
    writeFile(new URL("../public/robots.txt", import.meta.url), robots, "utf8"),
  ]);

  console.log(`[seo] sitemap.xml, rss.xml y robots.txt generados para ${SITE_URL}`);
}

try {
  await generate();
} catch (error) {
  console.warn("[seo] No se pudo generar sitemap/RSS; se conservan los archivos existentes.");
  console.warn(error instanceof Error ? error.message : error);
}
