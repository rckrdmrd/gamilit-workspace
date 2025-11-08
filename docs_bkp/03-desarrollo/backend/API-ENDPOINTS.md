# API Endpoints del Backend GAMILIT

## Información General

**Base URL:** `http://localhost:3006/api`
**Formato:** JSON
**Autenticación:** Bearer JWT Token
**Total Endpoints:** 177+

---

## Tabla de Contenidos

1. [Auth Endpoints](#1-auth-endpoints) (13)
2. [Gamification Endpoints](#2-gamification-endpoints) (25+)
3. [Educational Endpoints](#3-educational-endpoints) (40+)
4. [Teacher Endpoints](#4-teacher-endpoints) (35+)
5. [Social Endpoints](#5-social-endpoints) (25+)
6. [Notifications Endpoints](#6-notifications-endpoints) (10)
7. [Admin Endpoints](#7-admin-endpoints) (30+)
8. [Progress Endpoints](#8-progress-endpoints) (8)
9. [Health Endpoints](#9-health-endpoints) (2)

---

## Formato de Respuesta Estándar

### Success Response
```json
{
  "success": true,
  "data": {
    // ... datos específicos del endpoint
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}  // Opcional
  }
}
```

---

## 1. Auth Endpoints

**Base:** `/api/auth`

### POST `/register`

Registra nuevo usuario en el sistema.

**Autenticación:** No requerida

**Rate Limit:** 5 requests / 15 minutos

**Body:**
```json
{
  "email": "student@example.com",
  "password": "SecurePass123",
  "role": "student",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "student@example.com",
      "role": "student",
      "firstName": "John",
      "lastName": "Doe",
      "displayName": "John"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "7d"
  }
}
```

**Errores:**
- `409` - `EMAIL_EXISTS`: Email ya registrado
- `400` - `WEAK_PASSWORD`: Contraseña no cumple requisitos
- `400` - `VALIDATION_ERROR`: Datos inválidos

---

### POST `/login`

Autentica usuario existente.

**Autenticación:** No requerida

**Rate Limit:** 5 requests / 15 minutos

**Body:**
```json
{
  "email": "student@example.com",
  "password": "SecurePass123"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "student@example.com",
      "role": "student",
      "firstName": "John",
      "lastName": "Doe",
      "displayName": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "7d"
  }
}
```

**Errores:**
- `401` - `INVALID_CREDENTIALS`: Credenciales incorrectas
- `401` - `ACCOUNT_INACTIVE`: Cuenta desactivada
- `403` - `ACCOUNT_SUSPENDED`: Cuenta suspendida

---

### POST `/refresh`

Renueva access token usando refresh token.

**Autenticación:** No requerida (usa refresh token)

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "7d"
  }
}
```

**Errores:**
- `401` - `INVALID_TOKEN`: Token inválido
- `401` - `TOKEN_EXPIRED`: Refresh token expirado

---

### GET `/me`

Obtiene perfil del usuario autenticado.

**Autenticación:** Requerida

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "student@example.com",
    "role": "student",
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "John Doe",
    "avatarUrl": "https://...",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### PUT `/password`

Actualiza contraseña del usuario.

**Autenticación:** Requerida

**Body:**
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewSecurePass456"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Password updated successfully"
  }
}
```

**Errores:**
- `401` - `INVALID_PASSWORD`: Contraseña actual incorrecta
- `400` - `WEAK_PASSWORD`: Nueva contraseña no cumple requisitos

---

### POST `/logout`

Cierra sesión del usuario.

**Autenticación:** Requerida

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

### POST `/forgot-password`

Solicita recuperación de contraseña.

**Autenticación:** No requerida

**Rate Limit:** 1 request / hora

**Body:**
```json
{
  "email": "student@example.com"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Password reset email sent"
  }
}
```

---

### POST `/reset-password`

Restablece contraseña con token.

**Autenticación:** No requerida

**Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass456"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Password reset successfully"
  }
}
```

---

### GET `/sessions`

Obtiene sesiones activas del usuario.

**Autenticación:** Requerida

**Response 200:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "uuid",
        "userAgent": "Mozilla/5.0...",
        "ipAddress": "192.168.1.100",
        "createdAt": "2025-10-27T08:00:00Z",
        "expiresAt": "2025-11-03T08:00:00Z",
        "isCurrent": true
      },
      {
        "id": "uuid",
        "userAgent": "Mobile App",
        "ipAddress": "192.168.1.50",
        "createdAt": "2025-10-26T10:00:00Z",
        "expiresAt": "2025-11-02T10:00:00Z",
        "isCurrent": false
      }
    ]
  }
}
```

---

### DELETE `/sessions/:sessionId`

Revoca sesión específica.

**Autenticación:** Requerida

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Session revoked successfully"
  }
}
```

---

### DELETE `/sessions/all`

Revoca todas las sesiones excepto la actual.

**Autenticación:** Requerida

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "All sessions revoked",
    "count": 3
  }
}
```

---

## 2. Gamification Endpoints

**Base:** `/api/gamification`

### GET `/stats`

Obtiene estadísticas del usuario.

**Autenticación:** Requerida

**Response 200:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "mlCoins": 1500,
    "mlCoinsEarnedTotal": 5000,
    "mlCoinsSpentTotal": 3500,
    "totalXP": 12500,
    "currentLevel": 15,
    "currentRank": "Gold",
    "rankProgress": 75.5,
    "streakDays": 7,
    "longestStreak": 21,
    "lastLoginAt": "2025-10-27T10:00:00Z",
    "totalExercisesCompleted": 150,
    "perfectScores": 45,
    "averageScore": 87.3,
    "updatedAt": "2025-10-27T10:30:00Z"
  }
}
```

---

### POST `/coins/add`

Añade ML Coins al usuario (admin only).

**Autenticación:** Requerida (super_admin)

**Body:**
```json
{
  "userId": "uuid",
  "amount": 100,
  "reason": "Manual adjustment",
  "transactionType": "admin_adjustment"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "newBalance": 1600,
    "transaction": {
      "amount": 100,
      "reason": "Manual adjustment",
      "balanceAfter": 1600
    }
  }
}
```

---

### GET `/coins/transactions`

Obtiene historial de transacciones ML Coins.

**Autenticación:** Requerida

**Query Params:**
- `limit` (number, default: 20): Número de transacciones

**Response 200:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "userId": "uuid",
        "amount": 100,
        "transactionType": "exercise_completion",
        "reason": "Completed exercise: Variables",
        "referenceId": "exercise-uuid",
        "balanceAfter": 1600,
        "createdAt": "2025-10-27T10:30:00Z"
      }
    ]
  }
}
```

---

### GET `/achievements`

Obtiene todos los logros disponibles.

**Autenticación:** Requerida

**Response 200:**
```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "id": "uuid",
        "name": "First Steps",
        "description": "Complete your first exercise",
        "category": "progress",
        "icon": "🎯",
        "rarity": "common",
        "mlCoinsReward": 50,
        "xpReward": 100,
        "isSecret": false
      }
    ]
  }
}
```

---

### GET `/achievements/user`

Obtiene logros desbloqueados del usuario.

**Autenticación:** Requerida

**Response 200:**
```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "id": "uuid",
        "userId": "uuid",
        "achievementId": "uuid",
        "achievement": {
          "name": "First Steps",
          "description": "Complete your first exercise",
          "icon": "🎯",
          "rarity": "common",
          "mlCoinsReward": 50,
          "xpReward": 100
        },
        "unlockedAt": "2025-10-20T15:30:00Z",
        "progress": 100
      }
    ]
  }
}
```

---

### GET `/missions`

Obtiene misiones activas del usuario.

**Autenticación:** Requerida

**Response 200:**
```json
{
  "success": true,
  "data": {
    "missions": [
      {
        "id": "uuid",
        "userId": "uuid",
        "templateId": "daily_exercise_3",
        "title": "Daily Practice",
        "description": "Complete 3 exercises today",
        "type": "daily",
        "objectives": [
          {
            "id": "obj1",
            "description": "Complete exercises",
            "target": 3,
            "current": 1,
            "completed": false
          }
        ],
        "rewards": {
          "mlCoins": 100,
          "xp": 200
        },
        "status": "active",
        "startDate": "2025-10-27T00:00:00Z",
        "endDate": "2025-10-27T23:59:59Z"
      }
    ]
  }
}
```

---

### POST `/missions/:id/progress`

Actualiza progreso de misión.

**Autenticación:** Requerida

**Body:**
```json
{
  "objectiveId": "obj1",
  "increment": 1
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "mission": {
      "id": "uuid",
      "status": "completed",
      "objectives": [
        {
          "id": "obj1",
          "current": 3,
          "completed": true
        }
      ],
      "completedAt": "2025-10-27T10:30:00Z"
    }
  }
}
```

---

### POST `/missions/:id/claim`

Reclama recompensas de misión completada.

**Autenticación:** Requerida

**Response 200:**
```json
{
  "success": true,
  "data": {
    "mission": {
      "id": "uuid",
      "status": "claimed",
      "claimedAt": "2025-10-27T10:35:00Z"
    },
    "rewards": {
      "mlCoins": 100,
      "xp": 200
    },
    "newBalance": {
      "mlCoins": 1700,
      "totalXP": 12700
    }
  }
}
```

---

### GET `/leaderboards/:type`

Obtiene tabla de clasificación.

**Autenticación:** Requerida

**Rate Limit:** 30 requests / minuto

**Params:**
- `type`: `global` | `friends` | `classroom` | `guild`

**Query Params:**
- `limit` (number, default: 100)
- `classroomId` (uuid, si type=classroom)
- `guildId` (uuid, si type=guild)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "type": "global",
    "leaderboard": [
      {
        "rank": 1,
        "userId": "uuid",
        "displayName": "Top Player",
        "totalXP": 50000,
        "currentLevel": 30,
        "avatarUrl": "https://..."
      },
      {
        "rank": 2,
        "userId": "uuid",
        "displayName": "Second Place",
        "totalXP": 45000,
        "currentLevel": 28,
        "avatarUrl": "https://..."
      }
    ],
    "currentUser": {
      "rank": 45,
      "userId": "uuid",
      "displayName": "You",
      "totalXP": 12500,
      "currentLevel": 15
    }
  }
}
```

---

## 3. Educational Endpoints

**Base:** `/api/educational`

### GET `/modules`

Obtiene módulos educativos.

**Autenticación:** Opcional (con auth, incluye progreso)

**Query Params:**
- `category` (string): Filtrar por categoría
- `difficulty` (string): `beginner` | `intermediate` | `advanced`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "modules": [
      {
        "id": "uuid",
        "title": "Introduction to Python",
        "description": "Learn Python basics",
        "category": "programming",
        "difficulty": "beginner",
        "estimatedHours": 10,
        "lessonsCount": 12,
        "exercisesCount": 30,
        "isPublished": true,
        "order": 1,
        "progress": 45.5  // Si autenticado
      }
    ]
  }
}
```

---

### GET `/modules/:id`

Obtiene detalles de módulo específico.

**Autenticación:** Opcional

**Response 200:**
```json
{
  "success": true,
  "data": {
    "module": {
      "id": "uuid",
      "title": "Introduction to Python",
      "description": "Learn Python basics...",
      "category": "programming",
      "difficulty": "beginner",
      "estimatedHours": 10,
      "prerequisites": ["uuid"],
      "learningObjectives": [
        "Understand Python syntax",
        "Write simple programs"
      ],
      "lessons": [
        {
          "id": "uuid",
          "title": "Variables and Types",
          "order": 1,
          "contentType": "video",
          "duration": 600,
          "isCompleted": false  // Si autenticado
        }
      ]
    }
  }
}
```

---

### GET `/exercises`

Obtiene lista de ejercicios.

**Autenticación:** Requerida

**Query Params:**
- `moduleId` (uuid): Filtrar por módulo
- `difficulty` (string)
- `status` (string): `pending` | `completed`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "exercises": [
      {
        "id": "uuid",
        "title": "Variables Quiz",
        "moduleId": "uuid",
        "lessonId": "uuid",
        "type": "multiple_choice",
        "difficulty": "beginner",
        "points": 10,
        "estimatedMinutes": 5,
        "isCompleted": false,
        "bestScore": null
      }
    ]
  }
}
```

---

### GET `/exercises/:id`

Obtiene detalles de ejercicio específico.

**Autenticación:** Requerida

**Response 200:**
```json
{
  "success": true,
  "data": {
    "exercise": {
      "id": "uuid",
      "title": "Variables Quiz",
      "description": "Test your knowledge...",
      "type": "multiple_choice",
      "difficulty": "beginner",
      "points": 10,
      "questions": [
        {
          "id": "q1",
          "text": "What is a variable?",
          "type": "multiple_choice",
          "options": [
            { "id": "a", "text": "A container for data" },
            { "id": "b", "text": "A function" },
            { "id": "c", "text": "A loop" }
          ]
        }
      ],
      "hints": [
        "Think about data storage"
      ],
      "timeLimit": 300  // segundos
    }
  }
}
```

---

### POST `/exercises/:id/submit`

Envía respuesta de ejercicio.

**Autenticación:** Requerida

**Body:**
```json
{
  "answers": {
    "q1": "a",
    "q2": ["a", "c"]
  },
  "timeSpent": 180
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "submissionId": "uuid",
    "score": 90,
    "maxScore": 100,
    "percentage": 90,
    "passed": true,
    "feedback": {
      "overall": "Great job!",
      "byQuestion": {
        "q1": {
          "correct": true,
          "feedback": "Perfect!"
        },
        "q2": {
          "correct": false,
          "feedback": "Review arrays..."
        }
      }
    },
    "rewards": {
      "mlCoins": 150,
      "xp": 300
    },
    "achievements": ["uuid"],
    "newStats": {
      "totalExercisesCompleted": 151,
      "averageScore": 87.5
    }
  }
}
```

---

## 4. Teacher Endpoints

**Base:** `/api/teacher`

### POST `/classrooms`

Crea aula virtual.

**Autenticación:** Requerida (teacher, admin)

**Body:**
```json
{
  "name": "Programming 101",
  "description": "Introduction to programming",
  "subject": "Computer Science",
  "grade": "10th",
  "academicYear": "2024-2025"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "classroom": {
      "id": "uuid",
      "teacherId": "uuid",
      "name": "Programming 101",
      "code": "PROG101",
      "description": "...",
      "subject": "Computer Science",
      "grade": "10th",
      "academicYear": "2024-2025",
      "isActive": true,
      "studentsCount": 0,
      "createdAt": "2025-10-27T10:30:00Z"
    }
  }
}
```

---

### POST `/classrooms/:id/students`

Añade estudiante al aula.

**Autenticación:** Requerida (teacher del aula, admin)

**Body:**
```json
{
  "studentId": "uuid"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Student added to classroom",
    "enrollment": {
      "classroomId": "uuid",
      "studentId": "uuid",
      "enrolledAt": "2025-10-27T10:35:00Z"
    }
  }
}
```

---

### GET `/classrooms/:id/progress`

Obtiene progreso agregado del aula.

**Autenticación:** Requerida (teacher del aula, admin)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "classroomId": "uuid",
    "totalStudents": 25,
    "averageProgress": 67.5,
    "averageScore": 82.3,
    "completionRate": 45.2,
    "studentsProgress": [
      {
        "studentId": "uuid",
        "studentName": "John Doe",
        "progress": 75.5,
        "averageScore": 88.0,
        "exercisesCompleted": 45,
        "lastActivity": "2025-10-27T09:00:00Z"
      }
    ]
  }
}
```

---

### POST `/assignments`

Crea tarea para estudiantes.

**Autenticación:** Requerida (teacher, admin)

**Body:**
```json
{
  "classroomId": "uuid",
  "title": "Python Variables Assignment",
  "description": "Complete exercises 1-5",
  "moduleId": "uuid",
  "exerciseIds": ["uuid1", "uuid2"],
  "dueDate": "2025-11-05T23:59:59Z",
  "points": 100
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "assignment": {
      "id": "uuid",
      "classroomId": "uuid",
      "teacherId": "uuid",
      "title": "Python Variables Assignment",
      "description": "...",
      "dueDate": "2025-11-05T23:59:59Z",
      "points": 100,
      "status": "draft",
      "createdAt": "2025-10-27T10:40:00Z"
    }
  }
}
```

---

### POST `/assignments/:id/publish`

Publica tarea (la hace visible a estudiantes).

**Autenticación:** Requerida (teacher del aula, admin)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "assignment": {
      "id": "uuid",
      "status": "published",
      "publishedAt": "2025-10-27T10:45:00Z"
    },
    "notificationsSent": 25
  }
}
```

---

## 5. Social Endpoints

**Base:** `/api/social`

### POST `/friends/request`

Envía solicitud de amistad.

**Autenticación:** Requerida

**Body:**
```json
{
  "recipientId": "uuid"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "request": {
      "id": "uuid",
      "senderId": "uuid",
      "recipientId": "uuid",
      "status": "pending",
      "createdAt": "2025-10-27T10:50:00Z"
    }
  }
}
```

---

### PUT `/friends/:requestId/accept`

Acepta solicitud de amistad.

**Autenticación:** Requerida

**Response 200:**
```json
{
  "success": true,
  "data": {
    "friendship": {
      "id": "uuid",
      "user1Id": "uuid",
      "user2Id": "uuid",
      "createdAt": "2025-10-27T10:55:00Z"
    }
  }
}
```

---

### GET `/guilds`

Obtiene lista de gremios.

**Autenticación:** Requerida

**Query Params:**
- `search` (string): Buscar por nombre
- `limit` (number)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "guilds": [
      {
        "id": "uuid",
        "name": "Code Warriors",
        "description": "Elite coders guild",
        "iconUrl": "https://...",
        "leaderId": "uuid",
        "membersCount": 50,
        "maxMembers": 100,
        "isPublic": true,
        "totalXP": 500000,
        "createdAt": "2025-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### POST `/guilds`

Crea nuevo gremio.

**Autenticación:** Requerida

**Body:**
```json
{
  "name": "Code Warriors",
  "description": "Elite coders guild",
  "isPublic": true,
  "maxMembers": 100
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "guild": {
      "id": "uuid",
      "name": "Code Warriors",
      "leaderId": "uuid",
      "membersCount": 1,
      "createdAt": "2025-10-27T11:00:00Z"
    }
  }
}
```

---

## 6-9. Endpoints Adicionales

Por brevedad, los endpoints de **Notifications**, **Admin**, **Progress** y **Health** siguen el mismo patrón de estructura y respuesta.

---

## Códigos HTTP Estándar

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Operación exitosa |
| 201 | Created | Recurso creado |
| 204 | No Content | Operación exitosa sin contenido |
| 400 | Bad Request | Datos inválidos |
| 401 | Unauthorized | No autenticado |
| 403 | Forbidden | Sin permisos |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | Conflicto (ej: email duplicado) |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Error del servidor |

---

## Headers Requeridos

**Autenticación:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Content-Type:**
```
Content-Type: application/json
```

---

## Curl Examples

**Register:**
```bash
curl -X POST http://localhost:3006/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePass123",
    "role": "student"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3006/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePass123"
  }'
```

**Get User Stats (autenticado):**
```bash
curl -X GET http://localhost:3006/api/gamification/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Próximos Documentos

- `WEBSOCKET-REALTIME.md` - WebSocket y eventos en tiempo real
- `CRON-JOBS.md` - Tareas programadas y mantenimiento
