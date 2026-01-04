-- ============================================================================
-- Seed: Manual Reviews para Teacher Portal
-- Schema: progress_tracking
-- Descripcion: Crea reviews pendientes para testing del panel de revisiones M3-M5
-- Dependencias: exercise_submissions, profiles (teachers)
-- Fecha: 2025-12-27
-- ============================================================================

-- Verificar dependencias antes de insertar
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM progress_tracking.exercise_submissions LIMIT 1) THEN
    RAISE NOTICE 'ADVERTENCIA: exercise_submissions esta vacia. Ejecute seeds de ejercicios primero.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM auth_management.profiles WHERE role = 'admin_teacher' LIMIT 1) THEN
    RAISE NOTICE 'ADVERTENCIA: No hay teachers en profiles. Ejecute seeds de usuarios primero.';
  END IF;
END $$;

-- Insertar reviews pendientes para ejercicios de modulos 3, 4 y 5
INSERT INTO progress_tracking.manual_reviews (
  id,
  submission_id,
  reviewer_id,
  rubric_scores,
  total_score,
  general_feedback,
  detailed_feedback,
  status,
  started_at,
  completed_at,
  created_at
)
SELECT
  gen_random_uuid(),
  es.id AS submission_id,
  t.id AS reviewer_id,
  '{}' AS rubric_scores,
  NULL AS total_score,
  NULL AS general_feedback,
  NULL AS detailed_feedback,
  'pending' AS status,
  NULL AS started_at,
  NULL AS completed_at,
  NOW() - (random() * interval '7 days') AS created_at
FROM progress_tracking.exercise_submissions es
CROSS JOIN LATERAL (
  -- Obtener un teacher aleatorio para asignar como reviewer
  SELECT id FROM auth_management.profiles
  WHERE role = 'admin_teacher'
  ORDER BY random()
  LIMIT 1
) t
WHERE es.exercise_id IN (
  -- Solo ejercicios de modulos 3, 4 y 5 que requieren revision manual
  SELECT e.id
  FROM educational_content.exercises e
  JOIN educational_content.modules m ON e.module_id = m.id
  WHERE m.order_index IN (3, 4, 5)
)
-- Limitar a 10 reviews para DEV
LIMIT 10
ON CONFLICT (submission_id) DO NOTHING;

-- Insertar algunos reviews en progreso (in_progress)
INSERT INTO progress_tracking.manual_reviews (
  id,
  submission_id,
  reviewer_id,
  rubric_scores,
  total_score,
  general_feedback,
  status,
  started_at,
  created_at
)
SELECT
  gen_random_uuid(),
  es.id AS submission_id,
  t.id AS reviewer_id,
  '{"creativity": 20, "accuracy": 15}' AS rubric_scores,
  NULL AS total_score,
  NULL AS general_feedback,
  'in_progress' AS status,
  NOW() - interval '1 hour' AS started_at,
  NOW() - interval '2 hours' AS created_at
FROM progress_tracking.exercise_submissions es
CROSS JOIN LATERAL (
  SELECT id FROM auth_management.profiles
  WHERE role = 'admin_teacher'
  ORDER BY random()
  LIMIT 1
) t
WHERE es.id NOT IN (SELECT submission_id FROM progress_tracking.manual_reviews)
  AND es.exercise_id IN (
    SELECT e.id
    FROM educational_content.exercises e
    JOIN educational_content.modules m ON e.module_id = m.id
    WHERE m.order_index IN (4, 5)
  )
LIMIT 3
ON CONFLICT (submission_id) DO NOTHING;

-- Insertar algunos reviews completados como historial
INSERT INTO progress_tracking.manual_reviews (
  id,
  submission_id,
  reviewer_id,
  rubric_scores,
  total_score,
  general_feedback,
  detailed_feedback,
  status,
  started_at,
  completed_at,
  created_at
)
SELECT
  gen_random_uuid(),
  es.id AS submission_id,
  t.id AS reviewer_id,
  '{"creativity": 25, "accuracy": 30, "presentation": 20}' AS rubric_scores,
  75 AS total_score,
  'Buen trabajo en general. Se nota esfuerzo en la presentacion.' AS general_feedback,
  '{"creativity": "Ideas originales", "accuracy": "Algunos errores menores", "presentation": "Excelente formato"}' AS detailed_feedback,
  'completed' AS status,
  NOW() - interval '3 days' AS started_at,
  NOW() - interval '2 days' AS completed_at,
  NOW() - interval '5 days' AS created_at
FROM progress_tracking.exercise_submissions es
CROSS JOIN LATERAL (
  SELECT id FROM auth_management.profiles
  WHERE role = 'admin_teacher'
  ORDER BY random()
  LIMIT 1
) t
WHERE es.id NOT IN (SELECT submission_id FROM progress_tracking.manual_reviews)
  AND es.exercise_id IN (
    SELECT e.id
    FROM educational_content.exercises e
    JOIN educational_content.modules m ON e.module_id = m.id
    WHERE m.order_index IN (3, 4, 5)
  )
LIMIT 5
ON CONFLICT (submission_id) DO NOTHING;

-- Reporte de registros creados
DO $$
DECLARE
  total_count INTEGER;
  pending_count INTEGER;
  in_progress_count INTEGER;
  completed_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count FROM progress_tracking.manual_reviews;
  SELECT COUNT(*) INTO pending_count FROM progress_tracking.manual_reviews WHERE status = 'pending';
  SELECT COUNT(*) INTO in_progress_count FROM progress_tracking.manual_reviews WHERE status = 'in_progress';
  SELECT COUNT(*) INTO completed_count FROM progress_tracking.manual_reviews WHERE status = 'completed';

  RAISE NOTICE 'Manual Reviews creados: % total (% pending, % in_progress, % completed)',
    total_count, pending_count, in_progress_count, completed_count;
END $$;
