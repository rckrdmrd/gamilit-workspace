# TASK-VAL-007-F4-INTEG-LEADERBOARD: Leaderboard rankings

**US:** US-VAL-007 | **Tipo:** Integration | **Estado:** Pendiente | **SP:** 1

## Descripcion
Verificar que leaderboards muestran rankings correctos via materialized views.

## Acciones
1. Verificar materialized views existen en DB
2. REFRESH MATERIALIZED VIEW leaderboard_*
3. GET /api/v1/leaderboards — verificar rankings
4. Verificar orden por XP descendente
5. Verificar filtros por classroom/global

## Criterio Pass
- Materialized views funcionan
- Rankings correctos (orden por XP)
