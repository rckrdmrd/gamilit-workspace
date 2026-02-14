# PROXIMA ACCION - GAMILIT

**Ultima Actualizacion:** 2026-02-15
**Estado del Proyecto:** MVP 98% completado | **FASE 0-2 COMPLETADAS** | **Production Ready**
**Sprint Actual:** Sin sprint activo
**Ultima Tarea:** TASK-2026-02-15-PLAN-DESARROLLO-INTEGRAL (**FASES 0-2 COMPLETADAS** — commits, correcciones paralelas, cross-refs + RLS)
**Tareas Pendientes:** F4-VALIDATION, temp scripts cleanup, SIMCO archive review

---

## Estado Actual

### TASK-2026-02-15-PLAN-DESARROLLO-INTEGRAL (2026-02-15) - FASES 0-2 COMPLETADAS

**Mega-commit + correcciones paralelas + cross-refs + RLS.**

**FASE 0 — MEGA-COMMIT (6 commits atomicos, 335 archivos):**
- C1: `[GAM-DB]` 28 files — DDL, auth.uid, communication schema, RLS phase4, monitoring
- C2: `[GAM-BACKEND]` 24 files — Redis config, env validation, telemetry, communication module
- C3: `[GAM-FRONTEND]` 28 files — API consolidation, barrel updates, Docker, deletions
- C4: `[GAM-DOCS]` 151 files — Guides, troubleshooting, knowledge-base, standards
- C5: `[GAM-ORCHESTRATION]` 113 files — SIMCO directives, tasks, inventories, profiles
- C6: `[GAM-DEVOPS]` 12 files — Docker, dependabot, CI, root configs

**FASE 1 — CORRECCIONES PARALELAS (5 subagentes, 43 archivos):**
- SA1 Frontend: Metricas verificadas (components: 480, hooks: 102, API calls: 570, API files: 52, barrels: clean)
- SA2 Docs: 15 legacy paths fixed, 2 _INDEX files updated, ALIASES.yml phantom fixed
- SA3 Backend: jest.config.js roots fixed (+test/), CLAUDE.md modules note added, ETL/ML/Viz evaluated
- SA4 DevOps: frontend-ci.yml branches→master + Node 20, backend-ci.yml Node 20
- SA5 Database: 42 ENUMs confirmed unique, RLS coverage analyzed, temp scripts evaluated

**FASE 2 — CORRECCIONES DEPENDIENTES (3 subagentes, 22 archivos):**
- SA-A: 13 cross-reference pairs (26 links) between 9 standards ↔ 11 principios
- SA-B: FORCE RLS + 20 policies for 5 high-risk tables (207→227 policies)
- SA-C: Coverage threshold discrepancy documented (50% jest config vs 80% CLAUDE.md target)

**Metricas actualizadas post-ejecucion:**
- RLS Policies: 207→**227** (Phase 2 FORCE RLS)
- Components: 474→**480** (broad count)
- API Calls: 655→**570** (post-deletion recount)
- API Service Files: 51→**52**
- Spec Files: 59→**60** (test/ now in jest roots)

---

### TASK-2026-02-14-ANALISIS-DOCUMENTACION-GOBERNANZA (2026-02-14) - COMPLETADA

**Auditoria integral de documentacion y gobernanza.** 7 fases, 5 subagentes paralelos, ~500 archivos auditados.

**Correcciones aplicadas (22):**
- SIMCO _INDEX.md v5.0.0: 70 archivos reales, 8 phantoms eliminados, paths core/ corregidos
- CONTEXT-MAP.yml: 7 metricas corregidas (tablas, endpoints, RLS, funciones, triggers, enums, version)
- agents/ALIASES.yml: paths control-plane/ eliminados, standalone paths agregados
- triggers/_INDEX.md: 2 phantoms marcados (PROPAGACION-AUTOMATICA, DUPLICADOS)
- _MAP.md: counts corregidos (agents 57, directivas 124, inventarios 9)
- BOOTLOADER.md: .claude/CLAUDE.md → CLAUDE.md (3 ocurrencias)
- 20-architecture/_INDEX.md: reescrito con indice real (33 archivos)
- MASTER_INVENTORY.yml: tablas 169, triggers 67, RLS 207, coherencia 90.5%
- CLAUDE.md: metricas DB corregidas (RLS 207, triggers 67, funciones 183/249)
- XXfvCRNj artifact eliminado

**Hallazgos principales no corregidos (19 pendientes):**
- DATABASE_INVENTORY.yml: 7 metricas stale (RLS, triggers, tablas, tables por schema)
- referencias/ALIASES.yml: ~25 phantom refs (cleanup completo necesario)
- 90-adr/_MAP.md: 19 ADRs atras
- 12 EPIC files: refs rotas a ADR-0019
- 90+ legacy path refs en docs/
- 53% de estandares sin cross-references

**Output:** `orchestration/tareas/TASK-2026-02-14-ANALISIS-DOCUMENTACION-GOBERNANZA/` (8 reportes)

---

### Accion 6: Crear DDL Faltantes para Schema Communication (2026-02-14) - COMPLETADA

**Hallazgo:** Las 16 funciones, 4 triggers y 1 vista existian en la BD pero solo estaban definidas inline en los 3 archivos de tabla. No habia archivos DDL dedicados como en los demas schemas.

**6 archivos DDL creados:**

| # | Archivo | Contenido |
|---|---------|-----------|
| 1 | `functions/01-trigger-functions.sql` | 4 trigger functions (update_message_tracking_fields, update_message_participant_read, update_conversation_timestamp, update_conv_participant_timestamp) |
| 2 | `functions/02-message-functions.sql` | 2 utility functions (get_unread_count, mark_conversation_read) |
| 3 | `functions/03-message-participant-functions.sql` | 2 utility functions (get_user_unread_count, mark_message_read_for_user) |
| 4 | `functions/04-conversation-functions.sql` | 8 utility functions (create_conversation, get_conversation_participants, get_user_conversations, add/remove_participant, mark_as_read, increment_unread, get_total_unread) |
| 5 | `triggers/01-triggers.sql` | 4 triggers (idempotent: DROP IF EXISTS + CREATE) |
| 6 | `views/01-recent_classroom_messages.sql` | 1 vista (recent_classroom_messages) |

**Validacion:** Todos 6 archivos ejecutados con `ON_ERROR_STOP=1` — 0 errores. Schema intacto: 16 funcs, 4 triggers, 1 view.

### Accion 2b: Investigar 6 DDL Table Files Vacios (2026-02-14) - COMPLETADA

**Hallazgo:** Los 6 archivos DDL contienen SQL valido pero fallaron silenciosamente durante `init-database.sh`.
- **Causa raiz #1:** `gamilit_user` no tiene permisos CREATE en schemas (necesita superuser)
- **Causa raiz #2:** `media_files` tenia ENUM default invalido (`'completed'` → `'ready'`)
- **Causa raiz #3:** `init-database.sh` no usa `ON_ERROR_STOP=1` en batch de tablas

**6 tablas creadas exitosamente como superuser:**

| # | Tabla | Schema | Causa Fallo | Fix |
|---|-------|--------|-------------|-----|
| 1 | media_files | content_management | ENUM default invalido `'completed'` | Fix: `'ready'` + ejecutar como superuser |
| 2 | media_metadatas | content_management | FK a media_files (cascada) + permisos | Ejecutar como superuser |
| 3 | media_attachments | educational_content | Permisos schema | Ejecutar como superuser |
| 4 | classroom_missions | gamification_system | Permisos schema | Ejecutar como superuser |
| 5 | comodin_uses | gamification_system | Permisos schema | Ejecutar como superuser |
| 6 | learning_path_modules | progress_tracking | Permisos schema | Ejecutar como superuser |

**Acciones adicionales:**
- RLS habilitado en las 6 tablas (3 ya tenian policies en su DDL, 3 nuevas policies creadas)
- Permisos GRANT ALL otorgados a `gamilit_user`
- Ownership corregido a `gamilit_user`
- DDL `03-media_files.sql` corregido: `DEFAULT 'completed'` → `DEFAULT 'ready'`
- Comentarios TABLE_MISSING actualizados en 07b/07c-enable-rls

**Metricas actualizadas:** 163 → **169 tablas**, 113 → **119 RLS**, 401 → **418 policies**

### Accion 7: Investigar 18 Admin Endpoints "Not Implemented" (2026-02-14) - COMPLETADA

**Hallazgo:** Los 21 comentarios `Status: Backend NOT implemented` en `apps/frontend/src/services/api/adminAPI.ts` eran **obsoletos**. Los 21 endpoints estan implementados en el backend:
- **21 controllers** en `modules/admin/controllers/` con **158+ endpoints**
- Dashboard: `admin-dashboard.controller.ts` (8 endpoints)
- Users: `admin-users.controller.ts` (11 endpoints) — deleteUser, activateUser, deactivateUser, suspendUser, unsuspendUser
- Roles: `admin-roles.controller.ts` (6 endpoints) — getRoles, getRolePermissions, updateRolePermissions, getAvailablePermissions
- Gamification: `admin-gamification-config.controller.ts` (11 endpoints) — settings, preview, restore
- Content: `admin-content.controller.ts` (7 endpoints) — getApprovalHistory
- System: `admin-system.controller.ts` (13 endpoints) — logs, config categories, validate
- Reports: `admin-reports.controller.ts` (6 endpoints) — scheduleReport

**Accion:** Eliminados 21 comentarios `Backend NOT implemented (P0/P1/P2)` de adminAPI.ts.

### TASK-2026-02-13-FIX-REDIS-WEBSOCKET-STARTUP (2026-02-13/14) - FASE 1 COMPLETADA

**Error original:** `Redis sub client error: Socket closed unexpectedly` al ejecutar `npm run dev`
**Causa Raiz:** Redis no estaba corriendo en WSL cuando el backend arranco.

**FASE 1 - RECREACION BD (COMPLETADA 2026-02-14):**
- Script `init-database.sh` corregido (v4.0): 10 correcciones criticas aplicadas
  - Bug `sudo -v` colgaba en WSL non-interactive (2 fixes)
  - Bug `set -e` + `sudo -S -v` exit 1 = salida silenciosa
  - Bug todos los DDL se ejecutaban como `gamilit_user` sin permisos suficientes
  - Fix: Ejecucion como superuser para funciones, views, MVIEWs, triggers, indexes, RLS
  - Fix: `grant_all_permissions()` post-DDL para acceso gamilit_user
  - Fix: Schemas faltantes agregados (data_warehouse, optimization, communication, notifications)
  - Fix: Cross-schema tables, FK constraints, RLS enable files globales
- BD recreada limpiamente: 163 tablas, 251 funciones, 67 triggers, 254 RLS, 16 views, 4 MVs, 42 ENUMs
- **`auth.uid()` y `gamilit.is_super_admin()` CREADAS** (2026-02-14):
  - DDL: `schemas/auth/functions/01-uid.sql` + `schemas/gamilit/functions/05b-is_super_admin.sql`
  - RLS policies: 203 → 304 (+101 total: 51 desbloqueadas + 53 nuevas para 18 tablas)
  - Tablas con RLS ON/0 policies: 32 → **0** (todas resueltas)
- **RLS enforcement corregido** (2026-02-14):
  - `gamilit_user` cambiado de BYPASSRLS → NOBYPASSRLS (critico: antes ignoraba TODAS las policies)
  - 7 tablas con FORCE ROW LEVEL SECURITY (gamilit_user-owned)
  - Total tablas con FORCE RLS: 24
  - `user_roles` poblada con 48 registros desde `profiles.role` (estaba vacia, rompía policies antiguas)
  - DDL: `07d-rls-policies-pending-tables.sql`
- **DDL naming fixes COMPLETADOS** (2026-02-14, Accion 2):
  - 79 enum refs corregidas: `'admin'` → `IN ('admin_teacher', 'super_admin')` en 07/07b/07c
  - 13 tablas singular→plural corregidas (teacher_contents, lti_grade_passbacks, etc.)
  - 7 columnas corregidas (profile_id, student_id, created_by, following_id, scheduled_by, team_id, visibility)
  - 3 secciones TABLE_MISSING comentadas: classroom_missions, media_files, media_metadata
  - RLS policies: 305 → **401** (+96 nuevas tras re-ejecutar DDLs corregidos)
  - Tablas con RLS ON: 113, con 0 policies: **0**, FORCE RLS: **24**

- **Redis code fixes COMPLETADOS** (2026-02-14, Accion 3 — Fases 2-4,7):
  - **Fase 2:** `config/redis.config.ts` creado (centralizado con registerAs), registrado en app.module.ts
  - **Fase 2:** DB default corregido: 1→0 en redis-io.adapter.ts y message-persistence.service.ts
  - **Fase 3:** Reconnection strategy mejorada: exponential backoff + jitter (ambos archivos)
  - **Fase 3:** Max retries: 5→10
  - **Fase 3:** Log level fix: storePendingMessage `debug`→`warn` cuando Redis no conectado
  - **Fase 3:** `@Optional()` removido de NotificationsGateway (MessagePersistenceService siempre inyectado)
  - **Fase 4:** Redis health check agregado a HealthService (PING con 3s timeout)
  - **Fase 7:** `npm run build` OK, `npm run lint` 0 errores nuevos (7 pre-existentes en otros archivos)
  - Archivos modificados: 7 (redis.config.ts NEW, config/index.ts, app.module.ts, redis-io.adapter.ts, message-persistence.service.ts, notifications.gateway.ts, health.service.ts)

### TASK-2026-02-12-ANALISIS-BD-VS-DOCS (2026-02-12) - COMPLETADA

**Resultado:** Auditoria integral de 396 DDL files, 152 entities, 4 fuentes de documentacion.
- 10 discrepancias criticas identificadas y resueltas
- Baseline real establecido: 171 tablas, 183 funciones, 126 triggers, 42 ENUMs, 298 FKs, 22 views
- 5 sprints de remediacion ejecutados (32 tareas)

**Sprint R1 (COMPLETADO):** Metricas corregidas en 6 archivos
- CLAUDE.md, DATABASE_INVENTORY v8.0.0, MASTER_INVENTORY v8.0.0, MODELO-DATOS.md, database.config.yml

**Sprint R2 (COMPLETADO):** Schema mapping y documentacion
- schema-reference/_INDEX.md v2.0.0: Mapeo fisico<->conceptual completo
- 4 nuevos schema-reference docs: data_warehouse, admin_dashboard, communication, gamilit
- Hallazgo DDL: 4 conflictos de numeracion documentados (no criticos)

**Sprint R3 (COMPLETADO):** Coherencia Entity-DDL
- 4 columnas faltantes corregidas (deleted_at x2, tenant_id, updated_at)
- 2 schemas hardcoded corregidos a DB_SCHEMAS constants
- COHERENCE-ENTITIES-DDL.md v2.0.0 con 22 tablas DDL-only documentadas

**Sprint R4 (COMPLETADO):** Documentacion de Requerimientos
- 15 tablas conceptuales evaluadas: 5 resueltos (naming alias/ya existen), 7 futuro, 3 diferidos
- F4-VALIDATION (9 US, 44 tasks): vigente, metricas de aceptacion actualizadas
- F2-DB-MIGRATION: RF retroactivos no necesarios (documentacion existente cubre)
- 9 batches TASK-2026-02-05: todos completados previamente

**Sprint R5 (COMPLETADO):** Purga y Archivado
- 9 database docs clasificados: 3 vigentes, 3 referencia, 3 obsoletos
- 6 tareas completadas identificadas para archivado
- 16/18 _MAP.md verificados vigentes
- 12/12 scripts vigentes, 0 deprecados
- Referencias internas verificadas (3 menores desactualizadas)

### TASK-2026-02-12-ANALISIS-FRONTEND-INTEGRACION (2026-02-12) - COMPLETADA

**Resultado:** Auditoria integral del frontend React 19 vs documentacion (FRONTEND_INVENTORY, MASTER_INVENTORY, CLAUDE.md).
- 16 hallazgos documentados (2P0, 4P1, 6P2, 4P3), 5 sprints de remediacion ejecutados (F1-F5)
- FRONTEND_INVENTORY.yml reestructurado completamente v5.0.0 (metricas verificadas contra codigo)
- Metricas corregidas: componentes 458→475, hooks 127→102, paginas 85→68, stores 32→14, API services 48→52, mecanicas 40→30, routes 24→70
- 26 stores Zustand fantasma eliminados (NO existian como archivos — eran aspiracionales)
- 662 llamadas API mapeadas a ~350-400 endpoints backend (~40-45% cobertura)
- 6 pares de API services duplicados identificados
- Hallazgo critico: educational.api.ts referencia rota, 18 admin endpoints not implemented
- Mapeo detallado archivo-por-archivo para directivas de agentes (04-MAPEO-ARCHIVOS-FRONTEND.md)

### TASK-2026-02-12-ANALISIS-BACKEND-INTEGRACION (2026-02-12) - COMPLETADA

**Resultado:** Auditoria integral del backend NestJS vs documentacion (BACKEND_INVENTORY, MODELO-DATOS, COHERENCE-ENTITIES-DDL).
- 12 hallazgos documentados, 5 sprints de remediacion ejecutados (B1-B5)
- BACKEND_INVENTORY.yml reestructurado completamente v4.0.0 (22 modulos reales con metricas verificadas)
- Metricas corregidas: 850→899 endpoints, 14→15 guards, 8→5 interceptors, 4→2 filters
- COHERENCE: 87%→89.5% (18 tablas sin entity, down from 22)
- Communication entities: 4/4 resueltas (conversation + conversation-participant + message + message-participant)
- MODELO-DATOS.md: Mapeo conceptual↔fisico agregado (90 tablas clasificadas)
- Hallazgo critico: conversation/conversation-participant entities huerfanas (no en datasource)

### GAM-PURGE-ARCHIVES: Purga de Archivos Obsoletos (2026-02-12) - COMPLETADA

**Resultado:**
- Root `_archive/` eliminado (49 archivos: backups, k8s, inventarios deprecados, reportes SIMCO)
- 70 task archives eliminados (supersedidos por TASK-2026-02-05/06)
- 87 task archives conservados (sprint 2026-01-24, auditorias BD irreemplazables)
- 29 user stories archivadas eliminadas (100% migradas a epics por ADR-034)
- 14 epic task archives eliminados (supersedidos por PLAN.md)
- 13 correcciones archivadas eliminadas (todas resueltas, zero pending)
- 3 perfiles deprecados reducidos a stubs (SECURITY, QA, DOCUMENTATION)
- 1 perfil archivado (PERFIL-ML: no aplica a gamilit)
- 8 tareas completadas archivadas a `_archive/2026-02/`
- Pre-SIMCO archive eliminado (7 archivos obsoletos)
- SIMCO archive conservado (14 archivos, revision Mayo 2026)

### GAM-CLEANUP: Limpieza y Reestructuracion Integral (2026-02-11) - COMPLETADA

**Resultado (Fases 1-8 + Purge):**
- Fase 1: Apps/ roots limpios (35 moves, 2 deletes)
- Fase 2: Duplicados eliminados + legacy archives (187 files, -77K lines)
- Fase 3: docs/ reestructurado (50-guides/ + 60-portals/ creados, 161 files moved)
- Fases 4-8: Completadas en GAM-CLEANUP-P4 a P8
- GAM-PURGE-ARCHIVES: Purga final de archivos verificadamente obsoletos

### TASK-2026-02-06-ANALISIS-INTEGRAL-DOCUMENTACION (2026-02-06) - COMPLETADA

**Resultado:** Analisis integral de 900+ archivos de documentacion con 6 sprints de remediacion.
- 127 hallazgos identificados (24P0/35P1/38P2/30P3), ~85 resueltos (67%)
- 104 RF files creados (cobertura 28%->100%), 6 ADR files, ARCHITECTURE.md reescrito

### TASK-2026-02-05-ANALISIS-INTEGRAL-MODELADO-BD (2026-02-05) - COMPLETADA

**Resultado:** 40 hallazgos (10C/9H/11M/6L/4I), 9 batches de remediacion todos completados.

---

## Proximas Acciones Recomendadas

### Completadas (Items 0-7)

| # | Accion | Estado |
|---|--------|--------|
| 0 | Recrear BD limpia + validacion post-recreacion | **COMPLETADA** |
| 1 | Crear `auth.uid()` y `gamilit.is_super_admin()` + RLS 18 tablas | **COMPLETADA** |
| 2 | Fix DDL naming singular→plural + 6 table files vacios | **COMPLETADA** |
| 3 | Fix Redis code (Fases 2-7) | **COMPLETADA** |
| 4 | Fix communication datasource | **NO ERA BUG** |
| 5 | Fix educational.api.ts broken import | **COMPLETADA** |
| 6 | Crear DDL faltantes communication schema | **COMPLETADA** |
| 7 | Fix 21 admin endpoints "not implemented" comments | **COMPLETADA** |
| 8 | Consolidar 6 pares API services duplicados | **COMPLETADA** (3 consolidados, 3 resueltos antes, 0 pendientes) |

### Pendientes Actuales

| # | Accion | Prioridad | Esfuerzo | Dependencia | Estado |
|---|--------|-----------|----------|-------------|--------|
| 9 | ~~Commitear ~82 archivos untracked~~ | P0 | Bajo | Ninguna | **COMPLETADA** (FASE 0, 6 commits) |
| 10 | ~~Fix HF-05 LTI double prefix bug~~ | P1 | Bajo | Ninguna | **COMPLETADA** (FASE 0 C3) |
| 11 | ~~Fix CI workflow branch refs~~ | P1 | Bajo | Ninguna | **COMPLETADA** (FASE 1 SA4) |
| 12 | ~~Fix ENUMs count en SSOT files~~ | P1 | Bajo | Ninguna | **COMPLETADA** (FASE 0 pre-work) |
| 13 | ~~Batch-fix legacy path refs en docs/~~ | P2 | Medio | Ninguna | **COMPLETADA** (FASE 1 SA2, 15 files fixed) |
| 14 | ~~Fix EPIC/ADR broken workspace-arch refs~~ | P2 | Medio | Ninguna | **COMPLETADA** (FASE 1 SA2, 6 ADRs fixed) |
| 15 | ~~Actualizar 90-adr/_MAP.md~~ | P2 | Medio | Ninguna | **YA ESTABA SINCRONIZADO** (40/40) |
| 16 | ~~FORCE RLS tablas high-risk~~ | P2 | Medio | RLS policies | **COMPLETADA** (FASE 2 SA-B, +5 tablas, +20 policies) |
| 17 | ~~Evaluar 3 modules no importados~~ | P2 | Medio | Ninguna | **COMPLETADA** (FASE 1 SA3: all need data_warehouse, correctly excluded) |
| 18 | ~~Cleanup ALIASES.yml phantom refs~~ | P2 | Medio | Ninguna | **COMPLETADA** (FASE 1 SA2, SIMCO-DEPLOY fixed) |
| 19 | Limpiar 4 temp DB scripts (temp-init/phase2/phase3/seeds.sh) | P3 | Bajo | Ninguna | **EVALUADA** (3 delete, 1 rename — FASE 4) |
| 20 | F4-VALIDATION Ejecucion (9 US, 44 tasks, 89 SP) | P2 | Alto | Ambiente dev activo | Pendiente |
| 21 | SIMCO archive review - integrar gaps criticos | P3 | Medio | Mayo 2026 | Pendiente |
| 22 | Fix jest coverage threshold discrepancy (50% config vs 80% CLAUDE.md) | P3 | Bajo | Ninguna | Pendiente |
| 23 | Add cross-refs for 8 unmatched standards (API, nomenclatura, etc.) | P3 | Bajo | Ninguna | Pendiente |
| 24 | Fix frontend-ci.yml cache-dependency-path (points to non-existent file) | P3 | Bajo | Ninguna | Pendiente |
| 25 | Remove/implement 3 placeholder backend CI jobs (api-docs-check, cache-performance, database-validation) | P3 | Medio | Ninguna | Pendiente |

**Plan desarrollo detallado:** `orchestration/tareas/TASK-2026-02-15-PLAN-DESARROLLO-INTEGRAL/`
**Documento de validación:** `orchestration/tareas/TASK-2026-02-13-FIX-REDIS-WEBSOCKET-STARTUP/02-VALIDACION-POST-RECREACION.md`

---

## Referencia Rapida

| Recurso | Ubicacion |
|---------|-----------|
| Tarea BD-vs-Docs | `orchestration/tareas/TASK-2026-02-12-ANALISIS-BD-VS-DOCS/` |
| Tarea Backend Integration | `orchestration/tareas/TASK-2026-02-12-ANALISIS-BACKEND-INTEGRACION/` |
| Tarea Frontend Integration | `orchestration/tareas/TASK-2026-02-12-ANALISIS-FRONTEND-INTEGRACION/` |
| Inventario Frontend | `orchestration/inventarios/FRONTEND_INVENTORY.yml` (v5.0.0) |
| Resultados R4+R5 | `orchestration/tareas/TASK-2026-02-12-ANALISIS-BD-VS-DOCS/06-SPRINT-R4-R5-RESULTADOS.md` |
| Plan Remediacion | `orchestration/tareas/TASK-2026-02-12-ANALISIS-BD-VS-DOCS/05-PLAN-REMEDIACION.md` |
| Schema Reference | `docs/20-architecture/schema-reference/_INDEX.md` (v2.0.0) |
| Coherencia Entity-DDL | `docs/20-architecture/COHERENCE-ENTITIES-DDL.md` (v2.0.0) |
| Inventario Database | `orchestration/inventarios/DATABASE_INVENTORY.yml` (v8.0.0) |
| Inventario Backend | `orchestration/inventarios/BACKEND_INVENTORY.yml` (v4.0.0) |
| Inventario Master | `orchestration/inventarios/MASTER_INVENTORY.yml` (v8.0.0) |
| F4-VALIDATION | `docs/10-requirements/epics/EPIC-GAM-F4-VALIDATION/` |

---

*Sistema NEXUS v4.1 - SIMCO*
