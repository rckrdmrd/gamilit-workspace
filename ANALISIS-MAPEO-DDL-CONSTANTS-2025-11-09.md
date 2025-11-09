# 🔍 ANÁLISIS DE MAPEO DDL ↔ CONSTANTS ↔ ENTITIES
**Fecha:** 2025-11-09

## 📊 RESUMEN EJECUTIVO

```
Tablas DDL:               97

### 🎯 Gaps Identificados

- **44 tablas DDL** sin constante definida → Necesitan agregarse a `database.constants.ts`
- **2 constantes** sin tabla DDL → Verificar si fueron renombradas o removidas

Constantes definidas:     55
Archivos entities:        47
```

---

## Schema: `audit_logging`

- **Tablas DDL:** 6
- **Constants definidas:** 0
- **Alineadas:** 0

### ❌ 6 tablas DDL SIN constante

- `audit_logs`
- `performance_metrics`
- `system_alerts`
- `system_logs`
- `user_activity`
- `user_activity_logs`

---

## Schema: `auth`

- **Tablas DDL:** 1
- **Constants definidas:** 0
- **Alineadas:** 0

### ❌ 1 tablas DDL SIN constante

- `users`

---

## Schema: `auth_management`

- **Tablas DDL:** 15
- **Constants definidas:** 12
- **Alineadas:** 10

### ❌ 5 tablas DDL SIN constante

- `parent_accounts`
- `parent_notifications`
- `parent_student_links`
- `roles`
- `user_suspensions`

### ⚠️ 2 constantes SIN tabla DDL

- `user_roles` (probablemente renombrada o removida)
- `users` (probablemente renombrada o removida)

### ✅ 10 tablas alineadas

---

## Schema: `content_management`

- **Tablas DDL:** 8
- **Constants definidas:** 3
- **Alineadas:** 3

### ❌ 5 tablas DDL SIN constante

- `content_authors`
- `content_categories`
- `content_versions`
- `flagged_content`
- `media_metadata`

### ✅ 3 tablas alineadas

---

## Schema: `educational_content`

- **Tablas DDL:** 15
- **Constants definidas:** 15
- **Alineadas:** 15

### ✅ 15 tablas alineadas

---

## Schema: `gamification_system`

- **Tablas DDL:** 15
- **Constants definidas:** 12
- **Alineadas:** 12

### ❌ 3 tablas DDL SIN constante

- `comodin_usage_log`
- `comodin_usage_tracking`
- `maya_ranks`

### ✅ 12 tablas alineadas

---

## Schema: `lti_integration`

- **Tablas DDL:** 3
- **Constants definidas:** 0
- **Alineadas:** 0

### ❌ 3 tablas DDL SIN constante

- `lti_consumers`
- `lti_grade_passback`
- `lti_sessions`

---

## Schema: `progress_tracking`

- **Tablas DDL:** 13
- **Constants definidas:** 5
- **Alineadas:** 5

### ❌ 8 tablas DDL SIN constante

- `engagement_metrics`
- `learning_paths`
- `mastery_tracking`
- `module_completion_tracking`
- `progress_snapshots`
- `skill_assessments`
- `teacher_notes`
- `user_learning_paths`

### ✅ 5 tablas alineadas

---

## Schema: `social_features`

- **Tablas DDL:** 15
- **Constants definidas:** 8
- **Alineadas:** 8

### ❌ 7 tablas DDL SIN constante

- `challenge_participants`
- `challenge_results`
- `discussion_threads`
- `peer_challenges`
- `social_interactions`
- `teacher_classrooms`
- `user_follows`

### ✅ 8 tablas alineadas

---

## Schema: `system_configuration`

- **Tablas DDL:** 6
- **Constants definidas:** 0
- **Alineadas:** 0

### ❌ 6 tablas DDL SIN constante

- `api_configuration`
- `environment_config`
- `feature_flags`
- `notification_settings`
- `system_settings`
- `tenant_configurations`

---
