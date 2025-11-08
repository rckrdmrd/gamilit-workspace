# Requerimientos Teacher Portal - Gestión de Assignments

**Proyecto:** Gamilit Platform
**Portal:** Teacher
**Archivo original:** REQUERIMIENTOS-TEACHER-PORTAL.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Tabla de Contenidos

1. [Gestión de Assignments](#gestión-de-assignments)
2. [Matriz de Permisos](#matriz-de-permisos)
3. [Casos de Uso](#casos-de-uso)
4. [Referencias](#referencias)

---

## Gestión de Assignments

### 2.2 Gestión de Assignments (HU-EP009-02)

**Historia de Usuario:** Como profesor, quiero crear y administrar assignments (tareas, exámenes, proyectos) para asignar trabajos a mis estudiantes y evaluar su aprendizaje.

**Story Points:** 20 SP | **Prioridad:** Alta (P1)

#### 2.2.1 Creación de Assignments
**REQ-TCH-020:** El sistema debe permitir crear assignments con los siguientes datos:
- Título (obligatorio, 1-255 caracteres)
- Descripción (opcional, rich text HTML)
- Tipo: quiz, homework, project, exam, discussion
- Puntos máximos (obligatorio, > 0)
- Fecha límite (opcional, formato ISO 8601)
- Instrucciones (opcional, rich text HTML)
- Recursos adjuntos (opcional)

**REQ-TCH-021:** El sistema debe sanitizar el HTML de description e instructions para prevenir XSS.

**REQ-TCH-022:** Los assignments recién creados deben tener estado 'draft' por defecto.

**REQ-TCH-023:** Los puntos máximos deben estar en el rango 1-1000.

#### 2.2.2 Tipos de Assignments
**REQ-TCH-024:** El sistema debe soportar los siguientes tipos de assignments:
- **quiz:** Evaluaciones cortas con auto-calificación opcional
- **homework:** Tareas regulares
- **project:** Proyectos de mayor envergadura
- **exam:** Exámenes formales
- **discussion:** Discusiones y participación

#### 2.2.3 Listado y Búsqueda
**REQ-TCH-025:** El sistema debe proporcionar listado paginado con filtros por:
- Estado: active, draft, archived
- Tipo: quiz, homework, project, exam, discussion
- Classroom específico
- Búsqueda por texto en título/descripción (case-insensitive)

**REQ-TCH-026:** El listado debe mostrar estadísticas básicas para cada assignment:
- Total de estudiantes asignados
- Número de submissions
- Tasa de completitud
- Promedio de calificaciones

#### 2.2.4 Visualización de Detalles
**REQ-TCH-027:** El sistema debe mostrar detalles completos del assignment incluyendo:
- Información básica
- Estadísticas detalladas (total_assigned, submissions_count, graded_count, pending_count, avg_score, completion_rate)
- Lista de classrooms asignados
- Submissions recientes

#### 2.2.5 Actualización de Assignments
**REQ-TCH-028:** El sistema debe permitir actualizar assignments SOLO si no tienen submissions.

**REQ-TCH-029:** Si un assignment tiene submissions existentes, el sistema debe retornar error 422 con mensaje "Cannot update assignment with existing submissions".

**REQ-TCH-030:** Solo el profesor propietario puede actualizar sus assignments.

#### 2.2.6 Asignación a Classrooms
**REQ-TCH-031:** El sistema debe permitir asignar un assignment a uno o múltiples classrooms simultáneamente.

**REQ-TCH-032:** Al asignar a un classroom, el sistema debe:
- Crear registros en assignment_classrooms
- Calcular automáticamente el número de estudiantes afectados
- Permitir override de fecha límite por classroom

**REQ-TCH-033:** En asignación batch, el sistema debe reportar operaciones exitosas y fallidas por separado.

#### 2.2.7 Gestión de Submissions
**REQ-TCH-034:** El sistema debe listar todas las submissions de un assignment con filtros por:
- Estado: pending, submitted, graded, late
- Classroom específico
- Paginación

**REQ-TCH-035:** El sistema debe detectar automáticamente submissions tardías comparando submitted_at con deadline.

**REQ-TCH-036:** Cada submission debe mostrar:
- Información del estudiante
- Classroom de origen
- Estado de calificación
- Indicador visual si es tardía

#### 2.2.8 Eliminación de Assignments
**REQ-TCH-037:** El sistema debe implementar soft delete (is_active = false).

**REQ-TCH-038:** Las submissions de assignments eliminados deben preservarse.

#### 2.2.9 Endpoints API
- POST /api/teacher/assignments
- GET /api/teacher/assignments
- GET /api/teacher/assignments/:id
- PUT /api/teacher/assignments/:id
- DELETE /api/teacher/assignments/:id
- POST /api/teacher/assignments/:id/assign
- GET /api/teacher/assignments/:id/submissions
- POST /api/teacher/assignments/:id/grade

---

## 🔗 Referencias a Implementación

### Database
🗄️ **Tablas:**
- `educational_content.assignments` → `apps/database/ddl/schemas/educational_content/tables/assignments.sql`
  - **Propósito:** Almacena información de assignments (tareas, quizzes, exámenes)
  - **Columnas clave:** `id`, `teacher_id`, `title`, `description`, `type`, `max_points`, `deadline`, `status`, `is_active`
- `educational_content.assignment_classrooms` → `apps/database/ddl/schemas/educational_content/tables/assignment_classrooms.sql`
  - **Propósito:** Relación muchos-a-muchos entre assignments y classrooms
  - **Columnas clave:** `assignment_id`, `classroom_id`, `assigned_at`, `deadline_override`
- `progress_tracking.submissions` → `apps/database/ddl/schemas/progress_tracking/tables/submissions.sql`
  - **Propósito:** Almacena submissions de estudiantes para assignments
  - **Columnas clave:** `id`, `assignment_id`, `student_id`, `submitted_at`, `score`, `status`

🗄️ **ENUMs:**
- `assignment_type` → `apps/database/ddl/00-prerequisites.sql` (quiz, homework, project, exam, discussion)
- `assignment_status` → `apps/database/ddl/00-prerequisites.sql` (draft, active, archived)
- `submission_status` → `apps/database/ddl/00-prerequisites.sql` (pending, submitted, graded, late)

🗄️ **Foreign Keys:**
- `assignments.teacher_id` → `auth.users(id)`
- `assignment_classrooms.assignment_id` → `assignments(id)`
- `assignment_classrooms.classroom_id` → `classrooms(id)`
- `submissions.assignment_id` → `assignments(id)`
- `submissions.student_id` → `auth.users(id)`

### Backend
💻 **Controllers:**
- `apps/backend/src/modules/teacher/controllers/assignment.controller.ts`
  - **Endpoints implementados:** POST, GET, PUT, DELETE /api/teacher/assignments
  - **Endpoints asignación:** POST /api/teacher/assignments/:id/assign
  - **Endpoints submissions:** GET /api/teacher/assignments/:id/submissions
  - **Endpoints grading:** POST /api/teacher/assignments/:id/grade

💻 **Services:**
- `apps/backend/src/modules/teacher/services/assignment.service.ts`
  - **Métodos CRUD:** create(), findAll(), findOne(), update(), remove()
  - **Métodos asignación:** assignToClassrooms(), assignToClassroomsBatch()
  - **Métodos submissions:** getSubmissions(), gradeSubmission()
  - **Validaciones:** validateAssignmentUpdate(), sanitizeHtml()

💻 **DTOs:**
- `apps/backend/src/modules/teacher/dto/create-assignment.dto.ts`
  - **Validación:** título (1-255), puntos (1-1000), tipo enum, HTML sanitization
- `apps/backend/src/modules/teacher/dto/update-assignment.dto.ts`
- `apps/backend/src/modules/teacher/dto/assign-classroom.dto.ts`
- `apps/backend/src/modules/teacher/dto/assign-classrooms-batch.dto.ts`
- `apps/backend/src/modules/teacher/dto/grade-submission.dto.ts`

💻 **Entities:**
- `apps/backend/src/modules/teacher/entities/assignment.entity.ts`
- `apps/backend/src/modules/teacher/entities/assignment-classroom.entity.ts`
- `apps/backend/src/modules/progress/entities/submission.entity.ts`

💻 **Guards:**
- `apps/backend/src/shared/guards/roles.guard.ts` - Verifica rol admin_teacher
- `apps/backend/src/modules/teacher/guards/assignment-ownership.guard.ts` - Verifica ownership del assignment
- `apps/backend/src/modules/teacher/guards/assignment-update.guard.ts` - Valida que no tenga submissions antes de actualizar

💻 **Utils:**
- `apps/backend/src/shared/utils/html-sanitizer.util.ts` - Sanitiza HTML usando DOMPurify (prevención XSS)

### Frontend
🎨 **Componentes:**
- `apps/frontend/src/features/teacher/components/AssignmentList.tsx`
  - **Propósito:** Lista paginada de assignments con filtros
- `apps/frontend/src/features/teacher/components/AssignmentCard.tsx`
  - **Propósito:** Tarjeta de assignment con estadísticas (submissions, avg_score, completion_rate)
- `apps/frontend/src/features/teacher/components/CreateAssignmentModal.tsx`
  - **Propósito:** Modal con rich text editor (TipTap) para crear assignment
- `apps/frontend/src/features/teacher/components/EditAssignmentModal.tsx`
  - **Propósito:** Modal para editar assignment (valida que no tenga submissions)
- `apps/frontend/src/features/teacher/components/AssignToClassroomsModal.tsx`
  - **Propósito:** Modal multi-select para asignar a classrooms
- `apps/frontend/src/features/teacher/components/SubmissionsList.tsx`
  - **Propósito:** Lista de submissions de un assignment con filtros (pending, graded, late)
- `apps/frontend/src/features/teacher/components/GradeSubmissionModal.tsx`
  - **Propósito:** Modal para calificar submission con feedback

🎨 **Hooks:**
- `apps/frontend/src/features/teacher/hooks/useAssignments.ts`
  - **Métodos:** useCreateAssignment, useUpdateAssignment, useDeleteAssignment
- `apps/frontend/src/features/teacher/hooks/useAssignmentClassrooms.ts`
  - **Métodos:** useAssignToClassroom, useAssignToClassroomsBatch
- `apps/frontend/src/features/teacher/hooks/useSubmissions.ts`
  - **Métodos:** useGetSubmissions, useGradeSubmission

🎨 **Types:**
- `apps/frontend/src/types/teacher.types.ts`
  - **Interfaces:** Assignment, AssignmentWithStats, AssignmentClassroom, CreateAssignmentDto, UpdateAssignmentDto
  - **Enums:** AssignmentType, AssignmentStatus, SubmissionStatus

🎨 **Services:**
- `apps/frontend/src/services/api/teacher.service.ts`
  - **Métodos API:** createAssignment(), getAssignments(), updateAssignment(), deleteAssignment()
  - **Métodos asignación:** assignToClassroom(), assignToClassroomsBatch()
  - **Métodos submissions:** getSubmissions(), gradeSubmission()

🎨 **Rich Text Editor:**
- `apps/frontend/src/components/shared/RichTextEditor.tsx`
  - **Library:** TipTap
  - **Features:** Bold, italic, lists, links, HTML sanitization en output

---

## Matriz de Permisos

### Permisos de Assignments

| Endpoint | teacher | admin_teacher | super_admin | Notas |
|----------|---------|---------------|-------------|-------|
| POST /api/teacher/assignments | ✓ | ✓ | ✓ | Crea assignment propio |
| GET /api/teacher/assignments | ✓ | ✓ | ✓ | Solo ve propios |
| GET /api/teacher/assignments/:id | ✓ | ✓ | ✓ | Solo si es owner |
| PUT /api/teacher/assignments/:id | ✓ | ✓ | ✓ | Solo si es owner |
| DELETE /api/teacher/assignments/:id | ✓ | ✓ | ✓ | Solo si es owner |
| POST /assignments/:id/assign | ✓ | ✓ | ✓ | Solo si es owner |
| GET /assignments/:id/submissions | ✓ | ✓ | ✓ | Solo si es owner |
| POST /assignments/:id/grade | ✓ | ✓ | ✓ | Solo submissions de sus classrooms |

### Reglas de Ownership

**REQ-PERM-002:** Un profesor solo puede ver, modificar o eliminar sus propios assignments (assignment.teacher_id === user.id).

---

## Casos de Uso

### Caso de Uso: Crear y Asignar Assignment

**Actor Principal:** Profesor

**Precondiciones:**
- El profesor tiene al menos un classroom creado
- El profesor está autenticado

**Flujo Principal:**
1. El profesor navega a "Assignments"
2. El profesor hace clic en "Create Assignment"
3. El sistema muestra formulario con rich text editor
4. El profesor ingresa:
   - Título: "Chapter 5 Quiz"
   - Tipo: "quiz"
   - Puntos máximos: 100
   - Descripción con formato (bold, lists)
   - Deadline: "2025-10-30T23:59:59Z"
5. El profesor hace clic en "Save"
6. El sistema sanitiza el HTML
7. El sistema crea el assignment con status='draft'
8. El profesor hace clic en "Assign to Classrooms"
9. El profesor selecciona "Math 101" y "Math 102"
10. El profesor hace clic en "Assign"
11. El sistema crea registros en assignment_classrooms
12. El sistema calcula total de estudiantes asignados
13. El sistema muestra confirmación: "Assigned to 2 classrooms (48 students)"

**Flujos Alternativos:**

**5a. Puntos inválidos:**
1. El sistema muestra error "Points must be between 1 and 1000"
2. El profesor corrige los puntos
3. El flujo continúa en paso 5

**9a. Classroom inválido:**
1. El sistema marca el classroom como fallido
2. El sistema asigna a los classrooms válidos
3. El sistema muestra: "Assigned to 1 classroom. 1 failed."

**Postcondiciones:**
- El assignment está creado y asignado a los classrooms seleccionados
- Los estudiantes de esos classrooms ven el nuevo assignment

---

## Referencias

### Documentación Relacionada
- **Épica EP009:** `/docs/04-planificacion/epicas/EP009-teacher-portal/README.md`
- **Historia HU-EP009-02:** `/docs/04-planificacion/epicas/EP009-teacher-portal/historias/HU-EP009-02-assignment-management.md`
- **API Reference:** `/docs/02-especificaciones-tecnicas/apis/API-REFERENCE.md` (líneas 597-2130)
- **Database Schema:** `/docs/03-desarrollo/base-de-datos/schemas/content_management/`

### Stack Tecnológico

#### Backend
- HTML Sanitization: DOMPurify (isomorphic-dompurify)
- Validación: Joi o Zod

#### Frontend
- Rich Text Editor: TipTap
- Forms: React Hook Form + Zod validation

---

**Última actualización:** 2025-11-01
**Versión:** 2.0 (RFC-0001)
**Estado:** APROBADO
