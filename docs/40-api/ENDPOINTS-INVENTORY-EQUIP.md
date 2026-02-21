# ENDPOINTS-INVENTORY-EQUIP

> Contrato API para equipamiento cosmético de tienda visual.

**Version:** 2.0.0
**Fecha:** 2026-02-21
**Modulo:** `gamification/inventory`
**Auth:** JWT Bearer obligatorio.
**Seguridad de datos:** RLS activo sobre `user_purchases` y `user_equipped_items`.

---

## 1. Alcance

Este documento cubre los endpoints de:
- Consulta de items equipados (individual y batch).
- Equipar item cosmético.
- Quitar item equipado.

No cubre compra de items (`shop/purchase`) ni uso de consumibles.

---

## 2. Endpoints

### 2.1 GET `/gamification/inventory/equipped`

Obtiene todos los items cosméticos equipados por el usuario autenticado.

> **Nota:** El campo `item.metadata` en las respuestas se enriquece en tiempo de ejecucion
> mediante `mergeVisualConfig()`, que copia claves visuales (`type`, `asset_url`, `border_color`,
> `display_text`, `color`, `animated`, `animation`, `glow_color`, etc.) desde `item.effect_data`
> hacia `item.metadata`. Los consumidores frontend deben leer exclusivamente de `metadata`
> para rendering visual.

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
        "asset_url": "/assets/frames/hieroglyphic.svg",
        "border_color": "#CD853F",
        "fallback": {
          "render_mode": "css",
          "css_class": "ring-2 ring-slate-400"
        }
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
  "item_id": "80000001-0001-0000-0000-000000000001"
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

Quita un item equipado por `item_id`.

#### Request body

```json
{
  "item_id": "80000001-0001-0000-0000-000000000001"
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

### 2.4 GET `/gamification/inventory/equipped/batch`

Obtiene items equipados para multiples usuarios en una sola consulta. Usado por leaderboards, listas de amigos, etc. para evitar N+1 queries.

#### Query params

| Param | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `userIds` | string | Si | IDs de usuarios separados por coma (max 50) |

#### Ejemplo

```
GET /gamification/inventory/equipped/batch?userIds=id1,id2,id3
```

#### Respuesta 200 (ejemplo)

```json
{
  "3b83f6d7-0f4c-4b9b-9a5f-d2ea8bc2f8d5": {
    "frame": {
      "itemId": "80000001-0001-0000-0000-000000000001",
      "name": "Marco Jeroglifico",
      "assetUrl": "/assets/frames/hieroglyphic.svg",
      "type": "profile_frame",
      "data": {
        "type": "profile_frame",
        "asset_url": "/assets/frames/hieroglyphic.svg",
        "border_color": "#CD853F"
      }
    }
  }
}
```

> Si `userIds` esta vacio o no se envia, retorna `{}`.

---

## 3. DTOs

### `EquipItemDto`

```json
{
  "item_id": "uuid"
}
```

Reglas:
- `item_id` obligatorio.
- `item_id` debe ser UUID valido (`@IsUUID()`).

---

## 4. Trazabilidad

### Backend
- `apps/backend/src/modules/gamification/controllers/inventory.controller.ts`
- `apps/backend/src/modules/gamification/services/inventory.service.ts`
- `apps/backend/src/modules/gamification/dto/inventory/equip-item.dto.ts`
- `apps/backend/src/modules/gamification/utils/visual-config.util.ts`

### Frontend
- `apps/frontend/src/features/gamification/social/api/inventory.api.ts`
- `apps/frontend/src/features/gamification/social/types/inventory.types.ts`

### Datos
- `gamification_system.shop_items`
- `gamification_system.user_purchases`
- `gamification_system.user_equipped_items`

### Flujos
- `docs/30-ux-ui/flujos/student/FLUJO-EQUIPAMIENTO-ITEMS-COSMETICOS.md`
- `docs/30-ux-ui/flujos/student/FLUJO-COMPRA-INVENTARIO-EQUIPAR.md`
- `docs/30-ux-ui/flujos/TRACEABILITY-MATRIX.md`
