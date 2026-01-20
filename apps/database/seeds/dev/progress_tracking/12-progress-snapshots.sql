-- =====================================================================================
-- SEED: Progress Snapshots for Progress Tracking Schema
-- =====================================================================================
-- Description: Historical progress snapshots for demo students
-- Dependencies: auth.users
-- Idempotency: Uses ON CONFLICT to handle re-runs safely
-- =====================================================================================

SET search_path TO progress_tracking, auth, public;

-- =====================================================================================
-- PROGRESS SNAPSHOTS
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
        RAISE NOTICE 'Demo students not found. Skipping progress snapshots seed.';
        RETURN;
    END IF;

    RAISE NOTICE 'Creating progress snapshots...';

    INSERT INTO progress_tracking.progress_snapshots (
        user_id, snapshot_date, snapshot_data,
        total_modules_completed, total_exercises_completed,
        total_time_spent_seconds, total_xp, current_rank,
        created_at
    ) VALUES
    -- ================================================================================
    -- STUDENT 1: Advanced - Weekly snapshots
    -- ================================================================================

    -- Current week
    (
        student1_id, CURRENT_DATE,
        '{
            "modules": {"completed": 2, "in_progress": 1, "total": 5},
            "exercises": {"completed": 28, "attempted": 32},
            "average_score": 91.5,
            "streak_days": 5,
            "achievements": ["quick_learner", "vocabulary_master", "first_module"],
            "skills": {"lectura_literal": 95, "inferencia": 88, "vocabulario": 92}
        }'::jsonb,
        2, 28,
        36000, -- 10 hours total
        4500,
        'Explorador Maya',
        NOW()
    ),
    -- Last week
    (
        student1_id, CURRENT_DATE - 7,
        '{
            "modules": {"completed": 1, "in_progress": 1, "total": 5},
            "exercises": {"completed": 18, "attempted": 20},
            "average_score": 88.0,
            "streak_days": 4,
            "achievements": ["quick_learner", "first_module"],
            "skills": {"lectura_literal": 85, "inferencia": 75, "vocabulario": 80}
        }'::jsonb,
        1, 18,
        25200,
        3200,
        'Aprendiz Maya',
        NOW() - INTERVAL '7 days'
    ),
    -- Two weeks ago
    (
        student1_id, CURRENT_DATE - 14,
        '{
            "modules": {"completed": 0, "in_progress": 1, "total": 5},
            "exercises": {"completed": 8, "attempted": 10},
            "average_score": 82.0,
            "streak_days": 2,
            "achievements": [],
            "skills": {"lectura_literal": 70, "inferencia": 0, "vocabulario": 65}
        }'::jsonb,
        0, 8,
        10800,
        1200,
        'Iniciado',
        NOW() - INTERVAL '14 days'
    ),

    -- ================================================================================
    -- STUDENT 2: Intermediate - Weekly snapshots
    -- ================================================================================

    -- Current week
    (
        student2_id, CURRENT_DATE,
        '{
            "modules": {"completed": 1, "in_progress": 2, "total": 5},
            "exercises": {"completed": 20, "attempted": 25},
            "average_score": 78.5,
            "streak_days": 2,
            "achievements": ["first_module", "persistent_learner"],
            "skills": {"lectura_literal": 85, "inferencia": 72, "analisis": 65}
        }'::jsonb,
        1, 20,
        28800, -- 8 hours
        2800,
        'Aprendiz Maya',
        NOW()
    ),
    -- Last week
    (
        student2_id, CURRENT_DATE - 7,
        '{
            "modules": {"completed": 1, "in_progress": 1, "total": 5},
            "exercises": {"completed": 15, "attempted": 18},
            "average_score": 75.0,
            "streak_days": 3,
            "achievements": ["first_module"],
            "skills": {"lectura_literal": 80, "inferencia": 68, "analisis": 0}
        }'::jsonb,
        1, 15,
        21600,
        2100,
        'Aprendiz Maya',
        NOW() - INTERVAL '7 days'
    ),

    -- ================================================================================
    -- STUDENT 3: Foundational - Weekly snapshots
    -- ================================================================================

    -- Current week
    (
        student3_id, CURRENT_DATE,
        '{
            "modules": {"completed": 0, "in_progress": 1, "total": 5},
            "exercises": {"completed": 8, "attempted": 15},
            "average_score": 58.0,
            "streak_days": 0,
            "achievements": [],
            "skills": {"lectura_literal": 55, "vocabulario": 45},
            "intervention_needed": true
        }'::jsonb,
        0, 8,
        10800, -- 3 hours
        800,
        'Iniciado',
        NOW()
    ),
    -- Last week
    (
        student3_id, CURRENT_DATE - 7,
        '{
            "modules": {"completed": 0, "in_progress": 1, "total": 5},
            "exercises": {"completed": 5, "attempted": 10},
            "average_score": 52.0,
            "streak_days": 1,
            "achievements": [],
            "skills": {"lectura_literal": 48, "vocabulario": 40},
            "intervention_needed": true
        }'::jsonb,
        0, 5,
        7200,
        500,
        'Iniciado',
        NOW() - INTERVAL '7 days'
    )
    ON CONFLICT (user_id, snapshot_date) DO UPDATE SET
        snapshot_data = EXCLUDED.snapshot_data,
        total_modules_completed = EXCLUDED.total_modules_completed,
        total_exercises_completed = EXCLUDED.total_exercises_completed,
        total_time_spent_seconds = EXCLUDED.total_time_spent_seconds,
        total_xp = EXCLUDED.total_xp,
        current_rank = EXCLUDED.current_rank;

    RAISE NOTICE 'Progress snapshots created successfully';
    RAISE NOTICE '  - Total snapshots: 7';
    RAISE NOTICE '  - Students tracked: 3';

END $$;
