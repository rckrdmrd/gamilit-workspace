# CROSS-REFERENCE: DDL Tables ↔ TypeORM Entities

**Tarea:** TASK-2026-02-05-ANALISIS-INTEGRAL-MODELADO-BD
**Fase:** FASE-1 - Subtarea 1.3.1
**Fecha:** 2026-02-05
**Agente:** SA-F1-06 (Cross-Referencer)

---

## RESUMEN EJECUTIVO

| Metrica | Valor |
|---------|-------|
| Total tablas DDL | 170 |
| Total entities TypeORM | 143 (141 archivos + 2 clases en message.entity.ts) |
| Match exacto tabla↔entity | 116 |
| Name mismatch (singular/plural) | 20 |
| Tablas sin entity (total) | 34 |
| Tablas sin entity (operacionales) | 9 |
| Tablas sin entity (data warehouse) | 16+2 ML |
| Entities sin tabla DDL | 0 |
| Schema mismatches | 0 |

---

## 1. HALLAZGO CRITICO: 20 NAME MISMATCHES (Singular vs Plural)

Entity usa nombre singular en @Entity(), pero DDL CREATE TABLE usa plural.
**Impacto:** Runtime error si TypeORM busca tabla con nombre exacto del entity.

| # | Entity Class | Entity Table Name | DDL Table Name | Schema |
|---|-------------|-------------------|----------------|--------|
| 1 | ActivityLog | activity_log | activity_logs | audit_logging |
| 2 | PendingUserInitialization | pending_user_initialization | pending_user_initializations | audit_logging |
| 3 | ComodinUsageLog | comodin_usage_log | comodin_usage_logs | gamification_system |
| 4 | ComodinUsageTracking | comodin_usage_tracking | comodin_usage_trackings | gamification_system |
| 5 | LeaderboardMetadata | leaderboard_metadata | leaderboard_metadatas | gamification_system |
| 6 | LtiGradePassback | lti_grade_passback | lti_grade_passbacks | lti_integration |
| 7 | MarieCurieContent | marie_curie_content | marie_curie_contents | content_management |
| 8 | FlaggedContent | flagged_content | flagged_contents | content_management |
| 9 | MediaMetadata | media_metadata | media_metadatas | content_management |
| 10 | EnvironmentConfig | environment_config | environment_configs | system_configuration |
| 11 | ApiConfiguration | api_configuration | api_configurations | system_configuration |
| 12 | NotificationSettingsGlobal | notification_settings_global | notification_settings_globals | system_configuration |
| 13 | TeacherContent | teacher_content | teacher_contents | educational_content |
| 14 | ExerciseMechanicMapping | exercise_mechanic_mapping | exercise_mechanic_mappings | educational_content |
| 15 | ExerciseValidationConfig | exercise_validation_config | exercise_validation_configs | educational_content |
| 16 | ExerciseValidationAudit | exercise_validation_audit | exercise_validation_audits | educational_content |
| 17 | ContentMetadata | content_metadata | content_metadatas | educational_content |
| 18 | MasteryTracking | mastery_tracking | mastery_trackings | progress_tracking |
| 19 | ModuleCompletionTracking | module_completion_tracking | module_completion_trackings | progress_tracking |
| 20 | UserDifficultyProgress | user_difficulty_progress | user_difficulty_progresses | progress_tracking |
| 21 | UserCurrentLevel | user_current_level | user_current_levels | progress_tracking |

**Nota:** Si TypeORM usa `synchronize: true`, creara tablas con el nombre del entity (singular), y las tablas DDL (plural) quedaran huerfanas. Si `synchronize: false`, TypeORM buscara la tabla singular y fallara con "relation does not exist".

### Accion Requerida
Decidir entre:
- **A)** Renombrar en entities: Cambiar @Entity name a plural (alinear con DDL)
- **B)** Renombrar en DDL: Cambiar CREATE TABLE a singular (alinear con entities)
- **Recomendacion:** Opcion A - alinear entities con DDL existente (menor riesgo, DDL es fuente de verdad)

---

## 2. TABLAS SIN ENTITY (9 Operacionales)

| # | Schema | Tabla | Razon Probable | Accion Recomendada |
|---|--------|-------|----------------|-------------------|
| 1 | gamification_system | comodin_uses | Tabla de auditoria inmutable | Crear entity read-only |
| 2 | social_features | guild_emblems | Tabla lookup/catalogo | Crear entity |
| 3 | social_features | guild_mission_contributions | Tabla relacional N:M | Crear entity |
| 4 | social_features | user_blocks | Feature de bloqueo | Crear entity |
| 5 | social_features | user_reports | Feature de reportes | Crear entity |
| 6 | social_features | team_vs_team_challenges | Feature team battles | Crear entity |
| 7 | communication | conversations | Base para mensajeria | Crear entity |
| 8 | communication | conversation_participants | Relacional N:M | Crear entity |
| 9 | notifications | rate_limit_logs | Tabla de tracking | Crear entity |

**Total entities faltantes a crear:** 9

---

## 3. TABLAS SIN ENTITY (Data Warehouse - Justificado)

16 tablas DW + 2 ML sin entities TypeORM. Acceso via SQL directo/views.

| Tipo | Tablas | Justificacion |
|------|--------|---------------|
| Dimensiones | 8 (dim_*) | SCD lookup, acceso SQL |
| Hechos | 4 (fact_*) | Aggregation, acceso SQL |
| ETL | 2 (etl_*) | Operacional ETL, scripts |
| ML | 2 (ml_*) | ML pipeline, acceso Python/SQL |

**Accion:** Documentar como decision arquitectonica (ADR).

---

## 4. DB_SCHEMAS CONSTANTS

Verificado en `apps/backend/src/shared/constants/database.constants.ts`:

| Constante | Valor | Usado Correctamente |
|-----------|-------|-------------------|
| DB_SCHEMAS.AUTH | auth_management | Si |
| DB_SCHEMAS.AUTH_BASE | auth | Si |
| DB_SCHEMAS.GAMIFICATION | gamification_system | Si |
| DB_SCHEMAS.EDUCATIONAL | educational_content | Si |
| DB_SCHEMAS.PROGRESS | progress_tracking | Si |
| DB_SCHEMAS.SOCIAL | social_features | Si |
| DB_SCHEMAS.CONTENT | content_management | Si |
| DB_SCHEMAS.AUDIT | audit_logging | Si |
| DB_SCHEMAS.NOTIFICATIONS | notifications | Si |
| DB_SCHEMAS.ADMIN_DASHBOARD | admin_dashboard | Si |
| DB_SCHEMAS.SYSTEM_CONFIGURATION | system_configuration | Si |
| DB_SCHEMAS.LTI_INTEGRATION | lti_integration | Si |
| DB_SCHEMAS.COMMUNICATION | communication | Si |
| DB_SCHEMAS.DATA_WAREHOUSE | data_warehouse | Si |

### Entities con schema hardcodeado (no usan constantes)
| Entity | Schema Hardcodeado | Correcto? |
|--------|-------------------|-----------|
| User | 'auth' | Si (AUTH_BASE) |
| UserSuspension | 'auth_management' | Si pero deberia usar DB_SCHEMAS.AUTH |
| UserPreferences | 'auth_management' | Si pero deberia usar DB_SCHEMAS.AUTH |
| DiscussionThread | 'social_features' | Si pero deberia usar DB_SCHEMAS.SOCIAL |

---

## 5. CONSTANTE OBSOLETA

`DB_TABLES.GAMIFICATION.NOTIFICATIONS` = `'notifications'` - No existe tabla `gamification_system.notifications` en DDL ni entity correspondiente. **Eliminar constante.**

---

## 6. MAPPING COMPLETO POR SCHEMA

### auth (1/1 = 100%)
| DDL Table | Entity | Status |
|-----------|--------|--------|
| users | User | MATCH |

### auth_management (17/17 = 100%)
Todas las 17 tablas tienen entity correspondiente. Sin mismatches.

### gamification_system (19/21 = 90.5%)
- 18 MATCH exacto
- 3 NAME MISMATCH (comodin_usage_log/tracking, leaderboard_metadata)
- 1 SIN ENTITY (comodin_uses)

### educational_content (22/22 = 100% con 5 name mismatches)
- 17 MATCH exacto
- 5 NAME MISMATCH

### progress_tracking (20/20 = 100% con 4 name mismatches)
- 16 MATCH exacto
- 4 NAME MISMATCH

### admin_dashboard (3/3 = 100%)
Todas MATCH.

### audit_logging (7/7 = 100% con 2 name mismatches)
- 5 MATCH exacto
- 2 NAME MISMATCH

### content_management (10/10 = 100% con 3 name mismatches)
- 7 MATCH exacto
- 3 NAME MISMATCH

### social_features (25/30 = 83.3%)
- 25 MATCH
- 5 SIN ENTITY (guild_emblems, guild_mission_contributions, user_blocks, user_reports, team_vs_team_challenges)

### notifications (6/7 = 85.7%)
- 6 MATCH
- 1 SIN ENTITY (rate_limit_logs)

### communication (2/4 = 50%)
- 2 MATCH (messages, message_participants)
- 2 SIN ENTITY (conversations, conversation_participants)

### system_configuration (9/9 = 100% con 3 name mismatches)
- 6 MATCH exacto
- 3 NAME MISMATCH

### lti_integration (3/3 = 100% con 1 name mismatch)
- 2 MATCH exacto
- 1 NAME MISMATCH

### data_warehouse (0/16 = 0% - Justificado)
16 tablas sin entity (acceso SQL directo).

---

## 7. SCORE DE COHERENCIA DDL↔ENTITY

| Schema | Tablas | Con Entity | % Cobertura | Name Mismatches |
|--------|--------|-----------|-------------|-----------------|
| auth | 1 | 1 | 100% | 0 |
| auth_management | 17 | 17 | 100% | 0 |
| gamification_system | 21 | 19 | 90.5% | 3 |
| educational_content | 22 | 22 | 100% | 5 |
| progress_tracking | 20 | 20 | 100% | 4 |
| admin_dashboard | 3 | 3 | 100% | 0 |
| audit_logging | 7 | 7 | 100% | 2 |
| content_management | 10 | 10 | 100% | 3 |
| social_features | 30 | 25 | 83.3% | 0 |
| notifications | 7 | 6 | 85.7% | 0 |
| communication | 4 | 2 | 50% | 0 |
| system_configuration | 9 | 9 | 100% | 3 |
| lti_integration | 3 | 3 | 100% | 1 |
| data_warehouse | 16 | 0 | 0% (OK) | 0 |
| **TOTAL (sin DW)** | **154** | **144** | **93.5%** | **21** |
| **TOTAL (con DW)** | **170** | **144** | **84.7%** | **21** |

### Score Final
- **Cobertura entity (sin DW):** 93.5% (144/154)
- **Match exacto (sin mismatches):** 75.3% (116/154)
- **Name mismatches:** 13.6% (21/154) - CRITICO
- **Sin entity:** 6.5% (10/154) - ALTO

---

*Cross-Reference v1.0.0 - 2026-02-05*
