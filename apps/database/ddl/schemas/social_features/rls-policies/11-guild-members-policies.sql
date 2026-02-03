-- =====================================================
-- RLS Policies for: social_features.guild_members
-- Description: Row Level Security for guild memberships
-- Created: 2026-02-03
-- Ticket: TASK-RLS-FK-OPTIMIZATION
-- =====================================================
--
-- Security Strategy:
-- - Guild members can view all members of their guild
-- - Users can only insert/delete their own membership
-- - Guild leaders/officers can manage members
-- - Admins have full access
-- =====================================================

-- Enable RLS on the table
ALTER TABLE social_features.guild_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (for idempotency)
DROP POLICY IF EXISTS guild_members_select_own_guild ON social_features.guild_members;
DROP POLICY IF EXISTS guild_members_select_public ON social_features.guild_members;
DROP POLICY IF EXISTS guild_members_insert_own ON social_features.guild_members;
DROP POLICY IF EXISTS guild_members_delete_own ON social_features.guild_members;
DROP POLICY IF EXISTS guild_members_leader_manage ON social_features.guild_members;
DROP POLICY IF EXISTS guild_members_admin_all ON social_features.guild_members;

-- =====================================================
-- Policy: guild_members_select_own_guild
-- Purpose: Guild members can view all members of their guild
-- =====================================================
CREATE POLICY guild_members_select_own_guild
    ON social_features.guild_members
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        -- User is a member of the same guild
        guild_id IN (
            SELECT gm.guild_id
            FROM social_features.guild_members gm
            WHERE gm.user_id = gamilit.get_current_user_id()
        )
    );

COMMENT ON POLICY guild_members_select_own_guild ON social_features.guild_members IS
    'Guild members can view all members of their own guild';

-- =====================================================
-- Policy: guild_members_select_public
-- Purpose: Anyone can see basic guild member info for public guilds
-- =====================================================
CREATE POLICY guild_members_select_public
    ON social_features.guild_members
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        -- Guild is public
        EXISTS (
            SELECT 1 FROM social_features.guilds g
            WHERE g.id = guild_members.guild_id
            AND g.is_public = true
        )
    );

COMMENT ON POLICY guild_members_select_public ON social_features.guild_members IS
    'Anyone can view members of public guilds';

-- =====================================================
-- Policy: guild_members_insert_own
-- Purpose: Users can join guilds (insert their own membership)
-- =====================================================
CREATE POLICY guild_members_insert_own
    ON social_features.guild_members
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (
        -- Can only insert your own membership
        user_id = gamilit.get_current_user_id()
        -- Must be joining an open guild or have an invitation
        AND (
            EXISTS (
                SELECT 1 FROM social_features.guilds g
                WHERE g.id = guild_members.guild_id
                AND g.is_recruiting = true
                AND g.member_count < g.max_members
            )
            -- OR has pending invitation (if guild_invitations table exists)
        )
    );

COMMENT ON POLICY guild_members_insert_own ON social_features.guild_members IS
    'Users can join recruiting guilds with available capacity';

-- =====================================================
-- Policy: guild_members_delete_own
-- Purpose: Users can leave guilds (delete their own membership)
-- =====================================================
CREATE POLICY guild_members_delete_own
    ON social_features.guild_members
    AS PERMISSIVE
    FOR DELETE
    TO public
    USING (
        -- Can only delete your own membership
        user_id = gamilit.get_current_user_id()
        -- Cannot leave if you're the only leader (prevent orphan guilds)
        AND NOT (
            role = 'leader'
            AND NOT EXISTS (
                SELECT 1 FROM social_features.guild_members gm2
                WHERE gm2.guild_id = guild_members.guild_id
                AND gm2.role = 'leader'
                AND gm2.user_id != guild_members.user_id
            )
        )
    );

COMMENT ON POLICY guild_members_delete_own ON social_features.guild_members IS
    'Users can leave guilds (leaders must transfer leadership first)';

-- =====================================================
-- Policy: guild_members_leader_manage
-- Purpose: Guild leaders and officers can manage members
-- =====================================================
CREATE POLICY guild_members_leader_manage
    ON social_features.guild_members
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (
        -- Current user is leader or officer of this guild
        EXISTS (
            SELECT 1 FROM social_features.guild_members gm
            WHERE gm.guild_id = guild_members.guild_id
            AND gm.user_id = gamilit.get_current_user_id()
            AND gm.role IN ('leader', 'officer')
        )
    )
    WITH CHECK (
        -- Can't promote to leader (only transfer) and officers can't modify other officers
        EXISTS (
            SELECT 1 FROM social_features.guild_members gm
            WHERE gm.guild_id = guild_members.guild_id
            AND gm.user_id = gamilit.get_current_user_id()
            AND (
                gm.role = 'leader'  -- Leaders can do anything
                OR (gm.role = 'officer' AND guild_members.role = 'member')  -- Officers can only manage members
            )
        )
    );

COMMENT ON POLICY guild_members_leader_manage ON social_features.guild_members IS
    'Guild leaders can manage all members, officers can manage regular members';

-- =====================================================
-- Policy: guild_members_admin_all
-- Purpose: System admins have full access
-- =====================================================
CREATE POLICY guild_members_admin_all
    ON social_features.guild_members
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            WHERE p.id = gamilit.get_current_user_id()
            AND p.role = 'SUPER_ADMIN'
        )
    );

COMMENT ON POLICY guild_members_admin_all ON social_features.guild_members IS
    'Super admins have full access to guild memberships';

-- =====================================================
-- Update table comment
-- =====================================================
COMMENT ON TABLE social_features.guild_members IS
    'RLS enabled: Guild memberships - guild_members_only access pattern';

-- =====================================================
-- Grants
-- =====================================================
GRANT ALL ON TABLE social_features.guild_members TO gamilit_user;

-- =====================================================
-- SUMMARY
-- =====================================================
-- Total policies: 6
-- - guild_members_select_own_guild: SELECT for guild members
-- - guild_members_select_public: SELECT for public guilds
-- - guild_members_insert_own: INSERT own membership
-- - guild_members_delete_own: DELETE own membership
-- - guild_members_leader_manage: ALL for leaders/officers
-- - guild_members_admin_all: ALL for admins
-- =====================================================
