-- =====================================================
-- Table: user_current_levels
-- Description: Nivel actual del estudiante (denormalizado para performance)
-- Schema: progress_tracking
-- Created: 2025-11-11
-- Version: 1.0
-- =====================================================

DROP TABLE IF EXISTS progress_tracking.user_current_levels CASCADE;

CREATE TABLE progress_tracking.user_current_levels (
    user_id UUID PRIMARY KEY REFERENCES auth_management.profiles(id) ON DELETE CASCADE,
    current_level educational_content.difficulty_level NOT NULL DEFAULT 'beginner',
    previous_level educational_content.difficulty_level,

    -- Control de zona de desarrollo próximo
    max_allowed_level educational_content.difficulty_level NOT NULL DEFAULT 'elementary',

    -- Placement test
    placement_test_completed BOOLEAN NOT NULL DEFAULT FALSE,
    placement_test_score NUMERIC(5,2),
    placement_test_date TIMESTAMPTZ,

    -- Timestamps
    level_changed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMPTZ DEFAULT gamilit.now_mexico()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_current_levels_level
    ON progress_tracking.user_current_levels(current_level);

CREATE INDEX IF NOT EXISTS idx_user_current_levels_max_allowed
    ON progress_tracking.user_current_levels(max_allowed_level);

-- Política RLS
ALTER TABLE progress_tracking.user_current_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_current_levels_select_own
ON progress_tracking.user_current_levels
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY user_current_levels_manage_system
ON progress_tracking.user_current_levels
FOR ALL
USING (TRUE)
WITH CHECK (TRUE);

-- Trigger para updated_at
CREATE TRIGGER trg_user_current_levels_updated_at
    BEFORE UPDATE ON progress_tracking.user_current_levels
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

-- Comentarios
COMMENT ON TABLE progress_tracking.user_current_levels IS
'Nivel actual del estudiante (denormalizado para performance).
Incluye control de zona de desarrollo próximo y resultados de placement test.';

COMMENT ON COLUMN progress_tracking.user_current_levels.max_allowed_level IS
'Nivel máximo permitido según zona de desarrollo próximo (ZDP)';

COMMENT ON COLUMN progress_tracking.user_current_levels.placement_test_completed IS
'Indica si el usuario completó el placement test inicial';

-- Grants
GRANT SELECT ON progress_tracking.user_current_levels TO authenticated;
