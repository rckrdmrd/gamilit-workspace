-- =====================================================
-- Communication Schema: Message Participant Functions
-- Description: Utility functions for message participant operations
-- Created: 2026-02-14 (extracted from inline table definitions)
-- Source: tables/02-message_participants.sql
-- =====================================================

SET search_path TO communication, public;

-- ================================================
-- Function: get_user_unread_count(user_id)
-- Purpose: Get count of unread messages across all conversations (via participants)
-- ================================================
CREATE OR REPLACE FUNCTION communication.get_user_unread_count(p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(DISTINCT mp.message_id)
    INTO v_count
    FROM communication.message_participants mp
    WHERE mp.user_id = p_user_id
      AND mp.is_read = FALSE
      AND mp.role IN ('recipient', 'cc');

    RETURN COALESCE(v_count, 0);
END;
$function$;

-- ================================================
-- Function: mark_message_read_for_user(message_id, user_id)
-- Purpose: Mark a specific message as read for a specific user
-- Returns: true if updated, false if already read or not found
-- ================================================
CREATE OR REPLACE FUNCTION communication.mark_message_read_for_user(p_message_id uuid, p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_updated BOOLEAN := FALSE;
BEGIN
    UPDATE communication.message_participants
    SET is_read = TRUE,
        read_at = NOW()
    WHERE message_id = p_message_id
      AND user_id = p_user_id
      AND is_read = FALSE;

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated > 0;
END;
$function$;
