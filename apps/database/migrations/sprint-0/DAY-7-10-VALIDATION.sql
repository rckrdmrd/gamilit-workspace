-- =====================================================
-- SPRINT 0 - DÍA 7-10: VALIDACIÓN Y TESTING
-- =====================================================
-- Duración: 20 horas
-- Prioridad: P0 CRÍTICO
-- Objetivo: Validar que todo funciona correctamente
-- =====================================================

-- IMPORTANTE: Ejecutar DESPUÉS de DAY-5-6-PERFORMANCE.sql
-- Este script NO modifica la BD, solo valida

\echo '=== SPRINT 0 - DÍA 7-10: INICIANDO VALIDACIÓN Y TESTING ==='

-- =====================================================
-- 1. VERIFICACIÓN DE RLS
-- =====================================================

\echo ''
\echo '>>> SECCIÓN 1: VERIFICANDO ROW LEVEL SECURITY'
\echo '================================================'

-- Verificar que RLS está habilitado
SELECT
  schemaname,
  tablename,
  CASE WHEN rowsecurity THEN '✓ HABILITADO' ELSE '✗ DESHABILITADO' END as rls_status
FROM pg_tables
WHERE schemaname IN ('auth_management', 'gamification_system')
  AND tablename IN (
    'password_reset_tokens',
    'user_sessions',
    'profiles',
    'notifications',
    'ml_coins_transactions'
  )
ORDER BY schemaname, tablename;

-- Contar políticas RLS
\echo ''
\echo '>>> Contando políticas RLS...'

SELECT
  schemaname,
  tablename,
  COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname IN ('auth_management', 'gamification_system')
  AND tablename IN (
    'password_reset_tokens',
    'user_sessions',
    'profiles',
    'notifications',
    'ml_coins_transactions'
  )
GROUP BY schemaname, tablename
ORDER BY schemaname, tablename;

-- Resultado esperado: 13+ políticas en total

-- =====================================================
-- 2. VERIFICACIÓN DE FUNCIONES
-- =====================================================

\echo ''
\echo '>>> SECCIÓN 2: VERIFICANDO FUNCIONES'
\echo '================================================'

SELECT
  routine_schema,
  routine_name,
  '✓ EXISTE' as status,
  pg_get_functiondef(routine_name::regproc)::TEXT LIKE '%LANGUAGE plpgsql%' as is_plpgsql
FROM information_schema.routines
WHERE routine_schema = 'gamification_system'
  AND routine_name IN (
    'apply_xp_boost',
    'get_next_maya_rank',
    'update_rank_on_xp_change',
    'cleanup_expired_boosts',
    'get_user_rank_progress',
    'refresh_global_leaderboard'
  )
ORDER BY routine_name;

-- Resultado esperado: 6 funciones

-- =====================================================
-- 3. VERIFICACIÓN DE TRIGGERS
-- =====================================================

\echo ''
\echo '>>> SECCIÓN 3: VERIFICANDO TRIGGERS'
\echo '================================================'

SELECT
  trigger_schema,
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation,
  '✓ ACTIVO' as status
FROM information_schema.triggers
WHERE trigger_name IN (
  'after_xp_update_rank'
)
ORDER BY trigger_schema, trigger_name;

-- Resultado esperado: 1 trigger

-- =====================================================
-- 4. VERIFICACIÓN DE TABLAS
-- =====================================================

\echo ''
\echo '>>> SECCIÓN 4: VERIFICANDO TABLAS NUEVAS'
\echo '================================================'

SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes
FROM pg_stat_user_tables
WHERE schemaname = 'gamification_system'
  AND tablename = 'rank_history'
ORDER BY schemaname, tablename;

-- Resultado esperado: Tabla rank_history existe

-- =====================================================
-- 5. VERIFICACIÓN DE ÍNDICES
-- =====================================================

\echo ''
\echo '>>> SECCIÓN 5: VERIFICANDO ÍNDICES CRÍTICOS'
\echo '================================================'

SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size,
  '✓ CREADO' as status
FROM pg_indexes
WHERE schemaname IN ('gamification_system', 'progress_tracking', 'audit_logging')
  AND indexname IN (
    'idx_user_stats_xp_desc',
    'idx_user_stats_rank_xp',
    'idx_user_stats_coins_desc',
    'idx_user_stats_last_activity',
    'idx_module_progress_user_updated',
    'idx_module_progress_module_status',
    'idx_exercise_attempts_user_created',
    'idx_audit_logs_user_created',
    'idx_audit_logs_entity',
    'idx_audit_logs_action_date',
    'idx_audit_logs_created_brin'
  )
ORDER BY schemaname, tablename, indexname;

-- Resultado esperado: 11 índices

-- =====================================================
-- 6. VERIFICACIÓN DE MATERIALIZED VIEWS
-- =====================================================

\echo ''
\echo '>>> SECCIÓN 6: VERIFICANDO MATERIALIZED VIEWS'
\echo '================================================'

SELECT
  schemaname,
  matviewname,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) as size,
  CASE WHEN last_refresh IS NULL THEN '✗ NUNCA' ELSE '✓ ' || last_refresh::TEXT END as last_refresh
FROM pg_matviews
WHERE schemaname = 'gamification_system'
  AND matviewname = 'mv_global_leaderboard';

-- Resultado esperado: 1 MV con last_refresh reciente

-- Contar registros en leaderboard
\echo ''
\echo '>>> Verificando contenido del leaderboard...'

SELECT
  COUNT(*) as total_users,
  MAX(rank_position) as max_rank,
  MIN(total_xp) as min_xp,
  MAX(total_xp) as max_xp,
  ROUND(AVG(total_xp)) as avg_xp
FROM gamification_system.mv_global_leaderboard;

-- =====================================================
-- 7. TESTS FUNCIONALES
-- =====================================================

\echo ''
\echo '>>> SECCIÓN 7: TESTS FUNCIONALES'
\echo '================================================'

-- Test 1: apply_xp_boost
\echo '>>> Test 1: apply_xp_boost()'

DO $$
DECLARE
  v_result INTEGER;
BEGIN
  v_result := gamification_system.apply_xp_boost(
    '00000000-0000-0000-0000-000000000001'::UUID,
    100
  );

  IF v_result >= 100 THEN
    RAISE NOTICE '  ✓ PASS: apply_xp_boost retorna valor >= 100 (resultado: %)', v_result;
  ELSE
    RAISE WARNING '  ✗ FAIL: apply_xp_boost retorna valor incorrecto: %', v_result;
  END IF;
END $$;

-- Test 2: get_next_maya_rank
\echo '>>> Test 2: get_next_maya_rank()'

DO $$
DECLARE
  v_rank VARCHAR(50);
BEGIN
  -- Test con 0 XP
  v_rank := gamification_system.get_next_maya_rank(0);
  IF v_rank = 'Ajaw' THEN
    RAISE NOTICE '  ✓ PASS: 0 XP = Ajaw';
  ELSE
    RAISE WARNING '  ✗ FAIL: 0 XP debería ser Ajaw, obtenido: %', v_rank;
  END IF;

  -- Test con 1000 XP
  v_rank := gamification_system.get_next_maya_rank(1000);
  IF v_rank = 'Nacom' THEN
    RAISE NOTICE '  ✓ PASS: 1000 XP = Nacom';
  ELSE
    RAISE WARNING '  ✗ FAIL: 1000 XP debería ser Nacom, obtenido: %', v_rank;
  END IF;

  -- Test con 10000 XP (máximo)
  v_rank := gamification_system.get_next_maya_rank(10000);
  IF v_rank = 'K''uk''ulkan' THEN
    RAISE NOTICE '  ✓ PASS: 10000 XP = K''uk''ulkan (máximo)';
  ELSE
    RAISE WARNING '  ✗ FAIL: 10000 XP debería ser K''uk''ulkan, obtenido: %', v_rank;
  END IF;
END $$;

-- Test 3: get_user_rank_progress (si hay usuarios de prueba)
\echo '>>> Test 3: get_user_rank_progress() (requiere datos)'

DO $$
DECLARE
  v_user_id UUID;
  v_result RECORD;
BEGIN
  -- Intentar obtener un usuario de prueba
  SELECT id INTO v_user_id
  FROM auth_management.profiles
  WHERE role = 'student'
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    SELECT * INTO v_result
    FROM gamification_system.get_user_rank_progress(v_user_id);

    IF v_result.current_rank IS NOT NULL THEN
      RAISE NOTICE '  ✓ PASS: get_user_rank_progress retorna datos (user: %, rank: %)', v_user_id, v_result.current_rank;
    ELSE
      RAISE WARNING '  ✗ FAIL: get_user_rank_progress no retorna datos';
    END IF;
  ELSE
    RAISE NOTICE '  ⊘ SKIP: No hay usuarios de prueba';
  END IF;
END $$;

-- =====================================================
-- 8. TESTS DE PERFORMANCE
-- =====================================================

\echo ''
\echo '>>> SECCIÓN 8: TESTS DE PERFORMANCE'
\echo '================================================'

-- Test 1: Leaderboard desde MV
\echo '>>> Test 1: Performance de leaderboard desde MV'

DO $$
DECLARE
  v_start TIMESTAMPTZ;
  v_duration NUMERIC;
  v_count INTEGER;
BEGIN
  v_start := clock_timestamp();

  SELECT COUNT(*) INTO v_count
  FROM gamification_system.mv_global_leaderboard
  LIMIT 100;

  v_duration := EXTRACT(MILLISECONDS FROM clock_timestamp() - v_start);

  RAISE NOTICE '  Duración: % ms', ROUND(v_duration, 2);

  IF v_duration < 10 THEN
    RAISE NOTICE '  ✓ EXCELENTE: < 10ms (objetivo cumplido)';
  ELSIF v_duration < 50 THEN
    RAISE NOTICE '  ✓ ACEPTABLE: < 50ms';
  ELSIF v_duration < 100 THEN
    RAISE WARNING '  ⚠ LENTO: < 100ms pero por encima del objetivo';
  ELSE
    RAISE WARNING '  ✗ MUY LENTO: >= 100ms (revisar configuración)';
  END IF;
END $$;

-- Test 2: Query con índice en user_stats
\echo '>>> Test 2: Performance de query con índice'

DO $$
DECLARE
  v_start TIMESTAMPTZ;
  v_duration NUMERIC;
  v_count INTEGER;
BEGIN
  v_start := clock_timestamp();

  SELECT COUNT(*) INTO v_count
  FROM gamification_system.user_stats
  ORDER BY total_xp DESC
  LIMIT 100;

  v_duration := EXTRACT(MILLISECONDS FROM clock_timestamp() - v_start);

  RAISE NOTICE '  Duración: % ms', ROUND(v_duration, 2);

  IF v_duration < 50 THEN
    RAISE NOTICE '  ✓ EXCELENTE: < 50ms';
  ELSIF v_duration < 100 THEN
    RAISE NOTICE '  ✓ ACEPTABLE: < 100ms';
  ELSE
    RAISE WARNING '  ⚠ LENTO: >= 100ms (revisar índices)';
  END IF;
END $$;

-- =====================================================
-- 9. VERIFICACIÓN DE JOBS PROGRAMADOS
-- =====================================================

\echo ''
\echo '>>> SECCIÓN 9: VERIFICANDO JOBS PROGRAMADOS (pg_cron)'
\echo '================================================'

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    RAISE NOTICE '  ✓ pg_cron está instalado';

    -- Mostrar jobs programados
    PERFORM jobid, schedule, command
    FROM cron.job
    WHERE command LIKE '%gamification_system%'
      OR command LIKE '%cleanup%';

    RAISE NOTICE '  → Ver jobs con: SELECT * FROM cron.job;';
  ELSE
    RAISE NOTICE '  ⊘ pg_cron NO está instalado (jobs no programados)';
    RAISE NOTICE '  → Configurar refresh manual o instalar pg_cron';
  END IF;
END $$;

-- =====================================================
-- 10. RESUMEN DE VALIDACIÓN
-- =====================================================

\echo ''
\echo '======================================================='
\echo 'SPRINT 0 - DÍA 7-10: RESUMEN DE VALIDACIÓN'
\echo '======================================================='

-- Generar reporte resumido
DO $$
DECLARE
  v_rls_count INTEGER;
  v_policy_count INTEGER;
  v_function_count INTEGER;
  v_trigger_count INTEGER;
  v_index_count INTEGER;
  v_mv_count INTEGER;
  v_total_score INTEGER := 0;
  v_max_score INTEGER := 60;
BEGIN
  \echo ''

  -- 1. RLS habilitado (10 puntos)
  SELECT COUNT(*) INTO v_rls_count
  FROM pg_tables
  WHERE schemaname IN ('auth_management', 'gamification_system')
    AND tablename IN ('password_reset_tokens', 'user_sessions', 'profiles', 'notifications', 'ml_coins_transactions')
    AND rowsecurity = true;

  IF v_rls_count = 5 THEN
    v_total_score := v_total_score + 10;
    RAISE NOTICE '✓ RLS habilitado: 5/5 tablas (10/10 puntos)';
  ELSE
    RAISE WARNING '⚠ RLS habilitado: %/5 tablas (%/10 puntos)', v_rls_count, v_rls_count * 2;
    v_total_score := v_total_score + (v_rls_count * 2);
  END IF;

  -- 2. Políticas RLS (10 puntos)
  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies
  WHERE schemaname IN ('auth_management', 'gamification_system')
    AND tablename IN ('password_reset_tokens', 'user_sessions', 'profiles', 'notifications', 'ml_coins_transactions');

  IF v_policy_count >= 13 THEN
    v_total_score := v_total_score + 10;
    RAISE NOTICE '✓ Políticas RLS: % políticas (10/10 puntos)', v_policy_count;
  ELSE
    RAISE WARNING '⚠ Políticas RLS: % políticas (esperadas: 13+)', v_policy_count;
    v_total_score := v_total_score + LEAST(v_policy_count, 10);
  END IF;

  -- 3. Funciones (15 puntos)
  SELECT COUNT(*) INTO v_function_count
  FROM information_schema.routines
  WHERE routine_schema = 'gamification_system'
    AND routine_name IN ('apply_xp_boost', 'get_next_maya_rank', 'update_rank_on_xp_change',
                         'cleanup_expired_boosts', 'get_user_rank_progress', 'refresh_global_leaderboard');

  IF v_function_count = 6 THEN
    v_total_score := v_total_score + 15;
    RAISE NOTICE '✓ Funciones: 6/6 (15/15 puntos)';
  ELSE
    RAISE WARNING '⚠ Funciones: %/6', v_function_count;
    v_total_score := v_total_score + (v_function_count * 2);
  END IF;

  -- 4. Triggers (5 puntos)
  SELECT COUNT(*) INTO v_trigger_count
  FROM information_schema.triggers
  WHERE trigger_name = 'after_xp_update_rank';

  IF v_trigger_count = 1 THEN
    v_total_score := v_total_score + 5;
    RAISE NOTICE '✓ Triggers: 1/1 (5/5 puntos)';
  ELSE
    RAISE WARNING '⚠ Triggers: %/1', v_trigger_count;
  END IF;

  -- 5. Índices (10 puntos)
  SELECT COUNT(*) INTO v_index_count
  FROM pg_indexes
  WHERE schemaname IN ('gamification_system', 'progress_tracking', 'audit_logging')
    AND indexname LIKE 'idx_%'
    AND indexname IN (
      'idx_user_stats_xp_desc', 'idx_user_stats_rank_xp', 'idx_user_stats_coins_desc',
      'idx_user_stats_last_activity', 'idx_module_progress_user_updated', 'idx_module_progress_module_status',
      'idx_exercise_attempts_user_created', 'idx_audit_logs_user_created', 'idx_audit_logs_entity',
      'idx_audit_logs_action_date', 'idx_audit_logs_created_brin'
    );

  IF v_index_count >= 11 THEN
    v_total_score := v_total_score + 10;
    RAISE NOTICE '✓ Índices: 11/11 (10/10 puntos)';
  ELSE
    RAISE WARNING '⚠ Índices: %/11', v_index_count;
    v_total_score := v_total_score + v_index_count;
  END IF;

  -- 6. Materialized Views (10 puntos)
  SELECT COUNT(*) INTO v_mv_count
  FROM pg_matviews
  WHERE schemaname = 'gamification_system'
    AND matviewname = 'mv_global_leaderboard'
    AND last_refresh IS NOT NULL;

  IF v_mv_count = 1 THEN
    v_total_score := v_total_score + 10;
    RAISE NOTICE '✓ Materialized Views: 1/1 con refresh (10/10 puntos)';
  ELSE
    RAISE WARNING '⚠ Materialized Views: %/1 (falta refresh)', v_mv_count;
  END IF;

  \echo ''
  \echo '-------------------------------------------------------'
  RAISE NOTICE 'PUNTUACIÓN TOTAL: %/% (%.1f%%)', v_total_score, v_max_score,
    (v_total_score::NUMERIC / v_max_score::NUMERIC * 100);
  \echo '-------------------------------------------------------'

  IF v_total_score >= 55 THEN
    \echo ''
    \echo '✓✓✓ SPRINT 0 COMPLETADO EXITOSAMENTE ✓✓✓';
    \echo '';
    \echo 'El sistema está listo para:';
    \echo '  → Testing de integración';
    \echo '  → Deploy a staging';
    \echo '  → Preparación para producción';
  ELSIF v_total_score >= 45 THEN
    \echo ''
    \echo '⚠⚠⚠ SPRINT 0 CASI COMPLETO ⚠⚠⚠';
    \echo '';
    \echo 'Revisar las secciones marcadas con ⚠';
    \echo 'Completar los objetos faltantes antes de producción';
  ELSE
    \echo ''
    \echo '✗✗✗ SPRINT 0 INCOMPLETO ✗✗✗';
    \echo '';
    \echo 'CRÍTICO: Revisar errores y re-ejecutar scripts faltantes';
  END IF;

  \echo ''
END $$;

\echo ''
\echo '======================================================='
\echo 'VALIDACIÓN COMPLETADA'
\echo '======================================================='
\echo ''
\echo 'Próximos pasos recomendados:'
\echo '  1. Revisar cualquier warning ⚠ en la salida'
\echo '  2. Ejecutar tests de integración en aplicación'
\echo '  3. Corregir datos de prueba si es necesario'
\echo '  4. Ejecutar seeds corregidos'
\echo '  5. Testing E2E con frontend'
\echo ''
\echo 'Scripts adicionales disponibles:'
\echo '  → seeds/dev/*.sql (datos de prueba)'
\echo '  → MASTER-SPRINT-0.sql (re-ejecutar todo)'
\echo '======================================================='
