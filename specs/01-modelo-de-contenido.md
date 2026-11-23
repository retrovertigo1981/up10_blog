# Spec 01 — Modelo de contenido

- **Estado:** borrador para revisión
- **CMS:** WordPress 6.x headless + ACF Pro
- **Base de datos:** MySQL 8
- **Prefijo de tablas:** `up10_`

---

## 1. Principios del modelo

1. **Todo contenido editorial vive en `post`**, no en tipos separados. Esto conserva programación, revisiones, autores, feeds y compatibilidad con plugins SEO.
2. **La diferencia entre noticia, entrevista y reportaje es taxonómica**, no estructural. Se filtra por `tipo_contenido`.
3. **Los tipos personalizados se reservan para entidades**, no para artículos: eventos, marcas, sesiones, ranking.
4. **Los campos se declaran en ACF y se exponen por REST** con `show_in_rest`.
5. **Nada se publica sin los campos obligatorios** (§6).

---

## 2. Taxonomías

### 2.1 `category` (nativa)

Categorías editoriales definidas por el brief. Planas, sin jerarquía.

| Término | Slug | En menú |
|---|---|---|
| Actualidad musical | `actualidad-musical` | Sí |
| Música chilena | `musica-chilena` | Sí |
| Música internacional | `musica-internacional` | Sí |
| Conciertos y festivales | `conciertos-festivales` | Sí |
| Lanzamientos | `lanzamientos` | No (menú secundario) |
| Entrevistas | `entrevistas` | Sí |
| Industria musical | `industria-musical` | No |
| Cultura y entretenimiento | `cultura-entretenimiento` | No |

Regla: un artículo tiene **exactamente una** categoría. El menú se arma por ACF, no por el orden de la taxonomía.

### 2.2 `tipo_contenido` (personalizada, no jerárquica)

| Término | Slug | Uso |
|---|---|---|
| Noticia | `noticia` | Artículo informativo (por defecto) |
| Entrevista | `entrevista` | Activa la vista `/entrevistas` y el bloque de portada |
| Reportaje | `reportaje` | Formato largo; layout con más aire |

### 2.3 `post_tag` (nativa)

Etiquetas libres: artistas, géneros, ciudades, festivales. Alimentan el buscador y los relacionados sugeridos.

### 2.4 `senal` (personalizada, no jerárquica)

Señales editoriales curadas. Un artículo puede tener varias. No reemplazan a la categoría ni al tipo de contenido.

| Término | Slug | Uso |
|---|---|---|
| Última hora | `ultima-hora` | Prioriza la noticia en el hero y activa la insignia |
| Espectáculo | `espectaculo` | Etiqueta editorial |
| Moda | `moda` | Etiqueta editorial |
| Exclusivo | `exclusivo` | Opcional, para contenido exclusivo |
| Destacado | `destacado` | Opcional, para curaduría futura |

Regla: “Espectáculo” y “Moda” son señales, no categorías. Si el cliente quiere que sean secciones del menú, se promueven a `category` con aprobación explícita, porque el brief fija 8 categorías musicales.

**Última hora (MVP):** se marca con la señal `ultima-hora`. En esta versión no expira automáticamente: el editor la desmarca cuando corresponda. La expiración automática queda para una fase posterior.

---

## 3. Tipos de contenido

### 3.1 `post` — Artículo

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `title` | nativo | Sí | Titular editorial en caja de oración; nombres propios conservan mayúsculas |
| `slug` | nativo | Sí | Único, sin acentos |
| `content` | nativo (Gutenberg) | Sí | Bloques permitidos en §5 |
| `excerpt` | nativo | Sí | Máx. 200 caracteres; si falta, se genera del contenido |
| `featured_media` | nativo | Sí | Imagen principal 16:9 mín. 1600 px de ancho |
| `categories` | nativa | Sí | Exactamente una |
| `tipo_contenido` | taxonomía | Sí | Por defecto `noticia` |
| `tags` | nativa | No | Máx. 8 |
| `senal` | taxonomía | No | Señales editoriales; máx. 3 |
| `author` | nativo | Sí | Usuario con biografía completa |

**Campos ACF — grupo `Artículo`**

| Campo | Nombre | Tipo | Regla |
|---|---|---|---|
| Extracto largo | `dek` | textarea | 120–240 caracteres; se muestra bajo el titular |
| Destacado | `is_featured` | true/false | Máx. 6 activos |
| Orden de destacado | `featured_rank` | number | 1–6, único entre destacados |
| Crédito de foto | `photo_credit` | text | Obligatorio si la imagen no es propia |
| Galería | `gallery` | gallery | 3–12 imágenes; activa el bloque de galería |
| Punto focal | `focal_point` | select | `center`/`top`/`bottom`/`left`/`right`; se aplica como `object-position` |
| Video YouTube | `video_url` | url | Solo YouTube; se extrae el ID |
| Tiempo de lectura | `reading_time` | number | Si está vacío, se calcula a 200 palabras/min |
| Relacionados | `related` | relationship → post | Máx. 3; si está vacío, se sugiere por categoría |
| Grupo SEO | `seo` | group | Ver §4 |

### 3.2 `evento`

| Campo | Nombre | Tipo | Regla |
|---|---|---|---|
| Título | nativo | — | Nombre del evento |
| Fecha | `event_date` | date picker | `YYYY-MM-DD` |
| Hora | `event_time` | time picker | `HH:MM` |
| Recinto | `venue` | text | Obligatorio |
| Ciudad | `city` | text | Obligatorio |
| Lineup | `lineup` | repeater | Nombre + URL opcional; máx. 10 |
| Imagen | `featured_media` | nativo | 16:9 |
| Entradas | `ticket_url` | url | Si está vacío, se muestra "Próximamente" |
| Descripción | `content` | nativo | Máx. 400 palabras |
| Estado | calculado | — | `upcoming` si la fecha es futura; `past` si no |

Regla: los eventos pasados se conservan, pero no aparecen en la portada.

### 3.3 `marca`

| Campo | Nombre | Tipo | Regla |
|---|---|---|---|
| Nombre | nativo | — | — |
| Logo | `logo` | image | PNG/SVG con fondo transparente |
| URL | `website` | url | Opcional |
| Orden | `sort_order` | number | 1–10 |

### 3.4 `stat`

| Campo | Nombre | Tipo | Regla |
|---|---|---|---|
| Etiqueta | `label` | text | Ej. "Seguidores en Instagram" |
| Etiqueta corta | `short_label` | text | Para la barra compacta: "Seguidores", "Vistas", "Desde" |
| Valor | `value` | number | Ej. 136000 |
| Prefijo | `prefix` | text | Ej. "+" |
| Sufijo | `suffix` | text | Ej. "M" |
| Animar cifra | `animated` | true/false | Default sí. Desactivar para años o cifras que deben aparecer fijas |
| Orden | `sort_order` | number | 1–3 |

El frontend formatea el número según configuración regional chilena.

### 3.5 `track` — TOP 10

| Campo | Nombre | Tipo | Regla |
|---|---|---|---|
| Posición | `position` | number | 1–10, único |
| Título | `title` | text | — |
| Artista | `artist` | text | — |
| Portada | `cover` | image | 1:1 |
| URL Spotify | `spotify_url` | url | Obligatorio |
| Origen | `source` | select | `spotify` / `manual` |
| Spotify ID | `spotify_id` | text | Solo lectura; lo escribe el sync |
| Posición anterior | `previous_position` | number | Null si es nueva |
| Movimiento | `movement` | select | `up` / `down` / `same` / `new` |
| Nueva entrada | `is_new` | true/false | Calculado por el sync |
| Último sync | `last_synced_at` | datetime | Solo lectura |

Regla: el sync de Spotify solo sobrescribe filas con `source = spotify`. Las filas manuales nunca se tocan. El historial de posiciones vive en la tabla `up10_top10_snapshots` (spec 06).

### 3.6 `sesion` — UP10 Unplugged

| Campo | Nombre | Tipo | Regla |
|---|---|---|---|
| Título | nativo | — | Ej. "Sesión #51 — Artista" |
| Artista | `artist` | text | — |
| Fecha | `session_date` | date picker | — |
| Imágenes | `gallery` | gallery | 3–10 |
| Video | `video_url` | url | YouTube |
| Descripción | `content` | nativo | — |

### 3.7 `page` (nativa)

Se usa para Unplugged, Podcast, Awards, Nosotros, Privacidad y Términos.

| Campo | Nombre | Tipo |
|---|---|---|
| Hero | `hero` | group (imagen + titular + bajada) |
| Cuerpo | `content` | nativo |
| Grupo SEO | `seo` | group |

---

## 4. SEO

Un solo grupo ACF, expuesto en REST, sin duplicar con plugins.

| Campo | Nombre | Regla |
|---|---|---|
| Título | `seo_title` | Máx. 60 caracteres; si está vacío, usa el título |
| Descripción | `seo_description` | 120–160 caracteres |
| Imagen OG | `seo_og_image` | 1200×630; si falta, usa la portada |
| Canonical | `seo_canonical` | Vacío por defecto |
| No indexar | `seo_noindex` | Booleano |

**Decisión:** Yoast o Rank Math se instalan solo como herramienta de análisis editorial, nunca como fuente de metadatos del frontend. El frontend lee exclusivamente el grupo ACF.

---

## 5. Bloques permitidos en el contenido

Para que el HTML de Gutenberg sea predecible y seguro, el editor solo puede usar:

| Bloque | Mapeo en React |
|---|---|
| Párrafo | `<p>` con estilos de lectura |
| Encabezado H2/H3 | Jerarquía controlada |
| Lista | `<ul>` / `<ol>` |
| Cita | `<blockquote>` con atribución |
| Imagen | `<figure>` con `caption` y `srcset` |
| Galería | Componente `Gallery` con lightbox |
| Embed YouTube | `YouTubeLite` |
| Separador | `<hr>` |
| Botón/CTA | `Button` estilizado |

**Prohibido:** HTML embebido libre, shortcodes de plugins, iframes arbitrarios, scripts.

Todo el HTML se sanitiza en WordPress (`wp_kses_post`) y nuevamente en el frontend (DOMPurify) antes de renderizar.

---

## 6. Reglas de publicación

Un artículo no puede pasar a `publish` si falta:

1. Título.
2. Extracto o `dek`.
3. Imagen destacada.
4. Categoría.
5. Tipo de contenido.
6. Texto alternativo en la imagen principal.
7. Crédito de foto cuando corresponda.

Se implementa con validación en `save_post` + aviso en el editor. El incumplimiento no bloquea el guardado del borrador, solo la publicación.

**Carrusel de portada:** el hero muestra 3 noticias: primero la noticia con `senal = ultima-hora` más reciente, si existe, y luego las más recientes hasta completar 3. Sin última hora, son las 3 más recientes. El total de la portada es 10: 3 en el hero y 7 en el bento.

**Última hora:** se recomienda mantener una sola noticia activa con `ultima-hora`. Solo esa noticia recibe insignia y titular en mayúsculas, y vive en el hero. El bento y el resto de las tarjetas no aplican tratamiento de última hora aunque existan términos antiguos; si hay más de una activa, el hero prioriza la más reciente y el admin debe avisar para desmarcar las demás.

**Caja de los titulares:** el contenido se escribe en caja de oración; los nombres propios conservan mayúsculas. El diseño aplica mayúsculas completas solo a las noticias principales y de última hora. No se debe escribir todo el titular en mayúsculas desde WordPress.

**Programación:** se usa el programador nativo de WordPress. El cron real de hPanel ejecuta `wp-cron.php` cada 5 minutos; sin él, un post programado no se publica a tiempo.

**Revisión:** se activan las revisiones nativas (sin límite configurable) para poder revertir cambios editoriales.

---

## 7. Medios

- **Portada de artículo:** 3:2, mínimo 2000 × 1333 px. Es la misma imagen que se usa en el hero y en el bento, así que el sujeto debe quedar dentro del 60 % central.
- **Punto focal:** el editor elige `center`, `top`, `bottom`, `left` o `right`; el frontend lo aplica como `object-position` para que el recorte funcione en ambas piezas.
- Formatos aceptados: JPG, PNG, WebP, SVG (solo administradores).
- Tamaño máximo de subida: 10 MB (verificar `upload_max_filesize` en Fase 0).
- WordPress genera `thumbnail`, `medium`, `medium_large`, `large` y `1536x1536`.
- El frontend arma `srcset` con esos tamaños y usa `sizes` según layout.
- Los archivos viven en `cms.up10.cl/wp-content/uploads/`, con CDN delante.
- Política: toda imagen debe tener `alt`; sin `alt`, no se publica.

---

## 8. Roles

| Rol | Capacidades |
|---|---|
| Administrador | Todo, incluidos plugins, usuarios y ajustes |
| Editor | Publica, edita y programa cualquier contenido |
| Autor | Crea y edita solo sus borradores; no publica |
| Colaborador | Crea borradores; no sube medios |

Se elimina el rol Suscriptor y se desactiva el registro público.

---

## 9. Ajustes globales (Options Page ACF)

| Grupo | Campos |
|---|---|
| Estadísticas | repeater de 3 `stat` (etiqueta, valor, prefijo, sufijo, animar) |
| Redes | Instagram, TikTok, Facebook, YouTube, WhatsApp, correo de prensa |
| TOP 10 | URL de playlist, activar sync, frecuencia |
| Instagram | modo (`curado` / `api`), repeater de 10 publicaciones |
| Newsletter | título, bajada, texto de consentimiento, URL de privacidad |
| Navegación | menú principal y menú del pie |
| Contacto | correo, WhatsApp, dirección |

---

## 10. Mapeo a la API

| Recurso | Endpoint |
|---|---|
| Portada agregada | `GET /home` |
| Artículos | `GET /posts` |
| Artículo | `GET /posts/{slug}` |
| Categorías | `GET /categories` |
| Eventos | `GET /events` |
| Evento | `GET /events/{slug}` |
| TOP 10 | `GET /top10` |
| Marcas | `GET /partners` |
| Páginas | `GET /pages/{slug}` |
| Buscador | `GET /search?q=` |
| Newsletter | `POST /newsletter` |

El detalle de formas y errores está en `02-contrato-api.md`.

---

## 11. Pendientes de esta spec

- [ ] Confirmar si la entrevista necesita campos propios (entrevistador, medio, duración).
- [ ] Definir si "Estilo" existe como categoría (no está en el brief).
- [ ] Confirmar si Awards tendrá nominados en v1 o solo presentación.
- [ ] Definir límite de revisiones y política de purga.
