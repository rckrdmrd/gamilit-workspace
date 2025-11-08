-- =====================================================
-- Trigger: trg_assignment_classrooms_updated_at
-- Table: public.assignment_classrooms
-- Function: gamilit.update_updated_at_column
-- Event: BEFORE UPDATE
-- Level: FOR EACH ROW
-- Description: Actualiza el campo updated_at en asignaciones de aulas
-- Created: 2025-11-02
-- =====================================================

DROP TRIGGER IF EXISTS trg_assignment_classrooms_updated_at ON public.assignment_classrooms CASCADE;

CREATE TRIGGER trg_assignment_classrooms_updated_at BEFORE UPDATE ON public.assignment_classrooms FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();
