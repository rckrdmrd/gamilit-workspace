-- =====================================================
-- Script de Validación: generate_student_alerts() JOINs
-- Descripción: Valida que los JOINs arquitectónicos sean correctos
-- Fecha: 2025-11-24
-- Agente: Database-Agent
-- =====================================================

\echo '========================================='
\echo 'VALIDACIÓN: generate_student_alerts()'
\echo 'Verificando JOINs arquitectónicos'
\echo '========================================='
\echo ''

-- =====================================================
-- 1. VERIFICAR QUE LA FUNCIÓN EXISTE
-- =====================================================
\echo '1. Verificando que la función existe...'
SELECT
  p.proname as function_name,
  n.nspname as schema_name,
  pg_get_functiondef(p.oid) LIKE '%auth_management.profiles%' as uses_profiles_join,
  pg_get_functiondef(p.oid) LIKE '%JOIN auth.users%' as uses_auth_users_join
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'generate_student_alerts'
  AND n.nspname = 'progress_tracking';

\echo ''
\echo '   ✓ Si uses_profiles_join = t y uses_auth_users_join = f → CORRECTO'
\echo '   ✗ Si uses_auth_users_join = t → INCORRECTO (todavía usa JOINs antiguos)'
\echo ''

-- =====================================================
-- 2. VERIFICAR FOREIGN KEYS RELEVANTES
-- =====================================================
\echo '2. Verificando Foreign Keys relevantes...'
\echo ''

\echo '   2.1 module_progress.user_id → profiles(id)'
SELECT
  tc.table_schema,
  tc.table_name,
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'progress_tracking'
  AND tc.table_name = 'module_progress'
  AND kcu.column_name = 'user_id';

\echo ''
\echo '   2.2 exercise_submissions.user_id → profiles(id)'
SELECT
  tc.table_schema,
  tc.table_name,
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'progress_tracking'
  AND tc.table_name = 'exercise_submissions'
  AND kcu.column_name = 'user_id';

\echo ''
\echo '   2.3 student_intervention_alerts.student_id → auth.users(id)'
SELECT
  tc.table_schema,
  tc.table_name,
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'progress_tracking'
  AND tc.table_name = 'student_intervention_alerts'
  AND kcu.column_name = 'student_id';

\echo ''
\echo '   2.4 profiles.user_id → auth.users(id)'
SELECT
  tc.table_schema,
  tc.table_name,
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'auth_management'
  AND tc.table_name = 'profiles'
  AND kcu.column_name = 'user_id';

-- =====================================================
-- 3. RECREAR LA FUNCIÓN ACTUALIZADA
-- =====================================================
\echo ''
\echo '3. Recreando la función con JOINs corregidos...'
\i apps/database/ddl/schemas/progress_tracking/functions/15-generate_student_alerts.sql

-- =====================================================
-- 4. VERIFICAR DEFINICIÓN DE LA FUNCIÓN
-- =====================================================
\echo ''
\echo '4. Verificando definición de la función...'
\echo ''

-- Contar ocurrencias de JOIN auth_management.profiles
\echo '   4.1 Ocurrencias de "JOIN auth_management.profiles":'
SELECT COUNT(*)::text || ' ocurrencias (esperado: 3)' as resultado
FROM regexp_matches(
  pg_get_functiondef(
    (SELECT oid FROM pg_proc WHERE proname = 'generate_student_alerts' AND pronamespace = 'progress_tracking'::regnamespace)
  ),
  'JOIN auth_management\.profiles',
  'g'
);

-- Contar ocurrencias de JOIN auth.users (debería ser 0)
\echo ''
\echo '   4.2 Ocurrencias de "JOIN auth.users" (debe ser 0):'
SELECT COALESCE(COUNT(*)::text, '0') || ' ocurrencias (esperado: 0)' as resultado
FROM regexp_matches(
  pg_get_functiondef(
    (SELECT oid FROM pg_proc WHERE proname = 'generate_student_alerts' AND pronamespace = 'progress_tracking'::regnamespace)
  ),
  'JOIN auth\.users',
  'g'
);

-- Contar ocurrencias de p.tenant_id
\echo ''
\echo '   4.3 Ocurrencias de "p.tenant_id":'
SELECT COUNT(*)::text || ' ocurrencias (esperado: 3)' as resultado
FROM regexp_matches(
  pg_get_functiondef(
    (SELECT oid FROM pg_proc WHERE proname = 'generate_student_alerts' AND pronamespace = 'progress_tracking'::regnamespace)
  ),
  'p\.tenant_id',
  'g'
);

-- Contar ocurrencias de p.user_id (debe aparecer en los 3 INSERTs)
\echo ''
\echo '   4.4 Ocurrencias de "p.user_id":'
SELECT COUNT(*)::text || ' ocurrencias (esperado: 3)' as resultado
FROM regexp_matches(
  pg_get_functiondef(
    (SELECT oid FROM pg_proc WHERE proname = 'generate_student_alerts' AND pronamespace = 'progress_tracking'::regnamespace)
  ),
  'p\.user_id',
  'g'
);

-- =====================================================
-- 5. PRUEBA FUNCIONAL (OPCIONAL)
-- =====================================================
\echo ''
\echo '5. Prueba funcional (opcional)...'
\echo '   Si desea ejecutar la función, ejecute:'
\echo '   SELECT progress_tracking.generate_student_alerts();'
\echo ''

-- =====================================================
-- 6. ANÁLISIS DE DATOS DE PRUEBA (SI EXISTEN)
-- =====================================================
\echo '6. Analizando datos existentes...'
\echo ''

\echo '   6.1 Estudiantes con progreso en módulos:'
SELECT COUNT(DISTINCT user_id) as total_students
FROM progress_tracking.module_progress;

\echo ''
\echo '   6.2 Estudiantes con ejercicios intentados:'
SELECT COUNT(DISTINCT user_id) as total_students
FROM progress_tracking.exercise_submissions;

\echo ''
\echo '   6.3 Verificar que profiles.user_id mapea a auth.users.id:'
SELECT
  COUNT(*) as total_profiles,
  COUNT(DISTINCT p.id) as unique_profile_ids,
  COUNT(DISTINCT p.user_id) as unique_user_ids,
  COUNT(DISTINCT u.id) as unique_auth_user_ids,
  CASE
    WHEN COUNT(DISTINCT p.user_id) = COUNT(DISTINCT u.id) THEN 'CORRECTO ✓'
    ELSE 'INCONSISTENTE ✗'
  END as mapping_status
FROM auth_management.profiles p
LEFT JOIN auth.users u ON p.user_id = u.id;

\echo ''
\echo '   6.4 Alertas generadas actualmente:'
SELECT
  alert_type,
  COUNT(*) as total,
  COUNT(DISTINCT student_id) as unique_students
FROM progress_tracking.student_intervention_alerts
GROUP BY alert_type
ORDER BY alert_type;

-- =====================================================
-- 7. RESUMEN DE VALIDACIÓN
-- =====================================================
\echo ''
\echo '========================================='
\echo 'RESUMEN DE VALIDACIÓN'
\echo '========================================='
\echo ''
\echo 'CRITERIOS DE ACEPTACIÓN:'
\echo '  ✓ Función usa JOIN auth_management.profiles (3 veces)'
\echo '  ✓ Función NO usa JOIN auth.users (0 veces)'
\echo '  ✓ Función usa p.tenant_id (3 veces)'
\echo '  ✓ Función usa p.user_id (3 veces)'
\echo '  ✓ FKs verificadas:'
\echo '    - module_progress.user_id → profiles(id)'
\echo '    - exercise_submissions.user_id → profiles(id)'
\echo '    - student_intervention_alerts.student_id → auth.users(id)'
\echo '    - profiles.user_id → auth.users(id)'
\echo ''
\echo 'Si todos los criterios se cumplen: ✅ VALIDACIÓN EXITOSA'
\echo 'Si algún criterio falla: ✗ REVISAR IMPLEMENTACIÓN'
\echo ''
\echo '========================================='
