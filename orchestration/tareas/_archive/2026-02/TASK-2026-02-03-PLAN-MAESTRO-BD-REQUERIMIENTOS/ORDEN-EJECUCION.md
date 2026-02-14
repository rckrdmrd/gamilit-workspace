# ORDEN DE EJECUCION - Plan Maestro GAMILIT

**Tarea:** TASK-2026-02-03-PLAN-MAESTRO-BD-REQUERIMIENTOS
**Fecha:** 2026-02-03
**Sistema:** SIMCO v4.3.0

---

## ESTRUCTURA DE BLOQUES

```
BLOQUE 0: Prerrequisitos (Secuencial)
    └── 0.1 Sincronizacion Git

BLOQUE 1: Analisis (Paralelo - 3 agentes)
    ├── Agente A: Validacion Schemas/US
    ├── Agente B: Auditoria EPICs
    └── Agente C: Coherencia DDL-Backend

BLOQUE 2: Definiciones (Paralelo - 3 agentes)
    ├── Agente A: ET-SYS-001
    ├── Agente B: ET-SOCIAL-001
    └── Agente C: Indices (RLS, Functions)

BLOQUE 3: Purga (Paralelo - 2 agentes)
    ├── Agente A: Archivos obsoletos
    └── Agente B: Consolidar auditorias

BLOQUE 4: Integracion (Secuencial)
    ├── 4.1 Grafo dependencias
    ├── 4.2 Actualizar inventarios
    └── 4.3 Commit final
```

---

## BLOQUE 0: PRERREQUISITOS (Secuencial)

### 0.1 Sincronizacion Git

**Prioridad:** P0 (Obligatorio)
**Dependencias:** Ninguna
**Agente:** Principal

**Acciones:**
```bash
# 0.1.1 Fetch y verificar estado
cd C:/Empresas/ISEM/workspace-v2/projects/gamilit
git fetch origin
git log HEAD..origin/master --oneline

# 0.1.2 Si hay commits remotos, pull
git pull origin master

# 0.1.3 Normalizar line endings si hay cambios
git add -A
git status --short | wc -l
# Si > 0 y son solo line endings:
git commit -m "[GAMILIT] chore: Normalize CRLF to LF"
git push origin master

# 0.1.4 Verificar estado limpio
git status
```

**Criterio de Exito:** `git status` muestra working tree clean

---

## BLOQUE 1: ANALISIS (Paralelo)

### Agente 1A: Validacion Schemas/User Stories

**Prioridad:** P0
**Dependencias:** Bloque 0

**Tareas:**
1. Tarea 1.1.1: Mapear User Stories a Schemas BD
2. Tarea 1.1.2: Validar Tablas Requeridas por US

**Entregables:**
- TRACEABILITY-US-SCHEMAS.md
- VALIDATION-TABLES-US.md

---

### Agente 1B: Auditoria EPICs

**Prioridad:** P0
**Dependencias:** Bloque 0

**Tareas:**
1. Tarea 1.2.1: Auditar EPICs EAI-001 a EAI-008
2. Tarea 1.2.2: Auditar EPICs EXT-001 a EXT-011

**Entregables:**
- AUDIT-EPICS-FASE1.md
- Story Points asignados a EXT-003 a EXT-006

---

### Agente 1C: Coherencia DDL-Backend-Frontend

**Prioridad:** P0
**Dependencias:** Bloque 0

**Tareas:**
1. Tarea 1.3.1: Validar Entities vs Tablas DDL
2. Tarea 1.3.2: Validar Types Frontend vs Entities Backend

**Entregables:**
- COHERENCE-ENTITIES-DDL.md
- COHERENCE-TYPES-ENTITIES.md

---

## BLOQUE 2: DEFINICIONES (Paralelo)

### Agente 2A: Especificacion ET-SYS-001

**Prioridad:** P0
**Dependencias:** Bloque 0, Opcionalmente Agente 1B

**Tareas:**
1. Tarea 2.1.1: Crear ET-SYS-001 (Config Sistema)

**Entregables:**
- docs/01-fase-alcance-inicial/EAI-006-config-sistema/especificaciones/ET-SYS-001.md

---

### Agente 2B: Especificacion ET-SOCIAL-001

**Prioridad:** P1
**Dependencias:** Bloque 0

**Tareas:**
1. Tarea 2.1.2: Crear ET-SOCIAL-001 (Social Module)

**Entregables:**
- docs/03-fase-extensiones/EXT-009-peer-challenges/especificaciones/ET-SOCIAL-001.md

---

### Agente 2C: Indices RLS y Functions

**Prioridad:** P1
**Dependencias:** Bloque 0

**Tareas:**
1. Tarea 2.2.1: Crear RLS-POLICIES-MASTER.md
2. Tarea 2.2.2: Crear FUNCTIONS-INDEX.md

**Entregables:**
- docs/90-transversal/arquitectura-database/RLS-POLICIES-MASTER.md
- docs/90-transversal/inventarios-database/FUNCTIONS-INDEX.md

---

## BLOQUE 3: PURGA (Paralelo)

### Agente 3A: Archivos Obsoletos

**Prioridad:** P1
**Dependencias:** Bloque 0

**Tareas:**
1. Tarea 3.1.1: Purgar orchestration/_archive/

**Entregables:**
- orchestration/_archive/ eliminado
- orchestration/_MAP.md actualizado

---

### Agente 3B: Consolidar Auditorias

**Prioridad:** P2
**Dependencias:** Bloque 0

**Tareas:**
1. Tarea 3.1.2: Consolidar docs/98-audits/
2. Tarea 3.2.1: Archivar Tareas 2026-01-24

**Entregables:**
- docs/98-audits/AUDITORIA-CONSOLIDADA-ADMIN.md
- RESUMEN-TAREAS-2026-01-24.md

---

## BLOQUE 4: INTEGRACION (Secuencial)

### 4.1 Grafo de Dependencias

**Prioridad:** P1
**Dependencias:** Bloques 1, 2, 3

**Tareas:**
1. Tarea 4.1.1: Crear Grafo de Dependencias de Tareas

**Entregables:**
- TASK-DEPENDENCY-GRAPH.md

---

### 4.2 Actualizar Inventarios

**Prioridad:** P1
**Dependencias:** 4.1

**Acciones:**
```
4.2.1 Actualizar orchestration/inventarios/MASTER_INVENTORY.yml
4.2.2 Actualizar orchestration/inventarios/DATABASE_INVENTORY.yml
4.2.3 Actualizar orchestration/trazas/*
4.2.4 Actualizar orchestration/tareas/_INDEX.yml
```

---

### 4.3 Commit Final

**Prioridad:** P0
**Dependencias:** 4.2

**Acciones:**
```bash
# 4.3.1 Verificar cambios
cd C:/Empresas/ISEM/workspace-v2/projects/gamilit
git status

# 4.3.2 Agregar cambios
git add .

# 4.3.3 Commit
git commit -m "[GAMILIT] docs: Complete plan maestro BD-Requerimientos TASK-2026-02-03

- Add PLAN-MAESTRO.md with 4 areas, 14 tasks, 75+ actions
- Add ANALISIS-BD-REQUERIMIENTOS.md with coherence analysis
- Add ORDEN-EJECUCION.md with parallel execution blocks
- Create missing definitions: ET-SYS-001, ET-SOCIAL-001
- Create indices: RLS-POLICIES-MASTER, FUNCTIONS-INDEX
- Purge obsolete documentation
- Update inventories and traces

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# 4.3.4 Push
git push origin master

# 4.3.5 Verificar
git status
git log -1 --oneline
```

---

## TIMELINE ESTIMADO

| Bloque | Duracion | Agentes | Acumulado |
|--------|----------|---------|-----------|
| Bloque 0 | 15 min | 1 | 15 min |
| Bloque 1 | 1h | 3 (paralelo) | 1h 15m |
| Bloque 2 | 1.5h | 3 (paralelo) | 2h 45m |
| Bloque 3 | 45 min | 2 (paralelo) | 3h 30m |
| Bloque 4 | 30 min | 1 | 4h |

**Total Estimado:** 4 horas (con paralelizacion)
**Total Secuencial:** 8-10 horas

---

## DIAGRAMA DE GANTT SIMPLIFICADO

```
Tiempo →   0    15m   1h    1.5h   2h    2.5h   3h    3.5h   4h
           |     |     |      |     |      |     |      |     |
Bloque 0:  ████
Agente 1A:       ████████████████
Agente 1B:       ████████████████
Agente 1C:       ████████████████
Agente 2A:                    ██████████████████████
Agente 2B:                    ██████████████████████
Agente 2C:                    ██████████████████████
Agente 3A:                    ████████████████
Agente 3B:                    ████████████████
Bloque 4:                                            ████████████
```

---

## MATRIZ DE ASIGNACION

| Tarea | Agente | Bloque | Prioridad |
|-------|--------|--------|-----------|
| 0.1 Sync Git | Principal | 0 | P0 |
| 1.1.1 Mapear US-Schemas | Agente 1A | 1 | P0 |
| 1.1.2 Validar Tablas | Agente 1A | 1 | P0 |
| 1.2.1 Auditar EAI | Agente 1B | 1 | P0 |
| 1.2.2 Auditar EXT | Agente 1B | 1 | P0 |
| 1.3.1 Entities-DDL | Agente 1C | 1 | P0 |
| 1.3.2 Types-Entities | Agente 1C | 1 | P0 |
| 2.1.1 ET-SYS-001 | Agente 2A | 2 | P0 |
| 2.1.2 ET-SOCIAL-001 | Agente 2B | 2 | P1 |
| 2.2.1 RLS-MASTER | Agente 2C | 2 | P1 |
| 2.2.2 FUNCTIONS-INDEX | Agente 2C | 2 | P1 |
| 3.1.1 Purgar _archive | Agente 3A | 3 | P1 |
| 3.1.2 Consolidar audits | Agente 3B | 3 | P2 |
| 3.2.1 Archivar tareas | Agente 3B | 3 | P2 |
| 4.1.1 Grafo deps | Principal | 4 | P1 |
| 4.2 Actualizar invs | Principal | 4 | P1 |
| 4.3 Commit final | Principal | 4 | P0 |

---

## CRITERIOS DE EXITO

### Por Bloque

| Bloque | Criterio |
|--------|----------|
| 0 | git status = working tree clean |
| 1 | 6 documentos de analisis creados |
| 2 | 4 definiciones/indices creados |
| 3 | _archive eliminado, audits consolidadas |
| 4 | Inventarios actualizados, push exitoso |

### Global

- [ ] 100% tareas P0 completadas
- [ ] 90% tareas P1 completadas
- [ ] Documentacion coherente con estado real
- [ ] Builds pasan (backend + frontend)
- [ ] Commit y push exitosos

---

*Sistema SIMCO v4.3.0 - GAMILIT*
*Orden de Ejecucion v1.0.0*
