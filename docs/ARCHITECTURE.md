# Architecture

## Overview

GAMILIT (Gamificación Maya para la Lectoescritura en Tecnología) es una plataforma educativa que mejora las habilidades de lectoescritura en estudiantes de educación básica mediante gamificación basada en la cultura maya y aprendizaje adaptativo con IA.

La arquitectura sigue un patrón de monorepo modular con separación clara entre frontend, backend y database, implementando clean architecture y domain-driven design.

## Tech Stack

- **Backend:** NestJS 11.x + TypeScript 5.9+
- **Frontend:** React 19.x + TypeScript 5.x
- **State Management:** Zustand 5.x
- **Styling:** Tailwind CSS 4.x
- **Database:** PostgreSQL 16.x
- **ORM:** TypeORM 0.3.x
- **Auth:** JWT + Passport.js
- **Real-time:** Socket.IO 4.8+
- **Notifications:** Web Push
- **Deployment:** Docker + PM2
- **CI/CD:** GitHub Actions

## Module Structure

```
gamilit/
├── apps/
│   ├── backend/                    # NestJS API
│   │   └── src/
│   │       ├── modules/            # Feature modules
│   │       │   ├── auth/           # Authentication & authorization
│   │       │   ├── admin/          # Admin dashboard
│   │       │   ├── teacher/        # Teacher tools (create subjects, quizzes)
│   │       │   ├── profile/        # User profiles
│   │       │   ├── content/        # Learning content
│   │       │   ├── educational/    # Educational resources
│   │       │   ├── assignments/    # Student assignments
│   │       │   ├── tasks/          # Task system
│   │       │   ├── progress/       # Progress tracking
│   │       │   ├── gamification/   # Points, badges, ranks (Maya system)
│   │       │   ├── social/         # Social features
│   │       │   ├── notifications/  # Push notifications
│   │       │   ├── mail/           # Email system
│   │       │   ├── websocket/      # Real-time communication
│   │       │   ├── audit/          # Audit logging
│   │       │   └── health/         # Health checks
│   │       ├── shared/             # Shared code
│   │       │   ├── constants/      # SSOT constants
│   │       │   ├── decorators/     # Custom decorators
│   │       │   ├── filters/        # Exception filters
│   │       │   ├── guards/         # Auth guards
│   │       │   ├── interceptors/   # HTTP interceptors
│   │       │   ├── pipes/          # Validation pipes
│   │       │   └── utils/          # Utility functions
│   │       ├── config/             # Configuration
│   │       ├── middleware/         # Express middleware
│   │       ├── app.module.ts       # Root module
│   │       └── main.ts             # Bootstrap
│   │
│   ├── frontend/                   # React SPA
│   │   └── src/
│   │       ├── modules/            # Feature modules
│   │       ├── shared/             # Shared components
│   │       │   ├── components/     # UI components
│   │       │   ├── constants/      # SSOT constants
│   │       │   ├── hooks/          # Custom hooks
│   │       │   ├── stores/         # Zustand stores
│   │       │   └── utils/          # Utilities
│   │       └── App.tsx
│   │
│   ├── database/                   # PostgreSQL
│   │   ├── ddl/                    # Schema definitions
│   │   │   └── schemas/            # 8 schemas
│   │   │       ├── auth_management/
│   │   │       ├── student_learning/
│   │   │       ├── gamification_system/
│   │   │       ├── content_management/
│   │   │       ├── social_interaction/
│   │   │       ├── admin_tools/
│   │   │       ├── notifications_system/
│   │   │       └── audit_logs/
│   │   ├── seeds/                  # Test data
│   │   ├── migrations/             # TypeORM migrations
│   │   └── scripts/                # Maintenance scripts
│   │
│   └── devops/                     # DevOps scripts
│       └── scripts/
│           ├── sync-enums.ts       # Sync enums Backend → Frontend
│           ├── validate-constants-usage.ts
│           └── validate-api-contract.ts
│
├── orchestration/                  # Agent orchestration
├── docs/                           # Documentation
└── artifacts/                      # Generated artifacts
```

## Database Schemas (8 schemas, 40+ tables)

| Schema | Purpose | Tables |
|--------|---------|--------|
| `auth_management` | Users, roles, permissions | users, roles, permissions, user_roles |
| `student_learning` | Subjects, content, assignments | subjects, modules, lessons, assignments, submissions |
| `gamification_system` | Maya ranks, points, badges | user_ranks, points_history, badges, achievements |
| `content_management` | Learning materials | contents, quizzes, questions, answers |
| `social_interaction` | Social features | posts, comments, likes, follows |
| `admin_tools` | Admin dashboard | settings, reports, analytics |
| `notifications_system` | Notifications & emails | notifications, push_subscriptions, email_queue |
| `audit_logs` | Audit trail | activity_logs, api_logs |

## Data Flow

```
┌─────────────┐
│   Client    │ (React SPA)
│  (Browser)  │
└──────┬──────┘
       │ HTTP/WebSocket
       ▼
┌─────────────────────────────────────────┐
│         NestJS Backend API              │
│  ┌─────────────────────────────────┐   │
│  │  Controllers (REST Endpoints)   │   │
│  └────────┬────────────────────────┘   │
│           ▼                              │
│  ┌─────────────────────────────────┐   │
│  │      Services (Business Logic)  │   │
│  └────────┬────────────────────────┘   │
│           ▼                              │
│  ┌─────────────────────────────────┐   │
│  │  Repositories (TypeORM)         │   │
│  └────────┬────────────────────────┘   │
└───────────┼──────────────────────────────┘
            ▼
   ┌─────────────────┐
   │   PostgreSQL    │
   │   (Database)    │
   └─────────────────┘
```

### Authentication Flow

```
1. User Login → POST /api/auth/login
2. Validate credentials (bcrypt)
3. Generate JWT token
4. Return token + user data
5. Client stores token in localStorage
6. Subsequent requests include token in Authorization header
7. Guards validate token on protected routes
```

### Gamification Flow (Maya Ranks)

```
Student completes quiz
    ↓
Points awarded = base_points × rank_multiplier × streak_multiplier
    ↓
Update points_history table
    ↓
Check if rank threshold reached
    ↓
If yes → Upgrade user_rank
    ↓
Emit WebSocket event → Real-time notification
```

### Quiz Evaluation Flow

```
Student submits answers
    ↓
Backend validates answers
    ↓
Calculate score
    ↓
AI Adaptive System adjusts difficulty
    ↓
Award points (Maya gamification)
    ↓
Update progress tracking
    ↓
Return feedback + new recommendations
```

## Key Design Decisions

### 1. Constants SSOT (Single Source of Truth)

**Decision:** Centralizar todas las constantes (schemas, tables, routes, ENUMs) en archivos dedicados.

**Rationale:**
- Elimina hardcoding y magic strings
- Garantiza type-safety en TypeScript
- Sincronización automática Backend ↔ Frontend
- Detecta inconsistencias en CI/CD

**Files:**
- Backend: `src/shared/constants/database.constants.ts`, `routes.constants.ts`, `enums.constants.ts`
- Frontend: `src/shared/constants/api-endpoints.ts`, `enums.constants.ts` (auto-synced)

### 2. Maya Gamification System

**Decision:** Implementar sistema de rangos basado en cultura maya (5 niveles).

**Rationale:**
- Diferenciador cultural único
- Mayor engagement estudiantil
- Multiplicadores por rango incentivan progreso

**Ranks:**
1. MERCENARIO (Entry)
2. GUERRERO (Intermediate)
3. HOLCATTE (Advanced)
4. BATAB (Expert)
5. NACOM (Master)

### 3. Modular Monorepo Architecture

**Decision:** Usar monorepo con apps autocontenidas (backend, frontend, database).

**Rationale:**
- Facilita desarrollo full-stack
- Sincronización de cambios
- Deployment independiente posible
- Documentación centralizada

### 4. TypeORM with Manual DDL

**Decision:** Definir schemas SQL manualmente en `/database/ddl/`, usar TypeORM solo para queries.

**Rationale:**
- Control total sobre estructura de database
- Migrations explícitas y trackeables
- Evita auto-migrations peligrosas en producción
- DDL como documentación versionada

### 5. JWT Authentication without Refresh Tokens (MVP)

**Decision:** JWT simple sin refresh tokens en versión inicial.

**Rationale:**
- Simplicidad para MVP educativo
- Menor complejidad de implementación
- Refresh tokens planificados para Fase 2

### 6. WebSocket for Real-time Features

**Decision:** Socket.IO para notificaciones en tiempo real.

**Rationale:**
- Mejor UX para gamificación (puntos, badges en tiempo real)
- Notificaciones de nuevos assignments
- Chat entre estudiantes/profesores

## Dependencies

### Critical External Dependencies

| Dependency | Purpose | Criticality |
|------------|---------|-------------|
| **PostgreSQL 16+** | Primary database | CRITICAL |
| **NestJS 11+** | Backend framework | CRITICAL |
| **React 19+** | Frontend framework | CRITICAL |
| **TypeORM 0.3+** | ORM | CRITICAL |
| **Passport.js** | Authentication | HIGH |
| **Socket.IO** | Real-time | MEDIUM |
| **Web-Push** | Push notifications | MEDIUM |
| **Nodemailer** | Email sending | MEDIUM |
| **Winston** | Logging | MEDIUM |

### Internal Dependencies

- **Shared Constants:** Backend y Frontend dependen de `shared/constants` (SSOT)
- **Database Schemas:** Backend Entities dependen de DDL definitions
- **API Contract:** Frontend depende de routes definidas en Backend

## Security Considerations

- **Authentication:** JWT tokens con expiración
- **Authorization:** Role-based access control (RBAC)
- **Password Hashing:** bcrypt (salt rounds: 10)
- **Input Validation:** class-validator en DTOs
- **SQL Injection Protection:** TypeORM parameterized queries
- **XSS Protection:** helmet middleware
- **CORS:** Configurado para dominios permitidos
- **Rate Limiting:** express-rate-limit en endpoints críticos
- **Audit Logging:** Todas las acciones críticas logueadas en `audit_logs` schema

## Performance Optimizations

- **Database Indexes:** Definidos en DDL files
- **Caching:** Cache-manager para responses frecuentes
- **Compression:** compression middleware
- **Code Splitting:** React lazy loading
- **API Throttling:** @nestjs/throttler
- **Connection Pooling:** TypeORM connection pool

## Deployment Strategy

**Production Server:**
- IP: 74.208.126.102
- Backend: Puerto 3006 (2 instancias cluster con PM2)
- Frontend: Puerto 3005 (1 instancia con PM2)

**Process Manager:** PM2 para high availability

**Docker:** Dockerfiles disponibles para containerización

Ver documentación completa: [DEPLOYMENT.md](./DEPLOYMENT.md)

## Monitoring & Observability

- **Health Checks:** `/api/health` endpoint (NestJS Terminus)
- **Logging:** Winston logger con niveles (error, warn, info, debug)
- **Audit Logs:** Tabla `audit_logs.activity_logs` para trazabilidad
- **PM2 Monitoring:** `pm2 monit` para métricas de procesos

## Future Improvements

- Implementar refresh tokens (Fase 2)
- Agregar Redis para caching distribuido
- Implementar full-text search (PostgreSQL FTS o Elasticsearch)
- Agregar tests e2e con Playwright
- Implementar observability con Prometheus + Grafana
- Migrar a microservicios si escala lo requiere

## References

- [Documentación completa](/docs/)
- [API Documentation](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Constants SSOT Policy](/docs/90-transversal/POLITICA-CONSTANTS-SSOT.md)
