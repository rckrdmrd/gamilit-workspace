-- =============================================================================
-- Table: gamification_system.classroom_missions
-- Description: Manages mission assignments to classrooms
-- Dependencies:
--   - social_features.classrooms
--   - gamification_system.missions (template reference via template_id)
--   - auth_management.profiles (for assigned_by)
-- Created: 2025-11-26
-- Priority: P1 - TASK 2.6 (Missions with Classroom Context)
-- User Story: Classroom-specific mission assignments
-- =============================================================================

-- Drop table if exists (for clean recreation)
DROP TABLE IF EXISTS gamification_system.classroom_missions CASCADE;

-- Create classroom_missions table
CREATE TABLE gamification_system.classroom_missions (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign keys
    classroom_id UUID NOT NULL
        REFERENCES social_features.classrooms(id) ON DELETE CASCADE,

    -- Mission template reference (not FK to missions table since that's per-user)
    -- Instead, we reference the template_id that missions use
    mission_template_id TEXT NOT NULL,

    -- Assignment tracking
    assigned_by UUID NOT NULL
        REFERENCES auth_management.profiles(id) ON DELETE RESTRICT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ,

    -- Mission configuration for this classroom
    is_mandatory BOOLEAN DEFAULT false,
    bonus_xp INTEGER DEFAULT 0,
    bonus_coins INTEGER DEFAULT 0,

    -- Mission details (denormalized for flexibility)
    title TEXT NOT NULL,
    description TEXT,
    mission_type TEXT NOT NULL
        CHECK (mission_type IN ('daily', 'weekly', 'special')),
    objectives JSONB NOT NULL,
    base_rewards JSONB NOT NULL,

    -- Status and configuration
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    -- Additional metadata (for custom settings per classroom)
    metadata JSONB DEFAULT '{}'::jsonb,
    -- Example metadata:
    -- {
    --   "custom_instructions": "Complete before Friday",
    --   "difficulty_override": "hard",
    --   "unlock_date": "2025-12-01",
    --   "auto_assign_to_new_students": true
    -- }

    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT classroom_missions_unique UNIQUE(classroom_id, mission_template_id),
    CONSTRAINT classroom_missions_bonus_xp_positive
        CHECK(bonus_xp >= 0),
    CONSTRAINT classroom_missions_bonus_coins_positive
        CHECK(bonus_coins >= 0)
);

-- =============================================================================
-- Indexes for performance optimization
-- =============================================================================

-- Index for finding all missions in a classroom (most common query)
CREATE INDEX idx_classroom_missions_classroom
    ON gamification_system.classroom_missions(classroom_id)
    WHERE is_active = TRUE;

-- Index for finding all classrooms using a mission template
CREATE INDEX idx_classroom_missions_template
    ON gamification_system.classroom_missions(mission_template_id)
    WHERE is_active = TRUE;

-- Index for due date queries
CREATE INDEX idx_classroom_missions_due_date
    ON gamification_system.classroom_missions(due_date)
    WHERE is_active = TRUE AND due_date IS NOT NULL;

-- Index for assignments by teacher (for analytics)
CREATE INDEX idx_classroom_missions_assigned_by
    ON gamification_system.classroom_missions(assigned_by, assigned_at);

-- Index for mission type filtering
CREATE INDEX idx_classroom_missions_type
    ON gamification_system.classroom_missions(mission_type)
    WHERE is_active = TRUE;

-- Composite index for classroom + type queries
CREATE INDEX idx_classroom_missions_classroom_type
    ON gamification_system.classroom_missions(classroom_id, mission_type)
    WHERE is_active = TRUE;

-- =============================================================================
-- Trigger for updated_at timestamp
-- =============================================================================

CREATE TRIGGER trg_classroom_missions_updated_at
    BEFORE UPDATE ON gamification_system.classroom_missions
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================

-- Enable RLS
ALTER TABLE gamification_system.classroom_missions ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can manage missions in their classrooms
CREATE POLICY classroom_missions_teacher_access
    ON gamification_system.classroom_missions
    FOR ALL
    USING (
        classroom_id IN (
            SELECT classroom_id
            FROM social_features.teacher_classrooms
            WHERE teacher_id = (
                SELECT id FROM auth_management.profiles WHERE user_id = auth.uid()
            )
        )
    );

-- Policy: Students can view missions in their classrooms
CREATE POLICY classroom_missions_student_view
    ON gamification_system.classroom_missions
    FOR SELECT
    USING (
        is_active = TRUE
        AND classroom_id IN (
            SELECT classroom_id
            FROM social_features.classroom_members
            WHERE student_id = (
                SELECT id FROM auth_management.profiles WHERE user_id = auth.uid()
            )
            AND is_active = TRUE
        )
    );

-- Policy: Admins and super admins can manage all
CREATE POLICY classroom_missions_admin_access
    ON gamification_system.classroom_missions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.user_roles
            WHERE user_id = auth.uid()
              AND role IN ('admin_teacher', 'super_admin')
              AND is_active = TRUE
        )
    );

-- =============================================================================
-- Comments for documentation
-- =============================================================================

COMMENT ON TABLE gamification_system.classroom_missions IS
'Manages the assignment and configuration of missions to specific classrooms. Allows teachers to assign missions with custom rewards and settings per classroom.';

COMMENT ON COLUMN gamification_system.classroom_missions.mission_template_id IS
'Reference to mission template ID (matches template_id in missions table)';

COMMENT ON COLUMN gamification_system.classroom_missions.bonus_xp IS
'Additional XP awarded on top of base mission rewards for this classroom';

COMMENT ON COLUMN gamification_system.classroom_missions.bonus_coins IS
'Additional ML Coins awarded on top of base mission rewards for this classroom';

COMMENT ON COLUMN gamification_system.classroom_missions.metadata IS
'JSON configuration for classroom-specific mission settings (instructions, difficulty, unlock dates, etc.)';

COMMENT ON COLUMN gamification_system.classroom_missions.is_mandatory IS
'Whether the mission is mandatory for students in this classroom';

COMMENT ON COLUMN gamification_system.classroom_missions.objectives IS
'JSON array of mission objectives (copied from mission template for denormalization)';

COMMENT ON COLUMN gamification_system.classroom_missions.base_rewards IS
'Base rewards from mission template (before bonuses)';

-- =============================================================================
-- Grant permissions
-- =============================================================================

-- Grant appropriate permissions to backend service role
GRANT SELECT, INSERT, UPDATE, DELETE ON gamification_system.classroom_missions TO gamilit_user;
