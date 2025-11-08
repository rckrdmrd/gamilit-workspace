-- =============================================================================
-- VIEW: public.assignment_submission_stats
-- =============================================================================
-- Purpose: Provides comprehensive statistics on assignment submissions
-- Priority: P2 - Analytics view for assignment tracking
-- Responsibility: SA-DB-031
-- Created: 2025-11-02
-- =============================================================================

CREATE OR REPLACE VIEW public.assignment_submission_stats AS
SELECT
    a.id AS assignment_id,
    a.title AS assignment_title,
    c.id AS classroom_id,
    c.name AS classroom_name,
    COUNT(DISTINCT es.id) AS total_submissions,
    COUNT(DISTINCT CASE WHEN es.status = 'SUBMITTED' THEN es.id END) AS completed_submissions,
    COUNT(DISTINCT CASE WHEN es.status = 'PENDING' THEN es.id END) AS pending_submissions,
    COUNT(DISTINCT CASE WHEN es.status = 'DRAFT' THEN es.id END) AS draft_submissions,
    COUNT(DISTINCT CASE WHEN es.status = 'GRADED' THEN es.id END) AS graded_submissions,
    ROUND(
        COUNT(DISTINCT CASE WHEN es.status IN ('SUBMITTED', 'GRADED') THEN es.id END)::NUMERIC /
        NULLIF(COUNT(DISTINCT u.id), 0) * 100,
        2
    ) AS submission_rate_percent,
    AVG(CASE WHEN eg.score IS NOT NULL THEN eg.score ELSE NULL END) AS avg_score,
    MAX(CASE WHEN eg.score IS NOT NULL THEN eg.score ELSE NULL END) AS max_score,
    MIN(CASE WHEN eg.score IS NOT NULL THEN eg.score ELSE NULL END) AS min_score,
    a.created_at AS assignment_created_at,
    a.due_date AS assignment_due_date,
    COUNT(DISTINCT u.id) AS total_students
FROM
    educational_content.assignments a
    LEFT JOIN educational_content.classrooms c ON a.classroom_id = c.id
    LEFT JOIN educational_content.exercise_submissions es ON a.id = es.assignment_id
    LEFT JOIN educational_content.exercise_grades eg ON es.id = eg.submission_id
    LEFT JOIN gamilit.users u ON u.classroom_id = c.id
WHERE
    a.is_deleted = FALSE
GROUP BY
    a.id, a.title, c.id, c.name, a.created_at, a.due_date;

-- Documentation comment
COMMENT ON VIEW public.assignment_submission_stats IS
'Aggregates assignment submission statistics including submission rates, grades, and completion status.
Columns:
  - assignment_id: Unique identifier of the assignment
  - assignment_title: Title of the assignment
  - classroom_id: ID of the classroom
  - classroom_name: Name of the classroom
  - total_submissions: Total number of submissions for this assignment
  - completed_submissions: Number of submitted assignments
  - pending_submissions: Number of pending assignments
  - draft_submissions: Number of draft submissions
  - graded_submissions: Number of graded submissions
  - submission_rate_percent: Percentage of students who submitted
  - avg_score: Average score of graded submissions
  - max_score: Highest score received
  - min_score: Lowest score received
  - assignment_created_at: When the assignment was created
  - assignment_due_date: Due date for the assignment
  - total_students: Total number of students in the classroom
Usage:
  SELECT * FROM assignment_submission_stats WHERE classroom_id = ''{classroom_id}'';
  SELECT assignment_id, assignment_title, submission_rate_percent FROM assignment_submission_stats
  WHERE submission_rate_percent < 75 ORDER BY submission_rate_percent ASC;';
