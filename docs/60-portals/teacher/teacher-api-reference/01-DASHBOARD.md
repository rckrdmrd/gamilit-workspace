---
titulo: Portal Teacher - Dashboard APIs
tipo: portal
portal: teacher
seccion: api-reference
archivo: 01-DASHBOARD
ultima_actualizacion: 2026-02-27
---

# Portal Teacher - Dashboard APIs

**Version:** 1.3.0
**Parte de:** [Portal Teacher - API Reference](../PORTAL-TEACHER-API-REFERENCE.md)

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
