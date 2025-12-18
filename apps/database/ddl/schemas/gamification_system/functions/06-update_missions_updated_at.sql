-- =====================================================
-- Function: gamification_system.update_missions_updated_at
-- Description: DEPRECATED - Usar gamilit.update_updated_at_column()
-- Parameters: None
-- Returns: trigger
-- Created: 2025-10-27
-- Modified: 2025-12-14 (P0-DUP Auditoría AUDIT-DB-001)
-- =====================================================
--
-- DEPRECATED: Esta función es redundante.
-- Todos los triggers deben usar gamilit.update_updated_at_column()
-- para garantizar consistencia de timezone (gamilit.now_mexico())
--
-- Cambio: NOW() → gamilit.now_mexico() para consistencia de timezone
-- =====================================================

CREATE OR REPLACE FUNCTION gamification_system.update_missions_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- P0-DUP: Corregido para usar timezone México (antes usaba NOW())
  NEW.updated_at = gamilit.now_mexico();
  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION gamification_system.update_missions_updated_at() IS
  'DEPRECATED: Usar gamilit.update_updated_at_column(). Corregido 2025-12-14 para usar gamilit.now_mexico()';
