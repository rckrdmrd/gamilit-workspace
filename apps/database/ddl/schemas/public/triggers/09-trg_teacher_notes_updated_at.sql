-- =====================================================
-- Trigger: trg_teacher_notes_updated_at
-- Table: public.teacher_notes
-- Function: gamilit.update_updated_at_column
-- Event: BEFORE UPDATE
-- Level: FOR EACH ROW
-- Description: Actualiza el campo updated_at en notas de profesor
-- Created: 2025-11-02
-- =====================================================

DROP TRIGGER IF EXISTS trg_teacher_notes_updated_at ON public.teacher_notes CASCADE;

CREATE TRIGGER trg_teacher_notes_updated_at BEFORE UPDATE ON public.teacher_notes FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();
