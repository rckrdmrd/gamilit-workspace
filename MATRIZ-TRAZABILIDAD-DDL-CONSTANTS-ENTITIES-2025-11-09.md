# 📊 MATRIZ DE TRAZABILIDAD: DDL ↔ CONSTANTS ↔ ENTITIES
**Fecha:** 2025-11-09

## 📋 LEYENDA

| Estado | Descripción |
|--------|-------------|
| ✅ | Tabla con DDL + Constante + Entidad (100% completo) |
| 🟡 | Tabla con DDL + Constante (falta Entidad) |
| 🔴 | Tabla con DDL solamente (falta Constante y Entidad) |

---

## 📊 RESUMEN GLOBAL

```
Total tablas DDL:           97
✅ Completas (DDL+Const+Entity): 39 (40%)
🟡 Con constante (sin Entity):  14 (14%)
🔴 Solo DDL (sin Const ni Entity): 44 (45%)
```

---

## Schema: `audit_logging`

**Total:** 6 tablas
- ✅ Completas: 0
- 🟡 Con constante: 0
- 🔴 Solo DDL: 6

| Estado | Tabla | Constante | Entidad |
|--------|-------|-----------|---------|
| 🔴 | `audit_logs` | ❌ | ❌ |
| 🔴 | `performance_metrics` | ❌ | ❌ |
| 🔴 | `system_alerts` | ❌ | ❌ |
| 🔴 | `system_logs` | ❌ | ❌ |
| 🔴 | `user_activity` | ❌ | ❌ |
| 🔴 | `user_activity_logs` | ❌ | ❌ |

---

## Schema: `auth`

**Total:** 1 tablas
- ✅ Completas: 0
- 🟡 Con constante: 0
- 🔴 Solo DDL: 1

| Estado | Tabla | Constante | Entidad |
|--------|-------|-----------|---------|
| 🔴 | `users` | ❌ | ❌ |

---

## Schema: `auth_management`

**Total:** 15 tablas
- ✅ Completas: 8
- 🟡 Con constante: 2
- 🔴 Solo DDL: 5

| Estado | Tabla | Constante | Entidad |
|--------|-------|-----------|---------|
| ✅ | `auth_attempts` | AUTH.AUTH_ATTEMPTS | modules/auth/entities/auth-attempt.entity.ts |
| ✅ | `auth_providers` | AUTH.AUTH_PROVIDERS | modules/auth/entities/auth-provider.entity.ts |
| ✅ | `email_verification_tokens` | AUTH.EMAIL_VERIFICATION_TOKENS | modules/auth/entities/email-verification-token.entity.ts |
| ✅ | `memberships` | AUTH.MEMBERSHIPS | modules/auth/entities/membership.entity.ts |
| 🔴 | `parent_accounts` | ❌ | ❌ |
| 🔴 | `parent_notifications` | ❌ | ❌ |
| 🔴 | `parent_student_links` | ❌ | ❌ |
| ✅ | `password_reset_tokens` | AUTH.PASSWORD_RESET_TOKENS | modules/auth/entities/password-reset-token.entity.ts |
| ✅ | `profiles` | AUTH.PROFILES | modules/auth/entities/profile.entity.ts |
| 🔴 | `roles` | ❌ | ❌ |
| 🟡 | `security_events` | AUTH.SECURITY_EVENTS | ❌ |
| ✅ | `tenants` | AUTH.TENANTS | modules/auth/entities/tenant.entity.ts |
| 🟡 | `user_preferences` | AUTH.USER_PREFERENCES | ❌ |
| ✅ | `user_sessions` | AUTH.USER_SESSIONS | modules/auth/entities/user-session.entity.ts |
| 🔴 | `user_suspensions` | ❌ | ❌ |

---

## Schema: `content_management`

**Total:** 8 tablas
- ✅ Completas: 3
- 🟡 Con constante: 0
- 🔴 Solo DDL: 5

| Estado | Tabla | Constante | Entidad |
|--------|-------|-----------|---------|
| 🔴 | `content_authors` | ❌ | ❌ |
| 🔴 | `content_categories` | ❌ | ❌ |
| ✅ | `content_templates` | CONTENT.CONTENT_TEMPLATES | modules/content/entities/content-template.entity.ts |
| 🔴 | `content_versions` | ❌ | ❌ |
| 🔴 | `flagged_content` | ❌ | ❌ |
| ✅ | `marie_curie_content` | CONTENT.MARIE_CURIE_CONTENT | modules/content/entities/marie-curie-content.entity.ts |
| ✅ | `media_files` | CONTENT.MEDIA_FILES | modules/content/entities/media-file.entity.ts |
| 🔴 | `media_metadata` | ❌ | ❌ |

---

## Schema: `educational_content`

**Total:** 15 tablas
- ✅ Completas: 7
- 🟡 Con constante: 8
- 🔴 Solo DDL: 0

| Estado | Tabla | Constante | Entidad |
|--------|-------|-----------|---------|
| ✅ | `assessment_rubrics` | EDUCATIONAL.ASSESSMENT_RUBRICS | modules/educational/entities/assessment-rubric.entity.ts |
| ✅ | `assignment_exercises` | EDUCATIONAL.ASSIGNMENT_EXERCISES | modules/educational/entities/exercise.entity.ts |
| ✅ | `assignment_students` | EDUCATIONAL.ASSIGNMENT_STUDENTS | modules/assignments/entities/assignment-student.entity.ts |
| ✅ | `assignment_submissions` | EDUCATIONAL.ASSIGNMENT_SUBMISSIONS | modules/assignments/entities/assignment-submission.entity.ts |
| ✅ | `assignments` | EDUCATIONAL.ASSIGNMENTS | modules/assignments/entities/assignment.entity.ts |
| 🟡 | `content_approvals` | EDUCATIONAL.CONTENT_APPROVALS | ❌ |
| 🟡 | `content_metadata` | EDUCATIONAL.CONTENT_METADATA | ❌ |
| 🟡 | `content_tags` | EDUCATIONAL.CONTENT_TAGS | ❌ |
| 🟡 | `exercise_answers` | EDUCATIONAL.EXERCISE_ANSWERS | ❌ |
| 🟡 | `exercise_options` | EDUCATIONAL.EXERCISE_OPTIONS | ❌ |
| 🟡 | `exercises` | EDUCATIONAL.EXERCISES | ❌ |
| ✅ | `media_resources` | EDUCATIONAL.MEDIA_RESOURCES | modules/educational/entities/media-resource.entity.ts |
| 🟡 | `module_dependencies` | EDUCATIONAL.MODULE_DEPENDENCIES | ❌ |
| ✅ | `modules` | EDUCATIONAL.MODULES | modules/educational/entities/module.entity.ts |
| 🟡 | `taxonomies` | EDUCATIONAL.TAXONOMIES | ❌ |

---

## Schema: `gamification_system`

**Total:** 15 tablas
- ✅ Completas: 9
- 🟡 Con constante: 3
- 🔴 Solo DDL: 3

| Estado | Tabla | Constante | Entidad |
|--------|-------|-----------|---------|
| ✅ | `achievement_categories` | GAMIFICATION.ACHIEVEMENT_CATEGORIES | modules/gamification/entities/achievement-category.entity.ts |
| 🟡 | `achievements` | GAMIFICATION.ACHIEVEMENTS | ❌ |
| ✅ | `active_boosts` | GAMIFICATION.ACTIVE_BOOSTS | modules/gamification/entities/active-boost.entity.ts |
| 🔴 | `comodin_usage_log` | ❌ | ❌ |
| 🔴 | `comodin_usage_tracking` | ❌ | ❌ |
| ✅ | `comodines_inventory` | GAMIFICATION.COMODINES_INVENTORY | modules/gamification/entities/comodines-inventory.entity.ts |
| ✅ | `inventory_transactions` | GAMIFICATION.INVENTORY_TRANSACTIONS | modules/gamification/entities/inventory-transaction.entity.ts |
| ✅ | `leaderboard_metadata` | GAMIFICATION.LEADERBOARD_METADATA | modules/gamification/entities/leaderboard-metadata.entity.ts |
| 🔴 | `maya_ranks` | ❌ | ❌ |
| 🟡 | `missions` | GAMIFICATION.MISSIONS | ❌ |
| ✅ | `ml_coins_transactions` | GAMIFICATION.ML_COINS_TRANSACTIONS | modules/gamification/entities/ml-coins-transaction.entity.ts |
| 🟡 | `notifications` | GAMIFICATION.NOTIFICATIONS | ❌ |
| ✅ | `user_achievements` | GAMIFICATION.USER_ACHIEVEMENTS | modules/gamification/entities/achievement.entity.ts |
| ✅ | `user_ranks` | GAMIFICATION.USER_RANKS | modules/gamification/entities/user-rank.entity.ts |
| ✅ | `user_stats` | GAMIFICATION.USER_STATS | modules/gamification/entities/user-stats.entity.ts |

---

## Schema: `lti_integration`

**Total:** 3 tablas
- ✅ Completas: 0
- 🟡 Con constante: 0
- 🔴 Solo DDL: 3

| Estado | Tabla | Constante | Entidad |
|--------|-------|-----------|---------|
| 🔴 | `lti_consumers` | ❌ | ❌ |
| 🔴 | `lti_grade_passback` | ❌ | ❌ |
| 🔴 | `lti_sessions` | ❌ | ❌ |

---

## Schema: `progress_tracking`

**Total:** 13 tablas
- ✅ Completas: 5
- 🟡 Con constante: 0
- 🔴 Solo DDL: 8

| Estado | Tabla | Constante | Entidad |
|--------|-------|-----------|---------|
| 🔴 | `engagement_metrics` | ❌ | ❌ |
| ✅ | `exercise_attempts` | PROGRESS.EXERCISE_ATTEMPTS | modules/progress/entities/exercise-attempt.entity.ts |
| ✅ | `exercise_submissions` | PROGRESS.EXERCISE_SUBMISSIONS | modules/gamification/entities/mission.entity.ts |
| 🔴 | `learning_paths` | ❌ | ❌ |
| ✅ | `learning_sessions` | PROGRESS.LEARNING_SESSIONS | modules/progress/entities/learning-session.entity.ts |
| 🔴 | `mastery_tracking` | ❌ | ❌ |
| 🔴 | `module_completion_tracking` | ❌ | ❌ |
| ✅ | `module_progress` | PROGRESS.MODULE_PROGRESS | modules/progress/entities/module-progress.entity.ts |
| 🔴 | `progress_snapshots` | ❌ | ❌ |
| ✅ | `scheduled_missions` | PROGRESS.SCHEDULED_MISSIONS | modules/progress/entities/scheduled-mission.entity.ts |
| 🔴 | `skill_assessments` | ❌ | ❌ |
| 🔴 | `teacher_notes` | ❌ | ❌ |
| 🔴 | `user_learning_paths` | ❌ | ❌ |

---

## Schema: `social_features`

**Total:** 15 tablas
- ✅ Completas: 7
- 🟡 Con constante: 1
- 🔴 Solo DDL: 7

| Estado | Tabla | Constante | Entidad |
|--------|-------|-----------|---------|
| ✅ | `assignment_classrooms` | SOCIAL.ASSIGNMENT_CLASSROOMS | modules/social/entities/classroom.entity.ts |
| 🔴 | `challenge_participants` | ❌ | ❌ |
| 🔴 | `challenge_results` | ❌ | ❌ |
| ✅ | `classroom_members` | SOCIAL.CLASSROOM_MEMBERS | modules/social/entities/classroom-member.entity.ts |
| 🟡 | `classrooms` | SOCIAL.CLASSROOMS | ❌ |
| 🔴 | `discussion_threads` | ❌ | ❌ |
| ✅ | `friendships` | SOCIAL.FRIENDSHIPS | modules/social/entities/friendship.entity.ts |
| 🔴 | `peer_challenges` | ❌ | ❌ |
| ✅ | `schools` | SOCIAL.SCHOOLS | modules/social/entities/school.entity.ts |
| 🔴 | `social_interactions` | ❌ | ❌ |
| 🔴 | `teacher_classrooms` | ❌ | ❌ |
| ✅ | `team_challenges` | SOCIAL.TEAM_CHALLENGES | modules/social/entities/team-challenge.entity.ts |
| ✅ | `team_members` | SOCIAL.TEAM_MEMBERS | modules/social/entities/team-member.entity.ts |
| ✅ | `teams` | SOCIAL.TEAMS | modules/social/entities/team.entity.ts |
| 🔴 | `user_follows` | ❌ | ❌ |

---

## Schema: `system_configuration`

**Total:** 6 tablas
- ✅ Completas: 0
- 🟡 Con constante: 0
- 🔴 Solo DDL: 6

| Estado | Tabla | Constante | Entidad |
|--------|-------|-----------|---------|
| 🔴 | `api_configuration` | ❌ | ❌ |
| 🔴 | `environment_config` | ❌ | ❌ |
| 🔴 | `feature_flags` | ❌ | ❌ |
| 🔴 | `notification_settings` | ❌ | ❌ |
| 🔴 | `system_settings` | ❌ | ❌ |
| 🔴 | `tenant_configurations` | ❌ | ❌ |

---
