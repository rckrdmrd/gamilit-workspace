---
titulo: "TASK-VAL-008-F4-AUDIT-TABLES: Table-Entity mapping"
tipo: tarea
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# TASK-VAL-008-F4-AUDIT-TABLES: Table-Entity mapping

**US:** US-VAL-008 | **Tipo:** Audit | **Estado:** Pendiente | **SP:** 2

## Descripcion
Mapear las 173 tablas DB contra las 156 entity files (157 classes) TypeScript, explicar delta.

## Acciones
1. Query information_schema.tables — listar 173 tablas
2. grep -r "@Entity" en backend/src — listar entities
3. Crear mapping tabla↔entity
4. Identificar tablas sin entity (views, junction, audit)
5. Documentar delta con justificacion

## Criterio Pass
- Mapping completo
- Delta explicado (cada tabla sin entity tiene justificacion)
