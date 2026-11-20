import type {
  Category,
  Event,
  EventListQuery,
  EventSummary,
  HomePayload,
  Page,
  Pagination,
  Partner,
  Post,
  PostListQuery,
  PostSummary,
  SearchQuery,
  Track,
} from "./types";

export type ApiError = {
  code: string;
  message: string;
  status: number;
};

export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;

  constructor({ code, message, status }: ApiError) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
  }
}

type Envelope<T> = {
  data: T;
  meta?: {
    pagination?: Pagination;
    query?: string;
    playlistUrl?: string;
    syncedAt?: string;
  };
};

export type ClientOptions = {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  revalidate?: number;
};

function buildQuery(params: Record<string, unknown> = {}): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      search.set(key, value.join(","));
      continue;
    }
    search.set(key, String(value));
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

export function createApiClient({ baseUrl, fetchImpl, revalidate }: ClientOptions) {
  const base = baseUrl.replace(/\/$/, "");
  const doFetch = fetchImpl ?? fetch;

  async function request<T>(
    path: string,
    init?: RequestInit & { revalidate?: number },
  ): Promise<Envelope<T>> {
    const { revalidate: requestRevalidate, ...rest } = init ?? {};

    const response = await doFetch(`${base}${path}`, {
      ...rest,
      headers: {
        Accept: "application/json",
        ...rest.headers,
      },
      // @ts-expect-error: extensión de React Router / fetch de Node
      next: { revalidate: requestRevalidate ?? revalidate },
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: { code?: string; message?: string };
      } | null;

      throw new ApiClientError({
        status: response.status,
        code: body?.error?.code ?? "unknown_error",
        message: body?.error?.message ?? "No se pudo completar la petición.",
      });
    }

    return (await response.json()) as Envelope<T>;
  }

  return {
    home: () => request<HomePayload>("/home"),

    posts: (query: PostListQuery = {}) => request<PostSummary[]>(`/posts${buildQuery(query)}`),

    post: (slug: string) => request<Post>(`/posts/${encodeURIComponent(slug)}`),

    categories: () => request<Category[]>("/categories"),

    events: (query: EventListQuery = {}) => request<EventSummary[]>(`/events${buildQuery(query)}`),

    event: (slug: string) => request<Event>(`/events/${encodeURIComponent(slug)}`),

    top10: () => request<Track[]>("/top10"),

    partners: () => request<Partner[]>("/partners"),

    page: (slug: string) => request<Page>(`/pages/${encodeURIComponent(slug)}`),

    search: (query: SearchQuery) => request<PostSummary[]>(`/search${buildQuery(query)}`),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
