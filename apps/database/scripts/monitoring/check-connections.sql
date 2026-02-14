-- Check active database connections
-- @ref GUIA-RUNBOOK-POSTGRESQL §5
--
-- Usage: psql -U gamilit_user -d gamilit_platform -f check-connections.sql

-- Connection summary
SELECT
  count(*) AS total_connections,
  count(*) FILTER (WHERE state = 'active') AS active,
  count(*) FILTER (WHERE state = 'idle') AS idle,
  count(*) FILTER (WHERE state = 'idle in transaction') AS idle_in_transaction,
  count(*) FILTER (WHERE wait_event_type IS NOT NULL) AS waiting
FROM pg_stat_activity
WHERE datname = current_database();

-- Connection details by application
SELECT
  application_name,
  usename,
  state,
  count(*) AS connections,
  max(now() - backend_start) AS oldest_connection
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY application_name, usename, state
ORDER BY connections DESC;

-- Long-running queries (> 60 seconds)
SELECT
  pid,
  usename,
  application_name,
  state,
  now() - query_start AS duration,
  left(query, 100) AS query_preview
FROM pg_stat_activity
WHERE datname = current_database()
  AND state = 'active'
  AND now() - query_start > interval '60 seconds'
ORDER BY duration DESC;
