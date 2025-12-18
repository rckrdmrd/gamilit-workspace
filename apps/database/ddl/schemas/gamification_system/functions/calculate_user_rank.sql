-- Nombre: calculate_user_rank
-- Descripción: Calcula el rango actual del usuario basado en XP total y módulos completados
-- Schema: gamification_system
-- Tipo: FUNCTION
--
-- CHANGELOG:
--   2025-12-15: CORR-P0-001 - Cambiar missions_completed → modules_completed
--               (missions_completed no existe en tabla user_stats)

CREATE OR REPLACE FUNCTION gamification_system.calculate_user_rank(p_user_id UUID)
RETURNS TABLE (
    user_id UUID,
    current_rank VARCHAR,
    next_rank VARCHAR,
    xp_to_next_rank BIGINT,
    modules_to_next_rank INTEGER,  -- Renombrado: missions → modules
    rank_percentage NUMERIC(5,2)
) AS $$
DECLARE
    v_total_xp BIGINT;
    v_modules_completed INTEGER;  -- Renombrado: missions → modules
    v_current_rank VARCHAR;
    v_next_rank VARCHAR;
    v_next_rank_xp BIGINT;
    v_next_rank_modules INTEGER;  -- Renombrado: missions → modules
BEGIN
    -- Obtener estadísticas del usuario
    -- CORR-P0-001: Usar modules_completed en lugar de missions_completed (columna no existe)
    -- FIX: Usar alias 'us' para evitar ambigüedad con output column 'user_id'
    SELECT us.total_xp, us.modules_completed INTO v_total_xp, v_modules_completed
    FROM gamification_system.user_stats us
    WHERE us.user_id = p_user_id;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Determinar rango actual basado en XP
    -- FIX: Usar alias 'ur' para evitar ambigüedad
    SELECT ur.current_rank INTO v_current_rank
    FROM gamification_system.user_ranks ur
    WHERE ur.user_id = p_user_id
    AND ur.is_current = true;

    -- Obtener siguiente rango desde maya_ranks
    -- NOTA: Columna correcta es rank_name (ENUM maya_rank), no name
    SELECT rank_name::VARCHAR, min_xp_required, COALESCE(modules_required, 0)
    INTO v_next_rank, v_next_rank_xp, v_next_rank_modules
    FROM gamification_system.maya_ranks
    WHERE rank_name::VARCHAR > COALESCE(v_current_rank, 'Ajaw')
    ORDER BY min_xp_required ASC
    LIMIT 1;

    IF v_next_rank IS NULL THEN
        -- Usuario está en rango máximo
        v_next_rank := v_current_rank;
        v_next_rank_xp := v_total_xp;
        v_next_rank_modules := v_modules_completed;
    END IF;

    RETURN QUERY SELECT
        p_user_id,
        COALESCE(v_current_rank, 'Ajaw'::VARCHAR),
        v_next_rank,
        GREATEST(0, v_next_rank_xp - v_total_xp),
        GREATEST(0, COALESCE(v_next_rank_modules, 0) - v_modules_completed),
        LEAST(100.0::NUMERIC, (v_total_xp::NUMERIC / NULLIF(v_next_rank_xp, 0)) * 100);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION gamification_system.calculate_user_rank(UUID) IS
    'Calcula el rango actual del usuario basado en XP y módulos completados';

GRANT EXECUTE ON FUNCTION gamification_system.calculate_user_rank(UUID) TO authenticated;
