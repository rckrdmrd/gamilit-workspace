-- =====================================================================================
-- SEED: Scheduled Missions for Progress Tracking Schema
-- =====================================================================================
-- Description: Scheduled missions for classrooms
-- Dependencies: auth_management.profiles (teachers), social_features.classrooms, gamification_system.mission_templates
-- Idempotency: Uses INSERT with specific IDs to handle re-runs
-- =====================================================================================

SET search_path TO progress_tracking, gamification_system, social_features, auth_management, public;

-- =====================================================================================
-- SCHEDULED MISSIONS
-- =====================================================================================

DO $$
DECLARE
    teacher_id UUID;
    classroom_id UUID;
    mission1_id UUID;
    mission2_id UUID;
    mission3_id UUID;
BEGIN
    -- Get a teacher ID
    SELECT id INTO teacher_id
    FROM auth_management.profiles
    WHERE role = 'admin_teacher'
    LIMIT 1;

    -- Get a classroom ID
    SELECT id INTO classroom_id
    FROM social_features.classrooms
    WHERE is_active = true
    LIMIT 1;

    -- Get mission template IDs
    SELECT id INTO mission1_id
    FROM gamification_system.mission_templates
    LIMIT 1;

    SELECT id INTO mission2_id
    FROM gamification_system.mission_templates
    OFFSET 1 LIMIT 1;

    SELECT id INTO mission3_id
    FROM gamification_system.mission_templates
    OFFSET 2 LIMIT 1;

    IF teacher_id IS NULL OR classroom_id IS NULL THEN
        RAISE NOTICE 'Required data not found. Skipping scheduled missions seed.';
        RETURN;
    END IF;

    -- Use default UUID if no missions exist
    IF mission1_id IS NULL THEN
        mission1_id := gen_random_uuid();
    END IF;
    IF mission2_id IS NULL THEN
        mission2_id := gen_random_uuid();
    END IF;
    IF mission3_id IS NULL THEN
        mission3_id := gen_random_uuid();
    END IF;

    RAISE NOTICE 'Creating scheduled missions...';

    -- Delete existing scheduled missions for this classroom to allow re-runs
    DELETE FROM progress_tracking.scheduled_missions
    WHERE classroom_id = classroom_id
      AND scheduled_by = teacher_id;

    INSERT INTO progress_tracking.scheduled_missions (
        id, mission_id, classroom_id, scheduled_by,
        starts_at, ends_at, is_active,
        bonus_xp, bonus_coins, created_at
    ) VALUES
    -- ================================================================================
    -- Active Mission: Current week challenge
    -- ================================================================================
    (
        gen_random_uuid(),
        mission1_id,
        classroom_id,
        teacher_id,
        NOW() - INTERVAL '2 days', -- started 2 days ago
        NOW() + INTERVAL '5 days', -- ends in 5 days
        true,
        100, -- bonus XP
        50, -- bonus coins
        NOW() - INTERVAL '3 days'
    ),

    -- ================================================================================
    -- Upcoming Mission: Next week challenge
    -- ================================================================================
    (
        gen_random_uuid(),
        mission2_id,
        classroom_id,
        teacher_id,
        NOW() + INTERVAL '5 days', -- starts in 5 days
        NOW() + INTERVAL '12 days', -- ends in 12 days
        true,
        150, -- higher bonus for upcoming
        75,
        NOW() - INTERVAL '1 day'
    ),

    -- ================================================================================
    -- Past Mission: Completed last week
    -- ================================================================================
    (
        gen_random_uuid(),
        mission3_id,
        classroom_id,
        teacher_id,
        NOW() - INTERVAL '14 days', -- started 2 weeks ago
        NOW() - INTERVAL '7 days', -- ended 1 week ago
        false, -- inactive (completed)
        75,
        35,
        NOW() - INTERVAL '15 days'
    );

    RAISE NOTICE 'Scheduled missions created successfully';
    RAISE NOTICE '  - Total missions: 3';
    RAISE NOTICE '  - Active missions: 2';
    RAISE NOTICE '  - Past missions: 1';

END $$;
