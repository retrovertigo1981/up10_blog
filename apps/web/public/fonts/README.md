# Tipografías

## Integral CF

El cliente cuenta con la licencia web. Los archivos se colocan en:

```
/public/fonts/integral-cf/
├── IntegralCF-DemiBold.woff2
└── IntegralCF-DemiBold.woff
```

Cuando estén disponibles, descomentar el bloque `@font-face` en
`app/styles/fonts.css`. Mientras tanto, el sistema usa `Archivo Black` como
sustituto visual, declarado como fallback en el token `--font-display`.

No subir archivos de la versión de demostración de Fontspring.

## Anton y Carrois Gothic

Se instalan con Fontsource (`@fontsource/anton`, `@fontsource/carrois-gothic`)
y se autohospedan en el build. No se cargan desde Google Fonts.

## Lectura

`--font-reading` apunta a Newsreader, pendiente de decisión con el cliente
(ver plan de desarrollo §7.3). Hasta entonces el cuerpo usa Carrois Gothic.
