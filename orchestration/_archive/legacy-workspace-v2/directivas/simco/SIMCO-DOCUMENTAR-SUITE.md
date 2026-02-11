# SIMCO-DOCUMENTAR-SUITE.md - Documentacion en Arquitectura Suite/Vertical

**Version:** 1.0.0
**Creado:** 2026-01-16
**Sistema:** SIMCO v3.8+

---

## Proposito

Extension de SIMCO-DOCUMENTAR.md especifica para proyectos con arquitectura de Suite (proyecto madre) y Verticales (proyectos especializados que heredan del core).

Aplica a:
- erp-suite (Suite madre)
- erp-core (Core compartido)
- erp-construccion, erp-clinicas, erp-retail, etc. (Verticales)

---

## Arquitectura de Referencia

```
workspace-v2/
├── projects/
│   ├── erp-suite/              # Suite madre (contenedor)
│   │   └── orchestration/
│   │       └── inventarios/    # Inventarios consolidados de suite
│   │
│   ├── erp-core/               # Core compartido
│   │   └── orchestration/
│   │       └── inventarios/    # Inventarios del core
│   │
│   └── erp-{vertical}/         # Verticales
│       └── orchestration/
│           └── inventarios/    # Inventarios especificos
│
└── orchestration/              # Orchestration del workspace
    └── inventarios/            # Inventarios globales (GAMILIT, etc.)
```

---

## Matriz de Decision: Donde Documentar

### Cuando trabajas en una VERTICAL (ej: erp-construccion)

| Tipo de Cambio | Documentar en Vertical | Documentar en Core | Documentar en Suite |
|----------------|------------------------|--------------------|--------------------|
| Tabla especifica del dominio | SI | NO | NO |
| Tabla reutilizable | SI | EVALUAR propagacion | NO |
| Entity especifica | SI | NO | NO |
| Entity que extiende core | SI | ACTUALIZAR referencia | NO |
| Endpoint especifico | SI | NO | NO |
| Componente especifico | SI | NO | NO |
| Fix a funcionalidad core | SI (temporal) | SI (propagacion) | NO |

### Cuando trabajas en CORE (erp-core)

| Tipo de Cambio | Documentar en Core | Propagar a Verticales | Documentar en Suite |
|----------------|--------------------|-----------------------|--------------------|
| Nueva tabla core | SI | NOTIFICAR | NO |
| Nueva entity core | SI | NOTIFICAR | NO |
| Modificacion de tabla core | SI | PROPAGAR INMEDIATO | NO |
| Nuevo modulo compartido | SI | PROPAGAR | NO |
| Security fix | SI | PROPAGAR FORZADO | NO |

### Cuando trabajas en SUITE (erp-suite)

| Tipo de Cambio | Documentar en Suite | Propagar a Core | Propagar a Verticales |
|----------------|---------------------|-----------------|----------------------|
| Configuracion global | SI | NO | SI |
| Orquestracion | SI | NO | NOTIFICAR |
| Documentacion global | SI | REFERENCIAR | REFERENCIAR |

---

## Niveles de Inventarios

### Nivel 1: Inventario de Vertical
```yaml
# erp-construccion/orchestration/inventarios/DATABASE_INVENTORY.yml
proyecto: erp-construccion
tipo: vertical
hereda_de: erp-core

tablas_propias:
  - nombre: construction_projects
    schema: construction
    tipo: ESPECIFICA  # Solo existe en esta vertical

tablas_heredadas:
  - nombre: users
    schema: core
    origen: erp-core
    version_sync: 1.2.0  # Version del core con la que sincroniza

tablas_extendidas:
  - nombre: project_items
    schema: construction
    extiende: core.items
    campos_adicionales:
      - construction_phase
      - material_type
```

### Nivel 2: Inventario de Core
```yaml
# erp-core/orchestration/inventarios/DATABASE_INVENTORY.yml
proyecto: erp-core
tipo: core
consumidores:
  - erp-construccion
  - erp-clinicas
  - erp-retail

tablas_core:
  - nombre: users
    schema: core
    tipo: CORE
    usado_por:
      - erp-construccion
      - erp-clinicas
      - erp-retail
    version: 1.2.0

tablas_extensibles:
  - nombre: items
    schema: core
    tipo: EXTENSIBLE
    extendido_por:
      - vertical: erp-construccion
        como: project_items
      - vertical: erp-clinicas
        como: medical_supplies
```

### Nivel 3: Inventario de Suite
```yaml
# erp-suite/orchestration/inventarios/SUITE_INVENTORY.yml
proyecto: erp-suite
tipo: suite
version: 2.0.0

componentes:
  core: erp-core
  verticales:
    - erp-construccion
    - erp-clinicas
    - erp-retail

estado_sincronizacion:
  erp-core: 1.2.0
  erp-construccion: 1.1.0
  erp-clinicas: 1.0.5
  erp-retail: 1.0.3
```

---

## Procedimiento de Documentacion por Escenario

### Escenario 1: Crear tabla especifica en vertical

```yaml
# 1. Crear tabla en vertical
ubicacion: erp-construccion/apps/backend/...

# 2. Documentar en inventario de vertical
archivo: erp-construccion/orchestration/inventarios/DATABASE_INVENTORY.yml
accion: Agregar en seccion "tablas_propias"

# 3. NO propagar (es especifica)
propagacion: NO

# 4. Actualizar traza local
archivo: erp-construccion/orchestration/trazas/TRAZA-TAREAS-DDL.md
```

### Escenario 2: Modificar tabla core desde vertical

```yaml
# 1. DETENER - No modificar core desde vertical

# 2. Crear issue/tarea para erp-core
accion: Solicitar cambio via JIRA/GitHub issue

# 3. Si es urgente (security fix):
   a. Aplicar fix temporal en vertical
   b. Documentar como "pendiente_sync_core: true"
   c. Crear PR para erp-core
   d. Una vez mergeado en core, actualizar vertical

# 4. Documentar en ambos lugares
   - Vertical: "fix temporal, pendiente sync"
   - Core: "fix aplicado, propagar a verticales"
```

### Escenario 3: Crear funcionalidad reutilizable en vertical

```yaml
# 1. Implementar en vertical primero
ubicacion: erp-construccion/...

# 2. Documentar en vertical
archivo: erp-construccion/orchestration/inventarios/...
nota: "Candidata para promocion a core"

# 3. Evaluar promocion a core
criterios:
  - Usable por 2+ verticales? SI → Promover
  - Es generica? SI → Promover
  - Requiere customizacion por vertical? SI → Mantener en vertical

# 4. Si se promueve:
   a. Crear en erp-core
   b. Documentar en erp-core/orchestration/inventarios/
   c. Actualizar vertical para usar version de core
   d. Actualizar referencia: "promovido_a_core: true"
```

### Escenario 4: Propagar cambio de core a verticales

```yaml
# 1. Cambio realizado en erp-core
# Documentado en: erp-core/orchestration/inventarios/

# 2. Activar propagacion
directiva: TRIGGER-PROPAGACION-AUTOMATICA.md

# 3. Para cada vertical:
   a. Verificar compatibilidad
   b. Aplicar cambio (o merge si hay extension)
   c. Actualizar inventario de vertical
   d. Actualizar "version_sync" con version de core

# 4. Actualizar estado en suite
archivo: erp-suite/orchestration/inventarios/SUITE_INVENTORY.yml
seccion: estado_sincronizacion
```

---

## Campos Especiales para Suite/Vertical

### En inventarios de Vertical
```yaml
# Campos adicionales requeridos
hereda_de: "{proyecto-core}"
version_sync_core: "{version}"
tablas_propias: []
tablas_heredadas: []
tablas_extendidas: []
pendiente_sync_core: false
```

### En inventarios de Core
```yaml
# Campos adicionales requeridos
consumidores: []
tablas_core: []
tablas_extensibles: []
ultima_propagacion: "{fecha}"
```

### En inventarios de Suite
```yaml
# Campos adicionales requeridos
componentes:
  core: "{proyecto}"
  verticales: []
estado_sincronizacion: {}
matriz_compatibilidad: {}
```

---

## Flujo de Propagacion de Documentacion

```
┌─────────────────┐
│   CAMBIO EN     │
│   VERTICAL      │
└────────┬────────┘
         │
         ▼
    ┌────────────┐
    │ Es especifico │──SI──▶ Documentar solo en vertical
    │ de vertical?  │
    └────────┬──────┘
             │NO
             ▼
    ┌────────────────┐
    │ Afecta core?   │──SI──▶ Solicitar cambio en core
    └────────┬───────┘        ▶ Documentar temporal en vertical
             │NO
             ▼
    ┌────────────────┐
    │ Reutilizable?  │──SI──▶ Evaluar promocion a core
    └────────┬───────┘
             │NO
             ▼
    Documentar en vertical
    con nota de contexto
```

```
┌─────────────────┐
│   CAMBIO EN     │
│   CORE          │
└────────┬────────┘
         │
         ▼
┌───────────────────────┐
│ Tipo de cambio?       │
└───────────┬───────────┘
            │
    ┌───────┴───────┐
    ▼               ▼
BREAKING        NO-BREAKING
    │               │
    ▼               ▼
Propagar       Notificar
FORZADO        a verticales
    │               │
    ▼               ▼
Actualizar     Verticales
TODOS los      actualizan
inventarios    cuando puedan
```

---

## Checklist: Documentacion en Suite/Vertical

### Al trabajar en Vertical
```
[ ] Identificar tipo de cambio (especifico/heredado/extendido)
[ ] Documentar en inventario de vertical
[ ] Verificar si afecta core
[ ] Evaluar si es candidato para promocion
[ ] Actualizar version_sync si usa elemento de core
[ ] Marcar pendiente_sync_core si hay fix temporal
```

### Al trabajar en Core
```
[ ] Documentar en inventario de core
[ ] Identificar verticales afectadas
[ ] Determinar tipo de propagacion (forzada/opcional)
[ ] Actualizar lista de consumidores si hay nuevo
[ ] Registrar ultima_propagacion
[ ] Notificar/propagar a verticales
```

### Al sincronizar Suite
```
[ ] Verificar estado_sincronizacion de cada vertical
[ ] Identificar verticales desactualizadas
[ ] Planificar actualizaciones pendientes
[ ] Actualizar matriz_compatibilidad
```

---

## Integracion con Mirrors

Para propagacion automatica de documentacion:

```yaml
# shared/mirrors/ contiene copias de:
# - Definiciones de core para verticales
# - Estado de sincronizacion

shared/mirrors/
├── erp-core/
│   ├── PROPAGATION-STATUS.yml
│   └── definitions/
│       └── core-schemas.yml
└── MIRRORS-INDEX.yml
```

Ver: `TRIGGER-PROPAGACION-AUTOMATICA.md` para detalles.

---

## Referencias

| Documento | Uso |
|-----------|-----|
| SIMCO-DOCUMENTAR.md | Directiva base de documentacion |
| SIMCO-PROPAGACION.md | Propagacion de cambios |
| TRIGGER-PROPAGACION-AUTOMATICA.md | Automatizacion |
| CHECKLIST-FASE-D.md | Checklist post-ejecucion |

---

**Sistema:** SIMCO v3.8+ con SAAD
**Ultima actualizacion:** 2026-01-16
