# Architecture

## Overview

GAMILIT (Gamificacion Maya para la Lectoescritura en Tecnologia) es una plataforma educativa que mejora las habilidades de lectoescritura en estudiantes de educacion basica mediante gamificacion basada en la cultura maya y aprendizaje adaptativo con IA.

La arquitectura sigue un patron de monorepo modular con separacion clara entre frontend, backend y database, implementando clean architecture y domain-driven design.

**Metricas clave:** 18 schemas, 171 tablas, 141 entities, 850 endpoints, 282 RLS policies, 82.5% coherencia DDL-Backend.

## Tech Stack

- **Backend:** NestJS 11.x + TypeScript 5.9+
- **Frontend:** React 19.x + TypeScript 5.x
- **State Management:** Zustand 5.x
- **Styling:** Tailwind CSS 4.x
- **Database:** PostgreSQL 16.x
- **ORM:** TypeORM 0.3.x
- **Auth:** JWT + Passport.js + RBAC
- **Real-time:** Socket.IO 4.8+
- **Notifications:** Web Push + Email (Nodemailer)
- **Build:** Vite 7.x
- **Deployment:** Docker + PM2
- **CI/CD:** GitHub Actions

## Module Structure

```
gamilit/
├── apps/
│   ├── backend/                    # NestJS API (22 modules, 850 endpoints)
│   │   └── src/
│   │       ├── modules/            # Feature modules
│   │       │   ├── auth/           # Authentication & authorization (JWT + RBAC)
│   │       │   ├── admin/          # Admin dashboard + feature flags
│   │       │   ├── teacher/        # Teacher portal (19 pages)
│   │       │   ├── parent/         # Parent portal + notifications
│   │       │   ├── profile/        # User profiles + preferences
│   │       │   ├── content/        # Content management + templates
│   │       │   ├── educational/    # 5 modules, 23 exercise types
│   │       │   ├── assignments/    # Student assignments + submissions
│   │       │   ├── tasks/          # Task system
│   │       │   ├── progress/       # Progress tracking + analytics
│   │       │   ├── gamification/   # Ranks, XP, MLCoins, achievements, missions
│   │       │   ├── social/         # Friends, guilds, follows, classrooms
│   │       │   ├── notifications/  # Push + email + in-app multicanal
│   │       │   ├── mail/           # Email system (Nodemailer)
│   │       │   ├── websocket/      # Real-time communication (Socket.IO)
│   │       │   ├── audit/          # Audit logging
│   │       │   ├── lti/            # LTI 1.3 integration
│   │       │   ├── analytics/      # Advanced analytics + dashboards
│   │       │   ├── communication/  # Messages + announcements
│   │       │   ├── peer-challenges/ # Peer vs peer challenges
│   │       │   ├── data-warehouse/ # ETL + materialized views
│   │       │   └── health/         # Health checks (Terminus)
│   │       ├── shared/             # Shared code
│   │       │   ├── constants/      # SSOT constants (database, routes, enums)
│   │       │   ├── decorators/     # Custom decorators (18)
│   │       │   ├── filters/        # Exception filters
│   │       │   ├── guards/         # Auth guards (14)
│   │       │   ├── interceptors/   # HTTP interceptors
│   │       │   ├── pipes/          # Validation pipes
│   │       │   └── utils/          # Utility functions
│   │       ├── config/             # Configuration
│   │       ├── middleware/          # Express middleware
│   │       ├── app.module.ts       # Root module
│   │       └── main.ts             # Bootstrap
│   │
│   ├── frontend/                   # React SPA (458 components, 85 pages)
│   │   └── src/
│   │       ├── modules/            # Feature modules
│   │       │   ├── student/        # Student portal
│   │       │   ├── teacher/        # Teacher portal (19 pages)
│   │       │   ├── admin/          # Admin portal (18 pages)
│   │       │   ├── parent/         # Parent portal
│   │       │   ├── gamification/   # Gamification UI + mechanics (40)
│   │       │   └── exercises/      # 23 exercise type components
│   │       ├── shared/             # Shared components
│   │       │   ├── components/     # UI components
│   │       │   ├── constants/      # SSOT constants (auto-synced)
│   │       │   ├── hooks/          # Custom hooks (127)
│   │       │   ├── stores/         # Zustand stores (32)
│   │       │   └── utils/          # Utilities
│   │       └── App.tsx
│   │
│   ├── database/                   # PostgreSQL (18 schemas, 171 tables)
│   │   ├── ddl/                    # Schema definitions
│   │   │   ├── 00-prerequisites.sql  # Base schemas + enums
│   │   │   ├── 07-enable-rls.sql     # Row Level Security
│   │   │   ├── 99-post-ddl-permissions.sql
│   │   │   └── schemas/              # 18 modular schemas
│   │   ├── seeds/                    # Test + production data
│   │   └── scripts/                  # Maintenance + validation scripts
│   │
│   └── devops/                     # DevOps scripts
│       └── scripts/
│           ├── sync-enums.ts       # Sync enums Backend <-> Frontend
│           ├── validate-constants-usage.ts
│           └── validate-api-contract.ts
│
├── orchestration/                  # SIMCO orchestration system
├── docs/                           # Documentation (300+ files)
└── .claude/                        # Agent configuration
```

## Database Schemas (18 schemas, 171 tables)

| # | Schema | Purpose | Key Tables | Status |
|---|--------|---------|------------|--------|
| 1 | `gamilit` | Utility functions, timezone helpers | (functions only) | Active |
| 2 | `auth_management` | Users, roles, permissions, sessions, providers | users, roles, permissions, user_roles, sessions, auth_providers, password_resets | Active |
| 3 | `educational_content` | Modules, exercises, readings | modules, exercises, readings, exercise_mechanics, exercise_options | Active |
| 4 | `gamification_system` | Maya ranks, XP, MLCoins, achievements, missions | user_stats, achievements, user_achievements, missions, user_missions, badges, leaderboards, rewards | Active |
| 5 | `progress_tracking` | Module progress, exercise attempts | module_progress, exercise_attempts, exercise_progress, streaks, learning_paths | Active |
| 6 | `social_features` | Classrooms, teams, schools, friends | classrooms, classroom_members, schools, friendships, guilds, guild_members, follows | Active |
| 7 | `content_management` | Templates, media, resources | content_templates, media_library, teacher_resources | Active |
| 8 | `admin_dashboard` | Analytics views, admin settings | (materialized views, admin_settings) | Active |
| 9 | `system_configuration` | Feature flags, global settings | feature_flags, system_settings, platform_config | Active |
| 10 | `notifications` | Multicanal notification system | notifications, notification_preferences, push_subscriptions, email_queue | Active |
| 11 | `communication` | Messages, conversations | messages, announcements | Active |
| 12 | `audit_logging` | Audit trail, API logs | activity_logs, api_logs, security_events | Active |
| 13 | `lti_integration` | LTI 1.3 platform integration | lti_platforms, lti_deployments, lti_launches | Active |
| 14 | `parent_portal` | Parent accounts, child linking | parent_profiles, parent_children, parent_reports | Active |
| 15 | `teacher_portal` | Teacher-specific data | teacher_settings, grade_books | Active |
| 16 | `analytics` | Advanced analytics, data warehouse | (materialized views, ETL pipelines) | Active |
| 17 | `public` | PostgreSQL default | (placeholder) | Placeholder |
| 18 | `storage` | File storage metadata | (placeholder) | Placeholder |

**Integrity:** 299 foreign keys, 282 RLS policies, 128 functions, 49 triggers, 36 enums.

## Data Flow

```
┌───────────────┐
│    Client      │ (React 19 SPA - 4 portales)
│   (Browser)    │ Student / Teacher / Admin / Parent
└──────┬────────┘
       │ HTTP/WebSocket
       ▼
┌──────────────────────────────────────────────┐
│           NestJS Backend API (22 modules)      │
│  ┌──────────────────────────────────────────┐ │
│  │  Guards (14) → Decorators (18) → Pipes   │ │
│  └────────┬─────────────────────────────────┘ │
│           ▼                                    │
│  ┌──────────────────────────────────────────┐ │
│  │  Controllers (103) → 850 REST Endpoints  │ │
│  └────────┬─────────────────────────────────┘ │
│           ▼                                    │
│  ┌──────────────────────────────────────────┐ │
│  │  Services (145) → Business Logic          │ │
│  └────────┬─────────────────────────────────┘ │
│           ▼                                    │
│  ┌──────────────────────────────────────────┐ │
│  │  Repositories (TypeORM) → 141 Entities   │ │
│  └────────┬─────────────────────────────────┘ │
└───────────┼──────────────────────────────────┘
            ▼
   ┌──────────────────┐
   │   PostgreSQL 16   │
   │   18 schemas      │
   │   171 tables      │
   │   282 RLS policies│
   └──────────────────┘
```

### Authentication Flow

```
1. User Login → POST /api/auth/login
2. Validate credentials (bcrypt, salt rounds: 10)
3. Generate JWT token (24h expiration)
4. Return token + user data + role
5. Client stores token
6. Subsequent requests include Authorization: Bearer <token>
7. JwtAuthGuard validates token on protected routes
8. RolesGuard checks RBAC permissions (student/teacher/admin/parent)
```

### Gamification Flow (Maya Ranks)

```
Student completes exercise
    ↓
Points awarded = base_points × rank_multiplier × streak_multiplier
    ↓
Update user_stats (XP, MLCoins)
    ↓
Check rank threshold:
  AJAW (0-499) → NACOM (500-999) → AH K'IN (1000-1499) → HALACH UINIC (1500-1899) → K'UK'ULKAN (1900+)
    ↓
If rank up → emit WebSocket event → real-time notification + achievement
    ↓
Check mission progress → update mission_completions
    ↓
Check achievement triggers → award badges
```

### Exercise Evaluation Flow

```
Student submits answers (23 exercise types across 5 modules)
    ↓
Backend validates answers (module-specific logic)
    ↓
Calculate score (partial credit supported)
    ↓
Award XP + MLCoins (with rank multiplier)
    ↓
Update progress_tracking.exercise_attempts
    ↓
Update progress_tracking.module_progress
    ↓
Check streak continuation → update streaks
    ↓
Return feedback + score + gamification updates
```

## Key Design Decisions

### 1. Constants SSOT (Single Source of Truth)

**Decision:** Centralizar todas las constantes (schemas, tables, routes, ENUMs) en archivos dedicados.

**Rationale:**
- Elimina hardcoding y magic strings
- Garantiza type-safety en TypeScript
- Sincronizacion automatica Backend <-> Frontend via sync-enums.ts
- Detecta inconsistencias en CI/CD (validate-constants, validate-api-contract)

**Files:**
- Backend: `src/shared/constants/database.constants.ts`, `routes.constants.ts`, `enums.constants.ts`
- Frontend: `src/shared/constants/api-endpoints.ts`, `enums.constants.ts` (auto-synced)
- See: ADR-015

### 2. Maya Gamification System

**Decision:** Implementar sistema de rangos basado en cultura maya (5 niveles).

**Rationale:**
- Diferenciador cultural unico
- Mayor engagement estudiantil
- Multiplicadores por rango incentivan progreso

**Ranks (correct names):**
1. **AJAW** (0-499 XP) - Inicio del camino
2. **NACOM** (500-999 XP) - Guerrero del conocimiento
3. **AH K'IN** (1,000-1,499 XP) - Sacerdote del saber
4. **HALACH UINIC** (1,500-1,899 XP) - Gobernante sabio
5. **K'UK'ULKAN** (1,900+ XP) - Serpiente emplumada (rango maximo)

See: ADR-021, Design Doc v6.5

### 3. Modular Monorepo Architecture

**Decision:** Usar monorepo con apps autocontenidas (backend, frontend, database).

**Rationale:**
- Facilita desarrollo full-stack
- Sincronizacion de cambios entre capas
- Deployment independiente posible
- DDL como documentacion versionada

See: ADR-0001

### 4. TypeORM with Manual DDL

**Decision:** Definir schemas SQL manualmente en `/database/ddl/`, usar TypeORM solo para queries.

**Rationale:**
- Control total sobre estructura de database (18 schemas, 171 tables)
- DDL versionado y auditable en git
- Evita auto-migrations peligrosas en produccion
- Recreacion limpia: `drop-and-recreate-database.sh`

See: ADR-018

### 5. JWT Authentication with RBAC

**Decision:** JWT + Passport con sistema de roles academicos.

**Roles:** student, teacher, admin, superadmin, parent
**Features:** Login, register, password reset, email verification, sessions, 2FA planned.

### 6. WebSocket for Real-time Features

**Decision:** Socket.IO para notificaciones en tiempo real.

**Use cases:**
- Gamificacion en tiempo real (puntos, badges, rank-ups)
- Notificaciones de nuevos assignments
- Actualizaciones de leaderboard
- Alertas para padres

## 4 Portales

| Portal | Role | Pages | Key Features |
|--------|------|-------|-------------|
| **Estudiante** | student | 20+ | Ejercicios, progreso, gamificacion, perfil, social |
| **Maestro** | teacher | 19 | Aulas, assignments, calificaciones, analytics, recursos |
| **Administrador** | admin | 18 | Usuarios, organizaciones, configuracion, reportes, audit |
| **Padres** | parent | 8+ | Dashboard hijos, reportes semanales, notificaciones, alertas |

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
| **Zustand 5+** | State management | HIGH |
| **Tailwind CSS 4+** | Styling | HIGH |
| **Vite 7+** | Build tool | HIGH |

### Internal Dependencies

- **Shared Constants:** Backend y Frontend dependen de `shared/constants` (SSOT)
- **Database Schemas:** Backend Entities dependen de DDL definitions (82.5% aligned)
- **API Contract:** Frontend depende de routes definidas en Backend (850 endpoints)
- **Enum Sync:** `sync-enums.ts` mantiene BD <-> Backend <-> Frontend en sync

## Security Considerations

- **Authentication:** JWT tokens con expiracion (24h)
- **Authorization:** RBAC con 5 roles (student, teacher, admin, superadmin, parent)
- **Password Hashing:** bcrypt (salt rounds: 10)
- **Input Validation:** class-validator en DTOs (412 DTOs)
- **SQL Injection Protection:** TypeORM parameterized queries
- **XSS Protection:** helmet middleware
- **CORS:** Configurado para dominios permitidos
- **Rate Limiting:** express-rate-limit en endpoints criticos
- **RLS:** 282 Row Level Security policies en PostgreSQL
- **Audit Logging:** Todas las acciones criticas logueadas en `audit_logging` schema

## Performance Optimizations

- **Database Indexes:** 69 index files definidos en DDL
- **Materialized Views:** 7 views para analytics pesados
- **Caching:** Cache-manager para responses frecuentes
- **Compression:** compression middleware
- **Code Splitting:** React lazy loading (Vite)
- **API Throttling:** @nestjs/throttler
- **Connection Pooling:** TypeORM connection pool

## Deployment Strategy

**Production Server:**
- IP: 74.208.126.102
- Backend: Puerto 3006 (2 instancias cluster con PM2)
- Frontend: Puerto 3005 (1 instancia con PM2)

**Process Manager:** PM2 para high availability

**Docker:** Dockerfiles disponibles para containerizacion

Ver documentacion completa: [DEPLOYMENT.md](./DEPLOYMENT.md)

## Monitoring & Observability

- **Health Checks:** `/api/health` endpoint (NestJS Terminus)
- **Logging:** Winston logger con niveles (error, warn, info, debug)
- **Audit Logs:** Schema `audit_logging` para trazabilidad completa
- **PM2 Monitoring:** `pm2 monit` para metricas de procesos

## References

- [API Documentation](./API.md) | Swagger: `/api/docs`
- [Deployment Guide](./DEPLOYMENT.md)
- [Constants SSOT Policy](../../80-referencias/transversal/POLITICA-CONSTANTS-SSOT.md)
- [Design Doc v6.5](../../00-vision-general/DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md)
- [DATABASE_INVENTORY](../../../orchestration/inventarios/DATABASE_INVENTORY.yml)
- [MASTER_INVENTORY](../../../orchestration/inventarios/MASTER_INVENTORY.yml)
- ADRs: [docs/90-adr/](../../90-adr/)
