-- ============================================================================
-- Script: fix-missing-manual-reviews.sql
-- Descripcion: Crea ManualReviews para submissions existentes que no los tienen
-- Autor: Claude Opus 4.5
-- Fecha: 2026-01-07
-- Bug Fix: BUG-TEACHER-REVIEWS-002
-- ============================================================================
--
-- PROPOSITO:
-- Antes del fix del trigger, algunas submissions pudieron haberse creado via
-- el flujo draft->submitted (UPDATE) sin que se creara el ManualReview.
-- Este script identifica y corrige esas submissions.
--
-- SEGURIDAD:
-- - Solo afecta submissions con requires_manual_grading=true
-- - Solo submissions en status='submitted' sin calificar
-- - No duplica ManualReviews existentes (NOT EXISTS)
--
-- ============================================================================

\echo '============================================================================'
\echo 'INICIO: Fix Missing Manual Reviews'
\echo '============================================================================'

-- Mostrar submissions afectadas ANTES del fix
\echo ''
\echo 'Submissions sin ManualReview (ANTES del fix):'
SELECT
    es.id AS submission_id,
    p.full_name AS student_name,
    e.title AS exercise_title,
    m.title AS module_title,
    es.status,
    es.submitted_at
FROM progress_tracking.exercise_submissions es
INNER JOIN educational_content.exercises e ON es.exercise_id = e.id
INNER JOIN educational_content.modules m ON e.module_id = m.id
INNER JOIN auth_management.profiles p ON es.user_id = p.id
WHERE es.status = 'submitted'
  AND es.graded_at IS NULL
  AND e.requires_manual_grading = TRUE
  AND NOT EXISTS (
      SELECT 1 FROM progress_tracking.manual_reviews mr
      WHERE mr.submission_id = es.id
  )
ORDER BY es.submitted_at ASC;

-- Contar antes del fix
\echo ''
\echo 'Conteo de submissions sin ManualReview:'
SELECT COUNT(*) AS missing_count
FROM progress_tracking.exercise_submissions es
INNER JOIN educational_content.exercises e ON es.exercise_id = e.id
WHERE es.status = 'submitted'
  AND es.graded_at IS NULL
  AND e.requires_manual_grading = TRUE
  AND NOT EXISTS (
      SELECT 1 FROM progress_tracking.manual_reviews mr
      WHERE mr.submission_id = es.id
  );

-- ============================================================================
-- CREAR MANUAL_REVIEWS FALTANTES
-- ============================================================================

\echo ''
\echo 'Creando ManualReviews faltantes...'

INSERT INTO progress_tracking.manual_reviews (
    submission_id,
    reviewer_id,
    status,
    rubric_scores,
    created_at
)
SELECT
    es.id AS submission_id,
    -- Buscar teacher del classroom, o admin por defecto
    COALESCE(
        -- Opcion 1: Teacher del classroom del estudiante
        (
            SELECT c.teacher_id
            FROM social_features.classrooms c
            INNER JOIN social_features.classroom_members cm ON c.id = cm.classroom_id
            WHERE cm.student_id = es.user_id
              AND cm.is_active = TRUE
            ORDER BY cm.created_at DESC
            LIMIT 1
        ),
        -- Opcion 2: Admin teacher por defecto
        (
            SELECT id
            FROM auth_management.profiles
            WHERE role IN ('admin_teacher', 'super_admin')
              AND is_active = TRUE
            ORDER BY created_at ASC
            LIMIT 1
        )
    ) AS reviewer_id,
    'pending' AS status,
    '{}'::jsonb AS rubric_scores,
    gamilit.now_mexico() AS created_at
FROM progress_tracking.exercise_submissions es
INNER JOIN educational_content.exercises e ON es.exercise_id = e.id
WHERE es.status = 'submitted'
  AND es.graded_at IS NULL
  AND e.requires_manual_grading = TRUE
  AND NOT EXISTS (
      SELECT 1 FROM progress_tracking.manual_reviews mr
      WHERE mr.submission_id = es.id
  );

-- ============================================================================
-- VERIFICACION POST-FIX
-- ============================================================================

\echo ''
\echo 'ManualReviews creados (verificacion):'
SELECT
    mr.id AS review_id,
    mr.submission_id,
    p_reviewer.full_name AS reviewer_name,
    mr.status,
    mr.created_at
FROM progress_tracking.manual_reviews mr
INNER JOIN auth_management.profiles p_reviewer ON mr.reviewer_id = p_reviewer.id
WHERE mr.created_at >= (NOW() - INTERVAL '5 minutes')
ORDER BY mr.created_at DESC;

-- Contar despues del fix
\echo ''
\echo 'Conteo de submissions sin ManualReview (DESPUES del fix - deberia ser 0):'
SELECT COUNT(*) AS missing_count
FROM progress_tracking.exercise_submissions es
INNER JOIN educational_content.exercises e ON es.exercise_id = e.id
WHERE es.status = 'submitted'
  AND es.graded_at IS NULL
  AND e.requires_manual_grading = TRUE
  AND NOT EXISTS (
      SELECT 1 FROM progress_tracking.manual_reviews mr
      WHERE mr.submission_id = es.id
  );

\echo ''
\echo '============================================================================'
\echo 'FIN: Fix Missing Manual Reviews'
\echo '============================================================================'
