-- =====================================================
-- Trigger: trg_initialize_module_progress
-- Table: educational_content.modules
-- Function: gamilit.initialize_module_progress_on_publish
-- Event: AFTER INSERT OR UPDATE
-- Level: FOR EACH ROW
-- Description: Inicializa registros de progress cuando un módulo se publica
-- Created: 2026-01-04
-- Issue: CORR-2026-01-04-001 - Error 404 en progress/modules
-- =====================================================
--
-- CONTEXTO:
-- Cuando se crea un nuevo módulo O se cambia is_published a true,
-- este trigger crea registros de module_progress para todos los
-- usuarios elegibles (student, admin_teacher, super_admin).
--
-- Esto complementa el trigger trg_initialize_user_stats que crea
-- registros cuando se crea un nuevo usuario.
--
-- CASOS CUBIERTOS:
-- 1. INSERT de módulo con is_published = true
-- 2. UPDATE de módulo cambiando is_published de false a true
-- =====================================================

-- Primero creamos la función del trigger
CREATE OR REPLACE FUNCTION gamilit.initialize_module_progress_on_publish()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = gamilit, auth_management, educational_content, progress_tracking
AS $function$
DECLARE
    v_records_created INTEGER;
BEGIN
    -- Solo ejecutar si el módulo está publicado
    -- Para INSERT: verificar que el nuevo registro está publicado
    -- Para UPDATE: verificar que cambió de no-publicado a publicado
    IF TG_OP = 'INSERT' THEN
        IF NEW.is_published = true AND NEW.status = 'published' THEN
            v_records_created := gamilit.initialize_module_progress_for_users(NEW.id);
            RAISE NOTICE '[trg_initialize_module_progress] INSERT: Created % records for module %',
                v_records_created, NEW.id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Solo si cambió de no-publicado a publicado
        IF (OLD.is_published = false OR OLD.status != 'published')
           AND NEW.is_published = true
           AND NEW.status = 'published' THEN
            v_records_created := gamilit.initialize_module_progress_for_users(NEW.id);
            RAISE NOTICE '[trg_initialize_module_progress] UPDATE: Created % records for module %',
                v_records_created, NEW.id;
        END IF;
    END IF;

    RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION gamilit.initialize_module_progress_on_publish() IS
'Trigger function que inicializa module_progress cuando un módulo se publica';

-- Crear el trigger
DROP TRIGGER IF EXISTS trg_initialize_module_progress ON educational_content.modules CASCADE;

CREATE TRIGGER trg_initialize_module_progress
    AFTER INSERT OR UPDATE OF is_published, status
    ON educational_content.modules
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.initialize_module_progress_on_publish();

COMMENT ON TRIGGER trg_initialize_module_progress ON educational_content.modules IS
'Inicializa module_progress para usuarios existentes cuando un módulo se publica';
