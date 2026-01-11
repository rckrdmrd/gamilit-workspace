# Contexto del Proyecto - GAMILIT

**Última actualización:** 2026-01-10
**Migrado a workspace-v2:** 2026-01-10
**Nivel de Herencia:** L2 (Proyecto Standalone)

## Identificacion

| Campo | Valor |
|-------|-------|
| **Nombre** | GAMILIT |
| **Tipo** | Plataforma EdTech - Gamificacion Educativa |
| **Estado** | MVP 75% completado |
| **Version** | 2.0 |

## Descripcion

Plataforma educativa gamificada para aprendizaje de matematicas, con sistema de recompensas (XP, ML Coins), logros y rangos Maya.

---

## VARIABLES PARA DIRECTIVAS GLOBALES

Las siguientes variables se usan para resolver placeholders en directivas globales de `core/orchestration/`:

```yaml
# Identificacion del Proyecto
PROJECT:             gamilit
PROJECT_NAME:        GAMILIT

# Paths Principales
PROJECT_ROOT:        /home/isem/workspace-v2/projects/gamilit
APPS_ROOT:           /home/isem/workspace-v2/projects/gamilit/apps
DOCS_ROOT:           /home/isem/workspace-v2/projects/gamilit/docs
ORCHESTRATION:       /home/isem/workspace-v2/projects/gamilit/orchestration

# Base de Datos (para DIRECTIVA-POLITICA-CARGA-LIMPIA y DIRECTIVA-DISENO-BD)
DB_NAME:             gamilit_platform
DB_DDL_PATH:         /home/isem/workspace-v2/projects/gamilit/apps/database/ddl
DB_SCRIPTS_PATH:     /home/isem/workspace-v2/projects/gamilit/apps/database
DB_SEEDS_PATH:       /home/isem/workspace-v2/projects/gamilit/apps/database/seeds
RECREATE_CMD:        drop-and-recreate-database.sh

# Backend
BACKEND_ROOT:        /home/isem/workspace-v2/projects/gamilit/apps/backend
BACKEND_SRC:         /home/isem/workspace-v2/projects/gamilit/apps/backend/src
BACKEND_TESTS:       /home/isem/workspace-v2/projects/gamilit/apps/backend/tests

# Frontend
FRONTEND_ROOT:       /home/isem/workspace-v2/projects/gamilit/apps/frontend
FRONTEND_SRC:        /home/isem/workspace-v2/projects/gamilit/apps/frontend/src
FRONTEND_TESTS:      /home/isem/workspace-v2/projects/gamilit/apps/frontend/tests

# Auth Schema (para referencias en BD)
AUTH_SCHEMA:         auth_management
```

### Ejemplo de Resolucion de Placeholders

Cuando una directiva global usa `{DB_DDL_PATH}/schemas/{schema}/tables/`:
- Se resuelve a: `/home/isem/workspace-v2/projects/gamilit/apps/database/ddl/schemas/gamification_system/tables/`

---

## Stack Tecnológico

### Backend
- **Framework:** NestJS 11.x
- **Lenguaje:** TypeScript 5.3
- **ORM:** TypeORM 0.3.x
- **Auth:** JWT + Passport (5 proveedores OAuth)
- **API:** 417 endpoints REST

### Frontend
- **Framework:** React 19.x
- **Lenguaje:** TypeScript 5.3
- **State:** Zustand 5.x
- **Styling:** Tailwind CSS 4.x
- **Build:** Vite

### Database
- **Engine:** PostgreSQL 15
- **Schemas:** 16 schemas modulares
- **Tablas:** 123 tablas
- **RLS:** 185 políticas

## Paths de Trabajo

```
/home/isem/workspace-v2/projects/gamilit/
├── apps/
│   ├── backend/          → NestJS API
│   ├── frontend/         → React SPA
│   ├── database/         → DDL PostgreSQL
│   └── devops/           → Scripts sincronización
├── docs/                 → Documentación del proyecto
└── orchestration/        → Sistema de orquestación local
```

---

## WORKSPACES DUALES

**IMPORTANTE:** GAMILIT tiene dos workspaces con propositos diferentes.

### Workspace NUEVO (Este - Prioridad Desarrollo)

| Aspecto | Valor |
|---------|-------|
| **Path** | `/home/isem/workspace-v2/projects/gamilit` |
| **Remote** | `http://72.60.226.4:3000/rckrdmrd/workspace.git` |
| **Proposito** | Desarrollo activo, agentes, directivas |
| **Prioridad** | ALTA - Todo desarrollo nuevo aqui |

### Workspace VIEJO (Produccion Cliente)

| Aspecto | Valor |
|---------|-------|
| **Path** | `~/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit` |
| **Remote** | `git@github.com:rckrdmrd/gamilit-workspace.git` |
| **Proposito** | Deployment a servidor produccion |
| **Contenido especial** | Scripts produccion, guias HTTPS/PM2/Certbot |

### Reglas de Sincronizacion

Ver directiva completa: `orchestration/directivas/DIRECTIVA-SINCRONIZACION-WORKSPACES.md`

**Resumen:**
- Desarrollo → NUEVO primero, luego sincronizar a VIEJO
- Configuraciones (.env.production, ecosystem.config.js) → AMBOS
- Scripts de produccion → Solo VIEJO
- DDL y Seeds → IDENTICOS en ambos

### Servidor de Produccion

| Aspecto | Valor |
|---------|-------|
| IP | 74.208.126.102 |
| Backend | Puerto 3006 (PM2 cluster) |
| Frontend | Puerto 3005 (PM2 fork) |
| Database | PostgreSQL :5432, `gamilit_platform` |

## Convenciones Específicas

### Nomenclatura de Archivos

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| DDL Tablas | `{NN}-{nombre_tabla}.sql` | `05-user_achievements.sql` |
| Módulos NestJS | `{nombre}.module.ts` | `gamification.module.ts` |
| Services | `{nombre}.service.ts` | `achievements.service.ts` |
| Controllers | `{nombre}.controller.ts` | `achievements.controller.ts` |
| Componentes React | `{Nombre}.tsx` | `AchievementCard.tsx` |
| Tests | `{nombre}.test.tsx` | `AchievementCard.test.tsx` |

### Esquemas de Base de Datos

1. `auth` - autenticación estándar (sistema)
2. `auth_management` - Gestión autenticación (11 tablas)
3. `educational_content` - Contenido educativo (8 tablas)
4. `gamification_system` - Gamificación (12 tablas)
5. `progress_tracking` - Tracking progreso (10 tablas)
6. `admin_dashboard` - Dashboard admin (6 tablas)
7. `content_management` - Gestión contenido (7 tablas)
8. `social_features` - Features sociales (8 tablas)
9. `storage` - Almacenamiento (5 tablas)
10. `audit_logging` - Logs auditoría (6 tablas)
11. `system_configuration` - Configuración (4 tablas)
12. `lti_integration` - Integración LTI (5 tablas)
13. `gamilit` - Schema principal (10 tablas)
14. `public` - Acceso público (2 tablas)
15. `communication` - Comunicaciones (3 tablas)
16. `notifications` - Notificaciones (4 tablas)

## Directivas Específicas del Proyecto

### SSOT (Single Source of Truth)
- Sincronización obligatoria de ENUMs: `npm run sync:enums`
- Validación de constantes: `npm run validate:constants`
- API Contract: `npm run validate:api-contract`

### Política de Carga Limpia
- Seeds con UUIDs estáticos
- Scripts idempotentes
- Validación pre-ejecución

### Coverage Mínimo
- Backend: 60%
- Frontend: 60%
- Database Triggers: 40%

## Scripts Principales

```bash
# Desarrollo
npm run dev                    # Backend + Frontend concurrente
npm run backend:dev            # Solo backend
npm run frontend:dev           # Solo frontend

# Validación
npm run sync:enums             # Sincronizar ENUMs
npm run validate:constants     # Validar constantes
npm run validate:api-contract  # Validar rutas API
npm run validate:all           # Todas las validaciones

# Testing
npm run test                   # Todos los tests
npm run test:backend           # Tests backend
npm run test:frontend          # Tests frontend

# Build
npm run build                  # Build completo
```

## Sistema de Directivas

### Directivas Globales (heredadas de core)
Las siguientes directivas se aplican a TODOS los proyectos del workspace:

| Directiva | Propósito |
|-----------|-----------|
| `DIRECTIVA-FLUJO-5-FASES.md` | Workflow obligatorio de 5 fases para subagentes |
| `DIRECTIVA-VALIDACION-SUBAGENTES.md` | Proceso de validación de entregables |
| `POLITICAS-USO-AGENTES.md` | Reglas de delegación y uso de subagentes |
| `DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md` | Documentación requerida antes de código |
| `DIRECTIVA-CALIDAD-CODIGO.md` | Estándares de calidad de código |
| `DIRECTIVA-CONTROL-VERSIONES.md` | Control de versiones y commits |
| `DIRECTIVA-GESTION-BACKUPS-GITIGNORE.md` | Gestión de backups y gitignore |
| `PROTOCOLO-ESCALAMIENTO-PO.md` | Protocolo de escalamiento al PO |
| `ESTANDARES-NOMENCLATURA-BASE.md` | Nomenclatura base del workspace |

**Path:** `/home/isem/workspace-v2/orchestration/directivas/`

### Directivas Específicas de Gamilit
Directivas que aplican solo a este proyecto:

| Directiva | Propósito |
|-----------|-----------|
| `DIRECTIVA-DISENO-BASE-DATOS.md` | Diseño de BD con 16 schemas |
| `DIRECTIVA-POLITICA-CARGA-LIMPIA.md` | DDL-first, sin migraciones |
| `ESTANDARES-API-ROUTES.md` | Convenciones de rutas REST |
| `ESTANDARES-TESTING-API.md` | Estándares de testing para API |
| `PITFALLS-API-ROUTES.md` | Errores comunes a evitar en rutas |

**Path:** `/home/isem/workspace-v2/projects/gamilit/orchestration/directivas/`

### Prompts Específicos de Gamilit
Prompts especializados para este proyecto:

| Prompt | Uso |
|--------|-----|
| `PROMPT-DATABASE-AGENT.md` | Agente para tareas de BD PostgreSQL |
| `PROMPT-DATABASE-AUDITOR.md` | Auditoría de BD y optimización |
| `PROMPT-BACKEND-AGENT.md` | Desarrollo backend NestJS |
| `PROMPT-FRONTEND-AGENT.md` | Desarrollo frontend React |
| `PROMPT-ARCHITECTURE-ANALYST.md` | Análisis arquitectónico |

**Path:** `/home/isem/workspace-v2/projects/gamilit/orchestration/prompts/`

## Documentación de Referencia

### Dentro del Proyecto
- `docs/00-overview/VISION.md`
- `docs/01-requerimientos/` (por épica)
- `docs/02-especificaciones-tecnicas/`

### En Workspace-v1 (Orquestación Global)
- `/home/isem/workspace-v2/orchestration/directivas/` (directivas globales)
- `/home/isem/workspace-v2/orchestration/agents/perfiles/` (perfiles de agentes)
- `/home/isem/workspace-v2/orchestration/templates/` (templates)
- `/home/isem/workspace-v2/orchestration/referencias/` (referencias)

### En Knowledge Base
- `/home/isem/workspace-v2/shared/knowledge-base/patterns/` (patrones aplicables)
- `/home/isem/workspace-v2/shared/knowledge-base/lessons-learned/` (lecciones aprendidas)
- `/home/isem/workspace-v2/shared/catalog/` (catálogo compartido)

---

## Sistema NEXUS v4.0 - Integración

### Resolución Automática de Contexto
El archivo `CONTEXT-MAP.yml` en este directorio define:
- Niveles de contexto (L0-L3) con presupuestos de tokens
- Mapeo tarea → archivos a cargar
- Integración con docs/
- Aliases resueltos

### Ciclo CAPVED++
Todas las tareas siguen el ciclo:
```
C: Contexto → A: Análisis → P: Planeación → V: Validación → E: Ejecución → D: Documentación
```

Cada fase tiene gates de validación obligatorios.

### Registro de Errores
Antes de ejecutar cualquier tarea, buscar en:
- `orchestration/errores/REGISTRO-ERRORES.yml` (local)
- `/home/isem/workspace-v2/orchestration/errores/REGISTRO-ERRORES.yml` (global)

### Integración Scrum
- Sprint activo: `orchestration/scrum/SPRINT-ACTUAL.yml`
- HUs deben crearse antes de tareas significativas

---
*Contexto del proyecto Gamilit - Sistema NEXUS v4.0*
