-- =====================================================
-- RLS Policies for: social_features.guild_missions
-- Description: Row Level Security for guild missions
-- Created: 2026-02-03
-- Ticket: TASK-RLS-FK-OPTIMIZATION
-- =====================================================
--
-- Security Strategy:
-- - Guild members can view missions of their guild
-- - Guild leaders/officers can create and manage missions
-- - All authenticated users can see public guild missions
-- - Admins have full access
-- =====================================================

-- Enable RLS on the table
ALTER TABLE social_features.guild_missions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (for idempotency)
DROP POLICY IF EXISTS guild_missions_select_own_guild ON social_features.guild_missions;
DROP POLICY IF EXISTS guild_missions_select_public ON social_features.guild_missions;
DROP POLICY IF EXISTS guild_missions_leader_insert ON social_features.guild_missions;
DROP POLICY IF EXISTS guild_missions_leader_update ON social_features.guild_missions;
DROP POLICY IF EXISTS guild_missions_leader_delete ON social_features.guild_missions;
DROP POLICY IF EXISTS guild_missions_admin_all ON social_features.guild_missions;

-- =====================================================
-- Policy: guild_missions_select_own_guild
-- Purpose: Guild members can view all missions of their guild
-- =====================================================
CREATE POLICY guild_missions_select_own_guild
    ON social_features.guild_missions
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        -- User is a member of this guild
        EXISTS (
            SELECT 1 FROM social_features.guild_members gm
            WHERE gm.guild_id = guild_missions.guild_id
            AND gm.user_id = gamilit.get_current_user_id()
        )
    );

COMMENT ON POLICY guild_missions_select_own_guild ON social_features.guild_missions IS
    'Guild members can view all missions of their guild';

-- =====================================================
-- Policy: guild_missions_select_public
-- Purpose: Anyone can see active missions of public guilds
-- =====================================================
CREATE POLICY guild_missions_select_public
    ON social_features.guild_missions
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        -- Guild is public and mission is active
        status = 'active'
        AND EXISTS (
            SELECT 1 FROM social_features.guilds g
            WHERE g.id = guild_missions.guild_id
            AND g.is_public = true
        )
    );

COMMENT ON POLICY guild_missions_select_public ON social_features.guild_missions IS
    'Anyone can view active missions of public guilds';

-- =====================================================
-- Policy: guild_missions_leader_insert
-- Purpose: Guild leaders and officers can create new missions
-- =====================================================
CREATE POLICY guild_missions_leader_insert
    ON social_features.guild_missions
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (
        -- User is leader or officer of this guild
        EXISTS (
            SELECT 1 FROM social_features.guild_members gm
            WHERE gm.guild_id = guild_missions.guild_id
            AND gm.user_id = gamilit.get_current_user_id()
            AND gm.role IN ('leader', 'officer')
        )
    );

COMMENT ON POLICY guild_missions_leader_insert ON social_features.guild_missions IS
    'Guild leaders and officers can create new missions';

-- =====================================================
-- Policy: guild_missions_leader_update
-- Purpose: Guild leaders and officers can update missions
-- =====================================================
CREATE POLICY guild_missions_leader_update
    ON social_features.guild_missions
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING (
        -- User is leader or officer of this guild
        EXISTS (
            SELECT 1 FROM social_features.guild_members gm
            WHERE gm.guild_id = guild_missions.guild_id
            AND gm.user_id = gamilit.get_current_user_id()
            AND gm.role IN ('leader', 'officer')
        )
    )
    WITH CHECK (
        -- Can only update missions of own guild
        EXISTS (
            SELECT 1 FROM social_features.guild_members gm
            WHERE gm.guild_id = guild_missions.guild_id
            AND gm.user_id = gamilit.get_current_user_id()
            AND gm.role IN ('leader', 'officer')
        )
    );

COMMENT ON POLICY guild_missions_leader_update ON social_features.guild_missions IS
    'Guild leaders and officers can update their guild missions';

-- =====================================================
-- Policy: guild_missions_leader_delete
-- Purpose: Guild leaders can delete/cancel missions
-- =====================================================
CREATE POLICY guild_missions_leader_delete
    ON social_features.guild_missions
    AS PERMISSIVE
    FOR DELETE
    TO public
    USING (
        -- Only leaders can delete missions
        EXISTS (
            SELECT 1 FROM social_features.guild_members gm
            WHERE gm.guild_id = guild_missions.guild_id
            AND gm.user_id = gamilit.get_current_user_id()
            AND gm.role = 'leader'
        )
        -- Cannot delete completed missions (preserve history)
        AND status != 'completed'
    );

COMMENT ON POLICY guild_missions_leader_delete ON social_features.guild_missions IS
    'Guild leaders can delete non-completed missions';

-- =====================================================
-- Policy: guild_missions_admin_all
-- Purpose: System admins have full access
-- =====================================================
CREATE POLICY guild_missions_admin_all
    ON social_features.guild_missions
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            WHERE p.id = gamilit.get_current_user_id()
            AND p.role = 'super_admin'
        )
    );

COMMENT ON POLICY guild_missions_admin_all ON social_features.guild_missions IS
    'Super admins have full access to guild missions';

-- =====================================================
-- RLS for guild_mission_contributions
-- =====================================================

ALTER TABLE social_features.guild_mission_contributions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS guild_mission_contributions_select_guild ON social_features.guild_mission_contributions;
DROP POLICY IF EXISTS guild_mission_contributions_insert_own ON social_features.guild_mission_contributions;
DROP POLICY IF EXISTS guild_mission_contributions_admin_all ON social_features.guild_mission_contributions;

-- =====================================================
-- Policy: Contributions visible to guild members
-- =====================================================
CREATE POLICY guild_mission_contributions_select_guild
    ON social_features.guild_mission_contributions
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        -- User is member of the guild that owns this mission
        EXISTS (
            SELECT 1
            FROM social_features.guild_missions gm
            JOIN social_features.guild_members gmb ON gmb.guild_id = gm.guild_id
            WHERE gm.id = guild_mission_contributions.mission_id
            AND gmb.user_id = gamilit.get_current_user_id()
        )
    );

COMMENT ON POLICY guild_mission_contributions_select_guild ON social_features.guild_mission_contributions IS
    'Guild members can view all contributions to their guild missions';

-- =====================================================
-- Policy: Users can contribute to their guild missions
-- =====================================================
CREATE POLICY guild_mission_contributions_insert_own
    ON social_features.guild_mission_contributions
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (
        -- Can only insert own contributions
        user_id = gamilit.get_current_user_id()
        -- Must be member of the guild
        AND EXISTS (
            SELECT 1
            FROM social_features.guild_missions gm
            JOIN social_features.guild_members gmb ON gmb.guild_id = gm.guild_id
            WHERE gm.id = guild_mission_contributions.mission_id
            AND gmb.user_id = gamilit.get_current_user_id()
        )
        -- Mission must be active
        AND EXISTS (
            SELECT 1 FROM social_features.guild_missions gm
            WHERE gm.id = guild_mission_contributions.mission_id
            AND gm.status = 'active'
        )
    );

COMMENT ON POLICY guild_mission_contributions_insert_own ON social_features.guild_mission_contributions IS
    'Guild members can contribute to active guild missions';

-- =====================================================
-- Policy: Admin access
-- =====================================================
CREATE POLICY guild_mission_contributions_admin_all
    ON social_features.guild_mission_contributions
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            WHERE p.id = gamilit.get_current_user_id()
            AND p.role = 'super_admin'
        )
    );

COMMENT ON POLICY guild_mission_contributions_admin_all ON social_features.guild_mission_contributions IS
    'Super admins have full access to guild mission contributions';

-- =====================================================
-- Update table comments
-- =====================================================
COMMENT ON TABLE social_features.guild_missions IS
    'RLS enabled: Guild missions - guild_members_only access pattern';

COMMENT ON TABLE social_features.guild_mission_contributions IS
    'RLS enabled: Contributions to guild missions - guild_members_only access';

-- =====================================================
-- Grants
-- =====================================================
GRANT ALL ON TABLE social_features.guild_missions TO gamilit_user;
GRANT ALL ON TABLE social_features.guild_mission_contributions TO gamilit_user;

-- =====================================================
-- SUMMARY
-- =====================================================
-- guild_missions policies: 6
-- - guild_missions_select_own_guild: SELECT for guild members
-- - guild_missions_select_public: SELECT for public guilds
-- - guild_missions_leader_insert: INSERT for leaders/officers
-- - guild_missions_leader_update: UPDATE for leaders/officers
-- - guild_missions_leader_delete: DELETE for leaders only
-- - guild_missions_admin_all: ALL for admins
--
-- guild_mission_contributions policies: 3
-- - guild_mission_contributions_select_guild: SELECT for guild members
-- - guild_mission_contributions_insert_own: INSERT own contributions
-- - guild_mission_contributions_admin_all: ALL for admins
-- =====================================================
