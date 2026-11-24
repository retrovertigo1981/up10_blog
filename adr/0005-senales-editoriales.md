# ADR 0005 — Señales editoriales y última hora

- **Estado:** aceptada
- **Fecha:** 23 de noviembre de 2026
- **Decisores:** Sebastián, Alejandro, cliente UP10
- **Relacionado:** `specs/01-modelo-de-contenido.md` §2.4, `specs/02-contrato-api.md`, `specs/06-wordpress.md` §4

---

## Contexto

El cliente quiere que el equipo editorial pueda identificar noticias con etiquetas como “Última hora”, “Espectáculo” o “Moda”, y que una noticia de última hora se priorice en el hero.

El brief fija 8 categorías musicales y un menú aprobado. “Espectáculo” y “Moda” no forman parte de esas categorías, y “Última hora” es una urgencia, no una sección temática. Usar categorías para todo rompería el menú y obligaría a que cada artículo tuviera una sola etiqueta.

## Decisión

- La **categoría** sigue siendo una sola y define la sección principal.
- Se añade la taxonomía no jerárquica **`senal`** (“Señales editoriales”), con varios términos por artículo:
  - `ultima-hora`
  - `espectaculo`
  - `moda`
  - `exclusivo` (opcional)
  - `destacado` (opcional)
- La API expone `signals: EditorialTag[]` e `isBreaking: boolean` en `PostSummary`.
- El home prioriza la noticia con `ultima-hora` más reciente y completa el hero hasta 3 con las más recientes.
- La última hora vive **solo en el hero**: insignia y titular en mayúsculas. El bento y las tarjetas secundarias nunca aplican ese tratamiento.
- Se recomienda una sola noticia activa con `ultima-hora`. Si hay más, el hero toma la más reciente y el admin debe avisar para desmarcar las demás.
- En el MVP la señal no expira automáticamente: el editor la desmarca. La expiración automática queda para fase 2.

## Alternativas descartadas

| Opción | Motivo |
|---|---|
| Usar `category` para “Espectáculo” y “Moda” | Rompe las 8 categorías del brief y obliga a una sola temática por artículo |
| Usar solo `post_tag` | Mezcla artistas, géneros y urgencia; complica filtros y curación |
| Campo SCF booleano aislado | No permite varias señales ni archivo por etiqueta; el modelo taxonómico es más duradero |
| Caducidad automática en v1 | Añade cron y estados; el MVP solo necesita un checkbox manual |

## Consecuencias

- El editor asigna señales con checkboxes nativos de WordPress.
- Se pueden crear archivos por señal en el futuro sin cambiar el modelo.
- “Espectáculo” y “Moda” no aparecen en el menú; si el cliente quiere secciones, se promueven a categorías con aprobación explícita.
- La portada deja de ser estrictamente “las 3 más recientes”: una urgente puede desplazar a la tercera.
