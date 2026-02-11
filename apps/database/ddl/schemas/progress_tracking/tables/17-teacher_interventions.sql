-- =============================================================================
-- TABLE: progress_tracking.teacher_interventions
-- =============================================================================
-- Purpose: Track teacher actions/interventions in response to student alerts
-- Priority: P2-04 - Teacher Portal intervention tracking
-- Created: 2025-12-18
--
-- DESCRIPTION:
-- This table records the specific actions teachers take when responding to
-- student intervention alerts. Unlike the resolution in student_intervention_alerts
-- which only captures the final resolution, this table captures the full history
-- of all interventions taken, including follow-ups and multi-step interventions.
--
-- USE CASES:
-- - Parent contact records
-- - One-on-one sessions scheduled/completed
-- - Resource assignments
-- - Peer tutoring arrangements
-- - Accommodation adjustments
-- - Follow-up tracking
-- =============================================================================

DROP TABLE IF EXISTS progress_tracking.teacher_interventions CASCADE;

CREATE TABLE progress_tracking.teacher_interventions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,

    -- Alert reference (optional - can also be standalone intervention)
    alert_id uuid,

    -- Core identifiers
    student_id uuid NOT NULL,
    teacher_id uuid NOT NULL,
    classroom_id uuid,

    -- Intervention details
    intervention_type text NOT NULL,
    title text NOT NULL,
    description text,

    -- Action tracking
    action_taken text NOT NULL,
    outcome text,

    -- Scheduling
    scheduled_date timestamp with time zone,
    completed_date timestamp with time zone,

    -- Status tracking
    status text DEFAULT 'planned'::text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,

    -- Follow-up
    follow_up_required boolean DEFAULT false,
    follow_up_date timestamp with time zone,
    follow_up_notes text,

    -- Communication records
    parent_contacted boolean DEFAULT false,
    parent_contact_date timestamp with time zone,
    parent_contact_notes text,

    -- Effectiveness tracking
    effectiveness_rating integer,
    student_response text,

    -- Metadata
    notes text,
    metadata jsonb DEFAULT '{}'::jsonb,

    -- Multi-tenant
    tenant_id uuid NOT NULL,

    -- Audit
    created_at timestamp with time zone DEFAULT gamilit.now_mexico() NOT NULL,
    updated_at timestamp with time zone DEFAULT gamilit.now_mexico() NOT NULL,

    -- Constraints
    CONSTRAINT teacher_interventions_pkey PRIMARY KEY (id),
    CONSTRAINT teacher_interventions_type_check CHECK (intervention_type IN (
        'one_on_one_session',     -- Individual tutoring session
        'parent_contact',          -- Parent/guardian communication
        'resource_assignment',     -- Additional materials assigned
        'peer_tutoring',           -- Paired with another student
        'accommodation',           -- Learning accommodations
        'referral',                -- Referral to specialist
        'behavior_plan',           -- Behavioral intervention
        'progress_check',          -- Scheduled progress review
        'encouragement',           -- Motivational intervention
        'schedule_adjustment',     -- Modified schedule/deadlines
        'other'                    -- Custom intervention
    )),
    CONSTRAINT teacher_interventions_status_check CHECK (status IN (
        'planned',      -- Scheduled but not started
        'in_progress',  -- Currently ongoing
        'completed',    -- Successfully completed
        'cancelled',    -- Cancelled before completion
        'rescheduled'   -- Moved to new date
    )),
    CONSTRAINT teacher_interventions_priority_check CHECK (priority IN (
        'low',
        'medium',
        'high',
        'urgent'
    )),
    CONSTRAINT teacher_interventions_effectiveness_check CHECK (
        effectiveness_rating IS NULL OR
        (effectiveness_rating >= 1 AND effectiveness_rating <= 5)
    )
);

-- Set ownership
ALTER TABLE progress_tracking.teacher_interventions OWNER TO gamilit_user;

-- Comments
COMMENT ON TABLE progress_tracking.teacher_interventions IS
'Records teacher intervention actions for at-risk students. Tracks full intervention history including scheduling, outcomes, parent contact, and effectiveness.';

COMMENT ON COLUMN progress_tracking.teacher_interventions.intervention_type IS
'Type of intervention: one_on_one_session, parent_contact, resource_assignment, peer_tutoring, accommodation, referral, behavior_plan, progress_check, encouragement, schedule_adjustment, other';

COMMENT ON COLUMN progress_tracking.teacher_interventions.status IS
'Current status: planned, in_progress, completed, cancelled, rescheduled';

COMMENT ON COLUMN progress_tracking.teacher_interventions.effectiveness_rating IS
'Teacher rating of intervention effectiveness (1-5 scale). NULL if not yet rated.';

-- Indexes
CREATE INDEX idx_teacher_interventions_alert ON progress_tracking.teacher_interventions(alert_id);
CREATE INDEX idx_teacher_interventions_student ON progress_tracking.teacher_interventions(student_id);
CREATE INDEX idx_teacher_interventions_teacher ON progress_tracking.teacher_interventions(teacher_id);
CREATE INDEX idx_teacher_interventions_classroom ON progress_tracking.teacher_interventions(classroom_id);
CREATE INDEX idx_teacher_interventions_status ON progress_tracking.teacher_interventions(status);
CREATE INDEX idx_teacher_interventions_type ON progress_tracking.teacher_interventions(intervention_type);
CREATE INDEX idx_teacher_interventions_tenant ON progress_tracking.teacher_interventions(tenant_id);
CREATE INDEX idx_teacher_interventions_scheduled ON progress_tracking.teacher_interventions(scheduled_date)
    WHERE status IN ('planned', 'in_progress');
CREATE INDEX idx_teacher_interventions_follow_up ON progress_tracking.teacher_interventions(follow_up_date)
    WHERE follow_up_required = true;

-- Foreign keys
ALTER TABLE progress_tracking.teacher_interventions
    ADD CONSTRAINT teacher_interventions_alert_fkey
    FOREIGN KEY (alert_id) REFERENCES progress_tracking.student_intervention_alerts(id) ON DELETE SET NULL;

ALTER TABLE progress_tracking.teacher_interventions
    ADD CONSTRAINT teacher_interventions_student_fkey
    FOREIGN KEY (student_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;

ALTER TABLE progress_tracking.teacher_interventions
    ADD CONSTRAINT teacher_interventions_teacher_fkey
    FOREIGN KEY (teacher_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;

ALTER TABLE progress_tracking.teacher_interventions
    ADD CONSTRAINT teacher_interventions_classroom_fkey
    FOREIGN KEY (classroom_id) REFERENCES social_features.classrooms(id) ON DELETE SET NULL;

ALTER TABLE progress_tracking.teacher_interventions
    ADD CONSTRAINT teacher_interventions_tenant_fkey
    FOREIGN KEY (tenant_id) REFERENCES auth_management.tenants(id) ON DELETE CASCADE;

-- Trigger for updated_at
CREATE TRIGGER trg_teacher_interventions_updated_at
    BEFORE UPDATE ON progress_tracking.teacher_interventions
    FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE progress_tracking.teacher_interventions ENABLE ROW LEVEL SECURITY;

-- Teachers can view and manage their own interventions
CREATE POLICY teacher_manage_own_interventions ON progress_tracking.teacher_interventions
    FOR ALL
    USING (teacher_id = gamilit.get_current_user_id())
    WITH CHECK (teacher_id = gamilit.get_current_user_id());

-- Teachers can view interventions for students in their classrooms
CREATE POLICY teacher_view_classroom_interventions ON progress_tracking.teacher_interventions
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM social_features.teacher_classrooms tc
        WHERE tc.classroom_id = teacher_interventions.classroom_id
        AND tc.teacher_id = gamilit.get_current_user_id()
        AND tc.tenant_id = teacher_interventions.tenant_id
    ));

-- Admins can view all interventions in their tenant
CREATE POLICY admin_view_tenant_interventions ON progress_tracking.teacher_interventions
    FOR SELECT
    USING (
        tenant_id IN (
            SELECT p.tenant_id FROM auth_management.profiles p
            WHERE p.id = gamilit.get_current_user_id()
        )
        AND EXISTS (
            SELECT 1 FROM auth_management.profiles p
            WHERE p.id = gamilit.get_current_user_id()
            AND p.role IN ('SUPER_ADMIN', 'ADMIN_TEACHER')
        )
    );

-- Grants
GRANT ALL ON TABLE progress_tracking.teacher_interventions TO gamilit_user;
GRANT SELECT ON TABLE progress_tracking.teacher_interventions TO authenticated;
