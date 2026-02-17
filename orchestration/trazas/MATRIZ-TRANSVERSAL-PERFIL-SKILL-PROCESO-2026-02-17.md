# MATRIZ TRANSVERSAL PERFIL -> SKILL -> PROCESO -> TEMPLATE

**Fecha:** 2026-02-17  
**Propósito:** identificar coherencia, gaps y severidad para implementación iterativa.

---

## Matriz núcleo (perfiles transversales)

| Perfil | Skills base | Procesos obligatorios | Templates operativos | Estado |
|--------|-------------|------------------------|----------------------|--------|
| ORQUESTADOR | task-execution, safe-edit, apply-standard | TAREA, INICIALIZACION, DELEGACION, DELEGACION-PARALELA | delegación mínima/estándar/completa, contexto-subagente, session-tracking | Parcial |
| BACKEND-NESTJS | task-execution, safe-edit, apply-standard | TAREA, BACKEND, MODIFICAR, SUBAGENTE | delegación estándar/completa | Parcial |
| FRONTEND-REACT | task-execution, safe-edit, apply-standard, vercel-v0-dev | TAREA, FRONTEND, MODIFICAR | delegación estándar/completa | Parcial |
| DATABASE-POSTGRESQL | task-execution, safe-edit, apply-standard | TAREA, DDL, MODIFICAR | delegación estándar/completa | Parcial |
| INTEGRATION-VALIDATOR | task-execution, apply-standard | TAREA, VALIDAR, CONTEXT-MANAGEMENT | template validación + session-tracking | Parcial |
| DOCUMENTATION-MAINTAINER | task-execution, apply-standard | TAREA, DOCUMENTAR, CONTEXT-CLEANUP | plan/analisis/validacion + work-items | Parcial |

---

## Gaps por severidad

| ID | Tipo | Severidad | Gap | Acción |
|----|------|-----------|-----|--------|
| G-T1 | IoC | Alta | Contrato Claude Task tool no propagado a todos los procesos de delegación | Inyectar referencia en DELEGACION, DELEGACION-PARALELA, SUBAGENTE |
| G-T2 | Normalización | Alta | Skills sin contrato explícito de input/output en frontmatter | Estandarizar 5 `SKILL.md` + estándar global |
| G-T3 | SOLID documental | Media | Perfiles y mapas mezclan decisiones de asignación con operación de runtime | Añadir contrato transversal de perfiles y separación de responsabilidades |
| G-T4 | Trazabilidad | Media | Story -> Task CAPVED sin template operativo dedicado | Crear `TEMPLATE-STORY-TO-TASK.md` |
| G-T5 | Operación paralela | Media | Tracking paralelo definido pero sin guía de carpeta viva | Crear `orchestration/tracking/README.md` y enlazar template |
| G-T6 | Consistencia registry-resolver | Media | Resolver valida rutas, pero no valida contrato/versión de skill de forma mínima | Extender validaciones en resolvedor + mapa |

---

## Criterios de aceptación de la matriz

- [x] Relación explícita de perfil-skill-proceso-template.
- [x] Gaps etiquetados por severidad y tipo.
- [x] Acciones concretas para cerrar cada gap.
- [x] Base para ejecutar olas iterativas sin ambigüedad.

---

## Resultado del to-do `matriz-transversal`

**Estado:** COMPLETADO  
**Siguiente:** estandarización de perfiles, skills, procesos y templates.
