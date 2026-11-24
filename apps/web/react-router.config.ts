import type { Config } from "@react-router/dev/config";

import { getPrerenderPaths, getSeoData } from "./scripts/seo-data.mjs";

const FALLBACK_PATHS = [
  "/",
  "/noticias",
  "/top10",
  "/entrevistas",
  "/eventos",
  "/nosotros",
  "/unplugged",
  "/podcast",
  "/awards",
  "/contacto",
  "/privacidad",
  "/terminos",
  "/styleguide",
];

export default {
  // El sitio se despliega como archivos estáticos.
  //
  // El build prerenderiza las rutas con datos para que cada nota tenga HTML,
  // metadatos y JSON-LD. En la demo de Vercel, `clientLoader.hydrate` vuelve a
  // pedir los datos al CMS en el navegador para ver cambios sin rebuild.
  // En el build final se puede poner VITE_LIVE_CONTENT=false para servir el
  // HTML prerenderizado sin refresco inicial.
  ssr: false,
  async prerender() {
    try {
      const data = await getSeoData();
      return getPrerenderPaths(data);
    } catch (error) {
      console.warn("[prerender] No se pudo leer la API; se prerenderizan solo las rutas base.");
      console.warn(error instanceof Error ? error.message : error);
      return FALLBACK_PATHS;
    }
  },
} satisfies Config;
