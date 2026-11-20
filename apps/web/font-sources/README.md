# Tipografías

Todas las fuentes se autohospedan. No se carga nada desde Google Fonts en
runtime.

## Integral CF

Licencia web del cliente. Los archivos originales en OTF viven en:

```
apps/web/font-sources/integral-cf/
```

No se sirven al navegador: son la fuente de verdad para regenerar los WOFF2.

Los archivos web, ya convertidos, están en:

```
apps/web/public/fonts/integral-cf/
```

Se incluyen los 12 estilos (6 pesos upright + 6 oblicuos). El navegador solo
descarga los que usa; `DemiBold` se precarga por ser el peso de los titulares.

### Regenerar los WOFF2

Si el cliente entrega una versión nueva:

```bash
cd apps/web/font-sources/integral-cf
for f in *.otf; do woff2_compress "$f"; done
mv *.woff2 ../../public/fonts/integral-cf/
```

`woff2_compress` viene del paquete `woff2` de Arch. Convierte de ~29 KB a
~16 KB por archivo y mantiene los contornos CFF.

### Pesos

| Archivo | `font-weight` | `font-style` |
|---|---|---|
| Regular / RegularOblique | 400 | normal / italic |
| Medium / MediumOblique | 500 | normal / italic |
| DemiBold / DemiBoldOblique | 600 | normal / italic |
| Bold / BoldOblique | 700 | normal / italic |
| ExtraBold / ExtraBoldOblique | 800 | normal / italic |
| Heavy / HeavyOblique | 900 | normal / italic |

No subir la versión de demostración de Fontspring.

## Anton

`@fontsource/anton`. Según el brief se usa en subtítulos, categorías,
destacados y aperturas de sección.

## Gelasio — texto de lectura

`@fontsource-variable/gelasio` (variable 400–700 + itálicas).

Es la alternativa libre más cercana a Georgia, la fuente que usa Billboard en
el cuerpo de sus notas: Google la describe como métricamente compatible con
Georgia, así que ocupa el mismo ancho por carácter y el fallback no produce
reflow.

Stack: `"Gelasio", Georgia, "Times New Roman", serif`.

No se usa Carrois Gothic: venía del export de Figma y no está en el brief.
