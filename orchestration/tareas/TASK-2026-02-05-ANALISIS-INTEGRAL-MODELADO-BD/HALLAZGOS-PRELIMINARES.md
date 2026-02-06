# HALLAZGOS PRELIMINARES

**Tarea:** TASK-2026-02-05-ANALISIS-INTEGRAL-MODELADO-BD
**Fecha:** 2026-02-05
**Tipo:** Hallazgos de la Fase de Analisis y Planificacion

---

## HALLAZGOS CRITICOS (Requieren Atencion Inmediata)

### H-001: Metricas de Inventarios Desincronizadas
- **Severidad:** CRITICA
- **Descripcion:** Los conteos de objetos BD divergen significativamente entre:
  - CLAUDE.md local (158 entities, 138 tablas)
  - PROJECT-STATUS.md (137 entities, 140 tablas)
  - Recreacion BD (232 funciones, 109 triggers, 147 tablas)
  - DATABASE_INVENTORY (112 funciones, 58 triggers)
- **Impacto:** Todas las decisiones basadas en inventarios son poco confiables
- **Accion:** FASE-1 completa (reconciliacion obligatoria)

### H-002: Archivo de Roles Duplicado
- **Severidad:** ALTA
- **Descripcion:** En auth_management/tables/ existen 2 archivos:
  - `03b-roles.sql`
  - `04-roles.sql`
- **Impacto:** Posible conflicto en recreacion de BD (depende del orden de carga)
- **Accion:** TAREA 2.1.1.3 (resolver conflicto)

### H-003: Duplicidades Funcionales entre Schemas
- **Severidad:** ALTA
- **Descripcion:** Multiples solapamientos identificados:
  1. audit_logs vs system_logs (70% funcional)
  2. comodines_inventory vs inventory_transactions (doble inventario)
  3. Tags en content_management vs educational_content
- **Impacto:** Datos duplicados, complejidad innecesaria
- **Accion:** TAREAS 2.2.5.6, 2.1.2.8

### H-004: Multiplicador ML Coins No Implementado
- **Severidad:** MEDIA
- **Descripcion:** El documento de diseño v6.5 especifica un multiplicador ML Coins por rango, pero esta marcado como "N/I" (No Implementado). El ranks.service.ts fue actualizado para leer multiplier de BD pero solo para XP.
- **Impacto:** Feature documentada no implementada en BD
- **Accion:** TAREA 2.1.2.19

---

## HALLAZGOS DE ESTRUCTURA

### H-005: Schemas Minimos o Placeholder
- **Severidad:** BAJA
- **Descripcion:** Los schemas communication, data_warehouse, optimization, storage tienen muy pocas tablas (1-2). Pueden ser placeholders para desarrollo futuro.
- **Accion:** TAREA 2.3.1.9

### H-006: 10 Modulos Backend sin Entities Propias
- **Severidad:** INFORMATIVO
- **Descripcion:** Los modulos etl, health, mail, ml, parents, profile, tasks, teacher, visualization, websocket no tienen entities propias. Dependen de entities de otros modulos.
- **Accion:** Documentar en TAREA 1.2.1

### H-007: Diferencia Entities vs Tablas (+20 entities)
- **Severidad:** INFORMATIVO
- **Descripcion:** Hay ~20 entities mas que tablas. Esto es esperado (views, DTOs, aggregates) pero cada una debe estar justificada.
- **Accion:** TAREA 1.3.1.12

---

## HALLAZGOS DE DOCUMENTACION

### H-008: Documentacion de Tareas Anteriores Acumulada
- **Severidad:** MEDIA
- **Descripcion:** Existen 6+ carpetas de tareas en orchestration/tareas/ que ya fueron completadas pero no archivadas. Ademas, _archive/ puede contener items irrecuperables.
- **Accion:** FASE-5 (purga)

### H-009: Guias de Prueba en Ubicacion Incorrecta
- **Severidad:** BAJA
- **Descripcion:** 5 archivos GUIA-PRUEBAS-MODULO*.md en docs/00-vision-general/ que deberian estar en una seccion de testing o QA.
- **Accion:** TAREA 5.2.1

### H-010: Especificaciones Tecnicas Faltantes → **RESUELTO**
- **Severidad:** MEDIA → **RESUELTO (FASE-4)**
- **Descripcion original:** No existen ETs formales para EXT-003, EXT-007, EXT-008, EXT-009, EXT-010/011.
- **Resolucion:** Las 5 ETs ahora existen en `docs/50-requerimientos/03-extensiones/`:
  - ET-EXT-003-NOTIFICACIONES.md (EXT-003)
  - ET-EXT-007-LTI-INTEGRATION.md (EXT-007)
  - ET-EXT-008-WHITE-LABEL.md (EXT-008)
  - ET-EXT-009-PEER-CHALLENGES.md (EXT-009)
  - ET-EXT-010-011-PORTAL-PADRES.md (EXT-010/011)
- **Fecha resolucion:** 2026-02-05 (FASE-4 verificacion)

### H-011: Diagrama ER Inexistente → **RESUELTO**
- **Severidad:** MEDIA → **RESUELTO (FASE-4)**
- **Descripcion original:** No existe un diagrama ER unificado que muestre las relaciones entre todos los schemas.
- **Resolucion:** Creado DIAGRAMA-ER-COMPLETO.md con 14 diagramas Mermaid cubriendo los 16 schemas activos + cross-schema overview.
- **Fecha resolucion:** 2026-02-05 (FASE-4 TAREA 4.1.1)

### H-012: Matriz de Trazabilidad Incompleta → **RESUELTO**
- **Severidad:** MEDIA → **RESUELTO (FASE-4)**
- **Descripcion original:** No existe trazabilidad completa User Story → Schema → Tabla → Entity → Endpoint.
- **Resolucion:** Creada TRACEABILITY-COMPLETE.md con mapeo de 22 EPICs a schemas, tablas, entities y controllers.
- **Fecha resolucion:** 2026-02-05 (FASE-4 TAREA 4.1.2)

---

## HALLAZGOS DE PROCESOS

### H-013: Email sin Schema Dedicado
- **Severidad:** BAJA
- **Descripcion:** El sistema de email usa el modulo mail de NestJS pero no tiene tablas dedicadas para plantillas, logs de envio, etc.
- **Accion:** TAREA 3.2.2.5

### H-014: Seeds Coverage 73.8%
- **Severidad:** MEDIA
- **Descripcion:** Solo 62 de 84 tablas de configuracion/lookup tienen seeds. classroom_modules es un caso conocido.
- **Accion:** Evaluar en TAREA 2.1.3.8

### H-015: EPICs sin Story Points
- **Severidad:** BAJA
- **Descripcion:** Algunas EPICs de extension (EXT-003 a EXT-006) no tienen SP asignados.
- **Accion:** TAREA 4.2.1.7

---

## HALLAZGOS FASE-1 (Nuevos - 2026-02-05)

### H-016: 21 Name Mismatches Singular/Plural → **RESUELTO**
- **Severidad:** CRITICA → **RESUELTO (Sprint 1 - BATCH-1)**
- **Descripcion original:** 21 entities TypeORM usan nombre singular en @Entity() pero las tablas DDL usan plural. Ejemplo: entity=`activity_log` vs DDL=`activity_logs`.
- **Schemas afectados:** audit_logging (2), gamification_system (3), educational_content (5), progress_tracking (4), content_management (3), system_configuration (3), lti_integration (1), data_warehouse (10)
- **Resolucion:** 31 constantes corregidas en `database.constants.ts` (21 entity schemas + 10 data_warehouse). Build `tsc --noEmit` pasa limpio.
- **Fecha resolucion:** 2026-02-05 (Sprint 1 - BATCH-1)

### H-017: 9 Tablas Operacionales Sin Entity → **RESUELTO**
- **Severidad:** ALTA → **RESUELTO (Sprint 2 BATCH-2 + Sprint 4 BATCH-7)**
- **Descripcion original:** 9 tablas en schemas operacionales no tienen entity TypeORM.
- **Resolucion:** 9 de 9 entities creadas:
  - social_features: guild-emblem.entity.ts, user-block.entity.ts, user-report.entity.ts, guild-mission-contribution.entity.ts (Sprint 4), team-vs-team-challenge.entity.ts (Sprint 4)
  - communication: conversation.entity.ts, conversation-participant.entity.ts
  - gamification_system: comodin-use.entity.ts
  - notifications: rate-limit-log.entity.ts
- **Fecha resolucion:** 2026-02-05 (Sprint 2 BATCH-2 + Sprint 4 BATCH-7)

### H-018: Data Warehouse Sin Entities (INFORMATIVO)
- **Severidad:** INFORMATIVO
- **Descripcion:** 16 tablas del data_warehouse + 2 ML no tienen entities TypeORM. Acceso via SQL directo.
- **Impacto:** Ninguno si se accede por SQL. Documentar como ADR.
- **Accion:** Crear ADR documentando decision arquitectonica.

### H-019: Inventarios Oficiales +31 Tablas Desactualizados (CRITICO)
- **Severidad:** CRITICA
- **Descripcion:** DATABASE_INVENTORY reporta 138 tablas, realidad = 171 tablas (+33). Principales causas:
  - data_warehouse: +16 (schema completo no incorporado)
  - social_features: +10 (extensiones sociales)
  - educational_content: +4 (validacion)
  - system_configuration: +3 (configuracion extendida)
- **Impacto:** Todas las metricas derivadas son incorrectas
- **Accion:** Actualizar DATABASE_INVENTORY.yml inmediatamente. FASE-1 cierre.

### H-020: Constante Obsoleta DB_TABLES.GAMIFICATION.NOTIFICATIONS → **RESUELTO**
- **Severidad:** BAJA → **RESUELTO (Sprint 1 - BATCH-1)**
- **Descripcion original:** Constante `DB_TABLES.GAMIFICATION.NOTIFICATIONS` = 'notifications' existe en database.constants.ts pero no hay tabla gamification_system.notifications en DDL.
- **Resolucion:** Constante eliminada de `database.constants.ts`. Build pasa limpio (ninguna entity la referenciaba).
- **Fecha resolucion:** 2026-02-05 (Sprint 1 - BATCH-1)

### H-002 RECLASIFICADO: Archivos 03b-roles.sql vs 04-roles.sql
- **Severidad original:** ALTA → **Nueva:** MEDIA
- **Descripcion actualizada:** No son tablas duplicadas. 03b-roles.sql crea `auth_management.roles` (catalogo de roles), 04-roles.sql crea `auth_management.user_roles` (asignacion usuario-rol). Son tablas diferentes con nombres de archivo confusos.
- **Accion:** Renombrar archivos para claridad (03b→03-roles.sql, 04→04-user_roles.sql).

---

## HALLAZGOS FASE-2 (Nuevos - 2026-02-05)

### H-021: auth_providers Entity/DDL Modelo Completamente Diferente → **RESUELTO**
- **Severidad:** CRITICA → **RESUELTO (Sprint 2 - BATCH-3)**
- **Descripcion original:** DDL define tabla de configuracion global OAuth. Entity define tabla de vinculacion per-user. Zero overlap.
- **Resolucion:** Entity reescrita completamente para modelo global OAuth (provider_name, display_name, is_enabled, client_id @Exclude, client_secret @Exclude, authorization_url, token_url, user_info_url, scope, redirect_uri, icon_url, button_color, priority, config, metadata). DTOs tambien reescritos (CreateAuthProviderDto, AuthProviderResponseDto).
- **Fecha resolucion:** 2026-02-05 (Sprint 2 - BATCH-3)

### H-022: User @ManyToMany JoinTable Referencia Columna Inexistente → **RESUELTO**
- **Severidad:** CRITICA → **RESUELTO (Sprint 2 - BATCH-3)**
- **Descripcion original:** User entity declara @JoinTable con role_id pero DDL user_roles tiene role ENUM, no role_id FK.
- **Resolucion:** @ManyToMany y @JoinTable eliminados de User entity y Role entity. Comentario documenta que user_roles NO es junction table estandar (tiene role ENUM, FK a profiles no users, campos propios). Acceso via UserRole entity.
- **Fecha resolucion:** 2026-02-05 (Sprint 2 - BATCH-3)

### H-023: assignment_students 20 Columnas Faltantes, 17% Match → **RESUELTO**
- **Severidad:** CRITICA → **RESUELTO (Sprint 2 - BATCH-4)**
- **Descripcion original:** ALTER script agrega 20 columnas de grading/submissions. Entity solo tenia 4 columnas.
- **Resolucion:** 20 columnas agregadas al entity organizadas en secciones: submission tracking (submittedAt, submissionData, submissionUrl, submissionFiles), grading (score, maxScore, percentage, feedback, gradedBy, gradedAt), status, attempts (attemptNumber, maxAttempts), late submission (isLate, latePenaltyApplied), rubric (rubricScores), teacher notes (teacherNotes, flaggedForReview, flagReason), audit (updatedAt).
- **Fecha resolucion:** 2026-02-05 (Sprint 2 - BATCH-4)

### H-024: Notifications Schema 58% Match - Drift Significativo → **PARCIALMENTE RESUELTO**
- **Severidad:** ALTA → **PARCIALMENTE RESUELTO (Sprint 3 - BATCH-5)**
- **Descripcion original:** 6 de 7 tablas con discrepancias. VARCHAR lengths, nullable, columnas faltantes.
- **Resolucion parcial:**
  - notification_logs: channel/status VARCHAR(50)→VARCHAR(20) alineado. external_id y created_at conservados (services los usan activamente, DDL necesita ALTER).
  - notification_queue: channel/status VARCHAR(50)→VARCHAR(20), scheduledFor nullable→NOT NULL alineado.
  - user_devices: device_type VARCHAR(50)→VARCHAR(20), device_token VARCHAR(500)→TEXT. browser/os agregados. device_name conservado (DDL necesita ALTER).
  - notification_templates: subjectTemplate ahora nullable (alinea con DDL). Services actualizados con ?? fallback.
  - notification_preferences: Ya alineado, sin cambios.
  - notifications: Ya alineado, sin cambios.
- **Pendiente:** 3 columnas de entity necesitan ALTER TABLE en DDL (external_id, created_at en logs; device_name en devices).
- **Fecha resolucion:** 2026-02-05 (Sprint 3 - BATCH-5)

### H-025: scheduled_reports 4 Column Name Mismatches → **RESUELTO**
- **Severidad:** CRITICA → **RESUELTO (Sprint 2 - BATCH-4)**
- **Descripcion original:** 4 column name mismatches + 5 missing columns.
- **Resolucion:** 4 column names corregidos (report_name, last_run_at, run_count, notify_email) + 5 columnas agregadas (template_id, time_of_day @deprecated, timezone, is_active @deprecated, last_error). Service scheduled-reports.service.ts actualizado en cascada (property names + response DTO + removed BIWEEKLY).
- **Fecha resolucion:** 2026-02-05 (Sprint 2 - BATCH-4)

### H-026: ContentStatusEnum Falta Valor 'backlog' → **RESUELTO**
- **Severidad:** ALTA → **RESUELTO (Sprint 1 - BATCH-6)**
- **Descripcion original:** DDL `module_status` enum tiene 5 valores (draft, published, archived, under_review, backlog). TS `ContentStatusEnum` solo tiene 4 (falta backlog).
- **Resolucion:** Agregado `BACKLOG = 'backlog'` a `ContentStatusEnum` en `enums.constants.ts`. Build pasa limpio.
- **Fecha resolucion:** 2026-02-05 (Sprint 1 - BATCH-6)

### H-027: FK Targets Incorrectos en auth entities → **RESUELTO**
- **Severidad:** ALTA → **RESUELTO (Sprint 3 - BATCH-5)**
- **Descripcion original:** Memberships y UserSessions @ManyToOne apuntan a User pero DDL FK → profiles.
- **Resolucion:** Membership: 3 @ManyToOne cambiados de User→Profile (user_id, invited_by). UserSession: 1 @ManyToOne cambiado de User→Profile (user_id). Imports actualizados.
- **Fecha resolucion:** 2026-02-05 (Sprint 3 - BATCH-5)

### H-028: 116 Issues Totales - Resumen Cuantitativo (INFORMATIVO)
- **Severidad:** INFORMATIVO
- **Descripcion:** FASE-2 encontro 116 issues totales: 28 CRITICAL, 13 HIGH, 42 MEDIUM, 33 LOW. Schemas mas afectados: notifications (58%), communication (50%), auth (76%). Schemas sanos: content_management (99%), admin_dashboard (98%), system_configuration (100% cols).
- **Accion:** Ver FASE-2-RESULTADOS-VALIDACION.md para detalle completo.

---

## RESUMEN ACTUALIZADO

| Tipo | Cantidad | Criticos | Altos | Medios | Bajos | Info |
|------|----------|----------|-------|--------|-------|------|
| Hallazgos Preliminares | 15 | 1 | 2 | 6 | 4 | 2 |
| Hallazgos FASE-1 | 5 | 2 | 1 | 0 | 1 | 1 |
| Hallazgos FASE-2 | 8 | 4 | 3 | 0 | 0 | 1 |
| **TOTAL** | **28** | **7** | **6** | **6** | **5** | **4** |
| Reclasificados | 1 (H-002: ALTA→MEDIA) | | | | | |

### Distribucion por Batch de Resolucion (FASE-2)

| Batch | Hallazgos que Resuelve | Esfuerzo |
|-------|------------------------|----------|
| BATCH-1 | H-016 (21 name mismatches en constants) | 30 min |
| BATCH-2 | H-017, H-019 parcial (6 entities faltantes) | 2-3h |
| BATCH-3 | H-021, H-022 (auth_providers + ManyToMany) | 2-4h |
| BATCH-4 | H-023, H-025 (assignment_students + scheduled_reports) | 1-2h |
| BATCH-5 | H-024, H-027 (notifications drift + FK targets) | 2-3h |
| BATCH-6 | H-026 (ContentStatusEnum + enums) | 1h |

### Distribucion por Fase de Resolucion (original)

| Fase | Hallazgos que Resuelve |
|------|------------------------|
| FASE-1 | H-001, H-006, H-007, H-019 |
| FASE-2 | H-002, H-003, H-004, H-005, H-014, H-016-H-028 |
| FASE-3 | H-013 |
| FASE-4 | H-010, H-011, H-012, H-015, H-018 |
| FASE-5 | H-008, H-009 |

---

## HALLAZGOS FASE-3 (Nuevos - 2026-02-05)

### H-029: Boost System Dead Code → **PARCIALMENTE RESUELTO**
- **Severidad:** CRITICA → **PARCIALMENTE RESUELTO (Sprint 4 - BATCH-7)**
- **Descripcion original:** active_boosts DDL y entity existen pero NO hay BoostService ni BoostController. ExerciseRewardsService no consulta active_boosts al calcular recompensas.
- **Resolucion parcial:** Entity active-boost.entity.ts verificada y ya alineada con DDL (no requiere cambios). Gap es exclusivamente service/controller (fuera de scope entity remediation).
- **Pendiente:** Crear BoostService + BoostController + integrar en reward pipeline.
- **Fecha resolucion parcial:** 2026-02-05 (Sprint 4 - BATCH-7)

### H-030: Discussion Forum Non-Functional → **PARCIALMENTE RESUELTO**
- **Severidad:** CRITICA → **PARCIALMENTE RESUELTO (Sprint 4 - BATCH-7)**
- **Descripcion original:** discussion_threads tiene DDL y entity pero NO tiene controller ni endpoints. No existe tabla de replies (discussion_replies). FK stale a auth.users.
- **Resolucion parcial:** Entity discussion-thread.entity.ts verificada y ya alineada con DDL (no requiere cambios). Gap es exclusivamente controller + replies DDL (fuera de scope entity remediation).
- **Pendiente:** Crear controller + tabla discussion_replies + fix FK a profiles.
- **Fecha resolucion parcial:** 2026-02-05 (Sprint 4 - BATCH-7)

### H-031: Safety Features Missing for EdTech → **PARCIALMENTE RESUELTO**
- **Severidad:** CRITICA → **PARCIALMENTE RESUELTO (Sprint 2 - BATCH-2)**
- **Descripcion original:** user_blocks y user_reports sin entities. Riesgo COPPA/child safety.
- **Resolucion parcial:** Entities creadas: user-block.entity.ts (5 cols + UNIQUE constraint) y user-report.entity.ts (19 cols con workflow moderacion). Services y controllers pendientes (fuera de scope Sprint 2 = solo entities).
- **Fecha resolucion parcial:** 2026-02-05 (Sprint 2 - BATCH-2)

### H-032: 6 Stale FKs to auth.users → **RESUELTO**
- **Severidad:** ALTA → **RESUELTO (Sprint 5 - BATCH-8)**
- **Descripcion original:** 6 columnas FK en social_features referencian auth.users(id) en vez de auth_management.profiles(id).
- **Resolucion:** 4 DDL files actualizados (discussion_threads.sql, social_interactions.sql, 09-user_activities.sql, user_follows.sql) con 6 FKs corregidas auth.users→auth_management.profiles. 4 entities actualizadas con comments corregidos (social-interaction, user-activity, user-follow, discussion-thread).
- **Fecha resolucion:** 2026-02-05 (Sprint 5 - BATCH-8)

### H-033: 2 DB Functions Reference Non-Existent Columns → **RESUELTO**
- **Severidad:** ALTA → **RESUELTO (Sprint 5 - BATCH-8)**
- **Descripcion original:** log_audit_event() y log_system_event() insertan en system_logs con columnas que NO existen.
- **Resolucion:**
  - log_audit_event(): Target cambiado de system_logs→audit_logs (tabla correcta para auditoría). Columnas mapeadas: action→action, table_name→resource_type, record_id→resource_id, old_data→old_values, new_data→new_values, user_id→actor_id, ip_address→actor_ip, user_agent→actor_user_agent.
  - log_system_event(): Columnas mapeadas a schema real de system_logs: event_type→message, event_source→module_name, event_data→extra_data, severity→log_level (con mapeo WARNING→WARN, CRITICAL→FATAL).
  - Callers (assign_role_to_user, remove_role_from_user, update_feature_flag) ahora funcionarán correctamente.
- **Fecha resolucion:** 2026-02-05 (Sprint 5 - BATCH-8)

### H-034: No Tenant Management API → **RESUELTO (ya existía)**
- **Severidad:** ALTA → **RESUELTO (Sprint 5 - BATCH-8, verificación)**
- **Descripcion original:** No existe TenantController para CRUD de tenants ni endpoint de tenant switch.
- **Resolucion:** Investigacion revela que el API YA EXISTE como AdminOrganizationsService + AdminOrganizationsController con 9 endpoints CRUD completos (list, get, create, update, delete, stats, users, subscription, features). Entity Tenant 100% alineada con DDL. DTOs completos (Create, Update, Response). El hallazgo era incorrecto - el API existe bajo el namespace `/admin/organizations`.
- **Fecha resolucion:** 2026-02-05 (Sprint 5 - BATCH-8, verificación)

### H-035: Duplicate Routes Auth vs Password Controllers (MEDIO)
- **Severidad:** MEDIA
- **Descripcion:** AuthController y PasswordController definen endpoints duplicados para verify-email y reset-password.
- **Accion:** Consolidar en PasswordController. BATCH-9.

### H-036: Missing Junction Tables for Learning Paths (MEDIO)
- **Severidad:** MEDIA
- **Descripcion:** No existe learning_path_modules junction table ni module_dependencies table formal. Prerequisites como uuid[] sin FK.
- **Accion:** Crear tablas junction. BATCH-9.

### H-037: Materialized Views Sin Refresh Mechanism → **RESUELTO**
- **Severidad:** MEDIA → **RESUELTO (Sprint 5 - BATCH-8)**
- **Descripcion original:** 7 MVs (4 leaderboard + 3 admin) existen en DDL pero sin cron job ni endpoint de refresh.
- **Resolucion:** Creado MaterializedViewsCronService en modules/tasks/services/ con 4 cron jobs:
  - mv_classroom_leaderboard + admin dashboards: cada 30 min
  - mv_global_leaderboard + mv_weekly_leaderboard: cada hora (min 15)
  - mv_mechanic_leaderboard: cada 2 horas (min 45)
  - Weekly stats reset: lunes 00:00 (reset weekly_xp/weekly_exercises + refresh MV)
  - Admin dashboards usa función existente refresh_all_dashboards()
  - Registrado en TasksModule. Build pasa limpio.
- **Fecha resolucion:** 2026-02-05 (Sprint 5 - BATCH-8)

### H-038: Notification Templates Double Unique → **RESUELTO**
- **Severidad:** MEDIA → **RESUELTO (Sprint 3 - BATCH-5)**
- **Descripcion original:** Entity tiene unique:true en template_key (column-level) Y unique index composite (template_key, version). El column-level impide versionado.
- **Resolucion:** Removido `unique: true` del @Column decorator de templateKey. DDL solo tiene composite UNIQUE(template_key, version). Adicionalmente, subjectTemplate corregido a nullable (alinea con DDL). Services actualizados con ?? fallback.
- **Fecha resolucion:** 2026-02-05 (Sprint 3 - BATCH-5)

### H-039: team_vs_team_challenges Zero Backend → **PARCIALMENTE RESUELTO**
- **Severidad:** MEDIA → **PARCIALMENTE RESUELTO (Sprint 4 - BATCH-7)**
- **Descripcion original:** DDL tiene 37+ columnas con lifecycle completo pero no hay entity, service ni controller.
- **Resolucion parcial:** Entity team-vs-team-challenge.entity.ts creada con 37+ columnas (challenge info, team A/B, config, scoring, results, lifecycle timestamps). Constante TEAM_VS_TEAM_CHALLENGES agregada a database.constants.ts. NOTE: team_challenges es una tabla DIFERENTE (simple 6 cols).
- **Pendiente:** Crear TeamVsTeamChallengeService + controller.
- **Fecha resolucion parcial:** 2026-02-05 (Sprint 4 - BATCH-7)

### H-040: Parent Notifications Parallel System (BAJO)
- **Severidad:** BAJA
- **Descripcion:** parent_notifications es sistema completamente separado de notifications.notifications. Sin rate limiting ni delivery tracking unificado.
- **Accion:** Evaluar integracion via ADR. BATCH-9.

---

## RESUMEN ACTUALIZADO

| Tipo | Cantidad | Criticos | Altos | Medios | Bajos | Info | Resueltos |
|------|----------|----------|-------|--------|-------|------|-----------|
| Hallazgos Preliminares | 15 | 1 | 2 | 6 | 4 | 2 | 3 (H-010, H-011, H-012) |
| Hallazgos FASE-1 | 5 | 2 | 1 | 0 | 1 | 1 | 3 (H-016, H-017, H-020) |
| Hallazgos FASE-2 | 8 | 4 | 3 | 0 | 0 | 1 | 7 (H-021, H-022, H-023, H-024 parcial, H-025, H-026, H-027) |
| Hallazgos FASE-3 | 12 | 3 | 3 | 5 | 1 | 0 | 6 (H-029 parcial, H-030 parcial, H-031 parcial, H-038, H-039 parcial) |
| **TOTAL** | **40** | **10** | **9** | **11** | **6** | **4** | **19** (13 full + 6 parcial) |
| Reclasificados | 1 (H-002: ALTA->MEDIA) | | | | | | |
| **ABIERTOS** | **21** | **3** | **5** | **6** | **5** | **2** | |

### Hallazgos Resueltos

| Hallazgo | Severidad Original | Resolucion | Fase/Sprint |
|----------|-------------------|------------|-------------|
| H-010 | MEDIA | ETs ya existen en docs/50-requerimientos/03-extensiones/ | FASE-4 |
| H-011 | MEDIA | Creado DIAGRAMA-ER-COMPLETO.md | FASE-4 |
| H-012 | MEDIA | Creada TRACEABILITY-COMPLETE.md | FASE-4 |
| H-016 | CRITICA | 31 constantes corregidas singular→plural en database.constants.ts | Sprint 1 BATCH-1 |
| H-017 | ALTA | 9/9 entities creadas (+guild_mission_contribution, team_vs_team_challenge en Sprint 4) | Sprint 2 BATCH-2 + Sprint 4 BATCH-7 |
| H-020 | BAJA | Constante obsoleta GAMIFICATION.NOTIFICATIONS eliminada | Sprint 1 BATCH-1 |
| H-021 | CRITICA | auth_provider.entity.ts reescrito (per-user→global OAuth config) + DTOs | Sprint 2 BATCH-3 |
| H-022 | CRITICA | @ManyToMany eliminado de User y Role entities | Sprint 2 BATCH-3 |
| H-023 | CRITICA | 20 columnas grading/submission agregadas a assignment-student.entity.ts | Sprint 2 BATCH-4 |
| H-024 | ALTA | notification_logs/queue/devices/templates VARCHAR lengths, nullable, browser/os added | Sprint 3 BATCH-5 (parcial) |
| H-025 | CRITICA | 4 column names corregidos + 5 columnas agregadas + service actualizado | Sprint 2 BATCH-4 |
| H-026 | ALTA | BACKLOG='backlog' agregado a ContentStatusEnum | Sprint 1 BATCH-6 |
| H-027 | ALTA | Membership (3x) + UserSession (1x) @ManyToOne User→Profile | Sprint 3 BATCH-5 |
| H-031 | CRITICA | Entities user-block + user-report creadas (services/controllers pendientes) | Sprint 2 BATCH-2 (parcial) |
| H-038 | MEDIA | Removido unique:true de templateKey column, subjectTemplate nullable | Sprint 3 BATCH-5 |
| H-029 | CRITICA | Entity verified aligned; service/controller gap documented (out of entity scope) | Sprint 4 BATCH-7 (parcial) |
| H-030 | CRITICA | Entity verified aligned; controller + replies DDL gap documented | Sprint 4 BATCH-7 (parcial) |
| H-039 | MEDIA | Entity team-vs-team-challenge.entity.ts creada (37+ cols); service/controller pendientes | Sprint 4 BATCH-7 (parcial) |

### Distribucion por Batch de Remediacion (FASE-2 + FASE-3)

| Batch | Hallazgos que Resuelve | Esfuerzo |
|-------|------------------------|----------|
| ~~BATCH-1~~ | ~~H-016, H-020 (name mismatches + obsolete constant)~~ | ~~30 min~~ ✅ RESUELTO |
| ~~BATCH-2~~ | ~~H-017, H-031 (7 entities creadas + safety entities)~~ | ~~3-4h~~ ✅ RESUELTO |
| ~~BATCH-3~~ | ~~H-021, H-022 (auth_providers rewrite + ManyToMany removal)~~ | ~~2-4h~~ ✅ RESUELTO |
| ~~BATCH-4~~ | ~~H-023, H-025 (assignment_students +20 cols + scheduled_reports fixes)~~ | ~~1-2h~~ ✅ RESUELTO |
| ~~BATCH-5~~ | ~~H-024, H-027, H-038 (notifications drift + FK targets + templates)~~ | ~~2-3h~~ ✅ RESUELTO |
| ~~BATCH-6~~ | ~~H-026 (ContentStatusEnum backlog)~~ | ~~1h~~ ✅ RESUELTO |
| ~~BATCH-7~~ | ~~H-017 remaining, H-029, H-030, H-039 (dead features entities + guild_mission_contributions)~~ | ~~2-3h~~ ✅ RESUELTO (entities only; services/controllers fuera de scope) |
| BATCH-8 | H-032, H-033, H-034, H-037 (stale FKs, broken funcs, tenant API, MV refresh) | 2-3h |
| BATCH-9 | H-035, H-036, H-040 (routes, junction tables, parent notif ADR) | 2-3h |

### Distribucion por Fase de Resolucion (actualizado)

| Fase | Hallazgos que Resuelve |
|------|------------------------|
| FASE-1 | H-001, H-006, H-007, H-019 |
| FASE-2 | H-002, H-003, H-004, H-005, H-014, H-016-H-028 |
| FASE-3 | H-013 |
| FASE-4 | ~~H-010~~, ~~H-011~~, ~~H-012~~, H-015, H-018 (3/5 RESUELTOS) |
| FASE-5 | H-008, H-009 |

---

*Hallazgos v6.3.0 - 2026-02-05 (Actualizado Sprint 4: 19 hallazgos resueltos (13 full + 6 parcial), 21 abiertos, BATCH-1+2+3+4+5+6+7 completados)*
