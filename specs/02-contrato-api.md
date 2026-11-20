# Spec 02 — Contrato de API

- **Estado:** borrador para revisión
- **Base URL:** `https://api.up10.cl/wp-json/up10/v1`
- **Versión:** `v1`
- **Formato:** JSON UTF-8
- **Autenticación:** ninguna para lectura; token para preview de borradores

---

## 1. Convenciones

- Nombres de campo en `camelCase`.
- Fechas ISO 8601 en UTC (`2026-11-20T14:30:00Z`).
- IDs numéricos, slugs en `kebab-case`.
- Toda respuesta de colección usa el sobre `{ data, meta }`.
- Toda respuesta de error usa `{ error: { code, message } }`.
- Los campos vacíos se omiten; no se envían `null` innecesarios.
- Máximo 100 elementos por página.

### 1.1 Tipos compartidos

```ts
type Image = {
  src: string;
  width: number;
  height: number;
  alt: string;
  srcset: string; // "url 400w, url 800w, ..."
  credit?: string;
  focalPoint?: "center" | "top" | "bottom" | "left" | "right";
};

type Author = {
  id: number;
  name: string;
  slug: string;
  bio?: string;
  avatar?: Image;
};

type Category = {
  id: number;
  name: string;
  slug: string;
};

type Seo = {
  title: string;
  description: string;
  ogImage?: Image;
  canonical?: string;
  noindex: boolean;
};

type Pagination = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};
```

---

## 2. Endpoints de lectura

### 2.1 `GET /home`

Devuelve todo lo necesario para la portada en **una sola petición**. Existe para evitar 8 llamadas y mantener el LCP bajo.

```json
{
  "data": {
    "hero": [],
    "latest": [],
    "interviews": [],
    "events": [],
    "top10": [],
    "instagram": [],
    "stats": [],
    "partners": [],
    "unplugged": {},
    "projects": []
  }
}
```

| Clave        | Contenido                                 | Límite               |
| ------------ | ----------------------------------------- | -------------------- |
| `hero`       | Las 3 noticias más recientes, en orden     | 3                    |
| `latest`     | Artículos publicados, más recientes        | 10 (3 primeras = hero) |
| `interviews` | `tipo_contenido = entrevista`             | 3                    |
| `events`     | Próximos eventos                          | 3                    |
| `top10`      | Ranking ordenado por posición             | 10                   |
| `instagram`  | Publicaciones curadas                     | 10                   |
| `stats`      | Cifras institucionales                    | 3                    |
| `partners`   | Marcas                                    | 10                   |
| `unplugged`  | Página + última sesión                    | 1                    |
| `projects`   | Podcast y Awards                          | 2                    |

Regla: `hero` y `latest` salen de la misma consulta ordenada por fecha. El hero no se cura a mano; si hay menos de 3 artículos, devuelve los disponibles.

### 2.2 `GET /posts`

| Parámetro  | Tipo  | Default | Descripción                          |
| ---------- | ----- | ------- | ------------------------------------ |
| `page`     | int   | 1       | Página                               |
| `perPage`  | int   | 12      | Máx. 24                              |
| `category` | slug  | —       | Filtra por categoría                 |
| `tipo`     | slug  | —       | `noticia`, `entrevista`, `reportaje` |
| `tag`      | slug  | —       | Filtra por etiqueta                  |
| `exclude`  | int[] | —       | IDs a excluir                        |
| `orderBy`  | enum  | `date`  | `date` \| `title`                    |
| `order`    | enum  | `desc`  | `desc` \| `asc`                      |

```json
{
  "data": [/* PostSummary[] */],
  "meta": {
    "pagination": { "page": 1, "perPage": 12, "total": 84, "totalPages": 7 }
  }
}
```

**`PostSummary`**

```ts
type PostSummary = {
  id: number;
  slug: string;
  title: string;
  dek?: string;
  cover: Image;
  category: Category;
  tipo: "noticia" | "entrevista" | "reportaje";
  author: Author;
  publishedAt: string;
  readingTime: number;
  isFeatured: boolean;
};
```

### 2.3 `GET /posts/{slug}`

```ts
type Post = PostSummary & {
  html: string; // contenido sanitizado
  gallery: Image[];
  video?: { provider: "youtube"; id: string };
  tags: string[];
  related: PostSummary[];
  seo: Seo;
  updatedAt: string;
};
```

`404` si no existe o no está publicado.

### 2.4 `GET /categories`

```json
{
  "data": [
    { "id": 3, "name": "Música chilena", "slug": "musica-chilena", "count": 24 }
  ]
}
```

### 2.5 `GET /events`

| Parámetro | Tipo | Default    | Descripción                   |
| --------- | ---- | ---------- | ----------------------------- |
| `scope`   | enum | `upcoming` | `upcoming` \| `past` \| `all` |
| `page`    | int  | 1          | —                             |
| `perPage` | int  | 12         | —                             |

```ts
type EventSummary = {
  id: number;
  slug: string;
  title: string;
  date: string; // ISO
  time: string; // "19:00"
  venue: string;
  city: string;
  image: Image;
  ticketUrl?: string;
  status: "upcoming" | "past";
};
```

### 2.6 `GET /events/{slug}`

`EventSummary` + `lineup: { name, url? }[]`, `descriptionHtml`, `seo`.

### 2.7 `GET /top10`

```json
{
  "data": [
    {
      "position": 1,
      "previousPosition": 3,
      "movement": "up",
      "isNew": false,
      "title": "Nombre de la canción",
      "artist": "Artista",
      "cover": { "src": "...", "alt": "..." },
      "spotifyUrl": "https://open.spotify.com/track/...",
      "source": "spotify"
    }
  ],
  "meta": {
    "playlistUrl": "https://open.spotify.com/playlist/3Iq8oHfADX6oHPi8jYs4vH",
    "embedUrl": "https://open.spotify.com/embed/playlist/3Iq8oHfADX6oHPi8jYs4vH?utm_source=generator&theme=0",
    "syncedAt": "2026-11-20T12:00:00Z"
  }
}
```

- `movement`: `up`, `down`, `same` o `new`.
- `previousPosition` es `null` cuando la canción entra por primera vez.
- `embedUrl` se usa en un iframe; la lista se maqueta aparte.
- El ID correcto es `3Iq8oHfADX6oHPi8jYs4vH`. El del brief devuelve 404.

### 2.8 `GET /partners`

```json
{
  "data": [{ "id": 1, "name": "Warner Music Group", "logo": {}, "url": null }]
}
```

### 2.9 `GET /pages/{slug}`

```ts
type Page = {
  slug: string;
  title: string;
  hero: { title: string; subtitle?: string; image?: Image };
  html: string;
  seo: Seo;
};
```

### 2.10 `GET /search`

| Parámetro | Tipo   | Regla                          |
| --------- | ------ | ------------------------------ |
| `q`       | string | Obligatorio, mín. 3 caracteres |
| `page`    | int    | Default 1                      |
| `perPage` | int    | Default 10, máx. 30            |

Busca en título, extracto, `dek` y etiquetas. Devuelve `PostSummary[]` con `meta.pagination` y `meta.query`.

`400` si `q` tiene menos de 3 caracteres.

### 2.11 `GET /preview`

| Parámetro | Tipo   | Regla                         |
| --------- | ------ | ----------------------------- |
| `id`      | int    | Obligatorio                   |
| `token`   | string | Firma HMAC, válida 15 minutos |

Devuelve un `Post` en borrador. Requiere el secreto compartido entre WordPress y GitHub Actions.

---

## 3. Escritura

### 3.1 `POST /newsletter`

```json
{
  "email": "persona@dominio.cl",
  "consent": true,
  "source": "home",
  "website": "" // honeypot: debe venir vacío
}
```

| Regla               | Valor                                                    |
| ------------------- | -------------------------------------------------------- |
| Validación de email | Formato + dominio con MX                                 |
| `consent`           | Debe ser `true`                                          |
| Honeypot            | Si `website` no está vacío, responder `200` sin guardar  |
| Rate limit          | 5 peticiones por IP por minuto                           |
| Duplicados          | Responder `200` con el mismo mensaje que un alta nueva   |
| Respuesta           | `202 { "data": { "status": "pending" } }` (doble opt-in) |

No se revela si el correo ya existía (evita enumeración).

---

## 4. Caché

| Recurso                 | `Cache-Control`                                                |
| ----------------------- | -------------------------------------------------------------- |
| `GET /home`             | `public, max-age=60, s-maxage=300, stale-while-revalidate=600` |
| `GET /posts`, `/events` | `public, max-age=60, s-maxage=300`                             |
| `GET /posts/{slug}`     | `public, max-age=120, s-maxage=600`                            |
| `GET /top10`            | `public, max-age=60, s-maxage=300`                             |
| `GET /search`           | `public, max-age=30, s-maxage=60`                              |
| `POST /newsletter`      | `no-store`                                                     |
| `GET /preview`          | `no-store`                                                     |

- Cada respuesta de lectura incluye `ETag`.
- Al guardar o publicar contenido se purga la caché del CDN.
- Si la purga falla, el TTL actúa como red de seguridad.

---

## 5. CORS

| Origen                  | Métodos              | Cabeceras          |
| ----------------------- | -------------------- | ------------------ |
| `https://up10.cl`       | `GET, POST, OPTIONS` | `Content-Type`     |
| `https://www.up10.cl`   | `GET, POST, OPTIONS` | `Content-Type`     |
| `http://localhost:5173` | `GET, POST, OPTIONS` | Solo en desarrollo |

No se permite `*` en `POST`. Los `GET` públicos pueden responder `*`.

---

## 6. Errores

```json
{
  "error": {
    "code": "post_not_found",
    "message": "El artículo solicitado no existe o no está publicado."
  }
}
```

| HTTP | `code`              | Cuándo                                      |
| ---- | ------------------- | ------------------------------------------- |
| 400  | `invalid_query`     | Parámetros fuera de rango                   |
| 400  | `query_too_short`   | Búsqueda con menos de 3 caracteres          |
| 404  | `post_not_found`    | Slug inexistente                            |
| 404  | `page_not_found`    | Página inexistente                          |
| 422  | `validation_failed` | Newsletter con datos inválidos              |
| 429  | `rate_limited`      | Exceso de peticiones                        |
| 500  | `internal_error`    | Fallo no controlado (sin detalles internos) |
| 503  | `maintenance`       | WordPress en mantenimiento                  |

Los mensajes se muestran al usuario tal cual: deben estar en español y sin jerga técnica.

---

## 7. Reglas de implementación

1. Los endpoints viven en un plugin propio, `up10-core`, no en `functions.php`.
2. Se registran con `register_rest_route` y `permission_callback` explícito.
3. Ningún endpoint usa `_embed` ni `wp/v2` en producción.
4. Cada endpoint declara `args` con validación y sanitización.
5. Las consultas usan `WP_Query` con `no_found_rows` cuando no se necesita paginación.
6. Los campos ACF se leen con `get_field` y se normalizan a `camelCase` en un serializador único.
7. El HTML se sanitiza con `wp_kses_post` en origen y DOMPurify en destino.
8. Los endpoints de escritura registran IP y fecha, sin almacenar más datos de los necesarios.

---

## 8. Pendientes de esta spec

- [ ] Definir el proveedor de doble opt-in (propio o ESP).
- [ ] Confirmar si `/home` incluye el bloque de Instagram cuando está en modo API.
- [ ] Definir política de paginación del archivo (12 vs 15 por página).
- [ ] Confirmar si los eventos pasados se paginan o se muestran completos.
