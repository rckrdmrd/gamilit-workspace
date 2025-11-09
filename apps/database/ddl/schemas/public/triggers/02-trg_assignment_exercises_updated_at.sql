-- =====================================================
-- Trigger: trg_assignment_exercises_updated_at
-- Table: educational_content.assignment_exercises
-- Function: gamilit.update_updated_at_column
-- Event: BEFORE UPDATE
-- Level: FOR EACH ROW
-- Description: Actualiza el campo updated_at en ejercicios de asignaciones
-- Created: 2025-11-02
-- Updated: 2025-11-08 - Migrado de public a educational_content
-- =====================================================

DROP TRIGGER IF EXISTS trg_assignment_exercises_updated_at ON educational_content.assignment_exercises CASCADE;

CREATE TRIGGER trg_assignment_exercises_updated_at BEFORE UPDATE ON educational_content.assignment_exercises FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();
