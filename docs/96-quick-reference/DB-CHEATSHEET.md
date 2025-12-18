# Database Cheatsheet - GAMILIT Platform

**Versión:** 1.0
**Última actualización:** 2025-12-18
**Database:** PostgreSQL 15+
**Timezone:** America/Mexico_City

> **Nota:** Este es un cheatsheet rápido. Para esquema completo ver [docs/03-desarrollo/base-de-datos/ESQUEMA-COMPLETO.md](../03-desarrollo/base-de-datos/ESQUEMA-COMPLETO.md)

---

## 🔌 Conexión Rápida

### Desarrollo Local

```bash
# Conectar a database
psql -U gamilit_user -d gamilit_platform -h localhost

# Conectar con password inline (no recomendado en producción)
PGPASSWORD=gamilit_dev_2025 psql -U gamilit_user -d gamilit_platform -h localhost
```

### Variables de Entorno

```bash
export PGHOST=localhost
export PGPORT=5432
export PGDATABASE=gamilit_platform
export PGUSER=gamilit_user
export PGPASSWORD=gamilit_dev_2025

# Ahora solo:
psql
```

---

## 📊 Esquema General

### Resumen

- **Schemas:** 16
- **Tablas:** 123
- **Funciones:** 213
- **Triggers:** 90
- **Índices:** 279+
- **RLS Policies:** 185

### Schemas Principales

| Schema | Tablas | Propósito |
|--------|--------|-----------|
| **auth_management** | 12 | Autenticación, usuarios, sesiones, roles |
| **educational_content** | 8 | Módulos, ejercicios, contenido educativo |
| **gamification_system** | 10 | ML Coins, rangos, achievements, power-ups |
| **progress_tracking** | 6 | Progreso, intentos, sesiones de aprendizaje |
| **social_features** | 7 | Escuelas, aulas, equipos, amistades |
| **content_management** | 4 | Media files, Marie Curie content |
| **audit_logging** | 2 | Logs de auditoría, eventos de seguridad |
| **system_configuration** | 1 | Configuración del sistema |
| **public** | 2 | Schema público |

---

## 🗂️ Comandos Útiles de psql

### Navegación

```sql
-- Listar schemas
\dn

-- Listar tablas de un schema
\dt auth_management.*

-- Listar todas las tablas
\dt *.*

-- Describir tabla
\d auth_management.profiles

-- Listar funciones
\df

-- Listar triggers de una tabla
\dy auth_management.profiles

-- Listar índices de una tabla
\di auth_management.profiles

-- Ver tamaño de tablas
\dt+ *.*

-- Ayuda
\?

-- Salir
\q
```

### Configuración

```sql
-- Mostrar configuración actual
\set

-- Timing de queries
\timing on

-- Formato expandido (mejor para filas anchas)
\x auto

-- Paginación
\pset pager off
```

---

## 🔍 Queries Comunes por Caso de Uso

### 1. Autenticación

```sql
-- Buscar usuario por email
SELECT id, email, full_name, role, status
FROM auth_management.profiles
WHERE email = 'student@example.com';

-- Verificar sesiones activas de un usuario
SELECT session_token, device_type, ip_address, expires_at, created_at
FROM auth_management.user_sessions
WHERE user_id = 'user-uuid'
  AND expires_at > NOW()
ORDER BY created_at DESC;

-- Contar intentos de login fallidos recientes
SELECT COUNT(*)
FROM auth_management.auth_attempts
WHERE user_id = 'user-uuid'
  AND success = false
  AND created_at > NOW() - INTERVAL '15 minutes';

-- Listar usuarios por rol
SELECT id, email, full_name, role, status, created_at
FROM auth_management.profiles
WHERE role = 'student'
  AND status = 'active'
ORDER BY created_at DESC
LIMIT 10;
```

### 2. Gamificación

```sql
-- Stats generales de un usuario
SELECT user_id, level, total_xp, ml_coins,
       current_streak, max_streak,
       exercises_completed, average_score,
       global_rank_position
FROM gamification_system.user_stats
WHERE user_id = 'user-uuid';

-- Balance de ML Coins actual
SELECT ml_coins
FROM gamification_system.user_stats
WHERE user_id = 'user-uuid';

-- Historial de transacciones ML Coins (últimas 20)
SELECT id, amount, transaction_type, reason,
       balance_after, created_at
FROM gamification_system.ml_coins_ledger
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC
LIMIT 20;

-- Top 10 ranking global
SELECT u.user_id, p.display_name, u.total_xp,
       u.level, u.ml_coins, u.global_rank_position
FROM gamification_system.user_stats u
JOIN auth_management.profiles p ON u.user_id = p.id
WHERE u.global_rank_position IS NOT NULL
ORDER BY u.global_rank_position ASC
LIMIT 10;

-- Achievements desbloqueados por usuario
SELECT ua.achievement_id, a.name, a.description,
       a.category, a.rarity, a.ml_coins_reward,
       ua.unlocked_at
FROM gamification_system.user_achievements ua
JOIN gamification_system.achievements a ON ua.achievement_id = a.id
WHERE ua.user_id = 'user-uuid'
  AND ua.is_claimed = true
ORDER BY ua.unlocked_at DESC;

-- Rango actual del usuario (Maya ranks)
SELECT r.rank_name, r.min_xp_required, r.benefits
FROM gamification_system.user_ranks ur
JOIN gamification_system.ranks r ON ur.rank_id = r.id
WHERE ur.user_id = 'user-uuid'
  AND ur.is_current = true;
```

### 3. Progreso Educativo

```sql
-- Progreso general del estudiante
SELECT m.title AS module_name,
       mp.status,
       mp.progress_percentage,
       mp.completed_exercises,
       mp.total_exercises,
       mp.average_score,
       mp.time_spent,
       mp.last_accessed_at
FROM progress_tracking.module_progress mp
JOIN educational_content.modules m ON mp.module_id = m.id
WHERE mp.user_id = 'user-uuid'
ORDER BY mp.last_accessed_at DESC;

-- Ejercicios completados recientemente
SELECT e.title AS exercise_name,
       ea.score,
       ea.is_correct,
       ea.time_spent,
       ea.attempt_number,
       ea.created_at
FROM progress_tracking.exercise_attempts ea
JOIN educational_content.exercises e ON ea.exercise_id = e.id
WHERE ea.user_id = 'user-uuid'
  AND ea.created_at > NOW() - INTERVAL '7 days'
ORDER BY ea.created_at DESC
LIMIT 20;

-- Estadísticas de un módulo específico
SELECT status,
       completed_exercises || '/' || total_exercises AS progress,
       progress_percentage || '%' AS percentage,
       ROUND(average_score, 2) AS avg_score,
       time_spent,
       last_accessed_at
FROM progress_tracking.module_progress
WHERE user_id = 'user-uuid'
  AND module_id = 'module-uuid';

-- Mecánicas más completadas
SELECT e.mechanic_type, COUNT(*) AS times_completed,
       ROUND(AVG(ea.score), 2) AS avg_score
FROM progress_tracking.exercise_attempts ea
JOIN educational_content.exercises e ON ea.exercise_id = e.id
WHERE ea.user_id = 'user-uuid'
  AND ea.is_correct = true
GROUP BY e.mechanic_type
ORDER BY times_completed DESC;
```

### 4. Teacher Dashboard

```sql
-- Aulas del profesor
SELECT c.id, c.name, c.grade_level,
       c.current_students_count, c.capacity,
       s.name AS school_name
FROM social_features.classrooms c
LEFT JOIN social_features.schools s ON c.school_id = s.id
WHERE c.teacher_id = 'teacher-uuid'
  AND c.is_active = true
ORDER BY c.created_at DESC;

-- Estudiantes de un aula
SELECT p.id, p.display_name, p.email,
       us.level, us.total_xp, us.ml_coins,
       cm.enrolled_at
FROM social_features.classroom_members cm
JOIN auth_management.profiles p ON cm.student_id = p.id
JOIN gamification_system.user_stats us ON p.id = us.user_id
WHERE cm.classroom_id = 'classroom-uuid'
  AND cm.status = 'active'
ORDER BY us.total_xp DESC;

-- Progreso de estudiantes en un módulo
SELECT p.display_name,
       mp.status,
       mp.progress_percentage,
       mp.average_score,
       mp.time_spent
FROM progress_tracking.module_progress mp
JOIN auth_management.profiles p ON mp.user_id = p.id
JOIN social_features.classroom_members cm
  ON cm.student_id = p.id
WHERE cm.classroom_id = 'classroom-uuid'
  AND mp.module_id = 'module-uuid'
ORDER BY mp.progress_percentage DESC, mp.average_score DESC;

-- Estudiantes que necesitan atención (bajo rendimiento)
SELECT p.display_name, p.email,
       us.exercises_completed,
       us.average_score,
       us.current_streak,
       us.last_active_at
FROM gamification_system.user_stats us
JOIN auth_management.profiles p ON us.user_id = p.id
JOIN social_features.classroom_members cm ON p.id = cm.student_id
WHERE cm.classroom_id = 'classroom-uuid'
  AND (us.average_score < 70 OR us.current_streak = 0)
ORDER BY us.average_score ASC;
```

### 5. Analytics

```sql
-- Actividad diaria de la plataforma (últimos 7 días)
SELECT DATE(created_at) AS date,
       COUNT(DISTINCT user_id) AS active_users,
       COUNT(*) AS total_exercises
FROM progress_tracking.exercise_attempts
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Sesiones de aprendizaje promedio por usuario
SELECT u.user_id, p.display_name,
       COUNT(ls.id) AS total_sessions,
       AVG(EXTRACT(EPOCH FROM ls.duration) / 60) AS avg_duration_minutes,
       SUM(ls.exercises_completed) AS total_exercises
FROM progress_tracking.learning_sessions ls
JOIN gamification_system.user_stats u ON ls.user_id = u.user_id
JOIN auth_management.profiles p ON u.user_id = p.id
WHERE ls.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.user_id, p.display_name
HAVING COUNT(ls.id) > 5
ORDER BY total_sessions DESC
LIMIT 20;

-- Retención de usuarios (días activos)
SELECT days_active_total AS days_active,
       COUNT(*) AS user_count
FROM gamification_system.user_stats
GROUP BY days_active_total
ORDER BY days_active_total DESC;

-- Conversión de intentos a completaciones
SELECT e.title,
       COUNT(*) AS total_attempts,
       SUM(CASE WHEN ea.is_correct THEN 1 ELSE 0 END) AS successful,
       ROUND(100.0 * SUM(CASE WHEN ea.is_correct THEN 1 ELSE 0 END) / COUNT(*), 2) AS success_rate
FROM progress_tracking.exercise_attempts ea
JOIN educational_content.exercises e ON ea.exercise_id = e.id
WHERE ea.created_at > NOW() - INTERVAL '30 days'
GROUP BY e.id, e.title
HAVING COUNT(*) >= 10
ORDER BY success_rate ASC
LIMIT 10;
```

---

## 🔗 Relaciones Principales

### User → Stats → Progress

```sql
-- Diagrama de relaciones
auth_management.profiles (id)
    ↓
gamification_system.user_stats (user_id)
    ↓
progress_tracking.module_progress (user_id)
    ↓
progress_tracking.exercise_attempts (user_id)
```

### School → Classroom → Students

```sql
-- Diagrama de relaciones
social_features.schools (id)
    ↓
social_features.classrooms (school_id, teacher_id)
    ↓
social_features.classroom_members (classroom_id, student_id)
    ↓
auth_management.profiles (id)
```

### Module → Exercise → Attempts

```sql
-- Diagrama de relaciones
educational_content.modules (id)
    ↓
educational_content.exercises (module_id)
    ↓
progress_tracking.exercise_attempts (exercise_id, user_id)
```

---

## ⚡ Funciones Útiles

### Función: `gamilit.now_mexico()`

Retorna timestamp en zona horaria de México.

```sql
-- Uso
SELECT gamilit.now_mexico();

-- Comparar con UTC
SELECT NOW() AS utc_time, gamilit.now_mexico() AS mexico_time;
```

### Función: `gamilit.update_updated_at()`

Trigger function para actualizar automáticamente `updated_at`.

```sql
-- Ya está aplicado automáticamente a todas las tablas principales
-- No necesitas llamarlo manualmente
```

### Calcular Nivel desde XP

```sql
-- Fórmula: level = floor(sqrt(total_xp / 100)) + 1
SELECT FLOOR(SQRT(total_xp / 100)) + 1 AS calculated_level
FROM gamification_system.user_stats
WHERE user_id = 'user-uuid';
```

---

## 📈 Índices y Performance

### Ver índices de una tabla

```sql
-- Listar índices
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'profiles'
  AND schemaname = 'auth_management';

-- Uso de índices (requiere pg_stat_statements)
SELECT schemaname, tablename, indexname,
       idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'auth_management'
ORDER BY idx_scan DESC;
```

### Índices más importantes

```sql
-- Email lookup (muy frecuente)
CREATE INDEX idx_profiles_email ON auth_management.profiles(email);

-- User stats lookup
CREATE INDEX idx_user_stats_user_id ON gamification_system.user_stats(user_id);

-- Exercise attempts por usuario
CREATE INDEX idx_exercise_attempts_user_id
ON progress_tracking.exercise_attempts(user_id);

-- Sesiones activas
CREATE INDEX idx_sessions_expires
ON auth_management.user_sessions(expires_at)
WHERE expires_at > NOW();
```

---

## 🔐 RLS (Row Level Security)

### Verificar políticas RLS

```sql
-- Listar políticas de una tabla
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';

-- Verificar si RLS está habilitado
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'auth_management';
```

### Políticas comunes

```sql
-- Students can only see their own data
CREATE POLICY students_view_own_data
ON progress_tracking.module_progress
FOR SELECT
USING (user_id = current_setting('app.current_user_id')::UUID);

-- Teachers can see their classroom students
CREATE POLICY teachers_view_classroom_data
ON progress_tracking.module_progress
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM social_features.classroom_members cm
    JOIN social_features.classrooms c ON cm.classroom_id = c.id
    WHERE cm.student_id = module_progress.user_id
      AND c.teacher_id = current_setting('app.current_user_id')::UUID
  )
);
```

---

## 🛠️ Mantenimiento

### Vacuum y Analyze

```sql
-- Vacuum de una tabla
VACUUM ANALYZE auth_management.profiles;

-- Vacuum de todo el schema
VACUUM ANALYZE auth_management.*;

-- Ver última vez que se ejecutó
SELECT schemaname, relname, last_vacuum, last_autovacuum, last_analyze
FROM pg_stat_user_tables
WHERE schemaname = 'auth_management'
ORDER BY last_vacuum DESC NULLS LAST;
```

### Ver tamaño de tablas

```sql
-- Tamaño de una tabla
SELECT pg_size_pretty(pg_total_relation_size('auth_management.profiles'));

-- Top 10 tablas más grandes
SELECT schemaname, tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
```

### Ver locks activos

```sql
-- Locks actuales
SELECT pid, usename, pg_blocking_pids(pid) AS blocked_by,
       query, state
FROM pg_stat_activity
WHERE pg_blocking_pids(pid)::text != '{}';

-- Terminar query lento
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE pid = 12345;
```

---

## 📊 Backups

### Backup completo

```bash
# Backup de toda la database
pg_dump -U gamilit_user -d gamilit_platform -h localhost \
  -F c -f gamilit_backup_$(date +%Y%m%d).dump

# Backup de un schema específico
pg_dump -U gamilit_user -d gamilit_platform -h localhost \
  -n auth_management -F c -f auth_schema_$(date +%Y%m%d).dump

# Backup en SQL text
pg_dump -U gamilit_user -d gamilit_platform -h localhost \
  -F p -f gamilit_backup_$(date +%Y%m%d).sql
```

### Restore

```bash
# Restore desde custom format
pg_restore -U gamilit_user -d gamilit_platform -h localhost \
  -c gamilit_backup_20251107.dump

# Restore desde SQL text
psql -U gamilit_user -d gamilit_platform -h localhost \
  -f gamilit_backup_20251107.sql
```

---

## 🧪 Testing Queries

### Crear usuario de prueba

```sql
-- Insertar perfil
INSERT INTO auth_management.profiles
  (id, email, full_name, display_name, role, status)
VALUES
  (gen_random_uuid(), 'test@example.com', 'Test User', 'Test', 'student', 'active')
RETURNING id;

-- Stats se crean automáticamente por trigger
```

### Limpiar datos de prueba

```sql
-- Eliminar usuario de prueba (cascade eliminará stats, progress, etc.)
DELETE FROM auth_management.profiles
WHERE email LIKE '%@example.com';

-- Resetear sequence (si aplica)
ALTER SEQUENCE some_sequence RESTART WITH 1;
```

### Ver queries lentas (últimas 24h)

```sql
-- Requiere pg_stat_statements extension
SELECT calls, total_exec_time, mean_exec_time,
       substring(query, 1, 100) AS query_preview
FROM pg_stat_statements
WHERE total_exec_time > 1000  -- más de 1 segundo total
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## 💡 Tips y Best Practices

### 1. Siempre usar tenant_id en queries multi-tenant

```sql
-- ❌ MAL (no filtra por tenant)
SELECT * FROM auth_management.profiles WHERE email = 'test@example.com';

-- ✅ BIEN (filtra por tenant)
SELECT * FROM auth_management.profiles
WHERE email = 'test@example.com'
  AND tenant_id = 'tenant-uuid';
```

### 2. Usar prepared statements

```sql
-- Preparar statement
PREPARE get_user_stats (UUID) AS
  SELECT level, total_xp, ml_coins, current_streak
  FROM gamification_system.user_stats
  WHERE user_id = $1;

-- Ejecutar
EXECUTE get_user_stats('user-uuid');

-- Deallocate cuando termines
DEALLOCATE get_user_stats;
```

### 3. EXPLAIN para entender queries lentas

```sql
-- Ver plan de ejecución
EXPLAIN SELECT * FROM auth_management.profiles WHERE email = 'test@example.com';

-- Ver plan con costos reales
EXPLAIN ANALYZE SELECT * FROM auth_management.profiles WHERE email = 'test@example.com';
```

### 4. Transacciones para operaciones atómicas

```sql
BEGIN;
  -- Restar ML Coins
  UPDATE gamification_system.user_stats
  SET ml_coins = ml_coins - 50
  WHERE user_id = 'user-uuid'
    AND ml_coins >= 50;

  -- Registrar transacción
  INSERT INTO gamification_system.ml_coins_ledger
    (user_id, amount, transaction_type, reason, balance_after)
  VALUES
    ('user-uuid', -50, 'powerup_purchase', 'Bought hint', 450);
COMMIT;
```

---

## 📚 Recursos

**Documentación completa:**
- [ESQUEMA-COMPLETO.md](../03-desarrollo/base-de-datos/ESQUEMA-COMPLETO.md) - Esquema detallado de 44 tablas
- [RLS-POLICIES.md](../03-desarrollo/base-de-datos/RLS-POLICIES.md) - Políticas de Row Level Security
- [MIGRACIONES.md](../03-desarrollo/base-de-datos/MIGRACIONES.md) - Sistema de migraciones

**DDL Files:**
- [apps/database/ddl/](../../apps/database/ddl/) - Definiciones de esquema

**PostgreSQL Docs:**
- [PostgreSQL 15 Documentation](https://www.postgresql.org/docs/15/)
- [psql Commands](https://www.postgresql.org/docs/15/app-psql.html)

---

**Última actualización:** 2025-12-18
**Versión:** 1.0
**Método:** Extracted from ESQUEMA-COMPLETO.md
