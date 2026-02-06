-- =============================================================================
-- Table: communication.conversation_participants
-- Description: Participants in conversations for group chat support
-- Priority: P1 - Required for group messaging feature
-- Gap Reference: GAP-SOC-003 (Communication Features)
-- Created: 2026-02-03
-- =============================================================================
--
-- This table enables:
-- - Group conversations with multiple participants
-- - Per-participant notification preferences
-- - Read tracking at conversation level
-- - Participant roles (owner, admin, member)
-- =============================================================================

-- Drop table if exists (for development/migration)
DROP TABLE IF EXISTS communication.conversation_participants CASCADE;

-- =============================================================================
-- First, create the conversations table (parent for participants)
-- =============================================================================

DROP TABLE IF EXISTS communication.conversations CASCADE;

CREATE TABLE communication.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Conversation metadata
    title VARCHAR(255),
    description TEXT,
    conversation_type VARCHAR(30) NOT NULL DEFAULT 'direct',
    -- Types: 'direct' (1-1), 'group' (multi-user), 'classroom' (linked to classroom)

    -- Optional classroom link
    classroom_id UUID
        REFERENCES social_features.classrooms(id) ON DELETE CASCADE,

    -- Conversation settings
    is_archived BOOLEAN DEFAULT FALSE,
    is_readonly BOOLEAN DEFAULT FALSE,
    allow_reactions BOOLEAN DEFAULT TRUE,
    allow_replies BOOLEAN DEFAULT TRUE,

    -- Avatar/image for group conversations
    avatar_url VARCHAR(500),

    -- Last activity tracking (denormalized for performance)
    last_message_id UUID,
    last_message_at TIMESTAMPTZ,
    last_message_preview TEXT,
    message_count INTEGER DEFAULT 0,

    -- Creator
    created_by UUID NOT NULL
        REFERENCES auth_management.profiles(id) ON DELETE CASCADE,

    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT conversations_type_valid
        CHECK (conversation_type IN ('direct', 'group', 'classroom'))
);

-- =============================================================================
-- Create conversation_participants table
-- =============================================================================

CREATE TABLE communication.conversation_participants (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Conversation relationship
    conversation_id UUID NOT NULL
        REFERENCES communication.conversations(id) ON DELETE CASCADE,

    -- User (participant)
    user_id UUID NOT NULL
        REFERENCES auth_management.profiles(id) ON DELETE CASCADE,

    -- Participation status
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    -- Roles: 'owner' (creator), 'admin' (can manage), 'member' (standard)

    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    -- Notification preferences for this conversation
    is_muted BOOLEAN NOT NULL DEFAULT FALSE,
    muted_until TIMESTAMPTZ,

    -- Read tracking
    last_read_at TIMESTAMPTZ,
    last_read_message_id UUID,
    unread_count INTEGER NOT NULL DEFAULT 0,

    -- Custom display settings
    nickname VARCHAR(100),  -- Custom display name in this conversation

    -- Participant-specific settings
    show_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    pin_order INTEGER,  -- NULL = not pinned, lower number = higher priority

    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT conversation_participants_role_valid
        CHECK (role IN ('owner', 'admin', 'member')),

    -- Each user can only be in a conversation once
    CONSTRAINT conversation_participants_unique
        UNIQUE (conversation_id, user_id)
);

-- =============================================================================
-- Indexes for conversations table
-- =============================================================================

-- Index for finding conversations by creator
CREATE INDEX idx_conversations_created_by
    ON communication.conversations(created_by, created_at DESC);

-- Index for classroom conversations
CREATE INDEX idx_conversations_classroom
    ON communication.conversations(classroom_id)
    WHERE classroom_id IS NOT NULL;

-- Index for conversation type
CREATE INDEX idx_conversations_type
    ON communication.conversations(conversation_type, created_at DESC);

-- Index for last activity (sorting by recent)
CREATE INDEX idx_conversations_last_activity
    ON communication.conversations(last_message_at DESC NULLS LAST)
    WHERE is_archived = FALSE;

-- =============================================================================
-- Indexes for conversation_participants table
-- =============================================================================

-- Index for finding all participants of a conversation
CREATE INDEX idx_conv_participants_conversation_id
    ON communication.conversation_participants(conversation_id)
    WHERE is_active = TRUE;

-- Index for finding all conversations for a user
CREATE INDEX idx_conv_participants_user_id
    ON communication.conversation_participants(user_id, is_active);

-- Index for active participants
CREATE INDEX idx_conv_participants_active
    ON communication.conversation_participants(conversation_id, is_active)
    WHERE is_active = TRUE;

-- Index for unread messages (notification queries)
CREATE INDEX idx_conv_participants_unread
    ON communication.conversation_participants(user_id)
    WHERE is_active = TRUE AND unread_count > 0 AND is_muted = FALSE;

-- Index for pinned conversations
CREATE INDEX idx_conv_participants_pinned
    ON communication.conversation_participants(user_id, pin_order)
    WHERE pin_order IS NOT NULL AND is_active = TRUE;

-- Composite index for user inbox queries
CREATE INDEX idx_conv_participants_user_inbox
    ON communication.conversation_participants(user_id, is_active, is_muted, unread_count);

-- =============================================================================
-- Triggers for updated_at
-- =============================================================================

-- Trigger function for conversations
CREATE OR REPLACE FUNCTION communication.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_conversation_timestamp
    BEFORE UPDATE ON communication.conversations
    FOR EACH ROW
    EXECUTE FUNCTION communication.update_conversation_timestamp();

-- Trigger function for conversation_participants
CREATE OR REPLACE FUNCTION communication.update_conv_participant_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_conv_participant_timestamp
    BEFORE UPDATE ON communication.conversation_participants
    FOR EACH ROW
    EXECUTE FUNCTION communication.update_conv_participant_timestamp();

-- =============================================================================
-- Helper Functions
-- =============================================================================

-- Function: Get all participants of a conversation
CREATE OR REPLACE FUNCTION communication.get_conversation_participants(
    p_conversation_id UUID
) RETURNS TABLE (
    participant_id UUID,
    user_id UUID,
    display_name VARCHAR,
    avatar_url VARCHAR,
    role VARCHAR,
    joined_at TIMESTAMPTZ,
    is_active BOOLEAN,
    nickname VARCHAR
) AS $$
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
$$ LANGUAGE plpgsql STABLE;

-- Function: Get user's conversations with unread counts
CREATE OR REPLACE FUNCTION communication.get_user_conversations(
    p_user_id UUID,
    p_include_archived BOOLEAN DEFAULT FALSE
) RETURNS TABLE (
    conversation_id UUID,
    title VARCHAR,
    conversation_type VARCHAR,
    last_message_at TIMESTAMPTZ,
    last_message_preview TEXT,
    unread_count INTEGER,
    is_muted BOOLEAN,
    pin_order INTEGER,
    participant_count BIGINT
) AS $$
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
$$ LANGUAGE plpgsql STABLE;

-- Function: Add participant to conversation
CREATE OR REPLACE FUNCTION communication.add_conversation_participant(
    p_conversation_id UUID,
    p_user_id UUID,
    p_role VARCHAR DEFAULT 'member',
    p_added_by UUID DEFAULT NULL
) RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql;

-- Function: Remove participant from conversation (soft remove)
CREATE OR REPLACE FUNCTION communication.remove_conversation_participant(
    p_conversation_id UUID,
    p_user_id UUID
) RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql;

-- Function: Mark conversation as read for user
CREATE OR REPLACE FUNCTION communication.mark_conversation_as_read(
    p_conversation_id UUID,
    p_user_id UUID,
    p_last_message_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql;

-- Function: Increment unread count for all participants except sender
CREATE OR REPLACE FUNCTION communication.increment_unread_for_conversation(
    p_conversation_id UUID,
    p_sender_id UUID,
    p_message_preview TEXT DEFAULT NULL
) RETURNS INTEGER AS $$
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
$$ LANGUAGE plpgsql;

-- Function: Get total unread count across all conversations for a user
CREATE OR REPLACE FUNCTION communication.get_total_unread_conversations(
    p_user_id UUID
) RETURNS INTEGER AS $$
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
$$ LANGUAGE plpgsql STABLE;

-- Function: Create a new conversation with initial participants
CREATE OR REPLACE FUNCTION communication.create_conversation(
    p_title VARCHAR,
    p_conversation_type VARCHAR,
    p_created_by UUID,
    p_participant_ids UUID[],
    p_classroom_id UUID DEFAULT NULL
) RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Comments for documentation
-- =============================================================================

COMMENT ON TABLE communication.conversations IS
'Conversations container for group messaging. Supports direct (1-1), group (multi-user), and classroom-linked conversations. Part of GAP-SOC-003 implementation.';

COMMENT ON TABLE communication.conversation_participants IS
'Participants in conversations for group chat support. Tracks membership, roles, notification preferences, and read status per user per conversation.';

COMMENT ON COLUMN communication.conversation_participants.role IS
'Role of the participant: owner (creator with full control), admin (can manage members), member (standard participant)';

COMMENT ON COLUMN communication.conversation_participants.is_muted IS
'If true, the user will not receive notifications for this conversation';

COMMENT ON COLUMN communication.conversation_participants.unread_count IS
'Number of unread messages in this conversation for this user. Updated when messages are sent and reset when conversation is read.';

COMMENT ON COLUMN communication.conversation_participants.nickname IS
'Optional custom display name for this user within this specific conversation';

COMMENT ON COLUMN communication.conversation_participants.pin_order IS
'If not null, conversation is pinned. Lower number = higher in list. NULL = not pinned.';

COMMENT ON FUNCTION communication.get_conversation_participants IS
'Get all participants of a conversation with their profile info.
Usage: SELECT * FROM communication.get_conversation_participants(conversation_uuid);';

COMMENT ON FUNCTION communication.get_user_conversations IS
'Get all conversations for a user with unread counts and metadata.
Usage: SELECT * FROM communication.get_user_conversations(user_uuid);';

COMMENT ON FUNCTION communication.add_conversation_participant IS
'Add a user to a conversation or reactivate if previously removed.
Usage: SELECT communication.add_conversation_participant(conv_uuid, user_uuid, ''member'');';

COMMENT ON FUNCTION communication.remove_conversation_participant IS
'Soft-remove a participant from conversation (sets is_active = FALSE).
Usage: SELECT communication.remove_conversation_participant(conv_uuid, user_uuid);';

COMMENT ON FUNCTION communication.mark_conversation_as_read IS
'Mark all messages in a conversation as read for a user and reset unread count.
Usage: SELECT communication.mark_conversation_as_read(conv_uuid, user_uuid);';

COMMENT ON FUNCTION communication.increment_unread_for_conversation IS
'Increment unread count for all participants except sender when a new message is sent.
Usage: SELECT communication.increment_unread_for_conversation(conv_uuid, sender_uuid, ''preview text'');';

COMMENT ON FUNCTION communication.create_conversation IS
'Create a new conversation with initial participants. Creator becomes owner.
Usage: SELECT communication.create_conversation(''Title'', ''group'', creator_uuid, ARRAY[user1, user2]);';

-- =============================================================================
-- RLS Policies (Row Level Security)
-- =============================================================================

-- Enable RLS for conversations
ALTER TABLE communication.conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see conversations they participate in
CREATE POLICY conversations_select_participant ON communication.conversations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM communication.conversation_participants cp
            WHERE cp.conversation_id = communication.conversations.id
              AND cp.user_id = current_setting('app.current_user_id', true)::uuid
              AND cp.is_active = TRUE
        )
    );

-- Policy: Users can create conversations
CREATE POLICY conversations_insert_own ON communication.conversations
    FOR INSERT
    WITH CHECK (
        created_by = current_setting('app.current_user_id', true)::uuid
    );

-- Policy: Owners and admins can update conversation settings
CREATE POLICY conversations_update_admin ON communication.conversations
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM communication.conversation_participants cp
            WHERE cp.conversation_id = communication.conversations.id
              AND cp.user_id = current_setting('app.current_user_id', true)::uuid
              AND cp.role IN ('owner', 'admin')
              AND cp.is_active = TRUE
        )
    );

-- Policy: Only owners can delete conversations
CREATE POLICY conversations_delete_owner ON communication.conversations
    FOR DELETE
    USING (
        created_by = current_setting('app.current_user_id', true)::uuid
    );

-- Enable RLS for conversation_participants
ALTER TABLE communication.conversation_participants ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see participants in their conversations
CREATE POLICY conv_participants_select_member ON communication.conversation_participants
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM communication.conversation_participants cp
            WHERE cp.conversation_id = communication.conversation_participants.conversation_id
              AND cp.user_id = current_setting('app.current_user_id', true)::uuid
              AND cp.is_active = TRUE
        )
    );

-- Policy: Users can update their own participation (mute, read status, etc.)
CREATE POLICY conv_participants_update_own ON communication.conversation_participants
    FOR UPDATE
    USING (
        user_id = current_setting('app.current_user_id', true)::uuid
    );

-- Policy: Owners and admins can insert new participants
CREATE POLICY conv_participants_insert_admin ON communication.conversation_participants
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM communication.conversation_participants cp
            WHERE cp.conversation_id = communication.conversation_participants.conversation_id
              AND cp.user_id = current_setting('app.current_user_id', true)::uuid
              AND cp.role IN ('owner', 'admin')
              AND cp.is_active = TRUE
        )
        -- Or creating own participation (joining)
        OR user_id = current_setting('app.current_user_id', true)::uuid
    );

-- Policy: Owners and admins can delete participants, users can leave
CREATE POLICY conv_participants_delete_admin ON communication.conversation_participants
    FOR DELETE
    USING (
        -- User leaving themselves
        user_id = current_setting('app.current_user_id', true)::uuid
        -- Or admin/owner removing someone
        OR EXISTS (
            SELECT 1 FROM communication.conversation_participants cp
            WHERE cp.conversation_id = communication.conversation_participants.conversation_id
              AND cp.user_id = current_setting('app.current_user_id', true)::uuid
              AND cp.role IN ('owner', 'admin')
              AND cp.is_active = TRUE
        )
    );

-- =============================================================================
-- Grant permissions
-- =============================================================================

-- Table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON communication.conversations TO gamilit_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON communication.conversation_participants TO gamilit_user;

-- Function permissions
GRANT EXECUTE ON FUNCTION communication.get_conversation_participants TO gamilit_user;
GRANT EXECUTE ON FUNCTION communication.get_user_conversations TO gamilit_user;
GRANT EXECUTE ON FUNCTION communication.add_conversation_participant TO gamilit_user;
GRANT EXECUTE ON FUNCTION communication.remove_conversation_participant TO gamilit_user;
GRANT EXECUTE ON FUNCTION communication.mark_conversation_as_read TO gamilit_user;
GRANT EXECUTE ON FUNCTION communication.increment_unread_for_conversation TO gamilit_user;
GRANT EXECUTE ON FUNCTION communication.get_total_unread_conversations TO gamilit_user;
GRANT EXECUTE ON FUNCTION communication.create_conversation TO gamilit_user;

-- =============================================================================
-- End of file
-- =============================================================================
