# _MAP: content_management/

**Ultima actualizacion:** 2026-01-14
**Estado:** Produccion
**Tipo:** Domain/Content
**Objetos activos:** 18

---

## Proposito

Gestion de contenido: plantillas, archivos media, metadatos.
Incluye sistema de moderacion y versionado de contenido.

**Audiencia:** Backend Developers, Content Team

## Estructura

- **tables/**: 8 archivos
- **enums/**: 4 archivos (content_status, content_type, media_type, processing_status)
- **triggers/**: 2 archivos activos (incluye 00-batch_updated_at_triggers.sql consolidado)
- **triggers/_deprecated/**: 3 archivos (triggers updated_at individuales)
- **indexes/**: 2 archivos
- **rls-policies/**: 1 archivos

**Total:** 18 objetos

## Contenido Detallado

### tables/ (8 archivos)

```
01-content_templates.sql
02-marie_curie_content.sql
03-media_files.sql
04-content_versions.sql
05-flagged_content.sql
content_authors.sql
content_categories.sql
media_metadata.sql
```

### enums/ (4 archivos)

```
content_status.sql
content_type.sql
media_type.sql
processing_status.sql
```

### triggers/ (2 archivos activos)

```
00-batch_updated_at_triggers.sql  # CONSOLIDADO: content_templates, marie_curie_content, media_files
03-trg_auto_moderate.sql
```

### triggers/_deprecated/ (3 archivos)

```
08-trg_content_templates_updated_at.sql
09-trg_marie_curie_content_updated_at.sql
10-trg_media_files_updated_at.sql
```

### indexes/ (2 archivos)

```
01-idx_marie_content_grade_levels_gin.sql
02-idx_marie_content_keywords_gin.sql
```

### rls-policies/ (1 archivos)

```
01-policies.sql
```

## Consolidacion de Triggers (2026-01-07)

Triggers de `updated_at` consolidados en `00-batch_updated_at_triggers.sql`:
- `content_templates_updated_at`
- `marie_curie_content_updated_at`
- `media_files_updated_at`

Archivos originales movidos a `triggers/_deprecated/`.

---

**Ultima actualizacion:** 2026-01-07
**Cambios recientes:**
- SINCRONIZACION: media_type agregado 'animation' para alineación con Backend/Frontend (2026-01-07)
- CONSOLIDACION BD: Triggers updated_at consolidados (2026-01-07)
- Correccion: Actualizado conteo de ENUMs (1→4) y total de objetos (15→18)
