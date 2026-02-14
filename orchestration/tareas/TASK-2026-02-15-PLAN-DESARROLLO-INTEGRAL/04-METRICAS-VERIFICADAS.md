# 04-METRICAS-VERIFICADAS.md

**Fecha:** 2026-02-15
**Verificado por:** 3 agentes Explore + 1 agente Plan (Claude Opus 4.6)
**Metodo:** Grep/count contra codigo fuente real vs valores en documentacion

---

## Metricas Base de Datos

| Metrica | CLAUDE.md | MASTER_INV | DB_INV | Codigo Real | Estado |
|---------|-----------|-----------|--------|-------------|--------|
| Schemas | 18 | 18 | 18 | 18 | OK |
| Tablas | 169 | 169 | 169 | 169 | OK |
| Views | 22 | 22 | 22 | 22 | OK |
| Materialized Views | 7 | 7 | 7 | 7 | OK |
| Funciones (DDL) | 183 | 183 | 183 | 183 | OK |
| Funciones (runtime) | - | - | - | 249 | OK (label only) |
| Triggers | 67 | 67 | 67 | 67 | OK |
| RLS Policies | 227 | 227 | 227 | **227** (+20 Phase 2) | **FIXED 2026-02-15** |
| Foreign Keys | 298 | 298 | 298 | 298 | OK |
| ENUMs | ~~40~~ **42** | ~~40~~ **42** | ~~40~~ **42** | **42** | **FIXED 2026-02-15** |

### Evidencia ENUMs = 42

Los 42 `CREATE TYPE ... AS ENUM` unicos en `apps/database/ddl/`:

**00-prerequisites.sql (22):**
aal_level, alert_severity, alert_status, attempt_result, attempt_status, audit_action,
auth_provider, bloom_level, bloom_taxonomy, certificate_status, certificate_type,
classroom_role, code_challenge_method, cognitive_level, content_status, content_type,
difficulty_level, enrollment_method, exercise_mechanic, exercise_type, friendship_status,
gamilit_role

**Schema-specific enum files (20):**
achievement_category, achievement_type, comodin_type, etl_load_status, guild_mission_type,
log_level, maya_rank, media_type, metric_type, module_status, notification_priority,
notification_type, processing_status, progress_status, setting_type, shop_item_category,
team_challenge_status, team_role, transaction_type, user_status

**`alert_severity` y `alert_status` confirmados como ENUMs:**
- Definidos en `00-prerequisites.sql` lineas 361 y 365
- `CREATE TYPE audit_logging.alert_severity AS ENUM ('info', 'warning', 'error', 'critical');`
- `CREATE TYPE audit_logging.alert_status AS ENUM ('active', 'acknowledged', 'resolved', 'ignored');`
- La afirmacion anterior "son columnas text" era **FALSA**

---

## Metricas Backend

| Metrica | CLAUDE.md | MASTER_INV | BE_INV | Codigo Real | Estado |
|---------|-----------|-----------|--------|-------------|--------|
| Modulos | 22 | 22 | 22 | 22 | OK |
| Entities | 152 | 152 | 152 | 152 files (153 classes) | OK |
| DTOs | 399 | 399 | 399 | 399 | OK |
| Services | 170 | 170 | 170 | 170 | OK |
| Controllers | 107 | 107 | 107 | 107 | OK |
| Endpoints | 899 | 899 | 899 | 899 | OK |
| Guards | 15 | 15 | 15 | 15 | OK |
| Interceptors | - | 6 | 6 | 6 | OK |
| Datasources | - | - | 11 | 11 | OK |
| Modules imported | - | - | - | 18 (NOT 22) | OK (MEMORY fixed) |
| Tests passing | - | 833 | - | 833 | OK |
| Spec files | - | 59 | - | 60 (test/ included) | **FIXED** jest roots |
| Coverage threshold | 80% (CLAUDE.md) | - | - | 50% (jest.config.js) | **DISCREPANCY** |

---

## Metricas Frontend

| Metrica | CLAUDE.md | MASTER_INV | FE_INV | Codigo Real | Estado |
|---------|-----------|-----------|--------|-------------|--------|
| Componentes .tsx | 480 | 480 | 480 | **480** (broad) / 466 (strict) | **FIXED 2026-02-15** |
| Hooks | ~~101~~ **102** | ~~101~~ **102** | ~~101~~ **102** | **102** | **FIXED 2026-02-15** |
| Paginas | 68 | 68 | 68 | 68 | OK |
| Stores Zustand | 14 | 14 | 14 | 14 | OK |
| API Service Files | 52 | 52 | 52 | **52** | **FIXED 2026-02-15** |
| API Calls Total | 570 | 570 | 570 | **570** | **FIXED 2026-02-15** |
| Routes | 72 | 72 | 72 | 72 | OK |
| Mecanicas | 30 | 30 | 30 | 30 | OK |
| Type Files | 47 | 47 | 47 | 47 | OK |
| Duplicados API | - | - | ~~6~~ **0** | **0** | **FIXED 2026-02-15** |

---

## Hallazgos Frontend

| ID | Descripcion | Estado Anterior | Estado Real | Accion |
|----|-------------|----------------|-------------|--------|
| HF-01 | Broken import educational.api | ACTIVE | RESOLVED | Marcado RESOLVED |
| HF-02 | cn.util.ts duplicado | ACTIVE | RESOLVED | Marcado RESOLVED |
| HF-03 | Dual AuthProvider | ACTIVE | RESOLVED | Marcado RESOLVED |
| HF-04 | 6 API duplicados | ACTIVE | RESOLVED (0 pendientes) | Marcado RESOLVED |
| HF-05 | LTI double prefix | ACTIVE | **FIXED** (lti.api.ts corregido) | Pendiente commit |
| HF-06 | 18 admin not implemented | ACTIVE | RESOLVED | Marcado RESOLVED |

---

## MEMORY.md — 7 Correcciones Aplicadas

| # | Antes | Despues | Archivo/Linea |
|---|-------|---------|--------------|
| 1 | - | - | datasources ya decia 11 (OK, no necesitaba fix) |
| 2 | - | - | modules imported ya decia 18 (OK, no necesitaba fix) |
| 3 | - | - | interceptors ya decia 6 (OK, no necesitaba fix) |
| 4 | "3 resolved, 1 remains, 1 domain-split" | "ALL RESOLVED, 0 pending" | MEMORY.md linea 20 |
| 5 | - | - | auth.uid() ya decia "NOW EXISTS" (OK) |
| 6 | - | - | is_super_admin() ya decia "NOW EXISTS" (OK) |
| 7 | "40 CREATE TYPE (NOT 42)" | "42 CREATE TYPE AS ENUM" | MEMORY.md lineas 74-76 |

**Nota:** Las correcciones 1-3, 5-6 ya estaban correctas en MEMORY.md. Solo 4 y 7 necesitaban fix.

---

*Generado automaticamente por TASK-2026-02-15-PLAN-DESARROLLO-INTEGRAL*
