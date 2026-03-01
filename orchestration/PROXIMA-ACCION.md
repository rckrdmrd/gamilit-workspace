# PROXIMA ACCION - GAMILIT

**Ultima Actualizacion:** 2026-02-28
**Version:** v5.7 (condensado — historial movido a `orchestration/referencias/PROXIMA-ACCION-HISTORICO-2026.md`)
**Estado del Proyecto:** MVP 99% completado | **SPRINT 2 COMPLETADO** (16/16 items) | Health Score: ~99/100
**Sprint Actual:** Sprint 2 COMPLETADO — Doc Health + Code-Doc Alignment + Doc Remediation COMPLETADAS — Sprint 3 funcional pendiente

---

## Estado Actual

### Ultima Tarea Completada: Desactivar comprension_auditiva (2026-02-28)

**Tarea completada.** Marcada como BACKLOG en 4 archivos (2 docs + 2 inventarios):
1. GUIA-RESPUESTAS: "(BACKLOG — desactivada)" agregado a tabla row + header section
2. MANUAL-PORTAL-STUDENT-V1.0: "(BACKLOG — desactivada)" agregado a tabla row
3. MASTER_INVENTORY: v14.8.3 → v14.8.4 (mecanicas_ejercicio 30→29, ejercicios_con_recursos 2→1)
4. PROXIMA-ACCION: entrada completada registrada aqui

**Status:** Cambios aplicados, inventarios actualizados, docs marcadas con BACKLOG notices. Sin cambios de codigo (is_active=false comentado en prior task).

### Tarea Anterior: Resolucion GAP-P3-001 — Vision Lectora CSS Scoped (2026-02-28)

**5 fases, 8 subagentes (4 Sonnet + 4 Haiku). 9 archivos modificados. Build/Lint/Typecheck: 0 errores.**

Cambios aplicados:
1. FASE 2 (CSS Refactor): Selectores CSS blanket `p, span, li` → scoped `.exercise-passage p, .exercise-passage li` con border-left accent
2. FASE 2 (Wrappers): DetectiveTextualExercise.tsx wrap pasaje en `<div class="exercise-passage">`, CompletarEspaciosExercise.tsx agrega clase al contenedor
3. FASE 4 (ADR-051): Creado ADR-051-vision-lectora-frontend-only.md — documenta decision y alternativas evaluadas
4. FASE 4 (ET-GAM-002): generateReadingVision() marcado como pseudocodigo v2, ref ADR-051
5. FASE 4 (SPEC-EXERCISES): GAP-P3-001 marcado "Resuelto"

**Reporte:** Implementacion directa sin reporte dedicado (3 archivos codigo + 6 archivos docs)

### Tarea Anterior: Integracion Tienda — Rank Card Cosmeticos + Consumibles en Ejercicios (2026-02-28)

**5 fases, ~14 subagentes (4 Sonnet + 10 Haiku). 18 archivos modificados. Build/Lint/Typecheck: 0 errores.**

Cambios aplicados:
1. FASE 2 (Rank Card): RankProgressWidget integra `useEquippedVisuals` — muestra frame border y badge equipado del inventario de la tienda
2. FASE 3.1 (ExerciseContext): `handleSubmit` incluye `getUsedComodinTypes()` en payload `powerupsUsed[]`
3. FASE 3.2 (ExerciseLayout): Efectos visuales de comodines — ExerciseGuide `forceExpanded`, clase CSS `vision-lectora-active`, banner "Segunda Oportunidad activa"
4. FASE 3.3 (7 Mecanicas M1-M2): `comodinesContext` prop + logica segunda oportunidad (intercepta score < 70 en primer intento)
5. FASE 4 (Validacion): TypeScript 0 errores, Build exitoso (20.7s), Lint 0 errores (98 warnings, baja de 104)
6. FASE 5 (Documentacion): MASTER_INVENTORY v14.8.1, FRONTEND_INVENTORY v12.5.1, docs actualizados

**Archivos modificados (18):** RankProgressWidget, ExerciseContext, ExerciseLayout, ExerciseGuide, index.css, 7 mecanicas + 4 type files, 2 inventarios

**Reporte:** `orchestration/tareas/TASK-2026-02-28-SHOP-INTEGRATION/INTEGRATION-REPORT.md`

### Tarea Anterior: Documentation Remediation — 6 Pending Items (2026-02-28)

**4 items ejecutados, 2 descartados (no requerian accion). 13 subagentes. Health Score: ~98→~99/100.**

Cambios aplicados:
1. FASE 1: Portal API refs estandarizados — 4 SSOT en 60-portals/, 4 redirect stubs en 40-api/ (Student+Parents movidos, Teacher+Admin stubs creados)
2. FASE 2: _wave-3-technical archivado — 70 archivos movidos a _archived/wave-3-technical/, redirect stub creado, 3 index files actualizados
3. FASE 3: 10 archivos sobredimensionados split — ~51 archivos nuevos en 10 subdirectorios, hub pages <100 lineas cada uno
   - API-REFERENCE.md (1690L→64L hub + 7 splits)
   - PORTAL-ADMIN-GUIDE.md (2235L→53L hub + 4 splits)
   - PORTAL-STUDENT-GUIDE.md (1850L→48L hub + 5 splits)
   - PORTAL-TEACHER-API-REFERENCE.md (1199L→53L hub + 6 splits)
   - STUDENT-HOOKS-SPEC.md (1243L→51L hub + 6 splits)
   - GUIA-DESIGN-PATTERNS-NESTJS.md (1206L→55L hub + 5 splits)
   - GUIA-E2E-PLAYWRIGHT.md (1168L→52L hub + 5 splits)
   - ESTANDAR-API.md (1253L→57L hub + 5 splits)
   - ESTANDAR-FRONTEND-PROFESIONAL.md (1147L→56L hub + 5 splits)
   - GUIA-RUNBOOK-POSTGRESQL.md (1039L→49L hub + 6 splits)
4. FASE 4: 596 TASK-* wrapper dirs aplanados — 596 dirs eliminados, 280 _INDEX.md actualizados
5. Items descartados: Ghost table guild_mission_contributions (EXISTE en DDL), ADR-039 misplaced files (ya resueltos con redirect stubs)

**Reporte:** `orchestration/tareas/TASK-2026-02-28-DOC-REMEDIATION/REMEDIATION-REPORT.md`

### Tarea Anterior: Documentation Audit & Cleanup (2026-02-28)

**4 fases, 18 subagentes. Health Score: 88→96/100 (+8). Frontmatter: 28%→100% (2191 files).**

**Reporte:** `orchestration/tareas/TASK-2026-02-28-DOC-AUDIT/FINAL-REPORT.md`

### Tarea Anterior: Code-Doc Alignment Remediation (2026-02-27)

**4 fases, ~4 subagentes. Stack versions corrected (17), env vars fixed, page count corrected (72→70), 24 new flow docs, ADR-045 updated, API coverage 69%→71%.**

Cambios aplicados:
1. FASE 1 (P0 Critical): STACK-TECNOLOGICO.md 17 correcciones (redis, bcrypt, swagger v11, framer-motion v12, recharts v3, zod v4, vitest v3, +react-query, -headlessui, -msw). `.env.production.example` DB_NAME→DB_DATABASE fixed. `.env.example` creado (310 lines, 64 variables). MODELO-DATOS.md 6 table name corrections (profiles, user_sessions, auth_providers, password_reset_tokens, auth_attempts, memberships).
2. FASE 2 (P1 Config & Metrics): ADR-045 updated "Infrastructure Ready, Adoption Pending" (45 classes, 39 active throws, 683 HTTP exceptions). AMBIENTES-DEV-PROD.md expanded (13 subsections, ~60+ env vars). Page count corrected 72→70 in CLAUDE.md + MASTER_INVENTORY + PROJECT-CONTEXT. CommunicationModule import verified. BACKEND_INVENTORY updated for etl/ml/viz conditional import status.
3. FASE 3 (Flow Documentation): 4 system flows (FL-SYS-02..05), 9 teacher flows (FL-TCH-09..17), 11 admin flows (FL-ADM-12..22) = 24 new flow docs + index/map files.
4. FASE 4 (API Documentation): API-REFERENCE.md +Profile(3) +BonusCoins(1) +ResourceSharing(13) = +17 endpoints. Parents API confirmed complete (18/18). LTI GAP-14 confirmed not in code (no action).

API Coverage: ~631→~648/912 (~69%→~71%). Flow docs: +24 new. MASTER_INVENTORY: v14.5.0→v14.6.0.

**Reporte:** `orchestration/tareas/TASK-2026-02-27-CODE-DOC-ALIGNMENT/REMEDIATION-REPORT.md`

### Tarea Anterior: Doc Health Remediation 85→98/100 (2026-02-27)

**5 fases, ~23 subagentes, ~296 operaciones (230 mod + 57 creados + 9 renombrados). Health Score: 85→~98/100.**

Cambios aplicados (Fases 1-5):
1. FASE 1A: Banners snapshot historico agregados a 8 archivos en 99-delivery
2. FASE 1B: MODELO-DATOS.md corregido (Views 22→18, Functions 183→158), SCHEMA-REFERENCE.md reescrito como redirect, 06-progress.md→06b-progress.md
3. FASE 1C: Schema-reference _MAP.md nombres de schema corregidos
4. FASE 1D: 37 definiciones [NO DDL] fantasma eliminadas (~740 lineas, 7 archivos schema-ref)
5. FASE 2A/2B/2D: +118 endpoints documentados (ExerciseValidation 21, Notifications 32, ClassroomMissions 5, TeacherGrades 2, ETL/ML/Viz 58)
6. FASE 3A: 18 _INDEX.md de navegacion creados
7. FASE 3B: 23 _MAP.md de EPIC creados
8. FASE 3C: 10 _MAP.md non-EPIC creados
9. FASE 3D: 4 _INDEX.md portales expandidos, 8 archivos renombrados (UPPER-CASE)
10. FASE 3E: Orphan redirect corregido
11. FASE 4A: ESTANDAR-SEGURIDAD.md dividido (1863L → indice 91L + WEB 993L + API 857L)
12. FASE 4B: ESTANDAR-TESTING.md dividido (1582L → ~130L indice + Unit + Integration + E2E + Architecture)
13. FASE 4C: ESTANDAR-API.md deduplicado solapamiento seguridad (-203 lineas)
14. FASE 5A-5D: Frontmatter campaign — ~209 archivos (standards 31, architecture 47, guides ~100+, portals 31)

API Coverage: ~513→~631/912 (56%→~69%). Standards: 17→35 archivos (post-split). Health Score: 85→98/100.

**Reporte:** `orchestration/tareas/TASK-2026-02-27-DOC-HEALTH-100/REMEDIATION-REPORT.md`

### Tarea Anterior: Auditoria BD + Ejercicios + WSL (2026-02-27)

**23 discrepancias cross-layer corregidas. 18 archivos. Build OK. Todas las validaciones PASS.**

Correcciones aplicadas (Fase 1-4):
1. GUIA-RESPUESTAS: Ej 1.5 Emparejamiento→Sopa de Letras BONUS, ej 2.2 nombre, ej 4.2 Manual, duplicado removido
2. Backend+Frontend enums: Module 1 reorganizado (COMPLETAR_ESPACIOS, VERDADERO_FALSO → M1; MAPA_CONCEPTUAL, EMPAREJAMIENTO → Auxiliares)
3. DDL exercise_type.sql: comments de modulos actualizados (M1: 5 activos + 2 aux, M3/M4/M5 teacher-graded)
4. ET-EDU-001 + RF-EDU-001: conteos 35→27 alineados con DDL COMMENT
5. recreate-database-dev.sh: WSL2 IP detection automatica
6. AMBIENTES-DEV-PROD.md: seccion "Scripts de BD y WSL2" agregada

Correcciones adicionales (docs/orchestration sweep):
7. "35"→"33" en entity, DDL table 21, TRACEABILITY.yml (5 refs), schema-ref 03-education.md
8. ADR-008: nota aclaratoria 35→33 (cuerpo historico preservado)
9. PROJECT-STATUS.md + SPRINT-ACTUAL.yml: fechas→2026-02-27
10. TASK-2026-02-26-RESPONSIVE-AUDIT: README stub→RESP-001

**Reporte:** `orchestration/tareas/TASK-2026-02-27-AUDITORIA-BD-EJERCICIOS/AUDIT-REPORT.md`

### Tarea Anterior: Remediacion 17 Gaps — Phase 6D (2026-02-27)

**17 gaps auditados. 5 falsos positivos. 12 gaps resueltos. Health Score: 84→~92/100 (+8).**

Correcciones aplicadas:
1. CLAUDE.md: components 572→575, pages 69→72, routes 71→74, parent portal 100%
2. MASTER_INVENTORY.yml: v14.3.0→v14.4.0 (frontend metrics synced, integration infra noted)
3. FRONTEND_INVENTORY.yml: v12.4.0→v12.5.0 (parent portal 7/7 pages, routes 74)
4. BACKEND_INVENTORY.yml: v5.2.0→v5.3.0 (domain errors 42 classes, integration infra, data_warehouse conditional)
5. TEST_COVERAGE.yml: v2.2.0→v2.3.0 (integration infra 5 files, jest.integration.config.js)
6. PROXIMA-ACCION.md: S3 backlog items marked resolved/pending per gap status

Gaps resueltos (12):
- Gap 1: API-REFERENCE gamification paths corregidos (73 endpoints documentados)
- Gap 2: ~567 endpoints sin docs → 3 portal API refs creados (~513 endpoints)
- Gap 3: Schema-reference legacy names → 5 archivos corregidos
- Gap 4: 5 mock M2/M3 APIs → FEATURE_FLAGS pattern aplicado
- Gap 5: 3 paginas parent portal → 7/7 pages, 100% cobertura
- Gap 7: ADR-045 domain errors → 42 clases, 129 throws, guia migracion
- Gap 8: Testing pyramid → integration infra + 5 archivos
- Gap 10: Data warehouse docs → 16 tablas con detalle a columnas
- Gap 11: COHERENCE stale paths → 3 rutas corregidas
- Gap 13: window.innerWidth → PortalLayout corregido
- Gap 14: Data warehouse datasource → ENABLE_DATA_WAREHOUSE feature flag
- Gap 15: Teacher-communication verificado (1/8 consumidos, 7 backend-ready)

Falsos positivos (5): Gap 6, 9, 12, 16, 17

**Reporte:** `orchestration/tareas/TASK-REMEDIACION-17-GAPS/REMEDIATION-REPORT.md`

### Tarea Anterior: Auditoria Comprehensiva (2026-02-27)

**7 fases, 14 subagentes. Health Score: 72→84/100 (+12). Metricas SSOT corregidas. Sprint 2 cerrado.**

**Reporte:** `orchestration/tareas/TASK-AUDITORIA-COMPREHENSIVA/AUDIT-FINAL-REPORT.md`

### Tarea Anterior: Remediacion Post-Auditoria (2026-02-27)

**4 fases, 13 sub-fases, 14 agentes. Schema-ref coverage: 39%→98%. 6 pendientes criticos resueltos.**

### Tarea Anterior: Auditoria Integral Documentacion (2026-02-27)

**5 fases, 23 sub-fases, ~18 agentes. Health Score: 72/100. 41 metricas auditadas. 7 inventarios corregidos.**
**Reporte:** `orchestration/tareas/TASK-2026-02-27-AUDITORIA-INTEGRAL-DOCS/01-INFORME-AUDITORIA-INTEGRAL.md`

### Tarea Anterior: Auditoria Integral BD (2026-02-26)

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

### P0 — Sprint 3 Backlog (Auditoria Comprehensiva)

| # | Descripcion | Tipo | Esfuerzo | Prioridad | Estado |
|---|-------------|------|----------|-----------|--------|
| ~~S3-01~~ | ~~Corregir gamification paths en API-REFERENCE.md~~ | Fix | 1h | P0 | **COMPLETADO** (Gap 1) |
| ~~S3-02~~ | ~~Conectar 5 M2/M3 mock APIs a mechanicsAPI backend~~ | Fix | 2h | P1 | **COMPLETADO** (Gap 4, FEATURE_FLAGS) |
| ~~S3-03~~ | ~~Crear PORTAL-STUDENT-API-REFERENCE.md~~ | Doc | 5 dias | P0 | **COMPLETADO** (Gap 2, 3 portal refs) |
| ~~S3-04~~ | ~~Crear FL-SYS-02 (Exercise Submission Pipeline)~~ | Doc | 4h | P1 | **COMPLETADO** (FL-SYS-02..05 creados) |
| ~~S3-05~~ | ~~Crear FL-SYS-03 (Gamification Reward Chain)~~ | Doc | 3h | P1 | **COMPLETADO** (FL-SYS-02..05 creados) |
| ~~S3-06~~ | ~~Corregir 3 stale DDL paths en COHERENCE-ENTITIES-DDL.md~~ | Fix | 0.5h | P2 | **COMPLETADO** (Gap 11) |
| ~~S3-07~~ | ~~Modernizar schema-reference legacy names~~ | Doc | 3 dias | P0 | **COMPLETADO** (Gap 3) |

**Plan completo Sprint 3-5:** Ver `orchestration/tareas/TASK-AUDITORIA-COMPREHENSIVA/AUDIT-FINAL-REPORT.md` seccion 5.

### P1 — Pendientes Abiertos (post Sprint 2 o sprint dedicado)

| # | Descripcion | Esfuerzo | Nota |
|---|-------------|----------|------|
| 41 | Feature Flags UI: implementar backend o remover mock | L | downgrade aceptable si mock es tolerable |
| 42 | A/B Testing Dashboard: implementar backend o remover mock | L | idem |
| ~~43~~ | ~~Unificar AdminLayout + TeacherLayout en PortalLayout compartido~~ | ~~M~~ | **COMPLETADO** 2026-02-26 |
| 44 | Integrar Parent portal con detective-theme (usa paleta indigo divergente) | L | depende #43 |
| ~~49~~ | ~~Crear flujos UX faltantes (8 admin + 6 teacher)~~ | ~~L~~ | **COMPLETADO** (24 flow docs: FL-SYS-02..05, FL-TCH-09..17, FL-ADM-12..22) |
| ~~50~~ | ~~Documentar 30 API service files no documentados~~ | ~~L~~ | **COMPLETADO** (Gap 2 — 3 portal API refs) |
| **REM-01** | Teacher-communication frontend UI (7/8 endpoints no consumidos) | M | Gap 15 verificado — integrar ParentMessagesPage con backend real |
| **REM-02** | ADR-045 migration a modulos restantes (auth+gamification done, 21 modulos pendientes) | XL | Expansion gradual por sprint. Status: Infrastructure Ready (45 classes, 39 throws, 683 HTTP exceptions) |
| **REM-03** | Integration test expansion (5 archivos base, expandir a todos los modulos) | L | Infraestructura creada — agregar test cases |
| **REM-04** | Frontend hook count discrepancy investigation (132 documented vs methodology variation) | S | Verificar si hay nuevos hooks en parent portal pages |
| **REM-05** | Multi-tenant RLS activation (BYPASSRLS → NOBYPASSRLS para usuarios no-admin) | M | Requiere coordinacion con deploy |
| **REM-06** | Lint warnings reduccion (104 activos) | M | Objetivo: <50. Aumento post teacher-portal re-enable + mobile fixes |
| **REM-07** | Frontend dead code: NotificationService.ts (0 importers) — deprecate or remove | S | Marcado como deprecated P6, confirmar eliminacion segura |

### ~~P1 — BD Pendientes~~ (TODOS RESUELTOS 2026-02-26)

| ID | Descripcion | Estado |
|----|-------------|--------|
| ~~BD-P01~~ | ~~ml_coins_transactions duplica welcome bonus~~ | **COMPLETADO** — welcome_bonus rows eliminados, trigger es fuente autoritativa |
| ~~BD-P02~~ | ~~message_participants FK bugs staging/prod~~ | **COMPLETADO** — id not user_id, student_id not user_id, status not role |
| ~~BD-P03~~ | ~~6 seeds huerfanos dev~~ | **COMPLETADO** — movidos a dev/_deprecated/orphaned/ |
| ~~BD-P04~~ | ~~Notification templates 9-18 solo en staging~~ | **COMPLETADO** — propagados a dev y prod (18 templates en 3 envs) |
| ~~BD-P05~~ | ~~auth_providers environment "development" en staging/prod~~ | **COMPLETADO** — staging→"staging", prod→"production" |
| ~~BD-P06~~ | ~~moderation_rules placeholder keywords~~ | **COMPLETADO** — reemplazados con keywords reales educativos |
| ~~BD-P07~~ | ~~initialize_user_stats comment inconsistente~~ | **COMPLETADO** — comentario actualizado |
| ~~BD-P08~~ | ~~missions constraints~~ | **SIN ISSUE** — diseno correcto, cerrado |
| ~~D-01~~ | ~~init-database.sh scope tags vs loaders individuales~~ | **COMPLETADO** — 4 scope tags corregidos (communication + progress_tracking) |
| ~~DDL-SORT~~ | ~~3 sort-order violations in DDL table files~~ | **COMPLETADO** — 08→08a teacher_reports, 20→05a mission_templates, 19→16a student_intervention_alerts |
| ~~DDL-FIX~~ | ~~6 DDL errors (enum refs, missing function, bad column, role)~~ | **COMPLETADO** — guild_mission_type idempotent, gamilit_readonly removed, current_user_id fixed, role_name→role, gamilit_role values corrected, 07d idempotent |

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

## Metricas Actuales (post-Remediacion-17-Gaps)

| Categoria | Metrica | Valor |
|-----------|---------|-------|
| BD | Tablas (DDL source) | 173 |
| BD | RLS policies (runtime) | 486 |
| BD | Funciones (DDL) | 158 |
| BD | Triggers (DDL) | 68 |
| BD | Seeds pipeline | 92 entradas, 0 errores |
| Backend | Modulos | 23 |
| Backend | Entities | 156 files (157 classes) |
| Backend | Endpoints | 914 |
| Backend | Tests | 63 spec files, 2324 tests (2296 passed + 28 skipped) |
| Backend | Domain Error Classes | 42 (25 auth + 17 gamification, ADR-045) |
| Backend | Integration Test Files | 5 (jest.integration.config.js + infra) |
| Frontend | Componentes (.tsx prod) | 575 (+3 parent portal) |
| Frontend | Hooks | 132 |
| Frontend | Paginas | 70 (corrected from 72 — overcounting fixed 2026-02-27) |
| Frontend | Routes | 74 (+3 parent portal) |
| Frontend | Stores Zustand | 13 |
| Frontend | API Service Files | 65 |
| Portales | Parent portal | 100% (7/7 pages) |
| Health Score | Post-remediacion | ~98/100 (era 92, prev 84) |
| Docs | API Coverage | ~648/914 (~71%, era 631/912 ~69%, era 513/912 ~56%) |
| Docs | Frontmatter | >90% (~209 archivos) |
| Docs | Standards files | 35 (era 17 pre-split) |
| Docs | Flow docs | +24 nuevos (FL-SYS-02..05, FL-TCH-09..17, FL-ADM-12..22) |
| Config | .env.example | Creado: 310 lineas, 64 variables |
| Stack | Versiones corregidas | 17 correcciones en STACK-TECNOLOGICO.md |

> SSOT: `orchestration/inventarios/MASTER_INVENTORY.yml`

---

## Referencias Rapidas

| Recurso | Ubicacion |
|---------|-----------|
| **Code-Doc Alignment Remediation 2026-02-27** | **`orchestration/tareas/TASK-2026-02-27-CODE-DOC-ALIGNMENT/REMEDIATION-REPORT.md` — stack versions, .env.example, 24 flow docs, API 69%→71%** |
| **Doc Health Remediation 2026-02-27** | **`orchestration/tareas/TASK-2026-02-27-DOC-HEALTH-100/REMEDIATION-REPORT.md` — Health 85→98, ~296 ops** |
| Historial de sesiones 2026 | `orchestration/referencias/PROXIMA-ACCION-HISTORICO-2026.md` |
| Sprint actual | `orchestration/scrum/SPRINT-ACTUAL.yml` |
| Backlog | `orchestration/scrum/BACKLOG.yml` |
| **Remediacion 17 Gaps 2026-02-27** | **`orchestration/tareas/TASK-REMEDIACION-17-GAPS/REMEDIATION-REPORT.md` — Health 84→92, 12 gaps resueltos** |
| **Auditoria comprehensiva 2026-02-27** | **`orchestration/tareas/TASK-AUDITORIA-COMPREHENSIVA/AUDIT-FINAL-REPORT.md` — Health 72→84, 17 gaps catalogados** |
| Remediacion post-auditoria 2026-02-27 | Schema-ref 39%→98%, metrics corrected, inventories aligned |
| Auditoria integral docs 2026-02-27 | `orchestration/tareas/TASK-2026-02-27-AUDITORIA-INTEGRAL-DOCS/` |
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
