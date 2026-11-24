import { Link, useLocation } from "react-router";

import { cn } from "~/lib/cn";

const itemClasses =
  "border-wine/25 text-wine rounded-button inline-flex min-h-10 min-w-10 items-center justify-center border px-3 text-sm transition-colors hover:bg-wine hover:text-cream";

export function Pagination({
  page,
  totalPages,
  basePath,
}: {
  page: number;
  totalPages: number;
  basePath: string;
}) {
  const location = useLocation();

  if (totalPages <= 1) return null;

  const currentParams = new URLSearchParams(location.search);

  function href(nextPage: number) {
    const params = new URLSearchParams(currentParams);

    if (nextPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }

    const query = params.toString();
    return `${basePath}${query ? `?${query}` : ""}`;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (candidate) => candidate === 1 || candidate === totalPages || Math.abs(candidate - page) <= 1,
  );

  const items: Array<number | "ellipsis"> = [];

  pages.forEach((candidate, index) => {
    if (index > 0 && candidate - pages[index - 1] > 1) {
      items.push("ellipsis");
    }

    items.push(candidate);
  });

  return (
    <nav aria-label="Paginación" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link to={href(page - 1)} className={itemClasses}>
          ← Anterior
        </Link>
      ) : null}

      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="text-ink/50 px-1">
            …
          </span>
        ) : (
          <Link
            key={item}
            to={href(item)}
            aria-current={item === page ? "page" : undefined}
            className={cn(itemClasses, item === page && "bg-wine text-cream border-wine")}
          >
            {item}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link to={href(page + 1)} className={itemClasses}>
          Siguiente →
        </Link>
      ) : null}
    </nav>
  );
}
