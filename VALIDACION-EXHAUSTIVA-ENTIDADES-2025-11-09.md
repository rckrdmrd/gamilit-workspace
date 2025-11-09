# 🔍 VALIDACIÓN EXHAUSTIVA: ENTIDADES EXISTENTES
**Fecha:** 2025-11-09 12:05:57

## 📊 METODOLOGÍA

Para cada tabla SQL en DDL, se buscan entidades TypeORM usando:
1. Nombre exacto del archivo (snake_case, kebab-case, PascalCase)
2. Decorador @Entity con name='tabla'
3. Decorador @Entity con schema='schema' + name='tabla'
4. Variantes singular/plural

---


## Schema: `audit_logging`

**Módulo esperado:** `apps/backend/src/modules/audit`

| # | Tabla | Estado | Ubicación Entidad | Notas |
|---|-------|--------|-------------------|-------|
| 1 | `04-system_logs` | ❌ FALTA | - | **Requiere implementación** |
| 2 | `05-user_activity_logs` | ❌ FALTA | - | **Requiere implementación** |
| 3 | `02-performance_metrics` | ❌ FALTA | - | **Requiere implementación** |
| 4 | `03-system_alerts` | ❌ FALTA | - | **Requiere implementación** |
| 5 | `06-user_activity` | ❌ FALTA | - | **Requiere implementación** |
| 6 | `01-audit_logs` | ❌ FALTA | - | **Requiere implementación** |


## Schema: `auth`

**Módulo esperado:** `apps/backend/src/modules/auth`

| # | Tabla | Estado | Ubicación Entidad | Notas |
|---|-------|--------|-------------------|-------|
| 1 | `01-users` | ❌ FALTA | - | **Requiere implementación** |


## Schema: `auth_management`

**Módulo esperado:** `apps/backend/src/modules/auth`

| # | Tabla | Estado | Ubicación Entidad | Notas |
|---|-------|--------|-------------------|-------|
| 1 | `02-auth_attempts` | ❌ FALTA | - | **Requiere implementación** |
| 2 | `03-profiles` | ❌ FALTA | - | **Requiere implementación** |
| 3 | `16-parent_notifications` | ❌ FALTA | - | **Requiere implementación** |
| 4 | `07-password_reset_tokens` | ❌ FALTA | - | **Requiere implementación** |
| 5 | `14-parent_accounts` | ❌ FALTA | - | **Requiere implementación** |
| 6 | `15-parent_student_links` | ❌ FALTA | - | **Requiere implementación** |
| 7 | `04-roles` | ❌ FALTA | - | **Requiere implementación** |
| 8 | `05-auth_providers` | ❌ FALTA | - | **Requiere implementación** |
| 9 | `12-user_suspensions` | ❌ FALTA | - | **Requiere implementación** |
| 10 | `11-user_sessions` | ❌ FALTA | - | **Requiere implementación** |
| 11 | `09-user_preferences` | ❌ FALTA | - | **Requiere implementación** |
| 12 | `08-security_events` | ❌ FALTA | - | **Requiere implementación** |
| 13 | `10-memberships` | ❌ FALTA | - | **Requiere implementación** |
| 14 | `01-tenants` | ❌ FALTA | - | **Requiere implementación** |
| 15 | `06-email_verification_tokens` | ❌ FALTA | - | **Requiere implementación** |


## Schema: `content_management`

**Módulo esperado:** `apps/backend/src/modules/content`

| # | Tabla | Estado | Ubicación Entidad | Notas |
|---|-------|--------|-------------------|-------|
| 1 | `02-marie_curie_content` | ❌ FALTA | - | **Requiere implementación** |
| 2 | `media_metadata` | ❌ FALTA | - | **Requiere implementación** |
| 3 | `03-media_files` | ❌ FALTA | - | **Requiere implementación** |
| 4 | `01-content_templates` | ❌ FALTA | - | **Requiere implementación** |
| 5 | `content_categories` | ❌ FALTA | - | **Requiere implementación** |
| 6 | `05-flagged_content` | ❌ FALTA | - | **Requiere implementación** |
| 7 | `content_authors` | ❌ FALTA | - | **Requiere implementación** |
| 8 | `04-content_versions` | ❌ FALTA | - | **Requiere implementación** |


## Schema: `educational_content`

**Módulo esperado:** `apps/backend/src/modules/educational`

| # | Tabla | Estado | Ubicación Entidad | Notas |
|---|-------|--------|-------------------|-------|
| 1 | `assignment_students` | ❌ FALTA | - | **Requiere implementación** |
| 2 | `module_dependencies` | ❌ FALTA | - | **Requiere implementación** |
| 3 | `assignment_submissions` | ❌ FALTA | - | **Requiere implementación** |
| 4 | `taxonomies` | ❌ FALTA | - | **Requiere implementación** |
| 5 | `content_approvals` | ❌ FALTA | - | **Requiere implementación** |
| 6 | `assignments` | ⚠️ EXISTE | `modules/assignments/entities/assignment-classroom.entity.ts
modules/assignments/entities/assignment.entity.ts
modules/assignments/entities/assignment-student.entity.ts
modules/assignments/entities/assignment-submission.entity.ts
modules/assignments/entities/assignment-exercise.entity.ts` | **Ubicación inesperada** |
| 7 | `content_tags` | ❌ FALTA | - | **Requiere implementación** |
| 8 | `01-modules` | ❌ FALTA | - | **Requiere implementación** |
| 9 | `04-media_resources` | ❌ FALTA | - | **Requiere implementación** |
| 10 | `03-assessment_rubrics` | ❌ FALTA | - | **Requiere implementación** |
| 11 | `assignment_exercises` | ❌ FALTA | - | **Requiere implementación** |
| 12 | `exercise_options` | ❌ FALTA | - | **Requiere implementación** |
| 13 | `02-exercises` | ❌ FALTA | - | **Requiere implementación** |
| 14 | `content_metadata` | ❌ FALTA | - | **Requiere implementación** |
| 15 | `exercise_answers` | ❌ FALTA | - | **Requiere implementación** |


## Schema: `gamification_system`

**Módulo esperado:** `apps/backend/src/modules/gamification`

| # | Tabla | Estado | Ubicación Entidad | Notas |
|---|-------|--------|-------------------|-------|
| 1 | `06-missions` | ❌ FALTA | - | **Requiere implementación** |
| 2 | `05-ml_coins_transactions` | ❌ FALTA | - | **Requiere implementación** |
| 3 | `10-achievement_categories` | ❌ FALTA | - | **Requiere implementación** |
| 4 | `07-comodines_inventory` | ❌ FALTA | - | **Requiere implementación** |
| 5 | `11-active_boosts` | ❌ FALTA | - | **Requiere implementación** |
| 6 | `04-user_achievements` | ❌ FALTA | - | **Requiere implementación** |
| 7 | `02-user_ranks` | ❌ FALTA | - | **Requiere implementación** |
| 8 | `01-user_stats` | ❌ FALTA | - | **Requiere implementación** |
| 9 | `03-achievements` | ❌ FALTA | - | **Requiere implementación** |
| 10 | `14-comodin_usage_log` | ❌ FALTA | - | **Requiere implementación** |
| 11 | `15-comodin_usage_tracking` | ❌ FALTA | - | **Requiere implementación** |
| 12 | `13-maya_ranks` | ❌ FALTA | - | **Requiere implementación** |
| 13 | `12-inventory_transactions` | ❌ FALTA | - | **Requiere implementación** |
| 14 | `08-notifications` | ❌ FALTA | - | **Requiere implementación** |
| 15 | `09-leaderboard_metadata` | ❌ FALTA | - | **Requiere implementación** |


## Schema: `lti_integration`

**Módulo esperado:** `apps/backend/src/modules/lti`

| # | Tabla | Estado | Ubicación Entidad | Notas |
|---|-------|--------|-------------------|-------|
| 1 | `02-lti_sessions` | ❌ FALTA | - | **Requiere implementación** |
| 2 | `01-lti_consumers` | ❌ FALTA | - | **Requiere implementación** |
| 3 | `03-lti_grade_passback` | ❌ FALTA | - | **Requiere implementación** |


## Schema: `progress_tracking`

**Módulo esperado:** `apps/backend/src/modules/progress`

| # | Tabla | Estado | Ubicación Entidad | Notas |
|---|-------|--------|-------------------|-------|
| 1 | `03-exercise_attempts` | ❌ FALTA | - | **Requiere implementación** |
| 2 | `user_learning_paths` | ❌ FALTA | - | **Requiere implementación** |
| 3 | `module_completion_tracking` | ❌ FALTA | - | **Requiere implementación** |
| 4 | `04-exercise_submissions` | ❌ FALTA | - | **Requiere implementación** |
| 5 | `teacher_notes` | ❌ FALTA | - | **Requiere implementación** |
| 6 | `engagement_metrics` | ❌ FALTA | - | **Requiere implementación** |
| 7 | `skill_assessments` | ❌ FALTA | - | **Requiere implementación** |
| 8 | `learning_paths` | ❌ FALTA | - | **Requiere implementación** |
| 9 | `05-scheduled_missions` | ❌ FALTA | - | **Requiere implementación** |
| 10 | `01-module_progress` | ❌ FALTA | - | **Requiere implementación** |
| 11 | `mastery_tracking` | ❌ FALTA | - | **Requiere implementación** |
| 12 | `02-learning_sessions` | ❌ FALTA | - | **Requiere implementación** |
| 13 | `progress_snapshots` | ❌ FALTA | - | **Requiere implementación** |


## Schema: `public`

**Módulo esperado:** `apps/backend/src/modules/assignments`

| # | Tabla | Estado | Ubicación Entidad | Notas |
|---|-------|--------|-------------------|-------|


## Schema: `social_features`

**Módulo esperado:** `apps/backend/src/modules/social`

| # | Tabla | Estado | Ubicación Entidad | Notas |
|---|-------|--------|-------------------|-------|
| 1 | `02-schools` | ❌ FALTA | - | **Requiere implementación** |
| 2 | `01-friendships` | ❌ FALTA | - | **Requiere implementación** |
| 3 | `assignment_classrooms` | ❌ FALTA | - | **Requiere implementación** |
| 4 | `discussion_threads` | ❌ FALTA | - | **Requiere implementación** |
| 5 | `04-classroom_members` | ❌ FALTA | - | **Requiere implementación** |
| 6 | `06-team_members` | ❌ FALTA | - | **Requiere implementación** |
| 7 | `07-team_challenges` | ❌ FALTA | - | **Requiere implementación** |
| 8 | `user_follows` | ❌ FALTA | - | **Requiere implementación** |
| 9 | `teacher_classrooms` | ❌ FALTA | - | **Requiere implementación** |
| 10 | `11-peer_challenges` | ❌ FALTA | - | **Requiere implementación** |
| 11 | `social_interactions` | ❌ FALTA | - | **Requiere implementación** |
| 12 | `03-classrooms` | ❌ FALTA | - | **Requiere implementación** |
| 13 | `13-challenge_results` | ❌ FALTA | - | **Requiere implementación** |
| 14 | `12-challenge_participants` | ❌ FALTA | - | **Requiere implementación** |
| 15 | `05-teams` | ❌ FALTA | - | **Requiere implementación** |


## Schema: `system_configuration`

**Módulo esperado:** `apps/backend/src/modules/core`

| # | Tabla | Estado | Ubicación Entidad | Notas |
|---|-------|--------|-------------------|-------|
| 1 | `tenant_configurations` | ❌ FALTA | - | **Requiere implementación** |
| 2 | `01-system_settings` | ❌ FALTA | - | **Requiere implementación** |
| 3 | `02-feature_flags` | ❌ FALTA | - | **Requiere implementación** |
| 4 | `environment_config` | ❌ FALTA | - | **Requiere implementación** |
| 5 | `03-notification_settings` | ❌ FALTA | - | **Requiere implementación** |
| 6 | `api_configuration` | ❌ FALTA | - | **Requiere implementación** |

---

## 📊 RESUMEN EJECUTIVO

```
Total tablas DDL:        97
Entidades encontradas:   1 (1%)
Entidades faltantes:     96 (99%)
```


### ⚠️ STATUS: COMPLETITUD 1%

**Acción requerida:** Implementar 96 entidades faltantes

Referencia: Ver `PLAN-IMPLEMENTACION-P0-P1-ENTIDADES-2025-11-09.md`
