# ADR-038: Estructura Canonica del Directorio apps/

**Estado:** Accepted
**Fecha:** 2026-02-11
**Contexto:** Estructura MONOREPO en gamilit standalone

## Contexto

Gamilit es un proyecto standalone con estructura MONOREPO donde todo el codigo fuente (backend, frontend, database) reside en un unico repositorio GitHub.

### Situacion Actual

Gamilit adopta desde su inicio la estructura canonica `apps/` que workspace-arch define en ADR-0011:

```
gamilit/
├── apps/
│   ├── backend/           # NestJS 11 (22 modulos, 899 endpoints)
│   ├── frontend/          # React 19 + Zustand + TailwindCSS
│   ├── database/          # PostgreSQL 15 DDL (18 schemas, 169 tablas)
│   ├── devops/            # Deployment scripts
│   └── _MAP.md            # Indice de aplicaciones
├── docs/                  # Documentacion del producto (6 secciones)
├── orchestration/         # SIMCO local completo
├── CLAUDE.md              # Instrucciones para agentes
└── README.md
```

### Problema Prevenido

La estructura canonica `apps/` previene:

1. **Confusion sobre donde crear archivos nuevos** - Todos los componentes van en `apps/`
2. **Inconsistencia en rutas para scripts** - Paths predecibles (`apps/{componente}/`)
3. **Ambiguedad en agentes** - Agentes saben exactamente donde buscar codigo
4. **Falta de separacion de concerns** - Codigo vs Documentacion vs Orchestration

## Decision

**Mantener `apps/` como directorio contenedor OBLIGATORIO para todos los componentes de desarrollo** en gamilit.

### Estructura Canonica Gamilit

```
gamilit/
├── apps/                  # MONOREPO (tracked en mismo repo GitHub)
│   ├── backend/           # NestJS 11 API principal
│   │   ├── src/
│   │   │   ├── modules/   # 22 modulos (auth, users, modules, gamification...)
│   │   │   ├── common/    # Utilidades compartidas
│   │   │   └── main.ts
│   │   ├── test/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── frontend/          # React 19 aplicacion web
│   │   ├── src/
│   │   │   ├── components/  # 475 componentes
│   │   │   ├── pages/       # 68 paginas (4 portales)
│   │   │   ├── stores/      # 14 stores Zustand
│   │   │   └── App.tsx
│   │   ├── package.json
│   │   └── vite.config.ts
│   ├── database/          # PostgreSQL 15 DDL
│   │   ├── ddl/           # 18 schemas, 169 tablas
│   │   ├── seeds/         # Datos iniciales
│   │   └── scripts/       # recreate-database.sh
│   ├── devops/            # Deployment
│   │   ├── nginx/         # Nginx configs
│   │   └── pm2/           # PM2 configs
│   └── _MAP.md            # Indice de aplicaciones
├── docs/                  # Documentacion del producto
│   ├── 00-overview/
│   ├── 10-requirements/   # Epics, User Stories
│   ├── 20-architecture/
│   ├── 30-ux-ui/
│   ├── 40-api/
│   ├── 40-standards/      # 9 estandares bundled
│   └── 90-adr/            # 35+ ADRs
├── orchestration/         # Gobernanza local SIMCO
│   ├── directivas/        # ~110 archivos SIMCO
│   ├── agents/            # 42 perfiles de agente
│   ├── inventarios/       # 8 YAMLs SSOT
│   ├── tareas/            # Gestion de tareas
│   └── templates/         # Templates reutilizables
├── ecosystem.config.js    # PM2 config (backend:3006, frontend:3005)
├── CLAUDE.md              # Instrucciones para agentes
└── README.md
```

### Variante Aplicada: MONOREPO Puro

| Aspecto | Configuracion |
|---------|---------------|
| Tipo | MONOREPO (single Git repo) |
| Componentes | backend + frontend + database en mismo repo |
| Comparticion | Sin `packages/` (codigo compartido dentro de backend/src/common) |
| Submodulos | NO usa .gitmodules |
| Remote | git@github.com:rckrdmrd/gamilit-workspace.git |
| Branch | master |

## Consecuencias

### Positivas

1. **Estructura uniforme** - Todos los componentes de desarrollo en `apps/`
2. **Scripts y CI/CD con rutas predecibles** - `apps/{componente}/` consistente
3. **Separacion clara de concerns:**
   - `apps/` = Codigo fuente
   - `docs/` = Documentacion de producto
   - `orchestration/` = Gobernanza SIMCO
4. **Onboarding simplificado** - Estructura predecible para nuevos colaboradores
5. **Compatible con workspace-arch** - Sigue patron de ADR-0011

### Negativas

1. **Sin comparticion via packages/** - Codigo compartido queda en backend/src/common
   - Mitigacion: Suficiente para proyecto standalone
2. **Profundidad de directorios** - Paths largos (`apps/backend/src/modules/...`)
   - Mitigacion: IDEs modernos manejan bien paths largos

## Alternativas Consideradas

1. **Estructura FLAT (componentes en raiz)**
   - Rechazada: Patron legacy de workspace-arch, menos organizado

2. **MONOREPO con packages/**
   - Rechazada: Overhead innecesario para proyecto standalone sin multi-apps

3. **POLYREPO (repos separados)**
   - Rechazada: Gamilit es monorepo desde inicio, separar romperia flujo

## Implementacion en Gamilit

### Archivos Clave

```
gamilit/
  apps/
    _MAP.md                # Indice de aplicaciones (backend, frontend, database)
    backend/
      README.md            # Documentacion del backend
      package.json
    frontend/
      README.md            # Documentacion del frontend
      package.json
    database/
      README.md            # Documentacion del database
      scripts/
        recreate-database.sh
  orchestration/
    directivas/simco/
      SIMCO-DDL.md         # Directiva para cambios en apps/database
      SIMCO-BACKEND.md     # Directiva para cambios en apps/backend
      SIMCO-FRONTEND.md    # Directiva para cambios en apps/frontend
  CLAUDE.md              # Regla RC4: MONOREPO — SINGLE GIT REPO
```

### Reglas de Navegacion

| Alias | Ruta | Uso |
|-------|------|-----|
| @BACKEND | apps/backend/src/modules/ | Modulos NestJS |
| @FRONTEND | apps/frontend/src/ | Componentes React |
| @DDL | apps/database/ddl/ | Schemas y tablas |
| @SEEDS | apps/database/seeds/ | Datos iniciales |

## Referencias

- [ADR-0011 (workspace-arch)](C:\Empresas\ISEM\workspace-arch\docs\90-adr\ADR-0011-estructura-canonica-apps.md) - ADR original
- [apps/_MAP.md](../../apps/_MAP.md) - Indice de aplicaciones
- [CLAUDE.md](../../CLAUDE.md) - Seccion RC4: MONOREPO

---

**Documentado por:** Arquitecto Gamilit
**Ubicacion:** docs/90-adr/ADR-038-estructura-canonica-apps.md
