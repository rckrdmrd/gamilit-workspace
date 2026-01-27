/**
 * Comodin Usage Tracking Types
 *
 * @description Types for power-up (comodin) usage per exercise attempt
 * stored in gamification_system.comodin_usage_tracking
 * @see backend: modules/gamification/entities/comodin-usage-tracking.entity.ts
 * @created TASK-022 - Frontend type coherence
 */

export interface ComodinUsageTracking {
  id: string;
  user_id: string;
  exercise_id: string;
  attempt_id: string;
  pistas_used: number;
  vision_lectora_used: number;
  segunda_oportunidad_used: number;
  pistas_limit_reached: boolean;
  vision_lectora_limit_reached: boolean;
  segunda_oportunidad_limit_reached: boolean;
  started_at?: string;
  last_used_at?: string;
}
