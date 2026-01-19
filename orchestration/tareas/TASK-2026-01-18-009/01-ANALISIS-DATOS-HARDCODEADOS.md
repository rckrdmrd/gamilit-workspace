# TASK-2026-01-18-009: Análisis de Datos Hardcodeados
## Erradicación de Constantes que Deberían Venir de BD

**Fecha:** 2026-01-18
**Principio:** "Datos de producción siempre desde BD, nunca hardcodeados"

---

## 1. Datos Hardcodeados Identificados

### 1.1 Frontend

#### `manualReviewExercises.ts` (138 líneas) - P1
**Path:** `apps/frontend/src/apps/teacher/constants/manualReviewExercises.ts`

```typescript
// HARDCODED - Debería venir de BD
export const MANUAL_REVIEW_MODULES = [
  { id: 'module-3', name: 'Comprensión Crítica', number: 3 },
  { id: 'module-4', name: 'Lectura Digital', number: 4 },
  { id: 'module-5', name: 'Producción Lectora', number: 5 },
];

export const MANUAL_REVIEW_EXERCISES: ManualReviewExercise[] = [
  // 12 ejercicios hardcodeados...
];
```

**Problema:**
- Los módulos y ejercicios están hardcodeados
- Si se agregan nuevos ejercicios en BD, no aparecen
- Desincronización con datos reales

**Fuente correcta:**
- `educational_content.exercises WHERE requires_manual_grading = true`
- `educational_content.modules` (joined)

---

#### `standardRubrics.ts` (624 líneas) - P0 RESUELTO
**Path:** `apps/frontend/src/apps/teacher/constants/standardRubrics.ts`

```typescript
// HARDCODED - Ya no se usa después de TASK-008
export const RUBRICS_BY_TYPE: Record<string, ExerciseRubric> = {
  tribunal_opiniones: M3_TRIBUNAL_OPINIONES,
  debate_digital: M3_DEBATE_DIGITAL,
  // ... 12 rúbricas completas
};
```

**Estado:**
- ✅ Ya corregido en TASK-2026-01-18-008
- El frontend ahora consume rúbricas desde `enrichReview()` → `exercise_type_rubrics`
- Archivo puede eliminarse

---

### 1.2 Backend

#### `rubric-scoring.service.ts` (835 líneas) - P2 ORPHAN
**Path:** `apps/backend/src/modules/teacher/services/rubric-scoring.service.ts`

```typescript
// HARDCODED - Código huérfano
const RUBRICS_BY_TYPE: Record<string, ExerciseRubric> = {
  tribunal_opiniones: M3_TRIBUNAL_OPINIONES,
  // ... 12 rúbricas duplicadas
};

@Injectable()
export class RubricScoringService {
  // Métodos nunca usados
}
```

**Problema:**
- Código huérfano: Registrado en module pero nunca inyectado
- Duplica datos de `exercise_type_rubrics` tabla
- 835 líneas de código muerto

**Solución:** Eliminar completamente

---

## 2. Fuentes de Datos Correctas (Base de Datos)

### Tabla: `educational_content.exercises`
```sql
SELECT
  e.id,
  e.title,
  e.exercise_type,
  e.module_id,
  e.requires_manual_grading,
  m.name as module_name,
  m.order_index as module_number
FROM educational_content.exercises e
JOIN educational_content.modules m ON e.module_id = m.id
WHERE e.requires_manual_grading = true
  AND e.is_active = true
ORDER BY m.order_index, e.order_index;
```

### Tabla: `educational_content.exercise_type_rubrics`
```sql
SELECT
  exercise_type,
  rubric_name,
  criteria,  -- JSONB con criterios
  module_code
FROM educational_content.exercise_type_rubrics
WHERE is_default = true;
```

---

## 3. Plan de Erradicación

### Fase 1: Backend - Crear Endpoint

**Nuevo endpoint:** `GET /api/v1/teacher/exercises/manual-review`

Retorna:
```json
{
  "modules": [
    {
      "id": "uuid",
      "name": "Comprensión Crítica",
      "number": 3
    }
  ],
  "exercises": [
    {
      "id": "uuid",
      "title": "Tribunal de Opiniones",
      "exerciseType": "tribunal_opiniones",
      "moduleId": "uuid",
      "moduleName": "Comprensión Crítica",
      "moduleNumber": 3
    }
  ]
}
```

### Fase 2: Frontend - Consumir desde API

1. Crear hook `useManualReviewConfig()`
2. Actualizar `TeacherReviewPanelPage` para usar hook
3. Eliminar imports de `manualReviewExercises.ts`

### Fase 3: Limpieza

1. Eliminar `standardRubrics.ts` (ya no se usa)
2. Eliminar `rubric-scoring.service.ts` (código huérfano)
3. Actualizar `teacher.module.ts` para remover imports

---

## 4. Verificación de Uso Actual

### ¿Quién usa `manualReviewExercises.ts`?
```bash
grep -r "manualReviewExercises\|MANUAL_REVIEW_MODULES\|MANUAL_REVIEW_EXERCISES" apps/frontend/src/
```

Archivos afectados:
- `TeacherReviewPanelPage.tsx` - Import de MANUAL_REVIEW_MODULES y getExercisesByModule

### ¿Quién usa `standardRubrics.ts`?
```bash
grep -r "standardRubrics\|RUBRICS_BY_TYPE\|getRubricByType" apps/frontend/src/
```

Verificar si todavía hay imports activos.

### ¿Quién usa `rubric-scoring.service.ts`?
```bash
grep -r "RubricScoringService\|rubricScoring" apps/backend/src/
```

Resultado: Solo en `teacher.module.ts` (registro) - NUNCA INYECTADO

---

## 5. Impacto

| Archivo | Líneas | Acción | Impacto |
|---------|--------|--------|---------|
| `manualReviewExercises.ts` | 138 | Deprecar → Eliminar | Requiere refactor de consumers |
| `standardRubrics.ts` | 624 | Eliminar | Ya no se usa |
| `rubric-scoring.service.ts` | 835 | Eliminar | Código huérfano |
| **Total** | **1597** | - | - |

---

## 6. Beneficios

1. **Single Source of Truth**: Datos siempre desde BD
2. **Sincronización automática**: Nuevos ejercicios/rúbricas aparecen inmediatamente
3. **Reducción de código**: ~1600 líneas eliminadas
4. **Mantenibilidad**: No hay que actualizar código cuando cambian datos
5. **Consistencia**: Backend y Frontend siempre sincronizados
