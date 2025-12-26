-- =====================================================
-- RLS Policies for: progress_tracking.teacher_notes
-- Description: Teacher notes with self-access only
-- Created: 2025-12-18 (P1-01 - FASE 5 Implementation)
-- Policies: 4 (SELECT, INSERT, UPDATE, DELETE)
-- =====================================================
--
-- Security Strategy:
-- - Self-service: Teachers can CRUD their own notes
-- - No student access: Notes are private to teachers
-- - No cross-teacher access: Teachers cannot see other teachers' notes
-- =====================================================

-- =====================================================
-- TABLE: progress_tracking.teacher_notes
-- Policies: 4 (SELECT: 1, INSERT: 1, UPDATE: 1, DELETE: 1)
-- =====================================================

DROP POLICY IF EXISTS teacher_notes_select_own ON progress_tracking.teacher_notes;
DROP POLICY IF EXISTS teacher_notes_insert_own ON progress_tracking.teacher_notes;
DROP POLICY IF EXISTS teacher_notes_update_own ON progress_tracking.teacher_notes;
DROP POLICY IF EXISTS teacher_notes_delete_own ON progress_tracking.teacher_notes;

-- Policy: teacher_notes_select_own
-- Purpose: Teachers can read their own notes
CREATE POLICY teacher_notes_select_own
    ON progress_tracking.teacher_notes
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (teacher_id = current_setting('app.current_user_id', true)::uuid);

COMMENT ON POLICY teacher_notes_select_own ON progress_tracking.teacher_notes IS
    'Teachers can see their own notes about students';

-- Policy: teacher_notes_insert_own
-- Purpose: Teachers can create notes for any student
CREATE POLICY teacher_notes_insert_own
    ON progress_tracking.teacher_notes
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (
        teacher_id = current_setting('app.current_user_id', true)::uuid
        AND EXISTS (
            SELECT 1 FROM auth_management.user_roles ur
            WHERE ur.user_id = current_setting('app.current_user_id', true)::uuid
                AND ur.role = 'admin_teacher'
        )
    );

COMMENT ON POLICY teacher_notes_insert_own ON progress_tracking.teacher_notes IS
    'Teachers can create notes about students (teacher role required)';

-- Policy: teacher_notes_update_own
-- Purpose: Teachers can update their own notes
CREATE POLICY teacher_notes_update_own
    ON progress_tracking.teacher_notes
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING (teacher_id = current_setting('app.current_user_id', true)::uuid)
    WITH CHECK (teacher_id = current_setting('app.current_user_id', true)::uuid);

COMMENT ON POLICY teacher_notes_update_own ON progress_tracking.teacher_notes IS
    'Teachers can update their own notes';

-- Policy: teacher_notes_delete_own
-- Purpose: Teachers can delete their own notes
CREATE POLICY teacher_notes_delete_own
    ON progress_tracking.teacher_notes
    AS PERMISSIVE
    FOR DELETE
    TO public
    USING (teacher_id = current_setting('app.current_user_id', true)::uuid);

COMMENT ON POLICY teacher_notes_delete_own ON progress_tracking.teacher_notes IS
    'Teachers can delete their own notes';

-- =====================================================
-- SUMMARY: teacher_notes RLS
-- =====================================================
-- Total policies: 4
-- - SELECT: 1 (own notes only)
-- - INSERT: 1 (teacher role required)
-- - UPDATE: 1 (own notes only)
-- - DELETE: 1 (own notes only)
-- =====================================================
