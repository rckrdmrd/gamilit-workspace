# 04-ESTIMACION-ARCHIVOS.md — Files to Create and Modify

**Task:** TASK-2026-02-18-STUDENT-PORTAL-ANALYSIS
**Fecha:** 2026-02-18

---

## Resumen

| Categoria | Archivos Nuevos | Archivos Modificados | Archivos Eliminados |
|-----------|:--------------:|:-------------------:|:-------------------:|
| Fase 0: Shared Utilities | 7 | 0 | 0 |
| Fase 1: P0 Bugs | 17 | 5 | 2 |
| Fase 2: P1 Core Pages | 73 | 15 | 0 |
| Fase 3: P2 Engagement | 47 | 10 | 3 |
| Fase 4: Cleanup | 0 | 25 | 0 |
| **TOTAL** | **144** | **55** | **5** |

---

## Fase 0: Shared Utilities (7 archivos nuevos)

```
apps/frontend/src/
  shared/
    utils/
      error.util.ts                          (NEW ~25 lines)  — extractApiErrorMessage()
      rarityColors.ts                        (NEW ~30 lines)  — getRarityGradient, getRarityBadgeClass
    constants/
      maya-ranks.ts                          (NEW ~40 lines)  — ALL_MAYA_RANKS canonical
      assignmentStatus.ts                    (NEW ~40 lines)  — ASSIGNMENT_STATUS_CONFIG
      notification-config.ts                 (NEW ~25 lines)  — icon/color/label maps
    components/
      base/
        TabBar.tsx                           (NEW ~60 lines)  — Accessible tab component
    hooks/
      useBranding.ts                         (NEW ~15 lines)  — BrandingContext with fallback
```

---

## Fase 1: P0 — Bugs Funcionales (17 nuevos, 5 modificados, 2 eliminados)

### 1.1 LearningPage Refactor

```
apps/frontend/src/apps/student/pages/
  Learning.tsx                               (NEW ~30 lines)  — thin shell (replaces LearningPage.tsx)
  learning/
    hooks/
      useLearningModules.ts                  (NEW ~60 lines)  — React Query hook
      useLearningStats.ts                    (NEW ~15 lines)  — derived stats
    components/
      LearningHero.tsx                       (NEW ~40 lines)
      LearningSearchBar.tsx                  (NEW ~20 lines)
      ModuleCard.tsx                         (NEW ~80 lines)
      LearningEmptySearch.tsx                (NEW ~15 lines)
    constants/
      modules.constants.ts                   (NEW ~50 lines)  — static module metadata
```
**Modified:** `LearningPage.tsx` → rename to `Learning.tsx`, `App.tsx` route update
**Deleted:** N/A (in-place rename)

### 1.2 AchievementsPage Refactor

```
apps/frontend/src/apps/student/pages/
  Achievements.tsx                           (NEW ~35 lines)  — thin shell
  achievements/
    hooks/
      useAchievementsData.ts                 (NEW ~45 lines)  — React Query fetch
      useAchievementsFilter.ts               (NEW ~80 lines)  — filter + sort
      useAchievementsSummary.ts              (NEW ~50 lines)  — typed summary
      useAchievementModal.ts                 (NEW ~40 lines)  — modal + claim
    components/
      AchievementsLayout.tsx                 (NEW ~80 lines)  — composition
      AchievementsSummaryStats.tsx           (NEW ~30 lines)
      EarnedAchievementsSection.tsx          (NEW ~30 lines)
      PendingAchievementsSection.tsx         (NEW ~60 lines)
      HiddenAchievementsSection.tsx          (NEW ~25 lines)
```
**Modified:** `App.tsx` (update import/route)
**Deleted:** `src/pages/AchievementsPage.tsx` (relocated)

### 1.3 Delete Mock Component

**Deleted:** `apps/frontend/src/apps/student/components/dashboard/RecentActivityFeed.tsx`
**Modified:** `apps/frontend/src/apps/student/components/dashboard/index.ts` (remove export)

---

## Fase 2: P1 — Core Pages (73 nuevos, 15 modificados)

### 2.1 ShopPage (10 archivos nuevos)

```
apps/frontend/src/apps/student/pages/
  Shop.tsx                                   (NEW ~30 lines)
  shop/
    hooks/
      useShopItems.ts                        (NEW ~80 lines)
      useShopPurchase.ts                     (NEW ~40 lines)
      useShopFilters.ts                      (NEW ~25 lines)
    components/
      ShopCategoryTabs.tsx                   (NEW ~50 lines)
      ShopSearchBar.tsx                      (NEW ~30 lines)
      ShopItemCard.tsx                       (NEW ~60 lines)
      ShopItemsGrid.tsx                      (NEW ~40 lines)
      PurchaseConfirmModal.tsx               (NEW ~80 lines)
      ShopBalanceDisplay.tsx                 (NEW ~20 lines)
```

### 2.2 InventoryPage (12 archivos nuevos)

```
apps/frontend/src/apps/student/pages/
  Inventory.tsx                              (NEW ~35 lines)
  inventory/
    hooks/
      useInventoryItems.ts                   (NEW ~60 lines)
      useActivePowerUps.ts                   (NEW ~30 lines)
      usePowerUpActivation.ts                (NEW ~45 lines)
      useInventoryFilters.ts                 (NEW ~20 lines)
    components/
      InventoryStatsGrid.tsx                 (NEW ~50 lines)
      ActivePowerUpsBanner.tsx               (NEW ~35 lines)
      InventoryTabs.tsx                      (NEW ~40 lines)
      InventoryItemCard.tsx                  (NEW ~70 lines)
      InventoryItemsGrid.tsx                 (NEW ~50 lines)
      ActivePowerUpsList.tsx                 (NEW ~50 lines)
      PowerUpActivateModal.tsx               (NEW ~60 lines)
```

### 2.3 ModuleDetailPage (14 archivos nuevos)

```
apps/frontend/src/apps/student/pages/
  ModuleDetail.tsx                           (NEW ~30 lines)
  module-detail/
    hooks/
      useModuleDetailQuery.ts                (NEW ~80 lines)
      useModuleProgress.ts                   (NEW ~20 lines)
    components/
      ModuleDetailLayout.tsx                 (NEW ~60 lines)
      ModuleHeader.tsx                       (NEW ~50 lines)
      ModuleInfoCard.tsx                     (NEW ~30 lines)
      ModuleStatsGrid.tsx                    (NEW ~50 lines)
      ModuleLearningObjectives.tsx           (NEW ~25 lines)
      ModuleCompetenciesSkills.tsx           (NEW ~45 lines)
      ModulePrerequisites.tsx                (NEW ~20 lines)
      ModuleRangoMaya.tsx                    (NEW ~30 lines)
      ModuleExercisesGrid.tsx                (NEW ~40 lines)
      ExerciseCard.tsx                       (NEW ~140 lines)
      ModuleDetailSkeleton.tsx               (NEW ~15 lines)
    constants/
      difficulty.constants.ts                (NEW ~30 lines)
```

### 2.4 EnhancedProfilePage (9 archivos nuevos)

```
apps/frontend/src/apps/student/pages/
  Profile.tsx                                (NEW ~50 lines)
  profile/
    hooks/
      useProfileData.ts                      (NEW ~50 lines)
      useAvatarUpdate.ts                     (NEW ~30 lines)
      useProfileStats.ts                     (NEW ~40 lines)
    components/
      ProfileHero.tsx                        (NEW ~75 lines)
      ProfileTabs.tsx                        (NEW ~30 lines)
      OverviewTab.tsx                        (NEW ~35 lines)
      StatsTab.tsx                           (NEW ~105 lines)  — lazy loaded
      RankHistoryTab.tsx                     (NEW ~100 lines)
      AchievementsTab.tsx                    (NEW ~65 lines)
```

### 2.5 MissionsPage (4 archivos nuevos)

```
apps/frontend/src/apps/student/pages/
  Missions.tsx                               (NEW ~30 lines)
  missions/
    hooks/
      useMissionsPage.ts                     (NEW ~80 lines)
    components/
      CompletedBanner.tsx                    (NEW ~20 lines)
      MissionsErrorAlert.tsx                 (NEW ~15 lines)
  shared/hooks/
    useTabUrlSync.ts                         (NEW ~25 lines)  — reusable
```
**Modified:** `features/gamification/missions/hooks/useMissions.ts` (React Query migration)

### 2.6 Assignments (10 archivos nuevos)

```
apps/frontend/src/apps/student/pages/
  Assignments.tsx                            (NEW ~40 lines)
  AssignmentDetail.tsx                       (NEW ~35 lines)
  assignments/
    hooks/
      useStudentAssignments.ts               (NEW ~25 lines)
      useGradesSummary.ts                    (NEW ~20 lines)
      useAssignmentDetail.ts                 (NEW ~25 lines)
      useAssignmentStatus.ts                 (NEW ~20 lines)
    components/
      AssignmentCard.tsx                     (NEW ~77 lines)
      GradesSummaryCard.tsx                  (NEW ~58 lines)
      AssignmentFilterTabs.tsx               (NEW ~29 lines)
      AssignmentHeaderCard.tsx               (NEW ~70 lines)
```

### 2.7 NotificationsPage (6 archivos nuevos)

```
apps/frontend/src/apps/student/pages/
  Notifications.tsx                          (NEW ~40 lines)
  notifications/
    hooks/
      useNotificationsPage.ts                (NEW ~60 lines)
    components/
      NotificationFilterBar.tsx              (NEW ~80 lines)
      NotificationCard.tsx                   (NEW ~70 lines)
      NotificationEmptyState.tsx             (NEW ~20 lines)
      NotificationList.tsx                   (NEW ~30 lines)
```

### 2.8 NotificationPreferencesPage (4 archivos nuevos)

```
apps/frontend/src/apps/student/pages/
  NotificationPreferences.tsx                (NEW ~30 lines)
  notification-preferences/
    hooks/
      useNotificationPreferences.ts          (NEW ~50 lines)
    components/
      PreferencesTable.tsx                   (NEW ~120 lines)  — Tailwind rewrite
      ChannelLegend.tsx                      (NEW ~30 lines)
      UnsavedChangesBar.tsx                  (NEW ~40 lines)
```

### 2.9 AccountSection (4 archivos nuevos)

```
apps/frontend/src/apps/student/pages/settings/
  account/
    PasswordChangeForm.tsx                   (NEW ~120 lines)
    EmailVerificationModal.tsx               (NEW ~80 lines)
    hooks/
      usePasswordChange.ts                   (NEW ~40 lines)
      useEmailVerification.ts                (NEW ~35 lines)
```

---

## Fase 3: P2 — Engagement Features (47 nuevos, 3 eliminados)

### 3.1 LeaderboardPage (10 archivos nuevos)

```
apps/frontend/src/apps/student/pages/
  Leaderboard.tsx                            (NEW ~40 lines)
  leaderboard/
    hooks/
      useLeaderboardPage.ts                  (NEW ~50 lines)
      useCategoryBreakdown.ts                (NEW ~35 lines)
      useAutoScroll.ts                       (NEW ~20 lines)
    components/
      UserPositionCard.tsx                   (NEW ~70 lines)
      LeaderboardStatsRow.tsx                (NEW ~60 lines)
      LeaderboardTable.tsx                   (NEW ~50 lines)
      CategoryBreakdownPanel.tsx             (NEW ~40 lines)
      FriendsMiniLeaderboard.tsx             (NEW ~45 lines)
      LeaderboardTipsPanel.tsx               (NEW ~35 lines)
      LeaderboardFiltersHeader.tsx           (NEW ~50 lines)
```

### 3.2 FriendsPage (10 archivos nuevos)

```
apps/frontend/src/apps/student/pages/
  Friends.tsx                                (NEW ~40 lines)
  friends/
    hooks/
      useFilteredFriends.ts                  (NEW ~25 lines)
      useFriendActions.ts                    (NEW ~40 lines)
    components/
      FriendsStatsOverview.tsx               (NEW ~50 lines)
      FriendsTabs.tsx                        (NEW ~50 lines)
      FriendsListTab.tsx                     (NEW ~80 lines)
      FriendCard.tsx                         (NEW ~65 lines)
      FriendRequestsTab.tsx                  (NEW ~70 lines)
      FindFriendsTab.tsx                     (NEW ~75 lines)
      ActivityFeedTab.tsx                    (NEW ~60 lines)
```

### 3.3 GuildsPage (13 archivos nuevos)

```
apps/frontend/src/apps/student/pages/
  Guilds.tsx                                 (NEW ~45 lines)
  guilds/
    hooks/
      useGuildActions.ts                     (NEW ~50 lines)
      useCreateGuildForm.ts                  (NEW ~40 lines)
      useFilteredGuilds.ts                   (NEW ~20 lines)
    components/
      GuildStatsOverview.tsx                 (NEW ~50 lines)
      GuildTabs.tsx                          (NEW ~45 lines)
      DiscoverGuildsTab.tsx                  (NEW ~70 lines)
      GuildCard.tsx                          (NEW ~75 lines)
      MyGuildTab.tsx                         (NEW ~80 lines)
      GuildMemberCard.tsx                    (NEW ~30 lines)
      ChallengesTab.tsx                      (NEW ~50 lines)
      ChallengeCard.tsx                      (NEW ~65 lines)
      CreateGuildModal.tsx                   (NEW ~70 lines)
      GuildStatusBadge.tsx                   (NEW ~20 lines)
```

### 3.4 DashboardComplete (4 archivos nuevos)

```
apps/frontend/src/apps/student/pages/
  Dashboard.tsx                              (NEW ~40 lines)
  dashboard/
    hooks/
      useDashboardTransforms.ts              (NEW ~50 lines)
    components/
      DashboardWelcome.tsx                   (NEW ~15 lines)
      DashboardErrorBanner.tsx               (NEW ~15 lines)
      DashboardLayout.tsx                    (NEW ~50 lines)
```

### 3.5 Dashboard Component Consolidation (~5 nuevos, 3 eliminados)

```
apps/frontend/src/apps/student/components/dashboard/
  MissionCard.tsx                            (NEW ~140 lines)  — extracted from MissionsPanel
  ModuleCard.tsx                             (NEW ~210 lines)  — extracted from ModulesSection
  ActivityCard.tsx                           (NEW ~60 lines)   — extracted from RecentActivityPanel
```
**Merge:**
- `ModuleGridCard + ModuleGridCardEnhanced` → single `ModuleGridCard` with variant prop
- `StatsGrid + EnhancedStatsGrid` → single `StatsGrid` with variant prop

**Deleted:**
- `ModuleGridCardEnhanced.tsx` (merged into ModuleGridCard)
- `RecentActivityFeed.tsx` (mock data, replaced by RecentActivityPanel)

### 3.6 Gamification Component Refactor (~5 nuevos)

```
apps/frontend/src/apps/student/components/gamification/
  sub-components/
    MLCoinsBalanceCard.tsx                   (NEW ~40 lines)   — shared by Widget + Section
    TransactionList.tsx                      (NEW ~50 lines)   — shared by Widget + Section
    RankShowcase.tsx                         (NEW ~80 lines)   — extracted from RanksSection
    RankLadder.tsx                           (NEW ~100 lines)  — extracted from RanksSection
    RankHistory.tsx                          (NEW ~60 lines)   — extracted from RanksSection
```

---

## Fase 4: Cleanup (25 archivos modificados, 0 nuevos)

### 4.1 Auth Import Unification
**Archivos modificados:** 6+ pages that import from wrong auth source

### 4.2 ADR-030 File Renames
**17 renames** (see 02-PLAN-REFACTORIZACION.md section 4.2)
**Modified:** `App.tsx` (all route imports)

### 4.3 Console.log Removal
**Archivos modificados:** 5 files

### 4.4 Legacy Code Removal
**Modified:** `EmailVerificationPage.tsx` (remove legacy comment block)

---

## Lineas de Codigo Estimadas

| Fase | Lineas Nuevas | Lineas Eliminadas (de monolitos) | Lineas Netas |
|------|:------------:|:-------------------------------:|:------------:|
| Fase 0 | ~235 | 0 | +235 |
| Fase 1 | ~620 | ~950 (LearningPage + AchievementsPage) | -330 |
| Fase 2 | ~3,540 | ~4,200 (9 pages refactored) | -660 |
| Fase 3 | ~2,640 | ~3,100 (4 pages + components) | -460 |
| Fase 4 | ~0 | ~50 (cleanup) | -50 |
| **TOTAL** | **~7,035** | **~8,300** | **-1,265** |

**Resultado neto: ~1,265 lineas MENOS** a pesar de mejor estructura, porque:
- Eliminacion de codigo duplicado (getRarityColor, statusConfig, MAYA_RANKS, error patterns)
- Eliminacion de mock data y console.logs
- Eliminacion de dead code (cart feature, legacy comments)
- Mejor composicion (shared TabBar, ErrorUtil, etc.)
