<!-- RFC-0001: Estándar de Documentación Técnica -->
<!-- Proyecto: GAMILIT - Plataforma Gamificada de Machine Learning -->
<!-- Documento: Módulos Core del Backend -->
<!-- Versión: 1.0.0 -->
<!-- Última Actualización: 2025-11-01 -->

# Módulos Core del Backend

## Información General

Este documento describe detalladamente los 11 módulos funcionales del backend de GAMILIT

**Total de Módulos:** 11
**Total de Endpoints:** 177+

---

## Tabla de Contenidos

1. [Auth Module](#1-auth-module)
2. [Gamification Module](#2-gamification-module)
3. [Educational Module](#3-educational-module)
4. [Teacher Module](#4-teacher-module)
5. [Social Module](#5-social-module)
6. [Notifications Module](#6-notifications-module)
7. [Admin Module](#7-admin-module)
8. [Progress Module](#8-progress-module)
9. [Health Module](#9-health-module)
10. [WebSocket Module](#10-websocket-module)
11. [Shared Module](#11-shared-module)

---

## 1. Auth Module

**Ubicación:** `/modules/auth`

**Responsabilidad:** Autenticación, autorización y gestión de sesiones

### Componentes Principales

- `AuthService` - Registro, login, refresh tokens
- `SessionManagementService` - Gestión de sesiones activas
- `PasswordRecoveryService` - Recuperación de contraseñas
- `EmailVerificationService` - Verificación de email (DESHABILITADO)
- `SecurityService` - Logs de seguridad y auditoría

### Endpoints (13 total)

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

### Patrones de Seguridad

**Hashing de Contraseñas:**
```typescript
// Bcrypt con 10 rounds
const hashedPassword = await bcrypt.hash(password, 10);
```

**JWT Tokens:**
```typescript
// RS256 signing
const accessToken = jwt.sign(
  { sub: userId, email, role },
  jwtConfig.secret,
  { expiresIn: '7d' }
);

const refreshToken = jwt.sign(
  { sub: userId },
  jwtConfig.refreshSecret,
  { expiresIn: '30d' }
);
```

**Validación de Contraseña:**
- Mínimo 8 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula
- Al menos 1 número

---

## 2. Gamification Module

**Ubicación:** `/modules/gamification`

**Responsabilidad:** Sistema de gamificación (monedas, XP, niveles, logros, misiones)

### Componentes Principales

- `GamificationService` - Gestión de ML Coins y estadísticas
- `MissionsService` - Sistema de misiones diarias/semanales
- `LeaderboardsService` - Rankings y tablas de posiciones
- `MissionsRepository` - Persistencia de misiones
- `missions.cron.ts` - Tareas programadas (4 cron jobs)

### Endpoints (25+ total)

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

### Sistema de Monedas (ML Coins)

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

## 3. Educational Module

**Ubicación:** `/modules/educational`

**Responsabilidad:** Contenido educativo (módulos, ejercicios, progreso, analíticas)

### Componentes Principales

- `ModulesService` - Gestión de módulos educativos
- `ExercisesService` - Gestión de ejercicios
- `ProgressService` - Tracking de progreso del estudiante
- `ScoringService` - Sistema de puntuación
- `AnalyticsService` - Analíticas de aprendizaje

### Endpoints (40+ total)

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

### Tipos de Ejercicios Soportados

- Multiple choice (única respuesta)
- Multiple select (múltiples respuestas)
- Code completion
- Fill in the blank
- True/False
- Ordering
- Matching

---

## 4. Teacher Module

**Ubicación:** `/modules/teacher`

**Responsabilidad:** Herramientas para profesores (aulas, tareas, calificaciones)

### Componentes Principales

- `ClassroomService` - Gestión de aulas virtuales
- `AssignmentsService` - Creación y gestión de tareas
- `GradingService` - Sistema de calificación
- `StudentProgressService` - Seguimiento de estudiantes
- `AnalyticsService` - Analíticas del aula

### Endpoints (35+ total)

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

### Roles Soportados

- `teacher` - Profesor estándar
- `admin` - Administrador de organización
- `super_admin` - Administrador global

---

## 5. Social Module

**Ubicación:** `/modules/social`

**Responsabilidad:** Funciones sociales (amigos, gremios, chat)

### Sub-módulos

#### Friends
- Sistema de solicitudes de amistad
- Gestión de amigos
- Búsqueda de usuarios

#### Guilds
- Creación y gestión de gremios
- Sistema de miembros y roles
- Leaderboards de gremios

### Endpoints (25+ total)

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

### Roles de Gremio

- `leader` - Líder del gremio
- `officer` - Oficial con permisos de gestión
- `member` - Miembro estándar

---

## 6. Notifications Module

**Ubicación:** `/modules/notifications`

**Responsabilidad:** Sistema de notificaciones en tiempo real

### Componentes Principales

- `NotificationsService` - Lógica de negocio
- `RealtimeService` - Gestión de conexiones WebSocket
- `NotificationsRepository` - Persistencia
- `notifications.cron.ts` - Limpieza automática

### Endpoints (10 total)

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

### Tipos de Notificaciones

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

### Integración WebSocket

- Eventos emitidos en tiempo real
- Salas por usuario: `user:${userId}`
- Auto-reconexión del cliente
- Contadores de no leídas en vivo

---

## 7. Admin Module

**Ubicación:** `/modules/admin`

**Responsabilidad:** Administración del sistema (solo `super_admin`)

### Componentes Principales

- `AdminService` - Gestión de organizaciones
- `UsersService` - Gestión de usuarios
- `ContentService` - Gestión de contenido
- `SystemService` - Estadísticas del sistema
- `HealthService` - Salud del sistema

### Endpoints (30+ total)

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

## 8. Progress Module

**Ubicación:** `/modules/progress`

**Responsabilidad:** Tracking de actividades y progreso del estudiante

### Componentes Principales

- `ActivitiesService` - Registro de actividades
- `ActivitiesController` - Controlador REST
- `ActivitiesRepository` - Persistencia

### Endpoints (8 total)

```
GET    /api/progress/activities
POST   /api/progress/activities
GET    /api/progress/activities/:id
GET    /api/progress/activities/summary
GET    /api/progress/activities/recent
GET    /api/progress/activities/streaks
```

### Tipos de Actividades

- Exercise completion
- Module progress
- Time spent learning
- Achievements unlocked
- Streak maintenance

---

## 9. Health Module

**Ubicación:** `/modules/health`

**Responsabilidad:** Endpoints de health check

### Endpoints (2 total)

```
GET    /api/health           # Health básico
GET    /api/health/db        # Health de base de datos
```

### Respuesta Típica

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

## 10. WebSocket Module

**Ubicación:** `/websocket`

**Responsabilidad:** Comunicación en tiempo real con Socket.IO

### Componentes Principales

- `socket.server.ts` - Servidor Socket.IO
- `socket.auth.ts` - Middleware de autenticación WebSocket

### Eventos del Cliente

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

### Conexión y Autenticación

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

## 11. Shared Module

**Ubicación:** `/shared`

**Responsabilidad:** Utilidades y tipos compartidos

### Componentes

#### Types
- `auth.types.ts` - Tipos de autenticación
- `error.types.ts` - Tipos de errores
- `response.types.ts` - Tipos de respuestas

#### Utils
- `logger.ts` - Logger con Winston
- `validation.ts` - Validadores reutilizables

### Tipos Importantes

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

## Resumen de Endpoints

| Módulo | Endpoints | Autenticación | Roles |
|--------|-----------|---------------|-------|
| Auth | 13 | Mixta | Todos |
| Gamification | 25+ | Requerida | student, teacher, admin |
| Educational | 40+ | Requerida | student, teacher, admin |
| Teacher | 35+ | Requerida | teacher, admin |
| Social | 25+ | Requerida | student, teacher |
| Notifications | 10 | Requerida | Todos |
| Admin | 30+ | Requerida | super_admin |
| Progress | 8 | Requerida | student, teacher, admin |
| Health | 2 | No | - |
| **TOTAL** | **177+** | - | - |

---

## Navegación

- **Índice Principal:** [README.md](./README.md)
- **Anterior:** [Estructura-Proyecto.md](./Estructura-Proyecto.md)

---

**Documentación generada siguiendo RFC-0001**
**Proyecto:** GAMILIT - Plataforma Gamificada de Machine Learning
**Última Actualización:** 2025-11-01
