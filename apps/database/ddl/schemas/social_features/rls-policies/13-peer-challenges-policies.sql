-- =====================================================
-- RLS Policies for Peer Challenge Tables
-- Tables: peer_challenges, challenge_participants, challenge_results
-- Description: Security policies for peer-to-peer challenge system
-- Created: 2026-02-03
-- Gap Reference: GAP-SOC-001 (Social Features)
-- Policies: 12 total (4 per table)
-- =====================================================
--
-- Security Strategy:
-- 1. peer_challenges:
--    - Public challenges visible to all authenticated users
--    - Private challenges visible to creator and participants
--    - Only creator can update/delete (before start)
--
-- 2. challenge_participants:
--    - Visible to challenge participants and creator
--    - Users can see their own participation
--    - Creator can manage invitations
--
-- 3. challenge_results:
--    - Participants can see results of challenges they participated in
--    - Admins can see all results
--    - Read-only: results created by system functions
-- =====================================================

-- =====================================================
-- PEER_CHALLENGES POLICIES
-- =====================================================

-- Limpiar politicas existentes
DROP POLICY IF EXISTS peer_challenges_select_public ON social_features.peer_challenges;
DROP POLICY IF EXISTS peer_challenges_select_participant ON social_features.peer_challenges;
DROP POLICY IF EXISTS peer_challenges_insert_own ON social_features.peer_challenges;
DROP POLICY IF EXISTS peer_challenges_update_own ON social_features.peer_challenges;
DROP POLICY IF EXISTS peer_challenges_delete_own ON social_features.peer_challenges;

-- Policy: SELECT - Public challenges visible to all, private to participants/creator
CREATE POLICY peer_challenges_select_public
    ON social_features.peer_challenges
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        -- Public challenges visible to all
        is_public = true
        OR
        -- Creator can always see their challenges
        created_by = current_setting('app.current_user_id', true)::uuid
        OR
        -- Participants can see challenges they're part of
        EXISTS (
            SELECT 1 FROM social_features.challenge_participants cp
            WHERE cp.challenge_id = peer_challenges.id
              AND cp.user_id = current_setting('app.current_user_id', true)::uuid
        )
    );

COMMENT ON POLICY peer_challenges_select_public ON social_features.peer_challenges IS
    'Public challenges visible to all; private challenges visible to creator and participants';

-- Policy: INSERT - Any authenticated user can create challenges
CREATE POLICY peer_challenges_insert_own
    ON social_features.peer_challenges
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (
        created_by = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY peer_challenges_insert_own ON social_features.peer_challenges IS
    'Users can create challenges as themselves (created_by must match current user)';

-- Policy: UPDATE - Only creator can update, before in_progress
CREATE POLICY peer_challenges_update_own
    ON social_features.peer_challenges
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING (
        created_by = current_setting('app.current_user_id', true)::uuid
        AND status IN ('open', 'full')
    )
    WITH CHECK (
        created_by = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY peer_challenges_update_own ON social_features.peer_challenges IS
    'Creator can update challenge only before it starts (status = open or full)';

-- Policy: DELETE - Only creator can delete, before in_progress
CREATE POLICY peer_challenges_delete_own
    ON social_features.peer_challenges
    AS PERMISSIVE
    FOR DELETE
    TO public
    USING (
        created_by = current_setting('app.current_user_id', true)::uuid
        AND status IN ('open', 'full')
    );

COMMENT ON POLICY peer_challenges_delete_own ON social_features.peer_challenges IS
    'Creator can delete (cancel) challenge only before it starts';

-- =====================================================
-- CHALLENGE_PARTICIPANTS POLICIES
-- =====================================================

-- Limpiar politicas existentes
DROP POLICY IF EXISTS challenge_participants_select_own ON social_features.challenge_participants;
DROP POLICY IF EXISTS challenge_participants_insert_self ON social_features.challenge_participants;
DROP POLICY IF EXISTS challenge_participants_update_own ON social_features.challenge_participants;
DROP POLICY IF EXISTS challenge_participants_delete_own ON social_features.challenge_participants;

-- Policy: SELECT - Participants and creator can see all participants
CREATE POLICY challenge_participants_select_own
    ON social_features.challenge_participants
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        -- User can see their own participation
        user_id = current_setting('app.current_user_id', true)::uuid
        OR
        -- Challenge creator can see all participants
        EXISTS (
            SELECT 1 FROM social_features.peer_challenges pc
            WHERE pc.id = challenge_participants.challenge_id
              AND pc.created_by = current_setting('app.current_user_id', true)::uuid
        )
        OR
        -- Other participants can see co-participants (for leaderboard)
        EXISTS (
            SELECT 1 FROM social_features.challenge_participants cp2
            WHERE cp2.challenge_id = challenge_participants.challenge_id
              AND cp2.user_id = current_setting('app.current_user_id', true)::uuid
              AND cp2.participation_status NOT IN ('invited')
        )
    );

COMMENT ON POLICY challenge_participants_select_own ON social_features.challenge_participants IS
    'Users can see their participation, creator sees all, accepted participants see co-participants';

-- Policy: INSERT - Users join challenges, creator invites
CREATE POLICY challenge_participants_insert_self
    ON social_features.challenge_participants
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (
        -- User joins themselves
        user_id = current_setting('app.current_user_id', true)::uuid
        OR
        -- Challenge creator can invite others
        EXISTS (
            SELECT 1 FROM social_features.peer_challenges pc
            WHERE pc.id = challenge_participants.challenge_id
              AND pc.created_by = current_setting('app.current_user_id', true)::uuid
        )
    );

COMMENT ON POLICY challenge_participants_insert_self ON social_features.challenge_participants IS
    'Users can join challenges or creator can invite others';

-- Policy: UPDATE - Users update own participation, creator updates all
CREATE POLICY challenge_participants_update_own
    ON social_features.challenge_participants
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING (
        user_id = current_setting('app.current_user_id', true)::uuid
        OR
        EXISTS (
            SELECT 1 FROM social_features.peer_challenges pc
            WHERE pc.id = challenge_participants.challenge_id
              AND pc.created_by = current_setting('app.current_user_id', true)::uuid
        )
    )
    WITH CHECK (
        user_id = current_setting('app.current_user_id', true)::uuid
        OR
        EXISTS (
            SELECT 1 FROM social_features.peer_challenges pc
            WHERE pc.id = challenge_participants.challenge_id
              AND pc.created_by = current_setting('app.current_user_id', true)::uuid
        )
    );

COMMENT ON POLICY challenge_participants_update_own ON social_features.challenge_participants IS
    'Users update own participation status; creator can update any participant (e.g., disqualify)';

-- Policy: DELETE - Users can withdraw, creator can remove before start
CREATE POLICY challenge_participants_delete_own
    ON social_features.challenge_participants
    AS PERMISSIVE
    FOR DELETE
    TO public
    USING (
        -- User withdraws from challenge (before it starts)
        (
            user_id = current_setting('app.current_user_id', true)::uuid
            AND EXISTS (
                SELECT 1 FROM social_features.peer_challenges pc
                WHERE pc.id = challenge_participants.challenge_id
                  AND pc.status IN ('open', 'full')
            )
        )
        OR
        -- Creator removes participant before start
        EXISTS (
            SELECT 1 FROM social_features.peer_challenges pc
            WHERE pc.id = challenge_participants.challenge_id
              AND pc.created_by = current_setting('app.current_user_id', true)::uuid
              AND pc.status IN ('open', 'full')
        )
    );

COMMENT ON POLICY challenge_participants_delete_own ON social_features.challenge_participants IS
    'Users can withdraw before challenge starts; creator can remove participants before start';

-- =====================================================
-- CHALLENGE_RESULTS POLICIES
-- =====================================================

-- Limpiar politicas existentes
DROP POLICY IF EXISTS challenge_results_select_participant ON social_features.challenge_results;
DROP POLICY IF EXISTS challenge_results_select_admin ON social_features.challenge_results;

-- Policy: SELECT - Participants see results of their challenges
CREATE POLICY challenge_results_select_participant
    ON social_features.challenge_results
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        -- User participated in this challenge
        EXISTS (
            SELECT 1 FROM social_features.challenge_participants cp
            WHERE cp.challenge_id = challenge_results.challenge_id
              AND cp.user_id = current_setting('app.current_user_id', true)::uuid
        )
        OR
        -- User created the challenge
        EXISTS (
            SELECT 1 FROM social_features.peer_challenges pc
            WHERE pc.id = challenge_results.challenge_id
              AND pc.created_by = current_setting('app.current_user_id', true)::uuid
        )
        OR
        -- Public challenge results (if challenge was public)
        EXISTS (
            SELECT 1 FROM social_features.peer_challenges pc
            WHERE pc.id = challenge_results.challenge_id
              AND pc.is_public = true
              AND pc.status = 'completed'
        )
    );

COMMENT ON POLICY challenge_results_select_participant ON social_features.challenge_results IS
    'Participants see their challenge results; public completed challenges visible to all';

-- Policy: SELECT - Admin sees all (using role check)
CREATE POLICY challenge_results_select_admin
    ON social_features.challenge_results
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        -- Admin role check via profiles
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            WHERE p.id = current_setting('app.current_user_id', true)::uuid
              AND p.role IN ('admin', 'superadmin')
        )
    );

COMMENT ON POLICY challenge_results_select_admin ON social_features.challenge_results IS
    'Admins can see all challenge results for reporting and analytics';

-- =====================================================
-- NOTA: No hay politicas INSERT/UPDATE/DELETE para challenge_results
-- Los resultados son creados y gestionados por funciones de sistema
-- cuando un challenge se completa. Esto garantiza integridad.
-- =====================================================

-- =====================================================
-- GRANTS (service role bypass for backend operations)
-- =====================================================
-- Note: The service role (used by backend) bypasses RLS by default
-- These grants ensure proper access for the application user

GRANT SELECT, INSERT, UPDATE, DELETE ON social_features.peer_challenges TO gamilit_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_features.challenge_participants TO gamilit_user;
GRANT SELECT ON social_features.challenge_results TO gamilit_user;
-- Results are inserted by system functions with elevated privileges
