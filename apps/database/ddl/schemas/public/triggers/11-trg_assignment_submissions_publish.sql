-- =====================================================
-- Trigger: trg_assignment_submissions_publish
-- Table: public.assignment_submissions
-- Function: None (inline function)
-- Event: AFTER INSERT
-- Level: FOR EACH ROW
-- Description: Registra cuando se publican nuevos envios de asignaciones
-- Created: 2025-11-02
-- =====================================================

DROP TRIGGER IF EXISTS trg_assignment_submissions_publish ON public.assignment_submissions CASCADE;

CREATE TRIGGER trg_assignment_submissions_publish AFTER INSERT ON public.assignment_submissions 
    FOR EACH ROW 
    EXECUTE FUNCTION gamilit.update_updated_at_column();
