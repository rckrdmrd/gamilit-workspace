-- =============================================================================
-- RLS Policies for educational_content resource sharing tables
-- =============================================================================
-- Created: 2026-02-21
-- Agent: Claude Code
-- Priority: MEDIUM - Resource sharing access control
--
-- SECURITY MODEL:
-- - resource_ratings: Teachers can view all ratings, CRUD their own
-- - resource_comments: Teachers can view all non-deleted comments, CRUD their own
-- - resource_downloads: Teachers can view their own downloads, insert their own
-- - All tables scoped to authenticated users via current_setting('app.current_user_id')
--
-- NOTA: Este proyecto usa current_setting() para obtener el user_id
--       NO usa auth.uid() (sintaxis de Supabase)
-- =============================================================================

-- =============================================================================
-- DROP EXISTING POLICIES (idempotent)
-- =============================================================================

DROP POLICY IF EXISTS resource_ratings_select_all ON educational_content.resource_ratings;
DROP POLICY IF EXISTS resource_ratings_insert_own ON educational_content.resource_ratings;
DROP POLICY IF EXISTS resource_ratings_update_own ON educational_content.resource_ratings;
DROP POLICY IF EXISTS resource_ratings_delete_own ON educational_content.resource_ratings;

DROP POLICY IF EXISTS resource_comments_select_visible ON educational_content.resource_comments;
DROP POLICY IF EXISTS resource_comments_insert_own ON educational_content.resource_comments;
DROP POLICY IF EXISTS resource_comments_update_own ON educational_content.resource_comments;
DROP POLICY IF EXISTS resource_comments_delete_own ON educational_content.resource_comments;

DROP POLICY IF EXISTS resource_downloads_select_own ON educational_content.resource_downloads;
DROP POLICY IF EXISTS resource_downloads_insert_own ON educational_content.resource_downloads;

-- =============================================================================
-- 1. POLICIES FOR resource_ratings
-- =============================================================================

-- Teachers can view all ratings (needed for average calculation)
CREATE POLICY resource_ratings_select_all
  ON educational_content.resource_ratings
  FOR SELECT
  USING (true);

-- Teachers can insert their own ratings
CREATE POLICY resource_ratings_insert_own
  ON educational_content.resource_ratings
  FOR INSERT
  WITH CHECK (
    teacher_id = current_setting('app.current_user_id', true)::uuid
  );

-- Teachers can update their own ratings
CREATE POLICY resource_ratings_update_own
  ON educational_content.resource_ratings
  FOR UPDATE
  USING (
    teacher_id = current_setting('app.current_user_id', true)::uuid
  );

-- Teachers can delete their own ratings
CREATE POLICY resource_ratings_delete_own
  ON educational_content.resource_ratings
  FOR DELETE
  USING (
    teacher_id = current_setting('app.current_user_id', true)::uuid
  );

-- =============================================================================
-- 2. POLICIES FOR resource_comments
-- =============================================================================

-- Teachers can view all non-deleted comments
CREATE POLICY resource_comments_select_visible
  ON educational_content.resource_comments
  FOR SELECT
  USING (
    is_deleted = false
    OR author_id = current_setting('app.current_user_id', true)::uuid
  );

-- Teachers can insert their own comments
CREATE POLICY resource_comments_insert_own
  ON educational_content.resource_comments
  FOR INSERT
  WITH CHECK (
    author_id = current_setting('app.current_user_id', true)::uuid
  );

-- Teachers can update their own comments (edit text or soft-delete)
CREATE POLICY resource_comments_update_own
  ON educational_content.resource_comments
  FOR UPDATE
  USING (
    author_id = current_setting('app.current_user_id', true)::uuid
  );

-- Teachers can delete their own comments
CREATE POLICY resource_comments_delete_own
  ON educational_content.resource_comments
  FOR DELETE
  USING (
    author_id = current_setting('app.current_user_id', true)::uuid
  );

-- =============================================================================
-- 3. POLICIES FOR resource_downloads
-- =============================================================================

-- Teachers can view their own download history
CREATE POLICY resource_downloads_select_own
  ON educational_content.resource_downloads
  FOR SELECT
  USING (
    downloaded_by = current_setting('app.current_user_id', true)::uuid
  );

-- Teachers can record their own downloads
CREATE POLICY resource_downloads_insert_own
  ON educational_content.resource_downloads
  FOR INSERT
  WITH CHECK (
    downloaded_by = current_setting('app.current_user_id', true)::uuid
  );
