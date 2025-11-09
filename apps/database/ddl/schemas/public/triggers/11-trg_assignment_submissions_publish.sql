-- =====================================================
-- Trigger: trg_assignment_submissions_publish
-- Table: educational_content.assignment_submissions
-- Function: gamilit.update_updated_at_column
-- Event: AFTER INSERT
-- Level: FOR EACH ROW
-- Description: Registra cuando se publican nuevos envios de asignaciones
-- Created: 2025-11-02
-- Updated: 2025-11-08 - Migrado de public a educational_content
-- =====================================================

DROP TRIGGER IF EXISTS trg_assignment_submissions_publish ON educational_content.assignment_submissions CASCADE;

CREATE TRIGGER trg_assignment_submissions_publish AFTER INSERT ON educational_content.assignment_submissions
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();
