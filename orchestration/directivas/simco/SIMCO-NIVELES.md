# SIMCO: NIVELES JERÁRQUICOS DEL WORKSPACE

**Versión:** 1.0.0
**Fecha:** 2025-12-08
**Aplica a:** Todos los agentes
**Prioridad:** OBLIGATORIA - Identificar nivel ANTES de cualquier acción

---

## RESUMEN EJECUTIVO

> **Todo agente DEBE identificar en qué nivel del workspace está trabajando.**
> El nivel determina: dónde crear documentación, qué contexto cargar, y qué actualizar al completar.
> Documentación en nivel incorrecto = caos organizacional.

---

## JERARQUÍA DE NIVELES

```
NIVEL 0: WORKSPACE ROOT (/home/isem/workspace/)
│
├── NIVEL 1: CORE (core/)
│   ├── orchestration/     → Directivas globales, SIMCO, perfiles
│   ├── catalog/           → Funcionalidades reutilizables
│   └── modules/           → Módulos compartidos (futuro)
│
├── NIVEL 2A: PROYECTOS STANDALONE (projects/{proyecto}/)
│   └── Proyectos independientes sin subproyectos
│       Ejemplos: nexus-sgi, demo-poc, nexus-hr
│
├── NIVEL 2B: PROYECTOS MULTI-VERTICAL (projects/{suite}/)
│   │   Ejemplos: nexus-erp-suite
│   │
│   ├── NIVEL 2B.1: SUITE CORE ({suite}/core/)
│   │   └── Componentes compartidos de la suite
│   │
│   └── NIVEL 2B.2: VERTICALES ({suite}/verticals/{vertical}/)
│       └── Subproyectos especializados
│           Ejemplos: construccion, manufactura, retail
│
└── NIVEL 3: CATÁLOGO (shared/catalog/functionalities/)
    └── Funcionalidades genéricas reutilizables
        Ejemplos: auth, session, notifications
```

---

## IDENTIFICACIÓN DE NIVEL

### Matriz de Identificación

| Ruta del Archivo | Nivel | Tipo |
|------------------|-------|------|
| `core/orchestration/**` | 1 | CORE |
| `shared/catalog/**` | 3 | CATÁLOGO |
| `shared/modules/**` | 1 | CORE |
| `projects/{p}/` (sin verticals/) | 2A | STANDALONE |
| `projects/{p}/verticals/` existe | 2B | MULTI-VERTICAL |
| `projects/{p}/core/` | 2B.1 | SUITE-CORE |
| `projects/{p}/verticals/{v}/` | 2B.2 | VERTICAL |

### Protocolo de Identificación

```yaml
# EJECUTAR al inicio de cualquier tarea

PASO_1_EXTRAER_RUTA:
  working_directory: "{extraer del prompt o contexto}"

PASO_2_CLASIFICAR:
  si_contiene: "core/orchestration" → NIVEL_1_CORE
  si_contiene: "shared/catalog" → NIVEL_3_CATALOGO
  si_contiene: "verticals/" → NIVEL_2B2_VERTICAL
  si_contiene: "/core/" AND proyecto_tiene_verticals → NIVEL_2B1_SUITE_CORE
  si_es: "projects/{p}/" AND tiene_verticals/ → NIVEL_2B_MULTI_VERTICAL
  si_es: "projects/{p}/" AND no_tiene_verticals → NIVEL_2A_STANDALONE
  default: NIVEL_0_WORKSPACE

PASO_3_REGISTRAR:
  nivel_actual: "{nivel identificado}"
  ruta_orchestration: "{calcular según nivel}"
  niveles_superiores: "{lista de niveles a propagar}"
```

---

## ESTRUCTURA ORCHESTRATION POR NIVEL

### NIVEL 0: Workspace Root

```
/home/isem/workspace/
└── orchestration/                    # Mínimo, solo referencias globales
    ├── WORKSPACE-INDEX.md            # Índice de todos los proyectos
    ├── WORKSPACE-STATUS.md           # Estado general del workspace
    └── referencias/
        └── PROYECTOS-ACTIVOS.yml     # Lista de proyectos y su estado
```

### NIVEL 1: Core

```
core/orchestration/
├── 00-guidelines/
├── directivas/
│   ├── principios/
│   └── simco/
├── agents/
│   └── perfiles/
├── referencias/
├── templates/
└── inventarios/
    └── CORE_INVENTORY.yml
```

### NIVEL 2A: Proyecto Standalone

```
projects/{proyecto}/orchestration/
├── 00-guidelines/
│   └── PROJECT-CONTEXT.md
├── PROXIMA-ACCION.md
├── inventarios/
│   ├── MASTER_INVENTORY.yml
│   ├── DATABASE_INVENTORY.yml
│   ├── BACKEND_INVENTORY.yml
│   └── FRONTEND_INVENTORY.yml
├── trazas/
│   ├── TRAZA-TAREAS-DATABASE.md
│   ├── TRAZA-TAREAS-BACKEND.md
│   └── TRAZA-TAREAS-FRONTEND.md
└── referencias/
    └── DEPENDENCIAS.yml
```

### NIVEL 2B: Proyecto Multi-Vertical (Suite)

```
projects/{suite}/orchestration/
├── 00-guidelines/
│   └── CONTEXTO-SUITE.md
├── PROXIMA-ACCION.md
├── inventarios/
│   ├── SUITE_MASTER_INVENTORY.yml    # Agregado de todos los verticales
│   └── VERTICALES-STATUS.yml         # Estado de cada vertical
├── trazas/
│   └── TRAZA-SUITE.md                # Cambios a nivel suite
└── referencias/
    ├── VERTICALES-INDEX.yml          # Lista de verticales
    └── DEPENDENCIAS-CRUZADAS.yml     # Dependencias entre verticales
```

### NIVEL 2B.1: Suite Core

```
projects/{suite}/core/orchestration/
├── 00-guidelines/
│   └── CONTEXTO-SUITE-CORE.md
├── inventarios/
│   ├── CORE_DATABASE_INVENTORY.yml
│   ├── CORE_BACKEND_INVENTORY.yml
│   └── CORE_FRONTEND_INVENTORY.yml
├── trazas/
│   └── TRAZA-CORE.md
└── referencias/
    └── CONSUMIDORES.yml              # Qué verticales usan qué del core
```

### NIVEL 2B.2: Vertical

```
projects/{suite}/verticals/{vertical}/orchestration/
├── 00-guidelines/
│   └── CONTEXTO-VERTICAL.md
├── PROXIMA-ACCION.md
├── inventarios/
│   ├── VERTICAL_INVENTORY.yml
│   ├── DATABASE_INVENTORY.yml
│   ├── BACKEND_INVENTORY.yml
│   └── FRONTEND_INVENTORY.yml
├── trazas/
│   ├── TRAZA-TAREAS-DATABASE.md
│   ├── TRAZA-TAREAS-BACKEND.md
│   └── TRAZA-TAREAS-FRONTEND.md
└── referencias/
    ├── DEPENDENCIAS-CORE.yml         # Qué usa del suite/core
    └── DEPENDENCIAS-EXTERNAS.yml     # Qué usa de otros verticales
```

### NIVEL 3: Catálogo

```
shared/catalog/
├── CATALOG-INDEX.yml
├── functionalities/
│   └── {funcionalidad}/
│       ├── README.md
│       ├── orchestration/
│       │   ├── CONTEXTO-FUNCIONALIDAD.md
│       │   └── CONSUMIDORES.yml      # Proyectos que lo usan
│       └── implementation/
└── templates/
```

---

## REGLAS DE DOCUMENTACIÓN POR NIVEL

### Principio Fundamental

```
╔══════════════════════════════════════════════════════════════════════╗
║  TODA documentación se genera en el nivel donde se trabaja.          ║
║  TODA documentación se propaga hacia niveles superiores.             ║
║  NUNCA se documenta en nivel inferior al de trabajo.                 ║
╚══════════════════════════════════════════════════════════════════════╝
```

### Matriz de Documentación

| Trabajo en | Documenta en | Propaga a |
|------------|--------------|-----------|
| NIVEL 2B.2 (Vertical) | vertical/orchestration/ | Suite → Workspace |
| NIVEL 2B.1 (Suite Core) | suite/core/orchestration/ | Suite → Workspace |
| NIVEL 2A (Standalone) | proyecto/orchestration/ | Workspace |
| NIVEL 1 (Core) | core/orchestration/ | Workspace |
| NIVEL 3 (Catálogo) | catalog/functionalities/{f}/orchestration/ | Core → Workspace |

### Qué Documentar en Cada Nivel

```yaml
NIVEL_TRABAJO:
  inventario: "Artefactos creados/modificados"
  traza: "Registro de tarea completada"
  proxima_accion: "Si aplica, siguiente paso"

NIVELES_SUPERIORES:
  inventario: "Referencia al artefacto (no duplicar)"
  status: "Actualizar estado del componente"
  referencias: "Actualizar índices si es nuevo artefacto"
```

---

## VARIABLES POR NIVEL

### Resolución de Variables

```yaml
# Variables que cambian según el nivel

NIVEL_2B2_VERTICAL:
  PROJECT_ROOT: "projects/{suite}/verticals/{vertical}"
  ORCHESTRATION_PATH: "{PROJECT_ROOT}/orchestration"
  PARENT_LEVEL: "NIVEL_2B"
  PARENT_PATH: "projects/{suite}"
  PROPAGATE_TO:
    - "projects/{suite}/orchestration"
    - "orchestration"  # workspace root

NIVEL_2B1_SUITE_CORE:
  PROJECT_ROOT: "projects/{suite}/core"
  ORCHESTRATION_PATH: "{PROJECT_ROOT}/orchestration"
  PARENT_LEVEL: "NIVEL_2B"
  PARENT_PATH: "projects/{suite}"
  PROPAGATE_TO:
    - "projects/{suite}/orchestration"
    - "orchestration"

NIVEL_2A_STANDALONE:
  PROJECT_ROOT: "projects/{proyecto}"
  ORCHESTRATION_PATH: "{PROJECT_ROOT}/orchestration"
  PARENT_LEVEL: "NIVEL_0"
  PARENT_PATH: ""
  PROPAGATE_TO:
    - "orchestration"

NIVEL_1_CORE:
  PROJECT_ROOT: "core"
  ORCHESTRATION_PATH: "core/orchestration"
  PARENT_LEVEL: "NIVEL_0"
  PARENT_PATH: ""
  PROPAGATE_TO:
    - "orchestration"

NIVEL_3_CATALOGO:
  PROJECT_ROOT: "shared/catalog/functionalities/{funcionalidad}"
  ORCHESTRATION_PATH: "{PROJECT_ROOT}/orchestration"
  PARENT_LEVEL: "NIVEL_1"
  PARENT_PATH: "core"
  PROPAGATE_TO:
    - "core/orchestration"
    - "orchestration"
```

---

## PROTOCOLO DE INICIO POR NIVEL

### Template de Identificación

```markdown
## IDENTIFICACIÓN DE NIVEL

### Análisis de Ruta
- **Working Directory:** {ruta}
- **Contiene verticals/:** {sí|no}
- **Está en core/:** {sí|no}
- **Está en catalog/:** {sí|no}

### Nivel Identificado
- **Nivel:** {NIVEL_X}
- **Tipo:** {CORE|STANDALONE|MULTI-VERTICAL|SUITE-CORE|VERTICAL|CATALOGO}
- **Orchestration Path:** {ruta calculada}

### Propagación Requerida
1. {nivel superior 1} → {ruta}
2. {nivel superior 2} → {ruta}
...
```

---

## VALIDACIÓN DE NIVEL

### Checklist Pre-Ejecución

```markdown
- [ ] Nivel identificado correctamente
- [ ] Ruta de orchestration existe
- [ ] Inventarios del nivel accesibles
- [ ] Rutas de propagación identificadas
- [ ] Variables del nivel resueltas
```

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| Documentación en nivel incorrecto | No identificó nivel | Ejecutar protocolo de identificación |
| Propagación incompleta | Olvidó niveles superiores | Verificar PROPAGATE_TO |
| Inventario no encontrado | Ruta mal calculada | Validar ORCHESTRATION_PATH |
| Referencias rotas | No actualizó índices | Ejecutar propagación completa |

---

## INTEGRACIÓN CON CCA

### Extensión del Protocolo CCA

```yaml
# Agregar como PASO_0 en CCA

PASO_0_IDENTIFICAR_NIVEL:
  accion: "Identificar nivel jerárquico"
  ejecutar: "Protocolo de SIMCO-NIVELES.md"
  resultado:
    nivel: "{NIVEL_X}"
    orchestration_path: "{ruta}"
    propagate_to: ["{rutas}"]

  siguiente: "PASO_1_IDENTIFICAR (CCA estándar)"
```

---

## REFERENCIAS

- **Propagación:** `SIMCO-PROPAGACION.md` (actualización en cascada)
- **CCA:** `SIMCO-INICIALIZACION.md` (carga de contexto)
- **Delegación:** `SIMCO-DELEGACION.md` (heredar nivel a subagentes)
- **Templates:** `templates/CONTEXTO-NIVEL-*.md`

---

**Versión:** 1.0.0 | **Sistema:** SIMCO | **Tipo:** Directiva de Niveles
