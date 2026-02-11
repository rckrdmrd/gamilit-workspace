-- =====================================================
-- Table: progress_tracking.scheduled_missions
-- Description: Misiones programadas para aulas específicas con fechas y bonificaciones
-- Dependencies: auth_management.profiles, social_features.classrooms
-- =====================================================

DROP TABLE IF EXISTS progress_tracking.scheduled_missions CASCADE;

CREATE TABLE progress_tracking.scheduled_missions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    mission_id uuid NOT NULL,
    classroom_id uuid NOT NULL,
    scheduled_by uuid NOT NULL,
    starts_at timestamptz NOT NULL,
    ends_at timestamptz NOT NULL,
    is_active boolean DEFAULT true,
    bonus_xp integer DEFAULT 0,
    bonus_coins integer DEFAULT 0,
    created_at timestamptz DEFAULT gamilit.now_mexico(),

    -- Primary Key
    CONSTRAINT scheduled_missions_pkey PRIMARY KEY (id),

    -- Check Constraints
    CONSTRAINT chk_mission_dates CHECK (ends_at > starts_at),
    CONSTRAINT chk_bonus_xp CHECK (bonus_xp >= 0),
    CONSTRAINT chk_bonus_coins CHECK (bonus_coins >= 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scheduled_missions_mission ON progress_tracking.scheduled_missions(mission_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_missions_classroom ON progress_tracking.scheduled_missions(classroom_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_missions_scheduled_by ON progress_tracking.scheduled_missions(scheduled_by);
CREATE INDEX IF NOT EXISTS idx_scheduled_missions_dates ON progress_tracking.scheduled_missions(starts_at, ends_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_scheduled_missions_active ON progress_tracking.scheduled_missions(is_active, starts_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_scheduled_missions_classroom_active ON progress_tracking.scheduled_missions(classroom_id, is_active) WHERE is_active = true;

-- Foreign Keys
-- ON DELETE RESTRICT: No permitir eliminar profesor si tiene misiones programadas
ALTER TABLE ONLY progress_tracking.scheduled_missions
    ADD CONSTRAINT scheduled_missions_scheduled_by_fkey FOREIGN KEY (scheduled_by) REFERENCES auth_management.profiles(id) ON DELETE RESTRICT;

-- Row Level Security
ALTER TABLE progress_tracking.scheduled_missions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY scheduled_missions_select_admin ON progress_tracking.scheduled_missions FOR SELECT USING (gamilit.is_admin());

CREATE POLICY scheduled_missions_select_teacher ON progress_tracking.scheduled_missions FOR SELECT USING (
  ((gamilit.get_current_user_role() = 'admin_teacher'::auth_management.gamilit_role) AND
   (EXISTS ( SELECT 1
     FROM social_features.classrooms c
    WHERE ((c.id = scheduled_missions.classroom_id) AND (c.teacher_id = gamilit.get_current_user_id())))))
);

CREATE POLICY scheduled_missions_insert_teacher ON progress_tracking.scheduled_missions FOR INSERT WITH CHECK (
  ((gamilit.get_current_user_role() = 'admin_teacher'::auth_management.gamilit_role) AND
   (EXISTS ( SELECT 1
     FROM social_features.classrooms c
    WHERE ((c.id = classroom_id) AND (c.teacher_id = gamilit.get_current_user_id())))))
);

CREATE POLICY scheduled_missions_update_teacher ON progress_tracking.scheduled_missions FOR UPDATE USING (
  ((gamilit.get_current_user_role() = 'admin_teacher'::auth_management.gamilit_role) AND
   (EXISTS ( SELECT 1
     FROM social_features.classrooms c
    WHERE ((c.id = scheduled_missions.classroom_id) AND (c.teacher_id = gamilit.get_current_user_id())))))
);

-- Comments
COMMENT ON TABLE progress_tracking.scheduled_missions IS 'Misiones programadas para aulas específicas con fechas de inicio/fin y bonificaciones opcionales';
COMMENT ON COLUMN progress_tracking.scheduled_missions.mission_id IS 'ID de la misión programada';
COMMENT ON COLUMN progress_tracking.scheduled_missions.classroom_id IS 'ID del aula donde se programa la misión';
COMMENT ON COLUMN progress_tracking.scheduled_missions.scheduled_by IS 'Usuario (profesor) que programó la misión';
COMMENT ON COLUMN progress_tracking.scheduled_missions.starts_at IS 'Fecha y hora de inicio de la misión';
COMMENT ON COLUMN progress_tracking.scheduled_missions.ends_at IS 'Fecha y hora de finalización de la misión';
COMMENT ON COLUMN progress_tracking.scheduled_missions.is_active IS 'Indica si la misión programada está activa';
COMMENT ON COLUMN progress_tracking.scheduled_missions.bonus_xp IS 'Puntos de experiencia adicionales otorgados al completar';
COMMENT ON COLUMN progress_tracking.scheduled_missions.bonus_coins IS 'ML Coins adicionales otorgadas al completar';

-- Permissions
ALTER TABLE progress_tracking.scheduled_missions OWNER TO gamilit_user;
GRANT ALL ON TABLE progress_tracking.scheduled_missions TO gamilit_user;
