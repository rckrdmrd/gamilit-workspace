-- =====================================================
-- Archivo: 00-batch_updated_at_triggers.sql
-- Schema: content_management
-- Descripcion: Triggers de actualizacion automatica de updated_at
-- Funcion: gamilit.update_updated_at_column()
-- Fecha de consolidacion: 2026-01-07
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 1)
-- =====================================================

-- =====================================================
-- TRIGGERS DE ACTUALIZACION DE TIMESTAMP
-- =====================================================

-- Tabla: content_management.content_templates
DROP TRIGGER IF EXISTS trg_content_templates_updated_at ON content_management.content_templates CASCADE;
CREATE TRIGGER trg_content_templates_updated_at
    BEFORE UPDATE ON content_management.content_templates
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

COMMENT ON TRIGGER trg_content_templates_updated_at ON content_management.content_templates
    IS 'Actualiza updated_at automaticamente en cada UPDATE';

-- Tabla: content_management.marie_curie_contents
DROP TRIGGER IF EXISTS trg_marie_curie_content_updated_at ON content_management.marie_curie_contents CASCADE;
CREATE TRIGGER trg_marie_curie_content_updated_at
    BEFORE UPDATE ON content_management.marie_curie_contents
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

COMMENT ON TRIGGER trg_marie_curie_content_updated_at ON content_management.marie_curie_contents
    IS 'Actualiza updated_at automaticamente en cada UPDATE';

-- Tabla: content_management.media_files
DROP TRIGGER IF EXISTS trg_media_files_updated_at ON content_management.media_files CASCADE;
CREATE TRIGGER trg_media_files_updated_at
    BEFORE UPDATE ON content_management.media_files
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

COMMENT ON TRIGGER trg_media_files_updated_at ON content_management.media_files
    IS 'Actualiza updated_at automaticamente en cada UPDATE';

-- =====================================================
-- FIN DE TRIGGERS CONSOLIDADOS
-- Total: 3 triggers
-- =====================================================
