-- =====================================================
-- VERIFY-LEADERBOARD-DATA.sql
-- =====================================================
-- Description: Verifica que existan datos suficientes para el sistema de leaderboard
-- Created: 2026-01-08
-- Version: 1.0
-- Reference: CORR-006
-- =====================================================
--
-- EJECUCIÓN:
-- psql -h localhost -p 5432 -U gamilit_user -d gamilit_platform -f verify-leaderboard-data.sql
--
-- =====================================================

\echo ''
\echo '=========================================='
\echo 'VERIFICACIÓN DE DATOS PARA LEADERBOARD'
\echo '=========================================='
\echo ''

-- =====================================================
-- 1. VERIFICAR TABLA user_stats
-- =====================================================

\echo '1. VERIFICANDO gamification_system.user_stats'
\echo '--------------------------------------------'

SELECT
    'Total registros en user_stats' as metric,
    COUNT(*)::text as value
FROM gamification_system.user_stats;

SELECT
    'Usuarios con XP > 0' as metric,
    COUNT(*)::text as value
FROM gamification_system.user_stats
WHERE total_xp > 0;

SELECT
    'Usuarios con nivel > 1' as metric,
    COUNT(*)::text as value
FROM gamification_system.user_stats
WHERE level > 1;

\echo ''

-- =====================================================
-- 2. VERIFICAR PERFILES VINCULADOS
-- =====================================================

\echo '2. VERIFICANDO auth_management.profiles'
\echo '--------------------------------------------'

SELECT
    'Total perfiles' as metric,
    COUNT(*)::text as value
FROM auth_management.profiles;

SELECT
    'Perfiles activos con rol student' as metric,
    COUNT(*)::text as value
FROM auth_management.profiles
WHERE status = 'active' AND role = 'student';

SELECT
    'Perfiles CON user_stats vinculado' as metric,
    COUNT(*)::text as value
FROM auth_management.profiles p
INNER JOIN gamification_system.user_stats us ON p.user_id = us.user_id;

SELECT
    'Perfiles SIN user_stats (problema)' as metric,
    COUNT(*)::text as value
FROM auth_management.profiles p
LEFT JOIN gamification_system.user_stats us ON p.user_id = us.user_id
WHERE us.user_id IS NULL;

\echo ''

-- =====================================================
-- 3. SIMULAR QUERY DEL LEADERBOARD
-- =====================================================

\echo '3. SIMULACIÓN DE LEADERBOARD GLOBAL (Top 10)'
\echo '--------------------------------------------'

SELECT
    ROW_NUMBER() OVER (ORDER BY us.total_xp DESC) as rank,
    p.display_name as username,
    us.total_xp as score,
    us.level,
    us.current_rank as rank_badge,
    us.current_streak as streak
FROM auth_management.profiles p
INNER JOIN gamification_system.user_stats us ON p.user_id = us.user_id
WHERE p.status = 'active' AND p.role = 'student'
ORDER BY us.total_xp DESC
LIMIT 10;

\echo ''

-- =====================================================
-- 4. VERIFICAR VISTAS MATERIALIZADAS
-- =====================================================

\echo '4. VERIFICANDO VISTAS MATERIALIZADAS'
\echo '--------------------------------------------'

-- Verificar si existen las vistas
SELECT
    'mv_global_leaderboard' as view_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_matviews
        WHERE schemaname = 'gamification_system'
        AND matviewname = 'mv_global_leaderboard'
    ) THEN 'EXISTS' ELSE 'NOT FOUND' END as status;

SELECT
    'mv_classroom_leaderboard' as view_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_matviews
        WHERE schemaname = 'gamification_system'
        AND matviewname = 'mv_classroom_leaderboard'
    ) THEN 'EXISTS' ELSE 'NOT FOUND' END as status;

SELECT
    'mv_weekly_leaderboard' as view_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_matviews
        WHERE schemaname = 'gamification_system'
        AND matviewname = 'mv_weekly_leaderboard'
    ) THEN 'EXISTS' ELSE 'NOT FOUND' END as status;

\echo ''

-- =====================================================
-- 5. VERIFICAR METADATA DE LEADERBOARD
-- =====================================================

\echo '5. VERIFICANDO leaderboard_metadata'
\echo '--------------------------------------------'

SELECT
    view_name,
    last_refresh_at,
    total_users,
    refresh_duration_ms
FROM gamification_system.leaderboard_metadata
ORDER BY view_name;

\echo ''

-- =====================================================
-- 6. RESUMEN Y DIAGNÓSTICO
-- =====================================================

\echo '=========================================='
\echo 'DIAGNÓSTICO FINAL'
\echo '=========================================='

DO $$
DECLARE
    v_total_stats INTEGER;
    v_total_profiles INTEGER;
    v_linked_profiles INTEGER;
    v_students_with_xp INTEGER;
BEGIN
    -- Contar registros
    SELECT COUNT(*) INTO v_total_stats FROM gamification_system.user_stats;
    SELECT COUNT(*) INTO v_total_profiles FROM auth_management.profiles WHERE role = 'student';
    SELECT COUNT(*) INTO v_linked_profiles
    FROM auth_management.profiles p
    INNER JOIN gamification_system.user_stats us ON p.user_id = us.user_id
    WHERE p.role = 'student';
    SELECT COUNT(*) INTO v_students_with_xp
    FROM gamification_system.user_stats
    WHERE total_xp > 0;

    RAISE NOTICE '';
    RAISE NOTICE 'Registros en user_stats: %', v_total_stats;
    RAISE NOTICE 'Perfiles de estudiantes: %', v_total_profiles;
    RAISE NOTICE 'Estudiantes con stats: %', v_linked_profiles;
    RAISE NOTICE 'Estudiantes con XP > 0: %', v_students_with_xp;
    RAISE NOTICE '';

    IF v_total_stats = 0 THEN
        RAISE WARNING '❌ ERROR: No hay registros en user_stats';
        RAISE WARNING '   → Ejecute: ./LOAD-SEEDS-gamification_system.sh dev';
    ELSIF v_students_with_xp < 3 THEN
        RAISE WARNING '⚠️  ADVERTENCIA: Menos de 3 estudiantes con XP';
        RAISE WARNING '   → El leaderboard necesita más datos demo';
    ELSE
        RAISE NOTICE '✅ OK: Datos suficientes para el leaderboard';
    END IF;

    IF v_linked_profiles < v_total_profiles THEN
        RAISE WARNING '⚠️  ADVERTENCIA: % perfiles sin user_stats', v_total_profiles - v_linked_profiles;
        RAISE WARNING '   → Ejecute trigger initialize_user_stats o seeds';
    END IF;

    RAISE NOTICE '';
END $$;

\echo '=========================================='
\echo 'VERIFICACIÓN COMPLETADA'
\echo '=========================================='
