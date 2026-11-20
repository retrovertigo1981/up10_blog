# ADR 0002 — Sistema tipográfico

- **Estado:** aceptada
- **Fecha:** 20 de noviembre de 2026
- **Decisores:** Sebastián, Alejandro, cliente UP10
- **Relacionado:** `docs/brief_creativo_y_tecnico_up10cl.md` §06, ADR 0001

---

## Contexto

El brief define tres roles tipográficos:

1. **Titulares:** Integral CF.
2. **Subtítulos, categorías y destacados:** Anton.
3. **Textos de lectura:** "el diseñador podrá proponer una tipografía complementaria de alta legibilidad".

El cliente tiene como referencia principal a **Billboard**. Su CSS declara:

```
--font-family-body: Georgia, Times New Roman, serif;
--font-family-primary: Crystal Ultra Condensed Bold;  /* propietaria */
--font-family-accent: azeret-mono;
```

Es decir, el cuerpo de Billboard usa **Georgia**, una fuente de sistema, y su display es una familia propietaria que no se puede licenciar.

Restricciones del proyecto:

- Las fuentes de lectura deben estar disponibles en **Google Fonts**.
- Integral CF ya está licenciada por el cliente y se carga manualmente.
- Anton sí está en Google Fonts y el brief la exige.

## Decisión

| Rol | Fuente | Origen | Licencia |
|---|---|---|---|
| Titulares y tarjetas | Integral CF | Licencia del cliente | Comercial |
| Secciones, etiquetas y destacados | Anton | Google Fonts | OFL |
| Texto de lectura | **Gelasio** | Google Fonts | OFL |

Stack de lectura: `"Gelasio", Georgia, "Times New Roman", serif`.

## Por qué Gelasio

Google la describe como *"metrics compatible with Georgia in its Regular, Bold, Italic and Bold Italic weights"*. No es una aproximación visual: **ocupa el mismo ancho por carácter**, así que un texto maquetado en Georgia mantiene los cortes de línea al cambiar de fuente.

| Criterio | Georgia | Gelasio |
|---|---|---|
| Licencia | Propietaria, no autohospedable | OFL 1.1 |
| Métricas | — | Idénticas en Regular/Bold/Itálica/Bold Itálica |
| Pesos | Varios | Variable 400–700 + itálicas |
| Cifras | Old-style | Old-style y lining, proporcionales y tabulares |
| Cobertura | Latin, cirílico, griego | Latin, latin-ext, vietnamita |

Similitud estimada: 94 %, por encima de Merriweather (90 %) y Lora (85 %).

Ventajas adicionales:

- Resuelve la diferencia entre Windows, macOS y Android, donde Georgia no existe y cae a Noto Serif con otro ancho.
- Se autohospeda con `@fontsource-variable/gelasio`, sin depender de Google Fonts en runtime.
- El fallback a Georgia no produce reflow por la compatibilidad de métricas.

## Alternativas descartadas

| Opción | Motivo |
|---|---|
| **Georgia** | Es la referencia, pero es propietaria: no se puede autohospedar y en Android no existe. |
| **Newsreader** | Excelente serif editorial, pero no es la más cercana a Georgia; el criterio del cliente fue la similitud. |
| **Merriweather** | 90 % de similitud, pero x-height más grande y peso visual más alto. |
| **Lora** | 85 %; se aleja en estructura. |
| **Inter** | Rompe la referencia serif y se siente más "producto" que "revista". |
| **Carrois Gothic** | Venía del export de Figma, no del brief. Baja legibilidad en párrafos largos. |

## Consecuencias

- Tres familias en total, coherentes con los tres roles del brief.
- Gelasio **no incluye kerning**, decisión del autor para mantener la compatibilidad métrica. No afecta al cuerpo de texto; los titulares usan Integral CF.
- Sin cirílico ni griego, irrelevante para un medio en español.
- Se elimina Carrois Gothic de dependencias, tokens y documentación.
- El radio de 10 px del brief reemplaza los 15/5 px del export de Figma.

## Implementación

- `@fontsource-variable/gelasio` para lectura (variable + itálicas).
- `@fontsource/anton` para secciones y etiquetas.
- Integral CF en `/public/fonts/integral-cf/` con `@font-face` manual.
- Tokens: `--font-display`, `--font-heading`, `--font-reading`.
- Titulares en Integral CF **Bold (700)**; botones en 600; Anton en 400.
