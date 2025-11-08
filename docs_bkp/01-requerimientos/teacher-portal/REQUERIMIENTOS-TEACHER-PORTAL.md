# Requerimientos - Portal Docente (Teacher Portal)

## 1. Visión General

### 1.1 Propósito del Documento
Este documento define los requerimientos funcionales y no funcionales para el Portal Docente (Teacher Portal) de la plataforma GAMILIT, correspondiente a la Épica EP009. El Teacher Portal es un componente crítico que permite a los profesores gestionar sus aulas virtuales, crear y administrar tareas, calificar entregas de estudiantes, monitorear progreso y generar reportes analíticos.

### 1.2 Alcance del Sistema
El Teacher Portal cubre las siguientes funcionalidades principales:
- Gestión de Classrooms (aulas virtuales)
- Gestión de Assignments (tareas, proyectos, exámenes)
- Sistema de Calificación y Feedback
- Seguimiento de Progreso Estudiantil
- Analytics y Generación de Reportes

### 1.3 Métricas del Proyecto
| Métrica | Valor |
|---------|-------|
| Story Points Totales | 80 SP |
| Historias de Usuario | 5 historias |
| Endpoints API | 29 endpoints |
| Duración Estimada | 3 semanas (6 sprints) |
| Presupuesto | $12,000 USD |

### 1.4 Valor de Negocio
**Impacto:** CRÍTICO
- Sin el Teacher Portal, los profesores no pueden gestionar sus clases ni evaluar estudiantes
- ROI Estimado: Alto - Fundamental para adopción de la plataforma
- Usuarios Afectados: 100% de profesores (rol crítico)
- Cobertura de Fase 2: Esta épica implementa 29 endpoints documentados en Fase 2

---

## 2. Requerimientos Funcionales

### 2.1 Gestión de Classrooms (HU-EP009-01)

**Historia de Usuario:** Como profesor, quiero crear y administrar mis classrooms (aulas virtuales) para organizar a mis estudiantes por clase, grado y materia de forma eficiente.

**Story Points:** 16 SP | **Prioridad:** Alta (P1)

#### 2.1.1 Creación de Classrooms
**REQ-TCH-001:** El sistema debe permitir a los profesores crear nuevos classrooms con los siguientes datos:
- Nombre (obligatorio, 1-255 caracteres)
- Descripción (opcional, máximo 1000 caracteres)
- ID de escuela (opcional, UUID)
- Nivel de grado (opcional, máximo 50 caracteres)
- Materia (opcional, máximo 100 caracteres)

**REQ-TCH-002:** Cada classroom creado debe ser asignado automáticamente al teacher_id del profesor autenticado.

**REQ-TCH-003:** El sistema debe validar que el nombre del classroom no esté vacío y no exceda 255 caracteres.

#### 2.1.2 Listado y Búsqueda de Classrooms
**REQ-TCH-004:** El sistema debe proporcionar un listado paginado de classrooms con las siguientes opciones:
- Tamaños de página: 10, 25, 50, 100 items
- Filtros: estado activo/inactivo, materia, nivel de grado
- Ordenamiento por fecha de creación

**REQ-TCH-005:** El listado debe incluir estadísticas básicas para cada classroom:
- Total de estudiantes
- Assignments activos
- Promedio de calificaciones

#### 2.1.3 Visualización de Detalles
**REQ-TCH-006:** El sistema debe mostrar información detallada de un classroom incluyendo:
- Datos básicos del classroom
- Estadísticas completas (total_students, active_assignments, avg_grade)
- Lista de estudiantes matriculados
- Historial de actividad reciente

#### 2.1.4 Actualización de Classrooms
**REQ-TCH-007:** Los profesores deben poder actualizar la información de sus classrooms (nombre, descripción, grado, materia).

**REQ-TCH-008:** El sistema debe actualizar automáticamente el campo updated_at con la fecha y hora actual al realizar cambios.

**REQ-TCH-009:** Solo el profesor propietario del classroom puede modificar su información.

#### 2.1.5 Eliminación de Classrooms
**REQ-TCH-010:** El sistema debe implementar soft delete, marcando el classroom como inactivo (is_active = false) en lugar de eliminación física.

**REQ-TCH-011:** Los classrooms inactivos no deben aparecer en listados por defecto pero deben preservar todos sus datos históricos.

**REQ-TCH-012:** Al eliminar un classroom, los estudiantes y sus submissions deben preservarse para mantener integridad de datos.

#### 2.1.6 Gestión de Estudiantes
**REQ-TCH-013:** El sistema debe permitir agregar estudiantes a un classroom de forma individual o en lote (batch).

**REQ-TCH-014:** El sistema debe listar estudiantes de un classroom con paginación.

**REQ-TCH-015:** Los profesores deben poder remover estudiantes de un classroom.

**REQ-TCH-016:** Al agregar estudiantes en lote, el sistema debe:
- Validar cada student_id
- Agregar solo los IDs válidos
- Reportar operaciones exitosas y fallidas por separado

**REQ-TCH-017:** Al remover un estudiante, el progreso y submissions del estudiante deben preservarse.

#### 2.1.7 Endpoints API
- POST /api/teacher/classrooms
- GET /api/teacher/classrooms
- GET /api/teacher/classrooms/:id
- PUT /api/teacher/classrooms/:id
- DELETE /api/teacher/classrooms/:id
- GET /api/teacher/classrooms/:id/students
- POST /api/teacher/classrooms/:id/students
- DELETE /api/teacher/classrooms/:id/students/:studentId

---

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

### 2.5 Analytics y Reportes (HU-EP009-05)

**Historia de Usuario:** Como profesor, quiero generar reportes de desempeño de mis classrooms y ver analytics agregado para tomar decisiones informadas sobre mi enseñanza.

**Story Points:** 16 SP | **Prioridad:** Media (P2)

#### 2.5.1 Analytics de Classroom
**REQ-TCH-090:** El sistema debe proporcionar analytics agregado del classroom incluyendo:
- **Overall performance:** Total assignments, promedio de completitud, promedio de calificaciones, total submissions, pending grading
- **Grade distribution:** Distribución por rangos (90-100, 80-89, 70-79, 60-69, 0-59) con count y percentage
- **Performance by assignment:** Stats por assignment (average_grade, completion_rate, avg_time_to_complete)
- **Top performers:** Top 5 estudiantes con mejor promedio
- **At-risk students:** Estudiantes en riesgo con razones
- **Trend:** Tendencia de últimas 12 semanas (average_grade, submissions_count, completion_rate)

**REQ-TCH-091:** Los analytics deben ser filtrables por rango de fechas.

#### 2.5.2 Analytics Comparativo de Estudiante
**REQ-TCH-092:** El sistema debe proporcionar analytics comparativo mostrando:
- Performance del estudiante (average_grade, completion_rate, rank, percentile)
- Promedio del classroom
- Comparación (diferencia de calificaciones, above_average flag)
- Performance by topic (estudiante vs classroom)

**REQ-TCH-093:** El rank debe calcularse comparando al estudiante con todos los del classroom (1 = mejor).

**REQ-TCH-094:** El percentile debe representar la posición del estudiante (0-100).

#### 2.5.3 Analytics de Assignment
**REQ-TCH-095:** El sistema debe proporcionar estadísticas detalladas del assignment:
- **Statistics:** Total asignados, submissions, completion_rate, average_grade, median_grade, std_deviation, highest/lowest grade, avg_time_to_complete, late submissions
- **Grade distribution:** Por rangos
- **Difficulty assessment:**
  - 'too_easy' si average > 90%
  - 'appropriate' si 60% <= average <= 90%
  - 'too_hard' si average < 60%
- **Difficulty reason:** Justificación del assessment

#### 2.5.4 Métricas de Engagement
**REQ-TCH-096:** El sistema debe calcular métricas de engagement globales:
- **Overall engagement:** Total estudiantes, estudiantes activos (login últimos 7 días), tasa de actividad, frecuencia promedio de login, tiempo promedio en plataforma
- **By classroom:** Engagement score (0-100) por classroom
- **Activity timeline:** Actividad diaria de últimos 30 días (logins, submissions, time_on_platform)
- **Engagement alerts:** Alertas de estudiantes con:
  - no_login_7days: Sin login en 7 días
  - no_submission_14days: Sin submissions en 14 días
  - low_time: Tiempo en plataforma bajo

#### 2.5.5 Generación de Reportes
**REQ-TCH-097:** El sistema debe generar reportes predefinidos:
- **weekly:** Reporte semanal
- **monthly:** Reporte mensual
- **quarterly:** Reporte trimestral
- **custom:** Reporte personalizado con rango de fechas

**REQ-TCH-098:** Los reportes deben incluir:
- Summary general (total classrooms, students, assignments, overall avg_grade, completion_rate)
- Breakdown por classroom (students_count, assignments_count, average_grade, completion_rate, top_performer, at_risk_count)
- Metadata (report_id, generated_at, period)

#### 2.5.6 Exportación de Reportes
**REQ-TCH-099:** Los reportes deben ser exportables en los siguientes formatos:
- **JSON:** Respuesta API estándar
- **CSV:** Archivo CSV descargable
- **PDF:** Documento PDF con gráficas (si include_charts=true)

**REQ-TCH-100:** Los PDFs deben incluir:
- Logo de la plataforma
- Nombre del profesor
- Fecha de generación
- Gráficas visuales (si include_charts=true)
- Datos tabulares

**REQ-TCH-101:** Los archivos generados deben tener nombres descriptivos: `report_weekly_2025-10-28.pdf`

#### 2.5.7 Cache de Analytics
**REQ-TCH-102:** Los analytics deben cachearse en Redis con TTL de 5 minutos.

**REQ-TCH-103:** El cache debe invalidarse automáticamente cuando:
- Se crea nueva submission
- Se califica una submission
- Se modifica un assignment

**REQ-TCH-104:** El sistema debe lograr cache hit rate > 70%.

#### 2.5.8 Endpoints API
- GET /api/teacher/analytics/classroom/:id
- GET /api/teacher/analytics/student/:id
- GET /api/teacher/analytics/assignment/:id
- GET /api/teacher/analytics/engagement
- GET /api/teacher/analytics/reports

---

## 3. Requerimientos No Funcionales

### 3.1 Performance

#### 3.1.1 Tiempos de Respuesta
**REQ-NFR-001:** Los endpoints de CRUD (classrooms, assignments) deben responder en p95 < 200ms.

**REQ-NFR-002:** Los endpoints de grading deben responder en p95 < 300ms (incluye notificación asíncrona).

**REQ-NFR-003:** Los endpoints de progreso/analytics sin cache deben responder en p95 < 500ms.

**REQ-NFR-004:** Los endpoints de analytics con cache hit deben responder en p95 < 100ms.

**REQ-NFR-005:** La generación de reportes PDF debe completarse en < 3 segundos.

#### 3.1.2 Throughput
**REQ-NFR-006:** El sistema debe soportar mínimo 1000 requests/segundo.

**REQ-NFR-007:** La tasa de error debe ser < 0.1%.

#### 3.1.3 Paginación
**REQ-NFR-008:** Todos los listados deben implementar paginación eficiente con LIMIT/OFFSET.

**REQ-NFR-009:** Las opciones de paginación deben ser: 10, 25, 50, 100 items por página.

#### 3.1.4 Cache Strategy
**REQ-NFR-010:** El sistema debe implementar cache Redis para analytics con TTL de 5 minutos.

**REQ-NFR-011:** El cache hit rate debe ser > 70%.

### 3.2 Seguridad

#### 3.2.1 Autenticación y Autorización
**REQ-NFR-020:** Todos los endpoints deben requerir autenticación JWT válida.

**REQ-NFR-021:** Solo usuarios con role 'teacher', 'admin_teacher' o 'super_admin' pueden acceder al Teacher Portal.

**REQ-NFR-022:** El sistema debe implementar middleware de ownership verification:
- `verifyClassroomOwnership`: Verifica classroom.teacher_id === user.id
- `verifyAssignmentOwnership`: Verifica assignment.teacher_id === user.id
- `verifyStudentAccess`: Verifica relación teacher-student via classrooms
- `verifySubmissionAccess`: Verifica acceso a submission via classroom

#### 3.2.2 Validación de Inputs
**REQ-NFR-023:** Todos los endpoints deben implementar validación de inputs con Joi o Zod schemas.

**REQ-NFR-024:** El sistema debe sanitizar todos los inputs HTML (descriptions, feedback, notes) para prevenir XSS usando DOMPurify.

**REQ-NFR-025:** Los UUIDs deben validarse con regex o validator library.

**REQ-NFR-026:** Las fechas deben validarse en formato ISO 8601.

#### 3.2.3 Rate Limiting
**REQ-NFR-027:** Todos los endpoints del Teacher Portal deben implementar rate limiting:
- Window: 15 minutos
- Max requests: 100 por IP
- Headers: standardHeaders: true, legacyHeaders: false

#### 3.2.4 Privacidad de Datos
**REQ-NFR-028:** Las notas privadas de profesores deben ser visibles SOLO para el profesor que las creó.

**REQ-NFR-029:** Los datos de estudiantes solo deben ser accesibles a profesores que los tienen en sus classrooms.

**REQ-NFR-030:** No se deben exponer IDs internos en mensajes de error.

#### 3.2.5 Audit Logging
**REQ-NFR-031:** El sistema debe mantener audit logs de:
- Cambios de calificaciones (re-grading)
- Creación/modificación/eliminación de assignments
- Modificación de classrooms

### 3.3 Usabilidad

#### 3.3.1 Mensajes de Error
**REQ-NFR-040:** Los mensajes de error deben ser claros, descriptivos y accionables.

**REQ-NFR-041:** Los códigos de error HTTP deben ser apropiados:
- 400: Bad Request (validación)
- 401: Unauthorized (sin auth)
- 403: Forbidden (sin permisos)
- 404: Not Found
- 422: Unprocessable Entity (reglas de negocio)
- 500: Internal Server Error

#### 3.3.2 Feedback Visual
**REQ-NFR-042:** El frontend debe mostrar loading states durante operaciones asíncronas.

**REQ-NFR-043:** El frontend debe mostrar toast notifications para operaciones exitosas/fallidas.

**REQ-NFR-044:** Los formularios deben mostrar validación en tiempo real.

#### 3.3.3 Responsive Design
**REQ-NFR-045:** Todas las interfaces deben ser responsive y funcionar en:
- Desktop (>1024px)
- Tablet (768px - 1024px)
- Mobile (< 768px)

### 3.4 Escalabilidad

#### 3.4.1 Base de Datos
**REQ-NFR-050:** El sistema debe implementar indexes en columnas frecuentemente consultadas:
- classrooms: teacher_id, is_active, subject, grade_level
- assignments: teacher_id, type, is_active
- submissions: student_id, assignment_id, status, submitted_at
- classroom_students: classroom_id, student_id

**REQ-NFR-051:** Las queries complejas de analytics deben optimizarse con EXPLAIN ANALYZE.

**REQ-NFR-052:** Se deben considerar materialized views para analytics de alta demanda.

#### 3.4.2 Procesamiento Asíncrono
**REQ-NFR-053:** Las notificaciones deben procesarse de forma asíncrona con job queue (Bull/BullMQ).

**REQ-NFR-054:** La generación de reportes PDF puede ser asíncrona si el tiempo excede 3 segundos.

### 3.5 Mantenibilidad

#### 3.5.1 Code Quality
**REQ-NFR-060:** El código debe seguir TypeScript strict mode.

**REQ-NFR-061:** El código debe pasar ESLint sin warnings.

**REQ-NFR-062:** El código debe formatearse con Prettier.

**REQ-NFR-063:** Los commits deben seguir Conventional Commits.

#### 3.5.2 Testing
**REQ-NFR-064:** El backend debe tener test coverage > 80%.

**REQ-NFR-065:** El frontend debe tener test coverage > 70%.

**REQ-NFR-066:** Debe haber tests E2E para flujos críticos.

#### 3.5.3 Logging
**REQ-NFR-067:** El sistema debe implementar logging estructurado con Winston.

**REQ-NFR-068:** Los logs deben incluir: timestamp, level, message, context, user_id.

**REQ-NFR-069:** No debe haber console.logs en producción.

### 3.6 Disponibilidad

**REQ-NFR-070:** El sistema debe tener uptime > 99.9%.

**REQ-NFR-071:** El sistema debe implementar health checks en /health endpoint.

**REQ-NFR-072:** El sistema debe tener monitoring con alertas automáticas.

---

## 4. Casos de Uso

### 4.1 Caso de Uso: Crear y Gestionar Classroom

**Actor Principal:** Profesor

**Precondiciones:**
- El profesor está autenticado en el sistema
- El profesor tiene rol 'teacher', 'admin_teacher' o 'super_admin'

**Flujo Principal:**
1. El profesor navega a la sección "My Classrooms"
2. El profesor hace clic en "Create Classroom"
3. El sistema muestra el formulario de creación
4. El profesor ingresa:
   - Nombre del classroom: "Mathematics 101"
   - Descripción: "Advanced mathematics for 6th grade"
   - Grade level: "6"
   - Subject: "Mathematics"
5. El profesor hace clic en "Create"
6. El sistema valida los datos
7. El sistema crea el classroom con teacher_id del profesor
8. El sistema muestra mensaje de éxito
9. El sistema redirige a la lista de classrooms

**Flujos Alternativos:**

**4a. Validación falla (nombre vacío):**
1. El sistema muestra error "Classroom name is required"
2. El profesor corrige el error
3. El flujo continúa en paso 5

**Postcondiciones:**
- El classroom es creado y visible en la lista del profesor
- El classroom está activo (is_active = true)

---

### 4.2 Caso de Uso: Crear y Asignar Assignment

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

### 4.3 Caso de Uso: Calificar Submission

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

### 4.4 Caso de Uso: Monitorear Progreso de Estudiante

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

### 4.5 Caso de Uso: Generar Reporte Mensual

**Actor Principal:** Profesor

**Precondiciones:**
- El profesor tiene classrooms con actividad del último mes
- Existen submissions y calificaciones

**Flujo Principal:**
1. El profesor navega a "Analytics & Reports"
2. El profesor hace clic en "Generate Report"
3. El sistema muestra formulario con opciones:
   - Report type: Monthly
   - Classroom: All
   - Format: PDF
   - Include charts: Yes
4. El profesor selecciona las opciones
5. El profesor hace clic en "Generate"
6. El sistema calcula el periodo (último mes completo)
7. El sistema consulta analytics agregado (con cache)
8. El sistema genera el reporte con:
   - Summary: 3 classrooms, 72 students, 45 assignments, 87% avg grade
   - Breakdown por classroom
   - Top performers y at-risk students
   - Grade distribution charts
   - Trend charts
9. El sistema genera el PDF con gráficas
10. El sistema retorna el archivo: "report_monthly_2025-10-28.pdf"
11. El navegador descarga el archivo
12. El profesor abre el PDF y revisa el contenido

**Flujos Alternativos:**

**9a. Generación de PDF tarda >3 segundos:**
1. El sistema mueve la generación a job queue
2. El sistema muestra: "Your report is being generated..."
3. El sistema muestra progress bar
4. Cuando termina, el sistema notifica al profesor
5. El profesor descarga el reporte

**7a. Cache miss:**
1. El sistema consulta base de datos
2. El sistema calcula analytics (500ms)
3. El sistema guarda en cache (TTL: 5 min)
4. El flujo continúa en paso 8

**Postcondiciones:**
- El profesor tiene un reporte PDF descargable con analytics del mes
- El reporte puede compartirse con administración o padres

---

## 5. Matriz de Permisos

### 5.1 Roles del Sistema
- **teacher:** Profesor regular
- **admin_teacher:** Profesor con permisos administrativos
- **super_admin:** Administrador del sistema

### 5.2 Permisos por Endpoint

| Endpoint | teacher | admin_teacher | super_admin | Notas |
|----------|---------|---------------|-------------|-------|
| **Classrooms** |
| POST /api/teacher/classrooms | ✓ | ✓ | ✓ | Crea classroom propio |
| GET /api/teacher/classrooms | ✓ | ✓ | ✓ | Solo ve propios |
| GET /api/teacher/classrooms/:id | ✓ | ✓ | ✓ | Solo si es owner |
| PUT /api/teacher/classrooms/:id | ✓ | ✓ | ✓ | Solo si es owner |
| DELETE /api/teacher/classrooms/:id | ✓ | ✓ | ✓ | Solo si es owner |
| GET /classrooms/:id/students | ✓ | ✓ | ✓ | Solo si es owner |
| POST /classrooms/:id/students | ✓ | ✓ | ✓ | Solo si es owner |
| DELETE /classrooms/:id/students/:sid | ✓ | ✓ | ✓ | Solo si es owner |
| **Assignments** |
| POST /api/teacher/assignments | ✓ | ✓ | ✓ | Crea assignment propio |
| GET /api/teacher/assignments | ✓ | ✓ | ✓ | Solo ve propios |
| GET /api/teacher/assignments/:id | ✓ | ✓ | ✓ | Solo si es owner |
| PUT /api/teacher/assignments/:id | ✓ | ✓ | ✓ | Solo si es owner |
| DELETE /api/teacher/assignments/:id | ✓ | ✓ | ✓ | Solo si es owner |
| POST /assignments/:id/assign | ✓ | ✓ | ✓ | Solo si es owner |
| GET /assignments/:id/submissions | ✓ | ✓ | ✓ | Solo si es owner |
| POST /assignments/:id/grade | ✓ | ✓ | ✓ | Solo submissions de sus classrooms |
| **Grading** |
| GET /api/teacher/grading/pending | ✓ | ✓ | ✓ | Solo de sus classrooms |
| GET /api/teacher/grading/:submissionId | ✓ | ✓ | ✓ | Solo si tiene acceso al student |
| POST /grading/:submissionId/grade | ✓ | ✓ | ✓ | Solo si tiene acceso al student |
| POST /grading/:submissionId/feedback | ✓ | ✓ | ✓ | Solo si tiene acceso al student |
| **Student Progress** |
| GET /api/teacher/students/:id/progress | ✓ | ✓ | ✓ | Solo si student en sus classrooms |
| GET /api/teacher/students/:id/analytics | ✓ | ✓ | ✓ | Solo si student en sus classrooms |
| GET /api/teacher/students/:id/notes | ✓ | ✓ | ✓ | Solo ve sus propias notas |
| POST /api/teacher/students/:id/notes | ✓ | ✓ | ✓ | Solo si student en sus classrooms |
| **Analytics** |
| GET /analytics/classroom/:id | ✓ | ✓ | ✓ | Solo si es owner del classroom |
| GET /analytics/student/:id | ✓ | ✓ | ✓ | Solo si student en sus classrooms |
| GET /analytics/assignment/:id | ✓ | ✓ | ✓ | Solo si es owner del assignment |
| GET /analytics/engagement | ✓ | ✓ | ✓ | Solo de sus classrooms |
| GET /analytics/reports | ✓ | ✓ | ✓ | Solo de sus classrooms |

### 5.3 Reglas de Ownership

**REQ-PERM-001:** Un profesor solo puede ver, modificar o eliminar sus propios classrooms (classroom.teacher_id === user.id).

**REQ-PERM-002:** Un profesor solo puede ver, modificar o eliminar sus propios assignments (assignment.teacher_id === user.id).

**REQ-PERM-003:** Un profesor solo puede calificar submissions de estudiantes que estén en sus classrooms.

**REQ-PERM-004:** Un profesor solo puede ver progreso/analytics de estudiantes que estén en sus classrooms.

**REQ-PERM-005:** Las notas privadas son visibles SOLO para el profesor que las creó (note.teacher_id === user.id).

**REQ-PERM-006:** Los admin_teacher tienen los mismos permisos que teacher (no privilegios adicionales en EP009).

**REQ-PERM-007:** Los super_admin pueden tener acceso a todos los datos (implementación futura).

### 5.4 Middleware de Verificación

```typescript
// Middleware requeridos
authenticateJWT()           // Verifica JWT válido
requireTeacherRole()        // Verifica role in ['teacher', 'admin_teacher', 'super_admin']
verifyClassroomOwnership()  // Verifica classroom.teacher_id === user.id
verifyAssignmentOwnership() // Verifica assignment.teacher_id === user.id
verifyStudentAccess()       // Verifica relación teacher-student via classrooms
verifySubmissionAccess()    // Verifica acceso a submission via classroom
```

---

## 5.5 🔗 Referencias a Implementación

### Documentos Detallados con Referencias Completas

Para información detallada de implementación (Database, Backend, Frontend) de cada módulo, consultar:

1. **Gestión de Classrooms (HU-EP009-01)**
   - 📄 [REQ-TEACHER-CLASSROOMS.md](./REQ-TEACHER-CLASSROOMS.md#-referencias-a-implementación)
   - Incluye: Tablas DDL, Controllers, Services, DTOs, Componentes React, Hooks

2. **Gestión de Assignments (HU-EP009-02)**
   - 📄 [REQ-TEACHER-ASSIGNMENTS.md](./REQ-TEACHER-ASSIGNMENTS.md#-referencias-a-implementación)
   - Incluye: ENUMs, Foreign Keys, Rich Text Editor, HTML Sanitization, Guards

3. **Sistema de Calificación y Progreso (HU-EP009-03, HU-EP009-04)**
   - 📄 [REQ-TEACHER-GRADING-PROGRESS.md](./REQ-TEACHER-GRADING-PROGRESS.md#-referencias-a-implementación)
   - Incluye: Audit Log, Student Notes, Job Queue (Bull/BullMQ), Notifications

4. **Analytics y Reportes (HU-EP009-05)**
   - 📄 [REQ-TEACHER-ANALYTICS.md](./REQ-TEACHER-ANALYTICS.md#-referencias-a-implementación)
   - Incluye: Views Materializadas, Cache Redis, PDF Generation, Charts (Recharts)

### Resumen de Stack Tecnológico

**Database:**
- 🗄️ Schemas: `educational_content`, `progress_tracking`, `audit_logging`
- 🗄️ Tablas críticas: classrooms, assignments, submissions, student_notes, grading_audit_log
- 🗄️ ENUMs: assignment_type, assignment_status, submission_status, grading_action_type

**Backend:**
- 💻 Módulos: `apps/backend/src/modules/teacher/`
  - Controllers: classroom, assignment, grading, student-progress, analytics
  - Services: +10 servicios especializados
  - Guards: roles, ownership verification, student access
  - Jobs: grading notifications (Bull/BullMQ)
- 💻 Shared: HTML Sanitizer (DOMPurify), Statistics Utils, PDF Generator, Redis Cache

**Frontend:**
- 🎨 Features: `apps/frontend/src/features/teacher/`
  - Components: 30+ componentes React
  - Hooks: Custom hooks para cada módulo (useClassrooms, useAssignments, useGrading, etc.)
  - Charts: Recharts/Chart.js para analytics
  - Rich Text: TipTap editor
- 🎨 Types: `apps/frontend/src/types/teacher.types.ts`, `analytics.types.ts`, `grading.types.ts`

---

## 6. Referencias

### 6.1 Documentación Relacionada
- **Épica EP009:** `/docs/04-planificacion/epicas/EP009-teacher-portal/README.md`
- **API Reference:** `/docs/02-especificaciones-tecnicas/apis/API-REFERENCE.md` (líneas 597-2130)
- **Database Schema:** `/docs/03-desarrollo/base-de-datos/schemas/content_management/`
- **Reporte Fase 2:** `/docs/projects/glit-analisys/05-REPORTE-FINAL-FASE-2-DOCUMENTACION.md`

### 6.2 Historias de Usuario
- **HU-EP009-01:** `/docs/04-planificacion/epicas/EP009-teacher-portal/historias/HU-EP009-01-classroom-management.md`
- **HU-EP009-02:** `/docs/04-planificacion/epicas/EP009-teacher-portal/historias/HU-EP009-02-assignment-management.md`
- **HU-EP009-03:** `/docs/04-planificacion/epicas/EP009-teacher-portal/historias/HU-EP009-03-grading-system.md`
- **HU-EP009-04:** `/docs/04-planificacion/epicas/EP009-teacher-portal/historias/HU-EP009-04-student-progress.md`
- **HU-EP009-05:** `/docs/04-planificacion/epicas/EP009-teacher-portal/historias/HU-EP009-05-analytics-reports.md`

### 6.3 Stack Tecnológico

#### Backend
- Framework: Node.js + TypeScript + Express
- Database: PostgreSQL 16
- ORM: Prisma (preferido) o TypeORM
- Validación: Joi o Zod
- Authentication: JWT (reusa EP001)
- Cache: Redis
- Job Queue: Bull/BullMQ
- PDF Generation: PDFKit o Puppeteer
- HTML Sanitization: DOMPurify (isomorphic-dompurify)
- Logging: Winston

#### Frontend
- Framework: React + TypeScript
- State Management: Zustand
- UI Library: Tailwind CSS + shadcn/ui
- Forms: React Hook Form + Zod validation
- Rich Text Editor: TipTap
- Charts: Recharts o Chart.js
- PDF Export: jsPDF o react-pdf
- Testing: Vitest + React Testing Library

#### DevOps
- Testing Backend: Jest
- Testing E2E: Playwright o Cypress
- CI/CD: GitHub Actions
- Monitoring: (TBD)

### 6.4 Dependencias

#### Bloqueantes
- **EP001 (Auth System):** REQUIRED - JWT authentication y role system
- **EP002 (Student Module):** REQUIRED - Usuarios estudiantes y submissions
- **Database Schema:** REQUIRED - Tablas classrooms, assignments, submissions, etc.

#### Opcionales
- **EP003 (Educational Mechanics):** Nice to have - Integración assignments con mechanics
- **EP007 (Deployment):** Nice to have - Redis cache en producción

---

## 7. Criterios de Aceptación Global

### 7.1 Funcionales
- [ ] Los 29 endpoints API están implementados y funcionando
- [ ] Los profesores pueden crear y gestionar classrooms
- [ ] Los profesores pueden crear y asignar assignments a classrooms
- [ ] Los profesores pueden calificar submissions y enviar feedback
- [ ] Los profesores pueden monitorear progreso de estudiantes
- [ ] Los profesores pueden generar reportes y analytics
- [ ] El sistema envía notificaciones a estudiantes cuando son calificados
- [ ] El sistema detecta automáticamente estudiantes en riesgo
- [ ] El sistema permite exportar datos en CSV y PDF

### 7.2 No Funcionales
- [ ] Response time p95 < 200ms para CRUD, < 500ms para analytics
- [ ] Test coverage > 80% (backend), > 70% (frontend)
- [ ] Zero critical security vulnerabilities
- [ ] Cache hit rate > 70% para analytics
- [ ] Uptime > 99.9%
- [ ] API documentation 100% completa
- [ ] Code review aprobado para todas las PRs
- [ ] ESLint y TypeScript sin errores

### 7.3 UX/UI
- [ ] Todas las interfaces son responsive (desktop, tablet, mobile)
- [ ] Loading states implementados en todas las operaciones asíncronas
- [ ] Error messages claros y accionables
- [ ] Toast notifications para feedback inmediato
- [ ] Rich text editors funcionando correctamente
- [ ] Charts y gráficas renderizando correctamente
- [ ] Exportación de reportes funciona sin errores

---

## 8. Métricas de Éxito

### 8.1 KPIs Técnicos
- 29 endpoints implementados y funcionando con 100% uptime
- Test coverage: Backend >80%, Frontend >70%
- Response time p95 <200ms (CRUD), <500ms (analytics)
- Cache hit rate >70%
- Zero critical bugs en producción
- API documentation 100% completa

### 8.2 KPIs de Negocio
- 100% de profesores pueden crear classrooms
- 100% de profesores pueden asignar tareas
- 100% de profesores pueden calificar submissions
- Tiempo promedio de calificación <5 minutos
- Tiempo promedio de creación de assignment <3 minutos
- >90% satisfaction rate en encuestas de profesores
- >70% de profesores usan analytics regularmente
- >60% de profesores generan reportes mensualmente

### 8.3 Métricas de Performance
- Response time promedio: <100ms
- Response time p95: <200ms (CRUD), <500ms (analytics)
- Throughput: >1000 req/s
- Error rate: <0.1%
- Uptime: >99.9%

---

## 9. Roadmap de Implementación

### Sprint 1 (Semana 1) - Classroom Management (16 SP)
- Implementar 8 endpoints de classrooms
- Middleware verifyClassroomOwnership
- Frontend: ClassroomList, CreateClassroomForm, ClassroomDetails
- Tests unitarios >80%

### Sprint 2 (Semana 1-2) - Assignment Management (20 SP)
- Implementar 8 endpoints de assignments
- Rich Text Editor (TipTap)
- HTML sanitization
- Frontend: AssignmentList, CreateAssignmentForm, AssignToClassrooms
- Tests unitarios >80%

### Sprint 3 (Semana 2) - Grading System (16 SP)
- Implementar 4 endpoints de grading
- Sistema de notificaciones (email + in-app)
- Job queue (Bull/BullMQ)
- Frontend: GradingQueue, GradingInterface
- Tests unitarios >80%

### Sprint 4 (Semana 2-3) - Student Progress (12 SP)
- Implementar 4 endpoints de progreso
- Middleware verifyStudentAccess
- Frontend: StudentProgress, ProgressChart, StudentNotes
- Tests unitarios >80%

### Sprint 5 (Semana 3) - Analytics & Reports (16 SP)
- Implementar 5 endpoints de analytics
- Cache Redis
- PDF generation
- Frontend: AnalyticsDashboard, ReportGenerator
- Tests unitarios >80%

### Sprint 6 (Semana 3) - Integration & Polish
- Integración completa de todos los módulos
- Tests E2E completos (29 endpoints)
- Performance testing y optimización
- Code review y refactoring
- Bug fixing
- Documentación final

---

## Aprobaciones

| Rol | Nombre | Fecha | Firma |
|-----|--------|-------|-------|
| Product Owner | TBD | - | - |
| Tech Lead | TBD | - | - |
| Backend Lead | TBD | - | - |
| Frontend Lead | TBD | - | - |
| QA Lead | TBD | - | - |

---

**Última actualización:** 2025-10-28
**Versión:** 1.0
**Estado:** DRAFT - Pendiente aprobación
**Cobertura:** EP009 (25% -> objetivo: 100%)
