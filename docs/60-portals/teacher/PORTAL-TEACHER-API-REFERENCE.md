---
titulo: Portal Teacher - API Reference
tipo: portal
portal: teacher
ultima_actualizacion: 2026-02-27
---

# Portal Teacher - API Reference

**Fecha de creacion:** 2025-11-29
**Version:** 1.3.0
**Estado:** VIGENTE
**Complementa:** PORTAL-TEACHER-GUIDE.md

---

## 1. Resumen de Endpoints

El Portal Teacher expone **63+ endpoints** organizados en 10 controladores backend. El frontend conecta con 8 de ellos (los controladores de Communication y Content fueron desconectados del frontend en v3.1.0):

| Controller | Base Path | Endpoints | Descripcion | Frontend |
|------------|-----------|-----------|-------------|----------|
| TeacherController | `/teacher` | 20 | Dashboard, progress, analytics, grading | Si |
| TeacherClassroomsController | `/teacher/classrooms` | 12 | CRUD de aulas, estudiantes | Si |
| TeacherAssignmentsController | `/teacher/assignments` | * | Gestion de asignaciones | Si |
| InterventionAlertsController | `/teacher/alerts` | 5 | Alertas de intervencion | Si |
| AlertConfigController | `/teacher/alert-config` | * | Configuracion de umbrales de alertas | Si |
| ManualReviewController | `/teacher/reviews` | * | Revision manual de ejercicios | Si |
| TeacherCommunicationController | `/teacher/messages` | 6 | Mensajes y comunicacion | No (removed v3.1.0) |
| TeacherContentController | `/teacher/content` | 13 | Contenido personalizado + resource sharing | Parcial (solo resource sharing) |
| ExerciseResponsesController | `/teacher/exercise-responses` | 4 | Respuestas de ejercicios | Si |
| TeacherGradesController | `/teacher/grades` | 3 | Calificaciones | Si |

> **Nota:** Los controladores marcados con `*` requieren conteo detallado de endpoints. La cifra "63+" refleja los 7 controladores documentados; el total real incluye los 3 controladores agregados. Los controladores de Communication y Content siguen existiendo en el backend pero sus paginas/hooks/APIs frontend fueron eliminados en v3.1.0. Los endpoints de Resource Sharing (seccion 10) siguen conectados via `resourceSharingApi.ts`.

---

## 2. Dashboard APIs

### 2.1 GET /teacher/dashboard/stats

Obtiene estadisticas generales del dashboard del teacher.

**Request:**
```http
GET /api/teacher/dashboard/stats
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "total_classrooms": 5,
  "total_students": 127,
  "active_students": 98,
  "pending_submissions": 23,
  "average_completion": 72.5,
  "average_score": 85.3,
  "alerts_count": 4,
  "recent_activity_count": 15
}
```

**Frontend Hook:**
```typescript
// hooks/useTeacherDashboard.ts
export function useTeacherDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['teacher', 'dashboard', 'stats'],
    queryFn: () => teacherApi.getDashboardStats(),
    staleTime: 60_000, // 1 minuto
  });

  return { stats };
}
```

### 2.2 GET /teacher/dashboard/activities

Obtiene actividades recientes.

**Request:**
```http
GET /api/teacher/dashboard/activities?limit=10
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "activities": [
    {
      "id": "uuid",
      "type": "submission",
      "student_id": "uuid",
      "student_name": "Juan Perez",
      "action": "submitted_exercise",
      "exercise_name": "Timeline - Marie Curie",
      "classroom_name": "5to A - Matematicas",
      "timestamp": "2025-11-29T10:30:00Z"
    }
  ]
}
```

### 2.3 GET /teacher/dashboard/alerts

Obtiene alertas de estudiantes en riesgo.

**Response (200):**
```json
{
  "alerts": [
    {
      "id": "uuid",
      "student_id": "uuid",
      "student_name": "Maria Garcia",
      "type": "declining_trend",
      "severity": "high",
      "message": "Desempeno en declive en ultimas 2 semanas",
      "classroom_name": "5to A",
      "created_at": "2025-11-28T15:00:00Z"
    }
  ]
}
```

### 2.4 GET /teacher/dashboard/top-performers

Obtiene top estudiantes por desempeno.

**Request:**
```http
GET /api/teacher/dashboard/top-performers?limit=5
```

**Response (200):**
```json
{
  "students": [
    {
      "id": "uuid",
      "name": "Ana Lopez",
      "avatar_url": "https://...",
      "classroom_name": "5to A",
      "total_xp": 15000,
      "maya_rank": "Arquitecto Maya",
      "completion_rate": 95.5,
      "average_score": 92.3
    }
  ]
}
```

---

## 3. Classrooms APIs

### 3.1 GET /teacher/classrooms

Lista todas las aulas del teacher.

**Request:**
```http
GET /api/teacher/classrooms?page=1&limit=10&status=active&search=matematicas
```

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| page | number | No | Pagina (default: 1) |
| limit | number | No | Items por pagina (default: 10) |
| search | string | No | Buscar por nombre |
| status | string | No | active, inactive, archived, all |
| grade_level | string | No | Filtrar por nivel |
| subject | string | No | Filtrar por materia |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "5to A - Matematicas",
      "code": "5A-MAT-2025",
      "grade_level": "5to",
      "subject": "Matematicas",
      "student_count": 28,
      "active_students": 25,
      "average_progress": 72.5,
      "status": "active",
      "is_owner": true,
      "created_at": "2025-01-15T10:00:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10,
  "total_pages": 1
}
```

**Frontend Hook:**
```typescript
// hooks/useClassrooms.ts
export function useClassrooms(filters?: GetClassroomsQueryDto) {
  const query = useQuery({
    queryKey: ['teacher', 'classrooms', filters],
    queryFn: () => classroomsApi.getAll(filters),
  });

  const createMutation = useMutation({
    mutationFn: classroomsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'classrooms'] });
    },
  });

  return {
    classrooms: query.data?.data ?? [],
    isLoading: query.isLoading,
    createClassroom: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}
```

### 3.2 POST /teacher/classrooms

Crea una nueva aula.

**Request:**
```http
POST /api/teacher/classrooms
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "6to B - Ciencias",
  "grade_level": "6to",
  "subject": "Ciencias",
  "description": "Clase de ciencias naturales",
  "max_students": 35,
  "settings": {
    "allow_late_submissions": true,
    "auto_grade_enabled": false
  }
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "6to B - Ciencias",
  "code": "6B-CIE-2025-ABC123",
  "grade_level": "6to",
  "subject": "Ciencias",
  "student_count": 0,
  "status": "active",
  "is_owner": true,
  "created_at": "2025-11-29T10:00:00Z"
}
```

### 3.3 GET /teacher/classrooms/:id/students

Obtiene estudiantes de un aula.

**Request:**
```http
GET /api/teacher/classrooms/uuid/students?page=1&limit=20&sort_by=progress&sort_order=desc
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Juan Perez",
      "email": "juan@example.com",
      "avatar_url": "https://...",
      "status": "active",
      "enrolled_at": "2025-02-01T10:00:00Z",
      "progress": {
        "completion_percentage": 75.5,
        "average_score": 85.3,
        "total_xp": 12500,
        "maya_rank": "Constructor Maya",
        "exercises_completed": 45,
        "exercises_total": 60
      },
      "last_activity": "2025-11-28T15:30:00Z",
      "is_blocked": false
    }
  ],
  "total": 28,
  "page": 1,
  "limit": 20,
  "total_pages": 2
}
```

### 3.4 GET /teacher/classrooms/:id/progress

Obtiene progreso detallado del aula por modulo.

**Response (200):**
```json
{
  "classroomData": {
    "id": "uuid",
    "name": "5to A - Matematicas",
    "student_count": 28,
    "active_students": 25,
    "average_completion": 72.5,
    "average_score": 85.3,
    "total_exercises": 60,
    "completed_exercises": 45
  },
  "moduleProgress": [
    {
      "module_id": "uuid",
      "module_name": "Modulo 1: Marie Curie - Primera Exploracion",
      "module_order": 1,
      "completion_percentage": 85.5,
      "average_score": 88.3,
      "students_completed": 22,
      "students_in_progress": 4,
      "students_not_started": 2,
      "average_time_minutes": 120.5,
      "exercises": [
        {
          "exercise_id": "uuid",
          "exercise_name": "Timeline - Vida de Marie Curie",
          "mechanic_type": "timeline",
          "completion_rate": 92.0,
          "average_score": 87.5,
          "average_attempts": 1.3
        }
      ]
    }
  ]
}
```

---

## 4. Student Progress APIs

### 4.1 GET /teacher/students/:studentId/progress

Obtiene progreso completo de un estudiante.

**Request:**
```http
GET /api/teacher/students/uuid/progress?include_exercises=true&date_from=2025-01-01
```

**Response (200):**
```json
{
  "student": {
    "id": "uuid",
    "name": "Juan Perez",
    "email": "juan@example.com"
  },
  "summary": {
    "total_xp": 15000,
    "ml_coins_balance": 2500,
    "maya_rank": "Arquitecto Maya",
    "level": 12,
    "completion_percentage": 78.5,
    "average_score": 86.2,
    "total_time_minutes": 1250,
    "streak_days": 15
  },
  "modules": [
    {
      "module_id": "uuid",
      "module_name": "Modulo 1",
      "status": "completed",
      "completion_percentage": 100,
      "average_score": 92.5,
      "time_spent_minutes": 180,
      "completed_at": "2025-11-15T10:00:00Z"
    }
  ],
  "achievements": [
    {
      "id": "uuid",
      "name": "Primera Victoria",
      "description": "Completar primer ejercicio",
      "icon_url": "https://...",
      "unlocked_at": "2025-02-01T15:00:00Z"
    }
  ],
  "activity_timeline": [
    {
      "date": "2025-11-28",
      "exercises_completed": 3,
      "xp_earned": 450,
      "time_spent_minutes": 45
    }
  ]
}
```

### 4.2 GET /teacher/students/:studentId/insights

Obtiene insights AI del estudiante.

**Response (200):**
```json
{
  "student_id": "uuid",
  "generated_at": "2025-11-29T10:00:00Z",
  "risk_level": "low",
  "strengths": [
    "Excelente en ejercicios de comprension literal",
    "Alta consistencia en entregas",
    "Buen manejo del tiempo"
  ],
  "weaknesses": [
    "Dificultad en inferencias complejas",
    "Tendencia a respuestas apresuradas en critica"
  ],
  "predictions": {
    "completion_probability": 0.92,
    "estimated_completion_date": "2025-12-15",
    "risk_of_dropout": 0.05
  },
  "recommendations": [
    {
      "type": "exercise",
      "priority": "high",
      "message": "Recomendar mas ejercicios de inferencia",
      "suggested_exercises": ["uuid1", "uuid2"]
    },
    {
      "type": "intervention",
      "priority": "medium",
      "message": "Programar sesion de retroalimentacion"
    }
  ]
}
```

### 4.3 POST /teacher/students/:studentId/note

Agrega nota de teacher sobre estudiante.

**Request:**
```http
POST /api/teacher/students/uuid/note
Content-Type: application/json

{
  "classroom_id": "uuid",
  "content": "Estudiante muestra mejora notable en ultimas semanas",
  "is_private": true,
  "tags": ["mejora", "seguimiento"]
}
```

---

## 5. Grading APIs

### 5.1 GET /teacher/submissions

Obtiene submissions pendientes de calificar.

**Request:**
```http
GET /api/teacher/submissions?status=pending&classroom_id=uuid&page=1&limit=20
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| status | string | pending, graded, all |
| classroom_id | string | Filtrar por aula |
| assignment_id | string | Filtrar por tarea |
| student_id | string | Filtrar por estudiante |
| module_id | string | Filtrar por modulo |
| date_from | string | Fecha desde (ISO) |
| date_to | string | Fecha hasta (ISO) |
| sort_by | string | submitted_at, score, student_name |
| sort_order | string | asc, desc |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "student": {
        "id": "uuid",
        "name": "Juan Perez",
        "avatar_url": "https://..."
      },
      "exercise": {
        "id": "uuid",
        "name": "Timeline - Marie Curie",
        "mechanic_type": "timeline"
      },
      "classroom": {
        "id": "uuid",
        "name": "5to A"
      },
      "submitted_at": "2025-11-28T15:30:00Z",
      "auto_score": 85.5,
      "final_score": null,
      "status": "pending",
      "attempt_number": 1,
      "time_spent_seconds": 320,
      "answers": { /* respuestas del estudiante */ }
    }
  ],
  "total": 23,
  "page": 1,
  "limit": 20
}
```

### 5.2 POST /teacher/submissions/:id/feedback

Califica y proporciona feedback.

**Request:**
```http
POST /api/teacher/submissions/uuid/feedback
Content-Type: application/json

{
  "score": 90,
  "feedback": "Excelente trabajo en la organizacion cronologica",
  "strengths": ["Precision en fechas", "Conexiones logicas"],
  "areas_to_improve": ["Agregar mas contexto historico"],
  "xp_bonus": 50,
  "requires_revision": false
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "graded",
  "final_score": 90,
  "feedback": "Excelente trabajo...",
  "graded_at": "2025-11-29T10:30:00Z",
  "graded_by": "uuid",
  "xp_awarded": 150
}
```

### 5.3 POST /teacher/submissions/bulk-grade

Califica multiples submissions.

**Request:**
```http
POST /api/teacher/submissions/bulk-grade
Content-Type: application/json

{
  "submissions": [
    { "id": "uuid1", "score": 85, "feedback": "Buen trabajo" },
    { "id": "uuid2", "score": 92, "feedback": "Excelente" },
    { "id": "uuid3", "score": 78, "feedback": "Puede mejorar" }
  ],
  "apply_auto_xp": true
}
```

**Response (200):**
```json
{
  "processed": 3,
  "successful": 3,
  "failed": 0,
  "results": [
    { "id": "uuid1", "status": "success" },
    { "id": "uuid2", "status": "success" },
    { "id": "uuid3", "status": "success" }
  ]
}
```

---

## 6. Analytics APIs

### 6.1 GET /teacher/analytics/classroom/:id

Analiticas detalladas de un aula.

**Response (200):**
```json
{
  "classroom_id": "uuid",
  "period": {
    "from": "2025-01-01",
    "to": "2025-11-29"
  },
  "overview": {
    "total_students": 28,
    "active_students": 25,
    "average_completion": 72.5,
    "average_score": 85.3,
    "total_submissions": 1250,
    "total_time_hours": 450
  },
  "performance_distribution": {
    "excellent": 8,    // 90-100
    "good": 12,        // 80-89
    "average": 5,      // 70-79
    "below_average": 2, // 60-69
    "struggling": 1    // <60
  },
  "completion_trend": [
    { "week": "2025-W45", "completion_rate": 68.5 },
    { "week": "2025-W46", "completion_rate": 71.2 },
    { "week": "2025-W47", "completion_rate": 72.5 }
  ],
  "engagement_metrics": {
    "average_sessions_per_week": 3.5,
    "average_session_duration_minutes": 35,
    "peak_activity_hour": 16,
    "most_active_day": "Tuesday"
  },
  "at_risk_students": [
    {
      "student_id": "uuid",
      "name": "Maria Garcia",
      "risk_level": "high",
      "reason": "No activity in 7 days"
    }
  ]
}
```

### 6.2 GET /teacher/analytics/economy

Analiticas de economia ML Coins.

**Response (200):**
```json
{
  "overview": {
    "total_circulation": 125000,
    "average_balance": 980,
    "median_balance": 850,
    "gini_coefficient": 0.32
  },
  "distribution": {
    "ranges": [
      { "range": "0-500", "count": 15, "percentage": 12.0 },
      { "range": "501-1000", "count": 45, "percentage": 36.0 },
      { "range": "1001-2000", "count": 40, "percentage": 32.0 },
      { "range": "2001-5000", "count": 20, "percentage": 16.0 },
      { "range": "5001+", "count": 5, "percentage": 4.0 }
    ]
  },
  "top_earners": [
    {
      "student_id": "uuid",
      "name": "Ana Lopez",
      "balance": 8500,
      "weekly_earnings": 450,
      "maya_rank": "Arquitecto Maya"
    }
  ],
  "spending_patterns": {
    "comodines": 35000,
    "customizations": 15000,
    "power_ups": 8000
  }
}
```

### 6.3 GET /teacher/analytics/achievements

Estadisticas de logros por aula.

**Response (200):**
```json
{
  "classroom_id": "uuid",
  "total_achievements": 45,
  "total_unlocks": 892,
  "achievements": [
    {
      "id": "uuid",
      "name": "Primera Victoria",
      "description": "Completar primer ejercicio",
      "category": "progress",
      "unlock_count": 28,
      "unlock_percentage": 100,
      "average_unlock_time_days": 2.5
    },
    {
      "id": "uuid",
      "name": "Maestro del Tiempo",
      "description": "Completar Timeline perfecto",
      "category": "mastery",
      "unlock_count": 12,
      "unlock_percentage": 42.8,
      "average_unlock_time_days": 15.3
    }
  ],
  "rarest_achievements": [
    {
      "id": "uuid",
      "name": "Leyenda Maya",
      "unlock_count": 2,
      "unlock_percentage": 7.1
    }
  ]
}
```

---

## 7. Intervention Alerts APIs

### 7.1 GET /teacher/alerts

Lista alertas de intervencion.

**Request:**
```http
GET /api/teacher/alerts?status=active&severity=high&classroom_id=uuid
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "student": {
        "id": "uuid",
        "name": "Carlos Mendez",
        "avatar_url": "https://..."
      },
      "classroom": {
        "id": "uuid",
        "name": "5to A"
      },
      "type": "declining_trend",
      "severity": "high",
      "status": "active",
      "message": "Desempeno en declive: -15% en ultimas 2 semanas",
      "details": {
        "previous_average": 85.5,
        "current_average": 70.2,
        "trend_period_days": 14
      },
      "suggested_actions": [
        "Programar reunion con estudiante",
        "Revisar ejercicios con dificultad",
        "Contactar a padres si persiste"
      ],
      "created_at": "2025-11-27T10:00:00Z"
    }
  ],
  "total": 4,
  "by_severity": {
    "critical": 1,
    "high": 2,
    "medium": 1,
    "low": 0
  }
}
```

### 7.2 PATCH /teacher/alerts/:id/resolve

Resuelve una alerta.

**Request:**
```http
PATCH /api/teacher/alerts/uuid/resolve
Content-Type: application/json

{
  "resolution_notes": "Reunion realizada, estudiante comprometido a mejorar",
  "actions_taken": ["Reunion con estudiante", "Plan de recuperacion"],
  "follow_up_date": "2025-12-05"
}
```

---

## 8. Bonus Coins APIs

### 8.1 POST /teacher/students/:studentId/bonus

Otorga bonificacion de ML Coins.

**Request:**
```http
POST /api/teacher/students/uuid/bonus
Content-Type: application/json

{
  "amount": 100,
  "reason": "Excelente participacion en clase",
  "category": "participation",
  "notify_student": true
}
```

**Response (201):**
```json
{
  "success": true,
  "transaction": {
    "id": "uuid",
    "amount": 100,
    "type": "teacher_bonus",
    "reason": "Excelente participacion en clase",
    "granted_by": "uuid",
    "granted_at": "2025-11-29T10:30:00Z"
  },
  "student_new_balance": 1850
}
```

**Frontend Hook:**
```typescript
// hooks/useGrantBonus.ts
export function useGrantBonus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, data }: { studentId: string; data: GrantBonusDto }) =>
      bonusCoinsApi.grantBonus(studentId, data),
    onSuccess: (_, { studentId }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['teacher', 'students', studentId] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'analytics', 'economy'] });
      toast.success('Bonificacion otorgada exitosamente');
    },
  });
}
```

---

## 9. Reports APIs

### 9.1 POST /teacher/reports/generate

Genera reporte PDF/Excel.

**Request:**
```http
POST /api/teacher/reports/generate
Content-Type: application/json

{
  "format": "pdf",
  "report_type": "student_insights",
  "classroom_id": "uuid",
  "student_ids": ["uuid1", "uuid2"],
  "include_sections": [
    "summary",
    "progress",
    "achievements",
    "insights",
    "recommendations"
  ],
  "date_range": {
    "from": "2025-01-01",
    "to": "2025-11-29"
  }
}
```

**Response (200):**
- Content-Type: application/pdf
- Content-Disposition: attachment; filename="student-insights-report.pdf"
- Binary PDF content

---

## 10. Resource Sharing APIs

Endpoints on `TeacherContentController` for sharing, discovering, rating, and commenting on educational resources between teachers.

### 10.1 GET /teacher/content/resources

Lista recursos compartidos con paginacion y filtros.

**Request:**
```http
GET /api/v1/teacher/content/resources?page=1&limit=20&type=WORKSHEET&difficulty=medium&search=lectura
Authorization: Bearer {token}
```

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| page | number | No | Pagina (default: 1) |
| limit | number | No | Items por pagina (default: 20) |
| type | string | No | Filtrar por tipo de contenido |
| difficulty | string | No | Filtrar por dificultad |
| search | string | No | Buscar por titulo o descripcion |
| sort_by | string | No | created_at, rating, downloads |
| sort_order | string | No | asc, desc |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Ejercicio de comprension lectora",
      "type": "WORKSHEET",
      "difficulty": "medium",
      "author": {
        "id": "uuid",
        "name": "Prof. Martinez"
      },
      "average_rating": 4.5,
      "total_ratings": 12,
      "total_downloads": 45,
      "total_comments": 8,
      "visibility": "PUBLIC",
      "created_at": "2025-11-20T10:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "total_pages": 8
}
```

### 10.2 GET /teacher/content/resources/:id

Obtiene detalle completo de un recurso compartido.

**Request:**
```http
GET /api/v1/teacher/content/resources/uuid
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Ejercicio de comprension lectora",
  "type": "WORKSHEET",
  "difficulty": "medium",
  "description": "Ejercicio enfocado en inferencias...",
  "instructions": "Leer el texto y responder...",
  "xp_reward": 100,
  "ml_coins_reward": 50,
  "estimated_duration_minutes": 30,
  "author": {
    "id": "uuid",
    "name": "Prof. Martinez",
    "avatar_url": "https://..."
  },
  "average_rating": 4.5,
  "total_ratings": 12,
  "total_downloads": 45,
  "total_comments": 8,
  "user_rating": 4,
  "visibility": "PUBLIC",
  "created_at": "2025-11-20T10:00:00Z",
  "updated_at": "2025-11-25T14:00:00Z"
}
```

### 10.3 POST /teacher/content/resources/:id/rate

Califica un recurso compartido (1-5 estrellas).

**Request:**
```http
POST /api/v1/teacher/content/resources/uuid/rate
Content-Type: application/json
Authorization: Bearer {token}

{
  "rating": 4
}
```

**Response (200):**
```json
{
  "success": true,
  "resource_id": "uuid",
  "user_rating": 4,
  "new_average_rating": 4.3,
  "total_ratings": 13
}
```

### 10.4 GET /teacher/content/resources/:id/comments

Obtiene comentarios de un recurso con paginacion.

**Request:**
```http
GET /api/v1/teacher/content/resources/uuid/comments?page=1&limit=10
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "author": {
        "id": "uuid",
        "name": "Prof. Lopez",
        "avatar_url": "https://..."
      },
      "content": "Excelente recurso, lo use en mi clase de 5to",
      "created_at": "2025-11-22T16:30:00Z"
    }
  ],
  "total": 8,
  "page": 1,
  "limit": 10,
  "total_pages": 1
}
```

### 10.5 POST /teacher/content/resources/:id/comments

Agrega un comentario a un recurso compartido.

**Request:**
```http
POST /api/v1/teacher/content/resources/uuid/comments
Content-Type: application/json
Authorization: Bearer {token}

{
  "content": "Muy util para reforzar comprension inferencial"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "resource_id": "uuid",
  "author": {
    "id": "uuid",
    "name": "Prof. Garcia"
  },
  "content": "Muy util para reforzar comprension inferencial",
  "created_at": "2025-11-29T11:00:00Z"
}
```

### 10.6 POST /teacher/content/resources/:id/download

Registra la descarga de un recurso (para tracking de metricas).

**Request:**
```http
POST /api/v1/teacher/content/resources/uuid/download
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "resource_id": "uuid",
  "total_downloads": 46,
  "download_url": "https://..."
}
```

---

## 11. Error Handling

### 11.1 Codigos de Error Comunes

| Code | Description | Resolution |
|------|-------------|------------|
| 400 | Bad Request | Validar datos de entrada |
| 401 | Unauthorized | Token invalido o expirado |
| 403 | Forbidden | Sin acceso al recurso |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | Duplicado o conflicto |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Error | Contactar soporte |

### 11.2 Formato de Error

```json
{
  "statusCode": 403,
  "message": "Teacher does not have access to this classroom",
  "error": "Forbidden",
  "timestamp": "2025-11-29T10:30:00Z",
  "path": "/api/teacher/classrooms/uuid"
}
```

### 11.3 Manejo en Frontend

```typescript
// hooks/useErrorHandler.ts
export function useApiError() {
  const handleError = useCallback((error: AxiosError) => {
    const status = error.response?.status;
    const message = (error.response?.data as any)?.message;

    switch (status) {
      case 401:
        // Redirigir a login
        window.location.href = '/login';
        break;
      case 403:
        toast.error('No tienes acceso a este recurso');
        break;
      case 404:
        toast.error('Recurso no encontrado');
        break;
      case 429:
        toast.error('Demasiadas solicitudes. Intenta de nuevo en un momento.');
        break;
      default:
        toast.error(message || 'Error inesperado');
    }
  }, []);

  return { handleError };
}
```

---

## 12. Rate Limiting

| Endpoint Category | Rate Limit | Window |
|-------------------|------------|--------|
| Dashboard | 60 req | 1 min |
| Analytics | 30 req | 1 min |
| Grading | 100 req | 1 min |
| Reports | 10 req | 1 min |
| Bonus Coins | 20 req | 1 min |

---

## 13. Websocket Events

El Portal Teacher puede suscribirse a eventos en tiempo real:

```typescript
// Suscribirse a eventos
socket.on('student:submission', (data) => {
  // Nueva submission recibida
  queryClient.invalidateQueries({ queryKey: ['teacher', 'submissions'] });
});

socket.on('student:alert', (data) => {
  // Nueva alerta de estudiante
  queryClient.invalidateQueries({ queryKey: ['teacher', 'alerts'] });
  toast.warning(`Alerta: ${data.message}`);
});

socket.on('student:progress', (data) => {
  // Estudiante completo ejercicio
  queryClient.invalidateQueries({
    queryKey: ['teacher', 'classrooms', data.classroom_id, 'progress']
  });
});
```

---

## Changelog

| Version | Fecha | Cambios |
|---------|-------|---------|
| 1.3.0 | 2026-02-21 | Added Frontend column to controller table. Marked TeacherCommunicationController and TeacherContentController as disconnected from frontend (v3.1.0 cleanup). Resource Sharing endpoints still connected via resourceSharingApi.ts |
| 1.2.0 | 2026-02-21 | Fixed TeacherContentController endpoint count (11->13, actual count from source), added 3 missing controllers (TeacherAssignments, AlertConfig, ManualReview), updated total (51->63+) |
| 1.1.0 | 2026-02-21 | Added 6 Resource Sharing endpoints (section 10), updated endpoint counts (45->51, TeacherContentController 5->11) |
| 1.0.0 | 2025-11-29 | Creacion inicial |
