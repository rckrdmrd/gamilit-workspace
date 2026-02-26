# TASK-VAL-002-F1-DATABASE-RLS: Validar RLS policies

**US:** US-VAL-002 | **Tipo:** Database | **Estado:** Pendiente | **SP:** 3

## Descripcion
Validar que las 251 RLS policies estan activas y enforcement funciona.

## Acciones
1. Query pg_policies para contar policies activas
2. Verificar RLS enabled en tablas con policies
3. Test con SET ROLE: verificar que usuario X no ve datos de tenant Y

## Criterio Pass
- 251 RLS policies activas
- Enforcement funciona (aislamiento por tenant)
