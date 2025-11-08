-- =====================================================
-- Trigger: trg_assignment_audit_creation
-- Table: public.assignments
-- Function: None (inline function)
-- Event: BEFORE INSERT
-- Level: FOR EACH ROW
-- Description: Auditoria de creacion de nuevas asignaciones
-- Created: 2025-11-02
-- =====================================================

DROP TRIGGER IF EXISTS trg_assignment_audit_creation ON public.assignments CASCADE;

CREATE TRIGGER trg_assignment_audit_creation BEFORE INSERT ON public.assignments 
    FOR EACH ROW 
    EXECUTE FUNCTION gamilit.update_updated_at_column();
