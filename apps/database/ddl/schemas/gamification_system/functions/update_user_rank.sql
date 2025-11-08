-- =====================================================
-- Function: gamification_system.update_user_rank
-- Description: Actualiza el rango del usuario basado en XP total y otorga recompensas
-- Parameters:
--   - p_user_id: UUID - ID del usuario
-- Returns: TABLE (old_rank, new_rank, rank_up, reward_coins)
-- Created: 2025-11-02
-- =====================================================

CREATE OR REPLACE FUNCTION gamification_system.update_user_rank(
    p_user_id UUID
)
RETURNS TABLE (
    old_rank VARCHAR,
    new_rank VARCHAR,
    rank_up BOOLEAN,
    reward_coins INTEGER
) AS $$
DECLARE
    v_current_xp BIGINT;
    v_old_rank VARCHAR;
    v_new_rank VARCHAR;
    v_coins_reward INTEGER := 0;
BEGIN
    -- Obtener XP y rango actual
    SELECT COALESCE(us.total_xp, 0), COALESCE(ur.current_rank, 'beginner')
    INTO v_current_xp, v_old_rank
    FROM gamification_system.user_stats us
    LEFT JOIN gamification_system.user_ranks ur ON ur.user_id = us.user_id
    WHERE us.user_id = p_user_id;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Calcular nuevo rango (cada 5000 XP = 1 rango)
    v_new_rank := CASE
        WHEN v_current_xp < 1000 THEN 'beginner'
        WHEN v_current_xp < 5000 THEN 'apprentice'
        WHEN v_current_xp < 10000 THEN 'journeyman'
        WHEN v_current_xp < 20000 THEN 'expert'
        ELSE 'master'
    END;

    -- Si hubo cambio de rango
    IF v_new_rank != v_old_rank THEN
        v_coins_reward := 500;

        -- Actualizar coins en user_stats
        UPDATE gamification_system.user_stats
        SET
            ml_coins = COALESCE(ml_coins, 0) + v_coins_reward,
            updated_at = NOW()
        WHERE user_id = p_user_id;

        -- Actualizar rango en tabla de user_ranks
        INSERT INTO gamification_system.user_ranks (user_id, current_rank, updated_at)
        VALUES (p_user_id, v_new_rank, NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET current_rank = v_new_rank, updated_at = NOW();

        -- Registrar transacción de coins
        INSERT INTO gamification_system.ml_coins_transactions (
            user_id, amount, transaction_type, description
        ) VALUES (
            p_user_id,
            v_coins_reward,
            'RANK_UP',
            'Ascendiste al rango ' || v_new_rank
        );
    END IF;

    RETURN QUERY SELECT
        v_old_rank::VARCHAR,
        v_new_rank::VARCHAR,
        v_new_rank != v_old_rank,
        v_coins_reward;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION gamification_system.update_user_rank(UUID) IS
    'Actualiza el rango del usuario basado en XP total y otorga recompensas';

-- Grant permissions
GRANT EXECUTE ON FUNCTION gamification_system.update_user_rank(UUID) TO authenticated;
