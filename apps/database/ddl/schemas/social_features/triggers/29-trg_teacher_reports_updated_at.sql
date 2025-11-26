-- =====================================================
-- Trigger: trg_teacher_reports_updated_at
-- Table: social_features.teacher_reports
-- Function: update_updated_at_column
-- Event: BEFORE UPDATE
-- Level: FOR EACH ROW
-- Description: Actualiza automáticamente el campo updated_at cuando se modifica un registro
-- Created: 2025-11-26
-- =====================================================

DROP TRIGGER IF EXISTS trg_teacher_reports_updated_at ON social_features.teacher_reports CASCADE;

CREATE TRIGGER trg_teacher_reports_updated_at
  BEFORE UPDATE ON social_features.teacher_reports
  FOR EACH ROW
  EXECUTE FUNCTION gamilit.update_updated_at_column();
