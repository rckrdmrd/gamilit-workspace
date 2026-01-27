/**
 * Social Interaction Types
 *
 * @description Types for social interaction tracking (social_features.social_interactions)
 * @see backend: modules/social/entities/social-interaction.entity.ts
 * @created TASK-022 P1-3 - DDL-Entity coherence
 */

export type SocialInteractionType =
  | 'like'
  | 'comment'
  | 'share'
  | 'mention'
  | 'badge_given'
  | 'help_request'
  | 'help_provided';

export interface SocialInteraction {
  id: string;
  user_id: string;
  target_user_id?: string | null;
  interaction_type: SocialInteractionType;
  content_type?: string | null;
  content_id?: string | null;
  interaction_data?: Record<string, unknown> | null;
  created_at?: string;
}
