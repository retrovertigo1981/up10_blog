import { type RouteConfig, index, route } from "@react-router/dev/routes";

const stub = (path: string, id: string) => route(path, "routes/stub.tsx", { id });

export default [
  index("routes/home.tsx"),

  stub("noticias", "stub-noticias"),
  stub("noticias/:slug", "stub-noticia"),
  stub("categoria/:slug", "stub-categoria"),
  stub("entrevistas", "stub-entrevistas"),
  stub("eventos", "stub-eventos"),
  route("top10", "routes/top10.tsx"),
  stub("nosotros", "stub-nosotros"),
  stub("unplugged", "stub-unplugged"),
  stub("podcast", "stub-podcast"),
  stub("awards", "stub-awards"),
  stub("buscar", "stub-buscar"),
  stub("contacto", "stub-contacto"),
  stub("privacidad", "stub-privacidad"),
  stub("terminos", "stub-terminos"),

  route("styleguide", "routes/styleguide.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
