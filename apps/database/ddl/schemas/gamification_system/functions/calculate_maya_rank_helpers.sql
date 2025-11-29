-- =============================================================================
-- Pure Functions for Maya Rank Calculations
-- =============================================================================
-- Description: Helper functions for rank calculation without database queries
-- Schema: gamification_system
-- Type: FUNCTION (IMMUTABLE - can be inlined and optimized)
-- Created: 2025-11-29
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
-- Rank Thresholds:
--   - Ajaw: 0-999 XP (Level 1)
--   - Nacom: 1,000-2,999 XP (Level 2)
--   - Ah K'in: 3,000-5,999 XP (Level 3)
--   - Halach Uinic: 6,000-9,999 XP (Level 4)
--   - K'uk'ulkan: 10,000+ XP (Level 5, Maximum)
-- =============================================================================

CREATE OR REPLACE FUNCTION gamification_system.calculate_maya_rank_from_xp(xp INTEGER)
RETURNS TEXT AS $$
BEGIN
    IF xp < 1000 THEN
        RETURN 'Ajaw';
    ELSIF xp < 3000 THEN
        RETURN 'Nacom';
    ELSIF xp < 6000 THEN
        RETURN 'Ah K''in';
    ELSIF xp < 10000 THEN
        RETURN 'Halach Uinic';
    ELSE
        RETURN 'K''uk''ulkan';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION gamification_system.calculate_maya_rank_from_xp(INTEGER) IS
    'Pure function: Calculates Maya rank from XP value without database queries.
     IMMUTABLE for query optimization. Thresholds: Ajaw(0), Nacom(1000), Ah K''in(3000),
     Halach Uinic(6000), K''uk''ulkan(10000+).';


-- =============================================================================
-- Function: calculate_rank_progress_percentage
-- =============================================================================
-- Description: Calculates the progress percentage within a rank (0-100)
-- Parameters:
--   xp INTEGER - Current total XP
--   rank TEXT - Current rank name
-- Returns: NUMERIC(5,2) - Progress percentage (0.00 to 100.00)
-- Note: This is a pure function with no database dependencies
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
    -- Calculate XP earned within the current rank
    CASE rank
        WHEN 'Ajaw' THEN
            xp_in_rank := xp;
            rank_size := 1000;
        WHEN 'Nacom' THEN
            xp_in_rank := xp - 1000;
            rank_size := 2000;
        WHEN 'Ah K''in' THEN
            xp_in_rank := xp - 3000;
            rank_size := 3000;
        WHEN 'Halach Uinic' THEN
            xp_in_rank := xp - 6000;
            rank_size := 4000;
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
     IMMUTABLE for query optimization.';


-- =============================================================================
-- Grant permissions
-- =============================================================================

GRANT EXECUTE ON FUNCTION gamification_system.calculate_maya_rank_from_xp(INTEGER) TO gamilit_user;
GRANT EXECUTE ON FUNCTION gamification_system.calculate_rank_progress_percentage(INTEGER, TEXT) TO gamilit_user;
GRANT EXECUTE ON FUNCTION gamification_system.calculate_maya_rank_from_xp(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION gamification_system.calculate_rank_progress_percentage(INTEGER, TEXT) TO authenticated;
