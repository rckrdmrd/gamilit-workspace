# FINDINGS-A4: Orphaned Code

**Agent:** A (Frontend Deep Audit)
**Date:** 2026-02-20
**Scope:** All teacher portal code: 19 pages, 57 components, 28 hook files, 16 API service files

---

## Summary

| Category | Total | Active | Orphaned | Deprecated |
|----------|-------|--------|----------|------------|
| Pages | 19 | 19 | 0 | 0 |
| Components | 57 | 46 | 10 | 1 |
| Hook files | 28 (27 + index) | 23 | 4 | 0 |
| API service files | 16 (15 + index) | 14 | 1 | 0 |
| **Total** | **120** | **102** | **15** | **1** |

---

## 1. Orphaned Components (10)

### 1.1 Dashboard Components (8 files)

All 8 components reside in `apps/frontend/src/apps/teacher/components/dashboard/` and are exported via `dashboard/index.ts`, but **no page or other component imports them**.

| # | Component | File | Lines | What It Does | Evidence |
|---|-----------|------|-------|-------------|----------|
| 1 | `ClassroomsGrid` | ClassroomsGrid.tsx | ~101 | Renders a grid of ClassroomCards | Exported in dashboard/index.ts; grep shows 0 imports from pages or components |
| 2 | `ClassroomCard` | ClassroomCard.tsx | ~195 | Individual classroom card with stats | Only imported by ClassroomsGrid (which is itself orphaned) |
| 3 | `CreateAssignmentModal` | CreateAssignmentModal.tsx | ~210 | Modal for creating assignments | Exported in dashboard/index.ts; grep shows 0 imports from pages |
| 4 | `CreateClassroomModal` | CreateClassroomModal.tsx | ~150 | Modal for creating classrooms | Exported in dashboard/index.ts; grep shows 0 imports from pages |
| 5 | `PendingSubmissionsList` | PendingSubmissionsList.tsx | ~209 | List of pending student submissions | Exported in dashboard/index.ts; grep shows 0 imports from pages |
| 6 | `QuickActionsPanel` | QuickActionsPanel.tsx | ~76 | Quick action buttons panel | Exported in dashboard/index.ts; grep shows 0 imports from pages |
| 7 | `RecentAssignmentsList` | RecentAssignmentsList.tsx | ~250 | List of recent assignments | Exported in dashboard/index.ts; grep shows 0 imports from pages |
| 8 | `StudentAlerts` | StudentAlerts.tsx | ~349 | Student alert cards (has own inline AlertCard) | Exported in dashboard/index.ts; grep shows 0 imports from pages |

**Root Cause Analysis:** These components appear to be remnants of an earlier dashboard design. The current `TeacherDashboard.tsx` uses a tab-based layout with a different set of components (`StudentMonitoringPanel`, `AssignmentCreator`, `ClassProgressDashboard`, etc.). The old dashboard components were never removed.

**Overlap with Active Components:**
| Orphaned Component | Replaced By | Active In |
|-------------------|------------|-----------|
| ClassroomsGrid + ClassroomCard | Inline classroom cards in TeacherClasses.tsx | TeacherClasses |
| CreateAssignmentModal | ImprovedAssignmentWizard | TeacherAssignments |
| CreateClassroomModal | Inline modal in TeacherClasses.tsx | TeacherClasses |
| PendingSubmissionsList | SubmissionsModal | TeacherAssignments |
| QuickActionsPanel | Inline quick-action buttons in TeacherDashboard | TeacherDashboard |
| RecentAssignmentsList | AssignmentList (inside AssignmentCreator) | TeacherDashboard |
| StudentAlerts | InterventionAlertsPanel | TeacherDashboard, TeacherAlerts |

**Recommendation:** Safe to delete all 8 files plus update `dashboard/index.ts`. Also consider deleting `TeacherDashboardHero` (see below).

### 1.2 Dashboard Hero Component (1 file)

| # | Component | File | Lines | What It Does | Evidence |
|---|-----------|------|-------|-------------|----------|
| 9 | `TeacherDashboardHero` | TeacherDashboardHero.tsx | ~133 | Hero banner for old dashboard | Exported in dashboard/index.ts; grep shows 0 imports from pages |

**Root Cause:** Part of the old dashboard design. The current dashboard opens directly into tab content without a hero section.

### 1.3 Alerts Component (1 file)

| # | Component | File | Lines | What It Does | Evidence |
|---|-----------|------|-------|-------------|----------|
| 10 | `AlertCard` | alerts/AlertCard.tsx | ~95 | Generic alert card component | Exported in components/index.ts; grep shows 0 imports from pages or other components |

**Root Cause:** `TeacherAlertConfig.tsx` has its own inline `renderAlertCard()` function. The `InterventionAlertsPanel` also renders alerts with its own UI. The standalone `AlertCard` component was never integrated.

**Note:** The `StudentAlerts` dashboard component (orphaned item #8) also has its own inline `AlertCard` component, completely independent of `alerts/AlertCard.tsx`.

---

## 2. Deprecated Components (1)

| # | Component | File | Status | Replaced By |
|---|-----------|------|--------|------------|
| 1 | `withTeacherLayout` | withTeacherLayout.tsx | DEPRECATED | `TeacherPageShell` |

**Evidence:**
- `TeacherPageShell.tsx` comment: "This component replaces the withTeacherLayout HOC pattern"
- `components/index.ts` comment: "// PageShell (preferred -- replaces withTeacherLayout HOC)"
- All 19 pages use `<TeacherPageShell>` directly
- `withTeacherLayout` is not imported by any page or route definition
- Stale JSDoc reference in TeacherMonitoring.tsx line 21: "Wrapped by withTeacherLayout HOC"

**Recommendation:** Safe to delete. Update `components/index.ts` to remove its export. Fix the stale comment in TeacherMonitoring.tsx.

---

## 3. Orphaned Hooks (4)

All 4 hooks are exported via the barrel `hooks/index.ts` but never imported by any page (`.tsx` in `pages/`) or any component (`.tsx` in `components/`).

| # | Hook | File | Lines | API Service Used | Pattern |
|---|------|------|-------|-----------------|---------|
| 1 | `useStudentProgress` | useStudentProgress.ts | 88 | studentProgressApi | useState/useEffect |
| 2 | `useGrading` | useGrading.ts | 107 | gradingApi | useState/useEffect |
| 3 | `useMissionStats` | useMissionStats.ts | 250 | apiClient (direct) | useState/useEffect |
| 4 | `useMasteryTracking` | useMasteryTracking.ts | 379 | apiClient (direct) | useState/useEffect |

### Detailed Analysis

#### 3.1 useStudentProgress (88 lines)

**What it provides:** `progress`, `overview`, `stats`, `notes`, `addNote()`, `loading`, `error`
**API calls:** `studentProgressApi.getStudentProgress`, `.getStudentOverview`, `.getStudentStats`, `.getStudentNotes`, `.addStudentNote`
**Why orphaned:** `StudentDetailModal.tsx` calls `studentProgressApi` directly instead of using this hook.
**API service status:** `studentProgressApi` is NOT orphaned (used directly by `StudentDetailModal`).
**Recommendation:** Either integrate into `StudentDetailModal` to replace direct API calls, or delete if the direct pattern is preferred.

#### 3.2 useGrading (107 lines)

**What it provides:** `submissions`, `fetchSubmissions()`, `getSubmissionDetail()`, `submitGrade()`, `bulkGrade()`, `loading`, `error`
**API calls:** `gradingApi.getSubmissions`, `.getSubmissionById`, `.submitFeedback`, `.bulkGrade`
**Why orphaned:** `TeacherAssignments.tsx` uses `useAssignments` hook which handles grading through `assignmentsApi.gradeSubmission`. The `gradingApi` service and `useGrading` hook provide an alternative grading path that is not connected to any UI.
**API service status:** `gradingApi` is ALSO orphaned -- only imported by `useGrading`.
**Recommendation:** Delete both `useGrading` and `gradingApi`, or wire them into the assignments flow if the additional grading features (bulkGrade, pending count) are needed.

#### 3.3 useMissionStats (250 lines)

**What it provides:** Two hooks: `useMissionStats(classroomId)` and `useMultipleClassroomsMissionStats(classroomIds)`
**API calls:** `apiClient.get('/teacher/missions/stats')` -- calls apiClient directly, bypasses API service layer
**Why orphaned:** No page displays mission statistics in the teacher portal.
**API service status:** No dedicated `missionStatsApi` service exists.
**Recommendation:** If mission stats are needed in future, create a proper `missionStatsApi` service and wire to a page. Otherwise, delete.

#### 3.4 useMasteryTracking (379 lines)

**What it provides:** Two hooks: `useStudentMastery(studentId)` and `useClassroomMastery(classroomId)`
**API calls:** `apiClient.get('/teacher/mastery/student/...')` and `apiClient.get('/teacher/mastery/classroom/...')` -- calls apiClient directly
**Why orphaned:** No page displays mastery tracking data in the teacher portal.
**API service status:** No dedicated `masteryTrackingApi` service exists.
**Recommendation:** If mastery tracking is needed in future, create a proper API service and wire to a page. Otherwise, delete.

---

## 4. Orphaned API Services (1)

| # | Service | File | Lines | Used By | Status |
|---|---------|------|-------|---------|--------|
| 1 | `gradingApi` | gradingApi.ts | 333 | useGrading (orphaned) | ORPHANED |

**Functions in gradingApi:**
- `getSubmissions(filters)` -> GET /teacher/grading/submissions
- `getSubmissionById(id)` -> GET /teacher/grading/submissions/:id
- `submitFeedback(id, feedback)` -> POST /teacher/grading/submissions/:id/feedback
- `bulkGrade(data)` -> POST /teacher/grading/bulk
- `getPendingCount()` -> GET /teacher/grading/pending-count

**Why orphaned:** Only consumer is `useGrading` hook, which is itself orphaned. The active grading flow in `TeacherAssignments` uses `assignmentsApi.gradeSubmission()` instead.

**Note:** `studentProgressApi` is NOT orphaned despite `useStudentProgress` being orphaned, because `StudentDetailModal.tsx` imports and calls `studentProgressApi` directly.

---

## 5. Orphan Dependency Graph

```
ORPHANED (no consumer)
  |
  +-- dashboard/ClassroomsGrid.tsx
  |     +-- dashboard/ClassroomCard.tsx (only consumer is ClassroomsGrid)
  |
  +-- dashboard/CreateAssignmentModal.tsx
  +-- dashboard/CreateClassroomModal.tsx
  +-- dashboard/PendingSubmissionsList.tsx
  +-- dashboard/QuickActionsPanel.tsx
  +-- dashboard/RecentAssignmentsList.tsx
  +-- dashboard/StudentAlerts.tsx
  +-- dashboard/TeacherDashboardHero.tsx
  +-- alerts/AlertCard.tsx
  |
  +-- withTeacherLayout.tsx (DEPRECATED)
  |
  +-- hooks/useStudentProgress.ts
  |     +-- services/api/teacher/studentProgressApi.ts (NOT orphaned -- used by StudentDetailModal)
  |
  +-- hooks/useGrading.ts
  |     +-- services/api/teacher/gradingApi.ts (ORPHANED -- only consumer is useGrading)
  |
  +-- hooks/useMissionStats.ts
  |     +-- (calls apiClient directly -- no API service)
  |
  +-- hooks/useMasteryTracking.ts
        +-- (calls apiClient directly -- no API service)
```

---

## 6. Impact Assessment

### Lines of Code

| Category | Files | Estimated Lines | % of Total |
|----------|-------|----------------|------------|
| Orphaned dashboard components | 8 | ~1,563 | ~8% of teacher components |
| Orphaned AlertCard | 1 | ~95 | <1% |
| Deprecated withTeacherLayout | 1 | ~89 | <1% |
| Orphaned hooks | 4 | ~824 | ~12% of teacher hooks |
| Orphaned API service | 1 | ~333 | ~6% of teacher API services |
| dashboard/index.ts (exports to remove) | 1 | ~8 lines to remove | - |
| hooks/index.ts (exports to remove) | 1 | ~4 lines to remove | - |
| **Total orphaned code** | **16 files** | **~2,904 lines** | - |

### Risk Level: LOW

- All orphaned code is isolated (no side effects on active code)
- Removal would be purely subtractive (no API contracts change)
- No shared state or global effects from orphaned code
- Tree-shaking in production build likely excludes most of this code already

### Barrel Export Cleanup

If orphaned files are deleted, these barrel files need updating:

| Barrel File | Exports to Remove |
|-------------|------------------|
| `components/dashboard/index.ts` | ClassroomsGrid, ClassroomCard, CreateAssignmentModal, CreateClassroomModal, PendingSubmissionsList, QuickActionsPanel, RecentAssignmentsList, StudentAlerts, TeacherDashboardHero |
| `components/index.ts` | AlertCard, withTeacherLayout |
| `hooks/index.ts` | useStudentProgress, useGrading, useMissionStats, useMasteryTracking |
| `services/api/teacher/index.ts` | gradingApi |

---

## 7. Recommendations

### Priority 1: Delete Orphaned Dashboard Components (8 files)
These are clearly superseded by the current tab-based dashboard design. No risk.

### Priority 2: Delete Deprecated withTeacherLayout (1 file)
Already replaced by `TeacherPageShell` across all 19 pages. Fix stale comment in `TeacherMonitoring.tsx` line 21.

### Priority 3: Evaluate Orphaned Hooks (4 files)
- `useStudentProgress`: Consider integrating into `StudentDetailModal` or deleting
- `useGrading` + `gradingApi`: Delete unless bulk grading features are planned
- `useMissionStats`: Delete or plan page integration
- `useMasteryTracking`: Delete or plan page integration

### Priority 4: Evaluate AlertCard (1 file)
Delete if `InterventionAlertsPanel` and inline `renderAlertCard()` cover all alert rendering needs.

---

## 8. GradeSubmissionModal Clarification

The component `dashboard/GradeSubmissionModal.tsx` is exported via the dashboard barrel and IS actively used by `TeacherAssignments.tsx`. It is NOT orphaned despite being in the `dashboard/` directory alongside orphaned components.

```typescript
// TeacherAssignments.tsx line ~69
import { GradeSubmissionModal } from '../components/dashboard/GradeSubmissionModal';
```

This component was correctly excluded from the orphaned list.
