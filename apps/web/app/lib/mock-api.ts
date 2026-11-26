import type { ApiClient, PostListQuery } from "@up10/api-client";

import { mockCategories, mockHome, mockPages, mockPosts } from "../mocks";

/**
 * Implementación de la API sobre fixtures locales.
 * Se usa cuando VITE_USE_MOCKS no es "false".
 */
export function createMockApi(): ApiClient {
  return {
    home: async () => ({ data: mockHome }),

    instagram: async () => ({
      data: mockHome.instagram,
      meta: { mode: "curated" },
    }),

    posts: async (query: PostListQuery = {}) => {
      const perPage = query.perPage ?? 12;
      const page = query.page ?? 1;

      const filtered = mockPosts.filter((post) => {
        if (query.category && post.category.slug !== query.category) return false;
        if (query.tipo && post.tipo !== query.tipo) return false;
        if (query.signal && !post.signals.some((signal) => signal.slug === query.signal)) {
          return false;
        }
        if (query.exclude?.includes(post.id)) return false;
        return true;
      });

      const start = (page - 1) * perPage;
      const data = filtered.slice(start, start + perPage);

      return {
        data,
        meta: {
          pagination: {
            page,
            perPage,
            total: filtered.length,
            totalPages: Math.max(1, Math.ceil(filtered.length / perPage)),
          },
        },
      };
    },

    post: async (slug: string) => {
      const post = mockPosts.find((item) => item.slug === slug);
      if (!post) throw new Error("Artículo no encontrado");
      return { data: post };
    },

    categories: async () => ({ data: mockCategories }),

    events: async () => ({ data: mockHome.events }),

    event: async (slug: string) => {
      const event = mockHome.events.find((item) => item.slug === slug);
      if (!event) throw new Error("Evento no encontrado");
      return { data: { ...event, lineup: [], descriptionHtml: "", seo: mockPages.podcast.seo } };
    },

    top10: async () => ({
      data: mockHome.top10,
      meta: {
        playlistUrl: "https://open.spotify.com/playlist/3Iq8oHfADX6oHPi8jYs4vH?si=d633951c19604715",
        syncedAt: "2026-11-20T12:00:00Z",
      },
    }),

    partners: async () => ({ data: mockHome.partners }),

    page: async (slug: string) => {
      const page = Object.values(mockPages).find((item) => item.slug === slug);
      if (!page) throw new Error("Página no encontrada");
      return { data: page };
    },

    search: async (query) => {
      const term = query.q.toLowerCase().trim();
      const perPage = query.perPage ?? 10;
      const matches = mockPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(term) ||
          post.dek?.toLowerCase().includes(term) ||
          post.category.name.toLowerCase().includes(term) ||
          post.signals.some((signal) => signal.name.toLowerCase().includes(term)),
      );

      return {
        data: matches.slice(0, perPage),
        meta: {
          pagination: {
            page: 1,
            perPage,
            total: matches.length,
            totalPages: Math.max(1, Math.ceil(matches.length / perPage)),
          },
          query: query.q,
        },
      };
    },
  };
}
