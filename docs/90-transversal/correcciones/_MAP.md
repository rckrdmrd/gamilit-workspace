# _MAP: Correcciones e Issues

**Carpeta:** docs/90-transversal/correcciones/
**Ultima Actualizacion:** 2026-01-07
**Proposito:** Backlog de issues pendientes y reportes de correcciones
**Estado:** Vigente

---

## Contenido Actual

| Archivo | Descripcion | Estado |
|---------|-------------|--------|
| `BACKEND-CRITICAL-ISSUES-PENDING.md` | Issues P0 Backend - estado actualizado | **SSOT** |
| `PLAN-RESTRUCTURACION-DOCUMENTACION-2026-01-06.md` | Plan de restructuración documentación | En ejecución |
| `ANALISIS-ERROR-404-PROGRESS-MODULES.md` | Error 404 en endpoint progress/modules | **CORREGIDO** |

### Archivos Movidos a Archivados (2026-01-06)

| Archivo Original | Destino | Razón |
|-----------------|---------|-------|
| `ISSUES-CRITICOS.md` | `archivados/historicos-2025/correcciones-obsoletas/ISSUES-CRITICOS-2025-10-DEPRECATED.md` | Deprecado desde Oct 2025, todos los 66 issues resueltos |
| `CORRECCIONES-ADMIN-PORTAL-2025-12-26.md` | Pendiente mover | Completado - 23/23 resueltos |

---

## Estado de Issues P0 (Actualizado 2025-01-04)

**SSOT:** `BACKEND-CRITICAL-ISSUES-PENDING.md`

### Issues P0 Backend - TODOS IMPLEMENTADOS

| Issue | Descripcion | Estado |
|-------|-------------|--------|
| P0-001 | Auto-save userId | IMPLEMENTADO |
| P0-003 | Inconsistencia IDs BD | IMPLEMENTADO |
| P0-005 | Password Recovery | IMPLEMENTADO |
| P0-006 | Change Password | IMPLEMENTADO |
| P0-007 | Session Management | IMPLEMENTADO |

**Evidencia:** `docs/archivados/historicos-2025/reportes-analisis/EXECUTION-REPORT-2025-11-28.md`

---

## Correcciones Recientes (2026-01-07)

### CORR-002: Bug Critico - LeaderboardPage No Carga Datos

**Documentacion:** `orchestration/reportes/correcciones/CORR-002-*.md`

| Aspecto | Detalle |
|---------|---------|
| **Problema** | LeaderboardPage no cargaba datos del backend - pagina vacia |
| **Causa Raiz** | Falta de `useEffect` para inicializar carga de datos del store |
| **Solucion** | Agregar `useEffect` que llama `setLeaderboardType('global')` al montar |
| **Archivos modificados** | `LeaderboardPage.tsx` (+5 lineas) |
| **Archivos eliminados** | `AchievementsPage.tsx` (student) - codigo muerto (-567 lineas) |
| **Estado** | ✅ COMPLETADO - Build exitoso |
| **Agente** | Orquestador |
| **Cambios BD** | ❌ Ninguno |
| **Commit** | `3ea547e` |
| **US Afectada** | US-GAM-007 (Leaderboard simple) - 28% → 100% cumplimiento |

### CORR-001: Alineacion Paginas Leaderboard y Achievements (2026-01-04)

**Documentacion:** `orchestration/reportes/correcciones/CORR-001-*.md`

| Aspecto | Detalle |
|---------|---------|
| **Problema** | LeaderboardPage y AchievementsPage no seguian patrones de UI establecidos |
| **Causa Raiz** | Falta de uso de GamifiedHeader y estilos inconsistentes |
| **Solucion** | Alineacion con patrones de DashboardComplete y MissionsPage |
| **Archivos modificados** | `LeaderboardPage.tsx`, `AchievementsPage.tsx` |
| **Estado** | ✅ COMPLETADO - Build exitoso |
| **Agente** | Orquestador + Frontend-Agent |
| **Cambios BD** | ❌ Ninguno |

### CORR-2026-01-04-001: Error 404 en Progress Modules

**Documento:** `ANALISIS-ERROR-404-PROGRESS-MODULES.md`

| Aspecto | Detalle |
|---------|---------|
| **Error** | 404 en GET `/api/v1/progress/users/:userId/modules/:moduleId` |
| **Causa Raíz** | Falta sincronización bidireccional usuarios ↔ módulos |
| **Solución** | Trigger + función para crear module_progress automáticamente |
| **Nuevos objetos** | `gamilit.initialize_module_progress_for_users()`, `trg_initialize_module_progress` |
| **Estado** | ✅ CORREGIDO - Requiere recrear BD |
| **Sub-agentes** | 4 (Backend, Database, Frontend, Historical) |

---

## Correcciones Anteriores (2025-12-26)

### Portal Admin - Sprint 1-4

**Documento:** `CORRECCIONES-ADMIN-PORTAL-2025-12-26.md`

| Prioridad | Identificados | Corregidos | N/A |
|-----------|---------------|------------|-----|
| P0 - CRITICAL | 5 | 5 | 1 |
| P1 - HIGH | 5 | 2 | 3 |
| P2 - MEDIUM | 8 | 3 | 5 |
| P3 - LOW | 5 | 3 | 2 |
| **TOTAL** | **23** | **13** | **11** |

---

## Issues Pendientes de Verificacion (P1)

| Issue | Descripcion | Estado |
|-------|-------------|--------|
| P1-004 | Trigger exercise_submissions | A VERIFICAR |
| P1-005 | Validacion roles endpoints teacher | A VERIFICAR |

---

## Documentacion Movida

Los siguientes archivos fueron movidos a `orchestration/reportes/correcciones/`:

### 2026-01-07

| Archivo | Razon |
|---------|-------|
| `CORR-002-ANALISIS-DETALLADO-LEADERBOARD-ACHIEVEMENTS.md` | Correccion completada - Frontend |
| `CORR-002-PLAN-EJECUCION.md` | Correccion completada - Frontend |
| `CORR-002-REPORTE-EJECUCION.md` | Correccion completada - Frontend |

### 2026-01-04

| Archivo | Razon |
|---------|-------|
| `CORR-001-ANALISIS-LEADERBOARD-ACHIEVEMENTS.md` | Correccion completada - Frontend |
| `CORR-001-PLAN-EJECUCION.md` | Correccion completada - Frontend |
| `CORR-001-REPORTE-EJECUCION.md` | Correccion completada - Frontend |

### 2025-12-18

| Archivo | Razon |
|---------|-------|
| `CORRECCIONES-BUILD-AUTH-2025-11-25.md` | Correccion completada |
| `CORRECCION-GAMIFICACION-RANGOS-2025-11-29.md` | Correccion completada |
| `CORRECCION-EJERCICIOS-MODULO3-REQUIRES-MANUAL-GRADING-2025-11-29.md` | Correccion completada |

**Ver traza completa:** `orchestration/trazas/TRAZA-DOCUMENTACION-DEPRECADA.md`

---

## Navegacion

### Para ver estado actual de issues:
- **Consultar:** `BACKEND-CRITICAL-ISSUES-PENDING.md` (SSOT)

### Para ver correcciones aplicadas:
- Consultar `orchestration/reportes/correcciones/`

### Para ver historico de issues (Oct 2025):
- Consultar `archivados/historicos-2025/correcciones-obsoletas/ISSUES-CRITICOS-2025-10-DEPRECATED.md`

---

## Metricas de Integracion (Ultima validacion: 2025-11-26)

```
Database → Backend:              89.0%
Database → Frontend (via APIs):  86.0%
PROMEDIO GLOBAL:                 87.5%
ESTADO:                          PRODUCTION READY
```

---

**Actualizado:** 2026-01-07
**Por:** Claude Code (Orchestrator Agent)
