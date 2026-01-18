# TASK-2026-01-18-004: Análisis Teacher/Responses Page

**Fecha:** 2026-01-18
**Estado:** ANÁLISIS COMPLETO
**Prioridad:** P0 (Crítico - Funcionalidad core afectada)
**Componente:** Portal Teacher - Página de Respuestas

---

## 1. RESUMEN EJECUTIVO

La página `/teacher/responses` presenta **3 errores técnicos** y **múltiples GAPs funcionales** que impiden mostrar correctamente:
- Detalle de respuestas del estudiante
- Criterios de evaluación
- Respuestas esperadas (correct_answer)

### Errores Identificados

| # | Error | Severidad | Origen |
|---|-------|-----------|--------|
| E1 | WebSocket closed before established | Media | `useWebSocket.ts:247` |
| E2 | AnimatePresence mode="wait" multiple children | Alta | `ResponsesTable.tsx:382` |
| E3 | Maximum update depth exceeded | Crítica | `ResponsesTable.tsx` → AnimatePresence |

### GAPs Funcionales

| # | GAP | Impacto | Archivo |
|---|-----|---------|---------|
| G1 | Criterios de evaluación no implementados en DTO | Alto | `exerciseResponsesApi.ts` |
| G2 | Panel de revisión manual incompleto | Alto | Sin implementar |
| G3 | Filtro de módulo documentado pero no implementado | Medio | `ResponseFilters.tsx` |
| G4 | Estado `needsManualReview` sin flag en API | Alto | Backend |

---

## 2. ANÁLISIS DETALLADO DE ERRORES

### E1: WebSocket Closed Before Established

**Archivo:** `apps/frontend/src/features/notifications/hooks/useWebSocket.ts`
**Líneas:** 247-313

**Causa Raíz:**
```tsx
// Líneas 300-313
useEffect(() => {
  const token = getAuthToken();
  if (user?.id && token) {
    connect();  // Async operation
  }
  return () => {
    disconnect();  // Cleanup se ejecuta antes de connect() completar
  };
}, [user?.id]);
```

**Problema:** En React 18 StrictMode, los componentes se montan/desmontan/remontan. El `disconnect()` del cleanup se ejecuta antes de que `connect()` complete la conexión WebSocket.

**Impacto:** Mensajes en consola, reconexiones innecesarias. NO afecta funcionalidad core.

**Solución Propuesta:**
```tsx
useEffect(() => {
  let isMounted = true;
  const token = getAuthToken();

  if (user?.id && token && isMounted) {
    connect();
  }

  return () => {
    isMounted = false;
    disconnect();
  };
}, [user?.id, connect, disconnect]);
```

---

### E2 + E3: AnimatePresence con Múltiples Children

**Archivo:** `apps/frontend/src/apps/teacher/components/responses/ResponsesTable.tsx`
**Líneas:** 382-401

**Causa Raíz:**
```tsx
<AnimatePresence mode="wait">
  {loading ? (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <SkeletonRow key={i} />
      ))}
    </>
  ) : data.length === 0 ? (
    <EmptyState />
  ) : (
    data.map((attempt, index) => (
      <TableRow key={attempt.id} ... />
    ))
  )}
</AnimatePresence>
```

**Problemas:**
1. `AnimatePresence mode="wait"` espera UN SOLO hijo directo con key única
2. Fragment (`<>...</>`) con múltiples SkeletonRow = múltiples children
3. `data.map()` sin wrapper = múltiples children
4. Esto causa el loop infinito de re-renders (`Maximum update depth exceeded`)

**Impacto:** CRÍTICO - La página puede quedar inutilizable

**Solución Propuesta:**
```tsx
<AnimatePresence mode="wait">
  {loading ? (
    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <SkeletonRow key={i} />
      ))}
    </motion.div>
  ) : data.length === 0 ? (
    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <EmptyState />
    </motion.div>
  ) : (
    <motion.div key="data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {data.map((attempt, index) => (
        <TableRow key={attempt.id} attempt={attempt} index={index} onView={onViewDetail} />
      ))}
    </motion.div>
  )}
</AnimatePresence>
```

---

## 3. ANÁLISIS DE GAPS FUNCIONALES

### G1: Criterios de Evaluación No Implementados

**Documentación Esperada (RF-EDU-001):**
```typescript
interface AttemptDetailResponse {
  // ... campos existentes ...
  evaluation_criteria?: {
    rubric_id?: string;
    criteria: {
      name: string;
      weight: number;
      score: number;
      feedback?: string;
    }[];
    total_score: number;
  };
}
```

**Implementación Actual (`exerciseResponsesApi.ts:64-68`):**
```typescript
export interface AttemptDetailResponse extends AttemptResponse {
  correct_answer: Record<string, unknown>;
  exercise_type: string;
  max_score: number;
  // NO HAY evaluation_criteria
}
```

**Backend (`exercise-responses.dto.ts`):**
- Campo `evaluation_criteria` NO existe en el DTO
- La función `validate_and_audit()` sí genera criterios pero NO se exponen

**Impacto:** El modal de detalle NO puede mostrar criterios de evaluación aunque el backend los calcule.

---

### G2: Respuestas Correctas - Flujo de Datos

**Flujo Actual:**
```
TeacherExerciseResponsesPage
  └── ResponseDetailModal (attemptId)
        └── useAttemptDetail(attemptId)
              └── exerciseResponsesApi.getAttemptDetail(id)
                    └── GET /teacher/attempts/:id
                          └── AttemptDetailResponse { correct_answer: {...} }
```

**Verificación Backend (`exercise-responses.service.ts:435-534`):**
- Función `extractCorrectAnswers()` existe y extrae respuestas de `exercise.content`
- Devuelve estructura correcta según tipo de ejercicio

**Problema Potencial:**
1. El campo `correct_answer` puede venir vacío si el ejercicio no tiene `answer_key` en content
2. Ejercicios de revisión manual (M3-M5) no tienen respuesta "correcta" predefinida

**Verificar en BD:**
```sql
SELECT exercise_type, content->>'answer_key' as answer_key
FROM educational.exercises
WHERE exercise_type IN ('tribunal_opiniones', 'podcast_argumentativo', 'video_carta');
```

---

### G3: Campo needsManualReview Faltante

**Documentación (`TEACHER-RESPONSE-MANAGEMENT.md`):**
```typescript
interface AttemptResponse {
  needsManualReview: boolean;  // Indica si requiere revisión manual
}
```

**Implementación Actual (`exerciseResponsesApi.ts:42-59`):**
```typescript
export interface AttemptResponse {
  // ... campos existentes ...
  // NO HAY needsManualReview
}
```

**Impacto:**
- No se puede filtrar por "pendientes de revisión"
- No se puede mostrar badge de estado en tabla

**Solución:**
1. Backend: Agregar campo `requires_manual_review` basado en `exercise_type`
2. Frontend: Mostrar badge y habilitar filtro

---

### G4: Inconsistencia en Columnas de Tabla

**TEACHER-RESPONSE-MANAGEMENT.md:**
| Estudiante | Ejercicio | Módulo | Intento | Score | Correcto | Tiempo | Fecha | Acciones |

**RESPONSES-M3-M5.md:**
| Estudiante | Ejercicio | Módulo | Fecha | Tiempo | Score | **Estado** | Acciones |

**Implementación (`ResponsesTable.tsx`):**
| Estudiante | Ejercicio | Módulo | Intento | Score | Correcto | Tiempo | Fecha | Acciones |

**Falta:** Columna "Estado" con badges (correct/incorrect/pending/in_review)

---

## 4. MAPA DE DEPENDENCIAS

```
TeacherExerciseResponsesPage.tsx
├── useAuth() → authStore
├── useUserGamification(userId) → React Query → gamificationApi
├── useExerciseResponses(filters) → React Query → exerciseResponsesApi
├── ResponseFilters
│   └── Props: filters, onChange, onClear
├── ResponsesTable ← [E2, E3]
│   └── Props: data, total, page, limit, loading, onViewDetail, onPageChange
└── ResponseDetailModal
    ├── useAttemptDetail(attemptId) → React Query → exerciseResponsesApi
    ├── AnswerComparison
    │   └── ExerciseContentRenderer ← Requiere: exerciseType, correct_answer
    └── MultimediaContent ← Para ejercicios creativos
```

---

## 5. PLAN DE CORRECCIÓN

### Fase 1: Errores Críticos (Inmediato)

| Prioridad | Tarea | Archivo | Estimación |
|-----------|-------|---------|------------|
| P0-1 | Fix AnimatePresence múltiples children | ResponsesTable.tsx | 30 min |
| P0-2 | Fix Maximum update depth exceeded | ResponsesTable.tsx | 15 min |
| P0-3 | Verificar correct_answer del backend | Backend test | 20 min |

### Fase 2: Funcionalidad Core (Corto Plazo)

| Prioridad | Tarea | Archivo | Estimación |
|-----------|-------|---------|------------|
| P1-1 | Agregar campo needsManualReview al DTO | exerciseResponsesApi.ts | 20 min |
| P1-2 | Agregar endpoint evaluation_criteria | Backend | 1h |
| P1-3 | Implementar columna Estado en tabla | ResponsesTable.tsx | 30 min |
| P1-4 | Implementar filtro por módulo | ResponseFilters.tsx | 30 min |

### Fase 3: Mejoras (Mediano Plazo)

| Prioridad | Tarea | Archivo | Estimación |
|-----------|-------|---------|------------|
| P2-1 | Fix useWebSocket cleanup | useWebSocket.ts | 20 min |
| P2-2 | Agregar rúbricas de evaluación UI | ResponseDetailModal.tsx | 2h |
| P2-3 | Sincronizar documentación | docs/ | 1h |

---

## 6. VALIDACIÓN DE OBJETOS

### 6.1 Entities/DTOs Backend

| Objeto | Estado | Archivo |
|--------|--------|---------|
| ExerciseAttempt Entity | OK | exercise-attempt.entity.ts |
| AttemptDetailDto | INCOMPLETO | exercise-responses.dto.ts |
| Exercise Entity | OK | exercise.entity.ts |

### 6.2 Interfaces Frontend

| Objeto | Estado | Archivo |
|--------|--------|---------|
| AttemptResponse | INCOMPLETO | exerciseResponsesApi.ts |
| AttemptDetailResponse | INCOMPLETO | exerciseResponsesApi.ts |
| GetAttemptsQuery | OK | exerciseResponsesApi.ts |

### 6.3 Componentes UI

| Componente | Estado | Issues |
|------------|--------|--------|
| ResponsesTable | ERROR | AnimatePresence mal configurado |
| ResponseDetailModal | OK | Falta mostrar criterios |
| ResponseFilters | INCOMPLETO | Falta filtro módulo |
| ExerciseContentRenderer | OK | 25+ mecánicas soportadas |

---

## 7. COHERENCIA DOCUMENTACIÓN vs CÓDIGO

### Documentos Analizados

1. `docs/95-guias-desarrollo/frontend/teacher/components/TEACHER-RESPONSE-MANAGEMENT.md`
2. `docs/95-guias-desarrollo/frontend/teacher/pages/TEACHER-PAGES-SPECIFICATIONS.md`
3. `docs/03-fase-extensiones/EXT-001-portal-maestros/paginas/RESPONSES-M3-M5.md`
4. `docs/01-fase-alcance-inicial/EAI-002-actividades/requerimientos/RF-EDU-001-mecanicas-ejercicios.md`

### Matriz de Coherencia

| Aspecto | Documentado | Implementado | Estado |
|---------|-------------|--------------|--------|
| Tabla de respuestas | Sí | Sí | PARCIAL (falta Estado) |
| Modal de detalle | Sí | Sí | OK |
| Comparación respuestas | Sí | Sí | OK |
| Criterios evaluación | Sí | No | GAP |
| Filtro por módulo | Sí | No | GAP |
| Campo needsManualReview | Sí | No | GAP |
| Multimedia (M3-M5) | Sí | Sí | OK |

---

## 8. PRÓXIMOS PASOS

1. **INMEDIATO**: Corregir errores E2 y E3 en ResponsesTable.tsx
2. **VALIDAR**: Verificar datos del backend con curl/Postman
3. **IMPLEMENTAR**: Fase 1 completa
4. **DOCUMENTAR**: Actualizar docs con cambios realizados

---

## ANEXOS

### A. Archivos Críticos

```
apps/frontend/src/
├── apps/teacher/
│   ├── pages/TeacherExerciseResponsesPage.tsx
│   ├── components/responses/
│   │   ├── ResponsesTable.tsx          ← FIX REQUERIDO
│   │   ├── ResponseDetailModal.tsx
│   │   └── ResponseFilters.tsx         ← Agregar filtro módulo
│   └── hooks/useExerciseResponses.ts
├── features/notifications/hooks/useWebSocket.ts  ← FIX MENOR
├── services/api/teacher/exerciseResponsesApi.ts  ← Agregar campos
└── shared/components/mechanics/ExerciseContentRenderer.tsx

apps/backend/src/modules/teacher/
├── controllers/exercise-responses.controller.ts
├── services/exercise-responses.service.ts
└── dto/exercise-responses.dto.ts       ← Agregar campos
```

### B. Comandos de Validación

```bash
# Verificar estado del backend
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/teacher/attempts/UUID_ATTEMPT

# Verificar estructura de ejercicio
psql -d gamilit -c "SELECT content FROM educational.exercises LIMIT 1"

# Run frontend lint
cd apps/frontend && npm run lint

# Run backend tests
cd apps/backend && npm run test:e2e -- --grep "teacher"
```
