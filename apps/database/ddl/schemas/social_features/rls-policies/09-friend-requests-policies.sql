-- =====================================================
-- RLS Policies for: social_features.friend_requests
-- Description: Friend request management with privacy controls
-- Created: 2025-12-05
-- Ticket: DB-GAM-005
-- Policies: 4 (SELECT: 1, INSERT: 1, UPDATE: 1, DELETE: 1)
-- =====================================================
--
-- Security Strategy:
-- - Visibility: Users can see requests where they are requester or recipient
-- - Creation: Users can only send requests from themselves
-- - Updates: Only recipients can update (accept/reject)
-- - Deletion: Requesters can cancel their own requests
-- =====================================================

-- Habilitar RLS
ALTER TABLE social_features.friend_requests ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas existentes
DROP POLICY IF EXISTS friend_requests_select_own ON social_features.friend_requests;
DROP POLICY IF EXISTS friend_requests_insert_own ON social_features.friend_requests;
DROP POLICY IF EXISTS friend_requests_update_recipient ON social_features.friend_requests;
DROP POLICY IF EXISTS friend_requests_delete_requester ON social_features.friend_requests;

-- =====================================================
-- Policy: friend_requests_select_own
-- Purpose: Users can see requests where they participate
-- =====================================================
CREATE POLICY friend_requests_select_own
    ON social_features.friend_requests
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        requester_id = current_setting('app.current_user_id', true)::uuid
        OR recipient_id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY friend_requests_select_own ON social_features.friend_requests IS
    'Users can see friend requests where they are either the requester or recipient';

-- =====================================================
-- Policy: friend_requests_insert_own
-- Purpose: Users can only send requests from themselves
-- =====================================================
CREATE POLICY friend_requests_insert_own
    ON social_features.friend_requests
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (
        requester_id = current_setting('app.current_user_id', true)::uuid
    );

COMMENT ON POLICY friend_requests_insert_own ON social_features.friend_requests IS
    'Users can only create friend requests from themselves as requester';

-- =====================================================
-- Policy: friend_requests_update_recipient
-- Purpose: Only recipients can update requests (accept/reject)
-- =====================================================
CREATE POLICY friend_requests_update_recipient
    ON social_features.friend_requests
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING (
        recipient_id = current_setting('app.current_user_id', true)::uuid
    )
    WITH CHECK (
        recipient_id = current_setting('app.current_user_id', true)::uuid
        AND status IN ('accepted', 'rejected')
    );

COMMENT ON POLICY friend_requests_update_recipient ON social_features.friend_requests IS
    'Recipients can update requests to accept or reject them';

-- =====================================================
-- Policy: friend_requests_delete_requester
-- Purpose: Requesters can cancel their own pending requests
-- =====================================================
CREATE POLICY friend_requests_delete_requester
    ON social_features.friend_requests
    AS PERMISSIVE
    FOR DELETE
    TO public
    USING (
        requester_id = current_setting('app.current_user_id', true)::uuid
        AND status = 'pending'
    );

COMMENT ON POLICY friend_requests_delete_requester ON social_features.friend_requests IS
    'Requesters can cancel (delete) their own pending friend requests';
