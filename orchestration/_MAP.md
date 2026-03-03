# MAPA DE ORQUESTACION: GAMILIT

**Proyecto:** GAMILIT - Plataforma de Gamificacion Educativa
**Nivel:** STANDALONE
**Sistema:** NEXUS v4.1 + SIMCO v4.0.0
**Estandar:** SIMCO-ESTANDAR-ORCHESTRATION v1.0.0
**Ultima actualizacion:** 2026-03-03

---

## Estructura (Estandar STANDALONE)

```
orchestration/
├── _MAP.md                     # [ESTE ARCHIVO] Mapa de navegacion
├── _INDEX.yml                  # Indice maestro SSOT
├── _inheritance.yml            # Tipo: STANDALONE
├── BOOTLOADER.md               # Protocolo de arranque NEXUS v4.1
├── CONTEXT-MAP.yml             # Configuracion contexto automatico (IoC v4.0)
├── PROJECT-CONTEXT.md          # Contexto del proyecto
├── PROJECT-PROFILE.yml         # Perfil y metadata del proyecto
├── PROJECT-STATUS.md           # Estado actual del proyecto
├── PROXIMA-ACCION.md           # Checkpoint de sesion
├── TRACEABILITY.yml            # Trazabilidad del proyecto
├── CHANGELOG.md                # Historial de cambios
│
├── _definitions/               # Definiciones canonicas (32 archivos)
│   ├── protocols/              # CCA, CAPVED, DELEGATION, CHECKPOINT, RECOVERY
│   ├── validations/            # BACKEND, FRONTEND, DDL, DEVOPS
│   ├── checklists/             # GOBERNANZA, PRE-CREATE, PRE-MODIFY, POST-TASK
│   ├── schemas/                # SESSION-STATE, PROXIMA-ACCION, CHECKPOINT
│   ├── sections/               # IDENTITY, RESPONSIBILITIES, REFERENCES, ERRORS
│   ├── triggers/               # CONTEXT-PURGE, AUTO-CHECKPOINT, SESSION-CLEANUP
│   └── templates/              # SUBAGENTS-LOG
│
├── _quick/                     # Quick references (4 archivos)
│
├── agents/                     # Perfiles de agente (57 archivos)
│   ├── perfiles/               # 28 full profiles + _MAP.md + 5 archived
│   ├── perfiles/compact/       # 15 compact profiles + _MAP-COMPACT + README
│   ├── configs/                # 4 shared configs
│   ├── ALIASES.yml             # Registro de agentes
│   └── AGENT-CAPABILITIES-MATRIX.yml
│
├── directivas/                 # Directivas (127 archivos)
│   ├── simco/                  # 75 SIMCO activos + _INDEX + 15 archivados
│   ├── principios/             # 15 principios + _INDEX
│   ├── triggers/               # 13 triggers + _INDEX (2 phantoms documentados)
│   ├── politicas/              # 3 politicas + _INDEX
│   └── modos/                  # 3 modos + _INDEX
│
├── inventarios/                # INVENTARIOS SSOT (11 YAMLs incl. LOCAL-WSL-ENVIRONMENT)
│   ├── MASTER_INVENTORY.yml
│   ├── BACKEND_INVENTORY.yml
│   ├── DATABASE_INVENTORY.yml
│   ├── FRONTEND_INVENTORY.yml
│   ├── SEEDS_INVENTORY.yml
│   ├── TEST_COVERAGE.yml
│   ├── TRACEABILITY_MATRIX.yml
│   ├── DEPENDENCY_GRAPH.yml
│   ├── SKILLS-REGISTRY.yml
│   ├── LOCAL-WSL-ENVIRONMENT.yml
│   └── CROSS-REFERENCE-MASTER.yml
│
├── work-items/                 # Epics tracking (60+ archivos)
│   └── epics/                  # Flat YAMLs + nested structures
│
├── trazas/                     # Trazas de ejecucion (7 archivos)
│
├── tareas/                     # Gestion de tareas
├── scrum/                      # BACKLOG, sprints
├── templates/                  # Templates reutilizables
└── referencias/                # Docs de referencia
```

---

## Archivos Root (11 - Estandar STANDALONE)

| Archivo | Proposito |
|---------|-----------|
| `_MAP.md` | Mapa de navegacion (este archivo) |
| `_INDEX.yml` | Indice maestro SSOT |
| `_inheritance.yml` | Modelo de herencia (STANDALONE) |
| `BOOTLOADER.md` | Protocolo de arranque NEXUS v4.1 |
| `CONTEXT-MAP.yml` | Configuracion contexto automatico (IoC v4.0) |
| `PROJECT-CONTEXT.md` | Contexto del proyecto |
| `PROJECT-PROFILE.yml` | Perfil para agentes |
| `PROJECT-STATUS.md` | Estado actual del proyecto |
| `PROXIMA-ACCION.md` | Checkpoint de sesion |
| `TRACEABILITY.yml` | Trazabilidad del proyecto |
| `CHANGELOG.md` | Historial de cambios |

---

## Carpetas Activas (10)

| Carpeta | Proposito | Contenido |
|---------|-----------|-----------|
| `_definitions/` | Definiciones canonicas | 32 archivos (protocols, validations, checklists incl. CHECKLIST-SECURITY-SUPPLY-CHAIN, schemas, triggers, templates) |
| `_quick/` | Quick references | 4 archivos de referencia rapida |
| `agents/` | Perfiles de agente | 28 full + 15 compact + 4 configs + 5 archived + 2 root YMLs = 57 |
| `directivas/` | Directivas SIMCO | 70 SIMCO + 15 principios + 13 triggers + 3 politicas + 3 modos + 15 archived = 124 |
| `inventarios/` | SSOT de objetos | 11 inventarios (incl. LOCAL-WSL-ENVIRONMENT, CROSS-REFERENCE-MASTER) |
| `work-items/` | Epics tracking | 60+ archivos (flat + nested) |
| `trazas/` | Trazas de tareas | Por dominio (DB, Backend, Frontend) |
| `tareas/` | Gestion de tareas | Tareas de analisis y desarrollo |
| `scrum/` | Scrum artifacts | BACKLOG, sprints |
| `templates/` | Templates reutilizables | Templates por tipo de artefacto |

---

## Inventarios (SSOT — 11 archivos)

| Inventario | Descripcion | Version | Estado |
|------------|-------------|---------|--------|
| MASTER_INVENTORY.yml | Inventario maestro consolidado | v14.9.4 | Activo |
| BACKEND_INVENTORY.yml | 23 modulos, 156 entities, 915 endpoints | v4.0.0 | Activo |
| DATABASE_INVENTORY.yml | 18 schemas, 173 tablas, 158 funciones | v8.0.0 | Activo |
| FRONTEND_INVENTORY.yml | 575 componentes, 70 paginas, 13 stores | v5.1.0 | Activo |
| SEEDS_INVENTORY.yml | 92 pipeline entries | v2.0.0 | Activo |
| TEST_COVERAGE.yml | 2324 tests, 63 spec files | - | Activo |
| TRACEABILITY_MATRIX.yml | Mapeo requerimientos a componentes | - | Activo |
| DEPENDENCY_GRAPH.yml | Grafo de dependencias modulos/capas | - | Activo |
| LOCAL-WSL-ENVIRONMENT.yml | Configuracion entorno WSL local | - | Activo |
| SKILLS-REGISTRY.yml | Registro de skills de agentes | - | Activo |
| CROSS-REFERENCE-MASTER.yml | Referencias cruzadas entre inventarios y capas | - | Activo |

---

## Metricas del Proyecto (Sincronizado con MASTER_INVENTORY v14.9.4)

| Metrica | Valor |
|---------|-------|
| Modulos Backend | 23 |
| Schemas PostgreSQL | 18 |
| Tablas | 173 |
| Views | 18 |
| Funciones DB | 158 |
| Triggers DB | 68 |
| ENUMs | 42 |
| Endpoints API | 915 |
| Entities | 156 (files) / 157 (classes) |
| Services | 173 |
| Controllers | 109 |
| Guards | 15 |
| Interceptors | 6 |
| Pipes | 6 |
| Filters | 2 |
| Componentes Frontend | 575 |
| Paginas | 70 |
| Hooks | 132 |
| Stores Zustand | 13 |
| API Calls | ~580 |
| Routes | 74 |
| Tests Total | 2324 |
| Estado MVP | 98% |

---

## Navegacion

| Destino | Enlace |
|---------|--------|
| CLAUDE.md | [../CLAUDE.md](../CLAUDE.md) |
| Documentacion proyecto | [../docs/](../docs/) |
| Directivas SIMCO | [directivas/simco/](directivas/simco/) |
| Principios | [directivas/principios/](directivas/principios/) |
| Triggers | [directivas/triggers/](directivas/triggers/) |
| Inventarios | [inventarios/](inventarios/) |
| _definitions/ | [_definitions/](_definitions/) |
| Perfiles agente | [agents/perfiles/](agents/perfiles/) |
| Work-items | [work-items/](work-items/) |

---

## Historial de Consolidacion

- 2026-01-24: Consolidacion inicial (41 -> 6 carpetas, 85% reduccion)
- 2026-02-03: Purga completa de _archive/ + carpetas vacias
- 2026-02-11: SIMCO v4.0.0 + NEXUS v4.1 + CONTEXT-MAP v4.0
- 2026-02-12: Inventarios actualizados a v4-8.0.0, purga perfiles obsoletos
- 2026-02-13: _MAP.md actualizado con metricas reales y estructura completa
- 2026-02-14: Agregados TRIGGER-QUALITY-GATE, POLITICA-SUPPLY-CHAIN, CHECKLIST-SECURITY-SUPPLY-CHAIN

---

*Estandarizado segun SIMCO-ESTANDAR-ORCHESTRATION v1.0.0*
*Ultima actualizacion: 2026-03-03*
