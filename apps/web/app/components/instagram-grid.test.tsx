import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { InstagramPost } from "@up10/api-client";
import { api } from "~/lib/api";
import { InstagramGrid } from "./instagram-grid";

const posts: InstagramPost[] = [
  {
    id: "ig-test-1",
    image: {
      src: "https://images.example.test/instagram.jpg",
      width: 800,
      height: 800,
      alt: "Publicación de prueba",
      srcset: "",
    },
    caption: "Publicación de prueba",
    permalink: "https://www.instagram.com/p/test/",
    type: "image",
    publishedAt: "2026-11-25T12:00:00-03:00",
  },
];

function renderGrid() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <InstagramGrid posts={posts} />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("InstagramGrid", () => {
  it("muestra inicialmente las publicaciones recibidas del loader", () => {
    vi.spyOn(api, "instagram").mockResolvedValue({ data: [] });

    renderGrid();

    expect(screen.getByRole("link", { name: "Publicación de prueba" })).toBeInTheDocument();
  });

  it("conserva las publicaciones iniciales si falla el refetch", async () => {
    const request = vi.spyOn(api, "instagram").mockRejectedValue(new Error("API no disponible"));

    renderGrid();

    expect(screen.getByRole("link", { name: "Publicación de prueba" })).toBeInTheDocument();
    await waitFor(() => expect(request).toHaveBeenCalledOnce());
    expect(screen.getByRole("link", { name: "Publicación de prueba" })).toBeInTheDocument();
  });
});
