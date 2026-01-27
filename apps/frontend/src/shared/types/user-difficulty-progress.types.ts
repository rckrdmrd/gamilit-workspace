/**
 * User Difficulty Progress Types
 *
 * @description Types for per-user progress by CEFR difficulty level
 * stored in progress_tracking.user_difficulty_progress
 * @see backend: modules/progress/entities/user-difficulty-progress.entity.ts
 * @created TASK-022 - Frontend type coherence
 */

export interface UserDifficultyProgress {
  user_id: string;
  difficulty_level: string;
  exercises_attempted: number;
  exercises_completed: number;
  exercises_correct_first_attempt: number;
  total_time_spent_seconds: number;
  is_ready_for_promotion: boolean;
  promoted_at?: string | null;
  first_attempt_at?: string | null;
  last_attempt_at?: string | null;
  created_at?: string;
  updated_at?: string;
}
