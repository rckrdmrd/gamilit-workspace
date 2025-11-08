# Code Map - M-PRG

**Última actualización:** 2025-11-07
**Total de objetos:** 37

---

## Base de Datos

| OBJ ID | Tipo | Nombre | Schema | Ruta | Líneas |
|--------|------|--------|--------|------|--------|
| `OBJ-DB-PRG-FN-CALCULATE-MODULE-PROGRESS` | function | `calculate_module_progress` | progress_tracking | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/functions/01-calculate_module_progress.sql` | 45 |
| `OBJ-DB-PRG-FN-GET-USER-PROGRESS-SUMMARY` | function | `get_user_progress_summary` | progress_tracking | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/functions/03-get_user_progress.sql` | 31 |
| `OBJ-DB-PRG-FN-UPDATE-EXERCISE-SUBMISSIONS-UPDATED-AT` | function | `update_exercise_submissions_updated_at` | progress_tracking | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/functions/04-record_exercise_attempt.sql` | 18 |
| `OBJ-DB-PRG-FN-GET-CLASSROOM-ANALYTICS` | function | `get_classroom_analytics` | progress_tracking | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/functions/05-get_classroom_analytics.sql` | 72 |
| `OBJ-DB-PRG-FN-GRANT-MISSION-COMPLETION-REWARDS` | function | `grant_mission_completion_rewards` | progress_tracking | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/functions/06-update_mission_progress.sql` | 92 |
| `OBJ-DB-PRG-FN-UPDATE-EXERCISE-SUBMISSIONS-UPDATED-AT` | function | `update_exercise_submissions_updated_at` | progress_tracking | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/functions/07-update_exercise_submissions_updated_at.sql` | 87 |
| `OBJ-DB-PRG-FN-CHECK-MECHANIC-COMPLETION` | function | `check_mechanic_completion` | progress_tracking | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/functions/_deprecated/02-check_mechanic_completion.sql` | 56 |
| `OBJ-DB-PRG-IDX-IDX-MODULE-PROGRESS-ANALYTICS-GIN` | index | `idx_module_progress_analytics_gin` | progress_tracking | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/indexes/01-idx_module_progress_analytics_gin.sql` | 26 |
| `OBJ-DB-PRG-IDX-IDX-SCHEDULED-MISSIONS-MISSION` | index | `idx_scheduled_missions_mission` | progress_tracking | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/indexes/02-idx_scheduled_missions_mission.sql` | 24 |
| `OBJ-DB-PRG-UNKN-01-ENABLE-RLS` | unknown | `01-enable-rls` | progress_tracking | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/rls-policies/01-enable-rls.sql` | 23 |
| `OBJ-DB-PRG-UNKN-02-PROGRESS-POLICIES` | unknown | `02-progress-policies` | progress_tracking | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/rls-policies/02-progress-policies.sql` | 242 |
| `OBJ-DB-PRG-TRG-MODULE-PROGRESS` | trigger | `module_progress` | progress_tracking | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/tables/01-module_progress.sql` | 232 |
| `OBJ-DB-PRG-IDX-LEARNING-SESSIONS` | index | `learning_sessions` | progress_tracking | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/tables/02-learning_sessions.sql` | 214 |
| `OBJ-DB-PRG-TRG-EXERCISE-ATTEMPTS` | trigger | `exercise_attempts` | progress_tracking | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/tables/03-exercise_attempts.sql` | 175 |
| `OBJ-DB-PRG-TRG-EXERCISE-SUBMISSIONS` | trigger | `exercise_submissions` | progress_tracking | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/tables/04-exercise_submissions.sql` | 201 |
| `OBJ-DB-PRG-IDX-SCHEDULED-MISSIONS` | index | `scheduled_missions` | progress_tracking | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/tables/05-scheduled_missions.sql` | 115 |
| `OBJ-DB-PRG-TRG-TRG-UPDATE-USER-STATS-ON-EXERCISE` | trigger | `trg_update_user_stats_on_exercise` | progress_tracking | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/triggers/21-trg_update_user_stats_on_exercise.sql` | 15 |
| `OBJ-DB-PRG-TRG-EXERCISE-SUBMISSIONS-UPDATED-AT` | trigger | `exercise_submissions_updated_at` | progress_tracking | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/triggers/22-exercise_submissions_updated_at.sql` | 15 |
| `OBJ-DB-PRG-TRG-TRG-MODULE-PROGRESS-UPDATED-AT` | trigger | `trg_module_progress_updated_at` | progress_tracking | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/triggers/23-trg_module_progress_updated_at.sql` | 15 |
| `OBJ-DB-PRG-VIEW-USER-PROGRESS-SUMMARY` | view | `user_progress_summary` | progress_tracking | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/views/user_progress_summary.sql` | 30 |

---

## Backend

| OBJ ID | Tipo | Nombre | Ruta |
|--------|------|--------|------|
| `OBJ-BE-PRG-CTRL-EXERCISE-ATTEMPT-CONTROLLER` | controller | `exercise-attempt.controller` | `progress/controllers/exercise-attempt.controller.ts` |
| `OBJ-BE-PRG-CTRL-EXERCISE-SUBMISSION-CONTROLLER` | controller | `exercise-submission.controller` | `progress/controllers/exercise-submission.controller.ts` |
| `OBJ-BE-PRG-CTRL-LEARNING-SESSION-CONTROLLER` | controller | `learning-session.controller` | `progress/controllers/learning-session.controller.ts` |
| `OBJ-BE-PRG-CTRL-MODULE-PROGRESS-CONTROLLER` | controller | `module-progress.controller` | `progress/controllers/module-progress.controller.ts` |
| `OBJ-BE-PRG-CTRL-SCHEDULED-MISSION-CONTROLLER` | controller | `scheduled-mission.controller` | `progress/controllers/scheduled-mission.controller.ts` |
| `OBJ-BE-PRG-SVC-EXERCISE-ATTEMPT-SERVICE` | service | `exercise-attempt.service` | `progress/services/exercise-attempt.service.ts` |
| `OBJ-BE-PRG-SVC-EXERCISE-SUBMISSION-SERVICE` | service | `exercise-submission.service` | `progress/services/exercise-submission.service.ts` |
| `OBJ-BE-PRG-SVC-LEARNING-SESSION-SERVICE` | service | `learning-session.service` | `progress/services/learning-session.service.ts` |
| `OBJ-BE-PRG-SVC-MODULE-PROGRESS-SERVICE` | service | `module-progress.service` | `progress/services/module-progress.service.ts` |
| `OBJ-BE-PRG-SVC-PENDING-ACTIVITIES-SERVICE` | service | `pending-activities.service` | `progress/services/pending-activities.service.ts` |
| `OBJ-BE-PRG-SVC-RECENT-ACTIVITY-SERVICE` | service | `recent-activity.service` | `progress/services/recent-activity.service.ts` |
| `OBJ-BE-PRG-SVC-SCHEDULED-MISSION-SERVICE` | service | `scheduled-mission.service` | `progress/services/scheduled-mission.service.ts` |
| `OBJ-BE-PRG-ENT-EXERCISE-ATTEMPT-ENTITY` | entity | `exercise-attempt.entity` | `progress/entities/exercise-attempt.entity.ts` |
| `OBJ-BE-PRG-ENT-EXERCISE-SUBMISSION-ENTITY` | entity | `exercise-submission.entity` | `progress/entities/exercise-submission.entity.ts` |
| `OBJ-BE-PRG-ENT-LEARNING-SESSION-ENTITY` | entity | `learning-session.entity` | `progress/entities/learning-session.entity.ts` |
| `OBJ-BE-PRG-ENT-MODULE-PROGRESS-ENTITY` | entity | `module-progress.entity` | `progress/entities/module-progress.entity.ts` |
| `OBJ-BE-PRG-ENT-SCHEDULED-MISSION-ENTITY` | entity | `scheduled-mission.entity` | `progress/entities/scheduled-mission.entity.ts` |

---

## Frontend

| OBJ ID | Tipo | Nombre | Ruta |
|--------|------|--------|------|