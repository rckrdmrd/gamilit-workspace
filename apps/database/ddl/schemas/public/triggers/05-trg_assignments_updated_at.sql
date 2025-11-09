-- =====================================================
-- Trigger: trg_assignments_updated_at
-- Table: educational_content.assignments
-- Function: gamilit.update_updated_at_column
-- Event: BEFORE UPDATE
-- Level: FOR EACH ROW
-- Description: Actualiza el campo updated_at en asignaciones
-- Created: 2025-11-02
-- Updated: 2025-11-08 - Migrado de public a educational_content
-- =====================================================

DROP TRIGGER IF EXISTS trg_assignments_updated_at ON educational_content.assignments CASCADE;

CREATE TRIGGER trg_assignments_updated_at BEFORE UPDATE ON educational_content.assignments FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();
