# Frontend Architectural Patterns Analysis — ST-013

**Date:** 2026-03-03
**Analyzer:** ST-013 Pattern-Analysis-FE
**Scope:** React 19 + Zustand 5.x + TanStack React Query 5.x
**Codebase Size:** 575 components, 132 hooks, 65 API service files, 13 Zustand stores

---

## Executive Summary

The gamilit frontend has **3 major architectural concerns**:

1. **Zustand Store Pattern Inconsistency** — Mix of closure-based (persist middleware) and devtools-based stores with no unified pattern
2. **React Query vs Zustand Dual-Store Problem** — Same data domain (ML Coins) managed by two independent systems → sync issues
3. **API Service File Fragmentation** — 53 files in `/services/api/` + 20 in `/features/*/api/` with no clear ownership model or duplicate detection

All issues are **pre-existing design debt**, not code quality problems. Components render correctly, tests pass, no runtime errors observed.

---

## 1. Zustand Store Patterns Consistency

### Current State

**13 Zustand stores** across codebase use **3 different creation patterns**:

#### Pattern A: Persist Middleware + Nested create() (2 stores)
```typescript
// apps/frontend/src/features/auth/store/authStore.ts
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => { /* ... */ },
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ /* selective fields */ }),
    }
  ),
);

// apps/frontend/src/features/gamification/economy/store/economyStore.ts
export const useEconomyStore = create<EconomyState>()(
  persist(
    (set, get) => { /* ... */ },
    {
      name: 'glit-economy-storage',
      version: 1,
    }
  ),
);
```

**Characteristics:**
- ✅ Uses `persist()` middleware
- ✅ Selective hydration via `partialize` (authStore) or implicit (economyStore)
- ✅ localStorage-backed
- ⚠️ Nested `create()` syntax is verbose
- ⚠️ Version tracking inconsistent (authStore none, economyStore v1)

#### Pattern B: Plain create() + Devtools (2 stores)
```typescript
// apps/frontend/src/features/gamification/social/store/friendsStore.ts
export const useFriendsStore = create<FriendsStore>()(
  devtools(
    (set, get) => { /* ... */ },
    { name: 'FriendsStore' },
  ),
);

// apps/frontend/src/features/gamification/ranks/store/ranksStore.ts
export const useRanksStore = create<RanksState>()(
  persist(
    (set, get) => { /* ... */ },
    { name: 'ranks-storage' }
  ),
);
```

**Characteristics:**
- ✅ Uses devtools middleware (friendsStore)
- ✅ Enables Chrome Redux DevTools browser inspection
- ⚠️ friendsStore has NO persistence → data lost on refresh
- ⚠️ ranksStore has persist BUT devtools removed

#### Pattern C: Plain create() — No Middleware (9 stores)
```typescript
// apps/frontend/src/features/gamification/social/store/achievementsStore.ts
export const useAchievementsStore = create<AchievementsStore>((set) => ({
  // initial state + actions
}));

// apps/frontend/src/features/gamification/social/store/leaderboardsStore.ts
export const useLeaderboardsStore = create<LeaderboardsStore>((set, get) => ({
  // ...
}));

// apps/frontend/src/features/notifications/store/notificationsStore.ts
export const useNotificationsStore = create<NotificationsState>((set) => ({
  // ...
}));

// + 6 more: battleStore, powerUpsStore, newLeaderboardsStore, parentStore, studentAssignmentsStore, guildsStore
```

**Characteristics:**
- ✅ Simplest syntax
- ❌ NO persistence → data lost on refresh (achievementsStore, leaderboardsStore, notificationsStore, etc.)
- ❌ NO debugging support (devtools)
- ❌ Inconsistent with authStore/economyStore persistence model

### TypeScript Consistency

✅ **ALL stores have proper TypeScript**:
- Interface declaration before create() call
- Generic parameter: `create<StoreInterface>()`
- Action signatures with full types
- State shape clearly defined

**Example** (consistent across all):
```typescript
interface AchievementsStore {
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  recentUnlocks: AchievementUnlockNotification[];
  stats: AchievementStats;
  selectedCategory: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  unlockAchievement: (achievementId: string) => void;
  fetchAchievements: (userId: string) => Promise<void>;
}
```

### Loading/Error State Handling

✅ **Consistent pattern across all stores**:
```typescript
// All stores have:
isLoading: boolean;
error: string | null;

// Set in async operations:
set({ isLoading: true, error: null });
// ... try/catch ...
set({ isLoading: false, error: errorMessage });
```

**Score: 10/10 consistency**

### Middleware Usage

| Store | Persist | Devtools | Notes |
|-------|---------|----------|-------|
| authStore | ✅ v1+ | ❌ | Selective partialize. 7 day session TTL. |
| economyStore | ✅ v1 | ❌ | Version field present but never checked. |
| friendsStore | ❌ | ✅ | Lost on refresh. Chrome DevTools visible. |
| ranksStore | ✅ | ❌ | No version field. |
| achievementsStore | ❌ | ❌ | Lost on refresh. No debugging. |
| leaderboardsStore | ❌ | ❌ | Lost on refresh. No debugging. |
| notificationsStore | ❌ | ❌ | Lost on refresh. No debugging. |
| battleStore | ✅ | ❌ | persist() wraps create(). |
| powerUpsStore | ❌ | ❌ | Lost on refresh. |
| newLeaderboardsStore | ❌ | ❌ | Lost on refresh. |
| parentStore | ✅ | ❌ | Migration: parentStore.test.ts shows old structure. |
| studentAssignmentsStore | ❌ | ❌ | Lost on refresh. |
| guildsStore | ✅ | ❌ | Version v1. |

**Pattern Distribution:**
- 6 stores with persist + no devtools
- 1 store with devtools + no persist (friendsStore)
- 6 stores with neither persist nor devtools

**⚠️ Critical Issue:** `leaderboardsStore`, `achievementsStore`, and `notificationsStore` — frequently accessed, no persistence — lose state on F5 refresh.

---

## 2. React Query vs Zustand Dual-Store Analysis

### The Problem: ML Coins Balance Inconsistency

**Real-world scenario from memory:**
- Header showed **675 ML Coins** (React Query: `useUserGamification` → `GET /summary`)
- Shop showed **175 ML Coins** (Zustand: `useCoins` → `economyStore` + localStorage)
- **Root cause:** ShopPage didn't call `fetchBalance()` on mount → showed stale localStorage value

### Current State

#### React Query Usage
- **54 files** use `useQuery` or `useMutation`
- **297 occurrences** of React Query hooks across codebase
- **Primary consumer:** Admin/Teacher portals (useAdminDashboard, useClassrooms, useAnalytics, etc.)
- **Secondary consumer:** Shared hooks (useUserGamification, useUserStatistics)

**Data domains managed by React Query:**
1. User gamification summary (XP, coins, rank) — via `useUserGamification` hook
2. Exercise submissions & responses
3. Classroom data (teacher portal)
4. Admin analytics, monitoring, config
5. Progress tracking

#### Zustand Usage
- **13 stores** manage persistent state
- **Primary consumer:** Student portal (economy, achievements, leaderboards, friends)

**Data domains managed by Zustand:**
1. **ML Coins balance** (economyStore)
2. **Achievements** (achievementsStore)
3. **Leaderboards** (leaderboardsStore, newLeaderboardsStore)
4. **Friends** (friendsStore)
5. **Ranks** (ranksStore)
6. **Notifications** (notificationsStore)
7. **Auth tokens** (authStore)

### The Dual-Store Problem: Coins

**Header (`GamifiedHeader.tsx`)**
```typescript
// Uses React Query + shared hook
const { data: gamificationData } = useQuery<UserGamificationSummary>({
  queryKey: ['userGamification', userId],
  queryFn: () => gamificationApi.getUserGamificationSummary(userId),
  staleTime: 5 * 60 * 1000, // 5 mins
  refetchOnWindowFocus: true,
});
// gamificationData.mlCoins = 675 (from backend)
```

**Shop (`ShopPage.tsx`)**
```typescript
// Uses Zustand + localStorage
const { balance } = useCoins(); // economyStore hook
const fetchBalance = useEconomyStore((state) => state.fetchBalance);
useEffect(() => { fetchBalance(); }, [fetchBalance]); // Fixed in 2026-03-02

// balance.current = 175 (from localStorage before fetch)
```

**Why the sync broke:**
1. ShopPage mounted
2. `useCoins()` returned stale value from localStorage (175)
3. `fetchBalance()` effect called asynchronously
4. Meanwhile, ShopItemCard rendered with old balance
5. User saw 175 instead of 675

**Solution applied (2026-03-02):**
```typescript
// ShopPage.tsx now has:
useEffect(() => { fetchBalance(); }, [fetchBalance]);
```

**But the real issue remains:** Two independent sources of truth for the same data.

### Architecture Analysis

| Data Domain | React Query | Zustand | Problem |
|-------------|-------------|---------|---------|
| ML Coins | ✅ GET /summary | ✅ economyStore | Dual source; ShopPage fixed with mount-fetch |
| Achievements | ✅ Possible | ✅ achievementsStore | No React Query usage in practice; entirely Zustand |
| Leaderboards | ❌ | ✅ leaderboardsStore | Pure Zustand; no React Query |
| User Gamification (summary) | ✅ useUserGamification | ❌ | Header only uses RQ |
| Exercise submissions | ✅ useExerciseSubmission | ❌ | Teacher portal uses RQ |
| Progress | ✅ useProgress hooks | ❌ | Admin/Teacher use RQ |

### Architectural Violation: Query Invalidation

**Memory note:** useGamificationSocket.ts invalidates React Query on WebSocket events:
```typescript
['userGamification']  // React Query key
```

But economyStore has NO integration with React Query's `queryClient`. When socket fires "coins_updated", it:
1. ✅ Invalidates React Query (header updates)
2. ❌ DOES NOT trigger economyStore refresh

**Result:** Header and Shop still desync after WebSocket event.

### Consequences

| Scenario | Current Behavior | Risk |
|----------|------------------|------|
| User earns XP on exercise | React Query header updates; Zustand store stale for 5mins | **Medium** — visible if user navigates to shop quickly |
| User purchases item | Both update (shop calls fetchBalance + RQ invalidation) | **Low** — 2026-03-02 fix works |
| User gets bonus from teacher | WebSocket fires → RQ updates header only | **Medium** — shop shows old balance until refresh |
| Page refresh (F5) | Zustand hydrates from localStorage (laggy) | **High** — old data flashes before API fetch completes |

---

## 3. API Service File Patterns

### Current Distribution

**Centralized:** `/services/api/` = **53 files**
```
services/api/
├── gamification/
│   └── gamificationAPI.ts (consolidated API)
├── admin/
│   ├── gamificationApi.ts
│   ├── gamificationConfigApi.ts
│   ├── usersApi.ts
│   ├── rolesApi.ts
│   ├── analyticsApi.ts
│   ├── etc. (13 files)
├── teacher/
│   ├── teacherApi.ts
│   ├── classroomsApi.ts
│   ├── assignmentsApi.ts
│   ├── etc. (8 files)
├── adminAPI.ts
├── friendsAPI.ts
├── profileAPI.ts
├── etc. (30+ files in root or subdirs)
```

**Feature-local:** `/features/*/api/` = **20 files**
```
features/
├── auth/api/
│   └── authAPI.ts
├── gamification/
│   ├── api/index.ts (re-export hub)
│   ├── economy/api/
│   │   ├── shopAPI.ts
│   │   ├── economyAPI.ts
│   │   ├── comodinesAPI.ts
│   │   └── inventoryAPI.ts
│   ├── ranks/api/
│   │   └── ranksAPI.ts
├── progress/api/
│   └── progressAPI.ts
├── parent/api/
│   └── parentAPI.ts
└── content/api/
    └── contentAPI.ts
```

### Pattern 1: Centralized Service Files

**File:** `apps/frontend/src/services/api/gamification/gamificationAPI.ts`
```typescript
/**
 * Gamification API Client
 * Provides methods to interact with the gamification backend module
 */
export const gamificationApi = {
  // USER STATS ENDPOINTS
  getUserGamificationSummary: async (userId: string) => { /* ... */ },
  getUserStats: async (userId: string) => { /* ... */ },
  updateUserStats: async (userId: string, dto: UpdateUserStatsDto) => { /* ... */ },

  // ACHIEVEMENTS ENDPOINTS
  getAllAchievements: async () => { /* ... */ },
  getUserAchievements: async (userId: string) => { /* ... */ },

  // LEADERBOARDS
  getLeaderboard: async (type: LeaderboardType, period: LeaderboardTimePeriod) => { /* ... */ },
  // ... 20+ methods
};
```

**Characteristics:**
- ✅ Grouped by module (gamification, admin, teacher)
- ✅ Namespace object pattern (gamificationApi.method())
- ✅ TypeScript types imported from shared/types
- ❌ Mixing of concerns: achievements + leaderboards + user stats in one API

**Consumer pattern:**
```typescript
// In shared/hooks/useUserGamification.ts
import { gamificationApi } from '@/services/api/gamification/gamificationAPI';

const { data } = useQuery({
  queryFn: () => gamificationApi.getUserGamificationSummary(userId),
});
```

### Pattern 2: Feature-Local Service Files

**File:** `apps/frontend/src/features/gamification/economy/api/shopAPI.ts`
```typescript
// Direct async functions (not namespace object)
export async function getShopCategories(): Promise<ShopCategory[]> { /* ... */ }
export async function getShopItems(categoryId?: string): Promise<ShopItem[]> { /* ... */ }
export async function purchaseShopItem(itemId: string, quantity: number): Promise<PurchaseResponse> { /* ... */ }
```

**Characteristics:**
- ✅ Co-located with feature code (economy/)
- ✅ Direct function exports (not namespace)
- ❌ Inconsistent with centralized pattern (namespace vs direct)
- ⚠️ Different import style needed

**Consumer pattern:**
```typescript
// In features/gamification/economy/hooks/useShopData.ts
import { getShopItems, getShopCategories } from '../api/shopAPI';

const { data: shopItems } = useQuery({
  queryFn: () => getShopItems(selectedCategory),
});
```

### Pattern 3: Re-export Hub

**File:** `apps/frontend/src/features/gamification/api/index.ts`
```typescript
// Re-exports from multiple locations
export { gamificationApi } from '@/services/api/gamification/gamificationAPI';
export * from '../ranks/api/ranksAPI';
export * from '../economy/api/economyAPI';
export * from '../economy/api/comodinesAPI';
export {
  getShopCategories,
  getShopItems as getShopItemsLegacy,
  purchaseShopItem,
  // ...
} from '../economy/api/shopAPI';
```

**Purpose:** Provide unified import point
```typescript
import { gamificationApi, getShopItems, getRanks } from '@/features/gamification/api';
```

**Problem:** Not all consumers use this hub; many import directly from subdirs.

### Duplicate Detection Analysis

**Gamification APIs (same domain, multiple files):**

1. **gamificationAPI.ts** (centralized, `/services/api/`)
   - getUserGamificationSummary
   - getAllAchievements
   - getUserAchievements
   - getLeaderboard
   - Methods: 20+

2. **achievementsStore.ts** (Zustand, `/features/gamification/social/store/`)
   ```typescript
   fetchAchievements: async (userId: string) => {
     const [allAchievements, userAchievements] = await Promise.all([
       gamificationApi.getAllAchievements(),
       gamificationApi.getUserAchievements(userId),
     ]);
     // Merges into store view model
   }
   ```

3. **achievementsAPI.ts** (deprecated, `/features/gamification/social/api/`)
   - Comment in store: "REC-008: achievementsAPI deprecated — use gamificationApi"

**Verdict:** Historical duplication, now consolidated. Comments indicate migration path.

---

**Shop APIs (same domain, multiple files):**

1. **shopAPI.ts** (feature-local, `/features/gamification/economy/api/`)
   - getShopCategories
   - getShopItems
   - getShopItemById
   - purchaseShopItem

2. **economyStore.ts** (Zustand, `/features/gamification/economy/store/`)
   ```typescript
   purchaseItem: async (itemId) => {
     const state = get();
     // Uses economyStore logic, not direct API
   }
   ```

3. **gamificationAPI.ts** (centralized, `/services/api/`)
   - No shop methods (by design)

**Verdict:** Clear separation. Shop operations isolated in feature, gamification summary in centralized API.

### Ownership Model Issues

**Current state: No clear ownership**

| Service File | Owner | Why | Problem |
|--------------|-------|-----|---------|
| gamificationAPI.ts | Centralized (gamification module thinking) | Used by multiple portals | Hard to debug when multiple features call it |
| shopAPI.ts | Feature (economy micro-domain) | Shop-specific logic | Need to import from deep feature path |
| adminAPI.ts | Centralized (admin portal thinking) | Admin-only operations | Admin-specific code in centralized location |
| teacherApi.ts | Centralized (teacher portal thinking) | Teacher-only operations | Teacher-specific code in centralized location |

**Proposal for future:** Each portal should own its API files OR have a single `/api/` with clear `/api/admin/`, `/api/teacher/`, `/api/student/` subdirectories.

### Service File Duplication Summary

**Actual duplication:** MINIMAL (now)
- achievementsAPI.ts is deprecated (comments indicate migration done)
- gamificationAPI.ts consolidates achievements + leaderboards + user stats (deliberate, not accidental)

**Near-duplication:** POTENTIAL
- shopAPI.ts + economyStore purchaseItem logic
- ranksAPI + ranksStore addXP

**Recommendation:** Add JSDoc @deprecated comments where APIs have been superseded.

---

## 4. Prop Drilling Depth Analysis

### Exercise Component Hierarchy

**File:** `DetectiveTextualExercise.tsx` (Module 2)
```typescript
interface QuestionCardProps {
  question: InferenceQuestion;
  questionNumber: number;
  selectedOption: number | null;
  onSelectOption: (optionIndex: number) => void;
  showFeedback?: boolean;
  isCorrect?: boolean;
}

const QuestionCard = ({
  question,        // 1. Direct use
  questionNumber,  // 2. Direct use
  selectedOption,  // 3. Direct use
  onSelectOption,  // 4. Direct callback
  showFeedback,    // 5. Direct use
  isCorrect,       // 6. Direct use
}: QuestionCardProps) => {
  // Renders {question.options.map((option, index) => (
  //   <button onClick={() => !showFeedback && onSelectOption(index)} />
  // ))}
}
```

**Props count:** 6 props, 4 callbacks. **Severity: LOW**

**Justification:** All props are directly used in the component; no forwarding.

---

**File:** `InfografiaInteractivaExercise.tsx` (Module 4)
```typescript
interface ExerciseProps {
  exerciseId: string;           // 1. Direct use
  onComplete?: (score, time) => void;    // 2. Callback (direct)
  onExit?: () => void;          // 3. Callback (direct)
  onProgressUpdate?: (data) => void;     // 4. Callback (direct)
  initialData?: ExerciseState;  // 5. Direct use
  difficulty?: 'easy' | 'medium' | 'hard';  // 6. Direct use
  exercise?: InfografiaInteractivaData;     // 7. Direct use
  actionsRef?: MutableRefObject<...>;  // 8. Direct use (ref)
}

export const InfografiaInteractivaExercise = ({
  exerciseId,
  onComplete,
  onExit,
  onProgressUpdate,
  initialData,
  difficulty,
  exercise,
  actionsRef,
}: ExerciseProps) => {
  // All used directly in component logic
  // e.g.: const onSubmit = () => { onComplete?.(score, timeSpent); }
}
```

**Props count:** 8 props, 3 callbacks, 1 ref. **Severity: MEDIUM**

**Analysis:**
- ✅ No prop forwarding (props not passed deeper)
- ❌ 8 props is borderline; could use context
- ⚠️ Callbacks could be in a single action object

---

**File:** `GamifiedHeader.tsx` (Shared layout)
```typescript
export interface GamifiedHeaderProps {
  user?: User | AuthUser;                    // 1. Direct use
  onLogout?: () => void;                     // 2. Direct callback
  gamificationData?: UserGamificationData | null;  // 3. Direct use (optional)
  organizationName?: string;                 // 4. Direct use
}
```

**Props count:** 4 props, 1 callback. **Severity: LOW**

**Usage:** All props rendered directly, no forwarding to 5+ child levels.

---

### Deep Nesting Cases

**Scenario:** Exercise layout → UnifiedExerciseLayout → child component chains

From codebase observation:
```
DetectiveTextualExercise
  └─ UnifiedExerciseLayout (passes exerciseState, onSubmit down)
    └─ ExerciseContent (passes question to QuestionCard)
      └─ QuestionCard (uses all props directly)
```

**Max prop depth observed:** 3 levels (Exercise → Layout → Card)

**Props forwarded:** Minimal. Most are consumed at component level.

### Prop Drilling Patterns Summary

| Component | Props | Forwarded | Severity | Recommendation |
|-----------|-------|-----------|----------|-----------------|
| QuestionCard (Detective) | 6 | 0 | LOW | ✅ OK |
| InfografiaInteractivaExercise | 8 | 0 | MEDIUM | Consider context for actions |
| GamifiedHeader | 4 | 0 | LOW | ✅ OK |
| ShopItemCard | ~5 | 0 | LOW | ✅ OK |
| CompletionModal | ?TBD | ? | MEDIUM | 2026-02-28 split might help |

**Overall prop drilling verdict:** MINIMAL. Frontend uses appropriate component composition; no excessive forwarding detected.

---

## Design Debt Summary

### Critical (P1 — Action Required)

| Issue | Impact | Effort | Priority |
|-------|--------|--------|----------|
| **Dual-store coins balance** | User sees stale balance in shop after refresh | 3 hours | **P1 — Medium Impact** |
| **No persistence for achievements/leaderboards** | Data lost on F5 — poor UX | 1 hour | **P1 — User-facing** |
| **No devtools support in 9/13 stores** | Debugging Zustand state is manual console.log | 30 mins | **P1 — DX** |

### High (P2 — Planning)

| Issue | Impact | Effort | Priority |
|-------|--------|--------|----------|
| **React Query + Zustand sync mismatch** | WebSocket events don't update economyStore | 4 hours | **P2 — Architectural** |
| **API service pattern inconsistency** | No clear ownership; confusing import paths | 8 hours | **P2 — Maintenance** |
| **No centralized query key management** | React Query keys hardcoded in 50+ locations | 6 hours | **P2 — Maintenance** |
| **Socket.IO integration gaps** | leaderboardsStore, achievementsStore don't listen to socket events | 5 hours | **P2 — Feature completeness** |

### Medium (P3 — Nice-to-have)

| Issue | Impact | Effort | Priority |
|-------|--------|--------|----------|
| **Exercise component prop count** | InfografiaInteractiva has 8 props | 4 hours | **P3 — Code clarity** |
| **Hook naming inconsistency** | useShopData vs useShopPurchase vs useCoins (all Zustand) | 2 hours | **P3 — Developer experience** |

---

## Recommendations

### 1. Unify Zustand Store Pattern

**Create store factory:**
```typescript
// lib/zustand-store-factory.ts
interface StoreConfig {
  name: string;
  version?: number;
  persist?: boolean;
  devtools?: boolean;
}

export function createStore<T>(
  creator: (set, get) => T,
  config: StoreConfig
) {
  let store = create<T>(creator);

  if (config.devtools) {
    store = create<T>()(devtools(creator, { name: config.name }));
  }

  if (config.persist) {
    store = create<T>()(
      persist(creator, {
        name: config.name,
        version: config.version || 1,
      })
    );
  }

  return store;
}
```

**Apply to all 13 stores:**
```typescript
export const useAchievementsStore = createStore<AchievementsStore>(
  (set) => ({ /* ... */ }),
  { name: 'achievements', persist: true, devtools: true }
);
```

**Benefit:** Single source of truth for middleware configuration.

### 2. Consolidate Dual-Store (Coins)

**Option A (Recommended): Move to React Query + localStorage sync**
```typescript
// Upgrade economyStore to use React Query as SSOT
const { data: balance } = useQuery({
  queryKey: ['mlCoins', userId],
  queryFn: () => gamificationApi.getUserMLCoins(userId),
  staleTime: 5 * 60 * 1000,
});

// Zustand remains as local optimistic cache
economyStore.setOptimisticBalance(balance);
```

**Option B: Downgrade header to Zustand**
```typescript
// Use economyStore directly in GamifiedHeader
const { balance } = useCoins();
```

**Option C (Hybrid): Single source with sync layer**
```typescript
// Create middleware that syncs RQ → Zustand
const syncMiddleware = (queryClient) => (state) => {
  const mlCoins = queryClient.getQueryData(['mlCoins', userId]);
  return { ...state, balance: mlCoins };
};
```

**Recommendation:** **Option A** — React Query is SSOT; Zustand is cache.

### 3. Standardize API Service Files

**Proposal:** Reorganize `/services/api/` with explicit domain ownership

```
services/api/
├── student/           # Student portal APIs
│   ├── shopAPI.ts
│   ├── exerciseAPI.ts
│   └── gamificationAPI.ts
├── teacher/           # Teacher portal APIs
│   ├── classroomAPI.ts
│   ├── gradeAPI.ts
│   └── analyticsAPI.ts
├── admin/             # Admin portal APIs
│   ├── usersAPI.ts
│   ├── configAPI.ts
│   └── systemAPI.ts
├── shared/            # Cross-portal APIs
│   ├── authAPI.ts
│   ├── profileAPI.ts
│   └── notificationsAPI.ts
└── core/              # HTTP client, interceptors, types
    ├── apiClient.ts
    ├── apiInterceptors.ts
    └── apiTypes.ts
```

**Guidelines:**
- Each API file exports a namespace object (`export const studentShopApi = { ... }`)
- No mixing of concerns (don't put teacher methods in gamification API)
- Clear import paths: `@/services/api/student/shopAPI`
- Add `@ownership` JSDoc comments

### 4. Add Socket.IO Integration to Zustand Stores

**Create hook for socket subscription:**
```typescript
// shared/hooks/useStoreSocketSync.ts
export function useStoreSocketSync<T>(
  storeName: 'achievements' | 'leaderboards' | 'economy',
  socket: Socket
) {
  useEffect(() => {
    socket.on(`${storeName}:updated`, (data) => {
      if (storeName === 'achievements') {
        useAchievementsStore.setState(data);
      }
      // ... etc
    });

    return () => socket.off(`${storeName}:updated`);
  }, [socket, storeName]);
}
```

**Use in components:**
```typescript
useStoreSocketSync('achievements', socket);
```

---

## Conclusion

**The gamilit frontend has solid fundamentals** — React Query + Zustand usage is intentional, TypeScript is consistent, and component architecture is clean. The three identified issues are **pre-existing architectural decisions**, not code quality problems.

**Key findings:**
1. ✅ 10/10 TypeScript consistency across stores
2. ✅ Minimal prop drilling (no excessive nesting)
3. ✅ Clear React Query usage in admin/teacher portals
4. ❌ 9/13 Zustand stores missing persistence (UX debt)
5. ❌ Dual-store problem exists but is mitigated (2026-03-02 ShopPage fix)
6. ⚠️ API service patterns need standardization (not critical)

**Recommendation:** Prioritize P1 issues (persistence, dual-store unification) before adding new features to student portal.

---

**Reviewed:** 2026-03-03
**Stores analyzed:** 13/13 (100%)
**React Query hooks:** 54+ files (297 occurrences)
**API service files:** 73 total (53 centralized + 20 feature-local)
**Components inspected:** 20+ exercise mechanics + layout components
