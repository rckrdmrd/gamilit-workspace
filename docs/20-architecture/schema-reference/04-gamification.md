---
titulo: Schema 4 - gamification_system
tipo: arquitectura
subtipo: schema-reference
schema: gamification_system
ultima_actualizacion: 2026-02-27
---

# Schema: gamification_system (27 tablas)

> **Nota:** Este documento describe el modelo conceptual basado en DDL. Para definiciones DDL exactas, consultar `apps/database/ddl/schemas/gamification_system/`.

> **DDL Path:** `apps/database/ddl/schemas/gamification_system/`

> **Nota de nombres:** El schema fisico DDL es `gamification_system`. No existe un schema DDL separado llamado `gamification`. Todas las tablas de este documento pertenecen al schema `gamification_system`.

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

## Estadisticas y Rangos (schema: gamification_system)

### gamification_system.user_stats
Estadisticas de gamificacion por usuario - ML Coins, XP, streaks, rankings.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles (UNIQUE) |
| tenant_id | UUID | NULL | NULL | FK auth_management.tenants |
| level | INTEGER | NOT NULL | 1 | Nivel actual (> 0) |
| total_xp | INTEGER | NOT NULL | 0 | XP total acumulado (>= 0) |
| xp_to_next_level | INTEGER | NOT NULL | 100 | XP necesaria para siguiente nivel |
| current_rank | maya_rank | NULL | 'Ajaw' | Rango maya actual |
| rank_progress | NUMERIC(5,2) | NULL | 0.00 | Progreso hacia siguiente rango (0-100) |
| ml_coins | INTEGER | NOT NULL | 100 | Balance actual de ML Coins (>= 0) |
| ml_coins_earned_total | INTEGER | NOT NULL | 100 | Total ML Coins ganados |
| ml_coins_spent_total | INTEGER | NOT NULL | 0 | Total ML Coins gastados |
| ml_coins_earned_today | INTEGER | NOT NULL | 0 | ML Coins ganados hoy |
| last_ml_coins_reset | TIMESTAMPTZ | NULL | NULL | Control de resets diarios |
| current_streak | INTEGER | NOT NULL | 0 | Racha de dias consecutivos activa |
| max_streak | INTEGER | NOT NULL | 0 | Racha maxima historica |
| streak_started_at | TIMESTAMPTZ | NULL | NULL | Inicio de racha actual |
| days_active_total | INTEGER | NOT NULL | 0 | Total de dias activos |
| exercises_completed | INTEGER | NOT NULL | 0 | Ejercicios completados |
| modules_completed | INTEGER | NOT NULL | 0 | Modulos completados |
| total_score | INTEGER | NOT NULL | 0 | Suma total de puntos |
| average_score | NUMERIC(5,2) | NULL | NULL | Puntuacion promedio (0-100) |
| perfect_scores | INTEGER | NOT NULL | 0 | Ejercicios con puntuacion perfecta |
| achievements_earned | INTEGER | NOT NULL | 0 | Logros desbloqueados |
| certificates_earned | INTEGER | NOT NULL | 0 | Certificados ganados |
| total_time_spent | INTERVAL | NOT NULL | '00:00:00' | Tiempo total de uso |
| weekly_time_spent | INTERVAL | NOT NULL | '00:00:00' | Tiempo de uso semanal |
| sessions_count | INTEGER | NOT NULL | 0 | Numero de sesiones |
| weekly_xp | INTEGER | NOT NULL | 0 | XP semanal |
| monthly_xp | INTEGER | NOT NULL | 0 | XP mensual |
| weekly_exercises | INTEGER | NOT NULL | 0 | Ejercicios semanales |
| global_rank_position | INTEGER | NULL | NULL | Posicion en ranking global |
| class_rank_position | INTEGER | NULL | NULL | Posicion en ranking de clase |
| school_rank_position | INTEGER | NULL | NULL | Posicion en ranking de escuela |
| last_activity_at | TIMESTAMPTZ | NULL | NULL | Ultima actividad |
| last_login_at | TIMESTAMPTZ | NULL | NULL | Ultimo login |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |
| created_at | TIMESTAMPTZ | NOT NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | gamilit.now_mexico() | - |

**Indices:** `idx_user_stats_user_id`, `idx_user_stats_tenant_id`, `idx_user_stats_level`, `idx_user_stats_tenant_level`, `idx_user_stats_ml_coins`, `idx_user_stats_streak`, `idx_user_stats_global_rank`, `idx_user_stats_current_rank`, `idx_user_stats_perfect_scores`
**RLS:** Habilitado (own select, admin select, system update)

---

### gamification_system.user_ranks
Progresion de rangos maya del sistema de gamificacion.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles (UNIQUE) |
| tenant_id | UUID | NULL | NULL | FK auth_management.tenants |
| current_rank | maya_rank | NOT NULL | 'Ajaw' | Rango maya actual |
| previous_rank | maya_rank | NULL | NULL | Rango anterior |
| rank_progress_percentage | INTEGER | NULL | 0 | Progreso hacia siguiente rango (0-100) |
| modules_required_for_next | INTEGER | NULL | NULL | Modulos requeridos para siguiente rango |
| modules_completed_for_rank | INTEGER | NULL | 0 | Modulos completados para rango actual |
| xp_required_for_next | INTEGER | NULL | NULL | XP requerido para siguiente rango |
| xp_earned_for_rank | INTEGER | NULL | 0 | XP ganado para rango actual |
| ml_coins_bonus | INTEGER | NULL | 0 | Bonus de ML Coins al alcanzar rango |
| certificate_url | TEXT | NULL | NULL | URL de certificado |
| badge_url | TEXT | NULL | NULL | URL de badge |
| achieved_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Fecha de logro del rango |
| previous_rank_achieved_at | TIMESTAMPTZ | NULL | NULL | Fecha del rango anterior |
| is_current | BOOLEAN | NULL | true | Si es el registro vigente |
| rank_metadata | JSONB | NULL | '{}' | Metadatos del rango |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Indices:** `idx_user_ranks_user_id`, `idx_user_ranks_current`, `idx_user_ranks_is_current`

---

### gamification_system.maya_ranks
Configuracion de rangos maya del sistema. Define requisitos de XP, recompensas y beneficios por rango.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| rank_name | maya_rank | NOT NULL | - | Nombre del rango (UNIQUE): Ajaw, Nacom, Ah K'in, Halach Uinic, K'uk'ulkan |
| display_name | TEXT | NOT NULL | - | Nombre para mostrar |
| description | TEXT | NOT NULL | - | Descripcion del rango |
| min_xp_required | BIGINT | NOT NULL | - | XP minimo requerido |
| max_xp_threshold | BIGINT | NULL | NULL | XP maximo (NULL para rango maximo) |
| ml_coins_bonus | INTEGER | NOT NULL | 0 | ML Coins otorgados al alcanzar rango |
| xp_multiplier | NUMERIC(3,2) | NOT NULL | 1.00 | Multiplicador de XP (1.00 - 3.00) |
| missions_required | INTEGER | NULL | 0 | Misiones requeridas |
| modules_required | INTEGER | NULL | 0 | Modulos requeridos |
| perks | JSONB | NULL | '[]' | Beneficios adicionales (array de strings) |
| icon | TEXT | NULL | NULL | Icono del rango |
| color | TEXT | NULL | NULL | Color del rango |
| badge_image_url | TEXT | NULL | NULL | Imagen del badge |
| rank_order | INTEGER | NOT NULL | - | Orden jerarquico (UNIQUE, 1-5) |
| next_rank | maya_rank | NULL | NULL | Siguiente rango en progresion |
| is_active | BOOLEAN | NOT NULL | true | Si esta activo |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Indices:** `idx_maya_ranks_order`, `idx_maya_ranks_xp_range`, `idx_maya_ranks_active`
**Constraints:** CHECK min_xp >= 0, CHECK max_xp > min_xp (or NULL), CHECK rank_order 1-5, CHECK xp_multiplier 1.00-3.00
**Trigger:** trg_maya_ranks_updated_at

---

## Logros y Achievements (schema: gamification_system)

### gamification_system.achievement_categories
Categorias para clasificar logros del sistema de gamificacion.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| name | VARCHAR(100) | NOT NULL | - | Nombre unico de la categoria |
| description | TEXT | NULL | NULL | Descripcion de la categoria |
| icon_url | VARCHAR(500) | NULL | NULL | URL del icono representativo |
| display_order | INTEGER | NULL | 0 | Orden de visualizacion (>= 0) |
| is_active | BOOLEAN | NULL | true | Si esta activa y visible |
| created_at | TIMESTAMPTZ | NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NULL | NOW() | - |

**Indices:** `idx_achievement_categories_active`, `idx_achievement_categories_display_order`, `idx_achievement_categories_name`
**Constraints:** UNIQUE (name), CHECK name no vacio, CHECK display_order >= 0
**Trigger:** trg_achievement_categories_updated_at

---

### gamification_system.achievements
Catalogo de logros y achievements del sistema.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| tenant_id | UUID | NULL | NULL | FK auth_management.tenants |
| name | TEXT | NOT NULL | - | Nombre del logro |
| description | TEXT | NULL | NULL | Descripcion |
| icon | TEXT | NULL | 'trophy' | Icono |
| category | achievement_category | NOT NULL | - | Categoria: progress, streak, completion, social, special, mastery, exploration |
| rarity | TEXT | NULL | 'common' | Rareza: common, rare, epic, legendary |
| difficulty_level | difficulty_level | NULL | 'beginner' | Nivel de dificultad |
| conditions | JSONB | NOT NULL | (ver DDL) | Condiciones JSON para desbloquear |
| rewards | JSONB | NULL | (ver DDL) | Recompensas: {xp, ml_coins, badge} |
| is_secret | BOOLEAN | NULL | false | Oculto hasta desbloquearlo |
| is_active | BOOLEAN | NULL | true | Si esta activo |
| is_repeatable | BOOLEAN | NULL | false | Si es repetible |
| order_index | INTEGER | NULL | 0 | Orden de visualizacion |
| points_value | INTEGER | NULL | 0 | Valor en puntos |
| unlock_message | TEXT | NULL | NULL | Mensaje al desbloquear |
| instructions | TEXT | NULL | NULL | Instrucciones |
| tips | TEXT[] | NULL | NULL | Array de consejos |
| metadata | JSONB | NULL | '{}' | Metadatos |
| created_by | UUID | NULL | NULL | FK auth_management.profiles |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| ml_coins_reward | INTEGER | NULL | 0 | Recompensa en ML Coins |

**Indices:** `idx_achievements_active`, `idx_achievements_category`, `idx_achievements_conditions_gin` (GIN), `idx_achievements_secret`
**Constraints:** UNIQUE (name, tenant_id), CHECK rarity values
**RLS:** Habilitado (admin all, select active non-secret)

---

### gamification_system.user_achievements
Achievements desbloqueados por usuario con progreso y recompensas.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| achievement_id | UUID | NOT NULL | - | FK gamification_system.achievements |
| progress | INTEGER | NULL | 0 | Progreso actual (>= 0) |
| max_progress | INTEGER | NULL | 100 | Progreso maximo |
| is_completed | BOOLEAN | NULL | false | Si esta completado |
| completion_percentage | NUMERIC(5,2) | NULL | 0.00 | Porcentaje de completado |
| completed_at | TIMESTAMPTZ | NULL | NULL | Fecha de completado |
| notified | BOOLEAN | NULL | false | Si fue notificado |
| viewed | BOOLEAN | NULL | false | Si fue visto |
| rewards_claimed | BOOLEAN | NULL | false | Si reclamo las recompensas |
| rewards_received | JSONB | NULL | '{}' | Recompensas recibidas |
| progress_data | JSONB | NULL | '{}' | Datos de progreso |
| milestones_reached | TEXT[] | NULL | NULL | Hitos alcanzados |
| metadata | JSONB | NULL | '{}' | Metadatos |
| started_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Inicio del tracking |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Indices:** `idx_user_achievements_achievement_id`, `idx_user_achievements_completed`, `idx_user_achievements_unclaimed` (parcial), `idx_user_achievements_user_completed`, `idx_user_achievements_user_id`
**Constraint:** UNIQUE (user_id, achievement_id)
**RLS:** Habilitado (admin select, own select)

---

## Economia ML Coins (schema: gamification_system)

### gamification_system.ml_coins_transactions
Registro de transacciones de ML Coins - earning y spending.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| tenant_id | UUID | NULL | NULL | FK auth_management.tenants |
| amount | INTEGER | NOT NULL | - | Cantidad (positivo = ingreso, negativo = gasto) |
| balance_before | INTEGER | NOT NULL | - | Balance antes de transaccion (>= 0) |
| balance_after | INTEGER | NOT NULL | - | Balance despues de transaccion (>= 0) |
| transaction_type | transaction_type | NOT NULL | - | Tipo ENUM (14 tipos: 7 earned, 3 spent, 4 admin/sistema) |
| description | TEXT | NULL | NULL | Descripcion |
| reason | TEXT | NULL | NULL | Razon |
| reference_id | UUID | NULL | NULL | ID de referencia |
| reference_type | TEXT | NULL | NULL | Tipo: exercise, module, achievement, powerup, admin, streak, rank, mission, rank_promotion |
| multiplier | NUMERIC(3,2) | NULL | 1.00 | Multiplicador aplicado |
| bonus_applied | BOOLEAN | NULL | false | Si se aplico bonus |
| metadata | JSONB | NULL | '{}' | Metadatos |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Indices:** `idx_ml_transactions_created_at`, `idx_ml_transactions_reference`, `idx_ml_transactions_type`, `idx_ml_transactions_user_id`, `idx_ml_transactions_user_recent`, `idx_ml_transactions_user_type_date`, `idx_ml_transactions_tenant_id`
**RLS:** Habilitado (admin select, own select)

---

## Misiones (schema: gamification_system)

### gamification_system.mission_templates
Templates para generar misiones con configuraciones predefinidas.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| name | VARCHAR(100) | NOT NULL | - | Nombre del template |
| description | TEXT | NOT NULL | - | Descripcion |
| type | VARCHAR(20) | NOT NULL | - | Tipo: daily, weekly, special, classroom |
| category | VARCHAR(50) | NULL | NULL | Categoria (exercise, study_time, social, streak, etc.) |
| target_type | VARCHAR(50) | NOT NULL | - | Tipo de objetivo (complete_exercises, study_minutes, earn_xp, etc.) |
| target_value | INTEGER | NOT NULL | - | Valor requerido (> 0) |
| xp_reward | INTEGER | NULL | 0 | Recompensa XP (>= 0) |
| ml_coins_reward | INTEGER | NULL | 0 | Recompensa ML Coins (>= 0) |
| badge_id | UUID | NULL | NULL | Badge opcional |
| difficulty | VARCHAR(20) | NULL | 'normal' | Dificultad: easy, normal, hard, epic |
| is_active | BOOLEAN | NULL | true | Si esta activo |
| priority | INTEGER | NULL | 0 | Prioridad de seleccion |
| min_level | INTEGER | NULL | 1 | Nivel minimo (>= 1) |
| max_level | INTEGER | NULL | NULL | Nivel maximo (>= min_level) |
| required_module | INTEGER | NULL | NULL | Modulo requerido |
| required_exercise_type | VARCHAR(50) | NULL | NULL | Tipo de ejercicio requerido (NULL = cualquiera) |
| exercise_id | UUID | NULL | NULL | FK educational_content.exercises (opcional) |
| icon | VARCHAR(50) | NULL | NULL | Icono |
| color | VARCHAR(20) | NULL | NULL | Color |
| metadata | JSONB | NULL | '{}' | Configuracion adicional JSON |
| created_at | TIMESTAMPTZ | NOT NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| created_by | UUID | NULL | NULL | FK auth_management.profiles |

**Indices:** `idx_mission_templates_type`, `idx_mission_templates_active`, `idx_mission_templates_category`, `idx_mission_templates_difficulty`, `idx_mission_templates_exercise_type`, `idx_mission_templates_exercise_id`

---

### gamification_system.missions
Misiones/quests de usuario con objetivos y recompensas.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| template_id | UUID | NOT NULL | - | FK gamification_system.mission_templates |
| exercise_id | UUID | NULL | NULL | FK educational_content.exercises (propagado desde template) |
| title | TEXT | NOT NULL | - | Titulo de la mision |
| description | TEXT | NULL | NULL | Descripcion |
| mission_type | TEXT | NOT NULL | - | Tipo: daily, weekly, special |
| objectives | JSONB | NOT NULL | - | Array de objetivos con type, target, progress |
| rewards | JSONB | NOT NULL | - | Recompensas: {ml_coins, xp, items} |
| status | TEXT | NOT NULL | 'active' | Estado: active, in_progress, completed, claimed, expired |
| progress | DOUBLE PRECISION | NOT NULL | 0 | Porcentaje de completado (0-100) |
| start_date | TIMESTAMPTZ | NOT NULL | gamilit.now_mexico() | Fecha de inicio |
| end_date | TIMESTAMPTZ | NOT NULL | - | Fecha de expiracion |
| completed_at | TIMESTAMPTZ | NULL | NULL | Fecha de completado |
| claimed_at | TIMESTAMPTZ | NULL | NULL | Fecha de reclamo de recompensas |
| created_at | TIMESTAMPTZ | NOT NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Indices:** `idx_missions_end_date`, `idx_missions_status`, `idx_missions_template_id`, `idx_missions_type`, `idx_missions_user_id`, `idx_missions_user_type_status`, `idx_missions_exercise_id`
**Constraint:** UNIQUE (user_id, template_id, mission_type, end_date) -- evita duplicados concurrentes

---

## Comodines / Power-ups (schema: gamification_system)

### gamification_system.comodines_inventory
Inventario de comodines (power-ups) por usuario.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles (UNIQUE) |
| pistas_available | INTEGER | NULL | 0 | Pistas Contextuales disponibles (15 ML Coins) |
| vision_lectora_available | INTEGER | NULL | 0 | Vision Lectora disponibles (25 ML Coins) |
| segunda_oportunidad_available | INTEGER | NULL | 0 | Segunda Oportunidad disponibles (40 ML Coins) |
| pistas_purchased_total | INTEGER | NULL | 0 | Total Pistas compradas |
| vision_lectora_purchased_total | INTEGER | NULL | 0 | Total Vision Lectora compradas |
| segunda_oportunidad_purchased_total | INTEGER | NULL | 0 | Total Segunda Oportunidad compradas |
| pistas_used_total | INTEGER | NULL | 0 | Total Pistas usadas |
| vision_lectora_used_total | INTEGER | NULL | 0 | Total Vision Lectora usadas |
| segunda_oportunidad_used_total | INTEGER | NULL | 0 | Total Segunda Oportunidad usadas |
| pistas_cost | INTEGER | NULL | 15 | Costo de Pistas en ML Coins |
| vision_lectora_cost | INTEGER | NULL | 25 | Costo de Vision Lectora en ML Coins |
| segunda_oportunidad_cost | INTEGER | NULL | 40 | Costo de Segunda Oportunidad en ML Coins |
| metadata | JSONB | NULL | '{}' | Metadatos |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Constraints:** Todos los contadores >= 0

---

### gamification_system.comodin_usage_logs
Log historico de uso de comodines con contexto completo.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| comodin_type | comodin_type | NOT NULL | - | Tipo ENUM de comodin |
| exercise_id | UUID | NULL | NULL | Ejercicio donde se uso |
| attempt_id | UUID | NULL | NULL | Intento especifico |
| module_id | UUID | NULL | NULL | Modulo asociado |
| effect_applied | TEXT | NULL | NULL | Efecto aplicado (revealed_hint_1, highlight, retry) |
| value_provided | JSONB | NULL | NULL | Valor JSONB proporcionado al usuario |
| usage_context | JSONB | NULL | '{}' | Contexto: tiempo restante, intentos previos, etc. |
| used_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Indices:** `idx_comodin_usage_logs_user_id`, `idx_comodin_usage_logs_type`, `idx_comodin_usage_logs_exercise`, `idx_comodin_usage_logs_used_at`, `idx_comodin_usage_logs_user_type_date`, `idx_comodin_usage_logs_context_gin` (GIN)
**Constraint:** UNIQUE (user_id, exercise_id, attempt_id, comodin_type)

---

### gamification_system.comodin_usage_trackings
Tracking de uso de comodines por intento para validar limites.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| exercise_id | UUID | NOT NULL | - | ID del ejercicio |
| attempt_id | UUID | NOT NULL | - | ID del intento |
| pistas_used | INTEGER | NULL | 0 | Pistas usadas (max 3) |
| vision_lectora_used | INTEGER | NULL | 0 | Vision Lectora usada (max 1) |
| segunda_oportunidad_used | INTEGER | NULL | 0 | Segunda Oportunidad usada (max 1) |
| pistas_limit_reached | BOOLEAN | NULL | false | Si alcanzo limite de pistas |
| vision_lectora_limit_reached | BOOLEAN | NULL | false | Si alcanzo limite de vision |
| segunda_oportunidad_limit_reached | BOOLEAN | NULL | false | Si alcanzo limite de segunda oportunidad |
| started_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | Inicio del tracking |
| last_used_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | Ultimo uso |

**Indices:** `idx_comodin_tracking_user_id`, `idx_comodin_tracking_exercise`, `idx_comodin_tracking_attempt`, `idx_comodin_tracking_limits`
**Constraint:** UNIQUE (user_id, exercise_id, attempt_id)
**Trigger:** trg_comodin_tracking_updated

---

## Boosts y Transacciones (schema: gamification_system)

### gamification_system.active_boosts
Bonificadores temporales activos para usuarios (XP, COINS, LUCK, DROP_RATE).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| boost_type | VARCHAR(50) | NOT NULL | - | Tipo: XP, COINS, LUCK, DROP_RATE |
| multiplier | NUMERIC(4,2) | NOT NULL | 1.0 | Multiplicador (> 1.0, ej: 1.5 = +50%) |
| source | VARCHAR(100) | NULL | NULL | Origen: PREMIUM, EVENT, ITEM, ACHIEVEMENT |
| activated_at | TIMESTAMPTZ | NULL | NOW() | Fecha de activacion |
| expires_at | TIMESTAMPTZ | NOT NULL | - | Fecha de expiracion |
| is_active | BOOLEAN | NULL | true | Si esta activo |

**Indices:** `idx_active_boosts_user`, `idx_active_boosts_expires`, `idx_active_boosts_type`, `idx_active_boosts_user_type`, `idx_active_boosts_active`
**Constraints:** CHECK multiplier > 1.0, CHECK expires_at > activated_at

---

### gamification_system.inventory_transactions
Historial de transacciones de items del inventario.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| item_id | UUID | NOT NULL | - | ID del item involucrado |
| transaction_type | VARCHAR(50) | NOT NULL | - | Tipo: PURCHASE, USE, GIFT_SENT, GIFT_RECEIVED, EXPIRED, ADMIN_GRANT |
| quantity | INTEGER | NOT NULL | - | Cantidad (positivo = agregar, negativo = restar, != 0) |
| metadata | JSONB | NULL | NULL | Info adicional (precio, destinatario, motivo) |
| created_at | TIMESTAMPTZ | NULL | NOW() | - |

**Indices:** `idx_inventory_transactions_user`, `idx_inventory_transactions_item`, `idx_inventory_transactions_user_item`, `idx_inventory_transactions_type`, `idx_inventory_transactions_created`, `idx_inventory_transactions_metadata` (GIN)

---

### gamification_system.leaderboard_metadatas
Tracks refresh status and statistics for materialized leaderboard views.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| view_name | TEXT | NOT NULL | - | PK - Nombre de la vista materializada |
| last_refresh_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Ultimo refresh |
| total_users | INTEGER | NULL | NULL | Total de usuarios en el leaderboard |
| refresh_duration_ms | INTEGER | NULL | NULL | Duracion del refresh en milisegundos |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

---

## Tienda Visual (schema: gamification_system)

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

**Nota de cambio (2026-03-02):**
- Categorias `guild` y `social` ahora tienen `is_active=false` (desactivadas, no eliminadas)
- Guild items (4 total) han sido re-categorizados como cosmeticos: `guild_banner`→`profile_frame`, `guild_emblem`/`guild_shield`→`badge`
- Social items (6 total) removidos de tienda + 1 item `Efecto Obsidiana` (total 7 items inactivos)
- Categorias activas: cosmetics, boosts, avatar, frame, badge (5)

---

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
| category_id | UUID | NULL | NULL | FK gamification_system.shop_categories |
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

**Referencia de contrato:** `docs/40-standards/ESTANDAR-METADATA-ITEMS.md`
**Indices:** `idx_shop_items_category`, `idx_shop_items_category_id`, `idx_shop_items_available`, `idx_shop_items_rarity`, `idx_shop_items_price`, `idx_shop_items_tags_gin`, `idx_shop_items_tenant`

**Nota de cambios (2026-03-02):**
- **Items removidos:** 7 items ahora tienen `is_available=false` (6 sociales + 1 Efecto Obsidiana)
- **Items migrados:** 4 guild items re-categorizados a cosmetics (is_available=true, category='cosmetics')
  - `guild_banner` → metadata.type='profile_frame'
  - `guild_emblem`, `guild_shield` → metadata.type='badge'
- Items respeto `shop_items.category` enum sigue siendo funcional para queries; `shop_categories.is_active` controla visibilidad en UI

---

### gamification_system.user_purchases
Registro de compras del usuario en tienda.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| item_id | UUID | NOT NULL | - | FK gamification_system.shop_items |
| tenant_id | UUID | NULL | NULL | FK auth_management.tenants |
| quantity | INTEGER | NULL | 1 | Cantidad comprada |
| price_paid | INTEGER | NOT NULL | - | Precio efectivo |
| discount_applied | INTEGER | NULL | 0 | Descuento aplicado |
| transaction_id | UUID | NULL | NULL | FK ml_coins_transactions |
| status | TEXT | NULL | 'completed' | pending/completed/refunded/expired |
| expires_at | TIMESTAMPTZ | NULL | NULL | Expiracion para temporales |
| consumed_at | TIMESTAMPTZ | NULL | NULL | Fecha de consumo |
| is_active | BOOLEAN | NULL | true | Item activo para uso/equipo |
| metadata | JSONB | NULL | '{}' | Datos de compra |
| purchased_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Fecha de compra |

**Indices:** `idx_user_purchases_user`, `idx_user_purchases_item`, `idx_user_purchases_status`, `idx_user_purchases_active`, `idx_user_purchases_user_item`, `idx_user_purchases_date`, `idx_user_purchases_tenant`
**Constraint clave:** `idx_user_purchases_unique_item` UNIQUE parcial en `(user_id, item_id)` cuando `status='completed' AND is_active=true`
**RLS:** habilitado (self + admin)

---

### gamification_system.user_equipped_items
Estado actual de equipamiento cosmetico por usuario.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| category_id | UUID | NOT NULL | - | FK gamification_system.shop_categories (para display) |
| item_id | UUID | NOT NULL | - | FK gamification_system.shop_items |
| visual_type | TEXT | NOT NULL | 'cosmetics' | Slot visual: avatar, profile_frame, profile_background, title, badge |
| equipped_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Fecha de equipamiento |
| metadata | JSONB | NULL | '{}' | Metadata de contexto |

**Constraint clave:** unicidad por `(user_id, visual_type)` — permite equipar avatar + frame + background simultaneamente.
**Indices:** `idx_user_equipped_user`, `idx_user_equipped_category`, `idx_user_equipped_unique_visual_type` (UNIQUE)
**RLS:** habilitado (self + admin)
**Migration:** `apps/database/ddl/migrations/2026-03-02-visual-type-equip-slot.sql`

---

## Nota de consistencia documental

Para tienda visual se aplica esta regla:
- `effect_data` almacena comportamiento/efectos funcionales del item.
- `metadata` almacena definicion visual para render frontend segun `ESTANDAR-METADATA-ITEMS`.

---

## Misiones de Aula - Cross-Schema (schema: gamification_system)

### gamification_system.classroom_missions [DDL-ACCURATE]

**Descripcion:** Manages the assignment and configuration of missions to specific classrooms. Allows teachers to assign missions with custom rewards and settings per classroom.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| classroom_id | UUID | NOT NULL | - | FK social_features.classrooms ON DELETE CASCADE |
| mission_template_id | UUID | NOT NULL | - | FK gamification_system.mission_templates (referencia a template) |
| assigned_by | UUID | NOT NULL | - | FK auth_management.profiles ON DELETE RESTRICT (maestro que asigno) |
| assigned_at | TIMESTAMPTZ | NOT NULL | NOW() | Fecha de asignacion |
| due_date | TIMESTAMPTZ | NULL | NULL | Fecha limite de la mision |
| is_mandatory | BOOLEAN | NULL | false | Si la mision es obligatoria para estudiantes del aula |
| bonus_xp | INTEGER | NULL | 0 | XP adicional sobre recompensas base (>= 0) |
| bonus_coins | INTEGER | NULL | 0 | ML Coins adicionales sobre recompensas base (>= 0) |
| title | TEXT | NOT NULL | - | Titulo de la mision (denormalizado) |
| description | TEXT | NULL | NULL | Descripcion de la mision |
| mission_type | TEXT | NOT NULL | - | Tipo: daily, weekly, special |
| objectives | JSONB | NOT NULL | - | Array de objetivos (copiados del template) |
| base_rewards | JSONB | NOT NULL | - | Recompensas base del template (antes de bonuses) |
| is_active | BOOLEAN | NOT NULL | true | Si la mision esta activa |
| metadata | JSONB | NULL | '{}'::jsonb | Configuracion por aula: custom_instructions, difficulty_override, unlock_date, auto_assign_to_new_students |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | Auto-updated via trigger |

**Primary Key:** id
**Unique:** (classroom_id, mission_template_id) (`classroom_missions_unique`)
**Foreign Keys:** classroom_id → social_features.classrooms ON DELETE CASCADE, mission_template_id → gamification_system.mission_templates, assigned_by → auth_management.profiles ON DELETE RESTRICT
**Check:** `classroom_missions_bonus_xp_positive` (bonus_xp >= 0), `classroom_missions_bonus_coins_positive` (bonus_coins >= 0), mission_type IN ('daily','weekly','special')
**Indices:** `idx_classroom_missions_classroom` (classroom_id, parcial WHERE is_active=TRUE), `idx_classroom_missions_template` (mission_template_id, parcial WHERE is_active=TRUE), `idx_classroom_missions_due_date` (due_date, parcial WHERE is_active=TRUE AND due_date IS NOT NULL), `idx_classroom_missions_assigned_by` (assigned_by, assigned_at), `idx_classroom_missions_type` (mission_type, parcial WHERE is_active=TRUE), `idx_classroom_missions_classroom_type` (classroom_id, mission_type, parcial WHERE is_active=TRUE), `idx_classroom_missions_classroom_active` (classroom_id, is_active -- optimization index)
**Trigger:** `trg_classroom_missions_updated_at` (auto-updates updated_at)
**RLS:** Habilitado (teacher access via teacher_classrooms, student view for active missions via classroom_members, admin/super_admin full access)
**Grants:** SELECT, INSERT, UPDATE, DELETE a gamilit_user
**Entity:** `ClassroomMission` (`gamification/entities/classroom-mission.entity.ts`)
**DDL:** `gamification_system/tables/_cross_schema/16-classroom_missions.sql`
**Nota:** Cross-schema: references social_features.classrooms, auth_management.profiles, gamification_system.mission_templates. Denormalized fields (title, description, objectives, base_rewards) copied from template for flexibility.

---

## Auditoria de Comodines - Cross-Schema (schema: gamification_system)

### gamification_system.comodin_uses
Audit trail inmutable del historial de consumo de comodines. Tabla de auditoria para analytics, compliance y debugging. A diferencia de `comodin_usage_logs`, no tiene restriccion UNIQUE (permite multiples registros por intento).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles ON DELETE CASCADE |
| comodin_type | comodin_type | NOT NULL | - | Tipo ENUM de comodin: pistas, vision_lectora, segunda_oportunidad |
| exercise_id | UUID | NULL | NULL | FK educational_content.exercises ON DELETE SET NULL (NULL para usos no ligados a ejercicio) |
| attempt_id | UUID | NULL | NULL | FK progress_tracking.exercise_attempts ON DELETE SET NULL (NULL para usos no ligados a intento) |
| effect_applied | VARCHAR(100) | NULL | NULL | Efecto aplicado (ej: revealed_hint_1, highlight_paragraph, retry) |
| value_provided | JSONB | NULL | NULL | Valor provisto al usuario: texto de pista, secciones resaltadas, etc. |
| consumed_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP | Timestamp principal de auditoria (cuando se consumio el comodin) |
| created_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP | Timestamp de creacion del registro (debe coincidir con consumed_at) |

**Primary Key:** id
**Foreign Keys:** user_id → auth_management.profiles ON DELETE CASCADE, exercise_id → educational_content.exercises ON DELETE SET NULL, attempt_id → progress_tracking.exercise_attempts ON DELETE SET NULL
**Indices:** `idx_comodin_uses_user_id`, `idx_comodin_uses_comodin_type`, `idx_comodin_uses_exercise_id` (parcial, WHERE exercise_id IS NOT NULL), `idx_comodin_uses_consumed_at` (DESC), `idx_comodin_uses_user_type_time` (user_id, comodin_type, consumed_at DESC), `idx_comodin_uses_user_exercise` (parcial, WHERE exercise_id IS NOT NULL), `idx_comodin_uses_value_provided_gin` (GIN)
**RLS:** Habilitado (own select, admin select, system/admin insert)
**Nota:** Tabla inmutable (sin updated_at). Solo el sistema via SECURITY DEFINER functions o admins pueden insertar. Cross-schema: referencias educational_content y progress_tracking. Ubicada en `_cross_schema/21-comodin_uses.sql`. GAP-GAM-001.

---

## Tablas Conceptuales (sin DDL)

> Las siguientes tablas aparecen en el modelo conceptual pero no tienen DDL implementado.
> Son candidatas para futuras iteraciones o estan cubiertas por tablas existentes.

| Tabla | Proposito |
|-------|-----------|
| gamification_system.xp_transactions | Transacciones de XP |
| gamification_system.levels | Definicion de niveles |
| gamification_system.rank_definitions | Definicion de rangos maya |
| gamification_system.student_gamification | Perfil gamificado del estudiante |
| gamification_system.gamification_config | Configuracion de gamificacion |
| gamification_system.xp_multipliers | Multiplicadores de XP |
| gamification_system.daily_xp_limits | Limites diarios de XP |
| gamification_system.streak_records | Registros de rachas |
