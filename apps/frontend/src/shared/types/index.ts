/**
 * Types Barrel Export
 * Centralized exports for all shared TypeScript types and interfaces
 *
 * DTO-001: Updated to include new canonical types
 */

// =====================================================
// AUTHENTICATION & USER TYPES
// =====================================================

export type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  PasswordResetRequest,
  PasswordResetConfirm,
  SessionInfo,
  UserSessionInfo as AuthUserSessionInfo,
  SuspensionDetails,
  AccountErrorCode,
  PreferencesConfig,
} from './auth.types';
export { getUserFullName, getUserDisplayName, toUserExtended } from './auth.types';

export type { Profile, ProfileWithStats, UserPreferences } from './profile.types';

export type {
  UserRole,
  User,
  UserExtended,
  UserGamificationData,
  CreateUserDto,
  UpdateUserDto,
  UserQueryFilters,
  TableRow,
  PaginatedUsers,
  UserProfile,
  GamilityRole,
} from './user.types';

// =====================================================
// GAMIFICATION & STATS TYPES (DTO-001)
// =====================================================

export type { UserStats, UserStatsSummary, UpdateUserStatsDto } from './user-stats.types';

export type {
  UserRank,
  MLCoinsBalance,
  UserStats as UserStatsRaw,
  UpdateUserStatsDto as UpdateUserStatsDtoRaw,
} from './gamification.types';
export { MayaRank } from './gamification.types';

// Achievements
export * from './achievement.types';

// Leaderboards
export * from './leaderboard.types';

// Comodin usage tracking (power-ups per attempt)
export * from './comodin-usage-tracking.types';

// =====================================================
// EDUCATIONAL CONTENT TYPES
// =====================================================

// Modules and exercises
export * from './educational.types';

// Content metadata
export * from './content-metadata.types';

// Module dependencies (prerequisites)
export * from './module-dependencies.types';

// Taxonomies (Bloom, SOLO, Webb DOK)
export * from './taxonomy.types';

// Content tags
export * from './content-tag.types';

export type {
  ModuleProgress,
  ProgressSummary,
  LearningSession,
  SessionStats,
  ExerciseAttempt,
  SubmissionStats,
} from './progress.types';
export { ProgressStatus } from './progress.types';

// Module completion tracking (detailed)
export * from './module-completion-tracking.types';

// User current level (CEFR)
export * from './user-current-level.types';

// User difficulty progress (per-level stats)
export * from './user-difficulty-progress.types';

export * from './exercise-submission.types';

// =====================================================
// CLASSROOM & SOCIAL TYPES (DTO-001)
// =====================================================

// Classrooms - NEW canonical types
export * from './classroom.types';

export type {
  FriendshipStatus,
  Friendship,
  FriendshipWithUser,
  TeamMemberRole,
  Team,
  TeamMember,
  TeamWithMembers,
  ClassroomMemberRole,
  ClassroomSchedule,
  ClassroomMember,
  ClassroomWithStats,
  School,
  TeamChallengeStatus,
  TeamChallenge,
  TeamChallengeWithDetails,
  CreateFriendshipDto,
  UpdateFriendshipDto,
  CreateTeamDto,
  UpdateTeamDto,
  JoinClassroomDto,
  CreateTeamChallengeDto,
  FriendshipsResponse,
  TeamsResponse,
  ClassroomsResponse,
} from './social.types';

// Social interactions
export * from './social-interaction.types';

// =====================================================
// MEDIA & CONTENT TYPES
// =====================================================

// Media types
export * from './media.types';

// Content types
export * from './content.types';

// =====================================================
// WHITE LABEL / BRANDING TYPES (EXT-008)
// =====================================================

// Branding types for tenant customization
export * from './branding.types';

// =====================================================
// LTI INTEGRATION TYPES (EXT-007)
// =====================================================

// LTI consumer types for LMS integration
export * from './lti.types';
