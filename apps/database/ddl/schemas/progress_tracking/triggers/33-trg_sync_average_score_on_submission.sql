-- =============================================================================
-- Trigger: trg_sync_average_score_on_submission
-- Descripcion: Sincroniza average_score en module_progress al insertar/actualizar submissions
-- Tabla: progress_tracking.exercise_submissions
-- Funcion: progress_tracking.sync_module_progress_scores()
-- Creado: 2026-01-19
-- Tarea: TASK-2026-01-19-005
-- =============================================================================
--
-- PROPOSITO:
-- Este trigger mantiene actualizado el campo average_score en module_progress
-- cada vez que se crea o modifica un exercise_submission. A diferencia del
-- trigger existente (27-trg_update_module_progress_on_submission), este:
-- - Se dispara en INSERT y UPDATE (no solo UPDATE)
-- - Considera TODOS los scores (no solo >= 60)
-- - Calcula el promedio real de todos los intentos
--
-- COMPLEMENTA A:
-- - 27-trg_update_module_progress_on_submission: Actualiza completed_exercises, progress_percentage
-- - 33-trg_sync_average_score_on_submission: Actualiza average_score (ESTE TRIGGER)
--

-- Crear funcion trigger wrapper
CREATE OR REPLACE FUNCTION progress_tracking.trg_sync_average_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_module_id UUID;
BEGIN
  -- Obtener module_id del ejercicio
  SELECT module_id INTO v_module_id
  FROM educational_content.exercises
  WHERE id = NEW.exercise_id;

  -- Si no hay module_id, salir
  IF v_module_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Sincronizar scores
  PERFORM progress_tracking.sync_module_progress_scores(NEW.user_id, v_module_id);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error pero no bloquear la operacion
    RAISE WARNING 'Error al sincronizar average_score para usuario % ejercicio %: %',
      NEW.user_id, NEW.exercise_id, SQLERRM;
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION progress_tracking.trg_sync_average_score() IS
'Trigger function que sincroniza average_score en module_progress cuando se modifica un exercise_submission.';

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS trg_sync_average_score_on_submission ON progress_tracking.exercise_submissions;

-- Crear trigger AFTER INSERT OR UPDATE
CREATE TRIGGER trg_sync_average_score_on_submission
    AFTER INSERT OR UPDATE OF score, is_correct ON progress_tracking.exercise_submissions
    FOR EACH ROW
    EXECUTE FUNCTION progress_tracking.trg_sync_average_score();

-- Comentario descriptivo
COMMENT ON TRIGGER trg_sync_average_score_on_submission ON progress_tracking.exercise_submissions IS
    'Sincroniza average_score en module_progress cuando se inserta o actualiza el score de un submission. '
    'Complementa al trigger 27 que maneja completed_exercises y progress_percentage.';

-- Permisos
GRANT EXECUTE ON FUNCTION progress_tracking.trg_sync_average_score() TO gamilit_user;
