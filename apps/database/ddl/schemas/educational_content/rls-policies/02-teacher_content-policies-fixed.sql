-- =============================================================================
-- RLS Policies for educational_content.teacher_content (FIXED)
-- Created: 2026-01-25 (TASK-2026-01-25-VALIDACION-PORTAL-TEACHER)
-- Agent: Claude Code (adredsi)
-- Priority: HIGH - Security / Tenant Isolation
-- Fixed: Usar current_setting() en lugar de auth.uid()
-- =============================================================================

-- Drop existing policy if exists
DROP POLICY IF EXISTS teacher_content_view_public ON educational_content.teacher_content;

-- =============================================================================
-- POLICIES FOR TEACHERS
-- =============================================================================

-- Policy: Teachers view own content
CREATE POLICY teacher_content_view_own
    ON educational_content.teacher_content
    FOR SELECT
    USING (
        teacher_id = (current_setting('app.current_user_id', true))::UUID
        AND tenant_id = (current_setting('app.current_tenant_id', true))::UUID
    );

COMMENT ON POLICY teacher_content_view_own ON educational_content.teacher_content IS
'Teachers can view all their own content regardless of status';

-- Policy: Teachers view PUBLIC content
CREATE POLICY teacher_content_view_public
    ON educational_content.teacher_content
    FOR SELECT
    USING (
        visibility = 'public'
        AND status = 'published'
        AND is_active = TRUE
    );

COMMENT ON POLICY teacher_content_view_public ON educational_content.teacher_content IS
'All users can view published public content';

-- Policy: Teachers view SCHOOL content (same tenant)
CREATE POLICY teacher_content_view_school
    ON educational_content.teacher_content
    FOR SELECT
    USING (
        visibility IN ('school', 'classroom')
        AND status = 'published'
        AND tenant_id = (current_setting('app.current_tenant_id', true))::UUID
        AND is_active = TRUE
    );

COMMENT ON POLICY teacher_content_view_school ON educational_content.teacher_content IS
'Teachers can view school/classroom content within their tenant';

-- Policy: Teachers view SHARED content (explicitly shared with them)
CREATE POLICY teacher_content_view_shared
    ON educational_content.teacher_content
    FOR SELECT
    USING (
        is_shared = TRUE
        AND shared_with_teachers @> to_jsonb((current_setting('app.current_user_id', true))::text)
        AND status = 'published'
        AND is_active = TRUE
    );

COMMENT ON POLICY teacher_content_view_shared ON educational_content.teacher_content IS
'Teachers can view content explicitly shared with them';

-- Policy: Teachers CREATE content (as owner in their tenant)
CREATE POLICY teacher_content_create_own
    ON educational_content.teacher_content
    FOR INSERT
    WITH CHECK (
        teacher_id = (current_setting('app.current_user_id', true))::UUID
        AND tenant_id = (current_setting('app.current_tenant_id', true))::UUID
        AND EXISTS (
            SELECT 1 FROM auth_management.user_roles ur
            WHERE ur.user_id = (current_setting('app.current_user_id', true))::UUID
              AND ur.role = 'admin_teacher'
        )
    );

COMMENT ON POLICY teacher_content_create_own ON educational_content.teacher_content IS
'Teachers can create content as the owner in their tenant';

-- Policy: Teachers UPDATE own content
CREATE POLICY teacher_content_update_own
    ON educational_content.teacher_content
    FOR UPDATE
    USING (
        teacher_id = (current_setting('app.current_user_id', true))::UUID
        AND tenant_id = (current_setting('app.current_tenant_id', true))::UUID
    )
    WITH CHECK (
        teacher_id = (current_setting('app.current_user_id', true))::UUID
        AND tenant_id = (current_setting('app.current_tenant_id', true))::UUID
    );

COMMENT ON POLICY teacher_content_update_own ON educational_content.teacher_content IS
'Teachers can update their own content';

-- Policy: Teachers UPDATE shared content (if allow_modifications is true)
CREATE POLICY teacher_content_update_shared
    ON educational_content.teacher_content
    FOR UPDATE
    USING (
        is_shared = TRUE
        AND shared_with_teachers @> to_jsonb((current_setting('app.current_user_id', true))::text)
        AND allow_modifications = TRUE
        AND tenant_id = (current_setting('app.current_tenant_id', true))::UUID
    )
    WITH CHECK (
        -- Cannot change ownership when updating shared content
        teacher_id = (SELECT tc.teacher_id FROM educational_content.teacher_content tc WHERE tc.id = teacher_content.id)
        AND tenant_id = (SELECT tc.tenant_id FROM educational_content.teacher_content tc WHERE tc.id = teacher_content.id)
    );

COMMENT ON POLICY teacher_content_update_shared ON educational_content.teacher_content IS
'Teachers can update shared content if modifications are allowed';

-- Policy: Teachers DELETE own content
CREATE POLICY teacher_content_delete_own
    ON educational_content.teacher_content
    FOR DELETE
    USING (
        teacher_id = (current_setting('app.current_user_id', true))::UUID
        AND tenant_id = (current_setting('app.current_tenant_id', true))::UUID
    );

COMMENT ON POLICY teacher_content_delete_own ON educational_content.teacher_content IS
'Teachers can delete (soft-delete via is_active) their own content';

-- =============================================================================
-- POLICIES FOR ADMINS
-- =============================================================================

-- Policy: Admins manage ALL content in their tenant
CREATE POLICY teacher_content_admin_manage_all
    ON educational_content.teacher_content
    FOR ALL
    USING (
        tenant_id = (current_setting('app.current_tenant_id', true))::UUID
        AND EXISTS (
            SELECT 1 FROM auth_management.user_roles ur
            WHERE ur.user_id = (current_setting('app.current_user_id', true))::UUID
              AND ur.role = 'super_admin'
        )
    )
    WITH CHECK (
        tenant_id = (current_setting('app.current_tenant_id', true))::UUID
        AND EXISTS (
            SELECT 1 FROM auth_management.user_roles ur
            WHERE ur.user_id = (current_setting('app.current_user_id', true))::UUID
              AND ur.role = 'super_admin'
        )
    );

COMMENT ON POLICY teacher_content_admin_manage_all ON educational_content.teacher_content IS
'Super admins can manage all content in their tenant';

-- =============================================================================
-- POLICIES FOR STUDENTS (read-only, published content only)
-- =============================================================================

-- Policy: Students view content assigned to their classrooms
CREATE POLICY teacher_content_student_view_classroom
    ON educational_content.teacher_content
    FOR SELECT
    USING (
        status = 'published'
        AND is_active = TRUE
        AND (
            -- Content is public
            visibility = 'public'
            OR
            -- Content is assigned to student's classroom
            EXISTS (
                SELECT 1 FROM social_features.classroom_members cm
                WHERE cm.student_id = (current_setting('app.current_user_id', true))::UUID
                  AND cm.status = 'active'
                  AND target_classrooms @> to_jsonb(cm.classroom_id::text)
            )
        )
    );

COMMENT ON POLICY teacher_content_student_view_classroom ON educational_content.teacher_content IS
'Students can view published content in their classrooms or public content';

-- =============================================================================
-- END OF RLS POLICIES
-- =============================================================================
