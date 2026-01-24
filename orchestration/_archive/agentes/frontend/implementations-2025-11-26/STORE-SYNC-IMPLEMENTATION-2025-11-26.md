# Store Sync Implementation - Exercise Rewards

**Fecha**: 2025-11-26
**Tipo**: Corrección de Bug / Feature Enhancement
**Módulos Afectados**: Module 1 (6 componentes), Module 2 (6 componentes)

---

## Resumen Ejecutivo

Se implementó la sincronización de stores de Zustand (`ranksStore`, `economyStore`) después de cada envío exitoso de ejercicio. Esto resuelve el problema donde los XP y ML Coins se calculaban correctamente en el backend pero no se reflejaban en la UI hasta refrescar la página.

---

## Problema Identificado

### Síntomas Reportados
- **Módulo 1**: Ejercicios 1-4 funcionaban, ejercicio 5 (MapaConceptual) no sumaba XP
- **Módulo 2**: La funcionalidad de enviar respuestas no funcionaba como M1

### Causa Raíz
Los componentes de ejercicios:
1. Llamaban correctamente a `submitExercise()` que envía datos al backend
2. El backend calculaba y persistía los rewards (XP, ML Coins) correctamente
3. **PERO** los stores de Zustand nunca se actualizaban con los nuevos valores
4. La UI mostraba valores stale hasta que el usuario refrescaba la página

### Hallazgo Adicional: MapaConceptualExercise
Este componente tenía problemas más severos:
- ❌ NO tenía `submitExercise` importado ni implementado
- ❌ El botón "Verificar" NO tenía `onClick` handler
- ❌ NO validaba respuestas ni enviaba datos al backend

---

## Solución Implementada

### Patrón de Corrección

```typescript
// 1. IMPORTS - Agregados a cada componente
import { useRanksStore } from '@/features/gamification/ranks/store/ranksStore';
import { useEconomyStore } from '@/features/gamification/economy/store/economyStore';

// 2. HOOKS - Dentro del cuerpo del componente
const { fetchUserProgress } = useRanksStore();
const { fetchBalance } = useEconomyStore();

// 3. SYNC CALLS - Después de submitExercise exitoso
try {
  const response = await submitExercise(exercise.id, user.id, answers);

  // ... set feedback, show modal ...

  // Sync stores with backend (rewards already calculated and saved by backend)
  await fetchUserProgress();
  await fetchBalance();

  console.log('✅ [ComponentName] Submission successful:', {
    attemptId: response.attemptId,
    score: response.score,
    rewards: response.rewards,
  });
} catch (error) {
  // ... error handling ...
}
```

### Razón del Patrón
- **NO** se llama a `addXP()` ni `addCoins()` porque estos métodos hacen llamadas al backend
- El backend ya calculó y persistió los rewards durante `submitExercise`
- Solo necesitamos sincronizar el estado local del frontend con el backend
- `fetchUserProgress()` y `fetchBalance()` obtienen los valores actualizados del backend

---

## Archivos Modificados

### Módulo 1 (6 archivos)

| Archivo | Ubicación | Cambios |
|---------|-----------|---------|
| `MapaConceptualExercise.tsx` | `module1/MapaConceptual/` | Implementación completa: imports, hooks, handleCheck async, handleReset, actionsRef, FeedbackModal, store sync |
| `VerdaderoFalsoExercise.tsx` | `module1/VerdaderoFalso/` | Imports + hooks + store sync |
| `CrucigramaExercise.tsx` | `module1/Crucigrama/` | Imports + hooks + store sync |
| `TimelineExercise.tsx` | `module1/Timeline/` | Imports + hooks + store sync |
| `SopaLetrasExercise.tsx` | `module1/SopaLetras/` | Imports + hooks + store sync |
| `CompletarEspaciosExercise.tsx` | `module1/CompletarEspacios/` | Imports + hooks + store sync |

### Módulo 2 (6 archivos)

| Archivo | Ubicación | Cambios |
|---------|-----------|---------|
| `LecturaInferencialExercise.tsx` | `module2/LecturaInferencial/` | Imports + hooks + store sync + isSubmitting guard |
| `PuzzleContextoExercise.tsx` | `module2/PuzzleContexto/` | Imports + hooks + store sync |
| `PrediccionNarrativaExercise.tsx` | `module2/PrediccionNarrativa/` | Imports + hooks + store sync |
| `DetectiveTextualExercise.tsx` | `module2/DetectiveTextual/` | Imports + hooks + store sync |
| `CausaEfectoExercise.tsx` | `module2/ConstruccionHipotesis/` | Imports + hooks + store sync |
| `RuedaInferenciasExercise.tsx` | `module2/RuedaInferencias/` | Imports + hooks + store sync (sin useAuth ya que recibe userId como prop) |

---

## Detalle de Cambios por Archivo

### MapaConceptualExercise.tsx (Cambio Mayor)

**Antes:**
```typescript
// Sin imports de API ni stores
// Sin handleCheck implementado
// Botón sin onClick
<DetectiveButton variant="gold" icon={<Check />} className="mt-4">
  Verificar
</DetectiveButton>
```

**Después:**
```typescript
// Imports completos
import { submitExercise } from '@/features/progress/api/progressAPI';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRanksStore } from '@/features/gamification/ranks/store/ranksStore';
import { useEconomyStore } from '@/features/gamification/economy/store/economyStore';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';

// Hooks
const { user } = useAuth();
const { fetchUserProgress } = useRanksStore();
const { fetchBalance } = useEconomyStore();

// handleCheck completo con validación, submit, y sync
const handleCheck = useCallback(async () => {
  // ... validaciones ...
  const response = await submitExercise(exercise.id, user.id, { connections });
  // ... feedback ...
  await fetchUserProgress();
  await fetchBalance();
}, [/* deps */]);

// Botón funcional
<DetectiveButton onClick={handleCheck} disabled={isSubmitting || validated}>
  {isSubmitting ? 'Enviando...' : validated ? 'Verificado' : 'Verificar'}
</DetectiveButton>

// FeedbackModal agregado
{feedback && <FeedbackModal ... />}
```

### Componentes Estándar (11 restantes)

**Cambios comunes:**
1. +2 líneas de imports (stores)
2. +2 líneas de hooks (fetchUserProgress, fetchBalance)
3. +4 líneas después de submit exitoso (sync + log)

---

## Validación

### Type-Check
```bash
npm run type-check
```
- ✅ Sin errores nuevos introducidos
- ⚠️ 2 errores preexistentes no relacionados:
  - `AdminDashboard.tsx(175)`: Type 'number | null' issue
  - `UserDetailModal.tsx(562)`: Type 'string | null' issue

### Build
Los cambios no afectan el build ya que son solo adiciones de imports y llamadas async.

---

## Flujo de Datos Corregido

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FLUJO ANTERIOR (ROTO)                        │
├─────────────────────────────────────────────────────────────────────┤
│ Usuario completa ejercicio                                          │
│         ↓                                                           │
│ submitExercise() → Backend calcula rewards → DB actualizada ✅      │
│         ↓                                                           │
│ Frontend muestra feedback con rewards                               │
│         ↓                                                           │
│ Stores de Zustand NO actualizados ❌                                │
│         ↓                                                           │
│ UI header muestra valores stale ❌                                  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       FLUJO CORREGIDO (NUEVO)                       │
├─────────────────────────────────────────────────────────────────────┤
│ Usuario completa ejercicio                                          │
│         ↓                                                           │
│ submitExercise() → Backend calcula rewards → DB actualizada ✅      │
│         ↓                                                           │
│ Frontend muestra feedback con rewards                               │
│         ↓                                                           │
│ fetchUserProgress() → Sync ranksStore ✅                            │
│ fetchBalance() → Sync economyStore ✅                               │
│         ↓                                                           │
│ UI header muestra valores actualizados ✅                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Dependencias

### Stores Utilizados
- `useRanksStore` de `@/features/gamification/ranks/store/ranksStore`
  - Método: `fetchUserProgress()` - GET `/gamification/users/{userId}/stats`

- `useEconomyStore` de `@/features/gamification/economy/store/economyStore`
  - Método: `fetchBalance()` - GET `/gamification/users/{userId}/stats`

### API Endpoints Involucrados
- POST `/progress/submissions/submit` - Envío de respuestas (ya existente)
- GET `/gamification/users/{userId}/stats` - Sync de stats (ya existente)

---

## Notas Importantes

1. **No se duplican rewards**: Los métodos `fetchUserProgress()` y `fetchBalance()` solo leen datos del backend, no escriben.

2. **RuedaInferenciasExercise es especial**: Este componente recibe `userId` como prop en lugar de usar `useAuth()`, por lo que NO se importó `useAuth`.

3. **Consistencia**: Todos los componentes ahora siguen el mismo patrón para facilitar mantenimiento futuro.

4. **Logging**: Se agregó/mantuvo `console.log` con prefijo de emoji para debugging en desarrollo.

---

## Testing Recomendado

### Manual
1. Completar un ejercicio de cada tipo
2. Verificar que XP y ML Coins se actualizan inmediatamente en el header
3. Verificar que el FeedbackModal muestra los rewards correctamente
4. Verificar que al recargar la página, los valores persisten

### Automatizado (Futuro)
- Tests de integración para verificar que los stores se actualizan después de submit
- Tests E2E para verificar flujo completo usuario → ejercicio → rewards

---

## Referencias

- Stores: `apps/frontend/src/features/gamification/ranks/store/ranksStore.ts`
- Stores: `apps/frontend/src/features/gamification/economy/store/economyStore.ts`
- API: `apps/frontend/src/features/progress/api/progressAPI.ts`
- Backend: `apps/backend/src/modules/progress/services/exercise-attempt.service.ts`
