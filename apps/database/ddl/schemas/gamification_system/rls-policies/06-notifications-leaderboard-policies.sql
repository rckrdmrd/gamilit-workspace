-- =====================================================
-- RLS Policies for: gamification_system.leaderboard_metadatas
-- Description: Leaderboard configuration policies
-- Created: 2025-10-28
-- Updated: 2026-01-07 (notifications movido a _deprecated)
-- =====================================================
--
-- NOTA (2026-01-07): Policies de notifications movidas a:
--   _deprecated/06-notifications-policies.sql
-- Razon: Tabla gamification_system.notifications deprecated
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 3)
-- =====================================================

-- =====================================================
-- TABLE: gamification_system.leaderboard_metadatas
-- Policies: 2 (SELECT: 1, ALL: 1)
-- =====================================================

DROP POLICY IF EXISTS leaderboard_metadata_read_all ON gamification_system.leaderboard_metadatas;
DROP POLICY IF EXISTS leaderboard_metadata_manage_admin ON gamification_system.leaderboard_metadatas;

-- Policy: leaderboard_metadata_read_all
-- Purpose: All users can read leaderboard metadata (public configuration)
CREATE POLICY leaderboard_metadata_read_all
    ON gamification_system.leaderboard_metadatas
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (true);

COMMENT ON POLICY leaderboard_metadata_read_all ON gamification_system.leaderboard_metadatas IS
    'Public metadata: All users can see leaderboard configuration';

-- Policy: leaderboard_metadata_manage_admin
-- Purpose: Admins can manage leaderboard metadata
CREATE POLICY leaderboard_metadata_manage_admin
    ON gamification_system.leaderboard_metadatas
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.user_roles ur
            WHERE ur.user_id = current_setting('app.current_user_id', true)::uuid
                AND ur.role = 'super_admin'
        )
    );

COMMENT ON POLICY leaderboard_metadata_manage_admin ON gamification_system.leaderboard_metadatas IS
    'Admins can configure leaderboard settings and metadata';

-- =====================================================
-- SUMMARY: gamification_system schema (actualizado 2026-01-07)
-- =====================================================
-- Total policies: 23 (antes 27, -4 de notifications deprecated)
-- Tables with policies: 8 (antes 9)
-- - ml_coins_transactions: 4 policies (3 SELECT, 1 INSERT)
-- - achievements: 2 policies (1 SELECT, 1 ALL)
-- - user_achievements: 3 policies (3 SELECT)
-- - comodines_inventory: 3 policies (1 SELECT, 1 UPDATE, 1 INSERT)
-- - user_stats: 4 policies (3 SELECT, 1 UPDATE)
-- - user_ranks: 2 policies (1 SELECT, 1 UPDATE)
-- - missions: 2 policies (1 SELECT, 1 ALL)
-- - leaderboard_metadata: 2 policies (1 SELECT, 1 ALL)
-- DEPRECATED:
-- - notifications: 4 policies -> movido a _deprecated/
-- =====================================================
