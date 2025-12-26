# API Documentation

## Base URL

**Production:** `http://74.208.126.102:3006/api`
**Development:** `http://localhost:3006/api`

## API Documentation (Swagger)

**Interactive Docs:** `http://74.208.126.102:3006/api/docs`

## Authentication

Todos los endpoints protegidos requieren un token JWT en el header:

```
Authorization: Bearer <jwt_token>
```

El token se obtiene al hacer login y tiene una duración de 24 horas.

## Core Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Registrar nuevo usuario | No |
| POST | `/login` | Iniciar sesión | No |
| POST | `/logout` | Cerrar sesión | Yes |
| POST | `/refresh` | Refrescar token | Yes |
| GET | `/profile` | Obtener perfil del usuario | Yes |
| PUT | `/profile` | Actualizar perfil | Yes |
| POST | `/verify-email` | Verificar email | No |
| POST | `/forgot-password` | Solicitar reset de contraseña | No |
| POST | `/reset-password` | Resetear contraseña con token | No |
| PUT | `/password` | Cambiar contraseña | Yes |
| GET | `/sessions` | Listar sesiones activas | Yes |
| DELETE | `/sessions/:sessionId` | Cerrar sesión específica | Yes |
| DELETE | `/sessions` | Cerrar todas las sesiones | Yes |

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "SecurePass123!",
  "firstName": "Juan",
  "lastName": "Pérez",
  "role": "student"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "student"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "firstName": "Juan",
    "role": "student"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

### Users (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profile` | Obtener perfil actual | Yes |
| PUT | `/profile` | Actualizar perfil | Yes |
| GET | `/preferences` | Obtener preferencias | Yes |
| PUT | `/preferences` | Actualizar preferencias | Yes |
| POST | `/avatar` | Subir avatar | Yes |
| GET | `/statistics` | Estadísticas del usuario | Yes |

### Password Management (`/api/password`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/reset-password/request` | Solicitar reset | No |
| POST | `/reset-password` | Resetear con token | No |
| PUT | `/change-password` | Cambiar contraseña | Yes |
| POST | `/verify-email` | Verificar email | No |
| POST | `/verify-email/resend` | Reenviar verificación | Yes |
| GET | `/verify-email/status` | Estado de verificación | Yes |

## Gamification Endpoints

### Ranks (`/api/gamification/ranks`)

Maya ranking system con 5 niveles.

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Listar todos los rangos | Yes |
| GET | `/current` | Obtener rango actual del usuario | Yes |
| GET | `/:id` | Obtener detalles de un rango | Yes |
| GET | `/users/:userId/rank-progress` | Progreso hacia siguiente rango | Yes |
| GET | `/users/:userId/rank-history` | Historial de rangos | Yes |
| GET | `/check-promotion/:userId` | Verificar si califica para promoción | Yes |
| POST | `/promote/:userId` | Promover a siguiente rango | Yes (Admin) |
| POST | `/admin/ranks` | Crear nuevo rango | Yes (Admin) |
| PUT | `/admin/ranks/:id` | Actualizar rango | Yes (Admin) |
| DELETE | `/admin/ranks/:id` | Eliminar rango | Yes (Admin) |

**Maya Ranks:**
1. MERCENARIO (0-1000 pts)
2. GUERRERO (1000-2500 pts)
3. HOLCATTE (2500-5000 pts)
4. BATAB (5000-10000 pts)
5. NACOM (10000+ pts)

#### Get Current Rank

```http
GET /api/gamification/ranks/current
Authorization: Bearer <token>
```

**Response:**
```json
{
  "rank": {
    "id": "uuid",
    "name": "GUERRERO",
    "level": 2,
    "minPoints": 1000,
    "maxPoints": 2500,
    "multiplier": 1.2,
    "icon": "⚔️"
  },
  "currentPoints": 1500,
  "progress": 0.2,
  "nextRank": {
    "name": "HOLCATTE",
    "pointsNeeded": 1000
  }
}
```

### Achievements (`/api/gamification/achievements`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/achievements` | Listar logros disponibles | Yes |
| GET | `/achievements/:id` | Detalles de un logro | Yes |
| GET | `/users/:userId/achievements` | Logros del usuario | Yes |
| POST | `/users/:userId/achievements/:achievementId` | Otorgar logro | Yes (System) |
| GET | `/users/:userId/achievements/summary` | Resumen de logros | Yes |
| POST | `/users/:userId/achievements/:achievementId/claim` | Reclamar recompensa | Yes |
| PATCH | `/achievements/:id` | Actualizar logro | Yes (Admin) |

### Leaderboard (`/api/gamification/leaderboard`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/leaderboard/global` | Leaderboard global | Yes |
| GET | `/leaderboard/schools/:schoolId` | Leaderboard por escuela | Yes |
| GET | `/leaderboard/classrooms/:classroomId` | Leaderboard por clase | Yes |
| GET | `/leaderboard/friends/:userId` | Leaderboard de amigos | Yes |

#### Get Global Leaderboard

```http
GET /api/gamification/leaderboard/global?limit=10&period=week
Authorization: Bearer <token>
```

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": "uuid",
      "name": "Juan Pérez",
      "points": 5000,
      "rank": "HOLCATTE",
      "avatar": "url"
    },
    ...
  ],
  "userPosition": {
    "rank": 15,
    "points": 2000
  }
}
```

### Missions (`/api/gamification/missions`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/daily` | Misiones diarias | Yes |
| GET | `/weekly` | Misiones semanales | Yes |
| GET | `/special` | Misiones especiales | Yes |
| GET | `/stats/:userId` | Estadísticas de misiones | Yes |
| POST | `/:id/start` | Iniciar misión | Yes |
| PATCH | `/:id/progress` | Actualizar progreso | Yes |
| POST | `/:id/claim` | Reclamar recompensa | Yes |

### Shop (`/api/gamification/shop`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/categories` | Categorías de items | Yes |
| GET | `/items` | Listar items disponibles | Yes |
| GET | `/items/:id` | Detalles de un item | Yes |
| POST | `/purchase` | Comprar item | Yes |
| GET | `/purchases/:userId` | Historial de compras | Yes |
| GET | `/owned/:userId/:itemId` | Verificar si posee item | Yes |

### ML Coins (`/api/gamification/ml-coins`)

Moneda virtual del sistema.

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/:userId/ml-coins` | Balance de ML Coins | Yes |
| GET | `/users/:userId/ml-coins/transactions` | Historial de transacciones | Yes |
| POST | `/users/:userId/ml-coins/add` | Agregar ML Coins | Yes (System) |
| POST | `/users/:userId/ml-coins/spend` | Gastar ML Coins | Yes |

### User Stats (`/api/gamification/user-stats`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/:userId/stats` | Estadísticas completas | Yes |
| GET | `/users/:userId/summary` | Resumen de estadísticas | Yes |
| GET | `/users/:userId/rank` | Información de rango | Yes |
| PATCH | `/users/:userId/stats` | Actualizar estadísticas | Yes (System) |

## Educational Endpoints

### Content (`/api/content`)

Gestión de contenido educativo.

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/subjects` | Listar materias | Yes | All |
| GET | `/subjects/:id` | Detalles de materia | Yes | All |
| GET | `/subjects/:id/modules` | Módulos de una materia | Yes | All |
| GET | `/modules/:id/lessons` | Lecciones de un módulo | Yes | All |
| GET | `/lessons/:id` | Detalles de una lección | Yes | All |
| POST | `/subjects` | Crear materia | Yes | Teacher, Admin |
| PUT | `/subjects/:id` | Actualizar materia | Yes | Teacher, Admin |
| DELETE | `/subjects/:id` | Eliminar materia | Yes | Admin |

### Assignments (`/api/assignments`)

Gestión de tareas y quizzes.

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Listar assignments | Yes | All |
| GET | `/:id` | Detalles de assignment | Yes | All |
| POST | `/` | Crear assignment | Yes | Teacher |
| PUT | `/:id` | Actualizar assignment | Yes | Teacher |
| DELETE | `/:id` | Eliminar assignment | Yes | Teacher |
| POST | `/:id/submit` | Enviar respuestas | Yes | Student |
| GET | `/:id/submissions` | Ver envíos | Yes | Teacher |
| POST | `/:id/grade` | Calificar envío | Yes | Teacher |

#### Submit Assignment

```http
POST /api/assignments/:id/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": [
    {
      "questionId": "uuid",
      "answer": "La respuesta correcta"
    },
    ...
  ]
}
```

**Response:**
```json
{
  "submission": {
    "id": "uuid",
    "score": 85,
    "pointsAwarded": 850,
    "feedback": "¡Buen trabajo!",
    "correctAnswers": 17,
    "totalQuestions": 20
  },
  "gamification": {
    "pointsEarned": 850,
    "rankMultiplier": 1.2,
    "streakMultiplier": 1.1,
    "currentRank": "GUERRERO",
    "newAchievements": ["first_quiz_completed"]
  }
}
```

### Progress (`/api/progress`)

Tracking de progreso estudiantil.

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/:userId` | Progreso general del usuario | Yes |
| GET | `/users/:userId/subjects/:subjectId` | Progreso en una materia | Yes |
| GET | `/users/:userId/modules/:moduleId` | Progreso en un módulo | Yes |
| GET | `/analytics` | Analytics agregados | Yes (Teacher) |

## Admin Endpoints

### Admin Dashboard (`/api/admin/dashboard`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/stats` | Estadísticas generales | Yes (Admin) |
| GET | `/activity` | Actividad reciente | Yes (Admin) |
| GET | `/alerts` | Alertas del sistema | Yes (Admin) |

### Admin Users (`/api/admin/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Listar usuarios | Yes (Admin) |
| GET | `/:id` | Detalles de usuario | Yes (Admin) |
| POST | `/` | Crear usuario | Yes (Admin) |
| PUT | `/:id` | Actualizar usuario | Yes (Admin) |
| DELETE | `/:id` | Eliminar usuario | Yes (Admin) |
| POST | `/:id/ban` | Banear usuario | Yes (Admin) |
| POST | `/:id/unban` | Desbanear usuario | Yes (Admin) |

### Admin Reports (`/api/admin/reports`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/usage` | Reporte de uso | Yes (Admin) |
| GET | `/performance` | Reporte de rendimiento | Yes (Admin) |
| GET | `/gamification` | Reporte de gamificación | Yes (Admin) |
| POST | `/export` | Exportar reportes | Yes (Admin) |

## Notifications

### Push Notifications (`/api/notifications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Listar notificaciones | Yes |
| GET | `/:id` | Detalles de notificación | Yes |
| PATCH | `/:id/read` | Marcar como leída | Yes |
| PATCH | `/mark-all-read` | Marcar todas como leídas | Yes |
| DELETE | `/:id` | Eliminar notificación | Yes |
| POST | `/subscribe` | Suscribirse a push | Yes |
| DELETE | `/unsubscribe` | Desuscribirse de push | Yes |

### WebSocket Events

**Connection:** `ws://74.208.126.102:3006`

**Events emitted by server:**
- `notification` - Nueva notificación
- `points_awarded` - Puntos otorgados
- `rank_upgraded` - Promoción de rango
- `achievement_unlocked` - Logro desbloqueado
- `assignment_graded` - Tarea calificada
- `new_message` - Nuevo mensaje

**Events to emit:**
- `join_room` - Unirse a sala
- `leave_room` - Salir de sala
- `typing` - Usuario escribiendo

## Health & Monitoring

### Health Check (`/api/health`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Health check general | No |
| GET | `/db` | Database health | No |
| GET | `/redis` | Redis health | No |

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-12T10:00:00Z",
  "uptime": 3600,
  "services": {
    "database": "healthy",
    "redis": "healthy"
  }
}
```

## Error Responses

Todos los endpoints pueden retornar errores en el siguiente formato:

```json
{
  "statusCode": 400,
  "message": "Descripción del error",
  "error": "Bad Request",
  "timestamp": "2025-12-12T10:00:00Z",
  "path": "/api/endpoint"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token inválido o expirado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto (ej: email ya existe) |
| 422 | Unprocessable Entity - Validación fallida |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Error del servidor |

## Rate Limiting

- **General:** 100 requests por minuto por IP
- **Auth endpoints:** 5 requests por minuto
- **File uploads:** 10 requests por hora

## Pagination

Endpoints que retornan listas soportan paginación:

```http
GET /api/endpoint?page=1&limit=20&sortBy=createdAt&order=DESC
```

**Response:**
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

## Filtering & Search

Muchos endpoints soportan filtrado:

```http
GET /api/users?role=student&status=active&search=juan
```

## CORS

CORS está habilitado para los siguientes orígenes:
- `http://localhost:3005` (development)
- `http://74.208.126.102:3005` (production)

## API Versioning

Actualmente en versión 1. Las rutas futuras incluirán versionado:
- `/api/v1/endpoint` (futuro)
- `/api/endpoint` (actual, equivalente a v1)

## SDK Usage (Future)

```typescript
import { GamilitClient } from '@gamilit/sdk';

const client = new GamilitClient({
  baseUrl: 'http://74.208.126.102:3006/api',
  token: 'your-jwt-token'
});

// Login
await client.auth.login({ email, password });

// Get current rank
const rank = await client.gamification.getCurrentRank();

// Submit assignment
const result = await client.assignments.submit(assignmentId, answers);
```

## Teacher Portal API

El modulo Teacher contiene 50+ endpoints para gestion de aulas, calificaciones, analytics e intervenciones.

**Documentacion detallada:** [API-TEACHER-MODULE.md](./90-transversal/api/API-TEACHER-MODULE.md)

### Resumen de Endpoints Teacher (`/api/teacher`)

| Categoria | Endpoints | Descripcion |
|-----------|-----------|-------------|
| Dashboard | 5 | Stats, activities, alerts, top performers |
| Student Progress | 6 | Progress, overview, stats, notes, insights |
| Grading | 4 | Submissions, feedback, bulk grade |
| Analytics | 8 | Classroom, assignment, engagement, economy |
| Reports | 4 | Generate, recent, stats, download |
| Classrooms | 10 | CRUD, students, permissions, blocking |
| Communication | 3 | Conversations, announcements |
| Interventions | 5 | Alerts, acknowledge, resolve |
| Manual Review | 5 | Pending, start, complete, return |
| Exercise Responses | 5 | Responses, attempts, history |

## Social Features API

### Friends (`/api/social/friends`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Listar amigos | Yes |
| POST | `/request` | Enviar solicitud | Yes |
| POST | `/accept/:id` | Aceptar solicitud | Yes |
| POST | `/reject/:id` | Rechazar solicitud | Yes |
| DELETE | `/:id` | Eliminar amigo | Yes |
| GET | `/pending` | Solicitudes pendientes | Yes |

### Guilds/Teams (`/api/social/guilds`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Listar guilds | Yes |
| GET | `/:id` | Detalles de guild | Yes |
| POST | `/` | Crear guild | Yes |
| POST | `/:id/join` | Unirse a guild | Yes |
| POST | `/:id/leave` | Salir de guild | Yes |
| GET | `/:id/members` | Miembros del guild | Yes |
| POST | `/:id/invite` | Invitar miembro | Yes |

### Classrooms (`/api/social/classrooms`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Listar aulas | Yes |
| GET | `/:id` | Detalles de aula | Yes |
| POST | `/enroll` | Inscribirse con codigo | Yes |
| GET | `/:id/leaderboard` | Leaderboard del aula | Yes |

## Admin Portal API

El modulo Admin contiene 150+ endpoints para gestion completa del sistema:

| Categoria | Endpoints | Descripcion |
|-----------|-----------|-------------|
| Dashboard | 11 | Estadisticas y actividad reciente |
| Users | 10 | CRUD usuarios, suspension, bulk ops |
| Organizations | 9 | Gestion de tenants y suscripciones |
| Content | 10 | Aprobacion, media, versiones |
| Gamification | 9 | Configuracion XP, rangos, parametros |
| Analytics | 7 | Engagement, retention, export |
| System | 13 | Health, config, mantenimiento |
| Feature Flags | 9 | Control de features con rollout |

**Documentacion detallada:** [API-ADMIN-MODULE.md](./90-transversal/api/API-ADMIN-MODULE.md)

---

## Additional Resources

- **Swagger UI:** http://74.208.126.102:3006/api/docs
- **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Deployment:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Database Schema:** `/apps/database/ddl/`
- **Teacher API Details:** [API-TEACHER-MODULE.md](./90-transversal/api/API-TEACHER-MODULE.md)
- **Admin API Details:** [API-ADMIN-MODULE.md](./90-transversal/api/API-ADMIN-MODULE.md)
- **Frontend Student Portal:** [Student Portal](./frontend/student/README.md)
- **Database New Tables:** [TABLAS-NUEVAS-2025-12.md](./database/TABLAS-NUEVAS-2025-12.md)
- **Database Triggers:** [TRIGGERS-INVENTORY.md](./database/TRIGGERS-INVENTORY.md)
