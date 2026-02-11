-- =====================================================
-- Table: social_features.classroom_members
-- Description: Membresía de estudiantes en aulas
-- Dependencies: social_features.classrooms, auth_management.profiles
-- =====================================================

DROP TABLE IF EXISTS social_features.classroom_members CASCADE;

CREATE TABLE social_features.classroom_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    classroom_id uuid NOT NULL,
    student_id uuid NOT NULL,
    enrollment_date timestamptz DEFAULT gamilit.now_mexico(),
    enrollment_method text DEFAULT 'teacher_invite'::text,
    enrolled_by uuid,
    status text DEFAULT 'active'::text,
    withdrawal_date timestamptz,
    withdrawal_reason text,
    student_number text,
    final_grade numeric(3,1),
    attendance_percentage numeric(5,2),
    permissions jsonb DEFAULT '{}'::jsonb,
    teacher_notes text,
    parent_contact_info jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT gamilit.now_mexico(),
    updated_at timestamptz DEFAULT gamilit.now_mexico(),

    -- Primary Key
    CONSTRAINT classroom_members_pkey PRIMARY KEY (id),

    -- Unique Constraints
    CONSTRAINT classroom_members_classroom_id_student_id_key UNIQUE (classroom_id, student_id),

    -- Check Constraints
    CONSTRAINT classroom_members_enrollment_method_check CHECK ((enrollment_method = ANY (ARRAY['teacher_invite'::text, 'self_enroll'::text, 'admin_add'::text, 'bulk_import'::text]))),
    CONSTRAINT classroom_members_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'withdrawn'::text, 'completed'::text])))
);

-- Indexes
CREATE INDEX idx_classroom_members_active ON social_features.classroom_members(student_id, status) WHERE status = 'active'::text;
CREATE INDEX idx_classroom_members_classroom ON social_features.classroom_members(classroom_id);
CREATE INDEX idx_classroom_members_classroom_status ON social_features.classroom_members(classroom_id, status) WHERE status = 'active'::text;
CREATE INDEX idx_classroom_members_student ON social_features.classroom_members(student_id);

-- Foreign Keys
ALTER TABLE ONLY social_features.classroom_members
    ADD CONSTRAINT classroom_members_classroom_id_fkey FOREIGN KEY (classroom_id) REFERENCES social_features.classrooms(id) ON DELETE CASCADE;

ALTER TABLE ONLY social_features.classroom_members
    ADD CONSTRAINT classroom_members_enrolled_by_fkey FOREIGN KEY (enrolled_by) REFERENCES auth_management.profiles(id) ON DELETE SET NULL;

ALTER TABLE ONLY social_features.classroom_members
    ADD CONSTRAINT classroom_members_student_id_fkey FOREIGN KEY (student_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;

-- Triggers
-- NOTE: Trigger trg_classroom_members_updated_at movido a archivo separado
-- Ver: social_features/triggers/24-trg_classroom_members_updated_at.sql

-- NOTE: Trigger trg_update_classroom_count movido a archivo separado
-- Ver: social_features/triggers/25-trg_update_classroom_count.sql

-- RLS Policies
CREATE POLICY classroom_members_manage_teacher ON social_features.classroom_members USING ((EXISTS ( SELECT 1
   FROM social_features.classrooms c
  WHERE ((c.id = classroom_members.classroom_id) AND (c.teacher_id = gamilit.get_current_user_id())))));
CREATE POLICY classroom_members_select_admin ON social_features.classroom_members FOR SELECT USING (gamilit.is_admin());
CREATE POLICY classroom_members_select_own ON social_features.classroom_members FOR SELECT USING ((student_id = gamilit.get_current_user_id()));
CREATE POLICY classroom_members_select_teacher ON social_features.classroom_members FOR SELECT USING ((EXISTS ( SELECT 1
   FROM social_features.classrooms c
  WHERE ((c.id = classroom_members.classroom_id) AND (c.teacher_id = gamilit.get_current_user_id())))));

-- Comments
COMMENT ON TABLE social_features.classroom_members IS 'Membresía de estudiantes en aulas';

-- Permissions
ALTER TABLE social_features.classroom_members OWNER TO gamilit_user;
GRANT ALL ON TABLE social_features.classroom_members TO gamilit_user;
