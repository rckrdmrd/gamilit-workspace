-- =====================================================
-- RLS Policies for: social_features.discussion_threads
-- Description: Row Level Security for discussion threads
-- Created: 2026-02-03
-- Ticket: TASK-RLS-FK-OPTIMIZATION
-- =====================================================
--
-- Security Strategy:
-- - classroom_members_only: Members of the classroom can view/create threads
-- - team_members_only: Members of the team can view/create threads
-- - Thread creators can update their own threads
-- - Teachers/admins can manage (lock/pin) threads
-- =====================================================

-- Enable RLS on the table
ALTER TABLE social_features.discussion_threads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (for idempotency)
DROP POLICY IF EXISTS discussion_threads_classroom_members_select ON social_features.discussion_threads;
DROP POLICY IF EXISTS discussion_threads_team_members_select ON social_features.discussion_threads;
DROP POLICY IF EXISTS discussion_threads_creator_insert ON social_features.discussion_threads;
DROP POLICY IF EXISTS discussion_threads_creator_update ON social_features.discussion_threads;
DROP POLICY IF EXISTS discussion_threads_teacher_manage ON social_features.discussion_threads;
DROP POLICY IF EXISTS discussion_threads_admin_all ON social_features.discussion_threads;

-- =====================================================
-- Policy: classroom_members_only_select
-- Purpose: Classroom members can view threads in their classroom
-- =====================================================
CREATE POLICY discussion_threads_classroom_members_select
    ON social_features.discussion_threads
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        -- Thread belongs to a classroom
        classroom_id IS NOT NULL
        AND (
            -- User is a member of the classroom
            EXISTS (
                SELECT 1 FROM social_features.classroom_members cm
                WHERE cm.classroom_id = discussion_threads.classroom_id
                AND cm.student_id = gamilit.get_current_user_id()
                AND cm.is_active = true
            )
            OR
            -- User is the teacher of the classroom
            EXISTS (
                SELECT 1 FROM social_features.teacher_classrooms tc
                WHERE tc.classroom_id = discussion_threads.classroom_id
                AND tc.teacher_id = gamilit.get_current_user_id()
            )
        )
    );

COMMENT ON POLICY discussion_threads_classroom_members_select ON social_features.discussion_threads IS
    'Classroom members and teachers can view discussion threads in their classroom';

-- =====================================================
-- Policy: team_members_only_select
-- Purpose: Team members can view threads in their team
-- =====================================================
CREATE POLICY discussion_threads_team_members_select
    ON social_features.discussion_threads
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        -- Thread belongs to a team
        team_id IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM social_features.team_members tm
            WHERE tm.team_id = discussion_threads.team_id
            AND tm.user_id = gamilit.get_current_user_id()
        )
    );

COMMENT ON POLICY discussion_threads_team_members_select ON social_features.discussion_threads IS
    'Team members can view discussion threads in their team';

-- =====================================================
-- Policy: creator_insert
-- Purpose: Users can create threads in classrooms/teams they belong to
-- =====================================================
CREATE POLICY discussion_threads_creator_insert
    ON social_features.discussion_threads
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (
        -- Creator must be the current user
        created_by = gamilit.get_current_user_id()
        AND (
            -- For classroom threads: must be member or teacher
            (
                classroom_id IS NOT NULL
                AND (
                    EXISTS (
                        SELECT 1 FROM social_features.classroom_members cm
                        WHERE cm.classroom_id = discussion_threads.classroom_id
                        AND cm.student_id = gamilit.get_current_user_id()
                        AND cm.is_active = true
                    )
                    OR EXISTS (
                        SELECT 1 FROM social_features.teacher_classrooms tc
                        WHERE tc.classroom_id = discussion_threads.classroom_id
                        AND tc.teacher_id = gamilit.get_current_user_id()
                    )
                )
            )
            OR
            -- For team threads: must be team member
            (
                team_id IS NOT NULL
                AND EXISTS (
                    SELECT 1 FROM social_features.team_members tm
                    WHERE tm.team_id = discussion_threads.team_id
                    AND tm.user_id = gamilit.get_current_user_id()
                )
            )
        )
    );

COMMENT ON POLICY discussion_threads_creator_insert ON social_features.discussion_threads IS
    'Users can create threads in classrooms/teams they belong to';

-- =====================================================
-- Policy: creator_update
-- Purpose: Thread creators can update their own threads (title, content)
-- =====================================================
CREATE POLICY discussion_threads_creator_update
    ON social_features.discussion_threads
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING (
        created_by = gamilit.get_current_user_id()
        AND is_locked = false  -- Cannot update locked threads
    )
    WITH CHECK (
        created_by = gamilit.get_current_user_id()
    );

COMMENT ON POLICY discussion_threads_creator_update ON social_features.discussion_threads IS
    'Thread creators can update their own non-locked threads';

-- =====================================================
-- Policy: teacher_manage
-- Purpose: Teachers can manage threads (lock/pin) in their classrooms
-- =====================================================
CREATE POLICY discussion_threads_teacher_manage
    ON social_features.discussion_threads
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING (
        classroom_id IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM social_features.teacher_classrooms tc
            WHERE tc.classroom_id = discussion_threads.classroom_id
            AND tc.teacher_id = gamilit.get_current_user_id()
        )
    );

COMMENT ON POLICY discussion_threads_teacher_manage ON social_features.discussion_threads IS
    'Teachers can manage (lock/pin) threads in their classrooms';

-- =====================================================
-- Policy: admin_all
-- Purpose: Admins have full access to all threads
-- =====================================================
CREATE POLICY discussion_threads_admin_all
    ON social_features.discussion_threads
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            WHERE p.id = gamilit.get_current_user_id()
            AND p.role IN ('super_admin', 'admin_teacher')
        )
    );

COMMENT ON POLICY discussion_threads_admin_all ON social_features.discussion_threads IS
    'Admins have full access to all discussion threads';

-- =====================================================
-- Update table comment
-- =====================================================
COMMENT ON TABLE social_features.discussion_threads IS
    'RLS enabled: Discussion threads in classrooms/teams - access restricted to members';

-- =====================================================
-- Grants
-- =====================================================
GRANT ALL ON TABLE social_features.discussion_threads TO gamilit_user;

-- =====================================================
-- SUMMARY
-- =====================================================
-- Total policies: 6
-- - classroom_members_only_select: SELECT for classroom members
-- - team_members_only_select: SELECT for team members
-- - creator_insert: INSERT for members
-- - creator_update: UPDATE own threads
-- - teacher_manage: UPDATE for teachers (lock/pin)
-- - admin_all: ALL for admins
-- =====================================================
