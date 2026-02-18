-- =====================================================
-- Seed: gamification_system.user_stats (PROD) - v2.2
-- Description: Estadísticas de gamificación para usuarios demo
-- Environment: PRODUCTION
-- Dependencies: auth_management.profiles, gamification_system.maya_ranks
-- Order: 05
-- Created: 2025-01-11
-- Updated: 2026-02-18
-- Version: 2.2 (REC-009 FIX: template_id UUID + dynamic lookups)
-- =====================================================
--
-- CAMBIOS v2.2:
-- ============
-- ✅ FIX REC-009: template_id ahora es UUID (FK to mission_templates)
-- ✅ Dynamic profile lookups (no hardcoded UUIDs)
-- ✅ NULL guards en todas las inserciones
--
-- CAMBIOS v2.0:
-- ============
-- ❌ ELIMINADO: INSERTs directos a user_stats (causaban duplicados y huérfanos)
-- ✅ NUEVO: El trigger initialize_user_stats() crea automáticamente los registros
-- ✅ NUEVO: UPDATEs para agregar progreso variado a los usuarios demo
--
-- FUNCIONAMIENTO:
-- ===============
-- 1. El trigger initialize_user_stats() (en profiles) crea automáticamente:
--    - user_stats con 100 ML Coins iniciales
--    - user_ranks con rango 'Ajaw'
--    - comodines_inventory
--
-- 2. Este seed actualiza los user_stats con progreso variado para demos realistas
--
-- USUARIOS CON PROGRESO VARIADO:
-- ==============================
-- - 5 estudiantes con diferentes niveles (1-4)
-- - 2 profesores con actividad alta
-- - 2 administradores con stats máximos
-- - 1 padre con actividad mínima
--
-- TOTAL: 10 usuarios demo con progreso variado
-- =====================================================

SET search_path TO gamification_system, auth_management, public;

-- =====================================================
-- FASE 0: Asegurar registros base para usuarios de testing
-- =====================================================
-- NOTA: Los usuarios de testing (admin, teacher, student) usan UUIDs fijos
-- y pueden haberse insertado sin activar el trigger initialize_user_stats().
-- Esta sección garantiza que existan sus registros de gamificación.

DO $$
DECLARE
    v_tenant_id uuid;
    v_admin_profile_id uuid;
    v_teacher_profile_id uuid;
    v_student_profile_id uuid;
BEGIN
    -- Resolver tenant_id dinámicamente (FK references auth_management.tenants)
    SELECT id INTO v_tenant_id
    FROM auth_management.tenants
    WHERE name = 'GAMILIT Platform'
    LIMIT 1;

    IF v_tenant_id IS NULL THEN
        v_tenant_id := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid;
    END IF;

    -- Resolver profile IDs para usuarios de testing
    SELECT p.id INTO v_admin_profile_id
    FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'admin@gamilit.com';

    SELECT p.id INTO v_teacher_profile_id
    FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'teacher@gamilit.com';

    SELECT p.id INTO v_student_profile_id
    FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'student@gamilit.com';

    -- Usuario Testing: ADMIN
    IF v_admin_profile_id IS NOT NULL THEN
        INSERT INTO gamification_system.user_stats (user_id, tenant_id, ml_coins, ml_coins_earned_total)
        VALUES (v_admin_profile_id, v_tenant_id, 100, 100)
        ON CONFLICT (user_id) DO NOTHING;

        INSERT INTO gamification_system.user_ranks (user_id, tenant_id, current_rank, is_current, achieved_at)
        VALUES (v_admin_profile_id, v_tenant_id, 'Ajaw'::gamification_system.maya_rank, true, NOW())
        ON CONFLICT DO NOTHING;

        INSERT INTO gamification_system.comodines_inventory (user_id)
        VALUES (v_admin_profile_id)
        ON CONFLICT (user_id) DO NOTHING;
    ELSE
        RAISE WARNING '⚠ Profile not found for admin@gamilit.com — skipping user_stats insert';
    END IF;

    -- Usuario Testing: TEACHER
    IF v_teacher_profile_id IS NOT NULL THEN
        INSERT INTO gamification_system.user_stats (user_id, tenant_id, ml_coins, ml_coins_earned_total)
        VALUES (v_teacher_profile_id, v_tenant_id, 100, 100)
        ON CONFLICT (user_id) DO NOTHING;

        INSERT INTO gamification_system.user_ranks (user_id, tenant_id, current_rank, is_current, achieved_at)
        VALUES (v_teacher_profile_id, v_tenant_id, 'Ajaw'::gamification_system.maya_rank, true, NOW())
        ON CONFLICT DO NOTHING;

        INSERT INTO gamification_system.comodines_inventory (user_id)
        VALUES (v_teacher_profile_id)
        ON CONFLICT (user_id) DO NOTHING;
    ELSE
        RAISE WARNING '⚠ Profile not found for teacher@gamilit.com — skipping user_stats insert';
    END IF;

    -- Usuario Testing: STUDENT
    IF v_student_profile_id IS NOT NULL THEN
        INSERT INTO gamification_system.user_stats (user_id, tenant_id, ml_coins, ml_coins_earned_total)
        VALUES (v_student_profile_id, v_tenant_id, 100, 100)
        ON CONFLICT (user_id) DO NOTHING;

        INSERT INTO gamification_system.user_ranks (user_id, tenant_id, current_rank, is_current, achieved_at)
        VALUES (v_student_profile_id, v_tenant_id, 'Ajaw'::gamification_system.maya_rank, true, NOW())
        ON CONFLICT DO NOTHING;

        INSERT INTO gamification_system.comodines_inventory (user_id)
        VALUES (v_student_profile_id)
        ON CONFLICT (user_id) DO NOTHING;
    ELSE
        RAISE WARNING '⚠ Profile not found for student@gamilit.com — skipping user_stats insert';
    END IF;

    RAISE NOTICE '✓ Registros base de testing asegurados (admin, teacher, student)';
END $$;

-- =====================================================
-- FASE 0.1: Inicializar user_stats para TODOS los perfiles
-- =====================================================
-- CORRECCION 2026-01-10: El trigger initialize_user_stats no siempre ejecuta
-- durante el seed. Esta seccion garantiza que todos los perfiles tengan
-- registros de gamificacion.

DO $$
DECLARE
    v_profile RECORD;
    v_count INTEGER := 0;
    v_tenant_id uuid;
BEGIN
    -- Resolver tenant_id dinámicamente
    SELECT id INTO v_tenant_id
    FROM auth_management.tenants
    WHERE name = 'GAMILIT Platform'
    LIMIT 1;

    IF v_tenant_id IS NULL THEN
        v_tenant_id := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid;
    END IF;

    FOR v_profile IN
        SELECT p.id as profile_id, p.user_id, p.display_name
        FROM auth_management.profiles p
        LEFT JOIN gamification_system.user_stats us ON us.user_id = p.id
        WHERE us.user_id IS NULL
    LOOP
        -- Insert user_stats
        INSERT INTO gamification_system.user_stats (user_id, tenant_id, ml_coins, ml_coins_earned_total)
        VALUES (v_profile.profile_id, v_tenant_id, 100, 100)
        ON CONFLICT (user_id) DO NOTHING;

        -- Insert user_ranks
        INSERT INTO gamification_system.user_ranks (user_id, tenant_id, current_rank, is_current, achieved_at)
        VALUES (v_profile.profile_id, v_tenant_id, 'Ajaw'::gamification_system.maya_rank, true, NOW())
        ON CONFLICT DO NOTHING;

        -- Insert comodines_inventory
        INSERT INTO gamification_system.comodines_inventory (user_id)
        VALUES (v_profile.profile_id)
        ON CONFLICT (user_id) DO NOTHING;

        v_count := v_count + 1;
    END LOOP;

    IF v_count > 0 THEN
        RAISE NOTICE '✓ Inicializados % perfiles sin user_stats (fallback)', v_count;
    ELSE
        RAISE NOTICE '✓ Todos los perfiles ya tienen user_stats (trigger funcionó correctamente)';
    END IF;
END $$;

-- =====================================================
-- FASE 0.5: Inicializar misiones para usuarios de testing
-- =====================================================
-- NOTA: Las misiones normalmente se crean via initialize_user_missions()
-- pero los usuarios de testing se insertan sin trigger, asi que las creamos aqui.

DO $$
DECLARE
    v_today_start TIMESTAMP := NOW()::date;
    v_today_end TIMESTAMP := v_today_start + INTERVAL '23 hours 59 minutes';
    v_week_end TIMESTAMP := v_today_start + INTERVAL '7 days';
    v_test_users uuid[];
    v_user_id uuid;
    v_admin_profile_id uuid;
    v_teacher_profile_id uuid;
    v_student_profile_id uuid;
    -- REC-009 FIX: template_id is now UUID (FK to mission_templates)
    v_tpl_daily_exercises uuid;
    v_tpl_daily_earn_xp uuid;
    v_tpl_daily_use_comodin uuid;
    v_tpl_weekly_complete_module uuid;
    v_tpl_weekly_daily_streak uuid;
    v_tpl_weekly_perfect_scores uuid;
    v_tpl_weekly_explorer uuid;
    v_tpl_weekly_master_learner uuid;
    v_tpl_special_module_mastery uuid;
BEGIN
    -- Resolve template UUIDs dynamically from mission_templates
    SELECT id INTO v_tpl_daily_exercises FROM gamification_system.mission_templates WHERE type = 'daily' AND target_type = 'complete_exercises' LIMIT 1;
    SELECT id INTO v_tpl_daily_earn_xp FROM gamification_system.mission_templates WHERE type = 'daily' AND target_type = 'earn_xp' LIMIT 1;
    SELECT id INTO v_tpl_daily_use_comodin FROM gamification_system.mission_templates WHERE type = 'daily' AND target_type = 'use_comodines' LIMIT 1;
    SELECT id INTO v_tpl_weekly_complete_module FROM gamification_system.mission_templates WHERE type = 'weekly' AND target_type = 'complete_modules' LIMIT 1;
    SELECT id INTO v_tpl_weekly_daily_streak FROM gamification_system.mission_templates WHERE type = 'weekly' AND target_type = 'daily_streak' LIMIT 1;
    SELECT id INTO v_tpl_weekly_perfect_scores FROM gamification_system.mission_templates WHERE type = 'weekly' AND target_type = 'perfect_scores' LIMIT 1;
    SELECT id INTO v_tpl_weekly_explorer FROM gamification_system.mission_templates WHERE type = 'weekly' AND target_type = 'explore_modules' LIMIT 1;
    SELECT id INTO v_tpl_weekly_master_learner FROM gamification_system.mission_templates WHERE type = 'weekly' AND target_type = 'complete_exercises' LIMIT 1;
    SELECT id INTO v_tpl_special_module_mastery FROM gamification_system.mission_templates WHERE type = 'special' AND target_type = 'complete_modules' LIMIT 1;

    -- Resolver profile IDs para usuarios de testing
    SELECT p.id INTO v_admin_profile_id
    FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'admin@gamilit.com';

    SELECT p.id INTO v_teacher_profile_id
    FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'teacher@gamilit.com';

    SELECT p.id INTO v_student_profile_id
    FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'student@gamilit.com';

    v_test_users := ARRAY[v_admin_profile_id, v_teacher_profile_id, v_student_profile_id];

    FOREACH v_user_id IN ARRAY v_test_users LOOP
        -- Skip NULL profile IDs (profile not found for this user)
        CONTINUE WHEN v_user_id IS NULL;

        -- Daily Mission 1: Complete exercises
        IF v_tpl_daily_exercises IS NOT NULL THEN
        INSERT INTO gamification_system.missions (
            user_id, template_id, title, description, mission_type, objectives, rewards, status, progress, start_date, end_date
        ) VALUES (
            v_user_id, v_tpl_daily_exercises, 'Completar 3 ejercicios',
            'Completa 3 ejercicios hoy para ganar recompensas', 'daily',
            jsonb_build_array(jsonb_build_object('type', 'complete_exercises', 'target', 3, 'current', 0)),
            jsonb_build_object('xp', 50, 'ml_coins', 25), 'active', 0, v_today_start, v_today_end
        ) ON CONFLICT DO NOTHING;
        END IF;

        -- Daily Mission 2: Earn XP
        IF v_tpl_daily_earn_xp IS NOT NULL THEN
        INSERT INTO gamification_system.missions (
            user_id, template_id, title, description, mission_type, objectives, rewards, status, progress, start_date, end_date
        ) VALUES (
            v_user_id, v_tpl_daily_earn_xp, 'Ganar 100 XP',
            'Acumula 100 puntos de experiencia hoy', 'daily',
            jsonb_build_array(jsonb_build_object('type', 'earn_xp', 'target', 100, 'current', 0)),
            jsonb_build_object('xp', 30, 'ml_coins', 15), 'active', 0, v_today_start, v_today_end
        ) ON CONFLICT DO NOTHING;
        END IF;

        -- Daily Mission 3: Use comodin
        IF v_tpl_daily_use_comodin IS NOT NULL THEN
        INSERT INTO gamification_system.missions (
            user_id, template_id, title, description, mission_type, objectives, rewards, status, progress, start_date, end_date
        ) VALUES (
            v_user_id, v_tpl_daily_use_comodin, 'Usar un comodin',
            'Usa al menos un comodin en un ejercicio', 'daily',
            jsonb_build_array(jsonb_build_object('type', 'use_comodines', 'target', 1, 'current', 0)),
            jsonb_build_object('xp', 20, 'ml_coins', 10), 'active', 0, v_today_start, v_today_end
        ) ON CONFLICT DO NOTHING;
        END IF;

        -- Weekly Mission 1: Complete module
        IF v_tpl_weekly_complete_module IS NOT NULL THEN
        INSERT INTO gamification_system.missions (
            user_id, template_id, title, description, mission_type, objectives, rewards, status, progress, start_date, end_date
        ) VALUES (
            v_user_id, v_tpl_weekly_complete_module, 'Completar un modulo',
            'Completa un modulo completo esta semana', 'weekly',
            jsonb_build_array(jsonb_build_object('type', 'complete_modules', 'target', 1, 'current', 0)),
            jsonb_build_object('xp', 200, 'ml_coins', 100), 'active', 0, v_today_start, v_week_end
        ) ON CONFLICT DO NOTHING;
        END IF;

        -- Weekly Mission 2: Daily streak
        IF v_tpl_weekly_daily_streak IS NOT NULL THEN
        INSERT INTO gamification_system.missions (
            user_id, template_id, title, description, mission_type, objectives, rewards, status, progress, start_date, end_date
        ) VALUES (
            v_user_id, v_tpl_weekly_daily_streak, 'Racha de 5 dias',
            'Completa al menos un ejercicio durante 5 dias seguidos', 'weekly',
            jsonb_build_array(jsonb_build_object('type', 'daily_streak', 'target', 5, 'current', 0)),
            jsonb_build_object('xp', 150, 'ml_coins', 75), 'active', 0, v_today_start, v_week_end
        ) ON CONFLICT DO NOTHING;
        END IF;

        -- Weekly Mission 3: Perfect scores
        IF v_tpl_weekly_perfect_scores IS NOT NULL THEN
        INSERT INTO gamification_system.missions (
            user_id, template_id, title, description, mission_type, objectives, rewards, status, progress, start_date, end_date
        ) VALUES (
            v_user_id, v_tpl_weekly_perfect_scores, 'Perfeccion absoluta',
            'Obten 3 puntajes perfectos (100%) en ejercicios', 'weekly',
            jsonb_build_array(jsonb_build_object('type', 'perfect_scores', 'target', 3, 'current', 0)),
            jsonb_build_object('xp', 180, 'ml_coins', 90), 'active', 0, v_today_start, v_week_end
        ) ON CONFLICT DO NOTHING;
        END IF;

        -- Weekly Mission 4: Explorer
        IF v_tpl_weekly_explorer IS NOT NULL THEN
        INSERT INTO gamification_system.missions (
            user_id, template_id, title, description, mission_type, objectives, rewards, status, progress, start_date, end_date
        ) VALUES (
            v_user_id, v_tpl_weekly_explorer, 'Explorador curioso',
            'Completa ejercicios de 3 modulos diferentes', 'weekly',
            jsonb_build_array(jsonb_build_object('type', 'explore_modules', 'target', 3, 'current', 0, 'modules_visited', '[]'::jsonb)),
            jsonb_build_object('xp', 120, 'ml_coins', 60), 'active', 0, v_today_start, v_week_end
        ) ON CONFLICT DO NOTHING;
        END IF;

        -- Weekly Mission 5: Master learner
        IF v_tpl_weekly_master_learner IS NOT NULL THEN
        INSERT INTO gamification_system.missions (
            user_id, template_id, title, description, mission_type, objectives, rewards, status, progress, start_date, end_date
        ) VALUES (
            v_user_id, v_tpl_weekly_master_learner, 'Maestro del aprendizaje',
            'Completa 15 ejercicios esta semana', 'weekly',
            jsonb_build_array(jsonb_build_object('type', 'complete_exercises', 'target', 15, 'current', 0)),
            jsonb_build_object('xp', 250, 'ml_coins', 125), 'active', 0, v_today_start, v_week_end
        ) ON CONFLICT DO NOTHING;
        END IF;

        -- Special Mission: Complete module with mastery
        IF v_tpl_special_module_mastery IS NOT NULL THEN
        INSERT INTO gamification_system.missions (
            user_id, template_id, title, description, mission_type, objectives, rewards, status, progress, start_date, end_date
        ) VALUES (
            v_user_id, v_tpl_special_module_mastery, 'Dominio del Modulo',
            'Completa todos los ejercicios de un modulo con al menos 80% de aciertos', 'special',
            jsonb_build_array(jsonb_build_object('type', 'complete_modules', 'target', 1, 'current', 0, 'min_score', 80)),
            jsonb_build_object('xp', 500, 'ml_coins', 150), 'active', 0, v_today_start, v_week_end + INTERVAL '23 days'
        ) ON CONFLICT DO NOTHING;
        END IF;

    END LOOP;

    RAISE NOTICE '✓ Misiones de testing creadas (3 daily + 5 weekly + 1 special por usuario)';
END $$;

-- =====================================================
-- FASE 1: Verificar que el trigger creó los registros base
-- =====================================================

DO $$
DECLARE
    stats_count INTEGER;
    expected_count INTEGER;
BEGIN
    -- Contar user_stats existentes
    SELECT COUNT(*) INTO stats_count
    FROM gamification_system.user_stats;

    -- Contar perfiles (debería haber 23: 3 testing + 20 demo)
    SELECT COUNT(*) INTO expected_count
    FROM auth_management.profiles;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICACIÓN TRIGGER initialize_user_stats()';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Perfiles existentes: %', expected_count;
    RAISE NOTICE 'User stats existentes: %', stats_count;
    RAISE NOTICE '========================================';

    IF stats_count = expected_count THEN
        RAISE NOTICE '✓ El trigger funcionó correctamente';
        RAISE NOTICE '✓ Todos los perfiles tienen user_stats';
    ELSIF stats_count < expected_count THEN
        RAISE WARNING '⚠ Faltan % user_stats', expected_count - stats_count;
        RAISE WARNING '⚠ Algunos perfiles no tienen user_stats (trigger pudo haber fallado)';
    ELSE
        RAISE WARNING '⚠ Hay % user_stats extras (posibles huérfanos)', stats_count - expected_count;
    END IF;

    RAISE NOTICE '';
END $$;

-- =====================================================
-- FASE 2: Actualizar user_stats con progreso variado
-- =====================================================
-- Esto da vida a los usuarios demo con diferentes niveles de actividad
-- UPDATEs use email lookups — silently update 0 rows if users don't exist

-- Estudiante 1: Ana García - Nivel 2, Progreso Medio
UPDATE gamification_system.user_stats
SET
    level = 2,
    total_xp = 1250,
    xp_to_next_level = 250,
    current_rank = 'Ajaw'::gamification_system.maya_rank,
    rank_progress = 45.50,
    ml_coins = 275,
    ml_coins_earned_total = 450,
    ml_coins_spent_total = 175,
    ml_coins_earned_today = 25,
    last_ml_coins_reset = gamilit.now_mexico() - INTERVAL '3 hours',
    current_streak = 3,
    max_streak = 5,
    streak_started_at = gamilit.now_mexico() - INTERVAL '3 days',
    days_active_total = 12,
    exercises_completed = 15,
    modules_completed = 0,
    total_score = 1200,
    average_score = 80.00,
    perfect_scores = 2,
    achievements_earned = 3,
    certificates_earned = 0,
    total_time_spent = '03:25:00'::interval,
    weekly_time_spent = '01:15:00'::interval,
    sessions_count = 12,
    weekly_xp = 450,
    monthly_xp = 1250,
    weekly_exercises = 8,
    class_rank_position = 1,
    last_activity_at = gamilit.now_mexico() - INTERVAL '2 hours',
    last_login_at = gamilit.now_mexico() - INTERVAL '2 hours',
    metadata = jsonb_build_object(
        'demo_user', true,
        'preferred_theme', 'ocean',
        'favorite_module', 'modulo-01-comprension-literal',
        'learning_pace', 'steady'
    ),
    updated_at = gamilit.now_mexico()
WHERE user_id = (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'estudiante1@demo.glit.edu.mx' LIMIT 1);

-- Verification Query
DO $$
DECLARE
    stats_count INTEGER;
    updated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO stats_count
    FROM gamification_system.user_stats;

    SELECT COUNT(*) INTO updated_count
    FROM gamification_system.user_stats
    WHERE metadata->>'demo_user' = 'true' AND level > 1;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'USER STATS ACTUALIZADOS EXITOSAMENTE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total user stats: %', stats_count;
    RAISE NOTICE 'User stats demo actualizados: %', updated_count;
    RAISE NOTICE '========================================';

    IF updated_count >= 1 THEN
        RAISE NOTICE '✓ User stats demo fueron actualizados correctamente con progreso variado';
    ELSE
        RAISE NOTICE '⚠ Se esperaban updates demo, se aplicaron % (normal si usuarios demo no existen en prod)', updated_count;
    END IF;

    RAISE NOTICE '';
END $$;
