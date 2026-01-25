# SPEC-PROGRESS - Student Portal Progress Tracking

**Version:** 1.0.0
**Fecha:** 2026-01-24
**Autor:** Claude Code (Auditoría Automatizada)
**Estado:** COMPLETO

---

## 1. Vision General

El sistema de seguimiento de progreso registra y visualiza el avance educativo:
- Progreso por módulo y ejercicio
- Estadísticas de tiempo y rendimiento
- Sistema de rachas (streaks)
- Historial de actividades

---

## 2. Páginas Relacionadas

| Página | Archivo | Descripción |
|--------|---------|-------------|
| Module Detail | `pages/ModuleDetailPage.tsx` | Detalle de módulo con ejercicios |
| Dashboard | `pages/DashboardComplete.tsx` | Resumen de progreso |
| Enhanced Profile | `pages/EnhancedProfilePage.tsx` | Estadísticas avanzadas |

---

## 3. Componentes

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| ModuleProgressCard | `components/progress/ModuleProgressCard.tsx` | Card de progreso por módulo |
| ProgressStats | `components/dashboard/ProgressStats.tsx` | Grid de estadísticas |
| EnhancedStatsGrid | `components/dashboard/EnhancedStatsGrid.tsx` | Stats con milestones |

---

## 4. APIs Consumidas

### 4.1 Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/progress/users/{userId}/summary` | GET | Resumen de progreso |
| `/educational/users/{userId}/modules` | GET | Módulos con progreso |
| `/educational/users/{userId}/activities` | GET | Actividades recientes |

### 4.2 Response Types

```typescript
interface ProgressData {
  totalModules: number;
  completedModules: number;
  totalExercises: number;
  completedExercises: number;
  averageScore: number;        // 0-100
  totalTimeSpent: number;      // segundos
  currentStreak: number;       // días
  longestStreak: number;       // días
}

interface UserModuleData {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'in_progress' | 'available' | 'locked' | 'backlog';
  progress: number;            // 0-100
  totalExercises: number;
  completedExercises: number;
  estimatedTime: number;       // minutos
  xpReward: number;
  icon: string;
  category: string;
}

interface ActivityData {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  metadata: {
    xp?: number;
    ml?: number;
    exerciseName?: string;
    moduleName?: string;
    achievementName?: string;
    streakDays?: number;
    score?: number;
  };
  category: string;
}

type ActivityType =
  | 'exercise_completed'
  | 'achievement_unlocked'
  | 'streak_milestone'
  | 'level_up'
  | 'module_completed'
  | 'badge_earned'
  | 'social_interaction'
  | 'daily_goal_met';
```

---

## 5. Sistema de Rachas

### 5.1 Definición

Una **racha** se mantiene cuando el usuario completa al menos una actividad educativa por día consecutivo.

### 5.2 Milestones

| Días | Icono | Descripción | Reward |
|------|-------|-------------|--------|
| 3 | 🔥 | Racha inicial | 10 ML |
| 7 | ⚡ | Una semana | 25 ML |
| 14 | 🌟 | Dos semanas | 50 ML |
| 30 | ✨ | Un mes | 100 ML |
| 100 | 🏆 | Centenario | 500 ML |

### 5.3 Visualización

```typescript
const getStreakEmoji = (days: number): string => {
  if (days >= 100) return '🏆';
  if (days >= 30) return '✨';
  if (days >= 14) return '🌟';
  if (days >= 7) return '⚡';
  if (days >= 3) return '🔥';
  return '📚';
};
```

---

## 6. Estados de Módulo

| Estado | Descripción | UI |
|--------|-------------|-----|
| locked | Prerequisitos no cumplidos | Gris, no clickeable |
| available | Listo para comenzar | Color, "Comenzar Módulo" |
| in_progress | En curso | Color, progress bar, "Continuar" |
| backlog | En construcción | Amber, "En Construcción" |
| completed | Terminado | Color, "Revisar Módulo" |

---

## 7. Cálculos de Estadísticas

### 7.1 Progreso de Módulo

```typescript
const moduleProgress = (completedExercises / totalExercises) * 100;
```

### 7.2 Progreso General

```typescript
const overallProgress = (completedModules / totalModules) * 100;
```

### 7.3 Tiempo Formateado

```typescript
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};
```

---

## 8. Hooks

| Hook | Archivo | Descripción |
|------|---------|-------------|
| useDashboardData | `hooks/useDashboardData.ts` | Incluye ProgressData |
| useUserModules | `hooks/useUserModules.ts` | Módulos con progreso |
| useRecentActivities | `hooks/useRecentActivities.ts` | Actividades recientes |

---

## 9. Visualizaciones

### 9.1 Progress Bar

```typescript
// Tailwind classes
<div className="bg-gray-200 rounded-full h-2">
  <div
    className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full"
    style={{ width: `${progress}%` }}
  />
</div>
```

### 9.2 Stats Grid

6 cards en grid 2×3:
1. Módulos: `completed/total` (orange)
2. Ejercicios: `completed/total` (blue)
3. Promedio: percentage (green)
4. Tiempo: hours (purple)
5. Racha actual: days (amber)
6. Mejor racha: days (yellow)

---

## 10. Gaps Conocidos

| ID | Descripción | Severidad |
|----|-------------|-----------|
| GAP-P1-009 | Activity history es mock en EnhancedProfilePage | Alta |
| GAP-P2-002 | RecentActivityFeed usa datos mock | Media |

---

## 11. Referencias

- **Hooks:** `STUDENT-HOOKS-SPEC.md`
- **Dashboard:** `SPEC-DASHBOARD.md`
- **Gaps:** `orchestration/analisis/GAPS-STUDENT-PORTAL.yml`

---

*Generado: 2026-01-24*
*Sistema SIMCO v4.3.0*
