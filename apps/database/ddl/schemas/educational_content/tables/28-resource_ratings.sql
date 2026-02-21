-- ============================================================================
-- Table: educational_content.resource_ratings
-- Description: Teacher ratings for shared resources (teacher_contents)
-- Schema: educational_content
-- ============================================================================

CREATE TABLE IF NOT EXISTS educational_content.resource_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES educational_content.teacher_contents(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth_management.profiles(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resource_id, teacher_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_resource_ratings_resource_id
  ON educational_content.resource_ratings(resource_id);

CREATE INDEX IF NOT EXISTS idx_resource_ratings_teacher_id
  ON educational_content.resource_ratings(teacher_id);

-- Comments
COMMENT ON TABLE educational_content.resource_ratings IS 'Teacher ratings for shared educational resources';
COMMENT ON COLUMN educational_content.resource_ratings.resource_id IS 'FK to teacher_contents being rated';
COMMENT ON COLUMN educational_content.resource_ratings.teacher_id IS 'FK to profiles of the teacher giving the rating';
COMMENT ON COLUMN educational_content.resource_ratings.rating IS 'Rating value between 1 and 5';
