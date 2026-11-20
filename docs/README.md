# Documentación — UP10.CL

Punto de entrada a la documentación del proyecto.

| Documento | Qué contiene |
|---|---|
| `brief_creativo_y_tecnico_up10cl.md` | Brief del cliente. **Fuente de verdad** del alcance y la identidad. |
| `plan-desarrollo-up10.md` | Arquitectura, stack, specs funcionales y plan de sprints. |
| `plan-infraestructura-hostinger.md` | Hosting, despliegue, respaldos y hardening. |
| `../adr/0001-cms-wordpress-headless.md` | Por qué WordPress headless y no Strapi ni Laravel. |
| `../adr/0002-tipografias.md` | Sistema tipográfico: Integral CF, Anton y Gelasio. |
| `../adr/0003-estrategia-plugins-wordpress.md` | Por qué plugin propio + ACF y no una suite de plugins. |
| `../specs/00-indice.md` | Índice de especificaciones. |
| `../specs/01-modelo-de-contenido.md` | Tipos de contenido, campos, taxonomías y reglas editoriales. |
| `../specs/02-contrato-api.md` | Endpoints, respuestas, caché, CORS y errores. |
| `../specs/03-sistema-de-componentes.md` | Primitivas, header, menú, cards, movimiento y accesibilidad. |
| `../specs/04-portada-responsive.md` | Composición de la portada bloque por bloque. |
| `../specs/05-datos-de-prueba-y-estados.md` | Mocks, estados vacíos, skeletons y rutas stub. |
| `../specs/06-wordpress.md` | Construcción del CMS: plugin `up10-core`, ACF, Spotify y seguridad. |
| `codigo_demo.txt` | Export de Figma. **Solo referencia visual**, no se reutiliza. |

**Código**

- `../apps/web` — frontend React (ver su README para comandos).
- `../packages/api-client` — tipos y cliente de la API.
- `../.opencode/skills/modern-web-guidance` — skill de buenas prácticas web.

**Orden de lectura sugerido:** brief → plan de desarrollo → specs → infraestructura.

**Regla de trabajo:** si el código y una spec difieren, primero se actualiza la spec. Ninguna funcionalidad se implementa sin un ID en `plan-desarrollo-up10.md` §4.
