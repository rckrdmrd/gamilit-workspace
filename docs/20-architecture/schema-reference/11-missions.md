# Schema 11: missions (6 tablas, 16 RLS policies)

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

### missions.mission_definitions
Catalogo de misiones.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| type | mission_type | NOT NULL | - | daily, weekly, quest |
| name | VARCHAR(100) | NOT NULL | - | Nombre |
| description | TEXT | NOT NULL | - | Descripcion |
| icon_url | VARCHAR(500) | NULL | NULL | Icono |
| objective | JSONB | NOT NULL | '{}' | Objetivo (tipo, cantidad, condiciones) |
| xp_reward | INTEGER | NOT NULL | 0 | XP recompensa |
| ml_coins_reward | INTEGER | NOT NULL | 0 | ML Coins recompensa |
| bonus_rewards | JSONB | NULL | '{}' | Recompensas adicionales |
| difficulty | difficulty_level | NOT NULL | 'medium' | Dificultad |
| is_active | BOOLEAN | NOT NULL | true | Mision activa |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**RLS:** NO (catalogo global)
**Entity:** `MissionDefinition`

---

### missions.mission_daily_rotation
Rotacion diaria de misiones.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| date | DATE | NOT NULL | - | Fecha |
| mission_ids | UUID[] | NOT NULL | - | IDs de misiones activas |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**RLS:** NO (global)

---

### missions.mission_weekly_rotation
Rotacion semanal de misiones.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| week_start | DATE | NOT NULL | - | Inicio de semana |
| mission_ids | UUID[] | NOT NULL | - | IDs de misiones activas |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**RLS:** NO (global)

---

### missions.mission_progress
Progreso de cada estudiante en misiones.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| mission_id | UUID | NOT NULL | - | FK missions.mission_definitions |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| progress | NUMERIC(5,2) | NOT NULL | 0 | Progreso (0-100%) |
| current_count | INTEGER | NOT NULL | 0 | Conteo actual |
| target_count | INTEGER | NOT NULL | - | Conteo objetivo |
| status | mission_status | NOT NULL | 'active' | Estado |
| started_at | TIMESTAMPTZ | NOT NULL | NOW() | Inicio |
| completed_at | TIMESTAMPTZ | NULL | NULL | Completado |
| claimed_at | TIMESTAMPTZ | NULL | NULL | Recompensa reclamada |
| expires_at | TIMESTAMPTZ | NULL | NULL | Expiracion |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `MissionProgress`

---

### missions.quest_chains
Cadenas de quests especiales.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| name | VARCHAR(100) | NOT NULL | - | Nombre de la cadena |
| description | TEXT | NULL | NULL | Descripcion |
| mission_ids | UUID[] | NOT NULL | - | Misiones en orden |
| total_xp_reward | INTEGER | NOT NULL | 0 | XP total al completar cadena |
| bonus_item_id | UUID | NULL | NULL | FK store.store_items (bonus) |
| is_active | BOOLEAN | NOT NULL | true | Quest activa |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**RLS:** NO (catalogo global)

---

### missions.quest_progress
Progreso en cadenas de quests.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| quest_chain_id | UUID | NOT NULL | - | FK missions.quest_chains |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| current_step | INTEGER | NOT NULL | 0 | Paso actual |
| total_steps | INTEGER | NOT NULL | - | Total de pasos |
| status | quest_status | NOT NULL | 'in_progress' | Estado |
| started_at | TIMESTAMPTZ | NOT NULL | NOW() | Inicio |
| completed_at | TIMESTAMPTZ | NULL | NULL | Completado |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
