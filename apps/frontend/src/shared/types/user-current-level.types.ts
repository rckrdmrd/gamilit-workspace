/**
 * User Current Level Types
 *
 * @description Types for the user's current difficulty level (denormalized for performance)
 * stored in progress_tracking.user_current_level
 * @see backend: modules/progress/entities/user-current-level.entity.ts
 * @created TASK-022 - Frontend type coherence
 */

export interface UserCurrentLevel {
  user_id: string;
  current_level: string;
  previous_level?: string;
  max_allowed_level: string;
  placement_test_completed: boolean;
  placement_test_score?: number;
  placement_test_date?: string | null;
  level_changed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}
