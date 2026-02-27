-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
-- Seed: ML Coins Transactions (Production Demo Data)
-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
-- Description: Transacciones de ML Coins para demostracion del sistema de economia
-- Environment: all (dev + prod)
-- Dependencies:
--   - auth.users (01-demo-users.sql, 01b-demo-students.sql)
--   - auth_management.profiles (03-profiles.sql, 04-profiles-complete.sql)
--   - gamification_system.user_stats (05-user_stats.sql)
-- Execution Order: 7
-- Created: 2025-01-11
-- Updated: 2026-02-26 (BD-P01: Removed welcome_bonus rows — trigger is authoritative source)
-- Version: 3.0.0
-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
--
-- PATRON: DO block con variables de lookup + NULL guards.
-- Los usuarios demo (estudiante1/2/3@demo, instructor@demo) solo existen en dev.
-- En prod, sus lookups retornan NULL y se saltan gracefully.
-- Los usuarios core (admin@, teacher@, student@gamilit.com) existen en todos los envs.
--
-- NOTA sobre reference_id: Los UUIDs en reference_id son ilustrativos (gen_random_uuid()).
-- No hay FK constraint en reference_id — esto es intencional para flexibilidad.
-- Ver: docs/20-architecture/schema-reference/UUID-SERIES-CATALOG.md
-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP

SET search_path TO gamification_system, public;

DO $$
DECLARE
    v_est1 UUID;
    v_est2 UUID;
    v_est3 UUID;
    v_instructor UUID;
    v_teacher UUID;
    v_admin UUID;
    v_student UUID;
    v_tenant UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid;
BEGIN
    -- =========================================================================
    -- Lookup profile IDs
    -- =========================================================================
    SELECT p.id INTO v_est1 FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'estudiante1@demo.glit.edu.mx';
    SELECT p.id INTO v_est2 FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'estudiante2@demo.glit.edu.mx';
    SELECT p.id INTO v_est3 FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'estudiante3@demo.glit.edu.mx';
    SELECT p.id INTO v_instructor FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'instructor@demo.glit.edu.mx';
    SELECT p.id INTO v_teacher FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'teacher@gamilit.com';
    SELECT p.id INTO v_admin FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'admin@gamilit.com';
    SELECT p.id INTO v_student FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'student@gamilit.com';

    -- =========================================================================
    -- ESTUDIANTE 1: Ana Garcia (estudiante1@demo.glit.edu.mx) — dev only
    -- (175 ML Coins actuales, 350 ganados, 175 gastados)
    -- =========================================================================
    IF v_est1 IS NOT NULL THEN
        INSERT INTO gamification_system.ml_coins_transactions
        (id, user_id, tenant_id, transaction_type, amount, balance_before, balance_after, description, reference_type, reference_id, metadata, created_at)
        VALUES
        ('d0000001-0002-0000-0000-000000000001'::uuid, v_est1, v_tenant, 'earned_exercise'::gamification_system.transaction_type, 15, 0, 15, 'ML Coins ganados por completar ejercicio de comprension literal', 'exercise', NULL, jsonb_build_object('demo_transaction', true, 'exercise_score', 85, 'module', 'MODULO 1'), gamilit.now_mexico() - INTERVAL '11 days'),
        ('d0000001-0003-0000-0000-000000000001'::uuid, v_est1, v_tenant, 'earned_achievement'::gamification_system.transaction_type, 50, 15, 65, 'ML Coins ganados por logro: Primeros Pasos', 'achievement', gen_random_uuid(), jsonb_build_object('demo_transaction', true, 'achievement_name', 'Primeros Pasos'), gamilit.now_mexico() - INTERVAL '10 days'),
        ('d0000001-0004-0000-0000-000000000001'::uuid, v_est1, v_tenant, 'earned_exercise'::gamification_system.transaction_type, 185, 65, 250, 'ML Coins acumulados por completar 14 ejercicios adicionales', 'exercise', NULL, jsonb_build_object('demo_transaction', true, 'exercises_count', 14, 'module', 'MODULO 1'), gamilit.now_mexico() - INTERVAL '8 days'),
        ('d0000001-0005-0000-0000-000000000001'::uuid, v_est1, v_tenant, 'spent_powerup'::gamification_system.transaction_type, -30, 250, 220, 'Compra de comodin: Lupa', 'powerup', NULL, jsonb_build_object('demo_transaction', true, 'powerup_name', 'Lupa'), gamilit.now_mexico() - INTERVAL '7 days'),
        ('d0000001-0006-0000-0000-000000000001'::uuid, v_est1, v_tenant, 'earned_achievement'::gamification_system.transaction_type, 50, 220, 270, 'ML Coins ganados por logro: Racha de 3 Dias', 'achievement', gen_random_uuid(), jsonb_build_object('demo_transaction', true, 'achievement_name', 'Racha de 3 Dias'), gamilit.now_mexico() - INTERVAL '5 days'),
        ('d0000001-0007-0000-0000-000000000001'::uuid, v_est1, v_tenant, 'spent_hint'::gamification_system.transaction_type, -10, 270, 260, 'Compra de pista para ejercicio', 'exercise', NULL, jsonb_build_object('demo_transaction', true, 'hint_level', 1), gamilit.now_mexico() - INTERVAL '4 days'),
        ('d0000001-0008-0000-0000-000000000001'::uuid, v_est1, v_tenant, 'earned_streak'::gamification_system.transaction_type, 25, 260, 285, 'Bono por mantener racha diaria activa', NULL, NULL, jsonb_build_object('demo_transaction', true, 'streak_days', 3), gamilit.now_mexico() - INTERVAL '3 days'),
        ('d0000001-0009-0000-0000-000000000001'::uuid, v_est1, v_tenant, 'spent_powerup'::gamification_system.transaction_type, -25, 285, 260, 'Compra de comodin: Brujula', 'powerup', NULL, jsonb_build_object('demo_transaction', true, 'powerup_name', 'Brujula'), gamilit.now_mexico() - INTERVAL '2 days'),
        ('d0000001-0010-0000-0000-000000000001'::uuid, v_est1, v_tenant, 'earned_achievement'::gamification_system.transaction_type, 50, 260, 310, 'ML Coins ganados por logro: Lector Principiante', 'achievement', gen_random_uuid(), jsonb_build_object('demo_transaction', true, 'achievement_name', 'Lector Principiante'), gamilit.now_mexico() - INTERVAL '1 day'),
        ('d0000001-0011-0000-0000-000000000001'::uuid, v_est1, v_tenant, 'spent_retry'::gamification_system.transaction_type, -15, 310, 295, 'Compra de reintento para ejercicio', 'exercise', NULL, jsonb_build_object('demo_transaction', true, 'retry_number', 1), gamilit.now_mexico() - INTERVAL '12 hours'),
        ('d0000001-0012-0000-0000-000000000001'::uuid, v_est1, v_tenant, 'earned_daily'::gamification_system.transaction_type, 20, 295, 315, 'Bono diario por iniciar sesion', NULL, NULL, jsonb_build_object('demo_transaction', true, 'consecutive_days', 3), gamilit.now_mexico() - INTERVAL '6 hours'),
        ('d0000001-0013-0000-0000-000000000001'::uuid, v_est1, v_tenant, 'spent_retry'::gamification_system.transaction_type, -15, 315, 300, 'Compra de segundo reintento para ejercicio', 'exercise', NULL, jsonb_build_object('demo_transaction', true, 'retry_number', 1), gamilit.now_mexico() - INTERVAL '4 hours'),
        ('d0000001-0014-0000-0000-000000000001'::uuid, v_est1, v_tenant, 'spent_powerup'::gamification_system.transaction_type, -25, 300, 275, 'Compra de comodin: Diccionario Contextual', 'powerup', NULL, jsonb_build_object('demo_transaction', true, 'powerup_name', 'Diccionario Contextual'), gamilit.now_mexico() - INTERVAL '2 hours'),
        ('d0000001-0015-0000-0000-000000000001'::uuid, v_est1, v_tenant, 'spent_hint'::gamification_system.transaction_type, -10, 275, 265, 'Compra de pista adicional para ejercicio', 'exercise', NULL, jsonb_build_object('demo_transaction', true, 'hint_level', 2), gamilit.now_mexico() - INTERVAL '1 hour'),
        ('d0000001-0016-0000-0000-000000000001'::uuid, v_est1, v_tenant, 'earned_bonus'::gamification_system.transaction_type, 90, 265, 355, 'Bonos acumulados por racha y ejercicios perfectos', NULL, NULL, jsonb_build_object('demo_transaction', true, 'bonus_type', 'perfect_scores'), gamilit.now_mexico() - INTERVAL '30 minutes'),
        ('d0000001-0017-0000-0000-000000000001'::uuid, v_est1, v_tenant, 'spent_hint'::gamification_system.transaction_type, -10, 355, 345, 'Compra de pista para ejercicio complejo', 'exercise', NULL, jsonb_build_object('demo_transaction', true, 'hint_level', 1), gamilit.now_mexico() - INTERVAL '15 minutes'),
        ('d0000001-0018-0000-0000-000000000001'::uuid, v_est1, v_tenant, 'spent_powerup'::gamification_system.transaction_type, -20, 345, 325, 'Compra de comodin: Resaltador', 'powerup', NULL, jsonb_build_object('demo_transaction', true, 'powerup_name', 'Resaltador'), gamilit.now_mexico() - INTERVAL '10 minutes'),
        ('d0000001-0019-0000-0000-000000000001'::uuid, v_est1, v_tenant, 'earned_streak'::gamification_system.transaction_type, 50, 325, 375, 'Bono especial por racha consecutiva de 3 dias', NULL, NULL, jsonb_build_object('demo_transaction', true, 'streak_days', 3, 'bonus_type', 'milestone'), gamilit.now_mexico() - INTERVAL '5 minutes'),
        ('d0000001-0020-0000-0000-000000000001'::uuid, v_est1, v_tenant, 'spent_powerup'::gamification_system.transaction_type, -50, 375, 325, 'Compra de comodin: Organizador de Ideas', 'powerup', NULL, jsonb_build_object('demo_transaction', true, 'powerup_name', 'Organizador de Ideas'), gamilit.now_mexico() - INTERVAL '2 minutes'),
        ('d0000001-0021-0000-0000-000000000001'::uuid, v_est1, v_tenant, 'spent_powerup'::gamification_system.transaction_type, -50, 325, 275, 'Compra de comodin: Mapa Mental', 'powerup', NULL, jsonb_build_object('demo_transaction', true, 'powerup_name', 'Mapa Mental'), gamilit.now_mexico() - INTERVAL '1 minute'),
        ('d0000001-0022-0000-0000-000000000001'::uuid, v_est1, v_tenant, 'admin_adjustment'::gamification_system.transaction_type, -100, 275, 175, 'Ajuste administrativo de balance (correccion de sistema)', NULL, NULL, jsonb_build_object('demo_transaction', true, 'reason', 'balance_correction'), gamilit.now_mexico())
        ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, balance_after = EXCLUDED.balance_after;

        RAISE NOTICE 'Estudiante 1 (estudiante1@demo): 21 transacciones insertadas';
    ELSE
        RAISE NOTICE 'Estudiante 1 (estudiante1@demo): usuario no encontrado, saltando';
    END IF;

    -- =========================================================================
    -- ESTUDIANTE 2: Carlos Ramirez (estudiante2@demo.glit.edu.mx) — dev only
    -- (50 ML Coins actuales, 100 ganados, 50 gastados)
    -- =========================================================================
    IF v_est2 IS NOT NULL THEN
        INSERT INTO gamification_system.ml_coins_transactions
        (id, user_id, tenant_id, transaction_type, amount, balance_before, balance_after, description, reference_type, reference_id, metadata, created_at)
        VALUES
        ('d0000002-0002-0000-0000-000000000002'::uuid, v_est2, v_tenant, 'earned_achievement'::gamification_system.transaction_type, 50, 0, 50, 'ML Coins ganados por logro: Primera Visita', 'achievement', gen_random_uuid(), jsonb_build_object('demo_transaction', true, 'achievement_name', 'Primera Visita'), gamilit.now_mexico() - INTERVAL '8 days'),
        ('d0000002-0003-0000-0000-000000000002'::uuid, v_est2, v_tenant, 'earned_exercise'::gamification_system.transaction_type, 50, 50, 100, 'ML Coins ganados por completar 5 ejercicios', 'exercise', NULL, jsonb_build_object('demo_transaction', true, 'exercises_count', 5, 'module', 'MODULO 1'), gamilit.now_mexico() - INTERVAL '5 days'),
        ('d0000002-0004-0000-0000-000000000002'::uuid, v_est2, v_tenant, 'spent_hint'::gamification_system.transaction_type, -10, 100, 90, 'Compra de pista para ejercicio', 'exercise', NULL, jsonb_build_object('demo_transaction', true, 'hint_level', 1), gamilit.now_mexico() - INTERVAL '4 days'),
        ('d0000002-0005-0000-0000-000000000002'::uuid, v_est2, v_tenant, 'spent_powerup'::gamification_system.transaction_type, -30, 90, 60, 'Compra de comodin: Lupa', 'powerup', NULL, jsonb_build_object('demo_transaction', true, 'powerup_name', 'Lupa'), gamilit.now_mexico() - INTERVAL '3 days'),
        ('d0000002-0006-0000-0000-000000000002'::uuid, v_est2, v_tenant, 'spent_hint'::gamification_system.transaction_type, -10, 60, 50, 'Compra de pista adicional para ejercicio', 'exercise', NULL, jsonb_build_object('demo_transaction', true, 'hint_level', 2), gamilit.now_mexico() - INTERVAL '1 day')
        ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, balance_after = EXCLUDED.balance_after;

        RAISE NOTICE 'Estudiante 2 (estudiante2@demo): 5 transacciones insertadas';
    ELSE
        RAISE NOTICE 'Estudiante 2 (estudiante2@demo): usuario no encontrado, saltando';
    END IF;

    -- =========================================================================
    -- ESTUDIANTE 3: Maria Fernanda (estudiante3@demo.glit.edu.mx) — dev only
    -- (325 ML Coins, 400 ganados, 75 gastados)
    -- =========================================================================
    IF v_est3 IS NOT NULL THEN
        INSERT INTO gamification_system.ml_coins_transactions
        (id, user_id, tenant_id, transaction_type, amount, balance_before, balance_after, description, reference_type, reference_id, metadata, created_at)
        VALUES
        ('d0000003-0002-0000-0000-000000000003'::uuid, v_est3, v_tenant, 'earned_exercise'::gamification_system.transaction_type, 250, 0, 250, 'ML Coins ganados por completar 25 ejercicios del Modulo 1', 'exercise', NULL, jsonb_build_object('demo_transaction', true, 'exercises_count', 25, 'module', 'MODULO 1'), gamilit.now_mexico() - INTERVAL '12 days'),
        ('d0000003-0003-0000-0000-000000000003'::uuid, v_est3, v_tenant, 'spent_powerup'::gamification_system.transaction_type, -30, 250, 220, 'Compra de comodin: Lupa', 'powerup', NULL, jsonb_build_object('demo_transaction', true, 'powerup_name', 'Lupa'), gamilit.now_mexico() - INTERVAL '11 days'),
        ('d0000003-0004-0000-0000-000000000003'::uuid, v_est3, v_tenant, 'earned_module'::gamification_system.transaction_type, 100, 220, 320, 'ML Coins ganados por completar Modulo 1', 'module', NULL, jsonb_build_object('demo_transaction', true, 'module_name', 'MODULO 1'), gamilit.now_mexico() - INTERVAL '10 days'),
        ('d0000003-0005-0000-0000-000000000003'::uuid, v_est3, v_tenant, 'earned_achievement'::gamification_system.transaction_type, 50, 320, 370, 'ML Coins ganados por logro: Racha de 7 Dias', 'achievement', gen_random_uuid(), jsonb_build_object('demo_transaction', true, 'achievement_name', 'Racha de 7 Dias'), gamilit.now_mexico() - INTERVAL '7 days'),
        ('d0000003-0006-0000-0000-000000000003'::uuid, v_est3, v_tenant, 'spent_powerup'::gamification_system.transaction_type, -25, 370, 345, 'Compra de comodin: Diccionario Contextual', 'powerup', NULL, jsonb_build_object('demo_transaction', true, 'powerup_name', 'Diccionario Contextual'), gamilit.now_mexico() - INTERVAL '6 days'),
        ('d0000003-0007-0000-0000-000000000003'::uuid, v_est3, v_tenant, 'spent_hint'::gamification_system.transaction_type, -10, 345, 335, 'Compra de pista para ejercicio del Modulo 2', 'exercise', NULL, jsonb_build_object('demo_transaction', true, 'hint_level', 1), gamilit.now_mexico() - INTERVAL '5 days'),
        ('d0000003-0008-0000-0000-000000000003'::uuid, v_est3, v_tenant, 'spent_hint'::gamification_system.transaction_type, -10, 335, 325, 'Compra de pista adicional para ejercicio del Modulo 2', 'exercise', NULL, jsonb_build_object('demo_transaction', true, 'hint_level', 2), gamilit.now_mexico() - INTERVAL '2 days')
        ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, balance_after = EXCLUDED.balance_after;

        RAISE NOTICE 'Estudiante 3 (estudiante3@demo): 7 transacciones insertadas';
    ELSE
        RAISE NOTICE 'Estudiante 3 (estudiante3@demo): usuario no encontrado, saltando';
    END IF;

    -- =========================================================================
    -- ESTUDIANTE 4: Luis Miguel (estudiante1@demo alias) — dev only
    -- (200 ML Coins, 350 ganados, 150 gastados)
    -- =========================================================================
    IF v_est1 IS NOT NULL THEN
        INSERT INTO gamification_system.ml_coins_transactions
        (id, user_id, tenant_id, transaction_type, amount, balance_before, balance_after, description, reference_type, reference_id, metadata, created_at)
        VALUES
        ('d0000004-0002-0000-0000-000000000004'::uuid, v_est1, v_tenant, 'earned_exercise'::gamification_system.transaction_type, 200, 0, 200, 'ML Coins por completar 20 ejercicios', 'exercise', NULL, jsonb_build_object('demo_transaction', true, 'exercises_count', 20), gamilit.now_mexico() - INTERVAL '10 days'),
        ('d0000004-0003-0000-0000-000000000004'::uuid, v_est1, v_tenant, 'earned_achievement'::gamification_system.transaction_type, 100, 200, 300, 'ML Coins por achievements (Primeros Pasos, Lector Principiante)', 'achievement', NULL, jsonb_build_object('demo_transaction', true, 'achievements_count', 2), gamilit.now_mexico() - INTERVAL '8 days'),
        ('d0000004-0004-0000-0000-000000000004'::uuid, v_est1, v_tenant, 'earned_streak'::gamification_system.transaction_type, 50, 300, 350, 'Bonos por racha de 4 dias', NULL, NULL, jsonb_build_object('demo_transaction', true, 'streak_days', 4), gamilit.now_mexico() - INTERVAL '4 days'),
        ('d0000004-0005-0000-0000-000000000004'::uuid, v_est1, v_tenant, 'spent_powerup'::gamification_system.transaction_type, -80, 350, 270, 'Compra de comodines (Lupa, Brujula, Diccionario)', 'powerup', NULL, jsonb_build_object('demo_transaction', true, 'powerups_count', 3), gamilit.now_mexico() - INTERVAL '3 days'),
        ('d0000004-0006-0000-0000-000000000004'::uuid, v_est1, v_tenant, 'spent_hint'::gamification_system.transaction_type, -40, 270, 230, 'Compra de 4 hints', 'exercise', NULL, jsonb_build_object('demo_transaction', true, 'hints_count', 4), gamilit.now_mexico() - INTERVAL '2 days'),
        ('d0000004-0007-0000-0000-000000000004'::uuid, v_est1, v_tenant, 'spent_retry'::gamification_system.transaction_type, -30, 230, 200, 'Compra de 2 reintentos', 'exercise', NULL, jsonb_build_object('demo_transaction', true, 'retries_count', 2), gamilit.now_mexico() - INTERVAL '1 day')
        ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, balance_after = EXCLUDED.balance_after;

        RAISE NOTICE 'Estudiante 4 (estudiante1@demo alias): 6 transacciones insertadas';
    END IF;

    -- =========================================================================
    -- ESTUDIANTE 5: Sofia Martinez (estudiante3@demo alias) — dev only
    -- (550 ML Coins, 700 ganados, 150 gastados)
    -- =========================================================================
    IF v_est3 IS NOT NULL THEN
        INSERT INTO gamification_system.ml_coins_transactions
        (id, user_id, tenant_id, transaction_type, amount, balance_before, balance_after, description, reference_type, reference_id, metadata, created_at)
        VALUES
        ('d0000005-0002-0000-0000-000000000005'::uuid, v_est3, v_tenant, 'earned_exercise'::gamification_system.transaction_type, 500, 0, 500, 'ML Coins por completar 50 ejercicios (Modulos 1 y 2)', 'exercise', NULL, jsonb_build_object('demo_transaction', true, 'exercises_count', 50), gamilit.now_mexico() - INTERVAL '15 days'),
        ('d0000005-0003-0000-0000-000000000005'::uuid, v_est3, v_tenant, 'earned_module'::gamification_system.transaction_type, 200, 500, 700, 'ML Coins por completar 2 modulos (Modulo 1 y 2)', 'module', NULL, jsonb_build_object('demo_transaction', true, 'modules_count', 2), gamilit.now_mexico() - INTERVAL '12 days'),
        ('d0000005-0004-0000-0000-000000000005'::uuid, v_est3, v_tenant, 'spent_powerup'::gamification_system.transaction_type, -120, 700, 580, 'Compra de comodines avanzados', 'powerup', NULL, jsonb_build_object('demo_transaction', true, 'powerups_count', 4), gamilit.now_mexico() - INTERVAL '8 days'),
        ('d0000005-0005-0000-0000-000000000005'::uuid, v_est3, v_tenant, 'spent_hint'::gamification_system.transaction_type, -30, 580, 550, 'Compra de 3 hints para Modulo 3', 'exercise', NULL, jsonb_build_object('demo_transaction', true, 'hints_count', 3), gamilit.now_mexico() - INTERVAL '3 days')
        ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, balance_after = EXCLUDED.balance_after;

        RAISE NOTICE 'Estudiante 5 (estudiante3@demo alias): 4 transacciones insertadas';
    END IF;

    -- =========================================================================
    -- PROFESOR 1: Juan Perez (instructor@demo.glit.edu.mx) — dev only
    -- (900 ML Coins, 1100 ganados, 200 gastados)
    -- =========================================================================
    IF v_instructor IS NOT NULL THEN
        INSERT INTO gamification_system.ml_coins_transactions
        (id, user_id, tenant_id, transaction_type, amount, balance_before, balance_after, description, reference_type, reference_id, metadata, created_at)
        VALUES
        ('d0000006-0002-0000-0000-000000000006'::uuid, v_instructor, v_tenant, 'earned_bonus'::gamification_system.transaction_type, 600, 0, 600, 'Bonos por actividades de profesor (creacion de contenido, evaluaciones)', NULL, NULL, jsonb_build_object('demo_transaction', true, 'bonus_type', 'teacher_activities'), gamilit.now_mexico() - INTERVAL '20 days'),
        ('d0000006-0003-0000-0000-000000000006'::uuid, v_instructor, v_tenant, 'earned_achievement'::gamification_system.transaction_type, 500, 600, 1100, 'ML Coins por achievements de profesor', 'achievement', NULL, jsonb_build_object('demo_transaction', true, 'achievements_count', 5), gamilit.now_mexico() - INTERVAL '15 days'),
        ('d0000006-0004-0000-0000-000000000006'::uuid, v_instructor, v_tenant, 'spent_powerup'::gamification_system.transaction_type, -200, 1100, 900, 'Compra de herramientas premium para ensenanza', 'powerup', NULL, jsonb_build_object('demo_transaction', true, 'tools_purchased', 4), gamilit.now_mexico() - INTERVAL '5 days')
        ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, balance_after = EXCLUDED.balance_after;

        RAISE NOTICE 'Profesor 1 (instructor@demo): 3 transacciones insertadas';
    ELSE
        RAISE NOTICE 'Profesor 1 (instructor@demo): usuario no encontrado, saltando';
    END IF;

    -- =========================================================================
    -- PROFESOR 2: Laura Martinez (teacher@gamilit.com) — core user
    -- (850 ML Coins, 1050 ganados, 200 gastados)
    -- =========================================================================
    IF v_teacher IS NOT NULL THEN
        INSERT INTO gamification_system.ml_coins_transactions
        (id, user_id, tenant_id, transaction_type, amount, balance_before, balance_after, description, reference_type, reference_id, metadata, created_at)
        VALUES
        ('d0000007-0002-0000-0000-000000000007'::uuid, v_teacher, v_tenant, 'earned_bonus'::gamification_system.transaction_type, 550, 0, 550, 'Bonos por actividades de profesora', NULL, NULL, jsonb_build_object('demo_transaction', true, 'bonus_type', 'teacher_activities'), gamilit.now_mexico() - INTERVAL '18 days'),
        ('d0000007-0003-0000-0000-000000000007'::uuid, v_teacher, v_tenant, 'earned_achievement'::gamification_system.transaction_type, 500, 550, 1050, 'ML Coins por achievements de profesora', 'achievement', NULL, jsonb_build_object('demo_transaction', true, 'achievements_count', 5), gamilit.now_mexico() - INTERVAL '12 days'),
        ('d0000007-0004-0000-0000-000000000007'::uuid, v_teacher, v_tenant, 'spent_powerup'::gamification_system.transaction_type, -200, 1050, 850, 'Compra de herramientas premium para ensenanza', 'powerup', NULL, jsonb_build_object('demo_transaction', true, 'tools_purchased', 4), gamilit.now_mexico() - INTERVAL '4 days')
        ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, balance_after = EXCLUDED.balance_after;

        RAISE NOTICE 'Profesor 2 (teacher@gamilit.com): 3 transacciones insertadas';
    ELSE
        RAISE NOTICE 'Profesor 2 (teacher@gamilit.com): usuario no encontrado, saltando';
    END IF;

    -- =========================================================================
    -- ADMIN: Sistema Admin (admin@gamilit.com) — core user
    -- (4900 ML Coins, 5400 ganados, 500 gastados)
    -- =========================================================================
    IF v_admin IS NOT NULL THEN
        INSERT INTO gamification_system.ml_coins_transactions
        (id, user_id, tenant_id, transaction_type, amount, balance_before, balance_after, description, reference_type, reference_id, metadata, created_at)
        VALUES
        ('d0000008-0002-0000-0000-000000000008'::uuid, v_admin, v_tenant, 'earned_bonus'::gamification_system.transaction_type, 5400, 0, 5400, 'Bonos acumulados por administracion del sistema', NULL, NULL, jsonb_build_object('demo_transaction', true, 'bonus_type', 'admin_activities'), gamilit.now_mexico() - INTERVAL '30 days'),
        ('d0000008-0003-0000-0000-000000000008'::uuid, v_admin, v_tenant, 'spent_powerup'::gamification_system.transaction_type, -500, 5400, 4900, 'Compra de herramientas de administracion premium', 'powerup', NULL, jsonb_build_object('demo_transaction', true, 'admin_tools', true), gamilit.now_mexico() - INTERVAL '10 days')
        ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, balance_after = EXCLUDED.balance_after;

        RAISE NOTICE 'Admin (admin@gamilit.com): 2 transacciones insertadas';
    ELSE
        RAISE NOTICE 'Admin (admin@gamilit.com): usuario no encontrado, saltando';
    END IF;

    -- =========================================================================
    -- DIRECTOR: Roberto Director (admin@gamilit.com alias) — core user
    -- (2400 ML Coins, 2700 ganados, 300 gastados)
    -- =========================================================================
    IF v_admin IS NOT NULL THEN
        INSERT INTO gamification_system.ml_coins_transactions
        (id, user_id, tenant_id, transaction_type, amount, balance_before, balance_after, description, reference_type, reference_id, metadata, created_at)
        VALUES
        ('d0000009-0002-0000-0000-000000000009'::uuid, v_admin, v_tenant, 'earned_bonus'::gamification_system.transaction_type, 2700, 0, 2700, 'Bonos acumulados por gestion directiva', NULL, NULL, jsonb_build_object('demo_transaction', true, 'bonus_type', 'management_activities'), gamilit.now_mexico() - INTERVAL '25 days'),
        ('d0000009-0003-0000-0000-000000000009'::uuid, v_admin, v_tenant, 'spent_powerup'::gamification_system.transaction_type, -300, 2700, 2400, 'Compra de herramientas de gestion', 'powerup', NULL, jsonb_build_object('demo_transaction', true, 'management_tools', true), gamilit.now_mexico() - INTERVAL '8 days')
        ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, balance_after = EXCLUDED.balance_after;

        RAISE NOTICE 'Director (admin@gamilit.com alias): 2 transacciones insertadas';
    END IF;

    -- =========================================================================
    -- PADRE: Carmen Madre (student@gamilit.com fallback) — core user
    -- (0 ML Coins from seed, welcome bonus from trigger)
    -- =========================================================================
    IF v_student IS NOT NULL THEN
        RAISE NOTICE 'No seed transactions (welcome bonus comes from trigger)';
    ELSE
        RAISE NOTICE 'Padre (student@gamilit.com): usuario no encontrado, saltando';
    END IF;

END $$;

-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
-- VERIFICACION DE TRANSACCIONES
-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP

DO $$
DECLARE
    v_transaction_count INTEGER;
    v_total_earned INTEGER;
    v_total_spent INTEGER;
    v_net_balance INTEGER;
BEGIN
    -- Contar transacciones insertadas
    SELECT COUNT(*) INTO v_transaction_count
    FROM gamification_system.ml_coins_transactions
    WHERE metadata->>'demo_transaction' = 'true';

    -- Calcular totales ganados
    SELECT COALESCE(SUM(amount), 0) INTO v_total_earned
    FROM gamification_system.ml_coins_transactions
    WHERE metadata->>'demo_transaction' = 'true'
    AND amount > 0;

    -- Calcular totales gastados
    SELECT COALESCE(SUM(ABS(amount)), 0) INTO v_total_spent
    FROM gamification_system.ml_coins_transactions
    WHERE metadata->>'demo_transaction' = 'true'
    AND amount < 0;

    -- Balance neto
    v_net_balance := v_total_earned - v_total_spent;

    RAISE NOTICE 'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP';
    RAISE NOTICE 'ML Coins Transactions - Verificacion de Seeds';
    RAISE NOTICE 'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP';
    RAISE NOTICE 'Total de transacciones insertadas: %', v_transaction_count;
    RAISE NOTICE 'Total ML Coins ganados: % ML Coins', v_total_earned;
    RAISE NOTICE 'Total ML Coins gastados: % ML Coins', v_total_spent;
    RAISE NOTICE 'Balance neto: % ML Coins', v_net_balance;
    RAISE NOTICE 'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP';

    -- Verificar que tenemos transacciones (threshold baja en prod sin demo users)
    IF v_transaction_count = 0 THEN
        RAISE WARNING 'No se insertaron transacciones demo';
    ELSE
        RAISE NOTICE 'Seeds de transacciones ML Coins insertados correctamente (% registros)', v_transaction_count;
    END IF;
END $$;

-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
-- LISTADO DE TRANSACCIONES INSERTADAS (para debugging)
-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP

DO $$
DECLARE
    v_user_record RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Resumen de transacciones por usuario:';
    RAISE NOTICE 'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP';

    FOR v_user_record IN (
        SELECT
            u.email,
            p.display_name,
            COUNT(t.id) as transaction_count,
            COALESCE(SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END), 0) as total_earned,
            COALESCE(SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount) ELSE 0 END), 0) as total_spent,
            MAX(t.balance_after) as current_balance
        FROM auth.users u
        JOIN auth_management.profiles p ON p.user_id = u.id
        LEFT JOIN gamification_system.ml_coins_transactions t ON t.user_id = p.id
        WHERE t.metadata->>'demo_transaction' = 'true'
        GROUP BY u.email, p.display_name
        ORDER BY u.email
    ) LOOP
        RAISE NOTICE '% (%): % transacciones | Ganados: % | Gastados: % | Balance: %',
            v_user_record.display_name,
            v_user_record.email,
            v_user_record.transaction_count,
            v_user_record.total_earned,
            v_user_record.total_spent,
            v_user_record.current_balance;
    END LOOP;

    RAISE NOTICE 'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP';
END $$;

-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
-- FIN DEL SEED
-- PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
