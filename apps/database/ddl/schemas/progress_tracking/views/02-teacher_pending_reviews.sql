-- =============================================================================
-- VIEW: progress_tracking.teacher_pending_reviews
-- =============================================================================
-- Purpose: Consolidated view of student submissions requiring teacher review
-- Priority: P2-05 - Teacher Portal pending reviews dashboard
-- Created: 2025-12-18
--
-- DESCRIPTION:
-- This view aggregates exercise submissions that need manual grading or review,
-- providing teachers with a prioritized queue of work items. It includes
-- student info, exercise details, submission timestamps, and urgency indicators.
--
-- USE CASES:
-- - Teacher dashboard pending review count
-- - Grading queue interface
-- - Priority-based review workflow
-- - Bulk grading operations
-- =============================================================================

DROP VIEW IF EXISTS progress_tracking.teacher_pending_reviews CASCADE;

CREATE VIEW progress_tracking.teacher_pending_reviews AS
SELECT
    -- Submission identifiers
    es.id AS submission_id,
    es.exercise_id,
    es.user_id AS student_id,

    -- Student info
    p.full_name AS student_name,
    p.email AS student_email,  -- FIX: Changed from p.username (column does not exist in profiles)

    -- Exercise info
    e.title AS exercise_title,
    e.exercise_type,  -- FIX: Removed e.mechanic_type (column does not exist)
    m.title AS module_title,
    m.order_index AS module_order,  -- FIX: Changed from m.module_order (column name is order_index)

    -- Classroom info
    cm.classroom_id,
    c.name AS classroom_name,

    -- Submission details
    es.score,
    es.time_spent_seconds,  -- FIX: Changed from time_spent
    es.attempt_number,      -- FIX: Changed from attempts
    es.answer_data,         -- FIX: Changed from answers
    es.feedback,
    es.submitted_at,
    es.created_at AS submission_date,

    -- Review status
    CASE
        WHEN es.graded_at IS NOT NULL THEN 'graded'
        WHEN es.submitted_at IS NOT NULL THEN 'pending'
        ELSE 'in_progress'
    END AS review_status,
    es.graded_at,
    -- FIX: Removed es.graded_by (column does not exist)

    -- Priority calculation
    CASE
        WHEN es.submitted_at < NOW() - INTERVAL '7 days' THEN 'urgent'
        WHEN es.submitted_at < NOW() - INTERVAL '3 days' THEN 'high'
        WHEN es.submitted_at < NOW() - INTERVAL '1 day' THEN 'medium'
        ELSE 'normal'
    END AS priority,

    -- Days waiting
    EXTRACT(DAY FROM (NOW() - es.submitted_at))::integer AS days_waiting

    -- FIX: Removed es.metadata and es.tenant_id (columns do not exist)

FROM progress_tracking.exercise_submissions es
-- Join to get student profile
INNER JOIN auth_management.profiles p ON es.user_id = p.id
-- Join to get exercise details
INNER JOIN educational_content.exercises e ON es.exercise_id = e.id
-- Join to get module info
INNER JOIN educational_content.modules m ON e.module_id = m.id
-- Join to find student's classroom(s)
LEFT JOIN social_features.classroom_members cm ON es.user_id = cm.student_id
    AND cm.is_active = true
-- Join to get classroom name
LEFT JOIN social_features.classrooms c ON cm.classroom_id = c.id

WHERE
    -- Only submissions that need review
    es.graded_at IS NULL
    AND es.submitted_at IS NOT NULL
    -- Only exercises that require manual grading
    -- FIX: Simplified - use only requires_manual_grading flag (removed invalid exercise_type list)
    AND e.requires_manual_grading = true

ORDER BY
    -- Urgent items first
    CASE
        WHEN es.submitted_at < NOW() - INTERVAL '7 days' THEN 1
        WHEN es.submitted_at < NOW() - INTERVAL '3 days' THEN 2
        WHEN es.submitted_at < NOW() - INTERVAL '1 day' THEN 3
        ELSE 4
    END,
    -- Then by submission date (oldest first)
    es.submitted_at ASC;

-- Set ownership
ALTER VIEW progress_tracking.teacher_pending_reviews OWNER TO gamilit_user;

-- Comments
COMMENT ON VIEW progress_tracking.teacher_pending_reviews IS
'Consolidated view of student submissions requiring teacher review. Shows pending items with priority based on wait time.';

COMMENT ON COLUMN progress_tracking.teacher_pending_reviews.priority IS
'Priority based on wait time: urgent (>7 days), high (3-7 days), medium (1-3 days), normal (<1 day)';

COMMENT ON COLUMN progress_tracking.teacher_pending_reviews.days_waiting IS
'Number of days the submission has been waiting for review';

-- Grants
GRANT SELECT ON progress_tracking.teacher_pending_reviews TO gamilit_user;
GRANT SELECT ON progress_tracking.teacher_pending_reviews TO authenticated;

-- =============================================================================
-- HELPER FUNCTION: Get pending reviews count for a teacher
-- =============================================================================

CREATE OR REPLACE FUNCTION progress_tracking.get_teacher_pending_reviews_count(
    p_teacher_id uuid,
    p_classroom_id uuid DEFAULT NULL
)
RETURNS TABLE (
    total_pending bigint,
    urgent_count bigint,
    high_count bigint,
    medium_count bigint,
    normal_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::bigint AS total_pending,
        COUNT(*) FILTER (WHERE pr.priority = 'urgent')::bigint AS urgent_count,
        COUNT(*) FILTER (WHERE pr.priority = 'high')::bigint AS high_count,
        COUNT(*) FILTER (WHERE pr.priority = 'medium')::bigint AS medium_count,
        COUNT(*) FILTER (WHERE pr.priority = 'normal')::bigint AS normal_count
    FROM progress_tracking.teacher_pending_reviews pr
    WHERE EXISTS (
        SELECT 1 FROM social_features.teacher_classrooms tc
        WHERE tc.teacher_id = p_teacher_id
        AND tc.classroom_id = pr.classroom_id
        AND tc.is_active = true
    )
    AND (p_classroom_id IS NULL OR pr.classroom_id = p_classroom_id);
END;
$$;

ALTER FUNCTION progress_tracking.get_teacher_pending_reviews_count(uuid, uuid) OWNER TO gamilit_user;

COMMENT ON FUNCTION progress_tracking.get_teacher_pending_reviews_count IS
'Returns count of pending reviews for a teacher, optionally filtered by classroom. Includes breakdown by priority level.';

GRANT EXECUTE ON FUNCTION progress_tracking.get_teacher_pending_reviews_count(uuid, uuid) TO gamilit_user;
GRANT EXECUTE ON FUNCTION progress_tracking.get_teacher_pending_reviews_count(uuid, uuid) TO authenticated;
