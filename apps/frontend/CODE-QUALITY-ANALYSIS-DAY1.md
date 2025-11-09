# Code Quality Analysis - Day 1
## Analysis Date: Sun Nov  9 10:49:34 CST 2025

## 1. TypeScript 'any' Types Analysis

### Total 'any' occurrences:
```
204
```

### Top 10 files with most 'any' types:
```
     21 src/shared/utils/exerciseAdapter.ts
     12 src/services/api/apiErrorHandler.ts
     10 src/apps/teacher/hooks/useTeacherDashboard.ts
      6 src/features/notifications/store/notificationsStore.ts
      5 src/pages/teacher/ExerciseCreator.tsx
      5 src/features/gamification/leaderboard/LiveLeaderboard.test.tsx
      5 src/apps/student/hooks/useExerciseState.ts
      4 src/services/api/apiInterceptors.ts
      4 src/features/notifications/hooks/useWebSocket.ts
      4 src/features/missions/store/missionsStore.ts
```

### Breakdown by pattern:

**onProgressUpdate callbacks:**
```
10
```

**Catch block errors:**
```
48
```

**Function parameters:**
```
102
```

**Object/Array types:**
```
0
```

## 2. File Statistics

### TypeScript/TSX files count:
```
706
```

### Total lines of code:
```
95801
```

## 3. Code Complexity Indicators

### Files over 500 lines:
```
    650 src/features/progress/api/progressAPI.ts
    567 src/features/content/api/contentAPI.ts
    543 src/features/auth/api/authAPI.ts
    652 src/features/auth/__tests__/authStore.test.ts
    967 src/features/auth/components/__tests__/RegisterForm.test.tsx
    553 src/features/auth/components/__tests__/LoginForm.test.tsx
    524 src/features/auth/components/RegisterForm.tsx
    589 src/features/missions/store/__tests__/missionsStore.test.ts
    864 src/features/gamification/api/gamificationAPI.ts
    587 src/features/gamification/ranks/types/ranksTypes.ts
    542 src/features/gamification/ranks/__tests__/RanksIntegration.test.tsx
    881 src/features/gamification/ranks/store/__tests__/ranksStore.test.ts
    637 src/features/gamification/ranks/store/ranksStore.ts
    603 src/features/gamification/ranks/mockData/ranksMockData.ts
   1032 src/features/gamification/social/api/socialAPI.ts
    982 src/features/gamification/social/__tests__/AchievementsIntegration.test.tsx
    692 src/features/gamification/social/store/__tests__/achievementsStore.test.ts
    580 src/features/gamification/social/mockData/achievementsMockData.ts
    675 src/features/gamification/__tests__/DashboardIntegration.test.tsx
    516 src/features/gamification/economy/api/economyAPI.ts
```

### console.log occurrences (should be removed):
```
122
```

### TODO/FIXME comments:
```
55
```
