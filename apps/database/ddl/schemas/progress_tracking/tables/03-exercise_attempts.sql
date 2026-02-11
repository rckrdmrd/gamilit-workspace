-- =====================================================
-- Table: progress_tracking.exercise_attempts
-- Description: Intentos de ejercicios con respuestas, puntajes y uso de comodines
-- Dependencies: auth_management.profiles, educational_content.exercises
-- =====================================================

DROP TABLE IF EXISTS progress_tracking.exercise_attempts CASCADE;

CREATE TABLE progress_tracking.exercise_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    exercise_id uuid NOT NULL,
    attempt_number integer DEFAULT 1,
    submitted_answers jsonb NOT NULL,
    is_correct boolean,
    score integer,
    time_spent_seconds integer,
    hints_used integer DEFAULT 0,
    comodines_used jsonb DEFAULT '[]'::jsonb,
    xp_earned integer DEFAULT 0,
    ml_coins_earned integer DEFAULT 0,
    submitted_at timestamptz DEFAULT gamilit.now_mexico(),
    metadata jsonb DEFAULT '{"browser": null, "device_type": null, "response_pattern": []}'::jsonb,

    -- Primary Key
    CONSTRAINT exercise_attempts_pkey PRIMARY KEY (id),

    -- Check Constraints
    CONSTRAINT exercise_attempts_attempt_number_check CHECK ((attempt_number > 0)),
    CONSTRAINT exercise_attempts_score_check CHECK ((score >= 0))
);

-- Indexes
CREATE INDEX idx_exercise_attempts_exercise ON progress_tracking.exercise_attempts(exercise_id);
CREATE INDEX idx_exercise_attempts_submitted ON progress_tracking.exercise_attempts(submitted_at DESC);
CREATE INDEX idx_exercise_attempts_user ON progress_tracking.exercise_attempts(user_id);
CREATE INDEX idx_exercise_attempts_user_exercise ON progress_tracking.exercise_attempts(user_id, exercise_id);
CREATE INDEX idx_exercise_attempts_user_exercise_date ON progress_tracking.exercise_attempts(user_id, exercise_id, submitted_at DESC);

-- Foreign Keys
ALTER TABLE ONLY progress_tracking.exercise_attempts
    ADD CONSTRAINT exercise_attempts_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES educational_content.exercises(id) ON DELETE CASCADE;

ALTER TABLE ONLY progress_tracking.exercise_attempts
    ADD CONSTRAINT exercise_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;

-- Triggers
-- NOTE: Trigger trg_update_user_stats_on_exercise movido a archivo separado
-- Ver: progress_tracking/triggers/21-trg_update_user_stats_on_exercise.sql

-- RLS Policies
CREATE POLICY exercise_attempts_insert_own ON progress_tracking.exercise_attempts FOR INSERT WITH CHECK ((user_id = gamilit.get_current_user_id()));
CREATE POLICY exercise_attempts_select_admin ON progress_tracking.exercise_attempts FOR SELECT USING (gamilit.is_admin());
CREATE POLICY exercise_attempts_select_own ON progress_tracking.exercise_attempts FOR SELECT USING ((user_id = gamilit.get_current_user_id()));
CREATE POLICY exercise_attempts_select_teacher ON progress_tracking.exercise_attempts FOR SELECT USING (((gamilit.get_current_user_role() = 'admin_teacher'::auth_management.gamilit_role) AND (EXISTS ( SELECT 1
   FROM (social_features.classroom_members cm
     JOIN social_features.classrooms c ON ((c.id = cm.classroom_id)))
  WHERE ((c.teacher_id = gamilit.get_current_user_id()) AND (cm.student_id = exercise_attempts.user_id))))));

-- Comments
COMMENT ON TABLE progress_tracking.exercise_attempts IS 'Intentos de ejercicios con respuestas, puntajes y uso de comodines';
COMMENT ON COLUMN progress_tracking.exercise_attempts.comodines_used IS 'Array de comodines usados: ["pistas", "vision_lectora"]';

-- Permissions
ALTER TABLE progress_tracking.exercise_attempts OWNER TO gamilit_user;
GRANT ALL ON TABLE progress_tracking.exercise_attempts TO gamilit_user;
