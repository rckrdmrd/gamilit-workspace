# 02-PLAN-REFACTORIZACION.md — Prioritized Refactoring Plan

**Task:** TASK-2026-02-18-STUDENT-PORTAL-ANALYSIS
**Fecha:** 2026-02-18

---

## Estrategia General

Refactorizar el portal de estudiantes siguiendo el **Gold Standard** establecido por:
- `ExercisePage.tsx` (33 lineas) — Thin Shell + Provider + Layout
- `SettingsPage.tsx` (79 lineas) — Tab/Section decomposition
- `ExerciseContext.tsx` — Context composition pattern
- `useExerciseData.ts` — Hook extraction pattern

**Patron target:** Cada pagina debe ser <100 lineas, con logica en hooks, presentacion en componentes, y server state en React Query.

---

## Fase 0: Shared Utilities (Pre-requisito)

Crear utilidades compartidas que desbloquean multiples refactorizaciones.

### 0.1 Error Extraction Utility
**Archivo:** `apps/frontend/src/shared/utils/error.util.ts`
**Impacto:** Elimina `eslint-disable no-explicit-any` de 5+ archivos
```
extractApiErrorMessage(error: unknown, fallback: string): string
```
Reemplaza el patron `(error as any).response?.data?.message` repetido 10+ veces.

### 0.2 Rarity Colors Utility
**Archivo:** `apps/frontend/src/shared/utils/rarityColors.ts`
**Impacto:** Elimina duplicacion ShopPage + InventoryPage
```
getRarityGradient(rarity: ItemRarity): string
getRarityBadgeClass(rarity: ItemRarity): string
```

### 0.3 MAYA_RANKS Canonical Constant
**Archivo:** `apps/frontend/src/shared/constants/maya-ranks.ts`
**Impacto:** Elimina 3 copias duplicadas con estructuras diferentes
```
ALL_MAYA_RANKS: MayaRank[] — superset of all fields
```

### 0.4 Assignment Status Config
**Archivo:** `apps/frontend/src/shared/constants/assignmentStatus.ts`
**Impacto:** Elimina duplicacion en 2 student pages + 6 admin files
```
ASSIGNMENT_STATUS_CONFIG: Record<AssignmentStatus, StatusConfig>
```

### 0.5 Shared Tab Components
**Archivo:** `apps/frontend/src/shared/components/base/TabBar.tsx`
**Impacto:** Accessible tabs para 10+ paginas
```
<TabBar tabs={tabs} activeTab={current} onTabChange={setTab} />
```
Con `role="tablist"`, `role="tab"`, `aria-selected`, keyboard navigation.

### 0.6 useBranding Hook
**Archivo:** `apps/frontend/src/shared/hooks/useBranding.ts`
**Impacto:** Reemplaza BrandingContext access con fallback en 2+ paginas

### 0.7 Promote Reusable Settings Components
- `SaveButton.tsx` → `@shared/components/base/SaveButton.tsx`
- `ToggleSwitch.tsx` → `@shared/components/base/ToggleSwitch.tsx`
- `PasswordStrengthIndicator.tsx` → `@shared/components/PasswordStrengthIndicator.tsx`

**Estimacion Fase 0:** 7 archivos nuevos, ~250 lineas totales

---

## Fase 1: P0 — Bugs Funcionales y Deuda Critica

### 1.1 LearningPage.tsx (357→~30 lineas) — BUG: Mock Data
**Problema:** Usuarios ven progreso falso (75%/30%/0%/0%/0%) hardcoded.
**Solucion:**
1. Crear `hooks/useLearningModules.ts` (~60 lineas) — React Query hook usando `useUserModules` existente
2. Crear `hooks/useLearningStats.ts` (~15 lineas) — derived stats con useMemo
3. Extraer `components/learning/LearningHero.tsx` (~40 lineas)
4. Extraer `components/learning/ModuleCard.tsx` (~80 lineas)
5. Extraer `components/learning/LearningSearchBar.tsx` (~20 lineas)
6. Mover static module metadata a `constants/modules.constants.ts` (~50 lineas)
7. Fix: usar `useAuth` en vez de `useAuthStore` directamente
8. Renombrar a `Learning.tsx`

**Archivos nuevos:** 6 | **Archivos modificados:** 2 (Learning, App.tsx route)

### 1.2 AchievementsPage.tsx (593→~35 lineas) — Peor Deuda Tecnica
**Problema:** 593 lineas, `as unknown as` cast, `window.location.reload()`, 13+ console.logs, ubicacion incorrecta.
**Solucion:**
1. MOVER de `src/pages/` a `src/apps/student/pages/achievements/`
2. Crear `hooks/useAchievementsData.ts` (~45 lineas) — React Query fetch
3. Crear `hooks/useAchievementsFilter.ts` (~80 lineas) — filter + sort + segregation
4. Crear `hooks/useAchievementsSummary.ts` (~50 lineas) — typed summary transform
5. Crear `hooks/useAchievementModal.ts` (~40 lineas) — modal state + claim
6. Extraer `components/AchievementsSummaryStats.tsx` (~30 lineas)
7. Extraer `components/EarnedAchievementsSection.tsx` (~30 lineas)
8. Extraer `components/PendingAchievementsSection.tsx` (~60 lineas)
9. Extraer `components/HiddenAchievementsSection.tsx` (~25 lineas)
10. Fix: Eliminar `window.location.reload()`, usar React Query refetch
11. Fix: Eliminar 13+ console.log
12. Fix: Reemplazar `as unknown as` con tipos correctos
13. Actualizar App.tsx route import (default export)
14. Renombrar a `Achievements.tsx`

**Archivos nuevos:** 10 | **Archivos modificados:** 2 (App.tsx, delete old file)

### 1.3 Delete RecentActivityFeed.tsx — Mock Component in Production
**Archivo:** `apps/frontend/src/apps/student/components/dashboard/RecentActivityFeed.tsx`
**Solucion:** Eliminar del barrel export + archivo. `RecentActivityPanel` es la version real.

**Archivos eliminados:** 1 | **Archivos modificados:** 1 (barrel)

**Estimacion Fase 1:** ~17 archivos nuevos, ~530 lineas totales

---

## Fase 2: P1 — Paginas Core de Alta Visita

### 2.1 ShopPage.tsx (632→~30 lineas)
1. Crear `hooks/useShopItems.ts` (~80 lineas) — React Query fetch + transform
2. Crear `hooks/useShopPurchase.ts` (~40 lineas) — mutation
3. Crear `hooks/useShopFilters.ts` (~25 lineas)
4. Extraer 7 componentes (ShopCategoryTabs, ShopSearchBar, ShopItemCard, ShopItemsGrid, PurchaseConfirmModal, ShopBalanceDisplay)
5. Eliminar dead cart feature code
6. Renombrar a `Shop.tsx`

**Archivos nuevos:** 10

### 2.2 InventoryPage.tsx (732→~35 lineas)
1. Crear `hooks/useInventoryItems.ts` (~60 lineas) — React Query
2. Crear `hooks/useActivePowerUps.ts` (~30 lineas) — React Query
3. Crear `hooks/usePowerUpActivation.ts` (~45 lineas) — mutation
4. Crear `hooks/useInventoryFilters.ts` (~20 lineas)
5. Extraer 8 componentes
6. Eliminar blanket eslint-disable
7. Renombrar a `Inventory.tsx`

**Archivos nuevos:** 12

### 2.3 ModuleDetailPage.tsx (627→~30 lineas)
1. Crear `hooks/useModuleDetailQuery.ts` (~80 lineas) — React Query parallel fetch
2. Crear `hooks/useModuleProgress.ts` (~20 lineas) — derived values
3. Extraer `ExerciseCard` a su propio archivo + 9 sub-componentes
4. Fix: Eliminar console.logs en useModuleDetail hook
5. Fix: Reemplazar `window.location.reload()` con refetch
6. Mover difficulty constants a `constants/difficulty.constants.ts`
7. Renombrar a `ModuleDetail.tsx`

**Archivos nuevos:** 14

### 2.4 EnhancedProfilePage.tsx (635→~50 lineas)
1. Crear `hooks/useProfileData.ts` (~50 lineas) — compose 4 stores
2. Crear `hooks/useAvatarUpdate.ts` (~30 lineas)
3. Crear `hooks/useProfileStats.ts` (~40 lineas) — useMemo
4. Extraer 6 componentes (ProfileHero, ProfileTabs, OverviewTab, StatsTab lazy, RankHistoryTab, AchievementsTab)
5. Fix: Eliminar `@ts-ignore`, tipar correctamente
6. Fix: Alinear gradient theme a detective pattern
7. Renombrar a `Profile.tsx`

**Archivos nuevos:** 9

### 2.5 MissionsPage.tsx (249→~30 lineas)
1. Crear `hooks/useMissionsPage.ts` (~80 lineas)
2. Crear `hooks/useTabUrlSync.ts` (~25 lineas) — reusable
3. Extraer 2 componentes (CompletedBanner, MissionsErrorAlert)
4. Migrar `useMissions` hook (513 lineas) a React Query (~200 lineas)
5. Renombrar a `Missions.tsx`

**Archivos nuevos:** 4 | **Archivos modificados:** 2

### 2.6 AssignmentsPage.tsx + AssignmentDetailPage.tsx (refactorizar juntos)
1. Extraer shared `constants/assignmentStatus.ts` (ya en Fase 0)
2. Extraer `AssignmentCard`, `GradesSummaryCard`, `FilterTabs` a archivos propios
3. Crear React Query hooks: `useStudentAssignments`, `useGradesSummary`, `useAssignmentDetail`
4. Fix: Alinear style a detective gradient (bg-gray-50 → orange gradient)
5. Fix: Pasar `gamificationData` a GamifiedHeader
6. Fix: AssignmentDetailPage bug — loading spinner permanente si id undefined
7. Renombrar ambos archivos sin sufijo "Page"

**Archivos nuevos:** 10 | **Archivos modificados:** 2

### 2.7 NotificationsPage.tsx (534→~40 lineas)
1. Crear `hooks/useNotificationsPage.ts`
2. Extraer NotificationFilterBar, NotificationCard, NotificationEmptyState
3. Mover formatDate a `@shared/utils/format.util.ts`
4. Mover icon/color maps a `@shared/constants/notification-config.ts`
5. Renombrar a `Notifications.tsx`

**Archivos nuevos:** 6

### 2.8 NotificationPreferencesPage.tsx (425→~30 lineas) — INLINE STYLES
1. **REWRITE COMPLETO** — migrar ~40 inline styles a Tailwind
2. Reemplazar emojis con Lucide icons
3. Crear hook `useNotificationPreferences()`
4. Extraer PreferencesTable, ChannelLegend, UnsavedChangesBar
5. Cambiar named export a default export
6. Renombrar a `NotificationPreferences.tsx`

**Archivos nuevos:** 4

### 2.9 AccountSection.tsx (357→~60 lineas)
1. Extraer `PasswordChangeForm` (~120 lineas) con hook `usePasswordChange`
2. Extraer `EmailVerificationModal` (~80 lineas) con hook `useEmailVerification`
3. Implementar focus trapping + proper ARIA en modal

**Archivos nuevos:** 4

**Estimacion Fase 2:** ~73 archivos nuevos, ~3,500 lineas totales

---

## Fase 3: P2 — Engagement Features

### 3.1 LeaderboardPage.tsx (546→~40 lineas)
1. Crear hooks: useLeaderboardPage, useCategoryBreakdown, useAutoScroll
2. Extraer 7 componentes
3. Fix: Migrar a DetectiveCard pattern
4. Renombrar a `Leaderboard.tsx`

**Archivos nuevos:** 10

### 3.2 FriendsPage.tsx (591→~40 lineas)
1. Crear hooks: useFilteredFriends, useFriendActions
2. Extraer 8 componentes por tab
3. Fix: Reemplazar `confirm()` con ConfirmationModal
4. Fix: Agregar loading/error states
5. Renombrar a `Friends.tsx`

**Archivos nuevos:** 10

### 3.3 GuildsPage.tsx (684→~45 lineas)
1. Crear hooks: useGuildActions, useCreateGuildForm, useFilteredGuilds
2. Extraer 10 componentes
3. Fix: Reemplazar `alert()`/`confirm()` con modales accesibles
4. Renombrar a `Guilds.tsx`

**Archivos nuevos:** 13

### 3.4 DashboardComplete.tsx (241→~40 lineas)
1. Crear `hooks/useDashboardTransforms.ts` (~50 lineas) con useMemo
2. Extraer DashboardWelcome, DashboardErrorBanner, DashboardLayout
3. Renombrar a `Dashboard.tsx`

**Archivos nuevos:** 4

### 3.5 Consolidar Dashboard Components Oversized
- MissionsPanel (454 lineas): Extraer MissionCard a su propio archivo
- ModulesSection (464 lineas): Extraer ModuleCard a su propio archivo
- ModuleGridCard + ModuleGridCardEnhanced: Merge en uno
- StatsGrid + EnhancedStatsGrid: Merge con variant prop
- QuickActionsCard + QuickActionsWidget: Consolidar

**Archivos nuevos:** ~5 | **Archivos eliminados:** ~3

### 3.6 Consolidar Gamification Components
- MAYA_RANKS: Usar shared constant (Fase 0.3)
- MLCoinsSection + MLCoinsWidget: Extraer shared sub-components
- RanksSection (480 lineas): Descomponer + reemplazar mock data

**Archivos nuevos:** ~5

**Estimacion Fase 3:** ~47 archivos nuevos, ~2,500 lineas totales

---

## Fase 4: Auth Import Unification + Naming Cleanup

### 4.1 Unificar Auth Import
Todas las paginas deben usar `useAuth` de `@/app/providers/AuthContext` (canonica).
**Archivos a modificar:** 6+ paginas

### 4.2 Renombrar Archivos (ADR-030)
Renombrar todos los archivos "Page" y actualizar imports en App.tsx:
| Actual | Nuevo |
|--------|-------|
| ShopPage → Shop | InventoryPage → Inventory |
| LeaderboardPage → Leaderboard | FriendsPage → Friends |
| GuildsPage → Guilds | EnhancedProfilePage → Profile |
| ModuleDetailPage → ModuleDetail | LearningPage → Learning |
| DashboardComplete → Dashboard | MissionsPage → Missions |
| AchievementsPage → Achievements | AssignmentsPage → Assignments |
| AssignmentDetailPage → AssignmentDetail | PasswordResetPage → PasswordReset |
| EmailVerificationPage → EmailVerification | NotificationsPage → Notifications |
| NotificationPreferencesPage → NotificationPreferences | SettingsPage → Settings |

**Archivos a modificar:** 17 pages + App.tsx

### 4.3 Eliminar console.log en Production
**Archivos:** AchievementsPage, useModuleDetail, RankProgressWidget, StreaksMissionsSection, + verificar otros

### 4.4 Eliminar Legacy Code
- EmailVerificationPage: Borrar bloque de comentario legacy (lineas 85-98)
- Eliminar `RecentActivityFeed.tsx` (mock data)

---

## Resumen de Esfuerzo

| Fase | Archivos Nuevos | Archivos Modificados | Complejidad | Duracion Estimada |
|------|----------------|---------------------|-------------|-------------------|
| 0: Shared Utilities | 7 | 0 | Baja | 1 sprint |
| 1: P0 Bugs | 17 | 5 | Media | 1 sprint |
| 2: P1 Core Pages | 73 | 15 | Alta | 2-3 sprints |
| 3: P2 Engagement | 47 | 10 | Media | 2 sprints |
| 4: Cleanup | 0 | 25 | Baja | 1 sprint |
| **Total** | **~144** | **~55** | | **7-8 sprints** |

---

## Orden de Ejecucion Recomendado

```
Sprint 2: Fase 0 (shared utils) + Fase 1.1 (LearningPage fix)
Sprint 3: Fase 1.2 (AchievementsPage) + Fase 1.3 (delete mock)
Sprint 4: Fase 2.1-2.2 (Shop + Inventory)
Sprint 5: Fase 2.3-2.4 (ModuleDetail + Profile)
Sprint 6: Fase 2.5-2.6 (Missions + Assignments)
Sprint 7: Fase 2.7-2.9 (Notifications + AccountSection)
Sprint 8: Fase 3 (Leaderboard + Social + Dashboard + Component consolidation)
Sprint 9: Fase 4 (Auth unification + Naming + Cleanup)
```
