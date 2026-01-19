-- =====================================================
-- Trigger: trg_update_submitted_progress_on_submission
-- Descripcion: Actualiza submitted_progress_percentage en module_progress
--              cuando se crea un nuevo submission
-- Schema: progress_tracking
-- Autor: TASK-2026-01-18-011 (FIX-DB-003)
-- Fecha: 2026-01-18
-- =====================================================
--
-- PROPOSITO:
-- Este trigger actualiza el submitted_exercises y submitted_progress_percentage
-- en module_progress cuando un estudiante envia un ejercicio (INSERT en
-- exercise_submissions). Esto permite trackear el progreso de "enviados"
-- separado del progreso de "calificados/correctos".
--
-- DIFERENCIA CON trg_update_module_progress_on_submission (27-*):
-- - Este trigger: Se dispara en INSERT (cuando se envia)
-- - Trigger 27: Se dispara en UPDATE (cuando se califica con score >= 60)
--
-- FEATURE M3-M5:
-- Las columnas submitted_exercises y submitted_progress_percentage fueron
-- agregadas para soportar el flujo de ejercicios con revision manual donde:
-- - submitted_progress = progreso visual para el estudiante (lo que envio)
-- - graded_progress = progreso real para recompensas (lo que aprobo)
--
-- USO:
-- Se dispara automaticamente en cada INSERT de exercise_submissions.
-- No requiere invocacion manual.
--

-- Funcion que ejecuta la logica de actualizacion
CREATE OR REPLACE FUNCTION progress_tracking.update_submitted_progress_on_submission()
RETURNS TRIGGER AS $$
DECLARE
  v_module_id UUID;
  v_classroom_id UUID;
  v_total_exercises INT;
  v_submitted_count INT;
  v_submitted_percentage NUMERIC(5,2);
BEGIN
  -- Obtener module_id del ejercicio
  SELECT e.module_id INTO v_module_id
  FROM educational_content.exercises e
  WHERE e.id = NEW.exercise_id;

  IF v_module_id IS NULL THEN
    -- Ejercicio no encontrado o sin modulo, no hacer nada
    RETURN NEW;
  END IF;

  -- Obtener classroom_id del module_progress existente (si existe)
  SELECT mp.classroom_id INTO v_classroom_id
  FROM progress_tracking.module_progress mp
  WHERE mp.user_id = NEW.user_id AND mp.module_id = v_module_id
  LIMIT 1;

  -- Contar ejercicios totales activos del modulo
  SELECT COUNT(*) INTO v_total_exercises
  FROM educational_content.exercises e
  WHERE e.module_id = v_module_id AND e.is_active = true;

  IF v_total_exercises = 0 THEN
    -- Modulo sin ejercicios, no hacer nada
    RETURN NEW;
  END IF;

  -- Contar submissions unicos del usuario en este modulo
  -- (cualquier status excepto 'draft')
  SELECT COUNT(DISTINCT es.exercise_id) INTO v_submitted_count
  FROM progress_tracking.exercise_submissions es
  JOIN educational_content.exercises e ON es.exercise_id = e.id
  WHERE es.user_id = NEW.user_id
    AND e.module_id = v_module_id
    AND es.status IN ('submitted', 'pending_review', 'graded', 'reviewed');

  -- Calcular porcentaje
  v_submitted_percentage := ROUND((v_submitted_count::NUMERIC / v_total_exercises) * 100, 2);

  -- Actualizar module_progress (INSERT si no existe)
  INSERT INTO progress_tracking.module_progress (
    user_id,
    module_id,
    classroom_id,
    submitted_exercises,
    submitted_progress_percentage,
    status,
    updated_at
  )
  VALUES (
    NEW.user_id,
    v_module_id,
    v_classroom_id,
    v_submitted_count,
    v_submitted_percentage,
    CASE
      WHEN v_submitted_count > 0 THEN 'in_progress'::progress_tracking.progress_status
      ELSE 'not_started'::progress_tracking.progress_status
    END,
    NOW()
  )
  ON CONFLICT (user_id, module_id)
  DO UPDATE SET
    submitted_exercises = v_submitted_count,
    submitted_progress_percentage = v_submitted_percentage,
    status = CASE
      WHEN progress_tracking.module_progress.status = 'completed' THEN 'completed'::progress_tracking.progress_status
      WHEN v_submitted_count > 0 THEN 'in_progress'::progress_tracking.progress_status
      ELSE progress_tracking.module_progress.status
    END,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
DROP TRIGGER IF EXISTS trg_update_submitted_progress_on_submission ON progress_tracking.exercise_submissions;

CREATE TRIGGER trg_update_submitted_progress_on_submission
AFTER INSERT ON progress_tracking.exercise_submissions
FOR EACH ROW
WHEN (NEW.status != 'draft')  -- Solo cuando no es borrador
EXECUTE FUNCTION progress_tracking.update_submitted_progress_on_submission();

-- Comentario descriptivo
COMMENT ON FUNCTION progress_tracking.update_submitted_progress_on_submission() IS
  'FIX-DB-003-2026-01-18: Actualiza submitted_exercises y submitted_progress_percentage en module_progress cuando se crea un nuevo submission. Soporta feature M3-M5 de tracking separado entre enviados vs calificados.';

COMMENT ON TRIGGER trg_update_submitted_progress_on_submission ON progress_tracking.exercise_submissions IS
  'FIX-DB-003-2026-01-18: Dispara actualizacion de submitted_progress al insertar submissions (excepto drafts).';
