# Axios Instance Migration Plan
**Date**: 2025-11-23
**Phase**: Phase 2 - Axios Consolidation

## Executive Summary

Audit found **4 axios instances** in the frontend codebase, causing:
- Inconsistent authentication patterns
- Duplicate code maintenance
- Potential bugs from different configurations
- No single source of truth for HTTP client

## Audit Results

### 1. Official Instance (KEEP)
**File**: `apps/frontend/src/services/api/apiClient.ts` (224 lines)

**Configuration**:
- baseURL: `http://localhost:3006/api`
- Timeout: 30,000ms
- Auth: JWT from `localStorage.getItem('auth-token')`
- Tenant: `X-Tenant-Id` header
- Token refresh: ✅ Comprehensive with retry logic
- Debug logging: ✅ Conditional via `VITE_DEBUG_API`
- Error handling: ✅ Complete (401, 403, 404, 500)

**Usage**: 31 files import this instance
**Status**: ✅ **This is the OFFICIAL client - DO NOT MODIFY**

### 2. Duplicate Instance #1 (DELETE)
**File**: `apps/frontend/src/shared/utils/api.util.ts` (46 lines)

**Configuration**:
- baseURL: `http://localhost:3006/api`
- Timeout: DEFAULT (no explicit)
- Auth: JWT from `localStorage.getItem('auth-token')`
- Tenant: ❌ No tenant header
- Token refresh: ❌ Only redirects on 401
- Debug logging: ❌ None
- Error handling: ⚠️ Minimal (only 401)

**Usage**: 0 files import this instance
**Status**: 🗑️ **DELETE - Not used anywhere**

### 3. Duplicate Instance #2 (DELETE)
**File**: `apps/frontend/src/lib/api/client.ts` (58 lines)

**Configuration**:
- baseURL: `http://localhost:3006/api`
- Timeout: DEFAULT (no explicit)
- Auth: JWT from `localStorage.getItem('auth-token')`
- Tenant: ❌ No tenant header
- Token refresh: ⚠️ Partial (less robust than official)
- Debug logging: ❌ None
- Error handling: ⚠️ Only 401

**Usage**: 3 files import this instance:
1. `apps/frontend/src/features/exercises/hooks/__tests__/useExerciseSubmission.test.ts`
2. `apps/frontend/src/hooks/useAchievements.ts`
3. `apps/frontend/src/features/exercises/hooks/useExerciseSubmission.ts`

**Status**: 🔄 **MIGRATE 3 files, then DELETE**

### 4. Duplicate Instance #3 (DELETE)
**File**: `apps/frontend/src/features/auth/api/apiClient.ts` (97 lines)

**Configuration**:
- baseURL: `http://localhost:3006/api`
- Timeout: 30,000ms
- Auth: JWT from `useAuthStore.getState().token` (Zustand)
- Tenant: ✅ `X-Tenant-ID` header (different capitalization)
- Token refresh: ✅ Uses `authStore.refreshSession()`
- Debug logging: ❌ None
- Error handling: ✅ Better (handles network errors)

**Usage**: 0 files import this instance
**Status**: 🗑️ **DELETE - Not used anywhere**

**Note**: This instance had one advantage (uses Zustand store), but since nothing uses it and the official client is already established, we'll delete it.

## Migration Plan

### Step 1: Migrate 3 Files Using `@/lib/api/client`

Replace all imports of:
```typescript
import apiClient from '@/lib/api/client';
```

With:
```typescript
import { apiClient } from '@/services/api/apiClient';
```

**Files to modify**:
1. ✅ `apps/frontend/src/features/exercises/hooks/__tests__/useExerciseSubmission.test.ts`
2. ✅ `apps/frontend/src/hooks/useAchievements.ts`
3. ✅ `apps/frontend/src/features/exercises/hooks/useExerciseSubmission.ts`

### Step 2: Delete 3 Duplicate Instance Files

**Files to delete**:
1. ✅ `apps/frontend/src/shared/utils/api.util.ts`
2. ✅ `apps/frontend/src/lib/api/client.ts`
3. ✅ `apps/frontend/src/features/auth/api/apiClient.ts`

### Step 3: Verify No Broken Imports

Run TypeScript check to ensure no imports are broken:
```bash
npm run type-check
```

### Step 4: Update Tests

If any tests fail after migration, update test mocks to use the official apiClient.

## Additional Issues Found

### 25 Direct `fetch()` Calls

Found 25 direct `fetch()` calls across 14 files that bypass the official apiClient:

**Files**:
1. `apps/frontend/src/pages/_legacy/teacher/ExerciseCreator.tsx` (1)
2. `apps/frontend/src/pages/_legacy/teacher/StudentProgressViewer.tsx` (1)
3. `apps/frontend/src/pages/_legacy/teacher/ClassroomAnalytics.tsx` (1)
4. `apps/frontend/src/pages/_legacy/teacher/GradingInterface.tsx` (2)
5. `apps/frontend/src/shared/hooks/useModules.ts` (2)
6. `apps/frontend/src/apps/admin/components/users/UserDetailModal.example.tsx` (4)
7. `apps/frontend/src/features/gamification/missions/hooks/useMissions.ts` (1)
8. `apps/frontend/src/apps/teacher/pages/TeacherReportsPage.tsx` (5)
9. `apps/frontend/src/features/gamification/social/hooks/useAdvancedLeaderboard.ts` (1)
10. `apps/frontend/src/apps/teacher/components/progress/ClassProgressDashboard.tsx` (1)
11. `apps/frontend/src/apps/teacher/components/reports/ReportGenerator.tsx` (1)
12. `apps/frontend/src/apps/teacher/components/alerts/InterventionAlertsPanel.tsx` (2)
13. `apps/frontend/src/apps/teacher/components/collaboration/ParentCommunicationHub.tsx` (1)
14. `apps/frontend/src/apps/teacher/components/assignments/AssignmentCreator.tsx` (2)

**Issues**:
- No authentication headers
- No tenant headers
- No centralized error handling
- No token refresh logic
- Hardcoded URLs (potential duplicate `/api/` bugs)

**Recommendation**: Migrate these to use `apiClient` in Phase 3 (separate task)

## Timeline

### Phase 2 - TODAY (30 minutes)
- [x] Complete audit
- [ ] Migrate 3 files
- [ ] Delete 3 duplicate instances
- [ ] Run type-check
- [ ] Commit changes

### Phase 3 - THIS WEEK (4 hours)
- [ ] Migrate 25 `fetch()` calls to `apiClient`
- [ ] Create helper functions if needed
- [ ] Update all hardcoded URLs to use constants
- [ ] Test all migrations

## Testing Strategy

### Unit Tests
- Verify all 3 migrated files have working tests
- Mock the official apiClient in tests
- No functionality should change

### Integration Tests
- Test authentication flow still works
- Test token refresh still works
- Test error handling still works

### Manual Testing
- Test exercise submission flow
- Test achievements display
- Test all pages that previously used duplicates

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|----------|
| Broken imports after deletion | High | Run type-check before commit |
| Tests fail after migration | Medium | Update test mocks to use official client |
| Different auth behavior | Low | Official client more robust, no downgrade |
| Tenant header missing | Medium | Official client already has tenant support |

## Success Criteria

- ✅ Only 1 axios instance remains: `@/services/api/apiClient`
- ✅ All 31+ files use the same official client
- ✅ TypeScript compilation passes
- ✅ All existing tests pass
- ✅ No runtime errors in browser console
- ✅ Authentication still works correctly
- ✅ Token refresh still works correctly

## Related Documents

- `orchestration/directivas/ESTANDARES-API-ROUTES.md` - API route configuration standards
- `orchestration/directivas/AUTOMATIZACION-VALIDACION-RUTAS.md` - ESLint rules to prevent future duplicates
- `orchestration/reportes/REPORTE-HOTFIX-BUGS-RUTAS-2025-11-23.md` - Initial bug report that triggered this work

## Notes

- The official apiClient already has all features needed
- No features are lost by consolidating to the official client
- This consolidation prevents future API route bugs
- Reduces code duplication by ~200 lines
- Improves maintainability significantly

---
**Status**: In Progress
**Last Updated**: 2025-11-23 18:45 UTC
