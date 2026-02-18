# 01-HALLAZGOS.md — Student Portal Analysis Findings

**Task:** TASK-2026-02-18-STUDENT-PORTAL-ANALYSIS
**Fecha:** 2026-02-18
**Scope:** 17 pages + 8 settings sub-components + 18 dashboard components + 6 gamification components

---

## Resumen Ejecutivo

| Metrica | Valor |
|---------|-------|
| Paginas analizadas | 17 |
| Componentes compartidos analizados | 32 |
| Violaciones totales encontradas | **192** |
| Paginas que cumplen Thin Shell (<100 lineas) | **2/17** (SettingsPage, EmailVerificationPage) |
| Paginas con React Query | **1/17** (DashboardComplete parcial) |
| Paginas con ADR-030 naming correcto | **0/17** |
| Componentes >200 lineas | **8** |
| Archivos con `eslint-disable no-explicit-any` | **6** |
| Archivos con datos mock hardcoded | **4** |
| Archivos con `console.log` en produccion | **5** |

---

## 1. Paginas de Gamificacion (Agente A)

### ShopPage.tsx — 632 lineas | P1

**Violaciones (17):**
1. [STRUCTURE] 632 lineas — 6.3x target. Todo inline: fetch, transform, filter, sort, purchase handler, JSX
2. [STRUCTURE] Data fetching usa `useEffect` + `useState` en vez de React Query (2 useEffect blocks)
3. [STRUCTURE] Zustand mixto: `useCoins`/`useEconomyStore` + manual fetch con useEffect
4. [STATE] 8 useState para server-state (`shopItems`, `apiCategories`, `isLoadingItems`...)
5. [STATE] Feature muerta: `cart` declarado pero siempre vacio, boton cart con onClick no-op
6. [TYPESCRIPT] Type assertions inseguras: `selectedCategory as ShopItemCategory`, `item.category as ShopCategory`
7. [ACCESSIBILITY] Search input sin `aria-label`. Select sin label
8. [ACCESSIBILITY] Category buttons sin `role="tab"`/`aria-pressed`/`role="tablist"`
9. [ACCESSIBILITY] Purchase modal buttons sin aria-label
10. [STYLE] Inline gradient strings con template literals rompen JIT purging de Tailwind
11. [STYLE] Rarity badge usa `.replace('from-', 'bg-').split(' ')[0]` — manipulacion fragil de clases
12. [ERROR] Sin error state dedicado. Fetch falla → toast + grid vacio (misleading)
13. [NAMING] Sufijo "Page" viola ADR-030
14. [PERFORMANCE] `filteredItems` sin `useMemo` — recalcula cada render
15. [PERFORMANCE] `getRarityColor` definido dentro del componente, re-creado cada render
16. [PERFORMANCE] Staggered animation `index * 0.05` degrada con muchos items
17. [STRUCTURE] `ShopIcon` componente inline que deberia extraerse

### InventoryPage.tsx — 732 lineas | P1

**Violaciones (19):**
1. [STRUCTURE] 732 lineas — 7.3x target. Pagina mas grande de todo el portal
2. [STRUCTURE] `eslint-disable @typescript-eslint/no-explicit-any` a nivel de archivo (linea 11)
3. [STRUCTURE] Data fetching usa `useEffect` + `useState` (74 lineas de useEffect con 2 funciones async paralelas)
4. [STATE] 5 useState para server-state (`inventoryItems`, `powerUps`, `activePowerUps`, `isLoadingInventory`, `isLoadingActive`)
5. [STATE] Patron inconsistente: `useEquipment` usa React Query correctamente pero el resto usa useState/useEffect
6. [TYPESCRIPT] 3 `any` explicitos (lineas 88, 109, 110) en transformacion de datos
7. [TYPESCRIPT] Union type `ShopItem | PowerUp` requiere discriminacion runtime fragil
8. [ACCESSIBILITY] Tab buttons sin `role="tab"`, `aria-selected`, `role="tablist"`
9. [ACCESSIBILITY] Search input sin `aria-label`
10. [ACCESSIBILITY] Active power-up cards sin keyboard interaction
11. [STYLE] `getRarityColor` DUPLICADO con ShopPage — logica identica
12. [STYLE] Misma manipulacion fragil de rarity badge string
13. [ERROR] Sin error state dedicado — fetch falla → toast + empty state misleading
14. [ERROR] Sin diferenciacion de loading states entre tabs
15. [NAMING] Sufijo "Page" viola ADR-030
16. [PERFORMANCE] `allItems` array re-creado cada render sin `useMemo`
17. [PERFORMANCE] `filteredItems` recalculado cada render sin `useMemo`
18. [PERFORMANCE] `totalValue` recalculado cada render sin `useMemo`
19. [PERFORMANCE] Staggered animation concern

### LeaderboardPage.tsx — 546 lineas | P2

**Violaciones (20):**
1. [STRUCTURE] 546 lineas — 5.5x target
2. [STRUCTURE] Mixed hook patterns: `useLeaderboards` (Zustand), `useDashboardData`/`useUserClassroom` (useEffect/useState)
3. [STATE] `useEffect` para init: `setLeaderboardType('global')` — side-effect-as-initialization anti-pattern
4. [STATE] `isRefreshing` con fake timeout 1s — loading state cosmetico, no real
5. [STATE] `autoScrollEnabled` + `useRef` para scroll — deberia encapsularse en hook
6. [ACCESSIBILITY] Stats grid usa `<div>` sin semantica. Deberia usar `<section>` o `<dl>`
7. [ACCESSIBILITY] Auto-scroll toggle sin `aria-pressed`
8. [STYLE] Background usa `from-orange-50 via-amber-50 to-orange-100` pero no patron detective-bg
9. [STYLE] Side panel cards usan `bg-white shadow-lg` en vez de `DetectiveCard`
10. [STYLE] "Friends Mini Leaderboard" sidebar muestra top 5 del leaderboard actual, NO amigos reales
11. [ERROR] Error state existe con retry — BIEN
12. [ERROR] Loading state inline sin skeleton
13. [NAMING] Sufijo "Page" viola ADR-030
14. [PERFORMANCE] `pointsToNext` sin memoizar (trivial pero inconsistente)
15. [PERFORMANCE] Heavy animation chain >1s total
16. [PERFORMANCE] `userEntryRef` con positioned absolute — hack de scroll
17. [TYPESCRIPT] `type typeof selectedType` acoplado al hook return en vez de tipo de dominio
18. [ACCESSIBILITY] Images con alt generico (username sin "avatar")
19. [STATE] Auth import inconsistente (`@/features/auth/hooks/useAuth` vs AuthContext)
20. [PERFORMANCE] `categoryStats` usa `useMemo` correctamente — BIEN (unica pagina de las 3)

---

## 2. Paginas Sociales y Perfil (Agente B)

### FriendsPage.tsx — 591 lineas | P2

**Violaciones (15):**
1. [STRUCTURE] 591 lineas — 6x target. 4 tab panels inline
2. [STRUCTURE] Sin layout separation — `GamifiedHeader` + `<main>` pattern duplicado
3. [STRUCTURE] `formatLastActive` utility inline, re-creado cada render
4. [STRUCTURE] Handler functions inline (4 handlers thin wrappers)
5. [STATE] `filteredFriends`/`pendingRequests` derivados sin `useMemo`
6. [STATE] `useUserGamification` mock data — dead weight
7. [TYPESCRIPT] Sin return type explicito en componente
8. [ACCESSIBILITY] `confirm()` para accion destructiva — no accesible
9. [ACCESSIBILITY] Search input sin `aria-label`. Tab buttons sin `role="tab"`. "Remove Friend" boton solo icono sin label
10. [ACCESSIBILITY] Sin `<nav>` o `<section>` landmarks
11. [ERROR] Sin loading state — hook retorna `loading`/`error` pero no se usan
12. [ERROR] Sin try-catch en async handlers
13. [NAMING] Sufijo "Page" viola ADR-030
14. [PERFORMANCE] Sin virtualizacion para friend list
15. [STYLE] Stats overview cards copy-paste 4 veces

### GuildsPage.tsx — 684 lineas | P2

**Violaciones (18):**
1. [STRUCTURE] 684 lineas — 7x target
2. [STRUCTURE] Create Guild form embebido en pagina (75 lineas inline)
3. [STRUCTURE] `getStatusBadge` utility inline
4. [STRUCTURE] Sin layout component
5. [STATE] Form state con `useState` object — deberia usar react-hook-form o useReducer
6. [STATE] Sin error handling en form submission
7. [STATE] `alert()` para validation feedback — no accesible, UX pobre
8. [TYPESCRIPT] Sin return type en componente
9. [TYPESCRIPT] `member.rank as RankType` — cast forzado sin type guard
10. [ACCESSIBILITY] `confirm()` para leave guild
11. [ACCESSIBILITY] Tab buttons sin `role="tab"`, `aria-selected`
12. [ACCESSIBILITY] Form inputs sin `aria-required`
13. [ACCESSIBILITY] Search input sin `aria-label`
14. [ERROR] Sin loading state rendered
15. [ERROR] Sin error boundary o error state UI
16. [NAMING] Sufijo "Page" viola ADR-030
17. [PERFORMANCE] Sin virtualizacion para guild cards
18. [STYLE] Stat card pattern duplicado 4x

### EnhancedProfilePage.tsx — 635 lineas | P1

**Violaciones (22):**
1. [STRUCTURE] 635 lineas — 6.3x target
2. [STRUCTURE] `useEffect` directo para data fetching (3 parallel fetches via Zustand)
3. [STRUCTURE] Mock data hardcoded: `rankHistory`, `activityData` dentro del componente
4. [STRUCTURE] `stats` array inline sin `useMemo`
5. [STRUCTURE] `mayaRankToRankType` mapping incompleto con fallback silencioso
6. [STATE] 4 Zustand stores directos + `useUserGamification` + 2 `useState` = 9 hooks sin composicion
7. [STATE] `@ts-ignore` en `useAuthStore.setState()` (linea 111)
8. [STATE] API call directo `profileAPI.updateProfile()` en componente — bypasses hook/store pattern
9. [TYPESCRIPT] `@ts-ignore` explicito en linea 111
10. [TYPESCRIPT] Interface `RankHistoryEntry` solo para mock data
11. [TYPESCRIPT] Sin return type en componente
12. [ACCESSIBILITY] Sin ARIA tab semantics
13. [ACCESSIBILITY] Charts (Recharts) sin descripciones accesibles — invisibles para assistive tech
14. [ACCESSIBILITY] Avatar change button con `title` pero sin `aria-label`
15. [ERROR] Sin loading state para initial data
16. [ERROR] `handleAvatarSelect` sin loading state
17. [ERROR] `recentAchievements` sorting maneja missing `unlockedAt` silenciosamente
18. [NAMING] "EnhancedProfilePage" — doble violacion: qualifier vestigial + suffix
19. [STYLE] Gradient `from-purple-50 via-pink-50 to-indigo-50` — inconsistente con detective theme
20. [STYLE] Hero uses `from-purple-600 via-pink-600 to-indigo-600` en vez de detective-orange/gold
21. [PERFORMANCE] 10 Recharts components importados eagerly — solo visible en tab "stats"
22. [PERFORMANCE] `recentAchievements` sin `useMemo`

---

## 3. Paginas de Contenido Educativo (Agente C)

### ModuleDetailPage.tsx — 627 lineas | P1

**Violaciones (18):**
1. [STRUCTURE] 627 lineas — 19x ExercisePage gold standard
2. [STRUCTURE] Sin Provider pattern — 3 hooks + derivaciones + sub-componente inline
3. [STRUCTURE] Sin Layout separation — 308 lineas de JSX monolitico
4. [STATE] `useModuleDetail` usa useState+useEffect (3 sequential API calls sin Promise.allSettled)
5. [STATE] Derived state maps re-creados cada render sin useMemo
6. [STATE] Duplicate difficulty label maps
7. [TYPESCRIPT] Index signature `[key: string]` en interfaces Module/Exercise — defeats type safety
8. [TYPESCRIPT] Sin return type en componente
9. [TYPESCRIPT] IIFE patterns en JSX (6 ocurrencias) — anti-pattern
10. [ACCESSIBILITY] Sin ARIA labels en interactive elements
11. [ACCESSIBILITY] Locked exercises sin indicacion accesible
12. [STYLE] `GamifiedHeader` + logout callback duplicado 3 veces (loading, error, main)
13. [STYLE] ColorfulCard en vez de DetectiveCard para exercise cards
14. [ERROR] `window.location.reload()` para retry — destruye client state
15. [NAMING] Sufijo "Page" viola ADR-030
16. [NAMING] Auth import inconsistente
17. [PERFORMANCE] Sin lazy loading de sub-secciones
18. [PERFORMANCE] `console.log` statements en useModuleDetail hook (6 ocurrencias)

### LearningPage.tsx — 357 lineas | P0

**Violaciones (21) — CRITICA: Mock data en produccion:**
1. [STRUCTURE] 357 lineas — 4.5x target
2. [STRUCTURE] **BUG FUNCIONAL: Datos mock hardcoded** — `modules` array y `mockProgress` record son estaticos. El usuario SIEMPRE ve 75%/30%/0%/0%/0% sin importar su progreso real
3. [STRUCTURE] Sin separation of concerns — static data, animation config, filter logic, render todo en un archivo
4. [STATE] Sin React Query. `useUserModules` hook EXISTE pero NO se usa aqui
5. [STATE] Usa `useAuthStore` directamente en vez de `useAuth` hook
6. [TYPESCRIPT] Sin return type en componente
7. [TYPESCRIPT] `as const` unnecessary en animation variants
8. [ACCESSIBILITY] Search input sin `<label>` o `aria-label`
9. [ACCESSIBILITY] Disabled modules sin `aria-describedby` para lock message
10. [ACCESSIBILITY] Emoji icons sin `role="img"` ni `aria-label`
11. [STYLE] Dark mode classes presentes pero inconsistentes (1 referencia, inner elements sin dark mode)
12. [STYLE] Container pattern diferente (`container mx-auto px-4` vs `mx-auto max-w-7xl px-4`)
13. [ERROR] Sin loading state
14. [ERROR] Sin error state
15. [ERROR] Empty state solo para search, no para 0 modules del API
16. [NAMING] Sufijo "Page" viola ADR-030
17. [PERFORMANCE] Static data re-evaluated cada render
18. [TYPESCRIPT] `ModuleData.icon` typed as `string` para emoji
19. [STYLE] Uses `DetectiveCard` — CORRECTO
20. [STYLE] Uses `<main>` — CORRECTO
21. [STATE] Mock progress data no refleja progreso real del estudiante — BUG

### DashboardComplete.tsx — 241 lineas | P2

**Violaciones (15):**
1. [STRUCTURE] 241 lineas — 3x target pero cercano a aceptable
2. [STRUCTURE] 68 lineas de data transformation logic que deberia estar en hooks
3. [STRUCTURE] 6 hooks compuestos — threshold para Provider pattern
4. [STATE] Mixed hook origins (7 diferentes fuentes)
5. [STATE] Data transforms sin `useMemo` (4 transforms)
6. [TYPESCRIPT] `as const` assertions verbose en transforms
7. [TYPESCRIPT] TODO comment `// TODO: Get from backend` para `nextRank`
8. [ACCESSIBILITY] Emoji en heading sin `aria-hidden="true"`
9. [ACCESSIBILITY] Error retry button sin aria-label
10. [STYLE] Gradient theme consistente — CORRECTO
11. [ERROR] Error handling parcial — solo `useDashboardData` error displayed
12. [NAMING] "DashboardComplete" — sufijo "Complete" vestigial, deberia ser `Dashboard.tsx`
13. [PERFORMANCE] 6 hooks fire in parallel = 9+ simultaneous API calls
14. [PERFORMANCE] Sin virtualizacion o progressive loading
15. [STATE] React Query usado via `useDashboardData` — CORRECTO (unico en este grupo)

---

## 4. Paginas de Misiones, Logros y Asignaciones (Agente D)

### MissionsPage.tsx — 249 lineas | P1

**Violaciones (12):**
1. [STRUCTURE] 249 lineas — 2.5x target
2. [STRUCTURE] Inline logic: tab-URL sync, handlers con toast, empty message, allCompleted
3. [STATE] `useMissions` hook (513 lineas!) usa useState+useEffect+setInterval en vez de React Query
4. [STATE] Tab state split-brain: `currentTab` en hook Y synced via URL searchParams (fragil)
5. [TYPESCRIPT] `useMissions` hook usa `as MissionFromAPI[]` type assertions
6. [ACCESSIBILITY] Error retry button sin aria-label. Emoji en heading sin contexto
7. [ACCESSIBILITY] Sin `role="alert"` en error container. Sin `aria-live` para updates dinamicos
8. [STYLE] Gradient theme consistente — CORRECTO
9. [ERROR] Error state con retry — adecuado pero sin loading-on-retry
10. [NAMING] Sufijo "Page" viola ADR-030
11. [PERFORMANCE] 60s setInterval refetch sin Page Visibility API check
12. [STATE] Auth import inconsistente entre paginas

### AchievementsPage.tsx — 593 lineas | P0

**Violaciones (14) — CRITICA: Peor deuda tecnica del portal:**
1. [STRUCTURE] 593 lineas — 6x target. Monolito con 2 useEffect, 3 useMemo (125 lineas), 76 lineas de summary
2. [STATE] **CRITICO:** Server state en raw useState (3 variables) con useEffect fetch — sin caching, sin retry, sin background refetch
3. [STATE] 2 boolean loading states manuales en vez de React Query built-in
4. [STATE] `displaySummary` useMemo es 76 lineas — mini-modulo inline
5. [STATE] **13+ console.log** en produccion
6. [TYPESCRIPT] `as unknown as { ... }` — double cast que bypasses TypeScript por completo (linea 263)
7. [TYPESCRIPT] Sin return types en handler functions
8. [ACCESSIBILITY] Spinner sin ARIA. Error sin `role="alert"`. Sin `aria-live` regions
9. [ACCESSIBILITY] Summary stats cards son `<div>` — deberian ser `<dl>/<dt>/<dd>`
10. [STYLE] Sin Framer Motion (inconsistente con MissionsPage que si lo tiene)
11. [ERROR] **`window.location.reload()`** para retry — destruye todo el client state
12. [NAMING] Sufijo "Page" + ubicacion incorrecta (`src/pages/` vs `src/apps/student/pages/`)
13. [PERFORMANCE] 3 memos encadenados con sort redundante
14. [STRUCTURE] Import pattern especial en App.tsx: named export extraction

### AssignmentsPage.tsx — 357 lineas | P1

**Violaciones (14):**
1. [STRUCTURE] 357 lineas — 3.5x target. 3 inline components
2. [STATE] Zustand store para server state en vez de React Query
3. [STATE] `GradesSummaryCard` tiene su propio useEffect fetch — waterfall requests
4. [TYPESCRIPT] `statusConfig` typed as `Record<string, {...}>` en vez de union type — pierde type safety
5. [TYPESCRIPT] `statusConfig` DUPLICADO identicamente en AssignmentDetailPage.tsx
6. [ACCESSIBILITY] `FilterTabs` sin `role="tablist"`/`role="tab"`/`aria-selected`
7. [ACCESSIBILITY] `AssignmentCard` es `motion.div` con onClick — no keyboard-focusable, sin `role="button"`
8. [STYLE] `bg-gray-50` background diverge del standard `from-orange-50 via-amber-50 to-orange-100`
9. [STYLE] `from-indigo-500 to-purple-600` diverge del detective theme
10. [ERROR] Sin retry mechanism — solo static error message
11. [ERROR] `GradesSummaryCard` falla silenciosamente (retorna null)
12. [NAMING] Sufijo "Page" viola ADR-030
13. [PERFORMANCE] `GradesSummaryCard` fetch sin caching — refetch incondicional en cada mount
14. [STRUCTURE] `GamifiedHeader` sin `gamificationData` prop

### AssignmentDetailPage.tsx — 348 lineas | P1

**Violaciones (13):**
1. [STRUCTURE] 348 lineas — 3.5x target. Inline `ExerciseCard` + main component
2. [STATE] **CRITICO:** Raw useState+useEffect para fetch — inconsistente con AssignmentsPage que usa store
3. [STATE] API directa `studentAssignmentsAPI.getAssignmentDetail(id)` — bypasses store pattern
4. [TYPESCRIPT] `statusConfig` DUPLICADO de AssignmentsPage
5. [TYPESCRIPT] `StudentAssignmentDetail['exercises'][0]` tight coupling a API response shape
6. [ACCESSIBILITY] "Iniciar" button repetido sin especificar cual ejercicio
7. [ACCESSIBILITY] Submission info usa `<p>/<span>` en vez de `<dl>/<dt>/<dd>`
8. [STYLE] `bg-gray-50` + `from-indigo-500 to-purple-600` — misma inconsistencia
9. [ERROR] Sin "Retry" button — solo "Volver"
10. [ERROR] **BUG:** Si `id` es undefined → loading spinner permanente (isLoading=true nunca se resetea)
11. [NAMING] Sufijo "Page" viola ADR-030
12. [PERFORMANCE] Sin caching — cada navegacion al mismo assignment re-fetches
13. [STRUCTURE] `GamifiedHeader` sin `gamificationData` prop

---

## 5. Settings, Auth y Componentes Compartidos (Agente E)

### SettingsPage.tsx — 79 lineas | OK (ya refactorizado)

**Violaciones (2):**
1. [NAMING] Sufijo "Page" viola ADR-030
2. [ACCESSIBILITY] Tab system sin `role="tablist"`, sidebar sin `aria-selected`

### Settings Sub-Components

| Componente | Lineas | Violaciones Clave |
|------------|--------|-------------------|
| SettingsSidebar | 49 | Casi ejemplar. Solo falta `aria-selected` |
| ProfileSection | 165 | `eslint-disable any`, `@ts-expect-error`, profile data no pre-populated |
| **AccountSection** | **357** | **eslint-disable any**, 4x `(error as any)`, 10 useState, email modal sin focus trap |
| NotificationsSection | 247 | `eslint-disable any`, useEffect para fetch, `useNavigate` en vez de `<Link>` |
| PrivacySection | 113 | `eslint-disable any`, privacy defaults hardcoded (no fetch from API) |
| SaveButton | 62 | Sin violaciones — ejemplar |
| ToggleSwitch | 43 | Sin violaciones — ejemplar (role="switch", aria-checked) |
| PasswordStrengthIndicator | 65 | Sin violaciones — deberia compartirse cross-portal |

### Auth Pages

| Pagina | Lineas | Violaciones Clave |
|--------|--------|-------------------|
| PasswordResetPage | 205 | useEffect para token validation, setTimeout sin cleanup, naming |
| EmailVerificationPage | 99 | Legacy code comentado, naming, `<button>` deberia ser `<Link>` |

### Notification Pages

| Pagina | Lineas | Violaciones Clave |
|--------|--------|-------------------|
| **NotificationsPage** | **534** | 10 Zustand selectors, formatDate inline, custom dropdown sin ARIA |
| **NotificationPreferencesPage** | **425** | **INLINE STYLES** (~40 ocurrencias), emojis en vez de Lucide, named export |

### Dashboard Components (18 analizados)

| Componente | Lineas | Issues Clave |
|------------|--------|-------------|
| AchievementMilestones | 216 | >200 lineas, double export |
| BottomNavigation | 178 | `aria-currentStep` invalido (deberia ser `aria-current="page"`) |
| **EnhancedStatsGrid** | **369** | `eslint-disable any`, `React.ComponentType<any>` |
| **MissionsPanel** | **454** | Inline `MissionCard` de 140 lineas |
| ModuleGridCard | 186 | String template class concat en vez de `cn()` |
| **ModuleGridCardEnhanced** | **335** | Duplica 60% de ModuleGridCard |
| **ModulesSection** | **464** | Inline `ModuleCard` de 210 lineas |
| ProgressStats | 151 | `cursor-pointer` en stats no-interactivos |
| **RankProgressWidget** | **314** | `console.log` lineas 50-51, 56-57. MAYA_RANKS duplicado |
| **RecentActivityFeed** | **138** | **MOCK DATA** hardcoded — no production-ready |
| **RecentActivityPanel** | **366** | Inline `ActivityCard`/`ActivitySkeleton` |
| **ResponsiveLayout** | 231 | MEJOR accesibilidad (skip-to-content, role, aria-label, keyboard) |
| StatsGrid | 172 | Hover-only effects en non-interactive elements |
| QuickActionsWidget | 137 | Mejor accesibilidad de los 3 QuickActions |

### Gamification Components (6 analizados)

| Componente | Lineas | Issues Clave |
|------------|--------|-------------|
| **GamificationHero** | **383** | MAYA_RANKS duplicado (3ra copia) |
| **LeaderboardPreview** | **377** | Filter buttons sin `aria-pressed` |
| **MLCoinsSection** | **348** | Overlap con dashboard MLCoinsWidget |
| **RanksSection** | **480** | **MAS GRANDE**, mock data para requirements y rank history |
| AchievementsPreview | 272 | Cards sin `role="button"` ni keyboard handler |
| **StreaksMissionsSection** | **346** | `console.log` + claim button permanently disabled |

---

## Issues Transversales (Cross-Cutting)

### 1. React Query Adoption: 0/17 paginas usan React Query correctamente
Solo DashboardComplete lo usa parcialmente via `useDashboardData`. Las demas usan:
- Raw useState+useEffect (8 paginas)
- Zustand para server state (3 paginas)
- Mock data hardcoded (2 paginas)
- Mixed patterns (4 paginas)

### 2. ADR-030 Naming: 0/17 paginas cumplen
Todas retienen sufijo "Page" o tienen nombres vestigiales.

### 3. Auth Import Inconsistencia
3 patrones diferentes usados:
- `@/app/providers/AuthContext` (canonica) — ModuleDetailPage, SettingsPage, AchievementsPage
- `@/features/auth/hooks/useAuth` — MissionsPage, AssignmentsPage, DashboardComplete
- `@/features/auth/store/authStore` (directa) — LearningPage

### 4. `eslint-disable @typescript-eslint/no-explicit-any` en 6 archivos
- ProfileSection, AccountSection, NotificationsSection, PrivacySection (root cause: `(error as any).response?.data?.message`)
- InventoryPage (data transformation)
- EnhancedStatsGrid (`React.ComponentType<any>`)

### 5. MAYA_RANKS duplicado en 3+ archivos
Diferentes estructuras en RankProgressWidget, GamificationHero, RanksSection.

### 6. `getRarityColor` duplicado en ShopPage + InventoryPage

### 7. `statusConfig` duplicado en AssignmentsPage + AssignmentDetailPage + 6 admin files

### 8. GamifiedHeader + logout duplicado en todas las paginas
