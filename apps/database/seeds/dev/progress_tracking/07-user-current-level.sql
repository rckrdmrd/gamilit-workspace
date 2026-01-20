-- =====================================================================================
-- SEED: User Current Level for Progress Tracking Schema
-- =====================================================================================
-- Description: Current difficulty level for demo students (denormalized for performance)
-- Dependencies: auth.users, educational_content.difficulty_level enum
-- Idempotency: Uses ON CONFLICT to handle re-runs safely
-- =====================================================================================

SET search_path TO progress_tracking, educational_content, auth, public;

-- =====================================================================================
-- USER CURRENT LEVEL
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

    IF student1_id IS NULL THEN
        RAISE NOTICE 'Demo students not found. Skipping user current level seed.';
        RETURN;
    END IF;

    RAISE NOTICE 'Creating user current level data...';

    INSERT INTO progress_tracking.user_current_level (
        user_id, current_level, previous_level, max_allowed_level,
        placement_test_completed, placement_test_score, placement_test_date,
        level_changed_at, created_at, updated_at
    ) VALUES
    -- ================================================================================
    -- STUDENT 1: Advanced Student - Currently at elementary, progressing well
    -- ================================================================================
    (
        student1_id,
        'elementary', -- current level
        'beginner', -- previous level
        'intermediate', -- max allowed (ZDP)
        true, -- completed placement test
        78.50, -- placement test score
        NOW() - INTERVAL '20 days',
        NOW() - INTERVAL '10 days', -- level changed
        NOW() - INTERVAL '20 days',
        NOW() - INTERVAL '10 days'
    ),

    -- ================================================================================
    -- STUDENT 2: Intermediate Student - Currently at elementary
    -- ================================================================================
    (
        student2_id,
        'elementary',
        'beginner',
        'intermediate',
        true,
        72.00,
        NOW() - INTERVAL '30 days',
        NOW() - INTERVAL '15 days',
        NOW() - INTERVAL '30 days',
        NOW() - INTERVAL '15 days'
    ),

    -- ================================================================================
    -- STUDENT 3: Foundational Student - Still at beginner level
    -- ================================================================================
    (
        student3_id,
        'beginner',
        NULL, -- no previous level
        'elementary', -- max allowed (ZDP)
        true,
        55.00, -- lower placement score
        NOW() - INTERVAL '15 days',
        NULL, -- level hasn't changed yet
        NOW() - INTERVAL '15 days',
        NOW() - INTERVAL '5 days'
    )
    ON CONFLICT (user_id) DO UPDATE SET
        current_level = EXCLUDED.current_level,
        previous_level = EXCLUDED.previous_level,
        max_allowed_level = EXCLUDED.max_allowed_level,
        placement_test_score = EXCLUDED.placement_test_score,
        level_changed_at = EXCLUDED.level_changed_at,
        updated_at = NOW();

    RAISE NOTICE 'User current level data created successfully';
    RAISE NOTICE '  - Total records: 3';
    RAISE NOTICE '  - With placement test: 3';

END $$;
