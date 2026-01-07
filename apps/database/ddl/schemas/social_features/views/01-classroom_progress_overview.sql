-- =============================================================================
-- VIEW: social_features.classroom_progress_overview
-- =============================================================================
-- Purpose: Aggregated progress view for Teacher Portal classroom monitoring
-- Priority: P1-03 - Teacher Portal optimization
-- Created: 2025-12-18
-- =============================================================================

CREATE OR REPLACE VIEW social_features.classroom_progress_overview AS
SELECT
    c.id AS classroom_id,
    c.name AS classroom_name,
    c.teacher_id,

    -- Student counts
    COUNT(DISTINCT cm.student_id) FILTER (WHERE cm.status = 'active') AS total_students,
    -- ISS-DB-004: Fixed - mp table uses user_id (2026-01-04)
    COUNT(DISTINCT mp.user_id) FILTER (WHERE mp.status = 'completed') AS students_completed,

    -- Progress metrics (ISS-DB-008: Fixed - mp uses average_score, not score)
    COALESCE(ROUND(AVG(mp.progress_percentage)::numeric, 2), 0) AS avg_progress,
    COALESCE(ROUND(AVG(mp.average_score)::numeric, 2), 0) AS avg_score,

    -- Alert counts (ISS-DB-005: Fixed - sia uses 'active', not 'pending')
    COUNT(DISTINCT sia.id) FILTER (WHERE sia.status = 'active') AS pending_alerts,
    COUNT(DISTINCT sia.id) FILTER (WHERE sia.status = 'acknowledged') AS acknowledged_alerts,

    -- Review counts (ISS-DB-006: Fixed - es uses status='pending_review', not needs_review column)
    COUNT(DISTINCT es.id) FILTER (WHERE es.status = 'pending_review') AS pending_reviews,

    -- Activity metrics
    COUNT(DISTINCT es.id) AS total_submissions,
    MAX(es.submitted_at) AS last_activity,

    -- Module completion
    COUNT(DISTINCT mp.module_id) FILTER (WHERE mp.status = 'completed') AS modules_completed,
    COUNT(DISTINCT mp.module_id) AS modules_started,

    -- Timestamps
    c.created_at AS classroom_created_at,
    c.updated_at AS classroom_updated_at

FROM social_features.classrooms c
LEFT JOIN social_features.classroom_members cm
    ON c.id = cm.classroom_id AND cm.status = 'active'
-- ISS-DB-003: Fixed reference - table has user_id, not student_id (2026-01-04)
LEFT JOIN progress_tracking.module_progress mp
    ON cm.student_id = mp.user_id
-- ISS-DB-002: Fixed reference - table has classroom_id, not teacher_id (2026-01-04)
LEFT JOIN progress_tracking.student_intervention_alerts sia
    ON cm.student_id = sia.student_id AND sia.classroom_id = c.id
-- ISS-DB-007: Fixed reference - es table uses user_id, not student_id (2026-01-04)
LEFT JOIN progress_tracking.exercise_submissions es
    ON cm.student_id = es.user_id
WHERE
    c.is_deleted = FALSE
GROUP BY
    c.id, c.name, c.teacher_id, c.created_at, c.updated_at;

-- Grant permissions
GRANT SELECT ON social_features.classroom_progress_overview TO authenticated;

-- Documentation
COMMENT ON VIEW social_features.classroom_progress_overview IS
'Teacher Portal view for classroom progress monitoring.

Columns:
  - classroom_id/name: Classroom identification
  - teacher_id: Owner teacher
  - total_students: Active students in classroom
  - students_completed: Students who completed at least one module
  - avg_progress: Average progress percentage (0-100)
  - avg_score: Average score across all modules
  - pending_alerts: Count of pending intervention alerts
  - acknowledged_alerts: Count of acknowledged alerts
  - pending_reviews: Submissions needing manual review
  - total_submissions: Total exercise submissions
  - last_activity: Most recent submission timestamp
  - modules_completed/started: Module completion stats

Usage:
  -- Get all classrooms for a teacher
  SELECT * FROM social_features.classroom_progress_overview
  WHERE teacher_id = :teacher_id;

  -- Find classrooms needing attention
  SELECT * FROM social_features.classroom_progress_overview
  WHERE pending_alerts > 0 OR pending_reviews > 5
  ORDER BY pending_alerts DESC;

Created: 2025-12-18 (P1-03 Teacher Portal Analysis)';
