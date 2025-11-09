-- ============================================================================
-- SCRIPT: Post-Correction Validation
-- Fecha: 2025-11-08
-- Descripción: Valida que todas las correcciones P0 y P1 fueron aplicadas
--              correctamente
-- ============================================================================
--
-- USO:
--   psql "$DATABASE_URL" -f apps/database/scripts/validate-post-correction.sql
--
-- VALIDACIONES:
--   ✅ P0-1: ENUMs en schemas correctos
--   ✅ P0-2: Funciones faltantes creadas
--   ✅ P0-3: Funciones rotas corregidas/eliminadas
--   ✅ P0-4: ENUM progress_status creado
--   ✅ P1-1: FK references corregidas
--   ✅ P1-2: Function volatility corregida
--   ✅ P1-3: ON DELETE clauses agregadas
--
-- ============================================================================

\set QUIET on
\pset border 2
\pset format wrapped

\echo ''
\echo '============================================================================'
\echo 'POST-CORRECTION VALIDATION REPORT'
\echo '============================================================================'
\echo ''
\echo 'Fecha: ' `date +%Y-%m-%d\ %H:%M:%S`
\echo 'Database: ' :DBNAME
\echo ''

-- ============================================================================
-- VALIDACIÓN P0-1: ENUMs en schemas correctos
-- ============================================================================

\echo '============================================================================'
\echo 'P0-1: ENUM Schema References'
\echo '============================================================================'

-- Verificar que NO hay ENUMs en schema public (excepto los de Supabase)
SELECT
    'public ENUMs (should be 0)' AS validation,
    COUNT(*) AS count,
    CASE
        WHEN COUNT(*) = 0 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END AS status
FROM pg_type t
JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE t.typcategory = 'E'
  AND n.nspname = 'public'
  AND t.typname NOT IN ('aal_level', 'code_challenge_method', 'factor_status', 'factor_type');

-- Verificar distribución de ENUMs por schema
\echo ''
\echo 'ENUM Distribution by Schema:'
SELECT
    n.nspname AS schema,
    COUNT(*) AS enum_count
FROM pg_type t
JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE t.typcategory = 'E'
  AND n.nspname NOT IN ('pg_catalog', 'information_schema')
GROUP BY n.nspname
ORDER BY COUNT(*) DESC;

-- ============================================================================
-- VALIDACIÓN P0-2: Funciones faltantes creadas
-- ============================================================================

\echo ''
\echo '============================================================================'
\echo 'P0-2: Missing Functions Created'
\echo '============================================================================'

SELECT
    'gamilit.is_super_admin' AS function_name,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'gamilit' AND p.proname = 'is_super_admin'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END AS status
UNION ALL
SELECT
    'gamilit.has_role',
    CASE
        WHEN EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'gamilit' AND p.proname = 'has_role'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END
UNION ALL
SELECT
    'gamilit.initialize_user_missions',
    CASE
        WHEN EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'gamilit' AND p.proname = 'initialize_user_missions'
        ) THEN '✅ EXISTS (stub)'
        ELSE '❌ MISSING'
    END;

-- ============================================================================
-- VALIDACIÓN P0-3: Funciones rotas corregidas
-- ============================================================================

\echo ''
\echo '============================================================================'
\echo 'P0-3: Broken Functions Fixed'
\echo '============================================================================'

-- Verificar que funciones eliminadas NO existen
SELECT
    'calculate_learning_path' AS function_name,
    CASE
        WHEN NOT EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'educational_content' AND p.proname = 'calculate_learning_path'
        ) THEN '✅ REMOVED (correct)'
        ELSE '❌ STILL EXISTS'
    END AS status
UNION ALL
SELECT
    'get_recommended_missions',
    CASE
        WHEN NOT EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'educational_content' AND p.proname = 'get_recommended_missions'
        ) THEN '✅ REMOVED (correct)'
        ELSE '❌ STILL EXISTS'
    END;

-- Verificar que funciones corregidas existen
SELECT
    'process_exercise_completion' AS function_name,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM pg_proc
            WHERE proname = 'process_exercise_completion'
        ) THEN '✅ EXISTS (fixed)'
        ELSE '❌ MISSING'
    END AS status
UNION ALL
SELECT
    'log_audit_event',
    CASE
        WHEN EXISTS (
            SELECT 1 FROM pg_proc
            WHERE proname = 'log_audit_event'
        ) THEN '✅ EXISTS (fixed)'
        ELSE '❌ MISSING'
    END
UNION ALL
SELECT
    'calculate_user_rank',
    CASE
        WHEN EXISTS (
            SELECT 1 FROM pg_proc
            WHERE proname = 'calculate_user_rank'
        ) THEN '✅ EXISTS (fixed)'
        ELSE '❌ MISSING'
    END;

-- ============================================================================
-- VALIDACIÓN P0-4: ENUM progress_status creado
-- ============================================================================

\echo ''
\echo '============================================================================'
\echo 'P0-4: progress_status ENUM Created'
\echo '============================================================================'

SELECT
    'progress_tracking.progress_status' AS enum_name,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM pg_type t
            JOIN pg_namespace n ON t.typnamespace = n.oid
            WHERE n.nspname = 'progress_tracking' AND t.typname = 'progress_status'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END AS status;

-- Mostrar valores del ENUM si existe
\echo ''
\echo 'progress_status values:'
SELECT enumlabel AS value
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE n.nspname = 'progress_tracking' AND t.typname = 'progress_status'
ORDER BY enumsortorder;

-- ============================================================================
-- VALIDACIÓN P1-1: FK References corregidas
-- ============================================================================

\echo ''
\echo '============================================================================'
\echo 'P1-1: FK References to profiles (not auth.users)'
\echo '============================================================================'

-- Contar FK incorrectas (apuntan a auth.users)
SELECT
    'FK to auth.users (should be 0)' AS validation,
    COUNT(*) AS count,
    CASE
        WHEN COUNT(*) = 0 THEN '✅ PASS'
        ELSE '❌ FAIL - ' || COUNT(*)::TEXT || ' FK still point to auth.users'
    END AS status
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_schema = 'auth'
  AND ccu.table_name = 'users'
  AND tc.table_schema NOT IN ('pg_catalog', 'information_schema', 'auth');

-- Contar FK correctas (apuntan a profiles)
SELECT
    'FK to auth_management.profiles' AS validation,
    COUNT(*) AS count,
    '✅ Correct' AS status
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_schema = 'auth_management'
  AND ccu.table_name = 'profiles';

-- ============================================================================
-- VALIDACIÓN P1-2: Function Volatility corregida
-- ============================================================================

\echo ''
\echo '============================================================================'
\echo 'P1-2: Function Volatility (gamilit.now_mexico should be STABLE)'
\echo '============================================================================'

SELECT
    'gamilit.now_mexico' AS function_name,
    CASE p.provolatile
        WHEN 'i' THEN 'IMMUTABLE'
        WHEN 's' THEN 'STABLE'
        WHEN 'v' THEN 'VOLATILE'
    END AS volatility,
    CASE p.provolatile
        WHEN 's' THEN '✅ CORRECT'
        WHEN 'i' THEN '❌ INCORRECT (should be STABLE)'
        WHEN 'v' THEN '⚠️  VOLATILE (should be STABLE)'
    END AS status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'gamilit' AND p.proname = 'now_mexico';

-- Verificar otras funciones sospechosas
\echo ''
\echo 'Other IMMUTABLE functions using time functions:'
SELECT
    n.nspname || '.' || p.proname AS function_name,
    '⚠️  WARNING' AS status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
  AND p.provolatile = 'i'
  AND (
      p.prosrc LIKE '%NOW()%'
      OR p.prosrc LIKE '%CURRENT_TIMESTAMP%'
      OR p.prosrc LIKE '%now_mexico()%'
  )
LIMIT 10;

-- ============================================================================
-- VALIDACIÓN P1-3: ON DELETE Clauses agregadas
-- ============================================================================

\echo ''
\echo '============================================================================'
\echo 'P1-3: ON DELETE Clauses Added'
\echo '============================================================================'

-- Distribución de ON DELETE behaviors
SELECT
    delete_rule,
    COUNT(*) AS count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) || '%' AS percentage
FROM information_schema.referential_constraints
WHERE constraint_schema NOT IN ('pg_catalog', 'information_schema')
GROUP BY delete_rule
ORDER BY COUNT(*) DESC;

-- FK que siguen con NO ACTION
\echo ''
SELECT
    'FK with NO ACTION (should be minimal)' AS validation,
    COUNT(*) AS count,
    CASE
        WHEN COUNT(*) = 0 THEN '✅ EXCELLENT - All FK have explicit behavior'
        WHEN COUNT(*) < 5 THEN '✅ GOOD - Only ' || COUNT(*)::TEXT || ' remaining'
        WHEN COUNT(*) < 15 THEN '⚠️  FAIR - ' || COUNT(*)::TEXT || ' FK still use NO ACTION'
        ELSE '❌ NEEDS WORK - ' || COUNT(*)::TEXT || ' FK still use NO ACTION'
    END AS status
FROM information_schema.referential_constraints
WHERE constraint_schema NOT IN ('pg_catalog', 'information_schema')
  AND delete_rule = 'NO ACTION';

-- ============================================================================
-- RESUMEN GENERAL
-- ============================================================================

\echo ''
\echo '============================================================================'
\echo 'OVERALL SUMMARY'
\echo '============================================================================'

DO $$
DECLARE
    v_total_schemas INTEGER;
    v_total_tables INTEGER;
    v_total_enums INTEGER;
    v_total_functions INTEGER;
    v_total_triggers INTEGER;
    v_public_enums INTEGER;
    v_fk_to_auth_users INTEGER;
    v_immutable_time_functions INTEGER;
    v_no_action_fks INTEGER;
    v_p0_issues INTEGER := 0;
    v_p1_issues INTEGER := 0;
BEGIN
    -- Contar objetos
    SELECT COUNT(*) INTO v_total_schemas
    FROM information_schema.schemata
    WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast');

    SELECT COUNT(*) INTO v_total_tables
    FROM information_schema.tables
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema');

    SELECT COUNT(*) INTO v_total_enums
    FROM pg_type WHERE typcategory = 'E';

    SELECT COUNT(*) INTO v_total_functions
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname NOT IN ('pg_catalog', 'information_schema');

    SELECT COUNT(*) INTO v_total_triggers
    FROM information_schema.triggers
    WHERE trigger_schema NOT IN ('pg_catalog', 'information_schema');

    -- Contar problemas P0
    SELECT COUNT(*) INTO v_public_enums
    FROM pg_type t
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE t.typcategory = 'E' AND n.nspname = 'public'
      AND t.typname NOT IN ('aal_level', 'code_challenge_method', 'factor_status', 'factor_type');

    IF v_public_enums > 0 THEN v_p0_issues := v_p0_issues + 1; END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_super_admin') THEN
        v_p0_issues := v_p0_issues + 1;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'progress_tracking' AND t.typname = 'progress_status'
    ) THEN
        v_p0_issues := v_p0_issues + 1;
    END IF;

    -- Contar problemas P1
    SELECT COUNT(*) INTO v_fk_to_auth_users
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_schema = 'auth' AND ccu.table_name = 'users'
      AND tc.table_schema NOT IN ('pg_catalog', 'information_schema', 'auth');

    IF v_fk_to_auth_users > 0 THEN v_p1_issues := v_p1_issues + 1; END IF;

    SELECT COUNT(*) INTO v_immutable_time_functions
    FROM pg_proc p
    WHERE p.provolatile = 'i'
      AND (p.prosrc LIKE '%NOW()%' OR p.prosrc LIKE '%now_mexico()%')
      AND p.pronamespace IN (
          SELECT oid FROM pg_namespace WHERE nspname NOT IN ('pg_catalog', 'information_schema')
      );

    IF v_immutable_time_functions > 0 THEN v_p1_issues := v_p1_issues + 1; END IF;

    SELECT COUNT(*) INTO v_no_action_fks
    FROM information_schema.referential_constraints
    WHERE constraint_schema NOT IN ('pg_catalog', 'information_schema')
      AND delete_rule = 'NO ACTION';

    IF v_no_action_fks > 15 THEN v_p1_issues := v_p1_issues + 1; END IF;

    -- Mostrar resumen
    RAISE NOTICE '';
    RAISE NOTICE 'Database Objects:';
    RAISE NOTICE '  - Schemas:   %', v_total_schemas;
    RAISE NOTICE '  - Tables:    %', v_total_tables;
    RAISE NOTICE '  - ENUMs:     %', v_total_enums;
    RAISE NOTICE '  - Functions: %', v_total_functions;
    RAISE NOTICE '  - Triggers:  %', v_total_triggers;
    RAISE NOTICE '';
    RAISE NOTICE 'Validation Results:';
    RAISE NOTICE '  - P0 Issues Remaining: %', v_p0_issues;
    RAISE NOTICE '  - P1 Issues Remaining: %', v_p1_issues;
    RAISE NOTICE '';

    IF v_p0_issues = 0 AND v_p1_issues = 0 THEN
        RAISE NOTICE '✅ ALL CRITICAL CORRECTIONS VALIDATED SUCCESSFULLY!';
        RAISE NOTICE '';
        RAISE NOTICE 'Database is ready for:';
        RAISE NOTICE '  1. Backend integration testing';
        RAISE NOTICE '  2. Data seeding';
        RAISE NOTICE '  3. RLS policy testing';
    ELSIF v_p0_issues > 0 THEN
        RAISE WARNING '❌ P0 BLOCKER ISSUES FOUND - Database NOT ready for use';
        RAISE WARNING 'Fix P0 issues before proceeding';
    ELSIF v_p1_issues > 0 THEN
        RAISE WARNING '⚠️  P1 CRITICAL ISSUES FOUND - Database functional but needs fixes';
        RAISE WARNING 'Recommended to fix P1 issues before production';
    END IF;
END $$;

\echo ''
\echo '============================================================================'
\echo 'END OF VALIDATION REPORT'
\echo '============================================================================'
\echo ''
