-- Check slow queries via pg_stat_statements
-- @ref GUIA-RUNBOOK-POSTGRESQL §3.1
--
-- Requires: CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
-- Usage: psql -U gamilit_user -d gamilit_platform -f check-slow-queries.sql

SELECT
  queryid,
  calls,
  round(total_exec_time::numeric, 2) AS total_time_ms,
  round(mean_exec_time::numeric, 2) AS mean_time_ms,
  round(max_exec_time::numeric, 2) AS max_time_ms,
  rows,
  left(query, 120) AS query_preview
FROM pg_stat_statements
WHERE dbid = (SELECT oid FROM pg_database WHERE datname = current_database())
ORDER BY mean_exec_time DESC
LIMIT 20;
