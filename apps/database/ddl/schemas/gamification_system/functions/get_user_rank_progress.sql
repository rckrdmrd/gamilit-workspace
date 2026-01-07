-- Function: gamification_system.get_user_rank_progress
-- Description: Calcula el progreso del usuario hacia el siguiente rango Maya
-- Parameters:
--   - p_user_id: UUID - ID del usuario
-- Returns: TABLE (current_rank, current_xp, next_rank, next_rank_xp, xp_needed, progress_percentage, modules_completed, missions_required)
-- CORRECTED (2025-12-18): missions_completed -> modules_completed (alineado con user_stats entity)
-- FIX (2026-01-04): JOIN con user_ranks ahora filtra por is_current = true
-- Example:
--   SELECT * FROM gamification_system.get_user_rank_progress('123e4567-e89b-12d3-a456-426614174000');
-- Dependencies: gamification_system.user_stats, user_ranks, maya_ranks
-- Created: 2025-10-28
-- Modified: 2026-01-04

CREATE OR REPLACE FUNCTION gamification_system.get_user_rank_progress(
    p_user_id UUID
)
RETURNS TABLE (
    current_rank gamification_system.maya_rank,
    current_xp BIGINT,
    next_rank gamification_system.maya_rank,
    next_rank_xp BIGINT,
    xp_needed BIGINT,
    progress_percentage NUMERIC(5,2),
    modules_completed INTEGER,
    missions_required INTEGER
) AS $$
DECLARE
    v_user_stats RECORD;
    v_current_rank_xp BIGINT;
    v_next_rank RECORD;
BEGIN
    -- Obtener estadísticas del usuario
    -- FIX 2026-01-04: Agregar is_current = true para evitar duplicados
    SELECT us.*, ur.current_rank
    INTO v_user_stats
    FROM gamification_system.user_stats us
    JOIN gamification_system.user_ranks ur ON ur.user_id = us.user_id AND ur.is_current = true
    WHERE us.user_id = p_user_id;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Obtener XP del rango actual
    SELECT min_xp_required INTO v_current_rank_xp
    FROM gamification_system.maya_ranks
    WHERE name = v_user_stats.current_rank::VARCHAR;

    -- Obtener siguiente rango
    SELECT mr.name::gamification_system.maya_rank, mr.min_xp_required, mr.missions_required
    INTO v_next_rank
    FROM gamification_system.maya_ranks mr
    WHERE mr.min_xp_required > v_current_rank_xp
    ORDER BY mr.min_xp_required ASC
    LIMIT 1;

    IF NOT FOUND THEN
        -- Usuario está en rango máximo
        RETURN QUERY SELECT
            v_user_stats.current_rank,
            v_user_stats.total_xp,
            v_user_stats.current_rank,
            v_user_stats.total_xp,
            0::BIGINT,
            100.00::NUMERIC,
            v_user_stats.modules_completed,
            0::INTEGER;
    ELSE
        RETURN QUERY SELECT
            v_user_stats.current_rank,
            v_user_stats.total_xp,
            v_next_rank.name,
            v_next_rank.min_xp_required,
            GREATEST(0, v_next_rank.min_xp_required - v_user_stats.total_xp),
            LEAST(100, (v_user_stats.total_xp - v_current_rank_xp)::NUMERIC /
                  NULLIF(v_next_rank.min_xp_required - v_current_rank_xp, 0) * 100),
            v_user_stats.modules_completed,
            v_next_rank.missions_required;
    END IF;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION gamification_system.get_user_rank_progress(UUID) IS
    'Calcula el progreso del usuario hacia el siguiente rango Maya';

-- Grant permissions
GRANT EXECUTE ON FUNCTION gamification_system.get_user_rank_progress(UUID) TO authenticated;
