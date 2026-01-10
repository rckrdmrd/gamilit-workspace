-- =====================================================================================
-- Trigger: trg_achievement_unlocked
-- Descripción: Trigger ejecutado cuando se desbloquea un achievement para:
--              1. Crear notificación al usuario
--              2. Otorgar recompensas automáticamente (XP + ML Coins)
-- Documentación: docs/01-fase-alcance-inicial/EAI-003-gamificacion/especificaciones/ET-GAM-001-achievements.md
-- Epic: EAI-003
-- Created: 2025-11-08
-- =====================================================================================

-- ========== Función del Trigger ==========
CREATE OR REPLACE FUNCTION gamification_system.fn_on_achievement_unlocked()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_achievement RECORD;
    v_xp_reward INTEGER;
    v_coins_reward INTEGER;
    v_notification_id UUID;
    -- CORR-DUP-001: Variables v_balance_before y v_balance_after removidas
    -- ya que las recompensas se otorgan en claim_achievement_reward, no aquí
BEGIN
    -- Solo ejecutar cuando se completa un achievement
    IF NEW.is_completed = true AND (OLD IS NULL OR OLD.is_completed = false) THEN
        -- Obtener datos del achievement
        SELECT id, name, description, rewards
        INTO v_achievement
        FROM gamification_system.achievements
        WHERE id = NEW.achievement_id;

        IF FOUND THEN
            -- Extraer recompensas para mostrar en notificación (NO se otorgan aquí)
            v_xp_reward := COALESCE((v_achievement.rewards->>'xp')::INTEGER, 0);
            v_coins_reward := COALESCE((v_achievement.rewards->>'ml_coins')::INTEGER, 0);

            -- ========== MODELO CLAIM-TO-EARN (CORR-DUP-001) ==========
            -- NOTA: XP y ML Coins NO se otorgan aquí.
            -- Se otorgan ÚNICAMENTE al reclamar via claim_achievement_reward()
            -- Esto evita la triple distribución de rewards detectada en
            -- ANALISIS-DUPLICADOS-ACHIEVEMENTS-2026-01-10.md
            --
            -- Las recompensas se muestran en la notificación para informar
            -- al usuario, pero debe hacer click en "Reclamar" para recibirlas.

            -- ========== Crear Notificación (Sistema Multi-Canal) ==========
            -- NOTA: Usa notifications.notifications (sistema consolidado EXT-003)
            -- Campos según DDL: type, title, message, data, priority, channels, status, metadata
            INSERT INTO notifications.notifications (
                user_id,
                type,
                title,
                message,
                data,
                priority,
                channels,
                status,
                metadata
            ) VALUES (
                NEW.user_id,
                'achievement',
                '🏆 ¡Achievement Desbloqueado!',
                format('Has desbloqueado: %s - ¡Reclama tus recompensas!', v_achievement.name),
                jsonb_build_object(
                    'achievement_id', v_achievement.id,
                    'achievement_name', v_achievement.name,
                    'xp_reward', v_xp_reward,
                    'coins_reward', v_coins_reward,
                    'claim_required', true  -- CORR-DUP-001: Indica que debe reclamar para obtener rewards
                ),
                'high',
                ARRAY['in_app']::varchar[],
                'sent',
                jsonb_build_object(
                    'icon', '🏆',
                    'action_url', format('/achievements/%s', v_achievement.id),
                    'related_entity_type', 'achievement',
                    'related_entity_id', v_achievement.id
                )
            )
            RETURNING id INTO v_notification_id;

            -- Marcar notificación como enviada en user_achievements
            UPDATE gamification_system.user_achievements
            SET notified = true,
                metadata = metadata || jsonb_build_object('notification_id', v_notification_id)
            WHERE id = NEW.id;

            -- CORR-DUP-001: Log de auditoría actualizado para modelo claim-to-earn
            RAISE NOTICE 'Achievement unlocked (pending claim): user_id=%, achievement_id=%, pending_xp=%, pending_coins=%',
                NEW.user_id, v_achievement.id, v_xp_reward, v_coins_reward;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- ========== Crear Trigger ==========
DROP TRIGGER IF EXISTS trg_achievement_unlocked ON gamification_system.user_achievements;

CREATE TRIGGER trg_achievement_unlocked
    AFTER INSERT OR UPDATE ON gamification_system.user_achievements
    FOR EACH ROW
    EXECUTE FUNCTION gamification_system.fn_on_achievement_unlocked();

COMMENT ON TRIGGER trg_achievement_unlocked ON gamification_system.user_achievements IS 'Trigger que otorga recompensas y crea notificación cuando se desbloquea un achievement. Documentado en ET-GAM-001.';
COMMENT ON FUNCTION gamification_system.fn_on_achievement_unlocked IS 'Función trigger para procesar desbloqueo de achievements: otorgar XP, ML Coins, y crear notificación.';
