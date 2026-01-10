-- =====================================================
-- Function: gamilit.update_classroom_member_count
-- Description: Actualiza contador de miembros en aulas
-- Parameters: None
-- Returns: trigger
-- Created: 2025-10-27
-- Modified: 2026-01-08 - FIX-DB1: Manejo de UPDATE de status y conteo solo de activos
-- =====================================================

CREATE OR REPLACE FUNCTION gamilit.update_classroom_member_count()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Solo incrementar si el nuevo miembro tiene status 'active'
        IF NEW.status = 'active' THEN
            UPDATE social_features.classrooms
            SET current_students_count = current_students_count + 1
            WHERE id = NEW.classroom_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        -- Solo decrementar si el miembro eliminado tenia status 'active'
        IF OLD.status = 'active' THEN
            UPDATE social_features.classrooms
            SET current_students_count = GREATEST(0, current_students_count - 1)
            WHERE id = OLD.classroom_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Manejar cambios de status
        IF OLD.status = 'active' AND NEW.status != 'active' THEN
            -- Cambio de activo a inactivo: decrementar
            UPDATE social_features.classrooms
            SET current_students_count = GREATEST(0, current_students_count - 1)
            WHERE id = NEW.classroom_id;
        ELSIF OLD.status != 'active' AND NEW.status = 'active' THEN
            -- Cambio de inactivo a activo: incrementar
            UPDATE social_features.classrooms
            SET current_students_count = current_students_count + 1
            WHERE id = NEW.classroom_id;
        END IF;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$function$;

COMMENT ON FUNCTION gamilit.update_classroom_member_count() IS 'Actualiza contador de miembros activos en aulas (INSERT/DELETE/UPDATE de status)';
