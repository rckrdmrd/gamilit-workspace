# Runbook PostgreSQL para Gamilit

---
titulo: Runbook PostgreSQL para Gamilit
version: 1.0.0
fecha_creacion: 2026-02-14
tags: [database, postgresql, runbook, operaciones]
aplica_a: [database, devops]
estado: vigente
---

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

---

## 5. Backup y Restore

### 5.1 Backup logico con pg_dump

```bash
# Backup completo en formato custom (comprimido, mas flexible para restore)
pg_dump -h localhost -U postgres -d gamilit_platform \
  -Fc -f /backup/gamilit_platform_$(date +%Y%m%d_%H%M%S).dump

# Backup solo estructura (DDL) — util para comparar con DDL en repo
pg_dump -h localhost -U postgres -d gamilit_platform \
  --schema-only -f /backup/gamilit_schema_$(date +%Y%m%d).sql

# Backup de un schema especifico
pg_dump -h localhost -U postgres -d gamilit_platform \
  -n gamification_system \
  -Fc -f /backup/gamification_$(date +%Y%m%d).dump

# Backup solo datos (sin estructura)
pg_dump -h localhost -U postgres -d gamilit_platform \
  --data-only -Fc -f /backup/gamilit_data_$(date +%Y%m%d).dump
```

### 5.2 Backup fisico con pg_basebackup

```bash
# Backup fisico completo (para PITR)
pg_basebackup -h localhost -U postgres \
  -D /backup/base_$(date +%Y%m%d) \
  -Ft -z -P --checkpoint=fast

# Verificar backup
pg_verifybackup /backup/base_$(date +%Y%m%d)
```

### 5.3 Restore desde dump

```bash
# Restore completo desde formato custom
pg_restore -h localhost -U postgres \
  -d gamilit_platform \
  --clean --if-exists \
  /backup/gamilit_platform_20260214_120000.dump

# Restore de un schema especifico
pg_restore -h localhost -U postgres \
  -d gamilit_platform \
  -n gamification_system \
  /backup/gamilit_platform_20260214_120000.dump

# Restore solo estructura
pg_restore -h localhost -U postgres \
  -d gamilit_platform \
  --schema-only \
  /backup/gamilit_platform_20260214_120000.dump

# Restore solo datos
pg_restore -h localhost -U postgres \
  -d gamilit_platform \
  --data-only \
  /backup/gamilit_platform_20260214_120000.dump
```

### 5.4 Point-in-Time Recovery (PITR) con WAL

**Configuracion en `postgresql.conf`:**

```ini
# Habilitar WAL archiving
wal_level = replica
archive_mode = on
archive_command = 'cp %p /backup/wal_archive/%f'
```

**Procedimiento de recovery:**

1. Detener PostgreSQL
2. Copiar base backup a data directory
3. Crear `recovery.signal` en data directory
4. Configurar en `postgresql.conf`:
   ```ini
   restore_command = 'cp /backup/wal_archive/%f %p'
   recovery_target_time = '2026-02-14 12:00:00'
   ```
5. Iniciar PostgreSQL
6. Verificar que recovery fue exitoso
7. Ejecutar `SELECT pg_wal_replay_resume();` si esta en pause

### 5.5 Rotacion de backups

```bash
#!/bin/bash
# Script de rotacion: retener los ultimos 7 backups
BACKUP_DIR="/backup"
RETENTION_DAYS=7

# Backup diario
pg_dump -h localhost -U postgres -d gamilit_platform \
  -Fc -f "${BACKUP_DIR}/gamilit_$(date +%Y%m%d).dump"

# Eliminar backups mas antiguos que $RETENTION_DAYS dias
find "${BACKUP_DIR}" -name "gamilit_*.dump" -mtime +${RETENTION_DAYS} -delete

# Log
echo "$(date): Backup completado, backups antiguos eliminados" >> "${BACKUP_DIR}/backup.log"
```

**Programar con cron (produccion):**

```bash
# Backup diario a las 2:00 AM
0 2 * * * /scripts/backup-gamilit.sh >> /var/log/gamilit-backup.log 2>&1
```

---

## 6. Troubleshooting Deadlocks

### 6.1 Detectar deadlocks

```sql
-- Verificar si hay deadlocks recientes en el log
-- (requiere log_lock_waits = on en postgresql.conf)
SHOW log_lock_waits;
SHOW deadlock_timeout;
```

**Configuracion recomendada en `postgresql.conf`:**

```ini
log_lock_waits = on
deadlock_timeout = 1s          # Default es 1s, adecuado para gamilit
lock_timeout = 30s             # Timeout maximo para adquirir un lock
statement_timeout = 60s        # Timeout maximo para un statement
```

### 6.2 Detectar esperas de locks en tiempo real

```sql
-- Procesos esperando locks
SELECT
  pg_blocking_pids(pid) AS blocking_pids,
  pid,
  usename,
  left(query, 100) AS query,
  wait_event_type,
  wait_event,
  state,
  now() - query_start AS duration
FROM pg_stat_activity
WHERE wait_event_type = 'Lock'
ORDER BY query_start;
```

### 6.3 Patrones comunes de deadlock en gamilit

**Problema: RLS + triggers con FK cruzadas**

gamilit tiene 251 politicas RLS y 68 triggers que pueden causar deadlocks cuando:
- Dos transacciones actualizan tablas relacionadas por FK en orden diferente
- Un trigger en tabla A actualiza tabla B mientras otra transaccion hace lo inverso
- RLS policies ejecutan subqueries que toman locks adicionales

**Solucion: Ordenar locks consistentemente**

```
CORRECTO:
  Transaccion 1: Lock tabla A -> Lock tabla B -> Commit
  Transaccion 2: Lock tabla A -> Lock tabla B -> Commit

INCORRECTO:
  Transaccion 1: Lock tabla A -> Lock tabla B -> Commit
  Transaccion 2: Lock tabla B -> Lock tabla A -> DEADLOCK
```

**Ejemplo real en gamilit:**

Cuando un estudiante completa un ejercicio, el sistema debe:
1. Insertar en `progress_tracking.exercise_attempts`
2. Actualizar `progress_tracking.student_progress`
3. Insertar en `gamification_system.xp_transactions`
4. Actualizar `gamification_system.student_rankings`

Estas 4 operaciones DEBEN ejecutarse siempre en este orden para evitar deadlocks.

### 6.4 Terminar procesos bloqueados

```sql
-- Cancelar query (gentil, permite cleanup)
SELECT pg_cancel_backend(<pid>);

-- Terminar conexion (forzado, desconecta la sesion)
SELECT pg_terminate_backend(<pid>);

-- Terminar todas las conexiones bloqueadas de mas de 5 minutos
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'active'
  AND now() - query_start > interval '5 minutes'
  AND pid != pg_backend_pid()
  AND datname = 'gamilit_platform';
```

---

## 7. RLS Debugging

### 7.1 Verificar politicas activas por tabla

```sql
-- Listar todas las politicas RLS de una tabla
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  left(qual::text, 100) AS using_clause,
  left(with_check::text, 100) AS with_check_clause
FROM pg_policies
WHERE schemaname = 'educational_content'
  AND tablename = 'exercises'
ORDER BY policyname;

-- Contar politicas RLS por schema
SELECT
  schemaname,
  count(*) AS policy_count
FROM pg_policies
GROUP BY schemaname
ORDER BY policy_count DESC;

-- Total de politicas RLS
SELECT count(*) AS total_rls_policies FROM pg_policies;

-- Tablas con RLS habilitado
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE rowsecurity = true
ORDER BY schemaname, tablename;
```

### 7.2 Testear como gamilit_user

```sql
-- Cambiar a rol de aplicacion para testear RLS
SET ROLE gamilit_user;

-- Configurar variables de sesion que RLS espera (simular tenant)
SET app.current_tenant_id = '<tenant-uuid>';
SET app.current_user_id = '<user-uuid>';
SET app.current_user_role = 'student';

-- Ejecutar query que se quiere testear
SELECT * FROM educational_content.exercises LIMIT 5;

-- Volver a superuser
RESET ROLE;
```

### 7.3 Troubleshoot "permission denied" errors

```sql
-- Verificar permisos del usuario en un schema
SELECT
  table_schema,
  table_name,
  privilege_type
FROM information_schema.table_privileges
WHERE grantee = 'gamilit_user'
  AND table_schema = 'educational_content'
ORDER BY table_name, privilege_type;

-- Verificar si RLS esta habilitado en la tabla
SELECT
  relname,
  relrowsecurity,
  relforcerowsecurity
FROM pg_class
WHERE relname = 'exercises'
  AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'educational_content');

-- Grant permisos faltantes (ejecutar como postgres)
GRANT USAGE ON SCHEMA educational_content TO gamilit_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA educational_content TO gamilit_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA educational_content TO gamilit_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA educational_content TO gamilit_user;
```

### 7.4 Funciones de RLS pendientes (auth.uid y gamilit.is_super_admin)

**Estado actual:** Aproximadamente 60 politicas RLS dependen de `auth.uid()` y 6 dependen de `gamilit.is_super_admin()`. Estas funciones NO existen aun en la base de datos.

```sql
-- Verificar si auth.uid() existe
SELECT proname, pronamespace::regnamespace
FROM pg_proc
WHERE proname = 'uid' AND pronamespace = 'auth'::regnamespace;

-- Verificar si gamilit.is_super_admin() existe
SELECT proname, pronamespace::regnamespace
FROM pg_proc
WHERE proname = 'is_super_admin' AND pronamespace = 'gamilit'::regnamespace;

-- Listar politicas que dependen de auth.uid()
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE qual::text LIKE '%auth.uid()%'
   OR with_check::text LIKE '%auth.uid()%';

-- Listar politicas que dependen de gamilit.is_super_admin()
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE qual::text LIKE '%is_super_admin%'
   OR with_check::text LIKE '%is_super_admin%';
```

**Impacto:** Hasta que estas funciones sean implementadas, las politicas RLS que dependen de ellas fallaran con error de funcion no encontrada. El archivo DDL pendiente es `apps/database/ddl/schemas/auth/functions/` y `apps/database/ddl/schemas/gamilit/functions/05b-is_super_admin.sql`.

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

---

## 10. Procedimientos de Emergencia

### 10.1 Base de datos no responde

```bash
# 1. Verificar que PostgreSQL esta corriendo
sudo systemctl status postgresql

# 2. Verificar logs
sudo tail -100 /var/log/postgresql/postgresql-15-main.log

# 3. Verificar espacio en disco
df -h

# 4. Verificar conexiones (desde otra terminal)
psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# 5. Si hay demasiadas conexiones, terminar idle
psql -U postgres -c "
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE state = 'idle'
    AND now() - state_change > interval '10 minutes'
    AND pid != pg_backend_pid();"

# 6. Si nada funciona, reiniciar (ultimo recurso)
sudo systemctl restart postgresql
```

### 10.2 Disco lleno

```bash
# 1. Verificar que consume espacio
du -sh /var/lib/postgresql/15/main/*

# 2. Limpiar WAL antiguos (si archive_mode esta activo)
# CUIDADO: solo si los backups estan confirmados
pg_archivecleanup /backup/wal_archive $(pg_controldata | grep "Latest checkpoint's REDO WAL file" | awk '{print $NF}')

# 3. Verificar tablas con bloat
psql -U postgres -d gamilit_platform -c "
  SELECT schemaname || '.' || tablename AS t,
         pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS size
  FROM pg_tables
  WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
  ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC
  LIMIT 5;"

# 4. VACUUM (sin FULL, no requiere espacio extra)
psql -U postgres -d gamilit_platform -c "VACUUM;"
```

### 10.3 Recrear base de datos desde DDL

Si la base de datos esta corrupta o se necesita una reconstruccion completa, usar el script del repositorio:

```bash
# Recrear desde DDL (ELIMINA todos los datos)
cd apps/database
bash scripts/init-database.sh

# O el script de recreacion completo
bash scripts/recreate-database.sh
```

**Nota:** Esto ejecuta los archivos DDL en orden:
1. `00-prerequisites.sql` — Schemas y ENUMs
2. `schemas/*/tables/*.sql` — Tablas por schema
3. `schemas/*/functions/*.sql` — Funciones
4. `schemas/*/triggers/*.sql` — Triggers
5. `schemas/*/views/*.sql` — Views
6. `07-enable-rls.sql` + `07b` + `07c` + `07d` — Politicas RLS
7. `99-post-ddl-permissions.sql` — Permisos finales

---

## Referencias

- `apps/database/ddl/` — Archivos DDL del proyecto
- `apps/database/scripts/init-database.sh` — Script de inicializacion de BD
- `docs/50-guides/backend/_archived/GUIA-CREAR-BASE-DATOS.md` — Guia de creacion de BD [ARCHIVED]
- `docs/50-guides/deployment/GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md` — Guia de deploy (incluye backup)
- [PostgreSQL 15 Documentation](https://www.postgresql.org/docs/15/) — Documentacion oficial
- [pg_stat_statements](https://www.postgresql.org/docs/15/pgstatstatements.html) — Extension de monitoreo
- [pgstattuple](https://www.postgresql.org/docs/15/pgstattuple.html) — Extension de analisis de bloat
