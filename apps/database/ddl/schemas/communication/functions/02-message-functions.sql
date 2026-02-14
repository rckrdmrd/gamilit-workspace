-- =====================================================
-- Communication Schema: Message Functions
-- Description: Utility functions for message operations
-- Created: 2026-02-14 (extracted from inline table definitions)
-- Source: tables/01-messages.sql
-- =====================================================

SET search_path TO communication, public;

-- ================================================
-- Function: get_unread_count(user_id, classroom_id?)
-- Purpose: Get count of unread messages for a user, optionally filtered by classroom
-- ================================================
CREATE OR REPLACE FUNCTION communication.get_unread_count(p_user_id uuid, p_classroom_id uuid DEFAULT NULL::uuid)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM communication.messages
    WHERE recipient_id = p_user_id
      AND is_read = FALSE
      AND is_deleted = FALSE
      AND (p_classroom_id IS NULL OR classroom_id = p_classroom_id);

    RETURN v_count;
END;
$function$;

-- ================================================
-- Function: mark_conversation_read(user_id, thread_id)
-- Purpose: Mark all messages in a thread as read for a user
-- Returns: Number of messages marked as read
-- ================================================
CREATE OR REPLACE FUNCTION communication.mark_conversation_read(p_user_id uuid, p_thread_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_updated INTEGER;
BEGIN
    UPDATE communication.messages
    SET is_read = TRUE,
        read_at = NOW()
    WHERE recipient_id = p_user_id
      AND thread_id = p_thread_id
      AND is_read = FALSE
      AND is_deleted = FALSE;

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated;
END;
$function$;
