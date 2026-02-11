-- =====================================================
-- Table: progress_tracking.module_progress
-- Description: Progreso del estudiante por módulo - tracking completo de avance
-- Dependencies: auth_management.profiles, educational_content.modules
-- =====================================================

DROP TABLE IF EXISTS progress_tracking.module_progress CASCADE;

CREATE TABLE progress_tracking.module_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    module_id uuid NOT NULL,
    status progress_tracking.progress_status DEFAULT 'not_started'::progress_tracking.progress_status,
    progress_percentage integer DEFAULT 0,
    completed_exercises integer DEFAULT 0,
    total_exercises integer DEFAULT 0,
    -- FEATURE M3-M5 2026-01-08: Tracking de submitted vs graded para ejercicios con revision manual
    submitted_exercises integer DEFAULT 0,
    graded_exercises integer DEFAULT 0,
    submitted_progress_percentage numeric(5,2) DEFAULT 0,
    graded_progress_percentage numeric(5,2) DEFAULT 0,
    skipped_exercises integer DEFAULT 0,
    total_score integer DEFAULT 0,
    max_possible_score integer,
    average_score numeric(5,2),
    best_score integer,
    total_xp_earned integer DEFAULT 0,
    total_ml_coins_earned integer DEFAULT 0,
    time_spent interval DEFAULT '00:00:00'::interval,
    sessions_count integer DEFAULT 0,
    attempts_count integer DEFAULT 0,
    hints_used_total integer DEFAULT 0,
    comodines_used_total integer DEFAULT 0,
    comodines_cost_total integer DEFAULT 0,
    started_at timestamptz,
    completed_at timestamptz,
    last_accessed_at timestamptz,
    deadline timestamptz,
    classroom_id uuid,
    assignment_id uuid,
    allow_retry boolean DEFAULT true,
    sequential_completion boolean DEFAULT false,
    adaptive_difficulty boolean DEFAULT false,
    learning_path jsonb DEFAULT '[]'::jsonb,
    performance_analytics jsonb DEFAULT '{}'::jsonb,
    student_notes text,
    teacher_notes text,
    system_observations jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT gamilit.now_mexico(),
    updated_at timestamptz DEFAULT gamilit.now_mexico(),

    -- Primary Key
    CONSTRAINT module_progress_pkey PRIMARY KEY (id),

    -- Unique Constraints
    CONSTRAINT module_progress_user_id_module_id_key UNIQUE (user_id, module_id),

    -- Check Constraints
    CONSTRAINT module_progress_progress_percentage_check CHECK (((progress_percentage >= 0) AND (progress_percentage <= 100)))
);

-- Indexes
CREATE INDEX idx_module_progress_classroom ON progress_tracking.module_progress(classroom_id);
CREATE INDEX idx_module_progress_completed ON progress_tracking.module_progress(user_id, status) WHERE status = 'completed'::progress_tracking.progress_status;
CREATE INDEX idx_module_progress_incomplete ON progress_tracking.module_progress(user_id, updated_at DESC) WHERE status = ANY (ARRAY['not_started'::progress_tracking.progress_status, 'in_progress'::progress_tracking.progress_status]);
CREATE INDEX idx_module_progress_module ON progress_tracking.module_progress(module_id);
CREATE INDEX idx_module_progress_status ON progress_tracking.module_progress(status);
CREATE INDEX idx_module_progress_user ON progress_tracking.module_progress(user_id);
CREATE INDEX idx_module_progress_user_status_updated ON progress_tracking.module_progress(user_id, status, updated_at DESC);

-- Foreign Keys
ALTER TABLE ONLY progress_tracking.module_progress
    ADD CONSTRAINT module_progress_module_id_fkey FOREIGN KEY (module_id) REFERENCES educational_content.modules(id) ON DELETE CASCADE;

ALTER TABLE ONLY progress_tracking.module_progress
    ADD CONSTRAINT module_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;

-- Triggers
-- NOTE: Trigger trg_module_progress_updated_at movido a archivo separado
-- Ver: progress_tracking/triggers/23-trg_module_progress_updated_at.sql

-- RLS Policies
CREATE POLICY module_progress_insert_own ON progress_tracking.module_progress FOR INSERT WITH CHECK ((user_id = gamilit.get_current_user_id()));
CREATE POLICY module_progress_select_admin ON progress_tracking.module_progress FOR SELECT USING (gamilit.is_admin());
CREATE POLICY module_progress_select_own ON progress_tracking.module_progress FOR SELECT USING ((user_id = gamilit.get_current_user_id()));
CREATE POLICY module_progress_select_teacher ON progress_tracking.module_progress FOR SELECT USING (((gamilit.get_current_user_role() = 'admin_teacher'::auth_management.gamilit_role) AND (EXISTS ( SELECT 1
   FROM (social_features.classroom_members cm
     JOIN social_features.classrooms c ON ((c.id = cm.classroom_id)))
  WHERE ((c.teacher_id = gamilit.get_current_user_id()) AND (cm.student_id = module_progress.user_id) AND (cm.status = 'active'::text))))));
CREATE POLICY module_progress_update_own ON progress_tracking.module_progress FOR UPDATE USING ((user_id = gamilit.get_current_user_id()));

-- Comments
COMMENT ON TABLE progress_tracking.module_progress IS 'Progreso del estudiante por módulo - tracking completo de avance';
COMMENT ON COLUMN progress_tracking.module_progress.status IS 'Estado: not_started, in_progress, completed, reviewed, mastered';
COMMENT ON COLUMN progress_tracking.module_progress.submitted_exercises IS 'FEATURE M3-M5 2026-01-08: Ejercicios enviados (pendientes o validados) para ejercicios con revision manual';
COMMENT ON COLUMN progress_tracking.module_progress.graded_exercises IS 'FEATURE M3-M5 2026-01-08: Ejercicios calificados por el maestro (score >= 60)';
COMMENT ON COLUMN progress_tracking.module_progress.submitted_progress_percentage IS 'FEATURE M3-M5 2026-01-08: Progreso basado en envios (actualiza al enviar)';
COMMENT ON COLUMN progress_tracking.module_progress.graded_progress_percentage IS 'FEATURE M3-M5 2026-01-08: Progreso basado en calificaciones (actualiza al calificar)';

-- Permissions
ALTER TABLE progress_tracking.module_progress OWNER TO gamilit_user;
GRANT ALL ON TABLE progress_tracking.module_progress TO gamilit_user;
