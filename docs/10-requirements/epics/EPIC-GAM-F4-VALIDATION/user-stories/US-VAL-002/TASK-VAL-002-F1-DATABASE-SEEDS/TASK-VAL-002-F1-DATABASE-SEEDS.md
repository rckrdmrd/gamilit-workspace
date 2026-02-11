# TASK-VAL-002-F1-DATABASE-SEEDS: Integridad seed data

**US:** US-VAL-002 | **Tipo:** Database | **Estado:** Pendiente | **SP:** 2

## Descripcion
Verificar integridad de datos seed: conteos, referencias, no orphan records.

## Acciones
1. Contar registros por tabla principal (roles, permisos, ranks, achievements, ejercicios)
2. Verificar FKs en seed data (no orphan records)
3. Verificar unicidad de constraints (no duplicados)

## Criterio Pass
- 0 orphan records
- Conteos coinciden con seeds esperados
