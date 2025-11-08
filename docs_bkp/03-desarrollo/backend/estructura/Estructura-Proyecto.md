<!-- RFC-0001: Estándar de Documentación Técnica -->
<!-- Proyecto: GAMILIT - Plataforma Gamificada de Machine Learning -->
<!-- Documento: Estructura del Proyecto Backend -->
<!-- Versión: 1.0.0 -->
<!-- Última Actualización: 2025-11-01 -->

# Estructura del Proyecto Backend

## Información General

Este documento describe la estructura de directorios, arquitectura y convenciones del backend de GAMILIT

---

## Tabla de Contenidos

1. [Estructura de Directorios](#estructura-de-directorios)
2. [Flujo de Inicialización](#flujo-de-inicialización)
3. [Patrón de Arquitectura](#patrón-de-arquitectura-clean-architecture)
4. [Convenciones de Código](#convenciones-de-código)
5. [Configuración](#configuración)

---

## Estructura de Directorios

```
backend/
├── src/
│   ├── app.ts                    # Configuración de Express
│   ├── server.ts                 # Punto de entrada del servidor
│   │
│   ├── config/                   # Configuración global
│   │   ├── env.ts               # Variables de entorno
│   │   └── jwt.ts               # Configuración JWT
│   │
│   ├── database/                 # Conexión PostgreSQL
│   │   └── pool.ts              # Pool de conexiones
│   │
│   ├── middleware/               # 8 middlewares globales
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── ownership.middleware.ts
│   │   ├── permission.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   ├── rls.middleware.ts
│   │   ├── tenant.middleware.ts
│   │   └── validation.middleware.ts
│   │
│   ├── modules/                  # 11 módulos funcionales
│   │   ├── admin/
│   │   │   ├── admin.types.ts
│   │   │   ├── admin.validation.ts
│   │   │   ├── admin.routes.ts
│   │   │   ├── admin.controller.ts
│   │   │   ├── admin.service.ts
│   │   │   ├── admin.repository.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.types.ts
│   │   │   ├── auth.validation.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   └── services/
│   │   │       ├── session-management.service.ts
│   │   │       ├── password-recovery.service.ts
│   │   │       ├── email-verification.service.ts
│   │   │       └── security.service.ts
│   │   │
│   │   ├── educational/
│   │   │   ├── educational.types.ts
│   │   │   ├── educational.routes.ts
│   │   │   └── services/
│   │   │       ├── modules.service.ts
│   │   │       ├── exercises.service.ts
│   │   │       ├── progress.service.ts
│   │   │       ├── scoring.service.ts
│   │   │       └── analytics.service.ts
│   │   │
│   │   ├── gamification/
│   │   │   ├── gamification.types.ts
│   │   │   ├── gamification.routes.ts
│   │   │   ├── gamification.service.ts
│   │   │   ├── gamification.repository.ts
│   │   │   └── missions/
│   │   │       ├── missions.types.ts
│   │   │       ├── missions.routes.ts
│   │   │       ├── missions.controller.ts
│   │   │       ├── missions.service.ts
│   │   │       ├── missions.repository.ts
│   │   │       └── missions.cron.ts
│   │   │
│   │   ├── health/
│   │   │   └── health.routes.ts
│   │   │
│   │   ├── notifications/
│   │   │   ├── notifications.types.ts
│   │   │   ├── notifications.routes.ts
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.repository.ts
│   │   │   ├── notifications.cron.ts
│   │   │   └── services/
│   │   │       ├── notifications.service.ts
│   │   │       └── realtime.service.ts
│   │   │
│   │   ├── progress/
│   │   │   ├── progress.types.ts
│   │   │   ├── progress.routes.ts
│   │   │   ├── activities.controller.ts
│   │   │   ├── activities.service.ts
│   │   │   └── activities.repository.ts
│   │   │
│   │   ├── social/
│   │   │   ├── friends/
│   │   │   │   ├── friends.types.ts
│   │   │   │   ├── friends.routes.ts
│   │   │   │   ├── friends.controller.ts
│   │   │   │   ├── friends.service.ts
│   │   │   │   └── friends.repository.ts
│   │   │   └── guilds/
│   │   │       ├── guilds.types.ts
│   │   │       ├── guilds.routes.ts
│   │   │       ├── guilds.controller.ts
│   │   │       ├── guilds.service.ts
│   │   │       └── guilds.repository.ts
│   │   │
│   │   └── teacher/
│   │       ├── teacher.types.ts
│   │       ├── teacher.routes.ts
│   │       └── services/
│   │           ├── classroom.service.ts
│   │           ├── assignments.service.ts
│   │           ├── grading.service.ts
│   │           ├── student-progress.service.ts
│   │           └── analytics.service.ts
│   │
│   ├── shared/                   # Utilidades compartidas
│   │   ├── types/
│   │   │   ├── auth.types.ts
│   │   │   ├── error.types.ts
│   │   │   └── response.types.ts
│   │   └── utils/
│   │       ├── logger.ts
│   │       └── validation.ts
│   │
│   └── websocket/                # Socket.IO
│       ├── socket.server.ts
│       └── socket.auth.ts
│
├── package.json
├── tsconfig.json
├── nodemon.json
├── .env.example
└── .gitignore
```

---

## Flujo de Inicialización del Servidor

### Diagrama de Flujo

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

### Código de Inicialización

**server.ts:**
```typescript
import { createApp } from './app';
import { testDatabaseConnection } from './database/pool';
import { initializeSocketServer } from './websocket/socket.server';
import { startMissionsCronJobs } from './modules/gamification/missions/missions.cron';
import { startNotificationsCronJobs } from './modules/notifications/notifications.cron';
import { envConfig } from './config/env';
import { log } from './shared/utils/logger';

async function bootstrap(): Promise<void> {
  try {
    // 1. Validar configuración
    log.info('Validating environment configuration...');
    if (!envConfig.isValid()) {
      throw new Error('Invalid environment configuration');
    }

    // 2. Testar conexión a DB
    log.info('Testing database connection...');
    await testDatabaseConnection();
    log.info('Database connection successful');

    // 3. Crear aplicación Express
    const app = createApp();

    // 4. Crear servidor HTTP
    const httpServer = createServer(app);

    // 5. Inicializar WebSocket
    log.info('Initializing WebSocket server...');
    const io = initializeSocketServer(httpServer);
    realtimeService.initialize(io);
    log.info('WebSocket server initialized');

    // 6. Iniciar Cron Jobs
    log.info('Starting cron jobs...');
    startMissionsCronJobs();
    startNotificationsCronJobs();
    log.info('Cron jobs started');

    // 7. Iniciar servidor
    const PORT = envConfig.port;
    httpServer.listen(PORT, () => {
      log.info('='.repeat(50));
      log.info(`Server running on port ${PORT}`);
      log.info(`Environment: ${envConfig.nodeEnv}`);
      log.info(`API: http://localhost:${PORT}/api`);
      log.info(`WebSocket: ws://localhost:${PORT}/socket.io/`);
      log.info('='.repeat(50));
    });

    // 8. Graceful shutdown
    setupGracefulShutdown(httpServer, io);

  } catch (error) {
    log.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
```

---

**app.ts:**
```typescript
import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { envConfig } from './config/env';
import { errorHandler } from './middleware/error.middleware';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import gamificationRoutes from './modules/gamification/gamification.routes';
import educationalRoutes from './modules/educational/educational.routes';
import teacherRoutes from './modules/teacher/teacher.routes';
import socialRoutes from './modules/social';
import notificationsRoutes from './modules/notifications/notifications.routes';
import adminRoutes from './modules/admin/admin.routes';
import progressRoutes from './modules/progress/progress.routes';
import healthRoutes from './modules/health/health.routes';

export function createApp(): Application {
  const app = express();

  // Security middlewares
  app.use(helmet());
  app.use(cors({
    origin: envConfig.corsOrigin,
    credentials: true,
  }));

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Register routes
  app.use('/api/auth', authRoutes);
  app.use('/api/gamification', gamificationRoutes);
  app.use('/api/educational', educationalRoutes);
  app.use('/api/teacher', teacherRoutes);
  app.use('/api/social', socialRoutes);
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/health', healthRoutes);

  // Error handler (debe ser el último middleware)
  app.use(errorHandler);

  return app;
}
```

---

## Patrón de Arquitectura: Clean Architecture

### Estructura de Módulo

Cada módulo sigue el mismo patrón:

```
module/
├── module.types.ts         # Interfaces y tipos TypeScript
├── module.validation.ts    # Validaciones con Joi/Zod
├── module.routes.ts        # Definición de rutas Express
├── module.controller.ts    # Controladores (request/response)
├── module.service.ts       # Lógica de negocio
├── module.repository.ts    # Acceso a base de datos
└── index.ts               # Exports públicos
```

---

### Flujo de Request

```
Request → Route → Middleware → Controller → Service → Repository → Database
                                    ↓
Response ← Controller ← Service ← Repository
```

**Descripción:**

1. **Request** entra al servidor
2. **Route** matchea el endpoint
3. **Middleware** valida autenticación/autorización
4. **Controller** extrae datos del request
5. **Service** ejecuta lógica de negocio
6. **Repository** accede a la base de datos
7. **Response** vuelve al cliente

---

### Responsabilidades por Capa

#### 1. Routes

**Responsabilidad:** Define endpoints y aplica middlewares

**Ejemplo:**
```typescript
// auth.routes.ts
import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticateJWT } from '@/middleware/auth.middleware';
import { validateRequest } from '@/middleware/validation.middleware';
import { loginSchema, registerSchema } from './auth.validation';

const router = Router();

router.post('/register',
  validateRequest(registerSchema),
  authController.register
);

router.post('/login',
  validateRequest(loginSchema),
  authController.login
);

router.get('/me',
  authenticateJWT,
  authController.getCurrentUser
);

export default router;
```

---

#### 2. Controller

**Responsabilidad:** Maneja request/response HTTP, valida entrada básica

**Ejemplo:**
```typescript
// auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName } = req.body;

      const result = await authService.register({
        email,
        password,
        firstName,
        lastName,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
```

---

#### 3. Service

**Responsabilidad:** Implementa lógica de negocio, orquesta operaciones

**Ejemplo:**
```typescript
// auth.service.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authRepository } from './auth.repository';
import { jwtConfig } from '@/config/jwt';

export const authService = {
  async register(userData: RegisterDTO) {
    // 1. Verificar si email ya existe
    const existingUser = await authRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // 3. Crear usuario
    const user = await authRepository.createUser({
      ...userData,
      password: hashedPassword,
    });

    // 4. Generar tokens
    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.accessExpiry }
    );

    // 5. Retornar resultado
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken,
    };
  },

  async login(email: string, password: string) {
    // 1. Buscar usuario
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // 2. Verificar password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // 3. Generar tokens
    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.accessExpiry }
    );

    // 4. Retornar resultado
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken,
    };
  },
};
```

---

#### 4. Repository

**Responsabilidad:** Abstrae acceso a datos, queries SQL

**Ejemplo:**
```typescript
// auth.repository.ts
import { pool } from '@/database/pool';

export const authRepository = {
  async findByEmail(email: string) {
    const query = `
      SELECT id, email, password, first_name, last_name, role, status
      FROM users.users
      WHERE email = $1;
    `;

    const result = await pool.query(query, [email]);

    return result.rows[0] || null;
  },

  async createUser(userData: CreateUserDTO) {
    const query = `
      INSERT INTO users.users (email, password, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first_name, last_name, role;
    `;

    const values = [
      userData.email,
      userData.password,
      userData.firstName,
      userData.lastName,
      userData.role || 'student',
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
  },
};
```

---

#### 5. Middleware

**Responsabilidad:** Autenticación, autorización, validación, rate limiting

**Ejemplo:**
```typescript
// auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '@/config/jwt';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateJWT = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'No token provided',
        },
      });
    }

    const token = authHeader.replace('Bearer ', '');

    const payload = jwt.verify(token, jwtConfig.secret) as any;

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      },
    });
  }
};
```

---

## Convenciones de Código

### Nomenclatura

**Archivos:**
```
kebab-case.ts
auth.service.ts
user-management.controller.ts
```

**Clases:**
```typescript
class UserService { }
class DatabaseConnection { }
```

**Funciones y Variables:**
```typescript
function getUserById() { }
const firstName = 'John';
let isActive = true;
```

**Constantes:**
```typescript
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT = 5000;
```

**Interfaces:**
```typescript
interface User { }
interface AuthRequest extends Request { }
// Sin prefijo 'I'
```

---

### Respuestas API

**Success:**
```typescript
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    // ... más datos
  }
}
```

**Error:**
```typescript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data"
  }
}
```

---

### Logging

```typescript
import { log } from '@/shared/utils/logger';

log.info('Informational message');
log.warn('Warning message');
log.error('Error message', error);
log.debug('Debug message'); // Solo en development
```

---

## Configuración

### Variables de Entorno

**Archivo:** `.env`

```env
# Server
NODE_ENV=development
PORT=3006

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=glit_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key_min_32_chars
JWT_ACCESS_EXPIRY=7d
JWT_REFRESH_EXPIRY=30d

# CORS
CORS_ORIGIN=http://localhost:5173

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_password
```

---

### Config Files

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Navegación

- **Índice Principal:** [README.md](./README.md)
- **Siguiente:** [Modulos-Core.md](./Modulos-Core.md)

---

**Documentación generada siguiendo RFC-0001**
**Proyecto:** GAMILIT - Plataforma Gamificada de Machine Learning
**Última Actualización:** 2025-11-01
