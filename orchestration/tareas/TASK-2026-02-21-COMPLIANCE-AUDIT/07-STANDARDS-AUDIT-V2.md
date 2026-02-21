# Standards & Best Practices Audit v2

**Date:** 2026-02-21
**Auditor:** Claude Opus 4.6
**Scope:** 16 new/modified files across frontend, backend, and database layers
**Standards Checked:** ESTANDAR-FRONTEND-PROFESIONAL, ESTANDAR-SEGURIDAD, ESTANDAR-TESTING, 02-clean-architecture, ADR-030, ADR-045

---

## 1. Frontend Files

### 1.1 resourceSharingApi.ts — PASS

**File:** `apps/frontend/src/services/api/teacher/resourceSharingApi.ts` (230 lines)

| Check | Result | Notes |
|-------|--------|-------|
| handleAPIError pattern | PASS | Every method uses `try/catch` + `throw handleAPIError(error, 'context message')` |
| Generic types on apiClient | PASS | All `apiClient.get<T>` / `apiClient.post<T>` calls have explicit type parameters |
| Error handling | PASS | All 6 API methods wrapped in try/catch |
| TypeScript types | PASS | Zero `any` usage; all interfaces well-typed with explicit fields |
| Naming conventions | PASS | camelCase methods, PascalCase interfaces, consistent naming |
| JSDoc documentation | PASS | Module-level doc, per-interface docs, per-method docs, endpoint listing |
| No console.log | PASS | No console statements |
| No TODO/FIXME | PASS | Clean |
| Import aliases | PASS | Uses `@/` path aliases properly |
| Separation of concerns | PASS | Pure API layer; mapping helper `mapToSharedResource()` separated from API calls |

**Verdict: Exemplary.** Follows all project standards. Clean separation of types, helpers, and API client methods.

---

### 1.2 useSharedResources.ts — PASS

**File:** `apps/frontend/src/apps/teacher/hooks/useSharedResources.ts` (218 lines)

| Check | Result | Notes |
|-------|--------|-------|
| React Query pattern | PASS | Uses `useQuery` for reads, `useMutation` for writes — no `useState+useEffect` for server state |
| queryKey factory pattern | PASS | `sharedResourceKeys` object with `all`, `list`, `comments` factories using `as const` |
| No `any` types | PASS | Zero `any` usage |
| Return type interface | PASS | Explicit `UseSharedResourcesReturn` interface exported |
| staleTime configured | PASS | `staleTime: 30_000` — appropriate for collaborative data |
| Cache invalidation | PASS | All mutations invalidate `sharedResourceKeys.all` on success |
| Memoization | PASS | All callbacks wrapped in `useCallback` with correct deps |
| JSDoc/examples | PASS | Module doc, usage example in JSDoc |
| No console.log | PASS | Clean |
| No TODO/FIXME | PASS | Clean |

**Verdict: Exemplary.** Textbook React Query usage with proper key factory pattern, memoized callbacks, and explicit TypeScript types.

---

### 1.3 Pagination.tsx — PASS

**File:** `apps/frontend/src/shared/components/Pagination.tsx` (297 lines)

| Check | Result | Notes |
|-------|--------|-------|
| Props interface | PASS | `PaginationProps` exported with JSDoc on every field |
| Accessibility (ARIA) | PASS | `<nav aria-label="Paginacion">`, `aria-current="page"`, `aria-label` on all buttons, `aria-hidden` on ellipsis, `aria-selected` not needed (not tabs) |
| Keyboard navigation | PASS | Uses native `<button>` elements (inherently keyboard accessible) |
| Screen reader support | PASS | Spanish ARIA labels, hidden decorative elements |
| No hardcoded strings | WARN | UI text is in Spanish (`"Mostrando"`, `"Anterior"`, `"Siguiente"`, `"Por pagina:"`, `"resultados"`) — appropriate for this project's locale but not i18n-ready. `itemLabel` prop mitigates. |
| No `any` types | PASS | Zero `any` |
| No console.log | PASS | Clean |
| Variants | PASS | Two variants (`full`, `simple`) properly implemented |
| Loading state | PASS | Buttons disabled when `loading=true` |
| Edge cases | PASS | Returns `null` when `totalPages <= 0` |
| htmlFor/id pairing | PASS | `htmlFor="pagination-page-size"` paired with `id="pagination-page-size"` |

**Minor observation:** The `onPageSizeChange!` non-null assertion on line 218 is safe because it's guarded by `showPageSizeSelector` which checks for its existence. Acceptable.

**Verdict: Strong pass.** Excellent accessibility implementation. Minor i18n gap is acceptable given the project's Spanish-only scope.

---

### 1.4 CompletionHeader.tsx — PASS

**File:** `apps/frontend/src/apps/student/components/exercise/CompletionHeader.tsx` (73 lines)

| Check | Result | Notes |
|-------|--------|-------|
| Props interface | PASS | `CompletionHeaderProps` with typed fields |
| No `any` types | PASS | Zero `any` |
| Accessibility | PASS | `id="completion-modal-title"` for `aria-labelledby` linkage from parent modal |
| Naming | PASS | PascalCase component, camelCase props |
| Single responsibility | PASS | Only renders the header section of the completion modal |
| No console.log | PASS | Clean |
| Animation | PASS | Uses framer-motion with spring physics, appropriate delay |

**Verdict: Clean.** Well-extracted component following single responsibility.

---

### 1.5 CompletionActions.tsx — PASS

**File:** `apps/frontend/src/apps/student/components/exercise/CompletionActions.tsx` (67 lines)

| Check | Result | Notes |
|-------|--------|-------|
| Props interface | PASS | `CompletionActionsProps` with typed callbacks |
| No `any` types | PASS | Zero `any` |
| Conditional rendering | PASS | `!success` shows retry, `onNextExercise` presence shows next button |
| Naming | PASS | PascalCase component, descriptive callback names |
| Single responsibility | PASS | Only renders action buttons |
| Accessibility | WARN | Buttons use `DetectiveButton` which has icon+text — accessible. However, button purpose is only communicated through visual text. `aria-label` could reinforce meaning for complex icon+text combos, though existing text labels are sufficient. |
| No console.log | PASS | Clean |

**Verdict: Pass.** Clean component extraction.

---

### 1.6 useCompletionAnimations.ts — WARN

**File:** `apps/frontend/src/apps/student/components/exercise/useCompletionAnimations.ts` (89 lines)

| Check | Result | Notes |
|-------|--------|-------|
| TypeScript types | PASS | Input/output interfaces defined (`UseCompletionAnimationsParams`, `CompletionAnimationState`) |
| No `any` types | PASS | Zero `any` |
| Effect cleanup | PASS | All intervals and timeouts cleaned up in return function |
| Resize handler cleanup | PASS | `removeEventListener` in cleanup |
| No console.log | PASS | Clean |
| SSR safety | WARN | Line 36: `window.innerWidth` / `window.innerHeight` called at module scope during `useState` initialization. Will throw in SSR context. This project is SPA-only (Vite), so runtime impact is zero, but it's a pattern to avoid for portability. |
| Dependency array | PASS | `[isOpen, success, xpGained, mlCoinsGained]` — all external values included |
| Animation math | PASS | `Math.ceil(xpGained / 30)` ensures counter reaches target in ~30 frames |

**Findings:**
1. **WARN — SSR-unsafe window access:** `useState({ width: window.innerWidth, height: window.innerHeight })` is called during initial render. Safe in this Vite SPA project but would break in SSR. Best practice is `typeof window !== 'undefined' ? window.innerWidth : 0`.

**Verdict: Conditional pass.** Minor SSR portability issue, acceptable for Vite SPA.

---

## 2. Backend Files

### 2.1 resource-rating.entity.ts — PASS

**File:** `apps/backend/src/modules/teacher/entities/resource-rating.entity.ts` (60 lines)

| Check | Result | Notes |
|-------|--------|-------|
| TypeORM decorators | PASS | `@Entity`, `@PrimaryGeneratedColumn('uuid')`, `@Column`, `@CreateDateColumn`, `@UpdateDateColumn`, `@ManyToOne`, `@JoinColumn` all present |
| Schema constant | PASS | Uses `DB_SCHEMAS.EDUCATIONAL` from shared constants |
| Relations | PASS | `@ManyToOne(() => TeacherContent)` + `@ManyToOne(() => Profile)` with `onDelete: CASCADE` |
| Unique constraint | PASS | `@Unique(['resource_id', 'teacher_id'])` — matches DDL |
| Column types | PASS | `uuid`, `smallint`, `timestamptz` — match DDL |
| Naming | PASS | snake_case columns, PascalCase class |
| JSDoc | PASS | Class-level doc with `@see` reference to DDL file |
| No `any` types | PASS | All `!` non-null assertions (TypeORM convention) |

**Verdict: Pass.** Properly mirrors DDL with correct relations and constraints.

---

### 2.2 resource-comment.entity.ts — PASS

**File:** `apps/backend/src/modules/teacher/entities/resource-comment.entity.ts` (61 lines)

| Check | Result | Notes |
|-------|--------|-------|
| Schema + table name | PASS | `{ schema: DB_SCHEMAS.EDUCATIONAL, name: 'resource_comments' }` |
| Relations | PASS | Two `@ManyToOne` (TeacherContent, Profile) with CASCADE |
| Soft delete flag | PASS | `is_deleted` boolean with `default: false` — matches DDL |
| Column types | PASS | `text`, `boolean`, `uuid`, `timestamptz` — all match DDL |
| JSDoc | PASS | Documents soft delete behavior |

**Verdict: Pass.** Correct entity-DDL alignment.

---

### 2.3 resource-download.entity.ts — PASS

**File:** `apps/backend/src/modules/teacher/entities/resource-download.entity.ts` (50 lines)

| Check | Result | Notes |
|-------|--------|-------|
| Schema + table name | PASS | `{ schema: DB_SCHEMAS.EDUCATIONAL, name: 'resource_downloads' }` |
| No UpdateDateColumn | PASS | Correct — DDL has no `updated_at` (immutable event-log table) |
| CreateDateColumn name | PASS | `downloaded_at` — matches DDL column name |
| Relations | PASS | Two `@ManyToOne` with CASCADE |

**Verdict: Pass.** Properly represents the immutable event-log pattern.

---

### 2.4 shared-resource.dto.ts — PASS

**File:** `apps/backend/src/modules/teacher/dto/shared-resource.dto.ts` (258 lines)

| Check | Result | Notes |
|-------|--------|-------|
| class-validator decorators | PASS | `@IsString`, `@IsInt`, `@Min`, `@Max`, `@Length`, `@IsEnum`, `@IsNotEmpty`, `@IsOptional` — comprehensive |
| class-transformer | PASS | `@Type(() => Number)` for query params |
| Swagger decorators | PASS | `@ApiProperty` / `@ApiPropertyOptional` on all fields with descriptions and examples |
| Default values | PASS | `page = 1`, `limit = 10`, `sort_by = 'created_at'`, `sort_order = 'desc'` |
| Limit max | PASS | `@Max(50)` prevents excessive page sizes |
| Naming conventions | PASS | PascalCase classes, consistent DTO suffixes |
| No `any` types | PASS | All fields explicitly typed |
| Separation | PASS | Query, Mutation, and Response DTOs logically separated |

**Verdict: Pass.** Well-structured DTOs with proper validation, transformation, and Swagger docs.

---

### 2.5 teacher-content.service.ts — WARN

**File:** `apps/backend/src/modules/teacher/services/teacher-content.service.ts` (~900 lines)

| Check | Result | Notes |
|-------|--------|-------|
| DI pattern | PASS | `@InjectRepository` for all repos with named datasources |
| Error handling | PASS | `NotFoundException`, `ForbiddenException`, `BadRequestException` used appropriately |
| Ownership validation | PASS | `validateOwnership()` private method called before mutations |
| Parameterized queries | PASS | All query builders use `:paramName` syntax — no string interpolation in SQL |
| Batch lookups | PASS | `getSharedResources()` uses batch queries for profiles, ratings, downloads, comments — avoids N+1 |
| `as any` usage | WARN | Lines 883, 890, 893, 894: `content.content_type as any`, `content.difficulty_level as any`, `content.visibility as any`, `content.status as any` — 4 instances in `mapToResponseDto()` |
| No console.log | PASS | Clean |
| ADR-045 compliance | PASS | Uses NestJS HTTP exceptions (not domain errors yet, but ADR-045 states domain errors are Phase 1 future work) |
| Sort injection safety | PASS | `sort_by` validated by DTO `@IsEnum` before reaching query builder; sort column mapped through conditional expression, not raw interpolation |

**Findings:**
1. **WARN — 4x `as any` casts in `mapToResponseDto()`:** These exist because entity string columns need casting to DTO enum types. Should use explicit enum casting or type guards instead of `as any`. Example fix: `content.content_type as TeacherContentType`.
2. **INFO — `parseFloat(ratingAgg?.avg)`:** The optional chaining with `parseFloat` could produce `NaN` if `ratingAgg` is null, but the `|| 0` fallback handles it. Acceptable.
3. **INFO — `req.user!.id` non-null assertion in controller:** Safe because `JwtAuthGuard` guarantees user is present. Consistent with project-wide pattern.

**Verdict: Conditional pass.** The `as any` casts are the only notable issue and are localized to one private method.

---

### 2.6 teacher-content.controller.ts — WARN

**File:** `apps/backend/src/modules/teacher/controllers/teacher-content.controller.ts` (~400+ lines)

| Check | Result | Notes |
|-------|--------|-------|
| Guards | PASS | `@UseGuards(JwtAuthGuard, RolesGuard)` at class level |
| Roles | PASS | `@Roles(GamilityRoleEnum.ADMIN_TEACHER, GamilityRoleEnum.SUPER_ADMIN)` |
| Swagger docs | PASS | `@ApiTags`, `@ApiBearerAuth`, `@ApiOperation`, `@ApiParam`, `@ApiQuery`, `@ApiResponse` — comprehensive |
| Route ordering | PASS | `resources` routes defined BEFORE `:id` route (documented in comment) — prevents UUID matching conflict |
| No console.log | PASS | Clean |
| UUID validation | WARN | `@Param('id') id: string` — no `ParseUUIDPipe` used. Invalid UUIDs will reach the service layer. |
| Clean architecture | PASS | Controller delegates to service, no business logic in controller |
| HTTP status codes | PASS | Appropriate 200, 201, 401, 403, 404 responses documented |

**Findings:**
1. **WARN — No `ParseUUIDPipe` on `:id` params:** All `@Param('id') id: string` declarations lack `ParseUUIDPipe`. Invalid UUID strings will reach the database query and cause a runtime error instead of a clean 400 response. This is a pattern inconsistency — some controllers in the project use `ParseUUIDPipe`, others don't.

**Verdict: Conditional pass.** Missing UUID validation pipe is the only issue.

---

## 3. Database DDL

### 3.1 28-resource_ratings.sql — PASS

**File:** `apps/database/ddl/schemas/educational_content/tables/28-resource_ratings.sql` (29 lines)

| Check | Result | Notes |
|-------|--------|-------|
| Schema qualification | PASS | `educational_content.resource_ratings` |
| Primary key | PASS | `UUID DEFAULT gen_random_uuid()` |
| Foreign keys | PASS | `resource_id` -> `teacher_contents(id)` CASCADE, `teacher_id` -> `profiles(id)` CASCADE |
| CHECK constraint | PASS | `rating BETWEEN 1 AND 5` |
| UNIQUE constraint | PASS | `UNIQUE(resource_id, teacher_id)` — one rating per teacher per resource |
| Indexes on FKs | PASS | Both `resource_id` and `teacher_id` indexed |
| `COMMENT ON TABLE` | PASS | Table and all 3 domain columns documented |
| `ENABLE RLS` | PASS | Present in `01-enable-rls.sql` (line 18) |
| `IF NOT EXISTS` | PASS | On both `CREATE TABLE` and `CREATE INDEX` |
| Naming conventions | PASS | `snake_case` throughout |

**Verdict: Exemplary.** Follows all database standards including comments, indexes on FKs, and CHECK constraints.

---

### 3.2 29-resource_comments.sql — PASS

**File:** `apps/database/ddl/schemas/educational_content/tables/29-resource_comments.sql` (33 lines)

| Check | Result | Notes |
|-------|--------|-------|
| Schema qualification | PASS | `educational_content.resource_comments` |
| Foreign keys | PASS | Both FKs reference correct parent tables with CASCADE |
| Indexes on FKs | PASS | `resource_id`, `author_id` indexed |
| Extra index | PASS | `created_at DESC` index for chronological comment listing |
| Soft delete | PASS | `is_deleted BOOLEAN DEFAULT FALSE` |
| `COMMENT ON TABLE` | PASS | Table + 4 domain columns documented |
| `ENABLE RLS` | PASS | Present in `01-enable-rls.sql` (line 19) |
| `IF NOT EXISTS` | PASS | On all statements |

**Verdict: Exemplary.** Includes a smart `created_at DESC` index for the common "latest comments" query pattern.

---

### 3.3 30-resource_downloads.sql — PASS

**File:** `apps/database/ddl/schemas/educational_content/tables/30-resource_downloads.sql` (28 lines)

| Check | Result | Notes |
|-------|--------|-------|
| Schema qualification | PASS | `educational_content.resource_downloads` |
| Foreign keys | PASS | Both FKs correct with CASCADE |
| Indexes on FKs | PASS | Both `resource_id` and `downloaded_by` indexed |
| No `updated_at` | PASS | Correctly omitted — documented as immutable event-log table |
| `COMMENT ON TABLE` | PASS | Table + 3 columns documented |
| `ENABLE RLS` | PASS | Present in `01-enable-rls.sql` (line 20) |
| Design note | PASS | Comment explains immutable INSERT-only design |

**Verdict: Exemplary.** Clean event-log table with appropriate documentation.

---

### 3.4 04-resource-sharing-policies.sql — PASS

**File:** `apps/database/ddl/schemas/educational_content/rls-policies/04-resource-sharing-policies.sql` (125 lines)

| Check | Result | Notes |
|-------|--------|-------|
| `current_setting()` usage | PASS | Uses `current_setting('app.current_user_id', true)::uuid` — NOT `auth.uid()` (project standard) |
| DROP before CREATE | PASS | All 10 policies have `DROP POLICY IF EXISTS` before `CREATE POLICY` (idempotent) |
| Security model | PASS | Documented at top of file |
| Ratings: SELECT all | PASS | `USING (true)` — teachers need to see all ratings for average calculation |
| Ratings: INSERT/UPDATE/DELETE own | PASS | Scoped to `teacher_id = current_setting(...)` |
| Comments: SELECT visible | PASS | `is_deleted = false OR author_id = current_setting(...)` — authors can see their own deleted comments |
| Comments: INSERT/UPDATE/DELETE own | PASS | Scoped to `author_id = current_setting(...)` |
| Downloads: SELECT own | PASS | Scoped to `downloaded_by = current_setting(...)` |
| Downloads: INSERT own | PASS | Scoped to `downloaded_by = current_setting(...)` |
| No UPDATE/DELETE on downloads | PASS | Correct — immutable event-log |
| Policy naming | PASS | `{table}_{operation}_{scope}` convention followed |
| Header documentation | PASS | Security model, agent, date, priority documented |

**Verdict: Exemplary.** Well-designed RLS policies with proper security model documentation. The `current_setting()` with `true` (missing_ok) parameter prevents runtime errors when RLS is bypassed.

---

## 4. Cross-Cutting Checks

### 4.1 console.log in Production Code

**Severity:** WARN
**Total occurrences:** 50+ across frontend `src/` (excluding test files)

**By category:**

| Category | Count | Files | Severity |
|----------|-------|-------|----------|
| Auth flow logging | 7 | `AuthContext.tsx` | MEDIUM — Should use a logger service |
| API client debug | 6 | `apiClient.ts`, `apiInterceptors.ts` | MEDIUM — Debug mode, should be conditional |
| Notification service | 7 | `NotificationService.ts` | MEDIUM — Uses emoji prefixes, should use logger |
| Firebase/WebPush | 5 | `firebase.ts`, `webpush.ts` | LOW — Infrastructure logging, acceptable |
| Config loading | 2 | `env.ts`, `api.config.ts` | LOW — Startup logging, acceptable |
| Role redirect | 4 | `roleRedirect.ts` | MEDIUM — Debug logging left in |
| Exercise submission | 3 | `useSubmitProgress.ts`, `useExerciseSubmission.ts` | MEDIUM — Debug logging |
| Branding provider | 2 | `BrandingProvider.tsx` | LOW — Status logging |
| Hint usage | 1 | `ActionsPanel.tsx` | LOW — Placeholder |

**New files (audited):** **0 console.log** — all 6 new frontend files are clean.

**Recommendation:** Create a `logger` utility that wraps `console.log` with environment-aware filtering (`import.meta.env.DEV`). Not blocking but should be addressed in a quality sprint.

---

### 4.2 `any` Type Usage

**New files:** **0 `any`** in all 6 new frontend files. Clean.

**Backend (existing code in modified file):** 4 occurrences in `teacher-content.service.ts` line 883-894 (`as any` casts in `mapToResponseDto()`). These are pre-existing and localized — the newly added shared-resources methods do NOT use `any`.

**Codebase note:** The project has 911 ESLint `no-explicit-any` warnings (documented in MEMORY.md), all pre-existing.

---

### 4.3 TODO/FIXME Items

**New files:** **0 TODO/FIXME** in all 16 audited files. Clean.

---

### 4.4 Hardcoded Strings

**New frontend files:**
- `Pagination.tsx`: Spanish UI strings (`"Mostrando"`, `"Anterior"`, `"Siguiente"`, `"Por pagina:"`, `"resultados"`) — **Acceptable** for Spanish-only project. `itemLabel` prop provides customization.
- `CompletionHeader.tsx`: `'¡Ejercicio Completado!'`, `'Ejercicio Enviado'` — **Acceptable**, UI copy for student portal.
- `CompletionActions.tsx`: `'Volver al Módulo'`, `'Reintentar'`, `'Siguiente Ejercicio'` — **Acceptable**, button labels.
- `resourceSharingApi.ts`: Error context strings (`'Failed to fetch shared resources'`) — **Acceptable**, developer-facing error messages.

**Backend:**
- `teacher-content.service.ts`: `'Profesor'` as fallback name, `'General'` as default category — **Acceptable**, sensible defaults.
- `teacher-content.controller.ts`: Swagger descriptions in English — **Correct**, API docs should be in English.

**No hardcoded URLs, IDs, or secrets found.** All API endpoints use `API_ENDPOINTS` config object.

---

## 5. Summary

| Category | PASS | WARN | FAIL |
|----------|------|------|------|
| **Frontend (6 files)** | 5 | 1 | 0 |
| **Backend (6 files)** | 4 | 2 | 0 |
| **Database (4 files)** | 4 | 0 | 0 |
| **Cross-cutting (4 checks)** | 2 | 2 | 0 |
| **TOTAL** | **15** | **5** | **0** |

### Detailed Scores

| # | File | Verdict | Issue |
|---|------|---------|-------|
| 1.1 | resourceSharingApi.ts | **PASS** | — |
| 1.2 | useSharedResources.ts | **PASS** | — |
| 1.3 | Pagination.tsx | **PASS** | — |
| 1.4 | CompletionHeader.tsx | **PASS** | — |
| 1.5 | CompletionActions.tsx | **PASS** | — |
| 1.6 | useCompletionAnimations.ts | **WARN** | SSR-unsafe `window` access at init |
| 2.1 | resource-rating.entity.ts | **PASS** | — |
| 2.2 | resource-comment.entity.ts | **PASS** | — |
| 2.3 | resource-download.entity.ts | **PASS** | — |
| 2.4 | shared-resource.dto.ts | **PASS** | — |
| 2.5 | teacher-content.service.ts | **WARN** | 4x `as any` in mapToResponseDto() |
| 2.6 | teacher-content.controller.ts | **WARN** | No `ParseUUIDPipe` on `:id` params |
| 3.1 | 28-resource_ratings.sql | **PASS** | — |
| 3.2 | 29-resource_comments.sql | **PASS** | — |
| 3.3 | 30-resource_downloads.sql | **PASS** | — |
| 3.4 | 04-resource-sharing-policies.sql | **PASS** | — |
| 4.1 | console.log audit | **WARN** | 50+ instances in existing code (0 in new files) |
| 4.2 | `any` type audit | **PASS** | 0 in new files, 4 pre-existing in service |
| 4.3 | TODO/FIXME audit | **PASS** | 0 across all audited files |
| 4.4 | Hardcoded strings | **PASS** | All acceptable for project scope |

---

## 6. Recommended Actions

### Priority 1 — Quick Fixes (< 30 min total)

1. **Fix `as any` casts in `teacher-content.service.ts`** (lines 883, 890, 893, 894)
   - Replace `content.content_type as any` with `content.content_type as TeacherContentType`
   - Replace `content.difficulty_level as any` with `content.difficulty_level as TeacherContentDifficulty`
   - Replace `content.visibility as any` with `content.visibility as TeacherContentVisibility`
   - Replace `content.status as any` with `content.status as TeacherContentStatus`
   - **Impact:** Eliminates 4 `any` casts, improves type safety

2. **Add `ParseUUIDPipe` to controller params** in `teacher-content.controller.ts`
   - Change `@Param('id') id: string` to `@Param('id', ParseUUIDPipe) id: string` for all `:id` routes
   - **Impact:** Returns clean 400 for invalid UUIDs instead of 500 from database

3. **SSR-safe window access** in `useCompletionAnimations.ts` (line 35-37)
   - Change `useState({ width: window.innerWidth, height: window.innerHeight })` to:
     ```ts
     useState({ width: typeof window !== 'undefined' ? window.innerWidth : 0, height: typeof window !== 'undefined' ? window.innerHeight : 0 })
     ```
   - **Impact:** Portability improvement, no functional change

### Priority 2 — Quality Sprint Items

4. **Create a `logger` utility** to replace direct `console.log` calls
   - Wrap with `import.meta.env.DEV` check
   - Centralize log formatting (remove emoji prefixes)
   - Estimated: 50+ replacements across 12 files
   - **Impact:** Cleaner production output, better debugging

### Not Recommended

- **i18n for Spanish strings:** Project is Spanish-only. Adding i18n would introduce complexity with no benefit until multi-language support is on the roadmap.
- **Domain error refactoring:** ADR-045 explicitly defers this to Phase 2 after domain errors are adopted in 50%+ of services. Current HTTP exceptions are acceptable.

---

*Generated by Claude Opus 4.6 | Audit completed 2026-02-21*
