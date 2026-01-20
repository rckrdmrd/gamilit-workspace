-- =====================================================================================
-- SEED: Mastery Tracking for Progress Tracking Schema
-- =====================================================================================
-- Description: Topic/concept mastery tracking for demo students
-- Dependencies: auth.users, educational_content.modules
-- Idempotency: Uses ON CONFLICT to handle re-runs safely
-- =====================================================================================

SET search_path TO progress_tracking, educational_content, auth, public;

-- =====================================================================================
-- MASTERY TRACKING
-- =====================================================================================

DO $$
DECLARE
    student1_id UUID;
    student2_id UUID;
    student3_id UUID;
    module1_id UUID;
    module2_id UUID;
    module3_id UUID;
BEGIN
    -- Get demo student IDs
    SELECT id INTO student1_id
    FROM auth.users
    WHERE email = 'estudiante1@demo.glit.edu.mx';

    SELECT id INTO student2_id
    FROM auth.users
    WHERE email = 'estudiante2@demo.glit.edu.mx';

    SELECT id INTO student3_id
    FROM auth.users
    WHERE email = 'estudiante3@demo.glit.edu.mx';

    -- Get module IDs
    SELECT id INTO module1_id
    FROM educational_content.modules
    WHERE module_code = 'MOD-01-LITERAL';

    SELECT id INTO module2_id
    FROM educational_content.modules
    WHERE module_code = 'MOD-02-INFERENCIAL';

    SELECT id INTO module3_id
    FROM educational_content.modules
    WHERE module_code = 'MOD-03-CRITICA';

    IF student1_id IS NULL OR module1_id IS NULL THEN
        RAISE NOTICE 'Demo students or modules not found. Skipping mastery tracking seed.';
        RETURN;
    END IF;

    RAISE NOTICE 'Creating mastery tracking data...';

    INSERT INTO progress_tracking.mastery_tracking (
        user_id, module_id, topic,
        mastery_level, attempts_count, correct_attempts,
        last_attempt_at, mastered_at, status,
        created_at, updated_at
    ) VALUES
    -- ================================================================================
    -- STUDENT 1: Advanced - Mastered several topics
    -- ================================================================================

    -- Module 1 topics
    (
        student1_id, module1_id, 'Identificacion de Ideas Principales',
        95.00, 12, 11,
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '5 days',
        'mastered',
        NOW() - INTERVAL '15 days', NOW() - INTERVAL '5 days'
    ),
    (
        student1_id, module1_id, 'Vocabulario Cientifico',
        92.00, 10, 9,
        NOW() - INTERVAL '6 days',
        NOW() - INTERVAL '6 days',
        'mastered',
        NOW() - INTERVAL '14 days', NOW() - INTERVAL '6 days'
    ),
    (
        student1_id, module1_id, 'Secuencia Cronologica',
        88.00, 8, 7,
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '7 days',
        'mastered',
        NOW() - INTERVAL '12 days', NOW() - INTERVAL '7 days'
    ),

    -- Module 2 topics (in progress)
    (
        student1_id, module2_id, 'Inferencias Textuales',
        78.00, 6, 5,
        NOW() - INTERVAL '1 day',
        NULL,
        'practicing',
        NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day'
    ),
    (
        student1_id, module2_id, 'Motivaciones de Personajes',
        82.00, 5, 4,
        NOW() - INTERVAL '2 days',
        NULL,
        'practicing',
        NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days'
    ),

    -- ================================================================================
    -- STUDENT 2: Intermediate - Some topics mastered
    -- ================================================================================

    -- Module 1 topics
    (
        student2_id, module1_id, 'Identificacion de Ideas Principales',
        85.00, 10, 8,
        NOW() - INTERVAL '12 days',
        NOW() - INTERVAL '12 days',
        'mastered',
        NOW() - INTERVAL '25 days', NOW() - INTERVAL '12 days'
    ),
    (
        student2_id, module1_id, 'Vocabulario Cientifico',
        75.00, 8, 6,
        NOW() - INTERVAL '10 days',
        NULL,
        'practicing',
        NOW() - INTERVAL '20 days', NOW() - INTERVAL '10 days'
    ),

    -- Module 3 topics (learning)
    (
        student2_id, module3_id, 'Evaluacion de Argumentos',
        65.00, 4, 3,
        NOW() - INTERVAL '2 days',
        NULL,
        'learning',
        NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days'
    ),

    -- ================================================================================
    -- STUDENT 3: Foundational - Still learning basics
    -- ================================================================================

    -- Module 1 topics
    (
        student3_id, module1_id, 'Identificacion de Ideas Principales',
        55.00, 8, 4,
        NOW() - INTERVAL '3 days',
        NULL,
        'learning',
        NOW() - INTERVAL '15 days', NOW() - INTERVAL '3 days'
    ),
    (
        student3_id, module1_id, 'Vocabulario Cientifico',
        45.00, 6, 3,
        NOW() - INTERVAL '4 days',
        NULL,
        'needs_review',
        NOW() - INTERVAL '12 days', NOW() - INTERVAL '4 days'
    ),
    (
        student3_id, module1_id, 'Secuencia Cronologica',
        50.00, 5, 2,
        NOW() - INTERVAL '5 days',
        NULL,
        'learning',
        NOW() - INTERVAL '10 days', NOW() - INTERVAL '5 days'
    )
    ON CONFLICT (user_id, module_id, topic) DO UPDATE SET
        mastery_level = EXCLUDED.mastery_level,
        attempts_count = EXCLUDED.attempts_count,
        correct_attempts = EXCLUDED.correct_attempts,
        last_attempt_at = EXCLUDED.last_attempt_at,
        mastered_at = EXCLUDED.mastered_at,
        status = EXCLUDED.status,
        updated_at = NOW();

    RAISE NOTICE 'Mastery tracking data created successfully';
    RAISE NOTICE '  - Total records: 11';
    RAISE NOTICE '  - Mastered topics: 4';
    RAISE NOTICE '  - Practicing topics: 3';
    RAISE NOTICE '  - Learning topics: 3';
    RAISE NOTICE '  - Needs review: 1';

END $$;
