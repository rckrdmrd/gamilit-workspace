/**
 * User Types
 *
 * Type definitions for user entities and authentication.
 *
 * @description Single Source of Truth (SSOT) for user-related types.
 * This file consolidates user types from auth and profile modules.
 *
 * @see Backend Entity: auth_management.profiles
 * @see /shared/types/profile.types.ts for Profile interface
 * @see /shared/types/auth.types.ts for authentication types
 *
 * DTO-001: Updated user types with complete canonical definitions
 */

/**
 * User Role Enum
 *
 * Available roles in the GAMILIT system
 */
export type UserRole =
  | 'student' // Regular student user
  | 'teacher' // Teacher/instructor (admin_teacher in DB)
  | 'admin' // Institution administrator
  | 'institution_admin' // Institution admin (alias)
  | 'super_admin' // Platform super administrator
  | 'content_creator'; // Content creator role

/**
 * User Preferences
 *
 * Configurable user settings and preferences
 */
export interface UserPreferences {
  /**
   * UI theme preference
   * @default 'light'
   */
  theme: 'light' | 'dark' | 'system' | 'detective';

  /**
   * Language preference (ISO 639-1)
   * @default 'es'
   */
  language: string;

  /**
   * Timezone (IANA timezone)
   * @default 'America/Mexico_City'
   */
  timezone?: string;

  /**
   * Enable sound effects
   * @default true
   */
  sounds: boolean;

  /**
   * Enable in-app notifications
   * @default true
   */
  notifications: boolean;

  /**
   * Enable email notifications
   * @default true
   */
  emailNotifications: boolean;

  /**
   * Enable push notifications
   * @default false
   */
  pushNotifications: boolean;

  /**
   * Enable SMS notifications
   * @default false
   */
  smsNotifications?: boolean;
}

/**
 * User Interface
 *
 * Core user entity with authentication and profile information
 *
 * @description Represents a user in the GAMILIT system.
 * This is a simplified version for general use.
 * For complete profile data, use the Profile interface.
 */
export interface User {
  // =====================================================
  // CORE IDENTIFIERS
  // =====================================================

  /**
   * User unique ID (UUID)
   */
  id: string;

  /**
   * Tenant ID for multi-tenancy
   */
  tenantId: string;

  // =====================================================
  // AUTHENTICATION
  // =====================================================

  /**
   * Email address (unique, used for login)
   */
  email: string;

  /**
   * Email verification status
   */
  isVerified: boolean;

  // =====================================================
  // PERSONAL INFORMATION
  // =====================================================

  /**
   * First name
   */
  firstName: string;

  /**
   * Last name(s)
   */
  lastName: string;

  /**
   * Display name (optional, defaults to firstName)
   */
  displayName?: string;

  /**
   * Full name (computed: firstName + lastName)
   */
  fullName?: string;

  /**
   * Avatar/profile picture URL
   */
  avatarUrl?: string;

  /**
   * Phone number
   */
  phone?: string;

  // =====================================================
  // ROLE & STATUS
  // =====================================================

  /**
   * User role in the system
   */
  role: UserRole;

  /**
   * Account status
   * Values: active, inactive, suspended, pending
   */
  isActive: boolean;

  /**
   * Account status enum (if using enum)
   */
  status?: 'active' | 'inactive' | 'suspended' | 'pending';

  // =====================================================
  // ACADEMIC CONTEXT (for students)
  // =====================================================

  /**
   * School/institution ID
   */
  schoolId?: string;

  /**
   * Grade level (e.g., "5", "6", "7")
   */
  gradeLevel?: string;

  /**
   * Student ID number
   */
  studentId?: string;

  // =====================================================
  // ORGANIZATION (for teachers/admins)
  // =====================================================

  /**
   * Organization name
   */
  organizationName?: string;

  // =====================================================
  // PREFERENCES
  // =====================================================

  /**
   * User preferences and settings
   */
  preferences?: UserPreferences;

  /**
   * Additional user metadata (flexible JSONB field)
   */
  metadata?: Record<string, unknown>;

  // =====================================================
  // ACTIVITY TRACKING
  // =====================================================

  /**
   * Last login timestamp
   */
  lastLoginAt?: string; // ISO date string

  /**
   * Last login date (alias for lastLoginAt)
   */
  lastLogin?: Date | string | null;

  /**
   * Last activity timestamp
   */
  lastActivityAt?: string; // ISO date string

  // =====================================================
  // AUDIT FIELDS
  // =====================================================

  /**
   * User creation timestamp
   */
  createdAt: string; // ISO date string

  /**
   * Last update timestamp
   */
  updatedAt: string; // ISO date string
}

/**
 * User Extended
 *
 * Extended user information including gamification stats
 */
export interface UserExtended extends User {
  /**
   * Gamification statistics
   */
  stats?: {
    totalXp: number;
    level: number;
    mlCoins: number;
    currentRank: string;
    achievements: string[];
  };

  /**
   * Biography or user description
   */
  bio?: string;

  /**
   * Additional metadata
   */
  metadata?: Record<string, unknown>;
}

/**
 * User Profile (alias)
 *
 * Complete user profile with all available information.
 * This is an alias for the Profile interface from profile.types.ts
 *
 * @see /shared/types/profile.types.ts
 */
export type { Profile as UserProfile } from './profile.types';

/**
 * User Gamification Data
 *
 * Gamification-specific user data
 *
 * @deprecated Use UserStats from user-stats.types.ts instead
 */
export interface UserGamificationData {
  userId: string;
  totalXP: number;
  level: number;
  mlCoins: number;
  rank: string;
  achievements: string[];
}

/**
 * Create User DTO
 *
 * Data required to create a new user
 */
export interface CreateUserDto {
  /**
   * Email (required)
   */
  email: string;

  /**
   * Password (required, min 8 chars)
   */
  password: string;

  /**
   * First name (required)
   */
  firstName: string;

  /**
   * Last name (required)
   */
  lastName: string;

  /**
   * User role
   * @default 'student'
   */
  role?: UserRole;

  /**
   * Tenant ID
   */
  tenantId: string;

  /**
   * Grade level (for students)
   */
  gradeLevel?: string;

  /**
   * School ID
   */
  schoolId?: string;

  /**
   * Phone number
   */
  phone?: string;

  /**
   * User preferences
   */
  preferences?: Partial<UserPreferences>;
}

/**
 * Update User DTO
 *
 * Data allowed to be updated for a user
 */
export interface UpdateUserDto {
  /**
   * First name
   */
  firstName?: string;

  /**
   * Last name
   */
  lastName?: string;

  /**
   * Display name
   */
  displayName?: string;

  /**
   * Avatar URL
   */
  avatarUrl?: string;

  /**
   * Phone number
   */
  phone?: string;

  /**
   * Biography
   */
  bio?: string;

  /**
   * Grade level
   */
  gradeLevel?: string;

  /**
   * Preferences
   */
  preferences?: Partial<UserPreferences>;

  /**
   * Metadata
   */
  metadata?: Record<string, unknown>;
}

/**
 * User Query Filters
 *
 * Filters for querying users
 */
export interface UserQueryFilters {
  /**
   * Page number (1-based)
   * @default 1
   */
  page?: number;

  /**
   * Results per page (1-100)
   * @default 20
   */
  limit?: number;

  /**
   * Search by name or email
   */
  search?: string;

  /**
   * Filter by role
   */
  role?: UserRole;

  /**
   * Filter by status
   */
  status?: 'active' | 'inactive' | 'suspended' | 'pending' | 'all';

  /**
   * Filter by tenant
   */
  tenantId?: string;

  /**
   * Filter by school
   */
  schoolId?: string;

  /**
   * Filter by grade level
   */
  gradeLevel?: string;

  /**
   * Sort field
   */
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLoginAt';

  /**
   * Sort order
   */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Generic Table Row
 *
 * Generic type for table rows with dynamic columns
 */
export interface TableRow {
  id: string;
  [key: string]: unknown;
}

/**
 * Paginated Users Response
 *
 * Wrapper for paginated user results
 */
export interface PaginatedUsers {
  /**
   * Array of users
   */
  data: User[];

  /**
   * Pagination metadata
   */
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * User Session Info
 *
 * Information about current user session
 */
export interface UserSessionInfo {
  /**
   * User data
   */
  user: User;

  /**
   * Session token
   */
  token?: string;

  /**
   * Refresh token
   */
  refreshToken?: string;

  /**
   * Session expiry timestamp
   */
  expiresAt?: string; // ISO date string
}

// Re-export UserRole for convenience
export { UserRole as GamilityRole };
