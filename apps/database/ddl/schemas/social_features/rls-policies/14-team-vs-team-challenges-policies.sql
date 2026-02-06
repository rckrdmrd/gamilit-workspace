-- =====================================================
-- RLS Policies for: social_features.team_vs_team_challenges
-- Description: Row Level Security for team vs team challenges
-- Ticket: GAP-SOC-002
-- Created: 2026-02-03
-- =====================================================
-- Security Strategy:
-- - Team members can see their own challenges (both Team A and Team B)
-- - Captains have full control over their challenges
-- - Public challenges can be seen by anyone (for spectating)
-- - Only captains can modify challenge status
-- =====================================================

-- =====================================================
-- DROP existing policies if any
-- =====================================================
DROP POLICY IF EXISTS team_vs_team_challenges_select_participant ON social_features.team_vs_team_challenges;
DROP POLICY IF EXISTS team_vs_team_challenges_select_captain ON social_features.team_vs_team_challenges;
DROP POLICY IF EXISTS team_vs_team_challenges_insert_authenticated ON social_features.team_vs_team_challenges;
DROP POLICY IF EXISTS team_vs_team_challenges_update_captain ON social_features.team_vs_team_challenges;
DROP POLICY IF EXISTS team_vs_team_challenges_delete_captain ON social_features.team_vs_team_challenges;

-- =====================================================
-- SELECT Policies
-- =====================================================

-- Policy: team_vs_team_challenges_select_participant
-- Purpose: Users can see challenges where they are participants (Team A or Team B members)
CREATE POLICY team_vs_team_challenges_select_participant
    ON social_features.team_vs_team_challenges
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        -- User is in Team A
        current_setting('app.current_user_id', true)::uuid = ANY(team_a_members)
        OR
        -- User is in Team B
        current_setting('app.current_user_id', true)::uuid = ANY(team_b_members)
        OR
        -- User is Team A captain
        team_a_captain_id = current_setting('app.current_user_id', true)::uuid
        OR
        -- User is Team B captain
        team_b_captain_id = current_setting('app.current_user_id', true)::uuid
        OR
        -- User created the challenge
        created_by = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY team_vs_team_challenges_select_participant ON social_features.team_vs_team_challenges IS
    'Usuarios pueden ver desafios donde son participantes (miembros de Team A o Team B) o capitanes';

-- =====================================================
-- INSERT Policies
-- =====================================================

-- Policy: team_vs_team_challenges_insert_authenticated
-- Purpose: Authenticated users can create challenges (as Team A captain)
CREATE POLICY team_vs_team_challenges_insert_authenticated
    ON social_features.team_vs_team_challenges
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (
        -- Must be the creator
        created_by = current_setting('app.current_user_id', true)::uuid
        AND
        -- Must be Team A captain
        team_a_captain_id = current_setting('app.current_user_id', true)::uuid
        AND
        -- Must be a member of Team A
        current_setting('app.current_user_id', true)::uuid = ANY(team_a_members)
    );

COMMENT ON POLICY team_vs_team_challenges_insert_authenticated ON social_features.team_vs_team_challenges IS
    'Usuarios autenticados pueden crear desafios siendo capitan y miembro del equipo A';

-- =====================================================
-- UPDATE Policies
-- =====================================================

-- Policy: team_vs_team_challenges_update_captain
-- Purpose: Only captains can update challenge information
CREATE POLICY team_vs_team_challenges_update_captain
    ON social_features.team_vs_team_challenges
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING (
        -- Team A captain can update
        team_a_captain_id = current_setting('app.current_user_id', true)::uuid
        OR
        -- Team B captain can update (accept/decline)
        team_b_captain_id = current_setting('app.current_user_id', true)::uuid
    )
    WITH CHECK (
        -- Team A captain can update
        team_a_captain_id = current_setting('app.current_user_id', true)::uuid
        OR
        -- Team B captain can update
        team_b_captain_id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY team_vs_team_challenges_update_captain ON social_features.team_vs_team_challenges IS
    'Solo los capitanes de equipo pueden actualizar el desafio';

-- =====================================================
-- DELETE Policies
-- =====================================================

-- Policy: team_vs_team_challenges_delete_captain
-- Purpose: Only Team A captain (creator) can delete a pending challenge
CREATE POLICY team_vs_team_challenges_delete_captain
    ON social_features.team_vs_team_challenges
    AS PERMISSIVE
    FOR DELETE
    TO public
    USING (
        -- Only creator/Team A captain can delete
        (team_a_captain_id = current_setting('app.current_user_id', true)::uuid
         OR created_by = current_setting('app.current_user_id', true)::uuid)
        AND
        -- Can only delete pending or cancelled challenges
        status IN ('pending', 'cancelled', 'declined', 'expired')
    );

COMMENT ON POLICY team_vs_team_challenges_delete_captain ON social_features.team_vs_team_challenges IS
    'Solo el capitan del equipo A (creador) puede eliminar desafios pendientes/cancelados';

-- =====================================================
-- SUMMARY: social_features.team_vs_team_challenges
-- =====================================================
-- Policies: 4
-- - SELECT: 1 (participants and captains)
-- - INSERT: 1 (authenticated as Team A captain)
-- - UPDATE: 1 (captains only)
-- - DELETE: 1 (Team A captain, only pending/cancelled)
-- =====================================================
