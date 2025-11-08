# API de Administración

**Proyecto:** GAMILIT
**RFC:** RFC-0001
**Versión:** 1.0.0
**Última Actualización:** 2025-11-01

---

## Información General

**Base:** `/api/admin`
**Total Endpoints:** 30+
**Autenticación:** Requerida (admin, super_admin)

---

## Índice de Endpoints

### Gestión de Usuarios
1. [GET /users](#get-users) - Listar usuarios
2. [POST /users](#post-users) - Crear usuario
3. [PUT /users/:id](#put-usersid) - Actualizar usuario
4. [DELETE /users/:id](#delete-usersid) - Eliminar usuario
5. [POST /users/:id/suspend](#post-usersidsuspend) - Suspender cuenta
6. [POST /users/:id/activate](#post-usersidactivate) - Activar cuenta

### Analytics
7. [GET /analytics/overview](#get-analyticsoverview) - Vista general
8. [GET /analytics/users](#get-analyticsusers) - Analytics de usuarios
9. [GET /analytics/engagement](#get-analyticsengagement) - Métricas de engagement

### Configuración
10. [GET /config](#get-config) - Configuración del sistema
11. [PUT /config](#put-config) - Actualizar configuración

---

## GET /users

Listar usuarios del sistema.

**Autenticación:** Requerida (admin, super_admin)

### Query Params
- `role` (string): Filtrar por rol
- `status` (string): Filtrar por estado
- `search` (string): Buscar por email/nombre
- `limit` (number): Límite de resultados
- `offset` (number): Paginación

### Response 200
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "student@example.com",
        "role": "student",
        "firstName": "John",
        "lastName": "Doe",
        "status": "active",
        "createdAt": "2024-01-01T00:00:00Z",
        "lastLoginAt": "2025-10-27T10:00:00Z"
      }
    ],
    "total": 1250,
    "limit": 20,
    "offset": 0
  }
}
```

---

## POST /users

Crear nuevo usuario (admin).

**Autenticación:** Requerida (super_admin)

### Request Body
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123",
  "role": "student",
  "firstName": "Jane",
  "lastName": "Smith",
  "status": "active"
}
```

### Response 201
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "newuser@example.com",
      "role": "student",
      "status": "active",
      "createdAt": "2025-10-27T11:00:00Z"
    }
  }
}
```

---

## PUT /users/:id

Actualizar usuario existente.

**Autenticación:** Requerida (super_admin)

### Request Body
```json
{
  "role": "teacher",
  "status": "active",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

### Response 200
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "teacher",
      "status": "active",
      "updatedAt": "2025-10-27T11:05:00Z"
    }
  }
}
```

---

## DELETE /users/:id

Eliminar usuario (soft delete).

**Autenticación:** Requerida (super_admin)

### Response 200
```json
{
  "success": true,
  "data": {
    "message": "User deleted successfully",
    "userId": "uuid"
  }
}
```

---

## POST /users/:id/suspend

Suspender cuenta de usuario.

**Autenticación:** Requerida (admin, super_admin)

### Request Body
```json
{
  "reason": "Terms of Service violation",
  "duration": 30
}
```

### Response 200
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "status": "suspended",
      "suspendedUntil": "2025-11-26T11:00:00Z",
      "suspensionReason": "Terms of Service violation"
    }
  }
}
```

---

## POST /users/:id/activate

Activar cuenta suspendida.

**Autenticación:** Requerida (admin, super_admin)

### Response 200
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "status": "active",
      "activatedAt": "2025-10-27T11:10:00Z"
    }
  }
}
```

---

## GET /analytics/overview

Vista general de analytics del sistema.

**Autenticación:** Requerida (admin, super_admin)

### Response 200
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 1250,
      "activeUsers": 850,
      "newUsersToday": 15,
      "newUsersThisWeek": 87,
      "totalExercisesCompleted": 45000,
      "averageSessionDuration": 1850,
      "totalMLCoinsEarned": 2500000,
      "mostActiveModule": {
        "id": "uuid",
        "title": "Introduction to Python",
        "completions": 350
      }
    }
  }
}
```

---

## GET /analytics/users

Analytics detallado de usuarios.

**Autenticación:** Requerida (admin, super_admin)

### Query Params
- `startDate` (ISO date): Fecha inicio
- `endDate` (ISO date): Fecha fin
- `role` (string): Filtrar por rol

### Response 200
```json
{
  "success": true,
  "data": {
    "userAnalytics": {
      "totalUsers": 1250,
      "usersByRole": {
        "student": 1100,
        "teacher": 140,
        "admin": 10
      },
      "userGrowth": [
        {
          "date": "2025-10-20",
          "newUsers": 12,
          "totalUsers": 1230
        }
      ],
      "retentionRate": 78.5,
      "churnRate": 21.5
    }
  }
}
```

---

## GET /analytics/engagement

Métricas de engagement.

**Autenticación:** Requerida (admin, super_admin)

### Response 200
```json
{
  "success": true,
  "data": {
    "engagement": {
      "dailyActiveUsers": 450,
      "weeklyActiveUsers": 750,
      "monthlyActiveUsers": 950,
      "averageSessionsPerUser": 4.2,
      "averageExercisesPerUser": 36,
      "completionRate": 67.5,
      "topUsers": [
        {
          "userId": "uuid",
          "displayName": "Top Student",
          "exercisesCompleted": 250,
          "totalXP": 50000
        }
      ]
    }
  }
}
```

---

## GET /config

Obtener configuración del sistema.

**Autenticación:** Requerida (super_admin)

### Response 200
```json
{
  "success": true,
  "data": {
    "config": {
      "appName": "GAMILIT",
      "maintenanceMode": false,
      "allowRegistration": true,
      "emailVerificationRequired": false,
      "maxLoginAttempts": 5,
      "sessionTimeout": 604800,
      "mlCoinsRewards": {
        "exerciseCompletion": 100,
        "dailyLogin": 10,
        "streakBonus": 50
      }
    }
  }
}
```

---

## PUT /config

Actualizar configuración del sistema.

**Autenticación:** Requerida (super_admin)

### Request Body
```json
{
  "maintenanceMode": true,
  "allowRegistration": false,
  "mlCoinsRewards": {
    "exerciseCompletion": 150,
    "dailyLogin": 20
  }
}
```

### Response 200
```json
{
  "success": true,
  "data": {
    "config": {
      "maintenanceMode": true,
      "allowRegistration": false,
      "updatedAt": "2025-10-27T11:15:00Z"
    }
  }
}
```

---

## Roles y Permisos

| Rol | Acceso Admin API |
|-----|------------------|
| `student` | No |
| `teacher` | No |
| `admin` | Parcial (usuarios, analytics) |
| `super_admin` | Completo |

---

## Estados de Usuario

| Estado | Descripción |
|--------|-------------|
| `active` | Usuario activo |
| `inactive` | Cuenta desactivada |
| `suspended` | Suspendido temporalmente |
| `pending` | Pendiente de activación |

---

## Documentos Relacionados

- [AuthService](../servicios/Servicios-Autenticacion.md) - Gestión de usuarios
- [Permission Middleware](../middleware/Middleware-Autenticacion.md) - Control de permisos
- [README de API](./README.md) - Índice de endpoints

---

**Última revisión:** 2025-11-01
