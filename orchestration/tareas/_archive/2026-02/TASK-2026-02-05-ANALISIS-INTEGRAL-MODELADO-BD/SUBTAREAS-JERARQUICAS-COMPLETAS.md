# SUBTAREAS JERARQUICAS COMPLETAS

**Tarea:** TASK-2026-02-05-ANALISIS-INTEGRAL-MODELADO-BD
**Fecha:** 2026-02-05
**Metodologia:** CAPVED en cada nivel

---

## ARBOL COMPLETO (5 Niveles)

```
N0: TASK-2026-02-05-ANALISIS-INTEGRAL-MODELADO-BD
│
├── N1: FASE-1 RECONCILIACION Y DIAGNOSTICO BASE [P0] [BLOQUEANTE]
│   │
│   ├── N2: AREA 1.1 - Inventario Real DDL
│   │   │
│   │   ├── N3: TAREA 1.1.1 - Catalogar Todas las Tablas DDL
│   │   │   ├── N4: 1.1.1.1 Catalogar tablas schema auth
│   │   │   ├── N4: 1.1.1.2 Catalogar tablas schema auth_management
│   │   │   ├── N4: 1.1.1.3 Catalogar tablas schema gamification_system
│   │   │   ├── N4: 1.1.1.4 Catalogar tablas schema educational_content
│   │   │   ├── N4: 1.1.1.5 Catalogar tablas schema progress_tracking
│   │   │   ├── N4: 1.1.1.6 Catalogar tablas schema admin_dashboard
│   │   │   ├── N4: 1.1.1.7 Catalogar tablas schema audit_logging
│   │   │   ├── N4: 1.1.1.8 Catalogar tablas schema content_management
│   │   │   ├── N4: 1.1.1.9 Catalogar tablas schema social_features
│   │   │   ├── N4: 1.1.1.10 Catalogar tablas schema notifications
│   │   │   ├── N4: 1.1.1.11 Catalogar tablas schema communication
│   │   │   ├── N4: 1.1.1.12 Catalogar tablas schema system_configuration
│   │   │   ├── N4: 1.1.1.13 Catalogar tablas schema storage
│   │   │   ├── N4: 1.1.1.14 Catalogar tablas schema lti_integration
│   │   │   ├── N4: 1.1.1.15 Catalogar tablas schema data_warehouse
│   │   │   ├── N4: 1.1.1.16 Catalogar tablas schema optimization
│   │   │   ├── N4: 1.1.1.17 Catalogar tablas schema public
│   │   │   ├── N4: 1.1.1.18 Catalogar tablas schema gamilit
│   │   │   ├── N4: 1.1.1.19 Consolidar en REAL-TABLES-INVENTORY.yml
│   │   │   └── N4: 1.1.1.20 Comparar con DATABASE_INVENTORY actual
│   │   │
│   │   ├── N3: TAREA 1.1.2 - Catalogar Todas las Funciones SQL
│   │   │   ├── N4: 1.1.2.1 Catalogar funciones por schema (18x)
│   │   │   ├── N4: 1.1.2.2 Identificar multi-CREATE por archivo
│   │   │   ├── N4: 1.1.2.3 Verificar funciones en 00-prerequisites.sql
│   │   │   ├── N4: 1.1.2.4 Verificar funciones en 99-post-ddl-permissions.sql
│   │   │   ├── N4: 1.1.2.5 Consolidar REAL-FUNCTIONS-INVENTORY.yml
│   │   │   └── N4: 1.1.2.6 Comparar con metricas reportadas
│   │   │
│   │   └── N3: TAREA 1.1.3 - Catalogar Triggers, Enums, Indexes, Views, RLS
│   │       ├── N4: 1.1.3.1 Catalogar triggers (schemas/*/triggers/)
│   │       ├── N4: 1.1.3.2 Catalogar enums (schemas/*/enums/)
│   │       ├── N4: 1.1.3.3 Catalogar indexes (schemas/*/indexes/)
│   │       ├── N4: 1.1.3.4 Catalogar views (schemas/*/views/)
│   │       ├── N4: 1.1.3.5 Catalogar RLS policies (schemas/*/rls-policies/)
│   │       ├── N4: 1.1.3.6 Consolidar en REAL-OBJECTS-INVENTORY.yml
│   │       └── N4: 1.1.3.7 Reconciliar con DATABASE_INVENTORY
│   │
│   ├── N2: AREA 1.2 - Inventario Real Backend Entities
│   │   │
│   │   └── N3: TAREA 1.2.1 - Catalogar Todas las Entities TypeORM
│   │       ├── N4: 1.2.1.1-11 Catalogar entities por modulo (11 modulos con entities)
│   │       ├── N4: 1.2.1.12 Extraer nombre de tabla @Entity de cada entity
│   │       ├── N4: 1.2.1.13 Consolidar REAL-ENTITIES-INVENTORY.yml
│   │       └── N4: 1.2.1.14 Comparar con BACKEND_INVENTORY
│   │
│   ├── N2: AREA 1.3 - Cross-Reference DDL ↔ Backend
│   │   │
│   │   └── N3: TAREA 1.3.1 - Crear Matriz Tabla → Entity
│   │       ├── N4: 1.3.1.1-10 Cruzar por schema (10 schemas con entities)
│   │       ├── N4: 1.3.1.11 Generar TABLAS SIN ENTITY
│   │       ├── N4: 1.3.1.12 Generar ENTITIES SIN TABLA
│   │       └── N4: 1.3.1.13 Documentar CROSS-REFERENCE-TABLE-ENTITY.yml
│   │
│   └── N2: AREA 1.4 - Reconciliar Inventarios Oficiales
│       │
│       ├── N3: TAREA 1.4.1 - Actualizar DATABASE_INVENTORY.yml
│       ├── N3: TAREA 1.4.2 - Actualizar BACKEND_INVENTORY.yml
│       └── N3: TAREA 1.4.3 - Actualizar MASTER_INVENTORY.yml
│
├── N1: FASE-2 VALIDACION PROFUNDA POR SCHEMA [P1]
│   │
│   ├── N2: AREA 2.1 - Schemas Criticos
│   │   │
│   │   ├── N3: TAREA 2.1.1 - Validar auth_management (21 subtareas N4)
│   │   │   ├── N4: 2.1.1.1-14 Validar tablas (DDL vs entity, campo por campo)
│   │   │   ├── N4: 2.1.1.15 Validar soft-delete
│   │   │   ├── N4: 2.1.1.16 Validar enums (3)
│   │   │   ├── N4: 2.1.1.17 Validar funciones (6)
│   │   │   ├── N4: 2.1.1.18 Validar triggers (6)
│   │   │   ├── N4: 2.1.1.19 Validar RLS policies
│   │   │   ├── N4: 2.1.1.20 Validar indexes
│   │   │   └── N4: 2.1.1.21 Generar VALIDATION-auth_management.md
│   │   │
│   │   ├── N3: TAREA 2.1.2 - Validar gamification_system (20 subtareas N4)
│   │   │   ├── N4: 2.1.2.1-13 Validar tablas
│   │   │   ├── N4: 2.1.2.14-17 Validar enums/funciones/triggers/RLS
│   │   │   ├── N4: 2.1.2.18 Validar vs diseño v6.5
│   │   │   ├── N4: 2.1.2.19 Evaluar Multiplicador ML Coins
│   │   │   └── N4: 2.1.2.20 Generar VALIDATION-gamification_system.md
│   │   │
│   │   ├── N3: TAREA 2.1.3 - Validar educational_content (15 subtareas N4)
│   │   │   ├── N4: 2.1.3.1-11 Validar tablas
│   │   │   ├── N4: 2.1.3.12-13 Validar enums/funciones
│   │   │   ├── N4: 2.1.3.14 Validar 23 tipos ejercicio
│   │   │   └── N4: 2.1.3.15 Generar VALIDATION-educational_content.md
│   │   │
│   │   └── N3: TAREA 2.1.4 - Validar progress_tracking (15 subtareas N4)
│   │       ├── N4: 2.1.4.1-11 Validar tablas
│   │       ├── N4: 2.1.4.12-14 Validar enums/funciones/triggers
│   │       └── N4: 2.1.4.15 Generar VALIDATION-progress_tracking.md
│   │
│   ├── N2: AREA 2.2 - Schemas Secundarios
│   │   │
│   │   ├── N3: TAREA 2.2.1 - Validar social_features (9 subtareas N4)
│   │   ├── N3: TAREA 2.2.2 - Validar content_management (8 subtareas N4)
│   │   ├── N3: TAREA 2.2.3 - Validar notifications (6 subtareas N4)
│   │   ├── N3: TAREA 2.2.4 - Validar admin_dashboard (5 subtareas N4)
│   │   └── N3: TAREA 2.2.5 - Validar audit_logging (7 subtareas N4)
│   │
│   └── N2: AREA 2.3 - Schemas Menores
│       │
│       └── N3: TAREA 2.3.1 - Validar 8 Schemas Menores (11 subtareas N4)
│           ├── N4: 2.3.1.1 system_configuration
│           ├── N4: 2.3.1.2 lti_integration
│           ├── N4: 2.3.1.3 communication
│           ├── N4: 2.3.1.4 storage
│           ├── N4: 2.3.1.5 data_warehouse
│           ├── N4: 2.3.1.6 optimization
│           ├── N4: 2.3.1.7 public
│           ├── N4: 2.3.1.8 gamilit
│           ├── N4: 2.3.1.9 Evaluar schemas vacios/minimos
│           ├── N4: 2.3.1.10 Proponer consolidacion
│           └── N4: 2.3.1.11 Generar VALIDATION-schemas-menores.md
│
├── N1: FASE-3 VALIDACION POR PROCESO DE NEGOCIO [P1]
│   │
│   ├── N2: AREA 3.1 - Procesos Core
│   │   │
│   │   ├── N3: TAREA 3.1.1 - Auth E2E (9 subtareas N4)
│   │   ├── N3: TAREA 3.1.2 - Educativo E2E (10 subtareas N4)
│   │   ├── N3: TAREA 3.1.3 - Gamificacion E2E (13 subtareas N4)
│   │   └── N3: TAREA 3.1.4 - Social E2E (8 subtareas N4)
│   │
│   └── N2: AREA 3.2 - Procesos Secundarios
│       │
│       ├── N3: TAREA 3.2.1 - Admin E2E (7 subtareas N4)
│       ├── N3: TAREA 3.2.2 - Notificaciones E2E (5 subtareas N4)
│       ├── N3: TAREA 3.2.3 - Padres E2E (5 subtareas N4)
│       └── N3: TAREA 3.2.4 - LTI E2E (4 subtareas N4)
│
├── N1: FASE-4 INTEGRACION DE DEFINICIONES FALTANTES [P2]
│   │
│   ├── N2: AREA 4.1 - Documentos Tecnicos
│   │   │
│   │   ├── N3: TAREA 4.1.1 - Diagrama ER Completo (9 subtareas N4)
│   │   ├── N3: TAREA 4.1.2 - Matriz Trazabilidad (9 subtareas N4)
│   │   └── N3: TAREA 4.1.3 - Specs Tecnicas (6 subtareas N4)
│   │
│   └── N2: AREA 4.2 - User Stories
│       │
│       └── N3: TAREA 4.2.1 - Identificar e Integrar US Faltantes (8 subtareas N4)
│
├── N1: FASE-5 PURGA Y LIMPIEZA [P2]
│   │
│   ├── N2: AREA 5.1 - Purga Tareas
│   │   │
│   │   ├── N3: TAREA 5.1.1 - Evaluar _archive/ (5 subtareas N4)
│   │   └── N3: TAREA 5.1.2 - Evaluar Activas Completadas (7 subtareas N4)
│   │
│   └── N2: AREA 5.2 - Limpieza General
│       │
│       ├── N3: TAREA 5.2.1 - Consolidar Guias Prueba (3 subtareas N4)
│       ├── N3: TAREA 5.2.2 - Limpiar Deprecated BD (4 subtareas N4)
│       └── N3: TAREA 5.2.3 - Actualizar Indices (5 subtareas N4)
│
└── N1: FASE-6 CONSOLIDACION Y CIERRE [P2]
    │
    ├── N2: AREA 6.1 - Informe Final
    │   │
    │   └── N3: TAREA 6.1.1 - Generar Informe (6 subtareas N4)
    │
    └── N2: AREA 6.2 - Actualizaciones Finales
        │
        └── N3: TAREA 6.2.1 - Actualizar Estado (5 subtareas N4)
```

---

## RESUMEN CUANTITATIVO

| Nivel | Nombre | Cantidad |
|-------|--------|----------|
| N0 | Tarea Principal | 1 |
| N1 | Fases | 6 |
| N2 | Areas | 15 |
| N3 | Tareas | 30 |
| N4 | Subtareas/Acciones Atomicas | ~230 |
| **TOTAL** | | **~282 items** |

### Por Fase

| Fase | Areas | Tareas N3 | Subtareas N4 | Paralelizable |
|------|-------|-----------|--------------|---------------|
| FASE-1 | 4 | 7 | ~53 | Si (6 agentes) |
| FASE-2 | 3 | 10 | ~117 | Si (10 agentes) |
| FASE-3 | 2 | 8 | ~61 | Si (8 agentes) |
| FASE-4 | 2 | 4 | ~32 | Si (4 agentes) |
| FASE-5 | 2 | 5 | ~24 | Si (4 agentes) |
| FASE-6 | 2 | 2 | ~11 | No |

---

## CAPVED POR NIVEL

### Nivel N3 (Tareas) - CAPVED Completo Obligatorio

Cada tarea de Nivel 3 DEBE tener:
- **C:** Contexto documentado (que se va a validar, contra que)
- **A:** Analisis de la situacion actual
- **P:** Plan de acciones atomicas (N4)
- **E:** Ejecucion de las acciones
- **V:** Verificacion de resultados
- **D:** Documentacion de hallazgos

### Nivel N4 (Acciones) - CAPVED Simplificado

Cada accion atomica de Nivel 4 DEBE tener:
- **C:** Input esperado
- **E:** Accion a ejecutar
- **V:** Resultado esperado

---

*Subtareas Jerarquicas v1.0.0 - 2026-02-05*
