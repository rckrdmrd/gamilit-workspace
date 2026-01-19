-- =====================================================
-- Funcion: sync_module_progress_scores
-- Descripcion: Sincroniza average_score y contadores en module_progress
--              basandose en exercise_submissions
-- Schema: progress_tracking
-- Autor: Claude Opus 4.5 (TASK-2026-01-19-005)
-- Fecha: 2026-01-19
-- =====================================================
--
-- PROPOSITO:
-- Esta funcion recalcula los campos de estadisticas en module_progress
-- basandose en los datos reales de exercise_submissions. Es llamada
-- automaticamente por un trigger cuando se inserta/actualiza una submission.
--
-- CAMPOS ACTUALIZADOS:
-- - average_score: Promedio de (score/max_score * 100) de todas las submissions
-- - completed_exercises: Conteo de ejercicios con is_correct = true
-- - total_exercises: Conteo total de ejercicios unicos intentados
--
-- USO:
-- Automatico via trigger, o manual:
-- SELECT progress_tracking.sync_module_progress_scores('user-uuid', 'module-uuid');
--

CREATE OR REPLACE FUNCTION progress_tracking.sync_module_progress_scores(
  p_user_id UUID,
  p_module_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_avg_score NUMERIC(5,2);
  v_completed_count INTEGER;
  v_total_count INTEGER;
  v_updated INTEGER;
BEGIN
  -- Calcular estadisticas desde exercise_submissions
  -- Solo considera ejercicios del modulo especificado
  SELECT
    ROUND(AVG(
      CASE
        WHEN es.max_score > 0 THEN (es.score::NUMERIC / es.max_score * 100)
        ELSE 0
      END
    ), 2),
    COUNT(DISTINCT CASE WHEN es.is_correct = true THEN es.exercise_id END),
    COUNT(DISTINCT es.exercise_id)
  INTO v_avg_score, v_completed_count, v_total_count
  FROM progress_tracking.exercise_submissions es
  JOIN educational_content.exercises e ON es.exercise_id = e.id
  WHERE es.user_id = p_user_id
    AND e.module_id = p_module_id;

  -- Si no hay submissions, no hacer nada
  IF v_total_count = 0 THEN
    RETURN;
  END IF;

  -- Actualizar module_progress
  UPDATE progress_tracking.module_progress
  SET
    average_score = COALESCE(v_avg_score, 0),
    completed_exercises = COALESCE(v_completed_count, 0),
    total_exercises = GREATEST(total_exercises, COALESCE(v_total_count, 0)),
    updated_at = NOW()
  WHERE user_id = p_user_id
    AND module_id = p_module_id;

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  -- Si no existe module_progress, crear uno
  IF v_updated = 0 THEN
    INSERT INTO progress_tracking.module_progress (
      user_id,
      module_id,
      average_score,
      completed_exercises,
      total_exercises,
      status,
      progress_percentage
    ) VALUES (
      p_user_id,
      p_module_id,
      COALESCE(v_avg_score, 0),
      COALESCE(v_completed_count, 0),
      COALESCE(v_total_count, 0),
      'in_progress',
      0
    )
    ON CONFLICT (user_id, module_id) DO UPDATE SET
      average_score = EXCLUDED.average_score,
      completed_exercises = EXCLUDED.completed_exercises,
      total_exercises = GREATEST(progress_tracking.module_progress.total_exercises, EXCLUDED.total_exercises),
      updated_at = NOW();
  END IF;

END;
$$;

-- Comentario de la funcion
COMMENT ON FUNCTION progress_tracking.sync_module_progress_scores(UUID, UUID) IS
'Sincroniza average_score, completed_exercises y total_exercises en module_progress basandose en exercise_submissions. Llamada automaticamente por trigger o manualmente.';

-- =====================================================
-- Funcion auxiliar: sync_all_module_progress_scores
-- Para sincronizacion masiva inicial
-- =====================================================

CREATE OR REPLACE FUNCTION progress_tracking.sync_all_module_progress_scores()
RETURNS TABLE(
  user_id UUID,
  module_id UUID,
  old_score NUMERIC,
  new_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Retornar cambios realizados
  RETURN QUERY
  WITH submissions_stats AS (
    SELECT
      es.user_id,
      e.module_id,
      ROUND(AVG(
        CASE
          WHEN es.max_score > 0 THEN (es.score::NUMERIC / es.max_score * 100)
          ELSE 0
        END
      ), 2) as calc_avg_score,
      COUNT(DISTINCT CASE WHEN es.is_correct = true THEN es.exercise_id END) as calc_completed,
      COUNT(DISTINCT es.exercise_id) as calc_total
    FROM progress_tracking.exercise_submissions es
    JOIN educational_content.exercises e ON es.exercise_id = e.id
    GROUP BY es.user_id, e.module_id
  ),
  updates AS (
    UPDATE progress_tracking.module_progress mp
    SET
      average_score = ss.calc_avg_score,
      completed_exercises = ss.calc_completed,
      total_exercises = GREATEST(mp.total_exercises, ss.calc_total),
      updated_at = NOW()
    FROM submissions_stats ss
    WHERE mp.user_id = ss.user_id
      AND mp.module_id = ss.module_id
    RETURNING mp.user_id, mp.module_id, mp.average_score as new_avg
  )
  SELECT
    u.user_id,
    u.module_id,
    NULL::NUMERIC as old_score,
    u.new_avg as new_score
  FROM updates u;
END;
$$;

COMMENT ON FUNCTION progress_tracking.sync_all_module_progress_scores() IS
'Sincroniza todos los module_progress que tienen exercise_submissions. Retorna los cambios realizados.';
