-- Check tables that need vacuuming
-- @ref GUIA-RUNBOOK-POSTGRESQL §3
--
-- Usage: psql -U gamilit_user -d gamilit_platform -f check-vacuum.sql

SELECT
  schemaname,
  relname AS table_name,
  n_dead_tup AS dead_tuples,
  n_live_tup AS live_tuples,
  CASE
    WHEN n_live_tup > 0 THEN round(n_dead_tup::numeric / n_live_tup * 100, 2)
    ELSE 0
  END AS dead_pct,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
   OR (n_live_tup > 0 AND n_dead_tup::numeric / n_live_tup > 0.1)
ORDER BY n_dead_tup DESC
LIMIT 20;
