---
title: Student Portal Hooks — Resumen, Matriz de Dependencias y Referencias
status: activo
last_updated: "2026-02-28"
---

## Resumen de Exportaciones

El archivo `index.ts` exporta los siguientes hooks:

```typescript
// Gestos
export { useSwipeGesture, useSwipeableElement } from './useSwipeGesture';

// Responsive
export {
  useResponsiveLayout,
  useMediaQuery,
  useKeyboardShortcuts,
  type Breakpoint,
  type Orientation,
} from './useResponsiveLayout';

// Dashboard Data
export {
  useDashboardData,
  dashboardKeys,
  type MLCoinsData,
  type RankData,
  type AchievementData,
  type ProgressData,
} from './useDashboardData';

// Exercise State
export { useExerciseState } from './useExerciseState';
export type { Exercise, ExerciseAttempt, ExerciseState } from './useExerciseState';

// Auto-save
export { useExerciseAutoSave } from './useExerciseAutoSave';
export type {
  UseExerciseAutoSaveOptions,
  AutoSaveState,
  UseExerciseAutoSaveReturn,
} from './useExerciseAutoSave';

// Classroom
export { useUserClassroom } from './useUserClassroom';

// Modules
export { useUserModules, userModulesKeys, type UserModuleData } from './useUserModules';
```

**Hooks NO exportados en barrel (importar directamente):**
- `useGamificationData` (deprecado)
- `useAchievementsEnhanced`
- `useRecentActivities`
- `useExercisePowerUps`

---

## Matriz de Dependencias

| Hook | React Query | Zustand | localStorage | API Client | useAuth |
|------|:-----------:|:-------:|:------------:|:----------:|:-------:|
| useDashboardData | X | | | X | X |
| useUserClassroom | | | | X | |
| useUserModules | X | | | X | X |
| useRecentActivities | | | | X | X |
| useExerciseState | | | X | | |
| useExerciseAutoSave | | | X | X | |
| useResponsiveLayout | | | | | |
| useMediaQuery | | | | | |
| useKeyboardShortcuts | | | | | |
| useSwipeGesture | | | | | |
| useAchievementsEnhanced | | X | X | | |
| useExercisePowerUps | | X | | X | |
| useProfileData | | X | | | |
| useAvatarUpdate | | X | | X | |

---

## Referencias

- **Tarea origen:** TASK-2026-01-20-AUDITORIA-ANALISIS-PORTALES (P2-1)
- **Ubicacion hooks:** `/apps/frontend/src/apps/student/hooks/`
- **API Client:** `/apps/frontend/src/services/api/apiClient.ts`
- **Auth hook:** `/apps/frontend/src/features/auth/hooks/useAuth.ts`
- **Gamification store:** `/apps/frontend/src/features/gamification/social/store/`

---

**Documento generado:** 2026-01-20
**Actualizado:** 2026-02-18 (v1.1.0: +useProfileData, +useAvatarUpdate)
**Cobertura:** 14/14 hooks (100%)
**Lineas de documentacion:** ~920
