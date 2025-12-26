-- =====================================================
-- Script: validate-user-initialization.sql
-- Description: Valida que TODOS los usuarios estén completamente inicializados
-- Version: 1.0
-- Created: 2025-11-24
-- Database-Agent Task: Análisis y corrección de inicialización de usuarios
-- =====================================================
--
-- OBJETIVO:
-- Validar que todos los usuarios (testing + demo + producción) tengan:
-- 1. auth.users (registro inicial)
-- 2. auth_management.profiles (con profiles.id = auth.users.id)
-- 3. gamification_system.user_stats (ML Coins inicializados)
-- 4. gamification_system.comodines_inventory (user_id → profiles.id)
-- 5. gamification_system.user_ranks (rango inicial Ajaw)
-- 6. progress_tracking.module_progress (todos los módulos publicados)
--
-- USUARIOS ESPERADOS:
-- - Testing PROD (@gamilit.com): 3 usuarios
-- - Demo PROD (@demo.glit.edu.mx): 20 usuarios (opcional según ambiente)
-- - Producción (emails reales): 13 usuarios
-- - TOTAL PROD: 16 usuarios (3 testing + 13 producción)
-- - TOTAL FULL: 36 usuarios (3 testing + 20 demo + 13 producción)
-- =====================================================

\set ON_ERROR_STOP off

SET search_path TO auth, auth_management, gamification_system, progress_tracking, public;

-- =====================================================
-- SECCIÓN 1: Validación de auth.users
-- =====================================================

\echo '========================================'
\echo 'VALIDACIÓN 1: auth.users'
\echo '========================================'

SELECT
    '1.1. Total usuarios en auth.users' AS validacion,
    COUNT(*) AS cantidad,
    CASE
        WHEN COUNT(*) >= 16 THEN '✅ OK (mínimo 16 esperados)'
        ELSE '❌ ERROR: Menos de 16 usuarios'
    END AS resultado
FROM auth.users;

SELECT
    '1.2. Usuarios @gamilit.com (testing)' AS validacion,
    COUNT(*) AS cantidad,
    CASE
        WHEN COUNT(*) = 3 THEN '✅ OK (3 esperados)'
        ELSE '❌ ERROR: Se esperaban 3 usuarios @gamilit.com'
    END AS resultado
FROM auth.users
WHERE email LIKE '%@gamilit.com';

SELECT
    '1.3. Usuarios productivos (no @gamilit.com)' AS validacion,
    COUNT(*) AS cantidad,
    CASE
        WHEN COUNT(*) = 13 THEN '✅ OK (13 esperados)'
        ELSE '⚠️  WARNING: Se esperaban 13 usuarios productivos'
    END AS resultado
FROM auth.users
WHERE email NOT LIKE '%@gamilit.com'
  AND email NOT LIKE '%@demo.glit.edu.mx';

SELECT
    '1.4. Usuarios DEMO (@demo.glit.edu.mx)' AS validacion,
    COUNT(*) AS cantidad,
    '⏭️  OPCIONAL (ambiente)' AS resultado
FROM auth.users
WHERE email LIKE '%@demo.glit.edu.mx';

-- =====================================================
-- SECCIÓN 2: Validación de auth_management.profiles
-- =====================================================

\echo ''
\echo '========================================'
\echo 'VALIDACIÓN 2: auth_management.profiles'
\echo '========================================'

SELECT
    '2.1. Total profiles' AS validacion,
    COUNT(*) AS cantidad,
    CASE
        WHEN COUNT(*) >= 16 THEN '✅ OK (mínimo 16 esperados)'
        ELSE '❌ ERROR: Menos de 16 profiles'
    END AS resultado
FROM auth_management.profiles;

SELECT
    '2.2. Profiles con id = user_id (CRÍTICO)' AS validacion,
    COUNT(*) AS cantidad,
    CASE
        WHEN COUNT(*) = (SELECT COUNT(*) FROM auth_management.profiles)
        THEN '✅ OK (100% consistente)'
        ELSE '❌ ERROR: Hay profiles con id ≠ user_id'
    END AS resultado
FROM auth_management.profiles
WHERE id = user_id;

SELECT
    '2.3. Usuarios SIN profile (CRÍTICO)' AS validacion,
    COUNT(*) AS cantidad,
    CASE
        WHEN COUNT(*) = 0 THEN '✅ OK (todos tienen profile)'
        ELSE '❌ ERROR: Hay usuarios sin profile'
    END AS resultado
FROM auth.users u
LEFT JOIN auth_management.profiles p ON u.id = p.user_id
WHERE p.id IS NULL;

-- Mostrar usuarios sin profile (si existen)
DO $$
DECLARE
    usuarios_sin_profile INTEGER;
BEGIN
    SELECT COUNT(*) INTO usuarios_sin_profile
    FROM auth.users u
    LEFT JOIN auth_management.profiles p ON u.id = p.user_id
    WHERE p.id IS NULL;

    IF usuarios_sin_profile > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '❌ USUARIOS SIN PROFILE DETECTADOS:';
        FOR rec IN
            SELECT u.id, u.email
            FROM auth.users u
            LEFT JOIN auth_management.profiles p ON u.id = p.user_id
            WHERE p.id IS NULL
        LOOP
            RAISE NOTICE '  - % (%)', rec.email, rec.id;
        END LOOP;
    END IF;
END $$;

-- =====================================================
-- SECCIÓN 3: Validación de gamification_system.user_stats
-- =====================================================

\echo ''
\echo '========================================'
\echo 'VALIDACIÓN 3: gamification_system.user_stats'
\echo '========================================'

SELECT
    '3.1. Total user_stats' AS validacion,
    COUNT(*) AS cantidad,
    CASE
        WHEN COUNT(*) >= 16 THEN '✅ OK (mínimo 16 esperados)'
        ELSE '❌ ERROR: Menos de 16 user_stats'
    END AS resultado
FROM gamification_system.user_stats;

SELECT
    '3.2. Usuarios CON profile pero SIN user_stats (CRÍTICO)' AS validacion,
    COUNT(*) AS cantidad,
    CASE
        WHEN COUNT(*) = 0 THEN '✅ OK (todos tienen user_stats)'
        ELSE '❌ ERROR: Hay profiles sin user_stats'
    END AS resultado
FROM auth_management.profiles p
LEFT JOIN gamification_system.user_stats us ON p.user_id = us.user_id
WHERE us.user_id IS NULL
  AND p.role IN ('student', 'admin_teacher', 'super_admin');

SELECT
    '3.3. user_stats con ML Coins = 100 (inicial)' AS validacion,
    COUNT(*) AS cantidad,
    '⏭️  INFO (bonus inicial)' AS resultado
FROM gamification_system.user_stats
WHERE ml_coins = 100 AND ml_coins_earned_total = 100;

-- Mostrar profiles sin user_stats (si existen)
DO $$
DECLARE
    profiles_sin_stats INTEGER;
BEGIN
    SELECT COUNT(*) INTO profiles_sin_stats
    FROM auth_management.profiles p
    LEFT JOIN gamification_system.user_stats us ON p.user_id = us.user_id
    WHERE us.user_id IS NULL
      AND p.role IN ('student', 'admin_teacher', 'super_admin');

    IF profiles_sin_stats > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '❌ PROFILES SIN USER_STATS DETECTADOS:';
        FOR rec IN
            SELECT p.id, p.email, p.role
            FROM auth_management.profiles p
            LEFT JOIN gamification_system.user_stats us ON p.user_id = us.user_id
            WHERE us.user_id IS NULL
              AND p.role IN ('student', 'admin_teacher', 'super_admin')
        LOOP
            RAISE NOTICE '  - % (%, %)', rec.email, rec.role, rec.id;
        END LOOP;
    END IF;
END $$;

-- =====================================================
-- SECCIÓN 4: Validación de gamification_system.comodines_inventory
-- =====================================================

\echo ''
\echo '========================================'
\echo 'VALIDACIÓN 4: gamification_system.comodines_inventory'
\echo '========================================'

SELECT
    '4.1. Total comodines_inventory' AS validacion,
    COUNT(*) AS cantidad,
    CASE
        WHEN COUNT(*) >= 16 THEN '✅ OK (mínimo 16 esperados)'
        ELSE '❌ ERROR: Menos de 16 inventarios'
    END AS resultado
FROM gamification_system.comodines_inventory;

SELECT
    '4.2. Profiles SIN comodines_inventory (CRÍTICO)' AS validacion,
    COUNT(*) AS cantidad,
    CASE
        WHEN COUNT(*) = 0 THEN '✅ OK (todos tienen inventario)'
        ELSE '❌ ERROR: Hay profiles sin inventario'
    END AS resultado
FROM auth_management.profiles p
LEFT JOIN gamification_system.comodines_inventory ci ON p.id = ci.user_id
WHERE ci.user_id IS NULL
  AND p.role IN ('student', 'admin_teacher', 'super_admin');

-- IMPORTANTE: comodines_inventory.user_id apunta a profiles.id (NO auth.users.id)
SELECT
    '4.3. comodines_inventory con user_id válido' AS validacion,
    COUNT(*) AS cantidad,
    CASE
        WHEN COUNT(*) = (SELECT COUNT(*) FROM gamification_system.comodines_inventory)
        THEN '✅ OK (100% válidos)'
        ELSE '❌ ERROR: Hay inventarios con user_id inválido'
    END AS resultado
FROM gamification_system.comodines_inventory ci
INNER JOIN auth_management.profiles p ON ci.user_id = p.id;

-- Mostrar profiles sin comodines_inventory (si existen)
DO $$
DECLARE
    profiles_sin_inventory INTEGER;
BEGIN
    SELECT COUNT(*) INTO profiles_sin_inventory
    FROM auth_management.profiles p
    LEFT JOIN gamification_system.comodines_inventory ci ON p.id = ci.user_id
    WHERE ci.user_id IS NULL
      AND p.role IN ('student', 'admin_teacher', 'super_admin');

    IF profiles_sin_inventory > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '❌ PROFILES SIN COMODINES_INVENTORY DETECTADOS:';
        FOR rec IN
            SELECT p.id, p.email, p.role
            FROM auth_management.profiles p
            LEFT JOIN gamification_system.comodines_inventory ci ON p.id = ci.user_id
            WHERE ci.user_id IS NULL
              AND p.role IN ('student', 'admin_teacher', 'super_admin')
        LOOP
            RAISE NOTICE '  - % (%, %)', rec.email, rec.role, rec.id;
        END LOOP;
    END IF;
END $$;

-- =====================================================
-- SECCIÓN 5: Validación de gamification_system.user_ranks
-- =====================================================

\echo ''
\echo '========================================'
\echo 'VALIDACIÓN 5: gamification_system.user_ranks'
\echo '========================================'

SELECT
    '5.1. Total user_ranks' AS validacion,
    COUNT(*) AS cantidad,
    CASE
        WHEN COUNT(*) >= 16 THEN '✅ OK (mínimo 16 esperados)'
        ELSE '❌ ERROR: Menos de 16 user_ranks'
    END AS resultado
FROM gamification_system.user_ranks;

SELECT
    '5.2. Usuarios CON profile pero SIN user_ranks (CRÍTICO)' AS validacion,
    COUNT(*) AS cantidad,
    CASE
        WHEN COUNT(*) = 0 THEN '✅ OK (todos tienen rank)'
        ELSE '❌ ERROR: Hay profiles sin rank'
    END AS resultado
FROM auth_management.profiles p
LEFT JOIN gamification_system.user_ranks ur ON p.user_id = ur.user_id
WHERE ur.user_id IS NULL
  AND p.role IN ('student', 'admin_teacher', 'super_admin');

SELECT
    '5.3. user_ranks con rango Ajaw (inicial)' AS validacion,
    COUNT(*) AS cantidad,
    '⏭️  INFO (rango inicial)' AS resultado
FROM gamification_system.user_ranks
WHERE current_rank = 'Ajaw'::gamification_system.maya_rank;

-- Mostrar profiles sin user_ranks (si existen)
DO $$
DECLARE
    profiles_sin_ranks INTEGER;
BEGIN
    SELECT COUNT(*) INTO profiles_sin_ranks
    FROM auth_management.profiles p
    LEFT JOIN gamification_system.user_ranks ur ON p.user_id = ur.user_id
    WHERE ur.user_id IS NULL
      AND p.role IN ('student', 'admin_teacher', 'super_admin');

    IF profiles_sin_ranks > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '❌ PROFILES SIN USER_RANKS DETECTADOS:';
        FOR rec IN
            SELECT p.id, p.email, p.role
            FROM auth_management.profiles p
            LEFT JOIN gamification_system.user_ranks ur ON p.user_id = ur.user_id
            WHERE ur.user_id IS NULL
              AND p.role IN ('student', 'admin_teacher', 'super_admin')
        LOOP
            RAISE NOTICE '  - % (%, %)', rec.email, rec.role, rec.id;
        END LOOP;
    END IF;
END $$;

-- =====================================================
-- SECCIÓN 6: Validación de progress_tracking.module_progress
-- =====================================================

\echo ''
\echo '========================================'
\echo 'VALIDACIÓN 6: progress_tracking.module_progress'
\echo '========================================'

SELECT
    '6.1. Total module_progress registros' AS validacion,
    COUNT(*) AS cantidad,
    '⏭️  INFO (depende de módulos publicados)' AS resultado
FROM progress_tracking.module_progress;

SELECT
    '6.2. Estudiantes CON module_progress' AS validacion,
    COUNT(DISTINCT mp.user_id) AS cantidad,
    CASE
        WHEN COUNT(DISTINCT mp.user_id) >= 16 THEN '✅ OK (mínimo 16 esperados)'
        ELSE '⚠️  WARNING: Menos de 16 estudiantes con progreso'
    END AS resultado
FROM progress_tracking.module_progress mp
INNER JOIN auth_management.profiles p ON mp.user_id = p.id
WHERE p.role IN ('student', 'admin_teacher', 'super_admin');

SELECT
    '6.3. Módulos publicados disponibles' AS validacion,
    COUNT(*) AS cantidad,
    '⏭️  INFO' AS resultado
FROM educational_content.modules
WHERE is_published = true AND status = 'published';

-- Mostrar estudiantes sin module_progress (si existen)
DO $$
DECLARE
    profiles_sin_progress INTEGER;
BEGIN
    SELECT COUNT(*) INTO profiles_sin_progress
    FROM auth_management.profiles p
    LEFT JOIN progress_tracking.module_progress mp ON p.id = mp.user_id
    WHERE mp.user_id IS NULL
      AND p.role IN ('student', 'admin_teacher', 'super_admin');

    IF profiles_sin_progress > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  PROFILES SIN MODULE_PROGRESS DETECTADOS:';
        FOR rec IN
            SELECT p.id, p.email, p.role
            FROM auth_management.profiles p
            LEFT JOIN progress_tracking.module_progress mp ON p.id = mp.user_id
            WHERE mp.user_id IS NULL
              AND p.role IN ('student', 'admin_teacher', 'super_admin')
        LOOP
            RAISE NOTICE '  - % (%, %)', rec.email, rec.role, rec.id;
        END LOOP;
    END IF;
END $$;

-- =====================================================
-- SECCIÓN 7: Resumen Final
-- =====================================================

\echo ''
\echo '========================================'
\echo 'RESUMEN FINAL'
\echo '========================================'

DO $$
DECLARE
    total_users INTEGER;
    total_profiles INTEGER;
    total_stats INTEGER;
    total_inventory INTEGER;
    total_ranks INTEGER;
    total_progress_users INTEGER;
    usuarios_sin_profile INTEGER;
    profiles_sin_stats INTEGER;
    profiles_sin_inventory INTEGER;
    profiles_sin_ranks INTEGER;
    profiles_sin_progress INTEGER;
    errores_criticos INTEGER := 0;
BEGIN
    -- Contar totales
    SELECT COUNT(*) INTO total_users FROM auth.users;
    SELECT COUNT(*) INTO total_profiles FROM auth_management.profiles;
    SELECT COUNT(*) INTO total_stats FROM gamification_system.user_stats;
    SELECT COUNT(*) INTO total_inventory FROM gamification_system.comodines_inventory;
    SELECT COUNT(*) INTO total_ranks FROM gamification_system.user_ranks;
    SELECT COUNT(DISTINCT mp.user_id) INTO total_progress_users
    FROM progress_tracking.module_progress mp;

    -- Contar problemas
    SELECT COUNT(*) INTO usuarios_sin_profile
    FROM auth.users u
    LEFT JOIN auth_management.profiles p ON u.id = p.user_id
    WHERE p.id IS NULL;

    SELECT COUNT(*) INTO profiles_sin_stats
    FROM auth_management.profiles p
    LEFT JOIN gamification_system.user_stats us ON p.user_id = us.user_id
    WHERE us.user_id IS NULL AND p.role IN ('student', 'admin_teacher', 'super_admin');

    SELECT COUNT(*) INTO profiles_sin_inventory
    FROM auth_management.profiles p
    LEFT JOIN gamification_system.comodines_inventory ci ON p.id = ci.user_id
    WHERE ci.user_id IS NULL AND p.role IN ('student', 'admin_teacher', 'super_admin');

    SELECT COUNT(*) INTO profiles_sin_ranks
    FROM auth_management.profiles p
    LEFT JOIN gamification_system.user_ranks ur ON p.user_id = ur.user_id
    WHERE ur.user_id IS NULL AND p.role IN ('student', 'admin_teacher', 'super_admin');

    SELECT COUNT(*) INTO profiles_sin_progress
    FROM auth_management.profiles p
    LEFT JOIN progress_tracking.module_progress mp ON p.id = mp.user_id
    WHERE mp.user_id IS NULL AND p.role IN ('student', 'admin_teacher', 'super_admin');

    -- Calcular errores críticos
    errores_criticos := usuarios_sin_profile + profiles_sin_stats +
                       profiles_sin_inventory + profiles_sin_ranks;

    -- Mostrar resumen
    RAISE NOTICE '';
    RAISE NOTICE 'TOTALES:';
    RAISE NOTICE '  - auth.users:                    %', total_users;
    RAISE NOTICE '  - auth_management.profiles:      %', total_profiles;
    RAISE NOTICE '  - gamification_system.user_stats: %', total_stats;
    RAISE NOTICE '  - gamification_system.comodines_inventory: %', total_inventory;
    RAISE NOTICE '  - gamification_system.user_ranks: %', total_ranks;
    RAISE NOTICE '  - progress_tracking.module_progress (usuarios únicos): %', total_progress_users;
    RAISE NOTICE '';
    RAISE NOTICE 'PROBLEMAS DETECTADOS:';
    RAISE NOTICE '  - Usuarios sin profile:          %', usuarios_sin_profile;
    RAISE NOTICE '  - Profiles sin user_stats:       %', profiles_sin_stats;
    RAISE NOTICE '  - Profiles sin comodines_inventory: %', profiles_sin_inventory;
    RAISE NOTICE '  - Profiles sin user_ranks:       %', profiles_sin_ranks;
    RAISE NOTICE '  - Profiles sin module_progress:  % (WARNING)', profiles_sin_progress;
    RAISE NOTICE '';

    IF errores_criticos = 0 THEN
        RAISE NOTICE '========================================';
        RAISE NOTICE '✅ VALIDACIÓN EXITOSA';
        RAISE NOTICE '========================================';
        RAISE NOTICE 'Todos los usuarios están completamente inicializados.';
        IF profiles_sin_progress > 0 THEN
            RAISE NOTICE '⚠️  WARNING: Hay % usuarios sin module_progress', profiles_sin_progress;
            RAISE NOTICE '   (Esto puede ser esperado si no hay módulos publicados)';
        END IF;
    ELSE
        RAISE NOTICE '========================================';
        RAISE NOTICE '❌ VALIDACIÓN FALLIDA';
        RAISE NOTICE '========================================';
        RAISE NOTICE 'Se detectaron % errores críticos.', errores_criticos;
        RAISE NOTICE 'Revisa las secciones anteriores para más detalles.';
    END IF;

    RAISE NOTICE '';
END $$;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

\echo ''
\echo 'Validación completa. Revisa los resultados arriba.'
\echo ''
