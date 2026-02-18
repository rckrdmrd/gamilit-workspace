# P6 Cross-Layer Integration Corrections

**Date:** 2026-02-17 | **Status:** Complete

## Actions Taken

### P6A: NotificationService Dead Code
- **File:** `services/NotificationService.ts`
- **Finding:** 0 external importers — dead code
- **Action:** Added @deprecated JSDoc tag with pointer to canonical `notificationsAPI.ts`
- **Recommendation:** Delete in next cleanup sprint

### P6B: Communication Module
- **File:** `modules/communication/communication.module.ts`
- **Finding:** Already properly documented as entity-only (Sprint 4)
- **Action:** No changes needed — JSDoc already states entity-only, consumed by TeacherModule

### P6C: Social Module Unwired Endpoints
- **Finding:** 40 backend endpoints (team challenges, peer challenges, challenge participants) have no frontend API calls
- **Root cause:** `socialAPI.ts` has 15+ functions gated by `FEATURE_FLAGS.USE_MOCK_DATA` — all return mock data
- **Action:** Documented in P4-FRONTEND-API-MAP.md — this is intentional WIP, not a bug
- **Next step:** When social features ship, flip FEATURE_FLAGS.USE_MOCK_DATA to false

### P6D: Parent Portal Gap
- **Finding:** 4 pages for 7 flujos (FL-PRN-03/05/06/07 missing)
- **Action:** Documented in P5-PAGE-FLUJO-MAP.md
- **Next step:** Parent portal expansion in future sprint

## Summary of P2 Corrections (already applied earlier)

These were the major code corrections already applied in P2:

| Module | Fix | Files Modified |
|--------|-----|----------------|
| Social | 9 entities added to forFeature() | social.module.ts |
| Social | 5 barrel exports added | social/entities/index.ts |
| Progress | 6 entities added to forFeature() | progress.module.ts |
| Progress | 1 barrel export added | progress/entities/index.ts |
| Gamification | 3 entities added to forFeature() | gamification.module.ts |
| Gamification | 1 barrel export added | gamification/entities/index.ts |
| Educational | 7 entities added to forFeature() | educational.module.ts |
| App (CRITICAL) | UserSkillRating datasource glob | app.module.ts |

**Build status:** `npx tsc --noEmit` = 0 errors after all P2+P6 corrections.
