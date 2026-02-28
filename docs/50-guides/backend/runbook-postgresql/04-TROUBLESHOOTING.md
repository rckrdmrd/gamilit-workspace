---
title: "Runbook PostgreSQL — Troubleshooting Deadlocks y RLS"
status: activo
last_updated: "2026-02-28"
---

# Runbook PostgreSQL — Troubleshooting Deadlocks y RLS

**Proyecto:** GAMILIT
**Version:** 1.0.0
**Fecha:** 2026-02-14
**Aplica a:** PostgreSQL 15 — Base de datos gamilit_platform

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
