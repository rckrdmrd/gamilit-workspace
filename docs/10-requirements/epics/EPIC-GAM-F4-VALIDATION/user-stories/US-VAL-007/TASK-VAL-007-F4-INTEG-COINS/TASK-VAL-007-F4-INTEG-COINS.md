# TASK-VAL-007-F4-INTEG-COINS: ML Coins lifecycle

**US:** US-VAL-007 | **Tipo:** Integration | **Estado:** Pendiente | **SP:** 2

## Descripcion
Verificar ciclo completo de ML Coins: earn, balance check, spend.

## Acciones
1. Submit ejercicio → verificar coins earned
2. GET balance → verificar monto correcto
3. POST shop purchase → verificar coins deducidos
4. Query transactions log → verificar historial

## Criterio Pass
- Earn registra coins correctamente
- Balance actualizado
- Spend deduce y registra transaccion
- Transaction log completo
