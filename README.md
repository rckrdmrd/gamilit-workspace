# GAMILIT - Monorepo

**Version:** 2.0 (RFC-0001)
**Fecha migración:** 2025-11-01
**Estado:** 🚧 En migración desde legacy repos

---

## 📚 Qué es GAMILIT

**GAMILIT** (Gamificación Maya para la Lectoescritura en Tecnología) es una plataforma educativa que mejora las habilidades de lectoescritura en estudiantes de educación básica mediante gamificación basada en la cultura maya y aprendizaje adaptativo con IA.

**Target:** Estudiantes de primaria y secundaria en México
**Diferenciadores:** Rangos maya + IA adaptativa + Tracking detallado

---

## 🗂️ Estructura del Monorepo

```
/gamilit/projects/gamilit/
├── apps/                      # Aplicaciones
│   ├── backend/               # API NestJS (migrado de gamilit-platform-backend)
│   ├── frontend/              # Frontend React SPA (migrado de gamilit-platform-web)
│   ├── database/              # Base de datos PostgreSQL
│   │   ├── ddl/               # Definiciones de esquema
│   │   ├── migrations/        # Migraciones
│   │   ├── seeds/             # Datos de prueba
│   │   └── scripts/           # Scripts de mantenimiento
│   └── devops/                # Scripts de sincronización y validación
│
├── devops/                    # Deployment y CI/CD
│   ├── docker/                # Dockerfiles
│   ├── github-actions/        # Workflows CI/CD
│   └── scripts/               # Scripts deployment (migrado de gamilit-deployment-scripts)
│
├── docs/                      # Documentación (migrada de gamilit-docs)
│   ├── 00-overview/           # Visión general y onboarding
│   ├── 01-requerimientos/     # Product requirements
│   ├── 02-especificaciones-tecnicas/  # Technical specs
│   ├── 03-desarrollo/         # Development guides
│   ├── 04-planificacion/      # Sprints, épicas, roadmap
│   ├── QUICK-REFERENCE/       # Guías rápidas
│   ├── adr/                   # Architecture Decision Records
│   └── standards/             # Estándares y convenciones
│
├── orchestration/             # Orquestación de agentes
│   ├── prompts/               # Prompts para subagentes
│   ├── playbooks/             # Playbooks de orquestación
│   └── runners/               # Scripts de ejecución
│
├── .claude/                   # Configuración Claude Code
│   ├── commands/              # Slash commands
│   └── settings.json          # Settings
│
└── artifacts/                 # Artefactos generados
    ├── reports/               # Reportes de análisis
    └── validations/           # Validaciones automáticas
```

---

## 🚀 Quick Start

### Para Desarrolladores

```bash
# 1. Clonar el monorepo
git clone <repo-url> gamilit
cd gamilit/projects/gamilit

# 2. Ver documentación
cat docs/00-overview/ONBOARDING.md

# 3. Setup del backend
cd apps/backend
npm install
npm run start:dev

# 4. Setup del frontend
cd apps/frontend
npm install
npm run dev
```

### Para Stakeholders/PM

```bash
# Leer resumen ejecutivo
cat docs/00-overview/RESUMEN-EJECUTIVO.md

# Ver roadmap
cat docs/04-planificacion/ROADMAP.md

# Ver métricas
cat artifacts/reports/METRICAS-ACTUALES.md
```

---

## 📖 Documentación Principal

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| [docs/00-overview/VISION.md](./docs/00-overview/VISION.md) | Visión del producto | Todos |
| [docs/01-requerimientos/](./docs/01-requerimientos/) | Requerimientos funcionales | PO, PM, Devs |
| [docs/02-especificaciones-tecnicas/](./docs/02-especificaciones-tecnicas/) | Specs técnicas | Tech Lead, Devs |
| [docs/03-desarrollo/](./docs/03-desarrollo/) | Guías de desarrollo | Developers |
| [docs/QUICK-REFERENCE/](./docs/QUICK-REFERENCE/) | Guías rápidas | Todos |

---

## 🎯 Features Principales

### Sistema de Gamificación
- **Rangos Maya:** 5 niveles (NACOM → BATAB → HOLCATTE → GUERRERO → MERCENARIO)
- **Multiplicadores:** Por rango y racha
- **Recompensas:** Puntos, insignias, logros

### Evaluación Adaptativa
- **Tipos de quiz:** Opción múltiple, verdadero/falso, respuesta corta, matching
- **IA Adaptativa:** Ajuste de dificultad en tiempo real
- **Tracking:** Progreso detallado por módulo

### Roles y Permisos
- **Admin:** Gestión completa del sistema
- **Teacher:** Crear materias, diseñar quizzes, ver progreso
- **Student:** Tomar quizzes, ganar rangos, ver progreso personal

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|-----------|---------|
| **Backend** | NestJS + TypeScript | 11.x |
| **Frontend** | React + TypeScript | 19.x |
| **State Management** | Zustand | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **Base de Datos** | PostgreSQL | 16.x |
| **ORM** | TypeORM | 0.3.x |
| **Autenticación** | JWT + Passport | - |
| **CI/CD** | GitHub Actions | - |
| **Deployment** | Docker + PM2 | - |

---

## 🔐 Constants SSOT (Single Source of Truth)

**Implementado:** Fase 0 - Ciclo 5 (2025-11-02)
**Política:** [POLITICA-CONSTANTS-SSOT.md](../../../docs-analysis/miniworkspace-migration/06-agents/migracion-desarrollo/POLITICA-CONSTANTS-SSOT.md)
**Arquitectura:** [CONSTANTS-ARCHITECTURE.md](../../../docs-analysis/miniworkspace-migration/06-agents/migracion-desarrollo/CONSTANTS-ARCHITECTURE.md)

### ¿Qué es?

Sistema de constantes centralizadas que garantiza **type-safety** y **sincronización automática** entre Backend, Frontend y Database.

### Reglas de Oro

1. ❌ **NO hardcodear** nombres de schemas, tablas, rutas API, o ENUMs
2. ✅ **SIEMPRE importar** desde archivos de constantes
3. ✅ **ACTUALIZAR constantes** al agregar nuevas entidades
4. ✅ **SINCRONIZAR ENUMs** Backend ↔ Frontend con script
5. ✅ **VALIDAR en CI/CD** antes de merge

### Archivos de Constantes

```
apps/backend/src/shared/constants/
├── database.constants.ts      # Schemas y tablas PostgreSQL
├── routes.constants.ts        # Rutas API Backend
├── enums.constants.ts         # ENUMs compartidos (Backend source)
└── index.ts                   # Barrel export

apps/frontend/src/shared/constants/
├── api-endpoints.ts           # URLs de API endpoints
├── enums.constants.ts         # ENUMs compartidos (auto-sincronizado)
└── index.ts                   # Barrel export

apps/devops/scripts/
├── sync-enums.ts              # Sincronización automática ENUMs
├── validate-constants-usage.ts # Detectar hardcoding (33 patrones)
└── validate-api-contract.ts   # Validar Backend ↔ Frontend sync
```

### Ejemplos de Uso

**❌ PROHIBIDO (Hardcoding):**

```typescript
// Backend - Entity
@Entity({ schema: 'auth_management', name: 'users' })
export class User { ... }

// Frontend - Fetch
await fetch('http://localhost:3000/api/v1/users/123');
```

**✅ OBLIGATORIO (Constants):**

```typescript
// Backend - Entity
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants';

@Entity({ schema: DB_SCHEMAS.AUTH, name: DB_TABLES.AUTH.USERS })
export class User { ... }

// Frontend - Fetch
import { API_ENDPOINTS } from '@/shared/constants';

await fetch(API_ENDPOINTS.USERS.BY_ID('123'));
```

### Scripts NPM

```bash
# Sincronizar ENUMs Backend → Frontend
npm run sync:enums

# Validar que no haya hardcoding (detecta 33 patrones)
npm run validate:constants

# Validar que Backend y Frontend routes coincidan
npm run validate:api-contract

# Ejecutar todas las validaciones
npm run validate:all

# Auto-sync en postinstall (automático)
npm install  # ejecuta sync:enums automáticamente
```

### CI/CD Enforcement

El workflow `.github/workflows/validate-constants.yml` **bloquea PRs** si:
- ❌ Se detecta hardcoding (violaciones P0)
- ❌ Backend y Frontend routes no coinciden
- ❌ ENUMs no están sincronizados

**Status badge:** ![Constants SSOT](https://github.com/YOUR_ORG/gamilit/actions/workflows/validate-constants.yml/badge.svg)

### Pre-Commit Checklist

Antes de hacer commit, ejecutar:

```bash
# 1. Sincronizar ENUMs
npm run sync:enums

# 2. Validar todo
npm run validate:all

# 3. Si pasa, commit
git add .
git commit -m "feat: agregar nueva funcionalidad"
```

### ¿Cuándo actualizar constantes?

**Al crear nueva tabla Database:**
1. Crear DDL en `apps/database/ddl/schemas/{schema}/tables/{tabla}.sql`
2. Agregar entrada en `database.constants.ts`
3. Crear Entity usando la nueva constante

**Al crear nueva ruta API:**
1. Agregar entrada en Backend `routes.constants.ts`
2. Agregar entrada en Frontend `api-endpoints.ts`
3. Ejecutar `npm run validate:api-contract`

**Al crear nuevo ENUM:**
1. Definir en Backend `enums.constants.ts`
2. Ejecutar `npm run sync:enums` (copia automáticamente a Frontend)
3. Verificar sincronización con `diff`

### Cobertura Actual

| Categoría | Estado | Elementos Mapeados |
|-----------|--------|-------------------|
| **Database Schemas** | ✅ 100% | 8 schemas |
| **Database Tables** | ✅ 100% | 40 tablas |
| **API Routes** | ✅ 100% | 75+ rutas |
| **ENUMs** | ✅ 100% | 25 ENUMs |
| **Backend Entities** | ⏳ 20% | 5/25 usando constantes |
| **Frontend Calls** | ⏳ 0% | Pendiente refactor |

**Objetivo:** 100% cobertura en Sprint 1 (Fase 1-3)

### Métricas de Calidad

Ejecutar para ver reporte:

```bash
npm run validate:constants
```

**Output esperado:**
```
✅ EXCELENTE! No se encontraron violaciones de hardcoding.
   Todas las constantes están correctamente utilizadas.
```

### Documentación Completa

- **Arquitectura técnica:** [CONSTANTS-ARCHITECTURE.md](../../../docs-analysis/miniworkspace-migration/06-agents/migracion-desarrollo/CONSTANTS-ARCHITECTURE.md)
- **Políticas obligatorias:** [POLITICA-CONSTANTS-SSOT.md](../../../docs-analysis/miniworkspace-migration/06-agents/migracion-desarrollo/POLITICA-CONSTANTS-SSOT.md)
- **Plan de implementación:** [PLAN-MICROCICLO-5.md](../../../docs-analysis/miniworkspace-migration/06-agents/migracion-desarrollo/02-planes/PLAN-MICROCICLO-5.md)

---

## 📊 Estado de Migración

**Fase actual:** Ciclo 1 - Migración de Documentación
**Progreso:** 15% (estructura base creada)

### Checklist de Migración

- [x] **Microciclo 1-1:** Estructura base creada
  - [x] Carpetas según RFC-0001
  - [x] Git inicializado
  - [x] README.md principal
  - [ ] CODEOWNERS
  - [ ] .gitignore, .editorconfig
- [ ] **Microciclo 1-2:** Migrar 01-requerimientos/
- [ ] **Microciclo 1-3:** Migrar 02-especificaciones-tecnicas/
- [ ] **Microciclo 1-4:** Migrar 03-desarrollo/
- [ ] **Microciclo 1-5:** Migrar 04-planificacion/
- [ ] **Microciclo 1-6:** Migrar QUICK-REFERENCE/

**Ver plan completo:** [docs-analysis/miniworkspace-migration/PLAN-MIGRACION-CONTENIDO.md](../../docs-analysis/miniworkspace-migration/PLAN-MIGRACION-CONTENIDO.md)

---

## 🔗 Repositorios Legacy (Pre-migración)

- **gamilit-docs:** `/workspace-gamilit/projects/gamilit-docs/`
- **gamilit-platform-backend:** `/workspace-gamilit/projects/gamilit-platform-backend/`
- **gamilit-platform-web:** `/workspace-gamilit/projects/gamilit-platform-web/`
- **gamilit-deployment-scripts:** `/workspace-gamilit/projects/gamilit-deployment-scripts/`

---

## 👥 CODEOWNERS

Ver [CODEOWNERS](./CODEOWNERS) para responsabilidades por módulo.

---

## 📝 Changelog

### 2025-11-01 - v2.0-alpha (RFC-0001 Migration Start)
- Creada estructura de monorepo según RFC-0001
- Inicializado git repository
- Creado README.md principal

---

## 📞 Contacto

**Product Owner:** [TBD]
**Tech Lead:** [TBD]
**Documentación:** [docs/](./docs/)
**Issues:** [GitHub Issues]

---

**Generado:** 2025-11-01
**Método:** Migración RFC-0001 con Claude Code
**Análisis previo:** [docs-analysis/miniworkspace-migration/](../../docs-analysis/miniworkspace-migration/)
