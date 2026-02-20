/**
 * User type definition - Synchronized with backend
 * Based on backend AuthResponse.user structure
 *
 * Backend source: /src/modules/auth/auth.types.ts
 * Backend entity: /src/modules/auth/entities/user.entity.ts (auth.users table)
 * Backend DTO: /src/modules/auth/dto/user-response.dto.ts
 *
 * UPDATED 2026-01-10: P1-004 - Campos adicionales alineados con Backend
 * - Agregados: phone_confirmed_at, updated_at, first_name, last_name, display_name
 *
 * ARCHITECTURAL NOTE - User vs Profile:
 * ====================================
 * - User (auth.users): Authentication-focused entity with auth credentials, roles, and status
 * - Profile (auth_management.profiles): Rich user profile with academic context and preferences
 *
 * Field overlap rationale:
 * - avatar_url, phone, status: Exist in BOTH User and Profile for architectural flexibility
 * - User.avatar_url: Quick avatar access for auth responses (performance)
 * - Profile.avatar_url: Canonical source managed via profile settings
 * - Backend may return either or merge both depending on endpoint
 *
 * When to use which:
 * - Use User for: Login responses, session data, quick user lookups
 * - Use Profile for: Profile pages, settings, detailed user information
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface User {
  // =====================================================
  // CORE IDENTIFIERS
  // =====================================================

  id: string;
  email: string;
  role: string;

  // =====================================================
  // PERSONAL INFORMATION
  // =====================================================

  firstName?: string;
  lastName?: string;
  displayName?: string;
  /**
   * Computed full name from firstName/lastName/displayName
   * Optional - may be computed client-side
   */
  fullName?: string;

  // =====================================================
  // PROFILE FIELDS (UPDATED 2025-11-26)
  // =====================================================

  /**
   * Avatar/profile picture URL
   * Maps to backend: avatar_url or Profile.avatar_url
   */
  avatar_url?: string;

  /**
   * Account status (active, inactive, suspended)
   * Maps to backend: User.status field
   * Backend returns as string with these common values
   */
  status?: string;

  /**
   * Contact phone number
   * Maps to backend: User.phone field
   */
  phone?: string;

  // =====================================================
  // BACKEND-ALIGNED PROFILE FIELDS (P1-004 2026-01-10)
  // Snake_case fields matching backend UserResponseDto
  // =====================================================

  /**
   * First name (snake_case from backend Profile)
   * P1-004: Direct mapping from UserResponseDto.first_name
   */
  first_name?: string;

  /**
   * Last name (snake_case from backend Profile)
   * P1-004: Direct mapping from UserResponseDto.last_name
   */
  last_name?: string;

  /**
   * Display name (snake_case from backend Profile)
   * P1-004: Direct mapping from UserResponseDto.display_name
   */
  display_name?: string;

  /**
   * Tenant ID (snake_case from backend Profile)
   * P1-004: Direct mapping from UserResponseDto.tenant_id
   */
  tenant_id?: string;

  /**
   * User biography (snake_case from backend Profile)
   * Direct mapping from UserResponseDto.bio
   */
  bio?: string;

  /**
   * Student grade level (snake_case from backend Profile)
   * Direct mapping from UserResponseDto.grade_level
   */
  grade_level?: string;

  /**
   * Equipped cosmetic items map { category: itemData }
   * Returned by getFullProfile with inventory data
   */
  equipped_items?: Record<string, unknown>;

  // =====================================================
  // ADMINISTRATION FIELDS (UPDATED 2025-11-26)
  // =====================================================

  /**
   * Super admin flag - Full system access
   * Maps to backend: User.is_super_admin field
   */
  is_super_admin?: boolean;

  /**
   * Ban expiration timestamp (ISO string)
   * If present, user is banned until this date
   * Maps to backend: User.banned_until field
   */
  banned_until?: string;

  // =====================================================
  // VERIFICATION & ACTIVITY (UPDATED 2025-11-26)
  // =====================================================

  /**
   * Email confirmation timestamp (ISO string)
   * If present, email has been verified
   * Maps to backend: User.email_confirmed_at field
   */
  email_confirmed_at?: string;

  /**
   * Last sign-in timestamp (ISO string)
   * Maps to backend: User.last_sign_in_at field
   */
  last_sign_in_at?: string;

  /**
   * Phone confirmation timestamp (ISO string)
   * P1-004: Added for backend alignment
   * Maps to backend: User.phone_confirmed_at field
   */
  phone_confirmed_at?: string;

  /**
   * Email verification status (derived field)
   * Computed from email_confirmed_at (true if present)
   * May be returned by some API endpoints
   */
  emailVerified?: boolean;

  // =====================================================
  // ORGANIZATIONAL CONTEXT
  // =====================================================

  /**
   * Account creation timestamp
   * May be returned by some API endpoints
   */
  createdAt?: string;

  /**
   * Account last update timestamp (ISO string)
   * P1-004: Added for backend alignment
   * Maps to backend: User.updated_at field
   */
  updated_at?: string;

  /**
   * Whether the user account is active (derived field)
   * Computed from deleted_at and banned_until
   * May be returned by some API endpoints
   */
  isActive?: boolean;

  /**
   * Tenant ID for multi-tenant systems
   * May be returned by some API endpoints
   */
  tenantId?: string;

  /**
   * School ID - Links user to a school in social_features.schools
   * From backend Profile entity (auth_management.profiles.school_id)
   * May be returned by some API endpoints
   */
  schoolId?: string;

  /**
   * Organization/Tenant data
   * BACKEND DEPENDENCY: Requires backend to include tenant data in auth response
   * Currently NOT returned by backend - will work once backend implements it
   *
   * @see Organization interface below
   * @see TenantResponseDto (backend)
   * @see REPORTE-EJECUCION-CORRECCION-TEACHER-PAGES-2026-01-07.md (deuda técnica DT-001)
   */
  organization?: Organization;
}

// =====================================================
// ORGANIZATION/TENANT TYPE
// =====================================================

/**
 * Organization/Tenant information
 * Maps to backend TenantResponseDto (auth_management.tenants table)
 *
 * BACKEND DEPENDENCY: This data is NOT currently returned by UserResponseDto.
 * Backend needs to include tenant data in auth response for this to work.
 *
 * Fields aligned with TenantResponseDto:
 * - id, name, slug, domain, logo_url (subset of full tenant data)
 *
 * @see TenantResponseDto (backend: apps/backend/src/modules/auth/dto/tenant-response.dto.ts)
 */
export interface Organization {
  /** Tenant UUID */
  id: string;
  /** Organization name */
  name: string;
  /** URL-friendly slug */
  slug?: string;
  /** Custom domain (if any) */
  domain?: string;
  /** Organization logo URL */
  logo_url?: string;
}

/**
 * Extended User type for frontend-specific fields
 * These fields are NOT returned by backend and must be handled separately or added to backend
 *
 * @see /docs-analisys/consistency-db-backend-frontend/correcciones/03-campos-faltantes-backend.md
 *
 * UPDATED 2025-11-26: Eliminados campos duplicados ahora presentes en User
 * - avatar_url, isActive, emailVerified, createdAt ahora están en User base
 */
export interface UserExtended extends User {
  fullName: string; // REQUIRED: Derived from firstName/lastName/displayName
  updatedAt?: string; // TODO: Add to backend AuthResponse (User has createdAt but not updatedAt)
}

/**
 * User preferences configuration
 * Maps to JSONB column in auth_management.profiles.preferences
 *
 * Backend source: /src/modules/auth/entities/profile.entity.ts
 */
export interface PreferencesConfig {
  theme?: string;
  language?: string;
  timezone?: string;
  sound_enabled?: boolean;
  notifications_enabled?: boolean;
  [key: string]: any; // Allow additional dynamic preferences
}

/**
 * AuthProfile - Profile type for auth feature
 *
 * Synchronized with backend Profile entity.
 * Represents complete user profile data from auth_management.profiles table.
 *
 * Backend source: /src/modules/auth/entities/profile.entity.ts
 * Database table: auth_management.profiles
 *
 * @see SSOT: @shared/types/profile.types.ts
 * P2-001: Types consolidation - contextual auth profile type
 *
 * Note: This interface uses string | null for optional fields,
 * while SSOT uses string? pattern. Both are valid for different contexts.
 */
export interface AuthProfile {
  /** Primary key UUID */
  id: string;

  /** Multi-tenancy: Links to auth_management.tenants */
  tenant_id: string;

  /** Links to auth.users - may be null for profiles without auth */
  user_id: string | null;

  /** Public display name - shown in UI, leaderboards */
  display_name: string | null;

  /** Complete name (may be computed from first_name + last_name) */
  full_name: string | null;

  /** Given name */
  first_name: string | null;

  /** Family name */
  last_name: string | null;

  /** Primary email (unique constraint) */
  email: string;

  /** Avatar/profile picture URL */
  avatar_url: string | null;

  /** User biography or description */
  bio: string | null;

  /** Contact phone number */
  phone: string | null;

  /** Date of birth (ISO date string) */
  date_of_birth: string | null;

  /** Academic level (e.g., "1", "2", "secondary") */
  grade_level: string | null;

  /** Student identification number */
  student_id: string | null;

  /** Links to social_features.schools */
  school_id: string | null;

  /** User role from GamilityRoleEnum (student, teacher, admin, etc.) */
  role: string;

  /** Account status from UserStatusEnum (active, inactive, suspended, etc.) */
  status: string;

  /** Email verification status */
  email_verified: boolean;

  /** Phone verification status */
  phone_verified: boolean;

  /** User preferences (theme, language, notifications, etc.) */
  preferences: PreferencesConfig;

  /** Last successful sign-in timestamp (ISO string) */
  last_sign_in_at: string | null;

  /** Last activity timestamp (ISO string) */
  last_activity_at: string | null;

  /** Additional custom metadata (flexible JSONB) */
  metadata: Record<string, unknown>;

  /** Profile creation timestamp (ISO string) */
  created_at: string;

  /** Profile last update timestamp (ISO string) */
  updated_at: string;
}

/**
 * @deprecated Use AuthProfile instead, or Profile from @shared/types/profile.types.ts
 * Alias for backward compatibility.
 * P2-001: Types consolidation
 */
export type Profile = AuthProfile;

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Registration data
 */
export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  tenantId?: string;
  schoolId?: string; // Optional school ID for student registration
}

/**
 * Authentication response from API
 * Updated to match EXACT backend response structure
 *
 * Backend source: /src/modules/auth/auth.types.ts - AuthResponse
 */
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string; // Backend marks as optional
  expiresIn: string; // Backend returns this as required
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset confirmation
 */
export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

/**
 * Session information (for session validation)
 */
export interface SessionInfo {
  expiresAt: number;
  isValid: boolean;
  needsRefresh: boolean;
}

/**
 * User session information (for session management list)
 * Maps to backend SessionInfoDto from auth.types.ts
 *
 * Backend source: /src/modules/auth/auth.types.ts - SessionInfoDto
 */
export interface UserSessionInfo {
  id: string;
  deviceType: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string; // Backend uses 'location' instead of separate country/city
  createdAt: string; // Backend returns as string
  lastActivity: string; // Backend uses 'lastActivity' not 'lastActivityAt'
  isCurrent: boolean;
}

/**
 * Account suspension details
 */
export interface SuspensionDetails {
  isSuspended: boolean;
  isPermanent: boolean;
  suspendedUntil?: string; // ISO date string
  reason?: string;
}

/**
 * Account status error codes
 */
export type AccountErrorCode =
  | 'ACCOUNT_INACTIVE'
  | 'ACCOUNT_SUSPENDED'
  | 'INVALID_CREDENTIALS'
  | 'AUTHENTICATION_ERROR';

/**
 * Helper function to compute fullName from User data
 * Use this when you need fullName from backend User object
 *
 * @param user - User object from backend
 * @returns Computed full name
 */
export function getUserFullName(user: User): string {
  if (user.displayName) return user.displayName;

  const parts = [user.firstName, user.lastName].filter(Boolean);
  if (parts.length > 0) return parts.join(' ');

  return user.email;
}

/**
 * Helper function to get display name (username-like) from User
 * Uses email prefix when no name fields are available
 *
 * @param user - User object from backend
 * @returns Display name for UI (shorter than full name)
 */
export function getUserDisplayName(user: User): string {
  if (user.displayName) return user.displayName;
  if (user.firstName) return user.firstName;

  // Use email prefix as username fallback
  return user.email.split('@')[0];
}

/**
 * Convert backend User to UserExtended
 * Fills in missing fields with defaults
 *
 * UPDATED 2025-11-26: Simplificado - solo agrega fullName y updatedAt
 * Los demás campos ahora están en User base interface
 *
 * @param user - User from backend
 * @param additionalData - Optional additional data not from backend
 * @returns UserExtended object
 */
export function toUserExtended(user: User, additionalData?: Partial<UserExtended>): UserExtended {
  return {
    ...user,
    fullName: getUserFullName(user),
    updatedAt: additionalData?.updatedAt,
  };
}
