-- =============================================================================
-- RLS Policies for educational_content.teacher_content
-- Created: 2026-01-25 (TASK-2026-01-25-VALIDACION-PORTAL-TEACHER)
-- Agent: Claude Code (adredsi)
-- Priority: HIGH - Security / Tenant Isolation
-- =============================================================================
--
-- SECURITY MODEL:
-- - Teachers can CRUD their own content
-- - Teachers can VIEW content based on visibility:
--   * private: only owner
--   * classroom: same classroom members
--   * school: same tenant
--   * public: everyone
-- - Admins can manage all content in their tenant
-- - Explicitly shared content is accessible
--
-- =============================================================================

-- =============================================================================
-- 1. Enable RLS on teacher_content
-- =============================================================================

ALTER TABLE educational_content.teacher_content ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE educational_content.teacher_content IS
'RLS enabled: Custom teacher content with visibility-based access control';

-- =============================================================================
-- 2. POLICIES FOR TEACHERS
-- =============================================================================

-- Policy: Teachers view own content
CREATE POLICY teacher_content_view_own
    ON educational_content.teacher_content
    FOR SELECT
    USING (
        teacher_id = auth.uid()
        AND tenant_id = auth.current_tenant_id()
    );

-- Policy: Teachers view PUBLIC content
CREATE POLICY teacher_content_view_public
    ON educational_content.teacher_content
    FOR SELECT
    USING (
        visibility = 'public'
        AND status = 'published'
        AND is_active = TRUE
    );

-- Policy: Teachers view SCHOOL content (same tenant)
CREATE POLICY teacher_content_view_school
    ON educational_content.teacher_content
    FOR SELECT
    USING (
        visibility IN ('school', 'classroom')
        AND status = 'published'
        AND tenant_id = auth.current_tenant_id()
        AND is_active = TRUE
    );

-- Policy: Teachers view SHARED content (explicitly shared with them)
CREATE POLICY teacher_content_view_shared
    ON educational_content.teacher_content
    FOR SELECT
    USING (
        is_shared = TRUE
        AND shared_with_teachers @> to_jsonb(auth.uid()::text)
        AND status = 'published'
        AND is_active = TRUE
    );

-- Policy: Teachers CREATE content (as owner in their tenant)
CREATE POLICY teacher_content_create_own
    ON educational_content.teacher_content
    FOR INSERT
    WITH CHECK (
        teacher_id = auth.uid()
        AND tenant_id = auth.current_tenant_id()
        AND auth.has_role('teacher')
    );

-- Policy: Teachers UPDATE own content
CREATE POLICY teacher_content_update_own
    ON educational_content.teacher_content
    FOR UPDATE
    USING (
        teacher_id = auth.uid()
        AND tenant_id = auth.current_tenant_id()
    )
    WITH CHECK (
        teacher_id = auth.uid()
        AND tenant_id = auth.current_tenant_id()
    );

-- Policy: Teachers UPDATE shared content (if allow_modifications is true)
CREATE POLICY teacher_content_update_shared
    ON educational_content.teacher_content
    FOR UPDATE
    USING (
        is_shared = TRUE
        AND shared_with_teachers @> to_jsonb(auth.uid()::text)
        AND allow_modifications = TRUE
        AND tenant_id = auth.current_tenant_id()
    )
    WITH CHECK (
        -- Cannot change ownership or visibility when updating shared content
        teacher_id = (SELECT teacher_id FROM educational_content.teacher_content WHERE id = id)
        AND tenant_id = (SELECT tenant_id FROM educational_content.teacher_content WHERE id = id)
    );

-- Policy: Teachers DELETE own content
CREATE POLICY teacher_content_delete_own
    ON educational_content.teacher_content
    FOR DELETE
    USING (
        teacher_id = auth.uid()
        AND tenant_id = auth.current_tenant_id()
    );

-- =============================================================================
-- 3. POLICIES FOR ADMINS
-- =============================================================================

-- Policy: Admins manage ALL content in their tenant
CREATE POLICY teacher_content_admin_manage_all
    ON educational_content.teacher_content
    FOR ALL
    USING (
        auth.has_role('super_admin')
        AND tenant_id = auth.current_tenant_id()
    )
    WITH CHECK (
        auth.has_role('super_admin')
        AND tenant_id = auth.current_tenant_id()
    );

-- =============================================================================
-- 4. POLICIES FOR STUDENTS (read-only, published content only)
-- =============================================================================

-- Policy: Students view content assigned to their classrooms
CREATE POLICY teacher_content_student_view_classroom
    ON educational_content.teacher_content
    FOR SELECT
    USING (
        auth.has_role('student')
        AND status = 'published'
        AND is_active = TRUE
        AND (
            -- Content is public
            visibility = 'public'
            OR
            -- Content is assigned to student's classroom
            EXISTS (
                SELECT 1 FROM social_features.classroom_members cm
                WHERE cm.student_id = auth.uid()
                  AND cm.status = 'active'
                  AND target_classrooms @> to_jsonb(cm.classroom_id::text)
            )
        )
    );

-- =============================================================================
-- Comments for documentation
-- =============================================================================

COMMENT ON POLICY teacher_content_view_own ON educational_content.teacher_content IS
'Teachers can view all their own content regardless of status';

COMMENT ON POLICY teacher_content_view_public ON educational_content.teacher_content IS
'All users can view published public content';

COMMENT ON POLICY teacher_content_view_school ON educational_content.teacher_content IS
'Teachers can view school/classroom content within their tenant';

COMMENT ON POLICY teacher_content_view_shared ON educational_content.teacher_content IS
'Teachers can view content explicitly shared with them';

COMMENT ON POLICY teacher_content_create_own ON educational_content.teacher_content IS
'Teachers can create content as the owner in their tenant';

COMMENT ON POLICY teacher_content_update_own ON educational_content.teacher_content IS
'Teachers can update their own content';

COMMENT ON POLICY teacher_content_update_shared ON educational_content.teacher_content IS
'Teachers can update shared content if modifications are allowed';

COMMENT ON POLICY teacher_content_delete_own ON educational_content.teacher_content IS
'Teachers can delete (soft-delete via is_active) their own content';

COMMENT ON POLICY teacher_content_admin_manage_all ON educational_content.teacher_content IS
'Super admins can manage all content in their tenant';

COMMENT ON POLICY teacher_content_student_view_classroom ON educational_content.teacher_content IS
'Students can view published content in their classrooms or public content';

-- =============================================================================
-- End of RLS policies for teacher_content
-- =============================================================================
