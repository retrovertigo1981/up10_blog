# Tipografías

## Integral CF

El cliente cuenta con la licencia web. Los archivos se colocan en:

```
/public/fonts/integral-cf/
├── IntegralCF-DemiBold.woff2
└── IntegralCF-DemiBold.woff
```

Cuando estén disponibles, descomentar el bloque `@font-face` en
`app/styles/fonts.css` y ajustar `font-weight` según los pesos licenciados
(DemiBold suele ser 600). Mientras tanto, el sistema usa `Archivo Black` como
sustituto visual, declarado como fallback en el token `--font-display`.

No subir archivos de la versión de demostración de Fontspring.

## Anton

Se instala con `@fontsource/anton` y se autohospeda en el build. Según el brief
se usa en subtítulos, categorías, destacados y elementos informativos.

## Gelasio — texto de lectura

Se instala con `@fontsource-variable/gelasio` (variable 400–700 + itálicas).

Es la alternativa libre más cercana a Georgia, la fuente que usa Billboard en
el cuerpo de sus notas: Google la describe como métricamente compatible con
Georgia, así que ocupa el mismo ancho por carácter y el fallback no produce
reflow.

Stack: `"Gelasio", Georgia, "Times New Roman", serif`.

No se usa Carrois Gothic: venía del export de Figma y no está en el brief.
