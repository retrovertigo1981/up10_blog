import type { Config } from "@react-router/dev/config";

export default {
  // El sitio se despliega como archivos estáticos.
  //
  // Demo temporal (Vercel): se desactiva el prerender de las rutas con datos
  // para que los loaders se ejecuten en el navegador y el contenido refleje
  // los cambios del CMS sin reconstruir. Cuando el frontend viva en el mismo
  // hosting que WordPress, se puede volver a prerenderizar "/" y "/top10".
  ssr: false,
} satisfies Config;
