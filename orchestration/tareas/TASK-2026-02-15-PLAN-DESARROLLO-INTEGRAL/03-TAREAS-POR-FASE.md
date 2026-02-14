# 03-TAREAS-POR-FASE.md — Desglose para Ejecucion Paralela

**Fecha:** 2026-02-15

---

## Batch 1: Quick Wins (todo en paralelo)

### FASE 0 — SSOT Sync (COMPLETADA)

| ID | Archivo | Correcciones | Estado |
|----|---------|-------------|--------|
| F0-T01 | CLAUDE.md | ENUMs 40→42, Hooks 101→102 | **DONE** |
| F0-T02 | MASTER_INVENTORY.yml | ENUMs 40→42, Hooks 101→102 | **DONE** |
| F0-T03 | DATABASE_INVENTORY.yml | ENUMs 40→42, lista actualizada, nota falsa removida | **DONE** |
| F0-T04 | FRONTEND_INVENTORY.yml | Hooks 101→102, 5 hallazgos RESOLVED, duplicados 6→0 | **DONE** |
| F0-T05 | MEMORY.md | ENUMs fix, API duplicados fix | **DONE** |

### Bug Fixes (COMPLETADOS)

| ID | Archivo | Fix | Estado |
|----|---------|-----|--------|
| C-001 | lti.api.ts | Double prefix `/api/v1/` removido de LTI_BASE_URL y getLaunchUrls | **DONE** |
| B-007/E-003 | backend-ci.yml | Branches main/develop → master | **DONE** |

### Commits Pendientes (agrupados por dominio)

| ID | Dominio | Archivos | Estado |
|----|---------|----------|--------|
| A-005 | Database DDL | 7+ files: RLS phase4, auth/functions, communication DDL, is_super_admin | Pendiente |
| A-006 | Database scripts | monitoring/, pre-deploy-backup.sh, rollback-migration.sh, temp-*.sh | Pendiente |
| B-002 | Backend code | redis.config.ts, env.validation.ts, communication.module.ts, metrics.service.ts, tracing.interceptor.ts, telemetry.ts | Pendiente |
| B-003 | Backend tests | test/ directory | Pendiente |
| C-003 | Frontend | Dockerfile, nginx.conf, debug-env.cjs, useFocusTrap.ts | Pendiente |
| D-002 | Docs guides | 15 files in standards, backend, deployment, testing guides | Pendiente |
| D-003 | Docs troubleshoot | 15 ERR-* files | Pendiente |
| D-004 | Docs knowledge | knowledge-base/ directory | Pendiente |
| E-001 | DevOps Docker | .dockerignore, docker-compose.yml, Dockerfiles | Pendiente |
| E-002 | DevOps GH | dependabot.yml | Pendiente |
| E-006 | Orchestration | ~25 files: SIMCO directives, tasks, policies, profiles | Pendiente |

---

## Batch 2: Correcciones Medias (post-Batch 1)

| ID | Stream | Tarea | Dep | Effort |
|----|--------|-------|-----|--------|
| C-002 | Frontend | Commit deletions + barrel updates (5 files) | - | S |
| C-004 | Frontend | Reconteo preciso componentes per-directory | F0-T04 | M |
| C-005 | Frontend | Reconteo hooks per-directory (con useFocusTrap) | F0-T04 | S |
| C-006 | Frontend | Reconteo API calls post-consolidacion | C-002 | M |
| C-007 | Frontend | Actualizar hallazgos FRONTEND_INV (HF-05 post-fix) | C-001 | S |
| C-008 | Frontend | Verificar barrel exports services/api/index.ts | C-002 | S |
| D-001 | Docs | Batch-fix ~25 legacy paths | - | M |
| D-005 | Docs | Actualizar _MAP.md troubleshooting | D-003 | S |
| D-006 | Docs | Actualizar _INDEX.md standards y guides | D-002 | S |
| D-007 | Docs | Fix 12 EPIC files ADR-0019 → ADR-039 | - | M |
| D-008 | Docs | Actualizar 90-adr/_MAP.md | - | M |
| D-010 | Docs | Cleanup ALIASES.yml (legacy) | - | M |
| B-001 | Backend | Evaluar 3 modules no importados | - | M |
| B-004 | Backend | Documentar patron mail transitive loading | - | S |
| B-005 | Backend | Actualizar CLAUDE.md MODULOS section | F0-T01 | M |
| A-002 | Database | Evaluar ENUM deduplication | - | M |

---

## Batch 3: Esfuerzos Mayores (post-Batch 2)

| ID | Stream | Tarea | Dep | Effort |
|----|--------|-------|-----|--------|
| A-003 | Database | Evaluar table ownership normalization (51 tablas) | - | L |
| B-006 | Backend | Ejecutar test coverage y documentar % real | - | M |
| B-008 | Backend | Evaluar CI jobs placeholder (api-docs, cache-perf) | B-007 | M |
| D-009 | Docs | Cross-references standards ↔ principios | D-002 | L |
| E-004 | DevOps | Crear frontend CI workflow | - | M |
| E-005 | DevOps | Mejorar database validation CI job | E-003 | L |

---

## Batch 4: Futuro (P2-P3, diferible)

| ID | Tarea | Effort |
|----|-------|--------|
| A-004 | Limpiar 4 temp scripts | S |
| A-007 | Review MIGRATION-TEMPLATE.md | S |
| F4-VAL | F4-VALIDATION execution (9 US, 44 tasks, 89 SP) | XL |
| SIMCO | SIMCO archive review (Mayo 2026) | M |

---

## Leyenda Effort

| Simbolo | Significado | Tiempo Aprox |
|---------|------------|-------------|
| S | Small | <30 min |
| M | Medium | 30 min - 2h |
| L | Large | 2-4h |
| XL | Extra Large | >4h |

---

*Plan ejecutable por subagentes. Tareas sin dependencia pueden ejecutarse en paralelo.*
