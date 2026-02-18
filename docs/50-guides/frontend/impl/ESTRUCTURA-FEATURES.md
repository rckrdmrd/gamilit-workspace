# Estructura de Features Frontend

**Versión:** 1.2.0
**Última Actualización:** 2026-02-18
**Aplica a:** apps/frontend/src/features/

---

## Resumen

El frontend de GAMILIT organiza la funcionalidad en "features" - módulos autocontenidos que agrupan componentes, hooks, stores y servicios relacionados con un dominio específico.

---

## Features Disponibles (12 total)

| Feature | Ubicación | Descripción |
|---------|-----------|-------------|
| **admin** | `features/admin/` | Panel administrativo |
| **assignments** | `features/assignments/` | Tareas asignadas a estudiantes |
| **auth** | `features/auth/` | Login, registro, recuperación de contraseña |
| **content** | `features/content/` | Gestión de contenido educativo |
| **exercises** | `features/exercises/` | Visualización y resolución de ejercicios |
| **gamification** | `features/gamification/` | Logros, rangos, ML Coins, leaderboard |
| **mechanics** | `features/mechanics/` | 23 mecánicas de ejercicios organizadas por módulo |
| **missions** | `features/missions/` | Misiones diarias y semanales |
| **notifications** | `features/notifications/` | Centro de notificaciones |
| **progress** | `features/progress/` | Seguimiento de progreso del estudiante |
| **social** | `features/social/` | Aulas, equipos, retos (en `apps/`) |
| **teacher** | `features/teacher/` | Portal del docente (en `apps/`) |

---

## Estructura Estándar de una Feature

```
features/ejemplo/
├── components/              # Componentes React específicos
│   ├── EjemploCard.tsx
│   ├── EjemploList.tsx
│   ├── EjemploForm.tsx
│   └── index.ts            # Barrel exports
├── hooks/                   # Custom hooks
│   ├── useEjemplo.ts
│   ├── useEjemploMutation.ts
│   └── index.ts
├── services/                # API calls
│   ├── ejemplo.service.ts
│   └── index.ts
├── stores/                  # Zustand stores (si aplica)
│   ├── ejemplo.store.ts
│   └── index.ts
├── types/                   # TypeScript types/interfaces
│   ├── ejemplo.types.ts
│   └── index.ts
├── utils/                   # Utilidades específicas
│   └── ejemplo.utils.ts
├── pages/                   # Páginas de la feature (si tiene rutas)
│   └── EjemploPage.tsx
└── index.ts                 # Barrel export principal
```

---

## Ejemplos de Features

### auth/

```
features/auth/
├── components/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── ForgotPasswordForm.tsx
│   └── PasswordStrengthIndicator.tsx
├── hooks/
│   ├── useAuth.ts           # Estado de autenticación
│   ├── useLogin.ts          # Mutación de login
│   └── useRegister.ts       # Mutación de registro
├── services/
│   └── auth.service.ts      # Llamadas a API
├── stores/
│   └── auth.store.ts        # Zustand store para auth
├── types/
│   ├── auth.types.ts        # LoginDto, UserResponse, etc.
│   └── index.ts
└── index.ts
```

### gamification/

```
features/gamification/
├── components/
│   ├── AchievementCard.tsx
│   ├── AchievementList.tsx
│   ├── RankBadge.tsx
│   ├── XpProgressBar.tsx
│   ├── MlCoinsDisplay.tsx
│   ├── LeaderboardTable.tsx
│   └── ComodinCard.tsx
├── hooks/
│   ├── useUserStats.ts
│   ├── useAchievements.ts
│   ├── useLeaderboard.ts
│   ├── useComodines.ts
│   └── usePurchaseComodin.ts
├── services/
│   ├── gamification.service.ts
│   ├── achievements.service.ts
│   └── leaderboard.service.ts
├── types/
│   ├── user-stats.types.ts
│   ├── achievement.types.ts
│   ├── rank.types.ts
│   └── comodin.types.ts
└── index.ts
```

### exercises/ (Restructured v2.0 — 2026-02-18)

Feature restructurada con Registry Pattern + React Context. ExercisePage monolito (~1058 líneas) descompuesto en ~20 archivos enfocados.

```
features/exercises/
├── types/
│   ├── exercise.types.ts              # Types base (Exercise, ExerciseContent, etc.)
│   ├── exercise-mechanic.types.ts     # Contrato estándar: ExerciseMechanicProps, ExerciseComodinesContext
│   └── index.ts
├── registry/
│   ├── exercise-registry.ts           # Map<string, ExerciseRegistryEntry> + registerExercise()
│   └── registrations.ts               # 30 mecánicas registradas con loader + adapter + meta
├── hooks/
│   ├── useExerciseData.ts             # Fetch ejercicio + registry lookup + mechanic loading
│   ├── useExerciseProgress.ts         # Progreso + auto-save integrado
│   ├── useExerciseComodines.ts        # Inventario real comodines via API backend
│   ├── useExerciseTimer.ts
│   ├── useExerciseRewards.ts
│   └── index.ts
├── context/
│   └── ExerciseContext.tsx            # Compone todos los hooks en React Context
├── components/
│   ├── ExerciseLayout.tsx             # Composición: header + guide + loader + sidebar
│   ├── ExerciseLoader.tsx             # Carga dinámica via registry (Suspense + lazy)
│   ├── ExerciseSidebar.tsx            # Panel lateral: comodines + acciones + stats
│   ├── ConsumablesPanel.tsx           # Comodines reales del backend
│   ├── ActionsPanel.tsx               # Guardar, enviar, reiniciar, verificar
│   ├── ExerciseLoadingSkeleton.tsx    # Estado de carga
│   ├── ExerciseErrorState.tsx         # Estado de error
│   ├── ExerciseCompletedState.tsx     # Ejercicio ya completado
│   ├── MechanicCompatWrapper.tsx      # Compatibilidad backward con mecánicas legacy
│   ├── ExerciseGuide.tsx              # Guía pedagógica
│   ├── ExerciseFeedback.tsx
│   ├── ExerciseHeader.tsx
│   └── index.ts
└── index.ts                           # Barrel exports completos
```

**Agregar nueva mecánica:** Crear componente + registrar en `registrations.ts` (4 líneas). Sin modificar ExercisePage ni routing.

### mechanics/ (NUEVO v1.1)

Feature que contiene las 23 mecánicas de ejercicios organizadas por módulo curricular.

```
features/mechanics/
├── index.ts                     # Barrel export de todas las mecánicas
├── shared/                      # Componentes compartidos entre mecánicas
│   ├── FeedbackModal.tsx
│   ├── TimerDisplay.tsx
│   └── ScoreDisplay.tsx
├── auxiliar/                    # Mecánicas auxiliares
│   ├── CrucigramaExercise/
│   ├── SopaLetrasExercise/
│   └── ...
├── module1/                     # Mecánicas del Módulo 1
│   ├── TimelineExercise/
│   ├── FillInBlankExercise/
│   ├── TrueFalseExercise/
│   └── ...
├── module2/                     # Mecánicas del Módulo 2
│   ├── CauseEffectMatching/
│   ├── DetectiveTextual/
│   └── ...
├── module3/                     # Mecánicas del Módulo 3
├── module4/                     # Mecánicas del Módulo 4
└── module5/                     # Mecánicas del Módulo 5
```

**Nota:** Cada mecánica tiene su propia carpeta con:
- Componente principal (`*.tsx`)
- Types locales (`types.ts`)
- Estilos específicos (si aplica)

### missions/ (NUEVO v1.1)

Feature para misiones diarias y semanales.

```
features/missions/
├── store/
│   └── missionsStore.ts         # Zustand store para misiones
├── MIGRATION-GUIDE.md           # Guía de migración desde API deprecated
└── (componentes migrados desde gamification/missions/)
```

**Nota:** Los types de Mission están en `@features/gamification/missions/types/missionsTypes.ts` (SSOT).

### assignments/ (NUEVO v1.1 - P1-002)

Feature para tareas asignadas a estudiantes.

```
features/assignments/
└── store/
    └── studentAssignmentsStore.ts  # Zustand store para assignments de estudiante
```

**API:** `@services/api/studentAssignmentsAPI.ts`
**Página:** `@apps/student/pages/AssignmentsPage.tsx`

---

## Patrones de Componentes

### Componente con Hook de Datos

```typescript
// features/gamification/components/AchievementList.tsx
import { useAchievements } from '../hooks/useAchievements';
import { AchievementCard } from './AchievementCard';

export const AchievementList: React.FC = () => {
  const { data: achievements, isLoading, error } = useAchievements();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="grid grid-cols-2 gap-4">
      {achievements?.map((achievement) => (
        <AchievementCard key={achievement.id} achievement={achievement} />
      ))}
    </div>
  );
};
```

### Componente Presentacional

```typescript
// features/gamification/components/RankBadge.tsx
import { MayaRank } from '../types/rank.types';

interface RankBadgeProps {
  rank: MayaRank;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const RankBadge: React.FC<RankBadgeProps> = ({
  rank,
  size = 'md',
  showLabel = true,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex items-center gap-2">
      <img
        src={rank.iconUrl}
        alt={rank.name}
        className={sizeClasses[size]}
      />
      {showLabel && <span className="font-medium">{rank.name}</span>}
    </div>
  );
};
```

---

## Barrel Exports

### feature/index.ts

```typescript
// features/gamification/index.ts

// Components
export { AchievementCard } from './components/AchievementCard';
export { AchievementList } from './components/AchievementList';
export { RankBadge } from './components/RankBadge';
export { XpProgressBar } from './components/XpProgressBar';
export { MlCoinsDisplay } from './components/MlCoinsDisplay';

// Hooks
export { useUserStats } from './hooks/useUserStats';
export { useAchievements } from './hooks/useAchievements';
export { useLeaderboard } from './hooks/useLeaderboard';

// Types
export type { UserStats, Achievement, MayaRank } from './types';
```

### Uso en otros lugares

```typescript
// Importar desde la feature
import { RankBadge, useUserStats } from '@/features/gamification';

// NO importar archivos internos directamente
// import { RankBadge } from '@/features/gamification/components/RankBadge'; ❌
```

---

## Comunicación Entre Features

### Usando Stores Compartidos

```typescript
// En gamification: actualizar stats después de logro
const { refetchStats } = useUserStats();
await grantAchievement(achievementId);
refetchStats();
```

### Usando Eventos

```typescript
// features/exercises/hooks/useSubmitAnswer.ts
import { useQueryClient } from '@tanstack/react-query';

export const useSubmitAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitAnswer,
    onSuccess: (result) => {
      // Invalidar queries de otras features
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });
};
```

---

## Páginas y Rutas

Las páginas de cada feature se registran en el router principal:

```typescript
// src/router/index.tsx
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { ExercisePage } from '@/features/exercises/pages/ExercisePage';
import AchievementsPage from '@/apps/student/pages/AchievementsPage';

const routes = [
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/exercises/:id', element: <ExercisePage /> },
  { path: '/achievements', element: <AchievementsPage /> },
];
```

---

## Buenas Prácticas

1. **Feature = Dominio**: Una feature por dominio de negocio
2. **Autocontenida**: Cada feature debe funcionar independientemente
3. **Barrel exports**: Usar index.ts para exponer API pública
4. **No imports cruzados internos**: Usar exports públicos entre features
5. **Colocalizar tests**: `__tests__/` junto a lo que prueban
6. **Types propios**: Cada feature define sus propios tipos
7. **Hooks para lógica**: Extraer lógica a custom hooks

---

## Ver También

- [ESTRUCTURA-SHARED.md](./ESTRUCTURA-SHARED.md) - Código compartido
- [STATE-MANAGEMENT.md](./STATE-MANAGEMENT.md) - Zustand y React Query
- [COMPONENTES-UI.md](./COMPONENTES-UI.md) - Componentes de UI base
- [TYPES-CONVENTIONS.md](./TYPES-CONVENTIONS.md) - Convenciones de Types (SSOT)

---

## Changelog

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.2.0 | 2026-02-18 | exercises/ restructurada: Registry Pattern + Context + hooks descompuestos |
| 1.1.0 | 2025-11-29 | Añadidas features: mechanics, missions, assignments |
| 1.0.0 | 2025-11-28 | Versión inicial |
