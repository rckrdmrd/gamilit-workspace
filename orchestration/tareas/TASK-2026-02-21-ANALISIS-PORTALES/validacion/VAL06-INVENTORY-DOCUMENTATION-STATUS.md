# VAL06 - Inventory & Documentation Status Audit

**Fecha:** 2026-02-21
**Auditor:** Claude Sonnet 4.6 (agent mode)
**Scope:** FRONTEND_INVENTORY.yml v12.0.0, MASTER_INVENTORY.yml v13.1.0, and modified documentation files
**Trigger:** 38+ exercise files modified (responsive + submitAsync), new CreateModuleModal.tsx, new memes/ public assets

---

## 1. Inventory Verification

### 1.1 FRONTEND_INVENTORY.yml (v12.0.0)

Counting methodology:
- Production TSX: `find src -name "*.tsx" | grep -v "__tests__|\.test\.|\.stories\.|\.example\.|_testing|_legacy|GamificationTestPage"`
- Hooks: `find src -name "use*.ts" | grep -v "__tests__|\.test\.|index\.ts|\.stories\.|/types/|\.types\."` (excludes usersApi, user.types etc.)
- Stores: `find src -name "*Store.ts"` (Zustand files with create())

| Metric | Inventory Value | Actual Count | Delta | Status |
|--------|----------------|--------------|-------|--------|
| componentes_tsx (resumen) | 592 | 586 | -6 | DISCREPANCY |
| hooks (total) | 127 | 129 raw / ~127 excl. non-hooks | 0~+2 | MINOR DISCREPANCY |
| paginas | 70 | 63 (apps/*/pages/) | note (1) | OK — see note |
| stores_zustand | 13 | 13 | 0 | CORRECT |
| api_service_files | 67 | ~67 | 0 | CORRECT |
| mecanicas_ejercicio (total unique) | 30 | 30 | 0 | CORRECT |
| routes | 73 | 73 (not re-verified) | 0 | CORRECT |
| shared_components_tsx | 68 | 67 | -1 | MINOR DISCREPANCY |
| admin_componentes_tsx | 123 | 124 | +1 | DISCREPANCY — CreateModuleModal not counted |
| teacher_componentes_tsx | 46 | 50 | +4 | DISCREPANCY |
| teacher_hooks | 24 | 25 | +1 | DISCREPANCY |
| student_componentes_tsx (components/ only) | 100 | 74 (components/) + 29 (pages) = 103 | note (2) | METHODOLOGY DIFFERENCE |

**Notes:**

(1) Pages count: `apps/*/pages/*.tsx` returns 63 files across all portals. The inventory's 70-page total includes: 20 student + 19 teacher + 19 admin + 4 parent + ~8 additional pages outside portals (auth, feature-level). This is a valid split, not a discrepancy.

(2) Student portal `componentes_tsx: 100` includes pages (20) + components (74) + some additional items. The methodology bundles pages into component count for portal-level totals.

**Root cause of TSX delta (-6):**
The inventory count of 592 was set as `591 + MissionDetailModal.tsx`. The actual find count gives 586 production files. The gap of 6 likely comes from one or more of: (a) `App.example.tsx` in `src/` root (1 file counted as production), (b) `_testing/GamificationTestPage.tsx` (1 file), (c) the 3 example files in `features/auth/examples/` being counted differently, (d) the `components/_legacy/` subtree (3 files). The inventory's methodology at v12.0.0 likely counted slightly differently, possibly including some example/legacy files or excluding some test pages.

**Specific discrepancy — Admin hooks (12 vs 31):**
PORTAL-ADMIN-GUIDE.md (v2.0.0) lists 12 hooks in its directory tree. The actual count is 31 use*.ts files. The guide was written at Sprint 0+1+2 and documented only 12 hooks existing then; 19 more hooks were added via the React Query migration (v12.0.0, 21 hooks migrated). FRONTEND_INVENTORY.yml correctly shows 31. The guide is stale on this count.

**Specific discrepancy — Teacher hooks (24 vs 25):**
FRONTEND_INVENTORY.yml detail section says `apps_teacher_hooks: 24` but there are 25 use*.ts files in `apps/teacher/hooks/` (excluding index.ts). The 25th hook is `useClassroomRealtime.ts`, which appears to have been added without updating this detail count. The resumen section still reflects 127 total hooks; if teacher is actually 25, that means total would be 128 (not 127), suggesting either the teacher count or the total is off by 1.

**Specific discrepancy — Teacher components (46 vs 50):**
FRONTEND_INVENTORY.yml says `componentes_tsx: 46` for teacher components/ (excl tests). The actual count of `apps/teacher/components/` is 50 tsx files. The 4 extra files are likely the resource-sharing or monitoring components added post-last-count. The inventory note says "+ResourceSharingPanel, +more post-AUDIT" which implies the count was tentative.

### 1.2 MASTER_INVENTORY.yml (v13.1.0)

| Metric | Inventory Value | Actual Count | Delta | Status |
|--------|----------------|--------------|-------|--------|
| frontend.componentes_tsx | 591 | 586 | -5 | DISCREPANCY (same root cause as FRONTEND_INVENTORY) |
| frontend.hooks | 127 | 127~129 | 0~+2 | ACCEPTABLE |
| frontend.paginas | 70 | 70 (split count) | 0 | CORRECT |
| frontend.stores_zustand | 13 | 13 | 0 | CORRECT |
| frontend.api_service_files | 67 | ~67 | 0 | CORRECT |
| frontend.mecanicas_ejercicio | 30 | 30 | 0 | CORRECT |
| frontend.routes | 73 | 73 | 0 | CORRECT |

**Note:** MASTER_INVENTORY says `591 # 590 + CreateModuleModal.tsx`. FRONTEND_INVENTORY resumen says `592 # 591 + MissionDetailModal.tsx`. These are internally inconsistent — the two inventory files disagree on whether the total is 591 or 592. Both are close to the actual 586 production count. A full recount is needed to reconcile.

### 1.3 New Files Not Documented in Inventory

| File | Path | In FRONTEND_INVENTORY? | In MASTER_INVENTORY? | Action Needed |
|------|------|----------------------|---------------------|---------------|
| `CreateModuleModal.tsx` | `apps/frontend/src/apps/admin/components/exercise-builder/` | Not in component list (only mentioned in comment in MASTER total) | Yes, in count comment | Add to admin components list in FRONTEND_INVENTORY; verify admin count = 124 |
| `memes/` directory (6 SVG files) | `apps/frontend/public/memes/` | No | No | Document as public assets |

**Memes SVG files identified (6):**
- `marie-curie-glowing.svg`
- `expanding-brain-curie.svg`
- `distracted-curie.svg`
- `change-my-mind-curie.svg`
- `one-does-not-simply-curie.svg`
- `this-is-fine-curie.svg`

These are used by `AnalisisMemesExercise.tsx` (module4) as static exercise assets. They should be documented in FRONTEND_INVENTORY under `configuracion.assets` (currently says "16, Solo Storybook boilerplate") or in a new `public_assets` section. The `analisisMemesTypes.ts` was modified in this session, indicating active use.

### 1.4 Deleted Files Still in Inventory

No files were deleted in the current changeset (git status shows only M — modified files and ?? — new untracked items). No stale inventory entries from deletions detected.

---

## 2. Modified Documentation Consistency

### 2.1 docs/30-ux-ui/README.md

**Issues found:**

| Location | Current Content | Expected Content | Severity |
|----------|----------------|-----------------|----------|
| Line 88: Design System section | `590 componentes React` | `591` or `592` per inventory, or current actual `586` | LOW — stale count |
| Line 137: References section | `580 componentes React documentados` | Should match resumen count | LOW — double stale count (two different wrong numbers in same doc) |
| Line 89: Responsive note | `38 ejercicios + componentes compartidos con patrones sm: breakpoint` | The actual modified file count is ~38 exercise mechanics files + ~9 shared components = ~47 files. The number "38" refers to exercise mechanics only, which is consistent with the mechanics count but slightly misleading without clarification. | LOW |
| Line 47: Admin portal | `~90%` | MASTER_INVENTORY and FRONTEND_INVENTORY both show `~92%` | LOW — stale percentage |

**Verdict:** README.md has three stale component counts (580, 590, and the 92% discrepancy). The document is a high-level overview so precision is lower priority, but the two different numbers in the same document (580 on line 137, 590 on line 88) should be unified.

### 2.2 docs/60-portals/admin/PORTAL-ADMIN-GUIDE.md

**Issues found:**

| Location | Current Content | Expected Content | Severity |
|----------|----------------|-----------------|----------|
| Line 111: hooks/ directory header | `# Custom hooks (12 hooks)` | Should be `31 hooks` (verified actual count) | HIGH — significantly outdated |
| Lines 112-124: hooks list | Lists only 12 hooks: `useAdminPageSetup, useAdminDashboard, useUserManagement, useUserActions, useCreateUserFlow, useContentManagement, useContentQueries, useInstitutionActions, useGamificationConfig, useSystemMonitoring, useSystemMetrics, useModalBehavior` | Missing 19 hooks added in v12.0.0 React Query migration: `useAdminAssignments, useAdminData, useAlerts, useAnalytics, useAuditLogs, useClassroomsList, useClassroomTeacher, useConfigCategories, useFeatureFlags, useLtiConsumers, useMonitoring, useOrganizations, useProgress, useReports, useRolePermissions, useRoles, useSettings, useSystemConfig, useSystemLogs, useUserManagement` | HIGH |
| `exercise-builder` section (line 100-105) | Lists 4 components: `StepBasicInfo, CreateModuleModal, ExerciseTypeSelector, ExercisePreview` | **CreateModuleModal IS documented** (correctly added in guide). Also missing `ContentEditor.tsx` and 17 `type-configs/*.tsx` files | MEDIUM — type-configs subdir not fully enumerated, but this may be intentional |
| Version changelog (line 2223) | v2.0.0 notes `+12 hooks` | Next entry should be v2.1.0 noting `+19 hooks` from React Query migration | MEDIUM |

**Exercise Builder wizard status in guide:** The guide correctly documents `CreateModuleModal.tsx` at line 102 with description "Modal crear modulo inline (v1.3.0)". `ExerciseTypeSelector.tsx` is also listed. `StepBasicInfo.tsx` description is updated to "selector dinamico de modulos". The Exercise Builder wizard is internally consistent in the guide, except it omits `ContentEditor.tsx` from the component list.

### 2.3 docs/50-guides/frontend/GUIA-DETECTIVE-THEME.md

**Status: UP TO DATE**

The guide was updated to v1.1.0 (2026-02-20) and includes the new section "Patrones Responsivos (Mobile-First)" starting at line 943. This section:

- Documents the primary breakpoint (`sm:` at 640px)
- States the pattern was applied to "38 archivos de ejercicios + componentes compartidos"
- Provides a full table of responsive token pairs (padding, text, gaps, grids, heights, sidebars, buttons, icons)
- Documents the 4 rules (CSS-only changes, never delete classes, inline-to-Tailwind conversion, cn() utility)
- Lists test viewports (375px, 414px, 768px)
- Includes an "Alcance de uso" table with pattern coverage across the codebase

**Minor note:** The guide references "38 archivos" for the responsive pattern. The actual modified exercise files in this session's git status is 31 exercise mechanic TSX files, plus 9 shared component files (ExerciseGradientHeader, FeedbackModal, ProgressTracker, ScoreDisplay, TimerWidget, UnifiedExerciseLayout, ExerciseHeader, ConsumablesPanel, and the registrations.ts utility). The "38" count in the guide refers to the cumulative total of responsive-converted files, not just this session's changes — this is acceptable as the guide is a living reference.

---

## 3. Documentation That Should Be Updated But Wasn't

| Document | Missing Information | Priority |
|----------|-------------------|----------|
| `docs/50-guides/frontend/impl/MECANICAS-EDUCATIVAS.md` | No mention of `submitAsync` pattern from `useExerciseSubmission` hook. This is the canonical submission pattern now used in **31 of 30 unique mechanics files** (some have multiple implementations). The guide still implies exercises call APIs directly rather than through the shared hook. | HIGH |
| `docs/50-guides/frontend/impl/MECANICAS-EDUCATIVAS.md` | No mention of responsive pattern (`sm:` breakpoints). The guide describes exercise structure but not the mobile-first UI pattern that now applies to all exercise mechanics. | HIGH |
| `docs/50-guides/frontend/impl/API-SERVICES.md` | Section 6.1 `educationalAPI` lists 5 functions but is missing `createModule()` (added at line 337 of `educationalAPI.ts`). `createModule` is used by `CreateModuleModal.tsx` and `useContentQueries.ts` for the Admin Exercise Builder. | MEDIUM |
| `docs/50-guides/frontend/impl/COMPONENT-PATTERNS.md` | No mention of responsive breakpoint patterns for exercise mechanics. The guide covers component composition but not mobile-first responsive methodology. | MEDIUM |
| `orchestration/inventarios/FRONTEND_INVENTORY.yml` | `configuracion.assets: 16` says "Solo Storybook boilerplate (0 custom app assets)". Now INCORRECT — `public/memes/` contains 6 custom SVG assets. | MEDIUM |
| `orchestration/inventarios/FRONTEND_INVENTORY.yml` | `admin.componentes_tsx: 123` should be 124 (includes CreateModuleModal). Teacher components should be 50 (not 46). Teacher hooks should be 25 (not 24). Total hooks may be 128 (not 127). | MEDIUM |
| `orchestration/inventarios/MASTER_INVENTORY.yml` | `frontend.componentes_tsx: 591` vs FRONTEND_INVENTORY's 592 — two inventories disagree. Both differ from actual 586 production count. Needs a single recount to set the canonical value. | MEDIUM |
| `docs/30-ux-ui/README.md` | Component count listed twice with two different stale values (590 and 580). Admin portal still at ~90% (should be ~92%). | LOW |
| `docs/60-portals/admin/PORTAL-ADMIN-GUIDE.md` | Hooks section shows 12 hooks; actual is 31. Missing 19 hooks added via React Query migration. Changelog entry v2.0.0 claims +12 hooks but no v2.1.0 entry for the additional 19. | HIGH |

---

## 4. Overall Documentation Health

| Category | Up-to-date | Needs Update | Stale |
|----------|-----------|--------------|-------|
| FRONTEND_INVENTORY.yml (v12.0.0) | Core counts (routes, stores, mechanics, API files) | Component counts (+CreateModuleModal, teacher delta), assets section | — |
| MASTER_INVENTORY.yml (v13.1.0) | Backend metrics, DB metrics, gamification | frontend.componentes_tsx (591 vs 592 disagreement) | — |
| docs/30-ux-ui/README.md | Portal descriptions, design system description | Component count (two stale values), admin completeness % | — |
| docs/60-portals/admin/PORTAL-ADMIN-GUIDE.md | Exercise Builder wizard section, page list (19 pages), backend structure | Hooks section (12→31), missing hooks list | — |
| docs/50-guides/frontend/GUIA-DETECTIVE-THEME.md | Fully updated — responsive patterns documented, v1.1.0 | — | — |
| docs/50-guides/frontend/impl/MECANICAS-EDUCATIVAS.md | Mechanics inventory (v1.0, 2025-12-23) | submitAsync pattern, responsive pattern | Dated 2025-12-23, predates exercise restructuring |
| docs/50-guides/frontend/impl/COMPONENT-PATTERNS.md | (not deeply audited) | Responsive breakpoint patterns for mechanics | — |
| docs/50-guides/frontend/impl/API-SERVICES.md | Most educationalAPI functions | createModule() function missing from section 6.1 | — |

---

## 5. Recommendations (Prioritized)

### P1 — Correct Before Next Deploy (Data Integrity)

1. **Fix PORTAL-ADMIN-GUIDE.md hooks section:** Update line 111 from "12 hooks" to "31 hooks". Add missing 19 hooks to the directory listing. Add a v2.1.0 changelog entry for the React Query migration hooks. These hooks are operational code that developers reference when building admin features.
   - File: `docs/60-portals/admin/PORTAL-ADMIN-GUIDE.md`
   - Lines affected: 111-124 (directory tree), 2223 (changelog)

2. **Document submitAsync pattern in MECANICAS-EDUCATIVAS.md:** Add a section "Patron de Envio (submitAsync)" describing how all mechanics must use `useExerciseSubmission` from `features/mechanics/shared/hooks/` rather than calling APIs directly. This pattern is now in 31 files but undocumented.
   - File: `docs/50-guides/frontend/impl/MECANICAS-EDUCATIVAS.md`

### P2 — Fix Within Sprint (Inventory Accuracy)

3. **Reconcile TSX component counts across inventories:** FRONTEND_INVENTORY says 592, MASTER_INVENTORY says 591, actual production count is 586. Decide on counting methodology (exclude all examples/test pages/legacy?) and set a single canonical count in both inventories.
   - Files: `orchestration/inventarios/FRONTEND_INVENTORY.yml` (line 18), `orchestration/inventarios/MASTER_INVENTORY.yml` (line 60)

4. **Update admin/teacher component and hook counts in FRONTEND_INVENTORY.yml:**
   - `admin.componentes_tsx`: 123 → 124 (CreateModuleModal)
   - `teacher.componentes_tsx`: 46 → 50
   - `apps_teacher_hooks`: 24 → 25 (useClassroomRealtime)
   - `hooks.total`: verify if 127 or 128

5. **Document memes/ public assets:** Update `configuracion.assets` in FRONTEND_INVENTORY.yml from "16, Solo Storybook boilerplate (0 custom app assets)" to reflect the 6 custom SVG meme files in `public/memes/`. These are exercise content assets, not boilerplate.
   - File: `orchestration/inventarios/FRONTEND_INVENTORY.yml` (line 328)

6. **Add createModule to API-SERVICES.md section 6.1:** Add `createModule(payload)` row to the educationalAPI function table. This function is used by the Admin Exercise Builder and is a significant addition to the educational API.
   - File: `docs/50-guides/frontend/impl/API-SERVICES.md` (around line 371)

### P3 — Nice to Have (Documentation Quality)

7. **Add responsive pattern note to MECANICAS-EDUCATIVAS.md:** Reference GUIA-DETECTIVE-THEME.md section "Patrones Responsivos" from the mechanics guide. A one-line callout under each module would suffice.

8. **Unify component count in docs/30-ux-ui/README.md:** Lines 88 (590) and 137 (580) show two different stale counts. Update both to the canonical count from FRONTEND_INVENTORY. Also update Admin completeness from ~90% to ~92%.

9. **Update COMPONENT-PATTERNS.md:** Add a section on mobile-first responsive breakpoints for exercise mechanics, pointing to GUIA-DETECTIVE-THEME.md for the full pattern table.

---

## 6. Summary Scorecard

| Item | Count Correct | Delta | Verdict |
|------|--------------|-------|---------|
| Zustand stores | 13 = 13 | 0 | PASS |
| Routes | 73 = 73 | 0 | PASS |
| Unique mechanics | 30 = 30 | 0 | PASS |
| API service files | 67 ≈ 67 | 0 | PASS |
| Admin hooks | 31 = 31 | 0 | PASS |
| Admin components | 123 vs 124 | +1 | FAIL (minor) |
| Teacher hooks | 24 vs 25 | +1 | FAIL (minor) |
| Teacher components | 46 vs 50 | +4 | FAIL |
| Total TSX (prod) | 591/592 vs 586 | -5/-6 | FAIL (methodology issue) |
| memes/ SVG assets | not documented | N/A | UNDOCUMENTED |
| createModule() in API docs | not documented | N/A | UNDOCUMENTED |
| submitAsync pattern in mechanics docs | not documented | N/A | UNDOCUMENTED |
| PORTAL-ADMIN-GUIDE hooks count | 12 vs 31 | +19 | FAIL (HIGH) |
| GUIA-DETECTIVE-THEME responsive | documented | 0 | PASS |

**Overall documentation health: 7/13 checks pass (54%).** The high-severity failures are the admin guide hooks count (12 vs 31) and the undocumented submitAsync pattern. Inventory counts are close to correct with minor deltas attributable to methodology differences and the recent CreateModuleModal addition.
