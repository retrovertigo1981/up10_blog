# ADR 0007 — Secure Custom Fields en lugar de ACF Pro

- **Estado:** aceptada
- **Fecha:** 23 de noviembre de 2026
- **Decisores:** Sebastián, Alejandro, cliente UP10
- **Relacionado:** `adr/0003-estrategia-plugins-wordpress.md`, `specs/01-modelo-de-contenido.md`, `specs/06-wordpress.md`

---

## Contexto

El proyecto había definido ACF Pro como proveedor de campos editoriales. El cliente confirmó que no hay presupuesto para la licencia anual y pidió usar únicamente soluciones gratuitas o código propio.

El modelo de contenido necesita repeaters, galería, relacionales y options pages. Reconstruir esa UI desde cero en `up10-core` retrasaría el CMS y empeoraría la experiencia del editor.

## Decisión

Usar **Secure Custom Fields (SCF)**, fork gratuito de ACF mantenido por WordPress.org y la comunidad, con licencia GPL.

- Versión inicial: **6.9.10**.
- Compatibilidad declarada: WordPress **7.1.5**, PHP 7.4+.
- Incluye repeater, flexible content, galería, clone, options pages, campos relacionales, taxonomy, true/false e imagen.
- Soporta JSON local y comandos WP-CLI `wp scf json`.
- Los valores siguen guardándose en `postmeta`, por lo que una eventual migración a metaboxes nativos no pierde datos.

## Alternativas descartadas

| Alternativa | Motivo |
|---|---|
| ACF Pro | Tiene el costo anual que el cliente no puede asumir |
| Construir todos los campos en `up10-core` | Semanas de trabajo extra y peor experiencia editorial |
| Carbon Fields | Viable y gratuita, pero exige integrar una librería y no ofrece la UI nativa de SCF |
| Meta Box / Pods | Dependencia adicional y funciones que no necesitamos para este modelo |

## Consecuencias

- Se elimina el costo de licencia.
- Se mantiene la misma estructura de campos y la misma API.
- SCF es mantenido por comunidad: hay que fijar versión y probar actualizaciones en staging.
- Si SCF dejara de mantenerse, los datos permanecen en `postmeta` y se pueden migrar a campos nativos.
- `up10-core` sigue siendo el dueño de CPTs, taxonomías, endpoints, serializadores y hardening; SCF solo aporta la UI de campos.
