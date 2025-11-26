-- =====================================================
-- Function: gamilit.initialize_user_missions
-- Description: Inicializa misiones diarias y semanales para un usuario nuevo
-- Parameters: p_user_id UUID (auth_management.profiles.id)
-- Returns: void
-- Created: 2025-11-24
-- Version: 1.0
-- =====================================================
--
-- PROPÓSITO:
-- Crea las misiones iniciales (3 diarias + 5 semanales) para un usuario recién registrado.
-- Esta función es llamada por gamilit.initialize_user_stats() durante el onboarding.
--
-- MISIONES CREADAS:
-- - 3 misiones diarias:
--   * daily_complete_exercises: Completar 3 ejercicios (50 XP, 25 ML Coins)
--   * daily_earn_xp: Ganar 100 XP (30 XP, 15 ML Coins)
--   * daily_use_comodin: Usar un comodín (20 XP, 10 ML Coins)
--
-- - 5 misiones semanales:
--   * weekly_complete_module: Completar un módulo (200 XP, 100 ML Coins)
--   * weekly_daily_streak: Racha de 5 días (150 XP, 75 ML Coins)
--   * weekly_perfect_scores: 3 puntajes perfectos (180 XP, 90 ML Coins)
--   * weekly_explorer: Ejercicios de 3 módulos (120 XP, 60 ML Coins)
--   * weekly_master_learner: 15 ejercicios (250 XP, 125 ML Coins)
--
-- NOTAS TÉCNICAS:
-- - Usa gamilit.now_mexico() para fechas consistentes en zona horaria México
-- - Misiones diarias: válidas hasta las 23:59 del día actual
-- - Misiones semanales: válidas por 7 días desde hoy
-- - ON CONFLICT DO NOTHING: previene duplicados si se llama múltiples veces
-- - missions.user_id referencia auth_management.profiles(id)
-- - objectives se crea como ARRAY JSONB para compatibilidad con triggers de actualización
--
-- REFERENCIA:
-- Basado en: apps/database/seeds/prod/gamification_system/10-missions-init.sql
-- =====================================================

CREATE OR REPLACE FUNCTION gamilit.initialize_user_missions(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_today_start TIMESTAMP;
    v_today_end TIMESTAMP;
    v_week_end TIMESTAMP;
BEGIN
    -- Calculate mission date ranges using Mexico timezone
    v_today_start := gamilit.now_mexico()::date;
    v_today_end := v_today_start + INTERVAL '23 hours 59 minutes';
    v_week_end := v_today_start + INTERVAL '7 days';

    -- =====================================================
    -- DAILY MISSIONS (3)
    -- =====================================================

    -- Daily Mission 1: Complete exercises
    INSERT INTO gamification_system.missions (
        user_id,
        template_id,
        title,
        description,
        mission_type,
        objectives,
        rewards,
        status,
        progress,
        start_date,
        end_date
    ) VALUES (
        p_user_id,
        'daily_complete_exercises',
        'Completar 3 ejercicios',
        'Completa 3 ejercicios hoy para ganar recompensas',
        'daily',
        jsonb_build_array(
            jsonb_build_object(
                'type', 'complete_exercises',
                'target', 3,
                'current', 0
            )
        ),
        jsonb_build_object(
            'xp', 50,
            'ml_coins', 25
        ),
        'active',
        0,
        v_today_start,
        v_today_end
    )
    ON CONFLICT DO NOTHING;

    -- Daily Mission 2: Earn XP
    INSERT INTO gamification_system.missions (
        user_id,
        template_id,
        title,
        description,
        mission_type,
        objectives,
        rewards,
        status,
        progress,
        start_date,
        end_date
    ) VALUES (
        p_user_id,
        'daily_earn_xp',
        'Ganar 100 XP',
        'Acumula 100 puntos de experiencia hoy',
        'daily',
        jsonb_build_array(
            jsonb_build_object(
                'type', 'earn_xp',
                'target', 100,
                'current', 0
            )
        ),
        jsonb_build_object(
            'xp', 30,
            'ml_coins', 15
        ),
        'active',
        0,
        v_today_start,
        v_today_end
    )
    ON CONFLICT DO NOTHING;

    -- Daily Mission 3: Use comodín
    INSERT INTO gamification_system.missions (
        user_id,
        template_id,
        title,
        description,
        mission_type,
        objectives,
        rewards,
        status,
        progress,
        start_date,
        end_date
    ) VALUES (
        p_user_id,
        'daily_use_comodin',
        'Usar un comodín',
        'Usa al menos un comodín en un ejercicio',
        'daily',
        jsonb_build_array(
            jsonb_build_object(
                'type', 'use_comodines',
                'target', 1,
                'current', 0
            )
        ),
        jsonb_build_object(
            'xp', 20,
            'ml_coins', 10
        ),
        'active',
        0,
        v_today_start,
        v_today_end
    )
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- WEEKLY MISSIONS (5)
    -- =====================================================

    -- Weekly Mission 1: Complete a module
    INSERT INTO gamification_system.missions (
        user_id,
        template_id,
        title,
        description,
        mission_type,
        objectives,
        rewards,
        status,
        progress,
        start_date,
        end_date
    ) VALUES (
        p_user_id,
        'weekly_complete_module',
        'Completar un módulo',
        'Completa un módulo completo esta semana',
        'weekly',
        jsonb_build_array(
            jsonb_build_object(
                'type', 'complete_modules',
                'target', 1,
                'current', 0
            )
        ),
        jsonb_build_object(
            'xp', 200,
            'ml_coins', 100
        ),
        'active',
        0,
        v_today_start,
        v_week_end
    )
    ON CONFLICT DO NOTHING;

    -- Weekly Mission 2: Daily streak
    INSERT INTO gamification_system.missions (
        user_id,
        template_id,
        title,
        description,
        mission_type,
        objectives,
        rewards,
        status,
        progress,
        start_date,
        end_date
    ) VALUES (
        p_user_id,
        'weekly_daily_streak',
        'Racha de 5 días',
        'Completa al menos un ejercicio durante 5 días seguidos',
        'weekly',
        jsonb_build_array(
            jsonb_build_object(
                'type', 'daily_streak',
                'target', 5,
                'current', 0
            )
        ),
        jsonb_build_object(
            'xp', 150,
            'ml_coins', 75
        ),
        'active',
        0,
        v_today_start,
        v_week_end
    )
    ON CONFLICT DO NOTHING;

    -- Weekly Mission 3: Perfect scores
    INSERT INTO gamification_system.missions (
        user_id,
        template_id,
        title,
        description,
        mission_type,
        objectives,
        rewards,
        status,
        progress,
        start_date,
        end_date
    ) VALUES (
        p_user_id,
        'weekly_perfect_scores',
        'Perfección absoluta',
        'Obtén 3 puntajes perfectos (100%) en ejercicios',
        'weekly',
        jsonb_build_array(
            jsonb_build_object(
                'type', 'perfect_scores',
                'target', 3,
                'current', 0
            )
        ),
        jsonb_build_object(
            'xp', 180,
            'ml_coins', 90
        ),
        'active',
        0,
        v_today_start,
        v_week_end
    )
    ON CONFLICT DO NOTHING;

    -- Weekly Mission 4: Explorer
    INSERT INTO gamification_system.missions (
        user_id,
        template_id,
        title,
        description,
        mission_type,
        objectives,
        rewards,
        status,
        progress,
        start_date,
        end_date
    ) VALUES (
        p_user_id,
        'weekly_explorer',
        'Explorador curioso',
        'Completa ejercicios de 3 módulos diferentes',
        'weekly',
        jsonb_build_array(
            jsonb_build_object(
                'type', 'explore_modules',
                'target', 3,
                'current', 0,
                'modules_visited', '[]'::jsonb
            )
        ),
        jsonb_build_object(
            'xp', 120,
            'ml_coins', 60
        ),
        'active',
        0,
        v_today_start,
        v_week_end
    )
    ON CONFLICT DO NOTHING;

    -- Weekly Mission 5: Master learner
    INSERT INTO gamification_system.missions (
        user_id,
        template_id,
        title,
        description,
        mission_type,
        objectives,
        rewards,
        status,
        progress,
        start_date,
        end_date
    ) VALUES (
        p_user_id,
        'weekly_master_learner',
        'Maestro del aprendizaje',
        'Completa 15 ejercicios esta semana',
        'weekly',
        jsonb_build_array(
            jsonb_build_object(
                'type', 'complete_exercises',
                'target', 15,
                'current', 0
            )
        ),
        jsonb_build_object(
            'xp', 250,
            'ml_coins', 125
        ),
        'active',
        0,
        v_today_start,
        v_week_end
    )
    ON CONFLICT DO NOTHING;

END;
$$;

-- =====================================================
-- Function metadata
-- =====================================================

COMMENT ON FUNCTION gamilit.initialize_user_missions(UUID) IS
    'Inicializa misiones diarias (3) y semanales (5) para un usuario nuevo. Llamada automáticamente durante el registro de usuarios con rol student, admin_teacher o super_admin.';
