-- =============================================================================
-- Table: communication.message_participants
-- Description: Participantes de mensajes para tracking de lectura individual
-- Priority: P1 - Required for messaging system
-- User Stories: US-PM-005 (Teacher Communication)
-- Created: 2026-01-04
-- Issue: ISS-DB-001 - DDL faltante detectado en auditoría AUDIT-002
-- =============================================================================

-- Drop table if exists
DROP TABLE IF EXISTS communication.message_participants CASCADE;

-- Create message_participants table
CREATE TABLE communication.message_participants (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Message relationship
    message_id UUID NOT NULL
        REFERENCES communication.messages(id) ON DELETE CASCADE,

    -- User (participant)
    user_id UUID NOT NULL
        REFERENCES auth_management.profiles(id) ON DELETE CASCADE,

    -- Role in the conversation
    role VARCHAR(20) NOT NULL DEFAULT 'recipient',
    -- Types: 'sender', 'recipient', 'cc'

    -- Read status (individual per participant)
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,

    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT message_participants_role_valid
        CHECK (role IN ('sender', 'recipient', 'cc')),

    -- Prevent duplicate participant entries for same message
    CONSTRAINT message_participants_unique
        UNIQUE (message_id, user_id, role)
);

-- =============================================================================
-- Indexes for performance
-- =============================================================================

-- Index for finding all participants of a message
CREATE INDEX idx_message_participants_message_id
    ON communication.message_participants(message_id);

-- Index for finding all messages for a user
CREATE INDEX idx_message_participants_user_id
    ON communication.message_participants(user_id);

-- Index for unread messages per user
CREATE INDEX idx_message_participants_unread
    ON communication.message_participants(user_id, message_id)
    WHERE is_read = FALSE;

-- Index for role-based filtering
CREATE INDEX idx_message_participants_role
    ON communication.message_participants(user_id, role);

-- Composite index for efficient inbox queries
CREATE INDEX idx_message_participants_user_read
    ON communication.message_participants(user_id, is_read, created_at DESC);

-- =============================================================================
-- Triggers
-- =============================================================================

-- Trigger for auto-setting read_at when is_read changes
CREATE OR REPLACE FUNCTION communication.update_message_participant_read()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_read = TRUE AND OLD.is_read = FALSE THEN
        NEW.read_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_message_participant_read
    BEFORE UPDATE ON communication.message_participants
    FOR EACH ROW
    EXECUTE FUNCTION communication.update_message_participant_read();

-- =============================================================================
-- Helper functions
-- =============================================================================

-- Function to get unread count for a user (using participants table)
CREATE OR REPLACE FUNCTION communication.get_user_unread_count(
    p_user_id UUID
) RETURNS INTEGER AS $$
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
$$ LANGUAGE plpgsql STABLE;

-- Function to mark message as read for a specific user
CREATE OR REPLACE FUNCTION communication.mark_message_read_for_user(
    p_message_id UUID,
    p_user_id UUID
) RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Comments for documentation
-- =============================================================================

COMMENT ON TABLE communication.message_participants IS
'Participantes de mensajes para tracking de estado de lectura individual. Cada mensaje puede tener múltiples participantes con diferentes roles (sender, recipient, cc).';

COMMENT ON COLUMN communication.message_participants.role IS
'Rol del participante en el mensaje: sender (quien envió), recipient (destinatario principal), cc (copia para conocimiento)';

COMMENT ON COLUMN communication.message_participants.is_read IS
'Indica si este participante específico ha leído el mensaje. Permite tracking individual.';

COMMENT ON FUNCTION communication.get_user_unread_count IS
'Obtiene el conteo de mensajes no leídos para un usuario basándose en la tabla de participantes.
Usage: SELECT communication.get_user_unread_count(user_uuid);';

COMMENT ON FUNCTION communication.mark_message_read_for_user IS
'Marca un mensaje como leído para un usuario específico.
Usage: SELECT communication.mark_message_read_for_user(message_uuid, user_uuid);';

-- =============================================================================
-- RLS Policies (Row Level Security)
-- =============================================================================

-- Enable RLS
ALTER TABLE communication.message_participants ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own participation records
CREATE POLICY message_participants_select_own ON communication.message_participants
    FOR SELECT
    USING (user_id = current_setting('app.current_user_id', true)::uuid);

-- Policy: Users can update their own records (mark as read)
CREATE POLICY message_participants_update_own ON communication.message_participants
    FOR UPDATE
    USING (user_id = current_setting('app.current_user_id', true)::uuid);

-- Policy: System can insert (when messages are created)
CREATE POLICY message_participants_insert_system ON communication.message_participants
    FOR INSERT
    WITH CHECK (true);

-- =============================================================================
-- Grant permissions
-- =============================================================================

GRANT SELECT, INSERT, UPDATE ON communication.message_participants TO gamilit_user;
GRANT EXECUTE ON FUNCTION communication.get_user_unread_count TO gamilit_user;
GRANT EXECUTE ON FUNCTION communication.mark_message_read_for_user TO gamilit_user;
