# Spec 04 — Portada responsive

> **Estado:** borrador para revisión
> **Versión:** 0.1 — 20 de noviembre de 2026
> **Depende de:** spec 03 (componentes), `docs/plan-desarrollo-up10.md` §10

---

## 1. Alcance

Define la composición de la portada bloque por bloque: retícula, proporciones, límites de datos, comportamiento responsive, prioridad de carga y estado vacío. Los componentes se especifican en la spec 03.

## 2. Reglas generales

- La portada se compone en una retícula de **12 columnas** con gap de 24 px (16 px en móvil).
- Ningún bloque usa posicionamiento absoluto ni alturas fijas en píxeles.
- Los anchos máximos se expresan en `ch` para el texto y en columnas para el layout.
- Cada bloque es independiente: si falla su datos, muestra su estado vacío o de error sin tumbar el resto.
- El orden móvil se define por bloque; no se hereda automáticamente del desktop.

**Breakpoints:** `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`.

---

## 3. Bloques

### 3.1 Header

- Sticky, 88 px desktop / 72 px móvil.
- Contenido y comportamiento en spec 03 §4.1.
- **Prioridad:** alta; no debe provocar CLS.

### 3.2 UP10 en números (barra compacta)

| Aspecto | Desktop | Móvil |
|---|---|---|
| Alto | 48–56 px | 48–56 px |
| Fondo | `paper`, borde inferior vino al 15 % | Igual |
| Cifra | Anton 20–22 px | Anton 16–18 px |
| Etiqueta | 11 px uppercase, `ink` al 60 % | 10 px |
| Redes | 4 iconos a la derecha, 40 px de objetivo | Igual |

- Va inmediatamente debajo del header. Las cifras animan al entrar en viewport, salvo que la cifra tenga `animated: false`.
- Cifras: `+136.000 seguidores · +27M visualizaciones · desde 2018`.
- El año 2018 se muestra fijo desde el primer render, también en SSR, sin conteo ni parpadeo.
- Con `prefers-reduced-motion`, todas las cifras aparecen fijas.
- Iconos de Instagram, TikTok, Facebook y YouTube como enlaces, sin texto visible, con `aria-label`.
- En móvil se permite que las cifras ocupen dos líneas; los iconos se mantienen visibles.
- **Vacío:** se ocultan los ítems faltantes; si no hay ninguno, no se renderiza.
- El énfasis editorial de las cifras se traslada a la sección Nosotros.

### 3.3 Hero (carrusel)

Carrusel con las **3 noticias principales**. Si hay una noticia marcada como **Última hora**, entra primera y se completa con las más recientes hasta 3. Sin última hora, se comporta como antes: las 3 más recientes. Avanza solo cada 6 segundos; el usuario navega con las barras.

| Aspecto | Desktop | Tablet | Móvil |
|---|---|---|---|
| Columnas | Texto 5 · Imagen 7 | Texto 5 · Imagen 7 | 1 col |
| Imagen | 3:2 | 3:2 | 3:2 |
| Titular | Integral CF 42 px, uppercase | 36 px, uppercase | 30 px, uppercase |
| Extracto | Gelasio 20 px | 19 px | 17 px |
| Altura mínima | 560 px | 480 px | auto |

- **Track nativo** con `scroll-snap-type: x mandatory`; sin flechas.
- **3 barras** abajo a la izquierda. La activa se distingue por color y escala.
- **Sin botón de pausa** (decisión del cliente). Se detiene al hover y al foco; con `prefers-reduced-motion` no avanza.
- Slides inactivos con `inert`.
- Un `h1` oculto por página; los titulares de cada slide son `h2`.
- Los titulares del hero se muestran en mayúsculas con Integral CF. La noticia de última hora lleva insignia.
- **Imagen:** la primera con `fetchpriority="high"`; las otras con `low` y lazy.
- **Vacío:** "Próximamente" variante `band`.

### 3.4 Ticker — eliminado

Se retiró la franja de titulares bajo el hero por decisión del cliente.

### 3.5 Bento de noticias

9 artículos: el hero ya ocupa el primero. El mosaico replica la composición de Figma en dos columnas iguales. Los titulares del bento usan Anton en caja de oración, respetando nombres propios. La última hora vive solo en el hero; el bento no muestra insignia ni mayúsculas de breaking.

```
Desktop (2 columnas)
┌──────────────────────┬──────────────────────┐
│                      │   ancha (300 px)     │
│   grande (640 px)    ├──────────┬───────────┤
│                      │ pequeña  │ pequeña   │
│                      │ (316 px) │ (316 px)  │
├──────────────────────┼──────────────────────┤
│   ancha (280 px)     │   ancha (280 px)     │
├──────────┬───────────┴──────────┬───────────┤
│  220 px  │        220 px        │  220 px   │
└──────────┴──────────────────────┴───────────┘
```

Todas las tarjetas usan la variante `overlay`: la imagen ocupa el bloque completo y el texto va encima, sobre un degradado. La portada se lee como un collage editorial, no como una grilla de tarjetas.

| Bloque | Ancho | Altura mínima |
|---|---|---|
| Principal | 50 % (2 filas) | 640 px |
| Ancha superior | 50 % | 300 px |
| Dos pequeñas | 25 % c/u | 316 px c/u |
| Dos anchas inferiores | 50 % c/u | 280 px |
| Franja final | 33 % c/u (3 tarjetas) | 220 px |

- Los títulos escalan con **container queries** (`cqi`), no con breakpoints: la misma tarjeta funciona en 220, 317 o 658 px de ancho.
- La suma de la columna derecha (300 + 24 + 316) coincide exactamente con la principal (640), sin huecos.
- Tablet: dos columnas; la principal ocupa el ancho completo.
- Móvil: una columna; las dos pequeñas se apilan para no truncar títulos.
- Títulos limitados a 4 líneas con `line-clamp`.
- **Vacío:** "Próximamente" variante `card` en la posición principal.

### 3.6 UP10 PLAYLIST

El home muestra solo la playlist, no el ranking.

- Bloque full-bleed con degradado `#000 → #57000B`, texto `cream`.
- Desktop: 2 columnas (5/7). Izquierda: eyebrow, titular Anton, descripción y CTA "Seguir en Spotify". Derecha: **embed oficial de Spotify** (352 px de alto).
- Móvil: una columna; el embed queda debajo del CTA.
- El ranking con posiciones, movimientos y botón por canción vive en `/top10`.
- **Vacío:** si no hay playlist, no se renderiza el bloque.

### 3.6.1 Página `/top10`

- Fondo completo en `cream`, igual que el resto del sitio.
- Layout 5/7: texto a la izquierda, ranking a la derecha.
- Izquierda: eyebrow, `h1` "UP10 TOP 10", descripción y CTA a la playlist. Sticky en desktop.
- Derecha: lista de 10 canciones en una columna, con 12 px de separación.
- **Cada canción es una tarjeta** con degradado `#000 → #57000B`, radio 10 px, texto `cream`.
- Cada tarjeta muestra posición, portada, título, artista, movimiento (↑ ↓ —), badge "NUEVO" y botón de Spotify.
- Bajo la lista: "Datos de Spotify" y fecha del último sync.
- Móvil: una columna; el texto queda arriba y el ranking debajo.
- **Vacío:** `ComingSoon` variante `card` en la columna derecha.

### 3.7 Entrevistas

- 3 tarjetas de 4 columnas, ratio 16:9.
- Badge de video (ícono play) si `video` existe.
- Móvil: carrusel táctil con scroll-snap y 1 tarjeta visible.
- **Vacío:** no se renderiza si no hay entrevistas y el bloque no es obligatorio en v1.

### 3.8 Instagram

- 10 piezas en 5 columnas × 2 filas, ratio **3:4**.
- La imagen usa el archivo completo, sin el `srcset` que mezcla recortes; así no se cortan los títulos de las publicaciones.
- Móvil: 2 columnas × 5 filas, o carrusel; se elige 2 columnas por simplicidad y rendimiento.
- Botón "Ver más en Instagram" alineado a la derecha del heading.
- **Vacío:** se reemplaza por una tarjeta "Síguenos en Instagram" con CTA, no por un hueco.
- **Implementado 26/11/2026:** modo API por defecto, fallback curado, carga al montar y refresco cada 5 minutos.

### 3.9 UP10 Unplugged

- Desktop: imagen 7 col (4:3) + texto 5 col sobre `cream`.
- Titular Anton 64 px; descripción Gelasio 18 px; CTA al archivo de sesiones.
- Móvil: imagen primero, texto después.
- **Vacío:** variante `band` de "Próximamente" con CTA a Instagram y YouTube.

### 3.10 Podcast y Awards

- 2 tarjetas de 6 columnas, imagen 16:9 arriba, copy debajo.
- Badge "Próximamente" en `wine` sobre `cream`.
- Son páginas de presentación: el CTA lleva a `/podcast` y `/awards`.
- **Vacío:** no aplica; siempre muestran el estado próximamente hasta el lanzamiento.

### 3.11 Marcas

- Banda full-bleed vino, título crema y dos marquesinas de logos.
- Fila 1 ~34 px/s hacia la izquierda; fila 2 ~24 px/s hacia la derecha.
- 6 marcas por fila en el caso inicial de 12; el reparto es dinámico por índice.
- Pausa al hover y al foco. Sin control visible: deuda de accesibilidad 2.2.2.
- Movimiento reducido: grilla estática de 3 columnas móvil y 6 desktop.
- Logos desde WordPress; fallback local si la API no trae logo.
- **Vacío:** se usa el catálogo local de respaldo.

### 3.12 Newsletter

- Desktop: contenedor centrado de 8 columnas, input 70 % + botón 30 %.
- Móvil: input y botón apilados, ancho completo.
- Fondo `cream`, input negro, botón vino.
- **Siempre presente**, incluso sin contenido.

### 3.13 Footer

- 4 columnas desktop, apilado en móvil.
- Detalle en spec 03 §4.12.

---

## 4. Orden móvil

1. Header
2. Stats
3. Hero
4. Ticker
5. Bento
6. TOP 10
7. Entrevistas
8. **Unplugged** (sube antes de Instagram)
9. Instagram
10. Podcast y Awards
11. Marcas
12. Newsletter
13. Footer

Razón: Instagram no debe competir con las noticias en la primera pantalla del celular.

---

## 5. Rendimiento por bloque

| Bloque | Prioridad | Regla |
|---|---|---|
| Hero | LCP | Imagen `priority`, sin lazy; dimensión explícita |
| Stats | Media | Contador tras `IntersectionObserver` |
| Bento | Media | Lazy salvo la primera fila |
| TOP 10 | Baja | Portadas 1:1 de 64 px |
| Instagram | Baja | Lazy; 10 imágenes como máximo |
| Marcas | Baja | Logos PNG/WebP desde WordPress, lazy y con dimensiones explícitas |
| Newsletter | Baja | Sin JS hasta interacción |

Presupuesto: JS inicial < 200 KB gzip; ninguna imagen sobre el fold > 250 KB.

---

## 6. Estados

Cada bloque implementa:

- **Carga:** skeleton con la forma exacta del bloque (sin spinner).
- **Vacío:** "Próximamente" o se oculta, según §3.
- **Error:** mensaje inline con botón "Reintentar"; el resto de la página sigue operativa.

El detalle visual y de copy está en la spec 05.

---

## 7. Aceptación

- Sin scroll horizontal entre 320 y 1920 px.
- Sin CLS perceptible en el hero ni en el header.
- Todos los bloques se ven correctos con 1, 5 y 9 artículos.
- Títulos de hasta 110 caracteres no rompen la retícula.
- Navegación completa por teclado.
- Lighthouse móvil ≥ 90 con datos de prueba.

---

## 8. Pendientes

- [ ] Diseñar con más peso editorial la sección Nosotros, ahora que las cifras pasan a una barra compacta.

- [ ] Validar con el cliente la propuesta de orden móvil (Unplugged antes de Instagram).
- [ ] Confirmar si Entrevistas es obligatorio en v1.
- [x] Definir si Instagram será curado o API antes del lanzamiento. Resuelto: API por defecto, curado como fallback.
- [ ] Confirmar si el ticker pausa al tocar en móvil o se detiene permanentemente.
