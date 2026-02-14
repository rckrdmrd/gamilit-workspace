# ADR-039: SSOT - Documentacion del Producto en el Proyecto

**Estado:** Accepted
**Fecha:** 2026-02-11
**Contexto:** Gobernanza de documentacion en gamilit standalone

## Contexto

Gamilit es un proyecto standalone con documentacion completa en su repositorio. La pregunta critica es: **¿Donde vive la documentacion de producto vs documentacion de proceso?**

### Principio SSOT Violado

Sin una decision clara, podria ocurrir:

1. **Duplicacion masiva:** User Stories en `docs/10-requirements/` Y en `orchestration/work-items/`
2. **Documentacion fragmentada:** Epics en docs/, tareas en orchestration/, sin conexion
3. **Actualizaciones inconsistentes:** Cambios en un lugar, no reflejados en el otro
4. **Confusion de propiedad:** ¿docs/ es de producto o de proceso?

### Situacion Actual en Gamilit

```
gamilit/
├── docs/                          # Documentacion de PRODUCTO
│   ├── 00-overview/               # Vision, modulos, metricas
│   ├── 10-requirements/           # EPICs, User Stories
│   │   └── epics/
│   │       └── EPIC-GAM-F{N}-{ID}/
│   │           ├── EPIC.md        # Narrativa del epic
│   │           ├── PLAN.md        # Plan de implementacion
│   │           └── user-stories/
│   │               └── US-{ID}/
│   │                   ├── US-{ID}-{nombre}.md  # Definicion US
│   │                   └── tasks/
│   │                       └── TASK-{ID}-{CODE}.md
│   ├── 20-architecture/           # Arquitectura, stack, modelo datos
│   ├── 30-ux-ui/                  # Wireframes, mockups
│   ├── 40-api/                    # Endpoints, contratos
│   ├── 40-standards/              # Estandares (9 archivos)
│   └── 90-adr/                    # ADRs del proyecto (35+ ADRs)
├── orchestration/                 # Documentacion de PROCESO
│   ├── directivas/                # SIMCO, principios, triggers
│   ├── agents/                    # Perfiles de agente
│   ├── inventarios/               # SSOT de implementacion (DATABASE, BACKEND, FRONTEND)
│   ├── tareas/                    # Tracking de tareas (METADATA.yml)
│   └── work-items/                # Tracking de epics (YAML solo)
└── CLAUDE.md                      # Instrucciones para agentes
```

## Decision

### DEC-SSOT-001: Proyecto es dueno de su documentacion de producto

**Decision:** `docs/` es la UNICA fuente de verdad para documentacion de producto (epics narrativos, user stories detalladas, arquitectura, API, UX).

**Regla:** PROHIBIDO copiar contenido de US, epics, o specs entre `docs/` y `orchestration/`. Solo links.

### DEC-SSOT-002: Epics narrativos en docs/10-requirements/epics/

**Decision:** Cada epic tiene su carpeta en `docs/10-requirements/epics/EPIC-GAM-F{N}-{ID}/` conteniendo:
- `EPIC.md` — Documentacion narrativa detallada (contexto de negocio, objetivos, alcance, DoD)
- `PLAN.md` — Plan de implementacion tecnico
- `user-stories/` — User Stories co-localizadas con su epic (ADR-034)

**Estructura:**
```
docs/10-requirements/epics/
├── _INDEX.md
├── EPIC-GAM-F1-MODULOS-EDUCATIVOS/
│   ├── EPIC.md
│   ├── PLAN.md
│   └── user-stories/
│       ├── _INDEX.md
│       └── US-GAM-F1-001/
│           ├── US-GAM-F1-001-modulo-literal.md
│           └── tasks/
│               └── TASK-{ID}-{CODE}.md
└── EPIC-GAM-F2-GAMIFICACION/
    └── ...
```

### DEC-SSOT-003: orchestration/ es solo tracking YAML

**Decision:** `orchestration/work-items/epics/*.yml` contiene SOLO metadatos operacionales:
- `id`, `status`, `story_points`, `sprint`, `wave`
- `depends_on` (dependencias entre epics)
- `docs_path:` — Link al EPIC.md del proyecto

**PROHIBIDO:** Narrativa, descripciones detalladas, o EPIC.md en orchestration/.

**Ejemplo:**
```yaml
# orchestration/work-items/epics/EPIC-GAM-F1-MODULOS-EDUCATIVOS.yml
id: "EPIC-GAM-F1-MODULOS-EDUCATIVOS"
status: "completed"
story_points: 89
wave: 1
sprint: "Sprint-1"
docs_path: "docs/10-requirements/epics/EPIC-GAM-F1-MODULOS-EDUCATIVOS/EPIC.md"
depends_on: []
```

### DEC-SSOT-004: Inventarios en orchestration/

**Decision:** `orchestration/inventarios/` contiene SSOT de implementacion (no producto):
- `DATABASE_INVENTORY.yml` — Schemas, tablas, views, funciones (169 tablas)
- `BACKEND_INVENTORY.yml` — Modules, entities, controllers, endpoints (152 entities, 899 endpoints)
- `FRONTEND_INVENTORY.yml` — Components, pages, stores (475 componentes, 68 paginas)
- `MASTER_INVENTORY.yml` — Metricas consolidadas

**Separacion clara:**
- `docs/20-architecture/` — Documentacion narrativa de arquitectura
- `orchestration/inventarios/` — Conteos exactos, YAML estructurado

### DEC-SSOT-005: Tareas en orchestration/tareas/

**Decision:** `orchestration/tareas/TASK-{YYYY-MM-DD}-{DESC}/` contiene tracking de tareas:
- `METADATA.yml` — Estado, fases CAPVED, agentes
- `ANALISIS.md`, `PLAN.md`, `EJECUCION.md` — Documentacion de ejecucion
- `archivos/` — Artifacts generados durante tarea

**NO en docs/:** Tareas son proceso, no producto. docs/ no tiene carpeta `tareas/`.

## Consecuencias

### Positivas

- **SSOT verdadero:** Cada artefacto tiene exactamente UNA ubicacion
- **Propiedad clara:** `docs/` = producto, `orchestration/` = proceso
- **Separacion de concerns:** Producto vs Implementacion vs Ejecucion
- **Navegabilidad:** Epic→US→Task navegable dentro de docs/
- **Sin duplicacion:** YAML en orchestration/ solo referencia docs/
- **Coherencia con workspace-arch:** Sigue patron de ADR-0019

### Negativas

- **Estructura anidada profunda:** Hasta 6 niveles en docs/10-requirements/
  - Mitigacion: ADR-034 documenta jerarquia, _INDEX.md en cada nivel
- **Mantenimiento de links:** YAML debe mantener `docs_path:` actualizado
  - Mitigacion: Validacion automatica de links rotos en CI/CD

## Alternativas Consideradas

1. **Todo en orchestration/**
   - Rechazada: Mezcla producto con proceso, viola propiedad del proyecto

2. **Todo en docs/**
   - Rechazada: docs/ se vuelve monolitico, sin separacion tracking vs narrativa

3. **SSOT en proyecto (esta decision)**
   - Aceptada: Separacion clara, navegabilidad, sin duplicacion

## Implementacion en Gamilit

### Archivos Clave

```
gamilit/
  docs/
    10-requirements/
      _INDEX.md                      # Indice de requirements
      epics/
        _INDEX.md                    # Indice de epics
        EPIC-GAM-F{N}-{ID}/
          EPIC.md                    # Narrativa del epic (SSOT)
          PLAN.md                    # Plan de implementacion
          user-stories/
            _INDEX.md                # Indice de US
            US-{ID}/
              US-{ID}-{nombre}.md    # Definicion US (SSOT)
              tasks/
                TASK-{ID}-{CODE}.md  # Definicion Task
  orchestration/
    work-items/
      epics/
        EPIC-GAM-F{N}-{ID}.yml       # YAML tracking (docs_path)
    tareas/
      TASK-{YYYY-MM-DD}-{DESC}/
        METADATA.yml                 # Tracking de tarea
    inventarios/
      MASTER_INVENTORY.yml           # SSOT de implementacion
```

### Reglas de Enlace

| Tipo | Ubicacion SSOT | Tracking |
|------|----------------|----------|
| EPIC narrativo | `docs/10-requirements/epics/EPIC-{ID}/EPIC.md` | `orchestration/work-items/epics/EPIC-{ID}.yml` |
| User Story | `docs/10-requirements/epics/EPIC-{ID}/user-stories/US-{ID}/US-{ID}.md` | `orchestration/work-items/stories/US-{ID}.yml` |
| Task | `docs/10-requirements/epics/EPIC-{ID}/user-stories/US-{ID}/tasks/TASK-{ID}.md` | `orchestration/tareas/TASK-{YYYY-MM-DD}-{DESC}/METADATA.yml` |

## Referencias

- [ADR-0019 (workspace-arch)](C:\Empresas\ISEM\workspace-arch\docs\90-adr\ADR-0019-ssot-documentacion-producto-en-proyecto.md) - ADR original
- [ADR-034](./ADR-034-jerarquia-anidada-profunda.md) - Jerarquia anidada profunda
- [docs/10-requirements/epics/](../../docs/10-requirements/epics/) - Epics narrativos
- [orchestration/inventarios/MASTER_INVENTORY.yml](../../orchestration/inventarios/MASTER_INVENTORY.yml) - SSOT de implementacion

---

**Documentado por:** Arquitecto Gamilit
**Ubicacion:** docs/90-adr/ADR-039-ssot-docs-en-proyecto.md
