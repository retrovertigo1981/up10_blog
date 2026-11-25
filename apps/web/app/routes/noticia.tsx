import type { Route } from "./+types/noticia";

import { ApiClientError } from "@up10/api-client";

import { ArticlePage } from "~/components/article-page";
import { api, siteUrl } from "~/lib/api";
import { imageMimeType } from "~/lib/seo";

async function loadPost(slug: string) {
  try {
    const { data } = await api.post(slug);
    return { post: data };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      throw new Response("Noticia no encontrada", { status: 404 });
    }

    throw error;
  }
}

export async function loader({ params }: Route.LoaderArgs) {
  return loadPost(params.slug);
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return loadPost(params.slug);
}
clientLoader.hydrate = import.meta.env.VITE_LIVE_CONTENT !== "false";

export const meta: Route.MetaFunction = ({ loaderData }) => {
  const post = loaderData?.post;

  if (!post) {
    return [{ title: "Noticia — UP10" }];
  }

  const canonical = post.seo.canonical || `${siteUrl}/noticias/${post.slug}`;
  const ogImage = post.seo.ogImage ?? post.cover;

  return [
    { title: `${post.seo.title} — UP10` },
    { name: "description", content: post.seo.description },
    { property: "og:type", content: "article" },
    { property: "og:title", content: post.seo.title },
    { property: "og:description", content: post.seo.description },
    { property: "og:url", content: canonical },
    { property: "og:image", content: ogImage.src },
    { property: "og:image:width", content: String(ogImage.width) },
    { property: "og:image:height", content: String(ogImage.height) },
    { property: "og:image:type", content: imageMimeType(ogImage) },
    { property: "og:image:alt", content: ogImage.alt },
    { property: "article:published_time", content: post.publishedAt },
    { property: "article:modified_time", content: post.updatedAt },
    { property: "article:section", content: post.category.name },
    { property: "article:author", content: post.author.name },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: post.seo.title },
    { name: "twitter:description", content: post.seo.description },
    { name: "twitter:image", content: ogImage.src },
    { name: "twitter:image:alt", content: ogImage.alt },
    ...(post.seo.noindex ? [{ name: "robots", content: "noindex" }] : []),
    { tagName: "link", rel: "canonical", href: canonical },
  ];
};

export default function Noticia({ loaderData }: Route.ComponentProps) {
  return <ArticlePage post={loaderData.post} />;
}
