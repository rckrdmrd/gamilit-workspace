# Inventario Completo de Schemas - Base de Datos Gamilit

Fecha: 2025-11-11

---

## admin_dashboard

**Total de archivos SQL:** 6

**Estructura:**
- views: 6 archivos

**Tablas:** (No tiene tablas definidas)

---

## audit_logging

**Total de archivos SQL:** 28

**Estructura:**
- enums: 2 archivos
- functions: 4 archivos
- indexes: 14 archivos
- tables: 6 archivos
- triggers: 1 archivo
- rls-policies: 1 archivo

**Tablas:**
- 01-audit_logs
- 02-performance_metrics
- 03-system_alerts
- 04-system_logs
- 05-user_activity_logs
- 06-user_activity

---

## auth

**Total de archivos SQL:** 3

**Estructura:**
- enums: 2 archivos
- tables: 1 archivo

**Tablas:**
- 01-users

---

## auth_management

**Total de archivos SQL:** 40

**Estructura:**
- functions: 6 archivos
- indexes: 11 archivos
- tables: 15 archivos
- triggers: 6 archivos
- rls-policies: 1 archivo
- fk-constraints: 1 archivo
- validaciones: (carpeta presente, sin archivos SQL)

**Tablas:**
- 01-tenants
- 02-auth_attempts
- 03-profiles
- 04-roles
- 05-auth_providers
- 06-email_verification_tokens
- 07-password_reset_tokens
- 08-security_events
- 09-user_preferences
- 10-memberships
- 11-user_sessions
- 12-user_suspensions
- 14-parent_accounts
- 15-parent_student_links
- 16-parent_notifications

---

## content_management

**Total de archivos SQL:** 18

**Estructura:**
- enums: 4 archivos
- indexes: 2 archivos
- tables: 8 archivos
- triggers: 3 archivos
- rls-policies: 1 archivo

**Tablas:**
- 01-content_templates
- 02-marie_curie_content
- 03-media_files
- 04-content_versions
- 05-flagged_content
- content_authors
- content_categories
- media_metadata

---

## educational_content

**Total de archivos SQL:** 45

**Estructura:**
- enums: 3 archivos
- functions: 3 archivos
- indexes: 16 archivos
- tables: 17 archivos
- triggers: 4 archivos
- rls-policies: 2 archivos

**Tablas:**
- 01-modules
- 02-exercises
- 03-assessment_rubrics
- 04-media_resources
- 05-assignments
- 06-assignment_exercises
- 07-assignment_students
- 08-assignment_submissions
- 20-difficulty_criteria
- 21-exercise_mechanic_mapping
- content_approvals
- content_metadata
- content_tags
- exercise_answers
- exercise_options
- module_dependencies
- taxonomies

---

## gamification_system

**Total de archivos SQL:** 92

**Estructura:**
- enums: 4 archivos
- functions: 25 archivos
- indexes: 22 archivos
- tables: 15 archivos
- triggers: 10 archivos
- rls-policies: 8 archivos
- views: 4 archivos
- materialized-views: 4 archivos

**Tablas:**
- 01-user_stats
- 02-user_ranks
- 03-achievements
- 04-user_achievements
- 05-ml_coins_transactions
- 06-missions
- 07-comodines_inventory
- 08-notifications
- 09-leaderboard_metadata
- 10-achievement_categories
- 11-active_boosts
- 12-inventory_transactions
- 13-maya_ranks
- 14-comodin_usage_log
- 15-comodin_usage_tracking

---

## gamilit

**Total de archivos SQL:** 15

**Estructura:**
- functions: 14 archivos
- views: 1 archivo

**Tablas:** (No tiene tablas definidas)

---

## lti_integration

**Total de archivos SQL:** 3

**Estructura:**
- tables: 3 archivos
- functions: (carpeta presente, sin archivos SQL)
- triggers: (carpeta presente, sin archivos SQL)

**Tablas:**
- 01-lti_consumers
- 02-lti_sessions
- 03-lti_grade_passback

---

## notifications

**Total de archivos SQL:** 10

**Estructura:**
- 00-create-schema.sql: 1 archivo
- tables: 6 archivos
- functions: 3 archivos

**Tablas:**
- 01-notifications
- 02-notification_preferences
- 03-notification_logs
- 04-notification_templates
- 05-notification_queue
- 06-user_devices

---

## progress_tracking

**Total de archivos SQL:** 34

**Estructura:**
- enums: 2 archivos
- functions: 9 archivos
- indexes: 2 archivos
- tables: 15 archivos
- triggers: 3 archivos
- rls-policies: 2 archivos
- views: 1 archivo

**Tablas:**
- 01-module_progress
- 02-learning_sessions
- 03-exercise_attempts
- 04-exercise_submissions
- 05-scheduled_missions
- 15-user_difficulty_progress
- 16-user_current_level
- engagement_metrics
- learning_paths
- mastery_tracking
- module_completion_tracking
- progress_snapshots
- skill_assessments
- teacher_notes
- user_learning_paths

---

## public

**Total de archivos SQL:** 0

**Estructura:** (Schema vacío)

**Tablas:** Ninguna

---

## social_features

**Total de archivos SQL:** 30

**Estructura:**
- enums: 1 archivo
- functions: 1 archivo
- tables: 15 archivos
- triggers: 5 archivos
- rls-policies: 8 archivos

**Tablas:**
- 01-friendships
- 02-schools
- 03-classrooms
- 04-classroom_members
- 05-teams
- 06-team_members
- 07-team_challenges
- 11-peer_challenges
- 12-challenge_participants
- 13-challenge_results
- assignment_classrooms
- discussion_threads
- social_interactions
- teacher_classrooms
- user_follows

---

## storage

**Total de archivos SQL:** 1

**Estructura:**
- enums: 1 archivo

**Tablas:** (No tiene tablas definidas)

---

## system_configuration

**Total de archivos SQL:** 13

**Estructura:**
- functions: 2 archivos
- tables: 8 archivos
- triggers: 2 archivos
- rls-policies: 1 archivo

**Tablas:**
- 01-system_settings
- 02-feature_flags
- 03-notification_settings
- 04-rate_limits
- 05-notification_settings_global
- api_configuration
- environment_config
- tenant_configurations

---

## Resumen General

| Schema | Total SQL | Tablas | Funciones | Triggers | Índices | RLS-Policies | Views | Enums |
|--------|-----------|--------|-----------|----------|---------|--------------|-------|-------|
| admin_dashboard | 9 | 1 | 1 | 0 | 0 | 0 | 7 | 0 |
| audit_logging | 28 | 6 | 4 | 1 | 14 | 1 | 0 | 2 |
| auth | 3 | 1 | 0 | 0 | 0 | 0 | 0 | 2 |
| auth_management | 40 | 15 | 6 | 6 | 11 | 1 | 0 | 0 |
| content_management | 18 | 8 | 0 | 3 | 2 | 1 | 0 | 4 |
| educational_content | 45 | 17 | 3 | 4 | 16 | 2 | 0 | 3 |
| gamification_system | 92 | 15 | 25 | 10 | 22 | 8 | 4 | 4 |
| gamilit | 15 | 0 | 14 | 0 | 0 | 0 | 1 | 0 |
| lti_integration | 3 | 3 | 0 | 0 | 0 | 0 | 0 | 0 |
| notifications | 10 | 6 | 3 | 0 | 0 | 0 | 0 | 0 |
| progress_tracking | 34 | 15 | 9 | 3 | 2 | 2 | 1 | 2 |
| public | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| social_features | 30 | 15 | 1 | 5 | 0 | 8 | 0 | 1 |
| storage | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| system_configuration | 13 | 8 | 2 | 2 | 0 | 1 | 0 | 0 |
| **TOTAL** | **357** | **124** | **68** | **34** | **67** | **24** | **13** | **19** |

---

## Observaciones

1. **Schema más complejo:** `gamification_system` con 92 archivos SQL, incluyendo 25 funciones y 22 índices.
2. **Mayor cantidad de tablas:** `auth_management`, `educational_content`, `progress_tracking` y `social_features` cada uno con 15 tablas.
3. **Schema vacío:** `public` no contiene ningún archivo SQL.
4. **Schemas orientados a vistas:** `admin_dashboard` y `gamilit` contienen principalmente funciones y vistas.
5. **Schema notifications:** Agregado (2025-11-13) - Sistema multi-canal de notificaciones (EXT-003) con 6 tablas y 3 funciones.
6. **Total de schemas:** 15 schemas (14 activos + 1 vacío).
7. **Total de tablas en la base de datos:** 124 tablas distribuidas en 14 schemas activos.
8. **Seguridad (RLS-Policies):** 24 políticas de RLS distribuidas principalmente en `gamification_system` (8) y `social_features` (8).

**Última actualización:** 2025-11-13 (DB-115 - Validación de alineación post-desarrollo)

