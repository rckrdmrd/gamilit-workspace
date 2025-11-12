-- =====================================================
-- Seed: progress_tracking.module_progress (PROD)
-- Description: Progreso inicial de usuarios de testing
-- Environment: PRODUCTION
-- Dependencies: auth_management.profiles, educational_content.modules
-- Order: 01
-- Created: 2025-11-11
-- Version: 2.0 (reescrito para IDs dinámicos)
-- =====================================================
--
-- CAMBIOS v2.0:
-- - Usa module_code en lugar de IDs fijos
-- - Solo incluye usuarios de testing (student@gamilit.com)
-- - IDs dinámicos mediante DO $$ blocks
--
-- PROGRESO INCLUIDO:
-- - student@gamilit.com: 50% en Módulo 1
--
-- TOTAL: 1 registro de module_progress
-- =====================================================

SET search_path TO progress_tracking, educational_content, auth_management, public;

-- =====================================================
-- INSERT: Module Progress for Testing Users
-- =====================================================

DO $$
DECLARE
    v_student_id UUID;
    v_mod1_id UUID;
BEGIN
    -- Get student user ID
    SELECT id INTO v_student_id
    FROM auth_management.profiles
    WHERE email = 'student@gamilit.com'
    LIMIT 1;

    IF v_student_id IS NULL THEN
        RAISE WARNING 'Usuario student@gamilit.com no encontrado. Ejecutar primero seeds de auth.';
        RETURN;
    END IF;

    -- Get Module 1 ID
    SELECT id INTO v_mod1_id
    FROM educational_content.modules
    WHERE module_code = 'MOD-01-LITERAL'
    LIMIT 1;

    IF v_mod1_id IS NULL THEN
        RAISE WARNING 'Módulo MOD-01-LITERAL no encontrado. Ejecutar primero 01-modules.sql';
        RETURN;
    END IF;

    -- Insert progress for student in Module 1
    INSERT INTO progress_tracking.module_progress (
        user_id,
        module_id,
        status,
        progress_percentage,
        completed_exercises,
        total_exercises,
        skipped_exercises,
        total_score,
        max_possible_score,
        average_score,
        best_score,
        total_xp_earned,
        total_ml_coins_earned,
        time_spent,
        sessions_count,
        attempts_count,
        hints_used_total,
        comodines_used_total,
        comodines_cost_total,
        started_at,
        completed_at,
        last_accessed_at,
        allow_retry,
        sequential_completion,
        adaptive_difficulty,
        learning_path,
        performance_analytics,
        metadata,
        created_at,
        updated_at
    ) VALUES (
        v_student_id,
        v_mod1_id,
        'in_progress'::progress_tracking.progress_status,
        50,                -- 50% progress
        2,                 -- completed 2 exercises
        5,                 -- total 5 exercises in module
        0,                 -- no skipped
        160,               -- total score (80 avg × 2 exercises)
        200,               -- max possible (100 × 2)
        80.00,             -- average score
        95,                -- best score
        200,               -- total XP earned
        50,                -- total ML Coins earned
        '01:30:00'::interval,  -- 1.5 hours spent
        3,                 -- 3 sessions
        2,                 -- 2 attempts (completed 2 exercises on first try)
        0,                 -- no hints used
        0,                 -- no comodines used
        0,                 -- comodines cost
        gamilit.now_mexico() - INTERVAL '5 days',
        NULL,              -- not completed yet
        gamilit.now_mexico() - INTERVAL '1 hour',
        true,              -- allow retry
        false,             -- sequential completion not enforced
        true,              -- adaptive difficulty enabled
        NULL,              -- learning path
        '{}'::jsonb,       -- performance analytics
        '{}'::jsonb,       -- metadata
        gamilit.now_mexico(),
        gamilit.now_mexico()
    )
    ON CONFLICT (user_id, module_id) DO UPDATE SET
        progress_percentage = EXCLUDED.progress_percentage,
        completed_exercises = EXCLUDED.completed_exercises,
        total_score = EXCLUDED.total_score,
        average_score = EXCLUDED.average_score,
        last_accessed_at = EXCLUDED.last_accessed_at,
        updated_at = gamilit.now_mexico();

    RAISE NOTICE 'Progreso de módulos creado para student@gamilit.com';
END $$;

-- =====================================================
-- Verification
-- =====================================================

DO $$
DECLARE
    progress_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO progress_count FROM progress_tracking.module_progress;
    RAISE NOTICE '✅ Registros de module_progress creados: %', progress_count;
END $$;
