-- =====================================================
-- Archivo: 00-batch_updated_at_triggers.sql
-- Schema: gamification_system
-- Descripcion: Triggers de actualizacion automatica de updated_at
-- Funcion: gamilit.update_updated_at_column()
-- Fecha de consolidacion: 2026-01-07
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 1)
-- =====================================================

-- =====================================================
-- TRIGGERS DE ACTUALIZACION DE TIMESTAMP
-- =====================================================

-- Tabla: gamification_system.achievements
DROP TRIGGER IF EXISTS trg_achievements_updated_at ON gamification_system.achievements CASCADE;
CREATE TRIGGER trg_achievements_updated_at
    BEFORE UPDATE ON gamification_system.achievements
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

COMMENT ON TRIGGER trg_achievements_updated_at ON gamification_system.achievements
    IS 'Actualiza updated_at automaticamente en cada UPDATE';

-- Tabla: gamification_system.comodines_inventory
DROP TRIGGER IF EXISTS trg_comodines_inventory_updated_at ON gamification_system.comodines_inventory CASCADE;
CREATE TRIGGER trg_comodines_inventory_updated_at
    BEFORE UPDATE ON gamification_system.comodines_inventory
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

COMMENT ON TRIGGER trg_comodines_inventory_updated_at ON gamification_system.comodines_inventory
    IS 'Actualiza updated_at automaticamente en cada UPDATE';

-- Tabla: gamification_system.missions
DROP TRIGGER IF EXISTS trg_missions_updated_at ON gamification_system.missions CASCADE;
CREATE TRIGGER trg_missions_updated_at
    BEFORE UPDATE ON gamification_system.missions
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

COMMENT ON TRIGGER trg_missions_updated_at ON gamification_system.missions
    IS 'Actualiza updated_at automaticamente en cada UPDATE';

-- REMOVIDO (2026-01-07): Trigger para gamification_system.notifications
-- Razon: Tabla DEPRECATED, movida a tables/_deprecated/08-notifications.sql
-- Trigger original: triggers/_deprecated/18-notifications_updated_at.sql
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 3)

-- Tabla: gamification_system.user_ranks
DROP TRIGGER IF EXISTS trg_user_ranks_updated_at ON gamification_system.user_ranks CASCADE;
CREATE TRIGGER trg_user_ranks_updated_at
    BEFORE UPDATE ON gamification_system.user_ranks
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

COMMENT ON TRIGGER trg_user_ranks_updated_at ON gamification_system.user_ranks
    IS 'Actualiza updated_at automaticamente en cada UPDATE';

-- Tabla: gamification_system.user_stats
DROP TRIGGER IF EXISTS trg_user_stats_updated_at ON gamification_system.user_stats CASCADE;
CREATE TRIGGER trg_user_stats_updated_at
    BEFORE UPDATE ON gamification_system.user_stats
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

COMMENT ON TRIGGER trg_user_stats_updated_at ON gamification_system.user_stats
    IS 'Actualiza updated_at automaticamente en cada UPDATE';

-- =====================================================
-- FIN DE TRIGGERS CONSOLIDADOS
-- Total: 5 triggers (notifications removido - tabla deprecated)
-- Actualizado: 2026-01-07
-- =====================================================
