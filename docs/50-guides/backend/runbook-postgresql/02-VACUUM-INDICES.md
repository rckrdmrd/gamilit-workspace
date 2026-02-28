---
title: "Runbook PostgreSQL — VACUUM y Indices"
status: activo
last_updated: "2026-02-28"
---

# Runbook PostgreSQL — VACUUM y Indices

**Proyecto:** GAMILIT
**Version:** 1.0.0
**Fecha:** 2026-02-14
**Aplica a:** PostgreSQL 15 — Base de datos gamilit_platform

---

## 3. VACUUM y Autovacuum

### 3.1 Configuracion recomendada para gamilit

Con 173 tablas y 251 politicas RLS, el autovacuum debe estar bien afinado para evitar table bloat y degradacion de queries con RLS.

```sql
-- Verificar configuracion actual de autovacuum
SHOW autovacuum;
SHOW autovacuum_vacuum_threshold;
SHOW autovacuum_vacuum_scale_factor;
SHOW autovacuum_analyze_threshold;
SHOW autovacuum_analyze_scale_factor;
```

**Valores recomendados en `postgresql.conf`:**

```ini
# Autovacuum general
autovacuum = on
autovacuum_max_workers = 4                    # Default es 3; gamilit tiene 173 tablas
autovacuum_naptime = 30s                       # Verificar cada 30 segundos (default 1min)
autovacuum_vacuum_threshold = 50               # Minimo de tuplas muertas antes de vacuum
autovacuum_vacuum_scale_factor = 0.1           # 10% de la tabla (default 20%)
autovacuum_analyze_threshold = 50
autovacuum_analyze_scale_factor = 0.05         # 5% de la tabla (default 10%)
autovacuum_vacuum_cost_delay = 2ms             # Reducir delay para vacuum mas agresivo
```

### 3.2 Tablas con configuracion especial

Las siguientes tablas de gamilit requieren VACUUM mas frecuente por alto volumen de escrituras:

```sql
-- progress_tracking.student_progress — Actualizaciones frecuentes de progreso
ALTER TABLE progress_tracking.student_progress
  SET (autovacuum_vacuum_scale_factor = 0.02,
       autovacuum_analyze_scale_factor = 0.01);

-- progress_tracking.exercise_attempts — Inserciones masivas durante uso
ALTER TABLE progress_tracking.exercise_attempts
  SET (autovacuum_vacuum_scale_factor = 0.02,
       autovacuum_analyze_scale_factor = 0.01);

-- audit_logging.audit_logs — Inserciones continuas de auditoria
ALTER TABLE audit_logging.audit_logs
  SET (autovacuum_vacuum_scale_factor = 0.05,
       autovacuum_analyze_scale_factor = 0.02);

-- gamification_system.xp_transactions — Transacciones de XP frecuentes
ALTER TABLE gamification_system.xp_transactions
  SET (autovacuum_vacuum_scale_factor = 0.02,
       autovacuum_analyze_scale_factor = 0.01);

-- auth.sessions — Sessions con alta rotacion
ALTER TABLE auth.sessions
  SET (autovacuum_vacuum_scale_factor = 0.05,
       autovacuum_analyze_scale_factor = 0.02);
```

### 3.3 Verificar estado de autovacuum

```sql
-- Tablas que necesitan VACUUM (tuplas muertas altas)
SELECT
  schemaname || '.' || relname AS table_name,
  n_live_tup,
  n_dead_tup,
  round(n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0) * 100, 2) AS dead_pct,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC
LIMIT 20;

-- Verificar si autovacuum esta corriendo ahora
SELECT pid, query, query_start, now() - query_start AS duration
FROM pg_stat_activity
WHERE query LIKE 'autovacuum:%';
```

### 3.4 VACUUM FULL (requiere downtime)

**Cuando usar:** Solo cuando table bloat es significativo (>30% del espacio es desperdicio). VACUUM FULL reescribe la tabla completa y requiere un lock exclusivo.

```sql
-- Verificar bloat antes de decidir VACUUM FULL
-- (requiere extension pgstattuple)
CREATE EXTENSION IF NOT EXISTS pgstattuple;

SELECT
  table_len,
  tuple_count,
  tuple_len,
  dead_tuple_count,
  dead_tuple_len,
  round(dead_tuple_len::numeric / NULLIF(table_len, 0) * 100, 2) AS dead_pct,
  free_space,
  round(free_space::numeric / NULLIF(table_len, 0) * 100, 2) AS free_pct
FROM pgstattuple('progress_tracking.exercise_attempts');

-- Ejecutar VACUUM FULL (CUIDADO: lock exclusivo, downtime requerido)
-- VACUUM FULL ANALYZE progress_tracking.exercise_attempts;
```

**Procedimiento seguro:**
1. Programar ventana de mantenimiento
2. Detener aplicacion (PM2 stop)
3. Ejecutar `VACUUM FULL ANALYZE <tabla>;`
4. Verificar tamano reducido
5. Reiniciar aplicacion (PM2 start)

---

## 4. Indices y Performance

### 4.1 Indices no utilizados

```sql
-- Indices no utilizados (0 scans desde ultimo reset de stats)
SELECT
  schemaname || '.' || relname AS table_name,
  indexrelname AS index_name,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
  idx_scan AS times_used,
  idx_tup_read AS tuples_read
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;
```

**Nota:** Antes de eliminar un indice no utilizado, verificar que:
- Las estadisticas no fueron reseteadas recientemente
- El indice no es usado por politicas RLS (gamilit tiene 251 RLS que pueden depender de indices)
- El indice no es una FK constraint (PostgreSQL no crea indices automaticos para FK)

### 4.2 Sequential scans en tablas grandes

```sql
-- Tablas con muchos sequential scans (posible indice faltante)
SELECT
  schemaname || '.' || relname AS table_name,
  seq_scan,
  seq_tup_read,
  idx_scan,
  CASE WHEN seq_scan > 0
    THEN round(seq_tup_read::numeric / seq_scan, 0)
    ELSE 0
  END AS avg_rows_per_seq_scan,
  n_live_tup
FROM pg_stat_user_tables
WHERE seq_scan > 100
  AND n_live_tup > 1000
ORDER BY seq_tup_read DESC
LIMIT 20;
```

### 4.3 Indices faltantes (missing indexes)

```sql
-- Tablas que se beneficiarian de indices adicionales
-- (alto ratio seq_scan vs idx_scan con muchas tuplas)
SELECT
  schemaname || '.' || relname AS table_name,
  seq_scan,
  idx_scan,
  n_live_tup,
  round(seq_scan::numeric / NULLIF(seq_scan + idx_scan, 0) * 100, 2) AS seq_scan_pct
FROM pg_stat_user_tables
WHERE n_live_tup > 500
  AND seq_scan > idx_scan
ORDER BY n_live_tup DESC
LIMIT 20;
```

### 4.4 Reindex

```sql
-- Reindex de un indice especifico
REINDEX INDEX CONCURRENTLY gamification_system.idx_xp_transactions_student_id;

-- Reindex de toda una tabla
REINDEX TABLE CONCURRENTLY progress_tracking.student_progress;

-- Reindex de todo un schema
REINDEX SCHEMA CONCURRENTLY gamification_system;
```

**Nota:** Usar `CONCURRENTLY` en PostgreSQL 15 para evitar locks exclusivos durante reindex. Sin `CONCURRENTLY`, la tabla queda bloqueada para escrituras.

### 4.5 Analisis de indices duplicados

```sql
-- Detectar indices potencialmente duplicados
SELECT
  a.indrelid::regclass AS table_name,
  a.indexrelid::regclass AS index_a,
  b.indexrelid::regclass AS index_b,
  pg_size_pretty(pg_relation_size(a.indexrelid)) AS size_a,
  pg_size_pretty(pg_relation_size(b.indexrelid)) AS size_b
FROM pg_index a
JOIN pg_index b ON a.indrelid = b.indrelid
  AND a.indexrelid != b.indexrelid
  AND a.indkey::text = b.indkey::text
WHERE a.indexrelid < b.indexrelid;
```
