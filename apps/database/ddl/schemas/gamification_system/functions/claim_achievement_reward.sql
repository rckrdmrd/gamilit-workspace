-- Nombre: claim_achievement_reward
-- Descripción: Reclama la recompensa de un logro ya desbloqueado
-- Schema: gamification_system
-- Tipo: FUNCTION

CREATE OR REPLACE FUNCTION gamification_system.claim_achievement_reward(
    p_user_id UUID,
    p_achievement_id UUID
)
RETURNS TABLE (
    success BOOLEAN,
    xp_granted INTEGER,
    coins_granted INTEGER,
    message VARCHAR
) AS $$
DECLARE
    v_user_achievement RECORD;
    v_achievement RECORD;
    v_already_claimed BOOLEAN;
    v_current_balance INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- Verificar que el usuario tiene el logro
    SELECT * INTO v_user_achievement
    FROM gamification_system.user_achievements
    WHERE user_id = p_user_id
    AND achievement_id = p_achievement_id;

    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 0, 0, 'Usuario no tiene este logro'::VARCHAR;
        RETURN;
    END IF;

    -- Verificar si ya fue reclamado
    -- CORR-P1-001: Cambiado de reward_claimed_at (no existe) a rewards_claimed (BOOLEAN)
    v_already_claimed := v_user_achievement.rewards_claimed = TRUE;

    IF v_already_claimed THEN
        RETURN QUERY SELECT false, 0, 0, 'Recompensa ya fue reclamada'::VARCHAR;
        RETURN;
    END IF;

    -- Obtener datos del logro
    SELECT * INTO v_achievement
    FROM gamification_system.achievements
    WHERE id = p_achievement_id;

    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 0, 0, 'Logro no encontrado'::VARCHAR;
        RETURN;
    END IF;

    -- Marcar recompensa como reclamada
    -- CORR-P1-002: Cambiado de reward_claimed_at (no existe) a rewards_claimed (BOOLEAN)
    UPDATE gamification_system.user_achievements
    SET rewards_claimed = TRUE
    WHERE user_id = p_user_id
    AND achievement_id = p_achievement_id;

    -- Obtener balance actual ANTES de actualizar (con row lock)
    SELECT ml_coins INTO v_current_balance
    FROM gamification_system.user_stats
    WHERE user_id = p_user_id
    FOR UPDATE;

    -- Calcular nuevo balance
    v_new_balance := COALESCE(v_current_balance, 0) + v_achievement.ml_coins_reward;

    -- Otorgar recompensas
    -- CORR-P1-003: Cambiado xp_reward (no existe) a rewards->>'xp' con fallback a points_value
    UPDATE gamification_system.user_stats
    SET
        total_xp = total_xp + COALESCE((v_achievement.rewards->>'xp')::INTEGER, v_achievement.points_value, 0),
        ml_coins = v_new_balance,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Registrar transacción de coins si aplica
    IF v_achievement.ml_coins_reward > 0 THEN
        INSERT INTO gamification_system.ml_coins_transactions (
            user_id,
            amount,
            balance_before,
            balance_after,
            transaction_type,
            description
        ) VALUES (
            p_user_id,
            v_achievement.ml_coins_reward,
            v_current_balance,
            v_new_balance,
            'earned_achievement'::gamification_system.transaction_type,
            'Recompensa reclamada: ' || v_achievement.name
        );
    END IF;

    -- CORR-P1-004: Usar COALESCE para xp también en el retorno
    RETURN QUERY SELECT
        true,
        COALESCE((v_achievement.rewards->>'xp')::INTEGER, v_achievement.points_value, 0),
        v_achievement.ml_coins_reward,
        'Recompensa reclamada exitosamente'::VARCHAR;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION gamification_system.claim_achievement_reward(UUID, UUID) IS
    'Reclama la recompensa de un logro desbloqueado';

GRANT EXECUTE ON FUNCTION gamification_system.claim_achievement_reward(UUID, UUID) TO authenticated;
