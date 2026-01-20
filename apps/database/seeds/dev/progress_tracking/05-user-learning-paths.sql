-- =====================================================================================
-- SEED: User Learning Paths for Progress Tracking Schema
-- =====================================================================================
-- Description: Learning paths assigned to demo students with progress tracking
-- Dependencies: progress_tracking.learning_paths, auth.users
-- Idempotency: Uses ON CONFLICT to handle re-runs safely
-- =====================================================================================

SET search_path TO progress_tracking, auth, public;

-- =====================================================================================
-- USER LEARNING PATHS
-- =====================================================================================

DO $$
DECLARE
    student1_id UUID;
    student2_id UUID;
    student3_id UUID;
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

    IF student1_id IS NULL OR student2_id IS NULL OR student3_id IS NULL THEN
        RAISE NOTICE 'Demo students not found. Skipping user learning paths seed.';
        RETURN;
    END IF;

    RAISE NOTICE 'Creating user learning path assignments...';

    INSERT INTO progress_tracking.user_learning_paths (
        user_id, learning_path_id,
        enrolled_at, started_at, completed_at,
        completion_percentage, current_module_index, status, updated_at
    ) VALUES
    -- ================================================================================
    -- Student 1: Advanced - Enrolled in Beginner (Completed) and Intermediate (In Progress)
    -- ================================================================================

    -- Beginner path - Completed
    (
        student1_id,
        '11111111-1111-1111-1111-111111111001'::uuid, -- Beginner path
        NOW() - INTERVAL '20 days',
        NOW() - INTERVAL '18 days',
        NOW() - INTERVAL '5 days',
        100.00,
        5, -- completed all modules
        'completed',
        NOW() - INTERVAL '5 days'
    ),

    -- Intermediate path - In Progress
    (
        student1_id,
        '11111111-1111-1111-1111-111111111002'::uuid, -- Intermediate path
        NOW() - INTERVAL '4 days',
        NOW() - INTERVAL '3 days',
        NULL,
        45.50,
        2,
        'in_progress',
        NOW() - INTERVAL '1 hour'
    ),

    -- ================================================================================
    -- Student 2: Intermediate - Enrolled in Beginner (Completed) and Advanced (Just Started)
    -- ================================================================================

    -- Beginner path - Completed
    (
        student2_id,
        '11111111-1111-1111-1111-111111111001'::uuid,
        NOW() - INTERVAL '30 days',
        NOW() - INTERVAL '28 days',
        NOW() - INTERVAL '10 days',
        100.00,
        5,
        'completed',
        NOW() - INTERVAL '10 days'
    ),

    -- Advanced path - In Progress (just started)
    (
        student2_id,
        '11111111-1111-1111-1111-111111111003'::uuid, -- Advanced path
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '2 days',
        NULL,
        15.00,
        1,
        'in_progress',
        NOW() - INTERVAL '2 hours'
    ),

    -- ================================================================================
    -- Student 3: Foundational - Enrolled in Beginner (In Progress)
    -- ================================================================================

    -- Beginner path - In Progress (struggling)
    (
        student3_id,
        '11111111-1111-1111-1111-111111111001'::uuid,
        NOW() - INTERVAL '15 days',
        NOW() - INTERVAL '12 days',
        NULL,
        30.00,
        1,
        'in_progress',
        NOW() - INTERVAL '3 hours'
    )
    ON CONFLICT (user_id, learning_path_id) DO UPDATE SET
        completion_percentage = EXCLUDED.completion_percentage,
        current_module_index = EXCLUDED.current_module_index,
        status = EXCLUDED.status,
        completed_at = EXCLUDED.completed_at,
        updated_at = NOW();

    RAISE NOTICE 'User learning path assignments created successfully';
    RAISE NOTICE '  - Total assignments: 5';
    RAISE NOTICE '  - Completed paths: 2';
    RAISE NOTICE '  - In progress paths: 3';

END $$;
