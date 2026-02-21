-- ============================================================================
-- Table: educational_content.resource_downloads
-- Description: Download tracking for shared resources (teacher_contents)
-- Schema: educational_content
-- ============================================================================

CREATE TABLE IF NOT EXISTS educational_content.resource_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES educational_content.teacher_contents(id) ON DELETE CASCADE,
  downloaded_by UUID NOT NULL REFERENCES auth_management.profiles(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_resource_downloads_resource_id
  ON educational_content.resource_downloads(resource_id);

CREATE INDEX IF NOT EXISTS idx_resource_downloads_downloaded_by
  ON educational_content.resource_downloads(downloaded_by);

-- Comments
COMMENT ON TABLE educational_content.resource_downloads IS 'Download tracking for shared educational resources';
COMMENT ON COLUMN educational_content.resource_downloads.resource_id IS 'FK to teacher_contents being downloaded';
COMMENT ON COLUMN educational_content.resource_downloads.downloaded_by IS 'FK to profiles of the teacher who downloaded';
COMMENT ON COLUMN educational_content.resource_downloads.downloaded_at IS 'Timestamp when the download occurred';

-- NOTE: No updated_at column — this is an immutable event-log table.
-- Downloads are INSERT-only, never updated. No trigger needed.
