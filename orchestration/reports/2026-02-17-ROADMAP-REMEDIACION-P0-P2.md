# Roadmap de Remediación P0/P1/P2

**Fecha:** 2026-02-17  
**Estado:** completado  
**Fuente:** baseline + auditoría normativa + auditoría técnica

## Criterios de priorización

- **Impacto en negocio/operación**
- **Riesgo técnico y de seguridad**
- **Esfuerzo de implementación**
- **Dependencias cross-layer**
- **Valor de trazabilidad y gobernanza**

## Oleada P0 (bloqueante)

### Objetivo
Eliminar brechas críticas que impiden cumplimiento confiable.

### Iniciativas
1. **Trazabilidad maestra operativa**
   - Crear `orchestration/trazabilidad/TRACEABILITY-MASTER.yml`.
2. **Validación técnica/documental automatizada inicial**
   - Crear script de validación de referencias y cobertura mínima.
3. **Checklists de gate obligatorios**
   - Definir checklists pre/post-ejecución y validación integral.

### Criterio de salida P0
- Existe control mínimo verificable para `task -> código -> documentación -> validación`.

## Oleada P1 (alta prioridad)

### Objetivo
Estandarizar la ejecución y evidencia de cambios por task.

### Iniciativas
1. **Plantilla de task con trazabilidad completa**
   - Crear template en `docs/10-requirements/epics/`.
2. **Plan operativo por fases y RACI**
   - Definir responsables por dominio y gate.
3. **Sincronización controlada de work-items vs docs**
   - Script base de detección de desalineaciones.

### Criterio de salida P1
- Toda tarea nueva puede ejecutarse con formato, gates y evidencia homogénea.

## Oleada P2 (mejora continua)

### Objetivo
Aumentar madurez de control, seguimiento y auditoría recurrente.

### Iniciativas
1. **Dashboard/reportes periódicos de trazabilidad**
2. **Auditoría periódica de cumplimiento (semanal/quincenal)**
3. **Refinamiento de perfiles/skills/checklists según lecciones aprendidas**

### Criterio de salida P2
- Sistema de mejora continua institucionalizado con métricas de cumplimiento.

## Matriz resumida de backlog de remediación

| ID | Prioridad | Iniciativa | Dominio | Dependencia |
|---|---|---|---|---|
| RM-001 | P0 | Trazabilidad maestra | Orchestration | Ninguna |
| RM-002 | P0 | Script validación trazabilidad | Orchestration/Docs | RM-001 |
| RM-003 | P0 | Checklists de gates | Orchestration | Ninguna |
| RM-004 | P1 | Template task trazabilidad | Docs/Orchestration | RM-003 |
| RM-005 | P1 | Plan operativo + RACI | Orchestration | RM-003 |
| RM-006 | P1 | Script sync work-items/docs | Orchestration | RM-004 |
| RM-007 | P2 | Reportes periódicos | Orchestration | RM-002 |
| RM-008 | P2 | Auditoría recurrente | Orchestration | RM-005 |
| RM-009 | P2 | Ajuste de perfiles/skills | Orchestration | RM-008 |

## Resultado de Fase 3

- Brechas clasificadas por criticidad.
- Roadmap P0/P1/P2 definido con dependencias.
- Base lista para diseño operativo y ejecución general.
