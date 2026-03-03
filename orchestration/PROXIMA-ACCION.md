# PROXIMA ACCION - GAMILIT

**Ultima Actualizacion:** 2026-03-03
**Version:** v5.10 (condensado — historial movido a `orchestration/referencias/PROXIMA-ACCION-HISTORICO-2026.md`)
**Estado del Proyecto:** MVP 99% completado | **SPRINT 2 COMPLETADO** (16/16 items) | Health Score: ~99/100
**Sprint Actual:** Sprint 2 COMPLETADO — Doc Health + Code-Doc Alignment + Doc Remediation COMPLETADAS — Sprint 3 funcional pendiente

---

## [2026-03-03] Comic Digital Third Wave: Visual Reconstruction — 5 problems fixed + sticker system

- **P1 (CRITICO):** Replaced `framer-motion Reorder` with `@dnd-kit/sortable` — half/third panels now render side-by-side via `flex flex-wrap gap-4` + width classes
- **P2 (CRITICO):** Replaced `framer-motion drag` with manual pointer events (`setPointerCapture` + DOM-direct updates) — elements never disappear during drag
- **P3 (ALTO):** Replaced 6 flat-color backgrounds with 8 rich gradient backgrounds (thematic + illustrated with SVGs) + decorative icons
- **P4 (ALTO):** Added sticker system: 19 stickers in 3 categories (characters, props, effects) with drag-and-drop placement
- **P5 (ALTO):** Fixed adapter data path — `exercise?.suggestedScenes` now reads from adapter top-level first
- **Archivos:** ComicDigitalExercise.tsx (rewrite), comicDigitalTypes.ts, comicDigitalMockData.ts, comicDigitalSchemas.ts
- **Validación:** Build/Lint/Typecheck 0 errors, 10/10 cross-layer checks PASS
- **Report:** `orchestration/tareas/TASK-2026-03-03-COMIC-DIGITAL-REMEDIATION/REMEDIATION-REPORT.md`

---

## [2026-03-03] Comic Digital Second Wave: 6 bugs fixed + 4 features added

- Comic Digital Second Wave: 6 bugs fixed (bubble drag precision via info.offset, background visibility via bgClass, Reorder.Group axis alignment), 4 features added (suggested scenes sidebar, template selector, exercise prop typing, touch targets 44px)
- **Archivos:** ComicDigitalExercise.tsx (main rewrite), comicDigitalMockData.ts (bg colors), exerciseAdapter.ts (suggestedScenes)
- **Validación:** Build/Lint/Type-check 0 errors, 14/14 functional checks PASS
- **Report:** `orchestration/tareas/TASK-2026-03-03-COMIC-DIGITAL-REMEDIATION/REMEDIATION-REPORT.md`

---

## [2026-03-03] Cómic Digital — Remediación Completa de Mecánica Educativa (9 Issues)

- **C1 (CRITICO):** Fixed speech bubbles ALL spawning at x:50,y:30 — stagger offset based on existing count
- **C2 (CRITICO):** Added framer-motion `drag` for free-form bubble repositioning within panel constraints
- **C3 (ALTO):** Added click-to-edit inline textarea for bubble text (was immutable "Escribe aquí...")
- **C4 (ALTO):** Added panel reordering via framer-motion `Reorder.Group` + panel deletion via Trash2 button
- **C5 (MEDIO):** Layout now visually rendered — full/half/third map to responsive width classes via `flex flex-wrap`
- **C6 (MEDIO):** Background per-panel instead of global — sidebar selector applies to selected panel
- **C7 (MEDIO):** MIN_PANELS 6→4, MAX_PANELS 12→6 — aligned with backend `@ArrayMinSize(4)`/`@ArrayMaxSize(6)`
- **C8 (MEDIO):** Backend `validateComicDigital()` now accepts `dialogue`/`narration` alongside legacy `text`
- **C9 (BAJO):** Replaced inline interfaces with imports from `comicDigitalTypes.ts` SSOT
- **Archivos:** ComicDigitalExercise.tsx (rewrite), comicDigitalTypes.ts, comicDigitalMockData.ts, exercise-validator.service.ts
- **Validación:** Build/Lint/Typecheck 0 errors, cross-layer 6/6 PASS
- **Report:** `orchestration/tareas/TASK-2026-03-03-COMIC-DIGITAL-REMEDIATION/REMEDIATION-REPORT.md`

---

## [2026-03-03] Quiz TikTok — 4-Bug Fix + Code Quality Remediation

- **BUG-1 (CRITICO):** Fixed sparse answers array causing 400 Bad Request — `getAnsweredCount()` helper + array sanitization
- **BUG-2 (MEDIO):** Fixed timer stopping on answer selection — runs continuously with ref-based interval
- **BUG-3 (MEDIO):** Fixed submit button only in sidebar — now appears inline on last question
- **BUG-4 (CRITICO):** Fixed dual-path submission — `onProgressUpdate` payload shape incompatible with backend DTO (`selectedAnswers` → `answers`, `Record<number,string>` → `string[]`, removed extra fields)
- **MF-1:** Fixed timer useEffect dep array `[timeRemaining]` recreating interval every tick → `[timeLimit]` with stoppedRef
- **DTO-1:** Fixed `-1` fallback violating backend `@Min(0)` → changed to `0`
- **Archivos:** QuizTikTokExercise.tsx, TikTokCard.tsx
- **Pre-existentes documentados (NO corregidos):** 8 issues (a11y, SRP 682 LOC, type duplication, dual export, eslint-disable, stale closure in handleTimeout, dual time tracking, responsive mb-8) + 3 dual-path issues (ActionsPanel no guard, 29 ejercicios con dual-path, userAnswers as unknown)

---

## [2026-03-03] Rubric Audit: M3/M4/M5 — 13 Validadas, 12 Correcciones Aplicadas (COMPLETED)

**Scope:** Auditoría de rúbricas de evaluación para ejercicios M3/M4/M5. 13 rúbricas validadas contra especificación, 12 correcciones aplicadas en DDL/seeds.

**Problem:**
- Rúbricas desalineadas entre documentación de diseño (SPEC-EJERCICIOS.md) y DDL (`exercise_type_rubrics`)
- Criterios sin descripción clara, pesos inconsistentes, nombres desactualizados
- Quiz TikTok sin rúbrica registrada (remediado 2026-03-03 en RUBRIC-AUDIT)
- MatrizPerspectivas: "Identificación" debería ser "Comprensión" (naming)

**Solution:**
1. **M3 (5 rúbricas):**
   - Tribunal Opiniones: 3 criterios (Clasificación 35%, Veredicto 40%, Justificación 25%)
   - Debate Digital: 4 criterios (Claridad 20%, Evidencias 30%, Lógica 25%, Contraargumentos 25%) — sin cambios
   - Análisis Fuentes: 3 criterios (Orden 40%, Comparación 30%, CRAAP 30%) — CRAAP revalorizado
   - Podcast Argumentativo: 4 criterios (Claridad 25%, Argumentación 30%, Pensamiento Crítico 25%, Presentación 20%)
   - Matriz Perspectivas: 4 criterios (Comprensión 25%, Análisis 25%, Evidencia 20%, Síntesis 30%) — renaming "Identificación"

2. **M4 (5 rúbricas):**
   - Verificador Fake News: 4 criterios (Identificación 25%, Razonamiento 30%, Referencia Fuentes 25%, Conclusión 20%)
   - Infografía Interactiva: 4 criterios (Contenido 25%, Organización 20%, Interactividad 20%, Respuestas 35%) — respuestas priorizadas
   - Navegación Hipertextual: 4 criterios (Eficiencia 25%, Relevancia 25%, Síntesis 25%, Respuesta 25%) — balanceado
   - Análisis Memes: 4 criterios (Decodificación 30%, Contexto 25%, Intertextualidad 20%, Crítica 25%)
   - Quiz TikTok: 4 criterios (Precisión 30%, Justificaciones 30%, Pensamiento Crítico 20%, Completitud 20%) — **NEW** (added 2026-03-03)

3. **M5 (3 rúbricas):**
   - Diario Multimedia: 4 criterios (Creatividad 30%, Precisión 30%, Multimedia 15%, Expresión 25%) — multimedia reducido (opcional)
   - Comic Digital: 4 criterios (Narrativa 30%, Organización Visual 20%, Precisión 25%, Creatividad 25%) — renaming "Composición"
   - Video Carta: 4 criterios (Autenticidad 25%, Mensaje 25%, Producción 25%, Emoción 25%) — typo corregido

**Files modified (6):**
- DDL (3): `apps/database/seeds/dev/educational_content/13-exercise_type_rubrics.sql`, `staging/...`, `prod/...`
- Docs (1): `docs/50-guides/frontend/impl/MECANICAS-EDUCATIVAS.md` — nueva sección "Rúbricas por Ejercicio (M3/M4/M5)"

**Validation:** 13/13 rúbricas validadas ✓, 12 correcciones aplicadas ✓, seeds ejecutadas exitosamente ✓
**Seed integrity:** Exercise count 58→58 (Quiz TikTok exercise_type_rubrics row added, no duplicates)
**Inventarios:** MASTER v14.9.13 (educational_content schema referencia)

**Report:** `orchestration/tareas/TASK-2026-03-03-RUBRIC-AUDIT/AUDIT-REPORT.md`

**Out of scope (future):**
- Frontend UI para mostrar rúbricas en calificación manual del maestro (future phase: teacher grading UI)
- Criterios de evaluación automática para M1/M2 (solo teacher-grade en M3/M4/M5)

---

## Estado Actual

### [2026-03-03] Documentation Audit — 2026-03-03 (COMPLETED)

**Scope:** Synthesis audit consolidating findings from the 2026-03-03 comprehensive codebase audit (10 phases, 23 subagents) and cross-referencing against documentation structure. Health Score: 99/100 (stable — no regression).

**Report:** `orchestration/tareas/TASK-2026-03-03-DOC-AUDIT/AUDIT-REPORT.md`

---

#### P0 Issues Identified (Not Previously in PROXIMA-ACCION)

| ID | Issue | Module | Action |
|----|-------|--------|--------|
| P0-1 | 2FA email delivery — 3 stub points, OTP never sent via email | auth | Implement mail dispatch in generate2FAToken + OTP service |
| P0-2 | Parents email verification — email body empty, non-functional | parents | Populate email template body |
| P0-3 | Parents password reset — handler returns void silently, no email sent | parents | Implement reset email dispatch |
| P0-4 | Scheduled missions — findByUserId() + completeMission() are no-ops | missions | Implement DB queries + reward distribution |

**P1 Security (from comprehensive audit):**
- `disable2FA()` skips password verification before disabling 2FA
- `refreshToken()` error masking may hide security events

---

#### Missing Documentation Items

**Missing Technical Definitions (5):**
1. **D1 — Visual Type Slot System:** Cross-component equip strategy for `visual_type` slots (avatar/frame/badge/background). DDL and entity exist; no unified doc.
2. **D2 — Boost Expiration Model:** On-read deactivation approach needs ADR. No flow diagram for purchase → activation → expiry check.
3. **D3 — RLS Multi-Tenant Enforcement (P0):** No document explains `app.current_user_id` propagation from NestJS to PostgreSQL, or `FE_USER_ID` RLS evaluation in practice.
4. **D4 — ML Coins Transaction Types:** `reference_type` values (exercise, achievement, rank_promotion, shop_purchase, bonus, welcome, teacher_bonus) not enumerated in API spec.
5. **D5 — ADR-045 Adoption Roadmap (P0):** 61% of throws still use HTTP exceptions. No migration roadmap document.

**Missing Flow Diagrams (4):**
1. **F1 — Exercise Submission End-to-End:** submit → score → XP → rank multiplier → ML Coins → achievement check → rank promotion → WebSocket → FE update
2. **F2 — Parent Registration:** registration → email verification → child link → dashboard
3. **F3 — 2FA OTP Flow:** OTP generation → send email → verify code (directly linked to P0-1)
4. **F4 — Teacher Assignment Workflow:** create assignment → assign → student notification → student completes → teacher progress view

---

#### API Documentation Gap

- **Total endpoints:** 919 actual vs 648 documented = **70.5% coverage**
- **BoostController (new, 0% documented):** 4 endpoints in `GET /boosts/:userId/active` + supporting routes
- **Lowest coverage modules:** analytics (~50%), reports (~50%), notifications (~50%), social (~40%)

---

#### Inventory Deltas (Frontend — needs update)

From Wave 0 of 2026-03-03 comprehensive audit (FRONTEND_INVENTORY updated to v12.7.0):

| Metric | MASTER_INVENTORY ref | Actual | Action |
|--------|---------------------|--------|--------|
| FE Components | 575 | 581 | Update MASTER ref |
| FE Hooks | 132 | 143 | Update MASTER ref |
| FE Pages | 70 | 81 | Update MASTER ref |
| FE Type Files | 49 | 81 | Update MASTER ref |
| FE API Service Files | 65 | 78 | Update MASTER ref |

---

#### Deprecation Items Without Timelines (7)

| # | Item | Location | Status |
|---|------|----------|--------|
| Dep1 | Schema 10 (store) marked DEPRECATED | DDL schema header | Needs decision |
| Dep2 | Schema 15 (settings) marked DEPRECATED | DDL schema header | Needs decision |
| Dep3 | `useSettings` hook | Frontend hooks | Check consumers |
| Dep4 | `checkRankPromotion()` | Backend service | Verify replacement |
| Dep5 | Social/Guild shop categories | Seeds + enums | DONE (2026-03-02) |
| Dep6 | `achievements.ml_coins_reward` | Entity + DDL | Confirm replacement field |
| Dep7 | `findByIds` | Backend repo usage | Confirm TypeORM replacement |

**Missing policy:** No `ESTANDAR-DEPRECACION.md` exists. Deprecation items accumulate without enforcement.

---

#### Priority Action Plan

**2 weeks:**
1. Implement 2FA email delivery (P0-1)
2. Fix Parents portal email verification + password reset (P0-2, P0-3)
3. Document RLS enforcement strategy (D3)
4. Create ADR-053: ADR-045 adoption roadmap (D5)
5. Create ADR-054: Boost expiration on-read model (D2)
6. Document BoostController API endpoints (4 endpoints)

**1 month:**
7. Fix scheduled-mission no-ops (P0-4)
8. Create exercise submission end-to-end flow diagram (F1)
9. Update MASTER_INVENTORY frontend metric refs to match FRONTEND_INVENTORY v12.7.0
10. Enumerate ML Coins transaction types in API spec (D4)
11. Create `ESTANDAR-DEPRECACION.md`
12. Create remaining flow diagrams (F2, F3, F4)

---

### [2026-03-03] ML Coins Remediation: Transaction Integrity + resolveProfileId (COMPLETED)

**Scope:** 3 items fuera de alcance de la investigacion ML-COINS-FIX anterior. 11 agentes orquestados (1 Opus + 6 Sonnet + 4 Haiku).

**Problem:**
- `auditBalance()` compensaba con `+ 100` hardcoded por falta de transaccion WELCOME_BONUS
- 3 funciones DDL (`promote_to_next_rank`, `update_user_rank`, `claim_achievement_reward`) creditaban `ml_coins` sin actualizar `ml_coins_earned_total`, causando drift en leaderboard de maestros
- `MLCoinsService` no usaba `resolveProfileId()`, fallando silenciosamente si recibia `auth.users.id` en vez de `profiles.id`

**Solution:**
1. `UserStatsService.create()` emite transaccion WELCOME_BONUS (amount=100, reference_type='welcome')
2. `MLCoinsService.auditBalance()` — removido `+ 100` hardcoded; SUM(transactions) es fuente de verdad
3. 3 DDL functions patched: `ml_coins_earned_total += amount` en cada funcion
4. `MLCoinsService.resolveProfileId()` agregado a 12 metodos publicos
5. DDL constraint + entity: 'welcome' agregado a reference_type

**Files modified (~10 codigo + ~6 docs):**
- Backend: user-stats.service.ts, ml-coins.service.ts, ml-coins-transaction.entity.ts
- DDL: promote_to_next_rank.sql, update_user_rank.sql, claim_achievement_reward.sql, 05-ml_coins_transactions.sql
- Tests: ml-coins.service.spec.ts (Profile repo mock), user-stats.service.spec.ts (MLCoinsTransaction repo mock)

**Validation:** Build 0 errors, Lint 0 errors, Tests 63/63 PASS, BD recreada (173 tablas)
**Inventarios:** MASTER v14.9.11 → v14.9.12, BACKEND v5.3.5 → v5.3.6
**ADR:** ADR-052 creado
**Report:** `orchestration/tareas/TASK-2026-03-03-ML-COINS-REMEDIATION/REMEDIATION-REPORT.md`

**Out of scope (future):**
- `addXp()` no consulta active boosts (multiplicador boost no aplicado a XP)
- Boost expiration cron (solo desactivacion on-read)
- Consolidacion de 3 versiones de gamificationAPI en frontend
- RankMultiplierService no tiene resolveProfileId (recibe userId de addCoinsWithRankMultiplier)

---

### [2026-03-03] ML Coins Fix: Doble Creditacion en Promocion Rango + Desync Header/Tienda (COMPLETED)

**Scope:** Phase 6 Documentation & Inventory Updates. 8 agentes orquestados (Opus 4.6 + 4 Sonnet + 3 Haiku).

**Problem:**
- User reported +1100 ML Coins jump (135→1235) after rank promotion
- Header balance (React Query) desync'd from shop balance (Zustand localStorage)

**Root Causes:**
1. **CRITICAL — Doble creditacion en rango:** `ranksService.promoteToNextRank()` llamaba `mlCoinsService.addCoins()` + DB trigger en `promote_to_next_rank()` ambos creditaban coins → duplication
2. **HIGH — Desync header/tienda:** `economyStore.addCoins()/spendCoins()` actualizaban Zustand pero NO invalidaban React Query `['userGamification']` → stale data en header
3. **HIGH — Race condition missions:** `claimRewardsFallback()` sin atomic guard → concurrent requests podian ambos pasar verificacion `claimed_at`

**Solution:**
1. Backend: Removed `mlCoinsService.addCoins()` from `ranksService.promoteToNextRang()` — DB trigger ya lo maneja
2. Backend: Added atomic guard in `claimRewardsFallback()` — `WHERE claimed_at IS NULL` + `affected === 0` check
3. Frontend: Created `shared/lib/queryClient.ts` singleton, exported from main.tsx
4. Frontend: `economyStore.addCoins()/spendCoins()` now call `queryClient.invalidateQueries(['userGamification'])`
5. Frontend: `useUserGamification` staleTime 5min → 30sec, `ShopPage.tsx` calls `fetchBalance()` on mount

**Files modified (7):**
- Backend (3): ranks.service.ts, missions.service.ts, ranks.service.spec.ts, missions.service.spec.ts
- Frontend (4): shared/lib/queryClient.ts (NEW), main.tsx, economyStore.ts, useUserGamification.ts, ShopPage.tsx

**Validation:** Build/Lint/Typecheck 0 errors, ranks/missions tests PASS, gamification 302/338 (34 pre-existing)

**Out of Scope (Future):**
- `auditBalance()` hardcoded +100 (no INITIAL transaction)
- `ml_coins_earned_total` not updated by rank promotion trigger
- Dual `/stats` vs `/summary` endpoints risk

**Report:** `orchestration/tareas/TASK-2026-03-03-ML-COINS-FIX/ML-COINS-FIX-REPORT.md`

---

### [2026-03-03] Auditoría Comprehensiva — Documentación vs Desarrollo (COMPLETED)

**Scope:** 10 phases, 23 subagents (1 Opus + 12 Sonnet + 10 Haiku). ~31 code files + 3 inventory files modified. Build/Lint/Typecheck: 0 errors.

**Wave 0 — Metric Reconciliation (5 Haiku):**
- Entity classes: 157→158 (maya-rank + message have 2 @Entity each)
- Guards: 15→9 (dedicated .guard.ts files only)
- Decorators: 18→3 (dedicated .decorator.ts files only)
- Endpoints: 915→919 (+4 from boost controller)
- FE components: 575→581, hooks: 132→143, pages: 70→81, type files: 49→81, API files: 65→78
- Mechanics: 29 active confirmed ✓
- DDL-Entity alignment: 173/173, 0 orphans

**Wave 1 — Code Quality (4 Sonnet):**
- P0 bugs found: 2FA OTPs never delivered (3 stubs), Parents email/password reset no-ops, scheduled-mission no-ops
- P1 security: disable2FA skips password, refreshToken error masking, rate limit cache leak
- 46 backend TODOs triaged (12 actionable, 8 tickets, 17 future, 5 removed)
- 17 frontend TODOs triaged (4 actionable, 8 future, 5 removed)
- ADR-045: Only auth fully compliant (86%), gamification mixed (23%), 19 modules HTTP-only

**Wave 2 — Cross-Layer + Patterns (2 Sonnet + 2 Haiku):**
- BE-FE API consumption: 96% (48 endpoints sampled)
- OCP violations: exercises.service.ts (2×19 cases), achievements (20 cases)
- 6 services with >7 deps (max 11: ExerciseSubmission, TeacherClassroomsCrud)
- Zustand: 7/13 stores lack persistence, React Query/Zustand dual-store ~80% sync

**Wave 3 — Remediation (4 Sonnet):**
- educational.errors.ts expanded 3→8 domain error classes
- 3 HTTP exceptions migrated to domain errors in exercises.service.ts
- admin-users.service.ts JSDoc 18%→~80% (9 methods documented)
- 7 legacy files annotated @deprecated (all zero references)
- 8 @deprecated zero-consumer items removed (FE)
- 3 stale TODO blocks removed, dead APIs/stores annotated

**Wave 4 — Inventories (2 Sonnet + 1 Haiku):**
- MASTER_INVENTORY: v14.9.6→v14.9.7
- BACKEND_INVENTORY: v5.3.3→v5.3.4
- FRONTEND_INVENTORY: v12.6.0→v12.7.0

**Wave 5 — Validation (3 Haiku):**
- 5/5 build checks PASS, 0 new TODOs/placeholders introduced
- Spot-check: 3/5 chains COMPLETE, 1 by-design (queue), 1 orphaned (user_suspensions)

**Report:** `orchestration/tareas/TASK-2026-03-03-COMPREHENSIVE-CODEBASE-AUDIT/AUDIT-REPORT.md`
**Checklist:** `orchestration/tareas/TASK-2026-03-03-COMPREHENSIVE-CODEBASE-AUDIT/REMEDIATION-CHECKLIST.md`

---

### [2026-03-03] M3 Pre-existing Issues Remediation: 8 Fixes (COMPLETED)

**Problem:** Post-audit of M3 exercises revealed 10 pre-existing issues (8 actionable + 2 documented/excluded):
- P1: DebateDigital catch block showed misleading 'info' feedback on submit error (user thinks submission succeeded)
- P2: MatrizPerspectivas had 3 hardcoded "Marie Curie" questions; AnalisisFuentes had hardcoded description
- P3: Duplicate FeedbackData interface in matrizPerspectivasTypes.ts (missing 'warning' type + fields), unused difficulty prop in 4 ExerciseProps, two statements on one line
- P4: FeedbackData import in isolated group instead of shared/components block

**Solution:**
1. M3-010: Added `hasSubmitError` state — catch sets it true, FeedbackModal shows `type:'error'` with retry, onClose blocks onComplete
2. M3-008: 3 questions genericized ("Marie" references removed), placeholder updated
3. M3-009: `description={adaptedExercise?.description || 'Evalúa la credibilidad de las fuentes presentadas'}`
4. M3-005: Duplicate FeedbackData removed, re-export from canonical mechanicsTypes
5. M3-007: `difficulty` prop removed from 4 ExerciseProps interfaces (never destructured/used)
6. M3-001: Two statements separated into two lines
7. M3-002: FeedbackData import moved to shared/components group

**Files modified (5):** DebateDigitalExercise.tsx, MatrizPerspectivasExercise.tsx, matrizPerspectivasTypes.ts, AnalisisFuentesExercise.tsx, PodcastArgumentativoExercise.tsx
**Validation:** Build / Type-check / Lint — 0 errors
**Inventarios:** MASTER v14.9.3 -> v14.9.4, FRONTEND v12.5.9 -> v12.6.0

---

### [2026-03-03] Shop Remediation: 4 Assets + Error Handling + Boost System ✅

**Problem:** 4 bugs in shop system preventing normal operations:
- Missing SVG asset files (golden-banner.svg, dragon-reader.svg, knowledge-shield.svg, basic-banner.svg) causing visual rendering failures
- Error 500 on re-purchase of non-consumable items (unique constraint violation)
- Boosts activated but no multiplier applied to XP calculations
- Segunda Oportunidad comodin missing required_level constraint

**Solution:**
1. **Assets:** 4 SVG files copied from guild/ and guild-temp/ directories to frames/ and badges/ directories
2. **Error handling:** Added NonConsumableDuplicatePurchaseError (409 Conflict), improved catch handler for unique constraint violations (23505)
3. **Boost system:** Created BoostService (getActiveBoosts, getActiveMultiplier, deactivateExpiredBoosts) + BoostController (GET /boosts/:userId/active), integrated boost activation in shop purchase flow
4. **Seeds:** Added required_level=5 UPDATE statement for Segunda Oportunidad across dev/staging/prod environments
5. **Frontend:** Added boost indicator badges in GamifiedHeader showing active boosts with time remaining

**Files modified (13):**
- Backend (7): gamification.errors.ts, shop.service.ts, boost.service.ts (NEW), boost.controller.ts (NEW), gamification.module.ts, services/index.ts, controllers/index.ts
- Frontend (3): economyTypes.ts, shopAPI.ts, GamifiedHeader.tsx
- Seeds (3): 16-shop_items_expanded.sql (x3 environments)
- Assets (4): golden-banner.svg, basic-banner.svg, dragon-reader.svg, knowledge-shield.svg

**Validation:** Build ✓ | Lint ✓ | Typecheck ✓ | Tests 307 passed ✓
**Inventarios:** MASTER v14.9.2 → v14.9.3 (services 172→173, controllers 108→109, endpoints 914→915)

**Out of scope (future):**
- addXp() does not yet query active boosts for multiplier application
- Boost expiration cron job (on-read deactivation only, no scheduled job)

---

### [2026-03-03] M3 Exercises Fix: Adapter Pipeline Integration ✅

**Problem:** 4 ejercicios del Módulo 3 (Comprensión Crítica) bypaseaban el adapter pipeline estándar, causando errores de integración con backend:
- PodcastArgumentativo: ID hardcodeado `'podcast-1'` → 500 error (`invalid input syntax for type uuid`)
- AnalisisFuentes: `fetchSources()` sin exerciseId → enviaba 'default' al backend
- MatrizPerspectivas: siempre sobreescribía datos API con mock perspectives
- DebateDigital: solo usaba mock `debateTopic`, sin consumir datos del adapter pipeline

**Solution:**
1. **4 adaptadores dedicados** creados en `exerciseAdapter.ts`: `adaptToPodcastArgumentativoData`, `adaptToAnalisisFuentesData`, `adaptToMatrizPerspectivasData`, `adaptToDebateDigitalData`
2. **registrations.ts** actualizado: 4 M3 registrations cambiados de `adaptToBaseExercise` → adaptadores dedicados
3. **4 ejercicios M3** actualizados: aceptan `exercise` prop del adapter pipeline con fallback a API/mock (mismo patrón M4)
4. **Bugs directos** corregidos: hardcoded ID → exerciseId, missing param → exerciseId, mock override → conditional

**Files modified (6):**
- `apps/frontend/src/shared/utils/exerciseAdapter.ts` — 4 nuevos adaptadores + 4 router entries
- `apps/frontend/src/features/exercises/registry/registrations.ts` — 4 imports + 4 registrations actualizadas
- `apps/frontend/src/features/mechanics/module3/PodcastArgumentativo/PodcastArgumentativoExercise.tsx` — fix ID + exercise prop
- `apps/frontend/src/features/mechanics/module3/AnalisisFuentes/AnalisisFuentesExercise.tsx` — fix exerciseId + exercise prop
- `apps/frontend/src/features/mechanics/module3/MatrizPerspectivas/MatrizPerspectivasExercise.tsx` — fix mock override + exercise prop
- `apps/frontend/src/features/mechanics/module3/DebateDigital/DebateDigitalExercise.tsx` — exercise prop + currentTopic

**Validation:** Build OK, Typecheck OK, Lint 0 errors (FE+BE).
**Inventarios:** MASTER v14.9.1→v14.9.2, FRONTEND v12.5.8→v12.5.9

---

### [2026-03-02] SopaLetras Responsive Fix: Mobile Grid Overflow ✅

**Problem:** SopaLetras grid (exercise 5, module 1) used fixed 40x40px cells — needed 468px but only ~280px available on mobile. User had to zoom out to 73%.

**Solution:** Adapted Crucigrama's proven `useContainerSize` pattern:
1. **SopaLetrasGrid.tsx:** Added `cellSize` prop, replaced fixed `w-10 h-10 text-lg` with dynamic `style={{ width, height, fontSize }}`, responsive wrapper padding `p-2 sm:p-4`, conditional hover at cellSize >= 36
2. **SopaLetrasExercise.tsx:** Added `useContainerSize` hook, cell size calculation (DEFAULT=40, MIN=24, clamped), `containerRef` with `min-w-0`, conditional `overflow-x-auto` scroll wrapper with hint text

**Sizing results:** 390px+ phones: no scroll (25-28px cells). 360px: minor 12px scroll (24px cells). Desktop: unchanged 40px cells.

**Files modified (2):** SopaLetrasGrid.tsx, SopaLetrasExercise.tsx
**Validation:** Build OK, Lint 0 errors, Type-check OK. 20/20 functional checks PASS.
**Inventarios:** MASTER v14.9.0→v14.9.1, FRONTEND v12.5.7→v12.5.8

---

### [2026-03-02] ML Coins Balance Fix: Header/Shop Desync ✅

**Problem:** User saw ML Coins balance of 675 in header (GamifiedHeader) but 175 in shop (ShopPage). Root cause: stale localStorage value — header loaded from Zustand store (updated by WebSocket), but shop displayed cached balance.

**Solution implemented:**
1. **ShopPage.tsx:** Added `fetchBalance()` call on component mount to fetch latest balance from backend before rendering shop
2. **useGamificationSocket.ts:** Added `['userGamification']` query key to invalidation list on socket updates + sync Zustand `economyStore` directly
3. **useShopPurchase.ts:** Instant balance update from purchase response DTO (`remaining_balance` field)
4. **bonus-coins.service.ts:** Added MLCoinsTransaction audit entry for teacher bonus grants (improves auditability)

**Files modified (4):**
- `apps/frontend/src/apps/student/pages/ShopPage.tsx` — fetchBalance on mount
- `apps/frontend/src/features/gamification/hooks/useGamificationSocket.ts` — query key + store sync
- `apps/frontend/src/features/gamification/economy/hooks/useShopPurchase.ts` — instant balance update
- `apps/backend/src/modules/gamification/services/bonus-coins.service.ts` — audit trail via MLCoinsTransaction

**Validation:** Build OK, Lint 0 errors, Tests OK. Balance now consistent across header/shop/real-time.

**Inventarios actualizados:**
- MASTER_INVENTORY: v14.8.9 → v14.9.0
- FRONTEND_INVENTORY: v12.5.6 → v12.5.7
- BACKEND_INVENTORY: v5.4.1 → v5.3.2

---

### [2026-03-02] Exercise Fixes Phase 2: Timer Repositioning + DnD Icons ✅

**5 archivos frontend modificados. Build/Lint/Typecheck: 0 errores.**

**Problemas resueltos:**
1. **Quiz TikTok timer oculto (CRITICO):** Timer en `top-6 right-6` (sin z-index) quedaba completamente detrás del botón "Menú" (`right-4 top-4 z-30`). Fix: Timer movido a `top-4 left-1/2 -translate-x-1/2 z-10` — centrado horizontalmente entre Salir y Menú.
2. **Quiz TikTok bottom overcrowding (MEDIO):** 3 capas absolutas separadas (`bottom-40`, `bottom-24`, `bottom-8`) se solapaban en pantallas pequeñas. Fix: Refactorizado a un solo contenedor flex-col (`absolute bottom-0 flex flex-col gap-3`) con flujo natural.
3. **Infografía DnD sin iconos (MEDIO):** En modo Drag & Drop (default), DraggableCard y DroppableZone no mostraban iconos temáticos. Fix: Agregado `iconMap` + `getIconComponent()` + prop `icon?: string` a ambos componentes. Mismo patrón que InteractiveCard (modo Click).

**Archivos modificados (5):**
- `TikTokCard.tsx` — Timer position CSS (top-center z-10)
- `QuizTikTokExercise.tsx` — Bottom layout: 3 absolute → 1 flex-col
- `DraggableCard.tsx` — icon prop + iconMap + Lucide rendering
- `DroppableZone.tsx` — icon prop + iconMap + Lucide rendering
- `InfografiaInteractivaExercise.tsx` — Pass icon={card.icon} a DraggableCard (x2) y DroppableZone (x1)

**Validación:** Build OK, Lint 0 errors (98 warnings baseline), Type-check OK. Code review 11/11 checks PASS.

---

### [2026-03-02] Frame Rendering Fix: visual_type Slot System ✅

**4 problemas de rendering de marcos resueltos. ~12 archivos modificados. Build/Lint/Typecheck/DB: 0 errores.**

**Problemas resueltos:**
1. **Frames en avatar (CRITICO):** ProfileHero, GamifiedHeader, EnhancedStatsGrid, CompletionModal/Header aplicaban `frameColor` al avatar circle. Removido — frames solo en RankProgressWidget (rank card).
2. **SVG distorsionado:** RankProgressWidget SVG frame usaba `inset-0 h-full w-full` que estiraba 1:1 a ~1.5:1. Fix: `aspect-square` + centrado vertical con `-translate-y-1/2`.
3. **Slot equipamiento compartido (CRITICO):** DDL UNIQUE `(user_id, category_id)` causaba que equipar avatar REEMPLAZARA frame (ambos `cosmetics`). Nueva columna `visual_type` con UNIQUE `(user_id, visual_type)` permite slots independientes.
4. **Labels incorrectos:** `getEquipLabel()` fallback `category === 'cosmetics'` etiquetaba TODO como "Aplicar Marco". Switch por `metadata.type` con labels correctos por tipo.

**DDL (2 archivos):** `21-user_equipped_items.sql` (visual_type + nuevo UNIQUE), migration script `2026-03-02-visual-type-equip-slot.sql`
**Backend (2 archivos):** `user-equipped-item.entity.ts` (visual_type column + @Unique), `inventory.service.ts` (equipItem + maps usan visual_type)
**Frontend (8 archivos):** ProfileHero, EnhancedProfilePage, GamifiedHeader, RankProgressWidget, EnhancedStatsGrid, ProfileInventoryTab, CompletionModal, CompletionHeader, CosmeticAvatar
**Seeds (1 archivo):** `19-user_equipped_items-demo.sql` (visual_type + ON CONFLICT fix)
**Docs (3 archivos):** FLUJO-RENDERING-COSMETICOS.md, schema-reference 04-gamification.md, MASTER_INVENTORY

**Inventarios actualizados:**
- MASTER_INVENTORY: v14.8.7 → v14.8.8

**Validacion:** Backend build 0 errors, lint 0 errors. Frontend build 0 errors, lint 0 errors, typecheck 0 errors. DB recreada exitosamente, `visual_type` column + UNIQUE verificados.

---

### [2026-03-02] Exercise Fixes: M1 is_active, M4 TikTok, M4 Infografia ✅

**4 exercise issues resueltas. 12 archivos modificados. Build/Lint/Typecheck: 0 errores.**

**Problemas resueltos:**
1. **M1 Comprension Auditiva visible (BACKLOG):** exercises.service.ts findByModuleId() ahora filtra `is_active: true`, ocultando automáticamente ejercicios en estado BACKLOG (comprension_auditiva)
2. **M4 Quiz TikTok timer insuficiente:** TikTokCard timeout default 30→20s, urgency visual activado <=5s, onTimeout auto-avanza al siguiente ejercicio, button contrast fix (white borders on dark bg)
3. **M4 Infografia Interactiva display issues:**
   - InteractiveCard renderiza Lucide icons desde `card.icon` string (no hardcoded values)
   - DataVisualization position.x/y usa `%` CSS units (no px) para responsive
   - exerciseAdapter extrae `timeLimit` de config y proporciona fallback `section.title`
   - Agregado manual evaluation badge
4. **M4 Infografia seed titles missing:** Agregado campo `title` a todas las secciones de infografia en 3 envs (dev/staging/prod)

**Archivos backend (1):** exercises.service.ts (findByModuleId is_active filter)
**Archivos frontend (7):** TikTokCard.tsx, QuizTikTokExercise.tsx, exerciseAdapter.ts, InteractiveCard.tsx, DataVisualization.tsx, InfografiaInteractivaExercise.tsx, types (QuizTikTokData timeLimit)
**Archivos seeds (3):** infografia sections con title field (dev/staging/prod)

**Inventarios actualizados:**
- MASTER_INVENTORY: v14.8.6 → v14.8.7 (changelog entry)
- FRONTEND_INVENTORY: v12.5.4 → v12.5.5 (changelog entry)
- BACKEND_INVENTORY: v5.4.0 → v5.4.1 (changelog entry)

**Validacion:** Build 0 errors, Lint 0 errors, Typecheck 0 errors

**Deferred items:**
- Infografia drag-drop (concept grouping) — requires significant redesign (non-trivial)
- Infografia custom student pairs — new feature (backlog)

---

### [2026-03-02] Shop Social/Guild Cleanup — Inventory Update ✅

**Shop categories cleanup completado. Removidas categorias guild/social (fuera de scope). Inventarios actualizados.**

**Cambios aplicados:**
- Shop categories: 5 → 3 active (consumables, cosmetics, boosts). Guild y social scopes removidos.
- Shop items: 38 → 31 total (guild/social items removidos de seeds)
- Categoria removida: `shop_category_type` ENUM value 'social' no mas usada
- Seeds actualizadas: 12-shop_categories (5→3 registros), 13-shop_items (20→16), 16-shop_items_metadata (18→15)

**Inventarios actualizados:**
- MASTER_INVENTORY: v14.8.5 → v14.8.6 (shop metrics, nota changelog)
- FRONTEND_INVENTORY: v12.5.3 → v12.5.4 (ShopCategory type reduction, ShopNavigation)
- SEEDS_INVENTORY: v3.4.0 → v3.5.0 (shop seed counts, removal notes)

**Nota arquitectonica:** Social features module permanece a 60% completitud per MASTER_INVENTORY, pero shop integration es ahora limpio — social module puede permanecer en backlog sin afectar tienda de consumibles/cosmeticos/boosts.

**Validacion:** Inventarios SSOT actualizados, DDL alineado con seeds, no hay bloqueantes de deploy.

---

### [2026-03-01] Documentation Remediation: Comodines/Consumables System ✅

**Auditoria comprehensiva (3 agentes Explore) revelo 23 gaps de documentacion. Remediados los 4 criticos + 2 high-priority. 6 archivos doc actualizados.**

**Gaps corregidos (6):**
1. **ET-GAM-002-comodines.md** — Seccion "Database Implementation" (lineas 174-635) documentaba diseno original (tablas normalizadas, funciones SQL) que nunca se implemento. Agregados avisos prominentes marcando diseno vs implementacion real (wide table + TypeORM). Version 2.4.0→2.5.0.
2. **03-GAMIFICATION.md** — Response schema de POST /purchase era incorrecto (formato simplificado → InventoryResponseDto completo). GET /comodines catalogo no tenia response schema. Ambos corregidos.
3. **hooks-spec/04-GAMIFICATION.md** — useExerciseComodines no estaba documentado en specs formales. Agregada seccion completa (parametros, retorno, endpoints, consumidores, notas).
4. **01-ARQUITECTURA.md** — No existia diagrama de arquitectura del subsistema comodines. Agregado con diagrama ASCII + dual purchase paths.
5. **SPEC-GAMIFICATION.md** — Detalle insuficiente sobre modelo de datos y bridge. Expandida seccion 5.6 con wide table, funciones SQL no invocadas, bridge, error handling gap.
6. **ET-GAM-002** — Seccion "Backend Implementation" referenciaba pseudocodigo de diseno. Agregada nota apuntando a implementacion real.

**Hallazgos ya resueltos (no requirieron accion):**
- ESTANDAR-METADATA-ITEMS.md seccion 6.3 (consumable effect_data) — ya existia
- ConsumablesPanel JSDoc — ya existia
- FLUJO-EJERCICIO-COMPLETO.md — ya usaba terminologia correcta
- FLUJO-TIENDA-COMPRA.md — mapping effect_type ya documentado

**Validacion:** Build/Lint/Typecheck 0 errores (backend + frontend)

---

### [2026-03-01] Fix Comodines Use 500 Error (item_id UUID→VARCHAR) ✅

**Problema resuelto:**
- Error `QueryFailedError: invalid input syntax for type uuid: "comodin_pistas"` al usar comodines en ejercicios
- Causa: DDL y entidad definían `item_id` como UUID, pero el código escribe strings semánticos (ej. `"comodin_pistas"`, `"comodin_vision_lectora"`)

**Solución implementada:**
- DDL `12-inventory_transactions.sql`: Cambio `item_id UUID` → `item_id VARCHAR(100)` (compatible con strings semánticos)
- Entity `inventory-transaction.entity.ts`: Cambio correspondiente `item_id: string` en clase
- Validacion: Ambos cambios mantienen coherencia DDL↔Entity↔Backend

**Archivos modificados:** 2
- `apps/database/ddl/12-inventory_transactions.sql`
- `apps/backend/src/modules/gamification/entities/inventory-transaction.entity.ts`

**Validación:** Build 0 errors, Lint 0 errors, Tests 308 passed (gamification module)

---

### [2026-03-01] Fix Bridge Shop→Comodines (Inventory Sync) ✅

**Documentacion actualizada para fix de bridge shop→comodines. 3 archivos de doc actualizados.**

**Problema resuelto:**
- `incrementFromShopPurchase()` usaba transaccion anidada con entidad detached — save fallaba silenciosamente
- Compras de consumibles no sincronizaban correctamente a `comodines_inventory`

**Fix implementado:**
- Reemplazo transaccion anidada por `inventoryRepo.save()` directo (misma EntityManager que cargo la entidad)
- Logging `[BRIDGE]` detallado para diagnostico en logs del servidor
- Error logging en `shop.service.ts` actualizado de `warn` a `error` con stack traces

**Archivos modificados:**
1. `apps/backend/src/modules/gamification/services/comodines.service.ts` — `incrementFromShopPurchase()` fix
2. `apps/backend/src/modules/gamification/services/shop.service.ts` — error logging enhancement

**Documentacion actualizada (3 archivos):**
1. `docs/60-portals/student/specs/SPEC-GAMIFICATION.md` — Bridge shop→comodines + mecanismo directo
2. `docs/40-api/api-reference/03-GAMIFICATION.md` — Nota de sincronizacion automatica con `[BRIDGE-ERROR]` logging
3. `orchestration/PROXIMA-ACCION.md` — Entrada de status completada

**Validacion:** Build 0 errors, Lint 0 errors, Tests 308 passed (gamification module)

---

### [2026-03-01] Fix Consumable Re-purchase 500 Error (Unique Constraint Fix) ✅

**Documentacion completada para fix de re-compra de consumibles. 4 archivos de doc actualizados.**

**Problema resuelto:**
- Compra de consumibles provocaba error 500 por violacion de constraint UNIQUE(user_id, item_id) WHERE status='completed' AND is_active=true
- Frontend tenia error handling deficiente (sin mensajes amigables al usuario)
- Comodines bridge estaba bloqueado por fallos en tienda (problema secundario)

**Solucion implementada:**
- Backend (shop.service.ts): Desactiva compra anterior antes de crear nueva (`is_active=false, consumed_at=NOW()`)
- Error class: ConsumablePurchaseConflictError (409) como safety net para race conditions
- Frontend: Error handling mejorado con mensajes en español

**Documentacion actualizada (4 archivos):**
1. `docs/40-api/api-reference/03-GAMIFICATION.md` — Response code 409 + nota re-compra consumibles
2. `docs/60-portals/student/specs/SPEC-GAMIFICATION.md` — Comportamiento consumibles + concurrencia
3. `docs/30-ux-ui/flujos/student/FLUJO-TIENDA-COMPRA.md` — Nueva seccion "Re-compra de Consumibles" + error 409
4. `orchestration/PROXIMA-ACCION.md` — Entrada de status completada

**Metricas:** 0 errores de build/lint, comodines bridge ahora funcional

### [2026-03-01] Modal Responsive Remediation: Pantallas Pequeñas ✅

**Remediacion responsive de modales para pantallas pequeñas completada. 30+ archivos de modal/dialog corregidos. ESTANDAR-FRONTEND-MODAL-RESPONSIVE.md creado. Build/Lint/Typecheck: 0 errores.**

**Cambios aplicados:**
1. Scroll wrappers (max-h + overflow-y-auto) agregados a modales usando contentClassName="custom"
2. Grids responsivos: grid-cols-3/4 → grid-cols-1 sm:grid-cols-3/4 en modales
3. Touch targets: min-w-[44px] min-h-[44px] agregados a close/nav buttons
4. CSS utilities: .modal-scroll-mobile, .modal-grid-responsive-{2,3,4} agregados a detective-theme.css

**Archivos modificados:** 30+ modal/dialog files across student, teacher, admin portales
**Standard creado:** ESTANDAR-FRONTEND-MODAL-RESPONSIVE.md
**Inventarios actualizados:** MASTER_INVENTORY v14.8.4→v14.8.5, FRONTEND_INVENTORY v12.5.2→v12.5.3

### [2026-03-01] Fix Consumables System: Tienda + Comodines + Pistas ✅

**3 fases paralelas (2 Sonnet + 1 Haiku) + auditoría post-fix (2 Sonnet + 1 Haiku). 7 archivos codigo + 1 error class + 9 archivos docs. Build/Lint/Typecheck: 0 errores.**

**Problemas resueltos:**
1. **Tienda "Adquirido" para consumibles:** Consumibles (Pista de Detective, Vision Lectora, Segunda Oportunidad, Boost XP, Boost Coins) mostraban "Adquirido" tras primera compra. Ahora siempre muestran "Comprar" con badge "Tienes: N" (con aria-label accesible).
2. **Puente Shop→Comodines:** Compras de consumibles en la tienda no acreditaban al inventario de comodines. Nuevo metodo `incrementFromShopPurchase()` en ComodinesService + sync post-compra en ShopService (non-blocking). Ambos saves atómicos en transaction.
3. **Pistas Comodin→HintSystem:** Click "Usar" en pistas del ConsumablesPanel no revelaba hints en el HintSystem. Nuevo prop `externalRevealCount` en HintSystem + wiring en ActionsPanel.

**Auditoría de calidad post-fix (3 subagentes paralelos):**
- **Estándares:** 1 FAIL resuelto (BadRequestException→InvalidComodinTypeError, ADR-045), 5 WARNINGs resueltos (enum typing, quantity validation, transaction atomicity, error logging, a11y)
- **Documentación:** 9 archivos docs actualizados (ET-GAM-002, FLUJO-TIENDA-COMPRA, FL-SYS-03, PORTAL-STUDENT-API-REF, 03-GAMIFICATION, 04-FEATURES, SPEC-GAMIFICATION, FLUJO-EJERCICIO-COMPLETO, ESTANDAR-METADATA-ITEMS)
- **Coherencia:** DDL↔Entity↔Backend↔Frontend 100% alineados, inventarios sin cambios de métricas

**Archivos backend (3):** comodines.service.ts (+incrementFromShopPurchase con transaction atómica), shop.service.ts (+ComodinesService DI, Record<string,ComodinTypeEnum>, sync post-compra), gamification.errors.ts (+InvalidComodinTypeError)
**Archivos frontend (5):** useShopData.ts (isOwned fix, ownedQuantity, loop optimizado), economyTypes.ts (+ownedQuantity), ShopItemCard.tsx (badge "Tienes: N" + aria-label), HintSystem.tsx (+externalRevealCount), ActionsPanel.tsx (+comodinesContext wiring)
**Docs (9):** ET-GAM-002, FLUJO-TIENDA-COMPRA, FL-SYS-03, PORTAL-STUDENT-API-REF, 03-GAMIFICATION, 04-FEATURES, SPEC-GAMIFICATION, FLUJO-EJERCICIO-COMPLETO, ESTANDAR-METADATA-ITEMS
**Validacion final:** Backend build/lint OK, Frontend build/lint/type-check OK. Tests gamification: 308 passed (4 fallos pre-existentes: socialDataSource DI, no regresion).

### [2026-03-01] TASK-DB125-TEACHER-FIX: Fix DB-125 Convention in Teacher Services ✅
- **Archivos:** `exercise-responses.service.ts`, `teacher-classrooms-crud.service.ts`
- **Fix:** 4 instancias de confusión user_id vs profile.id corregidas
- **Resultado:** Teacher portal classrooms (404) y attempts (500) resueltos
- **Build:** PASS | **Deploy:** PM2 restart OK | **Health:** OK

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

## Proxima Accion Recomendada

**[2026-03-04] Integration testing of boost system in production.** Verify that:
1. `GET /boosts/:userId/active` returns expected boost records with expiration times
2. Boost indicators display correctly in GamifiedHeader (badges with time)
3. Boosts persist across exercises (session continuity)
4. Boost expiration is detected on-read when fetching active boosts
5. XP multiplier is applied when boost is active (FUTURE: requires addXp() hook to query boosts)

**Acceptance criteria:** Boost system functional end-to-end except XP multiplier calculation (acceptable gap for v14.9.3).

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
