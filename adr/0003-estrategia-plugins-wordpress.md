# ADR 0003 — Estrategia de plugins de WordPress

- **Estado:** aceptada; actualizada por ADR 0007
- **Fecha:** 20 de noviembre de 2026
- **Relacionado:** ADR 0001 (WordPress headless), ADR 0007 (Secure Custom Fields), `specs/06-wordpress.md`

> **Actualización (23 de noviembre de 2026):** ACF Pro se reemplaza por **Secure Custom Fields (SCF)** por restricción presupuestaria del cliente. Ver `adr/0007-secure-custom-fields.md`.

---

## Contexto

WordPress se usa solo como CMS headless. El frontend es React estático y consume una API propia.

La tentación habitual es resolver todo con plugins: SEO, caché, seguridad, formularios, Instagram, Spotify, campos, etc. Eso reduce el código propio, pero agrega dependencias que no controlamos, actualizaciones que rompen el sitio y una superficie de ataque considerable.

La alternativa opuesta —un plugin propio para todo— implica reconstruir la UI de campos, que es justamente donde un field builder aporta valor.

## Decisión

1. **Un plugin propio, `up10-core`**, concentra toda la lógica del dominio: CPTs, taxonomías, endpoints, serializadores, Spotify, newsletter, preview, rebuild y hardening.
2. **Secure Custom Fields (SCF)** es el único plugin de terceros relevante, para los campos editoriales. Es gratuito y GPL.
3. **No se instalan** page builders, suites SEO, caché, seguridad, formularios, feeds de Instagram ni plugins de Spotify.

## Alternativas

| Alternativa | Veredicto |
|---|---|
| Todo con plugins de terceros | Descartada: dependencias, licencias y superficie de ataque |
| Todo con código propio (sin field builder) | Descartada: reconstruir field builder, repeater y galería cuesta semanas |
| ACF Pro | Descartada por presupuesto; el cliente no puede asumir la licencia |
| **Secure Custom Fields (SCF)** | **Elegida**: fork gratuito de ACF, GPL, con repeater, galería y options pages |
| Laravel + Filament | Ya descartado en ADR 0001 por tiempo y experiencia editorial |

## Consecuencias

**Positivas**

- Control total del payload y del contrato de API.
- Menos plugins que actualizar y auditar.
- Sin dependencia de licencias: SCF es GPL.
- El código viaja en Git y se prueba en staging.

**Negativas y mitigaciones**

| Riesgo | Mitigación |
|---|---|
| Mantener código propio | Tests, revisiones y documentación en `specs/06` |
| SCF deja de mantenerse | Los datos quedan en `postmeta` estándar; se puede migrar a meta nativa |
| Reprogramar funcionalidades que un plugin hacía | Se implementan solo las necesarias; nada de “por si acaso” |
| Seguridad | Hardening propio + WAF de Hostinger + backups |

## Regla operativa

Un plugin nuevo solo entra si cumple las tres condiciones:

1. Resuelve algo que no podemos hacer razonablemente en `up10-core`.
2. Tiene licencia compatible y mantenimiento activo.
3. Se puede desactivar sin dejar el sitio inutilizable.

Si no cumple las tres, se implementa en el plugin propio o se resuelve en el frontend.
