-- =====================================================================================
-- SEED: Challenge Participants for social_features Schema
-- =====================================================================================
-- Description: Sample challenge participant data linking users to peer challenges
-- Dependencies: social_features.peer_challenges, auth_management.profiles
-- Idempotency: Uses ON CONFLICT to handle re-runs safely
-- Created: 2026-01-20
-- Task: P2-3 (Aumentar cobertura de seeds al 80%)
-- =====================================================================================

SET search_path TO social_features, auth_management, public;

-- =====================================================
-- CHALLENGE PARTICIPANTS
-- =====================================================

DO $$
DECLARE
    v_challenge1_id UUID;
    v_challenge2_id UUID;
    v_challenge3_id UUID;
    v_challenge5_id UUID;
    v_student1_id UUID;
    v_student2_id UUID;
    v_student3_id UUID;
    v_student4_id UUID;
BEGIN
    RAISE NOTICE 'Creating challenge participant records...';

    -- Resolve challenge IDs by title (from 08-peer_challenges.sql)
    SELECT id INTO v_challenge1_id FROM social_features.peer_challenges WHERE title = 'Duelo de Comprension Literal' LIMIT 1;
    SELECT id INTO v_challenge2_id FROM social_features.peer_challenges WHERE title = 'Torneo Inferencias Rapidas' LIMIT 1;
    SELECT id INTO v_challenge3_id FROM social_features.peer_challenges WHERE title = 'Desafio Rapido: Idea Principal' LIMIT 1;
    SELECT id INTO v_challenge5_id FROM social_features.peer_challenges WHERE title = 'Ranking Semanal del Salon 2A' LIMIT 1;

    IF v_challenge1_id IS NULL THEN
        RAISE NOTICE 'Peer challenges not found. Run 08-peer_challenges.sql first. Skipping.';
        RETURN;
    END IF;

    -- Get student IDs
    SELECT id INTO v_student1_id FROM auth_management.profiles
    WHERE role = 'student' AND is_active = true
    ORDER BY created_at LIMIT 1;

    SELECT id INTO v_student2_id FROM auth_management.profiles
    WHERE role = 'student' AND is_active = true
    ORDER BY created_at OFFSET 1 LIMIT 1;

    SELECT id INTO v_student3_id FROM auth_management.profiles
    WHERE role = 'student' AND is_active = true
    ORDER BY created_at OFFSET 2 LIMIT 1;

    SELECT id INTO v_student4_id FROM auth_management.profiles
    WHERE is_active = true
    ORDER BY created_at OFFSET 3 LIMIT 1;

    -- Fallbacks
    IF v_student1_id IS NULL THEN
        SELECT id INTO v_student1_id FROM auth_management.profiles WHERE is_active = true LIMIT 1;
    END IF;
    IF v_student2_id IS NULL THEN
        v_student2_id := v_student1_id;
    END IF;
    IF v_student3_id IS NULL THEN
        v_student3_id := v_student1_id;
    END IF;
    IF v_student4_id IS NULL THEN
        v_student4_id := v_student1_id;
    END IF;

    -- Skip if no users found
    IF v_student1_id IS NULL THEN
        RAISE NOTICE 'No users found. Skipping challenge_participants seed.';
        RETURN;
    END IF;

    INSERT INTO social_features.challenge_participants (
        id,
        challenge_id,
        user_id,
        participation_status,
        score,
        accuracy_percentage,
        completion_percentage,
        exercises_completed,
        started_at,
        completed_at,
        time_spent_seconds,
        rank,
        is_winner,
        xp_earned,
        ml_coins_earned,
        rewards_claimed,
        attempt_id,
        invited_at,
        accepted_at,
        created_at,
        updated_at,
        metadata
    ) VALUES

    -- Challenge 1 participants (Open - creator only)
    (
        gen_random_uuid(),
        v_challenge1_id,
        v_student1_id,
        'accepted',
        0,
        NULL,
        0,
        0,
        NULL,
        NULL,
        NULL,
        NULL,
        false,
        0,
        0,
        false,
        NULL,
        NOW() - INTERVAL '30 minutes',
        NOW() - INTERVAL '30 minutes',
        NOW() - INTERVAL '30 minutes',
        NOW() - INTERVAL '30 minutes',
        jsonb_build_object('is_creator', true)
    ),

    -- Challenge 2 participants (In Progress - 4 participants)
    (
        gen_random_uuid(),
        v_challenge2_id,
        v_student2_id,
        'in_progress',
        65.5,
        82.0,
        70.0,
        7,
        NOW() - INTERVAL '15 minutes',
        NULL,
        900,
        NULL,
        false,
        0,
        0,
        false,
        NULL,
        NOW() - INTERVAL '1 hour',
        NOW() - INTERVAL '50 minutes',
        NOW() - INTERVAL '1 hour',
        NOW() - INTERVAL '5 minutes',
        jsonb_build_object('is_creator', true, 'current_exercise', 8)
    ),
    (
        gen_random_uuid(),
        v_challenge2_id,
        v_student1_id,
        'in_progress',
        72.0,
        85.0,
        75.0,
        8,
        NOW() - INTERVAL '14 minutes',
        NULL,
        840,
        NULL,
        false,
        0,
        0,
        false,
        NULL,
        NOW() - INTERVAL '55 minutes',
        NOW() - INTERVAL '45 minutes',
        NOW() - INTERVAL '55 minutes',
        NOW() - INTERVAL '3 minutes',
        jsonb_build_object('current_exercise', 9)
    ),
    (
        gen_random_uuid(),
        v_challenge2_id,
        v_student3_id,
        'in_progress',
        85.0,
        90.0,
        85.0,
        9,
        NOW() - INTERVAL '14 minutes',
        NULL,
        810,
        NULL,
        false,
        0,
        0,
        false,
        NULL,
        NOW() - INTERVAL '45 minutes',
        NOW() - INTERVAL '40 minutes',
        NOW() - INTERVAL '45 minutes',
        NOW() - INTERVAL '2 minutes',
        jsonb_build_object('current_exercise', 10, 'leading', true)
    ),
    (
        gen_random_uuid(),
        v_challenge2_id,
        v_student4_id,
        'in_progress',
        55.0,
        70.0,
        60.0,
        6,
        NOW() - INTERVAL '13 minutes',
        NULL,
        780,
        NULL,
        false,
        0,
        0,
        false,
        NULL,
        NOW() - INTERVAL '40 minutes',
        NOW() - INTERVAL '35 minutes',
        NOW() - INTERVAL '40 minutes',
        NOW() - INTERVAL '4 minutes',
        jsonb_build_object('current_exercise', 7)
    ),

    -- Challenge 3 participants (Completed)
    (
        gen_random_uuid(),
        v_challenge3_id,
        v_student3_id,
        'completed',
        80.0,
        75.0,
        100.0,
        5,
        NOW() - INTERVAL '3 hours',
        NOW() - INTERVAL '2 hours' - INTERVAL '15 minutes',
        720,
        2,
        false,
        50,
        25,
        true,
        NULL,
        NOW() - INTERVAL '4 hours',
        NOW() - INTERVAL '3 hours' - INTERVAL '30 minutes',
        NOW() - INTERVAL '4 hours',
        NOW() - INTERVAL '2 hours' - INTERVAL '15 minutes',
        jsonb_build_object('final_position', 'runner_up')
    ),
    (
        gen_random_uuid(),
        v_challenge3_id,
        v_student1_id,
        'completed',
        95.0,
        92.0,
        100.0,
        5,
        NOW() - INTERVAL '3 hours',
        NOW() - INTERVAL '2 hours' - INTERVAL '12 minutes',
        600,
        1,
        true,
        113,
        53,
        true,
        NULL,
        NOW() - INTERVAL '3 hours' - INTERVAL '45 minutes',
        NOW() - INTERVAL '3 hours' - INTERVAL '15 minutes',
        NOW() - INTERVAL '3 hours' - INTERVAL '45 minutes',
        NOW() - INTERVAL '2 hours' - INTERVAL '12 minutes',
        jsonb_build_object('final_position', 'winner', 'bonus_applied', 1.5)
    ),

    -- Challenge 5 participants (Leaderboard - in progress, multiple)
    (
        gen_random_uuid(),
        v_challenge5_id,
        v_student2_id,
        'in_progress',
        125.0,
        88.0,
        45.0,
        12,
        NOW() - INTERVAL '2 days',
        NULL,
        3600,
        1,
        false,
        0,
        0,
        false,
        NULL,
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '2 days' - INTERVAL '30 minutes',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '1 hour',
        jsonb_build_object('is_creator', true, 'daily_scores', ARRAY[40, 45, 40])
    ),
    (
        gen_random_uuid(),
        v_challenge5_id,
        v_student1_id,
        'in_progress',
        110.0,
        85.0,
        40.0,
        10,
        NOW() - INTERVAL '2 days' + INTERVAL '2 hours',
        NULL,
        3000,
        2,
        false,
        0,
        0,
        false,
        NULL,
        NOW() - INTERVAL '2 days' - INTERVAL '3 hours',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days' - INTERVAL '3 hours',
        NOW() - INTERVAL '2 hours',
        jsonb_build_object('daily_scores', ARRAY[35, 40, 35])
    ),
    (
        gen_random_uuid(),
        v_challenge5_id,
        v_student3_id,
        'in_progress',
        95.0,
        80.0,
        35.0,
        8,
        NOW() - INTERVAL '1 day' - INTERVAL '20 hours',
        NULL,
        2400,
        3,
        false,
        0,
        0,
        false,
        NULL,
        NOW() - INTERVAL '2 days' - INTERVAL '1 hour',
        NOW() - INTERVAL '1 day' - INTERVAL '20 hours',
        NOW() - INTERVAL '2 days' - INTERVAL '1 hour',
        NOW() - INTERVAL '3 hours',
        jsonb_build_object('daily_scores', ARRAY[45, 50])
    )

    ON CONFLICT (challenge_id, user_id) DO UPDATE SET
        participation_status = EXCLUDED.participation_status,
        score = EXCLUDED.score,
        accuracy_percentage = EXCLUDED.accuracy_percentage,
        completion_percentage = EXCLUDED.completion_percentage,
        exercises_completed = EXCLUDED.exercises_completed,
        rank = EXCLUDED.rank,
        is_winner = EXCLUDED.is_winner,
        xp_earned = EXCLUDED.xp_earned,
        ml_coins_earned = EXCLUDED.ml_coins_earned,
        metadata = EXCLUDED.metadata,
        updated_at = gamilit.now_mexico();

    RAISE NOTICE 'Challenge participants created successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Warning: Could not create all challenge participants: %', SQLERRM;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
    v_total_count INTEGER;
    v_in_progress INTEGER;
    v_completed_count INTEGER;
    v_winners_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total_count FROM social_features.challenge_participants;
    SELECT COUNT(*) INTO v_in_progress FROM social_features.challenge_participants WHERE participation_status = 'in_progress';
    SELECT COUNT(*) INTO v_completed_count FROM social_features.challenge_participants WHERE participation_status = 'completed';
    SELECT COUNT(*) INTO v_winners_count FROM social_features.challenge_participants WHERE is_winner = true;

    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  SEED COMPLETADO: challenge_participants';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  Total participantes: %', v_total_count;
    RAISE NOTICE '  - In Progress: %', v_in_progress;
    RAISE NOTICE '  - Completed: %', v_completed_count;
    RAISE NOTICE '  - Winners: %', v_winners_count;
    RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;
