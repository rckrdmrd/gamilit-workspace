# CLAUDE.md - gamilit

**Sistema:** SIMCO v4.0.0 + SAAD + NEXUS v4.1 | **Version:** 3.0.0 | **Fecha:** 2026-02-11

---

## IDENTIDAD

Este es el proyecto **gamilit** — repositorio standalone con gobernanza local completa.

**Tipo:** STANDALONE
**Workspace:** Standalone repository (git@github.com:rckrdmrd/gamilit-workspace.git)
**Stack:** NestJS 11 + React 19 + PostgreSQL 15 + TypeORM 0.3.x + Redis + Socket.IO 4.8+ + Vite 6.x
**Estado:** MVP 98% Completado (Produccion Activa)

Contiene:
- `apps/` — Codigo fuente MONOREPO (backend, frontend, database — mismo repo GitHub)
- `docs/` — Documentacion del producto (6 secciones + estandares bundled)
- `orchestration/` — SIMCO local completo (directivas, agentes, inventarios, trazas)

**Proposito:** Plataforma educativa gamificada que utiliza mecanicas de videojuegos basadas en cultura maya para mejorar comprension lectora. Sistema completo con 5 modulos educativos, 23 tipos de ejercicios, 4 portales (estudiante, maestro, admin, padres), gamificacion completa (XP, rangos maya, logros, economia virtual con ML Coins).

**Gobernanza:** Local — todas las directivas SIMCO, principios, triggers y perfiles de agente estan replicados en `orchestration/`.

---

## REGLAS CRITICAS

### RC1: FETCH ANTES DE OPERAR
```
ANTES DE CUALQUIER VERIFICACION GIT:
  git fetch origin && git log HEAD..origin/main --oneline
  Si hay output = git pull
  Luego: git status
SIN FETCH = ESTADO INCOMPLETO
```

### RC2: COHERENCIA ENTRE CAPAS
```
TODA MODIFICACION DEBE MANTENER COHERENCIA:
  DDL -> Backend: Toda tabla DEBE tener entity (170 tablas = 152 entities coherentes)
  Backend -> Frontend: Endpoints documentados (850 endpoints)
  Inventarios: DATABASE/BACKEND/FRONTEND/MASTER = 100% sincronizados

SI HAY GAPS: DOCUMENTAR + BLOQUEAR avance hasta resolver
```

### RC3: STANDALONE — HEREDERO DE PATRONES (NO CODIGO)
```
gamilit es STANDALONE:
  - NO hereda codigo de ningun proyecto
  - SI usa PATRONES de referencia (auth, gamificacion, multi-tenancy conceptos)
  - NO tiene parent formal en cadena de herencia
  - NO propaga a otros proyectos (es referencia)
```

### RC4: MONOREPO — SINGLE GIT REPO
```
gamilit usa estructura MONOREPO:
  - TODO el codigo en MISMO repositorio GitHub
  - NO submodules (.gitmodules NO existe)
  - apps/backend + apps/frontend + apps/database = tracked en mismo repo

Remote: git@github.com:rckrdmrd/gamilit-workspace.git
Branch: main
```

### RC5: BASES DE DATOS Y CREDENCIALES
| Servicio | Puerto | Base de Datos | Usuario | Password | Redis DB |
|----------|--------|---------------|---------|----------|----------|
| PostgreSQL | 5432 | gamilit_platform | gamilit_user | gamilit_dev_2026 | - |
| Redis | 6379 | - | - | - | 0 |

**Schemas:** 18 schemas modulares (16 activos + 2 placeholder)

### RC6: DEPLOYMENT (Servidor Produccion)
```
Servidor: 74.208.126.102
Usuario: isem
Backend: Puerto 4006 interno (Nginx proxy 3006→4006 HTTPS), fork mode PM2
Frontend: Puerto 4005 interno (Nginx proxy 3005→4005 HTTPS), fork mode PM2

Deploy agent workflow:
  1. git pull origin main
  2. Backup DB → recrear si DDL cambio
  3. npm install + npm run build (backend + frontend)
  4. pm2 restart ecosystem.config.js
  5. Smoke tests

Ver: @PERFIL-DEPLOY para workflow completo
```

---

## COMPORTAMIENTO OBLIGATORIO

Sistema SIMCO con ciclo **CAPVED** para toda tarea.

### Regla 1: Metodologia Por Defecto
PARA TODA TAREA: 1) CAPVED completo, 2) Verificar catalogo, 3) Analizar dependencias, 4) Validar build/lint, 5) Documentar, 6) NO propagar (es standalone)

### Regla 2: Verificacion Anti-Duplicacion
ANTES de crear objeto nuevo: Verificar catalogos existentes -> Si existe: USAR -> Si similar >=70%: COPIAR Y ADAPTAR -> Si no existe: GENERAR + DOCUMENTAR

### Regla 3: Edicion Segura
**PROHIBIDO:** `// ...`, `/* ... */`, cualquier placeholder sin implementar
**OBLIGATORIO:** Edicion minima, verificar coherencia, documentar cambio

### Regla 4: Monorepo Workflow
COMMITS en monorepo (todo en mismo repo):
1. Modificar archivos en apps/backend o apps/frontend o apps/database
2. git add . && git commit -m "[GAM-XXX] desc" && git push origin main
3. Verificar: git status = "working tree clean"

NO usar workflow de submodules (no aplica a monorepo)

### Flujo de Desarrollo
1. DDL primero -> Validar en PostgreSQL -> Entity -> Endpoints -> Frontend -> Tests
2. Todo modulo nuevo requiere: DDL + Entity + Controller + Service + DTOs + Tests + Docs
3. Minimo 80% test coverage objetivo

---

## MODULOS (22 Core + Educativos)

### Core Infrastructure (7)
| # | Modulo | Descripcion | Estado |
|---|--------|-------------|--------|
| 1 | auth | JWT + Passport + RBAC, multi-tenant | 100% |
| 2 | users | User management, roles academicos | 100% |
| 3 | tenants | Multi-tenancy con RLS | 100% |
| 4 | core | Utilidades compartidas | 100% |
| 5 | health | Health checks | 100% |
| 6 | settings | Configuracion del sistema | 100% |
| 7 | notifications | Email, push, in-app, SMS | 90% |

### Educational Content (5)
| # | Modulo | Descripcion | Estado |
|---|--------|-------------|--------|
| 8 | modules | 5 modulos educativos (literal a critica) | 95% |
| 9 | exercises | 23 tipos de ejercicio en 5 modulos | 95% |
| 10 | content | Gestion de contenido educativo | 95% |
| 11 | classrooms | Gestion de aulas | 90% |
| 12 | students | Perfiles de estudiantes, progreso | 90% |

### Gamification System (7)
| # | Modulo | Descripcion | Estado |
|---|--------|-------------|--------|
| 13 | gamification | XP, rangos maya, achievements, ML coins | 95% |
| 14 | leaderboard | Rankings, competencias | 85% |
| 15 | missions | Quests, misiones diarias/semanales | 85% |
| 16 | store | Tienda virtual con ML Coins | 75% |
| 17 | achievements | Badges, milestones, rangos maya | 90% |
| 18 | social | Interacciones sociales, equipos | 50% |

### Support (4)
| # | Modulo | Descripcion | Estado |
|---|--------|-------------|--------|
| 19 | teachers | Herramientas docentes, asignaciones | 95% |
| 20 | parents | Portal padres, notificaciones | 100% |
| 21 | analytics | Learning analytics, reportes | 85% |
| 22 | reports | Reportes de progreso, exportaciones | 75% |

**Total:** 22 modulos, 152 entities, 170 services, 107 controllers, 850 endpoints

---

## MODOS DE EJECUCION

| Modo | Fases | Uso |
|------|-------|-----|
| FULL | CAPVED completo | Features, bugs, refactor, BD |
| QUICK | E+D | Typos, fixes menores |
| ANALYSIS | C+A+P | Investigacion, auditoria |

NO aplica PROPAGATION (es standalone)

---

## ALIASES DE INVOCACION RAPIDA

### Proyecto Local
| Alias | Ruta |
|-------|------|
| @BACKEND | apps/backend/src/modules/ |
| @FRONTEND | apps/frontend/src/ |
| @DDL | apps/database/ddl/ |
| @SEEDS | apps/database/seeds/ |
| @DOCS-LOCAL | docs/ |
| @INVENTORY | orchestration/inventarios/ |
| @WORK-ITEMS | orchestration/work-items/ |
| @PROJECT-CTX | orchestration/PROJECT-CONTEXT.md |

### Gobernanza Local
| Alias | Ruta |
|-------|------|
| @DOCS | docs/ |
| @ORCHESTRATION | orchestration/ |
| @ESTANDARES | docs/40-standards/ |
| @ADRS | docs/90-adr/ |
| @SIMCO | orchestration/directivas/simco/ |
| @PRINCIPIOS | orchestration/directivas/principios/ |
| @TRIGGERS | orchestration/directivas/triggers/ |
| @PERFILES-MAP | orchestration/agents/perfiles/_MAP.md |

### Deployment
| Alias | Ruta |
|-------|------|
| @PERFIL-DEPLOY | orchestration/agents/perfiles/PERFIL-DEPLOY-SERVER.md |
| @ECOSYSTEM | ecosystem.config.js |

---

## ESTRUCTURA DEL PROYECTO

```
gamilit/
+-- CLAUDE.md                    <- ESTE ARCHIVO
+-- README.md
+-- _INDEX.yml                   <- Redirect stub -> orchestration/_INDEX.yml
+-- _inheritance.yml             <- Redirect stub -> orchestration/_inheritance.yml
+-- ecosystem.config.js          <- PM2 config (backend:4006, frontend:4005, fork mode)
+-- apps/                        <- MONOREPO (tracked en mismo repo)
|   +-- backend/                 <- NestJS 11 (22 modulos, 850 endpoints)
|   +-- frontend/                <- React 19 + Zustand + TailwindCSS
|   +-- database/                <- PostgreSQL 15 DDL (18 schemas, 170 tablas)
|   +-- devops/                  <- Deployment scripts
|   +-- _MAP.md
+-- docs/
|   +-- 00-overview/             <- Vision, modulos, metricas
|   +-- 10-requirements/         <- Requerimientos (ADR-034: jerarquia anidada)
|   |   +-- epics/
|   |       +-- EPIC-GAM-F{N}-{ID}/
|   |           +-- EPIC.md
|   |           +-- PLAN.md
|   |           +-- user-stories/
|   |               +-- US-{ID}/
|   |                   +-- US-{ID}-{nombre}.md
|   |                   +-- tasks/
|   |                       +-- TASK-{ID}-{CODE}/
|   +-- 20-architecture/         <- Arquitectura, stack, modelo datos
|   +-- 30-ux-ui/                <- Wireframes, mockups, flujos
|   +-- 40-api/                  <- Endpoints, contratos
|   +-- 40-standards/            <- Estandares bundled (9 archivos)
|   +-- 90-adr/                  <- ADRs del proyecto (34 ADRs)
+-- orchestration/
    +-- _INDEX.yml
    +-- _inheritance.yml
    +-- PROJECT-CONTEXT.md
    +-- CONTEXT-MAP.yml          <- Variables y aliases resueltos
    +-- BOOTLOADER.md            <- Secuencia de arranque
    +-- agents/                  <- 42 perfiles de agente
    +-- directivas/              <- ~110 archivos SIMCO
    +-- inventarios/             <- 8 YAMLs SSOT
    +-- work-items/              <- Epics/sprints tracking
    +-- trazas/                  <- Logs de ejecucion
    +-- tareas/                  <- Gestion de tareas
    +-- scrum/                   <- BACKLOG, sprints
    +-- templates/               <- Templates reutilizables
    +-- referencias/             <- Docs de referencia
```

---

## HERENCIA Y RELACIONES

```yaml
proyecto:
  nombre: "gamilit"
  tipo: "STANDALONE"
  nivel: 2A
  padre_directo: null
  workspace: "standalone"
  gobernanza: "local"
  relaciones:
    - tipo: "PATTERN_REFERENCE"
      descripcion: "Usa patrones como referencia (auth, gamification concepts)"
```

---

## PORTALES

### Portal Estudiante (~100%)
- Dashboard con progreso y estadisticas
- 5 modulos de ejercicios interactivos (23 tipos)
- Sistema de gamificacion (XP, rangos maya, logros, tienda)
- Leaderboards y componente social

### Portal Maestro (~95%)
- Gestion de aulas y estudiantes (19 paginas)
- Asignacion de ejercicios
- Reportes de progreso
- Revision manual de ejercicios

### Portal Administrador (~90%)
- Gestion de contenido educativo (18 paginas)
- Configuracion del sistema
- Analytics globales
- Gestion de usuarios y roles

### Portal Padres (100%)
- Vinculacion padre-estudiante
- Dashboard de progreso academico
- Notificaciones (email, push, SMS)
- Comunicacion maestro-padre

---

## METRICAS ACTUALES

### Base de Datos
| Metrica | Valor |
|---------|-------|
| Schemas | 18 (16 activos + 2 placeholder) |
| Tablas | 170 |
| Views | 22 |
| Materialized Views | 7 |
| Funciones | 255 |
| Triggers | 132 |
| Politicas RLS | 263 |
| Foreign Keys | 273 |
| ENUMs | 41 |

### Backend
| Metrica | Valor |
|---------|-------|
| Modulos | 22 |
| Entities | 152 |
| DTOs | 412 |
| Services | 170 |
| Controllers | 107 |
| Endpoints | 850 |
| Guards | 14 |
| Decorators | 18 |
| Tests | 833 passing |

### Frontend
| Metrica | Valor |
|---------|-------|
| Componentes | 458 |
| Hooks | 127 |
| Paginas | 85 |
| Stores Zustand | 32 |
| API Services | 48 |
| Portales | 4 |
| Mecanicas | 40 |
| Routes | 24 |

> **SSOT:** `orchestration/inventarios/MASTER_INVENTORY.yml`

---

## VALIDACIONES OBLIGATORIAS

```bash
# Backend
cd apps/backend && npm run build && npm run lint && npm run test

# Frontend
cd apps/frontend && npm run build && npm run lint && npm run typecheck

# Database (recrear desde DDL)
bash apps/database/scripts/recreate-database.sh
```

---

*Sistema SAAD v1.0.0 - Activacion Automatica de Directivas SIMCO*
