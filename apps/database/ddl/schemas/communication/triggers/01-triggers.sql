-- =====================================================
-- Communication Schema: Triggers
-- Description: All triggers for communication tables
-- Created: 2026-02-14 (extracted from inline table definitions)
-- Dependencies: communication/functions/01-trigger-functions.sql
-- =====================================================

-- ================================================
-- Trigger: trg_update_message_tracking_fields
-- Table: communication.messages
-- Fires: BEFORE UPDATE
-- Function: communication.update_message_tracking_fields()
-- Purpose: Auto-tracks edits, read status, deletion, flagging
-- ================================================
DROP TRIGGER IF EXISTS trg_update_message_tracking_fields ON communication.messages;
CREATE TRIGGER trg_update_message_tracking_fields
    BEFORE UPDATE ON communication.messages
    FOR EACH ROW
    EXECUTE FUNCTION communication.update_message_tracking_fields();

-- ================================================
-- Trigger: trg_update_message_participant_read
-- Table: communication.message_participants
-- Fires: BEFORE UPDATE
-- Function: communication.update_message_participant_read()
-- Purpose: Auto-sets read_at timestamp when is_read changes to true
-- ================================================
DROP TRIGGER IF EXISTS trg_update_message_participant_read ON communication.message_participants;
CREATE TRIGGER trg_update_message_participant_read
    BEFORE UPDATE ON communication.message_participants
    FOR EACH ROW
    EXECUTE FUNCTION communication.update_message_participant_read();

-- ================================================
-- Trigger: trg_update_conversation_timestamp
-- Table: communication.conversations
-- Fires: BEFORE UPDATE
-- Function: communication.update_conversation_timestamp()
-- Purpose: Auto-updates updated_at on conversation changes
-- ================================================
DROP TRIGGER IF EXISTS trg_update_conversation_timestamp ON communication.conversations;
CREATE TRIGGER trg_update_conversation_timestamp
    BEFORE UPDATE ON communication.conversations
    FOR EACH ROW
    EXECUTE FUNCTION communication.update_conversation_timestamp();

-- ================================================
-- Trigger: trg_update_conv_participant_timestamp
-- Table: communication.conversation_participants
-- Fires: BEFORE UPDATE
-- Function: communication.update_conv_participant_timestamp()
-- Purpose: Auto-updates updated_at on participant changes
-- ================================================
DROP TRIGGER IF EXISTS trg_update_conv_participant_timestamp ON communication.conversation_participants;
CREATE TRIGGER trg_update_conv_participant_timestamp
    BEFORE UPDATE ON communication.conversation_participants
    FOR EACH ROW
    EXECUTE FUNCTION communication.update_conv_participant_timestamp();
