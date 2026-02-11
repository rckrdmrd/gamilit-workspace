# API TEACHER MODULE

**Proyecto:** GAMILIT - Plataforma Educativa Gamificada
**Modulo:** Teacher
**Version:** 1.0
**Fecha:** 2025-12-23
**Generado por:** Auditoria de Documentacion

---

## RESUMEN

| Metrica | Valor |
|---------|-------|
| **Controllers** | 8 |
| **Services** | 16 |
| **Endpoints** | 50+ |
| **Roles requeridos** | admin_teacher, super_admin |

---

## CONTROLLERS

1. `TeacherController` - Controlador principal
2. `TeacherClassroomsController` - Gestion de aulas
3. `TeacherGradesController` - Calificaciones
4. `TeacherContentController` - Contenido educativo
5. `TeacherCommunicationController` - Comunicacion
6. `InterventionAlertsController` - Alertas de intervencion
7. `ManualReviewController` - Revision manual
8. `ExerciseResponsesController` - Respuestas de ejercicios

---

## 1. DASHBOARD ENDPOINTS

### GET /teacher/dashboard/stats
**Descripcion:** Obtiene estadisticas del aula

**Response:**
```json
{
  "totalStudents": 25,
  "activeStudents": 22,
  "averageProgress": 75.5,
  "pendingSubmissions": 12
}
```

### GET /teacher/dashboard/activities
**Descripcion:** Obtiene actividades recientes

**Query params:**
- `limit` (optional): Numero de actividades (default: 10)

### GET /teacher/dashboard/alerts
**Descripcion:** Obtiene alertas de estudiantes

### GET /teacher/dashboard/top-performers
**Descripcion:** Obtiene mejores estudiantes

**Query params:**
- `limit` (optional): Numero de estudiantes (default: 5)

### GET /teacher/dashboard/module-progress
**Descripcion:** Resumen de progreso por modulo

---

## 2. STUDENT PROGRESS ENDPOINTS

### GET /teacher/students/:studentId/progress
**Descripcion:** Obtiene progreso completo del estudiante

**Query params:**
- `moduleId` (optional): Filtrar por modulo
- `startDate` (optional): Fecha inicio
- `endDate` (optional): Fecha fin

### GET /teacher/students/:studentId/overview
**Descripcion:** Vista general del estudiante

### GET /teacher/students/:studentId/stats
**Descripcion:** Estadisticas del estudiante

### GET /teacher/students/:studentId/notes
**Descripcion:** Obtiene notas del maestro sobre el estudiante

### POST /teacher/students/:studentId/note
**Descripcion:** Agrega o actualiza nota sobre estudiante

**Body:**
```json
{
  "classroomId": "uuid",
  "content": "Nota del maestro",
  "type": "observation|concern|praise"
}
```

### GET /teacher/students/:studentId/insights
**Descripcion:** Insights con IA sobre el estudiante

**Response:**
```json
{
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "predictions": {...},
  "recommendations": ["...", "..."]
}
```

---

## 3. GRADING ENDPOINTS

### GET /teacher/submissions
**Descripcion:** Obtiene envios con filtros

**Query params:**
- `assignmentId` (optional)
- `classroomId` (optional)
- `studentId` (optional)
- `status` (optional): pending|graded|returned
- `moduleId` (optional)
- `page` (optional)
- `limit` (optional)
- `sortBy` (optional)
- `sortOrder` (optional): asc|desc

### GET /teacher/submissions/:id
**Descripcion:** Obtiene detalle de un envio

### POST /teacher/submissions/:submissionId/feedback
**Descripcion:** Envia retroalimentacion

**Body:**
```json
{
  "score": 85,
  "feedback": "Buen trabajo...",
  "rubricScores": {...}
}
```

### POST /teacher/submissions/bulk-grade
**Descripcion:** Califica multiples envios

**Body:**
```json
{
  "submissions": [
    {"id": "uuid1", "score": 90, "feedback": "..."},
    {"id": "uuid2", "score": 85, "feedback": "..."}
  ]
}
```

---

## 4. ANALYTICS ENDPOINTS

### GET /teacher/analytics
**Descripcion:** Analiticas generales del aula

**Query params:**
- `classroomId` (optional)
- `startDate` (optional)
- `endDate` (optional)
- `groupBy` (optional): day|week|month

### GET /teacher/analytics/classroom/:id
**Descripcion:** Analiticas de un aula especifica

### GET /teacher/analytics/assignment/:id
**Descripcion:** Analiticas de una asignacion

### GET /teacher/analytics/engagement
**Descripcion:** Metricas de compromiso

### GET /teacher/analytics/reports
**Descripcion:** Genera reportes comprehensivos

### GET /teacher/analytics/economy
**Descripcion:** Analiticas de economia ML Coins

**Response:**
```json
{
  "totalCirculation": 50000,
  "averageBalance": 200,
  "distributionByRange": {...},
  "topEarners": [...],
  "wealthDistribution": {...}
}
```

### GET /teacher/analytics/students-economy
**Descripcion:** Datos de economia por estudiante

### GET /teacher/analytics/achievements
**Descripcion:** Estadisticas de logros

---

## 5. REPORT GENERATION ENDPOINTS

### POST /teacher/reports/generate
**Descripcion:** Genera reporte de insights (PDF/Excel)

**Body:**
```json
{
  "classroomId": "uuid",
  "format": "pdf|excel",
  "includeInsights": true,
  "studentIds": ["uuid1", "uuid2"] // optional
}
```

**Response:** Archivo binario (PDF o XLSX)

**Nota Tecnica (P0-04):** Los PDFs se generan usando Puppeteer (headless Chrome) para renderizado de alta fidelidad con graficas y estilos CSS. El proceso:
1. Renderiza HTML con datos del reporte
2. Captura como PDF con Puppeteer
3. Retorna archivo binario con headers de descarga

### GET /teacher/reports/recent
**Descripcion:** Obtiene reportes recientes

**Query params:**
- `limit` (optional): Numero de reportes (default: 10)

### GET /teacher/reports/stats
**Descripcion:** Estadisticas de reportes generados

### GET /teacher/reports/:id/download
**Descripcion:** Descarga un reporte previamente generado

---

## 6. BONUS ML COINS

### POST /teacher/students/:studentId/bonus
**Descripcion:** Otorga ML Coins bonus a estudiante

**Body:**
```json
{
  "amount": 50,
  "reason": "Excelente participacion en clase"
}
```

**Response:**
```json
{
  "success": true,
  "newBalance": 350,
  "transactionId": "uuid"
}
```

---

## 7. CLASSROOMS ENDPOINTS

### GET /teacher/classrooms
**Descripcion:** Lista aulas del maestro

### GET /teacher/classrooms/:id
**Descripcion:** Detalle de un aula

### GET /teacher/classrooms/:id/students
**Descripcion:** Lista estudiantes del aula

### GET /teacher/classrooms/:id/stats
**Descripcion:** Estadisticas del aula

### GET /teacher/classrooms/:id/progress
**Descripcion:** Progreso del aula

### GET /teacher/classrooms/:classroomId/teachers
**Descripcion:** Maestros asignados al aula

### GET /teacher/classrooms/:classroomId/students/:studentId/permissions
**Descripcion:** Permisos de un estudiante

### PATCH /teacher/classrooms/:classroomId/students/:studentId/permissions
**Descripcion:** Actualiza permisos de estudiante

### POST /teacher/classrooms/:classroomId/students/:studentId/block
**Descripcion:** Bloquea a un estudiante

### POST /teacher/classrooms/:classroomId/students/:studentId/unblock
**Descripcion:** Desbloquea a un estudiante

---

## 8. COMMUNICATION ENDPOINTS

### GET /teacher/conversations
**Descripcion:** Lista conversaciones

**Response:**
```json
{
  "conversations": [
    {
      "id": "uuid",
      "participants": ["Juan Perez", "Maria Garcia"],
      "lastMessage": "...",
      "unreadCount": 2
    }
  ]
}
```

**Nota (P2-04):** Los nombres de participantes ahora muestran nombres reales obtenidos de `auth.profiles` en lugar de identificadores truncados como "User_abc123".

### GET /teacher/unread-count
**Descripcion:** Cuenta mensajes no leidos

### POST /teacher/classroom/:classroomId/announcement
**Descripcion:** Envia anuncio al aula

**Body:**
```json
{
  "title": "Titulo del anuncio",
  "content": "Contenido del anuncio",
  "priority": "normal|high"
}
```

---

## 9. INTERVENTION ALERTS ENDPOINTS

### GET /teacher/alerts
**Descripcion:** Lista alertas de intervencion

### GET /teacher/alerts/:id
**Descripcion:** Detalle de una alerta

### PATCH /teacher/alerts/:id/acknowledge
**Descripcion:** Reconoce una alerta

### PATCH /teacher/alerts/:id/resolve
**Descripcion:** Resuelve una alerta

### PATCH /teacher/alerts/:id/dismiss
**Descripcion:** Descarta una alerta

---

## 10. MANUAL REVIEW ENDPOINTS

### GET /teacher/pending
**Descripcion:** Ejercicios pendientes de revision manual

### GET /teacher/my-reviews
**Descripcion:** Mis revisiones

### POST /teacher/:id/start
**Descripcion:** Inicia revision

### POST /teacher/:id/complete
**Descripcion:** Completa revision

### POST /teacher/:id/return
**Descripcion:** Devuelve para correccion

---

## 11. EXERCISE RESPONSES ENDPOINTS

### GET /teacher/exercises/:exerciseId/responses
**Descripcion:** Respuestas de un ejercicio

### GET /teacher/attempts
**Descripcion:** Lista paginada de intentos con estadisticas agregadas

**Query params:**
- `page` (optional): Numero de pagina (default: 1)
- `limit` (optional): Items por pagina (default: 20, max: 100)
- `student_id` (optional): Filtrar por UUID de estudiante
- `exercise_id` (optional): Filtrar por UUID de ejercicio
- `module_id` (optional): Filtrar por UUID de modulo
- `classroom_id` (optional): Filtrar por UUID de aula
- `from_date` (optional): Fecha inicio (ISO 8601)
- `to_date` (optional): Fecha fin (ISO 8601)
- `is_correct` (optional): Filtrar por resultado (true/false)
- `student_search` (optional): Buscar por nombre/email de estudiante
- `sort_by` (optional): Campo de ordenamiento (submitted_at|score|time)
- `sort_order` (optional): Orden (asc|desc, default: desc)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "student_id": "uuid",
      "student_name": "Juan Perez",
      "exercise_id": "uuid",
      "exercise_title": "Comprension Lectora - Texto Narrativo",
      "module_name": "Modulo 1: Lectura Literal",
      "attempt_number": 1,
      "submitted_answers": {"answers": ["A", "B", "C"]},
      "is_correct": true,
      "score": 85,
      "time_spent_seconds": 120,
      "hints_used": 2,
      "comodines_used": ["pistas", "vision_lectora"],
      "xp_earned": 50,
      "ml_coins_earned": 10,
      "submitted_at": "2024-11-24T10:30:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "total_pages": 8,
  "stats": {
    "total_attempts": 150,
    "correct_count": 120,
    "incorrect_count": 30,
    "average_score": 78,
    "success_rate": 80
  }
}
```

**Nota (P2-03):** Las estadisticas (`stats`) se calculan en el servidor para optimizar performance del cliente.

### GET /teacher/attempts/:id
**Descripcion:** Detalle de un intento (incluye respuesta correcta y tipo de ejercicio)

**Response:**
```json
{
  "id": "uuid",
  "student_id": "uuid",
  "student_name": "Juan Perez",
  "exercise_id": "uuid",
  "exercise_title": "Comprension Lectora",
  "correct_answer": {"correct_answers": ["A", "C", "D"]},
  "exercise_type": "multiple_choice",
  "max_score": 100,
  "...otros campos de AttemptResponseDto"
}
```

### GET /teacher/attempts/student/:studentId
**Descripcion:** Intentos de un estudiante especifico

### GET /teacher/student/:studentId/history
**Descripcion:** Historial del estudiante

### POST /teacher/student/:studentId/feedback
**Descripcion:** Envia retroalimentacion

---

## 12. CONTENT MANAGEMENT

### POST /teacher/content/generate
**Descripcion:** Genera contenido educativo

### GET /teacher/content/:id
**Descripcion:** Obtiene contenido

### POST /teacher/content/:id/clone
**Descripcion:** Clona contenido

### PATCH /teacher/content/:id/publish
**Descripcion:** Publica contenido

### DELETE /teacher/content/:id
**Descripcion:** Elimina contenido

---

## AUTENTICACION Y AUTORIZACION

Todos los endpoints requieren:
- **Header:** `Authorization: Bearer <jwt_token>`
- **Roles permitidos:** `admin_teacher`, `super_admin`

---

## CODIGOS DE RESPUESTA

| Codigo | Descripcion |
|--------|-------------|
| 200 | Exito |
| 201 | Creado |
| 400 | Solicitud invalida |
| 401 | No autenticado |
| 403 | No autorizado |
| 404 | No encontrado |
| 500 | Error del servidor |

---

## SERVICES DEL MODULO

1. `TeacherDashboardService`
2. `StudentProgressService`
3. `GradingService`
4. `AnalyticsService`
5. `ReportsService`
6. `BonusCoinsService`
7. `StorageService`
8. `TeacherReportsService`
9. `ManualReviewService`
10. `InterventionAlertsService`
11. `ExerciseResponsesService`
12. `TeacherClassroomsCrudService`
13. `TeacherMessagesService`
14. `TeacherContentService`
15. `StudentBlockingService`
16. `MlPredictorService`

---

**Generado por:** Requirements-Analyst
**Fecha:** 2025-12-23
**Version:** 1.0
