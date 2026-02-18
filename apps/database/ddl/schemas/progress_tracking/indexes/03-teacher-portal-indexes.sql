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

-- REMOVED (2026-02-17 CORR-03):
-- idx_intervention_alerts_teacher_status: teacher_id column does not exist in student_intervention_alerts
-- idx_exercise_submissions_student_date: student_id column does not exist (column is user_id)
-- idx_exercise_submissions_needs_review: needs_review column does not exist in exercise_submissions
