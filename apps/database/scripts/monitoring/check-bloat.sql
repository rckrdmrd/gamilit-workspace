-- Check table and index bloat
-- @ref GUIA-RUNBOOK-POSTGRESQL §4
--
-- Usage: psql -U gamilit_user -d gamilit_platform -f check-bloat.sql

SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) AS table_size,
  pg_size_pretty(pg_indexes_size(schemaname || '.' || tablename::regclass)) AS indexes_size,
  n_live_tup AS live_rows,
  n_dead_tup AS dead_rows
FROM pg_stat_user_tables
WHERE pg_total_relation_size(schemaname || '.' || tablename) > 10485760  -- > 10 MB
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC
LIMIT 20;
