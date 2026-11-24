# Especificaciones — UP10.CL

Índice de las specs de desarrollo. Cada documento es la fuente de verdad para su área; si el código y la spec difieren, la spec se actualiza primero.

| # | Documento | Estado | Alcance |
|---|---|---|---|
| 00 | `00-indice.md` | Vigente | Este índice |
| 01 | `01-modelo-de-contenido.md` | Borrador | Tipos de contenido, taxonomías, campos y reglas editoriales |
| 02 | `02-contrato-api.md` | Borrador | Endpoints, formas de respuesta, caché y errores |
| 03 | `03-sistema-de-componentes.md` | Aprobado | Primitivas, header, menú, cards, movimiento y accesibilidad |
| 04 | `04-portada-responsive.md` | Aprobado | Composición de la portada bloque por bloque |
| 05 | `05-datos-de-prueba-y-estados.md` | Aprobado | Mocks, estados vacíos, skeletons y rutas stub |
| 06 | `06-wordpress.md` | Borrador | Plugin propio, SCF, API, Spotify, cron, seguridad y despliegue |

**Documentos relacionados**

- `docs/brief_creativo_y_tecnico_up10cl.md` — fuente de verdad del cliente
- `docs/plan-desarrollo-up10.md` — plan, arquitectura y sprints
- `docs/plan-infraestructura-hostinger.md` — hosting, despliegue y respaldos
- `adr/0001-cms-wordpress-headless.md` — decisión de CMS
- `adr/0002-tipografias.md` — sistema tipográfico
- `adr/0004-titulares-secundarios.md` — caja y fuente de los titulares
- `adr/0005-senales-editoriales.md` — última hora y etiquetas editoriales
- `adr/0006-movimiento-gsap-lenis.md` — scroll suave y animaciones
- `adr/0007-secure-custom-fields.md` — SCF en lugar de ACF Pro

**Convenciones**

- Los campos en `snake_case` corresponden a nombres internos de WordPress/SCF.
- La API expone `camelCase`.
- Las fechas son ISO 8601 en UTC.
- Todo texto pasa por sanitización antes de llegar al navegador.
- Ningún requerimiento del brief puede quedar sin spec, aceptación y sprint asignado.
