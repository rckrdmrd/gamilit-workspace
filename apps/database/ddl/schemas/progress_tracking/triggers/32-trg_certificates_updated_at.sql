-- =====================================================
-- Trigger: trg_certificates_updated_at
-- Table: progress_tracking.certificates
-- Function: gamilit.update_updated_at_column
-- Event: BEFORE UPDATE
-- Level: FOR EACH ROW
-- Description: Actualiza automáticamente el campo updated_at cuando se modifica un registro
-- EPIC: 10.2 - Digital Certificates System
-- Created: 2026-01-04
-- =====================================================

DROP TRIGGER IF EXISTS trg_certificates_updated_at ON progress_tracking.certificates CASCADE;

CREATE TRIGGER trg_certificates_updated_at
    BEFORE UPDATE ON progress_tracking.certificates
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

COMMENT ON TRIGGER trg_certificates_updated_at ON progress_tracking.certificates IS
    'Actualiza updated_at automáticamente en cada UPDATE';
