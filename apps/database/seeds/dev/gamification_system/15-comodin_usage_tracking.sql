-- =====================================================================================
-- SEED: Comodin Usage Tracking for gamification_system Schema
-- =====================================================================================
-- Description: Historial de uso de comodines por intento de ejercicio
-- Dependencies: auth_management.profiles, educational_content.exercises, progress_tracking.exercise_attempts
-- Idempotency: Uses ON CONFLICT to handle re-runs safely
-- Created: 2026-01-27
-- Task: TASK-P2-SEEDS-COMODINES-2026-01-27
-- Gap: SEED-P2-001
-- =====================================================================================
--
-- Límites de uso por intento:
-- - pistas: máximo 3 por intento
-- - vision_lectora: máximo 1 por intento
-- - segunda_oportunidad: máximo 1 por intento
--
-- =====================================================================================

SET search_path TO gamification_system, auth_management, educational_content, progress_tracking, public;

-- =====================================================
-- COMODIN USAGE TRACKING
-- =====================================================

DO $$
DECLARE
    v_student1_id UUID;
    v_student2_id UUID;
    v_student3_id UUID;
    v_exercise1_id UUID;
    v_exercise2_id UUID;
    v_exercise3_id UUID;
    v_attempt1_id UUID;
    v_attempt2_id UUID;
    v_attempt3_id UUID;
    v_count INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  SEED: comodin_usage_tracking';
    RAISE NOTICE '════════════════════════════════════════════════════════';

    -- =====================================================
    -- Get Student IDs (demo students, exclude testing users)
    -- =====================================================
    SELECT id INTO v_student1_id
    FROM auth_management.profiles
    WHERE role = 'student'
      AND email NOT LIKE '%@gamilit.com'
    ORDER BY created_at
    LIMIT 1;

    SELECT id INTO v_student2_id
    FROM auth_management.profiles
    WHERE role = 'student'
      AND email NOT LIKE '%@gamilit.com'
    ORDER BY created_at
    OFFSET 1 LIMIT 1;

    SELECT id INTO v_student3_id
    FROM auth_management.profiles
    WHERE role = 'student'
      AND email NOT LIKE '%@gamilit.com'
    ORDER BY created_at
    OFFSET 2 LIMIT 1;

    -- Fallbacks
    IF v_student1_id IS NULL THEN
        SELECT id INTO v_student1_id FROM auth_management.profiles WHERE role = 'student' LIMIT 1;
    END IF;
    IF v_student2_id IS NULL THEN v_student2_id := v_student1_id; END IF;
    IF v_student3_id IS NULL THEN v_student3_id := v_student1_id; END IF;

    -- Skip if no students
    IF v_student1_id IS NULL THEN
        RAISE NOTICE '⚠ No students found. Skipping comodin_usage_tracking seed.';
        RETURN;
    END IF;

    -- =====================================================
    -- Get Exercise IDs
    -- =====================================================
    SELECT id INTO v_exercise1_id
    FROM educational_content.exercises
    WHERE is_active = true
    ORDER BY created_at LIMIT 1;

    SELECT id INTO v_exercise2_id
    FROM educational_content.exercises
    WHERE is_active = true
    ORDER BY created_at OFFSET 1 LIMIT 1;

    SELECT id INTO v_exercise3_id
    FROM educational_content.exercises
    WHERE is_active = true
    ORDER BY created_at OFFSET 2 LIMIT 1;

    IF v_exercise1_id IS NULL THEN
        RAISE NOTICE '⚠ No exercises found. Skipping comodin_usage_tracking seed.';
        RETURN;
    END IF;
    IF v_exercise2_id IS NULL THEN v_exercise2_id := v_exercise1_id; END IF;
    IF v_exercise3_id IS NULL THEN v_exercise3_id := v_exercise1_id; END IF;

    -- =====================================================
    -- Get Attempt IDs (or generate fake ones)
    -- =====================================================
    SELECT id INTO v_attempt1_id
    FROM progress_tracking.exercise_attempts
    WHERE user_id = v_student1_id
    LIMIT 1;

    SELECT id INTO v_attempt2_id
    FROM progress_tracking.exercise_attempts
    WHERE user_id = v_student2_id
    LIMIT 1;

    SELECT id INTO v_attempt3_id
    FROM progress_tracking.exercise_attempts
    WHERE user_id = v_student3_id
    LIMIT 1;

    -- Generate UUIDs if no attempts exist
    IF v_attempt1_id IS NULL THEN v_attempt1_id := gen_random_uuid(); END IF;
    IF v_attempt2_id IS NULL THEN v_attempt2_id := gen_random_uuid(); END IF;
    IF v_attempt3_id IS NULL THEN v_attempt3_id := gen_random_uuid(); END IF;

    RAISE NOTICE '  Students: %, %, %', v_student1_id, v_student2_id, v_student3_id;
    RAISE NOTICE '  Exercises: %, %, %', v_exercise1_id, v_exercise2_id, v_exercise3_id;

    -- =====================================================
    -- INSERT COMODIN USAGE RECORDS
    -- =====================================================
    INSERT INTO gamification_system.comodin_usage_trackings (
        id,
        user_id,
        exercise_id,
        attempt_id,
        pistas_used,
        vision_lectora_used,
        segunda_oportunidad_used,
        pistas_limit_reached,
        vision_lectora_limit_reached,
        segunda_oportunidad_limit_reached,
        started_at,
        last_used_at
    ) VALUES

    -- Record 1: Student 1, Exercise 1 - Used 2 pistas
    (
        '81111111-1111-1111-1111-111111111001'::uuid,
        v_student1_id,
        v_exercise1_id,
        v_attempt1_id,
        2,    -- pistas_used (máx 3)
        0,    -- vision_lectora_used
        0,    -- segunda_oportunidad_used
        false,  -- pistas_limit_reached
        false,  -- vision_lectora_limit_reached
        false,  -- segunda_oportunidad_limit_reached
        gamilit.now_mexico() - INTERVAL '5 days',
        gamilit.now_mexico() - INTERVAL '5 days' + INTERVAL '10 minutes'
    ),

    -- Record 2: Student 1, Exercise 2 - Used all pistas (limit reached)
    (
        '81111111-1111-1111-1111-111111111002'::uuid,
        v_student1_id,
        v_exercise2_id,
        gen_random_uuid(),
        3,    -- pistas_used (LIMIT REACHED)
        0,    -- vision_lectora_used
        0,    -- segunda_oportunidad_used
        true,   -- pistas_limit_reached
        false,  -- vision_lectora_limit_reached
        false,  -- segunda_oportunidad_limit_reached
        gamilit.now_mexico() - INTERVAL '3 days',
        gamilit.now_mexico() - INTERVAL '3 days' + INTERVAL '15 minutes'
    ),

    -- Record 3: Student 2, Exercise 1 - Used vision_lectora
    (
        '81111111-1111-1111-1111-111111111003'::uuid,
        v_student2_id,
        v_exercise1_id,
        v_attempt2_id,
        1,    -- pistas_used
        1,    -- vision_lectora_used (LIMIT REACHED)
        0,    -- segunda_oportunidad_used
        false,  -- pistas_limit_reached
        true,   -- vision_lectora_limit_reached
        false,  -- segunda_oportunidad_limit_reached
        gamilit.now_mexico() - INTERVAL '4 days',
        gamilit.now_mexico() - INTERVAL '4 days' + INTERVAL '8 minutes'
    ),

    -- Record 4: Student 2, Exercise 3 - Used segunda_oportunidad
    (
        '81111111-1111-1111-1111-111111111004'::uuid,
        v_student2_id,
        v_exercise3_id,
        gen_random_uuid(),
        0,    -- pistas_used
        0,    -- vision_lectora_used
        1,    -- segunda_oportunidad_used (LIMIT REACHED)
        false,  -- pistas_limit_reached
        false,  -- vision_lectora_limit_reached
        true,   -- segunda_oportunidad_limit_reached
        gamilit.now_mexico() - INTERVAL '2 days',
        gamilit.now_mexico() - INTERVAL '2 days' + INTERVAL '20 minutes'
    ),

    -- Record 5: Student 3, Exercise 1 - Used all types
    (
        '81111111-1111-1111-1111-111111111005'::uuid,
        v_student3_id,
        v_exercise1_id,
        v_attempt3_id,
        2,    -- pistas_used
        1,    -- vision_lectora_used (LIMIT)
        1,    -- segunda_oportunidad_used (LIMIT)
        false,  -- pistas_limit_reached (still 1 available)
        true,   -- vision_lectora_limit_reached
        true,   -- segunda_oportunidad_limit_reached
        gamilit.now_mexico() - INTERVAL '1 day',
        gamilit.now_mexico() - INTERVAL '1 day' + INTERVAL '25 minutes'
    ),

    -- Record 6: Student 3, Exercise 2 - Fresh attempt, no comodines yet
    (
        '81111111-1111-1111-1111-111111111006'::uuid,
        v_student3_id,
        v_exercise2_id,
        gen_random_uuid(),
        0,    -- pistas_used
        0,    -- vision_lectora_used
        0,    -- segunda_oportunidad_used
        false,  -- pistas_limit_reached
        false,  -- vision_lectora_limit_reached
        false,  -- segunda_oportunidad_limit_reached
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),

    -- Record 7: Student 1, Exercise 3 - Heavy pistas user
    (
        '81111111-1111-1111-1111-111111111007'::uuid,
        v_student1_id,
        v_exercise3_id,
        gen_random_uuid(),
        3,    -- pistas_used (LIMIT)
        1,    -- vision_lectora_used (LIMIT)
        0,    -- segunda_oportunidad_used
        true,   -- pistas_limit_reached
        true,   -- vision_lectora_limit_reached
        false,  -- segunda_oportunidad_limit_reached
        gamilit.now_mexico() - INTERVAL '6 hours',
        gamilit.now_mexico() - INTERVAL '5 hours'
    ),

    -- Record 8: Student 2, Exercise 2 - Minimal usage
    (
        '81111111-1111-1111-1111-111111111008'::uuid,
        v_student2_id,
        v_exercise2_id,
        gen_random_uuid(),
        1,    -- pistas_used
        0,    -- vision_lectora_used
        0,    -- segunda_oportunidad_used
        false,  -- pistas_limit_reached
        false,  -- vision_lectora_limit_reached
        false,  -- segunda_oportunidad_limit_reached
        gamilit.now_mexico() - INTERVAL '12 hours',
        gamilit.now_mexico() - INTERVAL '11 hours'
    ),

    -- Record 9: Student 3, Exercise 3 - All limits reached
    (
        '81111111-1111-1111-1111-111111111009'::uuid,
        v_student3_id,
        v_exercise3_id,
        gen_random_uuid(),
        3,    -- pistas_used (LIMIT)
        1,    -- vision_lectora_used (LIMIT)
        1,    -- segunda_oportunidad_used (LIMIT)
        true,   -- pistas_limit_reached
        true,   -- vision_lectora_limit_reached
        true,   -- segunda_oportunidad_limit_reached
        gamilit.now_mexico() - INTERVAL '2 hours',
        gamilit.now_mexico() - INTERVAL '1 hour'
    ),

    -- Record 10: Student 1, older attempt
    (
        '81111111-1111-1111-1111-111111111010'::uuid,
        v_student1_id,
        v_exercise1_id,
        gen_random_uuid(),
        1,    -- pistas_used
        1,    -- vision_lectora_used (LIMIT)
        0,    -- segunda_oportunidad_used
        false,  -- pistas_limit_reached
        true,   -- vision_lectora_limit_reached
        false,  -- segunda_oportunidad_limit_reached
        gamilit.now_mexico() - INTERVAL '10 days',
        gamilit.now_mexico() - INTERVAL '10 days' + INTERVAL '12 minutes'
    )

    ON CONFLICT (user_id, exercise_id, attempt_id) DO UPDATE SET
        pistas_used = EXCLUDED.pistas_used,
        vision_lectora_used = EXCLUDED.vision_lectora_used,
        segunda_oportunidad_used = EXCLUDED.segunda_oportunidad_used,
        pistas_limit_reached = EXCLUDED.pistas_limit_reached,
        vision_lectora_limit_reached = EXCLUDED.vision_lectora_limit_reached,
        segunda_oportunidad_limit_reached = EXCLUDED.segunda_oportunidad_limit_reached,
        last_used_at = EXCLUDED.last_used_at;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE '  ✓ Comodin usage records created: %', v_count;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠ Warning: Could not create all comodin usage records: %', SQLERRM;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
    v_total_count INTEGER;
    v_with_pistas INTEGER;
    v_with_vision INTEGER;
    v_with_segunda INTEGER;
    v_all_limits INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total_count FROM gamification_system.comodin_usage_trackings;
    SELECT COUNT(*) INTO v_with_pistas FROM gamification_system.comodin_usage_trackings WHERE pistas_used > 0;
    SELECT COUNT(*) INTO v_with_vision FROM gamification_system.comodin_usage_trackings WHERE vision_lectora_used > 0;
    SELECT COUNT(*) INTO v_with_segunda FROM gamification_system.comodin_usage_trackings WHERE segunda_oportunidad_used > 0;
    SELECT COUNT(*) INTO v_all_limits FROM gamification_system.comodin_usage_trackings
        WHERE pistas_limit_reached AND vision_lectora_limit_reached AND segunda_oportunidad_limit_reached;

    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  SEED COMPLETADO: comodin_usage_tracking';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  Total records: %', v_total_count;
    RAISE NOTICE '  - With pistas used: %', v_with_pistas;
    RAISE NOTICE '  - With vision_lectora used: %', v_with_vision;
    RAISE NOTICE '  - With segunda_oportunidad used: %', v_with_segunda;
    RAISE NOTICE '  - All limits reached: %', v_all_limits;
    RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;
