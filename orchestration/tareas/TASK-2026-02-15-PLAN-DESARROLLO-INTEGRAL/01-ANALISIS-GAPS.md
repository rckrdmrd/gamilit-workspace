# 01-ANALISIS-GAPS.md — Gap Matrix por Dominio

**Fecha:** 2026-02-15
**Estado:** FASE 0 completada, FASE 1 pendiente (analisis detallado)

---

## Resumen de Gaps Documentacion vs Codigo

### Database Gaps

| Gap | Severidad | Estado | Detalle |
|-----|-----------|--------|---------|
| ENUMs count 40 vs 42 | P1 | **FIXED** | alert_severity/alert_status son ENUMs, corregido en 4 archivos |
| ~82 archivos untracked | P0 | Pendiente commit | DDL, auth/functions, communication DDL, RLS, scripts |
| 4 temp scripts | P3 | Pendiente decision | temp-init.sh, temp-phase2.sh, temp-phase3.sh, temp-seeds.sh |
| ENUM deduplication | P2 | Pendiente analisis | 22 en 00-prerequisites + 20 en schema files = algunos podrian estar duplicados |
| Table ownership | P2 | Parcial | 24/75 tablas con FORCE RLS, 51 pendientes |

### Backend Gaps

| Gap | Severidad | Estado | Detalle |
|-----|-----------|--------|---------|
| 3 modules no importados | P2 | Pendiente decision | etl, ml, visualization (~58 endpoints inalcanzables) |
| 6 backend files untracked | P0 | Pendiente commit | redis.config.ts, env.validation.ts, communication.module.ts, metrics.service.ts, tracing.interceptor.ts, telemetry.ts |
| test/ directory untracked | P0 | Pendiente commit | apps/backend/test/ |
| CI branches wrong | P1 | **FIXED** | main/develop → master |

### Frontend Gaps

| Gap | Severidad | Estado | Detalle |
|-----|-----------|--------|---------|
| HF-05 LTI double prefix | P1 | **FIXED** | lti.api.ts: /api/v1/lti/consumers → /lti/consumers |
| Hooks count 101 vs 102 | P1 | **FIXED** | useFocusTrap.ts (untracked) |
| 4 frontend files untracked | P2 | Pendiente commit | Dockerfile, nginx.conf, debug-env.cjs, useFocusTrap.ts |
| Components precise recount | P3 | Pendiente | ~470 vs 474 — need per-directory verification |

### Documentation Gaps

| Gap | Severidad | Estado | Detalle |
|-----|-----------|--------|---------|
| ~25 legacy path refs | P2 | Pendiente | docs/ files referencing old paths |
| 12 EPIC files broken ADR refs | P2 | Pendiente | ADR-0019 → ADR-039 |
| 90-adr/_MAP.md stale | P2 | Pendiente | 19 ADRs behind |
| 53% standards sin cross-refs | P3 | Pendiente | standards ↔ principios gap |
| ~30 docs untracked | P1 | Pendiente commit | guides, troubleshooting, knowledge-base |

### DevOps/CI Gaps

| Gap | Severidad | Estado | Detalle |
|-----|-----------|--------|---------|
| No frontend CI workflow | P2 | Pendiente | Only backend-ci.yml exists |
| Docker files untracked | P1 | Pendiente commit | .dockerignore, docker-compose.yml, Dockerfiles, nginx.conf |
| dependabot.yml untracked | P2 | Pendiente commit | .github/dependabot.yml |
| ~25 orchestration files untracked | P1 | Pendiente commit | SIMCO directives, tasks, policies, profiles |

---

## Resumen por Estado

| Estado | Count | Accion |
|--------|-------|--------|
| FIXED (2026-02-15) | 5 gaps | Pendiente commit |
| Pendiente commit | ~82 archivos | Batch 1 |
| Pendiente analisis/decision | 6 gaps | Batch 2-3 |
| Pendiente ejecucion | 8 gaps | Batch 2-3 |

---

*Ver 04-METRICAS-VERIFICADAS.md para evidencia detallada de cada metrica*
