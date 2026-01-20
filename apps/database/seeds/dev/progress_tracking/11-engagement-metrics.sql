-- =====================================================================================
-- SEED: Engagement Metrics for Progress Tracking Schema
-- =====================================================================================
-- Description: Daily engagement metrics for demo students
-- Dependencies: auth.users
-- Idempotency: Uses ON CONFLICT to handle re-runs safely
-- =====================================================================================

SET search_path TO progress_tracking, auth, public;

-- =====================================================================================
-- ENGAGEMENT METRICS
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
        RAISE NOTICE 'Demo students not found. Skipping engagement metrics seed.';
        RETURN;
    END IF;

    RAISE NOTICE 'Creating engagement metrics data...';

    INSERT INTO progress_tracking.engagement_metrics (
        user_id, metric_date, daily_active,
        sessions_count, total_time_seconds,
        exercises_attempted, exercises_completed,
        modules_started, modules_completed,
        achievements_unlocked, social_interactions,
        engagement_score, created_at, updated_at
    ) VALUES
    -- ================================================================================
    -- STUDENT 1: High engagement - Last 5 days
    -- ================================================================================

    -- Today
    (
        student1_id, CURRENT_DATE, true,
        2, 3600, -- 1 hour
        5, 4,
        0, 0,
        1, 3,
        85.50,
        NOW(), NOW()
    ),
    -- Yesterday
    (
        student1_id, CURRENT_DATE - 1, true,
        3, 5400, -- 1.5 hours
        8, 7,
        1, 0,
        2, 5,
        92.00,
        NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
    ),
    -- 2 days ago
    (
        student1_id, CURRENT_DATE - 2, true,
        2, 2700, -- 45 min
        4, 4,
        0, 1,
        1, 2,
        78.00,
        NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
    ),
    -- 3 days ago
    (
        student1_id, CURRENT_DATE - 3, true,
        1, 1800, -- 30 min
        3, 3,
        0, 0,
        0, 1,
        65.00,
        NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'
    ),
    -- 4 days ago
    (
        student1_id, CURRENT_DATE - 4, true,
        2, 4200, -- 70 min
        6, 5,
        0, 0,
        1, 4,
        88.00,
        NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'
    ),

    -- ================================================================================
    -- STUDENT 2: Moderate engagement - Last 5 days
    -- ================================================================================

    -- Today
    (
        student2_id, CURRENT_DATE, true,
        1, 2400, -- 40 min
        3, 2,
        0, 0,
        0, 1,
        62.00,
        NOW(), NOW()
    ),
    -- Yesterday
    (
        student2_id, CURRENT_DATE - 1, true,
        2, 3000, -- 50 min
        4, 3,
        1, 0,
        1, 2,
        70.50,
        NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
    ),
    -- 2 days ago (inactive)
    (
        student2_id, CURRENT_DATE - 2, false,
        0, 0,
        0, 0,
        0, 0,
        0, 0,
        0.00,
        NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
    ),
    -- 3 days ago
    (
        student2_id, CURRENT_DATE - 3, true,
        1, 1500, -- 25 min
        2, 1,
        0, 0,
        0, 0,
        45.00,
        NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'
    ),
    -- 4 days ago
    (
        student2_id, CURRENT_DATE - 4, true,
        2, 2700, -- 45 min
        4, 3,
        0, 0,
        1, 1,
        68.00,
        NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'
    ),

    -- ================================================================================
    -- STUDENT 3: Low engagement - Last 5 days (needs intervention)
    -- ================================================================================

    -- Today (inactive)
    (
        student3_id, CURRENT_DATE, false,
        0, 0,
        0, 0,
        0, 0,
        0, 0,
        0.00,
        NOW(), NOW()
    ),
    -- Yesterday
    (
        student3_id, CURRENT_DATE - 1, true,
        1, 900, -- 15 min
        2, 1,
        0, 0,
        0, 0,
        25.00,
        NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
    ),
    -- 2 days ago (inactive)
    (
        student3_id, CURRENT_DATE - 2, false,
        0, 0,
        0, 0,
        0, 0,
        0, 0,
        0.00,
        NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
    ),
    -- 3 days ago (inactive)
    (
        student3_id, CURRENT_DATE - 3, false,
        0, 0,
        0, 0,
        0, 0,
        0, 0,
        0.00,
        NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'
    ),
    -- 4 days ago
    (
        student3_id, CURRENT_DATE - 4, true,
        1, 1200, -- 20 min
        2, 0,
        0, 0,
        0, 0,
        30.00,
        NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'
    )
    ON CONFLICT (user_id, metric_date) DO UPDATE SET
        daily_active = EXCLUDED.daily_active,
        sessions_count = EXCLUDED.sessions_count,
        total_time_seconds = EXCLUDED.total_time_seconds,
        exercises_attempted = EXCLUDED.exercises_attempted,
        exercises_completed = EXCLUDED.exercises_completed,
        engagement_score = EXCLUDED.engagement_score,
        updated_at = NOW();

    RAISE NOTICE 'Engagement metrics data created successfully';
    RAISE NOTICE '  - Total records: 15';
    RAISE NOTICE '  - Days covered: 5';
    RAISE NOTICE '  - Students tracked: 3';

END $$;
