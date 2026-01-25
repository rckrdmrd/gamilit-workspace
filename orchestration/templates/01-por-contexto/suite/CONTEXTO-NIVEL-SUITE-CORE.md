# CONTEXTO DE NIVEL: SUITE CORE (2B.1)

**Template para:** Componentes compartidos de una suite multi-vertical
**Nivel:** 2B.1
**Ejemplos:** nexus-erp-suite/core

---

## IDENTIFICACIÓN

```yaml
NIVEL: "2B.1 - SUITE-CORE"
TIPO: "Componentes compartidos de suite"
SUITE_PADRE: "{SUITE}"
RUTA_BASE: "projects/{SUITE}/core/"
ORCHESTRATION_PATH: "projects/{SUITE}/core/orchestration/"
PROPAGATE_TO:
  - "projects/{SUITE}/orchestration/"  # Suite padre (2B)
  - "orchestration/"                   # Workspace root
CONSUMIDORES:
  - "projects/{SUITE}/verticals/*/"    # Todos los verticales
```

---

## ESTRUCTURA REQUERIDA

```
projects/{SUITE}/core/
├── orchestration/
│   ├── 00-guidelines/
│   │   └── CONTEXTO-SUITE-CORE.md    # ESTE archivo (adaptado)
│   ├── inventarios/
│   │   ├── CORE_MASTER_INVENTORY.yml
│   │   ├── CORE_DATABASE_INVENTORY.yml
│   │   ├── CORE_BACKEND_INVENTORY.yml
│   │   └── CORE_FRONTEND_INVENTORY.yml
│   ├── trazas/
│   │   └── TRAZA-CORE.md
│   └── referencias/
│       └── CONSUMIDORES.yml          # Qué verticales usan qué
├── docs/
├── database/
│   └── ddl/
│       └── schemas/
│           ├── auth/
│           ├── shared/
│           └── catalog/
├── backend/
│   └── src/
│       └── modules/
│           ├── auth/
│           ├── shared/
│           └── ...
└── frontend/
    └── src/
        └── shared/
            └── components/
```

---

## VARIABLES DEL SUITE CORE

```yaml
# Completar con valores reales

SUITE_NAME: "{nombre de la suite}"
SUITE_ROOT: "projects/{SUITE}"
CORE_ROOT: "{SUITE_ROOT}/core"
CORE_DESCRIPTION: "Componentes compartidos entre verticales"

# Database Core
CORE_DB_DDL: "{CORE_ROOT}/database/ddl"
CORE_SCHEMAS:
  - auth        # Autenticación y autorización
  - shared      # Tablas compartidas (audit, config, etc.)
  - catalog     # Catálogos maestros

# Backend Core
CORE_BACKEND_ROOT: "{CORE_ROOT}/backend"
CORE_BACKEND_SRC: "{CORE_BACKEND_ROOT}/src"
CORE_MODULES:
  - AuthModule
  - SharedModule
  - CatalogModule

# Frontend Core
CORE_FRONTEND_ROOT: "{CORE_ROOT}/frontend"
CORE_FRONTEND_SRC: "{CORE_FRONTEND_ROOT}/src"
CORE_COMPONENTS:
  - AuthProvider
  - SharedLayout
  - CommonComponents
```

---

## CONSUMIDORES (Qué verticales usan qué)

```yaml
# Archivo: orchestration/referencias/CONSUMIDORES.yml

consumidores:
  database:
    "auth.*":
      usado_por: ["todos"]
      descripcion: "Schemas de autenticación"
    "shared.audit_logs":
      usado_por: ["todos"]
      descripcion: "Logs de auditoría"
    "catalog.*":
      usado_por: ["construccion", "manufactura"]
      descripcion: "Catálogos maestros"

  backend:
    "AuthModule":
      usado_por: ["todos"]
      importar_como: "@suite/core/auth"
    "SharedModule":
      usado_por: ["todos"]
      importar_como: "@suite/core/shared"

  frontend:
    "AuthProvider":
      usado_por: ["todos"]
      importar_desde: "@suite/core/components"
    "SharedLayout":
      usado_por: ["construccion", "manufactura"]
```

---

## ALIASES DEL SUITE CORE

```yaml
# Aliases específicos (agregar en ALIASES.yml global)

@{SUITE}_CORE: "projects/{SUITE}/core/"
@{SUITE}_CORE_ORCH: "projects/{SUITE}/core/orchestration/"
@{SUITE}_CORE_DDL: "projects/{SUITE}/core/database/ddl/"
@{SUITE}_CORE_BE: "projects/{SUITE}/core/backend/src/"
@{SUITE}_CORE_FE: "projects/{SUITE}/core/frontend/src/"
@{SUITE}_CORE_INV: "projects/{SUITE}/core/orchestration/inventarios/"
```

---

## CONTEXTO A CARGAR

```yaml
# Orden de carga para agentes trabajando en suite core

1_CORE_SISTEMA:
  - core/orchestration/directivas/simco/SIMCO-NIVELES.md
  - core/orchestration/directivas/principios/*.md
  - shared/catalog/CATALOG-INDEX.yml

2_SUITE:
  - projects/{SUITE}/orchestration/00-guidelines/CONTEXTO-SUITE.md
  - projects/{SUITE}/orchestration/referencias/VERTICALES-INDEX.yml

3_SUITE_CORE:
  - projects/{SUITE}/core/orchestration/00-guidelines/CONTEXTO-SUITE-CORE.md
  - projects/{SUITE}/core/orchestration/inventarios/CORE_MASTER_INVENTORY.yml
  - projects/{SUITE}/core/orchestration/referencias/CONSUMIDORES.yml

4_INVENTARIOS_CAPA:
  database: "orchestration/inventarios/CORE_DATABASE_INVENTORY.yml"
  backend: "orchestration/inventarios/CORE_BACKEND_INVENTORY.yml"
  frontend: "orchestration/inventarios/CORE_FRONTEND_INVENTORY.yml"
```

---

## PROPAGACIÓN

```yaml
# Al completar tareas en suite core

DOCUMENTAR_LOCAL:
  inventario: "orchestration/inventarios/CORE_{CAPA}_INVENTORY.yml"
  traza: "orchestration/trazas/TRAZA-CORE.md"

PROPAGAR_A_SUITE:
  archivo: "projects/{SUITE}/orchestration/inventarios/SUITE_MASTER_INVENTORY.yml"
  formato: |
    core:
      {capa}:
        ultima_modificacion: "{fecha}"
        cambio: "{descripción breve}"
        artefacto: "{nombre}"

  traza: "projects/{SUITE}/orchestration/trazas/TRAZA-SUITE.md"
  formato_traza: |
    ## [{fecha}] Core Update
    - Capa: {capa}
    - Componente: {nombre}
    - Cambio: {descripción}
    - Impacto: {verticales afectados}

NOTIFICAR_CONSUMIDORES:
  # Si el cambio afecta a verticales existentes
  accion: "Agregar nota en CONSUMIDORES.yml"
  formato: |
    notas_actualizacion:
      - fecha: "{fecha}"
        componente: "{nombre}"
        mensaje: "{descripción del cambio}"
        accion_requerida: "{ninguna|actualizar|revisar}"

PROPAGAR_A_WORKSPACE:
  archivo: "orchestration/WORKSPACE-STATUS.md"
  formato: |
    ## [{fecha}] {SUITE}/core
    - Componente: {nombre}
    - Cambio: {descripción breve}
    - Verticales afectados: {lista}
```

---

## VALIDACIONES ESPECIALES

```yaml
# Por ser componentes compartidos, validaciones adicionales:

ANTES_DE_MODIFICAR:
  - [ ] Identificar verticales consumidores en CONSUMIDORES.yml
  - [ ] Evaluar impacto del cambio en consumidores
  - [ ] Si es breaking change, documentar migración

ANTES_DE_CREAR:
  - [ ] Verificar que no existe en shared/catalog (sistema)
  - [ ] Verificar que no es específico de un vertical
  - [ ] Confirmar que será usado por múltiples verticales

DESPUES_DE_MODIFICAR:
  - [ ] Actualizar CONSUMIDORES.yml con notas
  - [ ] Ejecutar tests de integración
  - [ ] Propagar a suite y workspace
  - [ ] Si breaking change, notificar verticales
```

---

## GESTIÓN DE BREAKING CHANGES

```yaml
# Protocolo para cambios que rompen compatibilidad

IDENTIFICAR:
  - Cambios en interfaces/APIs públicas
  - Cambios en esquemas de base de datos
  - Eliminación de funcionalidades

DOCUMENTAR:
  archivo: "orchestration/BREAKING-CHANGES.md"
  formato: |
    ## [{fecha}] Breaking Change: {componente}

    ### Descripción
    {qué cambió}

    ### Verticales Afectados
    {lista de verticales}

    ### Migración Requerida
    {pasos para actualizar}

    ### Deadline
    {fecha límite para migrar}

NOTIFICAR:
  - Actualizar CONSUMIDORES.yml
  - Agregar entrada en TRAZA-SUITE.md del padre
  - Crear issue/tarea en cada vertical afectado
```

---

## ESTADO DEL SUITE CORE

```yaml
# Actualizar con cada cambio significativo

estado_general: "{ESTABLE|EN_DESARROLLO}"
ultima_actividad: "{YYYY-MM-DD}"

componentes:
  database:
    schemas: "{número}"
    tablas: "{número}"
    estado: "{estado}"
  backend:
    modulos: "{número}"
    estado: "{estado}"
  frontend:
    componentes: "{número}"
    estado: "{estado}"

consumidores_activos: "{número de verticales}"
breaking_changes_pendientes: "{número}"
```

---

**Template:** CONTEXTO-NIVEL-SUITE-CORE.md | **Sistema:** SIMCO Niveles
