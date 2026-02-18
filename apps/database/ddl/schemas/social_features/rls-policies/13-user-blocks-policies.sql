-- =====================================================
-- RLS Policies for: social_features.user_blocks
-- Description: User blocking management with owner-only access
-- Created: 2026-02-03
-- Ticket: GAP-SOC-004
-- Policies: 5 (SELECT: 2, INSERT: 1, UPDATE: 1, DELETE: 1)
-- =====================================================
--
-- Security Strategy:
-- - Users can only see and manage their own blocks
-- - Admins can see all blocks for moderation purposes
-- - Blocked users cannot see that they are blocked (privacy)
-- =====================================================

-- Habilitar RLS
ALTER TABLE social_features.user_blocks ENABLE ROW LEVEL SECURITY;

-- Limpiar politicas existentes
DROP POLICY IF EXISTS user_blocks_select_own ON social_features.user_blocks;
DROP POLICY IF EXISTS user_blocks_select_admin ON social_features.user_blocks;
DROP POLICY IF EXISTS user_blocks_insert_own ON social_features.user_blocks;
DROP POLICY IF EXISTS user_blocks_update_own ON social_features.user_blocks;
DROP POLICY IF EXISTS user_blocks_delete_own ON social_features.user_blocks;

-- =====================================================
-- Policy: user_blocks_select_own
-- Purpose: Users can see blocks they have created
-- =====================================================
CREATE POLICY user_blocks_select_own
    ON social_features.user_blocks
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        blocker_id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY user_blocks_select_own ON social_features.user_blocks IS
    'Users can only see the blocks they have created (not blocks against them)';

-- =====================================================
-- Policy: user_blocks_select_admin
-- Purpose: Admins can see all blocks for moderation
-- =====================================================
CREATE POLICY user_blocks_select_admin
    ON social_features.user_blocks
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            WHERE p.id = current_setting('app.current_user_id', true)::uuid
            AND p.role IN ('admin_teacher', 'super_admin')
        )
    );

COMMENT ON POLICY user_blocks_select_admin ON social_features.user_blocks IS
    'Admins and super_admins can see all user blocks for moderation purposes';

-- =====================================================
-- Policy: user_blocks_insert_own
-- Purpose: Users can create blocks against other users
-- =====================================================
CREATE POLICY user_blocks_insert_own
    ON social_features.user_blocks
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (
        blocker_id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY user_blocks_insert_own ON social_features.user_blocks IS
    'Users can only create blocks where they are the blocker';

-- =====================================================
-- Policy: user_blocks_update_own
-- Purpose: Users can update their own blocks (reason/notes)
-- =====================================================
CREATE POLICY user_blocks_update_own
    ON social_features.user_blocks
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING (
        blocker_id = current_setting('app.current_user_id', true)::uuid
    )
    WITH CHECK (
        blocker_id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY user_blocks_update_own ON social_features.user_blocks IS
    'Users can update the reason/notes on blocks they created';

-- =====================================================
-- Policy: user_blocks_delete_own
-- Purpose: Users can unblock users they have blocked
-- =====================================================
CREATE POLICY user_blocks_delete_own
    ON social_features.user_blocks
    AS PERMISSIVE
    FOR DELETE
    TO public
    USING (
        blocker_id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY user_blocks_delete_own ON social_features.user_blocks IS
    'Users can delete (unblock) blocks they have created';

