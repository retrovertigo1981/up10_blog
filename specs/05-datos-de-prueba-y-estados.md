# Spec 05 — Datos de prueba, estados y rutas stub

> **Estado:** borrador para revisión
> **Versión:** 0.1 — 20 de noviembre de 2026
> **Depende de:** `specs/02-contrato-api.md`, spec 03 y spec 04

---

## 1. Alcance

Define cómo se maqueta sin depender de WordPress: datos ficticios tipados, imágenes de reemplazo, estados de carga/vacío/error, y las rutas provisionales para que el menú no lleve a 404.

**Decisión confirmada:** hasta que el cliente entregue contenido real se usa **lorem ipsum**, con longitudes realistas para no validar un diseño irreal.

---

## 2. Capa de mock

```
apps/web/app/mocks/
├── home.ts          # payload completo de portada
├── posts.ts         # artículos
├── events.ts
├── tracks.ts
├── partners.ts
├── instagram.ts
└── pages.ts

apps/web/app/lib/
├── api.ts           # cliente real
└── mock-api.ts      # misma interfaz, devuelve fixtures
```

- Activación: `VITE_USE_MOCKS=true`. Por defecto `true` en desarrollo y `false` en build de producción.
- `mock-api.ts` implementa **la misma firma** que `createApiClient`, así el cambio es de una línea.
- Los fixtures se tipan con `@up10/api-client`; si el contrato cambia, falla la compilación.
- Sin llamadas de red externas: ni imágenes ni fuentes remotas. Los tests deben ser deterministas.
- Los fixtures no se incluyen en el bundle de producción (import dinámico o exclusión por variable de entorno).

---

## 3. Contenido lorem con longitudes reales

| Campo | Regla |
|---|---|
| Título | 40–90 caracteres; incluir al menos 2 casos de 100–110 |
| Extracto (`dek`) | 120–240 caracteres |
| Cuerpo | 3–6 párrafos de 400–700 caracteres |
| Slug | `kebab-case`, sin acentos |
| Autor | 3 autores ficticios con bio breve |
| Categoría | Distribuidas entre las 8 del brief |
| Etiquetas | 3–6 por artículo |

**Volumen de los fixtures**

| Recurso | Cantidad |
|---|---|
| Artículos | 10 (3 para el hero, 1 con última hora, 3 entrevistas, 1 reportaje) |
| Eventos | 3 próximos + 2 pasados |
| TOP 10 | 10 canciones |
| Instagram | 10 publicaciones |
| Marcas | 10 (nombres reales del brief, logo placeholder) |
| Cifras | 3 |
| Páginas | 4 (unplugged, podcast, awards, nosotros) |

**Regla de texto:** el lorem debe incluir acentos, ñ, signos de apertura (¿ ¡) y palabras largas del español, para validar cortes de línea y tipografía real.

---

## 4. Imágenes de reemplazo

- Archivos locales en `apps/web/public/mocks/`, generados como SVG con la proporción correcta y la etiqueta del slot (`HERO 3:2`, `CARD 16:9`, `IG 1:1`).
- Paleta: `wine` sobre `cream`, sin fotografía.
- Tamaños simulados: 1600, 800 y 400 px de ancho para construir `srcset` realista.
- Nunca se usan servicios externos de placeholders: rompen los tests y añaden latencia.
- Cada imagen lleva `alt` descriptivo ficticio, salvo las decorativas.

---

## 5. Estados

### 5.1 Carga

- Skeleton con la forma exacta del bloque (mismas proporciones), no spinner global.
- `aria-busy="true"` en la región.
- Animación de pulso desactivada con `prefers-reduced-motion`.
- Sin retraso artificial: si la respuesta llega en 50 ms, el skeleton no se muestra.

### 5.2 Error

- Error por bloque: mensaje breve + botón "Reintentar".
- Error de portada completa: bloque centrado con CTA a recargar.
- El error nunca expone detalles técnicos; el código va a la consola en desarrollo.
- `role="alert"` solo en errores que aparecen tras una acción del usuario.

### 5.3 Próximamente (diseñado, no un hueco)

Componente `ComingSoon` con tres variantes:

| Variante | Uso | Composición |
|---|---|---|
| `band` | Unplugged, hero sin contenido | Full-bleed `wine`, titular Anton 64 px, descripción, CTA `inverse` |
| `card` | Podcast, Awards, TOP 10 vacío | Tarjeta `cream`, borde vino 1 px, badge "Próximamente", título y CTA |
| `inline` | Instagram, bloques menores | Fila compacta con texto y enlace |

Reglas:

- Siempre incluye una acción: Instagram, YouTube, Spotify o contacto. Nunca un callejón sin salida.
- Copy en español, tono de marca, sin signos de exclamación.
- Badge "PRÓXIMAMENTE" en Anton 12 px, tracking `.12em`, fondo `wine`, texto `cream`, radio 6 px.
- Accesible: el badge es texto, no imagen.
- No se usa para ocultar errores: un error es un error.

### 5.4 Matriz por bloque

| Bloque | Carga | Vacío | Error |
|---|---|---|---|
| Stats | Skeleton 3 columnas | Ocultar ítems faltantes | Ocultar bloque |
| Hero (3 slides) | Skeleton 5/7 | `ComingSoon band` | `ComingSoon band` |
| Bento | Skeleton 6 tarjetas | `ComingSoon card` | Error inline con reintento |
| TOP 10 | Skeleton lista | `ComingSoon card` + Spotify | Error inline |
| Entrevistas | Skeleton 3 tarjetas | Ocultar | Ocultar |
| Instagram | Skeleton 10 piezas | `ComingSoon inline` con CTA | `ComingSoon inline` |
| Unplugged | Skeleton banda | `ComingSoon band` | Ocultar |
| Podcast/Awards | Skeleton 2 tarjetas | Siempre `ComingSoon card` | No aplica |
| Marcas | Skeleton marquesina | Ocultar | Ocultar |
| Newsletter | Sin skeleton | Siempre visible | Error del formulario |

---

## 6. Rutas stub

Para que la navegación no lleve a 404 durante el desarrollo:

| Ruta | Contenido provisional |
|---|---|
| `/noticias` | Título + grilla con fixtures |
| `/categoria/:slug` | Título dinámico + grilla filtrada |
| `/entrevistas` | Grilla con fixtures |
| `/eventos` | Lista con fixtures |
| `/top10` | Ranking con fixtures |
| `/nosotros` | `ComingSoon band` |
| `/unplugged` | `ComingSoon band` |
| `/podcast` | `ComingSoon card` |
| `/awards` | `ComingSoon card` |
| `/buscar` | Input deshabilitado + copy |
| `/contacto` | Enlaces a correo y WhatsApp |
| `/privacidad`, `/terminos` | Texto provisional |

- Todas las rutas stub usan el layout real (header y footer).
- Se marcan `noindex` hasta tener contenido definitivo, salvo `/noticias` y `/categoria`.
- Se implementan como rutas reales, no como páginas en blanco: el objetivo es validar navegación.

---

## 7. Paso a la API real

1. El equipo de WordPress expone `/wp-json/up10/v1/home`.
2. Se ejecuta el frontend con `VITE_USE_MOCKS=false` y `VITE_API_URL` apuntando al CMS.
3. Se comparan los fixtures con la respuesta real campo por campo.
4. Se corrigen diferencias en `specs/02` antes de tocar componentes.
5. Los fixtures se conservan para tests E2E y desarrollo offline.

**Criterio de salida:** la portada renderiza igual con mocks y con API real, salvo el contenido.

---

## 8. Aceptación

- `pnpm dev` funciona sin WordPress ni conexión a internet.
- Los tests E2E corren contra mocks, sin depender del CMS.
- El bundle de producción no contiene los fixtures.
- Todas las rutas del menú responden con el layout completo.
- Los estados vacíos y de error se pueden ver desde `/styleguide`.

---

## 9. Pendientes

- [ ] Confirmar si los fixtures se quedan permanentemente o se eliminan al lanzar (recomendado: conservarlos para tests).
- [ ] Definir copy definitivo de los estados "Próximamente".
- [ ] Confirmar si las rutas stub se publican en el lanzamiento o quedan ocultas.
