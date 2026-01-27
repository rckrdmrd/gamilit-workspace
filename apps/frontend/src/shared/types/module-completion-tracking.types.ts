/**
 * Module Completion Tracking Types
 *
 * @description Types for detailed per-user module completion tracking
 * stored in progress_tracking.module_completion_tracking
 * @see backend: modules/progress/entities/module-completion-tracking.entity.ts
 * @created TASK-022 - Frontend type coherence
 */

export type ModuleCompletionStatus = 'not_started' | 'in_progress' | 'completed' | 'mastered';

export interface ModuleCompletionTracking {
  id: string;
  user_id: string;
  module_id: string;
  completion_percentage: number;
  exercises_completed: number;
  exercises_total: number;
  time_spent_seconds: number;
  started_at?: string | null;
  completed_at?: string | null;
  last_activity_at?: string | null;
  status: ModuleCompletionStatus;
  created_at?: string;
  updated_at?: string;
}
