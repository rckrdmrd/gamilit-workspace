-- =====================================================
-- Trigger: trg_update_classroom_count
-- Table: social_features.classroom_members
-- Function: update_classroom_member_count
-- Event: AFTER INSERT OR DELETE OR UPDATE OF status
-- Level: FOR EACH ROW
-- Description: Actualiza el contador de miembros activos en el aula
-- Created: 2025-10-27
-- Modified: 2026-01-08 - FIX-DB1: Agregado UPDATE OF status para mantener conteo sincronizado
-- =====================================================

DROP TRIGGER IF EXISTS trg_update_classroom_count ON social_features.classroom_members CASCADE;

CREATE TRIGGER trg_update_classroom_count
    AFTER INSERT OR DELETE OR UPDATE OF status
    ON social_features.classroom_members
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_classroom_member_count();

