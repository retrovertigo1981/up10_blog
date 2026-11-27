# Spec 06 — WordPress como CMS

> **Estado:** borrador para implementación
> **Rol de WordPress:** solo backend de contenido. No hay tema público, ni plantillas, ni page builders.
> **Frontend:** React estático en `up10.cl`; WordPress vive en `api.up10.cl`.

---

## 1. Decisión: plugin propio + SCF

| Pieza | Qué usamos | Por qué |
|---|---|---|
| Lógica del proyecto | **Plugin propio `up10-core`** | Control total, sin dependencias innecesarias, versionado en Git |
| Campos editoriales | **Secure Custom Fields (SCF)** | Repeaters, galerías, relación y options pages; reconstruir esa UI costaría semanas |
| Todo lo demás | **Nada** | Menos superficie de ataque, menos actualizaciones, menos licencias |

**No instalamos:** page builders (Elementor, Divi), suites SEO (Yoast, RankMath), caché (WP Rocket, LiteSpeed Cache), seguridad (Wordfence), formularios (Contact Form 7), feeds de Instagram ni plugins de Spotify.

Cada uno de esos plugins agrega código que no controlamos, actualizaciones que pueden romper el sitio y superficie de ataque. Lo que necesitamos se implementa en `up10-core` o se resuelve en el frontend.

**Secure Custom Fields (SCF):** fork gratuito de ACF, GPL, mantenido por WordPress.org y la comunidad. Cubre repeater, flexible content, galería, relacionales y options pages. Fijar versión y probar actualizaciones en staging.

---

## 2. Qué hace `up10-core`

```
wp-content/plugins/up10-core/
├── up10-core.php
├── includes/
│   ├── content-types.php     # CPTs y taxonomías
│   ├── fields.php            # grupos SCF y validaciones
│   ├── rest.php              # endpoints /wp-json/up10/v1
│   ├── serializers.php       # WP → contrato camelCase
│   ├── spotify.php           # sync + historial
│   ├── newsletter.php        # alta, doble opt-in, export
│   ├── preview.php           # token firmado
│   ├── revalidate.php        # webhook a GitHub
│   ├── hardening.php         # XML-RPC, login, REST
│   └── media.php             # tamaños, WebP, foco
├── acf-json/                 # campos versionados
└── templates/                # nada visual, solo admin
```

Responsabilidades:

1. Registrar CPTs y taxonomías **en código**, no desde la UI de SCF, para que viajen con Git.
2. Exponer la API `up10/v1` con respuestas normalizadas.
3. Sincronizar Spotify y guardar historial de posiciones.
4. Gestionar el newsletter con doble opt-in.
5. Firmar tokens de preview de borradores.
6. Disparar el rebuild del frontend al publicar.
7. Aplicar el hardening.

---

## 3. Modelo de contenido

El detalle está en `specs/01-modelo-de-contenido.md`. Resumen de lo que WordPress debe registrar:

| Tipo | Implementación | Notas |
|---|---|---|
| Artículo | `post` nativo | Noticia, entrevista y reportaje por taxonomía `tipo_contenido` |
| Categoría | `category` nativa | Las 8 del brief |
| Etiqueta | `post_tag` nativa | Artistas, géneros, ciudades |
| Señal editorial | Taxonomía `senal` | Última hora, Espectáculo, Moda, etc. |
| Evento | CPT `evento` | Fecha, recinto, lineup, entradas |
| Marca | CPT `marca` | Logo y orden |
| Cifra | CPT `stat` | Valor, prefijo, sufijo, animar, orden |
| Ranking | CPT `track` | Posición, anterior, movimiento, Spotify ID |
| Sesión | CPT `sesion` | Unplugged |
| Página | `page` nativa | Nosotros, Podcast, Awards, legales |
| Ajustes | Options Page SCF | Redes, navegación, Instagram, newsletter |

**El contenido editorial vive en `post`.** Así conservamos programación, revisiones, autores y compatibilidad del ecosistema. Los CPTs son solo para entidades.

---

## 4. Campos personalizados

### 4.1 ¿SCF o campos nativos?

Campos nativos (`register_post_meta`) sirven para texto simple, pero no dan repeater, galería, relationship ni options page con una UI decente. El equipo editorial necesita esa UI. Por eso Secure Custom Fields (SCF).

Los grupos base se declaran en `includes/fields.php` y se pueden editar desde el admin de SCF. Cuando se editan, se exportan con `wp scf json export` a `acf-json/` y se versionan. Nunca se editan solo en producción: se cambian en local/staging y se despliega.

### 4.2 Grupos

| Grupo | Dónde | Campos clave |
|---|---|---|
| Artículo | `post` | `dek`, `focal_point`, `gallery`, `video_url`, `reading_time`, `related`, `seo` |
| Evento | `evento` | `event_date`, `event_time`, `venue`, `city`, `lineup`, `ticket_url`, `seo` |
| Ranking | `track` | `position`, `previous_position`, `movement`, `is_new`, `spotify_id`, `cover` |
| Marca | `marca` | `logo`, `website`, `sort_order` |
| Cifra | `stat` | `label`, `short_label`, `value`, `prefix`, `suffix`, `animated`, `sort_order` |
| Página | `page` | `hero`, `seo` |
| Ajustes | options | redes, navegación, Instagram, newsletter |

La lista completa de campos y validaciones está en `specs/01`.

### 4.3 Experiencia editorial de las señales

- La taxonomía `tipo_contenido` se muestra como radio buttons de selección única.
- La taxonomía `senal` se muestra como caja de checkboxes bajo el editor, con los términos ya sembrados en código.
- Columna “Señales” y filtro por señal en el listado de artículos.
- Ayuda visible en el editor:
  - “Escribe el titular en caja de oración; los nombres propios conservan mayúsculas.”
  - “Marca Última hora solo para noticias urgentes: se prioriza en el hero y lleva insignia.”
  - “Espectáculo y Moda son etiquetas; no cambian la categoría ni el menú.”
- La última hora vive solo en el hero. Se recomienda una sola noticia activa con `ultima-hora`; si hay más, el hero prioriza la más reciente y el admin muestra un aviso para desmarcar las demás. El bento no aplica insignia ni mayúsculas de breaking.
- En el MVP la señal no expira automáticamente; el editor la desmarca. La expiración con `breaking_until` queda para fase 2.

---

## 5. API

Namespace: `/wp-json/up10/v1`. El contrato completo está en `specs/02`.

| Endpoint | Método | Uso |
|---|---|---|
| `/ping` | GET | Health check del plugin y la API |
| `/home` | GET | Portada en una sola llamada |
| `/posts` | GET | Archivo con filtros y paginación |
| `/posts/{slug}` | GET | Artículo |
| `/categories` | GET | Categorías |
| `/events` | GET | Eventos |
| `/events/{slug}` | GET | Evento |
| `/top10` | GET | Ranking + embed |
| `/partners` | GET | Marcas |
| `/pages/{slug}` | GET | Páginas institucionales |
| `/search` | GET | Buscador |
| `/newsletter` | POST | Suscripción |
| `/preview` | GET | Borrador firmado |

Reglas:

- Respuestas normalizadas a `camelCase` con un serializador único.
- El serializador de artículos incluye `signals` (términos de `senal`) e `isBreaking` (derivado de `ultima-hora`).
- El serializador de cifras incluye `animated`; el editor lo controla desde el repeater.
- Nunca exponer `wp/v2` en producción para el frontend.
- Cada endpoint declara `args` con validación y `permission_callback`.
- `Cache-Control` según spec 02 y `ETag`.
- CORS solo para `up10.cl`, `www.up10.cl` y `localhost` en desarrollo.

---

## 6. Spotify: embed + ranking propio

### 6.1 Datos correctos

| Dato | Valor |
|---|---|
| Playlist | `RANKING – playlist by UP10.CL` |
| ID | `3Iq8oHfADX6oHPi8jYs4vH` |
| URL | `https://open.spotify.com/playlist/3Iq8oHfADX6oHPi8jYs4vH` |
| Embed | `https://open.spotify.com/embed/playlist/3Iq8oHfADX6oHPi8jYs4vH?utm_source=generator&theme=0` |

El ID que aparece en el brief (`31q8oHfADX60HPi8jYs4vH`) devuelve 404. Hay que corregirlo en el brief.

### 6.2 Qué es posible

| Necesidad | Solución |
|---|---|
| Reproducir la playlist dentro de la página | iframe oficial de Spotify |
| Lista con canción, artista, portada, posición | API Web de Spotify + maquetación propia |
| Posición anterior y nueva entrada | Historial propio en WordPress |
| Botón por canción | Enlace a `external_urls.spotify` del track |

**Limitación:** no se puede controlar la reproducción desde la lista propia sin el Web Playback SDK y login Premium. El iframe reproduce; la lista informa y enlaza.

### 6.3 Configuración

1. Crear una app en `developer.spotify.com/dashboard`.
2. Guardar `Client ID` y `Client Secret` como constantes en `wp-config.php`:
   ```php
   define('UP10_SPOTIFY_CLIENT_ID', '...');
   define('UP10_SPOTIFY_CLIENT_SECRET', '...');
   define('UP10_SPOTIFY_PLAYLIST_ID', '3Iq8oHfADX6oHPi8jYs4vH');
   ```
3. No se necesita redirect URI: se usa *Client Credentials*.

### 6.4 Sincronización

```
cron cada 30 min
  → token (cacheado en transient hasta expires_in - 60)
  → GET /v1/playlists/{id}/tracks?limit=10
  → comparar con el snapshot anterior
  → actualizar CPT track: position, previous_position, movement, is_new
  → guardar snapshot en up10_top10_snapshots
  → disparar rebuild del frontend
```

Cálculo:

| Caso | `movement` | `is_new` |
|---|---|---|
| No existía en el snapshot anterior | `new` | `true` |
| `position < previous_position` | `up` | `false` |
| `position > previous_position` | `down` | `false` |
| Igual | `same` | `false` |

Tabla de historial:

```sql
CREATE TABLE up10_top10_snapshots (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  playlist_id VARCHAR(64) NOT NULL,
  track_id VARCHAR(64) NOT NULL,
  position TINYINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  cover_url TEXT NULL,
  captured_at DATETIME NOT NULL,
  INDEX (playlist_id, captured_at)
);
```

- Solo se guardan los primeros 10 tracks.
- Si la API falla, se conserva el último snapshot y se registra el error; el sitio sigue funcionando.
- Respaldo manual: el CPT `track` se puede editar a mano.
- Atribución: mostrar "Datos de Spotify" con enlace a la playlist.

### 6.5 Cuotas y riesgos

- *Client Credentials* no requiere usuario; el límite es amplio para un cron cada 30 min.
- En producción Spotify puede exigir *extended quota*; si no se aprueba, el ranking manual sigue operativo.
- Los cambios de API se monitorean; el fallback está previsto desde el diseño.

---

## 7. Instagram

### 7.1 Estado actual

- El requisito del cliente es **automático**: las últimas 10 publicaciones, actualizadas cuando cambia el feed.
- El modo **API** está implementado en `includes/instagram.php` con cron, caché, normalización y fallback.
- El modo **curado** queda solo como respaldo: 10 publicaciones cargadas a mano desde Ajustes UP10.
- El endpoint `GET /instagram` y el campo `instagram` de `/home` usan la misma caché.
- La **Basic Display API está discontinuada**. Se usa **Instagram API with Instagram Login** (`graph.instagram.com`), que no exige Página de Facebook.

### 7.2 Requisitos previos

1. Cuenta de Instagram **Business o Creator** (la del cliente ya lo es).
2. App en **Meta for Developers** con el producto Instagram y **Instagram Login**.
3. Permiso `instagram_business_basic` (solo lectura de media).
4. Token de usuario de Instagram de larga duración (60 días) o **System User token** de Business Manager si el cliente lo tiene. Se guarda en `wp-config.php` como `UP10_IG_ACCESS_TOKEN`; nunca en el frontend, el repo ni los logs.
5. La cuenta del cliente debe autorizar la app (tester o Business Manager). No se comparte la contraseña si se puede evitar.
6. Cron real de WordPress cada 5 minutos en el hosting.

No se usan `UP10_IG_USER_ID` ni `UP10_IG_API_VERSION`: el endpoint con Instagram Login es `/me/media`, sin versión.

### 7.3 Flujo de sincronización

```text
cron cada 30 min
  → GET https://graph.instagram.com/me/media
        ?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,
                children{media_url,media_type,thumbnail_url}
        &limit=10
        &access_token=<TOKEN>
  → normalizar tipos (IMAGE, CAROUSEL_ALBUM, VIDEO, REEL)
  → descargar la imagen a la biblioteca de medios (WebP automático)
  → guardar caché de 10 publicaciones en `up10_instagram_cache`
  → exponer en /instagram y /home como `instagram`
```

Reglas:

- `IMAGE`: usar `media_url`.
- `CAROUSEL_ALBUM`: usar la primera hija con imagen o `thumbnail_url` como fallback.
- `VIDEO` / `REEL`: usar `thumbnail_url`. La grilla muestra el thumbnail; el video no se descarga. Reproducirlo dentro de la web requiere el embed oficial o usar `media_url` (evaluación pendiente).
- Las `media_url` de Instagram caducan; por eso las imágenes se descargan a WordPress y se reutilizan por `_up10_ig_media_id`.
- Cachear 15–30 min; el límite de la API es amplio, pero no se debe llamar en cada request.
- Si la API falla o el token expira, conservar la última caché y mostrar un aviso en el admin.
- Si no hay datos, el frontend muestra la tarjeta “Síguenos en Instagram”, no un hueco.
- Mantener el permalink y la atribución; las imágenes son del cliente.

### 7.4 Renovación del token

```text
GET https://graph.instagram.com/refresh_access_token
    ?grant_type=ig_refresh_token
    &access_token=<TOKEN>
```

- El token va en la query, como exige Meta; no se registra en logs ni se devuelve en REST.
- Cron mensual (`up10_instagram_refresh_token`) renueva y guarda el vencimiento.
- El admin avisa cuando faltan menos de 10 días o el token supera los 50 días.
- Para rotar manualmente: actualizar `wp-config.php` y ejecutar `wp up10 instagram-reset-token`.

### 7.5 Modos

| Modo | Cuándo usarlo | Funcionamiento |
|---|---|---|
| `api` | **Por defecto** | Cron sincroniza las 10 últimas publicaciones reales |
| `curated` | Respaldo o contingencia | 10 publicaciones cargadas a mano desde Options Page |

Si el modo es `api` pero la caché está vacía, el serializador cae automáticamente al contenido curado.

### 7.6 Actualización en el frontend

- El HTML prerenderizado incluye las 10 piezas de `/home`.
- `InstagramGrid` consulta `/instagram` cada 5 minutos y al recuperar el foco.
- Si la consulta falla, conserva los datos iniciales. No requiere rebuild para actualizarse.

### 7.7 Checklist de puesta en marcha

- [x] Cuenta Business/Creator autorizada a la app.
- [x] App de Meta creada con Instagram Login y permiso `instagram_business_basic`.
- [x] `UP10_IG_ACCESS_TOKEN` configurado en el `wp-config.php` de producción.
- [x] `instagram_mode` en `api`.
- [x] Primera sincronización ejecutada por WP-CLI (`wp up10 instagram-sync --force`).
- [ ] Cron real de WP cada 5 minutos.
- [x] `/instagram` devuelve 10 piezas con `meta.mode = api`.
- [ ] Fallback curado probado explícitamente en producción.
- [x] Aviso de token vencido y última sincronización en el admin (implementado).
- [ ] Renovación mensual verificada.

### 7.8 Implementación (26/11/2026)

- `up10-core` 0.1.3 desplegado; `/instagram` operativo con 10 piezas, `mode: api` y WebP.
- Grilla 3:4 con imagen completa, carga al montar y refresco cada 5 min.
- Incidente hcdn: una respuesta cacheada sin CORS bloqueó el fetch; se purgó el CDN y se recuperó el header.
- Reels/modal no implementados: el sync solo guarda thumbnails. Opciones y costos en `docs/plan-integraciones-instagram-spotify.md` §2.8.

---

## 8. Newsletter

- Endpoint `POST /newsletter` con honeypot, rate limit por IP y validación de consentimiento.
- Tabla `up10_subscribers` (email único, consent, source, status, token, created_at, confirmed_at).
- Doble opt-in por correo con enlace firmado.
- Export CSV desde el admin.
- SMTP autenticado del correo de Hostinger; si el volumen crece, migrar a un ESP.
- Ley 21.719: guardar evidencia de consentimiento y permitir baja.

---

## 9. Preview de borradores

- `GET /preview?id={post_id}&token={hmac}`.
- Token = HMAC-SHA256 de `id|expires` con `UP10_PREVIEW_SECRET`; vigencia 15 minutos.
- Devuelve el artículo sin exigir sesión de WordPress.
- El frontend muestra un aviso "Vista previa" y `noindex`.

---

## 10. Rebuild del frontend

- Al pasar a `publish`, `future` o `update`: `wp_remote_post` a GitHub `repository_dispatch`.
- Payload: `{ event_type: "content-updated", client_payload: { slug } }`.
- Token en `UP10_GITHUB_TOKEN`, permiso mínimo sobre el repo.
- Cron de GitHub cada 30 min como red de seguridad para programados.

---

## 11. Medios

- WordPress genera `thumbnail`, `medium`, `medium_large`, `large` y `1536x1536`.
- Portada 3:2, mínimo 2000×1333; sujeto en el 60 % central.
- `focal_point` se serializa como `focalPoint` y el frontend lo aplica con `object-position`.
- WebP/AVIF: generar variantes en la subida con `wp_generate_attachment_metadata` o servir el original y dejar la optimización al CDN. Decisión: variantes WebP en la subida.
- Límite de subida 10 MB.
- `alt` obligatorio para publicar.

---

## 12. Roles y permisos

| Rol | Capacidades |
|---|---|
| Administrador | Todo |
| Editor | Publicar, editar y programar todo el contenido |
| Autor | Crear y editar sus borradores; no publicar |
| Colaborador | Crear borradores; no subir medios |

- Registro público cerrado.
- Suscriptores deshabilitados.
- 2FA para administradores y editores.

---

## 13. Hardening

Checklist mínimo:

- XML-RPC deshabilitado.
- Edición de archivos deshabilitada (`DISALLOW_FILE_EDIT`).
- Registro público cerrado.
- Límite de intentos de login (transient por IP + usuario).
- Enumeración de usuarios bloqueada (`?author=N`, REST `/wp/v2/users`).
- `wp-config.php` con permisos 600.
- Actualizaciones de seguridad automáticas; las demás pasan por staging.
- WAF y escáner de malware de Hostinger activos.
- Sin plugins de diseño ni builders.
- Backups diarios y prueba de restauración trimestral.

---

## 14. Despliegue

- `up10-core`, el tema `up10-headless` y `acf-json/` viven en Git.
- Deploy por Git o SFTP; nunca editar en producción.
- Staging para probar actualizaciones.
- Variables sensibles en `wp-config.php`, fuera del repo.
- El tema `up10-headless` no renderiza el frontend: redirige las vistas públicas a `https://up10.cl` y deja libres `/wp-admin`, REST, cron y AJAX.
- El frontend se despliega aparte, como archivos estáticos.

---

## 15. Checklist de puesta en marcha

- [ ] Usar `api.up10.cl` con PHP 8.3, SSL y MySQL.
- [ ] Instalar WordPress y fijar zona horaria `America/Santiago`.
- [ ] Configurar enlaces permanentes.
- [ ] Instalar Secure Custom Fields (SCF).
- [ ] Subir y activar `up10-core` y el tema `up10-headless`.
- [ ] Definir constantes de Spotify, preview y GitHub.
- [ ] Crear las 8 categorías y los términos de `tipo_contenido`.
- [ ] Crear usuarios con roles Editor/Autor.
- [ ] Configurar cron real de `wp-cron.php` cada 5 min.
- [ ] Programar el sync de Spotify cada 30 min.
- [ ] Configurar SMTP.
- [ ] Probar `/wp-json/up10/v1/home` y el resto de endpoints.
- [ ] Configurar el webhook de rebuild.
- [ ] Aplicar hardening.
- [ ] Configurar respaldos y probar una restauración.

---

## 16. Pendientes

- [ ] Fijar versión de Secure Custom Fields y revisar actualizaciones en staging.
- [ ] Definir si el newsletter usa doble opt-in desde el día uno.
- [ ] Confirmar el ID correcto de la playlist en el brief.
- [ ] Definir política de retención de snapshots (8 semanas por defecto).
- [ ] Confirmar si se usa un plugin de 2FA o se implementa en `up10-core`.
