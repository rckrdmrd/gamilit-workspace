-- =====================================================
-- Function: gamification_system.promote_to_next_rank
-- Description: Promociona un usuario al siguiente rango Maya
-- Parameters:
--   - p_user_id: UUID - ID del usuario
--   - p_new_rank: gamification_system.maya_rank - Nuevo rango
-- Returns: VOID
-- Created: 2025-11-11
-- =====================================================

CREATE OR REPLACE FUNCTION gamification_system.promote_to_next_rank(
    p_user_id UUID,
    p_new_rank gamification_system.maya_rank
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old_rank gamification_system.maya_rank;
    v_total_xp BIGINT;
    v_days_in_old_rank INTEGER;
    v_ml_coins_bonus INTEGER;
    v_achievement_id UUID;
    v_old_rank_achieved_at TIMESTAMPTZ;
    v_current_balance INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- Obtener datos actuales de user_stats
    SELECT
        current_rank,
        total_xp
    INTO
        v_old_rank,
        v_total_xp
    FROM gamification_system.user_stats
    WHERE user_id = p_user_id;

    -- Obtener fecha del rango anterior desde user_ranks
    SELECT achieved_at
    INTO v_old_rank_achieved_at
    FROM gamification_system.user_ranks
    WHERE user_id = p_user_id AND is_current = true;

    -- Si no hay registro en user_ranks, usar created_at de user_stats
    IF v_old_rank_achieved_at IS NULL THEN
        SELECT created_at INTO v_old_rank_achieved_at
        FROM gamification_system.user_stats
        WHERE user_id = p_user_id;
    END IF;

    -- Calcular días en el rango anterior
    v_days_in_old_rank := EXTRACT(DAY FROM gamilit.now_mexico() - v_old_rank_achieved_at)::INTEGER;

    -- Verificar que el usuario existe
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Usuario no encontrado: %', p_user_id;
    END IF;

    -- Obtener ML Coins bonus desde maya_ranks table (dinámico)
    SELECT ml_coins_bonus
    INTO v_ml_coins_bonus
    FROM gamification_system.maya_ranks
    WHERE rank_name = p_new_rank
      AND is_active = true;

    -- Si no se encuentra el rango, usar 0
    IF v_ml_coins_bonus IS NULL THEN
        v_ml_coins_bonus := 0;
    END IF;

    -- Obtener balance actual ANTES del cambio con row lock
    SELECT ml_coins INTO v_current_balance
    FROM gamification_system.user_stats
    WHERE user_id = p_user_id
    FOR UPDATE;

    -- Calcular nuevo balance
    v_new_balance := COALESCE(v_current_balance, 0) + v_ml_coins_bonus;

    -- 1. Actualizar current_rank en user_stats
    -- Solo actualizar current_rank y ml_coins (no hay columnas achieved_at, previous_rank, etc.)
    UPDATE gamification_system.user_stats
    SET
        current_rank = p_new_rank,
        ml_coins = v_new_balance,
        updated_at = gamilit.now_mexico()
    WHERE user_id = p_user_id;

    -- 2. Actualizar user_ranks table con nuevo rango
    INSERT INTO gamification_system.user_ranks (
        user_id,
        current_rank,
        previous_rank,
        ml_coins_bonus,
        achieved_at,
        previous_rank_achieved_at,
        is_current
    ) VALUES (
        p_user_id,
        p_new_rank,
        v_old_rank,
        v_ml_coins_bonus,
        gamilit.now_mexico(),
        v_old_rank_achieved_at,
        true
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
        previous_rank = v_old_rank,
        current_rank = p_new_rank,
        ml_coins_bonus = v_ml_coins_bonus,
        previous_rank_achieved_at = v_old_rank_achieved_at,
        achieved_at = gamilit.now_mexico(),
        updated_at = gamilit.now_mexico();

    -- 3. Registrar transacción de ML Coins
    INSERT INTO gamification_system.ml_coins_transactions (
        user_id,
        amount,
        balance_before,
        balance_after,
        transaction_type,
        description,
        metadata
    ) VALUES (
        p_user_id,
        v_ml_coins_bonus,
        v_current_balance,
        v_new_balance,
        'earned_rank'::gamification_system.transaction_type,
        'Ascendiste al rango ' || p_new_rank::TEXT,
        jsonb_build_object(
            'old_rank', v_old_rank::TEXT,
            'new_rank', p_new_rank::TEXT,
            'xp_at_promotion', v_total_xp
        )
    );

    -- 4. TODO: Crear achievement rank_promotion (requiere tabla user_achievements)
    -- 5. TODO: Registrar en rank_history (requiere crear tabla)
    -- 6. TODO: Crear notificación rank_up (requiere tabla notifications)

    -- Log de auditoría
    RAISE NOTICE 'Promoción exitosa: Usuario % promovido de % a % (+% ML Coins)',
        p_user_id, v_old_rank, p_new_rank, v_ml_coins_bonus;

END;
$$;

COMMENT ON FUNCTION gamification_system.promote_to_next_rank(UUID, gamification_system.maya_rank) IS
'Promociona un usuario al siguiente rango Maya. Lee ML Coins bonus dinámicamente desde maya_ranks table.
Actualiza user_stats, user_ranks y registra transacción de ML Coins.
SECURITY DEFINER permite actualizar tablas sin permisos directos.';

-- Grant permissions
GRANT EXECUTE ON FUNCTION gamification_system.promote_to_next_rank(UUID, gamification_system.maya_rank) TO authenticated;
