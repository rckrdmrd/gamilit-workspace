# CONTEXTO DE NIVEL: PROYECTO STANDALONE (2A)

**Template para:** Proyectos independientes sin subproyectos
**Nivel:** 2A
**Ejemplos:** nexus-sgi, demo-poc, nexus-hr

---

## IDENTIFICACIÓN

```yaml
NIVEL: "2A - STANDALONE"
TIPO: "Proyecto independiente"
RUTA_BASE: "projects/{PROYECTO}/"
ORCHESTRATION_PATH: "projects/{PROYECTO}/orchestration/"
PROPAGATE_TO:
  - "orchestration/"  # Workspace root
```

---

## ESTRUCTURA REQUERIDA

```
projects/{PROYECTO}/
├── orchestration/
│   ├── 00-guidelines/
│   │   └── CONTEXTO-PROYECTO.md      # ESTE archivo (adaptado)
│   ├── PROXIMA-ACCION.md
│   ├── inventarios/
│   │   ├── MASTER_INVENTORY.yml
│   │   ├── DATABASE_INVENTORY.yml
│   │   ├── BACKEND_INVENTORY.yml
│   │   └── FRONTEND_INVENTORY.yml
│   ├── trazas/
│   │   ├── TRAZA-TAREAS-DATABASE.md
│   │   ├── TRAZA-TAREAS-BACKEND.md
│   │   └── TRAZA-TAREAS-FRONTEND.md
│   └── referencias/
│       └── DEPENDENCIAS.yml
├── docs/
├── database/
├── backend/
└── frontend/
```

---

## VARIABLES DEL PROYECTO

```yaml
# Completar con valores reales del proyecto

PROJECT_NAME: "{nombre del proyecto}"
PROJECT_ROOT: "projects/{PROYECTO}"
PROJECT_DESCRIPTION: "{descripción breve}"

# Database
DB_NAME: "{nombre_base_datos}"
DB_DDL_PATH: "{PROJECT_ROOT}/database/ddl"
DB_SCRIPTS_PATH: "{PROJECT_ROOT}/database/scripts"
DB_SEEDS_PATH: "{PROJECT_ROOT}/database/seeds"
RECREATE_CMD: "scripts/recreate-database.sh"

# Backend
BACKEND_ROOT: "{PROJECT_ROOT}/backend"
BACKEND_SRC: "{BACKEND_ROOT}/src"
API_PORT: "{puerto}"
API_PREFIX: "/api/v1"

# Frontend
FRONTEND_ROOT: "{PROJECT_ROOT}/frontend"
FRONTEND_SRC: "{FRONTEND_ROOT}/src"
FRONTEND_PORT: "{puerto}"
```

---

## ALIASES LOCALES

```yaml
# Aliases específicos de este proyecto (agregar en ALIASES.yml global)

@{PROYECTO}_ROOT: "projects/{PROYECTO}/"
@{PROYECTO}_ORCH: "projects/{PROYECTO}/orchestration/"
@{PROYECTO}_DDL: "projects/{PROYECTO}/database/ddl/"
@{PROYECTO}_BE: "projects/{PROYECTO}/backend/src/"
@{PROYECTO}_FE: "projects/{PROYECTO}/frontend/src/"
@{PROYECTO}_DOCS: "projects/{PROYECTO}/docs/"
@{PROYECTO}_INV: "projects/{PROYECTO}/orchestration/inventarios/"
```

---

## CONTEXTO A CARGAR

```yaml
# Orden de carga para agentes trabajando en este proyecto

1_CORE:
  - core/orchestration/directivas/simco/SIMCO-NIVELES.md
  - core/orchestration/directivas/principios/*.md
  - core/orchestration/directivas/simco/_INDEX.md
  - shared/catalog/CATALOG-INDEX.yml

2_PROYECTO:
  - projects/{PROYECTO}/orchestration/00-guidelines/CONTEXTO-PROYECTO.md
  - projects/{PROYECTO}/orchestration/PROXIMA-ACCION.md
  - projects/{PROYECTO}/orchestration/inventarios/MASTER_INVENTORY.yml

3_INVENTARIOS_CAPA:
  database: "orchestration/inventarios/DATABASE_INVENTORY.yml"
  backend: "orchestration/inventarios/BACKEND_INVENTORY.yml"
  frontend: "orchestration/inventarios/FRONTEND_INVENTORY.yml"

4_DOCS:
  - projects/{PROYECTO}/docs/
```

---

## PROPAGACIÓN

```yaml
# Al completar tareas en este nivel

DOCUMENTAR_LOCAL:
  inventario: "orchestration/inventarios/{CAPA}_INVENTORY.yml"
  traza: "orchestration/trazas/TRAZA-TAREAS-{CAPA}.md"

PROPAGAR_A_WORKSPACE:
  archivo: "orchestration/WORKSPACE-STATUS.md"
  formato: |
    ## [{fecha}] {PROYECTO}
    - **Capa:** {DATABASE|BACKEND|FRONTEND}
    - **Acción:** {descripción breve}
    - **Artefactos:** {lista}
```

---

## ESTADO DEL PROYECTO

```yaml
# Actualizar manualmente

estado_general: "{EN_DESARROLLO|ESTABLE|MANTENIMIENTO}"
ultima_actividad: "{YYYY-MM-DD}"
capas_activas:
  database: "{estado}"
  backend: "{estado}"
  frontend: "{estado}"
agentes_asignados: []
```

---

**Template:** CONTEXTO-NIVEL-STANDALONE.md | **Sistema:** SIMCO Niveles
