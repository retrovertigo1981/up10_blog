# WordPress headless: manual replicable

> **Estado:** borrador operativo. Revisar y completar al finalizar la puesta en marcha de UP10.
> **Objetivo:** replicar esta arquitectura en otros proyectos sin depender del dominio, las categorías ni los campos de UP10.
> **Alcance:** WordPress como CMS/API + frontend desacoplado, despliegue, contenido, medios, seguridad y pruebas.

---

## 1. Cuándo usar WordPress headless

Usa este patrón cuando:

- El equipo editorial necesita un panel conocido, con roles, revisiones, programación y biblioteca de medios.
- El frontend debe ser propio y no estar limitado por un tema de WordPress.
- El sitio es principalmente de contenido, con tráfico de lectura y requisitos SEO.
- El hosting soporta PHP/MySQL pero no procesos Node persistentes.
- Se quiere desplegar el frontend como estático o con SSR controlado.

No lo uses si:

- El equipo no necesita panel editorial y el contenido vive en Git/Markdown.
- El proyecto exige colaboración en tiempo real o lógica transaccional compleja.
- No hay forma de mantener WordPress actualizado, respaldado y endurecido.

---

## 2. Arquitectura base

```text
Editor
  │
  ▼
WordPress admin (subdominio CMS)
  │  REST API propia (namespace /wp-json/<proyecto>/v1)
  ▼
Frontend (dominio público)
  │
  ├── build estático / prerender
  ├── SSR o ISR si el hosting lo permite
  └── imágenes y medios desde el subdominio del CMS
```

Separación recomendada:

| Pieza | Dominio | Responsabilidad |
|---|---|---|
| Frontend | `midominio.cl` | Diseño, rutas, SEO, experiencia |
| WordPress | `api.midominio.cl` o `cms.midominio.cl` | Contenido, medios, API, administración |
| Staging | `staging.api.midominio.cl` | Pruebas de actualizaciones y contenido |

No expongas el frontend de WordPress. El tema debe ser headless: sin plantillas públicas o con redirección al frontend.

---

## 3. Decisiones antes de escribir código

Cierra estas decisiones primero:

1. **Dominio del CMS/API.** Un solo subdominio para admin y REST es más simple.
2. **REST o GraphQL.** Para este patrón, REST propio suele ser más directo y fácil de cachear.
3. **Frontend.** React/Next/Remix/Astro/etc. Lo importante es que consuma el contrato y tenga estados de carga/error.
4. **Estrategia de render.** Estático con rebuild, SSR, ISR o mixto.
5. **Campos.** Secure Custom Fields (SCF), ACF Pro, Meta Box, Pods o metaboxes nativos.
6. **Medios.** ¿Se sirven desde WordPress, CDN o un storage externo?
7. **Autenticación.** Lectura pública; preview y newsletter con token/credenciales.
8. **Rebuild.** ¿Quién dispara el build cuando cambia el contenido?

---

## 4. Preparar WordPress

### 4.1 Hosting y entorno

- PHP 8.1+; idealmente 8.3.
- MySQL 8 o MariaDB compatible.
- SSL en el subdominio.
- Cron real cada 5 minutos.
- Backups automáticos y una prueba de restauración.
- Staging si el plan lo permite.
- Límites de subida suficientes para las imágenes del proyecto.
- Extensiones `gd`/`imagick`, `mbstring`, `curl`.

### 4.2 Configuración inicial

- Zona horaria y locale correctos.
- Enlaces permanentes en `/%postname%/`.
- Registro público cerrado.
- Comentarios y pingbacks cerrados si el frontend no los usa.
- “Disuadir a los motores de búsqueda” activo en el CMS.
- Usuarios con roles mínimos.
- Tema headless activo.
- No instalar page builders ni plugins innecesarios.

### 4.3 Tema headless mínimo

El tema no necesita diseño. Su trabajo es:

- Declarar soporte de `post-thumbnails` si el editor debe subir portadas.
- Redirigir las vistas públicas al frontend.
- Dejar libres `/wp-admin`, `/wp-json`, `admin-ajax.php`, `wp-cron.php` y REST.
- No renderizar plantillas.

Ejemplo:

```php
add_action( 'template_redirect', function () {
    if ( is_admin() || wp_doing_ajax() || wp_doing_cron() ) {
        return;
    }

    $uri = $_SERVER['REQUEST_URI'] ?? '';
    if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
        return;
    }
    if ( str_contains( $uri, '/wp-json' ) || isset( $_GET['rest_route'] ) ) {
        return;
    }

    wp_redirect( 'https://midominio.cl', 302 );
    exit;
} );
```

En producción, verifica que `/wp-json/` y los endpoints propios no sean interceptados por el tema ni por el CDN.

### 4.4 Constantes recomendadas

```php
define( 'WP_ENVIRONMENT_TYPE', 'production' );
define( 'WP_DEBUG', false );
define( 'DISALLOW_FILE_EDIT', true );
define( 'DISABLE_WP_CRON', true ); // Solo después de configurar cron real
define( 'WP_MEMORY_LIMIT', '256M' );
define( 'WP_MAX_MEMORY_LIMIT', '512M' );
```

No actives `DISALLOW_FILE_MODS` hasta terminar de instalar plugins/temas.

---

## 5. Estructura del repositorio

No versiones el core de WordPress, `uploads/` ni `wp-config.php`. Versiona solo el código propio.

```text
apps/cms/
├── plugin/
│   └── proyecto-core/
│       ├── proyecto-core.php
│       ├── includes/
│       │   ├── content-types.php
│       │   ├── fields.php
│       │   ├── media.php
│       │   ├── serializers.php
│       │   ├── rest.php
│       │   └── hardening.php
│       └── acf-json/
├── theme/
│   └── proyecto-headless/
├── scripts/
│   └── smoke.sh
└── README.md
```

Mapeo al servidor:

```text
apps/cms/plugin/proyecto-core/  →  wp-content/plugins/proyecto-core/
apps/cms/theme/proyecto-headless/ →  wp-content/themes/proyecto-headless/
```

Ventajas:

- El plugin viaja con Git.
- El tema es reemplazable y no contiene lógica de negocio.
- Los grupos de campos se exportan a JSON y se versionan.
- El deploy no toca el core ni los uploads.

---

## 6. Modelo de contenido y experiencia editorial

### 6.1 Principios

1. El contenido editorial vive en `post`, salvo entidades que realmente lo necesiten.
2. La diferencia entre noticia, entrevista, reportaje, etc. se modela con una taxonomía, no con CPTs separados.
3. Los CPTs se reservan para entidades: eventos, marcas, productos, personas, etc.
4. Una categoría principal por contenido.
5. Las etiquetas libres no reemplazan taxonomías de negocio.
6. Los campos obligatorios se validan antes de publicar.

### 6.2 Diseñar el editor antes de la API

Preguntas que deben responderse antes de programar:

- ¿Qué necesita cargar el editor en menos de 5 minutos?
- ¿Qué campos son obligatorios para que el frontend no se rompa?
- ¿Qué se puede calcular? Ejemplo: tiempo de lectura.
- ¿Qué debe ser una taxonomía y qué debe ser un campo?
- ¿Qué campos deben ser condicionales?
- ¿Qué imágenes necesita el frontend por formato y tamaño?

La API se diseña después del modelo, pero se valida contra el frontend desde el primer endpoint.

### 6.3 UI de taxonomías

No dejes taxonomías de negocio como campos de etiquetas libres. Usa:

- **Radio buttons** para selección única.
- **Checkboxes** para selección múltiple.
- `meta_box_cb` propio si el comportamiento por defecto de WordPress no es claro.
- Ayuda visible en el editor para explicar el uso de cada término.

### 6.4 Campos condicionales y validación

- `required` solo para lo que realmente bloquea la publicación.
- Cuidado con `min` en galerías: puede volver obligatorio un campo que debía ser opcional.
- Valida en `save_post` si SCF no bloquea la publicación.
- Muestra mensajes claros, no errores técnicos.

---

## 7. Anatomía del plugin propio

```text
proyecto-core.php       # bootstrap, constantes, hooks, activación
content-types.php       # taxonomías, CPTs, términos iniciales
fields.php              # grupos SCF/ACF, options pages, JSON
media.php               # tamaños de imagen, serialización de adjuntos
serializers.php         # WP → contrato del frontend
rest.php                # rutas, CORS, caché, respuestas
hardening.php           # XML-RPC, usuarios, cabeceras, comentarios
```

### 7.1 Bootstrap

- Define versión y rutas.
- Carga módulos.
- Registra `init`, `acf/init`, `rest_api_init`.
- En activación: registra tipos, siembra términos y hace `flush_rewrite_rules()`.
- No ejecutes lógica pesada en cada request.

### 7.2 Taxonomías y CPTs

- Regístralos en código, no desde la UI.
- Define `show_in_rest` si el editor o endpoints lo necesitan.
- Define `show_admin_column` y filtros para el equipo editorial.
- Siembra términos base en la activación sin duplicar.
- Usa `map_meta_cap` en CPTs.

### 7.3 Campos

- SCF/ACF es una dependencia de UI, no el centro del sistema.
- Los valores quedan en `postmeta`; un cambio de plugin no debe perder datos.
- Guarda una copia JSON de los grupos.
- Documenta los campos en la spec del proyecto.

### 7.4 Activación y migraciones

- La activación debe ser idempotente.
- No dependas de que el editor recuerde crear términos.
- Si cambias slugs o nombres de campos, escribe una migración explícita.
- Prueba activar/desactivar en staging.

---

## 8. Contrato de API

### 8.1 Principios

- Namespace propio: `/wp-json/<proyecto>/v1`.
- No expongas `wp/v2` como API pública del frontend.
- Nombres en `camelCase` para el frontend, aunque WordPress use `snake_case`.
- Respuestas de colección: `{ "data": [...], "meta": {...} }`.
- Errores: `{ "error": { "code": "...", "message": "..." } }`.
- Fechas ISO 8601 en UTC.
- IDs numéricos y slugs estables.

### 8.2 Endpoints típicos

| Endpoint | Uso |
|---|---|
| `GET /ping` | Health check |
| `GET /home` | Agregado de portada |
| `GET /posts` | Archivo con filtros y paginación |
| `GET /posts/{slug}` | Detalle |
| `GET /categories` | Taxonomías |
| `GET /pages/{slug}` | Páginas institucionales |
| `GET /search?q=` | Buscador |
| `POST /newsletter` | Suscripción |
| `GET /preview` | Borrador firmado |

### 8.3 Portada agregada

`/home` debe devolver todo lo necesario en una sola llamada. Ejemplo genérico:

```json
{
  "data": {
    "hero": [],
    "latest": [],
    "featured": [],
    "events": [],
    "ranking": [],
    "stats": [],
    "partners": [],
    "pages": [],
    "projects": []
  }
}
```

Evita que el frontend haga 8 llamadas para pintar la portada.

### 8.4 Paginación

```json
{
  "data": [],
  "meta": {
    "pagination": {
      "page": 1,
      "perPage": 12,
      "total": 84,
      "totalPages": 7
    }
  }
}
```

### 8.5 Caché

- `Cache-Control` corto para contenido público.
- `ETag` si el hosting lo permite.
- Purga o rebuild cuando cambia el contenido.
- Excluye `/wp-json` y `/wp-admin` del CDN.

---

## 9. Serializadores y medios

Un serializador único evita que cada endpoint invente formas distintas.

### 9.1 Reglas

- Convierte `WP_Post` a un objeto estable.
- Nunca devuelvas el objeto de WordPress crudo.
- Omite o rechaza contenido sin los campos mínimos (por ejemplo, sin imagen).
- Normaliza fechas, autores, categorías y taxonomías.
- Devuelve imágenes con `src`, `width`, `height`, `alt`, `srcset` y punto focal.
- No uses `get_the_content()` sin sanitizar.
- No confíes en que el editor completó todo: valida.

### 9.2 Imagen típica

```json
{
  "src": "https://api.midominio.cl/wp-content/uploads/2026/11/foto.jpg",
  "width": 1600,
  "height": 1067,
  "alt": "Descripción real",
  "srcset": "url 400w, url 800w, url 1600w",
  "focalPoint": "center"
}
```

- `srcset` se construye con `wp_get_attachment_image_srcset`.
- `alt` sale de la biblioteca de medios.
- El punto focal puede ser un campo del contenido y aplicarse como `object-position`.
- No devuelvas URLs locales del entorno de desarrollo.

### 9.3 Tamaños

Define tamaños explícitos según el diseño:

- portada grande,
- tarjeta,
- cuadrado,
- thumbnail.

No dependas de tamaños arbitrarios de WordPress. Documenta qué tamaño usa cada bloque.

---

## 10. Frontend desacoplado

### 10.1 Cliente tipado

- Un paquete compartido con tipos y cliente HTTP.
- Un solo lugar para construir URLs y manejar errores.
- Tipos que reflejen el contrato de la API.
- Si el contrato cambia, el frontend debe fallar en compilación o en tests.

### 10.2 Mocks primero

- El frontend debe funcionar con fixtures locales.
- `VITE_USE_MOCKS=true` o equivalente.
- Los mocks deben tener la misma forma que la API.
- Permite diseñar sin depender de WordPress.

### 10.3 Cambio a API real

- `VITE_API_URL=https://api.midominio.cl/wp-json/proyecto/v1`
- `VITE_USE_MOCKS=false`
- Reinicia el servidor de desarrollo: las variables se leen al iniciar.
- Verifica CORS si el navegador llama directo a la API.
- Si el frontend hace SSR, la petición ocurre en el servidor y CORS no aplica.

### 10.4 Estados

- Carga con skeleton, no spinner global.
- Vacío diseñado, no un hueco.
- Error por bloque, con reintento cuando sea posible.
- Nunca expongas detalles técnicos al usuario.

### 10.5 Imágenes

- Usa el `srcset` de la API.
- Define `sizes` según el layout.
- `loading="lazy"` salvo la imagen principal.
- `fetchpriority="high"` en el hero.
- Mantén proporciones para evitar CLS.

---

## 11. Estrategia de render y rebuild

### 11.1 Estático

- El build consulta la API y prerenderiza.
- Cada publicación debe disparar un rebuild.
- Ventaja: rendimiento y hosting simple.
- Riesgo: contenido desactualizado hasta el próximo build.

### 11.2 SSR/ISR

- El servidor consulta la API por request o con revalidación.
- Requiere un hosting con proceso persistente.
- Útil si el contenido cambia mucho o hay previews.

### 11.3 Híbrido

- Portada y rutas principales estáticas.
- Buscador, preview y newsletter en runtime.
- Rebuild selectivo por ruta si el hosting lo permite.

Documenta claramente qué rutas son estáticas y cuándo se reconstruyen.

---

## 12. Preview de borradores

- WordPress genera un token firmado con expiración corta.
- El frontend recibe `id` y `token`.
- El endpoint devuelve el borrador solo con token válido.
- El frontend muestra una banda “Vista previa” y `noindex`.
- Nunca expongas borradores en la API pública.

---

## 13. Newsletter y formularios

- Endpoint propio en el plugin.
- Honeypot, rate limit y validación.
- Consentimiento explícito y enlace a privacidad.
- Doble opt-in si la ley o el cliente lo exigen.
- Guarda evidencia de consentimiento.
- SMTP autenticado; no uses `mail()`.
- Exportación CSV y baja.

---

## 14. Integraciones externas

### 14.1 Spotify u otra API

- Sincronización por cron.
- Guarda el último snapshot.
- Si la API falla, conserva el último dato bueno.
- Permite edición manual como fallback.

### 14.2 Instagram

- Basic Display API está discontinuada; usa Instagram Graph API con cuenta Business/Creator.
- Requiere app de Meta, permisos y token de larga duración.
- Cron cada 15–30 minutos.
- Cachea y maneja imágenes, carruseles y videos.
- Si falla, usa contenido curado o una tarjeta CTA.

### 14.3 Regla general

Toda integración externa debe tener:

- timeout,
- caché,
- fallback,
- alerta o log,
- y una forma de desactivarla sin romper el sitio.

---

## 15. Seguridad y hardening

Checklist mínimo:

- XML-RPC deshabilitado.
- Edición de archivos deshabilitada.
- Registro público cerrado.
- Comentarios/pingbacks cerrados si no se usan.
- Enumeración de usuarios bloqueada.
- Límite de intentos de login.
- 2FA para administradores/editoriales.
- Roles mínimos.
- `wp-config.php` con permisos restrictivos.
- Secretos fuera del repo.
- WAF y escaneo de malware.
- Actualizaciones en staging.
- Backups y prueba de restauración.
- No instalar plugins sin justificación.
- No exponer la API de administración innecesariamente.

Si el cliente acepta un riesgo, documéntalo como decisión y define una mitigación. No lo escondas.

---

## 16. Despliegue

### 16.1 Código

- Plugin y tema en Git.
- Deploy por rsync/SFTP/Git.
- No editar en producción.
- Staging para actualizaciones.
- Mantén una versión anterior para rollback.

### 16.2 Base de datos y medios

- Backup antes de cambios grandes.
- `mysqldump` o phpMyAdmin si WP-CLI falla por `proc_open`.
- `tar` de `wp-content`, `wp-config.php` y `.htaccess`.
- Descarga una copia fuera del hosting.
- Prueba restaurar en staging.

### 16.3 Cron

- Configura un cron real cada 5 minutos.
- Después define `DISABLE_WP_CRON`.
- Verifica publicaciones programadas y syncs.

### 16.4 CDN

- No cachear `/wp-admin`.
- No cachear `/wp-json` sin una estrategia explícita.
- Invalidar el frontend cuando cambie contenido.

---

## 17. Pruebas

### 17.1 API

- `GET /ping`.
- `GET /home` con datos y vacío.
- `GET /posts` con paginación y filtros.
- `GET /posts/{slug}` inexistente → 404.
- Imágenes con `srcset` y `alt`.
- CORS desde el dominio del frontend.
- Cache headers.

### 17.2 Contenido

- Publicar con todos los campos.
- Publicar sin campos opcionales.
- Intentar publicar sin campos obligatorios.
- Programar una publicación.
- Revisar roles Editor/Autor.
- Probar galería vacía y con imágenes.
- Probar imagen destacada ausente.

### 17.3 Frontend

- Modo mocks.
- Modo API real.
- Estados vacío/error/carga.
- Imágenes y CLS.
- Navegación y metadatos.
- Build de producción.

### 17.4 Restauración

Un backup no probado no es un backup. Restaura en staging antes del lanzamiento.

---

## 18. Errores comunes

| Problema | Causa frecuente | Solución |
|---|---|---|
| El post no aparece en `/home` | Sin imagen destacada o sin publicar | Revisar `_thumbnail_id` y estado |
| Taxonomías sin opciones | UI por defecto de taxonomía no jerárquica | Radio/checkbox con `meta_box_cb` |
| Galería bloquea publicación | `min` configurado aunque sea opcional | Quitar `min` |
| CORS falla en local | Origen no permitido | Agregar `localhost` o proxy |
| La API funciona por curl pero no en el frontend | Env no recargado o build viejo | Reiniciar/rebuild |
| `/wp-json` redirige al frontend | Tema headless intercepta REST | Excluir `/wp-json` y `rest_route` |
| Cambios no aparecen | Build estático sin rebuild | Disparar rebuild/revalidación |
| WP-CLI falla | `proc_open` deshabilitado | Usar PHP alternativo o phpMyAdmin |
| Imágenes rotas | URL local o CDN mal configurado | Serializar URL pública |
| Token de Instagram vence | Sin refresh/cron | Renovación automática y alerta |

---

## 19. Checklist para replicar en un proyecto nuevo

### WordPress

- [ ] Subdominio, SSL, PHP, MySQL.
- [ ] WordPress instalado y actualizado.
- [ ] Zona horaria, idioma, permalinks.
- [ ] Tema headless.
- [ ] Plugin propio.
- [ ] SCF/ACF y campos.
- [ ] Taxonomías/CPTs/términos.
- [ ] Roles y usuarios.
- [ ] Cron real.
- [ ] Backups y restauración.
- [ ] Hardening.
- [ ] CDN/WAF.

### API

- [ ] Namespace.
- [ ] `/ping`.
- [ ] `/home`.
- [ ] Posts, detalle, categorías, páginas.
- [ ] Serializadores.
- [ ] Imágenes.
- [ ] CORS.
- [ ] Caché.
- [ ] Errores.
- [ ] Tests.

### Frontend

- [ ] Cliente tipado.
- [ ] Mocks.
- [ ] Cambio a API real.
- [ ] Estados.
- [ ] Imágenes.
- [ ] SEO.
- [ ] Build.
- [ ] Rebuild.

### Contenido

- [ ] Primera nota completa.
- [ ] Primera nota sin campos opcionales.
- [ ] Primera nota programada.
- [ ] Revisión editorial.
- [ ] Medios y derechos.

---

## 20. Notas específicas de UP10 y pendientes

- [ ] Revisar este manual al finalizar la configuración de UP10.
- [ ] Añadir capturas del editor SCF y del flujo de publicación.
- [ ] Documentar la decisión final de Instagram (curado/API).
- [ ] Documentar el cron real y `DISABLE_WP_CRON`.
- [ ] Documentar la política de backups y restauración.
- [ ] Añadir el procedimiento de rollback usado en producción.
- [ ] Confirmar si el frontend será estático con rebuild o SSR.
- [ ] Documentar preview de borradores cuando se implemente.

---

## 21. Regla final

El contrato de la API es el centro del sistema. WordPress es reemplazable; el frontend es reemplazable; los datos y el contrato deben sobrevivir a ambos.

Si una decisión no está escrita, no está tomada.
