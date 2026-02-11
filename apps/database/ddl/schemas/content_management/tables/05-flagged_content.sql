-- =====================================================
-- FLAGGED CONTENT TABLE
-- =====================================================

-- Create table for flagged content moderation
DROP TABLE IF EXISTS content_management.flagged_contents CASCADE;

CREATE TABLE content_management.flagged_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(50) NOT NULL, -- 'exercise', 'comment', 'profile', 'post', 'message'
    content_id UUID NOT NULL,
    content_preview TEXT,

    -- Reporter information
    reported_by UUID NOT NULL,
    reason VARCHAR(255) NOT NULL,
    description TEXT,

    -- Moderation status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'removed')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),

    -- Review information
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Keys (with fk_ prefix per standard)
    CONSTRAINT fk_flagged_contents_reported_by FOREIGN KEY (reported_by)
        REFERENCES auth_management.profiles(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_flagged_contents_reviewed_by FOREIGN KEY (reviewed_by)
        REFERENCES auth_management.profiles(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- Create indexes for flagged content
CREATE INDEX IF NOT EXISTS idx_flagged_contents_type ON content_management.flagged_contents(content_type);
CREATE INDEX IF NOT EXISTS idx_flagged_contents_id ON content_management.flagged_contents(content_id);
CREATE INDEX IF NOT EXISTS idx_flagged_contents_status ON content_management.flagged_contents(status);
CREATE INDEX IF NOT EXISTS idx_flagged_contents_priority ON content_management.flagged_contents(priority);
CREATE INDEX IF NOT EXISTS idx_flagged_contents_reported_by ON content_management.flagged_contents(reported_by);
CREATE INDEX IF NOT EXISTS idx_flagged_contents_reviewed_by ON content_management.flagged_contents(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_flagged_contents_created_at ON content_management.flagged_contents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_flagged_contents_pending ON content_management.flagged_contents(created_at DESC)
    WHERE status = 'pending';

-- Add comments
COMMENT ON TABLE content_management.flagged_contents IS 'Content flagged for moderation review';
COMMENT ON COLUMN content_management.flagged_contents.content_preview IS 'Short preview of the flagged content for quick review';
