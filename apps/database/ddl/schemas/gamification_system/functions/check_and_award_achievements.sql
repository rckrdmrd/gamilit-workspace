-- Function: gamification_system.check_and_grant_achievements
-- Description: Verifica y otorga achievements automaticamente basados en eventos del usuario
-- Parameters:
--   - p_user_id: UUID - ID del usuario
--   - p_event_type: VARCHAR(100) - Tipo de evento (MISSIONS_COMPLETED, TOTAL_XP, STREAK_DAYS, etc)
--   - p_event_value: INTEGER - Valor del evento (default 1)
-- Returns: TABLE (achievement_id, achievement_name, xp_granted, coins_granted)
-- Example:
--   SELECT * FROM gamification_system.check_and_grant_achievements('123e4567-e89b-12d3-a456-426614174000', 'MISSIONS_COMPLETED', 1);
-- Dependencies: gamification_system.achievements, user_achievements, user_stats, ml_coins_transactions
-- Created: 2025-10-28
-- Modified: 2025-11-26 - Refactorizado para usar JSONB (conditions, rewards) en lugar de columnas individuales
-- Fix: Columnas inexistentes condition_type, condition_value, xp_reward, earned_at, missions_completed

CREATE OR REPLACE FUNCTION gamification_system.check_and_grant_achievements(
    p_user_id UUID,
    p_event_type VARCHAR(100),
    p_event_value INTEGER DEFAULT 1
)
RETURNS TABLE (
    achievement_id UUID,
    achievement_name VARCHAR(100),
    xp_granted INTEGER,
    coins_granted INTEGER
) AS $$
DECLARE
    v_achievement RECORD;
    v_user_stats RECORD;
    v_condition_met BOOLEAN;
    -- CORR-DUP-002: Variables v_current_balance y v_new_balance removidas
    -- ya que las recompensas se otorgan en claim_achievement_reward, no aquí
    v_xp_reward INTEGER;
    v_condition_value INTEGER;
BEGIN
    -- Obtener estadisticas del usuario
    SELECT * INTO v_user_stats
    FROM gamification_system.user_stats
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Iterar sobre achievements activos no otorgados
    -- CORRECCION: Usar JSONB conditions->>'type' en lugar de columna condition_type
    -- CORRECCION: Extraer xp desde rewards JSONB
    FOR v_achievement IN
        SELECT
            a.id,
            a.name,
            a.conditions->>'type' as condition_type,
            COALESCE((a.conditions->'requirements'->>'target')::integer,
                     (a.conditions->'requirements'->>'exercises_completed')::integer,
                     (a.conditions->'requirements'->>'total_xp')::integer,
                     (a.conditions->'requirements'->>'streak_days')::integer,
                     10) as condition_value,
            COALESCE((a.rewards->>'xp')::integer, 0) as xp_reward,
            COALESCE(a.ml_coins_reward, (a.rewards->>'ml_coins')::integer, 0) as ml_coins_reward
        FROM gamification_system.achievements a
        WHERE a.is_active = true
          AND a.conditions->>'type' = p_event_type
          AND NOT EXISTS (
              SELECT 1 FROM gamification_system.user_achievements ua
              WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id AND ua.is_completed = true
          )
    LOOP
        v_condition_met := false;
        v_condition_value := v_achievement.condition_value;
        v_xp_reward := v_achievement.xp_reward;

        -- Evaluar condicion segun tipo
        CASE v_achievement.condition_type
            WHEN 'MISSIONS_COMPLETED' THEN
                -- CORRECCION: Usar modules_completed como alternativa (missions_completed no existe)
                v_condition_met := COALESCE(v_user_stats.modules_completed, 0) >= v_condition_value;
            WHEN 'TOTAL_XP' THEN
                v_condition_met := COALESCE(v_user_stats.total_xp, 0) >= v_condition_value;
            WHEN 'STREAK_DAYS' THEN
                v_condition_met := COALESCE(v_user_stats.current_streak, 0) >= v_condition_value;
            WHEN 'ACHIEVEMENTS_EARNED' THEN
                v_condition_met := COALESCE(v_user_stats.achievements_earned, 0) >= v_condition_value;
            WHEN 'EXERCISES_COMPLETED' THEN
                v_condition_met := COALESCE(v_user_stats.exercises_completed, 0) >= v_condition_value;
            WHEN 'progress' THEN
                -- Tipo generico de progreso
                v_condition_met := COALESCE(v_user_stats.exercises_completed, 0) >= v_condition_value;
            ELSE
                v_condition_met := p_event_value >= v_condition_value;
        END CASE;

        -- Si la condicion se cumple, otorgar achievement
        IF v_condition_met THEN
            -- CORRECCION: Insertar con is_completed y completed_at en lugar de earned_at
            INSERT INTO gamification_system.user_achievements (
                user_id, achievement_id, is_completed, completed_at, progress, max_progress
            ) VALUES (
                p_user_id, v_achievement.id, true, NOW(), 100, 100
            )
            ON CONFLICT (user_id, achievement_id) DO UPDATE
            SET is_completed = true, completed_at = NOW(), progress = 100;

            -- ========== MODELO CLAIM-TO-EARN (CORR-DUP-002) ==========
            -- NOTA: XP y ML Coins NO se otorgan aquí.
            -- Se otorgan ÚNICAMENTE al reclamar via claim_achievement_reward()
            -- Esto evita la doble/triple distribución de rewards detectada en
            -- ANALISIS-DUPLICADOS-ACHIEVEMENTS-2026-01-10.md
            --
            -- El trigger fn_on_achievement_unlocked creará una notificación
            -- indicando al usuario que debe reclamar sus recompensas.

            -- Solo incrementar contador de achievements earned
            UPDATE gamification_system.user_stats
            SET
                achievements_earned = COALESCE(achievements_earned, 0) + 1,
                updated_at = NOW()
            WHERE user_id = p_user_id;

            -- NO registrar transaccion de coins aquí - se hace en claim_achievement_reward

            -- Retornar el achievement desbloqueado (rewards pendientes de claim)
            RETURN QUERY SELECT
                v_achievement.id,
                v_achievement.name::VARCHAR(100),
                v_xp_reward,  -- Estos son los rewards PENDIENTES, no otorgados
                COALESCE(v_achievement.ml_coins_reward, 0)::INTEGER;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION gamification_system.check_and_grant_achievements(UUID, VARCHAR, INTEGER) IS
    'Verifica y otorga achievements basados en eventos del usuario. v2.0 - Usa JSONB para conditions/rewards';

-- Grant permissions
GRANT EXECUTE ON FUNCTION gamification_system.check_and_grant_achievements(UUID, VARCHAR, INTEGER) TO authenticated;
