# Code Map - M-CNT

**Última actualización:** 2025-11-07
**Total de objetos:** 20

---

## Base de Datos

| OBJ ID | Tipo | Nombre | Schema | Ruta | Líneas |
|--------|------|--------|--------|------|--------|
| `OBJ-DB-CNT-IDX-IDX-MARIE-CONTENT-GRADE-LEVELS-GIN` | index | `idx_marie_content_grade_levels_gin` | content_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/content_management/indexes/01-idx_marie_content_grade_levels_gin.sql` | 26 |
| `OBJ-DB-CNT-IDX-IDX-MARIE-CONTENT-KEYWORDS-GIN` | index | `idx_marie_content_keywords_gin` | content_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/content_management/indexes/02-idx_marie_content_keywords_gin.sql` | 26 |
| `OBJ-DB-CNT-UNKN-01-POLICIES` | unknown | `01-policies` | content_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/content_management/rls-policies/01-policies.sql` | 119 |
| `OBJ-DB-CNT-TRG-CONTENT-TEMPLATES` | trigger | `content_templates` | content_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/content_management/tables/01-content_templates.sql` | 90 |
| `OBJ-DB-CNT-TRG-MARIE-CURIE-CONTENT` | trigger | `marie_curie_content` | content_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/content_management/tables/02-marie_curie_content.sql` | 89 |
| `OBJ-DB-CNT-TRG-MEDIA-FILES` | trigger | `media_files` | content_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/content_management/tables/03-media_files.sql` | 125 |
| `OBJ-DB-CNT-IDX-CONTENT-VERSIONS` | index | `content_versions` | content_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/content_management/tables/04-content_versions.sql` | 44 |
| `OBJ-DB-CNT-IDX-FOR` | index | `for` | content_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/content_management/tables/05-flagged_content.sql` | 45 |
| `OBJ-DB-CNT-TRG-TRG-CONTENT-TEMPLATES-UPDATED-AT` | trigger | `trg_content_templates_updated_at` | content_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/content_management/triggers/08-trg_content_templates_updated_at.sql` | 15 |
| `OBJ-DB-CNT-TRG-TRG-MARIE-CURIE-CONTENT-UPDATED-AT` | trigger | `trg_marie_curie_content_updated_at` | content_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/content_management/triggers/09-trg_marie_curie_content_updated_at.sql` | 15 |
| `OBJ-DB-CNT-TRG-TRG-MEDIA-FILES-UPDATED-AT` | trigger | `trg_media_files_updated_at` | content_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/content_management/triggers/10-trg_media_files_updated_at.sql` | 15 |

---

## Backend

| OBJ ID | Tipo | Nombre | Ruta |
|--------|------|--------|------|
| `OBJ-BE-CNT-CTRL-CONTENT-TEMPLATES-CONTROLLER` | controller | `content-templates.controller` | `content/controllers/content-templates.controller.ts` |
| `OBJ-BE-CNT-CTRL-MARIE-CURIE-CONTENT-CONTROLLER` | controller | `marie-curie-content.controller` | `content/controllers/marie-curie-content.controller.ts` |
| `OBJ-BE-CNT-CTRL-MEDIA-FILES-CONTROLLER` | controller | `media-files.controller` | `content/controllers/media-files.controller.ts` |
| `OBJ-BE-CNT-SVC-CONTENT-TEMPLATES-SERVICE` | service | `content-templates.service` | `content/services/content-templates.service.ts` |
| `OBJ-BE-CNT-SVC-MARIE-CURIE-CONTENT-SERVICE` | service | `marie-curie-content.service` | `content/services/marie-curie-content.service.ts` |
| `OBJ-BE-CNT-SVC-MEDIA-FILES-SERVICE` | service | `media-files.service` | `content/services/media-files.service.ts` |
| `OBJ-BE-CNT-ENT-CONTENT-TEMPLATE-ENTITY` | entity | `content-template.entity` | `content/entities/content-template.entity.ts` |
| `OBJ-BE-CNT-ENT-MARIE-CURIE-CONTENT-ENTITY` | entity | `marie-curie-content.entity` | `content/entities/marie-curie-content.entity.ts` |
| `OBJ-BE-CNT-ENT-MEDIA-FILE-ENTITY` | entity | `media-file.entity` | `content/entities/media-file.entity.ts` |

---

## Frontend

| OBJ ID | Tipo | Nombre | Ruta |
|--------|------|--------|------|