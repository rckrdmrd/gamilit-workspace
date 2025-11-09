# Schema: content_management

Gestión de contenido: plantillas, archivos media, metadatos

## Estructura

- **tables/**: 8 archivos
- **enums/**: 1 archivos
- **triggers/**: 3 archivos
- **indexes/**: 2 archivos
- **rls-policies/**: 1 archivos

**Total:** 15 objetos

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

### enums/ (1 archivos)

```
content_type.sql
```

### triggers/ (3 archivos)

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

---

**Última actualización:** 2025-11-09
**Reorganización:** 2025-11-09
