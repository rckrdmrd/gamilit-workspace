-- =====================================================
-- Communication Schema: Conversation Functions
-- Description: Utility functions for conversation management
-- Created: 2026-02-14 (extracted from inline table definitions)
-- Source: tables/03-conversation_participants.sql
-- =====================================================

SET search_path TO communication, public;

-- ================================================
-- Function: create_conversation(title, type, created_by, participants, classroom_id?)
-- Purpose: Create a new conversation with participants
-- Returns: conversation UUID
-- ================================================
CREATE OR REPLACE FUNCTION communication.create_conversation(p_title character varying, p_conversation_type character varying, p_created_by uuid, p_participant_ids uuid[], p_classroom_id uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_conversation_id UUID;
    v_participant_id UUID;
BEGIN
    -- Insert conversation
    INSERT INTO communication.conversations (
        title,
        conversation_type,
        created_by,
        classroom_id
    ) VALUES (
        p_title,
        p_conversation_type,
        p_created_by,
        p_classroom_id
    )
    RETURNING id INTO v_conversation_id;

    -- Add creator as owner
    INSERT INTO communication.conversation_participants (
        conversation_id,
        user_id,
        role
    ) VALUES (
        v_conversation_id,
        p_created_by,
        'owner'
    );

    -- Add other participants as members
    FOREACH v_participant_id IN ARRAY p_participant_ids LOOP
        IF v_participant_id != p_created_by THEN
            INSERT INTO communication.conversation_participants (
                conversation_id,
                user_id,
                role
            ) VALUES (
                v_conversation_id,
                v_participant_id,
                'member'
            );
        END IF;
    END LOOP;

    RETURN v_conversation_id;
END;
$function$;

-- ================================================
-- Function: get_conversation_participants(conversation_id)
-- Purpose: Get all participants of a conversation with profile info
-- Returns: Table of participants with display_name, avatar, role
-- ================================================
CREATE OR REPLACE FUNCTION communication.get_conversation_participants(p_conversation_id uuid)
 RETURNS TABLE(participant_id uuid, user_id uuid, display_name character varying, avatar_url character varying, role character varying, joined_at timestamp with time zone, is_active boolean, nickname character varying)
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        cp.id AS participant_id,
        cp.user_id,
        p.display_name,
        p.avatar_url,
        cp.role,
        cp.joined_at,
        cp.is_active,
        cp.nickname
    FROM communication.conversation_participants cp
    JOIN auth_management.profiles p ON p.id = cp.user_id
    WHERE cp.conversation_id = p_conversation_id
    ORDER BY
        CASE cp.role
            WHEN 'owner' THEN 1
            WHEN 'admin' THEN 2
            ELSE 3
        END,
        cp.joined_at ASC;
END;
$function$;

-- ================================================
-- Function: get_user_conversations(user_id, include_archived?)
-- Purpose: Get all conversations for a user with metadata
-- Returns: Table of conversations with unread counts, last message info
-- ================================================
CREATE OR REPLACE FUNCTION communication.get_user_conversations(p_user_id uuid, p_include_archived boolean DEFAULT false)
 RETURNS TABLE(conversation_id uuid, title character varying, conversation_type character varying, last_message_at timestamp with time zone, last_message_preview text, unread_count integer, is_muted boolean, pin_order integer, participant_count bigint)
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        c.id AS conversation_id,
        c.title,
        c.conversation_type,
        c.last_message_at,
        c.last_message_preview,
        cp.unread_count,
        cp.is_muted,
        cp.pin_order,
        (SELECT COUNT(*) FROM communication.conversation_participants cp2
         WHERE cp2.conversation_id = c.id AND cp2.is_active = TRUE) AS participant_count
    FROM communication.conversation_participants cp
    JOIN communication.conversations c ON c.id = cp.conversation_id
    WHERE cp.user_id = p_user_id
      AND cp.is_active = TRUE
      AND (p_include_archived = TRUE OR c.is_archived = FALSE)
    ORDER BY
        cp.pin_order NULLS LAST,
        c.last_message_at DESC NULLS LAST;
END;
$function$;

-- ================================================
-- Function: add_conversation_participant(conversation_id, user_id, role?, added_by?)
-- Purpose: Add a user to a conversation (or reactivate if previously removed)
-- Returns: participant UUID
-- ================================================
CREATE OR REPLACE FUNCTION communication.add_conversation_participant(p_conversation_id uuid, p_user_id uuid, p_role character varying DEFAULT 'member'::character varying, p_added_by uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_participant_id UUID;
BEGIN
    -- Check if already a participant
    SELECT id INTO v_participant_id
    FROM communication.conversation_participants
    WHERE conversation_id = p_conversation_id
      AND user_id = p_user_id;

    IF v_participant_id IS NOT NULL THEN
        -- Reactivate if was deactivated
        UPDATE communication.conversation_participants
        SET is_active = TRUE,
            left_at = NULL,
            role = COALESCE(p_role, role),
            updated_at = NOW()
        WHERE id = v_participant_id;

        RETURN v_participant_id;
    END IF;

    -- Insert new participant
    INSERT INTO communication.conversation_participants (
        conversation_id,
        user_id,
        role
    ) VALUES (
        p_conversation_id,
        p_user_id,
        COALESCE(p_role, 'member')
    )
    RETURNING id INTO v_participant_id;

    RETURN v_participant_id;
END;
$function$;

-- ================================================
-- Function: remove_conversation_participant(conversation_id, user_id)
-- Purpose: Soft-remove a user from a conversation (set is_active=false)
-- Returns: true if removed, false if not found
-- ================================================
CREATE OR REPLACE FUNCTION communication.remove_conversation_participant(p_conversation_id uuid, p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_updated INTEGER;
BEGIN
    UPDATE communication.conversation_participants
    SET is_active = FALSE,
        left_at = NOW(),
        updated_at = NOW()
    WHERE conversation_id = p_conversation_id
      AND user_id = p_user_id
      AND is_active = TRUE;

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated > 0;
END;
$function$;

-- ================================================
-- Function: mark_conversation_as_read(conversation_id, user_id, last_message_id?)
-- Purpose: Reset unread count and update last_read for a user in a conversation
-- Returns: true if updated
-- ================================================
CREATE OR REPLACE FUNCTION communication.mark_conversation_as_read(p_conversation_id uuid, p_user_id uuid, p_last_message_id uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_updated INTEGER;
BEGIN
    UPDATE communication.conversation_participants
    SET last_read_at = NOW(),
        last_read_message_id = COALESCE(p_last_message_id, last_read_message_id),
        unread_count = 0,
        updated_at = NOW()
    WHERE conversation_id = p_conversation_id
      AND user_id = p_user_id
      AND is_active = TRUE;

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated > 0;
END;
$function$;

-- ================================================
-- Function: increment_unread_for_conversation(conversation_id, sender_id, preview?)
-- Purpose: Increment unread count for all participants except sender
-- Also updates conversation last_message_at and message_count
-- Returns: Number of participants updated
-- ================================================
CREATE OR REPLACE FUNCTION communication.increment_unread_for_conversation(p_conversation_id uuid, p_sender_id uuid, p_message_preview text DEFAULT NULL::text)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_updated INTEGER;
BEGIN
    -- Update unread count for all active participants except sender
    UPDATE communication.conversation_participants
    SET unread_count = unread_count + 1,
        updated_at = NOW()
    WHERE conversation_id = p_conversation_id
      AND user_id != p_sender_id
      AND is_active = TRUE;

    GET DIAGNOSTICS v_updated = ROW_COUNT;

    -- Update conversation last message info
    UPDATE communication.conversations
    SET last_message_at = NOW(),
        last_message_preview = p_message_preview,
        message_count = message_count + 1,
        updated_at = NOW()
    WHERE id = p_conversation_id;

    RETURN v_updated;
END;
$function$;

-- ================================================
-- Function: get_total_unread_conversations(user_id)
-- Purpose: Get total unread messages across all active, non-muted conversations
-- Returns: Total unread count
-- ================================================
CREATE OR REPLACE FUNCTION communication.get_total_unread_conversations(p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COALESCE(SUM(unread_count), 0)::INTEGER
    INTO v_count
    FROM communication.conversation_participants cp
    JOIN communication.conversations c ON c.id = cp.conversation_id
    WHERE cp.user_id = p_user_id
      AND cp.is_active = TRUE
      AND cp.is_muted = FALSE
      AND c.is_archived = FALSE;

    RETURN v_count;
END;
$function$;
