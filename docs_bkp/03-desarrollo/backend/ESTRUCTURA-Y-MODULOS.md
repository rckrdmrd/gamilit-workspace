# Estructura y Módulos del Backend GAMILIT

## Información General

**Stack Tecnológico:**
- Node.js + TypeScript
- Express.js 4.18.2
- PostgreSQL con pg 8.11.3
- Socket.IO 4.8.1 para WebSocket
- JWT para autenticación
- node-cron 4.2.1 para tareas programadas

**Versión:** 1.0.0
**Puerto:** 3006 (configurable)
**Arquitectura:** Modular con separación de capas (Controller-Service-Repository)

---

## Estructura de Directorios

```
backend/
├── src/
│   ├── app.ts                    # Configuración de Express
│   ├── server.ts                 # Punto de entrada del servidor
│   ├── config/                   # Configuración global
│   │   ├── env.ts
│   │   └── jwt.ts
│   ├── database/                 # Conexión PostgreSQL
│   │   └── pool.ts
│   ├── middleware/               # 8 middlewares globales
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── ownership.middleware.ts
│   │   ├── permission.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   ├── rls.middleware.ts
│   │   ├── tenant.middleware.ts
│   │   └── validation.middleware.ts
│   ├── modules/                  # 11 módulos funcionales
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── educational/
│   │   ├── gamification/
│   │   ├── health/
│   │   ├── notifications/
│   │   ├── progress/
│   │   ├── social/
│   │   └── teacher/
│   ├── shared/                   # Utilidades compartidas
│   │   ├── types/
│   │   └── utils/
│   └── websocket/                # Socket.IO
│       ├── socket.server.ts
│       └── socket.auth.ts
├── package.json
├── tsconfig.json
└── nodemon.json
```

---

## Los 11 Módulos Funcionales

### 1. **Auth Module** (`/modules/auth`)

**Responsabilidad:** Autenticación, autorización y gestión de sesiones

**Componentes Principales:**
- `AuthService` - Registro, login, refresh tokens
- `SessionManagementService` - Gestión de sesiones activas
- `PasswordRecoveryService` - Recuperación de contraseñas
- `EmailVerificationService` - Verificación de email (DESHABILITADO)
- `SecurityService` - Logs de seguridad y auditoría

**Endpoints:** 13 endpoints
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me
PUT    /api/auth/password
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/verify-email        (deprecated)
POST   /api/auth/resend-verification (deprecated)
GET    /api/auth/sessions
DELETE /api/auth/sessions/:sessionId
DELETE /api/auth/sessions/all
```

**Patrones de Seguridad:**
- Bcrypt para hash de contraseñas (10 rounds)
- JWT con RS256 (7 días access, 30 días refresh)
- Validación de fuerza de contraseña (min 8 caracteres, mayúscula, minúscula, número)
- Rate limiting en endpoints sensibles
- Validación de estado de cuenta en cada request

---

### 2. **Gamification Module** (`/modules/gamification`)

**Responsabilidad:** Sistema de gamificación (monedas, XP, niveles, logros, misiones)

**Componentes Principales:**
- `GamificationService` - Gestión de ML Coins y estadísticas
- `MissionsService` - Sistema de misiones diarias/semanales
- `LeaderboardsService` - Rankings y tablas de posiciones
- `MissionsRepository` - Persistencia de misiones
- `missions.cron.ts` - Tareas programadas (4 cron jobs)

**Endpoints:** 25+ endpoints
```
# Estadísticas y Monedas
GET    /api/gamification/stats
POST   /api/gamification/coins/add
GET    /api/gamification/coins/transactions

# Logros
GET    /api/gamification/achievements
GET    /api/gamification/achievements/user
POST   /api/gamification/achievements/unlock

# Misiones
GET    /api/gamification/missions
GET    /api/gamification/missions/:id
POST   /api/gamification/missions/:id/progress
POST   /api/gamification/missions/:id/claim
GET    /api/gamification/missions/active
GET    /api/gamification/missions/completed

# Leaderboards
GET    /api/gamification/leaderboards/global
GET    /api/gamification/leaderboards/friends
GET    /api/gamification/leaderboards/guilds
GET    /api/gamification/leaderboards/classroom/:classroomId
```

**Sistema de Monedas (ML Coins):**
```typescript
// Tipos de transacciones
type TransactionType =
  | 'exercise_completion'    // +50-200 coins
  | 'mission_reward'         // +100-500 coins
  | 'achievement_unlock'     // +50-1000 coins
  | 'daily_login'           // +10 coins
  | 'streak_bonus'          // +50-500 coins
  | 'purchase'              // -XXX coins
  | 'admin_adjustment';     // +/- any amount
```

---

### 3. **Educational Module** (`/modules/educational`)

**Responsabilidad:** Contenido educativo (módulos, ejercicios, progreso, analíticas)

**Componentes Principales:**
- `ModulesService` - Gestión de módulos educativos
- `ExercisesService` - Gestión de ejercicios
- `ProgressService` - Tracking de progreso del estudiante
- `ScoringService` - Sistema de puntuación
- `AnalyticsService` - Analíticas de aprendizaje

**Endpoints:** 40+ endpoints
```
# Módulos
GET    /api/educational/modules
GET    /api/educational/modules/:id
POST   /api/educational/modules
PUT    /api/educational/modules/:id
DELETE /api/educational/modules/:id
GET    /api/educational/modules/:id/lessons

# Ejercicios
GET    /api/educational/exercises
GET    /api/educational/exercises/:id
POST   /api/educational/exercises
PUT    /api/educational/exercises/:id
POST   /api/educational/exercises/:id/submit
GET    /api/educational/exercises/:id/hints
POST   /api/educational/exercises/:id/validate

# Progreso
GET    /api/progress/user
GET    /api/progress/modules
GET    /api/progress/modules/:moduleId
GET    /api/progress/exercises/:exerciseId
POST   /api/progress/update
GET    /api/progress/achievements

# Analíticas
GET    /api/analytics/overview
GET    /api/analytics/performance
GET    /api/analytics/time-spent
GET    /api/analytics/strengths-weaknesses
```

**Tipos de Ejercicios Soportados:**
- Multiple choice (única respuesta)
- Multiple select (múltiples respuestas)
- Code completion
- Fill in the blank
- True/False
- Ordering
- Matching

---

### 4. **Teacher Module** (`/modules/teacher`)

**Responsabilidad:** Herramientas para profesores (aulas, tareas, calificaciones)

**Componentes Principales:**
- `ClassroomService` - Gestión de aulas virtuales
- `AssignmentsService` - Creación y gestión de tareas
- `GradingService` - Sistema de calificación
- `StudentProgressService` - Seguimiento de estudiantes
- `AnalyticsService` - Analíticas del aula

**Endpoints:** 35+ endpoints
```
# Aulas
GET    /api/teacher/classrooms
POST   /api/teacher/classrooms
GET    /api/teacher/classrooms/:id
PUT    /api/teacher/classrooms/:id
DELETE /api/teacher/classrooms/:id
POST   /api/teacher/classrooms/:id/students
DELETE /api/teacher/classrooms/:id/students/:studentId
GET    /api/teacher/classrooms/:id/roster

# Tareas
GET    /api/teacher/assignments
POST   /api/teacher/assignments
GET    /api/teacher/assignments/:id
PUT    /api/teacher/assignments/:id
DELETE /api/teacher/assignments/:id
POST   /api/teacher/assignments/:id/publish
GET    /api/teacher/assignments/:id/submissions

# Calificaciones
GET    /api/teacher/grading/pending
GET    /api/teacher/grading/:submissionId
PUT    /api/teacher/grading/:submissionId/grade
POST   /api/teacher/grading/:submissionId/feedback
GET    /api/teacher/grading/classroom/:classroomId

# Progreso de Estudiantes
GET    /api/teacher/students/:studentId/progress
GET    /api/teacher/students/:studentId/activity
GET    /api/teacher/classroom/:classroomId/progress
GET    /api/teacher/classroom/:classroomId/analytics

# Analíticas del Aula
GET    /api/teacher/analytics/overview
GET    /api/teacher/analytics/performance
GET    /api/teacher/analytics/engagement
GET    /api/teacher/analytics/completion-rates
```

**Roles Soportados:**
- `teacher` - Profesor estándar
- `admin` - Administrador de organización
- `super_admin` - Administrador global

---

### 5. **Social Module** (`/modules/social`)

**Responsabilidad:** Funciones sociales (amigos, gremios, chat)

**Sub-módulos:**
- `friends/` - Sistema de amigos
- `guilds/` - Gremios/Equipos

**Endpoints:** 25+ endpoints
```
# Amigos
GET    /api/social/friends
POST   /api/social/friends/request
PUT    /api/social/friends/:requestId/accept
PUT    /api/social/friends/:requestId/decline
DELETE /api/social/friends/:friendId
GET    /api/social/friends/requests/pending
GET    /api/social/friends/search

# Gremios
GET    /api/social/guilds
POST   /api/social/guilds
GET    /api/social/guilds/:id
PUT    /api/social/guilds/:id
DELETE /api/social/guilds/:id
POST   /api/social/guilds/:id/join
POST   /api/social/guilds/:id/leave
GET    /api/social/guilds/:id/members
POST   /api/social/guilds/:id/invite
DELETE /api/social/guilds/:id/members/:memberId
PUT    /api/social/guilds/:id/members/:memberId/role
GET    /api/social/guilds/:id/leaderboard
GET    /api/social/guilds/search
```

**Roles de Gremio:**
- `leader` - Líder del gremio
- `officer` - Oficial con permisos de gestión
- `member` - Miembro estándar

---

### 6. **Notifications Module** (`/modules/notifications`)

**Responsabilidad:** Sistema de notificaciones en tiempo real

**Componentes Principales:**
- `NotificationsService` - Lógica de negocio
- `RealtimeService` - Gestión de conexiones WebSocket
- `NotificationsRepository` - Persistencia
- `notifications.cron.ts` - Limpieza automática

**Endpoints:** 10 endpoints
```
GET    /api/notifications
GET    /api/notifications/unread
GET    /api/notifications/:id
PUT    /api/notifications/:id/read
PUT    /api/notifications/read-all
DELETE /api/notifications/:id
DELETE /api/notifications/clear-all
GET    /api/notifications/preferences
PUT    /api/notifications/preferences
```

**Tipos de Notificaciones:**
```typescript
type NotificationType =
  | 'achievement_unlocked'
  | 'mission_completed'
  | 'level_up'
  | 'friend_request'
  | 'guild_invitation'
  | 'assignment_graded'
  | 'new_assignment'
  | 'system_announcement';
```

**Integración WebSocket:**
- Eventos emitidos en tiempo real
- Salas por usuario: `user:${userId}`
- Auto-reconexión del cliente
- Contadores de no leídas en vivo

---

### 7. **Admin Module** (`/modules/admin`)

**Responsabilidad:** Administración del sistema (solo `super_admin`)

**Componentes Principales:**
- `AdminService` - Gestión de organizaciones
- `UsersService` - Gestión de usuarios
- `ContentService` - Gestión de contenido
- `SystemService` - Estadísticas del sistema
- `HealthService` - Salud del sistema

**Endpoints:** 30+ endpoints
```
# Organizaciones
GET    /api/admin/organizations
POST   /api/admin/organizations
GET    /api/admin/organizations/:id
PUT    /api/admin/organizations/:id
DELETE /api/admin/organizations/:id

# Usuarios
GET    /api/admin/users
POST   /api/admin/users
GET    /api/admin/users/:id
PUT    /api/admin/users/:id
DELETE /api/admin/users/:id
PUT    /api/admin/users/:id/role
PUT    /api/admin/users/:id/suspend
PUT    /api/admin/users/:id/activate

# Contenido
GET    /api/admin/content/modules
POST   /api/admin/content/modules
PUT    /api/admin/content/modules/:id
DELETE /api/admin/content/modules/:id
GET    /api/admin/content/exercises
POST   /api/admin/content/exercises/import

# Sistema
GET    /api/admin/system/stats
GET    /api/admin/system/health
GET    /api/admin/system/logs
GET    /api/admin/system/audit
POST   /api/admin/system/maintenance
```

---

### 8. **Progress Module** (`/modules/progress`)

**Responsabilidad:** Tracking de actividades y progreso del estudiante

**Componentes Principales:**
- `ActivitiesService` - Registro de actividades
- `ActivitiesController` - Controlador REST
- `ActivitiesRepository` - Persistencia

**Endpoints:** 8 endpoints
```
GET    /api/progress/activities
POST   /api/progress/activities
GET    /api/progress/activities/:id
GET    /api/progress/activities/summary
GET    /api/progress/activities/recent
GET    /api/progress/activities/streaks
```

**Tipos de Actividades:**
- Exercise completion
- Module progress
- Time spent learning
- Achievements unlocked
- Streak maintenance

---

### 9. **Health Module** (`/modules/health`)

**Responsabilidad:** Endpoints de health check

**Endpoints:** 2 endpoints
```
GET    /api/health           # Health básico
GET    /api/health/db        # Health de base de datos
```

**Respuesta Típica:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-10-27T10:30:00.000Z",
    "uptime": 3600,
    "database": "connected"
  }
}
```

---

### 10. **WebSocket Module** (`/websocket`)

**Responsabilidad:** Comunicación en tiempo real con Socket.IO

**Componentes Principales:**
- `socket.server.ts` - Servidor Socket.IO
- `socket.auth.ts` - Middleware de autenticación WebSocket

**Eventos del Cliente:**
```typescript
// Cliente emite
'mark_as_read'   // Marcar notificación como leída

// Servidor emite
'authenticated'        // Confirmación de autenticación
'new_notification'     // Nueva notificación
'notification_read'    // Notificación marcada como leída
'notification_deleted' // Notificación eliminada
'unread_count_updated' // Actualización de contador
'error'               // Error general
```

**Conexión y Autenticación:**
```typescript
// Cliente se conecta con token JWT
const socket = io('ws://localhost:3006', {
  auth: { token: 'Bearer JWT_TOKEN' },
  transports: ['websocket', 'polling']
});

// Servidor valida y une a sala personal
socket.join(`user:${userId}`);
```

---

### 11. **Shared Module** (`/shared`)

**Responsabilidad:** Utilidades y tipos compartidos

**Componentes:**
- `types/` - Tipos TypeScript globales
- `utils/logger.ts` - Logger con Winston
- `utils/validation.ts` - Validadores reutilizables

**Tipos Importantes:**
```typescript
// Request con usuario autenticado
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    tenant_id?: string;
  };
}

// Códigos de error estándar
enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_INACTIVE = 'ACCOUNT_INACTIVE',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS'
}
```

---

## Flujo de Inicialización del Servidor

```
┌─────────────────────────────────────────────────────┐
│ 1. bootstrap() en server.ts                        │
├─────────────────────────────────────────────────────┤
│ - Valida variables de entorno                       │
│ - Testa conexión a PostgreSQL                       │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 2. createApp() en app.ts                           │
├─────────────────────────────────────────────────────┤
│ - Configura middlewares globales                    │
│   * helmet() - Seguridad HTTP                       │
│   * cors() - CORS policy                            │
│   * express.json() - Body parser                    │
│ - Registra rutas de módulos                         │
│ - Añade error handlers                              │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 3. initializeSocketServer(httpServer)              │
├─────────────────────────────────────────────────────┤
│ - Crea servidor Socket.IO                           │
│ - Aplica auth middleware                            │
│ - Configura event handlers                          │
│ - Inicializa RealtimeService                        │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 4. Inicia Cron Jobs                                │
├─────────────────────────────────────────────────────┤
│ - startMissionsCronJobs()                           │
│   * Daily missions: 0 0 * * *                       │
│   * Weekly missions: 0 0 * * 1                      │
│   * Check progress: 0 * * * *                       │
│   * Cleanup: 0 3 * * *                              │
│ - startNotificationsCronJobs()                      │
│   * Cleanup: 0 2 * * *                              │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 5. httpServer.listen(PORT)                         │
├─────────────────────────────────────────────────────┤
│ - Servidor HTTP escuchando                          │
│ - WebSocket endpoint disponible                     │
│ - API REST disponible                               │
└─────────────────────────────────────────────────────┘
```

---

## Patrón de Arquitectura: Clean Architecture

Cada módulo sigue el patrón:

```
module/
├── module.types.ts         # Interfaces y tipos
├── module.validation.ts    # Validaciones con Joi/Zod
├── module.routes.ts        # Definición de rutas Express
├── module.controller.ts    # Controladores (request/response)
├── module.service.ts       # Lógica de negocio
├── module.repository.ts    # Acceso a base de datos
└── index.ts               # Exports públicos
```

**Flujo de Request:**
```
Request → Route → Middleware → Controller → Service → Repository → Database
                                    ↓
Response ← Controller ← Service ← Repository
```

**Responsabilidades por Capa:**

1. **Routes:** Define endpoints y aplica middlewares
2. **Controller:** Maneja request/response HTTP, valida entrada
3. **Service:** Implementa lógica de negocio, orquesta operaciones
4. **Repository:** Abstrae acceso a datos, queries SQL
5. **Middleware:** Autenticación, autorización, validación, rate limiting

---

## Convenciones de Código

**Nomenclatura:**
- Archivos: `kebab-case.ts`
- Clases: `PascalCase`
- Funciones/variables: `camelCase`
- Constantes: `SCREAMING_SNAKE_CASE`
- Interfaces: `PascalCase` (sin prefijo `I`)

**Respuestas API:**
```typescript
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

**Logging:**
```typescript
import { log } from '@/shared/utils/logger';

log.info('Informational message');
log.warn('Warning message');
log.error('Error message', error);
log.debug('Debug message'); // Solo en development
```

---

## Resumen de Endpoints

| Módulo         | Endpoints | Autenticación | Roles                    |
|----------------|-----------|---------------|--------------------------|
| Auth           | 13        | Mixta         | Todos                    |
| Gamification   | 25+       | Requerida     | student, teacher, admin  |
| Educational    | 40+       | Requerida     | student, teacher, admin  |
| Teacher        | 35+       | Requerida     | teacher, admin           |
| Social         | 25+       | Requerida     | student, teacher         |
| Notifications  | 10        | Requerida     | Todos                    |
| Admin          | 30+       | Requerida     | super_admin              |
| Progress       | 8         | Requerida     | student, teacher, admin  |
| Health         | 2         | No            | -                        |
| **TOTAL**      | **177+**  | -             | -                        |

---

## Próximos Pasos

- Consultar `SERVICIOS-PRINCIPALES.md` para detalles de servicios core
- Consultar `GUARDS-Y-SEGURIDAD.md` para seguridad con NestJS Guards y RLS
- Consultar `API-ENDPOINTS.md` para documentación completa de endpoints
- Consultar `WEBSOCKET-REALTIME.md` para comunicación en tiempo real
- Consultar `CRON-JOBS.md` para tareas programadas
