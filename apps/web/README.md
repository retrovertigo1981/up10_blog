# @up10/web

Frontend de UP10.CL: React Router (framework mode), React 19, TypeScript, Tailwind CSS v4 y Vite.

## Requisitos

- Node.js ≥ 22
- pnpm 12+

## Comandos

Desde la raíz del monorepo:

```bash
pnpm install          # instala todo el workspace
pnpm dev              # servidor de desarrollo en http://localhost:5173
pnpm build            # build + prerender en build/client
pnpm typecheck        # typegen de React Router + tsc
pnpm lint
pnpm test             # Vitest
pnpm test:e2e         # Playwright (requiere: pnpm exec playwright install chromium)
```

## Estructura

```
app/
├── components/       # componentes compartidos
├── lib/              # utilidades y cliente de API
├── routes/           # rutas (file-based)
├── styles/           # fuentes y CSS base
├── app.css           # tokens de Tailwind (@theme)
├── root.tsx          # layout raíz
└── routes.ts         # configuración de rutas
```

## Entorno

Copiar `.env.example` a `.env` y ajustar:

| Variable            | Uso                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------- |
| `VITE_API_URL`      | Base de la API de WordPress (`/wp-json/up10/v1`)                                            |
| `VITE_SITE_URL`     | URL pública para canonical, OG, sitemap y RSS                                               |
| `VITE_USE_MOCKS`    | `true` usa fixtures locales; `false` usa la API                                             |
| `VITE_LIVE_CONTENT` | `true` refresca los datos en el navegador tras el prerender; `false` sirve el HTML estático |

La grilla de Instagram usa los datos iniciales de `/home` y consulta
`/instagram` cada cinco minutos y al recuperar el foco de la pestaña. Si la
consulta falla, conserva las publicaciones que ya estaban renderizadas.

## Despliegue

El build prerenderiza las rutas de contenido, genera `__spa-fallback.html` para
las rutas que se resuelven en el cliente y escribe `sitemap.xml`, `rss.xml` y
`robots.txt`. Los archivos estáticos quedan en `build/client`. En Hostinger se
publican en `public_html` y el fallback SPA de `.htaccess` debe apuntar a
`__spa-fallback.html` (ver `docs/plan-infraestructura-hostinger.md`).

### Demo en Vercel

`vercel.json` fuerza un despliegue estático (sin funciones) y reescribe las
rutas no prerenderizadas a `__spa-fallback.html`. El build deja el HTML y los
metadatos de cada nota para SEO, y `clientLoader.hydrate` vuelve a pedir los
datos al CMS en el navegador para que el cliente vea cambios sin rebuild
(`VITE_LIVE_CONTENT=true`, valor por defecto). En el build final se puede poner
`VITE_LIVE_CONTENT=false` para servir el HTML prerenderizado sin refresco
inicial; los cambios de contenido llegan con el rebuild que dispara WordPress.

Configura `VITE_SITE_URL` en Vercel con la URL del despliegue (por ejemplo
`https://up10-blog.vercel.app`) y en Hostinger con `https://up10.cl`, para que
canonical, OG, sitemap y RSS apunten al dominio correcto.

## Notas

- El export de Figma es solo referencia visual; no se reutiliza su código.
- Las tipografías Integral CF se cargan desde `public/fonts/` (ver README allí).
- Las spec y el plan viven en `docs/`, `specs/` y `adr/`.
- Deuda registrada en `specs/03-sistema-de-componentes.md` §7: el formato
  `reportaje` aún no tiene enlace ni listado en el frontend.
