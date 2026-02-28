---
titulo: "EPIC-GAM-SCAFFOLD: Scaffolding Gamilit"
tipo: epic
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# EPIC-GAM-SCAFFOLD: Scaffolding Gamilit

| Campo | Valor |
|-------|-------|
| **Proyecto** | gamilit |
| **Wave** | wave_3 (High Priority P1) |
| **Story Points** | 5 |
| **Estado** | completed |
| **Prioridad** | P1 |

**ADR:** [ADR-039](../../../../90-adr/ADR-039-ssot-docs-en-proyecto.md)

---

## Descripcion

Setup inicial del proyecto gamilit como plataforma educativa gamificada basada en cultura maya para comprension lectora. Incluye la creacion de la estructura monorepo completa (apps/backend, apps/frontend, apps/database, apps/devops), configuracion base de NestJS 11, React 19 con Vite 6.x, PostgreSQL 15, inicializacion del repositorio GitHub, y la generacion del CLAUDE.md inicial con identidad STANDALONE_HEREDERO.

## Alcance

- Estructura monorepo con apps/backend, apps/frontend, apps/database, apps/devops
- Configuracion base NestJS 11 (tsconfig, ESLint, Prettier, Jest)
- Configuracion base React 19 + Vite 6.x (TailwindCSS, Zustand, Vitest)
- Schema inicial PostgreSQL 15 con estructura multi-schema
- Repositorio GitHub (git@github.com:rckrdmrd/gamilit-workspace.git)
- CLAUDE.md v1.0.0 con identidad y reglas criticas del proyecto

## Componentes Afectados

| Capa | Componentes |
|------|-------------|
| Database | Schema inicial, configuracion PostgreSQL 15 |
| Backend | NestJS 11 scaffold, package.json, tsconfig.json, eslint.config |
| Frontend | React 19 scaffold, Vite 6.x config, TailwindCSS setup |
| DevOps | Git repository, .gitignore, estructura apps/devops |

## Dependencias

**Depende de:** Ninguna (primera epica del proyecto)
**Bloquea:** EPIC-GAM-REQUIREMENTS

## User Stories

> Detalle en: [../user-stories/](../user-stories/) (27 US L3)

## Definition of Done

- [ ] Estructura monorepo creada con las 4 aplicaciones (backend, frontend, database, devops)
- [ ] Build exitoso en backend (npm run build) y frontend (npm run build)
- [ ] Repositorio GitHub inicializado con branch main
- [ ] Documentacion actualizada
- [ ] Inventarios sincronizados

## Tracking

**YAML:** [EPIC-GAM-SCAFFOLD.yml](../../../../../orchestration/work-items/epics/EPIC-GAM-SCAFFOLD.yml)

---
*Generado: 2026-02-07 | SSOT: ADR-039 | Template: TEMPLATE-EPICA.md v2.0.0*
