-- =====================================================================================
-- SEED: Module Completion Tracking for Progress Tracking Schema
-- =====================================================================================
-- Description: Detailed module completion tracking for demo students
-- Dependencies: auth.users, educational_content.modules
-- Idempotency: Uses ON CONFLICT to handle re-runs safely
-- =====================================================================================

SET search_path TO progress_tracking, educational_content, auth, public;

-- =====================================================================================
-- MODULE COMPLETION TRACKING
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
        RAISE NOTICE 'Demo students or modules not found. Skipping module completion tracking seed.';
        RETURN;
    END IF;

    RAISE NOTICE 'Creating module completion tracking data...';

    INSERT INTO progress_tracking.module_completion_tracking (
        user_id, module_id,
        completion_percentage, exercises_completed, exercises_total,
        time_spent_seconds,
        started_at, completed_at, last_activity_at,
        status, created_at, updated_at
    ) VALUES
    -- ================================================================================
    -- STUDENT 1: Advanced - Module 1 completed, Module 2 in progress
    -- ================================================================================

    -- Module 1: Completed (Mastered)
    (
        student1_id, module1_id,
        100.00, 10, 10,
        16200, -- 4.5 hours
        NOW() - INTERVAL '20 days',
        NOW() - INTERVAL '8 days',
        NOW() - INTERVAL '8 days',
        'mastered',
        NOW() - INTERVAL '20 days', NOW() - INTERVAL '8 days'
    ),

    -- Module 2: In Progress (60%)
    (
        student1_id, module2_id,
        60.00, 6, 10,
        10800, -- 3 hours
        NOW() - INTERVAL '5 days',
        NULL,
        NOW() - INTERVAL '2 hours',
        'in_progress',
        NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 hours'
    ),

    -- ================================================================================
    -- STUDENT 2: Intermediate - Module 1 completed, Module 3 started
    -- ================================================================================

    -- Module 1: Completed
    (
        student2_id, module1_id,
        100.00, 10, 10,
        21600, -- 6 hours
        NOW() - INTERVAL '30 days',
        NOW() - INTERVAL '15 days',
        NOW() - INTERVAL '15 days',
        'completed',
        NOW() - INTERVAL '30 days', NOW() - INTERVAL '15 days'
    ),

    -- Module 3: In Progress (35%)
    (
        student2_id, module3_id,
        35.00, 3, 8,
        7200, -- 2 hours
        NOW() - INTERVAL '4 days',
        NULL,
        NOW() - INTERVAL '3 hours',
        'in_progress',
        NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 hours'
    ),

    -- ================================================================================
    -- STUDENT 3: Foundational - Module 1 in progress (struggling)
    -- ================================================================================

    -- Module 1: In Progress (40%)
    (
        student3_id, module1_id,
        40.00, 4, 10,
        12600, -- 3.5 hours (more time, less progress)
        NOW() - INTERVAL '15 days',
        NULL,
        NOW() - INTERVAL '6 hours',
        'in_progress',
        NOW() - INTERVAL '15 days', NOW() - INTERVAL '6 hours'
    )
    ON CONFLICT (user_id, module_id) DO UPDATE SET
        completion_percentage = EXCLUDED.completion_percentage,
        exercises_completed = EXCLUDED.exercises_completed,
        exercises_total = EXCLUDED.exercises_total,
        time_spent_seconds = EXCLUDED.time_spent_seconds,
        completed_at = EXCLUDED.completed_at,
        last_activity_at = EXCLUDED.last_activity_at,
        status = EXCLUDED.status,
        updated_at = NOW();

    RAISE NOTICE 'Module completion tracking data created successfully';
    RAISE NOTICE '  - Total records: 5';
    RAISE NOTICE '  - Completed modules: 2';
    RAISE NOTICE '  - Mastered modules: 1';
    RAISE NOTICE '  - In progress modules: 2';

END $$;
