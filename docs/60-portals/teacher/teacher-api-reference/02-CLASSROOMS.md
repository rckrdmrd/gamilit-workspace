---
titulo: Portal Teacher - Classrooms APIs
tipo: portal
portal: teacher
seccion: api-reference
archivo: 02-CLASSROOMS
ultima_actualizacion: 2026-02-27
---

# Portal Teacher - Classrooms APIs

**Version:** 1.3.0
**Parte de:** [Portal Teacher - API Reference](../PORTAL-TEACHER-API-REFERENCE.md)

---

## 3. Classrooms APIs

> **Nota DB-125:** En todos los endpoints de este módulo, el `teacherId` extraído del JWT (`req.user.id`) corresponde a `auth_management.profiles.id`, NO a `auth.users.id`. Los servicios backend usan este valor directamente como FK en `social_features.classrooms.teacher_id` y `social_features.teacher_classrooms.teacher_id`.

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
