-- TASK-2026-01-18-012: Script de Correccion de Datos
-- =====================================================
-- Este script corrige reviews que fueron marcados como 'completed'
-- sin haber guardado la evaluacion (totalScore, rubricScores) correctamente.
--
-- PROBLEMA: Reviews con status='completed' pero:
--   - total_score = NULL
--   - rubric_scores = '{}'
--   - submission.status = 'submitted' (no 'graded')
--   - xp_earned = 0, ml_coins_earned = 0
--
-- SOLUCION: Revertir a 'pending' para permitir re-evaluacion
-- =====================================================

-- =====================================================
-- PASO 1: DIAGNOSTICO - Identificar reviews afectados
-- =====================================================

-- Buscar todos los reviews completados sin scores
SELECT
    mr.id AS review_id,
    mr.status AS review_status,
    mr.total_score,
    mr.rubric_scores,
    mr.completed_at,
    es.status AS submission_status,
    es.score AS submission_score,
    es.xp_earned,
    es.ml_coins_earned,
    u.name AS student_name,
    e.title AS exercise_title
FROM progress_tracking.manual_reviews mr
JOIN progress_tracking.exercise_submissions es ON mr.submission_id = es.id
JOIN identity.users u ON es.user_id = u.id
JOIN educational.exercises e ON es.exercise_id = e.id
WHERE mr.status = 'completed'
  AND (
    mr.total_score IS NULL
    OR mr.rubric_scores = '{}'::jsonb
    OR mr.rubric_scores IS NULL
  );

-- =====================================================
-- PASO 2: CORRECCION - Revertir reviews afectados
-- =====================================================

-- NOTA: Ejecutar con cuidado. Esto revertira los reviews para re-evaluacion.
-- Comentar/descomentar segun necesidad.

/*
-- Opcion A: Corregir review especifico conocido
UPDATE progress_tracking.manual_reviews
SET
    status = 'pending',
    completed_at = NULL,
    updated_at = NOW()
WHERE id = '6e86601b-b6bc-4ccb-9ab3-fc38d0400851'
  AND total_score IS NULL;

-- Resetear submission asociado
UPDATE progress_tracking.exercise_submissions
SET
    status = 'submitted',
    graded_at = NULL,
    score = 0,
    updated_at = NOW()
WHERE id = (
    SELECT submission_id
    FROM progress_tracking.manual_reviews
    WHERE id = '6e86601b-b6bc-4ccb-9ab3-fc38d0400851'
);
*/

/*
-- Opcion B: Corregir TODOS los reviews afectados (usar con precaucion)
UPDATE progress_tracking.manual_reviews
SET
    status = 'pending',
    completed_at = NULL,
    updated_at = NOW()
WHERE status = 'completed'
  AND (
    total_score IS NULL
    OR rubric_scores = '{}'::jsonb
    OR rubric_scores IS NULL
  );

-- Resetear todas las submissions asociadas
UPDATE progress_tracking.exercise_submissions es
SET
    status = 'submitted',
    graded_at = NULL,
    score = 0,
    updated_at = NOW()
FROM progress_tracking.manual_reviews mr
WHERE es.id = mr.submission_id
  AND mr.status = 'pending'
  AND mr.completed_at IS NULL
  AND es.status = 'graded'
  AND (es.xp_earned = 0 OR es.xp_earned IS NULL);
*/

-- =====================================================
-- PASO 3: VERIFICACION - Confirmar correccion
-- =====================================================

-- Verificar que no hay reviews completados sin scores
SELECT COUNT(*) AS reviews_sin_corregir
FROM progress_tracking.manual_reviews
WHERE status = 'completed'
  AND (
    total_score IS NULL
    OR rubric_scores = '{}'::jsonb
    OR rubric_scores IS NULL
  );

-- El resultado debe ser 0 despues de la correccion.

-- =====================================================
-- NOTAS
-- =====================================================
--
-- 1. Este script solo revierte el estado para permitir re-evaluacion
-- 2. Las recompensas se otorgaran correctamente cuando se re-evaluen
-- 3. Si el review original tenia una evaluacion valida que se perdio,
--    el profesor debera volver a evaluar
-- 4. Para datos de prueba/desarrollo, considerar eliminar directamente
--
-- ALTERNATIVA para datos de prueba:
-- DELETE FROM progress_tracking.manual_reviews WHERE id = '...';
--
-- =====================================================
