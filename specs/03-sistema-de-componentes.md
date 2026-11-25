# Spec 03 — Sistema de componentes y navegación

> **Estado:** borrador para revisión
> **Versión:** 0.1 — 20 de noviembre de 2026
> **Depende de:** `docs/plan-desarrollo-up10.md` §7 y §11, `adr/0002-tipografias.md`

---

## 1. Alcance

Define las primitivas visuales reutilizables, la cabecera con su menú, el pie y las reglas de movimiento y accesibilidad. No define el layout de la portada: eso está en la spec 04.

## 2. Decisiones ya tomadas

| Tema | Decisión |
|---|---|
| Logo de cabecera | Wordmark horizontal (PNG 2946×1462) mientras no exista el vectorial |
| Paleta de cabecera | **Fondo vino `#57000B` con logo blanco** (ver §4.1) |
| Navegación primaria | 6 ítems visibles en desktop |
| Ítems secundarios | Menú hamburguesa animado |
| Tipografías | Integral CF (display), Anton (secciones/etiquetas), Gelasio (texto) |
| Radios | 10 px |

---

## 3. Retícula y breakpoints

| Token | Valor |
|---|---|
| Contenedor máximo | 1600 px |
| Padding lateral | `clamp(20px, 3.5vw, 56px)` |
| Columnas | 12 |
| Gap | 24 px desktop · 16 px móvil |
| Breakpoints | `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536` |

Regla: ningún componente define anchos fijos en píxeles. Todo se expresa en columnas, `clamp()` o `minmax()`.

---

## 4. Primitivas

### 4.1 Header

**Por qué vino:** el logo disponible es blanco sobre transparente. Sobre papel o crema sería invisible. El vino da contraste AA con el blanco (≈ 12:1) y refuerza la identidad.

| Elemento | Especificación |
|---|---|
| Fondo | `--color-wine` |
| Borde inferior | 1 px `cream` al 15 % |
| Altura | 88 px desktop · 72 px móvil |
| Logo | Wordmark blanco, altura 32 px desktop / 28 px móvil, ancho máximo 180 px |
| Enlaces | Integral CF 13 px, tracking `.1em`, uppercase, color `cream` |
| Hover de enlace | `cream` al 70 % + subrayado 2 px con offset 6 px |
| Botón "Más" | Ícono hamburguesa 24 px + texto opcional, `aria-expanded`, `aria-controls` |
| Buscar | Ícono 20 px con `aria-label="Buscar"` |
| Suscribirse | Fondo `cream`, texto `wine`, radio 10 px, alto 40 px |
| Sticky | Sí, `top: 0`, `z-index: 50` |
| Al hacer scroll | Se agrega sombra suave `0 2px 12px rgba(0,0,0,.18)` a partir de 24 px |

**Fallback cuando llegue el logo vectorial en vino:** se podrá invertir a cabecera `paper` con logo vino. La spec se actualiza entonces.

**Responsive**

| Rango | Contenido visible |
|---|---|
| ≥ 1024 | Logo · 6 enlaces · Más · Buscar · Suscribirse |
| 768–1023 | Logo · Buscar · Suscribirse · Hamburguesa (todo el menú) |
| < 768 | Logo · Buscar · Hamburguesa; Suscribirse dentro del panel |

**Aceptación:** navegable por teclado; el logo tiene texto alternativo "UP10, ir a la portada"; el header no tapa el foco al hacer scroll.

### 4.2 Menú hamburguesa (panel de navegación)

Contiene los ítems secundarios: Lanzamientos, Industria musical, Cultura y entretenimiento, Playlist, Unplugged, Podcast, Awards, Nosotros, Contacto.

| Aspecto | Especificación |
|---|---|
| Disparador | Botón hamburguesa, siempre visible |
| Panel | Desde la derecha; 100 % de ancho en móvil, 420 px en desktop |
| Fondo | `wine`; texto `cream` |
| Estructura | Logo · enlaces primarios (solo móvil) · separador · secundarios · redes · CTA newsletter |
| Tipografía de enlaces | Anton 32 px móvil / 28 px desktop |
| Animación de entrada | Panel `translateX(100%) → 0`, 260 ms, `cubic-bezier(.22,1,.36,1)` + contenido en stagger con GSAP |
| Animación de salida | Contenido en reversa ~300 ms y luego cierre del diálogo |
| Backdrop | Negro al 40 %, fade 200 ms |
| Navegación | Subrayado animado en hover, foco y ruta activa |
| Scroll del header | Sombra suave a partir de 24 px de scroll |
| Cierre | Esc, clic en backdrop, botón X, clic en un enlace |
| Scroll | Se bloquea el body mientras está abierto |
| Foco | Trap dentro del panel; al cerrar vuelve al disparador |
| Semántica | `role="dialog"` `aria-modal="true"` `aria-label="Menú de navegación"` |
| Movimiento reducido | Sin desplazamiento; aparece y desaparece con opacidad |

No se usa blur ni filtros pesados.

### 4.2.1 HeroCarousel

- Recibe las 3 noticias más recientes y las muestra en un track horizontal con `scroll-snap`.
- Autoplay cada 6 s; se pausa al hover y al foco. Sin botón de pausa (decisión del cliente).
- Con `prefers-reduced-motion` no avanza solo; la navegación manual sigue disponible.
- Barras abajo a la izquierda: la activa combina color y escala; objetivo táctil ≥ 24 px.
- Slider inactivo con `inert` para que no reciba foco.
- Un `h1` oculto por página; los titulares de cada slide son `h2`.
- Primera imagen con `fetchpriority="high"`; las otras con `lowPriority` y lazy.

Comportamiento completo en spec 04 §3.3.

### 4.3 Search overlay

- Se abre desde el ícono de búsqueda; input autofocus con `label` visible.
- Cierre con Esc; resultados se agregan en el Sprint 3.
- Mientras no exista buscador, el overlay muestra "Escribe al menos 3 caracteres" deshabilitado y un enlace a `/buscar`.

### 4.4 SectionHeading

| Propiedad | Valor |
|---|---|
| Fuente | Anton |
| Desktop | 80 px / 0.95, uppercase |
| Tablet | 56 px |
| Móvil | 42 px |
| Eyebrow opcional | Anton 14 px, tracking `.12em`, color vino |
| Acción opcional | Enlace "Ver archivo →" alineado a la derecha, 15 px |
| Ancho | `max-width: 14ch` para forzar quiebre elegante en palabras largas |

### 4.5 Button

| Variante | Fondo | Texto | Borde |
|---|---|---|---|
| `primary` | `wine` | `cream` | — |
| `secondary` | transparente | `wine` | 1 px `wine` |
| `inverse` | `cream` | `wine` | — |
| `ghost` | transparente | `wine` | — (subrayado) |

- Altura mínima 44 px (táctil), padding `12px 20px`, radio 10 px.
- Tipografía Integral CF 13 px, peso 600, tracking `.08em`, uppercase.
- Estados: hover (oscurece 8 % o invierte), focus-visible (anillo vino 3 px, offset 3 px), disabled (50 % opacidad, `cursor: not-allowed`), loading (spinner 16 px + `aria-busy`).

### 4.6 CategoryLabel

Anton 18–25 px, tracking `.05em`, uppercase, color vino. En fondos oscuros usa `cream`. Es un enlace a `/categoria/:slug`.

### 4.7 Image

- Componente propio, nunca `<img>` suelto.
- Props: `src`, `srcSet`, `sizes`, `alt` obligatorio, `ratio` (`1:1`, `4:3`, `16:9`, `3:2`), `priority`, `lowPriority`, `focalPoint`.
- `loading="lazy"` y `decoding="async"` por defecto; `priority` desactiva lazy y agrega `fetchpriority="high"`; `lowPriority` agrega `fetchpriority="low"` para slides ocultos.
- `focalPoint` se aplica como `object-position`, para que la misma foto funcione en hero (3:2) y bento (recorte).
- Placeholder: fondo `wine` al 10 % con el ratio correcto, sin layout shift.
- Si falta `alt`, el componente falla en desarrollo.

### 4.8 ArticleCard

Integral CF es una fuente **caps-only**: sus glifos de caja baja son formas de caja alta. Por eso se reserva para los titulares destacados; los titulares secundarios usan Anton y respetan la caja de oración del contenido.

| Variante | Uso | Imagen | Título |
|---|---|---|---|
| `hero` | Portada, nota principal | 3:2, full-bleed | Integral CF 42 px, uppercase |
| `overlay` | Bento de portada | Fondo completo con degradado | Anton 22–44 px, caja de oración |
| `feature` | Grillas editoriales | 4:3 | Anton 28 px, caja de oración |
| `standard` | Grillas y relacionados | 16:9 | Anton 24 px, caja de oración |
| `compact` | Listas | 1:1, 80 px | Anton 17 px, caja de oración |

La última hora se muestra solo en el hero. Las tarjetas del bento, entrevistas y archivo no aplican mayúsculas ni insignia de última hora; usan siempre Anton en caja de oración.

Reglas de caja:

- El contenido se escribe en caja de oración; los nombres propios conservan sus mayúsculas.
- No se usa `text-transform: lowercase`: rompería nombres propios, siglas y marcas.
- Anton se aplica con `font-normal` para evitar negritas sintéticas, porque solo tiene peso 400.

La variante `overlay` coloca categoría, título y "LEER MÁS →" dentro de la tarjeta, sobre un degradado de negro a vino. No lleva texto fuera de la imagen. La tarjeta es un contenedor de consulta (`container-type: inline-size`) y el tamaño del título se calcula con `cqi`, de modo que se adapta al ancho real de cada pieza del mosaico.

Anatomía: imagen → categoría → título → dek (opcional) → meta.
Hover: imagen `scale(1.03)` en 300 ms, título subrayado.
Meta: autor · fecha · tiempo de lectura, Gelasio 14 px, `ink` al 60 %.

### 4.9 EventRow

- Fondo degradado `#000 → #57000B`, radio 10 px, texto `cream`.
- Desktop: fecha rotada 90° en bloque de 120 px, hora, título Anton 24 px, recinto + ciudad, botón "Entradas".
- Móvil: fecha horizontal (día + mes), sin rotación.
- Sin `ticketUrl`: botón deshabilitado con texto "Próximamente".

### 4.10 TrackRow

- Posición 01–10 en Anton 28 px, ancho fijo 48 px.
- Portada 1:1 de 64 px, radio 6 px.
- Título Integral CF 18 px, artista Gelasio 15 px al 70 %.
- Enlace a Spotify con `aria-label` "Escuchar {título} en Spotify".
- Hover: fondo `cream` al 8 %.

### 4.11 NewsletterForm

- Input con `label` visible, tipo `email`, `autocomplete="email"`.
- Botón `inverse`.
- Checkbox de consentimiento obligatorio con enlace a `/privacidad`.
- Estados: idle, enviando, éxito ("Revisa tu correo"), error (mensaje en `role="alert"`), honeypot oculto.

### 4.12 Footer

- 4 columnas desktop: marca · secciones · UP10 · redes.
- Móvil: acordeón o columnas apiladas; se prefiere apilado simple.
- Incluye contacto, WhatsApp, legales y copyright dinámico.

---

### 4.13 StatsBar

- Barra compacta bajo el header, 48–56 px.
- Cifras en Anton 20–22 px y etiquetas cortas de 11 px.
- Iconos sociales a la derecha con `SocialLinks`; sin texto visible, con `aria-label`.
- Los contadores animan al entrar en viewport, salvo que `Stat.animated === false`.
- El año 2018 se muestra fijo desde el primer render, también en SSR, sin pasar por cero.
- Con `prefers-reduced-motion`, todas las cifras aparecen fijas.

### 4.14 PartnerMarquee

- Banda full-bleed vino con dos filas de logos crema.
- Fila 1 hacia la izquierda y fila 2 hacia la derecha, a velocidades distintas.
- Pausa al hover y al foco; se decidió no mostrar un botón de pausa visible.
  **Deuda de accesibilidad:** no cumple estrictamente WCAG 2.2.2; queda documentado.
- Movimiento reducido: grilla estática con todos los logos, sin animación.
- Hasta 50 marcas desde el CMS; si falta el logo, se usa el nombre.

### 4.15 SocialLinks

- Iconos de marca desde `@icons-pack/react-simple-icons` (MIT): Instagram, TikTok, Facebook, YouTube.
- Objetivo de 40×40 px, `aria-label` por red y `rel="noreferrer noopener"`.
- Variante horizontal (barra de cifras) y vertical (footer).

### 4.16 Iconografía de interfaz

- `lucide-react` (ISC) para UI: buscar, menú, pausa, flechas, calendario.
- No se dibujan SVG a mano. Ambas librerías son tree-shakeables.

## 5. Movimiento

| Token | Valor |
|---|---|
| `--duration-fast` | 150 ms |
| `--duration-base` | 220 ms |
| `--duration-slow` | 300 ms |
| `--ease-out` | `cubic-bezier(.22,1,.36,1)` |
| `--ease-in` | `cubic-bezier(.4,0,1,1)` |

### 5.1 Scroll suave y animaciones de contenido

- **Lenis** gestiona el scroll suave en desktop. En touch se conserva el scroll nativo (`syncTouch: false`).
- **GSAP + ScrollTrigger** gestionan revelados y parallax. Se sincronizan con el ticker de GSAP y con Lenis.
- Patrones base: fade-up corto, revelado de imagen y stagger de tarjetas. Un parallax muy sutil solo en imágenes grandes de desktop.
- El hero se anima solo con transformaciones: no se oculta el titular ni la imagen para no afectar el LCP.
- Los elementos sobre el pliegue no se ocultan al cargar.
- Las animaciones de entrada usan `once: true`; no se repiten al volver a entrar en viewport.
- El menú lateral anima su contenido en stagger al abrir y en reversa al cerrar; los enlaces tienen subrayado animado y estado activo.
- El cambio de slide del hero anima solo el contenido del slide activo.
- Las navegaciones internas hacen una entrada corta de `main`; la carga inicial no se anima.
- El header agrega una sombra suave al hacer scroll.

### 5.2 Reglas

- Solo se animan `transform`, `opacity` y `clip-path`.
- Nada de animación en `width`, `height`, `top` o `left`.
- `prefers-reduced-motion: reduce` desactiva Lenis, ScrollTrigger, parallax, marquesina y contadores; el contenido queda visible y estático.
- Los diálogos detienen Lenis mientras están abiertos y el panel con scroll interno usa `data-lenis-prevent`.
- Los cambios de ruta refrescan ScrollTrigger; las navegaciones nuevas vuelven arriba y el back/forward conserva la restauración nativa.
- No se usan plugins premium de GSAP ni ScrollSmoother: Lenis cumple el scroll suave.

---

## 6. Accesibilidad

- Un solo `h1` por página; jerarquía sin saltos.
- Foco visible en todos los interactivos (anillo vino 3 px).
- Objetivos táctiles ≥ 44×44 px.
- Contraste AA en texto normal y grande.
- Landmarks: `header`, `nav`, `main`, `footer`; `aria-label` en navegaciones.
- Imágenes decorativas con `alt=""`; informativas con descripción real.
- Formularios con `label` asociado y errores anunciados.
- `SkipLink` al contenido, ya implementado.

---

## 7. Pendientes

- [ ] Vectorial del logo horizontal en vino, crema y negro.
- [ ] Confirmar si "Más" muestra texto o solo ícono en desktop.
- [ ] Definir si el buscador será overlay o página en desktop.
- [ ] Confirmar copy del CTA de newsletter.
- [ ] **Deuda — Reportajes:** el formato `reportaje` existe en WordPress y en el contrato de API, pero no tiene enlace, listado ni entrada de navegación en el frontend. Definir si se agrega al menú/buscador, se promueve a sección o se elimina del modelo. No bloquea la Fase 3.
