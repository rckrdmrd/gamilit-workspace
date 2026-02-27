---
titulo: React Query Migration Guide
tipo: guia
dominio: frontend
ultima_actualizacion: 2026-02-27
---

# React Query Migration Guide

**Version:** 1.1.0
**Fecha:** 2026-02-21
**Estado:** VIGENTE
**Aplica a:** apps/frontend/src/
**Prerequisite:** [ADR-013: Adopcion de React Query](../90-adr/ADR-013-react-query-adoption.md)

---

## 1. Why Migrate to React Query

### 1.1 Problems with useState + useEffect

The traditional `useState` + `useEffect` data fetching pattern has several drawbacks that become more painful as the application grows:

| Problem | Impact |
|---------|--------|
| **Boilerplate explosion** | 40-50 lines per hook just for loading/error/data management |
| **No automatic caching** | Same data fetched multiple times across components |
| **No request deduplication** | Multiple components mounting simultaneously trigger duplicate requests |
| **Manual retry logic** | Every hook must implement its own retry strategy |
| **No background refetching** | Stale data persists until manual refresh |
| **Race condition risks** | Cleanup functions needed in every useEffect |
| **Inconsistent loading/error states** | Each developer implements their own pattern |
| **Difficult testing** | Mocking useState + useEffect is verbose and fragile |

### 1.2 Benefits of React Query

React Query (TanStack Query v5) solves all of the above:

- **Automatic caching:** Data fetched once is cached and reused across components.
- **Request deduplication:** If two components request the same data simultaneously, only one network request is made.
- **Automatic retry:** Failed requests are retried with configurable backoff.
- **Background refetching:** Stale data is refetched automatically (on window focus, reconnect, or interval).
- **Loading/error states for free:** `isLoading`, `error`, `data` provided out of the box.
- **Mutations with cache invalidation:** `useMutation` automatically invalidates related queries after write operations.
- **DevTools:** Visual debugging of all queries, their states, and cache in development.
- **70% less code** per data fetching hook.

---

## 2. Pattern Comparison

### 2.1 BEFORE: useState + useEffect + apiClient

This is the legacy pattern found in hooks like `useLtiConsumers`:

```typescript
// BEFORE — ~80+ lines for a basic CRUD hook
import { useState, useEffect, useCallback } from 'react';
import { myApi } from '@/services/api/myModule/myApi';

interface UseItemsResult {
  items: Item[];
  loading: boolean;
  error: string | null;
  createItem: (data: CreateItemDto) => Promise<Item>;
  refetch: () => Promise<void>;
}

export function useItems(): UseItemsResult {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await myApi.getItems();
      setItems(data || []);
    } catch (err) {
      console.error('[useItems] Failed to fetch:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = useCallback(
    async (data: CreateItemDto): Promise<Item> => {
      setLoading(true);
      setError(null);
      try {
        const item = await myApi.createItem(data);
        await fetchItems(); // Refetch the entire list
        return item;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create item';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchItems]
  );

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { items, loading, error, createItem, refetch: fetchItems };
}
```

### 2.2 AFTER: useQuery + useMutation from React Query

The same functionality with React Query:

```typescript
// AFTER — ~25 lines for the same CRUD hook
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { myApi } from '@/services/api/myModule/myApi';
import { useApiError } from '@shared/hooks/useApiError';

export function useItems() {
  const queryClient = useQueryClient();
  const handleError = useApiError();

  const query = useQuery({
    queryKey: ['items'],
    queryFn: () => myApi.getItems(),
    staleTime: STALE_TIMES.SEMI_STATIC,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateItemDto) => myApi.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
    onError: (error) => handleError(error, 'Error al crear item'),
  });

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createItem: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}
```

### 2.3 Key Differences

| Aspect | useState + useEffect | React Query |
|--------|---------------------|-------------|
| Lines of code | 50-80 | 15-25 |
| Caching | None | Automatic |
| Loading state | Manual `setLoading` | `isLoading` built-in |
| Error state | Manual `setError` | `error` built-in |
| Retry | Manual implementation | Automatic with backoff |
| Race conditions | Manual cleanup | Handled internally |
| Cache invalidation | Manual `refetch()` | `invalidateQueries()` |
| Testing | Mock useState/useEffect | Mock queryFn only |

---

## 3. Step-by-Step Migration

### Step 1: Identify the Data Fetching Pattern

Look for the telltale signs of a hook that should be migrated:

```typescript
// These 3 lines together indicate a migration candidate:
const [data, setData] = useState(initialValue);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

Also look for:
- `useEffect` calling an async function
- `useCallback` wrapping API calls with try/catch/finally
- Manual `setLoading(true)` / `setLoading(false)` patterns
- `eslint-disable-next-line react-hooks/exhaustive-deps` comments on useEffect

### Step 2: Identify Query Keys

Determine what uniquely identifies the data being fetched. Query keys are arrays that React Query uses to cache and deduplicate requests.

```typescript
// Static data (no parameters):
queryKey: ['items']

// Data dependent on an ID:
queryKey: ['items', itemId]

// Data dependent on filters:
queryKey: ['items', { status, page, search }]

// Nested resource:
queryKey: ['teacher', 'classrooms', classroomId, 'students']
```

### Step 3: Replace useEffect with useQuery

**Before:**
```typescript
const [stats, setStats] = useState<DashboardStats | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<Error | null>(null);

useEffect(() => {
  let cancelled = false;
  async function load() {
    try {
      setIsLoading(true);
      const data = await teacherApi.getDashboardStats();
      if (!cancelled) setStats(data);
    } catch (err) {
      if (!cancelled) setError(err as Error);
    } finally {
      if (!cancelled) setIsLoading(false);
    }
  }
  load();
  return () => { cancelled = true; };
}, []);
```

**After:**
```typescript
const { data: stats, isLoading, error } = useQuery({
  queryKey: ['teacher', 'dashboard', 'stats'],
  queryFn: () => teacherApi.getDashboardStats(),
  staleTime: STALE_TIMES.DYNAMIC,
});
```

### Step 4: Replace Manual POST/PUT/DELETE with useMutation

**Before:**
```typescript
const createClassroom = useCallback(async (data: CreateClassroomDto) => {
  setLoading(true);
  setError(null);
  try {
    const result = await classroomsApi.create(data);
    await fetchClassrooms(); // Manual refetch
    return result;
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error');
    throw err;
  } finally {
    setLoading(false);
  }
}, [fetchClassrooms]);
```

**After:**
```typescript
const queryClient = useQueryClient();
const handleError = useApiError();

const createMutation = useMutation({
  mutationFn: (data: CreateClassroomDto) => classroomsApi.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['teacher', 'classrooms'] });
    queryClient.invalidateQueries({ queryKey: ['teacher', 'dashboard'] });
    toast.success('Aula creada exitosamente');
  },
  onError: (error) => handleError(error, 'Error al crear aula'),
});
```

### Step 5: Remove Manual State Variables

After replacing with useQuery and useMutation, remove:

- `const [data, setData] = useState(...)` -- replaced by `query.data`
- `const [loading, setLoading] = useState(...)` -- replaced by `query.isLoading` or `mutation.isPending`
- `const [error, setError] = useState(...)` -- replaced by `query.error` or `mutation.error`
- `useEffect` for initial fetch -- replaced by useQuery (fetches on mount automatically)
- `useCallback` wrappers for API calls -- replaced by `mutation.mutate`

### Step 6: Update the Hook Return Type

**Before:**
```typescript
return {
  items,
  loading,
  error,
  createItem,
  updateItem,
  deleteItem,
  refetch: fetchItems,
};
```

**After:**
```typescript
return {
  items: query.data ?? [],
  isLoading: query.isLoading,
  error: query.error,
  createItem: createMutation.mutate,
  isCreating: createMutation.isPending,
  updateItem: updateMutation.mutate,
  isUpdating: updateMutation.isPending,
  deleteItem: deleteMutation.mutate,
  isDeleting: deleteMutation.isPending,
  refetch: query.refetch,
};
```

---

## 4. Query Key Conventions

### 4.1 STALE_TIMES Constants

Use the centralized stale time constants from `shared/constants/queryKeys.ts`:

```typescript
import { STALE_TIMES } from '@shared/constants/queryKeys';

// STALE_TIMES.STATIC     = 10 min — branding, system config, metadata
// STALE_TIMES.SEMI_STATIC = 5 min  — modules, templates, achievements
// STALE_TIMES.DYNAMIC     = 1 min  — progress, stats, leaderboard
// STALE_TIMES.REALTIME    = 30 sec — notifications, messages, live data
```

### 4.2 Query Key Structure

Follow a hierarchical key pattern:

```typescript
// Portal-level namespace:
queryKey: ['admin', 'dashboard', 'stats']
queryKey: ['teacher', 'classrooms']
queryKey: ['student', 'progress', moduleId]

// Feature-level namespace:
queryKey: ['gamification', 'achievements', userId]
queryKey: ['leaderboard', 'weekly', classroomId]

// With filters as an object (ensures proper cache separation):
queryKey: ['teacher', 'assignments', { status: 'pending', classroomId }]
```

### 4.3 Invalidation Patterns

When a mutation succeeds, invalidate related queries:

```typescript
// Invalidate a specific query:
queryClient.invalidateQueries({ queryKey: ['teacher', 'classrooms', classroomId] });

// Invalidate all queries starting with a prefix:
queryClient.invalidateQueries({ queryKey: ['teacher', 'classrooms'] });

// Invalidate multiple related queries:
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['teacher', 'classrooms'] });
  queryClient.invalidateQueries({ queryKey: ['teacher', 'dashboard'] });
},
```

---

## 5. Error Handling

### 5.1 The useApiError Hook

Use the centralized `useApiError` hook for consistent error handling with toast notifications:

```typescript
import { useApiError } from '@shared/hooks/useApiError';

export function useMyFeature() {
  const handleError = useApiError();

  const mutation = useMutation({
    mutationFn: (data) => myApi.doSomething(data),
    onError: handleError,
    // OR with a custom prefix:
    onError: (error) => handleError(error, 'Error al guardar configuracion'),
  });

  return { ...mutation };
}
```

The `useApiError` hook:
1. Extracts the error message from `error.response.data.message`, falling back to `error.message`, then to a generic message.
2. Shows a `toast.error()` notification to the user.
3. Logs the full error to the console for debugging.

**Source:** `apps/frontend/src/shared/hooks/useApiError.ts`

### 5.2 Query Error Handling

For read operations (useQuery), handle errors in the component:

```typescript
function MyPage() {
  const { data, isLoading, error } = useMyQuery();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error.message} />;

  return <Content data={data} />;
}
```

For critical queries that should show a toast on error, use the `onError` option (note: this is a meta option in React Query v5 that can be set via `queryClient.setDefaultOptions` or via a wrapper):

```typescript
const query = useQuery({
  queryKey: ['critical-data'],
  queryFn: () => api.getCriticalData(),
  meta: {
    errorMessage: 'Error al cargar datos criticos',
  },
});
```

---

## 6. Real-World Examples from the Codebase

### 6.1 useUserGamification (Migrated to React Query)

This hook was one of the first to be migrated. It fetches gamification summary data and is used across all 3 portals via the PageShell pattern.

**File:** `apps/frontend/src/shared/hooks/useUserGamification.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { gamificationApi } from '@/services/api/gamification/gamificationAPI';
import type { UserGamificationSummary } from '@/services/api/gamification/gamificationAPI';

export function useUserGamification(userId: string | undefined) {
  const { data: gamificationData, isLoading, error } = useQuery<UserGamificationSummary, Error>({
    queryKey: ['userGamification', userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return gamificationApi.getUserGamificationSummary(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    gamificationData: gamificationData || null,
    isLoading,
    error: error as Error | null,
  };
}
```

**Key patterns demonstrated:**
- `enabled: !!userId` -- query only runs when userId is defined
- `retryDelay` with exponential backoff
- Explicit TypeScript generics on `useQuery<Data, Error>`

### 6.2 useLtiConsumers (NOT Yet Migrated -- Migration Candidate)

This hook in `apps/frontend/src/apps/admin/hooks/useLtiConsumers.ts` is a textbook example of the legacy pattern: 300+ lines of useState + useEffect + useCallback with manual loading/error/data management for every CRUD operation.

A React Query migration would reduce it from ~300 lines to ~60 lines:

```typescript
// AFTER migration (conceptual)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ltiApi } from '@/services/api/admin/ltiAPI';
import { useApiError } from '@shared/hooks/useApiError';
import { STALE_TIMES } from '@shared/constants/queryKeys';

export function useLtiConsumers() {
  const queryClient = useQueryClient();
  const handleError = useApiError();

  const consumersQuery = useQuery({
    queryKey: ['admin', 'lti', 'consumers'],
    queryFn: () => ltiApi.getConsumers(),
    staleTime: STALE_TIMES.SEMI_STATIC,
  });

  const statsQuery = useQuery({
    queryKey: ['admin', 'lti', 'stats'],
    queryFn: () => ltiApi.getConsumerStats(),
    staleTime: STALE_TIMES.DYNAMIC,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateLtiConsumerDto) => ltiApi.createConsumer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'lti'] });
    },
    onError: (error) => handleError(error, 'Error al crear consumer'),
  });

  // ... similar pattern for update, verify, activate, deactivate

  return {
    consumers: consumersQuery.data ?? [],
    stats: statsQuery.data ?? null,
    isLoading: consumersQuery.isLoading,
    error: consumersQuery.error,
    createConsumer: createMutation.mutate,
    isCreating: createMutation.isPending,
    refetch: consumersQuery.refetch,
  };
}
```

### 6.3 useTeacherDashboard (Uses React Query)

This hook demonstrates multiple parallel queries composed into a single hook:

```typescript
export function useTeacherDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['teacher', 'dashboard', 'stats'],
    queryFn: () => teacherApi.getDashboardStats(),
  });

  const { data: classrooms, isLoading: classroomsLoading } = useQuery({
    queryKey: ['teacher', 'classrooms'],
    queryFn: () => classroomsApi.getTeacherClassrooms(),
  });

  return {
    stats,
    classrooms,
    isLoading: statsLoading || classroomsLoading,
  };
}
```

---

## 7. Migration Checklist

Use this checklist when migrating a hook from useState + useEffect to React Query:

- [ ] Identify all `useState` calls for data, loading, and error
- [ ] Identify all `useEffect` calls that trigger API fetches
- [ ] Identify all `useCallback` wrappers around API mutation calls
- [ ] Replace read operations (`GET`) with `useQuery`
- [ ] Replace write operations (`POST/PUT/PATCH/DELETE`) with `useMutation`
- [ ] Add appropriate `queryKey` following the hierarchical convention
- [ ] Set `staleTime` using `STALE_TIMES` constants
- [ ] Set `enabled` for conditional queries (e.g., `enabled: !!userId`)
- [ ] Add `onSuccess` with `invalidateQueries` to mutations
- [ ] Add `onError` using `useApiError` hook to mutations
- [ ] Remove manual useState for data/loading/error
- [ ] Remove useEffect for initial fetch
- [ ] Remove useCallback wrappers for API calls
- [ ] Update the hook's return type
- [ ] Update consuming components to use new return properties (e.g., `isLoading` instead of `loading`)
- [ ] Test the hook (mock `queryFn` instead of mocking useState/useEffect)

---

## 8. Common Pitfalls

### 8.1 Forgetting `enabled`

Without `enabled`, queries run immediately on mount even if parameters are undefined:

```typescript
// BUG: Runs immediately, userId might be undefined
useQuery({
  queryKey: ['user', userId],
  queryFn: () => api.getUser(userId!),  // Dangerous !
});

// FIX: Only runs when userId is defined
useQuery({
  queryKey: ['user', userId],
  queryFn: () => api.getUser(userId!),
  enabled: !!userId,
});
```

### 8.2 Overly Broad Invalidation

Invalidating too broadly can cause unnecessary refetches:

```typescript
// TOO BROAD: Invalidates ALL queries in the app
queryClient.invalidateQueries();

// BETTER: Invalidate only the relevant namespace
queryClient.invalidateQueries({ queryKey: ['teacher', 'classrooms'] });
```

### 8.3 Forgetting to Return Mutation State

Mutations have useful state that components need:

```typescript
// Missing: isPending, isError, isSuccess
return { doAction: mutation.mutate };

// Better: Include state for UI feedback
return {
  doAction: mutation.mutate,
  isDoingAction: mutation.isPending,
  actionError: mutation.error,
};
```

### 8.4 Using mutate vs mutateAsync

- Use `mutate` when you handle success/error in the mutation options (onSuccess, onError).
- Use `mutateAsync` when you need to await the result in the calling code (e.g., in a form submission that navigates on success).

```typescript
// Option A: Handle in mutation options
const { mutate } = useMutation({
  mutationFn: api.createItem,
  onSuccess: () => toast.success('Created!'),
  onError: handleError,
});
// Usage: mutate(data);

// Option B: Handle in calling code
const { mutateAsync } = useMutation({
  mutationFn: api.createItem,
});
// Usage: try { await mutateAsync(data); navigate('/items'); } catch { ... }
```

---

## 9. Portal Migration Status

### 9.1 Portals Migrated

| Portal | Status | Hooks Migrated | Already RQ | Skipped (UI-only) | Notes |
|--------|--------|----------------|------------|---------------------|-------|
| Student | Complete | -- | -- | -- | First portal migrated |
| Teacher | Complete | -- | -- | -- | Uses React Query for dashboard, classrooms, analytics |
| Admin | Complete | 21 | 6 | 4 | Completed 2026-02-21 |

### 9.2 Admin Portal Migration Details

The admin portal migration was completed in full. Summary:

- **21 hooks migrated** from `useState + useEffect` to `useQuery` / `useMutation` with `queryKey` factories.
- **6 hooks already using React Query** -- no changes needed.
- **4 UI-only hooks skipped** -- these manage client-side state only (no server state), so React Query does not apply.

**Pattern used:** Each migrated hook followed the standard transformation:
1. Remove `useState` for `data`, `loading`, and `error`.
2. Remove `useEffect` that triggers initial fetch.
3. Remove `useCallback` wrappers around API calls.
4. Replace read operations with `useQuery` using hierarchical keys (e.g., `['admin', 'users', filters]`).
5. Replace write operations with `useMutation` + `invalidateQueries` on success.
6. Add `useApiError` for consistent error handling with toast notifications.

### 9.3 Remaining Work

| Portal | Status | Notes |
|--------|--------|-------|
| Parents | Pending | Small portal, low priority |

---

## References

- [ADR-013: Adopcion de React Query](../90-adr/ADR-013-react-query-adoption.md) -- Decision record for adopting React Query
- [ADR-011: Frontend API Client Structure](../90-adr/ADR-011-frontend-api-client-structure.md) -- API client architecture
- [STATE-MANAGEMENT.md](./frontend/impl/STATE-MANAGEMENT.md) -- When to use React Query vs Zustand vs Context
- [HOOK-PATTERNS.md](./frontend/impl/HOOK-PATTERNS.md) -- General custom hook patterns
- [TanStack Query v5 Documentation](https://tanstack.com/query/latest)
- `apps/frontend/src/shared/constants/queryKeys.ts` -- STALE_TIMES constants
- `apps/frontend/src/shared/hooks/useApiError.ts` -- Centralized error handler
- `apps/frontend/src/shared/hooks/useUserGamification.ts` -- Real migrated hook example
