# TASK-VAL-007-F4-INTEG-SHOP: Shop purchase + inventory

**US:** US-VAL-007 | **Tipo:** Integration | **Estado:** Pendiente | **SP:** 2

## Descripcion
Verificar que shop items pueden comprarse y aparecen en inventario del usuario.

## Acciones
1. GET /api/v1/shop — listar items disponibles
2. POST /api/v1/shop/purchase — comprar item
3. Verificar coins deducidos del balance
4. GET /api/v1/inventory — verificar item en inventario
5. Verificar transaction record en DB

## Criterio Pass
- Purchase exitosa
- Coins deducidos
- Item en inventario
