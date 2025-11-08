-- =====================================================
-- Trigger: trg_assignments_updated_at
-- Table: public.assignments
-- Function: gamilit.update_updated_at_column
-- Event: BEFORE UPDATE
-- Level: FOR EACH ROW
-- Description: Actualiza el campo updated_at en asignaciones
-- Created: 2025-11-02
-- =====================================================

DROP TRIGGER IF EXISTS trg_assignments_updated_at ON public.assignments CASCADE;

CREATE TRIGGER trg_assignments_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();
