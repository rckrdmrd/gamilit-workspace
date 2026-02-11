-- =====================================================
-- Table: progress_tracking.learning_sessions
-- Description: Sesiones de aprendizaje con tracking de tiempo y actividad
-- Dependencies: auth_management.profiles, auth_management.tenants, educational_content.modules, educational_content.exercises
-- =====================================================

DROP TABLE IF EXISTS progress_tracking.learning_sessions CASCADE;

CREATE TABLE progress_tracking.learning_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tenant_id uuid,
    session_token text,
    session_type text DEFAULT 'learning'::text,
    module_id uuid,
    exercise_id uuid,
    classroom_id uuid,
    started_at timestamptz DEFAULT gamilit.now_mexico(),
    ended_at timestamptz,
    duration interval,
    active_time interval,
    idle_time interval,
    exercises_attempted integer DEFAULT 0,
    exercises_completed integer DEFAULT 0,
    content_viewed integer DEFAULT 0,
    total_score integer DEFAULT 0,
    total_xp_earned integer DEFAULT 0,
    total_ml_coins_earned integer DEFAULT 0,
    clicks_count integer DEFAULT 0,
    page_views integer DEFAULT 0,
    resource_downloads integer DEFAULT 0,
    device_info jsonb DEFAULT '{}'::jsonb,
    browser_info jsonb DEFAULT '{}'::jsonb,
    connection_quality text,
    errors_encountered integer DEFAULT 0,
    is_active boolean DEFAULT true,
    completion_status text DEFAULT 'ongoing'::text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT gamilit.now_mexico(),

    -- Primary Key
    CONSTRAINT learning_sessions_pkey PRIMARY KEY (id),

    -- Unique Constraints
    CONSTRAINT learning_sessions_session_token_key UNIQUE (session_token),

    -- Check Constraints
    CONSTRAINT learning_sessions_completion_status_check CHECK ((completion_status = ANY (ARRAY['ongoing'::text, 'completed'::text, 'abandoned'::text, 'timed_out'::text]))),
    CONSTRAINT learning_sessions_session_type_check CHECK ((session_type = ANY (ARRAY['learning'::text, 'practice'::text, 'assessment'::text, 'review'::text])))
);

-- Indexes
CREATE INDEX idx_sessions_active ON progress_tracking.learning_sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_sessions_module ON progress_tracking.learning_sessions(module_id);
CREATE INDEX idx_sessions_started ON progress_tracking.learning_sessions(started_at DESC);
CREATE INDEX idx_sessions_user ON progress_tracking.learning_sessions(user_id);

-- Foreign Keys
ALTER TABLE ONLY progress_tracking.learning_sessions
    ADD CONSTRAINT learning_sessions_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES educational_content.exercises(id) ON DELETE SET NULL;

ALTER TABLE ONLY progress_tracking.learning_sessions
    ADD CONSTRAINT learning_sessions_module_id_fkey FOREIGN KEY (module_id) REFERENCES educational_content.modules(id) ON DELETE SET NULL;

ALTER TABLE ONLY progress_tracking.learning_sessions
    ADD CONSTRAINT learning_sessions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES auth_management.tenants(id) ON DELETE CASCADE;

ALTER TABLE ONLY progress_tracking.learning_sessions
    ADD CONSTRAINT learning_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;

-- Row Level Security
ALTER TABLE progress_tracking.learning_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY learning_sessions_insert_own ON progress_tracking.learning_sessions FOR INSERT WITH CHECK ((user_id = gamilit.get_current_user_id()));
CREATE POLICY learning_sessions_select_admin ON progress_tracking.learning_sessions FOR SELECT USING (gamilit.is_admin());
CREATE POLICY learning_sessions_select_own ON progress_tracking.learning_sessions FOR SELECT USING ((user_id = gamilit.get_current_user_id()));
CREATE POLICY learning_sessions_select_teacher ON progress_tracking.learning_sessions FOR SELECT USING (((gamilit.get_current_user_role() = 'admin_teacher'::auth_management.gamilit_role) AND (EXISTS ( SELECT 1
   FROM (social_features.classroom_members cm
     JOIN social_features.classrooms c ON ((c.id = cm.classroom_id)))
  WHERE ((c.teacher_id = gamilit.get_current_user_id()) AND (cm.student_id = learning_sessions.user_id))))));
CREATE POLICY learning_sessions_update_own ON progress_tracking.learning_sessions FOR UPDATE USING ((user_id = gamilit.get_current_user_id()));

-- Comments
COMMENT ON TABLE progress_tracking.learning_sessions IS 'Sesiones de aprendizaje con tracking de tiempo y actividad';
COMMENT ON COLUMN progress_tracking.learning_sessions.session_type IS 'Tipo: learning, practice, assessment, review';

-- Permissions
ALTER TABLE progress_tracking.learning_sessions OWNER TO gamilit_user;
GRANT ALL ON TABLE progress_tracking.learning_sessions TO gamilit_user;
