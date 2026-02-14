-- =====================================================
-- Communication Schema: Views
-- Description: Views for communication queries
-- Created: 2026-02-14 (extracted from database)
-- Dependencies: communication.messages, auth_management.profiles
-- =====================================================

-- ================================================
-- View: recent_classroom_messages
-- Purpose: Recent messages in classroom chats with sender info and reply counts
-- Used by: Teacher portal, classroom chat UI
-- ================================================
CREATE OR REPLACE VIEW communication.recent_classroom_messages AS
SELECT
    m.id,
    m.classroom_id,
    m.sender_id,
    p.display_name AS sender_name,
    p.avatar_url AS sender_avatar,
    m.content,
    m.message_type,
    m.attachments,
    m.reactions,
    m.is_pinned,
    m.created_at,
    m.edited_at,
    m.edit_count,
    (SELECT count(*) AS count
     FROM communication.messages replies
     WHERE replies.parent_message_id = m.id
       AND replies.is_deleted = false) AS reply_count
FROM communication.messages m
JOIN auth_management.profiles p ON p.id = m.sender_id
WHERE m.classroom_id IS NOT NULL
  AND m.is_deleted = false
  AND m.parent_message_id IS NULL
ORDER BY
    CASE WHEN m.is_pinned THEN 0 ELSE 1 END,
    m.created_at DESC;

-- Grant access
GRANT SELECT ON communication.recent_classroom_messages TO gamilit_user;

COMMENT ON VIEW communication.recent_classroom_messages IS
    'Recent messages in classroom chats with sender profile info and reply counts. Excludes deleted messages and replies (shows thread-level only). Pinned messages appear first.';
