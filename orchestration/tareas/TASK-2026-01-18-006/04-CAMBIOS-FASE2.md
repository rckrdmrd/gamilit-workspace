# TASK-2026-01-18-006: Cambios Fase 2
## Funcionalidad Core - Columna Estado y Filtro de Módulo

**Fecha:** 2026-01-18
**Estado:** Completado

---

## Resumen de Cambios

### 1. Backend - DTO `exercise-responses.dto.ts`
**Archivo:** `apps/backend/src/modules/teacher/dto/exercise-responses.dto.ts`

Se agregaron los campos `exercise_type` y `requires_manual_review` a `AttemptResponseDto`:

```typescript
@ApiProperty({
  description: 'Indicates if the exercise requires manual review by teacher',
  example: false,
})
  requires_manual_review!: boolean;

@ApiProperty({
  description: 'Exercise type (mechanic)',
  example: 'lectura_inferencial',
})
  exercise_type!: string;
```

Se eliminó la duplicación de `exercise_type` de `AttemptDetailDto` (ahora hereda del padre).

---

### 2. Backend - Service `exercise-responses.service.ts`
**Archivo:** `apps/backend/src/modules/teacher/services/exercise-responses.service.ts`

Se agregó:

1. **Constante con tipos que requieren revisión manual:**
```typescript
const MANUAL_REVIEW_EXERCISE_TYPES = [
  // Module 3 - Critical/Argumentative
  'tribunal_opiniones', 'podcast_argumentativo', 'debate_digital',
  'analisis_fuentes', 'matriz_perspectivas',
  // Module 4 - Media Literacy (creative)
  'analisis_memes',
  // Module 5 - Content Creation
  'video_carta', 'comic_digital', 'diario_multimedia',
  // Auxiliary creative types
  'collage_prensa', 'call_to_action', 'texto_en_movimiento',
  // Module 2 - Open-ended
  'prediccion_narrativa',
];
```

2. **Función helper:**
```typescript
function requiresManualReview(exerciseType: string): boolean {
  return MANUAL_REVIEW_EXERCISE_TYPES.includes(exerciseType);
}
```

3. **SQL Query actualizado** para incluir `exercise.exercise_type AS exercise_type`

4. **Mapping actualizado:**
```typescript
exercise_type: row.exercise_type || 'unknown',
requires_manual_review: requiresManualReview(row.exercise_type || ''),
```

---

### 3. Frontend - Interface `exerciseResponsesApi.ts`
**Archivo:** `apps/frontend/src/services/api/teacher/exerciseResponsesApi.ts`

Se agregaron los campos a `AttemptResponse`:

```typescript
export interface AttemptResponse {
  // ... campos existentes ...
  /** Exercise type/mechanic identifier */
  exercise_type: string;
  /** Indicates if exercise requires manual review by teacher (M3-M5 creative exercises) */
  requires_manual_review: boolean;
}
```

---

### 4. Frontend - Columna Estado `ResponsesTable.tsx`
**Archivo:** `apps/frontend/src/apps/teacher/components/responses/ResponsesTable.tsx`

**Cambios:**
1. Nuevo header: `<th className="px-4 py-3 text-center text-sm font-bold">Estado</th>`

2. Nueva celda con badges condicionales:
```tsx
{/* Estado */}
<td className="px-4 py-3 text-center">
  {attempt.requires_manual_review && !attempt.is_correct ? (
    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
      Pendiente
    </span>
  ) : attempt.is_correct ? (
    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
      Calificado
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
      Incorrecto
    </span>
  )}
</td>
```

3. Skeleton row actualizado con nueva celda
4. `colSpan` en EmptyState actualizado de 9 a 10

---

### 5. Frontend - Filtro de Módulo `ResponseFilters.tsx`
**Archivo:** `apps/frontend/src/apps/teacher/components/responses/ResponseFilters.tsx`

**Cambios:**
1. Nuevos imports: `BookOpen`, `apiClient`, `API_ENDPOINTS`
2. Nuevo tipo: `ModuleListItem`
3. Nuevos estados: `selectedModuleId`, `modules`
4. Nuevo `useEffect` para fetch de módulos al montar
5. Nuevo handler: `handleModuleChange`
6. Actualizado `handleClear` para limpiar módulo seleccionado
7. Nueva sección UI con selector de módulo

---

## Validaciones

| Validación | Resultado |
|------------|-----------|
| Frontend lint | ✅ Solo warnings pre-existentes |
| Frontend build | ✅ Exitoso |
| Backend lint | ✅ Solo warnings pre-existentes |
| Backend build | ✅ Exitoso |

---

## Archivos Modificados

1. `apps/backend/src/modules/teacher/dto/exercise-responses.dto.ts`
2. `apps/backend/src/modules/teacher/services/exercise-responses.service.ts`
3. `apps/frontend/src/services/api/teacher/exerciseResponsesApi.ts`
4. `apps/frontend/src/apps/teacher/components/responses/ResponsesTable.tsx`
5. `apps/frontend/src/apps/teacher/components/responses/ResponseFilters.tsx`

---

## Notas Técnicas

### Lógica de Estado
- **Pendiente** (amarillo): `requires_manual_review && !is_correct`
- **Calificado** (verde): `is_correct === true`
- **Incorrecto** (rojo): `!is_correct && !requires_manual_review`

### Tipos que requieren revisión manual
Los ejercicios creativos de Módulos 3-5:
- Módulo 3: tribunal_opiniones, podcast_argumentativo, debate_digital, etc.
- Módulo 4: analisis_memes (creativos)
- Módulo 5: video_carta, comic_digital, diario_multimedia
