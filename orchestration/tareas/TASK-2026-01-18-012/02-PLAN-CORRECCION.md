# TASK-2026-01-18-012: Plan de Correccion

## Resumen de Fases

| Fase | Descripcion | Prioridad | Archivos |
|------|-------------|-----------|----------|
| **FASE 1** | Fix critico: Guardar scores antes de completar | P0 | 2 |
| **FASE 2** | Fix critico: Validacion backend de totalScore | P0 | 1 |
| **FASE 3** | Modal feedback en lugar de alert | P1 | 1 |
| **FASE 4** | Mostrar reviews completados (filtrado) | P1 | 4 |
| **FASE 5** | Correccion de datos existentes | P2 | Script SQL |

---

## FASE 1: Fix Critico - Guardar Scores Antes de Completar (P0)

### Problema
El boton "Completar Review" permite completar sin haber guardado la evaluacion.

### Solucion
Forzar que `saveEvaluation()` se ejecute ANTES de `completeReview()`.

### Archivo 1: ReviewDetail.tsx
**Ubicacion:** `apps/frontend/src/apps/teacher/components/review-panel/ReviewDetail.tsx`

#### Cambio 1.1: Modificar handleCompleteReview
```typescript
// ANTES (aproximado):
const handleCompleteReview = async () => {
  await api.completeReview(review.id);
  alert('Review completado');
};

// DESPUES:
const handleCompleteReview = async () => {
  // 1. Validar que hay scores
  if (!rubricScores || Object.keys(rubricScores).length === 0) {
    showToast({
      type: 'error',
      title: 'Error',
      message: 'Debes evaluar todos los criterios antes de completar',
    });
    return;
  }

  // 2. Calcular totalScore si no existe
  const totalScore = calculateTotalScore(rubricScores);

  // 3. Guardar evaluacion PRIMERO
  await saveEvaluationMutation.mutateAsync({
    rubricScores,
    totalScore,
    generalFeedback,
  });

  // 4. Completar review
  const result = await completeReviewMutation.mutateAsync(review.id);

  // 5. Mostrar modal con rewards (FASE 3)
  setRewardsResult(result.rewards);
  setShowSuccessModal(true);
};
```

#### Cambio 1.2: Deshabilitar boton si no hay evaluacion
```typescript
<DetectiveButton
  onClick={handleCompleteReview}
  disabled={!hasValidEvaluation || isCompleting}
  variant="primary"
>
  {isCompleting ? 'Completando...' : 'Calificar Respuesta'}
</DetectiveButton>
```

### Archivo 2: manualReviewApi.ts
**Ubicacion:** `apps/frontend/src/shared/api/manualReviewApi.ts`

#### Cambio 1.3: Asegurar que completeReview retorna rewards
```typescript
// Verificar que el tipo de retorno incluye rewards
export interface CompleteReviewResult {
  review: ManualReview;
  rewards: {
    xp_earned: number;
    ml_coins_earned: number;
    rankUp?: {
      newRank: string;
      previousRank: string;
      bonusCoins: number;
    };
  } | null;
}

export const completeReview = async (reviewId: string): Promise<CompleteReviewResult> => {
  const { data } = await apiClient.post<CompleteReviewResult>(
    API_ENDPOINTS.teacher.reviews.complete(reviewId),
  );
  return data;
};
```

---

## FASE 2: Validacion Backend de totalScore (P0)

### Problema
El backend permite completar un review sin totalScore, saltando gradeSubmission y claimRewards.

### Solucion
Agregar validacion en completeReview para requerir totalScore.

### Archivo: manual-review.service.ts
**Ubicacion:** `apps/backend/src/modules/teacher/services/manual-review.service.ts`

#### Cambio 2.1: Validar totalScore antes de completar
```typescript
// Linea ~545, despues de cargar el review
async completeReview(reviewId: string): Promise<CompleteReviewResult> {
  const review = await this.reviewRepo.findOne({
    where: { id: reviewId },
    relations: ['submission'],
  });

  if (!review) {
    throw new NotFoundException(`Review ${reviewId} not found`);
  }

  // NUEVO: Validar que hay evaluacion
  if (review.totalScore === null || review.totalScore === undefined) {
    throw new BadRequestException(
      'No se puede completar el review sin una evaluacion guardada. ' +
      'Guarda la evaluacion primero usando saveEvaluation().'
    );
  }

  if (!review.rubricScores || Object.keys(review.rubricScores).length === 0) {
    throw new BadRequestException(
      'No se puede completar el review sin rubric scores. ' +
      'Evalua todos los criterios antes de completar.'
    );
  }

  // ... resto del metodo existente
}
```

---

## FASE 3: Modal Feedback en Lugar de Alert (P1)

### Problema
Se usa `alert()` nativo que rompe la consistencia UX de la aplicacion.

### Solucion
Usar FeedbackModal que ya existe en el sistema.

### Archivo: ReviewDetail.tsx
**Ubicacion:** `apps/frontend/src/apps/teacher/components/review-panel/ReviewDetail.tsx`

#### Cambio 3.1: Agregar imports
```typescript
import { FeedbackModal } from '@/shared/components/mechanics/FeedbackModal';
import { useState } from 'react';
```

#### Cambio 3.2: Agregar estado para modal
```typescript
const [showSuccessModal, setShowSuccessModal] = useState(false);
const [rewardsResult, setRewardsResult] = useState<CompleteReviewResult['rewards']>(null);
```

#### Cambio 3.3: Agregar componente FeedbackModal
```typescript
{showSuccessModal && (
  <FeedbackModal
    isOpen={showSuccessModal}
    feedback={{
      type: 'success',
      title: 'Revision Completada',
      message: `Has calificado el ejercicio correctamente`,
      score: totalScore,
      xpEarned: rewardsResult?.xp_earned || 0,
      mlCoinsEarned: rewardsResult?.ml_coins_earned || 0,
      showConfetti: true,
      details: [
        {
          section: 'Calificacion',
          score: totalScore,
          maxScore: 100,
          feedback: generalFeedback || 'Evaluacion completada',
        },
      ],
    }}
    onClose={() => {
      setShowSuccessModal(false);
      // Refrescar lista de reviews
      queryClient.invalidateQueries({ queryKey: ['manualReviews'] });
      // Opcional: navegar al siguiente review pendiente
      onReviewComplete?.();
    }}
    onNext={onNextReview}
  />
)}
```

#### Cambio 3.4: Mostrar info de recompensas del estudiante
```typescript
// Si hay rewards (para el estudiante), mostrar en el modal
{rewardsResult && (
  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-detective">
    <h4 className="font-semibold text-amber-800">Recompensas otorgadas al estudiante:</h4>
    <div className="flex gap-4 mt-2">
      <span className="flex items-center gap-1">
        <Star className="w-4 h-4 text-amber-500" />
        +{rewardsResult.xp_earned} XP
      </span>
      <span className="flex items-center gap-1">
        <Coins className="w-4 h-4 text-amber-500" />
        +{rewardsResult.ml_coins_earned} ML Coins
      </span>
    </div>
    {rewardsResult.rankUp && (
      <p className="mt-2 text-amber-700">
        El estudiante subio de rango: {rewardsResult.rankUp.previousRank} -> {rewardsResult.rankUp.newRank}
      </p>
    )}
  </div>
)}
```

---

## FASE 4: Mostrar Reviews Completados (P1)

### Problema
La pagina solo muestra reviews pendientes.

### Solucion
Agregar filtrado por status usando endpoint existente `/my-reviews`.

### Archivo 1: api.config.ts
**Ubicacion:** `apps/frontend/src/config/api.config.ts`

#### Cambio 4.1: Agregar endpoint myReviews
```typescript
reviews: {
  pending: '/teacher/reviews/pending',
  myReviews: '/teacher/reviews/my-reviews', // NUEVO
  get: (id: string) => `/teacher/reviews/${id}`,
  // ... resto
}
```

### Archivo 2: manualReviewApi.ts
**Ubicacion:** `apps/frontend/src/shared/api/manualReviewApi.ts`

#### Cambio 4.2: Agregar funcion getMyReviews
```typescript
export type ReviewStatus = 'pending' | 'in_progress' | 'completed' | 'returned';

export interface MyReviewsFilters {
  status?: ReviewStatus;
  exerciseId?: string;
  moduleId?: string;
  classroomId?: string;
}

export const getMyReviews = async (filters?: MyReviewsFilters): Promise<ManualReview[]> => {
  const { data } = await apiClient.get<ManualReview[]>(
    API_ENDPOINTS.teacher.reviews.myReviews,
    { params: filters },
  );
  return data;
};
```

### Archivo 3: useManualReviews.ts
**Ubicacion:** `apps/frontend/src/apps/teacher/hooks/useManualReviews.ts`

#### Cambio 4.3: Agregar hook useMyReviews
```typescript
export interface ManualReviewFilters {
  exerciseId?: string;
  moduleId?: string;
  classroomId?: string;
  status?: ReviewStatus; // NUEVO
}

export const manualReviewKeys = {
  all: ['manualReviews'] as const,
  pending: (filters?: ManualReviewFilters) => [...manualReviewKeys.all, 'pending', filters] as const,
  myReviews: (filters?: ManualReviewFilters) => [...manualReviewKeys.all, 'myReviews', filters] as const, // NUEVO
  // ...
};

// NUEVO HOOK
export function useMyReviews(
  filters?: ManualReviewFilters,
): UseQueryResult<ManualReview[], Error> {
  return useQuery<ManualReview[], Error>({
    queryKey: manualReviewKeys.myReviews(filters),
    queryFn: () => manualReviewApi.getMyReviews(filters),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
  });
}
```

### Archivo 4: TeacherReviewPanelPage.tsx
**Ubicacion:** `apps/frontend/src/apps/teacher/pages/TeacherReviewPanelPage.tsx`

#### Cambio 4.4: Agregar tabs de filtrado
```typescript
// Agregar estado para tab activo
const [activeTab, setActiveTab] = useState<ReviewStatus | 'all'>('pending');

// Usar el nuevo hook
const { data: reviews = [], isLoading } = useMyReviews({
  exerciseId: filters.exerciseId || undefined,
  moduleId: filters.moduleId || undefined,
  status: activeTab === 'all' ? undefined : activeTab,
});

// UI de tabs
<div className="flex gap-2 mb-4">
  {[
    { value: 'pending', label: 'Pendientes', count: pendingCount },
    { value: 'in_progress', label: 'En Progreso', count: inProgressCount },
    { value: 'completed', label: 'Completados', count: completedCount },
    { value: 'all', label: 'Todos', count: totalCount },
  ].map((tab) => (
    <button
      key={tab.value}
      onClick={() => setActiveTab(tab.value as ReviewStatus | 'all')}
      className={cn(
        'px-4 py-2 rounded-detective transition-colors',
        activeTab === tab.value
          ? 'bg-detective-gold text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      )}
    >
      {tab.label} ({tab.count})
    </button>
  ))}
</div>
```

#### Cambio 4.5: Actualizar titulo dinamico
```typescript
// Cambiar titulo segun tab activo
const getTabTitle = () => {
  switch (activeTab) {
    case 'pending': return 'Revisiones Pendientes';
    case 'in_progress': return 'Revisiones en Progreso';
    case 'completed': return 'Revisiones Completadas';
    case 'returned': return 'Revisiones Devueltas';
    default: return 'Todas las Revisiones';
  }
};

// En el JSX
<h1 className="text-2xl font-bold">{getTabTitle()}</h1>
```

---

## FASE 5: Correccion de Datos Existentes (P2)

### Problema
El review existente con ID `6e86601b-...` tiene status=completed pero sin rewards.

### Opcion A: Script SQL de Correccion
```sql
-- Verificar estado actual
SELECT mr.id, mr.status, mr.total_score, es.status as sub_status, es.xp_earned
FROM progress_tracking.manual_reviews mr
JOIN progress_tracking.exercise_submissions es ON mr.submission_id = es.id
WHERE mr.id = '6e86601b-b6bc-4ccb-9ab3-fc38d0400851';

-- Si no hay score, revertir a pending para re-evaluar
UPDATE progress_tracking.manual_reviews
SET status = 'pending', completed_at = NULL
WHERE id = '6e86601b-b6bc-4ccb-9ab3-fc38d0400851'
AND total_score IS NULL;
```

### Opcion B: Ignorar (Datos de Prueba)
Si este review es solo de pruebas en desarrollo, puede ignorarse.

---

## Orden de Implementacion Recomendado

```
FASE 1 (P0) --> FASE 2 (P0) --> FASE 3 (P1) --> FASE 4 (P1) --> FASE 5 (P2)
   |              |               |               |               |
   v              v               v               v               v
Fix Frontend   Fix Backend   Modal UX       Filtrado       Datos Legacy
(1-2 hrs)      (30 min)      (1 hr)         (2 hrs)        (30 min)
```

---

## Validaciones Post-Implementacion

### Test Manual FASE 1-2
1. Intentar completar review sin evaluar -> Debe fallar con mensaje
2. Evaluar todos los criterios -> Guardar
3. Completar review -> Submission debe tener status=graded
4. Verificar en BD: xp_earned > 0, ml_coins_earned > 0

### Test Manual FASE 3
1. Completar review exitosamente
2. Debe aparecer FeedbackModal con confetti
3. Modal debe mostrar score y rewards del estudiante

### Test Manual FASE 4
1. Navegar a /teacher/reviews
2. Tabs deben mostrar conteo correcto
3. Click en "Completados" -> Ver review calificado anteriormente
4. Filtros de modulo/ejercicio deben funcionar con cada tab

---

## Archivos Finales a Modificar

| # | Archivo | Fase | Tipo |
|---|---------|------|------|
| 1 | ReviewDetail.tsx | 1, 3 | Frontend |
| 2 | manualReviewApi.ts | 1, 4 | Frontend |
| 3 | manual-review.service.ts | 2 | Backend |
| 4 | api.config.ts | 4 | Frontend |
| 5 | useManualReviews.ts | 4 | Frontend |
| 6 | TeacherReviewPanelPage.tsx | 4 | Frontend |

**Total: 6 archivos**

---

## ADDENDUM: Analisis de Dependencias por Fase

### FASE 1 - Dependencias Identificadas

| Objeto | Dependientes | Impacto |
|--------|--------------|---------|
| `ReviewDetail.tsx` | TeacherReviewPanelPage (re-render) | Bajo |
| `handleCompleteReview()` | Solo uso interno | Ninguno |
| `transformEvaluationsToBackend()` | Linea 14-26, usado por handleSaveProgress y handleCompleteReview | Verificar consistencia |

**Hallazgo:** ReviewDetail usa `manualReviewApi` directamente, NO los hooks de mutacion (`useUpdateReview`, `useCompleteReview`). Los hooks estan definidos pero no se usan.

**Accion:** Mantener uso directo de API por ahora, pero documentar esta inconsistencia.

### FASE 2 - Dependencias Identificadas

| Objeto | Dependientes | Impacto |
|--------|--------------|---------|
| `completeReview()` | ManualReviewController.completeReview | Error 400 si totalScore null |
| `gradeSubmission()` | Solo si totalScore existe | Sin cambio |
| `claimRewards()` | Solo si gradeSubmission ejecuta | Sin cambio |

**Hallazgo:** La condicion `if (review.totalScore !== undefined)` en linea 559 es la causa raiz. Se ejecuta gradeSubmission y claimRewards SOLO si totalScore existe.

**Riesgo:** Si frontend envia sin totalScore, ahora recibira error 400 en vez de silenciosamente fallar. **Esto es comportamiento deseado.**

### FASE 3 - Dependencias Identificadas

| Objeto | Dependientes | Impacto |
|--------|--------------|---------|
| `FeedbackModal` | Componente standalone | Ninguno |
| `useToast` | NO usado en ReviewDetail | Opcional |

**Hallazgo:** FeedbackModal existe en `/shared/components/mechanics/FeedbackModal.tsx` con soporte para confetti, scores, rewards. Ya usado en flujo estudiante.

**Accion:** Importar y usar, verificar props interface.

### FASE 4 - Dependencias Identificadas

| Objeto | Dependientes | Impacto |
|--------|--------------|---------|
| `API_ENDPOINTS.teacher.reviews` | manualReviewApi.ts | Debe sincronizar |
| `ManualReviewFilters` | useManualReviews, TeacherReviewPanelPage | Agregar status |
| `findByTeacher()` (backend) | **NO usado** por frontend | Conectar |
| `/my-reviews` endpoint | Existe pero sin funcion frontend | Crear getMyReviews() |

**Hallazgo Critico:** El endpoint `GET /teacher/reviews/my-reviews` con soporte de status filtering **YA EXISTE** en backend pero **NO tiene funcion frontend**.

**Cadena de cambios:**
1. `api.config.ts` -> agregar endpoint
2. `manualReviewApi.ts` -> agregar funcion
3. `useManualReviews.ts` -> agregar hook + modificar interface
4. `TeacherReviewPanelPage.tsx` -> cambiar a nuevo hook + UI tabs

### FASE 5 - Dependencias Identificadas

| Objeto | Dependientes | Impacto |
|--------|--------------|---------|
| Review `6e86601b-...` | Solo datos de prueba | Bajo |

**Accion:** Determinar si es dato de produccion o prueba. Si prueba, ignorar.

---

## Flujos Relacionados No Documentados (Descubiertos en Analisis)

Los siguientes flujos fueron identificados durante el analisis de dependencias pero estan **fuera del alcance** de esta tarea:

| Flujo | Estado | Prioridad Futura |
|-------|--------|------------------|
| Student notification handling para `exercise_feedback` | INCOMPLETO | P2 |
| WebSocket events para reviews (`review:completed`) | NO IMPLEMENTADO | P3 |
| Achievement triggers al completar review | DESCONECTADO | P2 |
| Admin dashboard stats de reviews | PARCIAL | P3 |
| Email notification al estudiante | NO INTEGRADO | P3 |

**Recomendacion:** Crear tareas separadas para estos flujos post-implementacion de TASK-012.

---

*Plan de Correccion actualizado con dependencias: 2026-01-18*
*Pendiente: Aprobacion del usuario para proceder con implementacion*
