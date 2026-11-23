# ADR 0004 — Titulares secundarios en Anton y caja de oración

- **Estado:** aceptada
- **Fecha:** 23 de noviembre de 2026
- **Decisores:** Sebastián, Alejandro, cliente UP10
- **Relacionado:** `adr/0002-tipografias.md`, `specs/03-sistema-de-componentes.md` §4.8, `specs/04-portada-responsive.md` §3.3 y §3.5

---

## Contexto

El cliente pidió reservar las mayúsculas completas para las noticias principales y de última hora, y usar mayúscula inicial + minúsculas en los titulares que aparecen más abajo, respetando nombres propios.

Al revisar la fuente se confirmó que **Integral CF es caps-only**: sus glifos de caja baja son formas de caja alta. Por eso todos los titulares de la portada se veían en mayúsculas aunque el contenido estuviera escrito en caja de oración.

No es posible resolver el pedido con `text-transform: lowercase`, porque rompería nombres propios, siglas y marcas.

## Decisión

| Uso | Fuente | Caja |
|---|---|---|
| Hero y noticias de última hora | Integral CF | Mayúsculas completas |
| Bento, entrevistas, archivo y relacionados | Anton | Caja de oración |
| Secciones, categorías, eyebrows y proyectos | Anton / Integral CF | Mayúsculas, sin cambios |

Reglas:

- El contenido se escribe en caja de oración; los nombres propios conservan sus mayúsculas.
- Anton se aplica con `font-normal` para evitar negritas sintéticas, porque solo tiene peso 400.
- La última hora se muestra solo en el hero; el bento y las tarjetas secundarias usan siempre Anton en caja de oración.
- No se usa `text-transform: lowercase` en ningún titular.

## Consecuencias

- La portada gana jerarquía: el hero destaca y el resto se lee con más calma.
- El editor no necesita escribir en mayúsculas desde WordPress; la decisión visual queda en el frontend.
- Los titulares secundarios cambian de familia y de métrica; hay que revisar tamaños, interlineado y `line-clamp`.
- Se actualiza la tabla de `ArticleCard` y se documenta la regla editorial en `specs/01`.
