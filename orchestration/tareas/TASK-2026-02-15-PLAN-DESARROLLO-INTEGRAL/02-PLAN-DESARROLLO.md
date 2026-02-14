# 02-PLAN-DESARROLLO.md — Plan Desarrollo Integral GAMILIT

**Fecha:** 2026-02-15
**Agente:** Claude Opus 4.6
**Estado:** FASE 0 completada, Batch 1 parcialmente completado

---

## Resumen Ejecutivo

| Indicador | Valor |
|-----------|-------|
| Archivos SSOT corregidos | 5 (CLAUDE.md, MASTER_INV, DB_INV, FE_INV, MEMORY.md) |
| Bugs codigo corregidos | 2 (HF-05 LTI double prefix, CI branch refs) |
| Archivos untracked a commitear | ~82 |
| Streams paralelos | 5 (A: Database, B: Backend, C: Frontend, D: Docs, E: DevOps) |
| Total tareas | 44 (5 FASE 0 + 39 streams) |
| Batches ejecucion | 4 |

---

## 5 Streams de Desarrollo

### Stream A: Database (7 tareas)

Enfoque: ENUMs, table ownership, ENUM deduplication, cleanup temp scripts, commit untracked DDL.

- A-001: Fix ENUMs DATABASE_INVENTORY (40→42) — **DONE**
- A-002: Evaluar ENUM deduplication (22 en prerequisites + 20 en schema files)
- A-003: Evaluar table ownership normalization (51 tablas pendientes FORCE RLS)
- A-004: Limpiar 4 temp scripts
- A-005: Commitear DDL untracked (auth/functions, communication DDL, RLS, is_super_admin)
- A-006: Commitear DB scripts untracked (monitoring/, backup, rollback)
- A-007: Review MIGRATION-TEMPLATE.md

### Stream B: Backend (8 tareas)

Enfoque: Modules no importados, commit untracked, CI fixes, test coverage.

- B-001: Evaluar 3 modules no importados (etl/ml/visualization)
- B-002: Commitear 6 backend files untracked
- B-003: Commitear test/ directory
- B-004: Documentar patron mail module transitive loading
- B-005: Actualizar CLAUDE.md MODULOS section (conceptual → fisico)
- B-006: Test coverage real
- B-007: Fix CI branches — **DONE**
- B-008: Evaluar CI jobs placeholder

### Stream C: Frontend (8 tareas)

Enfoque: LTI bug fix, reconteo metricas, hallazgos update, barrel verification.

- C-001: Fix HF-05 LTI double prefix — **DONE**
- C-002: Commit deletions + barrel updates
- C-003: Commit frontend untracked (Dockerfile, nginx, etc.)
- C-004: Reconteo componentes per-directory
- C-005: Reconteo hooks per-directory
- C-006: Reconteo API calls post-consolidacion
- C-007: Actualizar hallazgos FRONTEND_INV — **DONE** (parcial, HF-05 status pendiente post-commit)
- C-008: Verificar barrel exports

### Stream D: Documentation (10 tareas)

Enfoque: Legacy paths, EPIC refs rotas, ADR _MAP, _INDEX files, cross-references.

- D-001: Batch-fix ~25 legacy paths
- D-002: Commit 15 guides untracked
- D-003: Commit 15 troubleshooting docs
- D-004: Commit knowledge-base directory
- D-005: Actualizar _MAP.md troubleshooting
- D-006: Actualizar _INDEX.md standards/guides
- D-007: Fix 12 EPIC files ADR-0019 → ADR-039
- D-008: Actualizar 90-adr/_MAP.md
- D-009: Cross-references standards ↔ principios
- D-010: Cleanup ALIASES.yml

### Stream E: DevOps/CI-CD (6 tareas)

Enfoque: Docker, dependabot, CI workflows, orchestration commit.

- E-001: Commit Docker infrastructure
- E-002: Commit dependabot.yml
- E-003: Fix backend-ci.yml branches — **DONE** (same as B-007)
- E-004: Crear frontend CI workflow
- E-005: Mejorar database validation CI job
- E-006: Commit orchestration untracked (~25 files)

---

## Progreso por Batch

### Batch 1: Quick Wins — PARCIALMENTE COMPLETADO

- [x] FASE 0: SSOT Sync (5 archivos corregidos)
- [x] C-001: Fix LTI double prefix
- [x] B-007/E-003: Fix CI branches
- [ ] Commits pendientes (~82 archivos) — requiere `git add` + `git commit`

### Batch 2: Correcciones Medias — PENDIENTE

16 tareas de complejidad media. Ver 03-TAREAS-POR-FASE.md.

### Batch 3: Esfuerzos Mayores — PENDIENTE

6 tareas de alta complejidad. Ver 03-TAREAS-POR-FASE.md.

### Batch 4: Futuro — DIFERIDO

4 items de baja prioridad + F4-VALIDATION (89 SP).

---

## Verificacion Post-Batch

```bash
# Verificar metricas ENUMs
grep "enums:" orchestration/inventarios/MASTER_INVENTORY.yml  # debe: 42
grep "enums:" orchestration/inventarios/DATABASE_INVENTORY.yml  # debe: 42
grep "ENUMs" CLAUDE.md  # debe: 42

# Verificar build
cd apps/backend && npm run build
cd apps/frontend && npm run build

# Verificar commits
git status  # reducir untracked progresivamente
```

---

*Plan generado por TASK-2026-02-15-PLAN-DESARROLLO-INTEGRAL*
