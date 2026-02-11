# TASK-VAL-008-F4-AUDIT-COLUMNS: Column-Field alignment

**US:** US-VAL-008 | **Tipo:** Audit | **Estado:** Pendiente | **SP:** 2

## Descripcion
Verificar alineacion de tipos entre columnas DB y campos entity TypeScript.

## Acciones
1. Para cada entity: comparar columnas DDL vs campos @Column()
2. Verificar tipos: varchar↔string, integer↔number, boolean↔boolean, etc.
3. Identificar mismatches
4. Documentar discrepancias

## Criterio Pass
- 0 type mismatches
- Todos los campos alineados
