# SPEC-DASHBOARD - Student Portal Dashboard

**Version:** 1.0.0
**Fecha:** 2026-01-24
**Autor:** Claude Code (Auditoría Automatizada)
**Estado:** COMPLETO

---

## 1. Vision General

El Dashboard es la página principal del Student Portal que muestra un resumen completo del progreso del estudiante, incluyendo:
- Estadísticas de gamificación (XP, ML Coins, Rango)
- Progreso en módulos y ejercicios
- Misiones activas
- Actividades recientes
- Acciones rápidas

---

## 2. Páginas Relacionadas

| Página | Archivo | Descripción |
|--------|---------|-------------|
| Dashboard Principal | `pages/DashboardComplete.tsx` | Contenedor maestro del dashboard |

---

## 3. Componentes

### 3.1 Componentes de Dashboard

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| EnhancedStatsGrid | `components/dashboard/EnhancedStatsGrid.tsx` | Grid de estadísticas (casos, rachas, XP) |
| MLCoinsWidget | `components/dashboard/MLCoinsWidget.tsx` | Balance de ML Coins y transacciones |
| RankProgressWidget | `components/dashboard/RankProgressWidget.tsx` | Progreso de rango Maya |
| MissionsPanel | `components/dashboard/MissionsPanel.tsx` | Panel de misiones activas |
| ModulesSection | `components/dashboard/ModulesSection.tsx` | Grid de módulos educativos |
| RecentActivityPanel | `components/dashboard/RecentActivityPanel.tsx` | Feed de actividades recientes |
| QuickActionsWidget | `components/dashboard/QuickActionsWidget.tsx` | Acciones rápidas (Tienda, Ranking, Logros) |
| BottomNavigation | `components/dashboard/BottomNavigation.tsx` | Navegación móvil inferior |
| AchievementMilestones | `components/dashboard/AchievementMilestones.tsx` | Hitos de logros |
| ProgressStats | `components/dashboard/ProgressStats.tsx` | Estadísticas de progreso |

### 3.2 Props de Componentes Principales

```typescript
// EnhancedStatsGrid
interface EnhancedStatsGridProps {
  stats: {
    casesResolved: number;
    currentStreak: number;
    totalTime: number;      // minutos
    totalXP: number;
    rankPosition?: number;
  };
  loading: boolean;
  error: Error | null;
  compact?: boolean;
}

// MLCoinsWidget
interface MLCoinsWidgetProps {
  data: MLCoinsData | null;
  loading?: boolean;
}

// RankProgressWidget
interface RankProgressWidgetProps {
  data: RankData | null;
  loading?: boolean;
}

// MissionsPanel
interface MissionsPanelProps {
  missions: Mission[];
  loading: boolean;
  error: Error | null;
  onMissionClick?: (missionId: string) => void;
}

// ModulesSection
interface ModulesSectionProps {
  modules: ModuleData[];
  loading: boolean;
  error: Error | null;
  onModuleClick?: (moduleId: string) => void;
}
```

---

## 4. Hooks

| Hook | Archivo | Descripción |
|------|---------|-------------|
| useDashboardData | `hooks/useDashboardData.ts` | Hook central para datos del dashboard |
| useRecentActivities | `hooks/useRecentActivities.ts` | Actividades recientes del usuario |
| useMissions | `features/gamification/missions/hooks/useMissions` | Misiones del usuario |
| useUserModules | `hooks/useUserModules.ts` | Módulos con progreso |
| useUserClassroom | `hooks/useUserClassroom.ts` | Aula del usuario |

---

## 5. APIs Consumidas

### 5.1 Endpoints Principales

| Endpoint | Método | Descripción | Response |
|----------|--------|-------------|----------|
| `/gamification/users/{userId}/ml-coins` | GET | Balance de ML Coins | `MLCoinsData` |
| `/gamification/ranks/current` | GET | Rango actual del sistema | `RankData` |
| `/gamification/ranks/users/{userId}/rank-progress` | GET | Progreso hacia siguiente rango | `RankProgressData` |
| `/gamification/users/{userId}/achievements` | GET | Logros del usuario | `AchievementData[]` |
| `/progress/users/{userId}/summary` | GET | Resumen de progreso educativo | `ProgressData` |

### 5.2 Request/Response Types

```typescript
// ML Coins
interface MLCoinsData {
  balance: number;
  todayEarned: number;
  todaySpent: number;
  recentTransactions: {
    id: string;
    type: 'earned' | 'spent';
    amount: number;
    description: string;
    timestamp: string;
  }[];
}

// Rank
interface RankData {
  currentRank: string;        // 'Ajaw', 'Nacom', 'Ah K\'in', etc.
  currentXP: number;
  nextRankXP: number;
  multiplier: number;         // 1.0 - 3.0
  rankIcon: string;
  progress: number;           // 0-100
}

// Progress
interface ProgressData {
  totalModules: number;
  completedModules: number;
  totalExercises: number;
  completedExercises: number;
  averageScore: number;
  totalTimeSpent: number;     // segundos
  currentStreak: number;
  longestStreak: number;
}
```

### 5.3 Códigos de Error

| Código | Descripción | Manejo |
|--------|-------------|--------|
| 401 | No autenticado | Redirect a login |
| 404 | Usuario no encontrado | Mostrar mensaje de error |
| 500 | Error del servidor | Mostrar error con botón de reintento |

---

## 6. Generación de Archivos (PDF/Excel)

**No aplica** - El dashboard no genera archivos exportables.

---

## 7. Manejo de Multimedia

### 7.1 Avatares
- Fuente: User.avatarUrl o icono genérico (User de lucide-react)
- Formato: URL externa o local
- Sin upload desde dashboard

### 7.2 Iconos de Rango
```typescript
const rankIcons: Record<string, string> = {
  'Ajaw': '🏹',
  'Nacom': '🔍',
  'Ah K\'in': '🗡️',
  'Halach Uinic': '⚔️',
  'K\'uk\'ulkan': '👑'
};
```

---

## 8. Estados de UI

### 8.1 Estados de Carga

| Estado | Componente | Descripción |
|--------|------------|-------------|
| Loading | Skeleton | 8+ skeletons animados |
| Error | ErrorDisplay | Mensaje + botón reintento |
| Empty | EmptyState | Mensaje motivacional |
| Success | Render normal | Datos mostrados |

### 8.2 Animaciones

- **Framer Motion** para transiciones
- Spring stiffness: 300, damping: 30
- Stagger entre componentes: 0.05s
- Hover scale: 1.05

---

## 9. Validaciones

### 9.1 Validaciones de Datos
- Fallback a valores por defecto si datos null
- Transformación snake_case → camelCase
- Manejo de múltiples formatos de response

### 9.2 React Query Config
```typescript
{
  staleTime: 5 * 60 * 1000,       // 5 minutos
  gcTime: 10 * 60 * 1000,         // 10 minutos
  refetchOnWindowFocus: true,
  refetchOnMount: true,
  retry: 2
}
```

---

## 10. Dependencias

### 10.1 Librerías Externas
- `@tanstack/react-query` - Server state management
- `framer-motion` - Animaciones
- `lucide-react` - Iconos
- `react-router-dom` - Navegación

### 10.2 Componentes Internos
- `GamifiedHeader` - Header compartido
- `DetectiveCard` - Card temático
- `RankBadge` - Badge de rango

---

## 11. Gaps Conocidos

| ID | Descripción | Severidad | Estado |
|----|-------------|-----------|--------|
| GAP-P1-001 | nextRank hardcoded como 'Next Rank' | Media | Pendiente |
| GAP-P2-001 | 19+ console.log en producción | Baja | Pendiente |
| GAP-P2-002 | RecentActivityFeed usa mock data | Media | Pendiente |

---

## 12. Referencias

- **Hook Spec:** `STUDENT-HOOKS-SPEC.md`
- **Gaps:** `orchestration/analisis/GAPS-STUDENT-PORTAL.yml`
- **Inventario:** `orchestration/inventarios/FRONTEND_INVENTORY.yml`

---

*Generado: 2026-01-24*
*Sistema SIMCO v4.3.0*
