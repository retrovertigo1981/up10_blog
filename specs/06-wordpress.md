# Spec 06 — WordPress como CMS

> **Estado:** borrador para implementación
> **Rol de WordPress:** solo backend de contenido. No hay tema público, ni plantillas, ni page builders.
> **Frontend:** React estático en `up10.cl`; WordPress vive en `cms.up10.cl`.

---

## 1. Decisión: plugin propio + ACF

| Pieza | Qué usamos | Por qué |
|---|---|---|
| Lógica del proyecto | **Plugin propio `up10-core`** | Control total, sin dependencias innecesarias, versionado en Git |
| Campos editoriales | **ACF Pro** | Repeaters, galerías, relación y options pages; reconstruir esa UI costaría semanas |
| Todo lo demás | **Nada** | Menos superficie de ataque, menos actualizaciones, menos licencias |

**No instalamos:** page builders (Elementor, Divi), suites SEO (Yoast, RankMath), caché (WP Rocket, LiteSpeed Cache), seguridad (Wordfence), formularios (Contact Form 7), feeds de Instagram ni plugins de Spotify.

Cada uno de esos plugins agrega código que no controlamos, actualizaciones que pueden romper el sitio y superficie de ataque. Lo que necesitamos se implementa en `up10-core` o se resuelve en el frontend.

**Excepción justificada:** ACF Pro (USD 49/año). Alternativa gratuita: Secure Custom Fields, pero su soporte y roadmap son menos predecibles.

---

## 2. Qué hace `up10-core`

```
wp-content/plugins/up10-core/
├── up10-core.php
├── includes/
│   ├── content-types.php     # CPTs y taxonomías
│   ├── fields.php            # grupos ACF y validaciones
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

1. Registrar CPTs y taxonomías **en código**, no desde la UI de ACF, para que viajen con Git.
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
| Evento | CPT `evento` | Fecha, recinto, lineup, entradas |
| Marca | CPT `marca` | Logo y orden |
| Cifra | CPT `stat` | Valor, prefijo, sufijo, orden |
| Ranking | CPT `track` | Posición, anterior, movimiento, Spotify ID |
| Sesión | CPT `sesion` | Unplugged |
| Página | `page` nativa | Nosotros, Podcast, Awards, legales |
| Ajustes | Options Page ACF | Redes, navegación, Instagram, newsletter |

**El contenido editorial vive en `post`.** Así conservamos programación, revisiones, autores y compatibilidad del ecosistema. Los CPTs son solo para entidades.

---

## 4. Campos personalizados

### 4.1 ¿ACF o campos nativos?

Campos nativos (`register_post_meta`) sirven para texto simple, pero no dan repeater, galería, relationship ni options page con una UI decente. El equipo editorial necesita esa UI. Por eso ACF Pro.

Los grupos se guardan como JSON en `acf-json/` y se versionan. Nunca se editan solo en producción: se cambian en local/staging, se exporta el JSON y se despliega.

### 4.2 Grupos

| Grupo | Dónde | Campos clave |
|---|---|---|
| Artículo | `post` | `dek`, `focal_point`, `gallery`, `video_url`, `reading_time`, `related`, `seo` |
| Evento | `evento` | `event_date`, `event_time`, `venue`, `city`, `lineup`, `ticket_url` |
| Ranking | `track` | `position`, `previous_position`, `movement`, `is_new`, `spotify_id`, `cover` |
| Marca | `marca` | `logo`, `website`, `sort_order` |
| Cifra | `stat` | `label`, `short_label`, `value`, `prefix`, `suffix`, `sort_order` |
| Página | `page` | `hero`, `seo` |
| Ajustes | options | redes, navegación, Instagram, newsletter |

La lista completa de campos y validaciones está en `specs/01`.

---

## 5. API

Namespace: `/wp-json/up10/v1`. El contrato completo está en `specs/02`.

| Endpoint | Método | Uso |
|---|---|---|
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

## 7. Newsletter

- Endpoint `POST /newsletter` con honeypot, rate limit por IP y validación de consentimiento.
- Tabla `up10_subscribers` (email único, consent, source, status, token, created_at, confirmed_at).
- Doble opt-in por correo con enlace firmado.
- Export CSV desde el admin.
- SMTP autenticado del correo de Hostinger; si el volumen crece, migrar a un ESP.
- Ley 21.719: guardar evidencia de consentimiento y permitir baja.

---

## 8. Preview de borradores

- `GET /preview?id={post_id}&token={hmac}`.
- Token = HMAC-SHA256 de `id|expires` con `UP10_PREVIEW_SECRET`; vigencia 15 minutos.
- Devuelve el artículo sin exigir sesión de WordPress.
- El frontend muestra un aviso "Vista previa" y `noindex`.

---

## 9. Rebuild del frontend

- Al pasar a `publish`, `future` o `update`: `wp_remote_post` a GitHub `repository_dispatch`.
- Payload: `{ event_type: "content-updated", client_payload: { slug } }`.
- Token en `UP10_GITHUB_TOKEN`, permiso mínimo sobre el repo.
- Cron de GitHub cada 30 min como red de seguridad para programados.

---

## 10. Medios

- WordPress genera `thumbnail`, `medium`, `medium_large`, `large` y `1536x1536`.
- Portada 3:2, mínimo 2000×1333; sujeto en el 60 % central.
- `focal_point` se serializa como `focalPoint` y el frontend lo aplica con `object-position`.
- WebP/AVIF: generar variantes en la subida con `wp_generate_attachment_metadata` o servir el original y dejar la optimización al CDN. Decisión: variantes WebP en la subida.
- Límite de subida 10 MB.
- `alt` obligatorio para publicar.

---

## 11. Roles y permisos

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

## 12. Hardening

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

## 13. Despliegue

- `up10-core`, el tema mínimo y `acf-json/` viven en Git.
- Deploy por Git o SFTP; nunca editar en producción.
- Staging para probar actualizaciones.
- Variables sensibles en `wp-config.php`, fuera del repo.
- El frontend se despliega aparte, como archivos estáticos.

---

## 14. Checklist de puesta en marcha

- [ ] Crear `cms.up10.cl` con PHP 8.3, SSL y MySQL.
- [ ] Instalar WordPress y fijar zona horaria `America/Santiago`.
- [ ] Configurar enlaces permanentes.
- [ ] Instalar ACF Pro y activar la licencia.
- [ ] Subir y activar `up10-core` y el tema mínimo.
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

## 15. Pendientes

- [ ] Confirmar licencia ACF Pro (USD 49/año).
- [ ] Definir si el newsletter usa doble opt-in desde el día uno.
- [ ] Confirmar el ID correcto de la playlist en el brief.
- [ ] Definir política de retención de snapshots (8 semanas por defecto).
- [ ] Confirmar si se usa un plugin de 2FA o se implementa en `up10-core`.
