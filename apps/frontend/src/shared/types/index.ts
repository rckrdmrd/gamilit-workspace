/**
 * Types Barrel Export
 * Centralized exports for all shared TypeScript types and interfaces
 *
 * DTO-001: Updated to include new canonical types
 */

// =====================================================
// AUTHENTICATION & USER TYPES
// =====================================================

// Export auth types (excluding Profile to avoid conflict)
export type { User, AuthResponse, LoginCredentials, RegisterData } from './auth.types';

// Export profile types (Profile comes from here)
export * from './profile.types';

// Export canonical user types (DTO-001)
export * from './user.types';

// Legacy users types (for backward compatibility)
export * from './users.types';

// =====================================================
// GAMIFICATION & STATS TYPES (DTO-001)
// =====================================================

// User statistics - NEW canonical types
export * from './user-stats.types';

// Gamification types
export * from './gamification.types';

// Achievements
export * from './achievement.types';

// Leaderboards
export * from './leaderboard.types';

// =====================================================
// EDUCATIONAL CONTENT TYPES
// =====================================================

// Modules and exercises
export * from './educational.types';

// Progress tracking
export * from './progress.types';

// Exercise submissions - NEW canonical types (DTO-001)
export * from './exercise-submission.types';

// =====================================================
// CLASSROOM & SOCIAL TYPES (DTO-001)
// =====================================================

// Classrooms - NEW canonical types
export * from './classroom.types';

// Social features
export * from './social.types';

// =====================================================
// MEDIA & CONTENT TYPES
// =====================================================

// Media types
export * from './media.types';

// Content types
export * from './content.types';
