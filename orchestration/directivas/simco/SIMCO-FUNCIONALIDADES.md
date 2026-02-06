# SIMCO-FUNCIONALIDADES.md
# Gestión de Funcionalidades y Relaciones Entre Capas

**Versión:** 1.0.0
**Fecha:** 2026-01-16
**Tipo:** Directiva Operativa
**Mantenido por:** @WS_ORCHESTRATOR

---

## PROPÓSITO

Esta directiva define los estándares y procedimientos para:
1. Inventariar funcionalidades del workspace
2. Gestionar relaciones entre capas (DDL, Backend, Frontend)
3. Identificar candidatos para consolidación en `shared/`
4. Detectar y resolver duplicados entre proyectos
5. Mantener coherencia entre la base de conocimiento y las implementaciones

---

## ALCANCE

```
APLICA A:
├── Todas las funcionalidades implementadas en proyectos
├── Módulos del catálogo shared/catalog/
├── Relaciones DDL ↔ Backend ↔ Frontend
├── Inventarios de proyectos
└── Decisiones de reestructuración

RESPONSABLES:
├── @WS_ORCHESTRATOR - Mantenimiento del inventario global
├── @ARCHITECTURE-ANALYST - Decisiones de reestructuración
├── @DDL-SPECIALIST - Capa de base de datos
├── @BACKEND-DEVELOPER - Capa de backend
└── @FRONTEND-DEVELOPER - Capa de frontend
```

---

## MODELO DE FUNCIONALIDAD

### Estructura de una Funcionalidad

```yaml
functionality:
  id: "auth-jwt"                    # Identificador único
  name: "Autenticación JWT"         # Nombre descriptivo
  type: "SHARED|CORE|PROJECT-SPECIFIC"
  status: "production|development|planned|deprecated"

  # Referencia al catálogo (si aplica)
  catalog_ref: "shared/catalog/auth"

  # Implementaciones por proyecto
  implementations:
    template-saas:
      version: "1.0.0"
      status: "production"
      layers:
        ddl:
          schemas: ["auth"]
          tables: ["users", "sessions"]
          functions: ["check_password"]
        backend:
          modules: ["AuthModule"]
          services: ["AuthService", "JwtService"]
          guards: ["JwtAuthGuard"]
        frontend:
          hooks: ["useAuth"]
          components: ["LoginForm"]

    erp-core:
      inherited_from: "template-saas"
      version: "1.0.0"
      status: "development"
      customizations:
        - "TenantGuard adicional"

  # Reglas de propagación
  propagation:
    direction: "template-saas -> erp-core -> verticales"
    auto_propagate: true
    sla_security: "24h"
    sla_bug: "72h"

  # Estado de consolidación
  consolidation:
    candidate_for_shared: false
    duplicates_detected: []
    recommendation: null
```

---

## TIPOS DE FUNCIONALIDAD

### 1. SHARED (Compartida)

```
CARACTERÍSTICAS:
├── Implementación canónica en shared/catalog/
├── Proyectos consumen vía referencia
├── Propagación automática de cambios
└── Versionado centralizado

EJEMPLOS:
├── auth-jwt (Autenticación)
├── multi-tenancy (RLS)
├── notifications (Sistema de notificaciones)
└── audit-logs (Auditoría)

GESTIÓN:
├── Cambios en shared/catalog/ se propagan automáticamente
├── Proyectos NO deben duplicar, solo extender
└── Security fixes tienen SLA de 24h
```

### 2. CORE (Núcleo de Vertical)

```
CARACTERÍSTICAS:
├── Implementación base en proyecto padre (ej: erp-core)
├── Verticales heredan y extienden
├── Propagación controlada hacia abajo
└── Personalizaciones locales permitidas

EJEMPLOS:
├── inventory-core (Inventario base)
├── billing-core (Facturación base)
└── clinical-core (Expedientes base)

GESTIÓN:
├── Cambios en core se propagan a verticales
├── Verticales pueden agregar, no eliminar funcionalidad base
└── Incompatibilidades requieren branch temporal
```

### 3. PROJECT-SPECIFIC (Específica de Proyecto)

```
CARACTERÍSTICAS:
├── Implementación única para un proyecto
├── No se propaga
├── Puede evolucionar a CORE o SHARED si se reutiliza
└── Monitorear para detectar duplicados

EJEMPLOS:
├── odontograma (Solo clínica dental)
├── presupuesto-obra (Solo construcción)
└── trading-signals (Solo trading-platform)

GESTIÓN:
├── Revisar periódicamente si hay duplicados
├── Si >2 proyectos necesitan: considerar extraer a CORE/SHARED
└── Documentar decisiones de no-extracción
```

---

## RELACIONES ENTRE CAPAS

### Matriz de Coherencia

```
                    DDL              BACKEND           FRONTEND
                    │                │                 │
Tabla ──────────────┼── Entity ──────┼── Component ────│
                    │       │        │       │         │
                    │       └── Service ─────┼── Hook ─│
                    │              │         │    │    │
                    │              └── DTO ──│────┘    │
                    │                        │         │
Función PL/pgSQL ───┼── Repository ──────────│         │
                    │                        │         │
RLS Policy ─────────┼── Guard/Interceptor ───│         │
                    │                        │         │
Trigger ────────────┼── Event Handler ───────┼── Toast │
                    │                        │         │
View ───────────────┼── Query Builder ───────┼── Table │
```

### Reglas de Coherencia

```yaml
REGLA_1:
  nombre: "Tabla implica Entity"
  si: "Existe tabla en DDL"
  entonces: "DEBE existir Entity correspondiente en Backend"
  excepciones:
    - "Tablas de configuración puras"
    - "Tablas de auditoría manejadas por triggers"

REGLA_2:
  nombre: "Entity pública implica Service"
  si: "Entity necesita CRUD desde API"
  entonces: "DEBE existir Service con operaciones básicas"
  excepciones:
    - "Entities solo para relaciones"
    - "Entities embebidas en otras"

REGLA_3:
  nombre: "Service público implica Controller"
  si: "Service expone operaciones a API"
  entonces: "DEBE existir Controller/Resolver"
  excepciones:
    - "Services internos entre módulos"

REGLA_4:
  nombre: "Endpoint implica integración Frontend"
  si: "Endpoint será consumido por UI"
  entonces: "DEBE existir hook/service en Frontend"
  excepciones:
    - "Endpoints solo para integraciones externas"
    - "Endpoints de administración"

REGLA_5:
  nombre: "RLS implica Guard"
  si: "Existe RLS Policy para multi-tenancy"
  entonces: "DEBE existir TenantGuard/Interceptor"
  validación: "RLS y Guard deben filtrar por mismo criterio"
```

---

## INVENTARIO DE FUNCIONALIDADES

### Ubicación

```
orchestration/
└── inventarios/
    └── FUNCTIONALITY-INVENTORY.yml   <- Inventario global

projects/{proyecto}/
└── orchestration/
    └── inventarios/
        └── FUNCTIONALITY-LOCAL.yml   <- Inventario local del proyecto
```

### Operaciones sobre el Inventario

#### 1. Registrar Nueva Funcionalidad

```bash
# El @WS_ORCHESTRATOR ejecuta al detectar nueva funcionalidad:

PROCESO:
1. Identificar tipo (SHARED, CORE, PROJECT-SPECIFIC)
2. Verificar si ya existe en inventario
3. Si no existe: crear entrada con template
4. Si existe: actualizar implementation del proyecto
5. Verificar coherencia entre capas
6. Actualizar contadores y estadísticas
```

#### 2. Detectar Duplicados

```bash
# Ejecutar periódicamente o al crear nueva funcionalidad:

CRITERIOS_DUPLICADO:
├── Tablas con >80% columnas similares
├── Services con >70% métodos similares
├── Componentes con misma estructura
└── Hooks con misma lógica

ACCIONES_SI_DUPLICADO:
├── Registrar en consolidation.duplicates_detected
├── Evaluar candidatura para shared
├── Proponer plan de consolidación
└── Escalar a @ARCHITECTURE-ANALYST si P1/P2
```

#### 3. Evaluar para Consolidación

```yaml
CRITERIOS_CONSOLIDACION:
  mínimo_implementaciones: 2

  pesos:
    complejidad_similar: 30%
    uso_frecuente: 25%
    estabilidad: 20%
    mantenimiento_distribuido: 15%
    solicitado_por_usuario: 10%

  umbral_aprobación: 60%

PRIORIDADES:
  P1_CRITICO:
    - Security-related
    - >3 implementaciones duplicadas
  P2_ALTO:
    - 2-3 implementaciones
    - Alta complejidad
  P3_MEDIO:
    - Conveniencia de mantenimiento
  P4_BAJO:
    - Nice-to-have
```

---

## PROCESO DE CONSOLIDACIÓN

### Flujo de Trabajo

```
[Detectar Duplicado] ──> [Evaluar Candidatura]
         │                       │
         │                       ▼
         │              [Prioridad >= P2?]
         │                  │       │
         │                  NO      YES
         │                  │       │
         │                  ▼       ▼
         │              [Documentar] [Plan de Consolidación]
         │                              │
         │                              ▼
         │                      [Aprobar con @ARCHITECTURE-ANALYST]
         │                              │
         │                              ▼
         │                      [Ejecutar Consolidación]
         │                              │
         │                              ▼
         │                      [Actualizar Inventario]
         │                              │
         └──────────────────────────────┘
```

### Plan de Consolidación

```yaml
consolidation_plan:
  functionality: "inventory-management"
  current_implementations:
    - project: "gamilit"
      version: "2.0.0"
      layers: [ddl, backend, frontend]
    - project: "michangarrito"
      version: "1.0.0"
      layers: [ddl, backend, frontend]

  target:
    location: "shared/catalog/inventory-core"
    structure:
      base:
        - "ProductBase (id, sku, name, price)"
        - "StockMovement (id, product_id, quantity, type)"
        - "StockAlert (id, product_id, threshold)"
      extensible:
        - "Product variants (proyecto específico)"
        - "Warehouse locations (proyecto específico)"

  migration_steps:
    - step: 1
      action: "Crear shared/catalog/inventory-core"
      owner: "@ARCHITECTURE-ANALYST"
    - step: 2
      action: "Migrar gamilit a usar shared"
      owner: "@DDL-SPECIALIST, @BACKEND-DEVELOPER"
    - step: 3
      action: "Migrar michangarrito a usar shared"
      owner: "@DDL-SPECIALIST, @BACKEND-DEVELOPER"
    - step: 4
      action: "Deprecar implementaciones duplicadas"
      owner: "@WS_ORCHESTRATOR"
    - step: 5
      action: "Actualizar inventario"
      owner: "@WS_ORCHESTRATOR"

  rollback_plan:
    trigger: "Fallo en cualquier paso crítico"
    actions:
      - "Revertir migraciones"
      - "Restaurar implementaciones originales"
      - "Documentar razón del fallo"
```

---

## VERIFICACIONES AUTOMÁTICAS

### Al Crear Funcionalidad Nueva

```bash
CHECKLIST:
□ Verificar en FUNCTIONALITY-INVENTORY.yml si ya existe
□ Verificar en shared/catalog/ si hay módulo similar
□ Buscar patrones similares en otros proyectos
□ Si duplicado potencial: DETENER y consultar
□ Si único: proceder con @CREATE-SAFE
```

### Al Modificar Funcionalidad Existente

```bash
CHECKLIST:
□ Identificar todas las implementaciones en inventario
□ Evaluar si cambio debe propagarse
□ Si SHARED: propagar automáticamente
□ Si CORE: propagar a verticales
□ Si PROJECT-SPECIFIC: solo local
□ Actualizar inventario post-cambio
```

### Auditoría Periódica

```bash
# Ejecutar semanalmente por @WS_ORCHESTRATOR

TAREAS:
1. Comparar inventario con implementaciones reales
2. Detectar funcionalidades no registradas
3. Detectar duplicados nuevos
4. Verificar coherencia DDL-Backend-Frontend
5. Generar reporte de discrepancias
6. Proponer acciones correctivas
```

---

## SCRIPTS RELACIONADOS

```
scripts/
├── workspace/
│   └── audit-functionalities.sh    # Auditar funcionalidades
├── project/
│   └── register-functionality.sh   # Registrar nueva funcionalidad
└── propagation/
    └── propagate-functionality.sh  # Propagar cambios de funcionalidad
```

---

## INTEGRACIÓN CON OTROS SISTEMAS

### Con docs/_SSOT/TRACEABILITY-MASTER.yml

```yaml
# Cada funcionalidad referencia proyectos de TRACEABILITY
functionality:
  id: "auth-jwt"
  projects:
    - ref: "@TRACEABILITY.projects.TSS"  # template-saas
    - ref: "@TRACEABILITY.projects.ERC"  # erp-core
```

### Con DEPENDENCY-GRAPH.yml

```yaml
# Las relaciones de propagación siguen el grafo de dependencias
propagation:
  follows: "@DEPENDENCY_GRAPH.erp_hierarchy"
```

### Con CATALOG-INDEX.yml

```yaml
# Funcionalidades SHARED tienen referencia directa
functionality:
  type: "SHARED"
  catalog_ref: "@CATALOG.modules.auth"
```

---

## ALIASES RELACIONADOS

```yaml
# Definidos en ALIASES.yml

@FUNC_INVENTORY:
  referencia: "orchestration/inventarios/FUNCTIONALITY-INVENTORY.yml"

@FUNCIONALIDADES:
  referencia: "Esta directiva"

@AUDIT_FUNC:
  comando: "./scripts/workspace/audit-functionalities.sh"

@CONSOLIDATE:
  proceso: "Evaluar y consolidar funcionalidad duplicada"
```

---

## EJEMPLOS DE USO

### Ejemplo 1: Detectar si Funcionalidad ya Existe

```
TAREA: "Implementar sistema de notificaciones en erp-construccion"

PROCESO:
1. Consultar @FUNC_INVENTORY
2. Buscar: notifications
3. ENCONTRADO:
   - type: SHARED
   - catalog_ref: shared/catalog/notifications
   - implementations: template-saas, gamilit

ACCIÓN:
- NO crear implementación nueva
- Usar shared/catalog/notifications
- Registrar erp-construccion como nuevo consumidor
```

### Ejemplo 2: Registrar Funcionalidad Nueva

```
TAREA: "Implementar gestión de maquinaria en erp-construccion"

PROCESO:
1. Consultar @FUNC_INVENTORY
2. Buscar: machinery, equipment, maquinaria
3. NO ENCONTRADO

ACCIÓN:
- Crear funcionalidad PROJECT-SPECIFIC
- Registrar en inventario:
  id: machinery-management
  type: PROJECT-SPECIFIC
  status: development
  implementations:
    erp-construccion:
      layers:
        ddl: [machinery, maintenance_records]
        backend: [MachineryModule]
        frontend: [machinery feature]
```

### Ejemplo 3: Consolidar Duplicados

```
TAREA: "Se detectó inventory-management en gamilit y michangarrito"

PROCESO:
1. Evaluar similitud: 75% (criterio: >60%)
2. Prioridad: P2 (2 implementaciones, complejidad media)
3. Aprobar consolidación con @ARCHITECTURE-ANALYST

ACCIÓN:
- Crear shared/catalog/inventory-core
- Extraer funcionalidad común
- Migrar gamilit y michangarrito
- Actualizar inventario
- Marcar consolidation.status: completed
```

---

## MÉTRICAS Y REPORTES

### Métricas a Trackear

```yaml
metrics:
  total_functionalities: 15
  shared_functionalities: 7
  core_functionalities: 3
  project_specific: 5

  duplicates:
    detected: 2
    pending_consolidation: 1
    consolidated_this_month: 1

  coherence:
    ddl_backend_sync: 95%
    backend_frontend_sync: 90%
    inventory_accuracy: 98%

  propagation:
    auto_propagated: 12
    manual_propagated: 3
    pending: 0
```

### Reporte Semanal

```
# Generado por @WS_ORCHESTRATOR

REPORTE SEMANAL DE FUNCIONALIDADES
==================================

Resumen:
- Funcionalidades totales: 15
- Nuevas esta semana: 1
- Consolidadas: 0
- Duplicados detectados: 1 (inventory-management)

Coherencia entre capas:
- DDL ↔ Backend: 95% ✓
- Backend ↔ Frontend: 90% ✓
- Discrepancias: 2 (ver detalle)

Acciones pendientes:
1. [P2] Consolidar inventory-management
2. [P3] Revisar coherencia de audit-logs en michangarrito

Próxima auditoría: 2026-01-23
```

---

## NOTAS DE IMPLEMENTACIÓN

1. **Inventario como fuente de verdad**: El FUNCTIONALITY-INVENTORY.yml es la fuente autoritativa para saber qué funcionalidades existen y dónde están implementadas.

2. **No duplicar, extender**: La regla de oro es nunca duplicar una funcionalidad SHARED. Si se necesita personalización, extender la base.

3. **Coherencia es obligatoria**: Las verificaciones de coherencia DDL-Backend-Frontend son obligatorias antes de marcar cualquier tarea como completada.

4. **Consolidación es gradual**: No se fuerza consolidación inmediata. Se documenta, prioriza y planifica.

5. **Autonomía del inventario**: El inventario debe poder reconstruirse escaneando el código, pero se mantiene manualmente para tener metadatos adicionales (prioridades, decisiones, etc.).

---

**Última actualización:** 2026-01-16
**Próxima revisión:** 2026-02-16
**Mantenido por:** @WS_ORCHESTRATOR
