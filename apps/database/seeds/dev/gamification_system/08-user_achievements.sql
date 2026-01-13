-- =====================================================
-- Seed: User Achievements (Testing Data)
-- =====================================================
-- Description: Achievements para usuario de testing student@gamilit.com
-- Environment: development
-- Dependencies:
--   - auth.users (01-demo-users.sql)
--   - auth_management.profiles (04-profiles-complete.sql)
--   - gamification_system.achievements (04-achievements.sql)
-- Execution Order: 8
-- Created: 2025-01-11
-- Updated: 2026-01-13 (v2.1.0 - Lookup dinamico de profile.id)
-- Version: 2.1.0
-- =====================================================
--
-- CAMBIOS v2.1.0 (2026-01-13):
-- - Usar lookup dinamico de profile.id por email (mas robusto)
-- - No depende de que profile.id = user.id
-- - Corregido error de sintaxis en RAISE NOTICE
--
-- CAMBIOS v2.0.0 (2026-01-13):
-- - Eliminados usuarios demo inexistentes (Ana Garcia, Carlos Ramirez, etc.)
-- - Mantenido solo student@gamilit.com
-- - Alineado con politica de "carga limpia" de 01-demo-users.sql v2.0
--
-- USUARIO DE TESTING:
-- - student@gamilit.com
-- - 4 achievements: 3 completados + 1 en progreso
--
-- =====================================================

SET search_path TO gamification_system, public;

-- =====================================================
-- ESTUDIANTE DE TESTING: student@gamilit.com
-- =====================================================
-- Lookup dinamico: Obtiene profile.id desde auth_management.profiles
-- donde email = 'student@gamilit.com'
-- =====================================================

DO $$
DECLARE
    v_profile_id UUID;
    v_tenant_id UUID;
BEGIN
    -- Obtener profile_id del usuario de testing
    SELECT p.id, p.tenant_id INTO v_profile_id, v_tenant_id
    FROM auth_management.profiles p
    WHERE p.email = 'student@gamilit.com'
    LIMIT 1;

    IF v_profile_id IS NULL THEN
        RAISE WARNING '⚠ Usuario student@gamilit.com no encontrado en profiles.';
        RAISE WARNING '  Ejecutar primero:';
        RAISE WARNING '  - 01-demo-users.sql';
        RAISE WARNING '  - 04-profiles-complete.sql';
        RETURN;
    END IF;

    RAISE NOTICE 'Profile encontrado: % (tenant: %)', v_profile_id, v_tenant_id;

    -- =========================================================
    -- Achievement 1: Primera Visita (completado)
    -- =========================================================
    INSERT INTO gamification_system.user_achievements (
        id, user_id, achievement_id, progress, max_progress,
        is_completed, completion_percentage, completed_at,
        notified, viewed, rewards_claimed, rewards_received,
        progress_data, milestones_reached, metadata,
        started_at, created_at
    ) VALUES (
        gen_random_uuid(),
        v_profile_id,
        '90000007-0000-0000-0000-000000000001'::uuid,
        1, 1, true, 100.00,
        gamilit.now_mexico() - INTERVAL '5 days',
        true, true, true,
        jsonb_build_object('xp', 50, 'ml_coins', 25, 'badge_url', '/badges/achievements/primera-visita.png'),
        jsonb_build_object('first_login', true),
        ARRAY['first_login'],
        jsonb_build_object('demo_achievement', true, 'category', 'special'),
        gamilit.now_mexico() - INTERVAL '5 days',
        gamilit.now_mexico() - INTERVAL '5 days'
    ) ON CONFLICT (user_id, achievement_id) DO UPDATE SET
        is_completed = EXCLUDED.is_completed,
        completion_percentage = EXCLUDED.completion_percentage;

    -- =========================================================
    -- Achievement 2: Primeros Pasos (completado)
    -- =========================================================
    INSERT INTO gamification_system.user_achievements (
        id, user_id, achievement_id, progress, max_progress,
        is_completed, completion_percentage, completed_at,
        notified, viewed, rewards_claimed, rewards_received,
        progress_data, milestones_reached, metadata,
        started_at, created_at
    ) VALUES (
        gen_random_uuid(),
        v_profile_id,
        '90000001-0000-0000-0000-000000000001'::uuid,
        1, 1, true, 100.00,
        gamilit.now_mexico() - INTERVAL '4 days',
        true, true, true,
        jsonb_build_object('xp', 100, 'ml_coins', 50, 'badge_url', '/badges/achievements/primeros-pasos.png'),
        jsonb_build_object('exercises_completed', 1),
        ARRAY['first_exercise'],
        jsonb_build_object('demo_achievement', true, 'category', 'progress'),
        gamilit.now_mexico() - INTERVAL '4 days',
        gamilit.now_mexico() - INTERVAL '4 days'
    ) ON CONFLICT (user_id, achievement_id) DO UPDATE SET
        is_completed = EXCLUDED.is_completed,
        completion_percentage = EXCLUDED.completion_percentage;

    -- =========================================================
    -- Achievement 3: Racha de 3 Dias (completado, rewards pendientes)
    -- =========================================================
    INSERT INTO gamification_system.user_achievements (
        id, user_id, achievement_id, progress, max_progress,
        is_completed, completion_percentage, completed_at,
        notified, viewed, rewards_claimed, rewards_received,
        progress_data, milestones_reached, metadata,
        started_at, created_at
    ) VALUES (
        gen_random_uuid(),
        v_profile_id,
        '90000002-0000-0000-0000-000000000001'::uuid,
        3, 3, true, 100.00,
        gamilit.now_mexico() - INTERVAL '2 days',
        true, true, false,  -- rewards_claimed = false
        jsonb_build_object('xp', 150, 'ml_coins', 50, 'badge_url', '/badges/achievements/racha-3-dias.png'),
        jsonb_build_object('streak_days', 3),
        ARRAY['day_1', 'day_2', 'day_3'],
        jsonb_build_object('demo_achievement', true, 'category', 'streak'),
        gamilit.now_mexico() - INTERVAL '4 days',
        gamilit.now_mexico() - INTERVAL '2 days'
    ) ON CONFLICT (user_id, achievement_id) DO UPDATE SET
        is_completed = EXCLUDED.is_completed,
        completion_percentage = EXCLUDED.completion_percentage,
        rewards_claimed = EXCLUDED.rewards_claimed;

    -- =========================================================
    -- Achievement 4: Lector Principiante (en progreso 60%)
    -- =========================================================
    INSERT INTO gamification_system.user_achievements (
        id, user_id, achievement_id, progress, max_progress,
        is_completed, completion_percentage, completed_at,
        notified, viewed, rewards_claimed, rewards_received,
        progress_data, milestones_reached, metadata,
        started_at, created_at
    ) VALUES (
        gen_random_uuid(),
        v_profile_id,
        '90000001-0000-0000-0000-000000000002'::uuid,
        6, 10, false, 60.00,
        NULL,  -- completed_at = NULL
        false, false, false,
        '{}'::jsonb,
        jsonb_build_object('exercises_completed', 6, 'target', 10),
        ARRAY['milestone_5'],
        jsonb_build_object('demo_achievement', true, 'category', 'progress', 'status', 'in_progress'),
        gamilit.now_mexico() - INTERVAL '5 days',
        gamilit.now_mexico() - INTERVAL '3 days'
    ) ON CONFLICT (user_id, achievement_id) DO UPDATE SET
        progress = EXCLUDED.progress,
        is_completed = EXCLUDED.is_completed,
        completion_percentage = EXCLUDED.completion_percentage;

    RAISE NOTICE '✓ 4 achievements insertados para student@gamilit.com';
END $$;

-- =====================================================
-- VERIFICACION DE USER ACHIEVEMENTS
-- =====================================================

DO $$
DECLARE
    v_profile_id UUID;
    v_achievement_count INTEGER;
    v_completed_count INTEGER;
    v_in_progress_count INTEGER;
BEGIN
    -- Obtener profile_id
    SELECT p.id INTO v_profile_id
    FROM auth_management.profiles p
    WHERE p.email = 'student@gamilit.com'
    LIMIT 1;

    IF v_profile_id IS NULL THEN
        RAISE WARNING '⚠ Usuario de testing no encontrado.';
        RETURN;
    END IF;

    -- Contar user achievements insertados
    SELECT COUNT(*) INTO v_achievement_count
    FROM gamification_system.user_achievements
    WHERE user_id = v_profile_id;

    -- Contar completados
    SELECT COUNT(*) INTO v_completed_count
    FROM gamification_system.user_achievements
    WHERE user_id = v_profile_id AND is_completed = true;

    -- Contar en progreso
    SELECT COUNT(*) INTO v_in_progress_count
    FROM gamification_system.user_achievements
    WHERE user_id = v_profile_id AND is_completed = false;

    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'User Achievements - Verificacion de Seeds';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Usuario: student@gamilit.com';
    RAISE NOTICE 'Profile ID: %', v_profile_id;
    RAISE NOTICE '-----------------------------------------------------';
    RAISE NOTICE 'Total achievements asignados: %', v_achievement_count;
    RAISE NOTICE '  - Completados: %', v_completed_count;
    RAISE NOTICE '  - En progreso: %', v_in_progress_count;
    RAISE NOTICE '=====================================================';

    IF v_achievement_count = 4 THEN
        RAISE NOTICE '✓ Seeds de user achievements insertados correctamente';
    ELSIF v_achievement_count = 0 THEN
        RAISE WARNING '⚠ No se insertaron user achievements';
    ELSE
        RAISE WARNING '⚠ Se esperaban 4 achievements, se insertaron %', v_achievement_count;
    END IF;
END $$;

-- =====================================================
-- DETALLE DE ACHIEVEMENTS INSERTADOS
-- =====================================================

DO $$
DECLARE
    v_profile_id UUID;
    v_record RECORD;
BEGIN
    SELECT p.id INTO v_profile_id
    FROM auth_management.profiles p
    WHERE p.email = 'student@gamilit.com'
    LIMIT 1;

    IF v_profile_id IS NULL THEN
        RETURN;
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE 'Detalle de achievements para student@gamilit.com:';
    RAISE NOTICE '-----------------------------------------------------';

    FOR v_record IN (
        SELECT
            a.name as achievement_name,
            ua.completion_percentage,
            ua.is_completed,
            ua.rewards_claimed
        FROM gamification_system.user_achievements ua
        JOIN gamification_system.achievements a ON a.id = ua.achievement_id
        WHERE ua.user_id = v_profile_id
        ORDER BY ua.created_at
    ) LOOP
        RAISE NOTICE '  - %: % pct | Completado: % | Rewards: %',
            v_record.achievement_name,
            v_record.completion_percentage,
            CASE WHEN v_record.is_completed THEN 'Si' ELSE 'No' END,
            CASE WHEN v_record.rewards_claimed THEN 'Reclamado' ELSE 'Pendiente' END;
    END LOOP;

    RAISE NOTICE '=====================================================';
END $$;

-- =====================================================
-- FIN DEL SEED
-- =====================================================
-- Para probar en el frontend:
-- 1. Iniciar sesion como student@gamilit.com / Test1234
-- 2. Navegar a /achievements
-- 3. Verificar que se muestran 3 completados y 1 en progreso
-- =====================================================
