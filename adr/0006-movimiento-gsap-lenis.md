# ADR 0006 — Movimiento con GSAP + Lenis

- **Estado:** aceptada
- **Fecha:** 23 de noviembre de 2026
- **Decisores:** Sebastián, Alejandro, cliente UP10
- **Relacionado:** `specs/03-sistema-de-componentes.md` §5

---

## Contexto

El brief pide animaciones suaves, elegantes y de web premium, sin distraer del contenido. El cliente pidió mejorar el scroll y sumar animaciones de contenido con GSAP + Lenis.

La aplicación es React Router con SSR/prerender. Las animaciones no pueden romper la hidratación, el LCP, el scroll por teclado, los diálogos nativos ni `prefers-reduced-motion`.

## Decisión

- **Lenis** para scroll suave en desktop. En touch se mantiene el scroll nativo (`syncTouch: false`).
- **GSAP + ScrollTrigger** para revelados, stagger y un parallax corto en imágenes grandes de desktop.
- Lenis se sincroniza con el ticker de GSAP y con `ScrollTrigger.update`.
- El hero se anima solo con transformaciones; no se oculta el titular ni la imagen para no afectar el LCP.
- Los elementos visibles al cargar no se ocultan. Solo se preparan para revelado los que están bajo el pliegue.
- `prefers-reduced-motion: reduce` no monta Lenis y no ejecuta animaciones; el contenido queda visible.
- Los diálogos detienen Lenis; el panel con scroll interno usa `data-lenis-prevent`.
- No se usa ScrollSmoother ni plugins premium: Lenis cubre el scroll y GSAP cubre el resto.

## Consecuencias

- Se suma un chunk de GSAP/ScrollTrigger y un pequeño runtime de Lenis; hay que vigilar el presupuesto de JS.
- Los cambios de ruta deben refrescar ScrollTrigger y coordinarse con `ScrollRestoration`.
- Las animaciones se limitan a `transform`, `opacity` y `clip-path`; nada de propiedades de layout.
- El movimiento acompaña al contenido: duraciones cortas, un solo parallax y sin efectos repetidos.
