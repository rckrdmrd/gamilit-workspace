-- =====================================================
-- Table: progress_tracking.exercise_submissions
-- Description: Student exercise submissions and attempts
-- Dependencies: auth_management.profiles, educational_content.exercises
-- =====================================================

DROP TABLE IF EXISTS progress_tracking.exercise_submissions CASCADE;

CREATE TABLE progress_tracking.exercise_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    exercise_id uuid NOT NULL,
    answer_data jsonb NOT NULL,
    is_correct boolean,
    score integer DEFAULT 0,
    max_score integer DEFAULT 100,
    feedback text,
    hint_used boolean DEFAULT false,
    hints_count integer DEFAULT 0,
    comodines_used text[],
    ml_coins_spent integer DEFAULT 0,
    time_spent_seconds integer,
    attempt_number integer DEFAULT 1,
    status text DEFAULT 'submitted'::text,
    started_at timestamptz,
    submitted_at timestamptz DEFAULT gamilit.now_mexico(),
    graded_at timestamptz,
    created_at timestamptz DEFAULT gamilit.now_mexico() NOT NULL,
    updated_at timestamptz DEFAULT gamilit.now_mexico(),
    xp_earned integer DEFAULT 0,
    ml_coins_earned integer DEFAULT 0,
    rewards_claimed boolean DEFAULT false,

    -- Primary Key
    CONSTRAINT exercise_submissions_pkey PRIMARY KEY (id),

    -- Check Constraints
    CONSTRAINT check_score_range CHECK (((score >= 0) AND (score <= max_score))),
    CONSTRAINT exercise_submissions_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'submitted'::text, 'graded'::text, 'reviewed'::text, 'pending_review'::text])))
);

-- Indexes
CREATE INDEX idx_exercise_submissions_exercise_id ON progress_tracking.exercise_submissions(exercise_id);
CREATE INDEX idx_exercise_submissions_status ON progress_tracking.exercise_submissions(status);
CREATE INDEX idx_exercise_submissions_submitted_at ON progress_tracking.exercise_submissions(submitted_at DESC);
CREATE INDEX idx_exercise_submissions_user_exercise ON progress_tracking.exercise_submissions(user_id, exercise_id);
CREATE INDEX idx_exercise_submissions_user_id ON progress_tracking.exercise_submissions(user_id);

-- Foreign Keys
ALTER TABLE ONLY progress_tracking.exercise_submissions
    ADD CONSTRAINT fk_exercise_submissions_exercise FOREIGN KEY (exercise_id) REFERENCES educational_content.exercises(id) ON DELETE CASCADE;

ALTER TABLE ONLY progress_tracking.exercise_submissions
    ADD CONSTRAINT fk_exercise_submissions_user FOREIGN KEY (user_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;

-- Triggers
-- NOTE: Trigger exercise_submissions_updated_at movido a archivo separado
-- Ver: progress_tracking/triggers/20-exercise_submissions_updated_at.sql

-- Row Level Security
ALTER TABLE progress_tracking.exercise_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY exercise_submissions_insert_own ON progress_tracking.exercise_submissions FOR INSERT WITH CHECK ((user_id = gamilit.get_current_user_id()));
CREATE POLICY exercise_submissions_select_admin ON progress_tracking.exercise_submissions FOR SELECT USING (gamilit.is_admin());
CREATE POLICY exercise_submissions_select_own ON progress_tracking.exercise_submissions FOR SELECT USING ((user_id = gamilit.get_current_user_id()));
CREATE POLICY exercise_submissions_select_teacher ON progress_tracking.exercise_submissions FOR SELECT USING (((gamilit.get_current_user_role() = 'admin_teacher'::auth_management.gamilit_role) AND (EXISTS ( SELECT 1
   FROM (social_features.classroom_members cm
     JOIN social_features.classrooms c ON ((c.id = cm.classroom_id)))
  WHERE ((c.teacher_id = gamilit.get_current_user_id()) AND (cm.student_id = exercise_submissions.user_id))))));
CREATE POLICY exercise_submissions_update_own ON progress_tracking.exercise_submissions FOR UPDATE USING ((user_id = gamilit.get_current_user_id()));

-- Comments
COMMENT ON TABLE progress_tracking.exercise_submissions IS 'Student exercise submissions and attempts';
COMMENT ON COLUMN progress_tracking.exercise_submissions.answer_data IS 'Student answer in JSON format';
COMMENT ON COLUMN progress_tracking.exercise_submissions.comodines_used IS 'Array of comodin types used (pistas, vision_lectora, etc)';
COMMENT ON COLUMN progress_tracking.exercise_submissions.xp_earned IS 'XP earned for completing this exercise correctly';
COMMENT ON COLUMN progress_tracking.exercise_submissions.ml_coins_earned IS 'ML Coins earned for completing this exercise';
COMMENT ON COLUMN progress_tracking.exercise_submissions.rewards_claimed IS 'Indicates if rewards (XP/ML Coins) have already been claimed to prevent duplicate distribution';

-- Permissions
ALTER TABLE progress_tracking.exercise_submissions OWNER TO gamilit_user;
GRANT ALL ON TABLE progress_tracking.exercise_submissions TO gamilit_user;
