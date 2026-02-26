# CLAUDE.md - gamilit

**Sistema:** SIMCO v4.0.0 + NEXUS v4.1 | **Version:** 4.0.0 | **Fecha:** 2026-02-11

---

## IDENTIDAD

Este es el proyecto **gamilit** — repositorio standalone con gobernanza local completa.

**Tipo:** STANDALONE
**Workspace:** Standalone repository (git@github.com:rckrdmrd/gamilit-workspace.git)
**Stack:** NestJS 11 + React 19 + PostgreSQL 15 + TypeORM 0.3.x + Redis + Socket.IO 4.8+ + Vite 6.x
**Estado:** MVP 98% Completado (Produccion Activa)

Contiene:
- `apps/` — Codigo fuente MONOREPO (backend, frontend, database — mismo repo GitHub)
- `docs/` — Documentacion del producto (10 secciones: overview, requirements, architecture, ux-ui, api, standards, guides, portals, onboarding, adr, delivery)
- `orchestration/` — SIMCO local completo (directivas, agentes, inventarios, trazas)

**Proposito:** Plataforma educativa gamificada que utiliza mecanicas de videojuegos basadas en cultura maya para mejorar comprension lectora. Sistema completo con 5 modulos educativos, 23 tipos de ejercicios, 4 portales (estudiante, maestro, admin, padres), gamificacion completa (XP, rangos maya, logros, economia virtual con ML Coins).

**Gobernanza:** Local — todas las directivas SIMCO, principios, triggers y perfiles de agente estan replicados en `orchestration/`.

---

## REGLAS CRITICAS

### RC1: FETCH ANTES DE OPERAR
```
ANTES DE CUALQUIER VERIFICACION GIT:
  git fetch origin && git log HEAD..origin/master --oneline
  Si hay output = git pull
  Luego: git status
SIN FETCH = ESTADO INCOMPLETO
```

### RC2: COHERENCIA ENTRE CAPAS
```
TODA MODIFICACION DEBE MANTENER COHERENCIA:
  DDL -> Backend: Toda tabla DEBE tener entity (173 tablas = 156 entity files/157 classes, 16 DDL-only en data_warehouse)
  Backend -> Frontend: Endpoints documentados (912 endpoints)
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
Branch: master
```

### RC5: BASES DE DATOS Y CREDENCIALES
| Servicio | Puerto | Base de Datos | Usuario | Password | Redis DB |
|----------|--------|---------------|---------|----------|----------|
| PostgreSQL | 5432 | gamilit_platform | gamilit_user | gamilit_dev_2026 | - |
| Redis | 6379 | - | - | - | 0 |

**Schemas:** 18 schemas modulares (16 activos + 2 placeholder)

**Nota de seguridad:** Estas credenciales son exclusivamente para el entorno de desarrollo local (WSL2). Produccion usa credenciales rotadas almacenadas en variables de entorno del servidor — NO en este archivo.

### RC6: DEPLOYMENT (Servidor Produccion)
```
Servidor: 74.208.126.102
Usuario: isem
Backend: Puerto 3006 (HTTPS en prod), fork mode PM2
Frontend: Puerto 3005 (HTTPS en prod), fork mode PM2

Deploy agent workflow:
  1. git pull origin master
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
2. git add . && git commit -m "[GAM-XXX] desc" && git push origin master
3. Verificar: git status = "working tree clean"

NO usar workflow de submodules (no aplica a monorepo)

### Flujo de Desarrollo
1. DDL primero -> Validar en PostgreSQL -> Entity -> Endpoints -> Frontend -> Tests
2. Todo modulo nuevo requiere: DDL + Entity + Controller + Service + DTOs + Tests + Docs
3. Minimo 50% coverage enforced (objetivo 80% gradual — ver ADR-044)

---

## MODULOS (23)

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

### Gamification System (6)
| # | Modulo | Descripcion | Estado |
|---|--------|-------------|--------|
| 13 | gamification | XP, rangos maya, achievements, ML coins | 95% |
| 14 | leaderboard | Rankings, competencias | 85% |
| 15 | missions | Quests, misiones diarias/semanales | 85% |
| 16 | store | Tienda virtual con ML Coins | 75% |
| 17 | achievements | Badges, milestones, rangos maya | 90% |
| 18 | social | Interacciones sociales, equipos | 60% |

### Support (5)
| # | Modulo | Descripcion | Estado |
|---|--------|-------------|--------|
| 19 | teachers | Herramientas docentes, asignaciones | 95% |
| 20 | parents | Portal padres, notificaciones | 100% |
| 21 | analytics | Learning analytics, reportes | 85% |
| 22 | reports | Reportes de progreso, exportaciones | 75% |
| 23 | mail | Transporte email (transitivo via auth/notifications/teacher/parents/progress) | 100% |

**Total:** 23 modulos, 156 entities (157 classes), 172 services, 108 controllers, 912 endpoints

> **Nota:** Los nombres arriba son conceptuales; los directorios fisicos en `apps/backend/src/modules/` difieren (e.g., `educational`, `progress`, `admin`, `websocket`, `profile`).
> Adicionalmente, 4 directorios de modulo existen pero NO estan importados en `app.module.ts`: `etl`, `ml`, `visualization` (evaluacion pendiente — requieren datasource `data_warehouse` no configurado), y `mail` (cargado transitivamente por `auth`, `notifications`, `teacher`, `parents`, `progress`).

---

## MODOS DE EJECUCION

| Modo | Fases | Uso |
|------|-------|-----|
| FULL | CAPVED completo | Features, bugs, refactor, BD |
| QUICK | E+D | Typos, fixes menores |
| ANALYSIS | C+A+P | Investigacion, auditoria |

NO aplica PROPAGATION (es standalone)

---

## NEXUS v4.1 - GESTION DE CONTEXTO

### Jerarquia de 4 Niveles

| Nivel | Nombre | Tokens | Persistencia | Contenido |
|-------|--------|--------|--------------|-----------|
| L0 | Sistema | 8,000 | Siempre | CLAUDE.md, SIMCO-TAREA, principios, perfil agente |
| L1 | Proyecto | 5,000 | Por proyecto | PROJECT-CONTEXT, PROXIMA-ACCION, MASTER_INVENTORY |
| L2 | Operacion | 4,000 | Por dominio | SIMCO-DDL/BACKEND/FRONTEND, inventario dominio |
| L3 | Tarea | 3,000 | Dinamico | Archivos especificos, codigo, dependencias |

**Total base:** 20,000 tokens | **Disponible tarea:** ~130,000 tokens (Claude 200K)

### Limites por Modelo

| Modelo | Ventana | Alerta (80%) | Seguro (75%) |
|--------|---------|--------------|--------------|
| Claude Opus 4.6 | 200K | 160K | 150K |
| Claude Sonnet 4.5 | 200K | 160K | 150K |
| Claude Haiku 4.5 | 200K | 160K | 150K |
| Gemini 3 Pro/Flash | 1M | 800K | 750K |
| Windsurf Cascade | 128K | 102K | 96K |

### Seleccion de Modelo

| Complejidad | Modelo Recomendado | Uso |
|-------------|-------------------|-----|
| Alta (arquitectura, multi-archivo, refactor) | Claude Opus 4.6 | Orquestacion, decisiones complejas |
| Media (features, endpoints, componentes) | Claude Sonnet 4.5 | Desarrollo estandar |
| Baja (typos, fixes menores, consultas) | Claude Haiku 4.5 | Tareas rapidas |
| Analisis masivo (>50 archivos) | Gemini Pro | Analisis de codebase completo |

### Cleanup de Contexto Mid-Session

```
Triggers de limpieza:
  post_5_files:        5+ archivos leidos → clasificar ACTIVE/REFERENCE/STALE
  post_subtarea:       Subtarea completada → purgar L3
  contexto_50_pct:     >50% ventana usada → inventariar + purgar STALE
  pre_delegacion:      Antes de delegar → limpiar para subagente
  compactacion:        Sistema avisa → PROXIMA-ACCION + purga agresiva

Clasificacion:
  ACTIVE    = Necesario AHORA → mantener completo
  REFERENCE = Ya leido → reemplazar por path + resumen 1 linea
  STALE     = De tarea anterior → descartar
```

Ver: `@SIMCO-CONTEXT-CLEANUP` para protocolo detallado.

### Bootloader (5 Pasos)

```
PASO 1: Cargar L0 → CLAUDE.md + SIMCO-TAREA + CONTEXT-MAP + perfil agente
PASO 2: Identificar dominio → DDL/Backend/Frontend/DevOps/Docs
PASO 3: Cargar L1 → PROJECT-CONTEXT + PROXIMA-ACCION + MASTER_INVENTORY
PASO 4: Cargar L2 → SIMCO del dominio + inventario del dominio
PASO 5: Iniciar tarea → CAPVED segun modo
```

---

## AMBIENTES DEV vs PROD

| Aspecto | Dev (WSL Windows) | Prod (74.208.126.102) |
|---------|-------------------|----------------------|
| Backend | http://localhost:3006 | https://74.208.126.102 (Nginx:443) |
| Frontend | http://localhost:3005 | https://74.208.126.102 (Nginx:443) |
| DB Host | 127.0.0.1 | localhost |
| SSL | Sin SSL | Nginx + Certbot |
| Deploy | npm run dev | PM2 fork mode |
| Swagger | Habilitado | Deshabilitado |

Ver: `docs/20-architecture/AMBIENTES-DEV-PROD.md` para detalles completos.

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

### Documentacion
| Alias | Ruta |
|-------|------|
| @GUIDES | docs/50-guides/ |
| @PORTALS | docs/60-portals/ |
| @SCHEMA-REF | docs/20-architecture/schema-reference/ |
| @BACKEND-STD | docs/40-standards/backend-profesional/ |

### Prompts de Agentes
| Alias | Ruta |
|-------|------|
| @PROMPTS-INDEX | orchestration/referencias/prompts/PROMPTS-INDEX.md |
| @PROMPTS-CLAUDE | orchestration/referencias/prompts/PROMPTS-CLAUDE-CODE.md |
| @PROMPTS-GEMINI | orchestration/referencias/prompts/PROMPTS-GEMINI-CLI.md |
| @PROMPTS-TRAE | orchestration/referencias/prompts/PROMPTS-TRAE.md |

### Context Management (NEXUS v4.1)
| Alias | Ruta |
|-------|------|
| @NEXUS | orchestration/directivas/simco/SIMCO-CONTEXT-MANAGEMENT-V2.md |
| @CONTEXT-MAP | orchestration/CONTEXT-MAP.yml |
| @BOOTLOADER | orchestration/directivas/simco/SIMCO-BOOTLOADER.md |
| @SIMCO-CONTEXT-CLEANUP | orchestration/directivas/simco/SIMCO-CONTEXT-CLEANUP.md |
| @SIMCO-CONTEXT-ENGINEERING | orchestration/directivas/simco/SIMCO-CONTEXT-ENGINEERING.md |
| @PROXIMA-ACCION | orchestration/PROXIMA-ACCION.md |
| @COMPACT-PROFILES | orchestration/agents/perfiles/compact/ |

### Base de Datos
| Alias | Ruta |
|-------|------|
| @RECREAR-BD | orchestration/directivas/simco/SIMCO-RECREAR-BD.md |

### Deployment
| Alias | Ruta |
|-------|------|
| @PERFIL-DEPLOY | orchestration/agents/perfiles/PERFIL-DEPLOY-SERVER.md |
| @ECOSYSTEM | ecosystem.config.js |
| @AMBIENTES | docs/20-architecture/AMBIENTES-DEV-PROD.md |

---

## ESTRUCTURA DEL PROYECTO

```
gamilit/
+-- CLAUDE.md                    <- ESTE ARCHIVO
+-- README.md
+-- _INDEX.yml                   <- Redirect stub -> orchestration/_INDEX.yml
+-- _inheritance.yml             <- Redirect stub -> orchestration/_inheritance.yml
+-- ecosystem.config.js          <- PM2 config (backend:3006, frontend:3005, fork mode)
+-- apps/                        <- MONOREPO (tracked en mismo repo)
|   +-- backend/                 <- NestJS 11 (23 modulos, 912 endpoints)
|   +-- frontend/                <- React 19 + Zustand + TailwindCSS
|   +-- database/                <- PostgreSQL 15 DDL (18 schemas, 173 tablas)
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
|   +-- 20-architecture/         <- Arquitectura, stack, modelo datos, schema-reference/
|   +-- 30-ux-ui/                <- Wireframes, mockups, flujos
|   +-- 40-api/                  <- Endpoints, contratos
|   +-- 40-standards/            <- Estandares (17 archivos + backend-profesional/)
|   +-- 50-guides/               <- Guias de implementacion (backend, frontend, deploy, testing)
|   +-- 60-portals/              <- Manuales de portales (student, teacher, admin)
|   +-- 70-onboarding/           <- Guias de onboarding por rol
|   +-- 80-references/           <- Referencias tecnicas
|   +-- 90-adr/                  <- ADRs del proyecto (47 ADRs normalizados)
|   +-- 99-delivery/             <- Documentos de entrega
+-- orchestration/
    +-- _INDEX.yml
    +-- _inheritance.yml
    +-- PROJECT-CONTEXT.md
    +-- CONTEXT-MAP.yml          <- Variables y aliases resueltos
    +-- BOOTLOADER.md            <- Secuencia de arranque
    +-- agents/                  <- Perfiles de agente (full + compact)
    +-- directivas/              <- 72 archivos SIMCO activos (+15 en _archive)
    +-- inventarios/             <- 10 YAMLs SSOT
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
- Gestion de aulas y estudiantes (16 paginas)
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
| Tablas | 173 |
| Views | 18 |
| Materialized Views | 7 |
| Funciones | 158 (DDL functions/ dirs) |
| Triggers | 68 |
| Politicas RLS | 251 (DDL rls-policies/ dirs) |
| Foreign Keys | 301 |
| ENUMs | 42 |

### Backend
| Metrica | Valor |
|---------|-------|
| Modulos | 23 |
| Entities | 156 files (157 classes) |
| DTOs | 401 |
| Services | 172 |
| Controllers | 108 |
| Endpoints | 912 |
| Guards | 15 |
| Decorators | 18 |
| Tests | 833 passing (63 spec files) |

### Frontend
| Metrica | Valor |
|---------|-------|
| Componentes (.tsx prod) | 577 |
| Hooks | 134 |
| Paginas | 67 |
| Stores Zustand | 13 |
| API Service Files | 65 |
| API Calls Total | ~575 |
| Portales | 4 |
| Mecanicas Ejercicio | 30 |
| Routes | 74 |
| Type Files | 49 |

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
