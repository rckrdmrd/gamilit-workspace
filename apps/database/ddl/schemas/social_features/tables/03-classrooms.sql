-- =====================================================
-- Table: social_features.classrooms
-- Description: Aulas virtuales para organizar estudiantes por clase
-- Dependencies: social_features.schools, auth_management.profiles, auth_management.tenants
-- =====================================================

DROP TABLE IF EXISTS social_features.classrooms CASCADE;

CREATE TABLE social_features.classrooms (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    school_id uuid,
    tenant_id uuid NOT NULL,
    name text NOT NULL,
    code text,
    description text,
    grade_level text,
    section text,
    subject text,
    academic_year text,
    semester text,
    teacher_id uuid NOT NULL,
    co_teachers uuid[],
    capacity integer DEFAULT 40,
    current_students_count integer DEFAULT 0,
    settings jsonb DEFAULT '{"require_approval": true, "visible_in_directory": true, "allow_self_enrollment": false}'::jsonb,
    schedule jsonb DEFAULT '[]'::jsonb,
    meeting_url text,
    is_active boolean DEFAULT true,
    is_archived boolean DEFAULT false,
    is_deleted boolean DEFAULT false,
    start_date date,
    end_date date,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT gamilit.now_mexico(),
    updated_at timestamptz DEFAULT gamilit.now_mexico(),

    -- Primary Key
    CONSTRAINT classrooms_pkey PRIMARY KEY (id),

    -- Unique Constraints
    CONSTRAINT classrooms_code_key UNIQUE (code)
);

-- Indexes
CREATE INDEX idx_classrooms_active ON social_features.classrooms(is_active) WHERE is_active = true;
CREATE INDEX idx_classrooms_not_deleted ON social_features.classrooms(created_at DESC) WHERE is_deleted = false;
CREATE INDEX idx_classrooms_code ON social_features.classrooms(code);
CREATE INDEX idx_classrooms_school ON social_features.classrooms(school_id);
CREATE INDEX idx_classrooms_teacher ON social_features.classrooms(teacher_id);

-- Foreign Keys
ALTER TABLE ONLY social_features.classrooms
    ADD CONSTRAINT classrooms_school_id_fkey FOREIGN KEY (school_id) REFERENCES social_features.schools(id) ON DELETE CASCADE;

ALTER TABLE ONLY social_features.classrooms
    ADD CONSTRAINT classrooms_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES auth_management.profiles(id) ON DELETE RESTRICT;

ALTER TABLE ONLY social_features.classrooms
    ADD CONSTRAINT classrooms_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES auth_management.tenants(id) ON DELETE CASCADE;

-- Triggers
-- NOTE: Trigger trg_classrooms_updated_at movido a archivo separado
-- Ver: social_features/triggers/26-trg_classrooms_updated_at.sql

-- RLS Policies
CREATE POLICY classrooms_manage_teacher ON social_features.classrooms USING ((teacher_id = gamilit.get_current_user_id()));
CREATE POLICY classrooms_select_admin ON social_features.classrooms FOR SELECT USING (gamilit.is_admin());
CREATE POLICY classrooms_select_student ON social_features.classrooms FOR SELECT USING ((EXISTS ( SELECT 1
   FROM social_features.classroom_members cm
  WHERE ((cm.classroom_id = classrooms.id) AND (cm.student_id = gamilit.get_current_user_id()) AND (cm.status = 'active'::text)))));
CREATE POLICY classrooms_select_teacher ON social_features.classrooms FOR SELECT USING ((teacher_id = gamilit.get_current_user_id()));

-- Comments
COMMENT ON TABLE social_features.classrooms IS 'Aulas virtuales para organizar estudiantes por clase';
COMMENT ON COLUMN social_features.classrooms.is_deleted IS 'Soft delete flag. When true, classroom is deleted but data preserved for audit. Backend filters with WHERE is_deleted = FALSE.';

-- Permissions
ALTER TABLE social_features.classrooms OWNER TO gamilit_user;
GRANT ALL ON TABLE social_features.classrooms TO gamilit_user;
