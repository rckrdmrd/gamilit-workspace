-- =====================================================
-- Seed: gamification_system.missions (PROD - Production Users)
-- Description: Inicialización de misiones para usuarios de producción sin misiones
-- Environment: PRODUCTION
-- Dependencies: auth.users, auth_management.profiles, gamification_system.missions
-- Order: 11
-- Created: 2025-11-24
-- Version: 1.0
-- =====================================================
--
-- PROPÓSITO:
-- - Crear misiones para usuarios de producción (backup) que NO tienen misiones
-- - No afectar a usuarios de test (@gamilit.com) que ya tienen misiones via seed 10
-- - Script idempotente: puede ejecutarse múltiples veces sin crear duplicados
--
-- MISIONES INCLUIDAS (8 por usuario):
-- - 3 misiones diarias:
--   * daily_complete_exercises: Completar 3 ejercicios (50 XP, 25 ML Coins)
--   * daily_earn_xp: Ganar 100 XP (30 XP, 15 ML Coins)
--   * daily_use_comodin: Usar un comodín (20 XP, 10 ML Coins)
-- - 5 misiones semanales:
--   * weekly_complete_module: Completar un módulo (200 XP, 100 ML Coins)
--   * weekly_daily_streak: Racha de 5 días (150 XP, 75 ML Coins)
--   * weekly_perfect_scores: 3 puntajes perfectos (180 XP, 90 ML Coins)
--   * weekly_explorer: Explorar 3 módulos (120 XP, 60 ML Coins)
--   * weekly_master_learner: Completar 15 ejercicios (250 XP, 125 ML Coins)
--
-- CRITERIOS IDEMPOTENCIA:
-- - Solo procesa usuarios que NO tienen ninguna misión
-- - Usa ON CONFLICT DO NOTHING para evitar duplicados
-- - Verifica existencia de tabla gamification_system.missions
-- =====================================================

SET search_path TO gamification_system, auth_management, public;

-- =====================================================
-- Insert missions for production users without missions
-- =====================================================

DO $$
DECLARE
    v_user_record RECORD;
    v_users_without_missions INTEGER := 0;
    v_users_processed INTEGER := 0;
    v_missions_created INTEGER := 0;
    v_today_start TIMESTAMP;
    v_today_end TIMESTAMP;
    v_week_end TIMESTAMP;
BEGIN
    -- Log inicio del proceso
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'INICIALIZANDO MISIONES PARA USUARIOS DE PRODUCCIÓN';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';

    -- Verificar que la tabla de misiones existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'gamification_system'
        AND table_name = 'missions'
    ) THEN
        RAISE WARNING '⚠️  Tabla gamification_system.missions no existe';
        RETURN;
    END IF;

    -- Contar usuarios sin misiones (excluir usuarios de test @gamilit.com)
    SELECT COUNT(DISTINCT p.id) INTO v_users_without_missions
    FROM auth_management.profiles p
    WHERE NOT EXISTS (
        SELECT 1
        FROM gamification_system.missions m
        WHERE m.user_id = p.id
    )
    AND p.email NOT LIKE '%@gamilit.com';

    RAISE NOTICE '📊 Usuarios sin misiones encontrados: %', v_users_without_missions;
    RAISE NOTICE '';

    -- Si no hay usuarios sin misiones, terminar
    IF v_users_without_missions = 0 THEN
        RAISE NOTICE '✅ Todos los usuarios de producción ya tienen misiones';
        RAISE NOTICE '   (usuarios de test @gamilit.com se excluyen automáticamente)';
        RETURN;
    END IF;

    -- Calcular rangos de fechas para misiones
    v_today_start := gamilit.now_mexico()::date;
    v_today_end := v_today_start + INTERVAL '23 hours 59 minutes';
    v_week_end := v_today_start + INTERVAL '7 days';

    -- Procesar cada usuario sin misiones
    FOR v_user_record IN
        SELECT
            p.id,
            p.email,
            p.display_name,
            p.role
        FROM auth_management.profiles p
        WHERE NOT EXISTS (
            SELECT 1
            FROM gamification_system.missions m
            WHERE m.user_id = p.id
        )
        AND p.email NOT LIKE '%@gamilit.com'
        ORDER BY p.created_at
    LOOP
        v_users_processed := v_users_processed + 1;

        RAISE NOTICE '🔄 Procesando usuario %/%: % (%)',
            v_users_processed,
            v_users_without_missions,
            COALESCE(v_user_record.display_name, v_user_record.email),
            v_user_record.role;

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
            v_user_record.id,
            'daily_complete_exercises',
            'Completar 3 ejercicios',
            'Completa 3 ejercicios hoy para ganar recompensas',
            'daily',
            jsonb_build_object(
                'type', 'complete_exercises',
                'target', 3,
                'current', 0
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
            v_user_record.id,
            'daily_earn_xp',
            'Ganar 100 XP',
            'Acumula 100 puntos de experiencia hoy',
            'daily',
            jsonb_build_object(
                'type', 'earn_xp',
                'target', 100,
                'current', 0
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
            v_user_record.id,
            'daily_use_comodin',
            'Usar un comodín',
            'Usa al menos un comodín en un ejercicio',
            'daily',
            jsonb_build_object(
                'type', 'use_comodines',
                'target', 1,
                'current', 0
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
            v_user_record.id,
            'weekly_complete_module',
            'Completar un módulo',
            'Completa un módulo completo esta semana',
            'weekly',
            jsonb_build_object(
                'type', 'complete_modules',
                'target', 1,
                'current', 0
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
            v_user_record.id,
            'weekly_daily_streak',
            'Racha de 5 días',
            'Completa al menos un ejercicio durante 5 días seguidos',
            'weekly',
            jsonb_build_object(
                'type', 'daily_streak',
                'target', 5,
                'current', 0
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
            v_user_record.id,
            'weekly_perfect_scores',
            'Perfección absoluta',
            'Obtén 3 puntajes perfectos (100%) en ejercicios',
            'weekly',
            jsonb_build_object(
                'type', 'perfect_scores',
                'target', 3,
                'current', 0
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
            v_user_record.id,
            'weekly_explorer',
            'Explorador curioso',
            'Completa ejercicios de 3 módulos diferentes',
            'weekly',
            jsonb_build_object(
                'type', 'explore_modules',
                'target', 3,
                'current', 0,
                'modules_visited', '[]'::jsonb
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
            v_user_record.id,
            'weekly_master_learner',
            'Maestro del aprendizaje',
            'Completa 15 ejercicios esta semana',
            'weekly',
            jsonb_build_object(
                'type', 'complete_exercises',
                'target', 15,
                'current', 0
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

        RAISE NOTICE '   ✅ 8 misiones creadas (3 diarias + 5 semanales)';

    END LOOP;

    -- Contar misiones totales creadas en este script
    SELECT COUNT(*) INTO v_missions_created
    FROM gamification_system.missions m
    WHERE m.created_at > (gamilit.now_mexico() - INTERVAL '1 minute');

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PROCESO COMPLETADO';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Usuarios procesados:    %', v_users_processed;
    RAISE NOTICE 'Misiones creadas:       %', v_missions_created;
    RAISE NOTICE 'Promedio por usuario:   %',
        CASE
            WHEN v_users_processed > 0 THEN ROUND(v_missions_created::numeric / v_users_processed::numeric, 1)
            ELSE 0
        END;
    RAISE NOTICE '========================================';
    RAISE NOTICE '';

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING '❌ Error inicializando misiones: %', SQLERRM;
        RAISE WARNING 'SQLSTATE: %', SQLSTATE;
        RAISE WARNING 'DETAIL: %', SQLERRM;
END $$;

-- =====================================================
-- Verification - Estado final de misiones
-- =====================================================

DO $$
DECLARE
    v_total_users INTEGER;
    v_users_with_missions INTEGER;
    v_users_without_missions INTEGER;
    v_total_daily INTEGER;
    v_total_weekly INTEGER;
    v_total_missions INTEGER;
    v_test_users_with_missions INTEGER;
    v_prod_users_with_missions INTEGER;
    v_user_record RECORD;
BEGIN
    -- Contar usuarios totales
    SELECT COUNT(*) INTO v_total_users
    FROM auth_management.profiles;

    -- Contar usuarios con misiones (test)
    SELECT COUNT(DISTINCT p.id) INTO v_test_users_with_missions
    FROM auth_management.profiles p
    WHERE EXISTS (
        SELECT 1 FROM gamification_system.missions m WHERE m.user_id = p.id
    )
    AND p.email LIKE '%@gamilit.com';

    -- Contar usuarios con misiones (producción)
    SELECT COUNT(DISTINCT p.id) INTO v_prod_users_with_missions
    FROM auth_management.profiles p
    WHERE EXISTS (
        SELECT 1 FROM gamification_system.missions m WHERE m.user_id = p.id
    )
    AND p.email NOT LIKE '%@gamilit.com';

    -- Total usuarios con misiones
    v_users_with_missions := v_test_users_with_missions + v_prod_users_with_missions;

    -- Usuarios sin misiones
    SELECT COUNT(DISTINCT p.id) INTO v_users_without_missions
    FROM auth_management.profiles p
    WHERE NOT EXISTS (
        SELECT 1 FROM gamification_system.missions m WHERE m.user_id = p.id
    );

    -- Contar misiones por tipo
    SELECT COUNT(*) INTO v_total_daily
    FROM gamification_system.missions
    WHERE mission_type = 'daily';

    SELECT COUNT(*) INTO v_total_weekly
    FROM gamification_system.missions
    WHERE mission_type = 'weekly';

    SELECT COUNT(*) INTO v_total_missions
    FROM gamification_system.missions;

    -- Reporte final
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICACIÓN FINAL - ESTADO DE MISIONES';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '👥 USUARIOS:';
    RAISE NOTICE '   Total de usuarios:              %', v_total_users;
    RAISE NOTICE '   Usuarios con misiones (test):   %', v_test_users_with_missions;
    RAISE NOTICE '   Usuarios con misiones (prod):   %', v_prod_users_with_missions;
    RAISE NOTICE '   Usuarios SIN misiones:          %', v_users_without_missions;
    RAISE NOTICE '';
    RAISE NOTICE '📋 MISIONES:';
    RAISE NOTICE '   Misiones diarias:               %', v_total_daily;
    RAISE NOTICE '   Misiones semanales:             %', v_total_weekly;
    RAISE NOTICE '   Total de misiones:              %', v_total_missions;
    RAISE NOTICE '';

    -- Validaciones
    IF v_users_without_missions = 0 THEN
        RAISE NOTICE '✅ ÉXITO: Todos los usuarios tienen misiones inicializadas';
    ELSE
        RAISE WARNING '⚠️  ADVERTENCIA: % usuarios aún no tienen misiones', v_users_without_missions;
        RAISE NOTICE '';
        RAISE NOTICE '📝 Usuarios sin misiones:';

        -- Listar primeros 5 usuarios sin misiones
        FOR v_user_record IN (
            SELECT
                p.email,
                p.display_name,
                p.role,
                p.created_at
            FROM auth_management.profiles p
            WHERE NOT EXISTS (
                SELECT 1 FROM gamification_system.missions m WHERE m.user_id = p.id
            )
            ORDER BY p.created_at
            LIMIT 5
        ) LOOP
            RAISE NOTICE '   - % (%) - creado: %',
                v_user_record.email,
                v_user_record.role,
                v_user_record.created_at::date;
        END LOOP;

        IF v_users_without_missions > 5 THEN
            RAISE NOTICE '   ... y % más', v_users_without_missions - 5;
        END IF;
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';

END $$;
