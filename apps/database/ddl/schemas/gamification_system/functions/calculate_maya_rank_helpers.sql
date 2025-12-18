-- =============================================================================
-- Pure Functions for Maya Rank Calculations
-- =============================================================================
-- Description: Helper functions for rank calculation without database queries
-- Schema: gamification_system
-- Type: FUNCTION (IMMUTABLE - can be inlined and optimized)
-- Created: 2025-11-29
-- Updated: 2025-12-14 (v2.1 - Sync with 03-maya_ranks.sql seeds)
-- Origin: Integrated from P0-001-migrate-maya-rank-values.sql
-- =============================================================================

-- =============================================================================
-- Function: calculate_maya_rank_from_xp
-- =============================================================================
-- Description: Calculates the correct Maya rank based on total XP value
-- Parameters: xp INTEGER - The total XP value
-- Returns: TEXT - The Maya rank name
-- Note: This is a pure function with no database dependencies
--
-- Rank Thresholds v2.1 (synced with 03-maya_ranks.sql):
--   - Ajaw: 0-499 XP (Level 1)
--   - Nacom: 500-999 XP (Level 2)
--   - Ah K'in: 1,000-1,499 XP (Level 3)
--   - Halach Uinic: 1,500-1,899 XP (Level 4)
--   - K'uk'ulkan: 1,900+ XP (Level 5, Maximum)
-- =============================================================================

CREATE OR REPLACE FUNCTION gamification_system.calculate_maya_rank_from_xp(xp INTEGER)
RETURNS TEXT AS $$
BEGIN
    -- v2.1 thresholds (synced with 03-maya_ranks.sql seeds)
    IF xp < 500 THEN
        RETURN 'Ajaw';
    ELSIF xp < 1000 THEN
        RETURN 'Nacom';
    ELSIF xp < 1500 THEN
        RETURN 'Ah K''in';
    ELSIF xp < 1900 THEN
        RETURN 'Halach Uinic';
    ELSE
        RETURN 'K''uk''ulkan';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION gamification_system.calculate_maya_rank_from_xp(INTEGER) IS
    'Pure function: Calculates Maya rank from XP value without database queries.
     IMMUTABLE for query optimization. v2.1 Thresholds: Ajaw(0-499), Nacom(500-999),
     Ah K''in(1000-1499), Halach Uinic(1500-1899), K''uk''ulkan(1900+).';


-- =============================================================================
-- Function: calculate_rank_progress_percentage
-- =============================================================================
-- Description: Calculates the progress percentage within a rank (0-100)
-- Parameters:
--   xp INTEGER - Current total XP
--   rank TEXT - Current rank name
-- Returns: NUMERIC(5,2) - Progress percentage (0.00 to 100.00)
-- Note: This is a pure function with no database dependencies
-- Updated: 2025-12-14 (v2.1 - Sync with 03-maya_ranks.sql seeds)
-- =============================================================================

CREATE OR REPLACE FUNCTION gamification_system.calculate_rank_progress_percentage(
    xp INTEGER,
    rank TEXT
)
RETURNS NUMERIC(5,2) AS $$
DECLARE
    xp_in_rank INTEGER;
    rank_size INTEGER;
BEGIN
    -- Calculate XP earned within the current rank (v2.1 thresholds)
    CASE rank
        WHEN 'Ajaw' THEN
            xp_in_rank := xp;           -- 0-499 XP
            rank_size := 500;
        WHEN 'Nacom' THEN
            xp_in_rank := xp - 500;     -- 500-999 XP
            rank_size := 500;
        WHEN 'Ah K''in' THEN
            xp_in_rank := xp - 1000;    -- 1000-1499 XP
            rank_size := 500;
        WHEN 'Halach Uinic' THEN
            xp_in_rank := xp - 1500;    -- 1500-1899 XP
            rank_size := 400;
        WHEN 'K''uk''ulkan' THEN
            -- Maximum rank always shows 100%
            RETURN 100.00;
        ELSE
            -- Unknown rank, return 0
            RETURN 0.00;
    END CASE;

    -- Calculate percentage (0-100)
    IF rank_size > 0 THEN
        RETURN LEAST(100.00, (xp_in_rank::NUMERIC / rank_size::NUMERIC) * 100);
    ELSE
        RETURN 0.00;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION gamification_system.calculate_rank_progress_percentage(INTEGER, TEXT) IS
    'Pure function: Calculates percentage progress within a Maya rank.
     Returns 0-100 based on XP earned within the rank. Maximum rank returns 100%.
     v2.1 thresholds: Ajaw(500), Nacom(500), Ah K''in(500), Halach Uinic(400).
     IMMUTABLE for query optimization.';


-- =============================================================================
-- Grant permissions
-- =============================================================================

GRANT EXECUTE ON FUNCTION gamification_system.calculate_maya_rank_from_xp(INTEGER) TO gamilit_user;
GRANT EXECUTE ON FUNCTION gamification_system.calculate_rank_progress_percentage(INTEGER, TEXT) TO gamilit_user;
GRANT EXECUTE ON FUNCTION gamification_system.calculate_maya_rank_from_xp(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION gamification_system.calculate_rank_progress_percentage(INTEGER, TEXT) TO authenticated;
