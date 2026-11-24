import { type RouteConfig, index, route } from "@react-router/dev/routes";

const page = (path: string, id: string) => route(path, "routes/page.tsx", { id });

export default [
  index("routes/home.tsx"),

  route("noticias", "routes/noticias.tsx"),
  route("noticias/:slug", "routes/noticia.tsx"),
  route("categoria/:slug", "routes/categoria.tsx"),
  route("entrevistas", "routes/entrevistas.tsx"),
  route("eventos", "routes/eventos.tsx"),
  route("eventos/:slug", "routes/evento.tsx"),
  route("top10", "routes/top10.tsx"),
  page("nosotros", "page-nosotros"),
  page("unplugged", "page-unplugged"),
  page("podcast", "page-podcast"),
  page("awards", "page-awards"),
  route("buscar", "routes/buscar.tsx"),
  page("contacto", "page-contacto"),
  page("privacidad", "page-privacidad"),
  page("terminos", "page-terminos"),

  route("styleguide", "routes/styleguide.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
