# useInvalidateDashboard - Ejemplo de Uso

## Problema que Resuelve

Los ejercicios actualizan Zustand stores (`useRanksStore`, `useEconomyStore`) pero NO invalidan React Query cache, causando datos obsoletos en:
- `useDashboardData` (React Query)
- `useUserModules` (React Query)

## Solución

Hook centralizado que sincroniza ambos sistemas:
1. Actualiza Zustand stores
2. Invalida React Query cache

## Uso en Ejercicios

### ❌ ANTES (Código Actual)

```typescript
import { useRanksStore } from '@/features/gamification/ranks/store/ranksStore';
import { useEconomyStore } from '@/features/gamification/economy/store/economyStore';

export const PodcastArgumentativoExercise: React.FC<ExerciseProps> = ({
  exerciseId,
  onComplete,
}) => {
  const { fetchUserProgress } = useRanksStore();
  const { fetchBalance } = useEconomyStore();

  const handleSubmit = async () => {
    try {
      // Submit exercise to backend
      const response = await submitExercise({
        exerciseId,
        userId: user?.id || '',
        answers,
        score,
      });

      // Sync stores with backend (Zustand only - React Query NOT updated)
      await fetchUserProgress();
      await fetchBalance();

      // PROBLEMA: Dashboard y módulos quedan con datos viejos
      setShowFeedback(true);
    } catch (error) {
      console.error('Error al enviar:', error);
    }
  };

  return (
    // ... exercise UI
  );
};
```

### ✅ DESPUÉS (Con useInvalidateDashboard)

```typescript
import { useInvalidateDashboard } from '@/shared/hooks/useInvalidateDashboard';

export const PodcastArgumentativoExercise: React.FC<ExerciseProps> = ({
  exerciseId,
  onComplete,
}) => {
  const { syncAndInvalidate } = useInvalidateDashboard();

  const handleSubmit = async () => {
    try {
      // Submit exercise to backend
      const response = await submitExercise({
        exerciseId,
        userId: user?.id || '',
        answers,
        score,
      });

      // Sync Zustand stores + Invalidate React Query cache
      await syncAndInvalidate();

      // ✅ Dashboard y módulos se actualizan automáticamente
      setShowFeedback(true);
    } catch (error) {
      console.error('Error al enviar:', error);
    }
  };

  return (
    // ... exercise UI
  );
};
```

## Beneficios

1. **Código más limpio**: Una sola llamada en lugar de múltiples
2. **Sincronización completa**: Actualiza tanto Zustand como React Query
3. **Mantenible**: Cambios centralizados en el hook
4. **Consistent**: Mismo patrón en todos los ejercicios
5. **Debugging**: Logs centralizados para troubleshooting

## Qué Invalida

El hook invalida las siguientes queries de React Query:

```typescript
// Dashboard data (coins, rank, achievements, progress)
['dashboard', userId]
['dashboard', userId, 'coins']
['dashboard', userId, 'rank']
['dashboard', userId, 'achievements']
['dashboard', userId, 'progress']

// User modules (module list with progress)
['userModules', userId]
['userModules', userId, 'classroom', classroomId]
```

## Otros Casos de Uso

### 1. Completar Cualquier Ejercicio

```typescript
const handleCompleteExercise = async () => {
  await submitExercise(exerciseData);
  await syncAndInvalidate(); // Refresh dashboard
};
```

### 2. Comprar Items en la Tienda

```typescript
const handlePurchase = async (itemId: string) => {
  await purchaseItem(itemId);
  await syncAndInvalidate(); // Update coins display
};
```

### 3. Subir de Rango Manualmente

```typescript
const handleRankUp = async () => {
  await rankUpUser();
  await syncAndInvalidate(); // Show new rank
};
```

## Logs de Consola

El hook proporciona logs detallados para debugging:

```
🔄 [useInvalidateDashboard] Starting sync and invalidate...
📦 [useInvalidateDashboard] Fetching Zustand stores...
✅ [useInvalidateDashboard] Zustand stores updated
🗑️ [useInvalidateDashboard] Invalidating React Query cache...
✅ [useInvalidateDashboard] React Query cache invalidated
🎉 [useInvalidateDashboard] Sync complete - dashboard will refresh
```

## Implementación Técnica

```typescript
export function useInvalidateDashboard() {
  const queryClient = useQueryClient();
  const { fetchUserProgress } = useRanksStore();
  const { fetchBalance } = useEconomyStore();
  const { user } = useAuth();

  const syncAndInvalidate = async () => {
    // 1. Update Zustand stores
    await Promise.all([
      fetchUserProgress(),
      fetchBalance(),
    ]);

    // 2. Invalidate React Query cache
    if (user?.id) {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['dashboard', user.id],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ['userModules', user.id],
          exact: false,
        }),
      ]);
    }
  };

  return { syncAndInvalidate };
}
```

## Siguiente Paso: Adopción

Para migrar ejercicios existentes:

1. Importar `useInvalidateDashboard` en lugar de stores individuales
2. Reemplazar llamadas `fetchUserProgress()` + `fetchBalance()` con `syncAndInvalidate()`
3. Eliminar imports no usados de `useRanksStore` y `useEconomyStore`

Ejemplos de archivos a actualizar:
- `PodcastArgumentativoExercise.tsx`
- `CausaEfectoExercise.tsx`
- Todos los ejercicios en `features/mechanics/module*`
