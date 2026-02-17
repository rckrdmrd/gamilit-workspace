---
id: "ET-TCH-003"
title: "Sistema de Asignaciones - Especificacion Tecnica"
type: "Especificacion Tecnica"
status: "Implementado"
priority: "P0"
epic: "EXT-001"
module: "teacher"
labels: ["teacher", "assignments", "submissions", "exercises", "homework"]
created_date: "2026-01-27"
updated_date: "2026-01-27"
related_rf: ["RF-TCH-002a", "RF-TCH-002b", "RF-TCH-002c"]
related_us: ["US-PM-002a", "US-PM-002b", "US-PM-002c"]
---

# ET-TCH-003: Sistema de Asignaciones - Especificacion Tecnica

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | ET-TCH-003 |
| **Epic** | EXT-001 - Portal de Maestros |
| **RF Relacionados** | RF-TCH-002a (CRUD Assignments), RF-TCH-002b (Distribucion), RF-TCH-002c (Submissions View) |
| **US Relacionadas** | US-PM-002a, US-PM-002b, US-PM-002c |
| **Prioridad** | P0 - Critico |
| **Estado** | Implementado |
| **Documentacion Detallada** | [RF-TEACH-002-assignment-system.md](../requirements/RF-TEACH-002-assignment-system.md) |

---

## Descripcion Tecnica

Sistema completo de asignaciones que permite a los maestros:

1. **CRUD de Assignments**: Crear, editar, eliminar asignaciones
2. **Seleccion de Ejercicios**: Agregar ejercicios del catalogo educativo
3. **Distribucion**: Asignar a classrooms o estudiantes individuales
4. **Vista de Submissions**: Monitorear entregas y estados
5. **Tipos de Assignment**: practice, quiz, exam, homework

---

## Componentes Frontend

### Paginas Principales

| Componente | Path | Descripcion |
|------------|------|-------------|
| `TeacherAssignments` | `apps/frontend/src/apps/teacher/pages/TeacherAssignments.tsx` | Listado de asignaciones |
| `TeacherExerciseResponsesPage` | `apps/frontend/src/apps/teacher/pages/TeacherExerciseResponsesPage.tsx` | Vista de respuestas de ejercicios |

### Componentes de Asignaciones

| Componente | Path | Descripcion |
|------------|------|-------------|
| `AssignmentCreator` | `apps/frontend/src/apps/teacher/components/assignments/AssignmentCreator.tsx` | Creador de asignaciones |
| `AssignmentWizard` | `apps/frontend/src/apps/teacher/components/assignments/AssignmentWizard.tsx` | Wizard paso a paso |
| `ImprovedAssignmentWizard` | `apps/frontend/src/apps/teacher/components/assignments/ImprovedAssignmentWizard.tsx` | Wizard mejorado |
| `AssignmentCard` | `apps/frontend/src/apps/teacher/components/assignments/AssignmentCard.tsx` | Card de asignacion |
| `AssignmentList` | `apps/frontend/src/apps/teacher/components/assignments/AssignmentList.tsx` | Lista de asignaciones |
| `SubmissionsModal` | `apps/frontend/src/apps/teacher/components/assignments/SubmissionsModal.tsx` | Modal de submissions |
| `CreateAssignmentModal` | `apps/frontend/src/apps/teacher/components/dashboard/CreateAssignmentModal.tsx` | Modal rapido de creacion |

### Componentes de Respuestas

| Componente | Path | Descripcion |
|------------|------|-------------|
| `ResponsesTable` | `apps/frontend/src/apps/teacher/components/responses/ResponsesTable.tsx` | Tabla de respuestas |
| `ResponseDetailModal` | `apps/frontend/src/apps/teacher/components/responses/ResponseDetailModal.tsx` | Modal de detalle |
| `ResponseFilters` | `apps/frontend/src/apps/teacher/components/responses/ResponseFilters.tsx` | Filtros de respuestas |

### Hooks

| Hook | Path | Descripcion |
|------|------|-------------|
| `useAssignments` | `apps/frontend/src/apps/teacher/hooks/useAssignments.ts` | Hook para CRUD de assignments |
| `useExerciseResponses` | `apps/frontend/src/apps/teacher/hooks/useExerciseResponses.ts` | Hook para respuestas de ejercicios |

### API Frontend

| API | Path | Descripcion |
|-----|------|-------------|
| `assignmentsApi` | `apps/frontend/src/services/api/teacher/assignmentsApi.ts` | API de asignaciones |
| `exerciseResponsesApi` | `apps/frontend/src/services/api/teacher/exerciseResponsesApi.ts` | API de respuestas |

---

## Servicios Backend

### Modulo de Assignments

| Servicio | Path | Descripcion |
|----------|------|-------------|
| `AssignmentsService` | `apps/backend/src/modules/assignments/assignments.service.ts` | Servicio principal de assignments |

### Servicios del Teacher Module

| Servicio | Path | Descripcion |
|----------|------|-------------|
| `ExerciseResponsesService` | `apps/backend/src/modules/teacher/services/exercise-responses.service.ts` | Servicio de respuestas |
| `GradingService` | `apps/backend/src/modules/teacher/services/grading.service.ts` | Servicio de calificacion |

### Controladores

| Controlador | Path | Descripcion |
|-------------|------|-------------|
| `AssignmentsController` | `apps/backend/src/modules/assignments/assignments.controller.ts` | CRUD de assignments |
| `ExerciseResponsesController` | `apps/backend/src/modules/teacher/controllers/exercise-responses.controller.ts` | Respuestas de ejercicios |

### Entidades

| Entidad | Path | Descripcion |
|---------|------|-------------|
| `Assignment` | `apps/backend/src/modules/assignments/entities/assignment.entity.ts` | Entidad de asignacion |
| `AssignmentExercise` | `apps/backend/src/modules/assignments/entities/assignment-exercise.entity.ts` | M2M Assignment-Exercise |
| `AssignmentStudent` | `apps/backend/src/modules/assignments/entities/assignment-student.entity.ts` | M2M Assignment-Student |
| `AssignmentSubmission` | `apps/backend/src/modules/assignments/entities/assignment-submission.entity.ts` | Entregas |
| `AssignmentClassroom` | `apps/backend/src/modules/social/entities/assignment-classroom.entity.ts` | M2M Assignment-Classroom |

### DTOs

| DTO | Path | Descripcion |
|-----|------|-------------|
| `CreateExerciseDto` | `apps/backend/src/modules/teacher/dto/create-exercise.dto.ts` | DTO para ejercicios |
| `ExerciseResponsesDto` | `apps/backend/src/modules/teacher/dto/exercise-responses.dto.ts` | DTO de respuestas |

---

## Tablas/Schemas de Base de Datos

### Schema: `educational_content`

| Tabla | Descripcion | Columnas Clave |
|-------|-------------|----------------|
| `assignments` | Tabla principal de asignaciones | id, teacher_id, title, description, assignment_type, due_date, total_points, is_published |
| `assignment_exercises` | M2M Ejercicios en assignment | id, assignment_id, exercise_id, order_index, points_override, is_required |
| `assignment_students` | M2M Asignacion individual | id, assignment_id, student_id, assigned_at, deadline_override |
| `assignment_submissions` | Entregas de estudiantes | id, assignment_id, student_id, submitted_at, status, score, feedback, graded_at, graded_by |

### Schema: `social_features`

| Tabla | Descripcion | Columnas Clave |
|-------|-------------|----------------|
| `assignment_classrooms` | M2M Asignacion a classrooms | id, assignment_id, classroom_id, deadline_override, students_count, assigned_at |

### Tipos de Assignment

```sql
assignment_type VARCHAR(50) CHECK (assignment_type IN ('practice', 'quiz', 'exam', 'homework'))
```

### Estados de Submission

```sql
status VARCHAR(50) CHECK (status IN ('not_started', 'in_progress', 'submitted', 'graded'))
```

---

## APIs Endpoints

### CRUD de Assignments

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/teacher/assignments` | GET | Listar assignments del teacher |
| `/api/v1/teacher/assignments/:id` | GET | Obtener assignment por ID |
| `/api/v1/teacher/assignments` | POST | Crear nuevo assignment |
| `/api/v1/teacher/assignments/:id` | PATCH | Actualizar assignment |
| `/api/v1/teacher/assignments/:id` | DELETE | Eliminar assignment |

### Distribucion

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/teacher/assignments/:id/distribute` | POST | Distribuir a classrooms/estudiantes |
| `/api/v1/teacher/assignments/:id/publish` | POST | Publicar assignment |

### Submissions

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/teacher/assignments/:id/submissions` | GET | Ver submissions del assignment |
| `/api/v1/teacher/exercise-responses` | GET | Ver respuestas de ejercicios |

### Ejemplo Request POST /teacher/assignments

```json
{
  "title": "Tarea Semana 3 - Comprension Literal",
  "description": "Ejercicios de comprension lectora modulo 1",
  "assignmentType": "homework",
  "dueDate": "2026-02-01T17:00:00Z",
  "totalPoints": 100,
  "exerciseIds": ["uuid-ex-1", "uuid-ex-2", "uuid-ex-3"],
  "classroomIds": ["uuid-classroom-1"],
  "studentIds": []
}
```

### Ejemplo Response GET /teacher/assignments/:id/submissions

```json
{
  "assignmentId": "uuid-assignment",
  "title": "Tarea Semana 3",
  "submissions": [
    {
      "id": "uuid-submission-1",
      "studentId": "uuid-student-1",
      "studentName": "Juan Perez",
      "status": "submitted",
      "submittedAt": "2026-01-30T15:00:00Z",
      "score": null,
      "feedback": null
    },
    {
      "id": "uuid-submission-2",
      "studentId": "uuid-student-2",
      "studentName": "Ana Lopez",
      "status": "graded",
      "submittedAt": "2026-01-29T10:00:00Z",
      "score": 85.5,
      "feedback": "Buen trabajo"
    }
  ],
  "stats": {
    "total": 25,
    "notStarted": 5,
    "inProgress": 3,
    "submitted": 10,
    "graded": 7,
    "averageScore": 78.5
  }
}
```

---

## Flujos de Usuario

### Flujo 1: Crear Assignment

```
1. Maestro accede a /teacher/assignments
2. Click en "Crear Asignacion"
3. AssignmentWizard se abre
4. Paso 1: Titulo, descripcion, tipo, fecha limite
5. Paso 2: Seleccionar ejercicios del catalogo
6. Paso 3: Seleccionar classrooms o estudiantes
7. Submit -> POST /teacher/assignments
8. Assignment creado (is_published: false)
```

### Flujo 2: Distribuir Assignment

```
1. Maestro tiene assignment en draft (is_published: false)
2. Click en "Publicar y Distribuir"
3. Seleccionar classrooms destino
4. POST /teacher/assignments/:id/distribute
5. Sistema crea submissions automaticas para cada estudiante
6. Assignment marcado como is_published: true
```

### Flujo 3: Ver Submissions

```
1. Maestro accede a assignment publicado
2. GET /teacher/assignments/:id/submissions
3. Ver lista de estudiantes con status
4. Filtrar por status (not_started, in_progress, submitted, graded)
5. Click en submission -> ver detalle
```

### Flujo 4: Workflow de Estudiante (Contexto)

```
Estudiante ve assignment (status: not_started)
  -> Inicia (status: in_progress)
  -> Completa ejercicios
  -> Entrega (status: submitted, submitted_at = NOW)
  -> Maestro califica (status: graded)
```

---

## Dependencias

### Dependencias de Modulos

- `EducationalModule` - Para ejercicios del catalogo
- `SocialModule` - Para classrooms
- `AuthModule` - Para usuarios

### Dependencias de User Stories

- Depende de: `US-PM-001*` (Classrooms), `EAI-002` (Contenido educativo)
- Habilita: `US-PM-003*` (Calificacion)

---

## Criterios de Aceptacion

### CA-01: CRUD de Assignments
- [x] Crear assignment con titulo, descripcion, tipo, deadline
- [x] Agregar ejercicios del catalogo educativo
- [x] Actualizar assignment (solo si no publicado)
- [x] Eliminar assignment (cascade submissions)

### CA-02: Tipos de Assignment
- [x] practice: Sin calificacion formal
- [x] quiz: Prueba corta
- [x] exam: Examen formal
- [x] homework: Tarea

### CA-03: Distribucion
- [x] Distribuir a classroom completo
- [x] Asignar a estudiantes individuales
- [x] Crear submissions automaticas al distribuir

### CA-04: Vista de Submissions
- [x] Ver todas las submissions de un assignment
- [x] Filtrar por status
- [x] Estadisticas agregadas (conteo por status, promedio)

### CA-05: Integridad
- [x] ON DELETE CASCADE en FKs
- [x] UNIQUE constraint (assignment_id, student_id)
- [x] Validacion de ejercicios existentes

---

## Notas de Implementacion

### Funcion de Distribucion

```sql
-- assign_to_classroom(assignment_id, classroom_id) -> INTEGER
-- Crea submissions para todos los estudiantes del classroom
-- Retorna numero de submissions creadas
```

### Indices Optimizados

```sql
CREATE INDEX idx_assignment_submissions_status ON educational_content.assignment_submissions(status);
CREATE INDEX idx_assignment_submissions_assignment_id ON educational_content.assignment_submissions(assignment_id);
```

### Webhook de Notificacion (Futuro)

```typescript
// Al distribuir assignment, notificar a estudiantes
await this.notificationsService.notifyStudents(studentIds, {
  type: 'NEW_ASSIGNMENT',
  assignmentId,
  dueDate,
});
```

---

## Referencias

- RF-TEACH-002: Documentacion detallada del sistema de asignaciones
- US-PM-002a, US-PM-002b, US-PM-002c: User stories relacionadas
- TRACEABILITY.yml: Mapeo de implementacion

---

**Creado:** 2026-01-27
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)
