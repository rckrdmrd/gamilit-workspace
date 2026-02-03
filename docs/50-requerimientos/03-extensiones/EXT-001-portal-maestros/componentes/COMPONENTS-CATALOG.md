# Catálogo de Componentes - Portal Teacher

**Proyecto:** GAMILIT
**Portal:** Teacher
**Total de Componentes:** 46
**Última Actualización:** 2026-01-25
**Ubicación Base:** `apps/frontend/src/apps/teacher/components/`

---

## Índice por Carpeta

1. [Alerts (2)](#alerts)
2. [Analytics (3)](#analytics)
3. [Assignments (6)](#assignments)
4. [Collaboration (2)](#collaboration)
5. [Communication (6)](#communication)
6. [Dashboard (10)](#dashboard)
7. [Monitoring (5)](#monitoring)
8. [Progress (4)](#progress)
9. [Reports (2)](#reports)
10. [Responses (3)](#responses)
11. [Review Panel (2)](#review-panel)
12. [Layout (1)](#layout)

---

## Alerts

### AlertCard

**Ubicación:** `components/alerts/AlertCard.tsx`
**Tipo:** Presentational

**Descripción:** Tarjeta de alerta de intervención estudiantil con indicadores de severidad, información del estudiante, métricas y botones de acción.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| alert | InterventionAlert | ✓ | Objeto con datos de la alerta |
| onSendMessage | (alertId: string) => void | ✗ | Handler para enviar mensaje |
| onAssignHelp | (alertId: string) => void | ✗ | Handler para asignar ayuda |
| onMarkForFollowUp | (alertId: string) => void | ✗ | Handler para marcar seguimiento |
| onResolve | (alertId: string) => void | ✗ | Handler para resolver alerta |

**Dependencias:**
- Hooks: Ninguno
- APIs: Ninguna
- Componentes: DetectiveCard, DetectiveButton
- Iconos: AlertTriangle, AlertCircle, Info, XCircle, MessageSquare, BookOpen, CheckCircle

**Uso:**
```tsx
<AlertCard
  alert={alert}
  onSendMessage={(id) => handleSendMessage(id)}
  onAssignHelp={(id) => handleAssignHelp(id)}
  onMarkForFollowUp={(id) => handleMarkForFollowUp(id)}
  onResolve={(id) => handleResolve(id)}
/>
```

**Notas:**
- Sincronizado con backend StudentInterventionAlert type
- Usa campos backend: severity, title, status, alert_type, metrics
- Muestra iconos según tipo de alerta y severidad
- Calcula tiempo transcurrido desde generación

---

### InterventionAlertsPanel

**Ubicación:** `components/alerts/InterventionAlertsPanel.tsx`
**Tipo:** Container

**Descripción:** Panel completo de gestión de alertas de intervención con filtros, paginación y acciones de reconocimiento, resolución y descarte.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| classroomId | string | ✗ | ID del aula para filtrar |
| severity | InterventionAlertSeverity | ✗ | Filtro de severidad desde padre |
| alertType | InterventionAlertType | ✗ | Filtro de tipo desde padre |

**Dependencias:**
- Hooks: useInterventionAlerts, useState
- APIs: interventionAlertsApi
- Componentes: DetectiveCard, DetectiveButton
- Iconos: AlertCircle, CheckCircle, XCircle, Clock, AlertTriangle, Filter

**Uso:**
```tsx
<InterventionAlertsPanel
  classroomId="classroom-123"
  severity={InterventionAlertSeverity.HIGH}
  alertType={InterventionAlertType.LOW_SCORE}
/>
```

**Notas:**
- Gestión completa de alertas con CRUD
- Modal de resolución con notas
- Filtros por severidad, tipo y estado
- Paginación integrada
- Toast notifications para feedback

---

## Analytics

### EngagementMetricsChart

**Ubicación:** `components/analytics/EngagementMetricsChart.tsx`
**Tipo:** Presentational

**Descripción:** Visualización de métricas de engagement (DAU, WAU, duración de sesión) con comparación de período anterior y uso de funcionalidades.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| metrics | EngagementMetrics | ✓ | Objeto con métricas de engagement |

**Dependencias:**
- Hooks: Ninguno
- APIs: Ninguna
- Componentes: DetectiveCard
- Iconos: TrendingUp, TrendingDown, Users, Clock, Activity

**Uso:**
```tsx
<EngagementMetricsChart metrics={engagementMetrics} />
```

**Notas:**
- Muestra DAU, WAU y duración promedio de sesión
- Indicadores de tendencia (↑↓) con colores
- Gráfico de barras para uso de funcionalidades
- Grid de comparación con período anterior

---

### LearningAnalyticsDashboard

**Ubicación:** `components/analytics/LearningAnalyticsDashboard.tsx`
**Tipo:** Container

**Descripción:** Dashboard completo de analíticas de aprendizaje con métricas clave, ejercicios más usados, mapa de calor de actividad y métricas de engagement.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| classroomId | string | ✓ | ID del aula para análisis |

**Dependencias:**
- Hooks: useAnalytics
- APIs: analyticsApi
- Componentes: DetectiveCard, DetectiveButton, EngagementMetricsChart
- Iconos: BarChart3, TrendingUp, Clock, Target

**Uso:**
```tsx
<LearningAnalyticsDashboard classroomId="classroom-123" />
```

**Notas:**
- 4 métricas principales: engagement rate, completion rate, time on task, success rate
- Lista de ejercicios más utilizados con barras
- Heatmap de actividad por día y hora
- Integra EngagementMetricsChart

---

### PerformanceInsightsPanel

**Ubicación:** `components/analytics/PerformanceInsightsPanel.tsx`
**Tipo:** Container

**Descripción:** Panel de insights de rendimiento estudiantil individual con selector de estudiante, métricas, fortalezas, debilidades, predicciones y recomendaciones.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| classroomId | string | ✓ | ID del aula |
| students | Array<{id, full_name}> | ✓ | Lista de estudiantes |

**Dependencias:**
- Hooks: useStudentInsights, useState
- APIs: analyticsApi
- Componentes: DetectiveCard, DetectiveButton, SkeletonCard
- Iconos: User, TrendingUp, AlertCircle, Lightbulb

**Uso:**
```tsx
<PerformanceInsightsPanel
  classroomId="classroom-123"
  students={students}
/>
```

**Notas:**
- Selector dropdown de estudiante
- Overview: score, módulos, percentil, nivel de riesgo
- Grid de fortalezas y debilidades
- Predicciones: probabilidad de completar, riesgo de abandono
- Lista de recomendaciones personalizadas

---

## Assignments

### AssignmentCard

**Ubicación:** `components/assignments/AssignmentCard.tsx`
**Tipo:** Presentational

**Descripción:** Tarjeta de asignación con información completa, stats visuales, badges de estado y tipo, y botones de acción rápida.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| assignment | Assignment | ✓ | Objeto con datos de asignación |
| onViewSubmissions | (assignment) => void | ✓ | Handler para ver entregas |
| onSendReminder | (assignmentId) => void | ✗ | Handler para enviar recordatorio |

**Dependencias:**
- Hooks: Ninguno
- APIs: Ninguna
- Componentes: DetectiveCard, DetectiveButton
- Iconos: Calendar, Users, Target, Clock, Eye, MessageSquare, Bell

**Uso:**
```tsx
<AssignmentCard
  assignment={assignment}
  onViewSubmissions={(a) => handleView(a)}
  onSendReminder={(id) => handleReminder(id)}
/>
```

**Notas:**
- Status: active, completed, expired, draft
- Type: practice, quiz, exam, homework
- Grid de 4 stats: fecha límite, entregas, ejercicios, pendientes
- Muestra power-ups, puntos custom, intentos máximos
- Destacado si vence pronto (7 días)

---

### AssignmentCreator

**Ubicación:** `components/assignments/AssignmentCreator.tsx`
**Tipo:** Container

**Descripción:** Componente maestro para crear asignaciones. Alterna entre wizard y lista de asignaciones. Carga módulos, ejercicios y estudiantes.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| classroomId | string | ✓ | ID del aula |

**Dependencias:**
- Hooks: useState, useEffect
- APIs: apiClient (assignments, modules, students)
- Componentes: DetectiveCard, DetectiveButton, AssignmentWizard, AssignmentList
- Iconos: Plus, List, AlertCircle

**Uso:**
```tsx
<AssignmentCreator classroomId="classroom-123" />
```

**Notas:**
- Fetch de assignments, modules y students al montar
- Toggle entre vista wizard y lista
- Manejo de errores con toast
- Loading states

---

### AssignmentList

**Ubicación:** `components/assignments/AssignmentList.tsx`
**Tipo:** Presentational

**Descripción:** Lista de asignaciones con tarjetas expandidas mostrando todos los detalles, estado, y botones de edición/eliminación.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| assignments | Assignment[] | ✓ | Array de asignaciones |
| onEdit | (assignment) => void | ✗ | Handler para editar |
| onDelete | (assignmentId) => void | ✗ | Handler para eliminar |

**Dependencias:**
- Hooks: Ninguno
- APIs: Ninguna
- Componentes: DetectiveCard
- Iconos: Calendar, Users, Target, Clock, MoreVertical

**Uso:**
```tsx
<AssignmentList
  assignments={assignments}
  onEdit={(a) => handleEdit(a)}
  onDelete={(id) => handleDelete(id)}
/>
```

**Notas:**
- Empty state si no hay asignaciones
- Grid de 4 columnas de stats
- Info adicional: creada, power-ups, puntos
- Menú de opciones con MoreVertical

---

### AssignmentWizard

**Ubicación:** `components/assignments/AssignmentWizard.tsx`
**Tipo:** Container

**Descripción:** Wizard de 3 pasos para crear asignaciones: 1) Módulo/Ejercicios, 2) Configuración, 3) Estudiantes.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| modules | Array<{id, title, exercises}> | ✓ | Lista de módulos con ejercicios |
| students | Array<{id, full_name}> | ✓ | Lista de estudiantes |
| onComplete | (data: AssignmentData) => void | ✓ | Handler al completar |
| onCancel | () => void | ✓ | Handler para cancelar |

**Dependencias:**
- Hooks: useState
- APIs: Ninguna (recibe data por props)
- Componentes: DetectiveButton, InputDetective, DetectiveCard
- Iconos: ChevronLeft, ChevronRight, Check, Calendar, Settings, Users

**Uso:**
```tsx
<AssignmentWizard
  modules={modules}
  students={students}
  onComplete={(data) => createAssignment(data)}
  onCancel={() => setShowWizard(false)}
/>
```

**Notas:**
- Progress indicator con iconos
- Step 1: selector de módulo + checkboxes de ejercicios
- Step 2: título, fechas, intentos, puntos, power-ups
- Step 3: checkboxes de estudiantes + "seleccionar todos"
- Validación por paso

---

### ImprovedAssignmentWizard

**Ubicación:** `components/assignments/ImprovedAssignmentWizard.tsx`
**Tipo:** Container

**Descripción:** Versión mejorada del wizard con 4 pasos, preview de ejercicios seleccionados, y paso de confirmación con resumen completo.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| exercises | Exercise[] | ✓ | Lista de ejercicios disponibles |
| classroomId | string | ✓ | ID del aula |
| onComplete | (data: AssignmentData) => void | ✓ | Handler al completar |
| onCancel | () => void | ✓ | Handler para cancelar |

**Dependencias:**
- Hooks: useState
- APIs: Ninguna
- Componentes: DetectiveButton, InputDetective, DetectiveCard
- Iconos: ChevronLeft, ChevronRight, Check, Calendar, Settings, FileText, CheckCircle2, X, Target, Clock, Award

**Uso:**
```tsx
<ImprovedAssignmentWizard
  exercises={exercises}
  classroomId="classroom-123"
  onComplete={(data) => createAssignment(data)}
  onCancel={() => setShowWizard(false)}
/>
```

**Notas:**
- 4 pasos: Información Básica, Ejercicios, Configuración, Confirmación
- Step 1: título, descripción, tipo (radio buttons con iconos)
- Step 2: preview de seleccionados + botón para remover
- Step 3: fecha límite, intentos, puntos custom, power-ups toggle
- Step 4: resumen completo con todos los datos
- Mejor UX con badges de dificultad y tipo

---

### SubmissionsModal

**Ubicación:** `components/assignments/SubmissionsModal.tsx`
**Tipo:** Container

**Descripción:** Modal completo para ver y gestionar entregas de asignaciones con filtros, búsqueda, stats y tabla de estudiantes.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| isOpen | boolean | ✓ | Estado del modal |
| onClose | () => void | ✓ | Handler para cerrar |
| assignment | Assignment \| null | ✓ | Asignación a mostrar |
| submissions | Submission[] | ✓ | Array de entregas |
| loading | boolean | ✓ | Estado de carga |
| onGradeSubmission | (submission) => void | ✓ | Handler para calificar |

**Dependencias:**
- Hooks: useState
- APIs: Ninguna (recibe data por props)
- Componentes: Modal, DetectiveButton, DataTable
- Iconos: Users, CheckCircle, Clock, XCircle, Award, Loader2, Search

**Uso:**
```tsx
<SubmissionsModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  assignment={selectedAssignment}
  submissions={submissions}
  loading={loading}
  onGradeSubmission={(sub) => handleGrade(sub)}
/>
```

**Notas:**
- 4 stats cards clickeables: Total, Pendientes, Calificados, Tardíos
- Filtros: all, pending, graded, late
- Barra de búsqueda por nombre
- DataTable con columnas: estudiante, estado, calificación, fecha, acciones
- Footer con resumen y progreso de calificación

---

## Collaboration

### ParentCommunicationHub

**Ubicación:** `components/collaboration/ParentCommunicationHub.tsx`
**Tipo:** Container

**Descripción:** Hub para enviar comunicaciones a padres con plantillas predefinidas, editor de mensajes y selector de destinatarios.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| classroomId | string | ✓ | ID del aula |
| students | Array<{id, full_name}> | ✓ | Lista de estudiantes |

**Dependencias:**
- Hooks: useState
- APIs: apiClient.post (sendCommunication)
- Componentes: DetectiveCard, DetectiveButton, InputDetective
- Iconos: MessageSquare, Send, FileText, Users

**Uso:**
```tsx
<ParentCommunicationHub
  classroomId="classroom-123"
  students={students}
/>
```

**Notas:**
- 3 plantillas: Actualización de Progreso, Logro Destacado, Área de Mejora
- Variable {student_name} en plantillas
- Grid de checkboxes para seleccionar destinatarios
- Toast notifications
- Estado de envío (loading)

---

### ResourceSharingPanel

**Ubicación:** `components/collaboration/ResourceSharingPanel.tsx`
**Tipo:** Container

**Descripción:** Panel para compartir y descubrir recursos educativos con otros profesores. Incluye búsqueda, filtros por categoría, ratings y comentarios.

**Props:** Ninguno (usa data mock)

**Dependencias:**
- Hooks: useState
- APIs: Ninguna (mock data)
- Componentes: DetectiveCard, DetectiveButton, InputDetective
- Iconos: Share2, Star, Download, MessageCircle, Search

**Uso:**
```tsx
<ResourceSharingPanel />
```

**Notas:**
- Categorías: Pedagogía, Ejercicios, Evaluaciones, Multimedia
- Búsqueda por título/descripción
- Cards con: rating, descargas, comentarios, tags
- Botones: Descargar, Comentar
- Mock data (pendiente integración con API)

---

## Communication

### AnnouncementForm

**Ubicación:** `components/communication/AnnouncementForm.tsx`
**Tipo:** Container

**Descripción:** Formulario para enviar anuncios a toda una clase seleccionada. Los anuncios se envían a todos los estudiantes del aula.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| classrooms | Classroom[] | ✓ | Lista de aulas |
| loadingClassrooms | boolean | ✓ | Estado de carga de aulas |
| onSend | (classroomId, subject, content) => Promise<void> | ✓ | Handler para enviar |

**Dependencias:**
- Hooks: useState
- APIs: Ninguna (via onSend prop)
- Componentes: DetectiveCard, DetectiveButton
- Iconos: Megaphone

**Uso:**
```tsx
<AnnouncementForm
  classrooms={classrooms}
  loadingClassrooms={loading}
  onSend={async (id, subject, content) => await sendAnnouncement(id, subject, content)}
/>
```

**Notas:**
- Selector de clase con info de grado y materia
- Input de título y textarea de mensaje
- Info box con count de estudiantes
- Validación de campos requeridos
- Reset del formulario después de enviar

---

### ConversationsList

**Ubicación:** `components/communication/ConversationsList.tsx`
**Tipo:** Presentational

**Descripción:** Lista de conversaciones agrupadas por usuario con último mensaje, contador de no leídos y fecha.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| conversations | Conversation[] | ✓ | Array de conversaciones |
| onConversationClick | (conversation) => void | ✓ | Handler al hacer click |

**Dependencias:**
- Hooks: Ninguno
- APIs: Ninguna
- Componentes: DetectiveCard
- Iconos: MessageCircle

**Uso:**
```tsx
<ConversationsList
  conversations={conversations}
  onConversationClick={(conv) => openConversation(conv)}
/>
```

**Notas:**
- Empty state si no hay conversaciones
- Badge naranja con contador de no leídos
- Último mensaje truncado (line-clamp-1)
- Fecha formateada con toLocaleString
- Cards clickeables con hover shadow

---

### FeedbackForm

**Ubicación:** `components/communication/FeedbackForm.tsx`
**Tipo:** Container

**Descripción:** Formulario para enviar feedback privado a un estudiante seleccionado. Proceso de 3 pasos: clase, estudiante, mensaje.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| classrooms | Classroom[] | ✓ | Lista de aulas |
| loadingClassrooms | boolean | ✓ | Estado de carga de aulas |
| onGetStudents | (classroomId) => Promise<StudentMonitoring[]> | ✓ | Obtener estudiantes |
| onSend | (studentId, content) => Promise<void> | ✓ | Handler para enviar |

**Dependencias:**
- Hooks: useState, useEffect
- APIs: Via props (onGetStudents)
- Componentes: DetectiveCard, DetectiveButton
- Iconos: MessageSquare

**Uso:**
```tsx
<FeedbackForm
  classrooms={classrooms}
  loadingClassrooms={loading}
  onGetStudents={async (id) => await getStudents(id)}
  onSend={async (id, content) => await sendFeedback(id, content)}
/>
```

**Notas:**
- Carga automática de estudiantes al seleccionar clase
- Selector de clase → selector de estudiante → textarea
- Info box verde con nota de privacidad
- Reset de estudiante al cambiar clase
- Validación de campos requeridos

---

### MessageComposer

**Ubicación:** `components/communication/MessageComposer.tsx`
**Tipo:** Container

**Descripción:** Formulario para componer y enviar mensajes directos con asunto, contenido y destinatarios.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| onSend | (data: SendMessageData) => Promise<void> | ✓ | Handler para enviar |
| onCancel | () => void | ✗ | Handler para cancelar |
| recipientIds | string[] | ✗ | IDs de destinatarios |
| classroomId | string | ✗ | ID del aula (opcional) |

**Dependencias:**
- Hooks: useState
- APIs: Ninguna (via onSend prop)
- Componentes: DetectiveCard, DetectiveButton
- Iconos: Send, X

**Uso:**
```tsx
<MessageComposer
  onSend={async (data) => await sendMessage(data)}
  onCancel={() => setShowComposer(false)}
  recipientIds={['student-1', 'student-2']}
/>
```

**Notas:**
- Input de asunto y textarea de contenido
- Botón X para cerrar en header
- Botones: Cancelar y Enviar
- Reset del formulario después de enviar
- Validación de campos requeridos

---

### MessageFilters

**Ubicación:** `components/communication/MessageFilters.tsx`
**Tipo:** Presentational

**Descripción:** Barra de filtros para mensajes con selectores de tipo, estado de lectura y búsqueda de texto.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| filters | {type?, unread?, search?} | ✓ | Objeto con filtros actuales |
| onFiltersChange | (filters) => void | ✓ | Handler para cambiar filtros |
| onRefresh | () => void | ✓ | Handler para actualizar |

**Dependencias:**
- Hooks: Ninguno
- APIs: Ninguna
- Componentes: DetectiveCard, DetectiveButton
- Iconos: Filter

**Uso:**
```tsx
<MessageFilters
  filters={filters}
  onFiltersChange={(newFilters) => updateFilters(newFilters)}
  onRefresh={() => refresh()}
/>
```

**Notas:**
- 3 selectores: tipo, estado de lectura, search input
- Tipos: DIRECT, CLASSROOM_ANNOUNCEMENT, PRIVATE_FEEDBACK, CLASSROOM_CHAT, ASSIGNMENT_COMMENT
- Botón de actualizar
- Icono de filtro

---

### MessagesList

**Ubicación:** `components/communication/MessagesList.tsx`
**Tipo:** Presentational

**Descripción:** Lista de mensajes con vista de tarjetas mostrando remitente, destinatarios, tipo, estado de lectura y metadata.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| messages | Message[] | ✓ | Array de mensajes |
| onMessageClick | (message) => void | ✓ | Handler al hacer click |
| onMarkAsRead | (messageId) => void | ✓ | Handler para marcar leído |

**Dependencias:**
- Hooks: Ninguno
- APIs: Ninguna
- Componentes: DetectiveCard, DetectiveButton
- Iconos: Mail, MailOpen, User, Calendar

**Uso:**
```tsx
<MessagesList
  messages={messages}
  onMessageClick={(msg) => console.log(msg)}
  onMarkAsRead={(id) => markAsRead(id)}
/>
```

**Notas:**
- Empty state si no hay mensajes
- Border naranja si no leído
- Contenido truncado (line-clamp-2)
- Metadata: remitente, fecha, clase, # destinatarios
- Botón "Marcar leído" solo para no leídos
- Helper para convertir tipo a label legible

---

## Dashboard

### ClassroomCard

**Ubicación:** `components/dashboard/ClassroomCard.tsx`
**Tipo:** Presentational

**Descripción:** Tarjeta de aula con información básica, stats de estudiantes y actividad reciente, y botón de acceso.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| classroom | Classroom | ✓ | Objeto con datos del aula |
| onAccess | (classroomId) => void | ✓ | Handler para acceder |

**Notas:** Componente estándar de tarjeta de aula para el dashboard principal.

---

### ClassroomsGrid

**Ubicación:** `components/dashboard/ClassroomsGrid.tsx`
**Tipo:** Container

**Descripción:** Grid responsivo de tarjetas de aulas con vista de lista o cuadrícula.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| classrooms | Classroom[] | ✓ | Array de aulas |
| loading | boolean | ✗ | Estado de carga |
| onClassroomClick | (classroom) => void | ✓ | Handler al hacer click |

**Notas:** Layout grid con ClassroomCard. Soporte para empty state y loading skeleton.

---

### CreateAssignmentModal

**Ubicación:** `components/dashboard/CreateAssignmentModal.tsx`
**Tipo:** Container

**Descripción:** Modal para crear asignaciones rápidas desde el dashboard principal.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| isOpen | boolean | ✓ | Estado del modal |
| onClose | () => void | ✓ | Handler para cerrar |
| classroomId | string | ✓ | ID del aula |
| onCreate | (data) => Promise<void> | ✓ | Handler para crear |

**Notas:** Versión simplificada del wizard para creación rápida.

---

### CreateClassroomModal

**Ubicación:** `components/dashboard/CreateClassroomModal.tsx`
**Tipo:** Container

**Descripción:** Modal para crear nuevas aulas con formulario de nombre, grado, materia y descripción.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| isOpen | boolean | ✓ | Estado del modal |
| onClose | () => void | ✓ | Handler para cerrar |
| onCreate | (data) => Promise<void> | ✓ | Handler para crear |

**Notas:** Formulario simple con validación de campos requeridos.

---

### GradeSubmissionModal

**Ubicación:** `components/dashboard/GradeSubmissionModal.tsx`
**Tipo:** Container

**Descripción:** Modal para calificar una entrega individual con calificación numérica, comentarios y feedback detallado.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| isOpen | boolean | ✓ | Estado del modal |
| onClose | () => void | ✓ | Handler para cerrar |
| submission | Submission \| null | ✓ | Entrega a calificar |
| onGrade | (submissionId, score, feedback) => Promise<void> | ✓ | Handler para guardar |

**Notas:** Input numérico de calificación, textarea de feedback, botones de cancelar/guardar.

---

### PendingSubmissionsList

**Ubicación:** `components/dashboard/PendingSubmissionsList.tsx`
**Tipo:** Presentational

**Descripción:** Lista compacta de entregas pendientes de calificar con acceso rápido a calificación.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| submissions | Submission[] | ✓ | Array de entregas pendientes |
| onGrade | (submission) => void | ✓ | Handler para calificar |

**Notas:** Vista de lista con botón "Calificar" para cada entrega. Empty state si no hay pendientes.

---

### QuickActionsPanel

**Ubicación:** `components/dashboard/QuickActionsPanel.tsx`
**Tipo:** Presentational

**Descripción:** Panel de acciones rápidas con botones para crear asignación, anuncio, mensaje, y ver reportes.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| onCreateAssignment | () => void | ✓ | Handler crear asignación |
| onCreateAnnouncement | () => void | ✓ | Handler crear anuncio |
| onSendMessage | () => void | ✓ | Handler enviar mensaje |
| onViewReports | () => void | ✓ | Handler ver reportes |

**Notas:** Grid de 4 botones con iconos grandes para acciones frecuentes del maestro.

---

### RecentAssignmentsList

**Ubicación:** `components/dashboard/RecentAssignmentsList.tsx`
**Tipo:** Presentational

**Descripción:** Lista de asignaciones recientes con información resumida y acceso rápido.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| assignments | Assignment[] | ✓ | Array de asignaciones recientes |
| onViewDetails | (assignment) => void | ✓ | Handler para ver detalles |

**Notas:** Vista compacta con últimas 5 asignaciones creadas. Link "Ver todas" al final.

---

### StudentAlerts

**Ubicación:** `components/dashboard/StudentAlerts.tsx`
**Tipo:** Container

**Descripción:** Widget de alertas de estudiantes en riesgo o que requieren atención en el dashboard principal.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| classroomId | string | ✗ | ID del aula (opcional) |
| limit | number | ✗ | Número máximo de alertas |

**Notas:** Lista compacta de alertas críticas/altas. Link a panel completo de alertas.

---

### TeacherDashboardHero

**Ubicación:** `components/dashboard/TeacherDashboardHero.tsx`
**Tipo:** Presentational

**Descripción:** Banner hero del dashboard con saludo personalizado, resumen de stats y enlaces rápidos.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| teacherName | string | ✓ | Nombre del profesor |
| stats | DashboardStats | ✓ | Estadísticas resumidas |

**Notas:** Banner con gradiente, saludo según hora del día, cards de stats (aulas, estudiantes, pendientes).

---

## Monitoring

### RefreshControl

**Ubicación:** `components/monitoring/RefreshControl.tsx`
**Tipo:** Presentational

**Descripción:** Botón de actualización con indicador de última actualización y contador de tiempo transcurrido.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| onRefresh | () => void | ✓ | Handler para actualizar |
| lastUpdate | Date \| string | ✗ | Fecha de última actualización |
| loading | boolean | ✗ | Estado de carga |

**Notas:** Botón con icono de refresh, tiempo relativo (hace X minutos), spinner cuando loading.

---

### StudentDetailModal

**Ubicación:** `components/monitoring/StudentDetailModal.tsx`
**Tipo:** Container

**Descripción:** Modal con detalles completos de un estudiante: perfil, progreso, ejercicios completados, alertas y acciones.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| isOpen | boolean | ✓ | Estado del modal |
| onClose | () => void | ✓ | Handler para cerrar |
| student | StudentMonitoring \| null | ✓ | Estudiante a mostrar |

**Notas:** Tabs o secciones: Perfil, Progreso, Actividad, Alertas. Botones de acción: Enviar mensaje, Ver insights.

---

### StudentMonitoringPanel

**Ubicación:** `components/monitoring/StudentMonitoringPanel.tsx`
**Tipo:** Container

**Descripción:** Panel completo de monitoreo de estudiantes con lista, filtros, búsqueda, paginación y acceso a detalles.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| classroomId | string | ✓ | ID del aula |

**Notas:** Hook useStudentMonitoring. Grid de StudentStatusCard. Filtros por estado. Paginación integrada.

---

### StudentPagination

**Ubicación:** `components/monitoring/StudentPagination.tsx`
**Tipo:** Presentational

**Descripción:** Controles de paginación para lista de estudiantes con info de página actual y total.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| currentPage | number | ✓ | Página actual |
| totalPages | number | ✓ | Total de páginas |
| onPageChange | (page) => void | ✓ | Handler cambio de página |
| total | number | ✓ | Total de items |

**Notas:** Botones anterior/siguiente, indicador "Página X de Y", muestra rango de items.

---

### StudentStatusCard

**Ubicación:** `components/monitoring/StudentStatusCard.tsx`
**Tipo:** Presentational

**Descripción:** Tarjeta compacta de estudiante con avatar, nombre, estado de actividad, progreso y métricas clave.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| student | StudentMonitoring | ✓ | Datos del estudiante |
| onClick | (student) => void | ✓ | Handler al hacer click |

**Notas:** Badge de estado (activo/inactivo), barra de progreso, indicadores de alertas, último acceso.

---

## Progress

### ClassProgressDashboard

**Ubicación:** `components/progress/ClassProgressDashboard.tsx`
**Tipo:** Container

**Descripción:** Dashboard completo de progreso de clase con métricas globales, gráfico de progreso y lista de estudiantes.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| classroomId | string | ✓ | ID del aula |

**Notas:** Métricas: promedio general, tasa de completitud, estudiantes activos. ProgressChart + StudentProgressList.

---

### ModuleCompletionCard

**Ubicación:** `components/progress/ModuleCompletionCard.tsx`
**Tipo:** Presentational

**Descripción:** Tarjeta de completitud de un módulo con nombre, porcentaje de completitud y lista de estudiantes completados.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| module | ModuleCompletion | ✓ | Datos de completitud del módulo |

**Notas:** Barra de progreso circular, lista de estudiantes, badge con porcentaje.

---

### ProgressChart

**Ubicación:** `components/progress/ProgressChart.tsx`
**Tipo:** Presentational

**Descripción:** Gráfico de líneas o barras para visualizar progreso a lo largo del tiempo.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| data | ProgressDataPoint[] | ✓ | Datos para el gráfico |
| type | 'line' \| 'bar' | ✗ | Tipo de gráfico |

**Notas:** Usa librería de gráficos (recharts o similar). Responsive. Tooltips con valores.

---

### StudentProgressList

**Ubicación:** `components/progress/StudentProgressList.tsx`
**Tipo:** Presentational

**Descripción:** Lista de estudiantes con sus respectivos porcentajes de progreso y barras visuales.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| students | Array<{id, name, progress}> | ✓ | Lista de estudiantes con progreso |
| onStudentClick | (studentId) => void | ✗ | Handler al hacer click |

**Notas:** Ordenable por nombre o progreso. Barra de progreso coloreada según porcentaje (rojo<50, amarillo<80, verde>=80).

---

## Reports

### ReportGenerator

**Ubicación:** `components/reports/ReportGenerator.tsx`
**Tipo:** Container

**Descripción:** Generador de reportes con selector de tipo, filtros de fecha, opciones de exportación y preview.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| classroomId | string | ✓ | ID del aula |

**Notas:** Tipos: Progreso, Asistencia, Calificaciones, Actividad. Exportar a PDF/Excel. Preview antes de descargar.

---

### ReportTemplateSelector

**Ubicación:** `components/reports/ReportTemplateSelector.tsx`
**Tipo:** Presentational

**Descripción:** Selector de plantillas de reporte predefinidas con preview y descripción.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| templates | ReportTemplate[] | ✓ | Lista de plantillas disponibles |
| onSelect | (template) => void | ✓ | Handler al seleccionar |

**Notas:** Grid de cards con icono, título, descripción. Templates: Semanal, Mensual, Por Estudiante, Por Módulo.

---

## Responses

### ResponseDetailModal

**Ubicación:** `components/responses/ResponseDetailModal.tsx`
**Tipo:** Container

**Descripción:** Modal con detalles completos de una respuesta de estudiante: pregunta, respuesta, corrección, feedback.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| isOpen | boolean | ✓ | Estado del modal |
| onClose | () => void | ✓ | Handler para cerrar |
| response | ExerciseResponse \| null | ✓ | Respuesta a mostrar |

**Notas:** Muestra pregunta original, respuesta del estudiante, si fue correcta, feedback del sistema, tiempo tomado.

---

### ResponseFilters

**Ubicación:** `components/responses/ResponseFilters.tsx`
**Tipo:** Presentational

**Descripción:** Filtros para respuestas de ejercicios: por estudiante, ejercicio, estado (correcto/incorrecto), fecha.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| filters | ResponseFilters | ✓ | Filtros actuales |
| onFiltersChange | (filters) => void | ✓ | Handler para cambiar |
| students | Array<{id, name}> | ✓ | Lista de estudiantes |
| exercises | Array<{id, title}> | ✓ | Lista de ejercicios |

**Notas:** Selectores: estudiante, ejercicio, estado. Inputs de fecha: desde/hasta. Botón limpiar filtros.

---

### ResponsesTable

**Ubicación:** `components/responses/ResponsesTable.tsx`
**Tipo:** Container

**Descripción:** Tabla de respuestas de estudiantes con columnas ordenables, paginación y acceso a detalles.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| responses | ExerciseResponse[] | ✓ | Array de respuestas |
| loading | boolean | ✗ | Estado de carga |
| onResponseClick | (response) => void | ✓ | Handler al hacer click |

**Notas:** Columnas: Estudiante, Ejercicio, Respuesta, Correcto, Tiempo, Fecha. Ordenable. DataTable component.

---

## Review Panel

### ReviewDetail

**Ubicación:** `components/review-panel/ReviewDetail.tsx`
**Tipo:** Presentational

**Descripción:** Vista detallada de una entrega para revisión con respuestas, calificación y feedback.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| submission | Submission | ✓ | Entrega a revisar |
| onGrade | (score, feedback) => void | ✓ | Handler para calificar |

**Notas:** Muestra respuestas del estudiante, input de calificación, textarea de feedback, botones guardar/cancelar.

---

### ReviewList

**Ubicación:** `components/review-panel/ReviewList.tsx`
**Tipo:** Presentational

**Descripción:** Lista de entregas pendientes de revisión con información básica y acceso rápido a revisión.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| submissions | Submission[] | ✓ | Array de entregas pendientes |
| onReview | (submission) => void | ✓ | Handler para revisar |

**Notas:** Lista compacta con: estudiante, asignación, fecha entrega, botón "Revisar". Empty state si no hay pendientes.

---

## Layout

### withTeacherLayout

**Ubicación:** `components/withTeacherLayout.tsx`
**Tipo:** HOC (Higher Order Component)

**Descripción:** HOC que envuelve páginas del portal teacher con el layout común: header, sidebar, footer y navegación.

**Props:**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| Component | React.ComponentType | ✓ | Componente a envolver |

**Uso:**
```tsx
export default withTeacherLayout(MyTeacherPage);
```

**Notas:**
- Aplica layout consistente a todas las páginas del teacher
- Incluye: TeacherNav, Sidebar, Header con usuario
- Responsive (sidebar colapsable en móvil)

---

## Resumen de Componentes por Tipo

| Tipo | Cantidad | Descripción |
|------|----------|-------------|
| Presentational | 23 | Componentes puros de UI sin lógica compleja |
| Container | 22 | Componentes con lógica, hooks y manejo de estado |
| HOC | 1 | Higher Order Component para layout |

## Resumen de Dependencias Principales

### Hooks Personalizados
- `useInterventionAlerts` - Gestión de alertas de intervención
- `useAnalytics` - Métricas de analíticas
- `useStudentInsights` - Insights de rendimiento estudiantil
- `useStudentMonitoring` - Monitoreo de estudiantes

### APIs
- `interventionAlertsApi` - Endpoints de alertas
- `analyticsApi` - Endpoints de analíticas
- `teacherMessagesApi` - Endpoints de mensajería
- `apiClient` - Cliente HTTP base

### Componentes Base Compartidos
- `DetectiveCard` - Tarjeta base con estilos
- `DetectiveButton` - Botón base con variantes
- `InputDetective` - Input estilizado
- `Modal` - Modal reutilizable
- `DataTable` - Tabla con ordenamiento y paginación
- `SkeletonCard` - Skeleton loader

### Iconos (lucide-react)
Iconos más utilizados: AlertTriangle, CheckCircle, Clock, Users, Calendar, Target, MessageSquare, Send, Filter, Search, Eye, Bell, Star, Download, TrendingUp, Award, FileText, Settings

---

**Estado:** Catálogo completo documentado
**Próximos Pasos:** Integración con APIs reales, tests unitarios, storybook para documentación visual

