-- =====================================================================================
-- SEED: Team Challenges for social_features Schema (PROD - Minimal)
-- =====================================================================================
-- Description: Minimal team challenge data for production
-- Dependencies: teams, peer_challenges
-- Created: 2026-01-27
-- Task: TASK-P1-SEEDS-SOCIAL-2026-01-27
-- =====================================================================================

SET search_path TO social_features, public;

-- =====================================================
-- TEAM CHALLENGES (Production - Minimal)
-- =====================================================
-- Note: In production, team_challenges are created dynamically
-- when teams join competitions. This seed is empty intentionally.
-- The table structure supports runtime data.

DO $$
BEGIN
    RAISE NOTICE 'team_challenges table ready for production use.';
    RAISE NOTICE 'Records will be created when teams join challenges.';
END $$;
