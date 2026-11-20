# Plan de infraestructura y despliegue — UP10.CL

> **Estado:** pendiente de acceso a hPanel para ejecutar la Fase 0
> **Actualizado:** 20 de noviembre de 2026
> **Arquitectura vigente:** frontend React estático + WordPress headless en PHP
> **Ver también:** `adr/0001-cms-wordpress-headless.md`

---

## 1. Contexto

El cliente contrató un plan **Hostinger Unlimited** por 48 meses (USD 107,04 prepagados, renovación a USD 16,99/mes) sin consultarlo antes. El plan no se puede cambiar ni reembolsar, así que la solución se adapta a lo ya pagado.

**Decisión de arquitectura:** WordPress headless. PHP se ejecuta por petición y no requiere un proceso persistente, a diferencia de Strapi. Esto elimina el problema que hacía inviable el CMS anterior.

El frontend sigue siendo 100 % propio: WordPress no aporta temas, plantillas ni constructores.

---

## 2. Capacidades del plan Unlimited (v6)

Fuente: documentación oficial de Hostinger, actualizada el 21 de octubre de 2026.

| Recurso | Valor |
|---|---|
| Sitios web | Ilimitados |
| vCPU | 2 |
| RAM | 3 GB |
| Almacenamiento | 50 GB NVMe |
| Inodos | 600 000 |
| Bases de datos | 150 |
| PHP | 8.1 a 8.5 (verificar en panel) |
| MySQL | 8.x |
| WP-CLI | Sí |
| SSH / SFTP | Sí |
| Cron jobs | Ilimitados |
| Staging | Sí en Business/Unlimited |
| Backups | Diarios automáticos |
| CDN | Incluido |
| WAF / malware scanner | Sí |
| Node.js Web Apps | 5 (no se usan en esta arquitectura) |

### Limitaciones relevantes

- **Sin procesos persistentes**: no se usan workers ni colas en segundo plano. El cron cubre las tareas programadas.
- **Los deploys de Web Apps sobrescriben `hbuilds/` y `public_html`.** No aplica al CMS: WordPress se despliega como sitio PHP independiente.
- **Cron de WordPress depende de visitas.** Hay que configurar un cron real en hPanel.
- **El plan es compartido**: un plugin pesado o un pico de tráfico afecta a todos los sitios del plan.

---

## 3. Arquitectura de despliegue

| Subdominio | Qué corre | Tecnología |
|---|---|---|
| `up10.cl` / `www` | Frontend estático | React compilado en `public_html` |
| `cms.up10.cl` | WordPress + API | PHP 8.3 + MySQL |
| `staging.cms.up10.cl` | Copia de pruebas | PHP + copia de la DB |

**Flujo**

1. El editor publica en `cms.up10.cl/wp-admin`.
2. WordPress dispara un webhook a GitHub.
3. GitHub Actions compila el frontend leyendo la API.
4. El build se publica por rsync/SFTP en `public_html`.
5. Se purga la caché del CDN.

**Medios:** viven en `cms.up10.cl/wp-content/uploads/` y son persistentes. No se borran con los deploys del frontend.

---

## 4. Fase 0 — Revisión en hPanel

Ejecutar antes de escribir código. Tiempo estimado: 30–45 minutos.

| # | Verificación | Dónde | Criterio | Si falla |
|---|---|---|---|---|
| 1 | Versión de PHP | PHP Configuration | 8.3 o superior | Usar 8.2 mínimo; revisar extensiones |
| 2 | `memory_limit` | PHP Configuration | ≥ 256 MB | Subir a 512 MB para el editor |
| 3 | `upload_max_filesize` / `post_max_size` | PHP Configuration | ≥ 10 MB | Ajustar; afecta la subida de fotos |
| 4 | Extensiones | PHP Configuration | `mysqli`, `gd` o `imagick`, `mbstring`, `curl` | Sin `gd`, no hay miniaturas |
| 5 | MySQL | Databases | MySQL 8.x, acceso local | — |
| 6 | WP-CLI | SSH | `wp --info` responde | Usar el panel y SFTP |
| 7 | SSH / SFTP | Advanced → SSH | Sesión activa | Deploy por FTP |
| 8 | Staging | Panel del sitio | Disponible | Copia manual antes de actualizar |
| 9 | Cron jobs | Advanced → Cron Jobs | Disponibles, sin límite | Programaciones poco confiables |
| 10 | Retención de backups | Backups | Registrar cuántos días guarda | Respaldo propio obligatorio |
| 11 | SMTP saliente | Email | Puerto 587 permitido | Servicio transaccional externo |
| 12 | CDN | CDN | No cachea `/wp-admin` ni `/wp-json` | Excluir esas rutas |
| 13 | WAF y malware scanner | Security | Activos | Plugin de seguridad |
| 14 | Titularidad del dominio | Domains | A nombre del cliente | Corregir antes de publicar |
| 15 | Actualizaciones automáticas | WordPress | Solo seguridad en automático | Configurar por staging |

- [ ] 1. PHP 8.3+
- [ ] 2. `memory_limit` ≥ 256 MB
- [ ] 3. Subidas ≥ 10 MB
- [ ] 4. Extensiones PHP
- [ ] 5. MySQL 8
- [ ] 6. WP-CLI
- [ ] 7. SSH/SFTP
- [ ] 8. Staging
- [ ] 9. Cron jobs
- [ ] 10. Retención de backups
- [ ] 11. SMTP
- [ ] 12. CDN
- [ ] 13. WAF
- [ ] 14. Dominio
- [ ] 15. Actualizaciones

---

## 5. Fase 1 — Pruebas reales (medio día)

### Prueba 1 — WordPress responde por REST

- [ ] Instalar WordPress en `cms.up10.cl`.
- [ ] Instalar ACF Pro y el plugin `up10-core`.
- [ ] Verificar `GET /wp-json/up10/v1/home` con un endpoint de prueba.
- [ ] Confirmar que el CDN no rompe la respuesta JSON.

### Prueba 2 — Los medios persisten

- [ ] Subir una imagen por la biblioteca.
- [ ] Confirmar que se sirve por HTTPS desde el subdominio.
- [ ] Verificar que un deploy del frontend no la afecta.

### Prueba 3 — El build externo consume la API

- [ ] Ejecutar el build del frontend desde GitHub Actions apuntando a `cms.up10.cl`.
- [ ] Confirmar que el prerender genera HTML con contenido real.
- [ ] Medir el tiempo total del build.

### Prueba 4 — Backups y restauración

- [ ] Descargar un backup desde hPanel.
- [ ] Restaurar en staging.
- [ ] Confirmar que el contenido y los medios están completos.

### Puerta de decisión

| Resultado | Acción |
|---|---|
| Las 4 pruebas pasan | Despliegue normal (§6) |
| Falla staging | Copia manual antes de cada actualización |
| Falla REST por CDN/WAF | Excluir `/wp-json/*` y repetir |
| Falla PHP o MySQL | Escalar a soporte de Hostinger antes de avanzar |

---

## 6. Despliegue

### Frontend

```
push a main ──► GitHub Actions ──► build + prerender
             ──► rsync/SFTP a public_html
             └──► purga de CDN
```

**`.htaccess`**
- Fallback SPA a `index.html`.
- `Cache-Control: immutable` para `/assets/*`.
- `no-cache` para `index.html`.
- Compresión y cabeceras de seguridad.

### CMS

- Código propio (`up10-core`, tema mínimo, `acf-json/`) versionado en Git.
- Deploy por Git o SFTP; nunca editar en producción.
- Actualizaciones de core y plugins: staging → verificación → producción.
- Plugins fijados por versión y documentados.

### Hardening

- 2FA para administradores y editores.
- XML-RPC deshabilitado; edición de archivos deshabilitada.
- Registro público cerrado.
- Límite de intentos de login.
- WAF y escáner de malware activos.
- Sin plugins de diseño ni builders. Máximo 6 plugins.
- `wp-config.php` fuera del alcance de backups públicos y con permisos 600.

---

## 7. Respaldos

| Capa | Qué cubre | Frecuencia | Dónde |
|---|---|---|---|
| 1 | hPanel | Diaria | Automático |
| 2 | DB (`mysqldump`) | Diaria | Fuera de `public_html` |
| 3 | `wp-content/uploads` | Semanal | Fuera de `public_html` |
| 4 | Copia externa | Semanal | Equipo o nube |
| 5 | Prueba de restauración | Antes del lanzamiento y luego trimestral | Staging |

**Regla:** un backup que nunca se restauró no es un backup. La prueba de restauración es parte del lanzamiento, no una tarea opcional.

---

## 8. Monitoreo

- Disponibilidad del frontend y de la API (uptime externo).
- Espacio en disco e inodos.
- Errores 5xx en el CMS.
- Tiempo de respuesta de `/wp-json/up10/v1/home`.
- Alertas de actualizaciones de seguridad pendientes.

---

## 9. Riesgos operativos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Plugin desactualizado | Compromiso del CMS | Actualizaciones en staging + WAF |
| Backup sin probar | Pérdida de datos | Restauración trimestral |
| Cron de WP sin visitas | Posts programados no salen | Cron real en hPanel cada 5 min |
| Crecimiento de uploads | Consumo de los 50 GB | Compresión y limpieza de originales |
| Pico de tráfico | 503 en el CMS | Frontend estático absorbe el tráfico |
| Correo marcado como spam | Newsletter no llega | SMTP autenticado + ESP externo |

---

## 10. Próximos pasos

1. Ejecutar la Fase 0 al recuperar el acceso a hPanel.
2. Crear `cms.up10.cl` y `staging.cms.up10.cl`.
3. Ejecutar la Fase 1 antes del Sprint 1.
4. Documentar credenciales en un gestor, nunca en el repositorio.
