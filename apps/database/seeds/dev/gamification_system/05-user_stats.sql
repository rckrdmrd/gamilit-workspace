-- =====================================================
-- Seed: gamification_system.user_stats (PROD) - v2.0
-- Description: Estadísticas de gamificación para usuarios demo
-- Environment: PRODUCTION
-- Dependencies: auth_management.profiles, gamification_system.maya_ranks
-- Order: 05
-- Created: 2025-01-11
-- Updated: 2025-11-15
-- Version: 2.0 (Refactored - Trigger-based creation)
-- =====================================================
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
-- - 3 estudiantes con diferentes niveles (1-3)
-- - 1 profesor con actividad alta
-- - 1 administrador con stats máximos
--
-- TOTAL: 5 usuarios demo con progreso variado
-- NOTA: estudiante4/5, profesor2, directora, padre1 removidos (ghost emails)
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

-- Estudiante 2: Carlos Ramírez - Nivel 1, Principiante
UPDATE gamification_system.user_stats
SET
    level = 1,
    total_xp = 250,
    xp_to_next_level = 750,
    current_rank = 'Ajaw'::gamification_system.maya_rank,
    rank_progress = 12.50,
    ml_coins = 150,
    ml_coins_earned_total = 200,
    ml_coins_spent_total = 50,
    ml_coins_earned_today = 10,
    last_ml_coins_reset = gamilit.now_mexico() - INTERVAL '5 hours',
    current_streak = 1,
    max_streak = 2,
    streak_started_at = gamilit.now_mexico() - INTERVAL '1 day',
    days_active_total = 5,
    exercises_completed = 5,
    modules_completed = 0,
    total_score = 350,
    average_score = 70.00,
    perfect_scores = 0,
    achievements_earned = 1,
    certificates_earned = 0,
    total_time_spent = '01:10:00'::interval,
    weekly_time_spent = '00:45:00'::interval,
    sessions_count = 5,
    weekly_xp = 150,
    monthly_xp = 250,
    weekly_exercises = 3,
    class_rank_position = 2,
    last_activity_at = gamilit.now_mexico() - INTERVAL '4 hours',
    last_login_at = gamilit.now_mexico() - INTERVAL '4 hours',
    metadata = jsonb_build_object(
        'demo_user', true,
        'preferred_theme', 'space',
        'learning_pace', 'slow'
    ),
    updated_at = gamilit.now_mexico()
WHERE user_id = (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'estudiante2@demo.glit.edu.mx' LIMIT 1);

-- Estudiante 3: María Fernanda - Nivel 3, Avanzada
UPDATE gamification_system.user_stats
SET
    level = 3,
    total_xp = 3200,
    xp_to_next_level = 800,
    current_rank = 'Nacom'::gamification_system.maya_rank,
    rank_progress = 60.00,
    ml_coins = 425,
    ml_coins_earned_total = 800,
    ml_coins_spent_total = 375,
    ml_coins_earned_today = 50,
    last_ml_coins_reset = gamilit.now_mexico() - INTERVAL '2 hours',
    current_streak = 7,
    max_streak = 7,
    streak_started_at = gamilit.now_mexico() - INTERVAL '7 days',
    days_active_total = 20,
    exercises_completed = 35,
    modules_completed = 1,
    total_score = 2800,
    average_score = 85.00,
    perfect_scores = 5,
    achievements_earned = 6,
    certificates_earned = 1,
    total_time_spent = '06:30:00'::interval,
    weekly_time_spent = '02:00:00'::interval,
    sessions_count = 20,
    weekly_xp = 900,
    monthly_xp = 3200,
    weekly_exercises = 15,
    class_rank_position = 1,
    last_activity_at = gamilit.now_mexico() - INTERVAL '1 hour',
    last_login_at = gamilit.now_mexico() - INTERVAL '1 hour',
    metadata = jsonb_build_object(
        'demo_user', true,
        'preferred_theme', 'forest',
        'favorite_module', 'modulo-02-comprension-inferencial',
        'learning_pace', 'fast',
        'achievement_hunter', true
    ),
    updated_at = gamilit.now_mexico()
WHERE user_id = (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'estudiante3@demo.glit.edu.mx' LIMIT 1);

-- NOTA: estudiante4@demo.glit.edu.mx y estudiante5@demo.glit.edu.mx removidos
-- (ghost emails: no existen en ningun seed de auth)

-- Profesor 1: Roberto Méndez - Nivel 5, Profesor Activo
UPDATE gamification_system.user_stats
SET
    level = 5,
    total_xp = 10000,
    xp_to_next_level = 2000,
    current_rank = 'Ah K''in'::gamification_system.maya_rank,
    rank_progress = 33.33,
    ml_coins = 1000,
    ml_coins_earned_total = 2000,
    ml_coins_spent_total = 1000,
    ml_coins_earned_today = 0,
    last_ml_coins_reset = gamilit.now_mexico() - INTERVAL '8 hours',
    current_streak = 15,
    max_streak = 20,
    streak_started_at = gamilit.now_mexico() - INTERVAL '15 days',
    days_active_total = 60,
    exercises_completed = 100,
    modules_completed = 5,
    total_score = 9000,
    average_score = 92.00,
    perfect_scores = 25,
    achievements_earned = 12,
    certificates_earned = 5,
    total_time_spent = '25:00:00'::interval,
    weekly_time_spent = '05:00:00'::interval,
    sessions_count = 60,
    weekly_xp = 2500,
    monthly_xp = 10000,
    weekly_exercises = 30,
    last_activity_at = gamilit.now_mexico() - INTERVAL '1 hour',
    last_login_at = gamilit.now_mexico() - INTERVAL '1 hour',
    metadata = jsonb_build_object(
        'demo_user', true,
        'role', 'teacher',
        'teacher_stats', jsonb_build_object(
            'students_count', 10,
            'classrooms_count', 2,
            'avg_student_score', 85.00
        )
    ),
    updated_at = gamilit.now_mexico()
WHERE user_id = (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'instructor@demo.glit.edu.mx' LIMIT 1);

-- NOTA: profesor2@demo.glit.edu.mx removido (ghost email: no existe en ningun seed de auth)

-- Admin 1: Admin Sistema - Nivel 10, Super Admin
UPDATE gamification_system.user_stats
SET
    level = 10,
    total_xp = 50000,
    xp_to_next_level = 0,
    current_rank = 'K''uk''ulkan'::gamification_system.maya_rank,
    rank_progress = 100.00,
    ml_coins = 5000,
    ml_coins_earned_total = 10000,
    ml_coins_spent_total = 5000,
    ml_coins_earned_today = 0,
    last_ml_coins_reset = gamilit.now_mexico() - INTERVAL '12 hours',
    current_streak = 30,
    max_streak = 30,
    streak_started_at = gamilit.now_mexico() - INTERVAL '30 days',
    days_active_total = 100,
    exercises_completed = 250,
    modules_completed = 5,
    total_score = 24000,
    average_score = 96.00,
    perfect_scores = 50,
    achievements_earned = 20,
    certificates_earned = 5,
    total_time_spent = '50:00:00'::interval,
    weekly_time_spent = '08:00:00'::interval,
    sessions_count = 100,
    weekly_xp = 5000,
    monthly_xp = 50000,
    weekly_exercises = 50,
    last_activity_at = gamilit.now_mexico() - INTERVAL '30 minutes',
    last_login_at = gamilit.now_mexico() - INTERVAL '30 minutes',
    metadata = jsonb_build_object(
        'demo_user', true,
        'role', 'super_admin',
        'admin_access', 'full'
    ),
    updated_at = gamilit.now_mexico()
WHERE user_id = (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'admin@gamilit.com' LIMIT 1);

-- NOTA: directora@demo.glit.edu.mx y padre1@demo.glit.edu.mx removidos
-- (ghost emails: no existen en ningun seed de auth)

-- =====================================================
-- FASE 3: DESHABILITADA - Usuarios de Testing con valores iniciales
-- =====================================================
-- CORRECCION: 2026-01-07
-- PROBLEMA: Los usuarios de testing (@gamilit.com) iniciaban con
--           experiencia elevada en lugar de valores iniciales.
-- SOLUCION: Los usuarios de testing ahora usan los valores creados
--           por el trigger initialize_user_stats():
--           - level = 1
--           - total_xp = 0
--           - ml_coins = 100 (bono de bienvenida)
--           - current_rank = 'Ajaw' (rango inicial)
--
-- Si necesitas usuarios DEMO con progreso elevado, usa los usuarios
-- demo definidos en FASE 2 (UUIDs: 01ac4f00..., 02bc5f00..., etc.)
--
-- Usuarios de Testing (valores iniciales automaticos):
-- - admin@gamilit.com   (aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa)
-- - teacher@gamilit.com (bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb)
-- - student@gamilit.com (cccccccc-cccc-cccc-cccc-cccccccccccc)
-- =====================================================

-- NOTA: Los siguientes UPDATEs estan comentados intencionalmente.
-- Los usuarios de testing deben empezar con valores iniciales
-- como cualquier usuario nuevo que se registra en la plataforma.

/*
-- [DESHABILITADO] Testing Admin: Super Admin - Nivel 10
UPDATE gamification_system.user_stats
SET level = 10, total_xp = 50000, ml_coins = 5000, ...
WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid;

-- [DESHABILITADO] Testing Teacher: Profesor - Nivel 5
UPDATE gamification_system.user_stats
SET level = 5, total_xp = 10000, ml_coins = 1000, ...
WHERE user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid;

-- [DESHABILITADO] Testing Student: Estudiante - Nivel 3
UPDATE gamification_system.user_stats
SET level = 3, total_xp = 3200, ml_coins = 425, ...
WHERE user_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid;
*/

-- =====================================================
-- Verification Query
-- =====================================================

DO $$
DECLARE
    stats_count INTEGER;
    updated_count INTEGER;
    students_count INTEGER;
    teachers_count INTEGER;
    admins_count INTEGER;
    avg_level NUMERIC;
    total_ml_coins INTEGER;
BEGIN
    SELECT COUNT(*) INTO stats_count
    FROM gamification_system.user_stats;

    SELECT COUNT(*) INTO updated_count
    FROM gamification_system.user_stats
    WHERE metadata->>'demo_user' = 'true' AND level > 1;

    SELECT COUNT(*) INTO students_count
    FROM gamification_system.user_stats us
    JOIN auth_management.profiles p ON p.user_id = us.user_id
    WHERE us.metadata->>'demo_user' = 'true' AND p.role = 'student';

    SELECT COUNT(*) INTO teachers_count
    FROM gamification_system.user_stats us
    JOIN auth_management.profiles p ON p.user_id = us.user_id
    WHERE us.metadata->>'demo_user' = 'true' AND p.role = 'admin_teacher';

    SELECT COUNT(*) INTO admins_count
    FROM gamification_system.user_stats us
    JOIN auth_management.profiles p ON p.user_id = us.user_id
    WHERE us.metadata->>'demo_user' = 'true' AND p.role = 'super_admin';

    SELECT AVG(level)::NUMERIC(5,2) INTO avg_level
    FROM gamification_system.user_stats
    WHERE metadata->>'demo_user' = 'true';

    SELECT SUM(ml_coins) INTO total_ml_coins
    FROM gamification_system.user_stats
    WHERE metadata->>'demo_user' = 'true';

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'USER STATS ACTUALIZADOS EXITOSAMENTE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total user stats: %', stats_count;
    RAISE NOTICE 'User stats demo actualizados: %', updated_count;
    RAISE NOTICE '  - Estudiantes: %', students_count;
    RAISE NOTICE '  - Profesores: %', teachers_count;
    RAISE NOTICE '  - Administradores: %', admins_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Estadísticas Agregadas:';
    RAISE NOTICE '  - Nivel promedio: %', avg_level;
    RAISE NOTICE '  - ML Coins totales: %', total_ml_coins;
    RAISE NOTICE '========================================';

    IF updated_count >= 5 THEN
        RAISE NOTICE '✓ User stats demo fueron actualizados correctamente con progreso variado';
    ELSE
        RAISE NOTICE '⚠ Se esperaban al menos 5 updates, se aplicaron % (normal si algunos usuarios demo no existen)', updated_count;
    END IF;

    RAISE NOTICE '';
END $$;

-- =====================================================
-- Testing Info
-- =====================================================
-- Los user_stats ahora tienen progreso variado realista.
--
-- Para verificar:
-- SELECT display_name, level, total_xp, ml_coins, exercises_completed
-- FROM auth_management.profiles p
-- JOIN gamification_system.user_stats us ON us.user_id = p.user_id
-- WHERE us.metadata->>'demo_user' = 'true'
-- ORDER BY level DESC, total_xp DESC;
-- =====================================================
