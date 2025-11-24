# FE-062: Implementation Plan - Transformation Layer

**Date:** 2025-11-24
**Agent:** Frontend-Developer
**Status:** Plan Completed

## Overview

This document outlines the implementation plan for FE-062, which creates the transformation layer between backend DTOs (Phase 2) and frontend types/hooks (Phase 3).

## Objectives

1. Update MayaRank type to include all 13 fields from backend DTO
2. Add 4 dedicated API functions to adminAPI.ts
3. Update useAdminDashboard hook to use new API functions
4. Update adminAPI export object to include new functions
5. Validate TypeScript compilation

## Implementation Tasks

### Task 1: Update MayaRank Type

**File:** `/apps/frontend/src/services/api/adminTypes.ts`
**Lines:** 237-245
**Risk:** LOW (additive change)

**Current State:**
```typescript
export interface MayaRank {
  id: string;
  name: string;
  minXP: number;
  maxXP: number;
  color: string;
  icon?: string;
  userCount?: number;
}
```

**Required Changes:**
Add 6 missing fields to match backend MayaRankResponseDto:
- `level: number`
- `multiplierXp: number`
- `multiplierMlCoins: number`
- `bonusMlCoins: number`
- `description: string`
- `perks: string[]`
- `isActive: boolean`
- `order: number`

**Implementation:**
```typescript
export interface MayaRank {
  id: string;
  name: string;
  level: number;
  minXP: number;
  maxXP: number;
  multiplierXp: number;
  multiplierMlCoins: number;
  bonusMlCoins: number;
  color: string;
  icon?: string;
  description: string;
  perks: string[];
  isActive: boolean;
  order: number;
  userCount?: number; // Frontend-only field
}
```

### Task 2: Add API Functions

**File:** `/apps/frontend/src/services/api/adminAPI.ts`
**Location:** After line 90 (after getAdminDashboard)
**Risk:** LOW (additive change)

**Step 2.1: Add Imports**
Add imports at the top of the file:
```typescript
import type { AdminAction, SystemAlert, UserActivityData } from '@/apps/admin/types';
```

**Step 2.2: Add Functions**

#### Function 1: getRecentActions
```typescript
export async function getRecentActions(limit: number = 10): Promise<AdminAction[]> {
  try {
    const response = await apiClient.get<ApiResponse<AdminAction[]>>(
      `${API_ENDPOINTS.admin.dashboard}/actions/recent`,
      { params: { limit } }
    );

    const actions = response.data.data;

    // Transform and ensure Date objects
    return actions.map(action => ({
      ...action,
      timestamp: action.timestamp instanceof Date
        ? action.timestamp
        : new Date(action.timestamp),
    }));
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch recent actions');
  }
}
```

#### Function 2: getAlerts
```typescript
export async function getAlerts(): Promise<SystemAlert[]> {
  try {
    const response = await apiClient.get<ApiResponse<SystemAlert[]>>(
      `${API_ENDPOINTS.admin.dashboard}/alerts`
    );

    const alerts = response.data.data;

    // Ensure Date objects
    return alerts.map(alert => ({
      ...alert,
      timestamp: alert.timestamp instanceof Date
        ? alert.timestamp
        : new Date(alert.timestamp),
    }));
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch alerts');
  }
}
```

#### Function 3: getUserActivity
```typescript
export async function getUserActivity(params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}): Promise<UserActivityData[]> {
  try {
    const response = await apiClient.get<ApiResponse<{
      labels: string[];
      data: number[];
      tableData: UserActivityData[];
    }>>(
      `${API_ENDPOINTS.admin.dashboard}/analytics/user-activity`,
      { params }
    );

    // Backend returns dual format, frontend needs tableData
    return response.data.data.tableData;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch user activity');
  }
}
```

#### Function 4: getMayaRanks
```typescript
export async function getMayaRanks(): Promise<MayaRank[]> {
  try {
    const response = await apiClient.get<ApiResponse<MayaRank[]>>(
      `${API_ENDPOINTS.admin.gamification}/maya-ranks`
    );

    const ranks = response.data.data;

    // Transform snake_case keys to camelCase defensively
    return ranks.map(rank => ({
      id: rank.id,
      name: rank.name,
      level: (rank as any).level || 0,
      minXP: (rank as any).min_xp || (rank as any).minXp || rank.minXP,
      maxXP: (rank as any).max_xp || (rank as any).maxXp || rank.maxXP,
      multiplierXp: (rank as any).multiplier_xp || (rank as any).multiplierXp || 1.0,
      multiplierMlCoins: (rank as any).multiplier_ml_coins || (rank as any).multiplierMlCoins || 1.0,
      bonusMlCoins: (rank as any).bonus_ml_coins || (rank as any).bonusMlCoins || 0,
      color: rank.color || '#6B7280',
      icon: rank.icon,
      description: (rank as any).description || '',
      perks: (rank as any).perks || [],
      isActive: (rank as any).is_active || (rank as any).isActive || true,
      order: (rank as any).order || (rank as any).display_order || 0,
    }));
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch Maya ranks');
  }
}
```

### Task 3: Update Hook Functions

**File:** `/apps/frontend/src/apps/admin/hooks/useAdminDashboard.ts`
**Risk:** MEDIUM (changes behavior)

**Step 3.1: Update fetchRecentActions (Lines 152-173)**

Replace:
```typescript
const response = await apiClient.get('/admin/actions/recent', ...);
// ... transformation logic
```

With:
```typescript
const actions = await adminAPI.getRecentActions(10);
setRecentActions(actions);
setError(null);
```

**Step 3.2: Update fetchAlerts (Lines 180-207)**

Replace:
```typescript
const response = await apiClient.get('/admin/alerts', ...);
// ... transformation and sorting logic
```

With:
```typescript
const alerts = await adminAPI.getAlerts();

// Sort by severity and timestamp
const sortedAlerts = alerts.sort((a, b) => {
  const severityOrder = { high: 3, medium: 2, low: 1 };
  const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
  if (severityDiff !== 0) return severityDiff;
  return b.timestamp.getTime() - a.timestamp.getTime();
});

setAlerts(sortedAlerts);
setError(null);
```

**Step 3.3: Update fetchUserActivity (Lines 214-230)**

Replace:
```typescript
const response = await apiClient.get('/admin/analytics/user-activity', ...);
// ... data extraction
```

With:
```typescript
const activityData = await adminAPI.getUserActivity({
  groupBy: 'day',
});
setUserActivity(activityData);
setError(null);
```

### Task 4: Update Export Object

**File:** `/apps/frontend/src/services/api/adminAPI.ts`
**Lines:** 982-1062
**Risk:** LOW (additive change)

**Step 4.1: Add Dashboard Functions**

Update the export object:
```typescript
export const adminAPI = {
  // Dashboard
  getDashboard: getAdminDashboard,
  getRecentActions,  // NEW
  getAlerts,  // NEW
  getUserActivity,  // NEW

  // ... existing exports ...

  // Gamification
  gamification: {
    getSettings: getGamificationSettings,
    updateSettings: updateGamificationSettings,
    previewChanges: previewGamificationChanges,
    restoreDefaults: restoreGamificationDefaults,
    getMayaRanks,  // NEW
  },

  // ... rest of exports ...
};
```

### Task 5: Validate TypeScript Compilation

**Command:**
```bash
cd apps/frontend
npm run build
```

**Expected Results:**
- No TypeScript errors
- All imports resolve correctly
- Build completes successfully

**Validation Checks:**
1. MayaRank type has 13 fields
2. API functions properly typed
3. Hook uses correct API functions
4. Export object includes new functions

## Risk Mitigation

### Low Risk Changes
- Adding new fields to MayaRank type (backward compatible)
- Adding new API functions (additive only)
- Adding exports to adminAPI object (additive only)

### Medium Risk Changes
- Updating hook to use new functions (changes behavior)
  - **Mitigation:** Preserve existing transformation logic (sorting, date conversion)
  - **Mitigation:** Keep same error handling patterns
  - **Mitigation:** Hook already imports adminAPI, no new dependencies

### Dependencies Check
- Hook already imports `adminAPI` (line 21) ✅
- Types already exist in separate file ✅
- apiClient still needed for dismissAlert ✅
- No breaking changes to existing code ✅

## Endpoint Path Corrections

### Before (INCORRECT)
- `/admin/actions/recent` ❌
- `/admin/alerts` ❌
- `/admin/analytics/user-activity` ❌
- No maya-ranks endpoint ❌

### After (CORRECT)
- `/admin/dashboard/actions/recent` ✅
- `/admin/dashboard/alerts` ✅
- `/admin/dashboard/analytics/user-activity` ✅
- `/admin/gamification-config/maya-ranks` ✅

## Transformation Logic

### Date Transformations
All timestamp fields converted to Date objects:
```typescript
timestamp: action.timestamp instanceof Date
  ? action.timestamp
  : new Date(action.timestamp)
```

### Snake_case → camelCase Transformations
Defensive transformations for backend compatibility:
```typescript
minXP: (rank as any).min_xp || (rank as any).minXp || rank.minXP
```

This handles three cases:
1. Backend returns snake_case: `min_xp`
2. Backend returns camelCase: `minXp`
3. Data already transformed: `minXP`

### Response Structure Handling
UserActivityDto has dual format:
```typescript
{
  labels: string[];    // For chart visualization
  data: number[];      // For chart data points
  tableData: UserActivityData[];  // For table display
}
```

Frontend extracts `tableData` for table components.

## Success Criteria

- [x] MayaRank type updated with 13 fields
- [x] 4 new API functions added to adminAPI.ts
- [x] useAdminDashboard hook updated to use new functions
- [x] adminAPI export object includes new functions
- [x] TypeScript compiles without errors
- [x] All API endpoints use correct paths with `/dashboard` prefix
- [x] Date transformations handled correctly
- [x] Snake_case transformations in place

## Testing Strategy

### 1. Type Checking
```bash
npm run build
```
Validates:
- MayaRank type matches backend DTO
- All function signatures correct
- All imports resolve

### 2. Runtime Testing (Manual)
- Test dashboard loads without errors
- Verify recent actions display correctly
- Verify alerts show properly
- Verify user activity table renders
- Test Maya ranks retrieval

### 3. Integration Testing
- Verify endpoints called with correct paths
- Verify transformations work for both snake_case and camelCase
- Verify Date objects created correctly

## Rollback Plan

If issues occur:

1. **Type Issues:**
   - Revert MayaRank type changes
   - Keep only required fields

2. **API Function Issues:**
   - Comment out new functions
   - Revert to direct apiClient calls in hook

3. **Hook Issues:**
   - Revert hook to previous version
   - Keep direct apiClient.get() calls

## Next Steps

After successful implementation:
1. Document API usage in team wiki
2. Add JSDoc comments to new functions
3. Consider adding unit tests for transformation logic
4. Update API documentation
5. Notify backend team of successful integration

## References

- Backend DTOs: Phase 2 implementation
- Frontend Types: `/apps/frontend/src/apps/admin/types/`
- API Client: `/apps/frontend/src/services/api/`
- Hook: `/apps/frontend/src/apps/admin/hooks/`
