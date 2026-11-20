import { createApiClient } from "@up10/api-client";

const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8080/wp-json/up10/v1";

export const api = createApiClient({ baseUrl });

export const siteUrl = import.meta.env.VITE_SITE_URL ?? "http://localhost:5173";
