# Schema 10: store (6 tablas, 18 RLS policies)

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

### store.store_items
Catalogo de items de la tienda virtual.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| name | VARCHAR(100) | NOT NULL | - | Nombre del item |
| description | TEXT | NULL | NULL | Descripcion |
| type | store_item_type | NOT NULL | - | avatar, frame, background, powerup, effect, title |
| category_id | UUID | NULL | NULL | FK store.store_categories |
| price_ml_coins | INTEGER | NOT NULL | - | Precio en ML Coins |
| icon_url | VARCHAR(500) | NOT NULL | - | Icono |
| preview_url | VARCHAR(500) | NULL | NULL | Preview del item |
| duration_type | item_duration_type | NOT NULL | 'permanent' | permanent, temporary, single_use |
| duration_hours | INTEGER | NULL | NULL | Duracion (si temporary) |
| effect_data | JSONB | NULL | '{}' | Efecto del item |
| rank_required | rank_type | NULL | NULL | Rango minimo requerido |
| is_active | BOOLEAN | NOT NULL | true | Item activo |
| is_featured | BOOLEAN | NOT NULL | false | Item destacado |
| sort_order | INTEGER | NOT NULL | 0 | Orden |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `StoreItem`
**RLS:** NO (catalogo global)

---

### store.store_categories
Categorias de items.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| name | VARCHAR(50) | NOT NULL | - | Nombre |
| slug | VARCHAR(50) | NOT NULL | - | Slug unico |
| icon_url | VARCHAR(500) | NULL | NULL | Icono |
| sort_order | INTEGER | NOT NULL | 0 | Orden |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**RLS:** NO (catalogo global)

---

### store.store_purchases
Historial de compras.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| item_id | UUID | NOT NULL | - | FK store.store_items |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| price_paid | INTEGER | NOT NULL | - | ML Coins pagados |
| purchased_at | TIMESTAMPTZ | NOT NULL | NOW() | Fecha de compra |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `StorePurchase`

---

### store.student_inventory
Items en posesion del estudiante.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| item_id | UUID | NOT NULL | - | FK store.store_items |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| is_equipped | BOOLEAN | NOT NULL | false | Item equipado |
| uses_remaining | INTEGER | NULL | NULL | Usos restantes (single_use) |
| expires_at | TIMESTAMPTZ | NULL | NULL | Expiracion (temporary) |
| acquired_at | TIMESTAMPTZ | NOT NULL | NOW() | Fecha de adquisicion |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `StudentInventory`

---

### store.ml_coin_transactions
Transacciones de ML Coins (append-only).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| amount | INTEGER | NOT NULL | - | Monto (positivo = earned, negativo = spent) |
| source | VARCHAR(50) | NOT NULL | - | Fuente (exercise, mission, purchase, admin) |
| source_id | UUID | NULL | NULL | ID del recurso fuente |
| description | VARCHAR(200) | NULL | NULL | Descripcion |
| balance_after | INTEGER | NOT NULL | - | Saldo despues de transaccion |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `MlCoinTransaction`

---

### store.ml_coin_balances
Saldo actual de ML Coins por estudiante.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| balance | INTEGER | NOT NULL | 0 | Saldo actual |
| total_earned | INTEGER | NOT NULL | 0 | Total ganado |
| total_spent | INTEGER | NOT NULL | 0 | Total gastado |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Indices:** `idx_ml_balance_student_tenant` UNIQUE (student_id, tenant_id)
