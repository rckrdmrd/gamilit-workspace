# TASK-2026-01-18-012: Analisis Consolidado

## Resumen Ejecutivo

Se identificaron **4 issues** en la pagina `/teacher/reviews`, de los cuales **2 son criticos** ya que afectan la funcionalidad core de gamificacion:

| ID | Issue | Severidad | Tipo |
|----|-------|-----------|------|
| ISSUE-001 | Solo muestra reviews pendientes | Medium | Feature |
| ISSUE-002 | Usa alert() en lugar de modal | Low | UX |
| ISSUE-003 | Recompensas no otorgadas al calificar | **Critical** | Bug |
| ISSUE-004 | Rubric scores no persistidos | **Critical** | Bug |

---

## 1. ISSUE-001: Filtrado de Reviews (Solo Pendientes)

### Descripcion
La pagina `/teacher/reviews` solo muestra reviews con status `pending`. Los reviews ya calificados (`completed`, `in_progress`, `returned`) no son visibles.

### Analisis Tecnico

#### Frontend - Hook useManualReviews
**Archivo:** `apps/frontend/src/apps/teacher/hooks/useManualReviews.ts`

```typescript
// Linea 35-39: Interface SIN campo status
export interface ManualReviewFilters {
  exerciseId?: string;
  moduleId?: string;
  classroomId?: string;
  // FALTA: status?: ReviewStatus;
}

// Linea 62-75: Hardcoded a getPendingReviews
export function useManualReviews(filters?: ManualReviewFilters) {
  return useQuery<ManualReview[], Error>({
    queryKey: manualReviewKeys.pending(filters), // <-- PENDING hardcoded
    queryFn: () => manualReviewApi.getPendingReviews(filters), // <-- Solo pending
    // ...
  });
}
```

#### Frontend - API Client
**Archivo:** `apps/frontend/src/shared/api/manualReviewApi.ts`

```typescript
// Linea 186-209: Solo endpoint /pending
export const getPendingReviews = async (filters?) => {
  const { data } = await apiClient.get<...>(
    API_ENDPOINTS.teacher.reviews.pending, // <-- /teacher/reviews/pending
    { params: filters },
  );
  // ...
}
```

#### Backend - Endpoint Existente pero No Usado
**Archivo:** `apps/backend/src/modules/teacher/controllers/manual-review.controller.ts`

```typescript
// Linea 216-236: Endpoint que SOPORTA status pero NO se usa
@Get('my-reviews')
@ApiQuery({
  name: 'status',
  required: false,
  enum: ['pending', 'in_progress', 'completed', 'returned'],
})
async getMyReviews(
  @Query('status') status?: 'pending' | 'in_progress' | 'completed' | 'returned',
): Promise<ManualReview[]> {
  return this.reviewService.findByTeacher(teacherId, status);
}
```

### Gap Identificado

| Componente | Estado Actual | Necesario |
|------------|---------------|-----------|
| ManualReviewFilters | Sin campo status | Agregar `status?: ReviewStatus` |
| useManualReviews | Llama getPendingReviews | Llamar endpoint flexible |
| API Config | Solo `/pending` | Agregar `/my-reviews` |
| TeacherReviewPanelPage | Sin filtro UI | Agregar tabs/dropdown por status |

---

## 2. ISSUE-002: Alert Nativo en Lugar de Modal

### Descripcion
Al completar una calificacion, se usa `alert()` nativo del navegador en lugar del sistema de modales consistente con la aplicacion.

### Analisis Tecnico

#### Sistema de Modales Disponible

| Componente | Ubicacion | Uso Recomendado |
|------------|-----------|-----------------|
| **FeedbackModal** | `shared/components/mechanics/FeedbackModal.tsx` | Celebraciones, rewards, scores |
| **Modal** | `shared/components/common/Modal.tsx` | Contenido generico |
| **ConfirmDialog** | `shared/components/common/ConfirmDialog.tsx` | Confirmaciones |
| **Toast** | `shared/components/base/Toast.tsx` | Notificaciones rapidas |

#### FeedbackModal - Caracteristicas
- Confetti animado para celebraciones
- Iconos por tipo (success, error, partial, info)
- Display de score, XP, ML Coins
- Feedback detallado por seccion
- Botones de accion (Next, Retry, Close)

#### Patron Recomendado para Teacher Reviews

```typescript
// Despues de completar review con score
<FeedbackModal
  isOpen={showSuccessModal}
  feedback={{
    type: 'success',
    title: 'Revision Completada',
    message: `Has calificado el ejercicio de ${studentName}`,
    score: reviewScore,
    xpEarned: rewardsResult?.xp_earned || 0,
    mlCoinsEarned: rewardsResult?.ml_coins_earned || 0,
    showConfetti: true,
  }}
  onClose={handleCloseSuccess}
  onNext={handleNextReview}
/>
```

---

## 3. ISSUE-003: Recompensas No Otorgadas (CRITICO)

### Evidencia en Base de Datos

```
Review ID: 6e86601b-b6bc-4ccb-9ab3-fc38d0400851
Review Status: completed          <- Marcado como completado
Total Score: NULL                 <- SIN SCORE!
Rubric Scores: {}                 <- VACIO!

Submission Status: submitted      <- NUNCA gradeado!
Submission Score: 0
XP Earned: 0                      <- SIN REWARDS!
ML Coins Earned: 0
Graded At: NULL                   <- gradeSubmission() NUNCA ejecutado
```

### Analisis del Flujo

#### Flujo Esperado (segun codigo)
```
completeReview(reviewId)
  |
  +-> Update review.status = 'completed'
  |
  +-> IF review.totalScore !== undefined:
  |     +-> gradeSubmission(submissionId, {final_score: totalScore})
  |     +-> claimRewards(submissionId)
  |
  +-> Return { review, rewards }
```

#### Lo Que Ocurrio (segun evidencia)
```
completeReview(reviewId)
  |
  +-> Update review.status = 'completed'  <- EJECUTADO
  |
  +-> IF review.totalScore !== undefined: <- FALSO! totalScore es NULL
  |     (SKIP - condicion no cumplida)
  |
  +-> Return { review, rewards: null }
```

### Causa Raiz
El `totalScore` no se esta guardando en el review antes de llamar `completeReview()`. La condicion en linea 559 falla:

```typescript
// manual-review.service.ts linea 559
if (review.submissionId && review.totalScore !== undefined) {
  // Este bloque NUNCA se ejecuta porque totalScore es NULL
  await this.submissionService.gradeSubmission(review.submissionId, {...});
  await this.submissionService.claimRewards(review.submissionId);
}
```

### Hipotesis
1. El frontend llama `completeReview()` sin haber guardado primero los rubric_scores
2. O el frontend no calcula/envia totalScore antes de completar
3. O hay un bug en el metodo que guarda rubric_scores

---

## 4. ISSUE-004: Rubric Scores No Persistidos (CRITICO)

### Evidencia
```sql
rubric_scores = {}  -- VACIO cuando deberia tener evaluaciones
```

### Analisis

#### Frontend - ReviewDetail.tsx
Verificar si `handleSaveEvaluation()` esta siendo llamado antes de `handleCompleteReview()`.

#### Backend - saveEvaluation()
**Archivo:** `apps/backend/src/modules/teacher/services/manual-review.service.ts`

```typescript
// Metodo que guarda rubric_scores
async saveEvaluation(reviewId: string, data: SaveEvaluationDto) {
  const review = await this.reviewRepo.findOne({...});
  review.rubricScores = data.rubricScores;
  review.totalScore = data.totalScore; // <-- ESTE VALOR ES CRITICO
  review.generalFeedback = data.generalFeedback;
  return this.reviewRepo.save(review);
}
```

### Hipotesis de Fallo
1. `handleSaveEvaluation()` no se llama antes de completar
2. O `handleCompleteReview()` se llama sin esperar que save termine
3. O hay error silencioso en saveEvaluation

---

## 5. Diagrama de Flujo Correcto vs Actual

### Flujo CORRECTO
```
[Usuario evalua con rubrica]
         |
         v
[Click "Guardar Borrador"]
         |
         v
[saveEvaluation()] --> rubric_scores, totalScore guardados
         |
         v
[Click "Completar Review"]
         |
         v
[completeReview()] --> totalScore existe
         |
         v
[gradeSubmission()] --> submission.status = 'graded'
         |
         v
[claimRewards()] --> XP, ML Coins asignados
         |
         v
[FeedbackModal] --> Muestra recompensas
```

### Flujo ACTUAL (Bug)
```
[Usuario evalua con rubrica]
         |
         v
[Click "Completar Review"] <-- SALTA el guardado!
         |
         v
[completeReview()] --> totalScore = NULL
         |
         v
[IF totalScore !== undefined] <-- FALSO
         |
         v
[Skip gradeSubmission/claimRewards]
         |
         v
[alert("Review completado")] <-- Sin rewards
```

---

## 6. Resumen de Archivos a Modificar

### Frontend (5-6 archivos)

| Archivo | Cambios Requeridos |
|---------|-------------------|
| `TeacherReviewPanelPage.tsx` | Agregar tabs/filtro por status, importar FeedbackModal |
| `useManualReviews.ts` | Agregar status a filters, crear hook flexible |
| `ReviewDetail.tsx` | Forzar save antes de complete, usar FeedbackModal |
| `manualReviewApi.ts` | Agregar funcion getMyReviews con status |
| `api.config.ts` | Agregar endpoint myReviews |

### Backend (1-2 archivos)

| Archivo | Cambios Requeridos |
|---------|-------------------|
| `manual-review.service.ts` | Validar que totalScore existe antes de completar |
| `manual-review.controller.ts` | Sin cambios (endpoint my-reviews ya existe) |

---

## 7. Riesgos y Consideraciones

### Riesgo 1: Datos Inconsistentes Existentes
El review ya completado con status=completed pero sin rewards necesita correccion manual o script de migracion.

### Riesgo 2: Regresion en Flujo
Cambios en el flujo de guardado podrian afectar usuarios que ya saben usar el sistema actual.

### Riesgo 3: WebSocket Updates
El sistema emite eventos WebSocket para rewards. Verificar que frontend los maneja.

---

*Analisis completado: 2026-01-18*
