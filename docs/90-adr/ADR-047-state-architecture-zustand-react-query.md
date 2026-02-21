# ADR-047: State Architecture — Zustand + React Query

**Status:** Accepted
**Date:** 2026-02-21
**Deciders:** Frontend Team
**Tags:** frontend, architecture, state-management, zustand, react-query

---

## Context

### Situacion Anterior

The GAMILIT frontend originally aspired to use Zustand stores as the primary state management solution for all data — both server-fetched API data and client-local UI state. Early planning documents referenced up to 32 Zustand stores covering every domain: auth, gamification, leaderboards, missions, economy, notifications, exercises, progress, classrooms, and more.

In practice, this approach led to several problems:

1. **Manual cache management:** Each Zustand store that fetched API data had to manually track loading states, errors, staleness, and re-fetching logic. This resulted in boilerplate `isLoading`, `error`, `fetchData()`, and `invalidate()` patterns duplicated across stores.
2. **Stale data:** Without automatic background refetching, stores would display outdated data until the user manually triggered a refresh or navigated away and back.
3. **Aspirational stores:** Many of the planned 32 stores were never implemented because the boilerplate cost was too high. The actual count of implemented stores was much lower.
4. **Redundant patterns:** React Query (TanStack Query) was already present in the project for some API calls, creating two parallel patterns for server state: Zustand stores with manual `fetch` + `setState`, and React Query hooks with automatic caching.

### Evaluacion

The team evaluated three approaches:

1. **All Zustand:** Consolidate everything into Zustand stores, remove React Query. High boilerplate, no automatic caching.
2. **All React Query:** Remove all Zustand stores, use only React Query + React Context. Loses the simplicity of Zustand for client-local state.
3. **Hybrid — React Query for server state, Zustand for client-local state:** Each tool handles what it does best.

### Estado Actual (2026-02-21)

The codebase has organically converged on the hybrid approach:

- **13 Zustand stores** remain, down from 32 aspirational:

| Store | Location | Purpose |
|-------|----------|---------|
| `authStore` | `features/auth/store/` | Auth tokens, session, user identity |
| `friendsStore` | `features/gamification/social/store/` | Friends list UI state |
| `leaderboardsStore` | `features/gamification/social/store/` | Leaderboard scope/period filters |
| `newLeaderboardsStore` | `features/gamification/social/store/` | Leaderboard metric tab filters |
| `achievementsStore` | `features/gamification/social/store/` | Achievement filter/sort UI state |
| `guildsStore` | `features/gamification/social/store/` | Guild membership client state |
| `powerUpsStore` | `features/gamification/social/store/` | Active power-up UI state |
| `economyStore` | `features/gamification/economy/store/` | Wallet balance, transaction history |
| `ranksStore` | `features/gamification/ranks/store/` | Rank progression client state |
| `battleStore` | `features/gamification/battles/store/` | Active battle session state |
| `parentStore` | `features/parent/store/` | Parent dashboard local filters |
| `notificationsStore` | `features/notifications/store/` | Notification bell unread count |
| `studentAssignmentsStore` | `features/assignments/store/` | Assignment list filters/sorting |

- **127 hooks** handle data fetching, with the majority using React Query (`useQuery`, `useMutation`) for server state.
- A deprecated `missionsStore` was already deleted (replaced by `useMissions` React Query hook).

---

## Decision

**React Query is the standard for server state. Zustand is reserved for client-local state only.**

### Definiciones

- **Server state:** Data that originates from the backend API and must be synchronized with the server. Examples: user profiles, exercise data, leaderboard rankings, mission lists, shop items, classroom rosters, progress records.
- **Client-local state:** Data that exists only in the browser and has no server counterpart. Examples: UI filter selections, sidebar open/closed, modal visibility, active tab index, drag-and-drop positions, form draft state before submission.

### Reglas

#### 1. New API data MUST use React Query hooks

All new features that fetch data from the backend must use `useQuery` for reads and `useMutation` for writes. The hook should live alongside the feature:

```typescript
// features/gamification/missions/hooks/useMissions.ts
export function useMissions(classroomId?: string) {
  return useQuery({
    queryKey: ['missions', classroomId],
    queryFn: () => missionsAPI.getMissions(classroomId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

#### 2. New client-local state MAY use Zustand

If a feature needs persistent client-local state that survives component unmounts (e.g., filter selections that should be remembered when navigating back), Zustand is appropriate:

```typescript
// features/assignments/store/studentAssignmentsStore.ts
export const useStudentAssignmentsStore = create<AssignmentsState>((set) => ({
  sortBy: 'dueDate',
  filterStatus: 'all',
  setSortBy: (sortBy) => set({ sortBy }),
  setFilterStatus: (filterStatus) => set({ filterStatus }),
}));
```

#### 3. Existing Zustand stores that fetch API data: migrate incrementally

The 13 remaining Zustand stores are not required to be migrated immediately. When a store is significantly modified or its feature is refactored, it should be evaluated for migration to React Query. The migration path is:

1. Create a React Query hook that replaces the store's `fetch` + `setState` logic.
2. Update consumers to use the hook instead of the store's data.
3. If the store still has client-local state (filters, UI preferences), keep only that part in Zustand.
4. If the store has no remaining client-local state, delete it entirely.

#### 4. No new Zustand stores for API data

Creating a new Zustand store that calls an API endpoint and stores the response is prohibited. This pattern is superseded by React Query.

### Cache Invalidation Strategy

React Query provides automatic cache invalidation via `queryKey` matching. The project follows these conventions:

- **Automatic refetch on window focus:** Enabled globally for non-sensitive data.
- **Mutation-triggered invalidation:** `useMutation`'s `onSuccess` calls `queryClient.invalidateQueries()` with the relevant keys.
- **Dashboard hook:** `useInvalidateDashboard()` provides a convenience method for invalidating all dashboard-related queries after gamification events.
- **staleTime defaults:** 5 minutes for relatively static data (modules, content), 1 minute for frequently changing data (leaderboards, notifications).

---

## Alternatives Considered

### Alternativa 1: All Zustand (Remove React Query)

**Pros:**
- Single state management library.
- Full control over caching logic.

**Cons:**
- Must reimplement loading/error/stale/refetch logic in every store.
- No automatic cache invalidation across related queries.
- No automatic background refetching.
- Would require creating 30+ new stores for data currently handled by React Query hooks.

**Decision:** Rejected. React Query's server-state features are too valuable to replicate manually.

### Alternativa 2: All React Query + React Context (Remove Zustand)

**Pros:**
- Single paradigm for all state.
- React Query handles server state natively.

**Cons:**
- React Context is verbose for client-local state (requires Provider wrappers, context creation boilerplate).
- Re-renders propagate to all consumers when context value changes (without careful memoization).
- Zustand's selector pattern (`useStore(state => state.filter)`) is more ergonomic for granular subscriptions.
- Migration cost for 13 existing stores with no functional benefit for client-local state.

**Decision:** Rejected. Zustand is a better fit for client-local state than React Context.

### Alternativa 3: Hybrid — React Query + Zustand (Chosen)

**Pros:**
- Each tool handles what it does best: React Query for server state, Zustand for client-local state.
- Aligns with how the codebase has organically evolved.
- No big-bang migration required.
- React Query provides automatic caching, background refetching, and cache invalidation.
- Zustand provides lightweight, selector-based client-local state with minimal boilerplate.

**Cons:**
- Two state management libraries to learn and maintain.
- Requires clear guidelines to prevent misuse (e.g., using Zustand for API data).

**Decision:** CHOSEN as the formalized standard, reflecting existing practice and providing clear rules going forward.

---

## Consequences

### Positivas

1. **Automatic cache management:** React Query handles loading, error, stale, refetch, and background updates automatically. Developers write data-fetching hooks in ~10 lines instead of 50+ lines of Zustand boilerplate.
2. **Fewer stores to maintain:** 13 Zustand stores instead of 32 aspirational. Each store has a clear, narrow responsibility (client-local state only).
3. **Consistent data freshness:** React Query's `staleTime` and automatic refetch-on-focus ensure users see current data without manual refresh buttons.
4. **Simpler mental model:** "Is it from the server? Use React Query. Is it browser-only? Use Zustand." This clarity reduces decision fatigue when building new features.
5. **Cache invalidation is declarative:** `queryClient.invalidateQueries(['missions'])` invalidates all mission-related queries automatically, instead of manually calling `missionStore.refetch()` in every mutation handler.
6. **DevTools support:** React Query DevTools show cache state, query timing, and invalidation in real-time during development.

### Negativas

1. **Two libraries:** New developers must learn both React Query and Zustand. The conceptual boundary (server vs client state) mitigates this, but there is still a learning curve.
2. **Gradual inconsistency:** During the migration period, some data flows through Zustand stores (legacy) and some through React Query hooks (standard). This coexistence is acceptable but may confuse contributors unfamiliar with the migration context.
3. **Over-migration risk:** There is a risk of over-eagerly converting Zustand stores that legitimately hold client-local state. The guidelines above should prevent this, but code review vigilance is needed.

---

## Dependencies

| Dependencia | Tipo | Estado | Descripcion |
|-------------|------|--------|-------------|
| React Query (TanStack Query v5) | Dependencia | Activo | Server state management library |
| Zustand v4 | Dependencia | Activo | Client-local state management library |
| ADR-046 | Relacionado | Accepted | PageShell pattern — hooks in PageShells use React Query |
| useInvalidateDashboard | Implementacion | Completado | Convenience hook for dashboard cache invalidation |

---

## References

- `apps/frontend/src/features/gamification/missions/hooks/useMissions.ts` -- Example React Query hook replacing deprecated Zustand missionsStore
- `apps/frontend/src/features/auth/store/authStore.ts` -- Zustand store for client-local auth state (tokens, session)
- `apps/frontend/src/shared/hooks/useInvalidateDashboard.ts` -- Dashboard cache invalidation convenience hook
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [ADR-046: PageShell Pattern](./ADR-046-pageshell-pattern.md)
- CLAUDE.md -- 13 Zustand stores (verified), 127 hooks, React Query as primary server-state pattern

---

**Status:** Accepted
**Date Created:** 2026-02-21
**Last Updated:** 2026-02-21
**Supersedes:** N/A
**Superseded by:** N/A
