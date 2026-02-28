---
titulo: "Schema 7: analytics"
tipo: arquitectura
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# Schema 7: analytics (5 tablas, 18 RLS policies)

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

### analytics.analytics_events
Eventos de tracking (event sourcing).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| user_id | UUID | NOT NULL | - | FK auth.users |
| event_type | VARCHAR(50) | NOT NULL | - | Tipo de evento |
| event_data | JSONB | NOT NULL | '{}' | Datos del evento |
| session_id | UUID | NULL | NULL | ID de sesion |
| ip_address | INET | NULL | NULL | IP |
| user_agent | VARCHAR(500) | NULL | NULL | User agent |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Indices:** `idx_analytics_events_type_date`, `idx_analytics_events_user`

---

### analytics.analytics_daily
Resumen diario por estudiante.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| date | DATE | NOT NULL | - | Fecha |
| exercises_completed | INTEGER | NOT NULL | 0 | Ejercicios completados |
| xp_earned | INTEGER | NOT NULL | 0 | XP ganado |
| time_spent_minutes | INTEGER | NOT NULL | 0 | Tiempo en plataforma |
| average_score | NUMERIC(5,2) | NULL | NULL | Puntaje promedio |
| sessions_count | INTEGER | NOT NULL | 0 | Numero de sesiones |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Indices:** `idx_analytics_daily_student_date` UNIQUE (student_id, date, tenant_id)

---

### analytics.analytics_weekly
Resumen semanal (agregado de daily).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| week_start | DATE | NOT NULL | - | Inicio de semana |
| week_end | DATE | NOT NULL | - | Fin de semana |
| exercises_completed | INTEGER | NOT NULL | 0 | Total ejercicios |
| xp_earned | INTEGER | NOT NULL | 0 | Total XP |
| time_spent_minutes | INTEGER | NOT NULL | 0 | Total tiempo |
| average_score | NUMERIC(5,2) | NULL | NULL | Promedio semanal |
| active_days | INTEGER | NOT NULL | 0 | Dias activos |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### analytics.analytics_monthly
Resumen mensual.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| student_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| month | DATE | NOT NULL | - | Primer dia del mes |
| exercises_completed | INTEGER | NOT NULL | 0 | Total ejercicios |
| xp_earned | INTEGER | NOT NULL | 0 | Total XP |
| time_spent_minutes | INTEGER | NOT NULL | 0 | Total tiempo |
| average_score | NUMERIC(5,2) | NULL | NULL | Promedio mensual |
| active_days | INTEGER | NOT NULL | 0 | Dias activos |
| modules_progress | JSONB | NULL | '{}' | Progreso por modulo |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### analytics.engagement_metrics
Metricas agregadas de engagement (DAU, WAU, MAU).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| date | DATE | NOT NULL | - | Fecha |
| dau | INTEGER | NOT NULL | 0 | Daily Active Users |
| wau | INTEGER | NOT NULL | 0 | Weekly Active Users |
| mau | INTEGER | NOT NULL | 0 | Monthly Active Users |
| avg_session_minutes | NUMERIC(5,1) | NOT NULL | 0 | Sesion promedio |
| retention_d1 | NUMERIC(5,2) | NULL | NULL | Retention dia 1 |
| retention_d7 | NUMERIC(5,2) | NULL | NULL | Retention dia 7 |
| retention_d30 | NUMERIC(5,2) | NULL | NULL | Retention dia 30 |
| metrics_data | JSONB | NULL | '{}' | Metricas adicionales |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
