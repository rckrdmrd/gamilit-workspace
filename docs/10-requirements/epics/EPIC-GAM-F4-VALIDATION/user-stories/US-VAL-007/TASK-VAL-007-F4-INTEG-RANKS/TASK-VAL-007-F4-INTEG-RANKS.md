# TASK-VAL-007-F4-INTEG-RANKS: Maya rank progression

**US:** US-VAL-007 | **Tipo:** Integration | **Estado:** Pendiente | **SP:** 2

## Descripcion
Verificar que el sistema de rangos Maya progresa correctamente al alcanzar thresholds de XP.

## Acciones
1. Verificar rank inicial: Ajaw (XP 0)
2. Acumular XP hasta threshold de K'inich
3. Verificar trigger de promocion dispara
4. Verificar nuevo rank asignado en DB
5. Verificar notificacion de rank-up (si existe)

## Criterio Pass
- Trigger promotion dispara al threshold
- Rank actualizado en DB
- Progresion Ajaw → K'inich verificada
