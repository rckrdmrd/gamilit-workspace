# API Contracts - Portal Teacher (GAMILIT)

**Proyecto:** GAMILIT Platform
**Módulo:** Teacher Portal (EXT-001)
**Versión:** 1.0.0
**Fecha:** 2026-01-25

---

## Índice

1. [Información General](#información-general)
2. [Base URL y Autenticación](#base-url-y-autenticación)
3. [Tipos y Enumeraciones Compartidos](#tipos-y-enumeraciones-compartidos)
4. [TeacherController - Dashboard y Progreso](#teachercontroller---dashboard-y-progreso)
5. [TeacherClassroomsController - Gestión de Aulas](#teacherclassroomscontroller---gestión-de-aulas)
6. [TeacherCommunicationController - Mensajería](#teachercommunicationcontroller---mensajería)
7. [TeacherContentController - Contenido Educativo](#teachercontentcontroller---contenido-educativo)
8. [InterventionAlertsController - Alertas](#interventionalertscontroller---alertas)
9. [ManualReviewController - Revisión Manual](#manualreviewcontroller---revisión-manual)
10. [ExerciseResponsesController - Respuestas](#exerciseresponsescontroller---respuestas)
11. [TeacherGradesController - Calificaciones](#teachergradescontroller---calificaciones)

---

## Información General

### Descripción

Este documento especifica el contrato de APIs REST entre el backend (NestJS) y el frontend (React) del Portal Teacher de GAMILIT. Todas las APIs están protegidas por autenticación JWT y requieren rol de `ADMIN_TEACHER` o `SUPER_ADMIN`.

### Convenciones

- **Base URL:** `/api/v1`
- **Formato:** JSON
- **Autenticación:** Bearer Token (JWT)
- **Paginación:** Offset-based con parámetros `page` y `limit`
- **UUIDs:** Formato UUID v4 para todos los IDs
- **Fechas:** ISO 8601 (UTC)

---

## Base URL y Autenticación

### Base URL
```
/api/v1
```

### Headers Requeridos
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Roles Permitidos
- `ADMIN_TEACHER`
- `SUPER_ADMIN`

### Códigos de Error Comunes

| Código | Descripción |
|--------|-------------|
| 200 | OK - Operación exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token inválido o faltante |
| 403 | Forbidden - Sin permisos suficientes |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto (ej. código duplicado) |
| 500 | Internal Server Error - Error del servidor |

---

## Tipos y Enumeraciones Compartidos

### SubmissionStatus
```typescript
enum SubmissionStatus {
  PENDING = 'pending',
  GRADED = 'graded',
  NEEDS_REVIEW = 'needs_review'
}
```

### ClassroomStatus
```typescript
enum ClassroomStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived'
}
```

### TeacherContentType
```typescript
enum TeacherContentType {
  EXERCISE = 'exercise',
  WORKSHEET = 'worksheet',
  READING_MATERIAL = 'reading_material',
  VIDEO = 'video',
  QUIZ = 'quiz',
  PROJECT = 'project'
}
```

### TeacherContentStatus
```typescript
enum TeacherContentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}
```

### TeacherContentVisibility
```typescript
enum TeacherContentVisibility {
  PRIVATE = 'private',
  CLASSROOM = 'classroom',
  SCHOOL = 'school',
  PUBLIC = 'public'
}
```

### TeacherContentDifficulty
```typescript
enum TeacherContentDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}
```

### ReportFormat
```typescript
enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv'
}
```

### AlertType
```typescript
enum AlertType {
  LOW_SCORE = 'low_score',
  INACTIVITY = 'inactivity',
  STRUGGLING = 'struggling',
  AT_RISK = 'at_risk'
}
```

### AlertSeverity
```typescript
enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}
```

### AlertStatus
```typescript
enum AlertStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed'
}
```

### ReviewStatus
```typescript
enum ReviewStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  RETURNED = 'returned'
}
```

### BlockType
```typescript
enum BlockType {
  FULL = 'full',
  PARTIAL = 'partial'
}
```

### SharePermission
```typescript
enum SharePermission {
  VIEW = 'view',
  DOWNLOAD = 'download',
  EDIT = 'edit',
}
// DDL canonical: CHECK (permission_level IN ('view', 'download', 'edit'))
```

### ScheduleStatus
```typescript
enum ScheduleStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
}
// DDL canonical: CHECK (status IN ('active', 'paused', 'completed'))
```

---

## TeacherController - Dashboard y Progreso

**Ruta Base:** `/api/v1/teacher`

### 1. Obtener Estadísticas del Dashboard

**GET** `/teacher/dashboard/stats`

#### Descripción
Obtiene estadísticas generales de las aulas del profesor.

#### Response
```json
{
  "total_students": 125,
  "active_classrooms": 5,
  "pending_submissions": 23,
  "avg_completion_rate": 78.5
}
```

---

### 2. Obtener Actividades Recientes

**GET** `/teacher/dashboard/activities`

#### Query Parameters
| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| limit | number | No | 10 | Número de actividades a retornar |

#### Response
```json
{
  "activities": [
    {
      "id": "uuid",
      "type": "submission",
      "student_name": "Juan Pérez",
      "description": "Submission para Módulo 1",
      "timestamp": "2026-01-25T10:30:00Z"
    }
  ]
}
```

---

### 3. Obtener Alertas de Estudiantes

**GET** `/teacher/dashboard/alerts`

#### Response
```json
{
  "alerts": [
    {
      "id": "uuid",
      "student_id": "uuid",
      "student_name": "María García",
      "type": "low_score",
      "severity": "high",
      "message": "Bajo rendimiento en últimos 3 ejercicios"
    }
  ]
}
```

---

### 4. Obtener Top Performers

**GET** `/teacher/dashboard/top-performers`

#### Query Parameters
| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| limit | number | No | 5 | Número de estudiantes a retornar |

#### Response
```json
{
  "students": [
    {
      "id": "uuid",
      "name": "Ana López",
      "classroom": "5A",
      "avg_score": 95.5,
      "completion_rate": 100
    }
  ]
}
```

---

### 5. Obtener Resumen de Progreso por Módulo

**GET** `/teacher/dashboard/module-progress`

#### Response
```json
{
  "modules": [
    {
      "module_id": "uuid",
      "module_name": "Módulo 1: Marie Curie",
      "avg_completion": 85.5,
      "students_completed": 45,
      "total_students": 50
    }
  ]
}
```

---

### 6. Obtener Progreso de Estudiante

**GET** `/teacher/students/:studentId/progress`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| studentId | UUID | ID del estudiante |

#### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| module_id | UUID | No | Filtrar por módulo específico |

#### Response
```json
{
  "student_id": "uuid",
  "overall_progress": {
    "completion_percentage": 75.5,
    "exercises_completed": 45,
    "total_exercises": 60,
    "avg_score": 85.3
  },
  "module_progress": [
    {
      "module_id": "uuid",
      "module_name": "Módulo 1: Marie Curie",
      "completion_percentage": 100,
      "avg_score": 90.5,
      "exercises_completed": 12,
      "total_exercises": 12
    }
  ]
}
```

---

### 7. Obtener Overview de Estudiante

**GET** `/teacher/students/:studentId/overview`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| studentId | UUID | ID del estudiante |

#### Response
```json
{
  "student_id": "uuid",
  "full_name": "Juan Pérez",
  "email": "juan@example.com",
  "classrooms": ["5A", "5B"],
  "total_xp": 1500,
  "ml_coins_balance": 250,
  "maya_rank": "Nacom",
  "current_level": 5,
  "last_activity": "2026-01-25T10:30:00Z"
}
```

---

### 8. Obtener Estadísticas de Estudiante

**GET** `/teacher/students/:studentId/stats`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| studentId | UUID | ID del estudiante |

#### Response
```json
{
  "student_id": "uuid",
  "total_xp": 1500,
  "ml_coins_balance": 250,
  "current_streak": 7,
  "longest_streak": 15,
  "powerups_used": 5,
  "hints_used": 12,
  "avg_score": 85.3,
  "completion_rate": 75.5
}
```

---

### 9. Obtener Notas del Profesor sobre Estudiante

**GET** `/teacher/students/:studentId/notes`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| studentId | UUID | ID del estudiante |

#### Response
```json
{
  "notes": [
    {
      "id": "uuid",
      "classroom_id": "uuid",
      "classroom_name": "5A",
      "note": "Estudiante muy participativo",
      "created_at": "2026-01-20T10:00:00Z",
      "updated_at": "2026-01-20T10:00:00Z"
    }
  ]
}
```

---

### 10. Agregar/Actualizar Nota sobre Estudiante

**POST** `/teacher/students/:studentId/note`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| studentId | UUID | ID del estudiante |

#### Request Body
```json
{
  "classroom_id": "uuid",
  "note": "Requiere apoyo adicional en fracciones"
}
```

#### Response
```json
{
  "id": "uuid",
  "classroom_id": "uuid",
  "classroom_name": "5A",
  "note": "Requiere apoyo adicional en fracciones",
  "created_at": "2026-01-25T10:00:00Z",
  "updated_at": "2026-01-25T10:00:00Z"
}
```

---

### 11. Obtener Insights de Estudiante

**GET** `/teacher/students/:studentId/insights`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| studentId | UUID | ID del estudiante |

#### Response
```json
{
  "student_id": "uuid",
  "strengths": [
    "Excelente en ejercicios de lógica",
    "Alto nivel de participación"
  ],
  "weaknesses": [
    "Dificultad con fracciones complejas",
    "Baja velocidad de respuesta"
  ],
  "predictions": {
    "risk_level": "low",
    "estimated_completion_date": "2026-03-15",
    "recommended_interventions": []
  },
  "recommendations": [
    "Asignar ejercicios adicionales de fracciones",
    "Motivar con recompensas extra"
  ]
}
```

---

### 12. Obtener Submissions con Filtros

**GET** `/teacher/submissions`

#### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| assignment_id | UUID | No | Filtrar por assignment |
| classroom_id | UUID | No | Filtrar por classroom |
| student_id | UUID | No | Filtrar por estudiante |
| module_id | UUID | No | Filtrar por módulo |
| status | SubmissionStatus | No | Filtrar por estado |
| sort_by | 'date' \| 'score' \| 'time' | No | Ordenar resultados |
| page | number | No | Número de página (default: 1) |
| limit | number | No | Items por página (default: 20, max: 100) |

#### Response
```json
{
  "submissions": [
    {
      "id": "uuid",
      "student_id": "uuid",
      "student_name": "Juan Pérez",
      "exercise_id": "uuid",
      "exercise_title": "Ejercicio 1",
      "score": 85,
      "max_score": 100,
      "status": "graded",
      "submitted_at": "2026-01-25T10:00:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20
}
```

---

### 13. Obtener Detalle de Submission

**GET** `/teacher/submissions/:id`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del submission |

#### Response
```json
{
  "id": "uuid",
  "student_id": "uuid",
  "student_name": "Juan Pérez",
  "exercise_id": "uuid",
  "exercise_title": "Ejercicio 1",
  "exercise_type": "multiple_choice",
  "score": 85,
  "max_score": 100,
  "is_correct": true,
  "answer_data": {},
  "feedback": "Muy bien",
  "status": "graded",
  "submitted_at": "2026-01-25T10:00:00Z",
  "graded_at": "2026-01-25T11:00:00Z"
}
```

---

### 14. Enviar Feedback a Submission

**POST** `/teacher/submissions/:submissionId/feedback`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| submissionId | UUID | ID del submission |

#### Request Body
```json
{
  "feedback": "Excelente trabajo, pero revisa la pregunta 3",
  "adjusted_score": 90,
  "score": 90,
  "max_score": 100,
  "grade": "A",
  "is_approved": true
}
```

#### Response
```json
{
  "id": "uuid",
  "feedback": "Excelente trabajo, pero revisa la pregunta 3",
  "score": 90,
  "status": "graded",
  "graded_at": "2026-01-25T11:00:00Z"
}
```

---

### 15. Calificar Múltiples Submissions

**POST** `/teacher/submissions/bulk-grade`

#### Request Body
```json
{
  "submission_ids": ["uuid1", "uuid2", "uuid3"],
  "feedback": "Buen trabajo en general",
  "adjusted_score": 85
}
```

#### Response
```json
{
  "success": true,
  "graded_count": 3,
  "failed": []
}
```

---

### 16. Obtener Analytics de Classroom

**GET** `/teacher/analytics`

#### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| classroom_id | UUID | No | Filtrar por classroom |
| start_date | string | No | Fecha inicio (ISO 8601) |
| end_date | string | No | Fecha fin (ISO 8601) |

#### Response
```json
{
  "avg_score": 85.5,
  "completion_rate": 78.5,
  "active_students": 45,
  "total_students": 50,
  "exercises_completed": 500,
  "score_distribution": {
    "0-60": 5,
    "60-80": 15,
    "80-100": 25
  }
}
```

---

### 17. Obtener Analytics por Classroom ID

**GET** `/teacher/analytics/classroom/:id`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del classroom |

#### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| start_date | string | No | Fecha inicio (ISO 8601) |
| end_date | string | No | Fecha fin (ISO 8601) |

#### Response
```json
{
  "classroom_id": "uuid",
  "classroom_name": "5A",
  "avg_score": 85.5,
  "completion_rate": 78.5,
  "active_students": 25,
  "total_students": 30
}
```

---

### 18. Obtener Analytics de Assignment

**GET** `/teacher/analytics/assignment/:id`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del assignment |

#### Response
```json
{
  "assignment_id": "uuid",
  "assignment_title": "Tarea 1",
  "submission_rate": 85.5,
  "avg_score": 80.3,
  "graded_count": 20,
  "pending_count": 5
}
```

---

### 19. Obtener Métricas de Engagement

**GET** `/teacher/analytics/engagement`

#### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| classroom_id | UUID | No | Filtrar por classroom |
| start_date | string | No | Fecha inicio (ISO 8601) |
| end_date | string | No | Fecha fin (ISO 8601) |

#### Response
```json
{
  "active_students_today": 25,
  "active_students_week": 45,
  "avg_session_duration": 45.5,
  "total_sessions": 500,
  "submission_rate": 78.5
}
```

---

### 20. Generar Reportes

**GET** `/teacher/analytics/reports`

#### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| classroom_id | UUID | No | Filtrar por classroom |
| start_date | string | No | Fecha inicio (ISO 8601) |
| end_date | string | No | Fecha fin (ISO 8601) |
| report_type | string | No | Tipo de reporte |

#### Response
```json
{
  "report_id": "uuid",
  "generated_at": "2026-01-25T10:00:00Z",
  "summary": {},
  "details": []
}
```

---

### 21. Obtener Analytics de Economía ML Coins

**GET** `/teacher/analytics/economy`

#### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| classroom_id | UUID | No | Filtrar por classroom |

#### Response
```json
{
  "total_circulation": 15000,
  "avg_balance": 250,
  "distribution": {
    "0-100": 10,
    "100-500": 25,
    "500+": 15
  },
  "top_earners": [
    {
      "student_id": "uuid",
      "student_name": "Ana López",
      "balance": 850
    }
  ]
}
```

---

### 22. Obtener Economía de Estudiantes

**GET** `/teacher/analytics/students-economy`

#### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| classroom_id | UUID | No | Filtrar por classroom |

#### Response
```json
{
  "students": [
    {
      "student_id": "uuid",
      "student_name": "Juan Pérez",
      "balance": 250,
      "weekly_earnings": 50,
      "weekly_spending": 20,
      "maya_rank": "Nacom",
      "level": 5
    }
  ]
}
```

---

### 23. Obtener Estadísticas de Achievements

**GET** `/teacher/analytics/achievements`

#### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| classroom_id | UUID | No | Filtrar por classroom |

#### Response
```json
{
  "achievements": [
    {
      "achievement_id": "uuid",
      "achievement_name": "Primer Módulo Completado",
      "unlocked_count": 35,
      "total_students": 50
    }
  ]
}
```

---

### 24. Generar Reporte de Insights (PDF/Excel/CSV)

**POST** `/teacher/reports/generate`

#### Request Body
```json
{
  "format": "pdf",
  "student_ids": ["uuid1", "uuid2"],
  "classroom_id": "uuid",
  "include_insights": true
}
```

#### Response
```
Content-Type: application/pdf | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet | text/csv
Content-Disposition: attachment; filename="student-insights-{reportId}.{ext}"
X-Report-ID: uuid
X-Student-Count: 2
X-Generated-At: 2026-01-25T10:00:00Z

[Binary file data]
```

---

### 25. Otorgar Bonus de ML Coins

**POST** `/teacher/students/:studentId/bonus`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| studentId | UUID | ID del estudiante |

#### Request Body
```json
{
  "amount": 50,
  "reason": "Excelente participación en clase y ayuda a compañeros"
}
```

#### Response
```json
{
  "success": true,
  "newBalance": 300,
  "message": "Bonus otorgado exitosamente",
  "amountGranted": 50,
  "reason": "Excelente participación en clase y ayuda a compañeros"
}
```

#### Errores
- **400:** Amount fuera de rango (1-1000) o reason muy corto (< 10 chars)
- **403:** Teacher no tiene acceso al estudiante
- **404:** Estudiante no encontrado

---

### 26. Obtener Reportes Recientes

**GET** `/teacher/reports/recent`

#### Query Parameters
| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| limit | number | No | 10 | Número de reportes a retornar |

#### Response
```json
{
  "reports": [
    {
      "id": "uuid",
      "report_name": "Reporte Mensual",
      "report_format": "pdf",
      "student_count": 25,
      "generated_at": "2026-01-25T10:00:00Z",
      "file_path": "reports/2026/01/report-uuid.pdf"
    }
  ]
}
```

---

### 27. Obtener Estadísticas de Reportes

**GET** `/teacher/reports/stats`

#### Response
```json
{
  "total_reports": 45,
  "reports_this_month": 5,
  "most_used_format": "pdf",
  "total_students_reported": 125
}
```

---

### 28. Descargar Reporte

**GET** `/teacher/reports/:id/download`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del reporte |

#### Response
```
Content-Type: application/pdf | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet | text/csv
Content-Disposition: attachment; filename="{reportName}.{ext}"
X-Report-ID: uuid
X-Teacher-ID: uuid
X-Generated-At: 2026-01-25T10:00:00Z

[Binary file data]
```

#### Errores
- **404:** Reporte no encontrado o archivo no existe
- **403:** Teacher no es el dueño del reporte

---

### 29. Eliminar Reporte

**DELETE** `/teacher/reports/:id`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del reporte |

#### Response
```json
{
  "message": "Report deleted successfully"
}
```

#### Errores
- **404:** Reporte no encontrado
- **403:** Teacher no es el dueño del reporte

---

### 30. Obtener Reportes Programados

**GET** `/teacher/reports/scheduled`

#### Response
```json
{
  "scheduled_reports": [
    {
      "id": "uuid",
      "name": "Reporte Semanal",
      "format": "pdf",
      "frequency": "weekly",
      "next_execution": "2026-02-01T09:00:00Z",
      "status": "active"
    }
  ]
}
```

---

### 31. Crear Reporte Programado

**POST** `/teacher/reports/scheduled`

#### Request Body
```json
{
  "name": "Reporte Semanal",
  "format": "pdf",
  "frequency": "weekly",
  "classroom_id": "uuid",
  "student_ids": ["uuid1", "uuid2"],
  "include_insights": true
}
```

#### Response
```json
{
  "id": "uuid",
  "name": "Reporte Semanal",
  "format": "pdf",
  "frequency": "weekly",
  "next_execution": "2026-02-01T09:00:00Z",
  "status": "active"
}
```

---

### 32. Obtener Reporte Programado por ID

**GET** `/teacher/reports/scheduled/:id`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del reporte programado |

#### Response
```json
{
  "id": "uuid",
  "name": "Reporte Semanal",
  "format": "pdf",
  "frequency": "weekly",
  "classroom_id": "uuid",
  "student_ids": ["uuid1", "uuid2"],
  "next_execution": "2026-02-01T09:00:00Z",
  "status": "active"
}
```

---

### 33. Actualizar Reporte Programado

**PUT** `/teacher/reports/scheduled/:id`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del reporte programado |

#### Request Body
```json
{
  "name": "Reporte Semanal Actualizado",
  "frequency": "biweekly",
  "include_insights": false
}
```

#### Response
```json
{
  "id": "uuid",
  "name": "Reporte Semanal Actualizado",
  "frequency": "biweekly",
  "next_execution": "2026-02-08T09:00:00Z",
  "status": "active"
}
```

---

### 34. Eliminar Reporte Programado

**DELETE** `/teacher/reports/scheduled/:id`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del reporte programado |

#### Response
```json
{
  "message": "Scheduled report deleted successfully"
}
```

---

### 35. Pausar Reporte Programado

**POST** `/teacher/reports/scheduled/:id/pause`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del reporte programado |

#### Response
```json
{
  "id": "uuid",
  "status": "paused"
}
```

---

### 36. Reanudar Reporte Programado

**POST** `/teacher/reports/scheduled/:id/resume`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del reporte programado |

#### Response
```json
{
  "id": "uuid",
  "status": "active",
  "next_execution": "2026-02-01T09:00:00Z"
}
```

---

### 37. Compartir Reporte

**POST** `/teacher/reports/share`

#### Request Body
```json
{
  "report_id": "uuid",
  "shared_with_teacher_id": "uuid",
  "permission": "view",
  "message": "Te comparto el reporte mensual"
}
```

#### Response
```json
{
  "id": "uuid",
  "report_id": "uuid",
  "shared_by": "uuid",
  "shared_with": "uuid",
  "permission": "view",
  "created_at": "2026-01-25T10:00:00Z"
}
```

---

### 38. Obtener Reportes Compartidos por Mí

**GET** `/teacher/reports/shared/by-me`

#### Response
```json
{
  "shared_reports": [
    {
      "id": "uuid",
      "report_id": "uuid",
      "report_name": "Reporte Mensual",
      "shared_with_name": "Prof. García",
      "permission": "view",
      "created_at": "2026-01-25T10:00:00Z"
    }
  ]
}
```

---

### 39. Obtener Reportes Compartidos Conmigo

**GET** `/teacher/reports/shared/with-me`

#### Response
```json
{
  "shared_reports": [
    {
      "id": "uuid",
      "report_id": "uuid",
      "report_name": "Reporte Semanal",
      "shared_by_name": "Prof. López",
      "permission": "view",
      "is_viewed": false,
      "created_at": "2026-01-25T10:00:00Z"
    }
  ]
}
```

---

### 40. Marcar Reporte Compartido como Visto

**POST** `/teacher/reports/shared/:id/view`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del share |

#### Response
```json
{
  "message": "Marked as viewed"
}
```

---

### 41. Revocar Reporte Compartido

**DELETE** `/teacher/reports/shared/:id`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del share |

#### Response
```json
{
  "message": "Share revoked successfully"
}
```

---

### 42. Actualizar Permiso de Reporte Compartido

**PUT** `/teacher/reports/shared/:id/permission`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del share |

#### Request Body
```json
{
  "permission": "download"
}
```

#### Response
```json
{
  "id": "uuid",
  "permission": "download",
  "updated_at": "2026-01-25T11:00:00Z"
}
```

---

## TeacherClassroomsController - Gestión de Aulas

**Ruta Base:** `/api/v1/teacher/classrooms`

### 1. Listar Classrooms del Teacher

**GET** `/teacher/classrooms`

#### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| page | number | No | Número de página (default: 1) |
| limit | number | No | Items por página (default: 10) |
| search | string | No | Búsqueda por nombre o código |
| status | 'active' \| 'inactive' \| 'archived' \| 'all' | No | Filtrar por estado |
| grade_level | string | No | Filtrar por nivel escolar |
| subject | string | No | Filtrar por materia |

#### Response
```json
{
  "classrooms": [
    {
      "id": "uuid",
      "name": "Matemáticas 5A",
      "classroom_code": "MAT-5A-2026",
      "status": "active",
      "grade_level": "5",
      "subject": "Matemáticas",
      "student_count": 30,
      "teacher_role": "owner"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10
}
```

---

### 2. Crear Classroom

**POST** `/teacher/classrooms`

#### Request Body
```json
{
  "name": "Matemáticas 5A",
  "classroom_code": "MAT-5A-2026",
  "grade_level": "5",
  "subject": "Matemáticas",
  "description": "Clase de matemáticas para 5to grado",
  "school_year": "2026",
  "max_students": 35
}
```

#### Response
```json
{
  "id": "uuid",
  "name": "Matemáticas 5A",
  "classroom_code": "MAT-5A-2026",
  "status": "active",
  "grade_level": "5",
  "subject": "Matemáticas",
  "created_at": "2026-01-25T10:00:00Z"
}
```

#### Errores
- **400:** Datos inválidos o tenant_id faltante
- **409:** Código de classroom ya existe

---

### 3. Obtener Classroom por ID

**GET** `/teacher/classrooms/:id`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del classroom |

#### Response
```json
{
  "id": "uuid",
  "name": "Matemáticas 5A",
  "classroom_code": "MAT-5A-2026",
  "status": "active",
  "grade_level": "5",
  "subject": "Matemáticas",
  "description": "Clase de matemáticas para 5to grado",
  "student_count": 30,
  "teacher_role": "owner",
  "created_at": "2026-01-25T10:00:00Z",
  "updated_at": "2026-01-25T10:00:00Z"
}
```

#### Errores
- **404:** Classroom no encontrado
- **403:** Teacher no tiene acceso al classroom

---

### 4. Actualizar Classroom

**PUT** `/teacher/classrooms/:id`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del classroom |

#### Request Body
```json
{
  "name": "Matemáticas 5A - Actualizado",
  "description": "Nueva descripción",
  "status": "active"
}
```

#### Response
```json
{
  "id": "uuid",
  "name": "Matemáticas 5A - Actualizado",
  "description": "Nueva descripción",
  "updated_at": "2026-01-25T11:00:00Z"
}
```

#### Errores
- **404:** Classroom no encontrado
- **403:** Teacher no tiene acceso al classroom
- **409:** Código de classroom duplicado

---

### 5. Eliminar Classroom (Soft Delete)

**DELETE** `/teacher/classrooms/:id`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del classroom |

#### Response
```json
{
  "success": true,
  "message": "Classroom \"Matemáticas 5A\" has been archived successfully"
}
```

#### Errores
- **404:** Classroom no encontrado
- **403:** Solo el owner puede eliminar el classroom
- **400:** No se puede eliminar classroom con estudiantes activos

---

### 6. Obtener Estudiantes del Classroom

**GET** `/teacher/classrooms/:id/students`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del classroom |

#### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| page | number | No | Número de página (default: 1) |
| limit | number | No | Items por página (default: 20) |
| search | string | No | Búsqueda por nombre |
| status | 'active' \| 'inactive' \| 'withdrawn' \| 'completed' \| 'all' | No | Filtrar por estado |
| sort_by | 'name' \| 'progress' \| 'score' \| 'last_activity' | No | Ordenar por |
| sort_order | 'asc' \| 'desc' | No | Orden |

#### Response
```json
{
  "students": [
    {
      "id": "uuid",
      "full_name": "Juan Pérez",
      "email": "juan@example.com",
      "status": "active",
      "completion_percentage": 75.5,
      "avg_score": 85.3,
      "last_activity": "2026-01-25T10:00:00Z"
    }
  ],
  "total": 30,
  "page": 1,
  "limit": 20
}
```

#### Errores
- **404:** Classroom no encontrado
- **403:** Teacher no tiene acceso al classroom

---

### 7. Obtener Estadísticas del Classroom

**GET** `/teacher/classrooms/:id/stats`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del classroom |

#### Response
```json
{
  "total_students": 30,
  "active_students": 28,
  "avg_completion": 75.5,
  "avg_score": 85.3,
  "total_exercises": 50,
  "completed_exercises": 1200,
  "engagement_rate": 92.5
}
```

#### Errores
- **404:** Classroom no encontrado
- **403:** Teacher no tiene acceso al classroom

---

### 8. Obtener Teachers del Classroom

**GET** `/teacher/classrooms/:classroomId/teachers`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| classroomId | UUID | ID del classroom |

#### Response
```json
{
  "teachers": [
    {
      "id": "uuid",
      "full_name": "Prof. García",
      "email": "garcia@example.com",
      "role": "owner"
    },
    {
      "id": "uuid",
      "full_name": "Prof. López",
      "email": "lopez@example.com",
      "role": "teacher"
    }
  ]
}
```

#### Errores
- **404:** Classroom no encontrado
- **403:** Teacher no tiene acceso al classroom

---

### 9. Obtener Progreso del Classroom

**GET** `/teacher/classrooms/:id/progress`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del classroom |

#### Response
```json
{
  "classroomData": {
    "id": "uuid",
    "name": "Matemáticas 5A",
    "student_count": 25,
    "active_students": 22,
    "average_completion": 75.5,
    "average_score": 85.3,
    "total_exercises": 50,
    "completed_exercises": 40
  },
  "moduleProgress": [
    {
      "module_id": "uuid",
      "module_name": "Módulo 1: Marie Curie",
      "completion_percentage": 68.5,
      "average_score": 82.7,
      "students_completed": 18,
      "students_total": 25,
      "average_time_minutes": 120.5
    }
  ]
}
```

#### Errores
- **404:** Classroom no encontrado
- **403:** Teacher no tiene acceso al classroom

---

### 10. Bloquear Estudiante en Classroom

**POST** `/teacher/classrooms/:classroomId/students/:studentId/block`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| classroomId | UUID | ID del classroom |
| studentId | UUID | ID del estudiante |

#### Request Body
```json
{
  "reason": "Comportamiento inapropiado",
  "block_type": "full",
  "blocked_modules": []
}
```

#### Response
```json
{
  "student_id": "uuid",
  "classroom_id": "uuid",
  "is_blocked": true,
  "block_type": "full",
  "blocked_modules": [],
  "allowed_modules": [],
  "allowed_features": [],
  "flags": {}
}
```

#### Errores
- **404:** Estudiante no encontrado en classroom
- **403:** Teacher no tiene acceso al classroom
- **400:** Estudiante ya está bloqueado

---

### 11. Desbloquear Estudiante

**POST** `/teacher/classrooms/:classroomId/students/:studentId/unblock`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| classroomId | UUID | ID del classroom |
| studentId | UUID | ID del estudiante |

#### Response
```json
{
  "student_id": "uuid",
  "classroom_id": "uuid",
  "is_blocked": false,
  "block_type": null,
  "allowed_modules": [],
  "allowed_features": []
}
```

#### Errores
- **404:** Estudiante no encontrado en classroom
- **403:** Teacher no tiene acceso al classroom
- **400:** Estudiante no está bloqueado

---

### 12. Obtener Permisos de Estudiante

**GET** `/teacher/classrooms/:classroomId/students/:studentId/permissions`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| classroomId | UUID | ID del classroom |
| studentId | UUID | ID del estudiante |

#### Response
```json
{
  "student_id": "uuid",
  "classroom_id": "uuid",
  "is_blocked": false,
  "block_type": null,
  "allowed_modules": ["uuid1", "uuid2"],
  "allowed_features": ["hints", "powerups"],
  "flags": {}
}
```

#### Errores
- **404:** Estudiante no encontrado en classroom
- **403:** Teacher no tiene acceso al classroom

---

### 13. Actualizar Permisos de Estudiante

**PATCH** `/teacher/classrooms/:classroomId/students/:studentId/permissions`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| classroomId | UUID | ID del classroom |
| studentId | UUID | ID del estudiante |

#### Request Body
```json
{
  "allowed_modules": ["uuid1", "uuid2", "uuid3"],
  "allowed_features": ["hints"],
  "flags": {
    "can_use_powerups": false
  }
}
```

#### Response
```json
{
  "student_id": "uuid",
  "classroom_id": "uuid",
  "is_blocked": false,
  "allowed_modules": ["uuid1", "uuid2", "uuid3"],
  "allowed_features": ["hints"],
  "flags": {
    "can_use_powerups": false
  }
}
```

#### Errores
- **404:** Estudiante no encontrado en classroom
- **403:** Teacher no tiene acceso al classroom
- **400:** Permisos inválidos o conflictos detectados

---

## TeacherCommunicationController - Mensajería

**Ruta Base:** `/api/v1/teacher/messages` o `/api/v1/teacher/communications`

### 1. Obtener Mensajes con Filtros

**GET** `/teacher/messages`

#### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| classroom_id | UUID | No | Filtrar por classroom |
| type | string | No | Tipo de mensaje |
| unread | boolean | No | Solo no leídos |
| search | string | No | Búsqueda en subject/content/sender |
| limit | number | No | Items por página |
| offset | number | No | Offset de paginación |

#### Response
```json
{
  "messages": [
    {
      "id": "uuid",
      "subject": "Consulta sobre tarea",
      "content": "¿Cuándo es la entrega?",
      "sender_name": "Juan Pérez",
      "is_read": false,
      "created_at": "2026-01-25T10:00:00Z"
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

---

### 2. Enviar Mensaje Directo

**POST** `/teacher/messages`

#### Request Body
```json
{
  "recipient_ids": ["uuid1", "uuid2"],
  "subject": "Recordatorio de tarea",
  "content": "No olviden entregar la tarea del viernes",
  "classroom_id": "uuid",
  "assignment_id": "uuid"
}
```

#### Response
```json
{
  "id": "uuid",
  "subject": "Recordatorio de tarea",
  "content": "No olviden entregar la tarea del viernes",
  "recipient_count": 2,
  "created_at": "2026-01-25T10:00:00Z"
}
```

---

### 3. Obtener Conversaciones

**GET** `/teacher/messages/conversations`

#### Response
```json
{
  "conversations": [
    {
      "user_id": "uuid",
      "user_name": "Juan Pérez",
      "last_message": "Gracias por la explicación",
      "unread_count": 2,
      "last_message_at": "2026-01-25T10:00:00Z"
    }
  ]
}
```

---

### 4. Obtener Contador de No Leídos

**GET** `/teacher/messages/unread-count`

#### Response
```json
{
  "unread_count": 15
}
```

---

### 5. Obtener Mensaje por ID

**GET** `/teacher/messages/:id`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del mensaje |

#### Response
```json
{
  "id": "uuid",
  "subject": "Consulta sobre tarea",
  "content": "¿Cuándo es la entrega?",
  "sender_id": "uuid",
  "sender_name": "Juan Pérez",
  "recipients": [
    {
      "id": "uuid",
      "name": "Prof. García",
      "is_read": true,
      "read_at": "2026-01-25T10:30:00Z"
    }
  ],
  "created_at": "2026-01-25T10:00:00Z"
}
```

---

### 6. Marcar Mensaje como Leído

**POST** `/teacher/messages/:id/read`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del mensaje |

#### Response
```json
{
  "message": "Mensaje marcado como leído"
}
```

---

### 7. Enviar Anuncio a Classroom

**POST** `/teacher/messages/classroom/:classroomId/announcement`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| classroomId | UUID | ID del classroom |

#### Request Body
```json
{
  "subject": "Anuncio Importante",
  "content": "Recordatorio: El examen es el próximo viernes"
}
```

#### Response
```json
{
  "id": "uuid",
  "subject": "Anuncio Importante",
  "content": "Recordatorio: El examen es el próximo viernes",
  "recipient_count": 30,
  "created_at": "2026-01-25T10:00:00Z"
}
```

#### Errores
- **400:** No hay estudiantes en el classroom
- **403:** Teacher no tiene acceso al classroom

---

### 8. Enviar Feedback Privado a Estudiante

**POST** `/teacher/messages/student/:studentId/feedback`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| studentId | UUID | ID del estudiante |

#### Request Body
```json
{
  "subject": "Feedback sobre tu progreso",
  "content": "Muy buen trabajo en el último ejercicio",
  "assignment_id": "uuid",
  "submission_id": "uuid"
}
```

#### Response
```json
{
  "id": "uuid",
  "subject": "Feedback sobre tu progreso",
  "content": "Muy buen trabajo en el último ejercicio",
  "created_at": "2026-01-25T10:00:00Z"
}
```

---

## TeacherContentController - Contenido Educativo

**Ruta Base:** `/api/v1/teacher/content`

### 1. Listar Contenido del Teacher

**GET** `/teacher/content`

#### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| page | number | No | Número de página (default: 1) |
| limit | number | No | Items por página (default: 10) |
| search | string | No | Búsqueda por título |
| content_type | TeacherContentType | No | Filtrar por tipo |
| status | TeacherContentStatus | No | Filtrar por estado |
| visibility | TeacherContentVisibility | No | Filtrar por visibilidad |
| subject_area | string | No | Filtrar por materia |
| grade_level | string | No | Filtrar por nivel escolar |
| difficulty_level | TeacherContentDifficulty | No | Filtrar por dificultad |
| is_template | boolean | No | Filtrar templates |
| is_active | boolean | No | Filtrar activos |

#### Response
```json
{
  "content": [
    {
      "id": "uuid",
      "title": "Ejercicio de Fracciones",
      "content_type": "exercise",
      "status": "published",
      "visibility": "classroom",
      "subject_area": "Matemáticas",
      "grade_level": "5",
      "difficulty_level": "intermediate",
      "created_at": "2026-01-25T10:00:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

---

### 2. Crear Contenido Educativo

**POST** `/teacher/content`

#### Request Body
```json
{
  "title": "Ejercicio de Fracciones",
  "description": "Práctica de suma de fracciones",
  "content_type": "exercise",
  "content_data": {},
  "subject_area": "Matemáticas",
  "grade_level": "5",
  "difficulty_level": "intermediate",
  "visibility": "classroom",
  "status": "draft"
}
```

#### Response
```json
{
  "id": "uuid",
  "title": "Ejercicio de Fracciones",
  "content_type": "exercise",
  "status": "draft",
  "created_at": "2026-01-25T10:00:00Z"
}
```

#### Errores
- **400:** Datos inválidos o tenant_id faltante

---

### 3. Obtener Contenido por ID

**GET** `/teacher/content/:id`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del contenido |

#### Response
```json
{
  "id": "uuid",
  "title": "Ejercicio de Fracciones",
  "description": "Práctica de suma de fracciones",
  "content_type": "exercise",
  "content_data": {},
  "status": "published",
  "visibility": "classroom",
  "subject_area": "Matemáticas",
  "grade_level": "5",
  "difficulty_level": "intermediate",
  "created_at": "2026-01-25T10:00:00Z",
  "updated_at": "2026-01-25T10:00:00Z"
}
```

#### Errores
- **404:** Contenido no encontrado
- **403:** Teacher no es el owner del contenido

---

### 4. Actualizar Contenido

**PUT** `/teacher/content/:id`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del contenido |

#### Request Body
```json
{
  "title": "Ejercicio de Fracciones - Actualizado",
  "description": "Nueva descripción",
  "status": "published"
}
```

#### Response
```json
{
  "id": "uuid",
  "title": "Ejercicio de Fracciones - Actualizado",
  "description": "Nueva descripción",
  "status": "published",
  "updated_at": "2026-01-25T11:00:00Z"
}
```

#### Errores
- **404:** Contenido no encontrado
- **403:** Teacher no es el owner del contenido

---

### 5. Eliminar Contenido (Soft Delete)

**DELETE** `/teacher/content/:id`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del contenido |

#### Response
```json
{
  "success": true,
  "message": "Content \"Ejercicio de Fracciones\" has been deleted successfully"
}
```

#### Errores
- **404:** Contenido no encontrado
- **403:** Teacher no es el owner del contenido

---

### 6. Clonar Contenido

**POST** `/teacher/content/:id/clone`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del contenido a clonar |

#### Request Body
```json
{
  "new_title": "Ejercicio de Fracciones - Copia",
  "new_visibility": "private"
}
```

#### Response
```json
{
  "id": "uuid-new",
  "title": "Ejercicio de Fracciones - Copia",
  "status": "draft",
  "visibility": "private",
  "created_at": "2026-01-25T10:00:00Z"
}
```

#### Errores
- **404:** Contenido no encontrado
- **403:** Teacher no es el owner del contenido

---

### 7. Publicar Contenido

**PATCH** `/teacher/content/:id/publish`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del contenido |

#### Response
```json
{
  "id": "uuid",
  "status": "published",
  "published_at": "2026-01-25T10:00:00Z"
}
```

#### Errores
- **404:** Contenido no encontrado
- **403:** Teacher no es el owner del contenido
- **400:** Contenido ya está publicado

---

## InterventionAlertsController - Alertas

**Ruta Base:** `/api/v1/teacher/alerts`

### 1. Listar Alertas con Filtros

**GET** `/teacher/alerts`

#### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| classroom_id | UUID | No | Filtrar por classroom |
| alert_type | AlertType | No | Filtrar por tipo |
| severity | AlertSeverity | No | Filtrar por severidad |
| status | AlertStatus | No | Filtrar por estado |
| search | string | No | Búsqueda por nombre estudiante |
| include_dismissed | boolean | No | Incluir descartadas (default: false) |
| limit | number | No | Items por página |
| offset | number | No | Offset de paginación |

#### Response
```json
{
  "alerts": [
    {
      "id": "uuid",
      "student_id": "uuid",
      "student_name": "Juan Pérez",
      "classroom_id": "uuid",
      "classroom_name": "5A",
      "alert_type": "low_score",
      "severity": "high",
      "status": "active",
      "message": "Bajo rendimiento en últimos 3 ejercicios",
      "created_at": "2026-01-25T10:00:00Z"
    }
  ],
  "total": 15,
  "limit": 20,
  "offset": 0
}
```

---

### 2. Obtener Alerta por ID

**GET** `/teacher/alerts/:id`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID de la alerta |

#### Response
```json
{
  "id": "uuid",
  "student_id": "uuid",
  "student_name": "Juan Pérez",
  "classroom_id": "uuid",
  "classroom_name": "5A",
  "alert_type": "low_score",
  "severity": "high",
  "status": "active",
  "message": "Bajo rendimiento en últimos 3 ejercicios",
  "metrics": {
    "avg_score": 45.5,
    "exercises_failed": 3
  },
  "created_at": "2026-01-25T10:00:00Z",
  "acknowledged_at": null,
  "acknowledged_by": null,
  "resolved_at": null,
  "resolved_by": null
}
```

#### Errores
- **404:** Alerta no encontrada
- **403:** Teacher no tiene acceso a esta alerta

---

### 3. Reconocer Alerta

**PATCH** `/teacher/alerts/:id/acknowledge`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID de la alerta |

#### Response
```json
{
  "id": "uuid",
  "status": "acknowledged",
  "acknowledged_at": "2026-01-25T10:00:00Z",
  "acknowledged_by": "uuid"
}
```

#### Errores
- **400:** Solo se pueden acknowledge alertas activas
- **404:** Alerta no encontrada
- **403:** Teacher no tiene acceso a esta alerta

---

### 4. Resolver Alerta

**PATCH** `/teacher/alerts/:id/resolve`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID de la alerta |

#### Request Body
```json
{
  "resolution_notes": "Contacté al estudiante y su representante. Se agendó tutoría adicional."
}
```

#### Response
```json
{
  "id": "uuid",
  "status": "resolved",
  "resolution_notes": "Contacté al estudiante y su representante. Se agendó tutoría adicional.",
  "resolved_at": "2026-01-25T10:00:00Z",
  "resolved_by": "uuid"
}
```

#### Errores
- **400:** Alerta ya está resuelta
- **404:** Alerta no encontrada
- **403:** Teacher no tiene acceso a esta alerta

---

### 5. Descartar Alerta

**PATCH** `/teacher/alerts/:id/dismiss`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID de la alerta |

#### Response
```json
{
  "id": "uuid",
  "status": "dismissed",
  "dismissed_at": "2026-01-25T10:00:00Z"
}
```

---

### 6. Obtener Historial de Alertas de Estudiante

**GET** `/teacher/alerts/student/:studentId/history`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| studentId | UUID | ID del estudiante |

#### Response
```json
{
  "alerts": [
    {
      "id": "uuid",
      "alert_type": "low_score",
      "severity": "high",
      "status": "resolved",
      "message": "Bajo rendimiento",
      "created_at": "2026-01-20T10:00:00Z",
      "resolved_at": "2026-01-22T10:00:00Z"
    }
  ]
}
```

---

### 7. Generar Alertas Manualmente (Testing)

**POST** `/teacher/alerts/generate`

#### Response
```json
{
  "success": true,
  "message": "Alerts generated successfully",
  "alerts_created": 5
}
```

---

## ManualReviewController - Revisión Manual

**Ruta Base:** `/api/v1/teacher/reviews`

### 1. Obtener Configuración de Ejercicios con Revisión Manual

**GET** `/teacher/reviews/config/exercises`

#### Response
```json
{
  "modules": [
    {
      "id": "uuid",
      "name": "Módulo 4",
      "number": 4
    }
  ],
  "exercises": [
    {
      "id": "uuid",
      "title": "Ejercicio Creativo 1",
      "exerciseType": "creative",
      "moduleId": "uuid",
      "moduleName": "Módulo 4",
      "moduleNumber": 4
    }
  ]
}
```

---

### 2. Obtener Reviews Pendientes (Paginado)

**GET** `/teacher/reviews/pending`

#### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| moduleId | UUID | No | Filtrar por módulo |
| classroomId | UUID | No | Filtrar por aula |
| page | number | No | Número de página (default: 1) |
| limit | number | No | Items por página (default: 20, max: 100) |

#### Response
```json
{
  "reviews": [
    {
      "id": "uuid",
      "submission_id": "uuid",
      "student_id": "uuid",
      "student_name": "Juan Pérez",
      "exercise_id": "uuid",
      "exercise_title": "Ejercicio Creativo 1",
      "module_name": "Módulo 4",
      "status": "pending",
      "priority": "high",
      "submitted_at": "2026-01-25T10:00:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

---

### 3. Obtener Reviews Pendientes por Módulo

**GET** `/teacher/reviews/pending/module/:moduleOrder`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| moduleOrder | number | Número de orden del módulo (4 o 5) |

#### Response
```json
{
  "submissions": [
    {
      "id": "uuid",
      "student_name": "Juan Pérez",
      "exercise_title": "Ejercicio Creativo 1",
      "submitted_at": "2026-01-25T10:00:00Z"
    }
  ]
}
```

---

### 4. Obtener Estadísticas de Reviews Pendientes

**GET** `/teacher/reviews/stats`

#### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| classroomId | UUID | No | Filtrar por aula |

#### Response
```json
{
  "totalPending": 45,
  "urgentCount": 5,
  "highCount": 15,
  "mediumCount": 20,
  "normalCount": 5
}
```

---

### 5. Obtener Todos los Reviews del Docente

**GET** `/teacher/reviews/my-reviews`

#### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| status | ReviewStatus | No | Filtrar por estado |

#### Response
```json
{
  "reviews": [
    {
      "id": "uuid",
      "submission_id": "uuid",
      "student_name": "Juan Pérez",
      "exercise_title": "Ejercicio Creativo 1",
      "status": "completed",
      "score": 85,
      "reviewed_at": "2026-01-25T10:00:00Z"
    }
  ]
}
```

---

### 6. Obtener Review por ID

**GET** `/teacher/reviews/:id`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del review |

#### Response
```json
{
  "id": "uuid",
  "submission_id": "uuid",
  "student_id": "uuid",
  "student_name": "Juan Pérez",
  "exercise_id": "uuid",
  "exercise_title": "Ejercicio Creativo 1",
  "status": "in_progress",
  "score": null,
  "feedback": null,
  "rubric_scores": {},
  "created_at": "2026-01-25T10:00:00Z"
}
```

---

### 7. Crear Review

**POST** `/teacher/reviews`

#### Request Body
```json
{
  "submission_id": "uuid",
  "rubric_scores": {
    "creativity": 8,
    "clarity": 7,
    "correctness": 9
  },
  "feedback": "Excelente trabajo creativo",
  "score": 85
}
```

#### Response
```json
{
  "id": "uuid",
  "submission_id": "uuid",
  "status": "pending",
  "created_at": "2026-01-25T10:00:00Z"
}
```

#### Errores
- **400:** Datos inválidos o review duplicado
- **404:** Submission no encontrado

---

### 8. Actualizar Review

**PUT** `/teacher/reviews/:id`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del review |

#### Request Body
```json
{
  "rubric_scores": {
    "creativity": 9,
    "clarity": 8,
    "correctness": 9
  },
  "feedback": "Excelente trabajo creativo - actualizado",
  "score": 90
}
```

#### Response
```json
{
  "id": "uuid",
  "score": 90,
  "feedback": "Excelente trabajo creativo - actualizado",
  "updated_at": "2026-01-25T11:00:00Z"
}
```

---

### 9. Iniciar Review

**POST** `/teacher/reviews/:id/start`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del review |

#### Response
```json
{
  "id": "uuid",
  "status": "in_progress",
  "started_at": "2026-01-25T10:00:00Z"
}
```

---

### 10. Completar Review

**POST** `/teacher/reviews/:id/complete`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del review |

#### Response
```json
{
  "review": {
    "id": "uuid",
    "status": "completed",
    "score": 85,
    "completed_at": "2026-01-25T10:00:00Z"
  },
  "rewards": {
    "xp_earned": 85,
    "ml_coins_earned": 17,
    "rankUp": {
      "newRank": "Nacom",
      "previousRank": "Ajaw",
      "bonusMLCoins": 100,
      "newMultiplier": 1.1
    }
  }
}
```

---

### 11. Devolver para Revisión

**POST** `/teacher/reviews/:id/return`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del review |

#### Request Body
```json
{
  "feedback": "Por favor revisa la pregunta 3 y reenvía"
}
```

#### Response
```json
{
  "id": "uuid",
  "status": "returned",
  "feedback": "Por favor revisa la pregunta 3 y reenvía",
  "returned_at": "2026-01-25T10:00:00Z"
}
```

---

## ExerciseResponsesController - Respuestas

**Ruta Base:** `/api/v1/teacher`

### 1. Obtener Attempts con Filtros

**GET** `/teacher/attempts`

#### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| student_id | UUID | No | Filtrar por estudiante |
| exercise_id | UUID | No | Filtrar por ejercicio |
| module_id | UUID | No | Filtrar por módulo |
| classroom_id | UUID | No | Filtrar por classroom |
| is_correct | boolean | No | Filtrar por correctitud |
| start_date | string | No | Fecha inicio (ISO 8601) |
| end_date | string | No | Fecha fin (ISO 8601) |
| page | number | No | Número de página (default: 1) |
| limit | number | No | Items por página (default: 20) |

#### Response
```json
{
  "attempts": [
    {
      "id": "uuid",
      "student_id": "uuid",
      "student_name": "Juan Pérez",
      "exercise_id": "uuid",
      "exercise_title": "Ejercicio 1",
      "module_name": "Módulo 1",
      "is_correct": true,
      "score": 100,
      "submitted_at": "2026-01-25T10:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

---

### 2. Obtener Detalle de Attempt

**GET** `/teacher/attempts/:id`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID del attempt |

#### Response
```json
{
  "id": "uuid",
  "student_id": "uuid",
  "student_name": "Juan Pérez",
  "exercise_id": "uuid",
  "exercise_title": "Ejercicio 1",
  "exercise_type": "multiple_choice",
  "is_correct": true,
  "score": 100,
  "max_score": 100,
  "submitted_answers": {},
  "correct_answers": {},
  "time_spent_seconds": 120,
  "hint_used": false,
  "submitted_at": "2026-01-25T10:00:00Z"
}
```

#### Errores
- **404:** Attempt no encontrado
- **403:** Teacher no tiene acceso al attempt

---

### 3. Obtener Attempts de Estudiante

**GET** `/teacher/attempts/student/:studentId`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| studentId | UUID | ID del estudiante |

#### Response
```json
{
  "attempts": [
    {
      "id": "uuid",
      "exercise_title": "Ejercicio 1",
      "is_correct": true,
      "score": 100,
      "submitted_at": "2026-01-25T10:00:00Z"
    }
  ]
}
```

#### Errores
- **403:** Teacher no tiene acceso al estudiante
- **404:** Estudiante no encontrado

---

### 4. Obtener Respuestas de Ejercicio

**GET** `/teacher/exercises/:exerciseId/responses`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| exerciseId | UUID | ID del ejercicio |

#### Response
```json
{
  "attempts": [
    {
      "id": "uuid",
      "student_name": "Juan Pérez",
      "is_correct": true,
      "score": 100,
      "submitted_at": "2026-01-25T10:00:00Z"
    }
  ],
  "total": 30
}
```

---

## TeacherGradesController - Calificaciones

**Ruta Base:** `/api/v1/teacher/grades`

### 1. Obtener Todas las Calificaciones

**GET** `/teacher/grades`

#### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| assignment_id | UUID | No | Filtrar por assignment |
| classroom_id | UUID | No | Filtrar por classroom |
| student_id | UUID | No | Filtrar por estudiante |
| status | SubmissionStatus | No | Filtrar por estado |
| sort_by | 'date' \| 'score' \| 'student' | No | Ordenar por |
| page | number | No | Número de página (default: 1) |
| limit | number | No | Items por página (default: 20) |

#### Response
```json
{
  "grades": [
    {
      "id": "uuid",
      "student_id": "uuid",
      "student_name": "Juan Pérez",
      "exercise_id": "uuid",
      "exercise_title": "Ejercicio 1",
      "assignment_id": "uuid",
      "assignment_title": "Tarea 1",
      "score": 85,
      "max_score": 100,
      "feedback": "Buen trabajo",
      "status": "graded",
      "submitted_at": "2026-01-25T10:00:00Z",
      "graded_at": "2026-01-25T11:00:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20
}
```

---

### 2. Obtener Detalle de Calificación

**GET** `/teacher/grades/:id`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | UUID | ID de la calificación (submission ID) |

#### Response
```json
{
  "id": "uuid",
  "student_id": "uuid",
  "student_name": "Juan Pérez",
  "student_email": "juan@example.com",
  "exercise_id": "uuid",
  "exercise_title": "Ejercicio 1",
  "exercise_type": "multiple_choice",
  "assignment_id": "uuid",
  "assignment_title": "Tarea 1",
  "score": 85,
  "max_score": 100,
  "feedback": "Buen trabajo",
  "status": "graded",
  "answer_data": {},
  "is_correct": true,
  "time_spent_seconds": 120,
  "attempt_number": 1,
  "hint_used": false,
  "hints_count": 0,
  "comodines_used": [],
  "ml_coins_spent": 0,
  "submitted_at": "2026-01-25T10:00:00Z",
  "graded_at": "2026-01-25T11:00:00Z",
  "graded_by": "uuid",
  "created_at": "2026-01-25T10:00:00Z",
  "updated_at": "2026-01-25T11:00:00Z"
}
```

#### Errores
- **404:** Calificación no encontrada

---

## Notas Finales

### Autenticación y Seguridad

- Todos los endpoints requieren JWT válido en header `Authorization: Bearer <token>`
- Los endpoints validan que el usuario tenga rol `ADMIN_TEACHER` o `SUPER_ADMIN`
- RLS (Row Level Security) se aplica en la base de datos para asegurar que los teachers solo accedan a datos de sus propios classrooms

### Paginación

Los endpoints que retornan listas soportan paginación con:
- `page`: Número de página (default: 1)
- `limit`: Items por página (default varía por endpoint, típicamente 10-20, max: 100)

### Fechas

Todas las fechas se retornan en formato ISO 8601 (UTC):
```
2026-01-25T10:30:00Z
```

### UUIDs

Todos los IDs son UUIDs v4:
```
550e8400-e29b-41d4-a716-446655440000
```

### Validaciones Comunes

- **UUIDs:** Validados con formato UUID v4
- **Strings:** Longitud mínima/máxima según campo
- **Numbers:** Rangos validados (ej. score: 0-100)
- **Enums:** Validados contra valores permitidos
- **Required fields:** Validados en todos los POSTs

---

**Fin del documento API Contracts - Portal Teacher**
