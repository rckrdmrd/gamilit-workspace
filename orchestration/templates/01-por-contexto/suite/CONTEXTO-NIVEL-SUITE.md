# CONTEXTO DE NIVEL: PROYECTO MULTI-VERTICAL / SUITE (2B)

**Template para:** Proyectos con múltiples verticales/subproyectos
**Nivel:** 2B
**Ejemplos:** nexus-erp-suite

---

## IDENTIFICACIÓN

```yaml
NIVEL: "2B - MULTI-VERTICAL"
TIPO: "Suite con verticales"
RUTA_BASE: "projects/{SUITE}/"
ORCHESTRATION_PATH: "projects/{SUITE}/orchestration/"
PROPAGATE_TO:
  - "orchestration/"  # Workspace root
RECIBE_PROPAGACION_DE:
  - "projects/{SUITE}/core/"        # Suite Core (2B.1)
  - "projects/{SUITE}/verticals/*/" # Verticales (2B.2)
```

---

## ESTRUCTURA REQUERIDA

```
projects/{SUITE}/
├── orchestration/
│   ├── 00-guidelines/
│   │   └── CONTEXTO-SUITE.md         # ESTE archivo (adaptado)
│   ├── PROXIMA-ACCION.md
│   ├── inventarios/
│   │   ├── SUITE_MASTER_INVENTORY.yml  # Agregado de todo
│   │   └── VERTICALES-STATUS.yml       # Estado de cada vertical
│   ├── trazas/
│   │   └── TRAZA-SUITE.md              # Cambios a nivel suite
│   └── referencias/
│       ├── VERTICALES-INDEX.yml        # Lista de verticales
│       └── DEPENDENCIAS-CRUZADAS.yml   # Entre verticales
├── core/                               # Componentes compartidos
│   └── orchestration/                  # Nivel 2B.1
├── verticals/
│   ├── {vertical_1}/
│   │   └── orchestration/              # Nivel 2B.2
│   ├── {vertical_2}/
│   └── ...
└── docs/
```

---

## VARIABLES DE LA SUITE

```yaml
# Completar con valores reales

SUITE_NAME: "{nombre de la suite}"
SUITE_ROOT: "projects/{SUITE}"
SUITE_DESCRIPTION: "{descripción breve}"

# Core compartido
SUITE_CORE_ROOT: "{SUITE_ROOT}/core"
SUITE_CORE_DATABASE: "{SUITE_CORE_ROOT}/database"
SUITE_CORE_BACKEND: "{SUITE_CORE_ROOT}/backend"
SUITE_CORE_FRONTEND: "{SUITE_CORE_ROOT}/frontend"

# Verticales
VERTICALS_ROOT: "{SUITE_ROOT}/verticals"
VERTICALES_ACTIVOS:
  - nombre: "{vertical_1}"
    estado: "{EN_DESARROLLO|ESTABLE}"
  - nombre: "{vertical_2}"
    estado: "{EN_DESARROLLO|ESTABLE}"
```

---

## VERTICALES INDEX

```yaml
# Archivo: orchestration/referencias/VERTICALES-INDEX.yml

verticales:
  {vertical_1}:
    nombre: "{Nombre Completo}"
    descripcion: "{qué hace este vertical}"
    estado: "{EN_DESARROLLO|ESTABLE|DEPRECADO}"
    ruta: "verticals/{vertical_1}/"
    dependencias_core:
      - "{componente_core_1}"
      - "{componente_core_2}"
    dependencias_otros_verticales: []

  {vertical_2}:
    nombre: "{Nombre Completo}"
    descripcion: "{qué hace}"
    estado: "{estado}"
    ruta: "verticals/{vertical_2}/"
    dependencias_core: []
    dependencias_otros_verticales:
      - "{vertical_1}.{modulo}"
```

---

## ALIASES DE LA SUITE

```yaml
# Aliases específicos (agregar en ALIASES.yml global)

@{SUITE}_ROOT: "projects/{SUITE}/"
@{SUITE}_ORCH: "projects/{SUITE}/orchestration/"
@{SUITE}_CORE: "projects/{SUITE}/core/"
@{SUITE}_VERTICALS: "projects/{SUITE}/verticals/"
@{SUITE}_DOCS: "projects/{SUITE}/docs/"

# Aliases por vertical
@{SUITE}_{VERTICAL}: "projects/{SUITE}/verticals/{VERTICAL}/"
```

---

## CONTEXTO A CARGAR (NIVEL SUITE)

```yaml
# Para agentes que trabajan a nivel de suite (coordinación)

1_CORE:
  - core/orchestration/directivas/simco/SIMCO-NIVELES.md
  - core/orchestration/directivas/principios/*.md
  - shared/catalog/CATALOG-INDEX.yml

2_SUITE:
  - projects/{SUITE}/orchestration/00-guidelines/CONTEXTO-SUITE.md
  - projects/{SUITE}/orchestration/PROXIMA-ACCION.md
  - projects/{SUITE}/orchestration/inventarios/SUITE_MASTER_INVENTORY.yml
  - projects/{SUITE}/orchestration/referencias/VERTICALES-INDEX.yml

3_CORE_COMPONENTES:
  - projects/{SUITE}/core/orchestration/inventarios/*.yml

4_VERTICALES_STATUS:
  - projects/{SUITE}/orchestration/inventarios/VERTICALES-STATUS.yml
```

---

## PROPAGACIÓN A ESTE NIVEL

```yaml
# Qué recibe este nivel de sus hijos

DESDE_SUITE_CORE:
  formato: |
    ## Core Update [{fecha}]
    - Componente: {nombre}
    - Cambio: {descripción}
    - Impacto: {verticales afectados}

DESDE_VERTICALES:
  formato: |
    ## Vertical Update [{fecha}] - {vertical}
    - Capa: {DATABASE|BACKEND|FRONTEND}
    - Cambio: {descripción}
    - Dependencias actualizadas: {sí/no}

PROPAGAR_A_WORKSPACE:
  archivo: "orchestration/WORKSPACE-STATUS.md"
  formato: |
    ## [{fecha}] {SUITE}
    - Origen: {CORE|VERTICAL:{nombre}}
    - Resumen: {descripción breve}
```

---

## DEPENDENCIAS CRUZADAS

```yaml
# Archivo: orchestration/referencias/DEPENDENCIAS-CRUZADAS.yml

dependencias:
  # Qué verticales dependen de qué
  {vertical_2}:
    depende_de:
      - tipo: "core"
        componente: "auth-module"
        version: ">=1.0.0"
      - tipo: "vertical"
        vertical: "{vertical_1}"
        modulo: "catalogs"

  # Si se modifica un componente, qué afecta
  impacto_cambios:
    "core/auth-module":
      afecta:
        - "todos los verticales"
      accion: "Notificar y validar compatibilidad"
```

---

## ESTADO DE LA SUITE

```yaml
# Actualizar con cada cambio significativo

estado_general: "{EN_DESARROLLO|ESTABLE|MANTENIMIENTO}"
ultima_actividad: "{YYYY-MM-DD}"

core:
  estado: "{estado}"
  ultima_modificacion: "{fecha}"

verticales:
  {vertical_1}:
    estado: "{estado}"
    completitud: "{porcentaje}%"
    ultima_modificacion: "{fecha}"
  {vertical_2}:
    estado: "{estado}"
    completitud: "{porcentaje}%"
    ultima_modificacion: "{fecha}"
```

---

**Template:** CONTEXTO-NIVEL-SUITE.md | **Sistema:** SIMCO Niveles
