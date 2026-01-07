-- =============================================================================
-- Archivo: 51-mission_trigger_wrappers.sql
-- Descripcion: Wrappers de trigger que llaman a la funcion unificada
-- Schema: gamilit
-- Tipo: TRIGGER FUNCTIONS
-- Dependencias: gamilit.update_mission_progress()
-- Created: 2025-12-29
-- =============================================================================
--
-- PROPOSITO:
-- Estos wrappers adaptan la funcion unificada update_mission_progress()
-- para ser usada en diferentes triggers con diferentes tablas y condiciones.
-- Cada wrapper extrae los datos relevantes de NEW/OLD y llama a la funcion
-- con los parametros correctos.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Wrapper para ejercicios completados correctamente
-- Trigger: AFTER INSERT ON progress_tracking.exercise_attempts
-- Condicion: Solo cuando is_correct = true
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION gamilit.trigger_missions_on_exercise_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Solo procesar ejercicios correctos
    IF NEW.is_correct = true THEN
        PERFORM gamilit.update_mission_progress(NEW.user_id, 'complete_exercises', 1);
    END IF;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in trigger_missions_on_exercise_complete: %', SQLERRM;
        RETURN NEW;
END;
$$;

COMMENT ON FUNCTION gamilit.trigger_missions_on_exercise_complete() IS
'Trigger wrapper que actualiza misiones al completar un ejercicio correctamente.
Llama a update_mission_progress con type=complete_exercises, increment=1.
Tabla: progress_tracking.exercise_attempts
Evento: AFTER INSERT';

-- -----------------------------------------------------------------------------
-- 2. Wrapper para XP ganado
-- Trigger: AFTER UPDATE ON gamification_system.user_stats
-- Condicion: Cuando total_xp aumenta
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION gamilit.trigger_missions_on_earn_xp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_xp_gained INTEGER;
BEGIN
    -- Solo procesar si XP aumento
    IF NEW.total_xp > COALESCE(OLD.total_xp, 0) THEN
        v_xp_gained := NEW.total_xp - COALESCE(OLD.total_xp, 0);
        PERFORM gamilit.update_mission_progress(NEW.user_id, 'earn_xp', v_xp_gained);
    END IF;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in trigger_missions_on_earn_xp: %', SQLERRM;
        RETURN NEW;
END;
$$;

COMMENT ON FUNCTION gamilit.trigger_missions_on_earn_xp() IS
'Trigger wrapper que actualiza misiones al ganar XP.
Llama a update_mission_progress con type=earn_xp, increment=XP_ganado.
Tabla: gamification_system.user_stats
Evento: AFTER UPDATE (when total_xp changes)';

-- -----------------------------------------------------------------------------
-- 3. Wrapper para racha de ejercicios correctos
-- Trigger: AFTER UPDATE ON gamification_system.user_stats
-- Condicion: Cuando current_streak aumenta
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION gamilit.trigger_missions_on_correct_streak()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Solo procesar si racha aumento
    IF NEW.current_streak > COALESCE(OLD.current_streak, 0) THEN
        PERFORM gamilit.update_mission_progress(NEW.user_id, 'correct_streak', 1);
    END IF;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in trigger_missions_on_correct_streak: %', SQLERRM;
        RETURN NEW;
END;
$$;

COMMENT ON FUNCTION gamilit.trigger_missions_on_correct_streak() IS
'Trigger wrapper que actualiza misiones al incrementar racha de ejercicios.
Llama a update_mission_progress con type=correct_streak, increment=1.
Tabla: gamification_system.user_stats
Evento: AFTER UPDATE (when current_streak changes)';

-- -----------------------------------------------------------------------------
-- 4. Wrapper para racha diaria
-- Trigger: AFTER UPDATE ON gamification_system.user_stats
-- Condicion: Cuando daily_streak aumenta
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION gamilit.trigger_missions_on_daily_streak()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Solo procesar si racha diaria aumento
    IF NEW.daily_streak > COALESCE(OLD.daily_streak, 0) THEN
        PERFORM gamilit.update_mission_progress(NEW.user_id, 'daily_streak', 1);
    END IF;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in trigger_missions_on_daily_streak: %', SQLERRM;
        RETURN NEW;
END;
$$;

COMMENT ON FUNCTION gamilit.trigger_missions_on_daily_streak() IS
'Trigger wrapper que actualiza misiones al incrementar racha diaria.
Llama a update_mission_progress con type=daily_streak, increment=1.
Tabla: gamification_system.user_stats
Evento: AFTER UPDATE (when daily_streak changes)';

-- -----------------------------------------------------------------------------
-- 5. Wrapper para uso de comodines
-- Trigger: AFTER UPDATE ON gamification_system.comodines_inventory
-- Condicion: Cuando times_used aumenta
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION gamilit.trigger_missions_on_use_comodines()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Solo procesar si se uso un comodin
    IF NEW.times_used > COALESCE(OLD.times_used, 0) THEN
        PERFORM gamilit.update_mission_progress(NEW.user_id, 'use_comodines', 1);
    END IF;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in trigger_missions_on_use_comodines: %', SQLERRM;
        RETURN NEW;
END;
$$;

COMMENT ON FUNCTION gamilit.trigger_missions_on_use_comodines() IS
'Trigger wrapper que actualiza misiones al usar un comodin.
Llama a update_mission_progress con type=use_comodines, increment=1.
Tabla: gamification_system.comodines_inventory
Evento: AFTER UPDATE (when times_used changes)';

-- -----------------------------------------------------------------------------
-- 6. Wrapper para puntajes perfectos
-- Trigger: AFTER INSERT/UPDATE ON progress_tracking.exercise_submissions
-- Condicion: Cuando score = 100 y status = 'graded'
-- NOTA: Se usa 'graded' en lugar de 'completed' porque el constraint
--       exercise_submissions_status_check solo permite:
--       draft, submitted, graded, reviewed, pending_review
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION gamilit.trigger_missions_on_perfect_scores()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Solo procesar puntajes perfectos en ejercicios calificados
    -- Nota: Usamos 'graded' porque es el status final de ejercicios evaluados
    IF NEW.score = 100 AND NEW.status = 'graded' THEN
        -- Evitar contar doble si ya estaba graded con 100
        IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND
           (OLD.score IS DISTINCT FROM 100 OR OLD.status IS DISTINCT FROM 'graded')) THEN
            PERFORM gamilit.update_mission_progress(NEW.user_id, 'perfect_scores', 1);
        END IF;
    END IF;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in trigger_missions_on_perfect_scores: %', SQLERRM;
        RETURN NEW;
END;
$$;

COMMENT ON FUNCTION gamilit.trigger_missions_on_perfect_scores() IS
'Trigger wrapper que actualiza misiones al obtener un puntaje perfecto.
Llama a update_mission_progress con type=perfect_scores, increment=1.
Tabla: progress_tracking.exercise_submissions
Evento: AFTER INSERT OR UPDATE (when score=100 and status=graded)';

-- -----------------------------------------------------------------------------
-- 7. Wrapper para modulos completados
-- Trigger: AFTER UPDATE ON gamification_system.user_stats
-- Condicion: Cuando modules_completed aumenta
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION gamilit.trigger_missions_on_complete_modules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Solo procesar si se completo un modulo nuevo
    IF NEW.modules_completed > COALESCE(OLD.modules_completed, 0) THEN
        PERFORM gamilit.update_mission_progress(NEW.user_id, 'complete_modules', 1);
    END IF;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in trigger_missions_on_complete_modules: %', SQLERRM;
        RETURN NEW;
END;
$$;

COMMENT ON FUNCTION gamilit.trigger_missions_on_complete_modules() IS
'Trigger wrapper que actualiza misiones al completar un modulo.
Llama a update_mission_progress con type=complete_modules, increment=1.
Tabla: gamification_system.user_stats
Evento: AFTER UPDATE (when modules_completed changes)';

-- -----------------------------------------------------------------------------
-- 8. Wrapper para modulos explorados
-- Trigger: AFTER INSERT ON progress_tracking.module_progress
-- Condicion: Solo INSERT (primera interaccion con un modulo)
-- Corregido: DB-166 (2026-01-04) - Eliminada referencia a modules_explored
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION gamilit.trigger_missions_on_explore_modules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Cada INSERT en module_progress representa un modulo nuevo siendo explorado
    -- El trigger solo se dispara en INSERT, no en UPDATE (revisitas)
    -- La unicidad de modulos se trackea en update_mission_progress via JSONB
    PERFORM gamilit.update_mission_progress(NEW.user_id, 'explore_modules', 1);
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in trigger_missions_on_explore_modules: %', SQLERRM;
        RETURN NEW;
END;
$$;

COMMENT ON FUNCTION gamilit.trigger_missions_on_explore_modules() IS
'Trigger wrapper que actualiza misiones al explorar un modulo nuevo.
Llama a update_mission_progress con type=explore_modules, increment=1.
Tabla: progress_tracking.module_progress
Evento: AFTER INSERT (primera interaccion con modulo)
Corregido: DB-166 (2026-01-04)';

-- -----------------------------------------------------------------------------
-- 9. Wrapper generico para submissions
-- Trigger: AFTER INSERT ON progress_tracking.exercise_submissions
-- Condicion: Status = 'submitted' (status inicial de todas las submissions)
-- NOTA: El constraint exercise_submissions_status_check solo permite:
--       draft, submitted, graded, reviewed, pending_review
--       Se usa 'submitted' como trigger inicial para contar envios
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION gamilit.trigger_missions_on_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Procesar cuando se hace una submission
    -- Nota: El status inicial siempre es 'submitted', luego puede cambiar a
    -- pending_review (si requiere revision manual) o graded (si es auto-calificado)
    IF NEW.status = 'submitted' THEN
        -- Este objetivo es para contar submissions en general
        PERFORM gamilit.update_mission_progress(NEW.user_id, 'submit_exercises', 1);
    END IF;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in trigger_missions_on_submission: %', SQLERRM;
        RETURN NEW;
END;
$$;

COMMENT ON FUNCTION gamilit.trigger_missions_on_submission() IS
'Trigger wrapper que actualiza misiones al enviar un ejercicio.
Llama a update_mission_progress con type=submit_exercises, increment=1.
Tabla: progress_tracking.exercise_submissions
Evento: AFTER INSERT (when status=submitted)';

-- =============================================================================
-- NOTAS DE IMPLEMENTACION
-- =============================================================================
--
-- PATRON DE WRAPPER:
-- 1. Verificar condicion especifica del trigger (es diferente para cada tipo)
-- 2. Extraer datos necesarios de NEW/OLD
-- 3. Llamar a update_mission_progress con parametros correctos
-- 4. Manejar excepciones sin bloquear operacion original
-- 5. Siempre retornar NEW
--
-- SEGURIDAD:
-- - SECURITY DEFINER para permisos adecuados
-- - Manejo de excepciones para no bloquear operaciones principales
--
-- PERFORMANCE:
-- - Cada wrapper tiene una sola responsabilidad
-- - Condiciones evaluadas antes de llamar a la funcion principal
-- - Minimiza overhead cuando no aplica la condicion
--
-- =============================================================================
-- MIGRACION DE TRIGGERS EXISTENTES
-- =============================================================================
--
-- Los triggers existentes deben actualizarse para usar estos nuevos wrappers.
-- Ejemplo de migracion:
--
-- -- ANTES:
-- CREATE TRIGGER trg_update_missions_on_exercise
--   AFTER INSERT ON progress_tracking.exercise_attempts
--   FOR EACH ROW
--   EXECUTE FUNCTION gamilit.update_missions_on_exercise_complete();
--
-- -- DESPUES:
-- DROP TRIGGER IF EXISTS trg_update_missions_on_exercise ON progress_tracking.exercise_attempts;
-- CREATE TRIGGER trg_update_missions_on_exercise
--   AFTER INSERT ON progress_tracking.exercise_attempts
--   FOR EACH ROW
--   EXECUTE FUNCTION gamilit.trigger_missions_on_exercise_complete();
--
-- =============================================================================
-- CHANGELOG
-- =============================================================================
-- 2025-12-29: Creacion inicial
--             - 9 wrappers que llaman a funcion unificada
--             - Mantienen compatibilidad con triggers existentes
--             - Documentacion completa de cada wrapper
-- 2025-12-29: Fix DB-158 - Alineacion con constraint exercise_submissions_status_check
--             - trigger_missions_on_perfect_scores: 'completed' → 'graded'
--               El constraint solo permite: draft, submitted, graded, reviewed, pending_review
--             - trigger_missions_on_submission: Removido 'completed' del check
--               Solo verifica 'submitted' (status inicial de todas las submissions)
-- =============================================================================
