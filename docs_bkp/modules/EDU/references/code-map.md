# Code Map - M-EDU

**Última actualización:** 2025-11-07
**Total de objetos:** 24

---

## Base de Datos

| OBJ ID | Tipo | Nombre | Schema | Ruta | Líneas |
|--------|------|--------|--------|------|--------|
| `OBJ-DB-EDU-FN-CALCULATE-LEARNING-PATH` | function | `calculate_learning_path` | educational_content | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/educational_content/functions/calculate_learning_path.sql` | 99 |
| `OBJ-DB-EDU-FN-GET-RECOMMENDED-MISSIONS` | function | `get_recommended_missions` | educational_content | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/educational_content/functions/get_recommended_missions.sql` | 73 |
| `OBJ-DB-EDU-UNKN-01-ENABLE-RLS` | unknown | `01-enable-rls` | educational_content | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/educational_content/rls-policies/01-enable-rls.sql` | 23 |
| `OBJ-DB-EDU-UNKN-02-MODULES-EXERCISES-POLICIES` | unknown | `02-modules-exercises-policies` | educational_content | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/educational_content/rls-policies/02-modules-exercises-policies.sql` | 142 |
| `OBJ-DB-EDU-TRG-MODULES` | trigger | `modules` | educational_content | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/educational_content/tables/01-modules.sql` | 132 |
| `OBJ-DB-EDU-TRG-EXERCISES` | trigger | `exercises` | educational_content | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/educational_content/tables/02-exercises.sql` | 129 |
| `OBJ-DB-EDU-TRG-ASSESSMENT-RUBRICS` | trigger | `assessment_rubrics` | educational_content | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/educational_content/tables/03-assessment_rubrics.sql` | 78 |
| `OBJ-DB-EDU-TRG-MEDIA-RESOURCES` | trigger | `media_resources` | educational_content | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/educational_content/tables/04-media_resources.sql` | 88 |
| `OBJ-DB-EDU-TRG-TRG-ASSESSMENT-RUBRICS-UPDATED-AT` | trigger | `trg_assessment_rubrics_updated_at` | educational_content | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/educational_content/triggers/11-trg_assessment_rubrics_updated_at.sql` | 15 |
| `OBJ-DB-EDU-TRG-TRG-EXERCISES-UPDATED-AT` | trigger | `trg_exercises_updated_at` | educational_content | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/educational_content/triggers/12-trg_exercises_updated_at.sql` | 15 |
| `OBJ-DB-EDU-TRG-TRG-MEDIA-RESOURCES-UPDATED-AT` | trigger | `trg_media_resources_updated_at` | educational_content | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/educational_content/triggers/13-trg_media_resources_updated_at.sql` | 15 |
| `OBJ-DB-EDU-TRG-TRG-MODULES-UPDATED-AT` | trigger | `trg_modules_updated_at` | educational_content | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/educational_content/triggers/14-trg_modules_updated_at.sql` | 15 |

---

## Backend

| OBJ ID | Tipo | Nombre | Ruta |
|--------|------|--------|------|
| `OBJ-BE-EDU-CTRL-EXERCISES-CONTROLLER` | controller | `exercises.controller` | `educational/controllers/exercises.controller.ts` |
| `OBJ-BE-EDU-CTRL-MEDIA-CONTROLLER` | controller | `media.controller` | `educational/controllers/media.controller.ts` |
| `OBJ-BE-EDU-CTRL-MODULES-CONTROLLER` | controller | `modules.controller` | `educational/controllers/modules.controller.ts` |
| `OBJ-BE-EDU-SVC-EXERCISES-SERVICE` | service | `exercises.service` | `educational/services/exercises.service.ts` |
| `OBJ-BE-EDU-SVC-MEDIA-SERVICE` | service | `media.service` | `educational/services/media.service.ts` |
| `OBJ-BE-EDU-SVC-MODULES-SERVICE` | service | `modules.service` | `educational/services/modules.service.ts` |
| `OBJ-BE-EDU-ENT-ASSESSMENT-RUBRIC-ENTITY` | entity | `assessment-rubric.entity` | `educational/entities/assessment-rubric.entity.ts` |
| `OBJ-BE-EDU-ENT-EXERCISE-ENTITY` | entity | `exercise.entity` | `educational/entities/exercise.entity.ts` |
| `OBJ-BE-EDU-ENT-MEDIA-RESOURCE-ENTITY` | entity | `media-resource.entity` | `educational/entities/media-resource.entity.ts` |
| `OBJ-BE-EDU-ENT-MODULE-ENTITY` | entity | `module.entity` | `educational/entities/module.entity.ts` |
| `OBJ-BE-EDU-SVC-MISSIONS-CRON-SERVICE` | service | `missions-cron.service` | `tasks/services/missions-cron.service.ts` |
| `OBJ-BE-EDU-SVC-NOTIFICATIONS-CRON-SERVICE` | service | `notifications-cron.service` | `tasks/services/notifications-cron.service.ts` |

---

## Frontend

| OBJ ID | Tipo | Nombre | Ruta |
|--------|------|--------|------|