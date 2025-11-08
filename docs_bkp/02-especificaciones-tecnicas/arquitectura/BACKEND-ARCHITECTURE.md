# Backend Architecture - GAMILIT Platform

**Version**: 2.0
**Fecha**: Octubre 2025
**Stack**: Node.js 20+ + Express 4.18+ + PostgreSQL 16+ + TypeScript 5.8+

---

## 🔗 Trazabilidad

**Casos de uso relacionados:**
- [UC-STU-001: Registro de estudiante](../../01-requerimientos/casos-uso/student/UC-STU-001-registro.md) - API de autenticación
- [UC-STU-003: Resolver ejercicio](../../01-requerimientos/casos-uso/student/UC-STU-003-resolver-ejercicio.md) - API de ejercicios

**User Stories:**
- [US-FUND-001: Autenticación básica JWT](../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/historias/US-FUND-001-autenticacion-basica-jwt.md) - Sistema auth backend
- [US-FUND-004: Infraestructura técnica base](../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/historias/US-FUND-004-infraestructura-tecnica-base.md) - Setup Node.js + PostgreSQL
- [US-FUND-006: API RESTful básica](../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/historias/US-FUND-006-api-restful-basica.md) - 470+ endpoints
- [US-FUND-005: Sistema de sesiones y estado](../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/historias/US-FUND-005-sistema-sesiones-estado.md) - Gestión de tokens

**Épicas:**
- [EAI-001: Fundamentos](../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/_MAP.md) - API base y autenticación
- [EAI-002: Actividades](../../04-planificacion/01-alcance-inicial/EAI-002-actividades/_MAP.md) - Módulo de ejercicios
- [EAI-003: Gamificación](../../04-planificacion/01-alcance-inicial/EAI-003-gamificacion/_MAP.md) - Sistema de rangos y rewards
- [EAI-004: Analytics](../../04-planificacion/01-alcance-inicial/EAI-004-analytics/_MAP.md) - Tracking y métricas

**Requerimientos funcionales:**
- [Módulos educativos](../../01-requerimientos/modulos/) - API de contenidos y ejercicios
- [Gamificación](../../01-requerimientos/gamificacion/) - API de rangos y achievements
- [Sistema de seguridad](../seguridad/SISTEMA-SEGURIDAD.md) - JWT, RLS, autenticación

---

## Tabla de Contenidos

1. [Vision General](#vision-general)
2. [Arquitectura de Modulos](#arquitectura-de-modulos)
3. [11 Modulos Funcionales](#11-modulos-funcionales)
4. [Servicios Transversales](#servicios-transversales)
5. [Integracion con PostgreSQL + RLS](#integracion-con-postgresql--rls)
6. [Real-time con Socket.IO](#real-time-con-socketio)
7. [Ejemplos de Implementacion](#ejemplos-de-implementacion)

---

## Vision General

El backend de GAMILITes una **API REST robusta** construida con Node.js y Express, siguiendo patrones de arquitectura hexagonal adaptados. Implementa **11 modulos funcionales** que exponen **470+ endpoints** organizados por dominio de negocio.

### Caracteristicas Principales

- **470+ Endpoints REST** organizados en 11 modulos
- **JWT Authentication** con tokens de 7 dias
- **Row Level Security (RLS)** nativo de PostgreSQL
- **Multi-tenancy** completo
- **Real-time events** via Socket.IO
- **File storage** con MinIO/S3
- **Rate limiting** y seguridad avanzada
- **Structured logging** con Winston

### Arquitectura High-Level

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                            │
│  React SPA → HTTP REST + WebSocket → Backend API            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   MIDDLEWARE LAYER                           │
│  ┌────────────┬────────────┬────────────┬─────────────┐    │
│  │ Helmet     │ CORS       │ Auth JWT   │ RLS Context │    │
│  │ (Security) │ (Origin)   │ (Token)    │ (User)      │    │
│  └────────────┴────────────┴────────────┴─────────────┘    │
│  ┌────────────┬────────────┬────────────┬─────────────┐    │
│  │ Rate Limit │ Validation │ Error      │ Logging     │    │
│  │ (Throttle) │ (Zod)      │ (Handler)  │ (Winston)   │    │
│  └────────────┴────────────┴────────────┴─────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    CONTROLLER LAYER                          │
│  Handle HTTP Requests → Validate → Delegate to Service      │
│                                                              │
│  35+ Controllers exposing 470+ endpoints                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                            │
│  Business Logic → Orchestration → Transaction Management    │
│                                                              │
│  40+ Services implementing core business rules               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   REPOSITORY LAYER                           │
│  Data Access → SQL Queries → RLS Context                    │
│                                                              │
│  30+ Repositories abstracting database operations            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                            │
│  PostgreSQL 16+ with 9 schemas, 44 tables, 159+ RLS         │
└─────────────────────────────────────────────────────────────┘
```

---

## Arquitectura de Modulos

### Estructura de un Modulo Tipico

Cada modulo sigue el patron **Controller → Service → Repository**:

```
modules/
└── <module-name>/
    ├── <module>.controller.ts    # HTTP request handling
    ├── <module>.service.ts       # Business logic
    ├── <module>.repository.ts    # Data access
    ├── <module>.routes.ts        # Route definitions
    ├── <module>.validation.ts    # Zod schemas
    ├── <module>.types.ts         # TypeScript types
    └── tests/
        ├── <module>.service.test.ts
        └── <module>.integration.test.ts
```

### Responsabilidades por Capa

| Capa | Responsabilidades | No Debe Hacer |
|------|-------------------|---------------|
| **Controller** | - Validar requests<br>- Parsear parametros<br>- Llamar services<br>- Formatear responses | - Logica de negocio<br>- Queries SQL<br>- Transformaciones complejas |
| **Service** | - Logica de negocio<br>- Orquestacion<br>- Transacciones<br>- Validaciones complejas | - SQL directo<br>- HTTP handling<br>- Manejo de errores HTTP |
| **Repository** | - Queries SQL<br>- Mapeo de datos<br>- RLS context<br>- Transacciones DB | - Logica de negocio<br>- Formateo de responses<br>- Autenticacion |

---

## 11 Modulos Funcionales

### 1. Auth Module (Autenticacion y Autorizacion)

**Proposito:** Manejo de autenticacion JWT, registro, login, y sesiones

**Endpoints: 15**

```typescript
// Principales endpoints
POST   /api/auth/register        # Registrar nuevo usuario
POST   /api/auth/login           # Login con email/password
POST   /api/auth/logout          # Cerrar sesion
POST   /api/auth/refresh         # Refresh access token
GET    /api/auth/me              # Obtener usuario autenticado
PUT    /api/auth/password        # Cambiar password
POST   /api/auth/forgot-password # Recuperar password
~~POST   /api/auth/verify-email~~    # ELIMINADO Oct 2025
GET    /api/auth/sessions        # Listar sesiones activas
DELETE /api/auth/sessions/:id    # Cerrar sesion especifica
```

**Funcionalidades:**
- Registro con validacion de email
- Login con bcrypt password hashing
- JWT generation (7 dias expiration)
- Refresh token mechanism (30 dias)
- Multi-device session management
- Password reset flow

**Stack:**
- `jsonwebtoken` para JWT
- `bcrypt` para password hashing (12 rounds)
- `nodemailer` para emails (opcional)

**Ejemplo de Implementacion:**

```typescript
// auth.service.ts
export class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.repository.findByEmail(email);
    if (!user) throw new UnauthorizedError('Invalid credentials');

    const isValid = await bcrypt.compare(password, user.encrypted_password);
    if (!isValid) throw new UnauthorizedError('Invalid credentials');

    // Generate JWT
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { sub: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '30d' }
    );

    // Create session
    await this.repository.createSession(user.id, token);

    return { user, token, refreshToken };
  }
}
```

---

### 2. Gamification Module (Sistema de Gamificacion)

**Proposito:** ML Coins, rangos Maya, logros, power-ups, leaderboards

**Endpoints: 45**

```typescript
// ML Coins
GET    /api/gamification/coins/:userId          # Balance de ML Coins
GET    /api/gamification/transactions/:userId   # Historial de transacciones
POST   /api/gamification/coins/award            # Otorgar ML Coins
POST   /api/gamification/coins/spend            # Gastar ML Coins

// User Stats
GET    /api/gamification/stats/:userId          # Estadisticas completas
PUT    /api/gamification/stats/:userId/xp       # Actualizar XP
GET    /api/gamification/level/:userId          # Nivel actual

// Rangos Maya
GET    /api/gamification/ranks                  # Todos los rangos
GET    /api/gamification/ranks/:userId          # Historial de rangos
POST   /api/gamification/ranks/advance          # Avanzar de rango
GET    /api/gamification/ranks/:userId/progress # Progreso a siguiente rango

// Achievements
GET    /api/gamification/achievements           # Todos los logros
GET    /api/gamification/achievements/:userId   # Logros del usuario
POST   /api/gamification/achievements/unlock    # Desbloquear logro
GET    /api/gamification/achievements/:id       # Detalle de logro

// Power-ups (Comodines)
GET    /api/gamification/powerups               # Lista de power-ups
GET    /api/gamification/powerups/:userId       # Inventario de usuario
POST   /api/gamification/powerups/purchase      # Comprar power-up
POST   /api/gamification/powerups/use           # Usar power-up

// Leaderboards
GET    /api/gamification/leaderboard            # Leaderboard global
GET    /api/gamification/leaderboard/classroom/:id  # Por classroom
GET    /api/gamification/leaderboard/weekly     # Semanal
GET    /api/gamification/leaderboard/monthly    # Mensual
```

**Funcionalidades Clave:**

**ML Coins Economy:**
- Sistema de economia cerrada
- Transacciones auditadas
- Tipos: earned, spent, admin_adjustment, refund
- Balance inicial: 100 ML
- Recompensas variables por ejercicio

**Rangos Maya (5 niveles):**
1. **Nacom** - Rank 1 (0-500 XP)
2. **Batab** - Rank 2 (501-1500 XP)
3. **Holcatte** - Rank 3 (1501-3500 XP)
4. **Guerrero** - Rank 4 (3501-7000 XP)
5. **Mercenario** - Rank 5 (7001+ XP)

**Achievements (50+ logros):**
- Categories: progress, streak, completion, social, special
- Rarities: common, rare, epic, legendary
- Rewards: ML Coins + XP

**Power-ups (3 tipos):**
- **Pistas** (15 ML) - Hints durante ejercicio
- **Vision Lectora** (25 ML) - Highlight texto relevante
- **Segunda Oportunidad** (40 ML) - Retry sin penalizacion

---

### 3. Educational Module (Contenido Educativo)

**Proposito:** Modulos, ejercicios, contenido de Marie Curie

**Endpoints: 60**

```typescript
// Modules
GET    /api/educational/modules                 # Listar modulos
GET    /api/educational/modules/:id             # Detalle de modulo
POST   /api/educational/modules                 # Crear modulo (admin)
PUT    /api/educational/modules/:id             # Actualizar modulo
DELETE /api/educational/modules/:id             # Eliminar modulo
PATCH  /api/educational/modules/:id/publish     # Publicar/despublicar

// Exercises (27 mecanicas)
GET    /api/educational/exercises               # Listar ejercicios
GET    /api/educational/exercises/:id           # Detalle de ejercicio
POST   /api/educational/exercises               # Crear ejercicio
PUT    /api/educational/exercises/:id           # Actualizar ejercicio
DELETE /api/educational/exercises/:id           # Eliminar ejercicio
POST   /api/educational/exercises/:id/duplicate # Duplicar ejercicio
POST   /api/educational/exercises/:id/submit    # Enviar respuesta

// Marie Curie Content
GET    /api/educational/marie-curie             # Contenido curado
GET    /api/educational/marie-curie/:id         # Detalle
POST   /api/educational/marie-curie             # Crear contenido
PUT    /api/educational/marie-curie/:id         # Actualizar
```

**27 Mecanicas de Ejercicios:**

**Modulo 1: Comprension Literal (5)**
1. crucigrama_cientifico
2. linea_tiempo_visual
3. mapa_conceptual
4. emparejamiento
5. sopa_letras

**Modulo 2: Comprension Inferencial (5)**
6. detective_textual
7. construccion_hipotesis
8. prediccion_narrativa
9. puzzle_contexto
10. rueda_inferencias

**Modulo 3: Comprension Critica (5)**
11. tribunal_opiniones
12. debate_digital
13. analisis_fuentes
14. podcast_argumentativo
15. matriz_perspectivas

**Modulo 4: Lectura Digital (5)**
16. verificador_fake_news
17. infografia_interactiva
18. quiz_tiktok
19. navegacion_hipertextual
20. analisis_memes

**Modulo 5: Produccion Lectora (3)**
21. diario_multimedia
22. comic_digital
23. video_carta_futuro

**Auxiliares (4)**
24. comprension_auditiva
25. collage_digital
26. texto_movimiento
27. call_to_action

---

### 4. Progress Module (Tracking y Analytics)

**Proposito:** Seguimiento de progreso, intentos, sesiones, analytics

**Endpoints: 40**

```typescript
// Module Progress
GET    /api/progress/modules/:userId            # Progreso por modulos
GET    /api/progress/modules/:userId/:moduleId  # Progreso especifico
POST   /api/progress/modules/start              # Iniciar modulo
PUT    /api/progress/modules/update             # Actualizar progreso

// Exercise Attempts
GET    /api/progress/attempts/:userId           # Historial de intentos
GET    /api/progress/attempts/:attemptId        # Detalle de intento
POST   /api/progress/attempts                   # Registrar intento
GET    /api/progress/attempts/exercise/:id      # Intentos de ejercicio

// Learning Sessions
GET    /api/progress/sessions/:userId           # Sesiones de estudio
POST   /api/progress/sessions/start             # Iniciar sesion
PUT    /api/progress/sessions/:id/end           # Finalizar sesion

// Analytics
GET    /api/progress/analytics/:userId          # Analytics completos
GET    /api/progress/analytics/:userId/summary  # Resumen
GET    /api/progress/analytics/trends           # Tendencias
GET    /api/progress/analytics/performance      # Performance por tipo
```

**Datos Trackeados:**
- Progress percentage por modulo
- Exercise attempts con score y tiempo
- Learning sessions con duracion
- Strengths y weaknesses
- Time spent analytics
- Score trends over time

---

### 5. Social Module (Features Sociales)

**Proposito:** Schools, classrooms, teams, competitions, eventos

**Endpoints: 55**

```typescript
// Schools
GET    /api/social/schools                      # Listar escuelas
GET    /api/social/schools/:id                  # Detalle
POST   /api/social/schools                      # Crear escuela
PUT    /api/social/schools/:id                  # Actualizar

// Classrooms
GET    /api/social/classrooms                   # Listar classrooms
GET    /api/social/classrooms/:id               # Detalle
POST   /api/social/classrooms                   # Crear classroom
POST   /api/social/classrooms/join              # Unirse con codigo
DELETE /api/social/classrooms/:id/leave         # Salir de classroom
GET    /api/social/classrooms/:id/members       # Miembros

// Teams
GET    /api/social/teams                        # Listar equipos
POST   /api/social/teams                        # Crear equipo
POST   /api/social/teams/:id/join               # Unirse a equipo
GET    /api/social/teams/:id/members            # Miembros
PUT    /api/social/teams/:id                    # Actualizar equipo

// Competitions
GET    /api/social/competitions                 # Listar competencias
POST   /api/social/competitions                 # Crear competencia
GET    /api/social/competitions/:id/leaderboard # Ranking
POST   /api/social/competitions/:id/participate # Participar

// Events
GET    /api/social/events                       # Eventos escolares
POST   /api/social/events                       # Crear evento
GET    /api/social/events/:id                   # Detalle
```

---

### 6. Content Module (Gestion de Contenido)

**Proposito:** Media uploads, file storage, Marie Curie content

**Endpoints: 30**

```typescript
// Media Files
POST   /api/content/upload                      # Upload file
GET    /api/content/files                       # Listar archivos
GET    /api/content/files/:id                   # Detalle
DELETE /api/content/files/:id                   # Eliminar archivo
GET    /api/content/files/:id/url               # Signed URL

// Categories
image, video, audio, document
avatar, exercise, marie_curie, general
```

**File Storage:**
- **Development:** MinIO
- **Production:** AWS S3
- **Max size:** 10 MB
- **Formats:** JPG, PNG, GIF, MP4, MP3, PDF
- **CDN:** CloudFlare (planned)

---

### 7. Admin Module (Administracion)

**Proposito:** User management, tenant management, system config

**Endpoints: 80**

```typescript
// User Management
GET    /api/admin/users                         # Listar usuarios
GET    /api/admin/users/:id                     # Detalle usuario
PUT    /api/admin/users/:id                     # Actualizar usuario
DELETE /api/admin/users/:id                     # Eliminar usuario
POST   /api/admin/users/:id/impersonate         # Impersonate user
PUT    /api/admin/users/:id/role                # Cambiar rol
PUT    /api/admin/users/:id/status              # Cambiar status

// Tenant Management
GET    /api/admin/tenants                       # Listar tenants
POST   /api/admin/tenants                       # Crear tenant
PUT    /api/admin/tenants/:id                   # Actualizar tenant
PUT    /api/admin/tenants/:id/settings          # Settings

// System Configuration
GET    /api/admin/config                        # Config general
PUT    /api/admin/config/:key                   # Actualizar setting
GET    /api/admin/feature-flags                 # Feature flags
PUT    /api/admin/feature-flags/:name           # Toggle feature
```

---

### 8. Teacher Module (Dashboard de Profesores)

**Proposito:** Classroom management, student monitoring, assignments

**Endpoints: 70**

```typescript
// Classroom Management
GET    /api/teacher/classrooms                  # Mis classrooms
GET    /api/teacher/classrooms/:id/students     # Estudiantes
POST   /api/teacher/classrooms/:id/students     # Agregar estudiante
DELETE /api/teacher/classrooms/:id/students/:sid # Remover estudiante
GET    /api/teacher/classrooms/:id/analytics    # Analytics

// Student Monitoring
GET    /api/teacher/students/:id/progress       # Progreso
GET    /api/teacher/students/:id/reports        # Reportes
GET    /api/teacher/students/:id/attempts       # Intentos
GET    /api/teacher/students/:id/sessions       # Sesiones

// Assignments
GET    /api/teacher/assignments                 # Listar asignaciones
POST   /api/teacher/assignments                 # Crear asignacion
PUT    /api/teacher/assignments/:id             # Actualizar
GET    /api/teacher/assignments/:id/submissions # Entregas
```

---

### 9. Analytics Module (Reportes y Metricas)

**Proposito:** Business intelligence, dashboards, exportacion

**Endpoints: 35**

```typescript
// Platform Analytics
GET    /api/analytics/overview                  # Dashboard general
GET    /api/analytics/users                     # User metrics
GET    /api/analytics/engagement                # Engagement metrics
GET    /api/analytics/retention                 # Retention analytics

// Educational Analytics
GET    /api/analytics/modules                   # Module performance
GET    /api/analytics/exercises                 # Exercise analytics
GET    /api/analytics/completion-rates          # Completion metrics

// Gamification Analytics
GET    /api/analytics/ml-coins                  # ML Coins economy
GET    /api/analytics/achievements              # Achievement stats
GET    /api/analytics/ranks                     # Rank distribution

// Export
POST   /api/analytics/export/csv                # Export CSV
POST   /api/analytics/export/pdf                # Export PDF
POST   /api/analytics/export/excel              # Export Excel
```

---

### 10. Notifications Module (Sistema de Notificaciones)

**Proposito:** Push notifications, in-app, email, real-time

**Endpoints: 25**

```typescript
// User Notifications
GET    /api/notifications                       # Listar notificaciones
GET    /api/notifications/:id                   # Detalle
PUT    /api/notifications/:id/read              # Marcar como leida
PUT    /api/notifications/read-all              # Marcar todas
DELETE /api/notifications/:id                   # Eliminar

// Preferences
GET    /api/notifications/preferences           # Preferencias
PUT    /api/notifications/preferences           # Actualizar

// Admin
POST   /api/notifications/broadcast             # Broadcast message
POST   /api/notifications/targeted              # Targeted notification
```

**Tipos de Notificaciones:**
- achievement_unlocked
- rank_advanced
- module_completed
- classroom_joined
- assignment_due
- leaderboard_position
- team_activity

---

### 11. System Module (Configuracion y Logs)

**Proposito:** Health checks, logs, monitoring, feature flags

**Endpoints: 15**

```typescript
// Health
GET    /api/health                              # Health check
GET    /api/health/db                           # Database health
GET    /api/health/storage                      # Storage health

// Logs
GET    /api/system/logs                         # Application logs
GET    /api/system/audit-logs                   # Audit trail
GET    /api/system/error-logs                   # Error logs

// Monitoring
GET    /api/system/metrics                      # System metrics
GET    /api/system/performance                  # Performance stats
```

---

## Servicios Transversales

### 1. Authentication Service

```typescript
export class AuthenticationService {
  async validateJWT(token: string): Promise<JWTPayload> {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  async refreshToken(refreshToken: string): Promise<string> {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    return this.generateAccessToken(payload);
  }
}
```

### 2. RLS Context Service

```typescript
export class RLSContextService {
  async setUserContext(client: PoolClient, user: User): Promise<void> {
    await client.query(`
      SET LOCAL request.jwt.claim.sub = $1;
      SET LOCAL request.jwt.claim.role = $2;
      SET LOCAL request.jwt.claim.tenant_id = $3;
    `, [user.id, user.role, user.tenant_id]);
  }
}
```

### 3. Notification Service

```typescript
export class NotificationService {
  async sendNotification(userId: string, notification: Notification) {
    // Save to database
    await this.repository.create(userId, notification);

    // Emit real-time event
    this.socketService.emit(`user:${userId}`, 'notification:new', notification);

    // Send push notification (optional)
    if (notification.push_enabled) {
      await this.pushService.send(userId, notification);
    }
  }
}
```

---

## Integracion con PostgreSQL + RLS

### RLS Middleware

```typescript
export const applyRLS = (pool: Pool) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next();

    const client = await pool.connect();

    try {
      // Set PostgreSQL session variables
      await client.query(`
        SET LOCAL request.jwt.claim.sub = $1;
        SET LOCAL request.jwt.claim.email = $2;
        SET LOCAL request.jwt.claim.role = $3;
        SET LOCAL request.jwt.claim.tenant_id = $4;
      `, [req.user.id, req.user.email, req.user.role, req.user.tenant_id]);

      // Attach client to request
      req.dbClient = client;

      // Release on response finish
      res.on('finish', () => client.release());

      next();
    } catch (error) {
      client.release();
      next(error);
    }
  };
};
```

---

## Real-time con Socket.IO

### Socket Handler

```typescript
export const initializeSocket = (httpServer: Server) => {
  const io = new SocketIO(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST']
    }
  });

  // Auth middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.data.user = payload;
    next();
  });

  // Events
  io.on('connection', (socket) => {
    const user = socket.data.user;

    // Join personal room
    socket.join(`user:${user.id}`);

    // Join classroom rooms
    socket.on('classroom:join', (classroomId) => {
      socket.join(`classroom:${classroomId}`);
    });

    // Handle events
    socket.on('achievement:unlock', async (data) => {
      io.to(`classroom:${data.classroomId}`).emit('achievement:new', data);
    });
  });

  return io;
};
```

---

## Ejemplos de Implementacion

### Ejemplo Completo: GamificationService

```typescript
// gamification.service.ts
export class GamificationService {
  constructor(
    private repository: GamificationRepository,
    private notificationService: NotificationService,
    private io: SocketServer
  ) {}

  async awardMLCoins(
    userId: string,
    amount: number,
    reason: string,
    referenceId?: string
  ): Promise<number> {
    // Get current balance
    const stats = await this.repository.getUserStats(userId);
    const newBalance = stats.ml_coins + amount;

    // Update balance
    await this.repository.updateMLCoins(userId, newBalance);

    // Create transaction record
    await this.repository.createTransaction({
      userId,
      amount,
      transactionType: 'earned_exercise',
      reason,
      referenceId,
      balanceAfter: newBalance
    });

    // Send notification
    await this.notificationService.sendNotification(userId, {
      type: 'ml_coins_earned',
      title: 'ML Coins Earned!',
      message: `You earned ${amount} ML Coins`,
      data: { amount, reason }
    });

    // Emit real-time event
    this.io.to(`user:${userId}`).emit('ml_coins:updated', {
      newBalance,
      change: amount
    });

    return newBalance;
  }

  async unlockAchievement(
    userId: string,
    achievementId: string
  ): Promise<void> {
    // Check if already unlocked
    const existing = await this.repository.getUserAchievement(
      userId,
      achievementId
    );
    if (existing) {
      throw new ConflictError('Achievement already unlocked');
    }

    // Get achievement details
    const achievement = await this.repository.getAchievement(achievementId);

    // Unlock achievement
    await this.repository.unlockAchievement(userId, achievementId);

    // Award rewards
    await this.awardMLCoins(
      userId,
      achievement.ml_coins_reward,
      `Achievement: ${achievement.name}`,
      achievementId
    );

    // Emit celebration event
    this.io.to(`user:${userId}`).emit('achievement:unlocked', {
      achievement,
      rewards: {
        mlCoins: achievement.ml_coins_reward,
        xp: achievement.xp_reward
      }
    });
  }
}
```

---

## Metricas del Backend

| Metrica | Valor |
|---------|-------|
| **Total Modulos** | 11 modulos funcionales |
| **Total Endpoints** | 470+ REST endpoints |
| **Controllers** | 35+ controllers |
| **Services** | 40+ services |
| **Repositories** | 30+ repositories |
| **Middleware** | 15+ middleware |
| **Socket Events** | 25+ real-time events |
| **LOC Backend** | ~45,000 lines |
| **Response Time (p95)** | < 200ms |
| **Throughput** | 500+ req/s |

---

## Referencias

- [Arquitectura General](./ARQUITECTURA-GENERAL.md)
- [API Reference](../apis/API-REFERENCE.md)
- [Types Mapping](../tipos-compartidos/TYPES-MAPPING.md)
- [Sistema de Seguridad](../seguridad/SISTEMA-SEGURIDAD.md)

---

**Ultima actualizacion:** Octubre 2025
**Mantenido por:** GAMILIT Platform Team
