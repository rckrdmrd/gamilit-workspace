# Stack Tecnologico - GAMILIT

**Version:** 1.0.0
**Fecha:** 2026-02-07

---

## Stack Principal

| Capa | Tecnologia | Version | Proposito |
|------|------------|---------|-----------|
| **Backend Framework** | NestJS | 11.x | Framework modular para API REST + WebSocket |
| **ORM** | TypeORM | 0.3.x | Mapeo objeto-relacional, entities, migrations |
| **Frontend Framework** | React | 19.x | UI library para SPA con 4 portales |
| **State Management** | Zustand | 5.x | Estado global ligero (14 stores) |
| **UI Styling** | TailwindCSS | 4.x | Utility-first CSS framework |
| **Build Tool** | Vite | 6.x | Frontend build y dev server |
| **Database** | PostgreSQL | 15.x | BD relacional con RLS multi-tenant |
| **Cache** | Redis | 7.x | Cache, sesiones, queue (DB 0) |
| **Real-time** | Socket.IO | 4.8+ | WebSocket para leaderboards, notificaciones |
| **Runtime** | Node.js | 20.x | LTS runtime |
| **Language** | TypeScript | 5.x | Type-safety end-to-end |

---

## Backend Stack (NestJS 11)

### Core Dependencies
| Paquete | Version | Proposito |
|---------|---------|-----------|
| @nestjs/core | 11.x | Framework core |
| @nestjs/platform-express | 11.x | HTTP adapter |
| @nestjs/typeorm | 11.x | TypeORM integration |
| @nestjs/passport | 11.x | Authentication strategies |
| @nestjs/jwt | 11.x | JWT token handling |
| @nestjs/swagger | 8.x | OpenAPI documentation |
| @nestjs/websockets | 11.x | WebSocket support |
| @nestjs/platform-socket.io | 11.x | Socket.IO adapter |
| @nestjs/terminus | 11.x | Health checks |
| @nestjs/schedule | 5.x | Scheduled tasks (cron) |
| @nestjs/throttler | 6.x | Rate limiting |

### Database & ORM
| Paquete | Version | Proposito |
|---------|---------|-----------|
| typeorm | 0.3.x | ORM con support para PostgreSQL |
| pg | 8.x | PostgreSQL driver |
| ioredis | 5.x | Redis client |
| class-validator | 0.14.x | DTO validation |
| class-transformer | 0.5.x | DTO transformation |

### Authentication
| Paquete | Version | Proposito |
|---------|---------|-----------|
| passport | 0.7.x | Authentication middleware |
| passport-jwt | 4.x | JWT strategy |
| passport-local | 1.x | Local strategy |
| bcryptjs | 2.x | Password hashing |

### Testing Backend
| Paquete | Version | Proposito |
|---------|---------|-----------|
| jest | 29.x | Test framework |
| ts-jest | 29.x | TypeScript transformer |
| @nestjs/testing | 11.x | NestJS testing utilities |
| supertest | 7.x | HTTP integration testing |

---

## Frontend Stack (React 19)

### Core Dependencies
| Paquete | Version | Proposito |
|---------|---------|-----------|
| react | 19.x | UI library |
| react-dom | 19.x | DOM rendering |
| react-router-dom | 7.x | Client-side routing (72 routes) |
| zustand | 5.x | State management (14 stores) |
| axios | 1.x | HTTP client (52 API services) |
| socket.io-client | 4.8+ | WebSocket client |

### UI & Styling
| Paquete | Version | Proposito |
|---------|---------|-----------|
| tailwindcss | 4.x | Utility-first CSS |
| @headlessui/react | 2.x | Accessible UI primitives |
| lucide-react | 0.4x | Icon library |
| framer-motion | 11.x | Animations (gamification effects) |
| recharts | 2.x | Charts for analytics |
| react-hot-toast | 2.x | Toast notifications |

### Forms & Validation
| Paquete | Version | Proposito |
|---------|---------|-----------|
| react-hook-form | 7.x | Form management |
| zod | 3.x | Schema validation |
| @hookform/resolvers | 3.x | Zod integration |

### Testing Frontend
| Paquete | Version | Proposito |
|---------|---------|-----------|
| vitest | 2.x | Test framework |
| @testing-library/react | 16.x | React testing utilities |
| @testing-library/user-event | 14.x | User interaction simulation |
| msw | 2.x | Mock Service Worker |
| jsdom | 25.x | DOM implementation for tests |

### Build & Dev
| Paquete | Version | Proposito |
|---------|---------|-----------|
| vite | 6.x | Build tool and dev server |
| @vitejs/plugin-react | 5.x | React support for Vite |
| typescript | 5.x | TypeScript compiler |
| eslint | 9.x | Linting |
| prettier | 3.x | Code formatting |

---

## Database Stack (PostgreSQL 15)

### Features Utilizados
| Feature | Descripcion |
|---------|-------------|
| Row-Level Security (RLS) | 207 policies para multi-tenancy |
| Schemas | 18 schemas modulares para separacion logica |
| Functions | 183 funciones (DDL) para logica de negocio |
| Triggers | 67 triggers para eventos automaticos |
| Materialized Views | 7 MVs para queries de analytics |
| Partitioning | Tablas de logs/analytics particionadas por mes |
| Full-text Search | Busqueda de contenido educativo |
| JSONB | Datos flexibles (configuraciones, metadata) |

### Tipos de Datos
| Tipo | Uso |
|------|-----|
| UUID | Primary keys (todas las tablas) |
| TIMESTAMPTZ | Fechas con timezone |
| JSONB | Configuraciones, metadata flexible |
| ENUM (40) | Tipos enumerados sincronizados con backend |
| ARRAY | Tags, roles, permissions |
| TEXT | Contenido educativo, descripciones |
| NUMERIC | Puntos, scores, monedas |
| BOOLEAN | Flags, estados binarios |

---

## Infrastructure

### Servicios
| Servicio | Tecnologia | Puerto | Descripcion |
|----------|------------|--------|-------------|
| API Server | NestJS 11 | 3006 | Backend REST + WebSocket |
| Web Server | Vite 6 (dev) / Nginx (prod) | 3005 | Frontend SPA |
| Database | PostgreSQL 15 | 5432 | Almacenamiento principal |
| Cache | Redis 7 | 6379 | Cache, sesiones, queue |

### Ambiente de Desarrollo
- **OS:** Windows 11 + WSL2 (Ubuntu-24.04)
- **Node.js:** 20.x LTS
- **Package Manager:** npm
- **IDE:** VS Code / Cursor
- **Git:** GitHub (monorepo)

### Comunicacion entre Capas
```
Browser (React 19)
    |
    +--> REST API (HTTPS) --> NestJS 11 --> TypeORM --> PostgreSQL 15
    |                              |
    +--> Socket.IO (WSS) ------>  |----> Redis (cache/pubsub)
```

---

## Patrones Arquitectonicos

| Patron | Implementacion |
|--------|----------------|
| **Modular Architecture** | 22 modulos NestJS independientes |
| **Repository Pattern** | TypeORM repositories por entity |
| **DTO Pattern** | 399 DTOs para validacion de entrada/salida |
| **Guard Pattern** | 15 guards para autorizacion |
| **Decorator Pattern** | 18 decorators custom |
| **Multi-tenancy** | RLS en PostgreSQL (207 policies) |
| **Event-driven** | Socket.IO para real-time updates |
| **CQRS (partial)** | Materialized Views para lectura, tablas para escritura |
| **Clean Architecture** | Separacion layers: controller -> service -> repository |

---

## Seguridad

| Mecanismo | Tecnologia | Detalle |
|-----------|------------|---------|
| Autenticacion | JWT + Passport | Access token 15min + Refresh token 7d |
| Autorizacion | RBAC | 4 roles: estudiante, maestro, admin, padre |
| Multi-tenancy | PostgreSQL RLS | 207 policies, aislamiento por escuela |
| Validacion | class-validator / zod | DTOs en backend, schemas en frontend |
| Rate Limiting | @nestjs/throttler | 100 req/min por IP |
| CORS | NestJS CORS | Origenes especificos por ambiente |
| Password | bcryptjs | Hash con salt rounds = 12 |
| SQL Injection | TypeORM | Parameterized queries |

---

*GAMILIT - Stack Tecnologico*
*NestJS 11 + React 19 + PostgreSQL 15 + Socket.IO 4.8+ + Vite 6.x*
