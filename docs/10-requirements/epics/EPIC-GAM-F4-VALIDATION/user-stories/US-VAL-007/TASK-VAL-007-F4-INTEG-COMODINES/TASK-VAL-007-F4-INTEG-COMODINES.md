# TASK-VAL-007-F4-INTEG-COMODINES: Comodines use + cooldown

**US:** US-VAL-007 | **Tipo:** Integration | **Estado:** Pendiente | **SP:** 1

## Descripcion
Verificar que comodines pueden usarse y el cooldown se enforcea.

## Acciones
1. GET /api/v1/comodines — listar comodines disponibles
2. POST /api/v1/comodines/use — usar comodin
3. Verificar efecto aplicado (ej: hint, skip, extra time)
4. POST /api/v1/comodines/use again → verificar cooldown error
5. Verificar usage tracked en DB

## Criterio Pass
- Usage tracked correctamente
- Cooldown enforced (segundo uso rechazado dentro del periodo)
