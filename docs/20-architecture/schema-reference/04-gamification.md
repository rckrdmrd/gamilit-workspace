# Schema 4: gamification (8 tablas, 38 RLS policies)

> **Nota:** Este documento describe el modelo conceptual. Para definiciones DDL exactas, consultar `apps/database/ddl/schemas/`.

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

### gamification.xp_transactions
Historial de transacciones XP (append-only, inmutable).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| amount | INTEGER | NOT NULL | - | Cantidad de XP (positivo) |
| source | xp_source_type | NOT NULL | - | Fuente (exercise, mission, achievement, bonus, streak) |
| source_id | UUID | NULL | NULL | ID del recurso fuente |
| multiplier | NUMERIC(3,1) | NOT NULL | 1.0 | Multiplicador aplicado |
| base_amount | INTEGER | NOT NULL | - | Monto antes de multiplicador |
| description | VARCHAR(200) | NULL | NULL | Descripcion |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Indices:** `idx_xp_student_date` (student_id, created_at), `idx_xp_source`
**Entity:** `XpTransaction`
**Trigger:** tr_xp_transaction_created (actualiza student_gamification, check level/rank)

---

### gamification.levels
Definicion de niveles del sistema.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| number | INTEGER | NOT NULL | - | Numero de nivel |
| name | VARCHAR(100) | NOT NULL | - | Nombre del nivel |
| xp_required | INTEGER | NOT NULL | - | XP minimo para alcanzar |
| rank_type | rank_type | NOT NULL | - | Rango maya asociado |
| icon_url | VARCHAR(500) | NULL | NULL | Icono del nivel |
| benefits | JSONB | NULL | '{}' | Beneficios desbloqueados |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**RLS:** NO (catalogo global)
**Entity:** `Level`

---

### gamification.rank_definitions
Definicion de los 5 rangos maya.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| type | rank_type | NOT NULL | - | ahkin, nacom, batab, halach_uinik, ajaw |
| name | VARCHAR(50) | NOT NULL | - | Nombre completo |
| display_name | VARCHAR(100) | NOT NULL | - | Nombre para mostrar |
| description | TEXT | NULL | NULL | Descripcion del rango |
| min_xp | INTEGER | NOT NULL | - | XP minimo |
| max_xp | INTEGER | NULL | NULL | XP maximo (null para ultimo) |
| icon_url | VARCHAR(500) | NOT NULL | - | Icono del rango |
| frame_url | VARCHAR(500) | NULL | NULL | Marco de avatar |
| benefits | JSONB | NULL | '{}' | Beneficios del rango |
| sort_order | INTEGER | NOT NULL | - | Orden jerarquico |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**RLS:** NO (catalogo global, 5 registros)
**Entity:** `RankDefinition`

---

### gamification.student_gamification
Estado actual de gamificacion por estudiante.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| total_xp | INTEGER | NOT NULL | 0 | XP total acumulado |
| current_level | INTEGER | NOT NULL | 1 | Nivel actual |
| current_rank | rank_type | NOT NULL | 'ahkin' | Rango maya actual |
| ml_coins_balance | INTEGER | NOT NULL | 0 | Saldo ML Coins |
| total_ml_coins_earned | INTEGER | NOT NULL | 0 | Total ML Coins ganados |
| total_ml_coins_spent | INTEGER | NOT NULL | 0 | Total ML Coins gastados |
| achievements_count | INTEGER | NOT NULL | 0 | Logros desbloqueados |
| exercises_completed | INTEGER | NOT NULL | 0 | Ejercicios completados |
| current_streak | INTEGER | NOT NULL | 0 | Racha actual (dias) |
| longest_streak | INTEGER | NOT NULL | 0 | Racha mas larga |
| last_activity_at | TIMESTAMPTZ | NULL | NULL | Ultima actividad |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Indices:** `idx_student_gam_unique` UNIQUE (student_id, tenant_id), `idx_student_gam_rank`, `idx_student_gam_xp`
**Entity:** `StudentGamification`

---

### gamification.gamification_config
Parametros configurables de gamificacion por tenant.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| xp_base_exercise | INTEGER | NOT NULL | 10 | XP base por ejercicio |
| xp_multiplier_easy | NUMERIC(3,1) | NOT NULL | 1.0 | Multiplicador facil |
| xp_multiplier_medium | NUMERIC(3,1) | NOT NULL | 1.5 | Multiplicador medio |
| xp_multiplier_hard | NUMERIC(3,1) | NOT NULL | 2.0 | Multiplicador dificil |
| xp_multiplier_expert | NUMERIC(3,1) | NOT NULL | 3.0 | Multiplicador experto |
| streak_bonus_multiplier | NUMERIC(3,2) | NOT NULL | 0.10 | Bonus por racha (+10% por dia) |
| streak_bonus_max | NUMERIC(3,1) | NOT NULL | 2.0 | Maximo bonus de racha |
| daily_xp_limit | INTEGER | NOT NULL | 500 | Limite diario XP |
| ml_coins_per_exercise | INTEGER | NOT NULL | 5 | ML Coins base por ejercicio |
| config_data | JSONB | NULL | '{}' | Configuracion adicional |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `GamificationConfig`

---

### gamification.xp_multipliers
Multiplicadores activos por estudiante.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| multiplier_type | VARCHAR(50) | NOT NULL | - | Tipo de multiplicador |
| value | NUMERIC(3,1) | NOT NULL | - | Valor del multiplicador |
| source | VARCHAR(100) | NOT NULL | - | Origen (item, event, streak) |
| expires_at | TIMESTAMPTZ | NULL | NULL | Expiracion |
| is_active | BOOLEAN | NOT NULL | true | Activo |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### gamification.daily_xp_limits
Control anti-abuse de XP diario.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| date | DATE | NOT NULL | CURRENT_DATE | Fecha |
| xp_earned | INTEGER | NOT NULL | 0 | XP ganado hoy |
| limit_reached | BOOLEAN | NOT NULL | false | Limite alcanzado |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Indices:** `idx_daily_xp_student_date` UNIQUE (student_id, date, tenant_id)

---

### gamification.streak_records
Registro de rachas de dias consecutivos.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| streak_start | DATE | NOT NULL | - | Inicio de la racha |
| streak_end | DATE | NULL | NULL | Fin de la racha (null = activa) |
| days_count | INTEGER | NOT NULL | 1 | Dias consecutivos |
| status | streak_status | NOT NULL | 'active' | Estado (active, broken, completed) |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `StreakRecord`

---

## Actualizacion de alcance (2026-02-17)

> La implementacion vigente de tienda/equipamiento opera en `gamification_system.*`.  
> Este documento incorpora las tablas activas usadas por el flujo de tienda visual.

### gamification_system.shop_categories
Catalogo de categorias de tienda (marcos, avatares, efectos, etc.).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| name | TEXT | NOT NULL | - | Identificador unico de categoria |
| display_name | TEXT | NOT NULL | - | Nombre visible en UI |
| description | TEXT | NULL | NULL | Descripcion para UI |
| icon | TEXT | NULL | 'package' | Icono de categoria |
| color | TEXT | NULL | 'gray' | Color/tokens visuales |
| display_order | INTEGER | NULL | 0 | Orden de visualizacion |
| is_active | BOOLEAN | NULL | true | Si se muestra en tienda |
| metadata | JSONB | NULL | '{}' | Datos adicionales |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Indices:** `idx_shop_categories_active`, `idx_shop_categories_order`
**Constraint:** `name` UNIQUE

### gamification_system.shop_items
Catalogo de items comercializables en tienda.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| tenant_id | UUID | NULL | NULL | FK auth_management.tenants |
| name | TEXT | NOT NULL | - | Nombre del item |
| description | TEXT | NULL | NULL | Descripcion |
| icon | TEXT | NULL | 'package' | Icono base |
| image_url | TEXT | NULL | NULL | Imagen preview |
| category_id | UUID | NULL | NULL | FK `gamification_system.shop_categories` |
| category | shop_item_category | NOT NULL | - | Categoria enum funcional |
| rarity | TEXT | NULL | 'common' | Rareza visual/comercial |
| tags | TEXT[] | NULL | '{}' | Etiquetas de filtrado |
| price | INTEGER | NOT NULL | - | Precio en ML Coins |
| discount_price | INTEGER | NULL | NULL | Precio de descuento |
| discount_ends_at | TIMESTAMPTZ | NULL | NULL | Fin de descuento |
| is_available | BOOLEAN | NULL | true | Disponibilidad en tienda |
| stock | INTEGER | NULL | NULL | NULL = ilimitado |
| max_per_user | INTEGER | NULL | 1 | Limite por usuario |
| required_rank | TEXT | NULL | NULL | Rango requerido |
| required_level | INTEGER | NULL | NULL | Nivel requerido |
| required_achievement_id | UUID | NULL | NULL | FK achievements |
| is_consumable | BOOLEAN | NULL | false | Item de uso consumible |
| duration_days | INTEGER | NULL | NULL | Duracion temporal |
| effect_data | JSONB | NULL | '{}' | Efectos/parametros funcionales |
| metadata | JSONB | NULL | '{}' | Configuracion visual canonica |
| created_by | UUID | NULL | NULL | FK auth_management.profiles |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Referencia de contrato:** `docs/40-standards/ESTANDAR-METADATA-ITEMS.md`.
**Indices:** `idx_shop_items_category`, `idx_shop_items_category_id`, `idx_shop_items_available`, `idx_shop_items_rarity`, `idx_shop_items_price`, `idx_shop_items_tags_gin`, `idx_shop_items_tenant`

### gamification_system.user_purchases
Registro de compras del usuario en tienda.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| item_id | UUID | NOT NULL | - | FK `gamification_system.shop_items` |
| tenant_id | UUID | NULL | NULL | FK auth_management.tenants |
| quantity | INTEGER | NULL | 1 | Cantidad comprada |
| price_paid | INTEGER | NOT NULL | - | Precio efectivo |
| discount_applied | INTEGER | NULL | 0 | Descuento aplicado |
| transaction_id | UUID | NULL | NULL | FK `ml_coins_transactions` |
| status | TEXT | NULL | 'completed' | pending/completed/refunded/expired |
| expires_at | TIMESTAMPTZ | NULL | NULL | Expiracion para temporales |
| consumed_at | TIMESTAMPTZ | NULL | NULL | Fecha de consumo |
| is_active | BOOLEAN | NULL | true | Item activo para uso/equipo |
| metadata | JSONB | NULL | '{}' | Datos de compra |
| purchased_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Fecha de compra |

**Indices:** `idx_user_purchases_user`, `idx_user_purchases_item`, `idx_user_purchases_status`, `idx_user_purchases_active`, `idx_user_purchases_user_item`, `idx_user_purchases_date`, `idx_user_purchases_tenant`
**Constraint clave:** `idx_user_purchases_unique_item` UNIQUE parcial en `(user_id, item_id)` cuando `status='completed' AND is_active=true`
**RLS:** habilitado (self + admin)

### gamification_system.user_equipped_items
Estado actual de equipamiento cosmético por usuario.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| category_id | UUID | NOT NULL | - | FK `gamification_system.shop_categories` |
| item_id | UUID | NOT NULL | - | FK `gamification_system.shop_items` |
| equipped_at | TIMESTAMPTZ | NULL | `gamilit.now_mexico()` | Fecha de equipamiento |
| metadata | JSONB | NULL | '{}' | Metadata de contexto |

**Constraint clave:** unicidad por `(user_id, category_id)`.
**Indices:** `idx_user_equipped_user`, `idx_user_equipped_category`, `idx_user_equipped_unique_category` (UNIQUE)
**RLS:** habilitado (self + admin)

---

## Nota de consistencia documental

Para tienda visual se aplica esta regla:
- `effect_data` almacena comportamiento/efectos funcionales del item.
- `metadata` almacena definicion visual para render frontend segun `ESTANDAR-METADATA-ITEMS`.