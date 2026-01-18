# TASK-2026-01-18-008: Cambios Implementados
## Fix Teacher Reviews Page - Rubric Data + Infinite Loop

**Fecha:** 2026-01-18
**Estado:** Completado

---

## 1. Resumen de Problemas

### Problema 1: Rúbrica no disponible en Frontend
- **Síntoma:** `RubricEvaluator` recibía `rubric=undefined`
- **Causa raíz:** Backend `enrichReview()` no incluía la rúbrica
- **Datos:** Rúbricas existían en tabla `exercise_type_rubrics` pero no se cargaban

### Problema 2: Error "Maximum update depth exceeded"
- **Síntoma:** Bucle infinito de re-renderizado en React
- **Causa raíz:** Callback `handleEvaluationChange` no memoizado con `useCallback`
- **Efecto:** `useEffect` en `RubricEvaluator` disparaba `onChange` continuamente

### Problema 3: Respuestas del estudiante no se muestran
- **Síntoma:** La sección "Respuestas del Estudiante" aparecía vacía
- **Causa raíz:** Frontend esperaba `submission.answers` pero backend retorna `answer_data` (snake_case)
- **Fix:** Actualizar frontend para soportar ambos nombres de campo

---

## 2. Archivos Modificados

### 2.1 Frontend

#### ReviewDetail.tsx
**Path:** `apps/frontend/src/apps/teacher/components/review-panel/ReviewDetail.tsx`

**Cambios:**
1. Agregado import `useCallback` de React
2. Memoizado `handleEvaluationChange` con `useCallback`
3. Memoizado `handleValidationChange` con `useCallback`
4. Soportar tanto `answers` como `answer_data` para datos del submission

```typescript
// Antes
const handleEvaluationChange = (newEvaluations, newGeneralFeedback, newTotalScore) => {
  setEvaluations(newEvaluations);
  setGeneralFeedback(newGeneralFeedback);
  setTotalScore(newTotalScore);
};

// Después
const handleEvaluationChange = useCallback((newEvaluations, newGeneralFeedback, newTotalScore) => {
  setEvaluations(newEvaluations);
  setGeneralFeedback(newGeneralFeedback);
  setTotalScore(newTotalScore);
}, []);

// FIX TASK-2026-01-18-008: Support both answers and answer_data field names
answerData={((review.submission)?.answers || (review.submission)?.answer_data || {})
```

#### manualReviewApi.ts
**Path:** `apps/frontend/src/shared/api/manualReviewApi.ts`

**Cambios:**
1. Agregado campo `answer_data` al tipo `submission` en la interfaz `ManualReview`

```typescript
submission?: {
  id: string;
  answers?: unknown;
  // FIX TASK-2026-01-18-008: Backend returns answer_data (snake_case)
  answer_data?: unknown;
  submittedAt?: Date;
  submitted_at?: Date;
};
```

#### RubricEvaluator.tsx
**Path:** `apps/frontend/src/shared/components/mechanics/RubricEvaluator.tsx`

**Cambios:**
1. Agregado import `useRef` y `AlertTriangle` icon
2. Agregado `isInitializedRef` para tracking de inicialización
3. Agregado `hasValidRubric` para validación de rubric
4. Modificados todos los `useEffect` para verificar rubric válido
5. Agregado early return con UI de fallback cuando rubric no está disponible

```typescript
// Nuevo: Tracking de inicialización
const isInitializedRef = useRef(false);
const hasValidRubric = rubric && Array.isArray(rubric) && rubric.length > 0;

// Nuevo: UI de fallback cuando rubric no está disponible
if (!hasValidRubric) {
  return (
    <div className="rounded-detective bg-yellow-50 ...">
      <AlertTriangle className="h-12 w-12 ..." />
      <h4>Rubrica no disponible</h4>
      <p>Este ejercicio no tiene una rubrica de evaluacion configurada.</p>
    </div>
  );
}
```

### 2.2 Backend

#### manual-review.service.ts
**Path:** `apps/backend/src/modules/teacher/services/manual-review.service.ts`

**Cambios:**
1. Import de `ExerciseTypeRubric` y `RubricCriteria`
2. Inyección de `rubricRepo` en constructor
3. Actualización de `EnrichedManualReview` interface para incluir `rubric`
4. Modificación de `enrichReview()` para cargar rúbrica por exercise_type
5. Modificación de `enrichReviews()` para cargar rúbricas en batch

```typescript
// Nuevo interface con rubric
export interface EnrichedManualReview extends ManualReview {
  student?: { id, name, email };
  exercise?: { id, title, moduleId, type };
  rubric?: Array<{
    id: string;
    name: string;
    description: string;
    maxPoints: number;
    weight?: number;
  }>;
}

// Nueva lógica en enrichReview
if (exerciseType) {
  const rubricData = await this.rubricRepo.findOne({
    where: { exerciseType, isDefault: true },
  });
  if (rubricData && rubricData.criteria) {
    enriched.rubric = rubricData.criteria.map((criterion, index) => ({
      id: criterion.name?.toLowerCase().replace(/\s+/g, '_') || `criterion_${index}`,
      name: criterion.name,
      description: criterion.description,
      maxPoints: Math.max(...(criterion.levels?.map(l => l.score) || [100])),
      weight: criterion.weight,
    }));
  }
}
```

#### teacher.module.ts
**Path:** `apps/backend/src/modules/teacher/teacher.module.ts`

**Cambios:**
1. Import de `ExerciseTypeRubric` entity
2. Agregado a `TypeOrmModule.forFeature` para datasource 'educational'

---

## 3. Validaciones

| Validación | Resultado |
|------------|-----------|
| ESLint Backend | ✅ Pasó |
| ESLint Frontend | ✅ Pasó |
| TypeScript Build Backend | ✅ Pasó |
| TypeScript Build Frontend | ✅ Pasó |

---

## 4. Impacto

### Antes
- Teacher/reviews page: Error "Maximum update depth exceeded"
- `RubricEvaluator`: No podía renderizar (rubric undefined)
- Evaluación manual: No funcionaba

### Después
- Teacher/reviews page: Carga correctamente
- `RubricEvaluator`: Recibe y muestra rúbrica desde `exercise_type_rubrics`
- Evaluación manual: Puede proceder con criterios de evaluación
- UI de fallback: Mensaje claro cuando rúbrica no está configurada

---

## 5. Datos de Referencia

### Rúbricas en BD
12 rúbricas definidas en `exercise_type_rubrics`:
- M3 (5): tribunal_opiniones, debate_digital, analisis_fuentes, podcast_argumentativo, matriz_perspectivas
- M4 (4): verificador_fake_news, infografia_interactiva, navegacion_hipertextual, analisis_memes
- M5 (3): diario_multimedia, comic_digital, video_carta

### Test Case
- Usuario: student@gamilit.com
- Submission: M3 tribunal_opiniones (status=submitted)
- Manual Review: status=pending, reviewer_id asignado

---

## 6. Notas Técnicas

### React Hooks Rules
El error de lint inicial ("React Hook is called conditionally") se resolvió moviendo el early return DESPUÉS de todos los hooks. Los hooks deben llamarse en el mismo orden en cada render.

### Cross-Schema Data Loading
El backend utiliza múltiples datasources PostgreSQL. La rúbrica se carga desde `educational` datasource mientras que el review está en `progress` datasource. Por esto se usa un enfoque de "enrichment" en lugar de relaciones TypeORM.

### Performance
La función `enrichReviews` usa carga en batch para minimizar queries a la BD:
- 1 query para perfiles
- 1 query para ejercicios
- 1 query para rúbricas (por tipos únicos)
