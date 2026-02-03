---
id: "ET-TCH-004"
title: "Revision Manual y Calificacion - Especificacion Tecnica"
type: "Especificacion Tecnica"
status: "Implementado"
priority: "P0"
epic: "EXT-001"
module: "teacher"
labels: ["teacher", "grading", "review", "feedback", "rubrics"]
created_date: "2026-01-27"
updated_date: "2026-01-27"
related_rf: ["RF-TCH-003a", "RF-TCH-003b"]
related_us: ["US-PM-003a", "US-PM-003b"]
---

# ET-TCH-004: Revision Manual y Calificacion - Especificacion Tecnica

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | ET-TCH-004 |
| **Epic** | EXT-001 - Portal de Maestros |
| **RF Relacionados** | RF-TCH-003a (Cola de Calificaciones), RF-TCH-003b (Interfaz de Calificacion) |
| **US Relacionadas** | US-PM-003a, US-PM-003b |
| **Prioridad** | P0 - Critico |
| **Estado** | Implementado |

---

## Descripcion Tecnica

Sistema de revision manual y calificacion que permite a los maestros:

1. **Cola de Calificaciones**: Ver submissions pendientes de revision
2. **Interfaz de Calificacion**: Calificar con score y feedback
3. **Revision Manual**: Revisar ejercicios que requieren evaluacion humana
4. **Rubricas**: Aplicar rubricas de evaluacion
5. **Bulk Grading**: Calificacion masiva
6. **Notas del Maestro**: Agregar observaciones privadas

---

## Componentes Frontend

### Paginas Principales

| Componente | Path | Descripcion |
|------------|------|-------------|
| `TeacherReviewPanelPage` | `apps/frontend/src/apps/teacher/pages/TeacherReviewPanelPage.tsx` | Pagina principal de revision |

### Componentes de Dashboard

| Componente | Path | Descripcion |
|------------|------|-------------|
| `GradeSubmissionModal` | `apps/frontend/src/apps/teacher/components/dashboard/GradeSubmissionModal.tsx` | Modal de calificacion |
| `PendingSubmissionsList` | `apps/frontend/src/apps/teacher/components/dashboard/PendingSubmissionsList.tsx` | Lista de pendientes |

### Componentes de Revision

| Componente | Path | Descripcion |
|------------|------|-------------|
| `ReviewList` | `apps/frontend/src/apps/teacher/components/review-panel/ReviewList.tsx` | Lista de revisiones |
| `ReviewDetail` | `apps/frontend/src/apps/teacher/components/review-panel/ReviewDetail.tsx` | Detalle de revision |

### Hooks

| Hook | Path | Descripcion |
|------|------|-------------|
| `useGrading` | `apps/frontend/src/apps/teacher/hooks/useGrading.ts` | Hook para calificacion |
| `useManualReviews` | `apps/frontend/src/apps/teacher/hooks/useManualReviews.ts` | Hook para revisiones manuales |
| `useManualReviewConfig` | `apps/frontend/src/apps/teacher/hooks/useManualReviewConfig.ts` | Hook para configuracion de revision |

### API Frontend

| API | Path | Descripcion |
|-----|------|-------------|
| `gradingApi` | `apps/frontend/src/services/api/teacher/gradingApi.ts` | API de calificacion |
| `manualReviewApi` | `apps/frontend/src/services/api/teacher/manualReviewApi.ts` | API de revision manual |

---

## Servicios Backend

### Servicios Principales

| Servicio | Path | Descripcion |
|----------|------|-------------|
| `GradingService` | `apps/backend/src/modules/teacher/services/grading.service.ts` | Servicio de calificacion |
| `ManualReviewService` | `apps/backend/src/modules/teacher/services/manual-review.service.ts` | Servicio de revision manual |

### Controladores

| Controlador | Path | Descripcion |
|-------------|------|-------------|
| `TeacherController` | `apps/backend/src/modules/teacher/controllers/teacher.controller.ts` | Endpoints de grading |
| `TeacherGradesController` | `apps/backend/src/modules/teacher/controllers/teacher-grades.controller.ts` | Controlador de calificaciones |
| `ManualReviewController` | `apps/backend/src/modules/teacher/controllers/manual-review.controller.ts` | Controlador de revision manual |

### Entidades

| Entidad | Path | Descripcion |
|---------|------|-------------|
| `ManualReview` | `apps/backend/src/modules/progress/entities/manual-review.entity.ts` | Entidad de revision manual |
| `ExerciseTypeRubric` | `apps/backend/src/modules/educational/entities/exercise-type-rubric.entity.ts` | Rubricas de ejercicios |

### DTOs

| DTO | Path | Descripcion |
|-----|------|-------------|
| `GradingDto` | `apps/backend/src/modules/teacher/dto/grading.dto.ts` | DTO de calificacion |
| `CreateReviewDto` | `apps/backend/src/modules/teacher/dto/create-review.dto.ts` | DTO para crear revision |
| `GradesDto` | `apps/backend/src/modules/teacher/dto/grades.dto.ts` | DTO de calificaciones |
| `BulkGradeDto` | `apps/backend/src/modules/teacher/dto/` | DTO para calificacion masiva |
| `SubmitFeedbackDto` | `apps/backend/src/modules/teacher/dto/` | DTO para feedback |

---

## Tablas/Schemas de Base de Datos

### Schema: `progress_tracking`

| Tabla | Descripcion | Columnas Clave |
|-------|-------------|----------------|
| `manual_reviews` | Revisiones manuales | id, submission_id, teacher_id, status, score, feedback, reviewed_at |
| `exercise_submissions` | Entregas de ejercicios | id, exercise_id, student_id, response, score, reviewed |

### Schema: `educational_content`

| Tabla | Descripcion | Columnas Clave |
|-------|-------------|----------------|
| `assignment_submissions` | Entregas de assignments | score, feedback, graded_at, graded_by |
| `teacher_notes` | Notas del maestro | teacher_id, student_id, note, is_private |
| `exercise_type_rubrics` | Rubricas por tipo | exercise_type_id, criteria, max_points |

### Estados de Revision

```sql
status VARCHAR(50) CHECK (status IN ('pending', 'in_review', 'completed', 'needs_revision'))
```

---

## APIs Endpoints

### Cola de Calificaciones

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/teacher/grading/queue` | GET | Obtener cola de pendientes |
| `/api/v1/teacher/grading/queue/count` | GET | Conteo de pendientes |

### Calificacion

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/teacher/grading/:submissionId` | PATCH | Calificar submission |
| `/api/v1/teacher/grading/bulk` | POST | Calificacion masiva |
| `/api/v1/teacher/grading/auto-grade/:submissionId` | POST | Auto-calificacion |

### Revision Manual

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/teacher/reviews` | GET | Listar revisiones pendientes |
| `/api/v1/teacher/reviews/:id` | GET | Obtener revision por ID |
| `/api/v1/teacher/reviews/:id/complete` | POST | Completar revision |

### Notas del Maestro

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/teacher/students/:studentId/notes` | GET | Obtener notas de estudiante |
| `/api/v1/teacher/students/:studentId/notes` | POST | Agregar nota |

### Ejemplo Request PATCH /teacher/grading/:submissionId

```json
{
  "score": 85.5,
  "feedback": "Excelente trabajo en comprension. Revisar ortografia en respuestas abiertas.",
  "rubricScores": {
    "comprension": 20,
    "argumentacion": 18,
    "ortografia": 15,
    "presentacion": 12.5
  }
}
```

### Ejemplo Response GET /teacher/grading/queue

```json
{
  "queue": [
    {
      "submissionId": "uuid-sub-1",
      "assignmentId": "uuid-assign-1",
      "assignmentTitle": "Tarea Semana 3",
      "studentId": "uuid-student-1",
      "studentName": "Juan Perez",
      "submittedAt": "2026-01-26T15:00:00Z",
      "priority": "high",
      "exerciseCount": 5,
      "needsManualReview": true
    }
  ],
  "stats": {
    "total": 25,
    "pendingReview": 15,
    "inReview": 3,
    "avgWaitTime": "2.5 hours"
  }
}
```

---

## Flujos de Usuario

### Flujo 1: Ver Cola de Calificaciones

```
1. Maestro accede a /teacher/grading
2. GET /teacher/grading/queue
3. Ver lista ordenada por prioridad
4. Filtrar por assignment o classroom
5. Click en submission -> detalle
```

### Flujo 2: Calificar Submission

```
1. Maestro en detalle de submission
2. Ver respuestas del estudiante
3. Aplicar rubrica (si disponible)
4. Ingresar score (0-100)
5. Escribir feedback
6. PATCH /teacher/grading/:submissionId
7. Submission marcada como graded
```

### Flujo 3: Calificacion Masiva

```
1. Maestro selecciona multiples submissions
2. Click en "Calificar en lote"
3. Ingresar score comun o individual
4. POST /teacher/grading/bulk
5. Todas las submissions calificadas
```

### Flujo 4: Revision Manual

```
1. Sistema detecta ejercicio que requiere revision manual
2. Ejercicio entra en cola de revision
3. Maestro accede a /teacher/reviews
4. Revisa ejercicio abierto
5. Aplica rubrica de evaluacion
6. POST /teacher/reviews/:id/complete
7. Score registrado
```

### Flujo 5: Agregar Nota del Maestro

```
1. Maestro en perfil de estudiante
2. Click en "Agregar Nota"
3. Escribir observacion
4. Marcar como privada (is_private: true)
5. POST /teacher/students/:studentId/notes
6. Nota guardada (no visible para estudiante)
```

---

## Dependencias

### Dependencias de Modulos

- `ProgressModule` - Para submissions y ejercicios
- `EducationalModule` - Para rubricas
- `AuditModule` - Para tracking de eventos de revision

### Dependencias de User Stories

- Depende de: `US-PM-002*` (Assignments y Submissions)
- Habilita: `US-PM-004*` (Analytics de progreso)

---

## Criterios de Aceptacion

### CA-01: Cola de Calificaciones
- [x] Ver submissions pendientes de calificar
- [x] Ordenar por prioridad (deadline, tipo)
- [x] Conteo de pendientes en dashboard

### CA-02: Interfaz de Calificacion
- [x] Ver respuestas del estudiante
- [x] Ingresar score (0 a total_points)
- [x] Escribir feedback textual
- [x] Guardar calificacion

### CA-03: Rubricas
- [x] Cargar rubrica del tipo de ejercicio
- [x] Calificar por criterio
- [x] Sumar automaticamente score total

### CA-04: Calificacion Masiva
- [x] Seleccionar multiples submissions
- [x] Aplicar mismo score o individual
- [x] Confirmacion antes de guardar

### CA-05: Notas del Maestro
- [x] Agregar notas privadas por estudiante
- [x] Ver historial de notas
- [x] Notas no visibles para estudiantes

### CA-06: Auditoria
- [x] Registrar graded_by y graded_at
- [x] Log de eventos de revision

---

## Notas de Implementacion

### Auto-Grading para Ejercicios Cerrados

```typescript
// Para ejercicios de opcion multiple, el sistema puede auto-calificar
async autoGrade(submissionId: string): Promise<Submission> {
  const submission = await this.getSubmission(submissionId);
  if (submission.exercise.type === 'multiple_choice') {
    const score = this.calculateAutoScore(submission.response, submission.exercise.correctAnswer);
    return this.updateSubmission(submissionId, { score, status: 'graded' });
  }
  throw new BadRequestException('Exercise requires manual review');
}
```

### Rubrica de Evaluacion

```typescript
interface RubricCriteria {
  name: string;          // Ej: "Comprension"
  maxPoints: number;     // Ej: 25
  description: string;   // Ej: "Demuestra comprension del texto"
  levels: RubricLevel[]; // 4 niveles tipicos
}

interface RubricLevel {
  points: number;        // Ej: 25, 20, 10, 0
  description: string;   // Ej: "Excelente", "Bueno", "Regular", "Insuficiente"
}
```

### Prioridad en Cola

```typescript
// Ordenamiento de cola por prioridad
const priorityOrder = {
  exam: 1,      // Mayor prioridad
  quiz: 2,
  homework: 3,
  practice: 4,  // Menor prioridad
};

// Tambien considerar: tiempo de espera, deadline
```

---

## Referencias

- US-PM-003a: Cola de Calificaciones
- US-PM-003b: Interfaz de Calificacion
- US-PM-004b: Notas del Maestro
- TRACEABILITY.yml: Mapeo de implementacion

---

**Creado:** 2026-01-27
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)
