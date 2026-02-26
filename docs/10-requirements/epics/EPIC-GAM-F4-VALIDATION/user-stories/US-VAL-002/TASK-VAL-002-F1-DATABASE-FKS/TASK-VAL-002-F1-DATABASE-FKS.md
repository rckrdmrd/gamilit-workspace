# TASK-VAL-002-F1-DATABASE-FKS: Validar FKs + constraints

**US:** US-VAL-002 | **Tipo:** Database | **Estado:** Pendiente | **SP:** 2

## Descripcion
Validar las 301 Foreign Keys y constraints no tienen referencias huerfanas.

## Acciones
1. Query information_schema.table_constraints para contar FKs
2. Verificar cada FK referencia tabla existente
3. Verificar integridad referencial con test data

## Criterio Pass
- 301 FKs presentes
- 0 referencias huerfanas
