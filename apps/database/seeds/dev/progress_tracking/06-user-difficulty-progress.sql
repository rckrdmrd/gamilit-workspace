-- =====================================================================================
-- SEED: User Difficulty Progress for Progress Tracking Schema
-- =====================================================================================
-- Description: CEFR difficulty level progress tracking for demo students
-- Dependencies: auth.users, educational_content.difficulty_level enum
-- Idempotency: Uses ON CONFLICT to handle re-runs safely
-- =====================================================================================

SET search_path TO progress_tracking, educational_content, auth, public;

-- =====================================================================================
-- USER DIFFICULTY PROGRESS
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
        RAISE NOTICE 'Demo students not found. Skipping user difficulty progress seed.';
        RETURN;
    END IF;

    RAISE NOTICE 'Creating user difficulty progress data...';

    INSERT INTO progress_tracking.user_difficulty_progress (
        user_id, difficulty_level,
        exercises_attempted, exercises_completed, exercises_correct_first_attempt,
        total_time_spent_seconds,
        is_ready_for_promotion, promoted_at,
        first_attempt_at, last_attempt_at, created_at, updated_at
    ) VALUES
    -- ================================================================================
    -- STUDENT 1: Advanced Student - Ready for promotion to next level
    -- ================================================================================

    -- Beginner level - Mastered and promoted
    (
        student1_id, 'beginner',
        25, 25, 22, -- 88% success rate
        7200, -- 2 hours total
        true, NOW() - INTERVAL '10 days', -- promoted
        NOW() - INTERVAL '20 days',
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '20 days',
        NOW() - INTERVAL '10 days'
    ),

    -- Elementary level - In progress, doing well
    (
        student1_id, 'elementary',
        15, 14, 11, -- 73% success rate
        5400, -- 1.5 hours
        false, NULL,
        NOW() - INTERVAL '8 days',
        NOW() - INTERVAL '1 hour',
        NOW() - INTERVAL '8 days',
        NOW() - INTERVAL '1 hour'
    ),

    -- ================================================================================
    -- STUDENT 2: Intermediate Student - Good progress
    -- ================================================================================

    -- Beginner level - Mastered and promoted
    (
        student2_id, 'beginner',
        20, 20, 16, -- 80% success rate
        6000, -- 1.67 hours
        true, NOW() - INTERVAL '15 days',
        NOW() - INTERVAL '30 days',
        NOW() - INTERVAL '15 days',
        NOW() - INTERVAL '30 days',
        NOW() - INTERVAL '15 days'
    ),

    -- Elementary level - In progress
    (
        student2_id, 'elementary',
        10, 8, 6, -- 60% success rate
        3600, -- 1 hour
        false, NULL,
        NOW() - INTERVAL '12 days',
        NOW() - INTERVAL '3 hours',
        NOW() - INTERVAL '12 days',
        NOW() - INTERVAL '3 hours'
    ),

    -- ================================================================================
    -- STUDENT 3: Foundational Student - Needs more support
    -- ================================================================================

    -- Beginner level - Still working on it
    (
        student3_id, 'beginner',
        12, 8, 5, -- 41% success rate (needs support)
        4800, -- 1.33 hours
        false, NULL,
        NOW() - INTERVAL '15 days',
        NOW() - INTERVAL '5 hours',
        NOW() - INTERVAL '15 days',
        NOW() - INTERVAL '5 hours'
    )
    ON CONFLICT (user_id, difficulty_level) DO UPDATE SET
        exercises_attempted = EXCLUDED.exercises_attempted,
        exercises_completed = EXCLUDED.exercises_completed,
        exercises_correct_first_attempt = EXCLUDED.exercises_correct_first_attempt,
        total_time_spent_seconds = EXCLUDED.total_time_spent_seconds,
        is_ready_for_promotion = EXCLUDED.is_ready_for_promotion,
        promoted_at = EXCLUDED.promoted_at,
        last_attempt_at = EXCLUDED.last_attempt_at,
        updated_at = NOW();

    RAISE NOTICE 'User difficulty progress data created successfully';
    RAISE NOTICE '  - Total records: 5';
    RAISE NOTICE '  - Promoted levels: 2';

END $$;
