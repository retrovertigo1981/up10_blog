import { createApiClient, type ApiClient } from "@up10/api-client";

import { createMockApi } from "./mock-api";

const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8080/wp-json/up10/v1";
const useMocks = import.meta.env.VITE_USE_MOCKS !== "false";

export const api: ApiClient = useMocks ? createMockApi() : createApiClient({ baseUrl });

export const siteUrl = import.meta.env.VITE_SITE_URL ?? "http://localhost:5173";
