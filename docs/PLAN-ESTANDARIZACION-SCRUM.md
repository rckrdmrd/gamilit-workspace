# PLAN DE ESTANDARIZACIÓN SCRUM - Proyecto GAMILIT

**Fecha de Análisis:** 2026-01-04
**Estándar de Referencia:** `/home/isem/orchestration-temp/Estandar-SCRUM.md`
**Versión:** 1.0
**Estado:** 📋 PLANIFICADO

---

## 1. RESUMEN EJECUTIVO

Este documento presenta el plan de estandarización de la documentación del proyecto GAMILIT para alinearla con el estándar SCRUM definido en `Estandar-SCRUM.md`.

### Métricas Actuales

| Métrica | Valor |
|---------|-------|
| Total archivos MD | 1,396 |
| Archivos con prefijo estándar | 199 (33%) |
| Archivos sin prefijo estándar | 279 (46%) |
| Archivos especiales (_MAP, README) | 129 (21%) |
| User Stories (US-*) | 113 |
| Requerimientos Funcionales (RF-*) | 18 |
| Especificaciones Técnicas (ET-*) | 22 |
| ADRs (ADR-*) | 21 |
| Duplicados identificados | 22+ |

### Cumplimiento Global con Estándar SCRUM

| Categoría | Cumplimiento |
|-----------|--------------|
| YAML Front-Matter | 0% |
| Nomenclatura | 45% |
| Estructura carpetas | 70% |
| Tablero Kanban | 0% |
| Gestión de Bugs | 70% |
| Trazabilidad | 90% |
| **PROMEDIO GENERAL** | **46%** |

---

## 2. BRECHAS IDENTIFICADAS

### 2.1 Brechas Críticas (P0)

| ID | Brecha | Impacto | Solución Propuesta |
|----|--------|---------|-------------------|
| GAP-01 | Sin YAML front-matter | Automatización imposible | Agregar front-matter a todos los US/RF/ET |
| GAP-02 | Sin tablero Kanban | Visibilidad nula de sprint | Crear Board.md dinámico |
| GAP-03 | Sin AGENTS.md | Agentes sin directrices | Crear guía de agentes |
| GAP-04 | Tareas embebidas en US | Trazabilidad limitada | Extraer a archivos TASK-*.md |

### 2.2 Brechas Altas (P1)

| ID | Brecha | Impacto | Solución Propuesta |
|----|--------|---------|-------------------|
| GAP-05 | Nomenclatura EAI vs EPIC | Inconsistencia con estándar | Mapear EAI→EPIC (opcional) |
| GAP-06 | Duplicado US-GAM-002 | Conflicto de IDs | Renumerar uno de los archivos |
| GAP-07 | Sin config.yml | Configuración dispersa | Crear archivo centralizado |
| GAP-08 | 279 archivos sin categoría | Archivos huérfanos | Asignar prefijos apropiados |

### 2.3 Brechas Medias (P2)

| ID | Brecha | Impacto | Solución Propuesta |
|----|--------|---------|-------------------|
| GAP-09 | Formato bugs BUG-FIX-* | Inconsistencia | Estandarizar a BUG-XXX |
| GAP-10 | ADRs con saltos (004-006) | Secuencia incompleta | Documentar motivo o llenar |
| GAP-11 | Sin labels/tags | Categorización limitada | Agregar campo labels en YAML |
| GAP-12 | Sin campo assignee | Responsables no asignados | Agregar assignee en YAML |

---

## 3. PLAN DE ACCIÓN POR FASES

### FASE A: Infraestructura Documental (Prioridad Alta)

#### A.1 Crear AGENTS.md
**Archivo:** `/home/isem/workspace-v1/projects/gamilit/AGENTS.md`

**Contenido propuesto:**
```markdown
# Guía para Agentes de IA - GAMILIT

## Convenciones de Documentación
- Ubicación de tareas: `/docs/[FASE]/[EPIC]/tareas/`
- Ubicación de bugs: `/orchestration/trazas/TRAZA-BUGS.md`
- Tablero Kanban: `/docs/planning/Board.md`

## Cómo Tomar una Tarea
1. Leer archivo TASK-*.md correspondiente
2. Cambiar `status: "To Do"` a `status: "In Progress"`
3. Agregar `assignee: "@NombreAgente"`
4. Commit con mensaje "Start TASK-XXX"

## Cómo Completar una Tarea
1. Verificar criterios de aceptación cumplidos
2. Cambiar `status: "In Progress"` a `status: "Done"`
3. Agregar notas de implementación
4. Commit con mensaje "Fixes TASK-XXX"

## Cómo Reportar un Bug
1. Crear entrada en TRAZA-BUGS.md
2. Seguir formato estándar (ver plantilla)
3. Asignar severidad (P0-P3)
```

**Esfuerzo estimado:** 2 horas
**Dependencias:** Ninguna

---

#### A.2 Crear Board.md (Tablero Kanban)
**Archivo:** `/home/isem/workspace-v1/projects/gamilit/docs/planning/Board.md`

**Contenido propuesto:**
```markdown
# Tablero Kanban - Sprint Actual

**Sprint:** Sprint 9 (Fase 3)
**Última actualización:** YYYY-MM-DD

---

## 📋 Por Hacer (To Do)

| ID | Título | Asignado | SP |
|----|--------|----------|-----|
| TASK-XXX | Descripción | @agente | 5 |

---

## ⏳ En Progreso (In Progress)

| ID | Título | Asignado | SP | Inicio |
|----|--------|----------|-----|--------|
| TASK-YYY | Descripción | @agente | 3 | 2026-01-04 |

---

## ✅ Hecho (Done)

| ID | Título | Completado por | SP | Fin |
|----|--------|----------------|-----|-----|
| TASK-ZZZ | Descripción | @agente | 8 | 2026-01-03 |

---

## Métricas del Sprint

- **Velocity objetivo:** 40 SP
- **Velocity actual:** 15 SP
- **Progreso:** 37.5%
```

**Esfuerzo estimado:** 3 horas
**Dependencias:** Ninguna

---

#### A.3 Crear config.yml
**Archivo:** `/home/isem/workspace-v1/projects/gamilit/docs/planning/config.yml`

**Contenido propuesto:**
```yaml
# Configuración del Sistema de Planificación GAMILIT
version: "1.0"
project: "GAMILIT"

# Estados válidos para tareas
task_states:
  - "To Do"
  - "In Progress"
  - "Done"
  - "Blocked"

# Prioridades
priorities:
  - name: "P0"
    description: "Crítico - Bloqueante"
  - name: "P1"
    description: "Alto - Afecta entrega"
  - name: "P2"
    description: "Medio - Puede esperar"
  - name: "P3"
    description: "Bajo - Nice-to-have"

# Prefijos de nomenclatura
naming_prefixes:
  epic: "EAI"      # Mantenemos EAI por compatibilidad
  feature: "FEAT"
  user_story: "US"
  task: "TASK"
  bug: "BUG"
  requirement: "RF"
  specification: "ET"
  adr: "ADR"

# Configuración de sprints
sprint:
  duration_days: 10
  velocity_target: 40
  current_sprint: 9

# Agentes disponibles
agents:
  - "@Backend-Agent"
  - "@Frontend-Agent"
  - "@Database-Agent"
  - "@Integration-Agent"
  - "@Testing-Agent"
```

**Esfuerzo estimado:** 1 hora
**Dependencias:** Ninguna

---

### FASE B: Estandarización de Formato (Prioridad Alta)

#### B.1 Plantilla YAML Front-Matter para User Stories
**Aplicar a:** 113 archivos US-*.md

**Formato objetivo:**
```yaml
---
id: "US-FUND-001"
title: "Autenticación básica con JWT"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent"
epic: "EAI-001"
story_points: 8
budget: "$2,900 MXN"
sprint: "Sprint-1"
labels: ["autenticación", "jwt", "seguridad"]
created_date: "2025-11-02"
updated_date: "2025-11-02"
---
```

**Script de migración:** Automatizar extracción de metadatos actuales

**Esfuerzo estimado:** 8 horas (script) + 4 horas (revisión manual)
**Dependencias:** config.yml

---

#### B.2 Plantilla YAML Front-Matter para Tareas
**Crear carpeta:** `/docs/planning/tasks/`

**Formato objetivo:**
```yaml
---
id: "TASK-001"
title: "Implementar endpoint POST /auth/register"
type: "Task"
status: "Done"
priority: "P1"
assignee: "@Backend-Agent"
parent_us: "US-FUND-001"
epic: "EAI-001"
estimated_hours: 4
actual_hours: 4.5
created_date: "2025-11-02"
completed_date: "2025-11-02"
---
```

**Esfuerzo estimado:** 16 horas (extraer tareas de US existentes)
**Dependencias:** B.1 completado

---

#### B.3 Plantilla YAML Front-Matter para Bugs
**Aplicar a:** TRAZA-BUGS.md → archivos individuales

**Formato objetivo:**
```yaml
---
id: "BUG-001"
title: "Ejercicio Crucigrama no funcional"
type: "Bug"
status: "Done"
severity: "P0"
priority: "Crítica"
assignee: "@Database-Agent"
affected_module: "Database"
steps_to_reproduce:
  - "Crear ejercicio tipo crucigrama"
  - "Intentar resolver"
expected_behavior: "Crucigrama muestra pistas correctas"
actual_behavior: "Formato solution incorrecto"
root_cause: "Campo solution con formato JSON inválido"
fix_commit: "abc123"
created_date: "2025-11-19"
resolved_date: "2025-11-19"
---
```

**Esfuerzo estimado:** 4 horas
**Dependencias:** Ninguna

---

### FASE C: Resolución de Conflictos (Prioridad Media)

#### C.1 Resolver Duplicado US-GAM-002
**Archivos afectados:**
- `US-GAM-002-sistema-amigos.md`
- `US-GAM-002-sistema-experiencia-xp.md`

**Solución:** Renumerar segundo archivo a US-GAM-010 (o siguiente disponible)

**Esfuerzo estimado:** 1 hora
**Dependencias:** Ninguna

---

#### C.2 Resolver Saltos en ADRs
**Archivos afectados:** ADR-004, ADR-005, ADR-006 (faltantes)

**Soluciones posibles:**
1. Documentar que fueron eliminados intencionalmente
2. Crear ADRs placeholder con estado "Deprecated"

**Esfuerzo estimado:** 2 horas
**Dependencias:** Ninguna

---

#### C.3 Categorizar Archivos Huérfanos
**Archivos afectados:** 279 archivos sin prefijo

**Estrategia:**
1. Agrupar por tipo (guías, reportes, especificaciones)
2. Asignar prefijos según tipo
3. Mover a carpetas apropiadas

**Esfuerzo estimado:** 16 horas
**Dependencias:** config.yml (para prefijos válidos)

---

### FASE D: Mejoras de Trazabilidad (Prioridad Baja)

#### D.1 Agregar Campo Labels
**Aplicar a:** Todos los archivos con front-matter

**Formato:**
```yaml
labels: ["módulo", "funcionalidad", "tipo"]
```

**Esfuerzo estimado:** 8 horas
**Dependencias:** B.1, B.2, B.3

---

#### D.2 Agregar Campo Assignee
**Aplicar a:** Tareas y bugs activos

**Formato:**
```yaml
assignee: "@NombreAgente"
```

**Esfuerzo estimado:** 4 horas
**Dependencias:** AGENTS.md

---

## 4. CRONOGRAMA PROPUESTO

| Fase | Descripción | Esfuerzo | Prioridad |
|------|-------------|----------|-----------|
| **A** | Infraestructura Documental | 6 horas | Alta |
| **B** | Estandarización de Formato | 32 horas | Alta |
| **C** | Resolución de Conflictos | 19 horas | Media |
| **D** | Mejoras de Trazabilidad | 12 horas | Baja |
| **TOTAL** | | **69 horas** | |

---

## 5. RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Scripts rompen formato existente | Media | Alto | Respaldo completo antes de migración |
| Conflictos de merge en docs | Alta | Medio | Migrar en rama separada |
| Agentes no adoptan nuevo formato | Media | Alto | Capacitación en AGENTS.md |
| Tiempo subestimado | Alta | Medio | Priorizar tareas críticas primero |

---

## 6. CRITERIOS DE ÉXITO

| Criterio | Métrica Objetivo |
|----------|------------------|
| Archivos con YAML front-matter | 100% de US/RF/ET/TASK/BUG |
| Tablero Kanban actualizado | Board.md existe y se actualiza |
| Sin duplicados de ID | 0 duplicados |
| Archivos categorizados | &gt;90% con prefijo válido |
| AGENTS.md documentado | Archivo existe y es completo |

---

## 7. ARCHIVOS A CREAR

| Archivo | Ubicación | Prioridad |
|---------|-----------|-----------|
| AGENTS.md | `/projects/gamilit/AGENTS.md` | Alta |
| Board.md | `/projects/gamilit/docs/planning/Board.md` | Alta |
| config.yml | `/projects/gamilit/docs/planning/config.yml` | Alta |
| BACKLOG.md | `/projects/gamilit/docs/planning/BACKLOG.md` | Media |

---

## 8. ARCHIVOS A MODIFICAR

| Tipo | Cantidad | Cambio Requerido |
|------|----------|------------------|
| US-*.md | 113 | Agregar YAML front-matter |
| RF-*.md | 18 | Agregar YAML front-matter |
| ET-*.md | 22 | Agregar YAML front-matter |
| ADR-*.md | 21 | Verificar secuencia |
| Archivos huérfanos | 279 | Categorizar con prefijos |
| Duplicados | 22+ | Renumerar o consolidar |

---

## 9. PRÓXIMOS PASOS

1. ✅ Análisis inicial completado
2. ✅ Plan de mejoras creado
3. ⏳ **Validación de plan** (FASE 4)
4. 📋 Refinamiento del plan (FASE 5)
5. 📋 Ejecución del plan (FASE 6)
6. 📋 Validación de ejecución (FASE 7)

---

**Creado:** 2026-01-04
**Autor:** Claude Code - Análisis de Documentación
**Versión:** 1.0
