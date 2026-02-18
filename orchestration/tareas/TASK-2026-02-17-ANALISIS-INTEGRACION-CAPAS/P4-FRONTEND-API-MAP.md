# P4 Frontend API Coverage Audit

**Date:** 2026-02-17 | **Status:** Complete

## Summary

| Metric | Value |
|--------|-------|
| API Service Files | 52 |
| Total API Calls | 570 |
| MOCK/FEATURE_FLAG occurrences | 202 across 24 files |
| MOCK-ONLY services (no backend) | 2 (mechanicsAPI, aiServiceAPI) |
| Dead code services | 1 (NotificationService.ts) |
| Unwired backend domains | 3 (team challenges, peer challenges, challenge participants) |

## MOCK Inventory (Top Files)

| File | MOCK Count | Status |
|------|-----------|--------|
| socialAPI.ts | 33 | FEATURE_FLAGS.USE_MOCK_DATA gated — real endpoints exist but partially unwired |
| educationalAPI.ts | 19 | Mock fallbacks for API failures |
| ranksAPI.ts | 17 | Mock fallbacks for rank data |
| ranksMockData.ts | 15 | Pure mock data file (test/dev support) |
| authAPI.ts | 15 | Mock fallbacks for auth flows |
| progressAPI.ts | 15 | Mock fallbacks for progress tracking |
| economyAPI.ts | 14 | Mock fallbacks for ML Coins economy |
| mechanicsAPI.ts | 9 | **MOCK-ONLY** — No backend endpoints exist |
| aiServiceAPI.ts | 8 | **MOCK-ONLY** — No backend AI service |
| useFeatureFlags.ts | 9 | Feature flag management (admin) |
| gamificationMockHelpers.ts | 9 | Test helpers |
| inventoryAPI.ts | 6 | Mock fallbacks for shop inventory |

## MOCK-ONLY Services (No Backend)

### mechanicsAPI.ts (9 mocks)
- Provides exercise mechanic configuration data
- All data is hardcoded — no backend `/mechanics` endpoints
- Used by exercise rendering components for mechanic metadata
- **Action:** Acceptable as client-side config; document as MOCK-ONLY

### aiServiceAPI.ts (8 mocks)
- AI-powered exercise validation/hints
- All responses are simulated — no backend AI service
- **Action:** Mark as aspirational/future feature

## NotificationService Dual Path Analysis

| Service | File | Importers | Status |
|---------|------|-----------|--------|
| NotificationService | services/NotificationService.ts | **0 external** | DEAD CODE |
| notificationsAPI | services/api/notificationsAPI.ts | 3 (useWebSocket, NotificationPreferencesPage, test) | CANONICAL |

**Finding:** `NotificationService.ts` (308 lines) wraps apiClient directly but has **zero external importers**. It is dead code. The canonical notification path is `notificationsAPI.ts` used by hooks and pages.

**Action (P6):** Delete NotificationService.ts or deprecate with comment.

## Unwired Backend Endpoints (~40)

| Backend Domain | Endpoints | Frontend API Calls | Gap |
|----------------|-----------|-------------------|-----|
| Team Challenges | 9 | 0 | socialAPI.ts has stubs but MOCK-gated |
| Peer Challenges | 16 | 0 | socialAPI.ts has stubs but MOCK-gated |
| Challenge Participants | 15 | 0 | socialAPI.ts has stubs but MOCK-gated |
| **Total unwired** | **40** | **0** | Backend ready, frontend incomplete |

All three domains are in `social.module.ts` with working controllers. Frontend `socialAPI.ts` has function signatures but they return mock data behind `FEATURE_FLAGS.USE_MOCK_DATA`.

## API Coverage by Domain

| Domain | Backend Endpoints | FE API Calls | Coverage |
|--------|------------------|--------------|----------|
| Auth | 45 | ~40 | 89% |
| Educational | 87 | ~75 | 86% |
| Progress | 62 | ~55 | 89% |
| Gamification | 156 | ~130 | 83% |
| Social | 128 | ~88 (40 mocked) | 69% (real: 38%) |
| Admin | 134 | ~100 | 75% |
| Teacher | 98 | ~85 | 87% |
| Parents | 23 | ~18 | 78% |
| Notifications | 28 | ~22 | 79% |
| Other (health, settings, etc.) | 40 | ~30 | 75% |
| **Total** | **901** | **570** | **63%** |

Note: Coverage % is approximate — some endpoints are admin-only or internal.
