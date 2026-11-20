# UP10.CL — Especificación y plan de desarrollo

> **Estado:** borrador para revisión
> **Fecha:** 20 de noviembre de 2026
> **Insumos:** `docs/brief_creativo_y_tecnico_up10cl.md`, `docs/codigo_demo.txt`, `specs/`, `adr/0001-cms-wordpress-headless.md`
> **Equipo:** Sebastián y Alejandro

---

## 1. Resumen ejecutivo

Se construirá una revista musical digital con **frontend React propio** y **WordPress headless** como CMS, desplegada en el plan **Hostinger Unlimited** ya pagado.

La solución se separa en dos piezas:

1. **Frontend estático** (React compilado y prerenderizado) en `up10.cl`.
2. **CMS en PHP** (WordPress + ACF Pro) en `cms.up10.cl`, expuesto por una API REST propia.

PHP se ejecuta por petición bajo LiteSpeed: no hay proceso persistente, no hay cold start y no se consume el cupo de procesos que hacía inviable Strapi. El sitio público se sirve como archivos estáticos con el CDN incluido.

**El frontend se construye desde cero.** El código exportado de Figma es solo una referencia visual y no se reutiliza.

---

## 2. Principios rectores

| # | Principio | Implicancia |
|---|---|---|
| 1 | **El brief y sus documentos derivados son la fuente de verdad** | Alcance, contenido, marca y tipografías se definen desde el brief y las specs (§4). |
| 2 | **La demo de Figma es solo referencia de maquetado** | Se toma composición, proporción y ritmo visual. No define contenido, funcionalidades ni roles tipográficos. |
| 3 | **Desarrollo greenfield** | Componentes tipados y accesibles; sin deuda del export. |
| 4 | **WordPress es solo el backend** | Sin temas, sin page builders, sin plantillas. El diseño es 100 % React. |
| 5 | **El cliente no depende de los desarrolladores** | Panel editorial nativo con roles, programación y revisiones. |
| 6 | **Nada crítico depende de una API externa** | Instagram y Spotify arrancan con datos curados. |
| 7 | **Licencias y accesos se resuelven antes** | Fuentes, ACF y credenciales son dependencias del Sprint 0. |

### 2.1 Qué se toma y qué se descarta del export de Figma

| Se toma | Se descarta |
|---|---|
| Paleta y proporción 60/25/15 | Posicionamiento absoluto en px |
| Composición y escala tipográfica, aplicada a las fuentes del brief | Lienzo fijo de 1728 px y anchos desbordados |
| Bordes y degradados | Radios de 15/5 px: el brief fija 10 px |
| Orden editorial de los bloques | Tarjetas sin título, categoría ni metadatos |
| Tono visual (foto grande, titular fuerte) | Textos de muestra y datos hardcodeados |

La demo no incluye móvil: ese diseño se produce en el Sprint 2 y se aprueba con el cliente (**Hito A**).

### 2.2 Regla de precedencia y contradicciones resueltas

Cuando el brief y la demo de Figma difieren, **manda el brief y la documentación que se deriva de él**. La demo solo aporta criterio de maquetado. Diferencias detectadas y su resolución:

| Tema | Brief | Demo | Resolución |
|---|---|---|---|
| Fuente de lectura | A propuesta del diseñador | Carrois Gothic | **Gelasio** (§7.3) |
| Nombre del proyecto de sesiones | UP10 Unplugged | UP10 Sessions | **UP10 Unplugged** |
| Categorías del menú | 8 categorías musicales | Incluye "Estilo" | **Sin "Estilo"**; menú derivado del brief |
| Radio de esquinas | 10 px | 15 px tarjetas / 5 px botones | **10 px** |
| Uso de Anton | Subtítulos, categorías, destacados | Aperturas de sección a 80 px | **Válido**: una apertura es un destacado |

Cualquier diferencia nueva se agrega a esta tabla antes de implementarse.

---

## 3. Diagnóstico del brief

El brief define identidad, concepto, paleta, orden de portada y requisitos técnicos. Estos son los puntos que el plan debe cerrar:

| Punto abierto | Cómo se resuelve |
|---|---|
| Tecnologías a cargo de los desarrolladores | Stack en §6, decisión de CMS en el ADR 0001 |
| Tipografía de lectura a propuesta del diseñador | Resuelta: Gelasio (§7.3) |
| Factibilidad de Instagram y Spotify | §12, con estrategia por fases |

**Requisitos duros:** panel editorial autónomo, publicaciones programadas, 10 últimas noticias, 10 posts de Instagram, TOP 10 sincronizado con Spotify, buscador, SEO, respaldos, SSL y móvil prioritario.

**Categorías del brief:** Actualidad musical, Música chilena, Música internacional, Conciertos y festivales, Lanzamientos, Entrevistas, Industria musical, Cultura y entretenimiento.

**Secciones del brief:** Portada, Noticias, Entrevistas, TOP 10, Eventos, Instagram, Unplugged, Podcast, Awards, Marcas, Nosotros, Contacto.

Cualquier ítem de navegación fuera de esta lista requiere aprobación explícita del cliente.

---

## 4. Especificación funcional derivada del brief

Cada requisito se traduce a una spec verificable. Prioridad: **M** = debe estar en v1, **S** = debería, **C** = fase 2.

### 4.1 Contenido y administración

| ID | Requisito | Spec | Aceptación | P | Sprint |
|---|---|---|---|---|---|
| F-01 | Publicar, editar y programar noticias | `post` nativo + programador de WordPress + cron real | Un editor publica y programa sin intervención técnica | M | 0 |
| F-02 | Gestionar fotos, videos, categorías y entrevistas | Medios nativos + `category` + `tipo_contenido` + ACF | Subir imagen y asignarla a una nota en < 1 min | M | 0 |
| F-03 | Administración sencilla | Roles nativos + campos obligatorios + vista previa | Un editor nuevo publica su primera nota tras 20 min de capacitación | M | 0 |
| F-04 | Noticia principal destacada | `is_featured` + `featured_rank` (máx. 6) | La portada muestra una sola nota principal | M | 1 |
| F-05 | Últimas 10 noticias | Consulta ordenada por fecha, límite 10 | La portada nunca muestra más de 10 | M | 1 |
| F-06 | Noticias relacionadas | ACF relationship + sugerencia por categoría | Cada nota muestra 3 relacionadas | S | 3 |
| F-07 | Galerías fotográficas | ACF gallery + componente con lightbox | 3+ imágenes accesibles por teclado | S | 3 |
| F-08 | Cifras editables | Options Page con repeater `stat` | Cambiar +136.000 no requiere deploy | M | 1 |
| F-09 | Preparado para futuras secciones | `page` + bloques permitidos | Crear "UP10 Awards" sin tocar código | M | 3 |
| F-10 | Revisar y revertir cambios | Revisiones nativas de WordPress | Restaurar una versión anterior en 2 clics | S | 0 |
| F-11 | Vista previa antes de publicar | Token de preview firmado | Ver el borrador en el frontend real | C | 3 |

### 4.2 Portada

| ID | Requisito | Spec | Aceptación | P | Sprint |
|---|---|---|---|---|---|
| H-01 | Cabecera con logo, menú y redes | `SiteHeader` sticky, datos desde Options Page | Navegable por teclado; menú móvil en drawer | M | 1 |
| H-02 | UP10 en números tras la cabecera | `StatsBand` con 3 cifras y contador animado | Visible sin scroll en desktop; respeta `reduced-motion` | M | 2 |
| H-03 | Noticias destacadas + últimas 10 | `HeroArticle` + `BentoGrid` | 1 principal + 9 secundarias | M | 1 |
| H-04 | UP10 TOP 10 | `Top10Section` con 10 posiciones | Número, título, artista, portada y enlace | M | 1 |
| H-05 | Entrevistas destacadas | `FeatureRow` filtrado por `tipo_contenido` | 3 entrevistas con video opcional | M | 2 |
| H-06 | Últimas 10 de Instagram | `InstagramGrid` curada desde WordPress | 10 piezas + botón "Ver más" | M | 2 |
| H-07 | UP10 Unplugged | `ProjectBand` editable | Presentación, artistas y galería | M | 2 |
| H-08 | Podcast y Awards | `ProjectCards` con estado "próximamente" | Dos tarjetas enlazadas | S | 2 |
| H-09 | Marcas que han confiado | `PartnerMarquee` con 10 logos | Marquesina pausable; grilla en móvil | S | 2 |
| H-10 | Pie con contacto y redes | `SiteFooter` | Prensa, WhatsApp y legales | M | 1 |
| H-11 | Concepto del número 10 | 10 noticias, 10 IG, TOP 10, 10 marcas, 10 categorías de Awards | Consistente en la portada | S | 2 |

### 4.3 Integraciones y utilidades

| ID | Requisito | Spec | Aceptación | P | Sprint |
|---|---|---|---|---|---|
| I-01 | TOP 10 desde Spotify | Cron PHP + Client Credentials + fallback manual | Reordenar la playlist se refleja en ≤ 30 min | M | 4 |
| I-02 | Instagram automático | API profesional + modo curado | Si la API falla, la sección sigue operativa | S | Fase 2 |
| I-03 | Videos de YouTube | Embed ligero por ID | No penaliza LCP | M | 3 |
| I-04 | Buscador interno | Endpoint WP sobre título, extracto, dek y tags | Resultados en < 500 ms; estado vacío claro | M | 3 |
| I-05 | Botones para compartir | Web Share API + fallback | Funciona en móvil y desktop | M | 3 |
| I-06 | Newsletter | Endpoint propio con consentimiento y honeypot | Suscripción persistida y exportable | S | 4 |
| I-07 | Contacto | Formulario o enlaces directos | Envía a `prensa@up10.cl` | S | 3 |

### 4.4 Requisitos no funcionales

| ID | Requisito | Spec | Aceptación | P | Sprint |
|---|---|---|---|---|---|
| N-01 | Diseño adaptable | Mobile-first, 4 breakpoints | Sin scroll horizontal entre 320 y 1920 px | M | 2 |
| N-02 | Velocidad | Prerender + CDN + imágenes optimizadas | Lighthouse móvil ≥ 90; LCP < 2,5 s | M | 5 |
| N-03 | SEO | HTML por ruta, JSON-LD, sitemap, RSS | Cada nota indexable con OG correcto | M | 3 |
| N-04 | SSL | Incluido en Hostinger | HTTPS forzado, sin contenido mixto | M | 5 |
| N-05 | Respaldos | 5 capas del plan de infraestructura | Restauración probada antes del lanzamiento | M | 5 |
| N-06 | Accesibilidad | WCAG 2.2 AA | 0 errores críticos en axe | M | 5 |
| N-07 | Seguridad del CMS | Hardening WordPress y actualizaciones | 2FA, XML-RPC off, WAF activo | M | 5 |

**Hito 0:** §4 se revisa y firma con el cliente antes del Sprint 1. Lo que no esté aquí se cotiza aparte.

---

## 5. Arquitectura

```
Visitante
   │
   ▼
up10.cl  ── LiteSpeed + CDN ──►  /public_html  (HTML prerenderizado + assets)
                                     │
                                     │ build (GitHub Actions)
                                     ▼
                     cms.up10.cl  (WordPress + PHP 8.3)
                        │           │
                        │           └──► /wp-json/up10/v1/*
                        └──► MySQL + uploads (persistentes)
```

**Por qué funciona donde Strapi no**

| Criterio | Strapi (Node) | WordPress (PHP) |
|---|---|---|
| Proceso persistente | Sí, obligatorio | No |
| Cold start | Sí | No |
| Consumo de NPROC | Sí | No |
| Ejecución | Proceso vivo 24/7 | Por petición |
| Riesgo de 503 | Alto | Bajo |

**Por qué frontend estático:** no consume procesos, no sufre cold start, aprovecha el CDN al 100 % y entrega HTML por ruta para SEO sin necesidad de SSR.

**Medios:** a diferencia de Strapi, WordPress guarda los archivos en su propia instalación y **no se borran en cada deploy**, porque el frontend y el CMS son despliegues independientes.

**Descartado:** Strapi (proceso Node), EmDash (Node y sin MySQL), CMS basados en Git (sin base de datos). Laravel se evaluó y es viable, pero se descartó por tiempo y por autonomía editorial del cliente (ver ADR 0001).

---

## 6. Stack

| Capa | Tecnología | Motivo |
|---|---|---|
| UI | React 19 + TypeScript | Requisito del equipo |
| Framework | React Router v8 (framework mode, `prerender`) | HTML estático por ruta sin servidor |
| Estilos | Tailwind CSS v4 + `@theme` | Tokens en CSS |
| Datos | TanStack Query + loaders | Caché, reintentos y estados |
| CMS | WordPress 6.x (PHP 8.3) | Panel editorial maduro, sin proceso persistente |
| Campos | ACF Pro | Repeaters, galerías y options pages |
| Plugin propio | `up10-core` | Endpoints REST, serializadores, sync y hardening |
| DB | MySQL 8 (Hostinger) | Incluida en el plan |
| SEO | Grupo ACF + JSON-LD propio | Una sola fuente de metadatos |
| Analítica | Cloudflare Web Analytics | Sin cookies |
| CI/CD | GitHub Actions → rsync/SFTP | Build reproducible, deploy atómico |
| Calidad | ESLint, Prettier, Vitest, Playwright, Lighthouse CI | Puertas por sprint |

**Estructura del repositorio**

```
up10_blog/
├── apps/
│   ├── web/                 # React Router + Tailwind (implementado, Sprint 0)
│   └── cms/                 # WordPress + plugin up10-core + ACF JSON
│       ├── wp-content/
│       │   ├── plugins/up10-core/
│       │   └── themes/up10-headless/   # tema mínimo, sin diseño
│       └── acf-json/        # campos versionados
├── packages/
│   └── api-client/          # tipos TypeScript + cliente de la API
├── docs/                    # brief, plan y documentos base
├── specs/                   # especificaciones (modelo y API)
├── adr/                     # decisiones de arquitectura
├── .opencode/skills/        # skills del agente (modern-web-guidance)
└── .github/workflows/
```

El paquete `api-client` se alinea con el contrato de `specs/02-contrato-api.md`. Si la API cambia, el frontend falla en compilación.

---

## 7. Sistema de diseño

### 7.1 Color

| Token | Valor | Uso |
|---|---|---|
| `--color-cream` | `#FAE3B9` | Fondo principal (60 %) |
| `--color-wine` | `#57000B` | Titulares, navegación, contraste (25 %) |
| `--color-paper` | `#FFF8E8` | Tarjetas, cabecera, pie |
| `--color-ink` | `#000000` | Texto extenso |
| `--color-wine-soft` | `#57000B` al 12 % | Bordes y divisores |
| `--gradient-night` | `linear-gradient(130deg,#000,#57000B)` | Bloques oscuros y eventos |

Contraste AA obligatorio en todos los pares.

### 7.2 Tipografía

| Rol | Fuente | Desktop | Móvil |
|---|---|---|---|
| Titular hero | Integral CF Demi Bold | 42 px / 1.05 | 30 px / 1.1 |
| Apertura de sección | Anton | 80 px / 0.95 | 42 px / 1.0 |
| Título de tarjeta | Integral CF Demi Bold | 24 px / 1.15 | 20 px / 1.2 |
| Etiqueta de categoría | Anton | 25 px, tracking .05em | 18 px |
| Navegación | Integral CF Demi Bold | 18 px, tracking .1em | 16 px |
| Cuerpo | Gelasio | 20 px / 1.55 | 17 px / 1.6 |
| Metadatos | Gelasio | 15 px | 14 px |

Se implementa con `clamp()` y una escala de 5 pasos.

### 7.3 Tipografías: estado

**Integral CF — resuelto.** El cliente cuenta con la licencia web. Se carga manualmente en WOFF2 desde `/public/fonts/integral-cf/` (ver `apps/web/font-sources/README.md`). Mientras falten los archivos, el fallback es Archivo Black.

**Anton — confirmada por el brief.** Google Fonts, gratuita. Se usa en subtítulos, categorías, destacados y aperturas de sección, tal como indica el brief.

**Gelasio — texto de lectura (decidido).** Google Fonts, variable 400–700 + itálicas, licencia OFL.

Es la alternativa libre más cercana a **Georgia**, la fuente que Billboard usa en el cuerpo de sus notas. Google la describe como métricamente compatible con Georgia: mismos anchos por carácter y sin reflow al cambiar de una a otra.

| Criterio | Georgia (Billboard) | Gelasio |
|---|---|---|
| Licencia | Propietaria, no autohospedable | OFL 1.1 |
| Métricas | — | Idénticas en Regular/Bold/Itálica/Bold Itálica |
| Pesos | Varios | Variable 400–700 + itálicas |
| Cifras | Old-style | Old-style y lining, proporcionales y tabulares |
| Cobertura | Latin, cirílico, griego | Latin, latin-ext, vietnamita |

Stack: `"Gelasio", Georgia, "Times New Roman", serif`. El fallback no produce reflow gracias a la compatibilidad de métricas.

**Nota:** Gelasio no incluye kerning, decisión del autor para mantener la compatibilidad métrica. No afecta al cuerpo de texto; los titulares usan Integral CF.

**Carrois Gothic — descartada.** Venía del export de Figma y no está en el brief. No se usa para lectura por su baja legibilidad en párrafos largos.

La decisión completa, con alternativas y criterios, está en `adr/0002-tipografias.md`.

### 7.4 Espaciado, radios y movimiento

- Contenedor: `max-width: 1600px`, padding lateral `clamp(20px, 3.5vw, 56px)`.
- Escala de espacio: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- Radios: `10px` para botones, tarjetas, fotos y videos, según el brief. Formas circulares solo en avatares e indicadores.
- Movimiento: 150–250 ms, `ease-out`; contadores y marquesina se desactivan con `prefers-reduced-motion`.
- Sin sombras pronunciadas: separar por borde y color.

---

## 8. Modelo de contenido

El detalle completo está en `specs/01-modelo-de-contenido.md`. Resumen:

| Tipo | Implementación | Contenido |
|---|---|---|
| Artículo | `post` nativo | Noticia, entrevista y reportaje, diferenciados por `tipo_contenido` |
| Categoría | `category` nativa | Las 8 categorías del brief |
| Etiqueta | `post_tag` nativa | Artistas, géneros, ciudades |
| Evento | CPT `evento` | Fecha, recinto, lineup, entradas |
| Marca | CPT `marca` | Logo y orden |
| Cifra | CPT `stat` | Valor editable de "UP10 en números" |
| Ranking | CPT `track` | TOP 10 con respaldo manual |
| Sesión | CPT `sesion` | UP10 Unplugged |
| Página | `page` nativa | Nosotros, Podcast, Awards, legales |
| Ajustes | Options Page ACF | Redes, navegación, Instagram, newsletter |

**Regla editorial:** el contenido editorial vive en `post`, no en CPTs. Así se conservan programación, revisiones, autores y compatibilidad del ecosistema.

---

## 9. Rutas

| Ruta | Render | Datos | SEO |
|---|---|---|---|
| `/` | Prerender | `GET /home` | Organization + WebSite |
| `/noticias` | Prerender (pág. 1) + paginación cliente | `GET /posts` | CollectionPage |
| `/noticias/:slug` | Prerender por artículo | `GET /posts/{slug}` | NewsArticle + Breadcrumb |
| `/categoria/:slug` | Prerender por categoría | `GET /posts?category=` | CollectionPage |
| `/entrevistas` | Prerender | `GET /posts?tipo=entrevista` | CollectionPage |
| `/eventos` | Prerender | `GET /events` | Event list |
| `/eventos/:slug` | Prerender | `GET /events/{slug}` | Event |
| `/top10` | Prerender + refresco cliente | `GET /top10` | ItemList |
| `/unplugged` | Prerender | `GET /pages/unplugged` | AboutPage |
| `/podcast` | Prerender | `GET /pages/podcast` | WebPage |
| `/awards` | Prerender | `GET /pages/awards` | WebPage |
| `/nosotros` | Prerender | `GET /pages/nosotros` | AboutPage |
| `/buscar` | Cliente | `GET /search` | `noindex` |
| `/contacto` | Prerender | `GET /pages/contacto` | ContactPage |
| `/privacidad`, `/terminos` | Prerender | `GET /pages/{slug}` | — |
| `*` | Cliente | 404 | `noindex` |

**Actualización:** webhook de WordPress al publicar → `repository_dispatch`; cron de GitHub cada 30 min como red de seguridad; fallback SPA en `.htaccess` para rutas nuevas.

---

## 10. Portada — especificación por bloques

| # | Bloque | Componente | Datos | Notas |
|---|---|---|---|---|
| 1 | Cabecera | `SiteHeader` | Options Page | Sticky; menú móvil; buscador en overlay |
| 2 | UP10 en números | `StatsBand` | `stat` | 3 cifras, contador animado |
| 3 | Hero | `HeroArticle` | `hero` | Imagen a sangre, texto sobre crema |
| 4 | Ticker | `NewsTicker` | últimos 6 títulos | Pausa en hover, accesible |
| 5 | Lo último | `BentoGrid` + `ArticleCard` | 10 últimos | Grilla asimétrica; columna única en móvil |
| 6 | TOP 10 | `Top10Section` + `TrackRow` | `track` | Bloque oscuro, embed de Spotify |
| 7 | Entrevistas | `FeatureRow` | `tipo=entrevista` | 3 destacadas |
| 8 | Instagram | `InstagramGrid` | Options Page | 10 piezas + botón |
| 9 | Unplugged | `ProjectBand` | `page` + `sesion` | Presentación y galería |
| 10 | Podcast y Awards | `ProjectCards` | `page` | Estado "próximamente" |
| 11 | Marcas | `PartnerMarquee` | `marca` | 10 logos |
| 12 | Newsletter | `NewsletterForm` | — | Validación y consentimiento |
| 13 | Pie | `SiteFooter` | Options Page | Contacto, prensa, legales |

**Anatomía de tarjeta:** imagen 4:3, etiqueta de categoría en Anton, título en Integral CF, extracto opcional, meta (autor · fecha · tiempo de lectura). Hover: escala 1.03 y subrayado. Foco visible con anillo vino.

---

## 11. Inventario de componentes

`SiteHeader`, `MobileMenu`, `SearchOverlay`, `SiteFooter`, `ArticleCard` (3 variantes), `BentoGrid`, `HeroArticle`, `NewsTicker`, `SectionHeading`, `StatsBand`, `AnimatedCounter`, `Top10Section`, `TrackRow`, `SpotifyEmbed`, `InstagramGrid`, `InstagramTile`, `FeatureRow`, `ProjectBand`, `ProjectCards`, `PartnerMarquee`, `EventRow`, `EventCard`, `NewsletterForm`, `ShareButtons`, `Breadcrumbs`, `RelatedArticles`, `ArticleBody`, `Gallery`, `YouTubeLite`, `Seo`, `EmptyState`, `Pagination`, `SkipLink`.

Cada uno documentado en `/styleguide` (no indexada) con estados: normal, hover, focus, carga, vacío, error.

---

## 12. Integraciones

| Integración | Estrategia MVP | Fase 2 | Riesgo |
|---|---|---|---|
| **Spotify TOP 10** | Cron PHP en WordPress con *Client Credentials*; upsert en CPT `track` solo en filas `source=spotify` | Web Playback SDK | Restricciones y *extended quota*; el fallback manual ya existe |
| **Instagram** | Grilla curada desde Options Page | API profesional (cuenta Business + app de Meta) | *Basic Display API* descontinuada; mantenimiento de token |
| **YouTube** | ID de video en ACF; embed ligero | Data API v3 | Cuota diaria |
| **Newsletter** | Endpoint en `up10-core` con doble opt-in, honeypot y rate limit | ESP externo | Hostinger Reach gratis hasta 100 suscriptores |
| **Compartir** | Web Share API + fallback | — | Bajo |
| **Analítica** | Cloudflare Web Analytics | Eventos | Ley 21.719 exige aviso de privacidad |

**Cron real obligatorio:** el cron de WordPress depende de visitas. Se configura una tarea en hPanel que ejecuta `wp-cron.php` cada 5 minutos; sin eso, ni las publicaciones programadas ni el sync de Spotify son confiables.

---

## 13. Calidad

**SEO**
- HTML prerenderizado por ruta; una sola `h1`.
- `title`, `description`, canonical y OG desde el grupo ACF.
- JSON-LD: `NewsArticle`, `Event`, `BreadcrumbList`, `Organization`.
- `sitemap.xml` y `rss.xml` generados en el build.
- `/buscar` y `/styleguide` con `noindex`.

**Rendimiento (móvil, 4G)**
- Lighthouse: rendimiento ≥ 90, accesibilidad ≥ 95, SEO ≥ 95.
- LCP < 2,5 s · CLS < 0,1 · INP < 200 ms.
- JS inicial < 200 KB gzip; `srcset` en todas las imágenes; hero sin lazy.
- Fuentes autohospedadas, `swap` y precarga de 2 pesos.

**Accesibilidad**
- Contraste AA, navegación por teclado, foco visible, `SkipLink`.
- Carrusel y ticker con controles y pausa.
- `alt` obligatorio: sin `alt`, no se publica.

**Pruebas**
- Unitarias de utilidades y serializadores (Vitest).
- E2E de portada, artículo, buscador y newsletter (Playwright).
- Revisión manual en iOS Safari, Android Chrome y desktop.

---

## 14. Despliegue

**Subdominios**
- `up10.cl` y `www` → frontend estático en `public_html`.
- `cms.up10.cl` → WordPress con SSL y CDN.
- `staging.cms.up10.cl` → copia para probar actualizaciones (si el plan lo permite).

**Pipeline del frontend**

```
push a main ──► GitHub Actions ──► build + prerender (lee cms.up10.cl)
             ──► rsync/SFTP a public_html
             └──► purga de caché del CDN
```

**Pipeline del CMS**
- Deploy por Git o SFTP del plugin `up10-core`, el tema mínimo y `acf-json/`.
- Las actualizaciones de WordPress se prueban en staging y se aplican por tandas.
- Los campos ACF se versionan en `acf-json/` para que viajen con el código.

**`.htaccess` del frontend**
- Fallback SPA a `index.html` para rutas sin archivo.
- `Cache-Control: immutable` para `/assets/*`; `no-cache` para `index.html`.
- Compresión y cabeceras de seguridad.

**Hardening del CMS**
- 2FA obligatorio para administradores y editores.
- XML-RPC deshabilitado; edición de archivos deshabilitada.
- Registro público cerrado; límite de intentos de login.
- Actualizaciones automáticas de seguridad; el resto, en staging.
- WAF y escáner de malware de Hostinger activos.
- Sin plugins de diseño ni builders; máximo 6 plugins.

**Respaldos**
1. Backups diarios de hPanel (CMS y frontend).
2. `mysqldump` nocturno por cron, fuera de `public_html`.
3. Copia semanal de `wp-content/uploads`.
4. Copia externa semanal (equipo o almacenamiento en la nube).
5. Restauración probada antes del lanzamiento.

---

## 15. Plan de trabajo

**Supuesto:** 2 desarrolladores, dedicación parcial. Un sprint = 1 semana.

### Sprint 0 — Especificación y CMS base (1 semana)
- **Hito 0:** firma de §4 y de las specs 01 y 02.
- Decisión de tipografía de lectura (ADR 0002).
- Monorepo, TypeScript, ESLint, Prettier, Vitest.
- WordPress local (wp-env o DDEV) + ACF Pro + plugin `up10-core` vacío.
- CPTs, taxonomías, campos ACF y Options Page según spec 01.
- Roles, reglas de publicación y cron real.
- Tailwind v4, fuentes, `SiteHeader`, `SiteFooter`, `/styleguide`.
- CI mínima y preview en Netlify/Vercel.

**Entregable:** CMS funcionando en local con contenido de prueba y shell del frontend.

### Sprint 1 — API y portada desktop (1 semana)
- Endpoints `/home`, `/posts`, `/posts/{slug}`, `/categories`.
- Serializadores y contrato tipado en `packages/api-client`.
- Hero, ticker, bento, TOP 10, eventos y newsletter con datos reales.
- `SectionHeading`, `ArticleCard`, `EventRow`.

**Entregable:** portada desktop alimentada por WordPress.

### Sprint 2 — Responsive y bloques restantes (1 semana)
- Breakpoints, menú móvil, buscador overlay.
- Stats, entrevistas, Instagram, Unplugged, Podcast/Awards, Marcas.
- Contadores, marquesina, hover, `prefers-reduced-motion`.
- Diseño móvil de portada, artículo y archivo.

**Entregable:** portada y móvil aprobables → **Hito A**.

### Sprint 3 — Rutas internas y SEO (1 semana)
- Artículo, archivo, categoría, entrevistas, eventos, top10, institucionales, 404.
- Prerender, sitemap, RSS, JSON-LD, metadatos.
- Buscador, compartir, YouTube ligero.

**Entregable:** sitio completo navegable y rastreable.

### Sprint 4 — Integraciones y contenido real (1 semana)
- Sync de Spotify con fallback manual.
- Newsletter con doble opt-in y export.
- Instagram curado.
- Carga de contenido real del cliente.

**Entregable:** funcionalidades del brief operativas con contenido real.

### Sprint 5 — Calidad y lanzamiento (1 semana)
- Auditoría Lighthouse y accesibilidad.
- QA cross-device y cross-browser.
- Migración a Hostinger: subdominios, SSL, CDN, `.htaccess`.
- Hardening, respaldos, restauración de prueba.
- Capacitación editorial y documentación.

**Entregable:** producción estable + manual de uso.

**Total:** 6 semanas efectivas, más 1 de buffer.

### Qué se puede hacer sin acceso a Hostinger
Sprints 0 a 4 completos, con WordPress local y preview del frontend. El bloqueo real es el Sprint 5.

### Definición de terminado
Código tipado y revisado · responsive verificado · estados de carga/error/vacío · accesible por teclado · metadatos SEO · sin errores de consola · probado en móvil real.

---

## 16. Riesgos

| Riesgo | P | I | Mitigación |
|---|---|---|---|
| Superficie de ataque de WordPress | Media | Alto | Hardening, 2FA, WAF, actualizaciones en staging |
| Actualización de plugin rompe el CMS | Media | Alto | Staging + versiones fijadas + backups previos |
| Payload pesado de la REST API | Media | Medio | Endpoints agregados y caché |
| HTML de Gutenberg impredecible | Media | Medio | Set acotado de bloques + sanitización doble |
| Licencia ACF Pro | Baja | Bajo | USD 49/año, incluida en el Sprint 0 |
| Spotify restringe su API | Media | Medio | Fallback manual en `track` |
| Instagram API bloquea la integración | Alta | Medio | Grilla curada desde el día uno |
| Contenido real insuficiente | Alta | Medio | 10 notas, 10 eventos y 10 logos antes del Sprint 4 |
| Scope creep (Awards, votaciones) | Alta | Medio | Congelar v1: solo páginas de presentación |
| Credenciales del brief en texto plano | Alta | Alto | Rotarlas y sacarlas del repo |

**⚠️ Seguridad:** el brief contiene contraseñas de Hostinger, Instagram, TikTok, YouTube, Spotify y correo en texto plano. Rotarlas, activar 2FA y moverlas a un gestor. Los documentos compartidos no deben incluirlas.

---

## 17. Dependencias del cliente

| # | Elemento | Para cuándo |
|---|---|---|
| 1 | Archivos WOFF2 de Integral CF (pesos licenciados) | Sprint 0 |
| 2 | Tipografía de lectura: aprobada (Gelasio) | — |
| 3 | Licencia ACF Pro (USD 49/año) | Sprint 0 |
| 4 | Logotipo horizontal en SVG + versiones de color | Sprint 0 |
| 5 | 10 logotipos de marcas en SVG/PNG transparente | Sprint 2 |
| 6 | 15–20 fotografías de alta resolución con derechos | Sprint 1 |
| 7 | 10 notas, 10 eventos y 10 marcas reales | Sprint 4 |
| 8 | Confirmación del menú definitivo (derivado del brief) | Sprint 1 |
| 9 | Credenciales de la app de Spotify | Sprint 4 |
| 10 | Textos legales (Ley 21.719) | Sprint 5 |
| 11 | Accesos de Hostinger y respaldo previo | Sprint 5 |

En el repo existe `public/logo_v1.svg` (isotipo vino) y un PNG horizontal de 2946×1462. Falta el vectorial del logotipo completo.

---

## 18. Decisiones pendientes

| # | Decisión | Recomendación |
|---|---|---|
| 1 | Tipografía de lectura | Resuelta: Gelasio |
| 2 | Menú definitivo | Derivado de las 8 categorías del brief, con "Más" |
| 3 | Nombre del proyecto de sesiones | UP10 Unplugged (brief) |
| 4 | Ruta de artículo | `/noticias/:slug` |
| 5 | Instagram | Curado en v1, API en fase 2 |
| 6 | Newsletter | WordPress + export; ESP al superar 100 suscriptores |
| 7 | Analítica | Cloudflare Web Analytics |
| 8 | Awards | Página de presentación; votaciones fuera de alcance |
| 9 | Preview de borradores | Fase 2, si el equipo editorial lo pide |
| 10 | Repositorio | Monorepo `apps/web` + `apps/cms` |

---

## 19. Próximo paso

1. Revisar y firmar el Hito 0 (§4, spec 01 y spec 02).
2. Cerrar el menú definitivo; la tipografía de lectura ya está resuelta (Gelasio).
3. Arrancar el Sprint 0 con WordPress local, sin esperar Hostinger.
4. Ejecutar la Fase 0 de `docs/plan-infraestructura-hostinger.md` al recuperar el acceso.
