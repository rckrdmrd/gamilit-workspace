---
title: "Runbook PostgreSQL — Entorno y Monitoreo de Salud"
status: activo
last_updated: "2026-02-28"
---

# Runbook PostgreSQL — Entorno y Monitoreo de Salud

**Proyecto:** GAMILIT
**Version:** 1.0.0
**Fecha:** 2026-02-14
**Aplica a:** PostgreSQL 15 — Base de datos gamilit_platform

---

## 1. Informacion del Entorno

| Aspecto | Dev (WSL/Windows) | Produccion (74.208.126.102) |
|---------|-------------------|----------------------------|
| Version | PostgreSQL 15 | PostgreSQL 15 |
| Database | gamilit_platform | gamilit_platform |
| Usuario App | gamilit_user | gamilit_user |
| Password App | gamilit_dev_2026 | (credenciales seguras) |
| Superuser | postgres | postgres |
| Puerto | 5432 | 5432 |
| Host | 127.0.0.1 | localhost |

### Metricas de la Base de Datos

| Metrica | Cantidad |
|---------|----------|
| Schemas | 18 (16 activos + 2 placeholder) |
| Tablas | 173 |
| Views | 18 |
| Materialized Views | 7 |
| Funciones | 158 (DDL source) |
| Triggers | 68 |
| Politicas RLS | 251 (DDL source) |
| Foreign Keys | 301 |
| ENUMs | 42 |

### Schemas Activos (16)

| Schema | Proposito | Tablas Aprox. |
|--------|-----------|---------------|
| auth | Autenticacion JWT + sesiones | 5 |
| auth_management | Gestion de usuarios y roles | 12 |
| educational_content | Modulos y ejercicios educativos | 25 |
| progress_tracking | Seguimiento de progreso estudiantil | 18 |
| gamification_system | XP, rangos maya, logros, ML Coins | 20 |
| social_features | Interacciones sociales, equipos | 10 |
| content_management | Gestion de contenido, media | 8 |
| communication | Mensajeria, notificaciones internas | 8 |
| notifications | Email, push, SMS, in-app | 6 |
| audit_logging | Auditoria y logs del sistema | 5 |
| system_configuration | Configuracion del sistema | 8 |
| admin_dashboard | Dashboard administrativo | 6 |
| lti_integration | Integracion LTI con LMS | 5 |
| storage | Almacenamiento de archivos | 4 |
| data_warehouse | Data warehouse y analytics | 15 |
| gamilit | Funciones compartidas cross-schema | 3 |

### Schemas Placeholder (2)

| Schema | Estado |
|--------|--------|
| optimization | Reservado para indices/particiones futuras |
| public | Schema por defecto PostgreSQL |

---

## 2. Monitoreo de Salud

### 2.1 Conexiones activas

```sql
-- Conexiones activas por estado
SELECT state, count(*)
FROM pg_stat_activity
WHERE datname = 'gamilit_platform'
GROUP BY state
ORDER BY count DESC;

-- Detalle de conexiones activas (no idle)
SELECT pid, usename, application_name, client_addr,
       state, query_start, now() - query_start AS duration,
       left(query, 100) AS query_preview
FROM pg_stat_activity
WHERE datname = 'gamilit_platform'
  AND state != 'idle'
ORDER BY query_start;

-- Conexiones por usuario
SELECT usename, count(*)
FROM pg_stat_activity
WHERE datname = 'gamilit_platform'
GROUP BY usename;
```

### 2.2 Tamano de base de datos

```sql
-- Tamano total de la base de datos
SELECT pg_size_pretty(pg_database_size('gamilit_platform')) AS db_size;

-- Top 20 tablas mas grandes (incluyendo indices y TOAST)
SELECT
  schemaname || '.' || tablename AS table_full_name,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) AS table_size,
  pg_size_pretty(pg_indexes_size(schemaname || '.' || tablename)) AS index_size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC
LIMIT 20;

-- Tamano por schema
SELECT
  schemaname,
  count(*) AS num_tables,
  pg_size_pretty(sum(pg_total_relation_size(schemaname || '.' || tablename))) AS total_size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
GROUP BY schemaname
ORDER BY sum(pg_total_relation_size(schemaname || '.' || tablename)) DESC;
```

### 2.3 Queries lentas (pg_stat_statements)

```sql
-- Habilitar extension (requiere superuser, una sola vez)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Top 10 queries mas lentas por tiempo total
SELECT
  left(query, 100) AS query_preview,
  calls,
  round(total_exec_time::numeric, 2) AS total_ms,
  round(mean_exec_time::numeric, 2) AS avg_ms,
  round(max_exec_time::numeric, 2) AS max_ms,
  rows
FROM pg_stat_statements
WHERE dbid = (SELECT oid FROM pg_database WHERE datname = 'gamilit_platform')
ORDER BY total_exec_time DESC
LIMIT 10;

-- Top 10 queries por frecuencia de llamadas
SELECT
  left(query, 100) AS query_preview,
  calls,
  round(mean_exec_time::numeric, 2) AS avg_ms,
  rows
FROM pg_stat_statements
WHERE dbid = (SELECT oid FROM pg_database WHERE datname = 'gamilit_platform')
ORDER BY calls DESC
LIMIT 10;

-- Resetear estadisticas (usar con precaucion)
-- SELECT pg_stat_statements_reset();
```

### 2.4 Bloqueos activos

```sql
-- Detectar bloqueos activos (locks)
SELECT
  blocked_locks.pid AS blocked_pid,
  blocked_activity.usename AS blocked_user,
  left(blocked_activity.query, 80) AS blocked_query,
  blocking_locks.pid AS blocking_pid,
  blocking_activity.usename AS blocking_user,
  left(blocking_activity.query, 80) AS blocking_query
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity
  ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks
  ON blocking_locks.locktype = blocked_locks.locktype
  AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
  AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
  AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
  AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
  AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
  AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
  AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
  AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
  AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
  AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity
  ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;

-- Terminar un proceso bloqueado (usar con precaucion)
-- SELECT pg_terminate_backend(<pid>);
```

### 2.5 Cache hit ratio

```sql
-- Cache hit ratio general (debe ser > 99% en produccion)
SELECT
  sum(heap_blks_read) AS heap_read,
  sum(heap_blks_hit) AS heap_hit,
  round(sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0) * 100, 2) AS cache_hit_ratio
FROM pg_statio_user_tables;

-- Cache hit ratio por tabla
SELECT
  schemaname || '.' || relname AS table_name,
  heap_blks_read,
  heap_blks_hit,
  round(heap_blks_hit::numeric / NULLIF(heap_blks_hit + heap_blks_read, 0) * 100, 2) AS hit_ratio
FROM pg_statio_user_tables
WHERE heap_blks_read + heap_blks_hit > 100
ORDER BY hit_ratio ASC
LIMIT 20;

-- Cache hit ratio de indices
SELECT
  schemaname || '.' || relname AS table_name,
  indexrelname AS index_name,
  idx_blks_read,
  idx_blks_hit,
  round(idx_blks_hit::numeric / NULLIF(idx_blks_hit + idx_blks_read, 0) * 100, 2) AS hit_ratio
FROM pg_statio_user_indexes
WHERE idx_blks_read + idx_blks_hit > 100
ORDER BY hit_ratio ASC
LIMIT 20;
```
