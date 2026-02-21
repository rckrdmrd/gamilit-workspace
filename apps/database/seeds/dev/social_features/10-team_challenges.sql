-- =====================================================================================
-- SEED: Team Challenges for social_features Schema
-- =====================================================================================
-- Description: Challenge assignments for teams to compete collectively
-- Dependencies: 04-teams.sql, 08-peer_challenges.sql
-- Idempotency: Uses ON CONFLICT to handle re-runs safely
-- Created: 2026-01-27
-- Task: TASK-P1-SEEDS-SOCIAL-2026-01-27
-- Gap: SEED-P1-002
--
-- PIPELINE STATUS: NOT IN init-database.sh pipeline.
-- Este archivo NO se ejecuta automaticamente durante init-database.sh.
-- Sera agregado al pipeline cuando el modulo social de Team Challenges
-- tenga integracion frontend completa (actualmente backend-only, 9 endpoints).
-- Ver: TASK-2026-02-20-UUID-AUDIT P3-4
-- =====================================================================================

SET search_path TO social_features, auth_management, public;

-- =====================================================
-- TEAM CHALLENGES
-- =====================================================

DO $$
DECLARE
    v_team_cientificos UUID;
    v_team_exploradores UUID;
    v_team_pioneros UUID;
    v_team_innovadores UUID;
    v_challenge_tournament UUID;
    v_challenge_leaderboard UUID;
    v_challenge_multiplayer UUID;
BEGIN
    RAISE NOTICE 'Creating team challenge records...';

    -- =====================================================
    -- Get Team IDs
    -- =====================================================
    SELECT team_id INTO v_team_cientificos
    FROM social_features.teams
    WHERE code = 'TEAM-CIENT-2A' OR name ILIKE '%Científicos%'
    LIMIT 1;

    SELECT team_id INTO v_team_exploradores
    FROM social_features.teams
    WHERE code = 'TEAM-EXPLO-3B' OR name ILIKE '%Exploradores%'
    LIMIT 1;

    SELECT team_id INTO v_team_pioneros
    FROM social_features.teams
    WHERE code = 'TEAM-PION-1A' OR name ILIKE '%Pioneros%'
    LIMIT 1;

    SELECT team_id INTO v_team_innovadores
    FROM social_features.teams
    WHERE code = 'TEAM-INNOV-2ST' OR name ILIKE '%Innovadores%'
    LIMIT 1;

    -- Fallbacks if teams not found
    IF v_team_cientificos IS NULL THEN
        SELECT team_id INTO v_team_cientificos FROM social_features.teams LIMIT 1;
    END IF;
    IF v_team_exploradores IS NULL THEN
        v_team_exploradores := v_team_cientificos;
    END IF;
    IF v_team_pioneros IS NULL THEN
        v_team_pioneros := v_team_cientificos;
    END IF;
    IF v_team_innovadores IS NULL THEN
        v_team_innovadores := v_team_cientificos;
    END IF;

    -- Skip if no teams exist
    IF v_team_cientificos IS NULL THEN
        RAISE NOTICE 'No teams found. Skipping team_challenges seed.';
        RETURN;
    END IF;

    -- =====================================================
    -- Get Challenge IDs from peer_challenges
    -- =====================================================
    SELECT id INTO v_challenge_tournament
    FROM social_features.peer_challenges
    WHERE challenge_type = 'tournament' AND status IN ('open', 'in_progress')
    LIMIT 1;

    SELECT id INTO v_challenge_leaderboard
    FROM social_features.peer_challenges
    WHERE challenge_type = 'leaderboard' AND status IN ('open', 'in_progress')
    LIMIT 1;

    SELECT id INTO v_challenge_multiplayer
    FROM social_features.peer_challenges
    WHERE challenge_type = 'multiplayer' AND status IN ('open', 'in_progress')
    LIMIT 1;

    -- Skip if no peer_challenges exist (required FK dependency)
    IF v_challenge_tournament IS NULL AND v_challenge_leaderboard IS NULL AND v_challenge_multiplayer IS NULL THEN
        RAISE NOTICE 'No peer challenges found. Run 08-peer_challenges.sql first. Skipping.';
        RETURN;
    END IF;
    -- Fallback to any available challenge
    IF v_challenge_tournament IS NULL THEN v_challenge_tournament := COALESCE(v_challenge_leaderboard, v_challenge_multiplayer); END IF;
    IF v_challenge_leaderboard IS NULL THEN v_challenge_leaderboard := COALESCE(v_challenge_tournament, v_challenge_multiplayer); END IF;
    IF v_challenge_multiplayer IS NULL THEN v_challenge_multiplayer := COALESCE(v_challenge_tournament, v_challenge_leaderboard); END IF;

    -- =====================================================
    -- INSERT TEAM CHALLENGES
    -- =====================================================
    INSERT INTO social_features.team_challenges (
        id,
        team_id,
        challenge_id,
        status,
        started_at,
        completed_at,
        score
    ) VALUES

    -- Team Challenge 1: Los Científicos - Active tournament
    (
        gen_random_uuid(),
        v_team_cientificos,
        v_challenge_tournament,
        'active',
        gamilit.now_mexico(),
        NULL,
        0
    ),

    -- Team Challenge 2: Exploradores Digitales - In progress leaderboard
    (
        gen_random_uuid(),
        v_team_exploradores,
        v_challenge_leaderboard,
        'in_progress',
        gamilit.now_mexico() - INTERVAL '5 days',
        NULL,
        185
    ),

    -- Team Challenge 3: Pioneros Técnicos - Completed challenge
    (
        gen_random_uuid(),
        v_team_pioneros,
        v_challenge_multiplayer,
        'completed',
        gamilit.now_mexico() - INTERVAL '7 days',
        gamilit.now_mexico() - INTERVAL '5 days',
        420
    ),

    -- Team Challenge 4: Innovadores STEAM - In progress tournament
    (
        gen_random_uuid(),
        v_team_innovadores,
        v_challenge_tournament,
        'in_progress',
        gamilit.now_mexico() - INTERVAL '2 days',
        NULL,
        275
    ),

    -- Team Challenge 5: Los Científicos - Completed leaderboard (monthly)
    (
        gen_random_uuid(),
        v_team_cientificos,
        v_challenge_leaderboard,
        'completed',
        gamilit.now_mexico() - INTERVAL '30 days',
        gamilit.now_mexico() - INTERVAL '1 day',
        850
    ),

    -- Team Challenge 6: Exploradores - Failed challenge
    (
        gen_random_uuid(),
        v_team_exploradores,
        v_challenge_multiplayer,
        'failed',
        gamilit.now_mexico() - INTERVAL '14 days',
        gamilit.now_mexico() - INTERVAL '12 days',
        95
    ),

    -- Team Challenge 7: Pioneros - Active new challenge
    (
        gen_random_uuid(),
        v_team_pioneros,
        v_challenge_leaderboard,
        'active',
        gamilit.now_mexico(),
        NULL,
        0
    )

    ON CONFLICT (team_id, challenge_id) DO UPDATE SET
        status = EXCLUDED.status,
        score = EXCLUDED.score,
        completed_at = EXCLUDED.completed_at;

    RAISE NOTICE 'Team challenges created successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Warning: Could not create all team challenges: %', SQLERRM;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
    v_total_count INTEGER;
    v_active_count INTEGER;
    v_in_progress INTEGER;
    v_completed_count INTEGER;
    v_failed_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total_count FROM social_features.team_challenges;
    SELECT COUNT(*) INTO v_active_count FROM social_features.team_challenges WHERE status = 'active';
    SELECT COUNT(*) INTO v_in_progress FROM social_features.team_challenges WHERE status = 'in_progress';
    SELECT COUNT(*) INTO v_completed_count FROM social_features.team_challenges WHERE status = 'completed';
    SELECT COUNT(*) INTO v_failed_count FROM social_features.team_challenges WHERE status = 'failed';

    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  SEED COMPLETADO: team_challenges';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  Total team challenges: %', v_total_count;
    RAISE NOTICE '  - Active: %', v_active_count;
    RAISE NOTICE '  - In Progress: %', v_in_progress;
    RAISE NOTICE '  - Completed: %', v_completed_count;
    RAISE NOTICE '  - Failed: %', v_failed_count;
    RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;
