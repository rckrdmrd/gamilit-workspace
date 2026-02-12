# Schema 4: gamification (8 tablas, 38 RLS policies)

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
