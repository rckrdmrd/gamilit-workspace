---
titulo: Portal Teacher - Communication APIs
tipo: portal
portal: teacher
seccion: api-reference
archivo: 04-COMMUNICATION
ultima_actualizacion: 2026-02-27
---

# Portal Teacher - Communication APIs

**Version:** 1.3.0
**Parte de:** [Portal Teacher - API Reference](../PORTAL-TEACHER-API-REFERENCE.md)

Cubre: Intervention Alerts, Bonus Coins, y Resource Sharing.

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
