-- =====================================================
-- Archivo: 00-batch_updated_at_triggers.sql
-- Schema: system_configuration
-- Descripcion: Triggers de actualizacion automatica de updated_at
-- Funcion: gamilit.update_updated_at_column()
-- Fecha de consolidacion: 2026-01-07
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 1)
-- =====================================================

-- =====================================================
-- TRIGGERS DE ACTUALIZACION DE TIMESTAMP
-- =====================================================

-- Tabla: system_configuration.feature_flags
DROP TRIGGER IF EXISTS trg_feature_flags_updated_at ON system_configuration.feature_flags CASCADE;
CREATE TRIGGER trg_feature_flags_updated_at
    BEFORE UPDATE ON system_configuration.feature_flags
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

COMMENT ON TRIGGER trg_feature_flags_updated_at ON system_configuration.feature_flags
    IS 'Actualiza updated_at automaticamente en cada UPDATE';

-- Tabla: system_configuration.system_settings
DROP TRIGGER IF EXISTS trg_system_settings_updated_at ON system_configuration.system_settings CASCADE;
CREATE TRIGGER trg_system_settings_updated_at
    BEFORE UPDATE ON system_configuration.system_settings
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

COMMENT ON TRIGGER trg_system_settings_updated_at ON system_configuration.system_settings
    IS 'Actualiza updated_at automaticamente en cada UPDATE';

-- =====================================================
-- FIN DE TRIGGERS CONSOLIDADOS
-- Total: 2 triggers
-- =====================================================
