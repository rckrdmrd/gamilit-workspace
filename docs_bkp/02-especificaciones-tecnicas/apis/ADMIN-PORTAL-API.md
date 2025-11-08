# Admin Portal API - Especificación OpenAPI

> **⚠️ RFC-0001 VIOLATION - MODULARIZACIÓN REQUERIDA**
>
> Este archivo tiene 2,137 líneas (5.3x el límite de 400L según RFC-0001).
>
> **PENDIENTE:** Este archivo debe ser modularizado en:
> - `admin-api/README.md` - Índice principal
> - `admin-api/01-USERS-MANAGEMENT.md` - Gestión de usuarios
> - `admin-api/02-ORGANIZATIONS.md` - Gestión de organizaciones
> - `admin-api/03-CONTENT-MODERATION.md` - Moderación de contenido
> - `admin-api/04-SYSTEM-HEALTH.md` - Salud del sistema
>
> **TODO:** Crear subdirectorio `admin-api/` y dividir este archivo (estimado: 4-6 horas).
>
> ---

**Version**: 1.0
**Base URL**: `http://localhost:3001/api/admin` (development)
**Production**: `https://api.glit.edu/api/admin`
**Authentication**: JWT Bearer Token
**Required Role**: `super_admin` (or `content_moderator` for content endpoints)

---

## Resumen Ejecutivo

### Estadísticas de Admin Portal API

| Métrica | Valor |
|---------|-------|
| **Total Endpoints** | 31 |
| **Módulos Funcionales** | 4 (Users, Organizations, Content, System) |
| **Autenticación** | JWT + Role-based access control |
| **Rate Limiting** | 30 req/min (más estricto que API general) |
| **Response Time (p95)** | < 300ms (< 500ms para health/stats) |
| **Audit Logging** | 100% de endpoints |
| **Roles Permitidos** | `super_admin`, `content_moderator` (solo contenido) |

### Middleware Stack

Todos los endpoints Admin incluyen el siguiente middleware stack:

```typescript
authenticateJWT → requireSuperAdmin → adminRateLimit → auditAdminAction → endpoint
```

**Características de seguridad:**
- Audit logging automático en todas las acciones
- Rate limiting estricto (30 req/min)
- Solo accesible para super admins
- Registro de IP, user-agent y timestamp en cada acción
- Soft delete para preservar datos de auditoría

### Formato de Respuesta

```typescript
interface AdminAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    auditId?: string; // ID del registro de auditoría
  };
}
```

---

## 1. User Management (10 endpoints)

### 1.1 GET /api/admin/users

Lista todos los usuarios del sistema con filtros avanzados.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  page?: number;          // Default: 1
  limit?: number;         // Default: 25, opciones: 10, 25, 50, 100
  role?: string;          // 'student' | 'teacher' | 'admin' | 'super_admin'
  status?: string;        // 'active' | 'inactive' | 'suspended'
  organizationId?: string; // UUID de la organización
  search?: string;        // Buscar por name o email
  sortBy?: string;        // 'createdAt' | 'name' | 'email' | 'lastLogin'
  sortOrder?: string;     // 'asc' | 'desc'
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "fullName": "John Doe",
        "role": "teacher",
        "status": "active",
        "organizationId": "uuid",
        "organizationName": "Example School",
        "createdAt": "2025-01-15T10:00:00Z",
        "lastLogin": "2025-10-27T09:30:00Z",
        "stats": {
          "totalExercises": 45,
          "mlCoins": 250,
          "classrooms": 3
        }
      }
    ],
    "pagination": {
      "total": 1250,
      "page": 1,
      "limit": 25,
      "totalPages": 50
    }
  },
  "meta": {
    "timestamp": "2025-10-28T12:00:00Z",
    "requestId": "req_123"
  }
}
```

**Ejemplo cURL:**
```bash
curl -X GET "http://localhost:3001/api/admin/users?role=teacher&status=active&page=1&limit=25" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 1.2 GET /api/admin/users/:id

Obtiene detalles completos de un usuario específico.

**Headers:**
```
Authorization: Bearer <token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "teacher@school.com",
      "fullName": "Jane Smith",
      "role": "teacher",
      "status": "active",
      "avatarUrl": "https://...",
      "createdAt": "2025-01-15T10:00:00Z",
      "lastLogin": "2025-10-27T09:30:00Z",
      "emailVerified": true,
      "suspensionReason": null,
      "profile": {
        "bio": "Math teacher with 10 years experience",
        "preferredLanguage": "en"
      }
    },
    "organizations": [
      {
        "id": "uuid",
        "name": "Example School",
        "role": "teacher",
        "joinedAt": "2025-01-20T10:00:00Z"
      }
    ],
    "statistics": {
      "totalExercises": 145,
      "exercisesCreated": 12,
      "classroomsManaged": 3,
      "studentsManaged": 75,
      "mlCoinsEarned": 2500,
      "mlCoinsSpent": 1200,
      "achievementsUnlocked": 18,
      "lastActivity": "2025-10-27T15:45:00Z"
    },
    "recentActivity": [
      {
        "action": "login",
        "timestamp": "2025-10-27T09:30:00Z",
        "ip": "192.168.1.1",
        "userAgent": "Mozilla/5.0..."
      }
    ]
  }
}
```

**Ejemplo cURL:**
```bash
curl -X GET "http://localhost:3001/api/admin/users/uuid-here" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 1.3 PATCH /api/admin/users/:id

Actualiza información de un usuario (NO incluye role, usar endpoint específico).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "fullName": "John Doe Updated",
  "profile": {
    "bio": "Updated bio",
    "preferredLanguage": "es"
  }
}
```

**Validaciones:**
- `email`: Formato válido, único en el sistema
- `fullName`: 2-100 caracteres
- NO permite actualizar `role` (usar `PATCH /api/admin/system/users/:id/role`)
- NO permite actualizar `status` (usar endpoints específicos: suspend, activate, etc.)

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "newemail@example.com",
      "fullName": "John Doe Updated",
      "updatedAt": "2025-10-28T12:00:00Z"
    }
  },
  "meta": {
    "auditId": "audit_uuid"
  }
}
```

**Errores:**
- `400 VALIDATION_ERROR`: Email inválido o nombre muy corto
- `404 NOT_FOUND`: Usuario no encontrado
- `409 CONFLICT`: Email ya existe

---

### 1.4 DELETE /api/admin/users/:id

Elimina un usuario (soft delete - preserva datos para auditoría).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "User requested account deletion"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "message": "User deleted successfully",
    "userId": "uuid",
    "deletedAt": "2025-10-28T12:00:00Z"
  },
  "meta": {
    "auditId": "audit_uuid"
  }
}
```

**Comportamiento:**
- Soft delete: `is_active = false`, `deleted_at = NOW()`
- Preserva todos los datos para auditoría
- Usuario no puede hacer login
- Datos aún visibles en reportes históricos

---

### 1.5 POST /api/admin/users/:id/suspend

Suspende la cuenta de un usuario (por violación de políticas).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Violación de términos de servicio - contenido inapropiado",
  "suspendUntil": "2025-11-28T00:00:00Z" // Opcional, null = indefinido
}
```

**Validaciones:**
- `reason`: Obligatorio, 10-500 caracteres
- `suspendUntil`: Fecha futura opcional

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "message": "User suspended successfully",
    "userId": "uuid",
    "status": "suspended",
    "reason": "Violación de términos de servicio - contenido inapropiado",
    "suspendedAt": "2025-10-28T12:00:00Z",
    "suspendUntil": "2025-11-28T00:00:00Z"
  },
  "meta": {
    "auditId": "audit_uuid"
  }
}
```

**Comportamiento:**
- Bloquea inmediatamente el login del usuario
- Usuario recibe email de notificación
- Sesiones activas son invalidadas

---

### 1.6 POST /api/admin/users/:id/unsuspend

Remueve la suspensión de un usuario.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Revisión completada - usuario puede volver a acceder"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "message": "User unsuspended successfully",
    "userId": "uuid",
    "status": "active",
    "unsuspendedAt": "2025-10-28T12:00:00Z"
  },
  "meta": {
    "auditId": "audit_uuid"
  }
}
```

---

### 1.7 POST /api/admin/users/:id/activate

Activa una cuenta de usuario inactiva.

**Headers:**
```
Authorization: Bearer <token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "message": "User activated successfully",
    "userId": "uuid",
    "status": "active",
    "activatedAt": "2025-10-28T12:00:00Z"
  }
}
```

---

### 1.8 POST /api/admin/users/:id/deactivate

Desactiva temporalmente una cuenta de usuario.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Cuenta temporal - verano"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "message": "User deactivated successfully",
    "userId": "uuid",
    "status": "inactive",
    "deactivatedAt": "2025-10-28T12:00:00Z"
  }
}
```

---

### 1.9 POST /api/admin/users/:id/reset-password

Fuerza un reset de contraseña para el usuario.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "sendEmail": true,
  "reason": "Usuario olvidó su contraseña"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "message": "Password reset email sent successfully",
    "userId": "uuid",
    "resetToken": "token_uuid",
    "resetTokenExpiry": "2025-10-28T18:00:00Z",
    "emailSent": true
  },
  "meta": {
    "auditId": "audit_uuid"
  }
}
```

**Comportamiento:**
- Genera token de reset válido por 6 horas
- Envía email con link de reset
- Invalida tokens de reset previos

---

### 1.10 GET /api/admin/users/:id/activity

Obtiene el log de actividad de un usuario (últimos 100 eventos).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  limit?: number;        // Default: 100, max: 500
  page?: number;         // Default: 1
  actionType?: string;   // 'login' | 'logout' | 'exercise_submit' | 'content_create'
  startDate?: string;    // ISO 8601
  endDate?: string;      // ISO 8601
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "uuid",
        "userId": "uuid",
        "action": "login",
        "timestamp": "2025-10-27T09:30:00Z",
        "ip": "192.168.1.1",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
        "location": {
          "country": "US",
          "city": "New York"
        },
        "metadata": {
          "sessionId": "session_uuid"
        }
      },
      {
        "id": "uuid",
        "userId": "uuid",
        "action": "exercise_submit",
        "timestamp": "2025-10-27T10:15:00Z",
        "ip": "192.168.1.1",
        "metadata": {
          "exerciseId": "uuid",
          "score": 85
        }
      }
    ],
    "pagination": {
      "total": 450,
      "page": 1,
      "limit": 100
    }
  }
}
```

---

## 2. Organizations Management (8 endpoints)

### 2.1 GET /api/admin/organizations

Lista todas las organizaciones/escuelas del sistema.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  page?: number;              // Default: 1
  limit?: number;             // Default: 25
  type?: string;              // 'school' | 'university' | 'enterprise'
  subscriptionTier?: string;  // 'free' | 'basic' | 'premium' | 'enterprise'
  status?: string;            // 'active' | 'inactive' | 'trial'
  search?: string;            // Buscar por name
  sortBy?: string;            // 'createdAt' | 'name' | 'userCount'
  sortOrder?: string;         // 'asc' | 'desc'
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "organizations": [
      {
        "id": "uuid",
        "name": "Example High School",
        "type": "school",
        "status": "active",
        "subscriptionTier": "premium",
        "userCount": 250,
        "maxUsers": 300,
        "createdAt": "2025-01-01T00:00:00Z",
        "subscriptionExpiry": "2025-12-31T23:59:59Z",
        "features": {
          "advanced_analytics": true,
          "api_access": true,
          "custom_branding": true,
          "sso": false
        }
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 25
    }
  }
}
```

**Ejemplo cURL:**
```bash
curl -X GET "http://localhost:3001/api/admin/organizations?subscriptionTier=premium&status=active" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 2.2 GET /api/admin/organizations/:id

Obtiene detalles completos de una organización + estadísticas.

**Headers:**
```
Authorization: Bearer <token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "organization": {
      "id": "uuid",
      "name": "Example High School",
      "type": "school",
      "status": "active",
      "contactEmail": "admin@school.com",
      "contactPhone": "+1234567890",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "country": "USA",
        "zipCode": "10001"
      },
      "subscription": {
        "tier": "premium",
        "status": "active",
        "startDate": "2025-01-01T00:00:00Z",
        "expiryDate": "2025-12-31T23:59:59Z",
        "billingCycle": "annual",
        "price": 5000
      },
      "limits": {
        "maxUsers": 300,
        "currentUsers": 250,
        "maxStorage": 10737418240,
        "currentStorage": 5368709120
      },
      "features": {
        "advanced_analytics": true,
        "api_access": true,
        "custom_branding": true,
        "sso": false,
        "white_label": false
      },
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-10-28T12:00:00Z"
    },
    "statistics": {
      "totalUsers": 250,
      "activeUsers": 230,
      "totalStudents": 220,
      "totalTeachers": 28,
      "totalAdmins": 2,
      "totalClassrooms": 15,
      "totalExercisesCompleted": 15000,
      "avgSessionDuration": 1800,
      "lastActivityDate": "2025-10-28T11:00:00Z"
    }
  }
}
```

---

### 2.3 POST /api/admin/organizations

Crea una nueva organización/escuela.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New School",
  "type": "school",
  "contactEmail": "contact@newschool.com",
  "contactPhone": "+1234567890",
  "address": {
    "street": "456 Education Ave",
    "city": "Boston",
    "state": "MA",
    "country": "USA",
    "zipCode": "02101"
  },
  "subscriptionTier": "basic",
  "maxUsers": 100
}
```

**Validaciones:**
- `name`: Obligatorio, 2-100 caracteres, único
- `type`: Obligatorio, enum ['school', 'university', 'enterprise']
- `contactEmail`: Obligatorio, formato válido
- `subscriptionTier`: Obligatorio, enum ['free', 'basic', 'premium', 'enterprise']
- `maxUsers`: Obligatorio, > 0

**Response: 201 Created**
```json
{
  "success": true,
  "data": {
    "organization": {
      "id": "uuid",
      "name": "New School",
      "type": "school",
      "status": "active",
      "subscriptionTier": "basic",
      "createdAt": "2025-10-28T12:00:00Z"
    }
  },
  "meta": {
    "auditId": "audit_uuid"
  }
}
```

---

### 2.4 PUT /api/admin/organizations/:id

Actualiza información de una organización.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated School Name",
  "contactEmail": "newcontact@school.com",
  "contactPhone": "+1234567891",
  "address": {
    "street": "789 New St",
    "city": "Boston",
    "state": "MA",
    "country": "USA",
    "zipCode": "02102"
  },
  "maxUsers": 150
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "organization": {
      "id": "uuid",
      "name": "Updated School Name",
      "updatedAt": "2025-10-28T12:00:00Z"
    }
  }
}
```

---

### 2.5 DELETE /api/admin/organizations/:id

Elimina una organización (soft delete - bloquea acceso de usuarios).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Organization contract ended"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "message": "Organization deleted successfully",
    "organizationId": "uuid",
    "deletedAt": "2025-10-28T12:00:00Z",
    "affectedUsers": 250
  },
  "meta": {
    "auditId": "audit_uuid"
  }
}
```

**Comportamiento:**
- Soft delete: `is_active = false`
- Bloquea acceso de todos los usuarios de la organización
- Preserva datos históricos para auditoría
- Envía email de notificación a administradores de la organización

---

### 2.6 GET /api/admin/organizations/:id/users

Lista todos los usuarios de una organización específica.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  page?: number;     // Default: 1
  limit?: number;    // Default: 25
  role?: string;     // 'student' | 'teacher' | 'admin'
  status?: string;   // 'active' | 'inactive' | 'suspended'
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@school.com",
        "fullName": "John Doe",
        "role": "teacher",
        "status": "active",
        "joinedAt": "2025-02-01T00:00:00Z",
        "lastLogin": "2025-10-27T09:30:00Z"
      }
    ],
    "pagination": {
      "total": 250,
      "page": 1,
      "limit": 25
    }
  }
}
```

---

### 2.7 PATCH /api/admin/organizations/:id/subscription

Actualiza la suscripción de una organización.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "tier": "premium",
  "status": "active",
  "startDate": "2025-11-01T00:00:00Z",
  "expiryDate": "2026-10-31T23:59:59Z",
  "billingCycle": "annual",
  "price": 8000,
  "maxUsers": 500
}
```

**Validaciones:**
- `tier`: enum ['free', 'basic', 'premium', 'enterprise']
- `status`: enum ['active', 'inactive', 'trial', 'expired']
- `expiryDate`: Debe ser posterior a `startDate`
- `maxUsers`: > current user count

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "organizationId": "uuid",
      "tier": "premium",
      "status": "active",
      "expiryDate": "2026-10-31T23:59:59Z",
      "updatedAt": "2025-10-28T12:00:00Z"
    }
  },
  "meta": {
    "auditId": "audit_uuid"
  }
}
```

---

### 2.8 PATCH /api/admin/organizations/:id/features

Actualiza los feature flags de una organización.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "features": {
    "advanced_analytics": true,
    "api_access": true,
    "custom_branding": true,
    "sso": true,
    "white_label": false
  }
}
```

**Available Features:**
- `advanced_analytics`: Acceso a analytics avanzados
- `api_access`: Acceso a la API REST
- `custom_branding`: Personalización de marca
- `sso`: Single Sign-On
- `white_label`: White label completo

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "features": {
      "advanced_analytics": true,
      "api_access": true,
      "custom_branding": true,
      "sso": true,
      "white_label": false
    },
    "updatedAt": "2025-10-28T12:00:00Z"
  },
  "meta": {
    "auditId": "audit_uuid"
  }
}
```

---

## 3. Content Management (6 endpoints)

**Roles permitidos:** `super_admin`, `content_moderator`

### 3.1 GET /api/admin/content/exercises/pending

Lista ejercicios pendientes de aprobación (creados por teachers/comunidad).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  page?: number;           // Default: 1
  limit?: number;          // Default: 25
  exerciseType?: string;   // 'crucigrama_cientifico' | 'lectura_diaria' | etc.
  creatorId?: string;      // UUID del creator
  sortBy?: string;         // 'createdAt' | 'updatedAt'
  sortOrder?: string;      // 'asc' | 'desc'
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "exercises": [
      {
        "id": "uuid",
        "title": "Crucigrama de Biología",
        "exerciseType": "crucigrama_cientifico",
        "difficulty": "intermediate",
        "status": "pending_review",
        "creatorId": "uuid",
        "creatorName": "Prof. Jane Smith",
        "createdAt": "2025-10-25T10:00:00Z",
        "updatedAt": "2025-10-25T10:00:00Z",
        "preview": {
          "description": "Ejercicio sobre células y sistemas",
          "estimatedDuration": 20,
          "totalQuestions": 15
        }
      }
    ],
    "pagination": {
      "total": 12,
      "page": 1,
      "limit": 25
    }
  }
}
```

---

### 3.2 POST /api/admin/content/exercises/:id/approve

Aprueba un ejercicio (cambia status a 'approved' y lo publica en el catálogo).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "comment": "Excelente contenido educativo. Aprobado para publicación.",
  "publishImmediately": true,
  "featuredUntil": "2025-11-30T23:59:59Z"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "exercise": {
      "id": "uuid",
      "title": "Crucigrama de Biología",
      "status": "approved",
      "approvedBy": "uuid",
      "approvedAt": "2025-10-28T12:00:00Z",
      "publishedAt": "2025-10-28T12:00:00Z",
      "featuredUntil": "2025-11-30T23:59:59Z"
    },
    "notification": {
      "sent": true,
      "recipientId": "creator_uuid"
    }
  },
  "meta": {
    "auditId": "audit_uuid"
  }
}
```

**Comportamiento:**
- Cambia status a 'approved'
- Publica en catálogo público (si `publishImmediately: true`)
- Envía notificación al creator
- Puede marcar como "featured" temporalmente

---

### 3.3 POST /api/admin/content/exercises/:id/reject

Rechaza un ejercicio (requiere reason obligatorio).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "El contenido no cumple con los estándares educativos. Las preguntas necesitan más claridad y el tema no es apropiado para el nivel especificado.",
  "allowResubmission": true,
  "feedback": "Por favor revisa las preguntas 3, 5 y 7. Considera usar vocabulario más apropiado para nivel intermedio."
}
```

**Validaciones:**
- `reason`: Obligatorio, 20-500 caracteres
- `allowResubmission`: Boolean, default: true

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "exercise": {
      "id": "uuid",
      "title": "Crucigrama de Biología",
      "status": "rejected",
      "rejectedBy": "uuid",
      "rejectedAt": "2025-10-28T12:00:00Z",
      "rejectionReason": "El contenido no cumple con los estándares educativos...",
      "allowResubmission": true
    },
    "notification": {
      "sent": true,
      "recipientId": "creator_uuid"
    }
  },
  "meta": {
    "auditId": "audit_uuid"
  }
}
```

**Comportamiento:**
- Cambia status a 'rejected'
- Envía email detallado al creator con el reason y feedback
- Si `allowResubmission: true`, creator puede editar y volver a enviar

---

### 3.4 GET /api/admin/content/media

Lista archivos multimedia del sistema (images, videos, PDFs).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  page?: number;        // Default: 1
  limit?: number;       // Default: 50
  type?: string;        // 'image' | 'video' | 'pdf' | 'audio'
  uploaderId?: string;  // UUID del uploader
  minSize?: number;     // Tamaño mínimo en bytes
  maxSize?: number;     // Tamaño máximo en bytes
  startDate?: string;   // ISO 8601
  endDate?: string;     // ISO 8601
  sortBy?: string;      // 'createdAt' | 'size' | 'downloads'
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "media": [
      {
        "id": "uuid",
        "filename": "biology-diagram.png",
        "type": "image",
        "mimeType": "image/png",
        "size": 524288,
        "url": "https://cdn.glit.edu/media/uuid/biology-diagram.png",
        "thumbnailUrl": "https://cdn.glit.edu/media/uuid/thumb_biology-diagram.png",
        "uploaderId": "uuid",
        "uploaderName": "Prof. Jane Smith",
        "uploadedAt": "2025-10-25T10:00:00Z",
        "downloads": 45,
        "usedInExercises": 3,
        "metadata": {
          "width": 1920,
          "height": 1080,
          "format": "png"
        }
      }
    ],
    "pagination": {
      "total": 1250,
      "page": 1,
      "limit": 50
    },
    "statistics": {
      "totalFiles": 1250,
      "totalSize": 5368709120,
      "byType": {
        "image": 800,
        "video": 200,
        "pdf": 150,
        "audio": 100
      }
    }
  }
}
```

---

### 3.5 DELETE /api/admin/content/media/:id

Elimina un archivo multimedia (inapropiado/duplicado).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Contenido duplicado o inapropiado",
  "notifyUploader": true
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "message": "Media file deleted successfully",
    "mediaId": "uuid",
    "deletedAt": "2025-10-28T12:00:00Z",
    "affectedExercises": 3
  },
  "meta": {
    "auditId": "audit_uuid"
  }
}
```

**Comportamiento:**
- Elimina archivo del CDN/storage
- Actualiza ejercicios que usan el archivo (marca media como missing)
- Notifica al uploader si `notifyUploader: true`

**Advertencia:**
Si `affectedExercises > 0`, considera revisar los ejercicios afectados.

---

### 3.6 POST /api/admin/content/version

Crea una versión/snapshot de contenido (para rollback/versioning).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "contentType": "exercise",
  "contentId": "uuid",
  "versionLabel": "v1.2-stable",
  "description": "Version estable antes de actualización mayor",
  "createBackup": true
}
```

**Validaciones:**
- `contentType`: enum ['exercise', 'lesson', 'module']
- `contentId`: UUID válido del contenido
- `versionLabel`: 1-50 caracteres

**Response: 201 Created**
```json
{
  "success": true,
  "data": {
    "version": {
      "id": "uuid",
      "contentType": "exercise",
      "contentId": "uuid",
      "versionLabel": "v1.2-stable",
      "versionNumber": 12,
      "description": "Version estable antes de actualización mayor",
      "createdBy": "uuid",
      "createdAt": "2025-10-28T12:00:00Z",
      "backupUrl": "https://backups.glit.edu/versions/uuid.json"
    }
  },
  "meta": {
    "auditId": "audit_uuid"
  }
}
```

**Uso:**
Permite rollback a versiones anteriores si una actualización causa problemas.

---

## 4. System Monitoring (7 endpoints)

### 4.1 GET /api/admin/system/health

Obtiene métricas de salud del sistema (CPU, memoria, DB, Redis).

**Headers:**
```
Authorization: Bearer <token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-10-28T12:00:00Z",
    "uptime": 2592000,
    "server": {
      "cpu": {
        "usage": 45.2,
        "cores": 8,
        "loadAverage": [1.5, 1.8, 2.0]
      },
      "memory": {
        "total": 16777216000,
        "used": 8388608000,
        "free": 8388608000,
        "usagePercent": 50
      },
      "disk": {
        "total": 107374182400,
        "used": 53687091200,
        "free": 53687091200,
        "usagePercent": 50
      }
    },
    "database": {
      "status": "connected",
      "connections": {
        "active": 15,
        "idle": 5,
        "total": 20,
        "max": 100
      },
      "performance": {
        "avgQueryTime": 12.5,
        "slowQueries": 2
      }
    },
    "redis": {
      "status": "connected",
      "memory": {
        "used": 104857600,
        "peak": 209715200
      },
      "stats": {
        "hits": 45000,
        "misses": 1200,
        "hitRate": 97.4
      }
    },
    "services": {
      "email": "operational",
      "storage": "operational",
      "cdn": "operational",
      "websocket": "operational"
    },
    "alerts": [
      {
        "level": "warning",
        "message": "CPU usage above 80% in last 5 minutes",
        "timestamp": "2025-10-28T11:55:00Z"
      }
    ]
  }
}
```

**Notas:**
- Este endpoint NO debe depender de la BD (usa Prometheus metrics)
- Response time esperado: < 100ms
- Útil para health checks de load balancers

---

### 4.2 GET /api/admin/system/users

Lista usuarios del sistema (endpoint alternativo con más opciones).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  // Mismo que GET /api/admin/users
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  organizationId?: string;
  search?: string;
  includeDeleted?: boolean;  // Incluir soft-deleted users
}
```

**Response:** Mismo formato que `GET /api/admin/users`

---

### 4.3 PATCH /api/admin/system/users/:id/role

Actualiza el rol de un usuario (promote/demote).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "role": "admin",
  "reason": "Promoción a administrador por desempeño excepcional"
}
```

**Validaciones:**
- `role`: enum ['student', 'teacher', 'admin', 'super_admin', 'content_moderator']
- `reason`: Obligatorio para promote/demote, 10-200 caracteres

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "previousRole": "teacher",
      "newRole": "admin",
      "updatedAt": "2025-10-28T12:00:00Z"
    }
  },
  "meta": {
    "auditId": "audit_uuid"
  }
}
```

**Comportamiento:**
- Actualiza inmediatamente el rol
- Envía email de notificación al usuario
- Invalida sesiones activas (requiere re-login para nuevos permisos)

---

### 4.4 PATCH /api/admin/system/users/:id/status

Actualiza el status de usuarios en batch.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "active",
  "reason": "Reactivación masiva después de mantenimiento"
}
```

**Validaciones:**
- `status`: enum ['active', 'inactive', 'suspended']

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "previousStatus": "inactive",
      "newStatus": "active",
      "updatedAt": "2025-10-28T12:00:00Z"
    }
  }
}
```

---

### 4.5 GET /api/admin/system/logs

Obtiene logs del sistema con filtros.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  page?: number;        // Default: 1
  limit?: number;       // Default: 100, max: 500
  level?: string;       // 'error' | 'warn' | 'info' | 'debug'
  module?: string;      // 'auth' | 'api' | 'database' | 'websocket'
  startDate?: string;   // ISO 8601
  endDate?: string;     // ISO 8601
  search?: string;      // Buscar en message
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "uuid",
        "level": "error",
        "module": "database",
        "message": "Connection timeout to database",
        "timestamp": "2025-10-28T11:45:00Z",
        "metadata": {
          "query": "SELECT * FROM users...",
          "duration": 30000,
          "error": "ETIMEDOUT"
        },
        "stack": "Error: Connection timeout\n  at Database.connect..."
      },
      {
        "id": "uuid",
        "level": "warn",
        "module": "auth",
        "message": "Multiple failed login attempts",
        "timestamp": "2025-10-28T11:40:00Z",
        "metadata": {
          "userId": "uuid",
          "ip": "192.168.1.1",
          "attempts": 5
        }
      }
    ],
    "pagination": {
      "total": 5000,
      "page": 1,
      "limit": 100
    },
    "summary": {
      "errors": 25,
      "warnings": 150,
      "info": 4825
    }
  }
}
```

**Opcional - Real-time logs via WebSocket:**
```javascript
// Frontend puede conectarse para logs en tiempo real
socket.on('admin:logs:stream', (log) => {
  console.log('New log:', log);
});
```

---

### 4.6 POST /api/admin/system/maintenance

Activa/desactiva modo mantenimiento.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "enabled": true,
  "message": "Sistema en mantenimiento programado. Volvemos en 2 horas.",
  "allowedRoles": ["super_admin"],
  "estimatedEndTime": "2025-10-28T14:00:00Z"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "maintenanceMode": {
      "enabled": true,
      "message": "Sistema en mantenimiento programado. Volvemos en 2 horas.",
      "allowedRoles": ["super_admin"],
      "startedAt": "2025-10-28T12:00:00Z",
      "estimatedEndTime": "2025-10-28T14:00:00Z",
      "activatedBy": "uuid"
    }
  },
  "meta": {
    "auditId": "audit_uuid"
  }
}
```

**Comportamiento:**
- Bloquea acceso a usuarios (excepto roles en `allowedRoles`)
- Muestra mensaje personalizado en todas las páginas
- Invalida sesiones activas de usuarios no permitidos
- Envía email/notification a todos los usuarios

**Desactivar mantenimiento:**
```json
{
  "enabled": false
}
```

---

### 4.7 GET /api/admin/system/statistics

Obtiene estadísticas del sistema para el dashboard.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  timeframe?: string;  // 'today' | 'week' | 'month' | 'year'
  includeCharts?: boolean;  // Default: false
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalUsers": 5250,
      "activeUsers": 4800,
      "newUsersToday": 45,
      "newUsersThisWeek": 320,
      "totalOrganizations": 85,
      "activeOrganizations": 80
    },
    "activity": {
      "submissionsToday": 1250,
      "submissionsThisWeek": 8900,
      "avgSessionDuration": 1800,
      "avgResponseTime": 120,
      "peakConcurrentUsers": 850
    },
    "content": {
      "totalExercises": 450,
      "pendingApproval": 12,
      "approvedToday": 3,
      "totalMediaFiles": 1250,
      "totalStorageUsed": 5368709120
    },
    "performance": {
      "avgApiResponseTime": 120,
      "p95ResponseTime": 280,
      "p99ResponseTime": 450,
      "errorRate": 0.2,
      "uptime": 99.9
    },
    "revenue": {
      "activeSubscriptions": 80,
      "monthlyRecurringRevenue": 45000,
      "newSubscriptionsThisMonth": 5
    },
    "charts": {
      "userGrowth": [
        { "date": "2025-10-01", "count": 4800 },
        { "date": "2025-10-02", "count": 4850 }
      ],
      "activityByHour": [
        { "hour": 0, "submissions": 20 },
        { "hour": 1, "submissions": 15 }
      ],
      "topExercises": [
        { "exerciseId": "uuid", "title": "Crucigrama", "completions": 450 }
      ]
    }
  }
}
```

---

## Rate Limiting

Todos los endpoints Admin tienen rate limiting estricto:

| Categoría | Límite | Ventana |
|-----------|--------|---------|
| Admin endpoints | 30 requests | 1 min |
| Health endpoint | 100 requests | 1 min |
| Logs streaming | 10 requests | 1 min |

**Headers de respuesta:**
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 1698505200
```

**Error Response (429 Too Many Requests):**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 45 seconds.",
    "details": {
      "retryAfter": 45,
      "limit": 30,
      "window": "1 minute"
    }
  }
}
```

---

## Audit Logging

Todas las acciones administrativas se registran automáticamente en `admin_audit_log`.

### Estructura del Audit Log

```typescript
interface AdminAuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  method: string;
  endpoint: string;
  requestBody?: any;
  responseStatus: number;
  ip: string;
  userAgent: string;
  timestamp: string;
  metadata?: {
    reason?: string;
    affectedUsers?: number;
    previousValue?: any;
    newValue?: any;
  };
}
```

### Ejemplo de Audit Log Entry

```json
{
  "id": "audit_uuid",
  "adminId": "admin_uuid",
  "adminEmail": "admin@glit.edu",
  "action": "USER_SUSPENDED",
  "resource": "user",
  "resourceId": "user_uuid",
  "method": "POST",
  "endpoint": "/api/admin/users/:id/suspend",
  "requestBody": {
    "reason": "Violación de términos de servicio",
    "suspendUntil": "2025-11-28T00:00:00Z"
  },
  "responseStatus": 200,
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2025-10-28T12:00:00Z",
  "metadata": {
    "reason": "Violación de términos de servicio",
    "previousValue": { "status": "active" },
    "newValue": { "status": "suspended" }
  }
}
```

### Acciones Auditadas

Todas las siguientes acciones se registran automáticamente:

**User Management:**
- `USER_UPDATED`
- `USER_DELETED`
- `USER_SUSPENDED`
- `USER_UNSUSPENDED`
- `USER_ACTIVATED`
- `USER_DEACTIVATED`
- `PASSWORD_RESET_FORCED`
- `USER_ROLE_CHANGED`

**Organizations:**
- `ORGANIZATION_CREATED`
- `ORGANIZATION_UPDATED`
- `ORGANIZATION_DELETED`
- `SUBSCRIPTION_UPDATED`
- `FEATURES_UPDATED`

**Content:**
- `EXERCISE_APPROVED`
- `EXERCISE_REJECTED`
- `MEDIA_DELETED`
- `CONTENT_VERSION_CREATED`

**System:**
- `MAINTENANCE_MODE_ENABLED`
- `MAINTENANCE_MODE_DISABLED`
- `SYSTEM_LOGS_ACCESSED`

---

## Error Codes

| Code | HTTP | Descripción |
|------|------|-------------|
| `UNAUTHORIZED` | 401 | Token missing o inválido |
| `FORBIDDEN` | 403 | Permisos insuficientes (no super_admin) |
| `NOT_FOUND` | 404 | Recurso no encontrado |
| `VALIDATION_ERROR` | 400 | Datos inválidos |
| `CONFLICT` | 409 | Recurso duplicado (ej: email ya existe) |
| `RATE_LIMIT_EXCEEDED` | 429 | Demasiadas requests (30/min) |
| `MAINTENANCE_MODE` | 503 | Sistema en modo mantenimiento |
| `INSUFFICIENT_PERMISSIONS` | 403 | Acción no permitida para este rol |

### Formato de Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email",
      "constraint": "must be valid email"
    }
  },
  "meta": {
    "timestamp": "2025-10-28T12:00:00Z",
    "requestId": "req_123"
  }
}
```

---

## Authentication & Authorization

### JWT Token

Todos los endpoints requieren JWT token válido en el header:

```
Authorization: Bearer <jwt_token>
```

### Role-Based Access Control

| Endpoint Group | Required Role |
|----------------|---------------|
| User Management | `super_admin` |
| Organizations | `super_admin` |
| Content Management | `super_admin`, `content_moderator` |
| System Monitoring | `super_admin` |

### Ejemplo de JWT Payload

```json
{
  "userId": "uuid",
  "email": "admin@glit.edu",
  "role": "super_admin",
  "iat": 1698505200,
  "exp": 1699110000
}
```

---

## WebSocket Events (Real-time)

El Admin Portal puede conectarse a WebSocket para eventos en tiempo real:

**Connection:**
```javascript
import { io } from 'socket.io-client';

const socket = io('ws://localhost:3001/admin', {
  auth: { token: 'JWT_TOKEN' }
});
```

**Events:**
- `admin:user:created` - Nuevo usuario registrado
- `admin:user:suspended` - Usuario suspendido
- `admin:content:pending` - Nuevo contenido pendiente de revisión
- `admin:system:alert` - Alerta del sistema (CPU, memoria, etc.)
- `admin:logs:stream` - Stream de logs en tiempo real
- `admin:maintenance:enabled` - Modo mantenimiento activado
- `admin:maintenance:disabled` - Modo mantenimiento desactivado

**Ejemplo:**
```javascript
socket.on('admin:system:alert', (alert) => {
  console.log('System alert:', alert);
  // { level: 'warning', message: 'CPU usage above 80%', timestamp: '...' }
});

socket.on('admin:content:pending', (content) => {
  console.log('New content pending review:', content);
  // { exerciseId: 'uuid', title: '...', creatorName: '...' }
});
```

---

## Ejemplos de Uso

### Ejemplo 1: Suspender usuario y ver actividad

```bash
# 1. Suspender usuario
curl -X POST "http://localhost:3001/api/admin/users/user-uuid-123/suspend" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Violación de términos - spam",
    "suspendUntil": "2025-11-28T00:00:00Z"
  }'

# 2. Ver actividad del usuario
curl -X GET "http://localhost:3001/api/admin/users/user-uuid-123/activity?limit=50" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Ejemplo 2: Crear organización y asignar subscription

```bash
# 1. Crear organización
curl -X POST "http://localhost:3001/api/admin/organizations" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New High School",
    "type": "school",
    "contactEmail": "admin@newschool.com",
    "subscriptionTier": "premium",
    "maxUsers": 500
  }'

# 2. Actualizar features
curl -X PATCH "http://localhost:3001/api/admin/organizations/org-uuid-123/features" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "features": {
      "advanced_analytics": true,
      "api_access": true,
      "sso": true
    }
  }'
```

### Ejemplo 3: Revisar contenido pendiente

```bash
# 1. Listar contenido pendiente
curl -X GET "http://localhost:3001/api/admin/content/exercises/pending?limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 2. Aprobar ejercicio
curl -X POST "http://localhost:3001/api/admin/content/exercises/exercise-uuid-123/approve" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "comment": "Excelente contenido",
    "publishImmediately": true
  }'
```

### Ejemplo 4: Monitorear sistema

```bash
# 1. Health check
curl -X GET "http://localhost:3001/api/admin/system/health" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 2. Ver logs de errores
curl -X GET "http://localhost:3001/api/admin/system/logs?level=error&limit=50" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. Ver estadísticas
curl -X GET "http://localhost:3001/api/admin/system/statistics?timeframe=today" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Testing

### Ejemplo de Test Unitario (Jest)

```typescript
describe('Admin User Management', () => {
  describe('POST /api/admin/users/:id/suspend', () => {
    it('should suspend user with valid reason', async () => {
      const response = await request(app)
        .post('/api/admin/users/user-123/suspend')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          reason: 'Violación de políticas',
          suspendUntil: '2025-11-28T00:00:00Z'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('suspended');
      expect(response.body.meta.auditId).toBeDefined();
    });

    it('should return 400 if reason is missing', async () => {
      const response = await request(app)
        .post('/api/admin/users/user-123/suspend')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 403 if user is not super_admin', async () => {
      const response = await request(app)
        .post('/api/admin/users/user-123/suspend')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ reason: 'Test' });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });
});
```

### Ejemplo de Test E2E (Cypress)

```typescript
describe('Admin Portal - User Management E2E', () => {
  beforeEach(() => {
    cy.loginAsSuperAdmin();
    cy.visit('/admin/users');
  });

  it('should suspend user successfully', () => {
    cy.get('[data-testid="user-row"]').first().click();
    cy.get('[data-testid="suspend-button"]').click();
    cy.get('[data-testid="suspension-reason"]').type('Test suspension');
    cy.get('[data-testid="confirm-suspend"]').click();

    cy.get('[data-testid="toast"]').should('contain', 'User suspended');
    cy.get('[data-testid="user-status"]').should('contain', 'Suspended');
  });

  it('should show audit log after suspension', () => {
    cy.get('[data-testid="user-row"]').first().click();
    cy.get('[data-testid="activity-tab"]').click();

    cy.get('[data-testid="audit-log"]')
      .should('contain', 'USER_SUSPENDED')
      .and('contain', 'admin@glit.edu');
  });
});
```

---

## Performance Targets

| Endpoint Group | p50 | p95 | p99 |
|----------------|-----|-----|-----|
| User Management | < 100ms | < 300ms | < 500ms |
| Organizations | < 150ms | < 300ms | < 600ms |
| Content Management | < 200ms | < 400ms | < 800ms |
| System Health | < 50ms | < 100ms | < 200ms |
| System Logs | < 300ms | < 500ms | < 1000ms |
| System Statistics | < 300ms | < 500ms | < 1000ms |

---

## 🔗 Referencias a Implementación

### Requerimientos
📄 **[Admin Portal Requirements](../../01-requerimientos/admin-portal/README.md)** - Índice completo
- [REQ-ADMIN-USUARIOS.md](../../01-requerimientos/admin-portal/REQ-ADMIN-USUARIOS.md#-referencias-a-implementación) - 10 endpoints
- [REQ-ADMIN-ORGANIZACIONES.md](../../01-requerimientos/admin-portal/REQ-ADMIN-ORGANIZACIONES.md#-referencias-a-implementación) - 8 endpoints
- [REQ-ADMIN-CONTENIDO.md](../../01-requerimientos/admin-portal/REQ-ADMIN-CONTENIDO.md#-referencias-a-implementación) - 6 endpoints
- [REQ-ADMIN-SISTEMA.md](../../01-requerimientos/admin-portal/REQ-ADMIN-SISTEMA.md#-referencias-a-implementación) - 7 endpoints

### Database
🗄️ **Schemas:** `auth`, `educational_content`, `storage`, `system_configuration`, `audit_logging`
- `auth.users` - Gestión de usuarios
- `auth.organizations` - Gestión de organizaciones
- `auth.organization_users` - Usuarios por organización
- `auth.user_activity_log` - Log de actividad de usuarios
- `auth.password_reset_tokens` - Tokens de reset (válidos 24h)
- `educational_content.exercises` - Moderación de contenido (status pending/approved/rejected)
- `storage.media_files` - Archivos multimedia
- `educational_content.content_versions` - Versionamiento de contenido
- `system_configuration.system_logs` - Logs del sistema
- `system_configuration.system_health` - Métricas de salud
- `system_configuration.maintenance_mode` - Estado de mantenimiento
- `audit_logging.admin_audit_log` - Auditoría de acciones administrativas

### Backend
💻 **Module:** `apps/backend/src/modules/admin/`
- **Controllers:**
  - `user-management.controller.ts` - 10 endpoints users
  - `organization-management.controller.ts` - 8 endpoints organizations
  - `content-moderation.controller.ts` - 3 endpoints moderación
  - `media-management.controller.ts` - 2 endpoints media
  - `content-versioning.controller.ts` - 1 endpoint versioning
  - `system-monitoring.controller.ts` - 7 endpoints sistema

- **Services:**
  - User: `user-management.service.ts`, `admin-audit.service.ts`, `session-invalidation.service.ts`
  - Org: `organization-management.service.ts`, `subscription-management.service.ts`, `feature-flags.service.ts`, `organization-limits.service.ts`
  - Content: `content-moderation.service.ts`, `media-management.service.ts`, `content-versioning.service.ts`
  - System: `system-health.service.ts`, `system-logs.service.ts`, `maintenance-mode.service.ts`, `system-statistics.service.ts`, `role-management.service.ts`

- **Guards:**
  - `super-admin.guard.ts` - Verifica role === 'super_admin'
  - `content-moderator.guard.ts` - Verifica role in ['super_admin', 'content_moderator']

- **Utils:**
  - `subscription-tiers.util.ts` - Definición de features por tier (free, basic, premium, enterprise)
  - `system-metrics.util.ts` - CPU, memory, disk usage
  - `prometheus-exporter.util.ts` - Métricas para Prometheus

- **Middlewares:**
  - `maintenance-mode.middleware.ts` - Bloquea acceso si maintenance activo (excepto super_admin)

- **Logging:**
  - `winston-logger.ts` - Winston logger con transports (Console, File, Database)

- **Storage:**
  - `s3-storage.service.ts` - Upload/delete archivos en S3

### Frontend
🎨 **Feature:** `apps/frontend/src/features/admin/`
- **Components:** 40+ componentes admin
  - User Management: UserList, SuspendUserModal, ActivityLogViewer, AuditHistoryTimeline
  - Organizations: OrganizationList, SubscriptionManager, FeatureFlagsPanel
  - Content: ContentModerationQueue, RejectContentModal, MediaFilesList
  - System: SystemHealthDashboard, SystemLogsViewer, MaintenanceModeToggle, SystemStatisticsDashboard
- **Hooks:** useUsers, useUserManagement, useOrganizations, useSubscription, useFeatureFlags, useContentModeration, useSystemHealth, useMaintenanceMode
- **Types:** admin.types.ts, organization.types.ts, content-moderation.types.ts, system-monitoring.types.ts

### Épica
📄 **EP010 - Admin Portal** → `/docs/04-planificacion/epicas/EP010-admin-portal/`

---

## Security Best Practices

1. **Siempre validar rol:** Verificar `role === 'super_admin'` antes de permitir acciones
2. **Audit logging obligatorio:** Todas las acciones deben registrarse
3. **Reason obligatorio:** Para acciones críticas (suspend, delete, etc.)
4. **Rate limiting estricto:** 30 req/min para prevenir abuso
5. **Soft delete:** Preservar datos para auditoría
6. **IP logging:** Registrar IP en todas las acciones
7. **Email notifications:** Notificar a usuarios afectados
8. **Session invalidation:** Invalidar sesiones después de cambios críticos

---

## Referencias

- **Épica:** EP010 - Admin Portal
- **Historias de Usuario:**
  - HU-EP010-01: User Management (10 endpoints)
  - HU-EP010-02: Organizations (8 endpoints)
  - HU-EP010-03: Content Management (6 endpoints)
  - HU-EP010-04: System Monitoring (7 endpoints)
- **API Reference:** `/docs/02-especificaciones-tecnicas/apis/API-REFERENCE.md` (líneas 2131-2185)

---

**Última actualización:** 2025-10-28
**Versión:** 1.0
**Mantenido por:** Equipo de Backend GAMILIT
