-- =====================================================
-- Indexes for Teacher Portal Optimization
-- Schema: social_features
-- Created: 2025-12-18 (P1-02 - FASE 5 Implementation)
-- =====================================================

-- Index: classroom_members active by classroom
-- Purpose: Fast lookup of active students in a classroom (Teacher Portal monitoring)
CREATE INDEX IF NOT EXISTS idx_classroom_members_classroom_active
    ON social_features.classroom_members(classroom_id, status)
    WHERE status = 'active';

COMMENT ON INDEX social_features.idx_classroom_members_classroom_active IS
    'P1-02: Optimizes teacher queries for active students in classrooms';

-- Index: classrooms by teacher
-- Purpose: Fast lookup of classrooms owned by a teacher
CREATE INDEX IF NOT EXISTS idx_classrooms_teacher_active
    ON social_features.classrooms(teacher_id, is_active)
    WHERE is_active = true;

COMMENT ON INDEX social_features.idx_classrooms_teacher_active IS
    'P1-02: Optimizes teacher dashboard classroom listing';
