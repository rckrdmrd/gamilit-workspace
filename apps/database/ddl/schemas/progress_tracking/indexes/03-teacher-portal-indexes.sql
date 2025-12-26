-- =====================================================
-- Indexes for Teacher Portal Optimization
-- Schema: progress_tracking
-- Created: 2025-12-18 (P1-02 - FASE 5 Implementation)
-- =====================================================

-- Index: module_progress by classroom and status
-- Purpose: Fast lookup of progress data for classroom analytics
CREATE INDEX IF NOT EXISTS idx_module_progress_classroom_status
    ON progress_tracking.module_progress(classroom_id, status);

COMMENT ON INDEX progress_tracking.idx_module_progress_classroom_status IS
    'P1-02: Optimizes classroom progress overview queries';

-- Index: intervention_alerts by teacher and status
-- Purpose: Fast lookup of pending alerts for teacher dashboard
CREATE INDEX IF NOT EXISTS idx_intervention_alerts_teacher_status
    ON progress_tracking.student_intervention_alerts(teacher_id, status)
    WHERE status IN ('pending', 'acknowledged');

COMMENT ON INDEX progress_tracking.idx_intervention_alerts_teacher_status IS
    'P1-02: Optimizes teacher alerts panel queries';

-- Index: exercise_submissions by student and date
-- Purpose: Fast lookup of recent submissions for progress tracking
CREATE INDEX IF NOT EXISTS idx_exercise_submissions_student_date
    ON progress_tracking.exercise_submissions(student_id, submitted_at DESC);

COMMENT ON INDEX progress_tracking.idx_exercise_submissions_student_date IS
    'P1-02: Optimizes student timeline and recent activity queries';

-- Index: exercise_submissions needing review
-- Purpose: Fast lookup of submissions pending manual review
CREATE INDEX IF NOT EXISTS idx_exercise_submissions_needs_review
    ON progress_tracking.exercise_submissions(needs_review, submitted_at DESC)
    WHERE needs_review = true;

COMMENT ON INDEX progress_tracking.idx_exercise_submissions_needs_review IS
    'P1-02: Optimizes teacher review queue';
