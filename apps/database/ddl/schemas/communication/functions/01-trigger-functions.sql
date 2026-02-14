-- =====================================================
-- Communication Schema: Trigger Functions
-- Description: Functions used by triggers on communication tables
-- Created: 2026-02-14 (extracted from inline table definitions)
-- Source tables: messages, message_participants, conversations,
--               conversation_participants
-- =====================================================

SET search_path TO communication, public;

-- ================================================
-- Function: update_message_tracking_fields()
-- Table: messages
-- Purpose: Tracks edits, read status, deletion, and flagging timestamps
-- ================================================
CREATE OR REPLACE FUNCTION communication.update_message_tracking_fields()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();

    -- Track edits
    IF OLD.content IS DISTINCT FROM NEW.content THEN
        NEW.edited_at = NOW();
        NEW.edit_count = COALESCE(OLD.edit_count, 0) + 1;
    END IF;

    -- Auto-set read_at when is_read changes to true
    IF NEW.is_read = TRUE AND OLD.is_read = FALSE THEN
        NEW.read_at = NOW();
    END IF;

    -- Auto-set deleted_at when is_deleted changes to true
    IF NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN
        NEW.deleted_at = NOW();
    END IF;

    -- Auto-set flagged_at when is_flagged changes to true
    IF NEW.is_flagged = TRUE AND OLD.is_flagged = FALSE THEN
        NEW.flagged_at = NOW();
    END IF;

    RETURN NEW;
END;
$function$;

-- ================================================
-- Function: update_message_participant_read()
-- Table: message_participants
-- Purpose: Auto-sets read_at when is_read changes to true
-- ================================================
CREATE OR REPLACE FUNCTION communication.update_message_participant_read()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NEW.is_read = TRUE AND OLD.is_read = FALSE THEN
        NEW.read_at = NOW();
    END IF;
    RETURN NEW;
END;
$function$;

-- ================================================
-- Function: update_conversation_timestamp()
-- Table: conversations
-- Purpose: Auto-updates updated_at on conversation changes
-- ================================================
CREATE OR REPLACE FUNCTION communication.update_conversation_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- ================================================
-- Function: update_conv_participant_timestamp()
-- Table: conversation_participants
-- Purpose: Auto-updates updated_at on participant changes
-- ================================================
CREATE OR REPLACE FUNCTION communication.update_conv_participant_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;
