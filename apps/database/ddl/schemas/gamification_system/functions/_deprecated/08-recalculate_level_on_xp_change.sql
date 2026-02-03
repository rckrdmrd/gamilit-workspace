-- ============================================================================
-- DEPRECATED: 2026-02-03
-- RAZON: Reemplazada por process_xp_update() que es mas eficiente
-- TAREA: TASK-CONSOLIDAR-FUNCIONES-SQL-GAMILIT
-- REEMPLAZO: Usar gamification_system.process_xp_update()
-- ============================================================================
-- NOTA: Este archivo fue movido a _deprecated/ y NO sera incluido en el script
-- de creacion de la base de datos. Mantener solo como referencia historica.
-- ============================================================================

-- =====================================================
-- Function: gamification_system.recalculate_level_on_xp_change
-- Description: Trigger function que recalcula automaticamente el nivel cuando cambia el XP
-- Parameters: None (trigger function)
-- Returns: trigger
-- Created: 2025-10-28
-- =====================================================

CREATE OR REPLACE FUNCTION gamification_system.recalculate_level_on_xp_change()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_new_level INTEGER;
BEGIN
    -- Calculate new level based on new XP using existing function
    v_new_level := gamification_system.calculate_level_from_xp(NEW.total_xp);

    -- Only update if level actually changed
    IF v_new_level != NEW.level THEN
        NEW.level := v_new_level;
    END IF;

    RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION gamification_system.recalculate_level_on_xp_change() IS 'DEPRECATED: Trigger function que recalcula automaticamente el nivel cuando cambia el XP. Usar process_xp_update() en su lugar.';
