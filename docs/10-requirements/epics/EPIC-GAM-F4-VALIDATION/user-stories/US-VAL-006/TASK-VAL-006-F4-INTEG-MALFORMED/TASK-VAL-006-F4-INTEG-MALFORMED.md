# TASK-VAL-006-F4-INTEG-MALFORMED: Malformed submission rejections

**US:** US-VAL-006 | **Tipo:** Integration | **Estado:** Pendiente | **SP:** 2

## Descripcion
Verificar que submissions malformados son rechazados con errores de validacion claros.

## Acciones
1. POST submission sin exercise_id → 400
2. POST submission con tipo incorrecto → 400
3. POST submission con respuesta vacia → 400
4. POST submission a ejercicio inexistente → 404
5. Verificar mensajes de error claros y descriptivos

## Criterio Pass
- Todos los casos malformados rechazados
- Validation errors claros y descriptivos
