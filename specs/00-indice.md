# Especificaciones — UP10.CL

Índice de las specs de desarrollo. Cada documento es la fuente de verdad para su área; si el código y la spec difieren, la spec se actualiza primero.

| # | Documento | Estado | Alcance |
|---|---|---|---|
| 00 | `00-indice.md` | Borrador | Este índice |
| 01 | `01-modelo-de-contenido.md` | Borrador | Tipos de contenido, taxonomías, campos y reglas editoriales |
| 02 | `02-contrato-api.md` | Borrador | Endpoints, formas de respuesta, caché y errores |

**Documentos relacionados**

- `docs/brief_creativo_y_tecnico_up10cl.md` — fuente de verdad del cliente
- `docs/plan-desarrollo-up10.md` — plan, arquitectura y sprints
- `docs/plan-infraestructura-hostinger.md` — hosting, despliegue y respaldos
- `docs/adr/0001-cms-wordpress-headless.md` — decisión de CMS

**Convenciones**

- Los campos en `snake_case` corresponden a nombres internos de WordPress/ACF.
- La API expone `camelCase`.
- Las fechas son ISO 8601 en UTC.
- Todo texto pasa por sanitización antes de llegar al navegador.
- Ningún requerimiento del brief puede quedar sin spec, aceptación y sprint asignado.
