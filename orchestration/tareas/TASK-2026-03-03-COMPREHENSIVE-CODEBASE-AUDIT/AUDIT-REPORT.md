# Auditoría Comprehensiva — Documentación vs Desarrollo
**Fecha:** 2026-03-03 | **Tipo:** Analysis + Remediation | **Modelo:** Opus 4.6 orchestrator + 12 Sonnet + 10 Haiku

---

## Resumen Ejecutivo

Auditoría completa del proyecto gamilit comparando documentación contra desarrollo real. 23 subagentes ejecutados en 5 waves (análisis, calidad, cross-layer, remediación, validación).

**Resultado:** 31 archivos de código modificados. 0 errores de compilación. Métricas de inventario corregidas. Deuda técnica documentada.

---

## Wave 0 — Reconciliación de Métricas

### Backend (ST-001)

| Métrica | Documentado | Real | Delta | Acción |
|---------|------------|------|-------|--------|
| Entity files | 156 | 156 | ✓ | — |
| Entity classes | 157 | 158 | +1 | Corregido (maya-rank + message tienen 2 @Entity cada uno) |
| Services | 173 | 173 | ✓ | — |
| Controllers | 109 | 109 | ✓ | — |
| DTOs | 401 | 401 | ✓ | — |
| Guards | 15 | 9 | -6 | Corregido (9 archivos .guard.ts dedicados) |
| Decorators | 18 | 3 | -15 | Corregido (3 archivos .decorator.ts dedicados) |
| Endpoints | 915 | 919 | +4 | Corregido (boost controller reciente) |
| Modules | 23 | 21-22 | -1 | Documentado (21 archivos, 22 @Module) |
| Spec files | — | 59 | new | Documentado |

### Frontend (ST-002)

| Métrica | Documentado | Real | Delta | Acción |
|---------|------------|------|-------|--------|
| TSX production | 575 | 581 | +6 | Corregido |
| Hooks | 132 | 143 | +11 | Corregido |
| Pages | 70 | 81 | +11 | Corregido |
| Stores | 13 | 13 | ✓ | — |
| Routes | 74 | 74 | ✓ | — |
| Type files | 49 | 81 | +32 | Corregido |
| API files | 65 | 78 | +13 | Corregido |
| Mock files | — | 10 | new | Documentado |
| Legacy files | — | 7 | new | Documentado |

### Database (ST-003)

| Métrica | Documentado | Real | Status |
|---------|------------|------|--------|
| Tables | 173 | 173 | ✓ |
| Views | 18 | 18 | ✓ |
| MVs | 7 | 5 files (7 MVs) | ✓ (multi-MV files) |
| Functions | 158 | 119 files + ~44 inline | ✓ (explained) |
| Triggers | 68 | 68 statements | ✓ |
| RLS policies | 251 | 251 | ✓ |
| ENUMs | 42 | 42 | ✓ |
| Schemas | 18 | 18 | ✓ |

### Mecánicas (ST-004)

**29 activas confirmadas ✓** — Documentación correcta.
- 30 en FE registry = 29 únicas + 1 alias (lectura_inferencial → detective_textual)
- 4 backlog en BE/DDL only (resena_critica, chat_literario, email_formal, ensayo_argumentativo)
- comprension_auditiva: BACKLOG (componente preservado)

### Cross-Layer DDL-Entity (ST-010)

**173/173 tablas alineadas.** 157 con entity, 16 DDL-only (data_warehouse). 0 entidades huérfanas.

### Cross-Layer BE-FE (ST-011)

**96% de endpoints consumidos por frontend** (48 endpoints muestreados). Solo admin tiene consumo parcial (75%) por features fase-2.

---

## Wave 1 — Análisis de Calidad

### P0 — Features Rotas Enmascaradas como Completas

| # | Issue | Módulo | Archivos |
|---|-------|--------|----------|
| P0-1 | **2FA OTPs nunca se envían** — 3 puntos de envío son stubs | auth | two-factor-auth.service.ts:102,193,320 |
| P0-2 | **Parents email verification es no-op** — body vacío | parents | parent-auth.service.ts:373 |
| P0-3 | **Parents password reset es no-op** — retorna void silenciosamente | parents | parent-auth.service.ts:391 |
| P0-4 | **Parents link verification code nunca se envía** | parents | parent-auth.service.ts:272 |
| P0-5 | **scheduled-mission métodos no-op** — findByUserId, completeMission, updateProgress no persisten datos | progress | scheduled-mission.service.ts:65,98,158,182 |

### P1 — Seguridad

| # | Issue | Módulo |
|---|-------|--------|
| P1-1 | disable2FA omite validación de password | auth |
| P1-2 | refreshToken enmascara errores DB como auth failures | parents |
| P1-3 | cleanupRateLimitCache nunca llamado (memory leak) | gamification |
| P1-4 | Cross-tenant access gaps documentados pero no resueltos | admin |
| P1-5 | media-files.service.ts no elimina archivos físicos (storage leak) | content |

### TODO/FIXME Triage (Total Backend: 46)

| Clasificación | Cantidad | Acción |
|---------------|----------|--------|
| actionable-now | 12 | Tickets requeridos |
| needs-ticket | 8 | Backlog items |
| future-feature | 17 | Documentados |
| can-be-removed | 5 | **Removidos en Wave 3** |
| test-only | 4 | No-op |

### TODO/FIXME Triage (Total Frontend: 17)

| Clasificación | Cantidad | Acción |
|---------------|----------|--------|
| actionable-now | 4 | StreakIndicator maxStreak=0, powerupsUsed silently dropped, AI mock-only, leaderboard sub-components missing |
| future-feature | 8 | SPENT_SHOP enum, advanced leaderboard, AI backend |
| can-be-removed | 5 | **Removidos en Wave 3** |

### JSDoc Coverage

| Módulo | Coverage | Grade |
|--------|----------|-------|
| auth | ~100% | A |
| gamification | ~99% | A |
| teacher | ~95% | A |
| educational | ~95% | A |
| parents | ~100% | A |
| progress | ~100% | A |
| admin | ~75% → ~80% (post-fix) | B |
| social | ~55% | D |

### Large Files (>1000 LOC)

| Archivo | LOC | Módulo |
|---------|-----|--------|
| exercise-submission.service.ts | 1,962 | progress |
| analytics.service.ts | 1,955 | teacher |
| exercises.controller.ts | 1,149 | educational |
| admin-system.service.ts | 1,076 | admin |
| manual-review.service.ts | 1,059 | teacher |
| gamification-config.service.ts | ~1,030 | admin |
| achievements.service.ts | 1,013 | gamification |
| missions.service.ts | 1,011 | gamification |

### Error Handling — ADR-045 Status

| Módulo | Pattern | Domain Classes | HTTP Throws | Domain Throws |
|--------|---------|---------------|-------------|---------------|
| auth | **domain** (86%) | 25 | 8 | 49 |
| gamification | **mixed** (23%) | 20 | 76 | 23 |
| educational | **http→mixed** (started) | 8 (+5 new) | 58 (-3 migrated) | 3 (+3 new) |
| Otros 19 módulos | **http** o **none** | 0 | 629 total | 0 |

### Dead Code — Frontend

| Item | Status |
|------|--------|
| 7 legacy files (_legacy/) | Zero references — annotated @deprecated |
| twoFactorAPI.ts | Zero consumers — annotated |
| schoolsAPI.ts | Zero consumers — annotated |
| contentAPI.ts | Zero direct consumers (barrel only) |
| battleStore + module | Zero page consumers — annotated |
| newLeaderboardsStore | Only in test harness |
| 5 unused hooks | useRankUpNotification, useLeaderboards, useGuilds, useFriends, useAdvancedLeaderboard |
| 5 type duplications | LeaderboardEntry ×3, ShopItem ×2, Achievement ×2, Profile ×2, LeaderboardType ×3 |

### Mock Data — Frontend

| Item | Classification |
|------|---------------|
| aiService.ts / aiMockResponses.ts | **mock-primary** (USE_REAL_AI=false hardcoded, no conditional) |
| ranksMockData.ts | **hybrid** (store imports directly, API has real endpoints) |
| useAdvancedLeaderboard.ts | **mock-primary** (always generates mock data) |
| ShopLayout.tsx + Analytics components | **mock-primary** (but zero page consumers) |
| Social mockData (5 files) | Deactivated features, behind USE_MOCK_DATA flag |
| Exercise mockData (29 files) | **fallback-only** (behind USE_MOCK_DATA flag) |

---

## Wave 2 — Patrones y Arquitectura

### OCP Violations (Switch Statements >10 cases)

| Archivo | Cases | Descripción |
|---------|-------|-------------|
| exercises.service.ts (×2) | 19 + 15 | validateContentByExerciseType + sanitizeContent |
| achievements.service.ts | 20 | meetsConditions() — 20 condition types |
| exercise-responses.service.ts | 12 | extractCorrectAnswers |
| exercise-validator.service.ts | 9 | validateExercise |

**Recomendación:** Strategy pattern con ExerciseTypeRegistry para eliminar los 4 switches correlacionados de ejercicios.

### Services >7 Dependencies

| Service | Deps | Driver |
|---------|------|--------|
| ExerciseSubmissionService | 11 | Cross-schema + orchestrator |
| TeacherClassroomsCrudService | 11 | Cross-schema (5 schemas) |
| ShopService | 9 | Cross-schema + service |
| StudentProgressService | 9 | Cross-schema read aggregator |
| ManualReviewService | 8 | Cross-schema + service |
| MissionsService | 7 | Cross-schema + service |

### Zustand Store Consistency

- 6/13 stores use persist middleware
- 7/13 stores have NO persistence (data lost on refresh)
- React Query vs Zustand dual-store sync: ~80% reliability (WebSocket gaps)

### Barrel Export Consistency

- Complete (4-layer): auth, gamification, educational
- Partial: teacher, progress, social, parents, admin

---

## Wave 3 — Remediación Aplicada

### Backend (21 files modified)

| Cambio | Archivos |
|--------|----------|
| Stale TODOs removidos | leaderboard.service.ts, user-stats.service.ts, achievements.service.ts, security.service.spec.ts, exercises.service.ts |
| Dead methods anotados @deprecated | achievements.service.ts (cleanupRateLimitCache), two-factor-auth.service.ts (sendLoginOTP) |
| JSDoc añadido | admin-users.service.ts (9 métodos) |
| Domain errors expandidos | educational.errors.ts (3→8 clases) |
| HTTP→Domain migration | exercises.service.ts (3 throws migrados) |

### Frontend (21 files modified)

| Cambio | Archivos |
|--------|----------|
| Legacy files anotados @deprecated | 7 files en _legacy/ |
| Stale TODOs removidos/actualizados | mechanicsTypes.ts, auth.types.ts, App.tsx |
| Dead APIs anotados @deprecated | twoFactorAPI.ts, schoolsAPI.ts |
| Dead store anotado @deprecated | battleStore.ts |
| @deprecated zero-consumer removidos | debateDigitalTypes.ts, debateDigitalSchemas.ts, authMocks.ts, breakpoints.ts, ranks.constants.ts, users.types.ts, tribunalOpinionesAPI.ts, achievementsAPI.ts |

### Compilación Post-Remediación

- Backend `tsc --noEmit`: 0 errores ✓
- Frontend `tsc --noEmit`: 0 errores ✓

---

## Wave 4 — Inventarios Actualizados

- MASTER_INVENTORY.yml: Métricas corregidas, version bump
- BACKEND_INVENTORY.yml: Guards 9, decorators 3, endpoints 919, entity classes 158
- FRONTEND_INVENTORY.yml: 581 components, 143 hooks, 81 pages, 81 types, 78 APIs

---

## Métricas Finales del Proyecto

| Categoría | Valor |
|-----------|-------|
| DDL Tables | 173 (157 con entity + 16 DDL-only) |
| Entity files / classes | 156 / 158 |
| Services | 173 |
| Controllers | 109 |
| DTOs | 401 |
| Endpoints | 919 |
| Guards (.guard.ts) | 9 |
| Decorators (.decorator.ts) | 3 |
| Frontend TSX (prod) | 581 |
| Hooks | 143 |
| Pages | 81 |
| Zustand Stores | 13 |
| Routes | 74 |
| Type Files | 81 |
| API Service Files | 78 |
| Domain Error Classes | 53 (auth:25, gamification:20, educational:8) |
| ADR-045 Compliant Modules | 1/22 (auth), 1 mixed (gamification), 1 started (educational) |

---

## Archivos Creados/Modificados

### Nuevos
- `orchestration/tareas/TASK-2026-03-03-COMPREHENSIVE-CODEBASE-AUDIT/AUDIT-REPORT.md` (este archivo)
- `orchestration/tareas/TASK-2026-03-03-COMPREHENSIVE-CODEBASE-AUDIT/REMEDIATION-CHECKLIST.md`

### Modificados (~31 code files + 3 inventory files)
- 8 backend service/test files (TODOs, JSDoc, annotations)
- 2 backend error/service files (domain errors)
- 13 frontend files (legacy annotations, stale TODOs)
- 8 frontend files (@deprecated removals)
- 3 inventory YAMLs

---

*Generado por SIMCO v4.0.0 | Auditoría Comprehensiva 2026-03-03*
