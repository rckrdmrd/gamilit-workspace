# Requerimientos Teacher Portal - Calificación y Progreso

**Proyecto:** Gamilit Platform
**Portal:** Teacher
**Archivo original:** REQUERIMIENTOS-TEACHER-PORTAL.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Tabla de Contenidos

1. [Sistema de Calificación](#sistema-de-calificación)
2. [Seguimiento de Progreso](#seguimiento-de-progreso)
3. [Matriz de Permisos](#matriz-de-permisos)
4. [Casos de Uso](#casos-de-uso)
5. [Referencias](#referencias)

---

## Sistema de Calificación

### 2.3 Sistema de Calificación (HU-EP009-03)

**Historia de Usuario:** Como profesor, quiero calificar submissions y proporcionar feedback detallado para evaluar el desempeño de mis estudiantes y guiar su aprendizaje.

**Story Points:** 16 SP | **Prioridad:** Alta (P1)

#### 2.3.1 Cola de Calificación
**REQ-TCH-040:** El sistema debe proporcionar una cola (queue) de submissions pendientes de calificación.

**REQ-TCH-041:** La cola debe permitir filtrar por:
- Classroom
- Assignment
- Estudiante específico
- Ordenamiento: oldest, newest, priority

**REQ-TCH-042:** El ordenamiento por prioridad debe mostrar primero las submissions tardías.

**REQ-TCH-043:** Cada item en la cola debe mostrar:
- Información del assignment
- Información del estudiante
- Fecha de entrega
- Días de espera
- Indicador de tardanza

#### 2.3.2 Visualización de Submissions
**REQ-TCH-044:** El sistema debe mostrar detalles completos de una submission incluyendo:
- Datos del assignment (título, descripción, instrucciones, max_points)
- Información del estudiante (nombre, email, avatar)
- Contenido de la submission
- Archivos adjuntos
- Historial de submissions previas (si existen)
- Estado actual de calificación

#### 2.3.3 Proceso de Calificación
**REQ-TCH-045:** El sistema debe permitir calificar una submission con:
- Puntos obtenidos (obligatorio, 0 <= points <= max_points)
- Feedback textual (opcional, rich text HTML, máximo 2000 caracteres)
- Estado: graded, pending_review, needs_revision
- Opción de notificar al estudiante (default: true)

**REQ-TCH-046:** El sistema debe validar que los puntos estén en el rango válido (0 a max_points del assignment).

**REQ-TCH-047:** Si points < 0 o points > max_points, el sistema debe retornar error 400 con mensaje descriptivo.

**REQ-TCH-048:** El sistema debe sanitizar el feedback HTML para prevenir XSS.

#### 2.3.4 Actualización de Calificaciones (Re-grading)
**REQ-TCH-049:** El sistema debe permitir actualizar una calificación existente.

**REQ-TCH-050:** Al actualizar una calificación, el sistema debe:
- Crear un registro en audit log con: old_points, new_points, changed_by, changed_at
- Actualizar graded_at a la nueva fecha
- Notificar al estudiante del cambio

#### 2.3.5 Estados de Submission
**REQ-TCH-051:** El sistema debe soportar los siguientes estados:
- **pending:** Sin calificar
- **graded:** Calificada completamente
- **pending_review:** Requiere revisión adicional
- **needs_revision:** Estudiante debe re-enviar

**REQ-TCH-052:** Si el estado es 'needs_revision', el estudiante debe poder re-enviar la submission.

#### 2.3.6 Feedback sin Calificación
**REQ-TCH-053:** El sistema debe permitir agregar/actualizar feedback sin cambiar la calificación.

**REQ-TCH-054:** Al agregar solo feedback, los puntos y estado deben permanecer sin cambios.

#### 2.3.7 Sistema de Notificaciones
**REQ-TCH-055:** El sistema debe enviar notificaciones cuando se califique una submission:
- Notificación in-app
- Email al estudiante
- Incluir: título del assignment, puntos obtenidos, feedback

**REQ-TCH-056:** Las notificaciones deben procesarse de forma asíncrona mediante job queue.

**REQ-TCH-057:** El sistema debe retornar confirmación de notification_sent en la respuesta.

#### 2.3.8 Control de Acceso
**REQ-TCH-058:** Solo los profesores que tengan al estudiante en sus classrooms pueden calificar sus submissions.

**REQ-TCH-059:** El sistema debe verificar la relación teacher-student-classroom antes de permitir calificación.

#### 2.3.9 Audit Log
**REQ-TCH-060:** El sistema debe mantener un registro de auditoría de todas las calificaciones y cambios:
- submission_id
- teacher_id
- action: 'grade', 'update_grade', 'add_feedback'
- old_points / new_points
- timestamp

#### 2.3.10 Endpoints API
- GET /api/teacher/grading/pending
- GET /api/teacher/grading/:submissionId
- POST /api/teacher/grading/:submissionId/grade
- POST /api/teacher/grading/:submissionId/feedback

---

## Seguimiento de Progreso

### 2.4 Seguimiento de Progreso (HU-EP009-04)

**Historia de Usuario:** Como profesor, quiero monitorear el progreso individual de mis estudiantes y agregar notas privadas para identificar quiénes necesitan apoyo adicional.

**Story Points:** 12 SP | **Prioridad:** Media (P2)

#### 2.4.1 Visualización de Progreso General
**REQ-TCH-070:** El sistema debe mostrar progreso general del estudiante incluyendo:
- Total de assignments asignados
- Assignments completados y pendientes
- Tasa de completitud (percentage)
- Promedio de calificaciones (0-100)
- Total de puntos obtenidos vs posibles

**REQ-TCH-071:** El progreso debe calcularse por rango de fechas configurable (default: año escolar actual).

**REQ-TCH-072:** El sistema debe proporcionar breakdown del progreso por classroom.

#### 2.4.2 Submissions Recientes
**REQ-TCH-073:** El sistema debe mostrar las últimas 10 submissions del estudiante con:
- Título del assignment
- Fecha de entrega
- Puntos obtenidos
- Indicador de tardanza

#### 2.4.3 Tendencia de Performance
**REQ-TCH-074:** El sistema debe calcular y mostrar tendencia de performance de las últimas 12 semanas:
- Promedio de calificaciones por semana
- Número de submissions por semana
- Gráfica de línea de tendencia

#### 2.4.4 Analytics Detallado
**REQ-TCH-075:** El sistema debe proporcionar analytics detallado incluyendo:
- **Time metrics:** Tiempo total en plataforma, tiempo promedio por assignment, último login
- **Performance by type:** Promedio y tasa de completitud por tipo de assignment (quiz, homework, project, etc.)
- **Performance by subject:** Promedio por materia
- **Strengths:** Temas con >85% de promedio
- **Areas for improvement:** Temas con <70% de promedio
- **Engagement score:** 0-100 basado en frecuencia de login y actividad
- **Consistency score:** 0-100 basado en regularidad de submissions

#### 2.4.5 Detección de Estudiantes en Riesgo
**REQ-TCH-076:** El sistema debe identificar automáticamente estudiantes en riesgo (at_risk) si:
- Promedio de calificaciones < 70%, O
- Tasa de completitud < 50%, O
- Sin login en últimos 7 días, O
- Sin submissions en últimos 14 días

**REQ-TCH-077:** Para cada estudiante en riesgo, el sistema debe proporcionar razones específicas (at_risk_reasons array).

#### 2.4.6 Notas Privadas del Profesor
**REQ-TCH-078:** El sistema debe permitir a los profesores crear notas privadas sobre estudiantes.

**REQ-TCH-079:** Las notas deben tener:
- Contenido de texto (rich text HTML, máximo 2000 caracteres)
- Marca is_private = true (siempre privadas)
- Fecha de creación
- Asociación a teacher_id y student_id

**REQ-TCH-080:** Las notas privadas SOLO son visibles para el profesor que las creó.

**REQ-TCH-081:** El sistema debe listar las notas de un estudiante con paginación, ordenadas por fecha de creación descendente.

**REQ-TCH-082:** El contenido HTML de las notas debe ser sanitizado para prevenir XSS.

#### 2.4.7 Exportación de Datos
**REQ-TCH-083:** El sistema debe permitir exportar el progreso del estudiante en formato CSV.

**REQ-TCH-084:** El CSV debe incluir: assignments, submissions, grades, fechas.

#### 2.4.8 Control de Acceso
**REQ-TCH-085:** Solo los profesores que tienen al estudiante en sus classrooms pueden ver su progreso y analytics.

**REQ-TCH-086:** El sistema debe verificar la relación teacher-student via classrooms antes de mostrar datos.

#### 2.4.9 Endpoints API
- GET /api/teacher/students/:id/progress
- GET /api/teacher/students/:id/analytics
- GET /api/teacher/students/:id/notes
- POST /api/teacher/students/:id/notes

---

## 🔗 Referencias a Implementación

### Database
🗄️ **Tablas:**
- `progress_tracking.submissions` → `apps/database/ddl/schemas/progress_tracking/tables/submissions.sql`
  - **Propósito:** Almacena submissions de estudiantes con calificaciones
  - **Columnas clave:** `id`, `assignment_id`, `student_id`, `points_earned`, `max_points`, `status`, `feedback`, `graded_at`, `graded_by`, `submitted_at`
- `audit_logging.grading_audit_log` → `apps/database/ddl/schemas/audit_logging/tables/grading_audit_log.sql`
  - **Propósito:** Registro de auditoría de calificaciones y cambios (re-grading)
  - **Columnas clave:** `submission_id`, `teacher_id`, `action`, `old_points`, `new_points`, `changed_at`
- `progress_tracking.student_notes` → `apps/database/ddl/schemas/progress_tracking/tables/student_notes.sql`
  - **Propósito:** Notas privadas de profesores sobre estudiantes
  - **Columnas clave:** `id`, `teacher_id`, `student_id`, `content`, `is_private`, `created_at`

🗄️ **ENUMs:**
- `submission_status` → `apps/database/ddl/00-prerequisites.sql` (pending, graded, pending_review, needs_revision)
- `grading_action_type` → `apps/database/ddl/00-prerequisites.sql` (grade, update_grade, add_feedback)

🗄️ **Foreign Keys:**
- `submissions.assignment_id` → `assignments(id)`
- `submissions.student_id` → `auth.users(id)`
- `submissions.graded_by` → `auth.users(id)`
- `grading_audit_log.submission_id` → `submissions(id)`
- `grading_audit_log.teacher_id` → `auth.users(id)`
- `student_notes.teacher_id` → `auth.users(id)`
- `student_notes.student_id` → `auth.users(id)`

🗄️ **Indexes:**
- `submissions` índices en: (status), (assignment_id, status), (student_id, submitted_at), (graded_by)
- `grading_audit_log` índices en: (submission_id, changed_at)
- `student_notes` índices en: (teacher_id, student_id, is_private)

### Backend
💻 **Controllers:**
- `apps/backend/src/modules/teacher/controllers/grading.controller.ts`
  - **Endpoints implementados:**
    - GET /api/teacher/grading/pending - Cola de submissions pendientes
    - GET /api/teacher/grading/:submissionId - Detalle de submission
    - POST /api/teacher/grading/:submissionId/grade - Calificar submission
    - POST /api/teacher/grading/:submissionId/feedback - Agregar feedback sin calificar
- `apps/backend/src/modules/teacher/controllers/student-progress.controller.ts`
  - **Endpoints implementados:**
    - GET /api/teacher/students/:id/progress - Progreso general
    - GET /api/teacher/students/:id/analytics - Analytics detallado
    - GET /api/teacher/students/:id/notes - Notas privadas
    - POST /api/teacher/students/:id/notes - Crear nota privada

💻 **Services:**
- `apps/backend/src/modules/teacher/services/grading.service.ts`
  - **Métodos:** getPendingQueue(), getSubmissionDetails(), gradeSubmission(), addFeedback(), updateGrade()
  - **Validaciones:** validatePointsRange(), sanitizeHtml()
- `apps/backend/src/modules/teacher/services/student-progress.service.ts`
  - **Métodos:** getStudentProgress(), getDetailedAnalytics(), getRecentSubmissions()
  - **Cálculos:** calculateCompletionRate(), calculateAverageGrade(), detectAtRisk(), calculateTrend()
- `apps/backend/src/modules/teacher/services/student-notes.service.ts`
  - **Métodos:** createNote(), getNotes(), updateNote(), deleteNote()
- `apps/backend/src/modules/teacher/services/grading-audit.service.ts`
  - **Métodos:** createAuditLog(), getAuditHistory()
  - **Propósito:** Registro de cambios de calificaciones para compliance

💻 **DTOs:**
- `apps/backend/src/modules/teacher/dto/grade-submission.dto.ts`
  - **Validación:** points_earned (0-max_points), feedback (HTML), status enum, notify_student boolean
- `apps/backend/src/modules/teacher/dto/add-feedback.dto.ts`
- `apps/backend/src/modules/teacher/dto/update-grade.dto.ts`
- `apps/backend/src/modules/teacher/dto/create-student-note.dto.ts`
  - **Validación:** content (HTML, max 2000), is_private (always true)
- `apps/backend/src/modules/teacher/dto/progress-query.dto.ts`
  - **Opciones:** date_range, classroom_id, include_analytics

💻 **Entities:**
- `apps/backend/src/modules/progress/entities/submission.entity.ts`
- `apps/backend/src/modules/audit/entities/grading-audit-log.entity.ts`
- `apps/backend/src/modules/progress/entities/student-note.entity.ts`

💻 **Guards:**
- `apps/backend/src/shared/guards/roles.guard.ts` - Verifica rol admin_teacher
- `apps/backend/src/modules/teacher/guards/student-access.guard.ts` - Verifica relación teacher-student via classroom
- `apps/backend/src/modules/teacher/guards/submission-access.guard.ts` - Verifica acceso a submission via classroom

💻 **Jobs/Queue:**
- `apps/backend/src/modules/notifications/jobs/grading-notification.job.ts`
  - **Queue:** Bull/BullMQ
  - **Propósito:** Envío asíncrono de notificaciones de calificación
  - **Payload:** submission_id, student_id, points_earned, feedback
  - **Retry:** 3 intentos

💻 **Utils:**
- `apps/backend/src/shared/utils/html-sanitizer.util.ts` - Sanitiza feedback HTML (DOMPurify)
- `apps/backend/src/shared/utils/progress-calculator.util.ts`
  - **Métodos:** calculateCompletionRate(), calculateAverageGrade(), calculateTrend()
- `apps/backend/src/shared/utils/at-risk-detector.util.ts`
  - **Métodos:** detectAtRisk(), getAtRiskReasons()
  - **Criterios:** avg < 70%, completion < 50%, no login 7d, no submissions 14d

### Frontend
🎨 **Componentes Grading:**
- `apps/frontend/src/features/teacher/components/GradingQueue.tsx`
  - **Propósito:** Cola de submissions pendientes con filtros (classroom, assignment, student, order)
- `apps/frontend/src/features/teacher/components/GradingQueueItem.tsx`
  - **Propósito:** Item de cola con info assignment, estudiante, días de espera, indicador de tardanza
- `apps/frontend/src/features/teacher/components/SubmissionViewer.tsx`
  - **Propósito:** Vista detallada de submission con contenido, archivos adjuntos, historial
- `apps/frontend/src/features/teacher/components/GradeSubmissionForm.tsx`
  - **Propósito:** Formulario de calificación con validación de puntos, rich text feedback, notify checkbox
- `apps/frontend/src/features/teacher/components/GradingHistoryModal.tsx`
  - **Propósito:** Modal con historial de cambios de calificación (audit log)

🎨 **Componentes Student Progress:**
- `apps/frontend/src/features/teacher/components/StudentProgressDashboard.tsx`
  - **Propósito:** Dashboard principal con progreso general, completion rate, avg grade
- `apps/frontend/src/features/teacher/components/ProgressBreakdown.tsx`
  - **Propósito:** Breakdown por classroom y assignment type
- `apps/frontend/src/features/teacher/components/RecentSubmissionsList.tsx`
  - **Propósito:** Lista de últimas 10 submissions con indicador de tardanza
- `apps/frontend/src/features/teacher/components/PerformanceTrendChart.tsx`
  - **Propósito:** Gráfica de tendencia de 12 semanas (línea de avg_grade y submissions count)
- `apps/frontend/src/features/teacher/components/DetailedAnalyticsPanel.tsx`
  - **Propósito:** Panel con time metrics, performance by type/subject, strengths, areas for improvement
- `apps/frontend/src/features/teacher/components/AtRiskAlert.tsx`
  - **Propósito:** Alerta prominente con razones de riesgo

🎨 **Componentes Student Notes:**
- `apps/frontend/src/features/teacher/components/StudentNotesList.tsx`
  - **Propósito:** Lista de notas privadas del profesor con paginación
- `apps/frontend/src/features/teacher/components/CreateStudentNoteModal.tsx`
  - **Propósito:** Modal con rich text editor para crear nota privada
- `apps/frontend/src/features/teacher/components/StudentNoteCard.tsx`
  - **Propósito:** Tarjeta de nota con fecha, contenido HTML, opciones de edición

🎨 **Hooks:**
- `apps/frontend/src/features/teacher/hooks/useGradingQueue.ts`
  - **Métodos:** useGetPendingQueue, useGradeSubmission, useAddFeedback
- `apps/frontend/src/features/teacher/hooks/useStudentProgress.ts`
  - **Métodos:** useGetStudentProgress, useGetStudentAnalytics
- `apps/frontend/src/features/teacher/hooks/useStudentNotes.ts`
  - **Métodos:** useGetNotes, useCreateNote, useUpdateNote, useDeleteNote

🎨 **Types:**
- `apps/frontend/src/types/grading.types.ts`
  - **Interfaces:** Submission, GradingQueueItem, GradeSubmissionDto, GradingAuditLog
  - **Enums:** SubmissionStatus, GradingActionType
- `apps/frontend/src/types/student-progress.types.ts`
  - **Interfaces:** StudentProgress, StudentAnalytics, StudentNote, PerformanceTrend, AtRiskStudent
  - **Types:** ProgressBreakdown, TimeMetrics, PerformanceByType

🎨 **Services:**
- `apps/frontend/src/services/api/grading.service.ts`
  - **Métodos API:** getPendingQueue(), getSubmission(), gradeSubmission(), addFeedback()
- `apps/frontend/src/services/api/student-progress.service.ts`
  - **Métodos API:** getStudentProgress(), getStudentAnalytics(), exportProgressCSV()
- `apps/frontend/src/services/api/student-notes.service.ts`
  - **Métodos API:** getNotes(), createNote(), updateNote(), deleteNote()

🎨 **Utils:**
- `apps/frontend/src/utils/grading-helpers.ts`
  - **Métodos:** calculateDaysWaiting(), isLateSubmission(), formatGrade()
- `apps/frontend/src/utils/progress-formatters.ts`
  - **Métodos:** formatCompletionRate(), formatAverageGrade(), formatTrendData()

---

## Matriz de Permisos

### Permisos de Grading

| Endpoint | teacher | admin_teacher | super_admin | Notas |
|----------|---------|---------------|-------------|-------|
| GET /api/teacher/grading/pending | ✓ | ✓ | ✓ | Solo de sus classrooms |
| GET /api/teacher/grading/:submissionId | ✓ | ✓ | ✓ | Solo si tiene acceso al student |
| POST /grading/:submissionId/grade | ✓ | ✓ | ✓ | Solo si tiene acceso al student |
| POST /grading/:submissionId/feedback | ✓ | ✓ | ✓ | Solo si tiene acceso al student |

### Permisos de Student Progress

| Endpoint | teacher | admin_teacher | super_admin | Notas |
|----------|---------|---------------|-------------|-------|
| GET /api/teacher/students/:id/progress | ✓ | ✓ | ✓ | Solo si student en sus classrooms |
| GET /api/teacher/students/:id/analytics | ✓ | ✓ | ✓ | Solo si student en sus classrooms |
| GET /api/teacher/students/:id/notes | ✓ | ✓ | ✓ | Solo ve sus propias notas |
| POST /api/teacher/students/:id/notes | ✓ | ✓ | ✓ | Solo si student en sus classrooms |

### Reglas de Ownership

**REQ-PERM-003:** Un profesor solo puede calificar submissions de estudiantes que estén en sus classrooms.

**REQ-PERM-004:** Un profesor solo puede ver progreso/analytics de estudiantes que estén en sus classrooms.

**REQ-PERM-005:** Las notas privadas son visibles SOLO para el profesor que las creó (note.teacher_id === user.id).

---

## Casos de Uso

### Caso de Uso: Calificar Submission

**Actor Principal:** Profesor

**Precondiciones:**
- Existen submissions pendientes de calificación
- El profesor tiene acceso al estudiante via classroom

**Flujo Principal:**
1. El profesor navega a "Grading Queue"
2. El sistema muestra lista de submissions pendientes ordenadas por antigüedad
3. El profesor filtra por "Math 101"
4. El profesor hace clic en la primera submission (John Doe - Chapter 5 Quiz)
5. El sistema muestra:
   - Detalles del assignment
   - Información del estudiante
   - Contenido de la submission
   - Archivos adjuntos
6. El profesor revisa el contenido
7. El profesor ingresa:
   - Puntos: 85 (de 100)
   - Feedback: "Good work! Review question #3 calculations."
   - Estado: "graded"
   - Notify student: checked
8. El profesor hace clic en "Submit Grade"
9. El sistema valida que 0 <= 85 <= 100
10. El sistema actualiza la submission:
    - points_earned = 85
    - status = 'graded'
    - graded_at = NOW()
    - graded_by = teacher_id
11. El sistema sanitiza el feedback HTML
12. El sistema crea job de notificación (async)
13. El sistema muestra mensaje: "Grade submitted successfully"
14. El sistema envía notificación email + in-app al estudiante
15. El sistema remueve la submission de la cola

**Flujos Alternativos:**

**9a. Puntos fuera de rango:**
1. El sistema muestra error "Points cannot exceed max points (100)"
2. El profesor corrige los puntos
3. El flujo continúa en paso 8

**11a. Notificación falla:**
1. El sistema reintenta el job 3 veces
2. Si falla, crea log de error
3. La calificación se guarda igual
4. Se envía solo notificación in-app

**Postcondiciones:**
- La submission está calificada
- El estudiante recibe notificación
- La submission no aparece más en pending queue

---

### Caso de Uso: Monitorear Progreso de Estudiante

**Actor Principal:** Profesor

**Precondiciones:**
- El estudiante está en al menos un classroom del profesor
- Existen assignments y submissions del estudiante

**Flujo Principal:**
1. El profesor navega a "Math 101" classroom
2. El profesor hace clic en el estudiante "John Doe"
3. El sistema verifica relación teacher-student via classroom
4. El sistema muestra dashboard de progreso:
   - Overall progress: 12/15 assignments (80%), avg: 85%
   - Performance trend chart (últimas 12 semanas)
   - Recent submissions (últimas 10)
   - Breakdown by classroom
5. El profesor hace clic en "View Detailed Analytics"
6. El sistema muestra:
   - Time metrics
   - Performance by type (quiz: 90%, homework: 82%, etc.)
   - Performance by subject
   - Strengths: ["Algebra", "Geometry"]
   - Areas for improvement: ["Statistics"]
   - At risk: No
7. El profesor identifica que el estudiante necesita ayuda en Statistics
8. El profesor hace clic en "Add Note"
9. El profesor escribe: "Student needs extra help with statistics concepts"
10. El profesor hace clic en "Save Note"
11. El sistema crea la nota con is_private=true
12. El sistema muestra confirmación
13. La nota aparece en la sección "Private Notes"

**Flujos Alternativos:**

**3a. Acceso denegado:**
1. El sistema verifica que el estudiante NO está en classrooms del profesor
2. El sistema muestra error 403 "You don't have access to this student"
3. El caso de uso termina

**6a. Estudiante en riesgo:**
1. El sistema detecta at_risk=true (avg < 70%)
2. El sistema muestra alerta prominente: "At Risk Student"
3. El sistema lista razones: ["Low average grade (65%)", "Completion rate below 50%"]
4. El flujo continúa normalmente

**Postcondiciones:**
- El profesor tiene visibilidad completa del progreso del estudiante
- La nota privada queda registrada para referencia futura

---

## Referencias

### Documentación Relacionada
- **Épica EP009:** `/docs/04-planificacion/epicas/EP009-teacher-portal/README.md`
- **Historia HU-EP009-03:** `/docs/04-planificacion/epicas/EP009-teacher-portal/historias/HU-EP009-03-grading-system.md`
- **Historia HU-EP009-04:** `/docs/04-planificacion/epicas/EP009-teacher-portal/historias/HU-EP009-04-student-progress.md`
- **API Reference:** `/docs/02-especificaciones-tecnicas/apis/API-REFERENCE.md` (líneas 597-2130)

### Stack Tecnológico

#### Backend
- Job Queue: Bull/BullMQ
- HTML Sanitization: DOMPurify (isomorphic-dompurify)
- Logging: Winston

#### Frontend
- Charts: Recharts o Chart.js
- Rich Text Editor: TipTap

---

**Última actualización:** 2025-11-01
**Versión:** 2.0 (RFC-0001)
**Estado:** APROBADO
