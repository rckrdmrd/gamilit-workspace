-- ============================================================================
-- Table: educational_content.resource_comments
-- Description: Teacher comments on shared resources (teacher_contents)
-- Schema: educational_content
-- ============================================================================

CREATE TABLE IF NOT EXISTS educational_content.resource_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES educational_content.teacher_contents(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth_management.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_resource_comments_resource_id
  ON educational_content.resource_comments(resource_id);

CREATE INDEX IF NOT EXISTS idx_resource_comments_author_id
  ON educational_content.resource_comments(author_id);

CREATE INDEX IF NOT EXISTS idx_resource_comments_created_at
  ON educational_content.resource_comments(created_at DESC);

-- Comments
COMMENT ON TABLE educational_content.resource_comments IS 'Teacher comments on shared educational resources';
COMMENT ON COLUMN educational_content.resource_comments.resource_id IS 'FK to teacher_contents being commented on';
COMMENT ON COLUMN educational_content.resource_comments.author_id IS 'FK to profiles of the comment author';
COMMENT ON COLUMN educational_content.resource_comments.text IS 'Comment text content';
COMMENT ON COLUMN educational_content.resource_comments.is_deleted IS 'Soft delete flag for moderation';
