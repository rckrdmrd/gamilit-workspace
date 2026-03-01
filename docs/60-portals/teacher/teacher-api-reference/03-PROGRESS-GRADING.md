---
titulo: Portal Teacher - Student Progress & Grading APIs
tipo: portal
portal: teacher
seccion: api-reference
archivo: 03-PROGRESS-GRADING
ultima_actualizacion: 2026-02-27
---

# Portal Teacher - Student Progress & Grading APIs

**Version:** 1.3.0
**Parte de:** [Portal Teacher - API Reference](../PORTAL-TEACHER-API-REFERENCE.md)

---

## 4. Student Progress APIs

> **Nota DB-125:** Todos los parámetros `:studentId` en rutas aceptan `profiles.id`. El `req.user.id` del teacher autenticado también es `profiles.id`.

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
