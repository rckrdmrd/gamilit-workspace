# ANALISIS-TASK-2026-01-18-011: Teacher Reviews - Mejoras de Visualización y Gamificación

**Fecha:** 2026-01-18
**Tipo:** Análisis Detallado + Plan de Implementación
**Estado:** En Progreso
**Prioridad:** Alta

---

## 1. RESUMEN EJECUTIVO

Este documento presenta el análisis detallado de la página **Teacher Reviews** (`/teacher/reviews`) para identificar mejoras en:
1. Visualización de respuestas (actualmente mostradas como JSON)
2. Corrección del botón de guardar evaluación
3. Integración de mecánicas de gamificación (cálculo de recompensas)

---

## 2. ARQUITECTURA ACTUAL

### 2.1 Componentes Frontend

| Componente | Archivo | Líneas Clave | Descripción |
|------------|---------|--------------|-------------|
| TeacherReviewPanelPage | `apps/teacher/pages/TeacherReviewPanelPage.tsx` | 1-214 | Página principal |
| ReviewList | `apps/teacher/components/review-panel/ReviewList.tsx` | 1-206 | Listado de reviews |
| ReviewDetail | `apps/teacher/components/review-panel/ReviewDetail.tsx` | 1-430 | Detalle y evaluación |
| RubricEvaluator | `shared/components/mechanics/RubricEvaluator.tsx` | 1-325 | Evaluador de rúbrica |
| ExerciseContentRenderer | `shared/components/mechanics/ExerciseContentRenderer.tsx` | 1-687 | Renderizador de respuestas |

### 2.2 Hooks y API

| Hook/API | Archivo | Descripción |
|----------|---------|-------------|
| useManualReviews | `apps/teacher/hooks/useManualReviews.ts` | Gestión de reviews con React Query |
| useManualReviewConfig | `apps/teacher/hooks/useManualReviewConfig.ts` | Config dinámica (reemplaza hardcoded) |
| manualReviewApi | `shared/api/manualReviewApi.ts` | Cliente API para endpoints |

### 2.3 Backend Services

| Servicio | Archivo | Responsabilidad |
|----------|---------|-----------------|
| ManualReviewService | `modules/teacher/services/manual-review.service.ts` | Lógica de reviews |
| ExerciseSubmissionService | `modules/progress/services/exercise-submission.service.ts` | Calificación y rewards |
| ExerciseRewardsService | `modules/progress/services/grading/exercise-rewards.service.ts` | Cálculo de XP/ML Coins |

---

## 3. PROBLEMA 1: RESPUESTAS MOSTRADAS COMO JSON

### 3.1 Diagnóstico

**Ubicación del problema:** `ExerciseContentRenderer.tsx`

El componente usa un switch-case para renderizar respuestas según el tipo de ejercicio:

```typescript
switch (exerciseType) {
  case 'podcast_argumentativo': return <PodcastRenderer />;
  case 'verdadero_falso': return <VerdaderoFalsoRenderer />;
  // ... más casos
  default: return <FallbackRenderer />; // ← PROBLEMA
}
```

**Causa raíz:**
1. Tipos de ejercicio no reconocidos caen al `FallbackRenderer`
2. El `FallbackRenderer` muestra objetos complejos con `JSON.stringify()` (líneas 658-661)
3. Posible discrepancia entre `exercise.type` y `exercise.exercise_type`

### 3.2 Tipos Soportados vs No Soportados

**Tipos con renderizador específico (funcionan correctamente):**
- M1: `podcast_argumentativo`
- M1-M2: `verdadero_falso`, `completar_espacios`, `crucigrama`, `sopa_letras`, `mapa_conceptual`, `timeline`, `emparejamiento`
- M2: `lectura_inferencial`, `puzzle_contexto`, `detective_textual`, `rueda_inferencias`, `causa_efecto`, `prediccion_narrativa`
- M3: `analisis_fuentes`, `debate_digital`, `matriz_perspectivas`, `tribunal_opiniones`
- M4-M5: `verificador_fake_news`, `quiz_tiktok`, `analisis_memes`, `infografia_interactiva`, `navegacion_hipertextual`, `diario_multimedia`, `comic_digital`, `video_carta`

**Tipos que caen a FallbackRenderer:**
- Cualquier tipo no listado arriba
- Tipo `unknown` (default cuando no hay type)
- Tipos con nomenclatura diferente en BD vs frontend

### 3.3 Flujo de Datos

```
ReviewDetail.tsx línea 302-305:
  → exerciseType = review.exercise?.type || review.exercise?.exercise_type || 'unknown'
  → answerData = submission.answers || submission.answer_data || {}

ExerciseContentRenderer.tsx:
  → switch(exerciseType)
  → Si no coincide → FallbackRenderer
  → Para objetos complejos → JSON.stringify()
```

### 3.4 Propuesta de Solución

1. **Mapeo exhaustivo de tipos:** Agregar todos los tipos de ejercicio de M4-M5 al switch
2. **Mejorar FallbackRenderer:** Hacer más inteligente el renderizado de objetos anidados
3. **Normalización de tipos:** Asegurar consistencia entre `type` y `exercise_type`

---

## 4. PROBLEMA 2: BOTÓN DE GUARDAR EVALUACIÓN

### 4.1 Diagnóstico

**Ubicación:** `ReviewDetail.tsx` líneas 404-412

```typescript
<button
  onClick={handleSaveProgress}
  disabled={saving || evaluations.length === 0}  // ← Condición de deshabilitado
  className="..."
>
  <Save className="h-4 w-4" />
  {saving ? 'Guardando...' : 'Guardar Borrador'}
</button>
```

**Flujo de handleSaveProgress (líneas 86-111):**
1. Transforma evaluaciones al formato backend: `{ rubricScores, detailedFeedback }`
2. Llama a `manualReviewApi.updateReview()`
3. Muestra mensaje de éxito/error

**Posibles problemas identificados:**
1. El botón está deshabilitado si `evaluations.length === 0`
2. La transformación de datos puede fallar si los criterionIds no coinciden
3. El endpoint PUT `/teacher/reviews/:id` puede requerir campos obligatorios

### 4.2 Verificación Backend

**Endpoint:** PUT `/api/v1/teacher/reviews/:id`

**DTO esperado:**
```typescript
{
  rubricScores?: Record<string, number>;     // { "creativity": 25 }
  totalScore?: number;                        // 0-100
  generalFeedback?: string;
  detailedFeedback?: Record<string, unknown>;
  status?: 'in_progress';                     // Estado
}
```

**Método updateReview (servicio líneas 489-516):**
- Actualiza campos si están presentes en el DTO
- No hace validaciones adicionales
- Retorna el review actualizado

### 4.3 Propuesta de Solución

**Verificar:**
1. ¿El problema es que el botón no se habilita?
2. ¿El problema es que al guardar da error?
3. ¿El problema es que no persiste los datos?

---

## 5. PROBLEMA 3: INTEGRACIÓN DE GAMIFICACIÓN

### 5.1 Estado Actual

La integración de gamificación **YA ESTÁ IMPLEMENTADA** en el flujo de `completeReview`:

```
handleCompleteReview() (frontend)
  ↓
manualReviewApi.updateReview() - Guarda evaluación
  ↓
manualReviewApi.completeReview() - Marca como completado
  ↓
ManualReviewService.completeReview() (backend)
  ↓
├── submissionService.gradeSubmission() - Califica submission
│     → submission.score = totalScore
│     → submission.status = 'graded'
│
└── submissionService.claimRewards() - Distribuye recompensas
      ↓
      ├── ExerciseRewardsService.calculateRewards()
      │     → XP = Base × (score/maxScore) × Multipliers
      │     → ML Coins = Base × Difficulty Factor
      │
      ├── UserStatsService.addXp(userId, xpEarned)
      ├── MLCoinsService.addCoins(userId, mlCoinsEarned)
      └── Verificar promoción de rango (rankUp)
```

### 5.2 Fórmulas de Cálculo de Recompensas

**XP Ganado:**
```
XP = (score / maxScore) × baseXP × difficultyMultiplier × bonusMultipliers

Donde:
- baseXP: Configurado en exercise.xp_reward (default: 20)
- difficultyMultiplier: easy=1.0, medium=1.25, hard=1.5, expert=2.0
- bonusMultipliers:
  - Perfecta sin hints: ×1.5
  - Sin hints: ×1.2
  - Primer intento: ×1.1
```

**ML Coins Ganadas:**
```
ML Coins = baseMlCoins × (score / maxScore) × difficultyFactor + bonuses

Donde:
- baseMlCoins: Configurado en exercise.ml_coins_reward (default: 5)
- difficultyFactor: Escala según dificultad
- bonuses: Score perfecto (+3)
```

### 5.3 Promoción de Rango Maya

Cuando el XP total supera el umbral del siguiente rango:
- Se actualiza `user_stats.current_rank`
- Se otorga bonus de ML Coins por promoción
- Se notifica al estudiante

### 5.4 Visualización Actual en Frontend

`ReviewDetail.tsx` líneas 244-290 muestra las recompensas:
- XP ganado
- ML Coins ganadas
- Promoción de rango (si aplica)

### 5.5 Posibles Mejoras

1. **Mostrar preview de recompensas ANTES de calificar**
2. **Permitir ajuste manual de XP/ML Coins por el docente**
3. **Integrar achievements que se desbloquean con la evaluación**

---

## 6. OBJETOS DEPENDIENTES

### 6.1 Frontend

```
TeacherReviewPanelPage
├── ReviewList
│   └── ManualReview (tipo)
└── ReviewDetail
    ├── ExerciseContentRenderer
    │   ├── PodcastRenderer
    │   ├── VerdaderoFalsoRenderer
    │   ├── CompletarEspaciosRenderer
    │   ├── CrucigramaRenderer
    │   ├── SopaLetrasRenderer
    │   ├── MapaConceptualRenderer
    │   ├── TimelineRenderer
    │   ├── EmparejamientoRenderer
    │   ├── MultipleChoiceRenderer
    │   ├── TextResponseRenderer
    │   ├── MultimediaRenderer
    │   └── FallbackRenderer  ← A mejorar
    └── RubricEvaluator
        └── RubricCriterion (tipo)
```

### 6.2 Backend

```
ManualReviewController
├── ManualReviewService
│   ├── ManualReview (entity)
│   ├── ExerciseSubmission (entity)
│   ├── Profile (entity - auth)
│   ├── Exercise (entity - educational)
│   ├── ExerciseTypeRubric (entity - educational)
│   └── ExerciseSubmissionService
│       ├── gradeSubmission()
│       └── claimRewards()
│           ├── ExerciseRewardsService.calculateRewards()
│           ├── UserStatsService.addXp()
│           ├── MLCoinsService.addCoins()
│           └── RanksService (promoción)
└── AuditService (auditoría)
    NotificationService (notificaciones)
```

### 6.3 Base de Datos

| Schema | Tabla | Rol |
|--------|-------|-----|
| progress_tracking | manual_reviews | Almacena evaluaciones |
| progress_tracking | exercise_submissions | Almacena envíos |
| educational_content | exercises | Catálogo de ejercicios |
| educational_content | exercise_type_rubrics | Rúbricas por tipo |
| gamification_system | user_stats | XP, ML Coins, rank |
| gamification_system | maya_ranks | Configuración de rangos |
| gamification_system | ml_coins_transactions | Historial de transacciones |

---

## 7. FLUJOS A ACTUALIZAR

### 7.1 Flujo de Visualización de Respuestas

```
ACTUAL:
submission.answer_data → ExerciseContentRenderer → switch(type) → Renderer

PROPUESTO:
submission.answer_data → ExerciseContentRenderer →
  → Normalizar tipo
  → switch(normalizedType)
  → Renderer específico o SmartFallbackRenderer
```

### 7.2 Flujo de Guardar Evaluación

```
ACTUAL:
evaluations[] → transformToBackend() → updateReview() → DB

VERIFICAR:
- Mapeo correcto de criterionIds
- Campos requeridos completos
- Manejo de errores
```

### 7.3 Flujo de Gamificación

```
ACTUAL (ya implementado):
completeReview() → gradeSubmission() → claimRewards() →
  → calculateRewards() → addXp() + addCoins() → checkRankUp()

POSIBLES MEJORAS:
- Preview de rewards antes de confirmar
- Ajuste manual por docente
- Integración con achievements
```

---

## 8. PLAN DE IMPLEMENTACIÓN

### Fase 1: Análisis y Clarificación (COMPLETADO)
- [x] Explorar componentes frontend
- [x] Mapear servicios backend
- [x] Identificar objetos dependientes
- [x] Documentar flujos actuales

### Fase 2: Diseño de Soluciones (PENDIENTE)
- [ ] Definir formato de visualización para cada tipo de respuesta
- [ ] Especificar corrección del botón guardar
- [ ] Diseñar mejoras de integración de gamificación

### Fase 3: Implementación (PENDIENTE)
- [ ] Mejorar ExerciseContentRenderer
- [ ] Corregir flujo de guardar
- [ ] Implementar mejoras de gamificación

### Fase 4: Documentación (PENDIENTE)
- [ ] Actualizar especificaciones técnicas
- [ ] Actualizar flujos en docs/
- [ ] Crear definiciones de tipos de respuesta

---

## 9. PREGUNTAS PARA CLARIFICACIÓN

Para proceder con el diseño e implementación, necesito clarificar:

1. **Respuestas JSON:**
   - ¿Qué tipos de ejercicio específicos muestran JSON?
   - ¿Hay ejemplos de la data que se muestra como JSON?

2. **Botón guardar:**
   - ¿El problema es que no se habilita?
   - ¿El problema es que da error al guardar?
   - ¿El problema es que no persiste los datos?

3. **Gamificación:**
   - ¿Se requiere preview de recompensas antes de calificar?
   - ¿El docente debe poder ajustar las recompensas?
   - ¿Hay achievements específicos a desbloquear?

---

## 10. ARCHIVOS CLAVE PARA MODIFICAR

| Archivo | Modificación |
|---------|-------------|
| `ExerciseContentRenderer.tsx` | Agregar tipos faltantes, mejorar FallbackRenderer |
| `ReviewDetail.tsx` | Corregir flujo de guardar (si aplica) |
| `manualReviewApi.ts` | Ajustar transformación de datos (si aplica) |
| `exercise-rewards.service.ts` | Ajustar cálculo (si aplica) |
| Documentación | Crear definiciones de tipos de respuesta |

---

## 11. DIAGNÓSTICO PROFUNDO: BOTÓN GUARDAR NO FUNCIONA

### 11.1 Causa Probable Identificada

El `RubricEvaluator` muestra "Rúbrica no disponible" si `review.rubric` es undefined o vacío:

```typescript
// RubricEvaluator.tsx líneas 133-143
if (!hasValidRubric) {
  return (
    <div className="rounded-detective bg-yellow-50 ...">
      <h4>Rubrica no disponible</h4>
      ...
    </div>
  );
}
```

**Consecuencia:** Si la rúbrica no se carga, las evaluaciones nunca se inicializan y el botón permanece deshabilitado (`disabled={saving || evaluations.length === 0}`).

### 11.2 Verificación de Rúbricas en BD

✅ **TODAS las rúbricas están configuradas en BD** (12 rúbricas para M3, M4, M5)

### 11.3 Problema: Cadena de Datos

El problema está en cómo fluyen los datos:

```
BD: exercise_type_rubrics (tiene datos) ✅
  ↓
Backend: ManualReviewService.enrichReview() (debe cargar rubric)
  ↓
Frontend: review.rubric (puede llegar undefined) ❌
  ↓
RubricEvaluator: hasValidRubric = false → Botón deshabilitado
```

### 11.4 Verificación Necesaria

Revisar `enrichReview()` en el backend:
- ¿Se llama `findById()` que enriquece el review?
- ¿El frontend llama al endpoint correcto?
- ¿Se mapea correctamente el ejercicio type?

---

## 12. DIAGNÓSTICO PROFUNDO: CÁLCULO DE RECOMPENSAS

### 12.1 Servicios Duplicados (ERROR ALTA)

Existen dos servicios que calculan recompensas:

| Servicio | Archivo | ¿Se usa? |
|----------|---------|----------|
| ExerciseRewardsService | grading/exercise-rewards.service.ts | ❌ NO |
| ExerciseSubmissionService | exercise-submission.service.ts | ✅ SÍ |

**Riesgo:** Las fórmulas pueden divergir si se modifican en paralelo.

### 12.2 Fórmula Actual en Uso

**XP:**
```
xpEarned = baseXpReward × (score/maxScore) × rankMultiplier
+ perfectBonus (50 XP si score=100 y sin hints)
- hintPenalty (5 XP por hint)
```

**ML Coins:**
```
mlCoinsEarned = baseMlCoinsReward × (score/maxScore)
+ perfectBonus (10 coins si score=100 y sin hints)
- mlCoinsSpent (comodines usados)
```

### 12.3 Integración con Achievements

**Ya está implementada** en `gradeSubmission()`:
```typescript
const earned = await this.achievementsService.detectAndGrantEarned(submission.user_id);
```

**Problema:** Es no bloqueante - si falla, no se notifica al usuario.

---

## 13. PLAN DE IMPLEMENTACIÓN DETALLADO

### Fase 1: Diagnóstico del Botón Guardar (Prioridad Alta)

**Objetivo:** Identificar por qué el botón no hace nada

**Acciones:**
1. Verificar que el endpoint GET `/teacher/reviews/:id` retorna `rubric` poblado
2. Verificar que el frontend usa `useManualReviewDetail()` correctamente
3. Agregar logs temporales para diagnóstico
4. Si el problema es backend: corregir `enrichReview()`
5. Si el problema es frontend: corregir el hook/componente

**Archivos a modificar:**
- `manual-review.service.ts` (backend)
- `useManualReviews.ts` (frontend)
- `ReviewDetail.tsx` (frontend)

### Fase 2: Visualización de Respuestas M3, M4, M5 (Prioridad Media)

**Objetivo:** Asegurar que todos los tipos de ejercicio muestren respuestas formateadas

**Acciones:**
1. Validar que los tipos en switch coinciden con `exercise_type` de BD
2. Agregar renderizadores específicos para tipos faltantes
3. Mejorar `FallbackRenderer` para objetos estructurados
4. Crear mapping de tipos de ejercicio a renderizadores

**Archivos a modificar:**
- `ExerciseContentRenderer.tsx`

### Fase 3: Corrección de Gamificación (Prioridad Media)

**Objetivo:** Unificar lógica de cálculo y mejorar integración con achievements

**Acciones:**
1. Usar `ExerciseRewardsService` como fuente única de cálculo
2. Inyectar en `ExerciseSubmissionService`
3. Hacer que achievements sean "bloqueantes" (con retry)
4. Agregar más tipos de achievements para evaluaciones manuales

**Archivos a modificar:**
- `exercise-submission.service.ts`
- `exercise-rewards.service.ts`
- `achievements.service.ts`

### Fase 4: Documentación (Prioridad Baja)

**Objetivo:** Documentar todos los cambios y flujos

**Acciones:**
1. Actualizar PORTAL-TEACHER-FLOWS.md
2. Crear definiciones de tipos de respuesta
3. Documentar fórmulas de gamificación
4. Actualizar inventarios

---

## 14. MATRIZ DE CAMBIOS

| Componente | Cambio | Prioridad | Complejidad | Riesgo |
|------------|--------|-----------|-------------|--------|
| ReviewDetail.tsx | Debug rubric | Alta | Baja | Bajo |
| useManualReviews.ts | Verificar fetch | Alta | Baja | Bajo |
| manual-review.service.ts | Verificar enrich | Alta | Media | Medio |
| ExerciseContentRenderer | Agregar tipos | Media | Media | Bajo |
| FallbackRenderer | Mejorar render | Media | Media | Bajo |
| exercise-submission.service | Usar RewardsService | Media | Alta | Alto |
| achievements.service | Hacer bloqueante | Media | Media | Medio |

---

## 15. PRÓXIMOS PASOS

1. **Inmediato:** Diagnosticar por qué `review.rubric` llega vacío
2. **Corto plazo:** Corregir botón guardar
3. **Mediano plazo:** Mejorar visualización de respuestas
4. **Largo plazo:** Unificar servicios de gamificación

---

*Análisis generado por Arquitecto Full-Stack*
*Fecha: 2026-01-18*
*Actualizado con diagnóstico profundo y plan de implementación*
