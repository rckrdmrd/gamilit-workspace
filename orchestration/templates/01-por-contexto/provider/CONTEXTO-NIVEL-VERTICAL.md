# CONTEXTO DE NIVEL: VERTICAL / SUBPROYECTO (2B.2)

**Template para:** Verticales dentro de una suite multi-vertical
**Nivel:** 2B.2
**Ejemplos:** construccion, manufactura, retail (dentro de nexus-erp-suite)

---

## IDENTIFICACIÓN

```yaml
NIVEL: "2B.2 - VERTICAL"
TIPO: "Subproyecto de suite"
SUITE_PADRE: "{SUITE}"
RUTA_BASE: "projects/{SUITE}/verticals/{VERTICAL}/"
ORCHESTRATION_PATH: "projects/{SUITE}/verticals/{VERTICAL}/orchestration/"
PROPAGATE_TO:
  - "projects/{SUITE}/orchestration/"  # Suite padre (2B)
  - "orchestration/"                   # Workspace root
```

---

## ESTRUCTURA REQUERIDA

```
projects/{SUITE}/verticals/{VERTICAL}/
├── orchestration/
│   ├── 00-guidelines/
│   │   └── CONTEXTO-VERTICAL.md      # ESTE archivo (adaptado)
│   ├── PROXIMA-ACCION.md
│   ├── inventarios/
│   │   ├── VERTICAL_INVENTORY.yml    # Master del vertical
│   │   ├── DATABASE_INVENTORY.yml
│   │   ├── BACKEND_INVENTORY.yml
│   │   └── FRONTEND_INVENTORY.yml
│   ├── trazas/
│   │   ├── TRAZA-TAREAS-DATABASE.md
│   │   ├── TRAZA-TAREAS-BACKEND.md
│   │   └── TRAZA-TAREAS-FRONTEND.md
│   └── referencias/
│       ├── DEPENDENCIAS-CORE.yml     # Qué usa del suite/core
│       └── DEPENDENCIAS-EXTERNAS.yml # Qué usa de otros verticales
├── docs/
├── database/
├── backend/
└── frontend/
```

---

## VARIABLES DEL VERTICAL

```yaml
# Completar con valores reales

VERTICAL_NAME: "{nombre del vertical}"
VERTICAL_ROOT: "projects/{SUITE}/verticals/{VERTICAL}"
VERTICAL_DESCRIPTION: "{descripción breve}"
SUITE_NAME: "{suite padre}"
SUITE_ROOT: "projects/{SUITE}"

# Database (puede heredar de core o tener propio)
DB_NAME: "{nombre_base_datos}"
DB_SCHEMA: "{schema_vertical}"  # Ej: construccion, manufactura
DB_DDL_PATH: "{VERTICAL_ROOT}/database/ddl"
DB_INHERITS_FROM: "{SUITE_ROOT}/core/database"  # Si aplica

# Backend
BACKEND_ROOT: "{VERTICAL_ROOT}/backend"
BACKEND_SRC: "{BACKEND_ROOT}/src"
BACKEND_EXTENDS: "{SUITE_ROOT}/core/backend"  # Si extiende core

# Frontend
FRONTEND_ROOT: "{VERTICAL_ROOT}/frontend"
FRONTEND_SRC: "{FRONTEND_ROOT}/src"
FRONTEND_EXTENDS: "{SUITE_ROOT}/core/frontend"  # Si extiende core
```

---

## DEPENDENCIAS DEL CORE

```yaml
# Archivo: orchestration/referencias/DEPENDENCIAS-CORE.yml

herencia_core:
  database:
    schemas_compartidos:
      - "auth"
      - "shared"
      - "catalog"
    tablas_usadas:
      - "auth.users"
      - "auth.roles"
      - "shared.audit_logs"

  backend:
    modulos_importados:
      - nombre: "AuthModule"
        desde: "@suite/core/auth"
      - nombre: "SharedModule"
        desde: "@suite/core/shared"

  frontend:
    componentes_importados:
      - nombre: "AuthProvider"
        desde: "@suite/core/components"
```

---

## DEPENDENCIAS EXTERNAS (Otros Verticales)

```yaml
# Archivo: orchestration/referencias/DEPENDENCIAS-EXTERNAS.yml

dependencias_verticales:
  # Si este vertical depende de otro
  {otro_vertical}:
    tipo: "opcional|requerida"
    componentes:
      - nombre: "{componente}"
        uso: "{para qué se usa}"

  # O indicar que es independiente
  ninguna: true
```

---

## ALIASES DEL VERTICAL

```yaml
# Aliases específicos (agregar en ALIASES.yml global)

@{SUITE}_{VERTICAL}_ROOT: "projects/{SUITE}/verticals/{VERTICAL}/"
@{SUITE}_{VERTICAL}_ORCH: "projects/{SUITE}/verticals/{VERTICAL}/orchestration/"
@{SUITE}_{VERTICAL}_DDL: "projects/{SUITE}/verticals/{VERTICAL}/database/ddl/"
@{SUITE}_{VERTICAL}_BE: "projects/{SUITE}/verticals/{VERTICAL}/backend/src/"
@{SUITE}_{VERTICAL}_FE: "projects/{SUITE}/verticals/{VERTICAL}/frontend/src/"
@{SUITE}_{VERTICAL}_DOCS: "projects/{SUITE}/verticals/{VERTICAL}/docs/"
```

---

## CONTEXTO A CARGAR

```yaml
# Orden de carga para agentes trabajando en este vertical

1_CORE_SISTEMA:
  - core/orchestration/directivas/simco/SIMCO-NIVELES.md
  - core/orchestration/directivas/principios/*.md
  - shared/catalog/CATALOG-INDEX.yml

2_SUITE_PADRE:
  - projects/{SUITE}/orchestration/00-guidelines/CONTEXTO-SUITE.md
  - projects/{SUITE}/orchestration/referencias/VERTICALES-INDEX.yml

3_SUITE_CORE:
  - projects/{SUITE}/core/orchestration/inventarios/*.yml
  # Dependencias específicas del core que usa este vertical

4_VERTICAL:
  - projects/{SUITE}/verticals/{VERTICAL}/orchestration/00-guidelines/CONTEXTO-VERTICAL.md
  - projects/{SUITE}/verticals/{VERTICAL}/orchestration/PROXIMA-ACCION.md
  - projects/{SUITE}/verticals/{VERTICAL}/orchestration/inventarios/VERTICAL_INVENTORY.yml
  - projects/{SUITE}/verticals/{VERTICAL}/orchestration/referencias/DEPENDENCIAS-CORE.yml

5_INVENTARIOS_CAPA:
  database: "orchestration/inventarios/DATABASE_INVENTORY.yml"
  backend: "orchestration/inventarios/BACKEND_INVENTORY.yml"
  frontend: "orchestration/inventarios/FRONTEND_INVENTORY.yml"
```

---

## PROPAGACIÓN

```yaml
# Al completar tareas en este vertical

DOCUMENTAR_LOCAL:
  inventario: "orchestration/inventarios/{CAPA}_INVENTORY.yml"
  traza: "orchestration/trazas/TRAZA-TAREAS-{CAPA}.md"

PROPAGAR_A_SUITE:
  archivo: "projects/{SUITE}/orchestration/inventarios/VERTICALES-STATUS.yml"
  formato: |
    {VERTICAL}:
      ultima_modificacion: "{fecha}"
      capa: "{DATABASE|BACKEND|FRONTEND}"
      cambio: "{descripción breve}"

  traza: "projects/{SUITE}/orchestration/trazas/TRAZA-SUITE.md"
  formato_traza: |
    ## [{fecha}] Vertical: {VERTICAL}
    - Capa: {capa}
    - Acción: {descripción}
    - Artefactos: {lista}

PROPAGAR_A_WORKSPACE:
  archivo: "orchestration/WORKSPACE-STATUS.md"
  formato: |
    ## [{fecha}] {SUITE}/{VERTICAL}
    - Capa: {DATABASE|BACKEND|FRONTEND}
    - Acción: {descripción breve}
```

---

## VALIDACIONES ESPECIALES

```yaml
# Por ser parte de una suite, validar además:

ANTES_DE_CREAR:
  - [ ] Verificar que no existe en suite/core
  - [ ] Verificar que no existe en otro vertical
  - [ ] Si usa componente del core, validar compatibilidad

DESPUES_DE_CREAR:
  - [ ] Documentar dependencias del core usadas
  - [ ] Actualizar DEPENDENCIAS-CORE.yml si es nuevo uso
  - [ ] Propagar a suite y workspace
```

---

## ESTADO DEL VERTICAL

```yaml
# Actualizar con cada cambio significativo

estado_general: "{EN_DESARROLLO|ESTABLE|MANTENIMIENTO}"
ultima_actividad: "{YYYY-MM-DD}"
completitud: "{porcentaje}%"

capas:
  database:
    estado: "{estado}"
    tablas_propias: "{número}"
    tablas_heredadas: "{número}"
  backend:
    estado: "{estado}"
    modulos_propios: "{número}"
    modulos_extendidos: "{número}"
  frontend:
    estado: "{estado}"
    componentes_propios: "{número}"
    componentes_heredados: "{número}"

dependencias_resueltas: "{sí|no}"
tests_pasando: "{sí|no|parcial}"
```

---

**Template:** CONTEXTO-NIVEL-VERTICAL.md | **Sistema:** SIMCO Niveles
