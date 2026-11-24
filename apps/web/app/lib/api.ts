import { createApiClient, type ApiClient } from "@up10/api-client";

import { createMockApi } from "./mock-api";

const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8080/wp-json/up10/v1";
const useMocks = import.meta.env.VITE_USE_MOCKS !== "false";

export const api: ApiClient = useMocks ? createMockApi() : createApiClient({ baseUrl });

// Si no hay VITE_SITE_URL configurada, se usa el origen real del navegador.
// En el build/prerender no hay window: el fallback es el dominio final.
export const siteUrl =
  import.meta.env.VITE_SITE_URL ??
  (typeof window !== "undefined" ? window.location.origin : "https://up10.cl");
