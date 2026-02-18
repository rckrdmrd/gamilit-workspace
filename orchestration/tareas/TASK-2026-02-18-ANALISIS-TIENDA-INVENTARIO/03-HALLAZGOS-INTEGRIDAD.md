# Track C: Hallazgos — Integridad de Datos y Flujo E2E

**Fecha:** 2026-02-18 | **Estado:** Completo

---

## Resumen Ejecutivo

La integridad del sistema tienda/inventario/equipamiento es **solida en backend** (transacciones atomicas, FK correctas, unique constraints, UPSERT seguro) pero tiene **2 issues criticos en DDL**: RLS faltante en `user_purchases` y funcion `get_user_inventory_summary()` rota por referencias a tablas inexistentes.

---

## 1. RLS Policies — user_purchases: FALTANTE

### Estado Actual
| Tabla | RLS Habilitado | Policies | Ubicacion |
|-------|---------------|----------|-----------|
| `user_purchases` | NO | 0 | No existe en ningun archivo |
| `user_equipped_items` | SI (07d) | 2 (admin_all + user_own) | 07d lineas 651-675 |
| `comodines_inventory` | SI | Policies en 05-inventory-missions-policies.sql | Schema RLS |

### Impacto
- **CRITICO:** Sin RLS, cualquier usuario autenticado puede SELECT/UPDATE/INSERT registros de compra de OTROS usuarios
- Nota: Actualmente `gamilit_user` tiene BYPASSRLS=true (revertido 2026-02-17), asi que el impacto real es bajo en dev, pero es obligatorio para produccion

### Policies Necesarias
```sql
ALTER TABLE gamification_system.user_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_purchases_user_select
    ON gamification_system.user_purchases FOR SELECT
    USING (user_id = gamilit.get_current_user_id());

CREATE POLICY user_purchases_admin_all
    ON gamification_system.user_purchases FOR ALL
    USING (gamilit.is_admin() OR gamilit.is_super_admin());

CREATE POLICY user_purchases_system_insert
    ON gamification_system.user_purchases FOR INSERT
    WITH CHECK (true);

ALTER TABLE gamification_system.user_purchases FORCE ROW LEVEL SECURITY;
```

---

## 2. Funcion get_user_inventory_summary(): ROTA

### Problema
La funcion referencia tablas/columnas que NO existen en el schema actual:

| Referencia en Funcion | Tabla/Columna Real |
|-----------------------|-------------------|
| `gamification_system.user_inventory` | `gamification_system.user_purchases` |
| `gamification_system.store_items` | `gamification_system.shop_items` |
| `si.price_ml_coins` | `si.price` (integer) |
| `si.item_type` | `si.category` (enum) o `si.is_consumable` (bool) |
| `ui.acquired_at` | `purchased_at` (timestamp) |

### Impacto
- Cualquier llamada a `get_user_inventory_summary()` falla con ERROR
- La funcion existe en DDL pero es inutilizable

### Solucion
Reescribir la funcion completa usando nombres correctos de tablas y columnas.

---

## 3. Atomicidad del Flujo de Compra: CORRECTA

**ShopService.purchaseItem()** usa `manager.transaction()`:
```
Dentro de una sola transaccion:
1. Validar item existe y disponible
2. Verificar stock
3. Verificar max_per_user
4. Validar requisitos
5. Verificar balance ML Coins
6. Crear MLCoinsTransaction (deduccion)
7. Actualizar UserStats.ml_coins
8. Crear UserPurchase record
9. Reducir stock del item
→ Commit atomico o rollback total
```

**Garantia:** No hay compras parciales. Si falla cualquier paso, se revierte todo.

---

## 4. Registro de Entidades en Datasource

### UserEquippedItem
- **Registrada en:** `gamification.module.ts` (TypeOrmModule.forFeature con 'gamification' datasource)
- **Registrada en:** `app.module.ts` via glob `__dirname + '/modules/gamification/entities/**/*.entity{.ts,.js}'`
- **Cross-datasource:** Profile y Tenant importados explicitamente en datasource 'gamification'

**Estado:** CORRECTO

---

## 5. Foreign Keys

### user_purchases
| FK | Referencia | On Delete | Estado |
|----|-----------|-----------|--------|
| user_id | auth_management.profiles(id) | CASCADE | CORRECTO |
| item_id | gamification_system.shop_items(id) | SET NULL | CORRECTO (preserva historial) |
| transaction_id | gamification_system.ml_coins_transactions(id) | N/A | CORRECTO |

### user_equipped_items
| FK | Referencia | On Delete | Estado |
|----|-----------|-----------|--------|
| user_id | auth_management.profiles(id) | CASCADE | CORRECTO |
| category_id | gamification_system.shop_categories(id) | CASCADE | CORRECTO |
| item_id | gamification_system.shop_items(id) | CASCADE | CORRECTO |

**Estado:** TODAS las FK son correctas, con cascades apropiados.

---

## 6. Unique Constraints

### user_purchases
```sql
CREATE UNIQUE INDEX idx_user_purchases_unique_item
  ON gamification_system.user_purchases(user_id, item_id)
  WHERE status = 'completed' AND is_active = true;
```
- Partial unique index: previene duplicados de items activos completados
- Permite refunds/expirations donde status != 'completed'

### user_equipped_items
```sql
CREATE UNIQUE INDEX idx_user_equipped_unique_category
  ON gamification_system.user_equipped_items(user_id, category_id);
```
- Enforce: un item por categoria por usuario
- ORM tambien lo enforce via `@Unique(['user_id', 'category_id'])`

**Estado:** CORRECTO — ambos constraints funcionan y ORM los respeta.

---

## 7. Indices

### user_purchases (7 indices)
| Index | Columnas | Tipo | Uso |
|-------|----------|------|-----|
| idx_user_purchases_user | user_id | B-tree | Lookup por usuario |
| idx_user_purchases_item | item_id | B-tree | Lookup por item |
| idx_user_purchases_status | status | B-tree | Filtro por estado |
| idx_user_purchases_active | is_active (partial WHERE true) | B-tree | Items activos |
| idx_user_purchases_user_item | (user_id, item_id) | B-tree | Verificacion ownership en equipItem() |
| idx_user_purchases_date | purchased_at DESC | B-tree | Lista recientes |
| idx_user_purchases_tenant | tenant_id | B-tree | Multi-tenancy |

### user_equipped_items (2 + unique)
| Index | Columnas | Tipo | Uso |
|-------|----------|------|-----|
| idx_user_equipped_user | user_id | B-tree | getEquippedItems() |
| idx_user_equipped_category | category_id | B-tree | Lookup por categoria |
| idx_user_equipped_unique_category | (user_id, category_id) UNIQUE | B-tree | Constraint + lookup |

**Estado:** ADECUADO — sin indices faltantes para los queries actuales.

---

## 8. Triggers

- `trg_shop_items_updated_at` en shop_items — actualiza updated_at (correcto)
- **user_purchases:** Sin triggers (correcto — historial inmutable)
- **user_equipped_items:** Sin triggers (correcto — equipped_at solo al insert)

---

## 9. Seed Data

### Seed 18 (user_purchases-demo.sql)
- Lookup dinamico de profile (no UUIDs hardcoded)
- Fallback a primer estudiante si demo no existe
- ON CONFLICT para idempotencia

### Seed 19 (user_equipped_items-demo.sql)
- Valida que shop_items existan antes de insertar
- UPSERT via ON CONFLICT (user_id, category_id)
- Metadata incluida en insert

**Estado:** ROBUSTO — seeds son re-ejecutables sin errores.

---

## 10. UPSERT en InventoryService

```typescript
// Transaccion atomica:
// 1. Busca existing por (user_id, category_id)
// 2. Si existe → UPDATE item_id, equipped_at
// 3. Si no → INSERT nuevo
// + Unique constraint como safety net contra race conditions
```

**Estado:** SEGURO — transaction + unique constraint cubren concurrencia.

---

## 11. 07d-rls-policies-pending-tables.sql

- **user_equipped_items:** SI incluido (lineas 651-675), con admin_all + user_own policies
- **user_purchases:** NO incluido — FALTA COMPLETAMENTE

---

## 12. Multi-Tenancy

- `user_purchases.tenant_id` existe e indexado, pero NO enforced en RLS
- `user_equipped_items` NO tiene tenant_id — asume aislamiento via user_id
- **Riesgo bajo** si tenant isolation se maneja a nivel de user_id→tenant mapping

---

## Tabla Resumen

| Aspecto | Estado | Riesgo |
|---------|--------|--------|
| RLS user_purchases | FALTANTE | **CRITICO** |
| RLS user_equipped_items | OK (07d) | Bajo |
| get_user_inventory_summary() | ROTA | **CRITICO** |
| Atomicidad de compra | OK | Bajo |
| Entidades en datasource | OK | Bajo |
| Foreign Keys | OK | Bajo |
| Unique Constraints | OK | Bajo |
| Indices | Adecuados | Bajo |
| Triggers | Minimos/correctos | Bajo |
| Seeds | Robustos | Bajo |
| UPSERT logic | Seguro | Bajo |

---

## Recomendaciones

### P0 — Critico
1. **Crear RLS policies para user_purchases** — agregar a 07d o crear archivo dedicado
2. **Reescribir get_user_inventory_summary()** con nombres correctos de tablas/columnas

### P1 — Importante
3. **Agregar tenant_id enforcement** en RLS de user_purchases (si multi-tenant activo)

### P2 — Mejora
4. **Crear funcion get_user_purchases()** wrapper simplificada como alternativa
