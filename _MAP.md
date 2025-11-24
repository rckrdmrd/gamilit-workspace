# _MAP: Gamilit Monorepo (Raíz)

**Última actualización:** 2025-11-07
**Estado:** 🚧 En migración y desarrollo activo
**Versión:** 2.0 (RFC-0001)
**Propósito:** Mapa maestro del workspace completo

---

## 📋 Propósito de este Workspace

Este es el **monorepo completo** de GAMILIT (Gamificación Maya para la Lectoescritura en Tecnología), una plataforma educativa web que mejora las habilidades de lectoescritura mediante gamificación basada en cultura maya y aprendizaje adaptativo con IA.

**Sistema de Organización:** SIMCO (Sistema Indexado Modular por Contexto)

**Audiencia:**
- Tech Leads
- Desarrolladores (Backend, Frontend, Database, DevOps)
- Product Owners
- QA Engineers
- Agentes de IA (Claude Code y subagentes)
- Stakeholders

---

## 📁 Estructura del Monorepo

### Carpetas Principales

| Carpeta | Propósito | Owner | Estado | _MAP.md |
|---------|-----------|-------|--------|---------|
| **docs/** | Documentación completa del proyecto | @tech-lead @tech-writer | 🟢 Activa | ✅ |
| **apps/** | Aplicaciones y código fuente | @tech-lead @dev-team | 🟢 Activa | ✅ |
| **orchestration/** | Orquestación de agentes IA | @tech-lead | 🟡 En desarrollo | ✅ |
| **artifacts/** | Artefactos generados (reportes, diagramas) | @tech-lead | 🟡 En desarrollo | ✅ |
| **devops/** | Deployment, CI/CD, Docker | @devops-team | ⚪ Vacío (planeado) | ⚪ |
| **platform/** | Infraestructura compartida | @platform-team | ⚪ Vacío (planeado) | ⚪ |
| **.claude/** | Configuración Claude Code | @tech-lead | 🟢 Activa | ⚪ |
| **.github/** | GitHub Actions, workflows | @devops-team | 🟢 Activa | ⚪ |

### Archivos en Raíz

| Archivo | Propósito | Owner | Estado |
|---------|-----------|-------|--------|
| **README.md** | Punto de entrada principal | @tech-lead | ✅ |
| **CONTRIBUTING.md** | Guía de contribución | @tech-lead | ✅ |
| **CODEOWNERS** | Responsabilidades por módulo | @tech-lead | ✅ |
| **package.json** | Configuración workspace root | @tech-lead | ✅ |
| **tsconfig.json** | Configuración TypeScript global | @tech-lead | ✅ |
| **ecosystem.config.js** | PM2 process manager config | @devops-team | ✅ |
| **.gitignore** | Exclusiones de Git | @tech-lead | ✅ |
| **.editorconfig** | Estándares de editor | @tech-lead | ✅ |
| **.env.feature-flags** | Feature flags | @tech-lead | ✅ |
| **start-dev.sh** | Script inicio desarrollo | @devops-team | ✅ |
| **stop-dev.sh** | Script detener desarrollo | @devops-team | ✅ |

---

## 🗂️ Desglose por Carpeta Principal

### docs/ - Documentación Completa

**Descripción:** Toda la documentación del proyecto organizada por **FASES** (no por tipo de documento)

**Organización:** Por fases consecutivas del proyecto (Agosto 2024 - Noviembre 2025)

**Subcarpetas principales:**
- `00-vision-general/` - Visión, onboarding, diseño de mecánicas v6.1
- `01-fase-alcance-inicial/` - **Fase 1** (Mes 1): Fundamentos - 6 épicas EAI-001 a EAI-006
- `02-fase-robustecimiento/` - **Fase 2** (Mes 2): Migración BD - 1 épica EMR-001
- `03-fase-extensiones/` - **Fase 3** (Mes 3-4): Extensiones - 10 épicas EXT-001 a EXT-010
- `04-fase-backlog/` - **Fase 4**: Backlog futuro
- `90-transversal/` - Docs transversales (features, inventarios, sprints, correcciones)
- `95-guias-desarrollo/` - Guías de desarrollo
- `96-quick-reference/` - Guías rápidas (<5 min)
- `97-adr/` - Architecture Decision Records
- `98-standards/` - Estándares
- `adr/` - ADRs (ubicación alternativa)
- `database/` - Documentación específica de BD
- `sistema-recompensas/` - Implementación v2.3.0 (detallada)

**Estructura de cada épica (EAI-XXX/, EXT-XXX/):**
- `requerimientos/` - Product requirements
- `especificaciones/` - Specs técnicas
- `implementacion/` - Notas de implementación
- `pruebas/` - Test plans
- `historias-usuario/` - User stories
- `README.md` - Índice de la épica

**Archivos:** ~2,200 archivos markdown
**_MAP.md:** ✅ docs/_MAP.md (si existe)
**Estado:** 🟢 Documentación activa y bien organizada por fases

---

### apps/ - Aplicaciones y Código

**Descripción:** Todo el código fuente del sistema (backend, frontend, database, devops)

**Subcarpetas:**
- `backend/` - API NestJS + TypeScript (migrado de gamilit-platform-backend)
- `frontend/` - Frontend React SPA (migrado de gamilit-platform-web)
- `database/` - Base de datos PostgreSQL (DDL, migrations, seeds, scripts)
- `devops/` - Scripts de sincronización y validación

**Tecnologías:**
- Backend: NestJS 10.x + Node.js 20.x + TypeScript 5.x
- Frontend: React 19.2 + TypeScript 5.9 + Vite 7.1
- Database: PostgreSQL 16+ (9 schemas, 44 tablas)
- DevOps: Docker + PM2

**_MAP.md:** ✅ apps/_MAP.md
**Estado:** 🟢 En desarrollo activo

---

### orchestration/ - Orquestación de Agentes

**Descripción:** Sistema de orquestación para agentes de IA (análisis, logs, validaciones)

**Subcarpetas:**
- `01-analisis/` - Agentes de análisis (bugs, features, performance, refactoring)
- `02-playbooks/` - Playbooks de orquestación (planeado)
- `03-prompts/` - Prompts para subagentes (planeado)
- `04-logs/` - Logs de ejecución de agentes (backend, frontend, database, devops, integration)
- `05-validaciones/` - Validaciones automáticas (tipos, integración, documentación)

**Propósito:** Facilitar trabajo con agentes de IA para tareas complejas multi-paso

**_MAP.md:** ✅ orchestration/_MAP.md
**Estado:** 🟡 En desarrollo

---

### artifacts/ - Artefactos Generados

**Descripción:** Artefactos generados por builds, análisis, reportes

**Subcarpetas:**
- `diagrams/` - Diagramas de arquitectura (mermaid, plantuml)
- `changelogs/` - Changelogs generados
- `reports/` - Reportes de validación, coverage, performance

**_MAP.md:** ✅ artifacts/_MAP.md
**Estado:** 🟡 En desarrollo

---

### devops/ (Vacío - Planeado)

**Descripción:** Deployment, CI/CD, Docker, Kubernetes

**Contenido planeado:**
- `docker/` - Dockerfiles para backend, frontend, database
- `github-actions/` - Workflows CI/CD
- `scripts/` - Scripts de deployment (migrado de gamilit-deployment-scripts)
- `kubernetes/` - Manifiestos K8s

**_MAP.md:** ⚪ Pendiente
**Estado:** ⚪ No iniciado

---

### platform/ (Vacío - Planeado)

**Descripción:** Infraestructura compartida entre aplicaciones

**Contenido planeado:**
- Librerías compartidas
- Utilidades comunes
- Configuración compartida

**_MAP.md:** ⚪ Pendiente
**Estado:** ⚪ No iniciado

---

## 🔗 Interdependencias Globales

### Flujo de Información

```
┌─────────────────────────────────────────────────────────────┐
│                         docs/                                │
│    (Source of Truth - Requerimientos y Especificaciones)    │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         ▼           ▼           ▼
    ┌────────┐  ┌────────┐  ┌──────────┐
    │ Backend│  │Frontend│  │ Database │
    │        │  │        │  │          │
    │ NestJS │  │ React  │  │ Postgres │
    └────┬───┘  └───┬────┘  └────┬─────┘
         │          │            │
         └──────────┴────────────┘
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
    ┌──────────┐         ┌────────────┐
    │orchestr. │         │ artifacts/ │
    │(agentes) │         │ (reportes) │
    └──────────┘         └────────────┘
```

### Dependencias Entre Carpetas

**docs/ → apps/**
- Requerimientos informan desarrollo
- Specs técnicas guían implementación
- ADRs definen decisiones arquitectónicas

**apps/backend → apps/database**
- Backend consume DDL de database
- Entities mapean a tablas
- Constants referencian schemas/tablas

**apps/frontend → apps/backend**
- Frontend consume API endpoints
- Tipos compartidos (ENUMs sincronizados)
- WebSocket para real-time

**orchestration/ → apps/ + docs/**
- Agentes analizan código en apps/
- Agentes generan reportes basados en docs/
- Logs de ejecución en orchestration/04-logs/

**artifacts/ ← todos**
- Diagramas generados desde docs/
- Reportes desde análisis de apps/
- Changelogs desde commits

---

## 📊 Métricas del Workspace

### Tamaño y Composición

| Métrica | Valor | Notas |
|---------|-------|-------|
| **Total archivos** | ~3,500+ | Incluyendo código, docs, configs |
| **Archivos markdown** | 2,269 | Documentación completa |
| **Archivos _MAP.md** | 96 (4.2%) | Sistema SIMCO |
| **Directorios** | 578 | Estructura profunda |
| **Líneas de código** | ~130k+ LOC | Backend + Frontend |
| **Líneas docs** | ~60k+ | Documentación exhaustiva |

### Cobertura SIMCO (Sistema Indexado Modular por Contexto)

| Nivel | Cobertura | Estado |
|-------|-----------|--------|
| **Nivel 0 (raíz)** | 100% (1/1) | ✅ Este archivo |
| **Nivel 1 (carpetas principales)** | 67% (4/6) | 🟡 En progreso |
| **Nivel 2 (subcarpetas)** | 30% | 🔴 Insuficiente |
| **Nivel 3+ (profundidad)** | 15% | 🔴 Insuficiente |

### Estado de Migración

| Componente | Estado | Progreso |
|------------|--------|----------|
| **Documentación** | Migrada | 90% |
| **Backend** | Migrado | 100% |
| **Frontend** | Migrado | 100% |
| **Database** | Migrado | 100% |
| **DevOps** | Pendiente | 0% |
| **CI/CD** | Parcial | 30% |

---

## 🚨 Issues Conocidos

### P0 (Crítico)

- **P0-001:** Cobertura SIMCO insuficiente (16.6% vs 80% objetivo)
  - Falta: apps/backend/_MAP.md, apps/frontend/_MAP.md
  - Impacto: Agentes no tienen contexto completo

### P1 (Alto)

- **P1-001:** Testing coverage bajo (12-15% vs 80% objetivo)
  - Documentado en: docs/02-especificaciones-tecnicas/testing-strategy/
  - Crítico: 0 tests para exercise engine (27 mecánicas)

- **P1-002:** Monitoring no implementado (70% pendiente)
  - Documentado en: docs/02-especificaciones-tecnicas/monitoring/
  - Falta: Prometheus, Sentry, Alertmanager, OpenTelemetry

- **P1-003:** RLS Policies incompletas (118 de 159, 74%)
  - 41 políticas activas en 14 tablas
  - Falta testing exhaustivo

### P2 (Medio)

- **P2-001:** Carpetas devops/ y platform/ vacías
  - Migración de gamilit-deployment-scripts pendiente

---

## 📐 Estándares y Convenciones

### Sistema SIMCO

**Definición:** Sistema Indexado Modular por Contexto

**Principios:**
1. Cada carpeta DEBE tener un archivo `_MAP.md`
2. `_MAP.md` indexa TODO el contenido de la carpeta
3. Formato estándar: RFC-0001 template
4. Referencias relativas (no absolutas)
5. Interdependencias documentadas

**Template:** `docs/_MAP_TEMPLATE.md`

### Nomenclatura de Archivos

**Documentación (.md):**
- `UPPER-CASE-KEBAB.md` - Archivos principales
- `lower-case-kebab.md` - Archivos secundarios
- `_MAP.md` - Mapas de contexto (obligatorio)
- `README.md` - Índices de carpetas

**Código (.ts, .tsx):**
- `kebab-case.ts` - Archivos de código
- `PascalCase.tsx` - Componentes React
- `camelCase` - Variables y funciones

**Límites:**
- Markdown: <400 líneas (excepto justificado)
- Código: Según ESLint rules

### Git Workflow

Ver: `docs/standards/GIT-WORKFLOW.md`

### Coding Standards

Ver: `docs/standards/CODING-STANDARDS.md`

---

## 🔍 Navegación Rápida

### Para Nuevos Desarrolladores

```bash
# 1. Leer overview
cat docs/00_OVERVIEW.md

# 2. Setup inicial
cat docs/00-overview/ONBOARDING.md

# 3. Guías de desarrollo
cat docs/03-desarrollo/README.md

# 4. Guías rápidas
ls docs/QUICK-REFERENCE/
```

### Para Product Owners

```bash
# Visión del producto
cat docs/01-requerimientos/proyecto/VISION-PRODUCTO.md

# Roadmap
cat docs/04-planificacion/roadmap/

# Métricas
cat artifacts/reports/
```

### Para Tech Leads

```bash
# Arquitectura
cat docs/02-especificaciones-tecnicas/arquitectura/

# ADRs
cat docs/02-especificaciones-tecnicas/adr/

# Testing
cat docs/02-especificaciones-tecnicas/testing-strategy/
```

### Para Agentes de IA

```bash
# Sistema SIMCO
find . -name "_MAP.md" -type f

# Análisis
cat orchestration/01-analisis/

# Prompts
cat orchestration/03-prompts/ (cuando exista)
```

---

## 🛠️ Scripts NPM Principales

```bash
# Desarrollo
npm run dev                 # Backend + Frontend concurrentemente
npm run backend:dev         # Solo backend
npm run frontend:dev        # Solo frontend

# Build
npm run build               # Build completo
npm run backend:build       # Build backend
npm run frontend:build      # Build frontend

# Testing
npm run test                # Tests completos
npm run backend:test        # Tests backend
npm run frontend:test       # Tests frontend

# Linting y Formatting
npm run lint                # Lint completo
npm run format              # Format completo

# Constants SSOT (Single Source of Truth)
npm run sync:enums          # Sincronizar ENUMs Backend → Frontend
npm run validate:constants  # Detectar hardcoding (33 patrones)
npm run validate:api-contract  # Validar Backend ↔ Frontend sync
npm run validate:all        # Todas las validaciones
```

---

## 🎯 Criterios de Validación

### Completitud del Workspace

- [x] README.md en raíz
- [x] CONTRIBUTING.md
- [x] CODEOWNERS
- [x] _MAP.md en raíz (este archivo)
- [x] package.json configurado
- [x] Git inicializado
- [ ] devops/ poblado
- [ ] platform/ poblado
- [ ] 80% cobertura _MAP.md

### Calidad SIMCO

- [x] _MAP.md raíz existe
- [x] Formato RFC-0001 aplicado
- [x] Interdependencias documentadas
- [x] Métricas incluidas
- [ ] 80%+ directorios con _MAP.md
- [ ] Script de validación SIMCO

---

## 📞 Contacto y Soporte

**Owner principal:** @tech-lead
**Maintainers:**
- Backend: @backend-team
- Frontend: @frontend-team
- Database: @database-team
- DevOps: @devops-team
- Documentación: @tech-writer

**Reportar issues:**
- GitHub Issues: [Repositorio principal]
- Slack: #gamilit-dev

**Contribuir:**
- Leer: [CONTRIBUTING.md](./CONTRIBUTING.md)
- Seguir: [docs/standards/](./docs/standards/)
- PRs: Crear pull request con descripción clara

---

## 🚀 Próximos Pasos

### Corto Plazo (Esta Semana)

1. ✅ Crear _MAP.md raíz (este archivo)
2. ⬜ Crear _MAP.md para carpetas nivel 1 faltantes
3. ⬜ Completar cobertura SIMCO en docs/
4. ⬜ Script de validación SIMCO

### Medio Plazo (Próximas 2 Semanas)

5. ⬜ Poblar devops/ con configs Docker y CI/CD
6. ⬜ Crear _MAP.md para apps/backend/ y apps/frontend/
7. ⬜ Implementar testing crítico (exercise engine)
8. ⬜ Implementar monitoring básico (Prometheus + Sentry)

### Largo Plazo (Próximo Mes)

9. ⬜ 80%+ cobertura SIMCO
10. ⬜ 80%+ test coverage
11. ⬜ Monitoring completo
12. ⬜ RLS policies completas

---

## 📚 Recursos Adicionales

**Documentación oficial:**
- Overview: [docs/00_OVERVIEW.md](./docs/00_OVERVIEW.md)
- Requerimientos: [docs/01-requerimientos/](./docs/01-requerimientos/)
- Specs técnicas: [docs/02-especificaciones-tecnicas/](./docs/02-especificaciones-tecnicas/)
- Desarrollo: [docs/03-desarrollo/](./docs/03-desarrollo/)

**Referencias externas:**
- [NestJS Docs](https://docs.nestjs.com/)
- [React Docs](https://react.dev/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

---

**Generado:** 2025-11-07
**Método:** Sistema SIMCO - Fase 1 (Mapas P0)
**Próxima actualización:** Tras completar mapas nivel 1
**Versión:** 1.0.0
