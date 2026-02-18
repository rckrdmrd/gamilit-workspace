# Schema 12: leaderboard (4 tablas, 12 RLS policies)

> **Nota:** Este documento describe el modelo conceptual. Para definiciones DDL exactas, consultar `apps/database/ddl/schemas/`.

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

### leaderboard.leaderboard_entries
Entradas de ranking por estudiante.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| classroom_id | UUID | NULL | NULL | FK classrooms.classrooms |
| season_id | UUID | NULL | NULL | FK leaderboard.leaderboard_seasons |
| scope | VARCHAR(20) | NOT NULL | - | classroom, school, global |
| total_xp | INTEGER | NOT NULL | 0 | XP total en el scope |
| rank_position | INTEGER | NULL | NULL | Posicion actual |
| previous_position | INTEGER | NULL | NULL | Posicion anterior |
| exercises_completed | INTEGER | NOT NULL | 0 | Ejercicios completados |
| average_score | NUMERIC(5,2) | NULL | NULL | Puntaje promedio |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `LeaderboardEntry`

---

### leaderboard.leaderboard_seasons
Temporadas de leaderboard.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| name | VARCHAR(100) | NOT NULL | - | Nombre de temporada |
| number | INTEGER | NOT NULL | - | Numero de temporada |
| starts_at | TIMESTAMPTZ | NOT NULL | - | Inicio |
| ends_at | TIMESTAMPTZ | NOT NULL | - | Fin |
| status | season_status | NOT NULL | 'upcoming' | upcoming, active, ended |
| rewards | JSONB | NULL | '{}' | Recompensas por posicion |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**RLS:** NO (global)
**Entity:** `LeaderboardSeason`

---

### leaderboard.leaderboard_history
Historial de posiciones por snapshot.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| season_id | UUID | NOT NULL | - | FK leaderboard.leaderboard_seasons |
| scope | VARCHAR(20) | NOT NULL | - | classroom, school, global |
| position | INTEGER | NOT NULL | - | Posicion en ese momento |
| xp_total | INTEGER | NOT NULL | - | XP al momento |
| snapshot_date | TIMESTAMPTZ | NOT NULL | - | Fecha del snapshot |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### leaderboard.season_rewards
Recompensas distribuidas al final de temporada.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| season_id | UUID | NOT NULL | - | FK leaderboard.leaderboard_seasons |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| position | INTEGER | NOT NULL | - | Posicion final |
| scope | VARCHAR(20) | NOT NULL | - | Scope del leaderboard |
| xp_reward | INTEGER | NOT NULL | 0 | XP recompensa |
| ml_coins_reward | INTEGER | NOT NULL | 0 | ML Coins recompensa |
| item_id | UUID | NULL | NULL | FK store.store_items |
| claimed | BOOLEAN | NOT NULL | false | Reclamado |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
