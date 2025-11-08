# Arquitectura General - GAMILIT Platform

**Version**: 2.0
**Fecha**: Octubre 2025
**Stack**: React SPA + Node.js + PostgreSQL

---

## 🔗 Trazabilidad

**Casos de uso relacionados:**
- [UC-STU-001: Registro de estudiante](../../01-requerimientos/casos-uso/student/UC-STU-001-registro.md)
- [UC-STU-002: Onboarding de estudiante](../../01-requerimientos/casos-uso/student/UC-STU-002-onboarding.md)
- [UC-STU-003: Resolver ejercicio](../../01-requerimientos/casos-uso/student/UC-STU-003-resolver-ejercicio.md)

**User Stories:**
- [US-FUND-001: Autenticación básica JWT](../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/historias/US-FUND-001-autenticacion-basica-jwt.md)
- [US-FUND-004: Infraestructura técnica base](../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/historias/US-FUND-004-infraestructura-tecnica-base.md)
- [US-FUND-006: API RESTful básica](../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/historias/US-FUND-006-api-restful-basica.md)
- [US-FUND-002: Perfiles de usuario básicos](../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/historias/US-FUND-002-perfiles-usuario-basicos.md)
- [US-FUND-005: Sistema de sesiones y estado](../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/historias/US-FUND-005-sistema-sesiones-estado.md)
- [US-FUND-003: Dashboard principal estudiante](../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/historias/US-FUND-003-dashboard-principal-estudiante.md)
- [US-FUND-007: Navegación y routing](../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/historias/US-FUND-007-navegacion-routing.md)
- [US-FUND-008: UI/UX base](../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/historias/US-FUND-008-ui-ux-base.md)

**Épicas:**
- [EAI-001: Fundamentos](../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/_MAP.md) (60 SP, $22,000 MXN)
- [EAI-002: Actividades](../../04-planificacion/01-alcance-inicial/EAI-002-actividades/_MAP.md) (ejercicios interactivos)
- [EAI-003: Gamificación](../../04-planificacion/01-alcance-inicial/EAI-003-gamificacion/_MAP.md) (sistema de rangos)
- [EAI-004: Analytics](../../04-planificacion/01-alcance-inicial/EAI-004-analytics/_MAP.md) (tracking y métricas)

**Requerimientos funcionales:**
- [Módulos educativos](../../01-requerimientos/modulos/) - Sistema de contenidos
- [Gamificación](../../01-requerimientos/gamificacion/) - Sistema Maya de rangos
- [Interfaces](../../01-requerimientos/interfaces/) - Diseño y componentes
- [Definiciones del proyecto](../../01-requerimientos/proyecto/) - Alcance y objetivos

---

## Tabla de Contenidos

1. [Vision General](#vision-general)
2. [Stack Tecnologico Completo](#stack-tecnologico-completo)
3. [Arquitectura de Capas](#arquitectura-de-capas)
4. [Patrones de Diseno](#patrones-de-diseno)
5. [Flujos de Datos](#flujos-de-datos)
6. [Metricas del Sistema](#metricas-del-sistema)

---

## Vision General

**GAMILIT (Gamified Learning Interactive Tool)** es una plataforma educativa moderna construida con arquitectura monolitica SPA en frontend y API REST con Node.js en backend, usando PostgreSQL como base de datos nativa con Row Level Security (RLS) para multi-tenancy.

### Arquitectura High-Level

```
┌─────────────────────────────────────────────────────────────────┐
│                    GAMILIT Platform Architecture                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                         │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  React SPA (Port 5173)                                     │  │
│  │  - React 19.2.0 + TypeScript 5.9.3                        │  │
│  │  - Vite 7.1.10 (Build Tool)                               │  │
│  │  - React Router 7.9.4 (Routing)                           │  │
│  │  - Zustand 5.0.8 (State Management)                       │  │
│  │  - Tailwind CSS 4.1.14 (Styling)                          │  │
│  │  - 592 archivos TypeScript                                │  │
│  │  - 33 mecanicas de ejercicios                             │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                                │
                                ▼ HTTP/REST + WebSocket
┌──────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                          │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  NestJS Backend API (Port 3006)                           │  │
│  │  - Node.js 20+ LTS + TypeScript 5.9+                      │  │
│  │  - NestJS 11.x                                             │  │
│  │  - 11 modulos funcionales                                  │  │
│  │  - 470+ endpoints REST                                     │  │
│  │  - JWT Authentication (Passport)                           │  │
│  │  - Socket.IO 4.6+ (Real-time)                             │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                                │
                                ▼ SQL Queries + RLS
┌──────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL 16+ Database                                   │  │
│  │  - 11 schemas especializados                              │  │
│  │  - 44 tablas                                               │  │
│  │  - 159+ politicas RLS                                      │  │
│  │  - 40+ funciones almacenadas                               │  │
│  │  - 279+ indices                                            │  │
│  │  - Multi-tenant nativo                                     │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                        STORAGE LAYER                              │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  MinIO / AWS S3 (File Storage)                            │  │
│  │  - Imagenes, videos, audios                               │  │
│  │  - Contenido multimedia de Marie Curie                     │  │
│  │  - Avatares de usuarios                                    │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Stack Tecnologico Completo

### Frontend Stack

| Categoria | Tecnologia | Version | Proposito |
|-----------|------------|---------|-----------|
| **Core Framework** | React | 19.2.0 | UI framework principal |
| **Lenguaje** | TypeScript | 5.9.3 | Type safety |
| **Build Tool** | Vite | 7.1.10 | Bundling y HMR |
| **Routing** | React Router DOM | 7.9.4 | Navegacion SPA |
| **State Management** | Zustand | 5.0.8 | Global state |
| **Server State** | TanStack Query | 5.90.3 | Cache y sincronizacion |
| **Forms** | React Hook Form | 7.63.0 | Manejo de formularios |
| **Validation** | Zod | 4.1.12 | Schema validation |
| **Styling** | Tailwind CSS | 4.1.14 | Utility-first CSS |
| **UI Components** | Headless UI | 2.2.9 | Accessible components |
| **Animations** | Framer Motion | 12.23.24 | Animaciones fluidas |
| **Icons** | Lucide React | 0.545.0 | Icon library |
| **Notifications** | React Hot Toast | 2.6.0 | Toast messages |
| **Testing** | Vitest | 3.2.4 | Unit testing |
| **E2E Testing** | Playwright | 1.40.1 | End-to-end testing |

### Backend Stack

| Categoria | Tecnologia | Version | Proposito |
|-----------|------------|---------|-----------|
| **Runtime** | Node.js | 20+ LTS | JavaScript runtime |
| **Lenguaje** | TypeScript | 5.9+ | Type safety |
| **Framework** | NestJS | 11.x | Progressive Node.js framework |
| **ORM** | TypeORM | 0.3+ | Object-relational mapping |
| **Database Client** | pg (node-postgres) | 8.11+ | PostgreSQL driver |
| **Authentication** | Passport + JWT | 11.0+ | Auth framework |
| **Password Hash** | bcrypt | 5.1+ | Password encryption |
| **Validation** | class-validator | 0.14+ | DTO validation |
| **Real-time** | Socket.IO | 4.6+ | WebSocket server |
| **File Upload** | Multer | 1.4+ | File handling |
| **Storage** | AWS SDK / MinIO | 7.1+ | Object storage |
| **Security Headers** | Helmet | 7.1+ | HTTP security |
| **Rate Limiting** | @nestjs/throttler | 5.0+ | API throttling |
| **CORS** | @nestjs/platform-express | Built-in | Cross-origin |
| **Logging** | Winston | 3.18+ | Structured logging |
| **API Docs** | @nestjs/swagger | 11.2+ | OpenAPI documentation |

### Database Stack

| Categoria | Tecnologia | Version | Proposito |
|-----------|------------|---------|-----------|
| **Database** | PostgreSQL | 16+ | RDBMS principal |
| **Connection Pool** | PgBouncer | Latest | Connection pooling |
| **Migrations** | Custom SQL | - | Schema management |
| **RLS** | PostgreSQL Native | - | Row-level security |

### DevOps Stack

| Categoria | Tecnologia | Proposito |
|-----------|------------|-----------|
| **Linting** | ESLint 9.36.0 | Code quality |
| **Formatting** | Prettier 3.6.2 | Code formatting |
| **Git Hooks** | Husky 8.0.3 | Pre-commit checks |
| **Staged Linting** | lint-staged 15.2.0 | Lint staged files |
| **Process Manager** | PM2 | Production runtime |
| **Container** | Docker | Containerization |

---

## Arquitectura de Capas

### 1. Capa de Presentacion (Frontend)

**Responsabilidades:**
- Renderizado de UI
- Manejo de interacciones de usuario
- Validacion de formularios
- Gestion de estado local
- Routing y navegacion
- Integracion con API backend

**Estructura de Carpetas:**

```
src/
├── app/                    # Configuracion de aplicacion
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx
│
├── shared/                 # Recursos compartidos
│   ├── components/         # Componentes reutilizables
│   │   ├── ui/            # Componentes base (Button, Input)
│   │   ├── forms/         # Componentes de formularios
│   │   ├── layout/        # Layout components (Header, Sidebar)
│   │   └── feedback/      # Modals, toasts, alerts
│   │
│   ├── stores/            # Zustand stores
│   │   ├── authStore.ts
│   │   ├── gamificationStore.ts
│   │   ├── progressStore.ts
│   │   └── exerciseStore.ts
│   │
│   ├── services/          # API clients
│   │   ├── api/
│   │   ├── auth/
│   │   └── exercise/
│   │
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useRealtime.ts
│   │   └── usePermissions.ts
│   │
│   └── types/             # TypeScript definitions
│       ├── auth.ts
│       ├── exercise.ts
│       └── database.types.ts
│
├── features/              # Feature modules
│   ├── student/           # Portal de estudiante
│   ├── teacher/           # Dashboard de profesor
│   └── admin/             # Panel de administracion
│
└── pages/                 # Paginas de ruta
    ├── student/
    ├── teacher/
    └── admin/
```

**Componentes Clave:**
- **592 archivos TypeScript**
- **33 mecanicas de ejercicios** implementadas
- **8 stores Zustand** para state management
- **50+ componentes compartidos**

### 2. Capa de Aplicacion (Backend)

**Responsabilidades:**
- Logica de negocio
- Validacion de datos
- Autenticacion y autorizacion
- Orquestacion de servicios
- Real-time communication
- File management

**Estructura de Modulos:**

```
backend/
├── src/
│   ├── config/                 # Configuraciones
│   │   ├── database.ts
│   │   ├── jwt.ts
│   │   ├── storage.ts
│   │   └── socket.ts
│   │
│   ├── middleware/             # Middleware global
│   │   ├── auth.middleware.ts
│   │   ├── rls.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   │
│   ├── modules/                # Modulos funcionales (11)
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   └── auth.routes.ts
│   │   │
│   │   ├── gamification/
│   │   ├── educational/
│   │   ├── progress/
│   │   ├── social/
│   │   ├── content/
│   │   ├── admin/
│   │   ├── teacher/
│   │   ├── analytics/
│   │   ├── notifications/
│   │   └── system/
│   │
│   ├── realtime/               # Socket.IO handlers
│   │   ├── socket.handler.ts
│   │   └── events/
│   │
│   ├── storage/                # File storage
│   │   ├── storage.service.ts
│   │   └── providers/
│   │
│   └── shared/
│       ├── types/
│       ├── utils/
│       └── validators/
```

**Modulos Funcionales (11):**
1. **auth** - Autenticacion JWT (15 endpoints)
2. **gamification** - ML Coins, rangos, logros (45 endpoints)
3. **educational** - Modulos y ejercicios (60 endpoints)
4. **progress** - Tracking y analytics (40 endpoints)
5. **social** - Classrooms, teams, eventos (55 endpoints)
6. **content** - Marie Curie content, media (30 endpoints)
7. **admin** - Gestion de sistema (80 endpoints)
8. **teacher** - Dashboard de profesores (70 endpoints)
9. **analytics** - Reportes y metricas (35 endpoints)
10. **notifications** - Sistema de notificaciones (25 endpoints)
11. **system** - Configuracion y logs (15 endpoints)

**Total: 470+ endpoints REST**

### 3. Capa de Datos (Database)

**Responsabilidades:**
- Persistencia de datos
- Integridad referencial
- Row-level security (RLS)
- Multi-tenancy
- Triggers y funciones
- Indices y optimizacion

**Esquemas (9):**

```
glit_database/
├── gamilit                      # Core utilities
├── auth_management              # Users, roles, sessions
│   └── 4 tablas
├── gamification_system          # ML Coins, ranks, achievements
│   └── 7 tablas
├── educational_content          # Modules, exercises
│   └── 2 tablas
├── progress_tracking            # Progress, attempts, sessions
│   └── 4 tablas
├── social_features              # Schools, classrooms, teams
│   └── 6 tablas
├── content_management           # Media, Marie Curie content
│   └── 2 tablas
├── system_configuration         # Settings, feature flags
│   └── 2 tablas
└── audit_logging                # Logs, metrics, alerts
    └── 3 tablas
```

**Total: 44 tablas, 159+ politicas RLS**

---

## Patrones de Diseno

### Frontend Patterns

#### 1. Component Composition Pattern

```typescript
// Composicion de componentes reutilizables
<Card>
  <CardHeader>
    <CardTitle>ML Coins</CardTitle>
  </CardHeader>
  <CardContent>
    <CoinBalance value={mlCoins} />
  </CardContent>
</Card>
```

#### 2. Custom Hooks Pattern

```typescript
// Encapsulacion de logica reutilizable
export function useAuth() {
  const { user, login, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    await login(credentials);
    navigate('/dashboard');
  };

  return { user, handleLogin, logout };
}
```

#### 3. Render Props Pattern

```typescript
// Delegacion de renderizado
<ExercisePlayer
  exerciseId={id}
  render={(exercise, attempt) => (
    <ExerciseMechanicRenderer
      exercise={exercise}
      attempt={attempt}
    />
  )}
/>
```

### Backend Patterns

#### 1. Repository Pattern

```typescript
// Abstraccion de acceso a datos
export class GamificationRepository {
  constructor(private pool: Pool) {}

  async getUserStats(userId: string): Promise<UserStats> {
    const result = await this.pool.query(
      'SELECT * FROM gamification_system.user_stats WHERE user_id = $1',
      [userId]
    );
    return result.rows[0];
  }
}
```

#### 2. Service Pattern

```typescript
// Logica de negocio
export class GamificationService {
  constructor(private repo: GamificationRepository) {}

  async awardMLCoins(userId: string, amount: number, reason: string) {
    // Business logic
    const stats = await this.repo.getUserStats(userId);
    const newBalance = stats.ml_coins + amount;

    await this.repo.updateMLCoins(userId, newBalance);
    await this.repo.createTransaction(userId, amount, reason);

    return newBalance;
  }
}
```

#### 3. Controller Pattern

```typescript
// Manejo de HTTP requests
export class GamificationController {
  constructor(private service: GamificationService) {}

  getUserStats = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const stats = await this.service.getUserStats(userId);
    res.json({ success: true, data: stats });
  };
}
```

#### 4. Middleware Chain Pattern

```typescript
// Pipeline de middleware
router.get('/stats/:userId',
  authenticateJWT,
  applyRLS,
  validateRequest,
  gamificationController.getUserStats
);
```

### Database Patterns

#### 1. Multi-Tenant Pattern con RLS

```sql
-- Policy: Students only see their own data
CREATE POLICY "student_own_data"
ON progress_tracking.module_progress
FOR SELECT
USING (user_id = auth.uid());
```

#### 2. Audit Trail Pattern

```sql
-- Trigger: Log all changes
CREATE TRIGGER audit_user_changes
AFTER UPDATE ON auth_management.profiles
FOR EACH ROW
EXECUTE FUNCTION audit_logging.log_change();
```

#### 3. Soft Delete Pattern

```sql
-- Soft delete with is_deleted flag
UPDATE educational_content.modules
SET is_deleted = true, deleted_at = NOW()
WHERE id = $1;
```

---

## Flujos de Datos

### Flujo de Autenticacion

```
1. User enters credentials
   └→ Frontend: authStore.login(email, password)
       └→ POST /api/auth/login
           └→ Backend: AuthController.login()
               └→ AuthService.login()
                   └→ AuthRepository.findUserByEmail()
                       └→ PostgreSQL: SELECT * FROM auth_management.profiles
                   └→ bcrypt.compare(password, hash)
                   └→ jwt.sign({ sub, email, role })
               └→ Return { user, token }
           └→ Frontend: Store token in localStorage
           └→ Update Zustand authStore
           └→ Navigate to /dashboard
```

### Flujo de Completar Ejercicio

```
1. Student completes exercise
   └→ Frontend: exerciseStore.submitAnswer(answer)
       └→ POST /api/exercises/:id/submit
           └→ Backend: ExerciseController.submit()
               └→ ExerciseService.validateAnswer()
                   └→ Calculate score, time bonus, penalties
                   └→ Repository: Create exercise_attempt
                   └→ Repository: Update module_progress
                   └→ GamificationService.awardRewards()
                       └→ Award ML Coins
                       └→ Award XP
                       └→ Check for achievement unlocks
                       └→ Check for rank progression
                   └→ Socket.IO: Emit achievement:unlocked
               └→ Return { score, rewards, achievements }
           └→ Frontend: Update UI with rewards
           └→ Show celebration animation
           └→ Update gamificationStore
```

### Flujo de Leaderboard Real-time

```
1. User opens leaderboard page
   └→ Frontend: Connect to Socket.IO
       └→ Socket: Authenticate with JWT
       └→ Socket: Join room 'leaderboard'
           └→ GET /api/gamification/leaderboard
               └→ Backend: Query top users by XP
               └→ Return leaderboard data
           └→ Frontend: Display leaderboard

2. Another user earns XP
   └→ Backend: GamificationService.addXP()
       └→ Update user_stats
       └→ Socket.IO: Emit 'leaderboard:updated'
           └→ Frontend: All connected clients receive update
           └→ Refresh leaderboard display
```

---

## Metricas del Sistema

### Frontend Metrics

| Metrica | Valor |
|---------|-------|
| **Total de archivos** | 592 TypeScript files |
| **Lineas de codigo** | ~85,000 LOC |
| **Componentes** | 180+ React components |
| **Custom Hooks** | 40+ hooks |
| **Stores** | 8 Zustand stores |
| **Mecanicas de ejercicios** | 33 ejercicios implementados |
| **Rutas** | 60+ rutas SPA |
| **Bundle size (gzip)** | ~450 KB |
| **First Contentful Paint** | < 1.5s |
| **Time to Interactive** | < 3s |

### Backend Metrics

| Metrica | Valor |
|---------|-------|
| **Total de modulos** | 11 modulos funcionales |
| **Total de endpoints** | 470+ REST endpoints |
| **Controladores** | 35+ controllers |
| **Servicios** | 40+ services |
| **Repositories** | 30+ repositories |
| **Middleware** | 15+ middleware |
| **Socket.IO events** | 25+ real-time events |
| **Lineas de codigo** | ~45,000 LOC |
| **Response time (p95)** | < 200ms |
| **Throughput** | 500+ req/s |

### Database Metrics

| Metrica | Valor |
|---------|-------|
| **Schemas** | 11 schemas especializados |
| **Tablas** | 44 tablas |
| **Columnas** | 600+ columnas |
| **Politicas RLS** | 159+ policies |
| **Funciones** | 40+ stored functions |
| **Triggers** | 20+ triggers |
| **Indices** | 279+ indices |
| **Lineas DDL** | 24,855+ LOC |
| **Query time (p95)** | < 50ms |

### Gamificacion Metrics

| Metrica | Valor |
|---------|-------|
| **Rangos Maya** | 5 rangos (nacom → mercenario) |
| **Logros** | 50+ achievements |
| **Power-ups** | 3 tipos (pistas, vision lectora, segunda oportunidad) |
| **ML Coins inicial** | 100 ML |
| **XP por ejercicio** | 20-100 XP |
| **ML Coins por ejercicio** | 5-50 ML |

---

## Decisiones Arquitectonicas Clave

### 1. SPA Monolitico vs Microfrontends

**Decision:** SPA monolitico con React
**Razon:**
- Menos complejidad de deployment
- Mejor performance (sin overhead de orchestration)
- Equipo pequeno
- Desarrollo mas rapido

### 2. Node.js + Express vs NestJS

**Decision:** NestJS
**Razon:**
- Arquitectura modular escalable (11 módulos funcionales)
- TypeScript first con decoradores
- Dependency Injection nativa
- Guards, Interceptors, Pipes integrados
- Swagger/OpenAPI automático
- Passport integration oficial
- Testing con @nestjs/testing
- Mejor para equipos grandes con código estructurado

### 3. PostgreSQL Native vs ORM

**Decision:** TypeORM (con @nestjs/typeorm)
**Razon:**
- Integración nativa con NestJS
- Type-safety en queries
- Migrations automáticas
- Decoradores para entities
- Repository pattern
- Soporte completo de PostgreSQL features (RLS, JSONB, arrays, enums)
- QueryBuilder para queries complejas
- Balance entre abstracción y control

### 4. Zustand vs Redux

**Decision:** Zustand
**Razon:**
- Menos boilerplate
- API mas simple
- Mejor TypeScript support
- Suficiente para el caso de uso

### 5. JWT vs Sessions

**Decision:** JWT
**Razon:**
- Stateless backend
- Escalabilidad horizontal
- Mobile-friendly
- Integracion con RLS

---

## Proximos Pasos

1. **Optimizaciones:**
   - Implementar Redis para caching
   - CDN para assets estaticos
   - Code splitting avanzado
   - Server-side rendering (opcional)

2. **Escalabilidad:**
   - Load balancer
   - Replicas de PostgreSQL
   - Horizontal scaling del backend
   - Message queue (RabbitMQ/Redis)

3. **Monitoring:**
   - APM (New Relic, DataDog)
   - Error tracking (Sentry)
   - Analytics (Mixpanel, Amplitude)
   - Custom dashboards (Grafana)

---

## Referencias

- [Backend Architecture](./BACKEND-ARCHITECTURE.md)
- [Frontend Architecture](./FRONTEND-ARCHITECTURE.md)
- [Types Mapping](../tipos-compartidos/TYPES-MAPPING.md)
- [API Reference](../apis/API-REFERENCE.md)
- [Security System](../seguridad/SISTEMA-SEGURIDAD.md)

---

**Ultima actualizacion:** Octubre 2025
**Mantenido por:** GAMILIT Platform Team
