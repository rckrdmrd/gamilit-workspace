---
title: "Runbook PostgreSQL — Mantenimiento y Queries de Referencia"
status: activo
last_updated: "2026-02-28"
---

# Runbook PostgreSQL — Mantenimiento y Queries de Referencia

**Proyecto:** GAMILIT
**Version:** 1.0.0
**Fecha:** 2026-02-14
**Aplica a:** PostgreSQL 15 — Base de datos gamilit_platform

---

## 8. Mantenimiento de Estadisticas

### 8.1 ANALYZE despues de bulk operations

```sql
-- Analizar una tabla especifica despues de bulk insert/update
ANALYZE progress_tracking.exercise_attempts;

-- Analizar un schema completo
-- (No hay comando nativo, usar DO block)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'progress_tracking'
  LOOP
    EXECUTE format('ANALYZE %I.%I', r.schemaname, r.tablename);
  END LOOP;
END $$;

-- Analizar toda la base de datos
ANALYZE;

-- Analizar con verbose (muestra progreso)
ANALYZE VERBOSE progress_tracking.exercise_attempts;
```

### 8.2 Resetear estadisticas

```sql
-- Resetear contadores de estadisticas (NO borra datos, solo contadores)
-- Usar despues de cambios significativos de configuracion
SELECT pg_stat_reset();

-- Resetear estadisticas de un objeto especifico
SELECT pg_stat_reset_single_table_counters(
  'progress_tracking.exercise_attempts'::regclass
);
```

### 8.3 Monitoreo de bloat con pgstattuple

```sql
-- Instalar extension
CREATE EXTENSION IF NOT EXISTS pgstattuple;

-- Verificar bloat de una tabla
SELECT * FROM pgstattuple('progress_tracking.exercise_attempts');

-- Verificar bloat de un indice
SELECT * FROM pgstatindex('progress_tracking.idx_exercise_attempts_student_id');

-- Query resumida de bloat para multiples tablas
SELECT
  schemaname || '.' || tablename AS table_name,
  pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) AS size,
  (pgstattuple(schemaname || '.' || tablename)).dead_tuple_percent AS dead_pct
FROM pg_tables
WHERE schemaname IN ('progress_tracking', 'gamification_system', 'audit_logging')
ORDER BY (pgstattuple(schemaname || '.' || tablename)).dead_tuple_percent DESC;
```

---

## 9. Queries Utiles de Referencia Rapida

### 9.1 Top 10 tablas por tamano

```sql
SELECT
  schemaname || '.' || tablename AS table_name,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS total_size,
  n_live_tup AS row_count
FROM pg_tables
JOIN pg_stat_user_tables USING (schemaname, relname)
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC
LIMIT 10;
```

### 9.2 Conexiones por estado

```sql
SELECT
  state,
  count(*) AS connections,
  round(count(*)::numeric / sum(count(*)) OVER () * 100, 1) AS pct
FROM pg_stat_activity
WHERE datname = 'gamilit_platform'
GROUP BY state
ORDER BY connections DESC;
```

### 9.3 Queries activas mas lentas

```sql
SELECT
  pid,
  usename,
  now() - query_start AS duration,
  state,
  left(query, 120) AS query_preview
FROM pg_stat_activity
WHERE datname = 'gamilit_platform'
  AND state = 'active'
  AND pid != pg_backend_pid()
ORDER BY query_start ASC
LIMIT 10;
```

### 9.4 Cache hit ratio global

```sql
SELECT
  'index' AS type,
  round(sum(idx_blks_hit)::numeric / NULLIF(sum(idx_blks_hit + idx_blks_read), 0) * 100, 2) AS hit_ratio
FROM pg_statio_user_indexes
UNION ALL
SELECT
  'table' AS type,
  round(sum(heap_blks_hit)::numeric / NULLIF(sum(heap_blks_hit + heap_blks_read), 0) * 100, 2)
FROM pg_statio_user_tables;
```

### 9.5 Tamano total de indices por schema

```sql
SELECT
  schemaname,
  count(*) AS num_indexes,
  pg_size_pretty(sum(pg_relation_size(indexrelid))) AS total_index_size
FROM pg_stat_user_indexes
GROUP BY schemaname
ORDER BY sum(pg_relation_size(indexrelid)) DESC;
```

### 9.6 Actividad de transacciones

```sql
SELECT
  datname,
  xact_commit AS commits,
  xact_rollback AS rollbacks,
  round(xact_rollback::numeric / NULLIF(xact_commit + xact_rollback, 0) * 100, 2) AS rollback_pct,
  tup_returned,
  tup_fetched,
  tup_inserted,
  tup_updated,
  tup_deleted
FROM pg_stat_database
WHERE datname = 'gamilit_platform';
```

### 9.7 Age de transacciones (prevenir wraparound)

```sql
-- Verificar age de las tablas (PostgreSQL tiene limite de 2 billones de transacciones)
SELECT
  schemaname || '.' || relname AS table_name,
  age(relfrozenxid) AS xid_age,
  pg_size_pretty(pg_total_relation_size(oid)) AS size
FROM pg_class
JOIN pg_tables ON pg_class.relname = pg_tables.tablename
WHERE pg_tables.schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY age(relfrozenxid) DESC
LIMIT 10;

-- El autovacuum deberia mantener esto bajo ~200 millones
-- Si se acerca a 1 billon, requiere VACUUM FREEZE urgente
```
