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
│   │   ├── content-types.php
│   │   ├── fields.php
│   │   ├── media.php
│   │   ├── serializers.php
│   │   ├── rest.php
│   │   └── hardening.php
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

| Endpoint | Uso |
|---|---|
| `GET /ping` | Health check |
| `GET /home` | Portada agregada |
| `GET /posts` | Archivo con filtros y paginación |
| `GET /posts/{slug}` | Artículo |
| `GET /categories` | Categorías |
| `GET /events` | Eventos |
| `GET /events/{slug}` | Evento |
| `GET /top10` | Ranking |
| `GET /partners` | Marcas |
| `GET /pages/{slug}` | Páginas institucionales |
| `GET /search?q=` | Buscador |

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
- Los grupos que se editen desde el admin se exportan a `acf-json/`.
- El tema `up10-headless` redirige cualquier vista pública a `https://up10.cl`.
- WP-CLI funciona para la mayoría de los comandos. Hostinger tiene `proc_open`
  deshabilitado en PHP 8.3, así que `wp db export` y comandos que lanzan procesos
  externos pueden fallar; usar backups de hPanel o el PHP 8.4/8.5 CLI.
