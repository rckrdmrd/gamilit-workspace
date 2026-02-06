# FASE-2: RESULTADOS DE VALIDACION PROFUNDA POR SCHEMA

**Tarea:** TASK-2026-02-05-ANALISIS-INTEGRAL-MODELADO-BD
**Fase:** FASE-2 - Validacion Profunda Campo por Campo
**Fecha:** 2026-02-05
**Estado:** COMPLETADA
**Agentes ejecutados:** 8 (SA-F2-01 a SA-F2-08)

---

## 1. RESUMEN EJECUTIVO

### Alcance
- **170 tablas DDL** validadas campo por campo contra entities TypeORM
- **14 schemas** analizados (excluye data_warehouse, optimization, public, storage - sin entities)
- **~2,500+ columnas** comparadas entre DDL y entities
- **8 agentes paralelos** ejecutaron validacion independiente

### Resultado Global

```
TOTAL ISSUES ENCONTRADOS: 116
  CRITICAL:  28  (24.1%)  ← Fallos runtime, modelos incompatibles
  HIGH:      13  (11.2%)  ← Columnas faltantes, FK incorrectos
  MEDIUM:    42  (36.2%)  ← Defaults, tipos, constraints
  LOW:       33  (28.4%)  ← Menores, cosmeticos
```

### Score de Coherencia DDL↔Entity por Schema

| Schema | Tablas | Match % | CRIT | HIGH | MED | LOW | Total |
|--------|--------|---------|------|------|-----|-----|-------|
| auth + auth_management | 18 | 76% | 6 | 1 | 4 | 2 | 13 |
| gamification_system | 20 | 91% | 2 | 1 | 4 | 6 | 13 |
| educational_content | 21 | 93% | 3 | 0 | 1 | 6 | 10 |
| progress_tracking | 20 | 96% | 4 | 0 | 6 | 3 | 13 |
| social_features | 30 | 85% | 4 | 3 | 8 | 5 | 20 |
| content_management | 10 | 99% | 0 | 0 | 2 | 1 | 3 |
| notifications | 7 | 58% | 1 | 5 | 10 | 2 | 18 |
| admin_dashboard | 3 | 98% | 0 | 0 | 1 | 1 | 2 |
| audit_logging | 7 | 95% | 2 | 3 | 3 | 2 | 10 |
| system_configuration | 9 | 100% | 3 | 0 | 1 | 1 | 5 |
| lti_integration | 3 | 99% | 1 | 0 | 0 | 1 | 2 |
| communication | 4 | 50% | 2 | 0 | 2 | 3 | 7 |
| **TOTAL** | **152** | **87%** | **28** | **13** | **42** | **33** | **116** |

---

## 2. ISSUES CRITICOS (28) - Detalle Completo

### 2.1 Name Mismatches Singular/Plural (20 tablas)

**Impacto:** TypeORM con `synchronize: false` buscara tabla inexistente → "relation does not exist"

| # | Schema | DDL Table (plural) | Entity Constant (singular) |
|---|--------|-------------------|---------------------------|
| 1 | audit_logging | activity_logs | activity_log |
| 2 | audit_logging | pending_user_initializations | pending_user_initialization |
| 3 | gamification_system | comodin_usage_logs | comodin_usage_log |
| 4 | gamification_system | comodin_usage_trackings | comodin_usage_tracking |
| 5 | gamification_system | leaderboard_metadatas | leaderboard_metadata |
| 6 | lti_integration | lti_grade_passbacks | lti_grade_passback |
| 7 | content_management | marie_curie_contents | marie_curie_content |
| 8 | content_management | flagged_contents | flagged_content |
| 9 | content_management | media_metadatas | media_metadata |
| 10 | system_configuration | environment_configs | environment_config |
| 11 | system_configuration | api_configurations | api_configuration |
| 12 | system_configuration | notification_settings_globals | notification_settings_global |
| 13 | educational_content | teacher_contents | teacher_content |
| 14 | educational_content | exercise_mechanic_mappings | exercise_mechanic_mapping |
| 15 | educational_content | exercise_validation_configs | exercise_validation_config |
| 16 | educational_content | exercise_validation_audits | exercise_validation_audit |
| 17 | educational_content | content_metadatas | content_metadata |
| 18 | progress_tracking | mastery_trackings | mastery_tracking |
| 19 | progress_tracking | module_completion_trackings | module_completion_tracking |
| 20 | progress_tracking | user_difficulty_progresses | user_difficulty_progress |
| 21 | progress_tracking | user_current_levels | user_current_level |

**Archivo a corregir:** `apps/backend/src/shared/constants/database.constants.ts`
**Accion:** Cambiar todos los valores de constantes a plural (alinear con DDL)

### 2.2 Modelo Estructural Incompatible (1)

**C-AUTH-01: auth_providers entity vs DDL son modelos completamente diferentes**
- **DDL:** Tabla de configuracion global OAuth (client_id, client_secret, authorization_url, token_url...)
- **Entity:** Tabla de vinculacion por usuario (user_id, provider, provider_user_id, access_token...)
- **Zero overlap** de columnas mas alla de id y timestamps
- **Accion:** Crear tabla DDL `user_auth_providers` o reescribir entity

### 2.3 FK/JoinTable Incorrectos (4)

**C-AUTH-02: User @ManyToMany JoinTable referencia columna inexistente**
- Entity declara `inverseJoinColumn: { name: 'role_id' }` pero `user_roles` no tiene `role_id`
- DDL `user_roles` tiene columna `role` (ENUM), no `role_id`
- FK `user_roles_user_id_fkey` referencia `profiles(id)`, no `users(id)`

**C-AUTH-03: Membership FK target mismatch**
- DDL FK referencia `profiles(id)`, entity `@ManyToOne` apunta a `User` (auth.users)

**C-AUTH-04: UserSession FK target mismatch**
- DDL FK referencia `profiles(id)`, entity `@ManyToOne` apunta a `User` (auth.users)

**C-AUTH-05: email_verification_tokens - 2 column name mismatches**
- `token` en entity vs `token_hash` en DDL
- `used_at` en entity vs `verified_at` en DDL

### 2.4 Columnas Masivamente Faltantes (2)

**C-AUTH-06: auth.users - 20 columnas no mapeadas (41% match)**
- Columnas legacy auth incluyen: instance_id, aud, confirmation_token, recovery_token, etc.
- Columnas funcionales faltantes: raw_app_meta_data, is_sso_user

**C-EDU-01: assignment_students - 20 columnas faltantes (17% match)**
- ALTER script agrega 20 columnas de grading/submissions no reflejadas en entity
- Columnas: submitted_at, submission_data, score, max_score, percentage, feedback, graded_by, graded_at, status, attempt_number, max_attempts, is_late, late_penalty_applied, rubric_scores, teacher_notes, flagged_for_review, flag_reason, submission_url, submission_files, updated_at

### 2.5 Entities Faltantes (3 operacionales)

**C-COMM-01: communication.conversations (17 cols) - SIN ENTITY**
**C-COMM-02: communication.conversation_participants (17 cols) - SIN ENTITY**
**C-GAM-01: gamification_system.comodin_uses (9 cols) - SIN ENTITY**

### 2.6 Enum Mismatch (1)

**C-EDU-02: ContentStatusEnum falta valor 'backlog'**
- DDL `module_status` enum: draft, published, archived, under_review, **backlog** (5 valores)
- TS `ContentStatusEnum`: draft, published, archived, under_review (4 valores)
- Filas con status='backlog' causaran error de deserializacion

### 2.7 Column Name Mismatches en Entity (4 en scheduled_reports)

**C-SOC-01 a C-SOC-04: scheduled_reports - 4 columnas con nombres incorrectos**
| DDL Column | Entity name: mapping |
|------------|---------------------|
| report_name | schedule_name |
| last_run_at | last_generated_at |
| run_count | total_runs |
| notify_email | send_email |

---

## 3. ISSUES HIGH (13)

| # | Schema | Tabla | Issue |
|---|--------|-------|-------|
| H-01 | auth | users | 20 DDL columns unmapped in entity |
| H-02 | gamification | missions | Timestamp WITHOUT TZ (DDL) vs WITH TZ (entity) en 6 columnas |
| H-03 | social | user_blocks | NO ENTITY - safety feature (bloqueo usuarios) |
| H-04 | social | user_reports | NO ENTITY - 19 cols, moderation workflow |
| H-05 | social | scheduled_reports | 5 DDL columns missing in entity |
| H-06 | notifications | notification_logs | Entity has columns NOT in DDL (external_id, created_at) |
| H-07 | notifications | notification_templates | Unique constraint demasiado estricto (template_key solo vs composite) |
| H-08 | notifications | notification_queue | scheduled_for: DDL NOT NULL, entity nullable |
| H-09 | notifications | user_devices | Missing columns browser, os; extra column device_name |
| H-10 | notifications | notification_logs | sent_at: DDL NOT NULL, entity nullable |
| H-11 | audit | audit_logs | 4 type mismatches: uuid/inet mapped as text |
| H-12 | audit | audit_logs | Missing FK relations @ManyToOne para actor_id, tenant_id |
| H-13 | audit | Multiple | Missing @Check constraints (6 across 4 entities) |

---

## 4. ISSUES MEDIUM (42) - Agrupados por Tipo

### 4.1 Default Value Mismatches (12)
- gamification: shop_items.icon DDL='package' vs entity='gift'
- content: content_templates.default_values sin default en entity
- content: media_files.processing_status DDL='completed' vs entity='READY'
- notifications: 6 JSONB columns sin defaults en entities
- audit: 4 JSONB columns (old_values, new_values, changes, additional_data)
- admin: metrics_history.recorded_at sin default en entity

### 4.2 Type Mismatches (10)
- progress: 4 columnas usan varchar en entity pero enum cross-schema en DDL
- educational: bloom_level migrado a ENUM en DDL, entity sigue como varchar
- educational: exercise_validation_configs.exercise_type text vs enum
- gamification: user_ranks enum como text con hint
- social: guild_missions.mission_type varchar vs PG ENUM
- notifications: device_token text vs varchar(500)
- notifications: varchar lengths (20 DDL vs 50 entity) en 4 columnas

### 4.3 Nullable/NOT NULL Mismatches (8)
- notifications: 5 columnas con nullable incorrecto
- auth: tenants.deleted_at y profiles.deleted_at sin soft-delete
- notifications: notification_templates subject_template nullable mismatch

### 4.4 FK/Relation Missing Decorators (6)
- social: friendships.status default 'accepted' (DDL) vs PENDING (entity)
- social: classrooms.school onDelete SET NULL vs CASCADE
- social: 4 DDL files con legacy FK a auth.users en vez de auth_management.profiles
- communication: message_participants missing @Unique y @ManyToOne
- system_config: gamification_parameters missing @ManyToOne para last_modified_by

### 4.5 Constraint Mismatches (3)
- social: scheduled_reports.frequency entity incluye 'biweekly' no en DDL CHECK
- social: shared_reports.permission_level falta 'edit' en entity enum
- social: classroom_role ENUM incluye 'student' y falta 'owner' (DDL CHECK tiene 'owner')

### 4.6 Organizational (3)
- audit: 4 entities de audit_logging en admin module (cross-module placement)
- progress: student_intervention_alerts entity en teacher module (correcto schema, modulo incorrecto)
- gamification: MLCoinsTransaction missing tenant_id column

---

## 5. ISSUES LOW (33) - Resumen

| Tipo | Cantidad | Ejemplos |
|------|----------|----------|
| Missing @Check decorators | 8 | rate_limits, messages, pending_user_initialization |
| Enum inconsistencies menores | 5 | Orphaned enums, unused DDL enums |
| Missing @Index decorators | 4 | Various tables |
| Default value minor gaps | 5 | DB-level defaults no en entity |
| Type cosmetic mismatches | 4 | varchar vs text (same in PG) |
| Naming convention inconsistencies | 3 | Guild entities camelCase vs snake_case |
| Missing unique constraints | 2 | user_sessions.session_token, message_participants |
| Organizational minor | 2 | Entity file placement |

---

## 6. SCHEMAS SANOS (Score >= 95%)

| Schema | Match % | Issues | Nota |
|--------|---------|--------|------|
| content_management | 99% | 3 (0C, 0H, 2M, 1L) | Excelente - solo name mismatches y defaults menores |
| admin_dashboard | 98% | 2 (0C, 0H, 1M, 1L) | Muy sano - FK ref minor |
| system_configuration | 100% cols | 5 (3C name, 0H, 1M, 1L) | Columnas perfectas, solo name mismatches |
| lti_integration | 99% | 2 (1C name, 0H, 0M, 1L) | Casi perfecto |
| progress_tracking | 96% | 13 (4C name, 0H, 6M, 3L) | Sano excepto names y generated cols |

---

## 7. SCHEMAS CON DRIFT SIGNIFICATIVO

| Schema | Match % | Issues | Causa Principal |
|--------|---------|--------|-----------------|
| notifications | 58% | 18 (1C, 5H, 10M, 2L) | Modelo entity diverge significativamente del DDL |
| communication | 50% | 7 (2C, 0H, 2M, 3L) | 2 tablas sin entity (conversations, participants) |
| auth+auth_management | 76% | 13 (6C, 1H, 4M, 2L) | auth_providers modelo incompatible, users 41% match |
| social_features | 85% | 20 (4C, 3H, 8M, 5L) | 5 tablas sin entity, scheduled_reports con mismatches |

---

## 8. CATEGORIAS DE CORRECCION

### BATCH-1: Name Mismatches en database.constants.ts (21 cambios, 1 archivo)
**Esfuerzo:** 30 min | **Impacto:** Resuelve 21 CRITICAL
- Cambiar 21 constantes de singular a plural en database.constants.ts
- Eliminar constante obsoleta DB_TABLES.GAMIFICATION.NOTIFICATIONS

### BATCH-2: Crear Entities Faltantes (6 entities nuevos)
**Esfuerzo:** 2-3 horas | **Impacto:** Resuelve 6 CRITICAL + 2 HIGH
- conversations (17 cols)
- conversation_participants (17 cols)
- comodin_uses (9 cols)
- rate_limit_logs (10 cols)
- user_blocks (safety-critical)
- user_reports (19 cols, moderation)

### BATCH-3: Fix auth_providers + user ManyToMany (2 cambios estructurales)
**Esfuerzo:** 2-4 horas | **Impacto:** Resuelve 2 CRITICAL
- Crear DDL table user_auth_providers O reescribir entity
- Fix User @ManyToMany JoinTable (remove o corregir column refs)

### BATCH-4: Fix Column Mismatches (3 entities)
**Esfuerzo:** 1-2 horas | **Impacto:** Resuelve 3 CRITICAL + 1 HIGH
- email_verification_tokens: rename token→token_hash, used_at→verified_at
- assignment_students: add 20 missing columns from ALTER
- scheduled_reports: fix 4 column name mappings + add 5 missing cols

### BATCH-5: Fix FK Targets + Nullable + Defaults (multi-entity)
**Esfuerzo:** 2-3 horas | **Impacto:** Resuelve 2 CRITICAL + 5 HIGH + 20 MEDIUM
- memberships + user_sessions: FK target profiles→User
- notifications entities: align nullable, defaults, varchar lengths
- audit_logs: fix 4 type mismatches (text→uuid/inet)
- Add soft-delete to tenants + profiles

### BATCH-6: Enum + Constraint Alignment
**Esfuerzo:** 1 hora | **Impacto:** Resuelve 1 CRITICAL + varios MEDIUM
- ContentStatusEnum: add 'backlog'
- shared_reports: add 'edit' to SharePermission
- classroom_role: align with DDL CHECK
- scheduled_reports.frequency: remove or add 'biweekly'

---

## 9. METRICAS CONSOLIDADAS

```
TABLAS VALIDADAS:        152 (de 170, excluye 18 DW+placeholder)
COLUMNAS COMPARADAS:     ~2,500+
ISSUES TOTALES:          116
  CRITICAL:              28  → 21 name mismatches + 7 estructurales
  HIGH:                  13  → Columnas faltantes, FK, modelos
  MEDIUM:                42  → Defaults, tipos, nullable
  LOW:                   33  → Constraints, cosmetic

MATCH PROMEDIO:          87% (ponderado por columnas)
SCHEMAS 95%+:           5/12 (content_mgmt, admin, sys_config, lti, progress)
SCHEMAS <80%:           3/12 (notifications 58%, communication 50%, auth 76%)

ENTITIES FALTANTES:      6 operacionales (3 ya conocidos FASE-1 + 3 nuevos)
NAME MISMATCHES:        21 (todos en database.constants.ts)
MODELOS INCOMPATIBLES:   1 (auth_providers)
```

---

## 10. COMPARACION FASE-1 vs FASE-2

| Hallazgo FASE-1 | Confirmacion FASE-2 | Delta |
|-----------------|---------------------|-------|
| 20 name mismatches | 21 confirmados (+1 user_current_levels) | +1 |
| 9 tablas sin entity operacionales | 6 confirmados (3 reclasificados como lookup/futuro) | -3 |
| Inventarios desincronizados | Confirmado - drift peor de lo esperado | = |
| Schema mapping correcto | auth_providers modelo completamente diferente (NUEVO) | +1 CRITICO |
| - | notifications schema 58% match (NUEVO) | NUEVO |
| - | assignment_students 17% match (NUEVO) | NUEVO |

---

*FASE-2 Resultados v1.0.0 - 2026-02-05*
