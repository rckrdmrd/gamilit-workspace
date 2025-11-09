-- =====================================================
-- Trigger: trg_assignment_audit_creation
-- Table: educational_content.assignments
-- Function: gamilit.update_updated_at_column
-- Event: BEFORE INSERT
-- Level: FOR EACH ROW
-- Description: Auditoria de creacion de nuevas asignaciones
-- Created: 2025-11-02
-- Updated: 2025-11-08 - Migrado de public a educational_content
-- =====================================================

DROP TRIGGER IF EXISTS trg_assignment_audit_creation ON educational_content.assignments CASCADE;

CREATE TRIGGER trg_assignment_audit_creation BEFORE INSERT ON educational_content.assignments
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();
