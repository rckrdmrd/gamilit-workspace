# GAMILIT - Overview Técnico

**Versión:** 2.0 (RFC-0001)
**Última actualización:** 2025-11-01
**Estado:** 🚧 Migración en progreso

---

## Tabla de Contenidos

1. [Qué es GAMILIT](#qué-es-gamilit)
2. [Arquitectura General](#arquitectura-general)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Flujo de Datos](#flujo-de-datos)
5. [Roles y Permisos](#roles-y-permisos)
6. [Sistema de Gamificación](#sistema-de-gamificación)
7. [Navegación de la Documentación](#navegación-de-la-documentación)
8. [Quick Links](#quick-links)

---

## Qué es GAMILIT

**GAMILIT** (Gamificación Maya para la Lectoescritura en Tecnología) es una plataforma educativa web diseñada para mejorar las habilidades de lectoescritura en estudiantes de educación básica en México.

### Misión
Transformar el aprendizaje de lectoescritura mediante experiencias gamificadas, culturalmente relevantes y personalizadas por IA.

### Características Principales

**🎮 Gamificación Maya**
- Sistema de 5 rangos basados en jerarquía maya
- Multiplicadores de puntos por rango y racha
- Recompensas: puntos, insignias, logros

**🤖 IA Adaptativa**
- Ajuste dinámico de dificultad
- Retroalimentación personalizada
- Detección de áreas débiles

**📊 Tracking Detallado**
- Progreso por módulo y materia
- Métricas de desempeño
- Dashboards para teachers y admins

**📚 Contenido Modular**
- Materias organizadas por grado
- Módulos de lectura y escritura
- Quizzes de múltiples tipos

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React SPA)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Admin     │  │   Teacher   │  │   Student   │         │
│  │   Dashboard │  │   Dashboard │  │   Dashboard │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                 │                 │
└─────────┼────────────────┼─────────────────┼─────────────────┘
          │                │                 │
          └────────────────┴─────────────────┘
                           │
                      REST API (JWT)
                           │
┌─────────────────────────┼─────────────────────────────────┐
│                    BACKEND (NestJS)                        │
│  ┌──────────────────────┴────────────────────────┐        │
│  │              API Gateway                       │        │
│  └──────────────────┬────────────────────────────┘        │
│                     │                                      │
│  ┌──────────────────┼────────────────────────────────┐   │
│  │         Auth     Quiz    Gamification  Progress   │   │
│  │        Module   Module     Module       Module    │   │
│  └──────────────────┬────────────────────────────────┘   │
│                     │                                     │
└─────────────────────┼─────────────────────────────────────┘
                      │
                   TypeORM
                      │
┌─────────────────────┼─────────────────────────────────────┐
│                 PostgreSQL                                 │
│  ┌─────────────────┴──────────────────────┐              │
│  │  users | subjects | quizzes | progress │              │
│  │  roles | rankings | rewards | logs     │              │
│  └────────────────────────────────────────┘              │
└────────────────────────────────────────────────────────────┘
```

### Componentes Clave

**Frontend (React 19 + TypeScript)**
- SPA con múltiples vistas: admin, teacher, student
- Componentes reutilizables y mecánicas de ejercicios
- State management: Zustand (gestión de estado global)
- Styling: Tailwind CSS con sistema de temas

**Backend (NestJS 11 + TypeScript)**
- Arquitectura modular (11 módulos funcionales)
- Guards para autenticación/autorización
- Interceptors para logging y transformación

**Base de Datos (PostgreSQL 16)**
- 44 tablas principales en 11 schemas especializados
- Migraciones versionadas (TypeORM)
- Seeds para desarrollo y testing
- Row Level Security (RLS) para multi-tenancy

---

## Stack Tecnológico

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| **Frontend Framework** | React | 19.x | SPA moderna |
| **Build Tool** | Vite | 7.x | Build tool ultrarrápido |
| **Routing** | React Router | 7.x | Navegación SPA |
| **State Management** | Zustand | 5.x | Estado global simple y eficiente |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS framework |
| **Backend Framework** | NestJS | 11.x | API REST estructurada |
| **Runtime** | Node.js | 20.x LTS | Servidor backend |
| **Language** | TypeScript | 5.x | Frontend + Backend |
| **Database** | PostgreSQL | 16.x | Base de datos relacional |
| **ORM** | TypeORM | 0.3.x | Mapeo objeto-relacional |
| **Authentication** | JWT + Passport | - | Auth stateless |
| **Validation** | class-validator | - | DTOs validation |
| **API Docs** | Swagger | - | Documentación API |
| **Testing (Unit)** | Jest | - | Tests unitarios |
| **Testing (E2E)** | Vitest | - | Tests frontend |
| **Testing (API)** | Supertest | - | Tests E2E backend |
| **Linting** | ESLint | - | Calidad de código |
| **Formatting** | Prettier | - | Formateo |
| **CI/CD** | GitHub Actions | - | Automatización |
| **Deployment** | Docker + PM2 | - | Containerización + proceso manager |

---

## Flujo de Datos

### Flujo de Autenticación

```
1. User → Login (email + password)
2. Backend → Validate credentials
3. Backend → Generate JWT token
4. Frontend → Store token (localStorage)
5. Frontend → Attach token to all requests (Authorization: Bearer <token>)
6. Backend → Validate token (JwtAuthGuard)
7. Backend → Extract user from token (req.user)
```

### Flujo de Tomar Quiz

```
1. Student → Selecciona quiz
2. Backend → Valida permisos y estado (QuizGuard)
3. Backend → Retorna preguntas (sin respuestas correctas)
4. Student → Responde preguntas (frontend)
5. Student → Envía respuestas (POST /quiz-attempts)
6. Backend → Califica respuestas
7. Backend → Calcula puntos base
8. Backend → Aplica multiplicadores (rango + racha)
9. Backend → Actualiza progress
10. Backend → Verifica si sube de rango
11. Backend → Retorna resultado + nuevo rango (si aplica)
12. Frontend → Muestra resultado + animación rango
```

### Flujo de IA Adaptativa (Futuro)

```
1. Student completa quiz
2. Backend analiza patrón de errores
3. Backend consulta servicio IA
4. IA recomienda siguiente módulo
5. Backend actualiza recommended_modules
6. Frontend muestra recomendaciones personalizadas
```

---

## Roles y Permisos

### Jerarquía de Roles

```
ADMIN
  ├─ Gestionar todos los usuarios
  ├─ Ver dashboards globales
  ├─ Configurar sistema
  └─ Auditar actividades

TEACHER
  ├─ Crear/editar materias
  ├─ Diseñar quizzes
  ├─ Ver progreso de sus estudiantes
  └─ Calificar respuestas abiertas

STUDENT
  ├─ Acceder a materias asignadas
  ├─ Tomar quizzes
  ├─ Ver progreso personal
  └─ Ganar rangos y recompensas
```

### Matriz de Permisos

| Recurso | Admin | Teacher | Student |
|---------|-------|---------|---------|
| Ver todos usuarios | ✅ | ❌ | ❌ |
| Crear materias | ✅ | ✅ | ❌ |
| Editar materia propia | ✅ | ✅ | ❌ |
| Editar materia ajena | ✅ | ❌ | ❌ |
| Tomar quizzes | ✅ | ✅ | ✅ |
| Ver quizzes no publicados | ✅ | ✅ (propios) | ❌ |
| Calificar respuestas | ✅ | ✅ | ❌ |
| Ver progreso propio | ✅ | ✅ | ✅ |
| Ver progreso ajeno | ✅ | ✅ (sus estudiantes) | ❌ |

---

## Sistema de Gamificación

### Rangos Maya (5 niveles)

**Fuente oficial:** `01-requerimientos/gamificacion/01-RANGOS-MAYA.md`

| Rango | Nivel | Módulos Requeridos | Multiplicador | Descripción |
|-------|-------|-------------------|---------------|-------------|
| **Ajaw** | 1 | 1 módulo completado | 1.0x | Señor/Gobernante (Iniciado) |
| **Nacom** | 2 | 2 módulos completados | 1.25x | Capitán de Guerra (Explorador) |
| **Ah K'in** | 3 | 3 módulos completados | 1.5x | Sacerdote del Sol (Analítico) |
| **Halach Uinic** | 4 | 4 módulos completados | 1.75x | Hombre Verdadero (Crítico) |
| **K'uk'ulkan** | 5 | 5 módulos completados | 2.0x | Serpiente Emplumada (Maestro) |

### Multiplicadores

**Multiplicador Total = Multiplicador Rango × Multiplicador Racha**

**Racha:**
- 5 días consecutivos: 1.1x
- 10 días consecutivos: 1.2x
- 20 días consecutivos: 1.5x

**Ejemplo:**
- Estudiante rango Halach Uinic (1.75x)
- Racha de 10 días (1.2x)
- Puntos base: 50
- **Puntos finales:** 50 × 1.75 × 1.2 = **105 puntos**

### Recompensas

**Tipos:**
- **Puntos:** Acumulables para subir de rango
- **Insignias:** Por logros específicos (ej: "100 quizzes completados")
- **Logros:** Coleccionables (ej: "Racha de 30 días")

---

## Navegación de la Documentación

### Estructura de Carpetas

```
docs/
├── 00-overview/              # 👈 EMPEZAR AQUÍ
│   ├── VISION.md             # Visión del producto
│   ├── ONBOARDING.md         # Guía de setup inicial
│   └── GLOSARIO.md           # Términos clave
│
├── 01-requerimientos/        # Product requirements
│   ├── proyecto/             # Visión, propuesta de valor
│   ├── casos-uso/            # Casos de uso por rol
│   └── gamificacion/         # Sistema de gamificación
│
├── 02-especificaciones-tecnicas/  # Technical specs
│   ├── api/                  # API REST endpoints
│   ├── frontend/             # Arquitectura frontend
│   ├── database/             # Esquema DB
│   └── stack/                # Stack tecnológico
│
├── 03-desarrollo/            # Development guides
│   ├── backend/              # Guías backend
│   ├── frontend/             # Guías frontend
│   ├── base-de-datos/        # Implementación DB
│   └── testing/              # Testing strategy
│
├── 04-planificacion/         # Planificación y roadmap
│   ├── 01-alcance-inicial/   # EAI con historias de usuario
│   ├── 02-migracion-robustecimiento/  # EMR features
│   ├── 03-extensiones/       # EXT features
│   ├── roadmap/              # Roadmap general
│   └── features/             # Análisis de features
│
├── QUICK-REFERENCE/          # Guías rápidas (<5 min)
│   ├── API-CHEATSHEET.md     # Endpoints principales
│   ├── DB-CHEATSHEET.md      # Queries comunes
│   └── DEPLOY-CHECKLIST.md   # Checklist deployment
│
├── adr/                      # Architecture Decision Records
│   └── 0001-monorepo-rfc.md  # RFC-0001: Migración monorepo
│
└── standards/                # Estándares y convenciones
    ├── CODING-STANDARDS.md   # Estándares de código
    └── GIT-WORKFLOW.md       # Flujo de trabajo git
```

### Rutas de Lectura Recomendadas

**Para Nuevos Desarrolladores (2-3 horas):**
```
1. docs/00_OVERVIEW.md (este archivo)
2. docs/00-overview/ONBOARDING.md
3. docs/standards/CODING-STANDARDS.md
4. docs/QUICK-REFERENCE/ (todos)
```

**Para Product Owners (1-2 horas):**
```
1. docs/00_OVERVIEW.md
2. docs/01-requerimientos/proyecto/VISION-PRODUCTO.md
3. docs/04-planificacion/roadmap/ROADMAP-GENERAL.md
```

**Para Tech Leads (3-4 horas):**
```
1. docs/00_OVERVIEW.md
2. docs/02-especificaciones-tecnicas/ (completo)
3. docs/adr/ (todos los ADRs)
4. docs/standards/ (completo)
```

---

## Quick Links

### Documentación Técnica
- [API Endpoints](./02-especificaciones-tecnicas/api/API-ENDPOINTS.md)
- [Database Schema](./02-especificaciones-tecnicas/database/DATABASE-SCHEMA.md)
- [Arquitectura Backend](./02-especificaciones-tecnicas/backend/ARQUITECTURA-BACKEND.md)
- [Arquitectura Frontend](./02-especificaciones-tecnicas/frontend/ARQUITECTURA-FRONTEND.md)

### Guías de Desarrollo
- [Setup Backend](./03-desarrollo/backend/SETUP-BACKEND.md)
- [Setup Frontend](./03-desarrollo/frontend/SETUP-FRONTEND.md)
- [Testing Guide](./03-desarrollo/testing/TESTING-GUIDE.md)

### Requerimientos
- [Sistema de Gamificación](./01-requerimientos/gamificacion/SISTEMA-GAMIFICACION.md)
- [User Stories](./01-requerimientos/user-stories/)
- [Features](./01-requerimientos/features/)

### Planificación
- [Roadmap 2025](./04-planificacion/roadmap/ROADMAP-2025.md)
- [Épicas](./04-planificacion/epicas/)
- [Sprints](./04-planificacion/sprints/)

---

**Última actualización:** 2025-11-01
**Versión:** 2.0 (RFC-0001)
**Mantenido por:** @tech-lead @tech-writer
