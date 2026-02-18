# ENDPOINTS-INVENTORY-EQUIP

> Contrato API para equipamiento cosmético de tienda visual.

**Version:** 1.0.0  
**Fecha:** 2026-02-17  
**Modulo:** `gamification/inventory`  
**Auth:** JWT Bearer obligatorio.
**Seguridad de datos:** RLS activo sobre `user_purchases` y `user_equipped_items`.

---

## 1. Alcance

Este documento cubre los endpoints de:
- Consulta de items equipados.
- Equipar item cosmético.
- Quitar item equipado.

No cubre compra de items (`shop/purchase`) ni uso de consumibles.

---

## 2. Endpoints

### 2.1 GET `/gamification/inventory/equipped`

Obtiene todos los items cosméticos equipados por el usuario autenticado.

#### Respuesta 200 (ejemplo)

```json
[
  {
    "id": "f9f59f2c-5087-4a22-ae74-0dd59d6776f9",
    "user_id": "3b83f6d7-0f4c-4b9b-9a5f-d2ea8bc2f8d5",
    "category_id": "6fca03c0-bddd-4e9e-a4a8-a31f18f64ec5",
    "item_id": "80000001-0001-0000-0000-000000000001",
    "equipped_at": "2026-02-17T18:21:10.125Z",
    "item": {
      "id": "80000001-0001-0000-0000-000000000001",
      "name": "Aura Legendaria",
      "metadata": {
        "type": "profile_frame",
        "render_mode": "css",
        "css_class": "ring-4 ring-purple-500"
      }
    },
    "category": {
      "id": "6fca03c0-bddd-4e9e-a4a8-a31f18f64ec5",
      "name": "frame"
    }
  }
]
```

---

### 2.2 POST `/gamification/inventory/equip`

Equipa un item cosmético para la categoría del item.

#### Request body

```json
{
  "itemId": "80000001-0001-0000-0000-000000000001"
}
```

#### Validaciones de negocio

1. El item debe existir.
2. El item no puede ser consumible (`is_consumable = false`).
3. El usuario debe poseer el item (`user_purchases.status = completed`).
4. Debe existir solo un item equipado por categoría (replace/upsert).

#### Respuesta 200 (ejemplo)

```json
{
  "id": "f9f59f2c-5087-4a22-ae74-0dd59d6776f9",
  "user_id": "3b83f6d7-0f4c-4b9b-9a5f-d2ea8bc2f8d5",
  "category_id": "6fca03c0-bddd-4e9e-a4a8-a31f18f64ec5",
  "item_id": "80000001-0001-0000-0000-000000000001",
  "equipped_at": "2026-02-17T18:21:10.125Z"
}
```

#### Errores normativos

| HTTP | Condicion | Mensaje esperado |
|------|-----------|------------------|
| 400 | Item consumible | `Cannot equip consumable items. Use them from inventory.` |
| 403 | Item no comprado por el usuario | `You do not own this item` |
| 404 | Item no existe | `Item {itemId} not found` |

---

### 2.3 POST `/gamification/inventory/unequip`

Quita un item equipado por `itemId`.

#### Request body

```json
{
  "itemId": "80000001-0001-0000-0000-000000000001"
}
```

#### Respuesta 200

```json
{
  "statusCode": 200,
  "message": "OK"
}
```

#### Errores normativos

| HTTP | Condicion | Mensaje esperado |
|------|-----------|------------------|
| 404 | Item no estaba equipado | `Item not currently equipped` |

---

## 3. DTOs

### `EquipItemDto`

```json
{
  "itemId": "uuid"
}
```

Reglas:
- `itemId` obligatorio.
- `itemId` debe ser UUID valido.

---

## 4. Trazabilidad

### Backend
- `apps/backend/src/modules/gamification/controllers/inventory.controller.ts`
- `apps/backend/src/modules/gamification/services/inventory.service.ts`
- `apps/backend/src/modules/gamification/dto/inventory/equip-item.dto.ts`

### Datos
- `gamification_system.shop_items`
- `gamification_system.user_purchases`
- `gamification_system.user_equipped_items`

### Flujos
- `docs/30-ux-ui/flujos/student/FLUJO-EQUIPAMIENTO-ITEMS-COSMETICOS.md`
- `docs/30-ux-ui/flujos/TRACEABILITY-MATRIX.md`
