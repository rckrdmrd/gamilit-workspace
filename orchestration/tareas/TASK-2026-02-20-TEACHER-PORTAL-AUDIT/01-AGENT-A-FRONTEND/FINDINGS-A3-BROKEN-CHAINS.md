# FINDINGS-A3: Broken Chains Analysis

**Agent:** A (Frontend Deep Audit)
**Date:** 2026-02-20
**Scope:** All 122 interactive elements across 19 Teacher portal pages

---

## Verdict: 0 Broken Chains

After tracing every interactive element (button, form submit, toggle, dropdown, modal trigger, search, filter, pagination, sort) across all 19 Teacher portal pages through their complete chain:

```
UI Element -> Event Handler -> Hook/Store -> API Service -> HTTP Endpoint
```

**No broken chains were found.** Every interactive element that is intended to call an API has a complete, traceable path from the UI element through the handler, hook, API service function, and out to a defined HTTP endpoint.

---

## Chain Categories

### 1. COMPLETE Chains: 114

All 114 chains have a full path from UI element to HTTP endpoint. The chain types break down as:

| Chain Type | Count | Description |
|------------|-------|-------------|
| Full API chains | 68 | Element -> Handler -> Hook -> API Service -> HTTP endpoint |
| Local-state-only actions | 38 | Tab switches, modal opens, filter changes, search input |
| Navigation actions | 6 | `useNavigate` calls to other routes |
| WebSocket actions | 2 | Real-time connection via `useClassroomRealtime` |

### 2. FEATURE-FLAGGED Chains: 8

All 8 feature-flagged chains are in **TeacherCommunication.tsx**, gated behind `FEATURE_FLAGS.SHOW_UNDER_CONSTRUCTION`:

| # | Element | Flag | Chain When Active |
|---|---------|------|-------------------|
| 1 | Send message button | SHOW_UNDER_CONSTRUCTION=false | useTeacherMessages -> teacherMessagesApi -> POST /teacher/messages |
| 2 | Reply to message | SHOW_UNDER_CONSTRUCTION=false | useTeacherMessages -> teacherMessagesApi -> POST /teacher/messages |
| 3 | Send announcement | SHOW_UNDER_CONSTRUCTION=false | useTeacherMessages -> teacherMessagesApi -> POST /teacher/announcements |
| 4 | Send feedback | SHOW_UNDER_CONSTRUCTION=false | useTeacherMessages -> teacherMessagesApi -> POST /teacher/feedback |
| 5 | Message filters | SHOW_UNDER_CONSTRUCTION=false | useTeacherMessages -> teacherMessagesApi -> GET /teacher/messages?filters |
| 6 | Conversation selection | SHOW_UNDER_CONSTRUCTION=false | useTeacherMessages -> teacherMessagesApi -> GET /teacher/conversations/:id |
| 7 | Mark as read | SHOW_UNDER_CONSTRUCTION=false | useTeacherMessages -> teacherMessagesApi -> PUT /teacher/messages/:id/read |
| 8 | Refresh messages | SHOW_UNDER_CONSTRUCTION=false | useTeacherMessages -> teacherMessagesApi -> GET /teacher/messages |

**Assessment:** When the feature flag is disabled (current default for production), the page shows an "Under Construction" placeholder. When enabled, all 8 chains are complete. The API service (`teacherMessagesApi`) and hook (`useTeacherMessages`) are fully implemented. **No breakage.**

### 3. BROKEN Chains: 0

No broken chains detected.

---

## Noteworthy Observations (Not Broken, But Worth Documenting)

### N-1: Mock Data Fallback in useStudentsEconomy

**File:** `apps/frontend/src/apps/teacher/hooks/useStudentsEconomy.ts`
**Page:** TeacherGamification.tsx

When `FEATURE_FLAGS.USE_MOCK_DATA` is true, the hook returns hardcoded `MOCK_STUDENTS` data instead of calling `analyticsApi.getStudentsEconomy()`. The real API chain is complete and functional when the flag is false (production default). This is a **development convenience**, not a broken chain.

```
Chain: TeacherGamification -> useStudentsEconomy -> analyticsApi.getStudentsEconomy -> GET /teacher/analytics/students-economy
Status: COMPLETE (mock fallback is optional)
```

### N-2: Direct API Calls Bypassing Hooks

Two hooks bypass the dedicated API service layer and call `apiClient` directly:

| Hook | Direct Call Pattern | Ideal Pattern |
|------|-------------------|---------------|
| `useMissionStats.ts` | `apiClient.get('/teacher/missions/stats')` | Should use a `missionStatsApi` service |
| `useMasteryTracking.ts` | `apiClient.get('/teacher/mastery/...')` | Should use a `masteryTrackingApi` service |

**Assessment:** These chains are NOT broken -- the HTTP calls work correctly. However, they violate the established architecture pattern where all API calls should go through a dedicated API service file in `services/api/teacher/`. This is a code quality concern, not a functionality issue. Both hooks are currently orphaned (see FINDINGS-A4), so the impact is zero.

### N-3: Direct API Calls in Pages (Without Hook Abstraction)

Several pages make API calls directly instead of through a hook:

| Page | Direct API Call | Notes |
|------|----------------|-------|
| TeacherStudents.tsx | `classroomsApi.getClassroomStudents()` | Inline in useEffect, no dedicated hook |
| TeacherReports.tsx | `reportsApi.getRecentReports()`, `.getReportStats()`, `.downloadReport()`, `.deleteReport()`, `classroomsApi.getClassrooms()` | 5 direct API calls in page body |

**Assessment:** These chains are COMPLETE. The pages call the API service directly and handle loading/error states inline with useState. This is a **code organization concern** -- these would be cleaner with dedicated hooks -- but there is no broken functionality.

### N-4: Shared Hooks from Outside Teacher Directory

Five hooks/stores used by teacher pages come from outside the teacher directory:

| Shared Hook/Store | Source | Used By |
|-------------------|--------|---------|
| `useAuth` | `features/auth/hooks/useAuth` | TeacherSettings, TeacherPageShell |
| `useUserPreferences` | `shared/hooks/useUserPreferences` | TeacherSettings |
| `useApiError` | `shared/hooks/useApiError` | TeacherSettings |
| `useNotificationsStore` | `features/notifications/` (Zustand) | TeacherNotifications, TeacherNotificationPreferences |
| `usePushNotifications` | `features/notifications/hooks/` | TeacherNotificationPreferences |

**Assessment:** All chains involving these shared hooks are COMPLETE. They are properly imported and functional.

### N-5: profileAPI Re-export Pattern

**File:** `apps/frontend/src/services/api/teacher/index.ts`
**Comment:** `// ISS-FE-002: Use teacher namespace import for consistency`

The `profileAPI` is defined in `services/api/profileApi.ts` and re-exported through the teacher barrel `services/api/teacher/index.ts`. TeacherSettings imports it from `@/services/api/teacher`. The chain is complete:

```
TeacherSettings -> profileAPI.updateProfile -> PUT /profile/:id
TeacherSettings -> profileAPI.updatePreferences -> PUT /profile/:id/preferences
TeacherSettings -> profileAPI.uploadAvatar -> POST /profile/:id/avatar
TeacherSettings -> profileAPI.updatePassword -> PUT /profile/:id/password
```

---

## Summary

| Category | Count | Details |
|----------|-------|---------|
| **COMPLETE** | 114 | All chains fully wired |
| **FEATURE-FLAGGED** | 8 | TeacherCommunication page (chains complete when flag enabled) |
| **BROKEN** | 0 | None |
| **Total Traced** | 122 | Across 19 pages |
| **Observations** | 5 | Code quality notes, no functional issues |
