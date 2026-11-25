# UP10 CMS

WordPress headless para `api.up10.cl`. El frontend vive en `apps/web` y consume la API
`/wp-json/up10/v1`.

Guía replicable para otros proyectos headless:
[`guides/wordpress-headless-playbook.md`](../../guides/wordpress-headless-playbook.md).

## Requisitos

- WordPress 7.x.
- PHP 8.1+.
- Secure Custom Fields (SCF) activo.
- WP-CLI para tareas de mantenimiento.
- Acceso SSH/SFTP al hosting.

## Estructura

```text
apps/cms/
├── plugin/up10-core/
│   ├── up10-core.php
│   ├── includes/
│   │   ├── admin.php
│   │   ├── cli.php
│   │   ├── content-types.php
│   │   ├── fields.php
│   │   ├── media.php
│   │   ├── serializers.php
│   │   ├── rest.php
│   │   └── hardening.php
│   ├── assets/
│   │   └── editor.js
│   └── acf-json/
├── theme/up10-headless/
└── scripts/
```

## Despliegue

Ajusta usuario, host y ruta. En Hostinger la ruta actual es:

```bash
/home/u498829325/domains/api.up10.cl/public_html
```

Subir plugin y tema:

> **Antes de desplegar:** si editaste grupos de campos desde el admin, respalda
> `wp-content/plugins/up10-core/acf-json/`. El comando con `--delete` elimina los
> archivos que no estén en el repo.

```bash
rsync -avz --delete \
  apps/cms/plugin/up10-core/ \
  USUARIO@HOST:~/domains/api.up10.cl/public_html/wp-content/plugins/up10-core/

rsync -avz --delete \
  apps/cms/theme/up10-headless/ \
  USUARIO@HOST:~/domains/api.up10.cl/public_html/wp-content/themes/up10-headless/
```

Instalar Secure Custom Fields y activar el plugin y el tema:

```bash
cd ~/domains/api.up10.cl/public_html
wp plugin install secure-custom-fields --activate
wp plugin activate up10-core
wp theme activate up10-headless
wp rewrite flush
```

## API

| Endpoint             | Uso                              |
| -------------------- | -------------------------------- |
| `GET /ping`          | Health check                     |
| `GET /home`          | Portada agregada                 |
| `GET /posts`         | Archivo con filtros y paginación |
| `GET /posts/{slug}`  | Artículo                         |
| `GET /categories`    | Categorías                       |
| `GET /events`        | Eventos                          |
| `GET /events/{slug}` | Evento                           |
| `GET /top10`         | Ranking                          |
| `GET /partners`      | Marcas                           |
| `GET /pages/{slug}`  | Páginas institucionales          |
| `GET /search?q=`     | Buscador                         |

## Flujo editorial

El editor solo necesita cuatro pasos:

1. Escribir el titular y el contenido. **El primer párrafo se usa como bajada**; no hace falta escribirla de nuevo.
2. Subir la imagen principal (obligatoria: sin ella la nota no aparece en la API).
3. Elegir la sección y el formato. Si la sección es “Entrevistas”, el formato se marca solo.
4. Marcar “Última hora” solo si corresponde y publicar.

La bajada manual, la galería, los videos, los relacionados y el SEO son opcionales. El SEO se genera automáticamente desde el titular, la bajada y la imagen principal. Las etiquetas y las señales adicionales están ocultas hasta que el frontend las use.

En el listado de notas se muestran miniatura, sección, formato y si es última hora. El editor tiene un checklist “Antes de publicar” y un widget de ayuda en el escritorio.

## Imágenes

- El editor sube JPG/PNG como siempre. `up10-core` genera versiones WebP del archivo original y de cada tamaño (`up10-cover`, `up10-card`, `up10-square`, `up10-thumb` y los tamaños de WordPress).
- Los originales se mantienen como fallback. El API expone `webp.src` y `webp.srcset`; el frontend usa `<picture>` y el navegador elige WebP cuando lo soporta.
- La imagen OG se genera como **JPEG 1200×630** desde la portada o desde la imagen OG del SEO. WhatsApp exige una imagen bajo 600 KB; el JPEG queda muy por debajo.
- Las imágenes nuevas se limitan a 2000 px de lado mayor (`big_image_size_threshold`).

Convertir las imágenes que ya existen (WP-CLI, desde `public_html`):

```bash
wp up10 webp --limit=50 --offset=0 --dry-run
wp up10 webp --limit=50 --offset=0
```

Repetir subiendo el `offset` hasta terminar. Usar `--force` para regenerar las que ya tengan WebP. El comando solo escribe sidecars; no borra ni reemplaza originales.

Si el servidor no soporta WebP, el plugin no genera los sidecars y el sitio sigue funcionando con los originales. Verificar con `wp_image_editor_supports` o con la extensión GD/Imagick de PHP.

## Verificación

```bash
curl https://api.up10.cl/wp-json/up10/v1/ping
curl https://api.up10.cl/wp-json/up10/v1/home
curl https://api.up10.cl/wp-json/up10/v1/categories
```

El frontend debe apuntar a:

```env
VITE_API_URL=https://api.up10.cl/wp-json/up10/v1
VITE_USE_MOCKS=false
```

## Notas

- `up10-core` registra CPTs y taxonomías en código.
- SCF aporta la UI de campos; los grupos base están en `includes/fields.php`.
- La clasificación editorial (sección, formato y última hora) se edita con metaboxes propios en la barra lateral. `assets/editor.js` oculta los paneles nativos de categorías, etiquetas y extracto en el editor de bloques para evitar duplicados.
- El primer párrafo del contenido se usa como bajada si no hay una bajada manual.
- Los grupos que se editen desde el admin se exportan a `acf-json/`.
- El tema `up10-headless` redirige cualquier vista pública a `https://up10.cl`.
- WP-CLI funciona para la mayoría de los comandos. Hostinger tiene `proc_open`
  deshabilitado en PHP 8.3, así que `wp db export` y comandos que lanzan procesos
  externos pueden fallar; usar backups de hPanel o el PHP 8.4/8.5 CLI.
