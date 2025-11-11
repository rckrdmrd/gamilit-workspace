# HANDOFF: Database Agent - Correcciones Críticas
## Informe de Issues y Correcciones para Base de Datos

**Fecha:** 2025-11-11
**Origen:** Validación Pre-Implementación P0
**Agente Destino:** Database Specialist
**Prioridad:** 🔴 P0 CRÍTICO + 🟡 P1

---

## CONTEXTO

Durante la validación exhaustiva del sistema GAMILIT v2.3.1, se detectaron:
1. ❌ **Bug crítico en trigger function** (BLOCKER)
2. ⚠️ **Seeds existentes no se ejecutan** (falta integración)
3. ✅ **Estructura de tablas 100% correcta** (sin cambios)

**Objetivo:** Corregir bugs y completar integración de seeds para tener base de datos funcional end-to-end.

---

## ISSUE #1: Bug Crítico en Trigger Function 🔴 P0

### Descripción del Problema

**Archivo afectado:**
```
apps/database/ddl/schemas/gamilit/functions/14-update_user_stats_on_exercise_complete.sql
```

**Trigger:** `gamilit.update_user_stats_on_exercise_complete()`

**Síntoma:**
El trigger FALLA al intentar actualizar `gamification_system.user_stats` cuando se completa un ejercicio.

**Causa Raíz:**
La función referencia 2 campos que NO EXISTEN en la tabla `user_stats`:
1. `exercises_correct` - Campo inexistente
2. `ml_coins_balance` - Campo con nombre incorrecto (debería ser `ml_coins`)

### Código Actual (BUGGY)

```sql
CREATE OR REPLACE FUNCTION gamilit.update_user_stats_on_exercise_complete()
RETURNS trigger AS $$
BEGIN
  UPDATE gamification_system.user_stats
  SET
    exercises_completed = exercises_completed + 1,
    exercises_correct = exercises_correct + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,  -- ❌ LÍNEA 34: Campo NO EXISTE
    total_score = total_score + COALESCE(NEW.score, 0),
    ml_coins_balance = ml_coins_balance + COALESCE(NEW.ml_coins_earned, 0),  -- ❌ LÍNEA 36: Nombre incorrecto
    total_xp = total_xp + COALESCE(NEW.xp_earned, 0),
    last_activity_at = now(),
    updated_at = now()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Código Corregido (SOLUCIÓN)

```sql
-- ============================================================
-- Function: update_user_stats_on_exercise_complete
-- Trigger: Actualiza estadísticas del usuario al completar ejercicio
-- Tabla afectada: gamification_system.user_stats
-- Trigger en: progress_tracking.exercise_attempts (AFTER INSERT OR UPDATE)
-- ============================================================

CREATE OR REPLACE FUNCTION gamilit.update_user_stats_on_exercise_complete()
RETURNS trigger AS $$
BEGIN
  -- Solo procesar si el attempt tiene score (está completado)
  IF NEW.score IS NOT NULL THEN
    UPDATE gamification_system.user_stats
    SET
      -- Incrementar contador de ejercicios completados
      exercises_completed = exercises_completed + 1,

      -- ✅ CORREGIDO: Remover exercises_correct (campo no existe)
      -- exercises_correct ya no se usa en el esquema actual

      -- Acumular score total
      total_score = total_score + COALESCE(NEW.score, 0),

      -- ✅ CORREGIDO: ml_coins en lugar de ml_coins_balance
      ml_coins = ml_coins + COALESCE(NEW.ml_coins_earned, 0),

      -- ✅ AGREGADO: Actualizar ml_coins_earned_total
      ml_coins_earned_total = ml_coins_earned_total + COALESCE(NEW.ml_coins_earned, 0),

      -- Acumular XP total
      total_xp = total_xp + COALESCE(NEW.xp_earned, 0),

      -- ✅ AGREGADO: Incrementar perfect_scores si score = 100
      perfect_scores = perfect_scores + CASE WHEN NEW.score = 100 THEN 1 ELSE 0 END,

      -- Actualizar timestamps de actividad
      last_activity_at = now(),
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comentario sobre el trigger
COMMENT ON FUNCTION gamilit.update_user_stats_on_exercise_complete() IS
'Actualiza estadísticas del usuario en gamification_system.user_stats cuando completa un exercise_attempt.
Se ejecuta AFTER INSERT OR UPDATE en progress_tracking.exercise_attempts.
Actualiza: exercises_completed, total_score, ml_coins, ml_coins_earned_total, total_xp, perfect_scores, timestamps.';
```

### Validación del Esquema

**Verificar campos existentes en user_stats:**

```sql
-- Listar todos los campos de user_stats
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'gamification_system'
  AND table_name = 'user_stats'
ORDER BY ordinal_position;

-- Campos esperados (37 total):
-- ✅ exercises_completed (integer)
-- ❌ exercises_correct (NO EXISTE - remover del trigger)
-- ✅ total_score (numeric)
-- ✅ ml_coins (integer) - NO ml_coins_balance
-- ✅ ml_coins_earned_total (integer)
-- ✅ total_xp (integer)
-- ✅ perfect_scores (integer)
-- ✅ last_activity_at (timestamptz)
-- ✅ updated_at (timestamptz)
```

### Trigger Asociado

**Verificar que el trigger está creado correctamente:**

```sql
-- Verificar trigger existe
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trg_update_user_stats_on_exercise_complete';

-- Trigger esperado:
-- trigger_name: trg_update_user_stats_on_exercise_complete
-- event_manipulation: INSERT, UPDATE
-- event_object_table: exercise_attempts
-- action_statement: EXECUTE FUNCTION gamilit.update_user_stats_on_exercise_complete()
```

**Archivo de creación del trigger:**
```
apps/database/ddl/schemas/gamilit/triggers/01-update_user_stats_on_exercise_complete.sql
```

**Contenido esperado:**
```sql
-- Trigger para actualizar user_stats al completar exercise_attempt
DROP TRIGGER IF EXISTS trg_update_user_stats_on_exercise_complete ON progress_tracking.exercise_attempts;

CREATE TRIGGER trg_update_user_stats_on_exercise_complete
  AFTER INSERT OR UPDATE OF score, is_correct, xp_earned, ml_coins_earned
  ON progress_tracking.exercise_attempts
  FOR EACH ROW
  EXECUTE FUNCTION gamilit.update_user_stats_on_exercise_complete();

COMMENT ON TRIGGER trg_update_user_stats_on_exercise_complete ON progress_tracking.exercise_attempts IS
'Actualiza gamification_system.user_stats cuando se completa o actualiza un exercise_attempt.';
```

### Pasos de Implementación

1. **Aplicar corrección a la función:**
```bash
cd apps/database

# Editar el archivo con la corrección
nano ddl/schemas/gamilit/functions/14-update_user_stats_on_exercise_complete.sql

# Aplicar cambios
psql "$DATABASE_URL" -f ddl/schemas/gamilit/functions/14-update_user_stats_on_exercise_complete.sql

# Verificar función actualizada
psql "$DATABASE_URL" -c "
SELECT
  proname as function_name,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname = 'update_user_stats_on_exercise_complete';
"
```

2. **Validar sintaxis SQL:**
```bash
# Verificar que la función no tiene errores de sintaxis
psql "$DATABASE_URL" -c "\df gamilit.update_user_stats_on_exercise_complete"

# Salida esperada:
# Schema | Name | Result data type | Argument data types | Type
# -------|------|------------------|---------------------|--------
# gamilit | update_user_stats_on_exercise_complete | trigger | | func
```

3. **Test funcional:**
```sql
-- TEST 1: Insertar un exercise_attempt de prueba
BEGIN;

-- Obtener IDs reales para el test
DO $$
DECLARE
  test_user_id uuid;
  test_exercise_id uuid;
BEGIN
  -- Obtener primer usuario de la tabla profiles
  SELECT user_id INTO test_user_id
  FROM auth_management.profiles
  WHERE user_id IS NOT NULL
  LIMIT 1;

  -- Obtener primer ejercicio
  SELECT id INTO test_exercise_id
  FROM educational_content.exercises
  LIMIT 1;

  -- Verificar user_stats antes
  RAISE NOTICE 'User stats ANTES:';
  PERFORM * FROM gamification_system.user_stats WHERE user_id = test_user_id;

  -- Insertar attempt de prueba
  INSERT INTO progress_tracking.exercise_attempts (
    user_id,
    exercise_id,
    attempt_number,
    submitted_answers,
    is_correct,
    score,
    xp_earned,
    ml_coins_earned,
    hints_used,
    comodines_used,
    metadata
  ) VALUES (
    test_user_id,
    test_exercise_id,
    1,
    '{"answer": "test"}',
    true,
    100,
    50,
    10,
    0,
    ARRAY[]::text[],
    '{}'::jsonb
  );

  -- Verificar user_stats después
  RAISE NOTICE 'User stats DESPUÉS:';
  PERFORM * FROM gamification_system.user_stats WHERE user_id = test_user_id;
END $$;

ROLLBACK;  -- No guardar el test
```

4. **Validación de resultados esperados:**
```sql
-- Después del INSERT del test, verificar que user_stats se actualizó:
-- ✅ exercises_completed debe incrementar en 1
-- ✅ ml_coins debe incrementar en 10
-- ✅ ml_coins_earned_total debe incrementar en 10
-- ✅ total_xp debe incrementar en 50
-- ✅ perfect_scores debe incrementar en 1 (score = 100)
-- ✅ total_score debe incrementar en 100
-- ✅ last_activity_at debe actualizarse a NOW()
-- ✅ updated_at debe actualizarse a NOW()
```

### Criterios de Aceptación

✅ Función se crea sin errores de sintaxis
✅ Función referencia solo campos existentes en user_stats
✅ Trigger se dispara correctamente en INSERT/UPDATE de exercise_attempts
✅ user_stats se actualiza con valores correctos
✅ No se generan errores en logs de PostgreSQL
✅ Test funcional pasa sin errores

### Impacto

**Antes (BUGGY):**
- ❌ Trigger falla al completar ejercicio
- ❌ user_stats NO se actualiza automáticamente
- ❌ Frontend ve estadísticas desactualizadas
- ❌ Gamification desincronizado

**Después (CORREGIDO):**
- ✅ Trigger funciona correctamente
- ✅ user_stats actualizado en tiempo real
- ✅ Frontend ve estadísticas correctas
- ✅ Gamification sincronizado

**Estimación:** 30 minutos

---

## ISSUE #2: Seeds Existentes No Se Ejecutan 🟡 P1

### Descripción del Problema

**Archivos afectados:**
- `apps/database/create-database.sh` (script de creación)
- 4+ seeds en `apps/database/seeds/prod/` (ya existen pero no se ejecutan)

**Síntoma:**
Los seeds de producción con datos de calidad YA ESTÁN CREADOS pero NO se ejecutan al correr `create-database.sh`.

**Causa Raíz:**
Faltan líneas en `create-database.sh` para ejecutar los seeds:
- `seeds/prod/social_features/01-schools.sql` (2 escuelas)
- `seeds/prod/auth_management/04-profiles-complete.sql` (10 perfiles completos)
- `seeds/prod/gamification_system/05-user_stats.sql` (10 user_stats)
- `seeds/prod/gamification_system/06-user_ranks.sql` (10 user_ranks)
- `seeds/prod/gamification_system/07-ml_coins_transactions.sql` (transacciones iniciales)
- `seeds/prod/gamification_system/08-user_achievements.sql` (achievements iniciales)
- `seeds/prod/gamification_system/09-comodines_inventory.sql` (inventario inicial)

### Estado Actual de create-database.sh

**Archivo:** `apps/database/create-database.sh`

**Líneas 180-230 (sección de seeds):**
```bash
echo "======================================"
echo "Loading Production Seeds"
echo "======================================"

# Auth Management
echo "Loading auth management data..."
psql "$DATABASE_URL" -f seeds/prod/auth_management/01-tenants.sql
psql "$DATABASE_URL" -f seeds/prod/auth_management/02-auth_providers.sql
psql "$DATABASE_URL" -f seeds/prod/auth_management/03-profiles.sql  # ⚠️ Solo 3 usuarios básicos

# Educational Content
echo "Loading educational content..."
psql "$DATABASE_URL" -f seeds/prod/educational_content/01-modules.sql
psql "$DATABASE_URL" -f seeds/prod/educational_content/02-exercises-module1.sql
psql "$DATABASE_URL" -f seeds/prod/educational_content/03-exercises-module2.sql
psql "$DATABASE_URL" -f seeds/prod/educational_content/04-exercises-module3.sql
psql "$DATABASE_URL" -f seeds/prod/educational_content/05-exercises-module4.sql
psql "$DATABASE_URL" -f seeds/prod/educational_content/06-exercises-module5.sql
psql "$DATABASE_URL" -f seeds/prod/educational_content/07-assessment-rubrics.sql
psql "$DATABASE_URL" -f seeds/prod/educational_content/08-difficulty_criteria.sql

# Gamification System
echo "Loading gamification system data..."
psql "$DATABASE_URL" -f seeds/prod/gamification_system/01-achievement_categories.sql
psql "$DATABASE_URL" -f seeds/prod/gamification_system/02-leaderboard_metadata.sql
psql "$DATABASE_URL" -f seeds/prod/gamification_system/03-maya_ranks.sql
# ❌ FALTAN: 04 a 09

# System Configuration
echo "Loading system configuration..."
psql "$DATABASE_URL" -f seeds/prod/system_configuration/01-system_settings.sql
psql "$DATABASE_URL" -f seeds/prod/system_configuration/02-feature_flags.sql
psql "$DATABASE_URL" -f seeds/prod/system_configuration/03-notification_settings_global.sql

# ❌ FALTA: seeds/prod/social_features/

echo "Database setup complete!"
```

### Corrección Requerida

**Agregar las siguientes líneas DESPUÉS de la línea 211 (después de gamification_system/03-maya_ranks.sql):**

```bash
# ====== SECCIÓN A AGREGAR ======

# Social Features (NUEVO)
echo "Loading social features data..."
psql "$DATABASE_URL" -f seeds/prod/social_features/01-schools.sql

# Auth Management - Complete Profiles (NUEVO)
echo "Loading complete user profiles..."
psql "$DATABASE_URL" -f seeds/prod/auth_management/04-profiles-complete.sql

# Gamification System - User Data (NUEVO)
echo "Loading gamification user data..."
psql "$DATABASE_URL" -f seeds/prod/gamification_system/04-achievements.sql
psql "$DATABASE_URL" -f seeds/prod/gamification_system/05-user_stats.sql
psql "$DATABASE_URL" -f seeds/prod/gamification_system/06-user_ranks.sql
psql "$DATABASE_URL" -f seeds/prod/gamification_system/07-ml_coins_transactions.sql
psql "$DATABASE_URL" -f seeds/prod/gamification_system/08-user_achievements.sql
psql "$DATABASE_URL" -f seeds/prod/gamification_system/09-comodines_inventory.sql

# ====== FIN SECCIÓN A AGREGAR ======
```

### Dependencias y Orden de Ejecución

**⚠️ IMPORTANTE: El orden importa por las Foreign Keys**

```
Orden correcto:
1. auth_management/01-tenants.sql           (crea tenants)
2. auth_management/02-auth_providers.sql    (crea auth_providers)
3. social_features/01-schools.sql           (crea schools) ← NUEVO
4. auth_management/04-profiles-complete.sql (requiere tenants, schools) ← NUEVO
5. gamification_system/01-03 (metadata)
6. gamification_system/04-achievements.sql  ← NUEVO
7. gamification_system/05-user_stats.sql    (requiere profiles) ← NUEVO
8. gamification_system/06-user_ranks.sql    (requiere user_stats) ← NUEVO
9. gamification_system/07-09 (requiere user_stats) ← NUEVO
```

### Contenido de los Seeds

#### 1. social_features/01-schools.sql (166 líneas)

```sql
-- 2 Escuelas demo con datos completos
INSERT INTO social_features.schools (
  id, tenant_id, name, code, type, address, city, state, country,
  postal_code, phone, email, website, principal_name, student_count,
  teacher_count, grade_levels, academic_year, timezone, logo_url,
  is_active, settings, metadata, created_at, updated_at
) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'GAMILIT Demo School',
  'GDS-001',
  'secundaria',
  'Av. Educación 123',
  'Ciudad de México',
  'CDMX',
  'México',
  '01000',
  '+52-55-1234-5678',
  'contacto@gamilit-demo.edu.mx',
  'https://gamilit-demo.edu.mx',
  'Dr. Juan Pérez',
  150,
  12,
  ARRAY['1', '2', '3']::text[],
  '2024-2025',
  'America/Mexico_City',
  'https://cdn.gamilit.com/schools/demo-school-logo.png',
  true,
  '{"allow_public_profile": true, "enable_parent_portal": true}'::jsonb,
  '{"established_year": 2010, "accreditation": "SEP"}'::jsonb,
  now(),
  now()
),
(
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Instituto Tecnológico Gamilit',
  'ITG-001',
  -- ... datos similares
);
```

#### 2. auth_management/04-profiles-complete.sql (250+ líneas)

```sql
-- 10 perfiles completos:
-- - 2 Admins
-- - 3 Teachers
-- - 5 Students

-- Con todos los campos poblados:
-- - display_name, full_name, first_name, last_name
-- - email, avatar_url, bio, phone
-- - grade_level, student_id, school_id
-- - role, status, email_verified
-- - preferences (JSONB con theme, language, timezone, notifications)
-- - metadata (JSONB)

-- Ejemplo de un perfil:
INSERT INTO auth_management.profiles (
  id, tenant_id, user_id, display_name, full_name, first_name, last_name,
  email, avatar_url, bio, phone, date_of_birth, grade_level, student_id,
  school_id, role, status, email_verified, phone_verified, preferences,
  last_sign_in_at, last_activity_at, metadata, created_at, updated_at
) VALUES (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM auth.users WHERE email = 'admin@gamilit.com'),
  'Admin Maya',
  'Administrador Maya Gamilit',
  'Administrador',
  'Maya',
  'admin@gamilit.com',
  'https://cdn.gamilit.com/avatars/admin.png',
  'Administrador del sistema GAMILIT',
  '+52-55-9999-0001',
  '1985-01-15',
  NULL,
  NULL,
  '00000000-0000-0000-0000-000000000001',
  'admin',
  'active',
  true,
  true,
  '{"theme": "dark", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
  now() - interval '2 hours',
  now() - interval '30 minutes',
  '{"favorite_color": "blue", "onboarding_completed": true}'::jsonb,
  now() - interval '6 months',
  now()
);
-- ... 9 perfiles más
```

#### 3. gamification_system/05-user_stats.sql (200+ líneas)

```sql
-- 10 user_stats con datos realistas
-- Niveles variados: 1, 3, 5, 8, 10, 12, 15, 18, 20, 25
-- XP coherente con nivel
-- ML Coins: 50-500
-- Streaks: 0-30 días
-- Ejercicios completados: 0-150
-- Todos los 37 campos poblados

INSERT INTO gamification_system.user_stats (
  id, user_id, tenant_id,
  level, total_xp, xp_to_next_level,
  current_rank, rank_progress,
  ml_coins, ml_coins_earned_total, ml_coins_spent_total, ml_coins_earned_today, last_ml_coins_reset,
  current_streak, max_streak, streak_started_at, days_active_total,
  exercises_completed, modules_completed, total_score, average_score, perfect_scores,
  achievements_earned, certificates_earned,
  total_time_spent, weekly_time_spent, sessions_count,
  weekly_xp, monthly_xp, weekly_exercises,
  global_rank_position, class_rank_position, school_rank_position,
  last_activity_at, last_login_at,
  metadata, created_at, updated_at
) VALUES
(
  gen_random_uuid(),
  '10000000-0000-0000-0000-000000000003',  -- Student 1
  '00000000-0000-0000-0000-000000000001',
  5,      -- level
  1250,   -- total_xp
  500,    -- xp_to_next_level
  'Nacom',  -- current_rank
  60,     -- rank_progress
  250,    -- ml_coins
  450,    -- ml_coins_earned_total
  200,    -- ml_coins_spent_total
  50,     -- ml_coins_earned_today
  CURRENT_DATE,
  7,      -- current_streak
  15,     -- max_streak
  CURRENT_DATE - interval '7 days',
  45,     -- days_active_total
  38,     -- exercises_completed
  2,      -- modules_completed
  3420,   -- total_score
  90,     -- average_score
  5,      -- perfect_scores
  8,      -- achievements_earned
  2,      -- certificates_earned
  '12:30:00',  -- total_time_spent
  '2:15:00',   -- weekly_time_spent
  28,     -- sessions_count
  350,    -- weekly_xp
  1050,   -- monthly_xp
  12,     -- weekly_exercises
  45,     -- global_rank_position
  3,      -- class_rank_position
  8,      -- school_rank_position
  now() - interval '1 hour',
  now() - interval '2 hours',
  '{"favorite_mechanic": "crucigrama", "preferred_time": "afternoon"}'::jsonb,
  now() - interval '2 months',
  now()
);
-- ... 9 registros más
```

#### 4. gamification_system/06-user_ranks.sql (180+ líneas)

```sql
-- 10 user_ranks coherentes con user_stats
-- Ranks: Ajaw, Nacom, Ah K'in
-- Progress: 0-85%
-- Incluye certificate_url, badge_url, achieved_at

INSERT INTO gamification_system.user_ranks (
  id, user_id, tenant_id,
  current_rank, previous_rank,
  rank_progress_percentage,
  modules_required_for_next, modules_completed_for_rank,
  xp_required_for_next, xp_earned_for_rank,
  ml_coins_bonus,
  certificate_url, badge_url,
  achieved_at, previous_rank_achieved_at,
  is_current, rank_metadata,
  created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '10000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'Nacom',
  'Ajaw',
  60,  -- 60% hacia Ah K'in
  3,   -- modules_required_for_next
  2,   -- modules_completed_for_rank
  2000,  -- xp_required_for_next
  1250,  -- xp_earned_for_rank
  100,   -- ml_coins_bonus
  'https://cdn.gamilit.com/certificates/nacom/student1.pdf',
  'https://cdn.gamilit.com/badges/nacom.png',
  now() - interval '1 month',
  now() - interval '2 months',
  true,
  '{"rank_number": 2, "rank_benefits": ["10% XP bonus", "Access to Level 2 exercises"]}'::jsonb,
  now() - interval '1 month',
  now()
);
-- ... 9 registros más
```

### Pasos de Implementación

1. **Backup del script actual:**
```bash
cd apps/database
cp create-database.sh create-database.sh.backup
```

2. **Editar create-database.sh:**
```bash
nano create-database.sh

# Agregar las líneas en la ubicación correcta (después de línea 211)
```

3. **Validar seeds existen:**
```bash
# Verificar que todos los archivos existen
ls -lh seeds/prod/social_features/01-schools.sql
ls -lh seeds/prod/auth_management/04-profiles-complete.sql
ls -lh seeds/prod/gamification_system/05-user_stats.sql
ls -lh seeds/prod/gamification_system/06-user_ranks.sql
ls -lh seeds/prod/gamification_system/07-ml_coins_transactions.sql
ls -lh seeds/prod/gamification_system/08-user_achievements.sql
ls -lh seeds/prod/gamification_system/09-comodines_inventory.sql
```

4. **Test en database de prueba:**
```bash
# Crear database de test
export TEST_DATABASE_URL="postgresql://gamilit_user:gamilit_password@localhost:5432/gamilit_test"
psql "$TEST_DATABASE_URL" -c "DROP DATABASE IF EXISTS gamilit_test;"
psql "$TEST_DATABASE_URL" -c "CREATE DATABASE gamilit_test;"

# Ejecutar script completo
DATABASE_URL="$TEST_DATABASE_URL" ./create-database.sh

# Validar datos cargados
psql "$TEST_DATABASE_URL" -c "SELECT COUNT(*) AS schools_count FROM social_features.schools;"
# Expect: 2

psql "$TEST_DATABASE_URL" -c "SELECT COUNT(*) AS profiles_count FROM auth_management.profiles;"
# Expect: 10

psql "$TEST_DATABASE_URL" -c "SELECT COUNT(*) AS user_stats_count FROM gamification_system.user_stats;"
# Expect: 10

psql "$TEST_DATABASE_URL" -c "SELECT COUNT(*) AS user_ranks_count FROM gamification_system.user_ranks;"
# Expect: 10
```

5. **Validar integridad referencial:**
```sql
-- Verificar que todas las FKs son válidas

-- 1. Profiles.school_id → schools.id
SELECT COUNT(*)
FROM auth_management.profiles p
LEFT JOIN social_features.schools s ON p.school_id = s.id
WHERE p.school_id IS NOT NULL AND s.id IS NULL;
-- Expect: 0 (ningún profile con school_id inválido)

-- 2. User_stats.user_id → profiles.user_id
SELECT COUNT(*)
FROM gamification_system.user_stats us
LEFT JOIN auth_management.profiles p ON us.user_id = p.user_id
WHERE p.user_id IS NULL;
-- Expect: 0

-- 3. User_ranks.user_id → auth.users.id
SELECT COUNT(*)
FROM gamification_system.user_ranks ur
LEFT JOIN auth.users u ON ur.user_id = u.id
WHERE u.id IS NULL;
-- Expect: 0
```

6. **Validar coherencia de datos:**
```sql
-- Verificar que user_stats.level es coherente con user_ranks.current_rank

SELECT
  us.user_id,
  us.level,
  us.current_rank AS stats_rank,
  ur.current_rank AS ranks_rank,
  CASE
    WHEN us.current_rank = ur.current_rank THEN '✅ COHERENTE'
    ELSE '❌ INCOHERENTE'
  END AS status
FROM gamification_system.user_stats us
JOIN gamification_system.user_ranks ur ON us.user_id = ur.user_id
WHERE ur.is_current = true;

-- Todos deben mostrar ✅ COHERENTE
```

### Criterios de Aceptación

✅ Script create-database.sh se ejecuta sin errores
✅ Se cargan 2 schools correctamente
✅ Se cargan 10 profiles completos
✅ Se cargan 10 user_stats con datos realistas
✅ Se cargan 10 user_ranks coherentes con user_stats
✅ Todas las Foreign Keys son válidas
✅ No hay conflictos de IDs duplicados
✅ Datos coherentes entre tablas relacionadas
✅ Timestamps válidos y lógicos

### Impacto

**Antes:**
- ❌ Database vacía después de create-database.sh
- ❌ No hay usuarios de prueba
- ❌ No hay datos de gamification
- ❌ Frontend no puede probar funcionalidades

**Después:**
- ✅ Database poblada con 10 usuarios completos
- ✅ 2 escuelas con estudiantes asignados
- ✅ Datos realistas de gamification (XP, Ranks, ML Coins)
- ✅ Frontend puede probar todas las funcionalidades
- ✅ Leaderboards funcionales con datos
- ✅ Progression system testeable

**Estimación:** 15 minutos

---

## ISSUE #3: Validación de Estructura (Informativo) ✅

### Descripción

Durante la validación exhaustiva se confirmó que:

✅ **Todas las tablas existen y están correctamente estructuradas**
✅ **Todos los campos están definidos con tipos correctos**
✅ **Foreign Keys correctamente establecidas**
✅ **Indexes adecuados**
✅ **ENUMs correctamente definidos**

### Tablas Validadas (100%)

| Schema | Tabla | Campos | Estado |
|--------|-------|--------|--------|
| `auth_management` | `profiles` | 25 | ✅ 100% |
| `gamification_system` | `user_stats` | 37 | ✅ 100% |
| `gamification_system` | `user_ranks` | 20 | ✅ 100% |
| `progress_tracking` | `exercise_attempts` | 13 | ✅ 100% |
| `progress_tracking` | `exercise_submissions` | 12 | ✅ 100% |
| `social_features` | `schools` | 23 | ✅ 100% |
| `social_features` | `classrooms` | 15 | ✅ 100% |
| `social_features` | `friendships` | 8 | ✅ 100% |

**No se requieren cambios en estructura de tablas.**

---

## PLAN DE EJECUCIÓN

### Fase 1: Corrección de Trigger Function (30 min) 🔴 P0

```bash
# 1. Editar función
nano apps/database/ddl/schemas/gamilit/functions/14-update_user_stats_on_exercise_complete.sql

# 2. Aplicar corrección
psql "$DATABASE_URL" -f apps/database/ddl/schemas/gamilit/functions/14-update_user_stats_on_exercise_complete.sql

# 3. Validar
psql "$DATABASE_URL" -c "\df gamilit.update_user_stats_on_exercise_complete"

# 4. Test funcional
psql "$DATABASE_URL" -f apps/database/tests/test_trigger_user_stats.sql
```

### Fase 2: Integración de Seeds (15 min) 🟡 P1

```bash
# 1. Backup
cp create-database.sh create-database.sh.backup

# 2. Editar script
nano create-database.sh
# Agregar 8 líneas de seeds

# 3. Validar archivos existen
ls -lh seeds/prod/social_features/01-schools.sql
ls -lh seeds/prod/auth_management/04-profiles-complete.sql
# ... validar los 7 archivos

# 4. Ejecutar en test database
DATABASE_URL="$TEST_DATABASE_URL" ./create-database.sh

# 5. Validar datos cargados
psql "$TEST_DATABASE_URL" -c "SELECT COUNT(*) FROM social_features.schools;"
psql "$TEST_DATABASE_URL" -c "SELECT COUNT(*) FROM auth_management.profiles;"
psql "$TEST_DATABASE_URL" -c "SELECT COUNT(*) FROM gamification_system.user_stats;"
```

### Fase 3: Validación End-to-End (10 min)

```bash
# 1. Recrear database completa
./drop-and-recreate-database.sh

# 2. Validar integridad
psql "$DATABASE_URL" -f validation/validate_all_seeds.sql

# 3. Validar triggers funcionan
psql "$DATABASE_URL" -f tests/test_all_triggers.sql

# 4. Generar reporte
psql "$DATABASE_URL" -f validation/database_health_check.sql > database_health_report.txt
```

**Tiempo Total:** 55 minutos

---

## CHECKLIST DE VALIDACIÓN

### Pre-Implementación
- [ ] Backup de create-database.sh realizado
- [ ] Backup de función trigger realizada
- [ ] Test database creada
- [ ] Permisos de escritura verificados

### Implementación de Trigger Fix
- [ ] Función editada con correcciones
- [ ] SQL aplicado sin errores
- [ ] Función aparece en `\df` command
- [ ] Test INSERT en exercise_attempts exitoso
- [ ] user_stats actualizado correctamente
- [ ] No hay errores en PostgreSQL logs

### Implementación de Seeds
- [ ] Todos los archivos seed verificados existentes
- [ ] create-database.sh editado correctamente
- [ ] Orden de ejecución correcto (tenants → schools → profiles → stats → ranks)
- [ ] Script ejecutado en test database sin errores
- [ ] Counts correctos: 2 schools, 10 profiles, 10 stats, 10 ranks
- [ ] Foreign Keys válidas
- [ ] Datos coherentes entre tablas

### Post-Implementación
- [ ] Database principal recreada con cambios
- [ ] Validación end-to-end ejecutada
- [ ] Health check pasado
- [ ] Reporte de validación generado
- [ ] Documentación actualizada

---

## ARCHIVOS DE REFERENCIA

### Documentación Original
- `VALIDACION-PRE-IMPLEMENTACION-2025-11-11.md` - Reporte completo de validación
- `PLAN-ACCION-CORRECCIONES-P0-2025-11-11.md` - Plan original (ahora desactualizado)

### DDL Files
- `apps/database/ddl/schemas/gamilit/functions/14-update_user_stats_on_exercise_complete.sql`
- `apps/database/ddl/schemas/gamilit/triggers/01-update_user_stats_on_exercise_complete.sql`
- `apps/database/ddl/schemas/gamification_system/tables/01-user_stats.sql`

### Seeds Files
- `apps/database/seeds/prod/social_features/01-schools.sql`
- `apps/database/seeds/prod/auth_management/04-profiles-complete.sql`
- `apps/database/seeds/prod/gamification_system/05-user_stats.sql`
- `apps/database/seeds/prod/gamification_system/06-user_ranks.sql`
- `apps/database/seeds/prod/gamification_system/07-ml_coins_transactions.sql`
- `apps/database/seeds/prod/gamification_system/08-user_achievements.sql`
- `apps/database/seeds/prod/gamification_system/09-comodines_inventory.sql`

### Scripts
- `apps/database/create-database.sh` - A modificar
- `apps/database/drop-and-recreate-database.sh` - Usar para testing

---

## CONTACTO Y ESCALACIÓN

**Agente Origen:** Frontend Validation Agent
**Reporte Fecha:** 2025-11-11
**Prioridad:** 🔴 P0 (Trigger Bug) + 🟡 P1 (Seeds)
**Tiempo Estimado Total:** 55 minutos
**Bloqueadores:** Ninguno (todos los archivos existen)

**En caso de problemas:**
1. Verificar que PostgreSQL está corriendo
2. Verificar permisos de usuario database
3. Verificar que DATABASE_URL es correcto
4. Consultar logs: `psql "$DATABASE_URL" -c "SELECT * FROM pg_stat_activity;"`

---

**FIN DEL HANDOFF**
