# PROXIMA ACCION - GAMILIT

**Ultima Actualizacion:** 2026-02-26
**Version:** v5.0 (condensado — historial movido a `orchestration/referencias/PROXIMA-ACCION-HISTORICO-2026.md`)
**Estado del Proyecto:** MVP 98% completado | **SPRINT 2 COMPLETADO** (13/13 items)
**Sprint Actual:** Sprint 2 — Normalizacion Documental y Correccion de Discrepancias (2026-02-25 al 2026-03-11)

---

## Estado Actual

### Ultima Tarea Completada: Auditoria Integral BD (2026-02-26)

**9 fases, ~20 agentes, ~30 archivos modificados. 40 UUIDs remediados. Loaders unificados. 0 errores recreacion.**

| Item | Descripcion | Estado |
|------|-------------|--------|
| Fase 0 | Census UUID (230+ non-v4) + Reconciliacion loaders (113+71+74 archivos) | COMPLETADA |
| Fase 1 | Core Identity: DDL, triggers, FK chains, overlap matrix | COMPLETADA |
| Fase 2 | UUID achievements remediados: 40 → gen_random_uuid() + subquery lookups | COMPLETADA |
| Fase 3-7 | 6 schemas analizados: sysconfig, notifications, audit, educational, social, gamification, progress, lti | COMPLETADAS |
| Fase 8 | load-prod-seeds.sh creado, staging loader corregido, _testing/ → _deprecated/, SEED-LOADING-ORDER.md | COMPLETADA |
| Fase 9 | Recreacion limpia (92 seeds, 0 errores) + idempotencia + build OK | COMPLETADA |

**Reportes:**
- Hallazgos: `orchestration/tareas/TASK-2026-02-26-AUDITORIA-BD/01-HALLAZGOS.md`
- Correcciones: `orchestration/tareas/TASK-2026-02-26-AUDITORIA-BD/02-CORRECCIONES.md`
- Loading order: `apps/database/seeds/SEED-LOADING-ORDER.md`

---

## Pendientes Activos

### P0 — Bloqueantes Deploy (requieren acceso SSH al servidor 74.208.126.102)

| ID | Descripcion | Referencia |
|----|-------------|------------|
| BLQ-01 | Reemplazar 3x CHANGE_ME_IN_PRODUCTION en .env.production del servidor | TASK-2026-02-19-ANALISIS-DEPLOY-PROD/03-CHECKLIST |
| BLQ-02 | Agregar JWT_REFRESH_SECRET (app no arranca sin el) | idem |
| BLQ-03 | Crear apps/frontend/.env.production en servidor | idem |
| BLQ-04 | Cambiar password de admin@gamilit.com en BD produccion | idem |

### P0 — Funcionalidad (resolucion local posible)

| ID | Descripcion | Estado |
|----|-------------|--------|
| ~~P0-6~~ | ~~AdminAssignmentsPage: rutas reordenadas + export endpoint~~ | **COMPLETADO** 2026-02-26 |

### P1 — Pendientes Abiertos (post Sprint 2 o sprint dedicado)

| # | Descripcion | Esfuerzo | Nota |
|---|-------------|----------|------|
| 41 | Feature Flags UI: implementar backend o remover mock | L | downgrade aceptable si mock es tolerable |
| 42 | A/B Testing Dashboard: implementar backend o remover mock | L | idem |
| ~~43~~ | ~~Unificar AdminLayout + TeacherLayout en PortalLayout compartido~~ | ~~M~~ | **COMPLETADO** 2026-02-26 |
| 44 | Integrar Parent portal con detective-theme (usa paleta indigo divergente) | L | depende #43 |
| 49 | Crear 8 flujos UX admin faltantes + 6 flujos teacher faltantes | L | WS09 |
| 50 | Documentar 30 API service files no documentados | L | WS09 |

### P1 — BD Pendientes (post auditoria 2026-02-26)

| ID | Descripcion | Referencia |
|----|-------------|------------|
| BD-P01 | ml_coins_transactions duplica welcome bonus (trigger + seed) | `TASK-2026-02-26-AUDITORIA-BD/02-CORRECCIONES.md` P-01 |
| BD-P02 | 02-message_participants.sql staging/prod bug FK (profiles.user_id vs profiles.id) | idem P-07 |
| BD-P03 | 7 seeds huerfanos dev (notifications 02-05, audit 03, classroom_modules 16) | idem P-04 |
| BD-P04 | Notification templates 9-18 solo en dev — decision prod | idem P-08 |

### P1 — Tecnico Diferido

| ID | Descripcion | Referencia |
|----|-------------|------------|
| VS-03 | exercise-submission.service.ts monolitico (1963 LOC) — analisis 6-fases listo, implementacion pendiente | `TASK-2026-02-21-VS03-ANALYSIS/01-ANALYSIS.md` |
| ALT-02 | vite→Nginx para frontend en prod | depende BLQ-01/02 |
| MQ-005 | Repository pattern | DEFERRED per ADR-045 |
| ~~Missions init bug~~ | ~~Mission generator ACTIVE→IN_PROGRESS fix~~ | **COMPLETADO** 2026-02-26 |

### P2 — Deuda Tecnica (baja urgencia)

| # | Descripcion |
|---|-------------|
| 32 | 17 Framer Motion modals pendientes de migrar a shared Modal (19 skipped) |
| 49 | Crear flujos UX faltantes (8 admin + 6 teacher) |
| 21 | SIMCO archive review — programado Mayo 2026 |
| 22 | ~~Fix jest coverage threshold discrepancy~~ — RESUELTO: docs actualizados a 50% con nota "objetivo gradual 80% (ADR-044)" |
| 23 | Add cross-refs para 8 standards sin matches |
| 24 | Fix frontend-ci.yml cache-dependency-path (non-existent file) |
| 25 | Remove/implement 3 placeholder backend CI jobs |

### Shard OOM — Estado

**Shard 3/5 OOM investigado:** heap limit 4GB insuficiente con coverage. cattest.spec.ts + minimal-oom-test.spec.ts eliminados (65→63 test files). Splitting recomendado pero no bloqueante.

---

## Metricas Actuales (post-Sprint2 correcciones)

| Categoria | Metrica | Valor |
|-----------|---------|-------|
| BD | Tablas (DDL source) | 173 |
| BD | RLS policies (DDL) | 251 |
| BD | Funciones (DDL) | 158 |
| BD | Triggers (DDL) | 68 |
| BD | Seeds pipeline | 92 entradas, 0 errores |
| Backend | Modulos | 23 |
| Backend | Entities | 156 files (157 classes) |
| Backend | Endpoints | 912 |
| Backend | Tests | 63 spec files, 2324 tests (2296 passed + 28 skipped) |
| Frontend | Componentes (.tsx prod) | 577 |
| Frontend | Hooks | 134 |
| Frontend | Paginas | 67 |
| Frontend | Stores Zustand | 13 |
| Frontend | API Service Files | 65 |

> SSOT: `orchestration/inventarios/MASTER_INVENTORY.yml`

---

## Referencias Rapidas

| Recurso | Ubicacion |
|---------|-----------|
| Historial de sesiones 2026 | `orchestration/referencias/PROXIMA-ACCION-HISTORICO-2026.md` |
| Sprint actual | `orchestration/scrum/SPRINT-ACTUAL.yml` |
| Backlog | `orchestration/scrum/BACKLOG.yml` |
| Auditoria documentacion 2026-02-25 | `orchestration/tareas/TASK-2026-02-25-AUDITORIA-DOCUMENTACION/` |
| Remediacion documental 2026-02-26 | `orchestration/tareas/TASK-2026-02-26-REMEDIACION-DOCUMENTAL-GENERAL/` |
| Analisis portales frontend | `orchestration/tareas/TASK-2026-02-21-ANALISIS-PORTALES/` (17 archivos, 586 KB) |
| Validacion standards/principles | `orchestration/tareas/TASK-2026-02-21-ANALISIS-PORTALES/validacion/` |
| VS-03 analisis refactoring | `orchestration/tareas/TASK-2026-02-21-VS03-ANALYSIS/01-ANALYSIS.md` |
| Checklist produccion (BLQ-01..04) | `orchestration/tareas/TASK-2026-02-19-ANALISIS-DEPLOY-PROD/03-CHECKLIST-PRODUCCION.md` |
| Auditoria BD 2026-02-26 | `orchestration/tareas/TASK-2026-02-26-AUDITORIA-BD/` |
| Seed loading order | `apps/database/seeds/SEED-LOADING-ORDER.md` |
| Schema reference | `docs/20-architecture/schema-reference/_INDEX.md` |
| MASTER_INVENTORY | `orchestration/inventarios/MASTER_INVENTORY.yml` |
| FRONTEND_INVENTORY | `orchestration/inventarios/FRONTEND_INVENTORY.yml` |
| DATABASE_INVENTORY | `orchestration/inventarios/DATABASE_INVENTORY.yml` |
| BACKEND_INVENTORY | `orchestration/inventarios/BACKEND_INVENTORY.yml` |
| ADR-046 PageShell | `docs/90-adr/ADR-046-pageshell-pattern.md` |
| React Query Migration Guide | `docs/50-guides/REACT-QUERY-MIGRATION-GUIDE.md` |
| Coherencia Entity-DDL | `docs/20-architecture/COHERENCE-ENTITIES-DDL.md` |
| Ambientes dev/prod | `docs/20-architecture/AMBIENTES-DEV-PROD.md` |
| Normalizacion documental Fase 2 | `orchestration/referencias/BACKLOG-NORMALIZACION-FASE2.md` |
| Informe final remediacion | `orchestration/reports/2026-02-24-INFORME-FINAL-REMEDIACION-DOC-DEV-PROD.md` |

---

*Sistema NEXUS v4.1 - SIMCO*
