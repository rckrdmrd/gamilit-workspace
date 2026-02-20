# SEEDS-TIENDA-VISUAL

> Definición de seeds reproducibles para variantes visuales, ownership y equipamiento por usuario.

**Version:** 1.0.0  
**Fecha:** 2026-02-17  
**Ambientes:** `prod`, `dev`, `staging`

---

## 1. Objetivo

Garantizar datos semilla para validar de forma reproducible el flujo:
- compra de item,
- disponibilidad en inventario del usuario,
- aplicación/equipamiento del item.

---

## 2. Seeds agregados por ambiente

### Producción
- `apps/database/seeds/prod/gamification_system/17-shop_items_metadata_normalization.sql`

> **Nota (2026-02-20):** Seeds demo `17-user_purchases-demo.sql` y `18-user_equipped_items-demo.sql` fueron **eliminados de prod/** (SEED-HOMOLOGATION B4/B5). Solo existen en dev/ con scope `dev|demo_gamification`.

### Desarrollo
- `apps/database/seeds/dev/gamification_system/17-shop_items_metadata_normalization.sql`
- `apps/database/seeds/dev/gamification_system/18-user_purchases-demo.sql`
- `apps/database/seeds/dev/gamification_system/19-user_equipped_items-demo.sql`

### Staging
- `apps/database/seeds/staging/gamification_system/15-shop_items_metadata_normalization.sql`
- `apps/database/seeds/staging/gamification_system/16-user_purchases-demo.sql`
- `apps/database/seeds/staging/gamification_system/17-user_equipped_items-demo.sql`

---

## 3. Regla `effect_data` vs `metadata`

- `effect_data`: comportamiento funcional de negocio.
- `metadata`: definición visual canónica consumida por frontend.

La normalización en seed mueve/duplica claves visuales legacy de `effect_data` hacia `metadata` cuando falta `metadata.type`.

Referencia: `docs/40-standards/ESTANDAR-METADATA-ITEMS.md`.

---

## 4. Relación usuario-inventario-equipamiento

Usuario demo usado:
- `student@gamilit.com` (`cccccccc-cccc-cccc-cccc-cccccccccccc`)

Variantes demo aplicadas:
- Marco: `80000001-0001-0000-0000-000000000002`
- Título: `80000002-0001-0000-0000-000000000001`

Tablas impactadas:
- `gamification_system.shop_items`
- `gamification_system.user_purchases`
- `gamification_system.user_equipped_items`

---

## 5. Orden recomendado de ejecución

1. `12-shop_categories.sql`
2. `13-shop_items.sql`
3. `16/17/15-shop_items_metadata_normalization.sql` (según ambiente)
4. `17/18/16-user_purchases-demo.sql` (según ambiente)
5. `18/19/17-user_equipped_items-demo.sql` (según ambiente)

---

## 6. Criterios de validación

1. Existen compras `status='completed'` e `is_active=true` para el usuario demo.
2. Existe un item equipado por categoría en `user_equipped_items`.
3. `shop_items.metadata` contiene `type` canónico en variantes visuales.
4. El flujo `compra -> equipamiento` es comprobable en API y UX.
