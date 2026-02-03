-- =====================================================
-- DEPRECATED: 2026-02-03
-- REASON: Replaced by trigger 30 (trg_process_xp_update)
-- TASK: TASK-2026-02-03-PLAN-MAESTRO-BD-REQUERIMIENTOS
-- =====================================================
-- Trigger: trg_recalculate_level_on_xp_change
-- Description: Recalcula automáticamente el nivel cuando cambia total_xp
-- Table: gamification_system.user_stats
-- Created: 2025-10-28
-- =====================================================

DROP TRIGGER IF EXISTS trg_recalculate_level_on_xp_change ON gamification_system.user_stats;

CREATE TRIGGER trg_recalculate_level_on_xp_change
    BEFORE UPDATE OF total_xp
    ON gamification_system.user_stats
    FOR EACH ROW
    WHEN (NEW.total_xp IS DISTINCT FROM OLD.total_xp)
    EXECUTE FUNCTION gamification_system.recalculate_level_on_xp_change();

COMMENT ON TRIGGER trg_recalculate_level_on_xp_change ON gamification_system.user_stats IS 'Recalcula automáticamente el nivel cuando cambia total_xp';
