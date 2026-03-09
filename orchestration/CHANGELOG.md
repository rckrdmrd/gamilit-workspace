# CHANGELOG - Orchestration GAMILIT

> **Scope:** Orchestration and governance changes (SIMCO directives, inventories, agents). For product code changes, see [`../CHANGELOG.md`](../CHANGELOG.md).

Historial de cambios del sistema de orquestacion de GAMILIT.

Formato basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.3.0] - 2026-03-09

### Audit & Cleanup
- Archived 38 completed task folders from orchestration/tareas/ (~170 files, ~3.1MB freed)
- ARCHIVE-DIGEST.md updated with Batch 2 covering 2026-01-22 to 2026-03-03 (77 total tasks)
- Fixed 11 phantom references in trazas/_INDEX.yml
- Fixed orchestration/_INDEX.yml: removed 3 non-existent dirs, added 14 missing real dirs
- Updated trazas/_MAP.md to reflect actual file inventory

### Removed
- NEXT-ACTIONS.md (duplicate of PROXIMA-ACCION.md)
- PROPAGATION-CRITERIA-MATRIX.yml (N/A for standalone)
- Non-standalone templates (provider/, suite/)
- EPIC-GAM-SCAFFOLD/ (completed, 0 stories)
- 2 duplicate scrum templates, 3 duplicate prompt files
- docs/00-overview/ stubs (ARQUITECTURA-TECNICA, COMANDOS-VALIDACION, ESTRUCTURA-DOCS)
- docs/10-requirements/epics/03-desarrollo/ and 04-fase-backlog/ (legacy bridge docs)

### Archived
- 16 historical reports (2026-02-17, 2026-02-24) to reports/_archive/
- docs/99-delivery/2025-11-16-entrega-final/ to docs/_archived/
- docs/50-guides/frontend/impl/types/GAMIFICATION-TYPES.md to docs/_archived/

### Fixed
- Metrics corrected: TSX components 581->601, endpoints 919->915
- apps/frontend/README.md: Vite 7.1.10->6.2.0
- apps/backend/README.md: 11->18 schemas, 15->23 modules, 6->12 datasources
- apps/database/README.md: updated date and metrics (tables, functions, triggers, etc.)
- Added deprecation banners to 4 docs files (05-social.md, AUTH-PAGES-SPEC, hooks/05-PROFILE, SPEC-GAMIFICATION)
- Added cross-references between testing standards and guides (8 files)
- Added cross-references between F3 epics and portals (6 files)
- Documented API documentation gap (14 files vs ~915 endpoints) in docs/40-api/README.md
- Added P1 work item for API docs expansion in PROXIMA-ACCION.md

### Metrics Update (2026-03-09)
- Componentes TSX: 581 -> 601
- Endpoints: 919 -> 915
- Templates: 57 -> 49

---

## [1.2.0] - 2026-01-30

### Added
- GAMILIT-CONTEXT-BOOTSTRAP.md para nuevos agentes
- Politica SSOT de inventarios integrada

### Changed
- MVP completitud: 88% -> 95%
- Coherencia DDL-Backend: 98.6% -> 100%
- Coherencia Backend-Frontend: 87.5% -> 95.3%

### Fixed
- TASK-025: Gaps P1 Admin Portal resueltos
- TASK-026: Gaps P2 verificados (estado real mejor que documentado)
- TASK-027: Admin Content al 100%
- TASK-028: Teacher Portal al 100%
- TASK-029: Backend Admin Endpoints (+24 endpoints)

### Metrics Update (2026-01-27)
- Tablas: 141 -> 147
- Funciones: 126 -> 232
- Triggers: 37 -> 109
- Componentes: 309 -> 398
- Stores: 12 -> 32

---

## [1.1.0] - 2026-01-25

### Agregado
- `_INDEX.yml` - Indice estructural maestro de orchestration
- `README.md` - Documentacion completa del sistema de orquestacion
- `CHANGELOG.md` - Este archivo de historial de cambios

### Actualizado
- `_inheritance.yml` - Actualizado con fecha de sincronizacion 2026-01-25
- Sincronizacion completa desde workspace-v2/orchestration/:
  - agents/ (66 archivos)
  - directivas/ (124 archivos)
  - _definitions/ (29 archivos)
  - referencias/ (29 archivos)
  - templates/ (60 archivos)
  - _quick/ (4 archivos)

### Notas
- GAMILIT ahora opera como workspace STANDALONE con replica completa
- Sistema SIMCO v4.3.0 + NEXUS v4.0 sincronizado

---

## [1.0.0] - 2026-01-16

### Agregado
- Estructura inicial de orchestration
- `_inheritance.yml` - Declaracion de herencia STANDALONE
- `CONTEXT-MAP.yml` - Mapa de contexto NEXUS
- `PROJECT-PROFILE.yml` - Perfil del proyecto
- `PROJECT-STATUS.md` - Estado del proyecto
- `PROXIMA-ACCION.md` - Checkpoint de sesion
- `BOOTLOADER.md` - Carga inicial de contexto
- `QUICK-REFERENCE.md` - Referencia rapida
- `TRACEABILITY.yml` - Trazabilidad maestra
- `DEPENDENCY-GRAPH.yml` - Grafo de dependencias
- `MAPA-DOCUMENTACION.yml` - Mapa de documentacion
- `_MAP.md` - Mapa visual de navegacion

### Carpetas creadas
- `00-guidelines/` - Directrices del proyecto
- `_definitions/` - Definiciones SSOT
- `_quick/` - Referencias rapidas
- `agents/` - Perfiles de agentes
- `directivas/` - Sistema SIMCO
- `inventarios/` - Inventarios por capa
- `referencias/` - Referencias y prompts
- `tareas/` - Gestion de tareas
- `templates/` - Templates globales
- `trazas/` - Trazas de trabajo

### Notas
- Estructura basada en workspace-v2/orchestration/
- Adaptada para proyecto STANDALONE
- GAMILIT es proyecto de referencia (mas maduro del workspace)

---

## Convenciones

### Tipos de cambios
- **Agregado** - Nuevas funcionalidades o archivos
- **Cambiado** - Cambios en funcionalidades existentes
- **Deprecado** - Funcionalidades marcadas para eliminacion futura
- **Eliminado** - Funcionalidades o archivos eliminados
- **Corregido** - Correcciones de errores
- **Seguridad** - Correcciones de vulnerabilidades

### Versionado
- **MAJOR.MINOR.PATCH**
- MAJOR: Cambios incompatibles en estructura
- MINOR: Nuevas funcionalidades compatibles
- PATCH: Correcciones y mejoras menores

---

*Mantenido por: Sistema SIMCO*
*Proyecto: GAMILIT*
