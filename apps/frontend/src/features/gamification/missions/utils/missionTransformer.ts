/**
 * Mission Transformer Utilities
 *
 * Transforms API responses (snake_case) to Frontend format (camelCase)
 */

import type {
  Mission,
  MissionType,
  MissionStatus,
  MissionCategory,
  MissionDifficulty,
  MissionObjective,
} from '../types/missionsTypes';

/**
 * Mission data structure from Backend API (snake_case)
 */
export interface MissionFromAPI {
  id: string;
  mission_type: 'daily' | 'weekly' | 'special';
  template_id: string;
  exercise_id?: string | null;
  title?: string;
  description?: string;
  objectives: Array<{
    type: string;
    target: number;
    current: number;
    description?: string;
    modules_visited?: string[];
    required_exercise_type?: string;
    required_module?: number;
  }>;
  rewards: {
    ml_coins?: number;
    xp?: number;
    items?: Array<{
      type: string;
      quantity: number;
    }>;
  };
  status: 'active' | 'in_progress' | 'completed' | 'claimed' | 'expired';
  progress: number;
  created_at?: string;
  updated_at?: string;
  expires_at?: string;
  started_at?: string;
  completed_at?: string;
  claimed_at?: string;
  bonus_multiplier?: number;
}

/**
 * Map template_key to MissionCategory
 */
export function mapTemplateToCategory(templateKey: string | undefined | null): MissionCategory {
  // Template keys are in format: "daily_complete_exercises", "weekly_earn_xp", etc.
  if (!templateKey) return 'exercises';
  const key = templateKey.toLowerCase();

  if (key.includes('exercise')) return 'exercises';
  if (key.includes('xp')) return 'xp';
  if (key.includes('time') || key.includes('minutes') || key.includes('study')) return 'time';
  if (key.includes('social') || key.includes('friend') || key.includes('message')) return 'social';
  if (key.includes('achievement') || key.includes('unlock')) return 'achievement';
  if (key.includes('streak') || key.includes('consecutive')) return 'streak';

  // Default fallback
  return 'exercises';
}

/**
 * Map API status to Frontend status
 */
export function mapApiStatusToFrontend(apiStatus: string): MissionStatus {
  switch (apiStatus) {
    case 'active':
      return 'not_started';
    case 'in_progress':
      return 'in_progress';
    case 'completed':
      return 'completed';
    case 'claimed':
      return 'claimed';
    case 'expired':
      return 'expired';
    default:
      return 'not_started';
  }
}

/**
 * Get icon for category
 */
export function getIconForCategory(category: MissionCategory): string {
  const iconMap: Record<MissionCategory, string> = {
    exercises: 'dumbbell',
    xp: 'star',
    time: 'clock',
    social: 'users',
    achievement: 'trophy',
    streak: 'flame',
  };

  return iconMap[category] || 'target';
}

/**
 * Determine difficulty based on target value
 */
export function getDifficultyFromTarget(
  target: number,
  category: MissionCategory,
): MissionDifficulty {
  // Different thresholds per category
  const thresholds: Record<MissionCategory, { easy: number; medium: number }> = {
    exercises: { easy: 3, medium: 5 },
    xp: { easy: 50, medium: 100 },
    time: { easy: 15, medium: 30 },
    social: { easy: 2, medium: 5 },
    achievement: { easy: 1, medium: 3 },
    streak: { easy: 3, medium: 7 },
  };

  const threshold = thresholds[category] || { easy: 3, medium: 5 };

  if (target <= threshold.easy) return 'easy';
  if (target <= threshold.medium) return 'medium';
  return 'hard';
}

/**
 * Generate title from template key if not provided
 */
function generateTitle(templateKey: string | undefined | null): string {
  if (!templateKey) return 'Mission';
  const key = templateKey
    .replace(/^(daily|weekly|special)_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return key || 'Mission';
}

/**
 * Generate description from objectives if not provided
 */
function generateDescription(objectives: MissionObjective[]): string {
  if (objectives.length === 0) return 'Complete this mission to earn rewards';

  const firstObjective = objectives[0];
  const action = firstObjective.type.replace(/_/g, ' ');

  return (
    action.charAt(0).toUpperCase() +
    action.slice(1) +
    ': ' +
    firstObjective.current +
    '/' +
    firstObjective.target
  );
}

/**
 * Transform a single mission from API format to Frontend format
 */
export function transformMission(apiMission: MissionFromAPI): Mission {
  // Extract first objective for backwards compatibility
  const firstObjective = apiMission.objectives[0] || { type: '', target: 0, current: 0 };

  // Calculate progress if not provided
  const progress =
    apiMission.progress !== undefined
      ? apiMission.progress
      : firstObjective.target > 0
        ? Math.round((firstObjective.current / firstObjective.target) * 100)
        : 0;

  // Determine mission type
  const type: MissionType = apiMission.mission_type;

  // Determine category from template (with fallback for undefined)
  const templateId = apiMission.template_id || '';
  const category = mapTemplateToCategory(templateId);

  // Determine difficulty
  const difficulty = getDifficultyFromTarget(firstObjective.target, category);

  // Map status
  const status = mapApiStatusToFrontend(apiMission.status);

  // Extract rewards
  const xpReward = apiMission.rewards.xp || 0;
  const mlCoinsReward = apiMission.rewards.ml_coins || 0;

  // Convert dates
  const expiresAt = apiMission.expires_at
    ? new Date(apiMission.expires_at)
    : new Date(Date.now() + 86400000);
  const startedAt = apiMission.started_at ? new Date(apiMission.started_at) : undefined;
  const completedAt = apiMission.completed_at ? new Date(apiMission.completed_at) : undefined;
  const claimedAt = apiMission.claimed_at ? new Date(apiMission.claimed_at) : undefined;

  // Build transformed mission
  const mission: Mission = {
    id: apiMission.id,
    exercise_id: apiMission.exercise_id || null,
    type,
    title: apiMission.title || generateTitle(templateId),
    description: apiMission.description || generateDescription(apiMission.objectives),
    category,

    // Backwards compatibility fields (computed from objectives/rewards)
    targetValue: firstObjective.target,
    currentValue: firstObjective.current,
    progress,

    // Backwards compatibility fields (computed from rewards)
    xpReward,
    mlCoinsReward,

    // API data structures
    objectives: apiMission.objectives,
    rewards: apiMission.rewards,

    // Metadata
    icon: getIconForCategory(category),
    difficulty,
    status,

    // Timestamps
    expiresAt,
    startedAt,
    completedAt,
    claimedAt,

    // Optional
    bonusMultiplier: apiMission.bonus_multiplier,
  };

  return mission;
}

/**
 * Transform an array of missions from API format to Frontend format
 */
export function transformMissions(apiMissions: MissionFromAPI[]): Mission[] {
  return apiMissions.map(transformMission);
}
