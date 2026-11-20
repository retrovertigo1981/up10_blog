import type { Config } from "@react-router/dev/config";

export default {
  // El sitio se despliega como archivos estáticos en Hostinger.
  // Las rutas dinámicas del CMS se agregan a `prerender` en el Sprint 3.
  ssr: false,
  prerender: ["/", "/styleguide"],
} satisfies Config;
