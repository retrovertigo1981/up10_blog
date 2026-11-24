export type SeoPost = {
  slug: string;
  title: string;
  dek?: string;
  publishedAt: string;
  category: { name: string; slug: string };
  author: { name: string };
};

export type SeoCategory = {
  slug: string;
  name: string;
  count?: number;
};

export type SeoEvent = {
  slug: string;
  title: string;
  date: string;
};

export type SeoPage = {
  slug: string;
  title: string;
};

export type SeoData = {
  posts: SeoPost[];
  categories: SeoCategory[];
  events: SeoEvent[];
  pages: SeoPage[];
  siteUrl: string;
};

export function getSeoData(): Promise<SeoData>;
export function getPrerenderPaths(data: SeoData): string[];
export const SITE_URL: string;
export const INSTITUTIONAL_PATHS: string[];
