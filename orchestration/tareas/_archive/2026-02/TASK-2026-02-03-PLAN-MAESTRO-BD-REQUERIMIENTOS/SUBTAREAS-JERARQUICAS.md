# SUBTAREAS JERARQUICAS - Plan Maestro GAMILIT

**Tarea:** TASK-2026-02-03-PLAN-MAESTRO-BD-REQUERIMIENTOS
**Fecha:** 2026-02-03
**Sistema:** SIMCO v4.3.0

---

## ESTRUCTURA COMPLETA (4 Niveles)

```
NIVEL 0: PLAN MAESTRO BD-REQUERIMIENTOS GAMILIT
│
├── NIVEL 1: AREA 1 - ANALISIS DE COHERENCIA
│   │
│   ├── NIVEL 2: 1.1 - Validacion Schemas vs User Stories
│   │   │
│   │   ├── NIVEL 3: 1.1.1 - Mapear User Stories a Schemas BD
│   │   │   ├── 1.1.1.1 Leer GAM-001 → gamification_system
│   │   │   ├── 1.1.1.2 Leer GAM-002 → progress_tracking
│   │   │   ├── 1.1.1.3 Leer GAM-003 → social_features
│   │   │   ├── 1.1.1.4 Leer GAM-004 → educational_content
│   │   │   ├── 1.1.1.5 Leer GAM-005 → gamification_system
│   │   │   ├── 1.1.1.6 Crear TRACEABILITY-US-SCHEMAS.md
│   │   │   └── 1.1.1.7 Validar sin gaps
│   │   │
│   │   └── NIVEL 3: 1.1.2 - Validar Tablas Requeridas por US
│   │       ├── 1.1.2.1 Verificar tablas GAM-001
│   │       ├── 1.1.2.2 Verificar tablas GAM-002
│   │       ├── 1.1.2.3 Verificar tablas GAM-003
│   │       ├── 1.1.2.4 Verificar tablas GAM-004
│   │       ├── 1.1.2.5 Verificar tablas GAM-005
│   │       └── 1.1.2.6 Documentar estado
│   │
│   ├── NIVEL 2: 1.2 - Validacion EPICs vs Implementacion
│   │   │
│   │   ├── NIVEL 3: 1.2.1 - Auditar EPICs EAI-001 a EAI-008
│   │   │   ├── 1.2.1.1 Auditar EAI-001 Fundamentos
│   │   │   ├── 1.2.1.2 Auditar EAI-002 Actividades
│   │   │   ├── 1.2.1.3 Auditar EAI-003 Gamificacion
│   │   │   ├── 1.2.1.4 Auditar EAI-004 Analytics
│   │   │   ├── 1.2.1.5 Auditar EAI-005 Admin Base
│   │   │   ├── 1.2.1.6 Auditar EAI-006 Config
│   │   │   ├── 1.2.1.7 Auditar EAI-007 M4-M5
│   │   │   └── 1.2.1.8 Auditar EAI-008 Admin Avanzado
│   │   │
│   │   └── NIVEL 3: 1.2.2 - Auditar EPICs EXT-001 a EXT-011
│   │       ├── 1.2.2.1-11 Auditar cada EPIC EXT
│   │       └── 1.2.2.12 Asignar Story Points faltantes
│   │
│   └── NIVEL 2: 1.3 - Coherencia DDL-Backend-Frontend
│       │
│       ├── NIVEL 3: 1.3.1 - Validar Entities vs Tablas DDL
│       │   ├── 1.3.1.1 Listar entities
│       │   ├── 1.3.1.2 Listar tablas DDL
│       │   ├── 1.3.1.3 Crear match
│       │   ├── 1.3.1.4 Identificar entities sin tabla
│       │   ├── 1.3.1.5 Identificar tablas sin entity
│       │   └── 1.3.1.6 Documentar resultado
│       │
│       └── NIVEL 3: 1.3.2 - Validar Types Frontend vs Entities
│           ├── 1.3.2.1 Listar types frontend
│           ├── 1.3.2.2 Listar entities publicas
│           ├── 1.3.2.3 Comparar campos
│           ├── 1.3.2.4 Identificar divergencias
│           ├── 1.3.2.5 Ejecutar sync
│           └── 1.3.2.6 Documentar estado
│
├── NIVEL 1: AREA 2 - DEFINICIONES FALTANTES
│   │
│   ├── NIVEL 2: 2.1 - Especificaciones Tecnicas
│   │   │
│   │   ├── NIVEL 3: 2.1.1 - Crear ET-SYS-001 (Config Sistema)
│   │   │   ├── 2.1.1.1 Leer EAI-006
│   │   │   ├── 2.1.1.2 Leer system_configuration schema
│   │   │   ├── 2.1.1.3 Leer system-config module
│   │   │   ├── 2.1.1.4 Identificar campos
│   │   │   ├── 2.1.1.5 Documentar APIs
│   │   │   ├── 2.1.1.6 Crear ET-SYS-001.md
│   │   │   └── 2.1.1.7 Agregar a especificaciones/
│   │   │
│   │   └── NIVEL 3: 2.1.2 - Crear ET-SOCIAL-001 (Social Module)
│   │       ├── 2.1.2.1 Leer social_features schema
│   │       ├── 2.1.2.2 Leer social module backend
│   │       ├── 2.1.2.3 Documentar friendships
│   │       ├── 2.1.2.4 Documentar teams
│   │       ├── 2.1.2.5 Crear ET-SOCIAL-001.md
│   │       └── 2.1.2.6 Ubicar en EXT-009/
│   │
│   └── NIVEL 2: 2.2 - Indices y Referencias
│       │
│       ├── NIVEL 3: 2.2.1 - Crear RLS-POLICIES-MASTER.md
│       │   ├── 2.2.1.1 Find archivos RLS
│       │   ├── 2.2.1.2 Extraer CREATE POLICY
│       │   ├── 2.2.1.3 Clasificar por tipo
│       │   ├── 2.2.1.4 Agrupar por schema
│       │   ├── 2.2.1.5 Crear RLS-POLICIES-MASTER.md
│       │   ├── 2.2.1.6 Ubicar en arquitectura-database/
│       │   └── 2.2.1.7 Referenciar en DATABASE_INVENTORY
│       │
│       └── NIVEL 3: 2.2.2 - Crear FUNCTIONS-INDEX.md
│           ├── 2.2.2.1 Find archivos functions
│           ├── 2.2.2.2 Extraer CREATE FUNCTION
│           ├── 2.2.2.3 Clasificar por proposito
│           ├── 2.2.2.4 Documentar parametros
│           ├── 2.2.2.5 Crear FUNCTIONS-INDEX.md
│           └── 2.2.2.6 Ubicar en inventarios-database/
│
├── NIVEL 1: AREA 3 - PURGA DE DOCUMENTACION
│   │
│   ├── NIVEL 2: 3.1 - Archivos Obsoletos
│   │   │
│   │   ├── NIVEL 3: 3.1.1 - Purgar orchestration/_archive/
│   │   │   ├── 3.1.1.1 grep referencias
│   │   │   ├── 3.1.1.2 Revisar si >0
│   │   │   ├── 3.1.1.3 Actualizar referencias
│   │   │   ├── 3.1.1.4 rm -rf _archive/
│   │   │   └── 3.1.1.5 Actualizar _MAP.md
│   │   │
│   │   └── NIVEL 3: 3.1.2 - Consolidar docs/98-audits/
│   │       ├── 3.1.2.1 Leer archivo 1
│   │       ├── 3.1.2.2 Leer archivo 2
│   │       ├── 3.1.2.3 Leer archivos restantes
│   │       ├── 3.1.2.4 Crear consolidado
│   │       ├── 3.1.2.5 Eliminar originales
│   │       └── 3.1.2.6 Actualizar _INDEX
│   │
│   └── NIVEL 2: 3.2 - Tareas Completadas
│       │
│       └── NIVEL 3: 3.2.1 - Archivar Tareas 2026-01-24
│           ├── 3.2.1.1 Listar tareas
│           ├── 3.2.1.2 Verificar status COMPLETED
│           ├── 3.2.1.3 Crear RESUMEN
│           ├── 3.2.1.4 Mover a _archive
│           └── 3.2.1.5 Actualizar _INDEX.yml
│
└── NIVEL 1: AREA 4 - INTEGRACION Y ORDEN
    │
    ├── NIVEL 2: 4.1 - Dependencias
    │   │
    │   ├── NIVEL 3: 4.1.1 - Crear Grafo de Dependencias
    │   │   ├── 4.1.1.1 Identificar tareas Area 1
    │   │   ├── 4.1.1.2 Identificar tareas Area 2
    │   │   ├── 4.1.1.3 Identificar tareas Area 3
    │   │   ├── 4.1.1.4 Identificar tareas Area 4
    │   │   ├── 4.1.1.5 Mapear bloqueos
    │   │   ├── 4.1.1.6 Generar Mermaid
    │   │   └── 4.1.1.7 Verificar no ciclos
    │   │
    │   └── NIVEL 3: 4.1.2 - Definir Orden de Ejecucion
    │       ├── 4.1.2.1 Priorizar P0>P1>P2
    │       ├── 4.1.2.2 Ordenar por deps
    │       ├── 4.1.2.3 Identificar paralelos
    │       ├── 4.1.2.4 Crear secuencia
    │       ├── 4.1.2.5 Estimar tiempo
    │       └── 4.1.2.6 Generar ORDEN-EJECUCION.md
    │
    └── NIVEL 2: 4.2 - Ejecucion Paralela
        │
        └── NIVEL 3: 4.2.1 - Definir Bloques Paralelos
            ├── 4.2.1.1 Agrupar Bloque 1
            ├── 4.2.1.2 Agrupar Bloque 2
            ├── 4.2.1.3 Agrupar Bloque 3
            ├── 4.2.1.4 Bloque 4 secuencial
            └── 4.2.1.5 Documentar en ORDEN-EJECUCION.md
```

---

## METRICAS TOTALES

| Nivel | Cantidad | Descripcion |
|-------|----------|-------------|
| N0 | 1 | Plan Maestro |
| N1 (Areas) | 4 | Coherencia, Definiciones, Purga, Integracion |
| N2 (Dominios) | 8 | Subdivisiones de areas |
| N3 (Tareas) | 14 | Unidades de trabajo con CAPVED |
| N4 (Acciones) | 82 | Pasos atomicos ejecutables |

---

## TAREAS CON CAPVED COMPLETO

Cada tarea de Nivel 3 incluye:

| Tarea | C | A | P | E | V | D |
|-------|---|---|---|---|---|---|
| 1.1.1 Mapear US-Schemas | 5 US vs 16 schemas | Identificar mapping | Crear matriz | Generar doc | Validar 100% | TRACEABILITY |
| 1.1.2 Validar Tablas | Tablas por US | Comparar DDL | Documentar gaps | Verificar | 0 MISSING | DATABASE_INV |
| 1.2.1 Auditar EAI | 8 EPICs Fase 1 | Criterios vs estado | Calcular % | Crear doc | Builds | PROJECT-STATUS |
| 1.2.2 Auditar EXT | 11 EPICs Fase 3 | Verificar SP | Asignar SP | Actualizar | Suma total | ROADMAP |
| 1.3.1 Entities-DDL | 158 vs 138 | Delta +20 | Documentar | Crear match | 0 gaps | BACKEND_INV |
| 1.3.2 Types-Entities | Types vs entities | Comparar campos | Crear faltantes | Sync | validate:types | FRONTEND_INV |
| 2.1.1 ET-SYS-001 | Referenciada | EAI-006 + schema | Estructura | Escribir | Codigo | TRACEABILITY |
| 2.1.2 ET-SOCIAL-001 | Sin spec | Schema + module | Estructura | Escribir | Integridad | Inventarios |
| 2.2.1 RLS-MASTER | 282 policies | Auditar archivos | Por schema | Generar | Count 282 | DATABASE_INV |
| 2.2.2 FUNCTIONS-INDEX | 110+ funciones | Auditar archivos | Por proposito | Generar | Validar | DATABASE_INV |
| 3.1.1 Purgar _archive | 38 carpetas | 0 referencias | Eliminar | rm -rf | ls empty | _MAP.md |
| 3.1.2 Consolidar audits | 6 archivos | 70% solapado | Merge | Crear | No loss | _INDEX |
| 3.2.1 Archivar tareas | 7 tareas | COMPLETED | Mover | mv | Integridad | _INDEX.yml |
| 4.1.1 Grafo deps | 28 tareas | Prerrequisitos | Dirigido | Mermaid | No ciclos | Ordenar |

---

## PRIORIDADES POR TAREA

### P0 (Bloqueante)

| ID | Tarea | Razon |
|----|-------|-------|
| 0.1 | Sync Git | Prerrequisito obligatorio |
| 1.1.1 | Mapear US-Schemas | Base para coherencia |
| 1.2.1 | Auditar EAI | Estado real EPICs |
| 1.3.1 | Entities-DDL | Coherencia critica |
| 2.1.1 | ET-SYS-001 | Definicion faltante critica |
| 4.3 | Commit final | Persistir cambios |

### P1 (Alto)

| ID | Tarea | Razon |
|----|-------|-------|
| 1.1.2 | Validar Tablas | Completar coherencia |
| 1.2.2 | Auditar EXT | Story Points |
| 1.3.2 | Types-Entities | Coherencia frontend |
| 2.1.2 | ET-SOCIAL-001 | Definicion faltante |
| 2.2.1 | RLS-MASTER | Indice seguridad |
| 2.2.2 | FUNCTIONS-INDEX | Indice funciones |
| 3.1.1 | Purgar _archive | Limpiar obsoletos |
| 4.1.1 | Grafo deps | Ordenar ejecucion |
| 4.2 | Actualizar invs | Sincronizar |

### P2 (Medio)

| ID | Tarea | Razon |
|----|-------|-------|
| 3.1.2 | Consolidar audits | Reducir duplicados |
| 3.2.1 | Archivar tareas | Organizar |
| 4.2.1 | Bloques paralelos | Optimizar |

---

*Sistema SIMCO v4.3.0 - GAMILIT*
*Subtareas Jerarquicas v1.0.0*
*Todas las tareas cumplen CAPVED*
