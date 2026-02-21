# FINDINGS-E4: Feature Flag Configuration Inventory

**Agent:** E (Feature Flags & Navigation)
**Date:** 2026-02-20

---

## Executive Summary

The GAMILIT platform uses two layers of feature flags:
1. **Centralized flags** in `api.config.ts` (`FEATURE_FLAGS` object) -- 10 flags
2. **Environment variables** in `.env` / `.env.example` -- 14 VITE_ variables

The `FEATURE_FLAGS` object in `api.config.ts` is the **SSOT** consumed by all frontend code. Flags default to `false` unless explicitly set to `'true'` in env vars (except `ENABLE_WEBSOCKET` and `ENABLE_AI` which default to `true` via `!== 'false'` logic).

---

## Complete Feature Flag Inventory

### Layer 1: FEATURE_FLAGS (api.config.ts, line 784-796)

| # | Flag Name | Env Variable | Default | Logic | What It Controls | Files Consuming |
|---|-----------|-------------|---------|-------|-----------------|-----------------|
| 1 | `USE_MOCK_DATA` | `VITE_USE_MOCK_DATA` | `false` | `=== 'true'` | Falls back to mock/hardcoded data instead of real API calls | 13 files: authAPI, socialAPI, economyAPI, ranksAPI, educationalAPI, progressAPI, mechanicsAPI, aiServiceAPI, inventoryAPI, useStudentsEconomy, useFeatureFlags, LeaderboardsIntegration.test |
| 2 | `MOCK_API` | `VITE_MOCK_API` | `false` | `=== 'true'` | Similar to USE_MOCK_DATA; used in `useFeatureFlags` admin hook as fallback | 1 file: useFeatureFlags.ts |
| 3 | `ENABLE_WEBSOCKET` | `VITE_ENABLE_WEBSOCKET` | **`true`** | `!== 'false'` | Enables/disables WebSocket connections | Consumed by WebSocket hooks/providers |
| 4 | `DEBUG_API` | `VITE_DEBUG_API` | `false` | `=== 'true'` | Enables API debug logging | API client interceptors |
| 5 | `ENABLE_AI` | `VITE_ENABLE_AI` | **`true`** | `!== 'false'` | Enables AI service features | aiServiceAPI.ts (6 functions check this) |
| 6 | `ENABLE_ANALYTICS` | `VITE_ENABLE_ANALYTICS` | `false` | `=== 'true'` | Enables analytics tracking (Google Analytics, etc.) | Analytics providers |
| 7 | `ENABLE_GAMIFICATION` | `VITE_ENABLE_GAMIFICATION` | `false` | `=== 'true'` | Enables gamification features | env.ts (also defined there) |
| 8 | `ENABLE_SOCIAL_FEATURES` | `VITE_ENABLE_SOCIAL_FEATURES` | `false` | `=== 'true'` | Enables social features (friends, guilds, etc.) | env.ts (also defined there) |
| 9 | `ENABLE_DEBUG` | `VITE_ENABLE_DEBUG` | `false` | `=== 'true'` | Enables debug mode / dev tools | Debug panels, dev overlays |
| 10 | `SHOW_UNDER_CONSTRUCTION` | `VITE_SHOW_UNDER_CONSTRUCTION` | `false` | `=== 'true'` | Gates feature-flagged teacher pages behind "Under Construction" UI | TeacherContent.tsx, TeacherCommunication.tsx |

### Layer 2: env.ts (Deprecated File)

The file `apps/frontend/src/config/env.ts` is marked `@deprecated` with a note to use `api.config.ts` instead. However, it defines its own feature flag subset:

| Flag | Default | Source |
|------|---------|--------|
| `enableGamification` | `true` | `VITE_ENABLE_GAMIFICATION` |
| `enableSocialFeatures` | `true` | `VITE_ENABLE_SOCIAL_FEATURES` |
| `debugApi` | `false` | `VITE_DEBUG_API` |
| `mockApi` | `false` | `VITE_MOCK_API` |

**WARNING:** `env.ts` defaults `enableGamification` and `enableSocialFeatures` to `true`, while `api.config.ts` defaults them to `false`. This discrepancy could cause issues if any code still imports from `env.ts`.

---

## Environment Variables (.env.example)

### Application Variables
| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_APP_NAME` | `GAMILIT Platform` | Application name |
| `VITE_APP_VERSION` | `1.0.0` | App version |
| `VITE_APP_ENV` | `development` | Environment name |
| `VITE_ENV` | `development` | Environment shorthand |

### API Configuration
| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_HOST` | `proxy` | API host (`proxy` = Vite proxy mode) |
| `VITE_API_PROTOCOL` | `http` | API protocol |
| `VITE_API_VERSION` | `v1` | API version prefix |
| `VITE_API_TIMEOUT` | `30000` | Request timeout (ms) |
| `VITE_WS_HOST` | (empty) | WebSocket host (auto-detect in proxy mode) |
| `VITE_WS_PROTOCOL` | `ws` | WebSocket protocol |

### Feature Flags in .env.example
| Variable | Default in .env.example | Default in api.config.ts | Notes |
|----------|------------------------|-------------------------|-------|
| `VITE_ENABLE_GAMIFICATION` | `true` | `false` | **MISMATCH** |
| `VITE_ENABLE_SOCIAL_FEATURES` | `true` | `false` | **MISMATCH** |
| `VITE_ENABLE_ANALYTICS` | `false` | `false` | Consistent |
| `VITE_ENABLE_DEBUG` | `true` | `false` | **MISMATCH** |
| `VITE_ENABLE_STORYBOOK` | `true` | N/A | Not in FEATURE_FLAGS |
| `VITE_MOCK_API` | `false` | `false` | Consistent |

### Missing from .env.example
These flags exist in `api.config.ts` FEATURE_FLAGS but are **NOT** in `.env.example`:
- `VITE_USE_MOCK_DATA` -- The most-used mock flag (13 files)
- `VITE_ENABLE_WEBSOCKET`
- `VITE_ENABLE_AI`
- `VITE_SHOW_UNDER_CONSTRUCTION`
- `VITE_DEBUG_API`

---

## SHOW_UNDER_CONSTRUCTION Deep Dive

This is the most relevant flag for the Teacher portal audit:

### Definition
```typescript
// api.config.ts line 795
SHOW_UNDER_CONSTRUCTION: import.meta.env.VITE_SHOW_UNDER_CONSTRUCTION === 'true',
```

### Consumer Files (2 pages)

| File | Behavior when `true` | Behavior when `false` |
|------|---------------------|----------------------|
| `TeacherContent.tsx` | Shows `<UnderConstruction>` with 6 upcoming features | Renders `<TeacherContentManagement />` (full CRUD) |
| `TeacherCommunication.tsx` | Shows `<UnderConstruction>` with 6 upcoming features | Renders full 4-tab communication UI |

### ISS-FE-003 Reference
Both files reference `ISS-FE-003` as the issue that centralized the flag. Previously, each page likely had its own hardcoded flag.

### Current Effective State
- **Default:** `false` (flag not set = pages would render fully)
- **BUT:** Both pages are **also removed from App.tsx routes**, making the flag irrelevant -- users cannot reach these pages regardless of flag value

### Dependency Chain
```
VITE_SHOW_UNDER_CONSTRUCTION env var
  -> FEATURE_FLAGS.SHOW_UNDER_CONSTRUCTION (api.config.ts)
    -> TeacherContent.tsx (reads at module level)
    -> TeacherCommunication.tsx (reads at module level)
      -> <UnderConstruction> component (shared)
```

---

## USE_MOCK_DATA Deep Dive

This is the most widely-used feature flag:

### Consumers by Module (13 files, ~100+ check points)

| Module | File | # of checks | Purpose |
|--------|------|-------------|---------|
| Auth | `authAPI.ts` | 14 | Mock login, register, profile, sessions |
| Progress | `progressAPI.ts` | 11 | Mock exercise submissions, user progress |
| Educational | `educationalAPI.ts` | 14 | Mock modules, exercises, lessons |
| Social | `socialAPI.ts` | 30+ | Mock guilds, friends, leaderboards, challenges |
| Economy | `economyAPI.ts` | 12 | Mock balance, transactions, shop |
| Ranks | `ranksAPI.ts` | 11 | Mock ranks, promotions, multipliers |
| Mechanics | `mechanicsAPI.ts` | 7 | Mock exercise mechanics data |
| AI Service | `aiServiceAPI.ts` | 6 | Mock AI text analysis, fact checking |
| Inventory | `inventoryAPI.ts` | 4 | Mock inventory items |
| Teacher Economy | `useStudentsEconomy.ts` | 2 | Mock student economy data |
| Admin Flags | `useFeatureFlags.ts` | 4 | Mock feature flag CRUD |
| Test | `LeaderboardsIntegration.test.tsx` | 1 | Test mock |

### Pattern
```typescript
if (FEATURE_FLAGS.USE_MOCK_DATA) {
  return mockData; // Hardcoded mock response
}
// Real API call
const response = await apiClient.get(endpoint);
return response.data;
```

---

## Dependencies Between Flags

```
MOCK_API -----> Used as fallback with USE_MOCK_DATA in useFeatureFlags.ts
                (const USE_MOCK_DATA = FEATURE_FLAGS.USE_MOCK_DATA || FEATURE_FLAGS.MOCK_API)

USE_MOCK_DATA + ENABLE_AI -----> aiServiceAPI.ts checks both:
                                  if (FEATURE_FLAGS.USE_MOCK_DATA || !FEATURE_FLAGS.ENABLE_AI)

SHOW_UNDER_CONSTRUCTION -----> Independent, only affects 2 teacher pages

ENABLE_GAMIFICATION -----> Independent
ENABLE_SOCIAL_FEATURES -----> Independent
ENABLE_ANALYTICS -----> Independent
ENABLE_WEBSOCKET -----> Independent
ENABLE_DEBUG -----> Independent
DEBUG_API -----> Independent
```

---

## Issues Found

### ISS-1: Default Value Mismatch Between env.ts and api.config.ts
- `env.ts` defaults `enableGamification` to `true`; `api.config.ts` defaults `ENABLE_GAMIFICATION` to `false`
- Same for `ENABLE_SOCIAL_FEATURES` and `ENABLE_DEBUG`
- **Impact:** If any code imports from deprecated `env.ts`, features behave differently
- **Recommendation:** Remove `env.ts` or align defaults

### ISS-2: Missing Flags from .env.example
- 5 flags in FEATURE_FLAGS have no entry in `.env.example`
- Developers may not know they can set `VITE_SHOW_UNDER_CONSTRUCTION` or `VITE_USE_MOCK_DATA`
- **Recommendation:** Add all FEATURE_FLAGS to `.env.example` with comments

### ISS-3: Double-Gating of Teacher Pages
- TeacherContent and TeacherCommunication are both:
  1. Removed from App.tsx routes (hard block)
  2. Gated behind `SHOW_UNDER_CONSTRUCTION` (soft block)
- These are redundant gates; the route removal makes the flag irrelevant
- **Recommendation:** When re-adding routes, keep the feature flag as a safety net

### ISS-4: Stale ENABLE_STORYBOOK Flag
- `VITE_ENABLE_STORYBOOK=true` in `.env.example` but no consumer in FEATURE_FLAGS or codebase
- **Recommendation:** Remove from `.env.example` or add consumer
