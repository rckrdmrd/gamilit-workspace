-- =====================================================
-- Trigger: missions_updated_at
-- Table: gamification_system.missions
-- Function: gamilit.update_updated_at_column (CENTRALIZADA)
-- Event: BEFORE UPDATE
-- Level: FOR EACH ROW
-- Description: Actualiza automáticamente el campo updated_at cuando se modifica un registro
-- Created: 2025-10-27
-- Modified: 2025-12-29 (DB-162: Consolidar a función centralizada)
-- =====================================================

DROP TRIGGER IF EXISTS missions_updated_at ON gamification_system.missions CASCADE;

-- DB-162: Usar función centralizada en lugar de función deprecated
CREATE TRIGGER missions_updated_at
  BEFORE UPDATE ON gamification_system.missions
  FOR EACH ROW
  EXECUTE FUNCTION gamilit.update_updated_at_column();

