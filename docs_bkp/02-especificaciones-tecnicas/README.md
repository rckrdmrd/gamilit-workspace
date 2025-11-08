# Especificaciones Técnicas - GAMILIT Platform

**Version**: 2.0
**Fecha**: Octubre 2025
**Estado**: Documentacion consolidada completa

---

## Descripcion

Esta carpeta contiene la documentacion tecnica consolidada del proyecto GAMILIT, organizada en 4 categorias principales con **6 documentos tecnicos** que cubren todos los aspectos arquitectonicos, de desarrollo y seguridad de la plataforma.

---

## Estructura de Documentacion

```
02-especificaciones-tecnicas/
├── arquitectura/                      # Documentos de arquitectura
│   ├── ARQUITECTURA-GENERAL.md        # Stack, patrones, capas (overview general)
│   ├── BACKEND-ARCHITECTURE.md        # 11 modulos, 470+ endpoints, servicios
│   └── FRONTEND-ARCHITECTURE.md       # 33 mecanicas, 592 archivos, 8 stores
│
├── tipos-compartidos/                 # Type safety end-to-end
│   └── TYPES-MAPPING.md               # Mapeo DB → Backend → Frontend
│
├── apis/                              # Referencia de APIs
│   └── API-REFERENCE.md               # Catalogo de 470+ endpoints
│
└── seguridad/                         # Sistema de seguridad
    └── SISTEMA-SEGURIDAD.md           # JWT, RLS, RBAC, multi-tenancy
```

---

## Documentos Principales

### 1. Arquitectura

#### 📄 [ARQUITECTURA-GENERAL.md](./arquitectura/ARQUITECTURA-GENERAL.md)
**Proposito:** Vision general del stack tecnologico y patrones arquitectonicos

**Contenido:**
- Stack tecnologico completo (Frontend + Backend + Database)
- Arquitectura de capas (Presentation, Application, Data, Storage)
- Patrones de diseno (Repository, Service, Controller, Middleware)
- Flujos de datos principales
- Metricas del sistema (592 archivos TS, 470+ endpoints, 44 tablas)
- Decisiones arquitectonicas clave

**Para quien:** Arquitectos de software, tech leads, nuevos desarrolladores

---

#### 📄 [BACKEND-ARCHITECTURE.md](./arquitectura/BACKEND-ARCHITECTURE.md)
**Proposito:** Arquitectura detallada del backend Node.js

**Contenido:**
- **11 modulos funcionales** con responsabilidades
- **470+ endpoints REST** organizados
- Patron Controller → Service → Repository
- Integracion PostgreSQL + RLS
- Real-time con Socket.IO (25+ eventos)
- Ejemplos de implementacion completos

**Modulos documentados:**
1. Auth (15 endpoints)
2. Gamification (45 endpoints)
3. Educational (60 endpoints)
4. Progress (40 endpoints)
5. Social (55 endpoints)
6. Content (30 endpoints)
7. Admin (80 endpoints)
8. Teacher (70 endpoints)
9. Analytics (35 endpoints)
10. Notifications (25 endpoints)
11. System (15 endpoints)

**Para quien:** Desarrolladores backend, arquitectos de API

---

#### 📄 [FRONTEND-ARCHITECTURE.md](./arquitectura/FRONTEND-ARCHITECTURE.md)
**Proposito:** Arquitectura del frontend React SPA

**Contenido:**
- Estructura de proyecto (592 archivos TypeScript)
- **33 mecanicas de ejercicios** implementadas
- Framework de mecanicas (ExerciseMechanic base class)
- **8 Zustand stores** para state management
- Sistema de componentes (180+ componentes)
- Routing y navegacion (60+ rutas)
- Custom hooks (40+ hooks)

**Para quien:** Desarrolladores frontend, UI/UX engineers

---

### 2. Tipos Compartidos

#### 📄 [TYPES-MAPPING.md](./tipos-compartidos/TYPES-MAPPING.md)
**Proposito:** Mapeo completo de tipos desde DB hasta Frontend

**Contenido:**
- ENUMs mapping (gamilit_role, rango_maya, exercise_type, etc.)
- Tables mapping (Profile, UserStats, Exercise, Attempt, etc.)
- JSONB fields mapping
- Array types mapping
- Date/Time conversion
- API contract types
- Type generation automation

**Para quien:** Todo el equipo de desarrollo (garantiza consistencia)

---

### 3. APIs

#### 📄 [API-REFERENCE.md](./apis/API-REFERENCE.md)
**Proposito:** Catalogo completo de endpoints REST

**Contenido:**
- **470+ endpoints** organizados por modulo
- Request/Response examples completos
- Error codes y handling
- Rate limiting policies
- WebSocket events
- Authentication flow
- Pagination standards

**Endpoints principales:**
- Auth: Login, Register, Refresh, Logout
- Gamification: ML Coins, Ranks, Achievements, Leaderboards
- Educational: Modules, Exercises, Submit
- Progress: Tracking, Analytics, Sessions
- Social: Classrooms, Teams, Events

**Para quien:** Desarrolladores frontend/backend, testers, integradores

---

### 4. Seguridad

#### 📄 [SISTEMA-SEGURIDAD.md](./seguridad/SISTEMA-SEGURIDAD.md)
**Proposito:** Documentacion completa del sistema de seguridad

**Contenido:**
- **Defense-in-Depth** (5 capas de seguridad)
- **JWT Authentication** (tokens 7 dias)
- **Row Level Security (RLS)** (159+ policies)
- **RBAC** (3 roles: student, admin_teacher, super_admin)
- **Multi-tenancy** nativo con tenant isolation
- **Rate limiting** y throttling
- Security best practices
- Audit logging

**Capas de seguridad:**
1. Network Security (HTTPS, CORS, Rate Limiting)
2. Authentication & Authorization (JWT, bcrypt)
3. Row Level Security (PostgreSQL RLS)
4. Input Validation (Zod schemas)
5. Output Security (CSP, XSS prevention)

**Para quien:** Security engineers, arquitectos, DevOps

---

## Metricas de Documentacion

| Metrica | Valor |
|---------|-------|
| **Total documentos** | 6 documentos tecnicos |
| **Lineas totales** | ~4,445 lineas |
| **Categorias** | 4 (Arquitectura, Tipos, APIs, Seguridad) |
| **Diagramas ASCII** | 15+ diagramas |
| **Ejemplos de codigo** | 80+ code snippets |
| **Tablas de resumen** | 30+ tablas |

---

## Metricas del Sistema (Resumen)

### Frontend
- **592 archivos** TypeScript
- **180+ componentes** React
- **33 mecanicas** de ejercicios
- **8 stores** Zustand
- **40+ custom hooks**
- **~85,000 LOC**

### Backend
- **11 modulos** funcionales
- **470+ endpoints** REST
- **35+ controllers**
- **40+ services**
- **30+ repositories**
- **25+ Socket.IO events**
- **~45,000 LOC**

### Database
- **11 schemas** especializados
- **44 tablas**
- **159+ politicas RLS**
- **40+ funciones**
- **279+ indices**
- **~24,855 LOC DDL**

---

## Como Usar Esta Documentacion

### Para Nuevos Desarrolladores
1. Leer **ARQUITECTURA-GENERAL.md** primero (vision general)
2. Profundizar en **BACKEND-ARCHITECTURE.md** o **FRONTEND-ARCHITECTURE.md** segun rol
3. Consultar **TYPES-MAPPING.md** para entender tipos compartidos
4. Usar **API-REFERENCE.md** como referencia durante desarrollo
5. Revisar **SISTEMA-SEGURIDAD.md** para implementaciones seguras

### Para Arquitectos
1. Revisar toda la carpeta **arquitectura/**
2. Validar decisiones en **ARQUITECTURA-GENERAL.md**
3. Analizar **SISTEMA-SEGURIDAD.md** para compliance

### Para DevOps/SRE
1. **ARQUITECTURA-GENERAL.md** - Stack y deployment
2. **BACKEND-ARCHITECTURE.md** - Modulos y servicios
3. **SISTEMA-SEGURIDAD.md** - Configuraciones de seguridad

### Para QA/Testers
1. **API-REFERENCE.md** - Endpoints y casos de prueba
2. **TYPES-MAPPING.md** - Validacion de contratos
3. **SISTEMA-SEGURIDAD.md** - Security testing

---

## Fuentes de Informacion

Esta documentacion consolidada fue generada a partir de:

### Fuentes Primarias
- `/home/isem/workspace/docs/projects/glit/01-architecture/`
  - system-architecture.md
  - backend-api-reference.md
  - nodejs-backend-architecture.md
  - frontend-architecture-detailed.md
  - database-design.md

### Fuentes Secundarias
- Reportes de implementacion de modulos (backend/)
- Reportes de features (frontend/)
- Analisis de codigo fuente
- DDL files (database/)

---

## Mantenimiento

### Actualizacion
Esta documentacion debe actualizarse cuando:
- Se agreguen nuevos modulos o endpoints
- Cambien decisiones arquitectonicas
- Se modifiquen politicas de seguridad
- Se actualicen versiones de tecnologias

### Responsables
- **Arquitectura:** Tech Lead
- **Backend:** Backend Team Lead
- **Frontend:** Frontend Team Lead
- **Seguridad:** Security Engineer
- **APIs:** API Product Manager

---

## Version History

| Version | Fecha | Cambios |
|---------|-------|---------|
| 2.0 | Oct 2025 | Documentacion consolidada completa |
| 1.0 | Oct 2025 | Documentacion inicial distribuida |

---

## Contacto

Para preguntas o actualizaciones sobre esta documentacion:
- **Tech Lead:** [contacto]
- **Repositorio:** [github/glit-platform]
- **Wiki:** [confluence/glit-docs]

---

**Generado:** Octubre 2025
**Mantenido por:** GAMILIT Platform Team
**Licencia:** Confidencial - Uso interno
