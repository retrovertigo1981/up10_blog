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

| Variable         | Uso                                              |
| ---------------- | ------------------------------------------------ |
| `VITE_API_URL`   | Base de la API de WordPress (`/wp-json/up10/v1`) |
| `VITE_SITE_URL`  | URL pública para canonical, OG y sitemap         |
| `VITE_USE_MOCKS` | `true` usa fixtures locales; `false` usa la API  |

## Despliegue

El build genera archivos estáticos en `build/client`. En Hostinger se publican en
`public_html` y se agrega el fallback SPA en `.htaccess` (ver
`docs/plan-infraestructura-hostinger.md`).

### Demo en Vercel

`vercel.json` fuerza un despliegue estático (sin funciones) y reescribe todas
las rutas a `index.html` para que funcionen los enlaces directos. Las rutas con
datos (`/` y `/top10`) usan `clientLoader`, así que el contenido se pide al CMS
en el navegador y los cambios se ven sin volver a compilar. Cuando el frontend
viva en el mismo hosting que WordPress, se puede restaurar el prerender en
`react-router.config.ts`.

## Notas

- El export de Figma es solo referencia visual; no se reutiliza su código.
- Las tipografías Integral CF se cargan desde `public/fonts/` (ver README allí).
- Las spec y el plan viven en `docs/`, `specs/` y `adr/`.
