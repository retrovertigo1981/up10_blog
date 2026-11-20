# ADR 0001 — CMS: WordPress headless en lugar de Strapi

- **Estado:** aceptada
- **Fecha:** 20 de noviembre de 2026
- **Decisores:** Sebastián, Alejandro, cliente UP10
- **Reemplaza:** decisión previa de Strapi v5 + MySQL

---

## Contexto

El plan contratado es **Hostinger Unlimited** (compartido), con 2 vCPU, 3 GB de RAM, 50 GB NVMe, PHP, MySQL, SSH, WP-CLI y cron. No se puede cambiar ni reembolsar.

La arquitectura original usaba **Strapi v5**, que requiere un proceso Node.js persistente. Aunque el plan declara soporte para Web Apps Node, en la práctica el proceso compite por un cupo de 120 procesos compartidos, se suspende por inactividad (cold start) y depende de builds pesados en un entorno con memoria limitada. El equipo concluyó que **no es una base confiable** para el CMS de producción.

El cliente pidió explícitamente **evitar WordPress** al inicio del proyecto, pero esa restricción estaba motivada por el uso de plantillas y page builders que limitaban el diseño. Un WordPress **headless** no usa temas, plantillas ni constructores: solo expone contenido por API.

## Decisión

Usar **WordPress como CMS headless** en `cms.up10.cl`, y un **frontend React estático** en `up10.cl`.

- WordPress solo se usa como backend de contenido y panel editorial.
- El frontend es 100 % propio: React, Tailwind y componentes escritos desde cero.
- No se instalan temas públicos, page builders ni plugins de diseño.
- El contenido se consume por REST desde endpoints propios, no por `wp/v2` crudo.

## Por qué esto resuelve el problema real

PHP se ejecuta **por petición** bajo LiteSpeed. No hay proceso persistente, no hay cold start y no consume el cupo de procesos Node. El único costo es CPU/RAM por request, que para un panel editorial es irrelevante.

Además, el plan contratado está optimizado para WordPress: WP-CLI, actualizaciones, staging, WAF y backups diarios.

## Alternativas evaluadas

| Alternativa | Viabilidad en el plan | Veredicto |
|---|---|---|
| **WordPress headless** | Alta: PHP nativo, ecosistema editorial maduro | **Elegida** |
| Strapi v5 | Baja: proceso Node persistente, cold start, límite de procesos | Descartada |
| **Laravel + Filament** | **Alta**: PHP no requiere proceso persistente; composer, artisan y cron funcionan | Viable, no elegida |
| EmDash | Baja: requiere Node y soporte de tiempo real; sin MySQL | Descartada |
| CMS basado en Git (Decap, Keystatic) | Alta, pero sin base de datos | Descartada: el brief exige BD |

### Sobre Laravel

La premisa "si no podemos ejecutar cómputo, Laravel topa con lo mismo que Node" **no es correcta**: Node necesita un proceso vivo; PHP no. Laravel funciona en hosting compartido con docroot en `public/`, cron para el scheduler y colas en modo `sync` o por cron.

Se descarta por razones de proyecto, no técnicas:

- Requiere construir el panel editorial (Filament es una herramienta de desarrollador, no una experiencia editorial para el cliente).
- Implica desarrollar a mano SEO, revisiones, medios, roles y programación de publicaciones.
- Suma 4–6 semanas frente a WordPress.
- El brief exige que el equipo de UP10 administre contenido **sin depender de los desarrolladores**.

Laravel queda como opción si en el futuro el proyecto migra a VPS y se prioriza control total sobre el CMS.

## Consecuencias

### Positivas

- Elimina el riesgo de procesos y cold start.
- Panel editorial probado, con programación de publicaciones, revisiones y roles nativos.
- Medios persistentes en el subdominio del CMS: desaparece el problema de archivos borrados en cada deploy.
- El frontend sigue siendo 100 % libre y propio.
- Menor tiempo de desarrollo del CMS.

### Negativas y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Superficie de ataque de WordPress | Hardening, 2FA, WAF, actualizaciones, XML-RPC deshabilitado, staging |
| Dependencia de plugins | Máximo 6 plugins, todos auditados y fijados por versión |
| Payload pesado de la REST API | Endpoints propios agregados; nunca `_embed` en producción |
| HTML de Gutenberg difícil de mapear a React | Set acotado de bloques permitidos + sanitización |
| Costo de ACF Pro | USD 49/año (licencia Personal) |
| SEO duplicado entre WP y el frontend | Una sola fuente: campos SEO expuestos por la API |

## Notas

- El cliente ya tiene licencia operativa de **Integral CF** para web.
- La tipografía de lectura sigue pendiente de decisión (ver plan de desarrollo §7.3).
- Este ADR no cambia el requisito de "frontend libre": lo refuerza.
