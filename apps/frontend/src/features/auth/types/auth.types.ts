/**
 * User type definition - Synchronized with backend
 * Based on backend AuthResponse.user structure
 *
 * Backend source: /src/modules/auth/auth.types.ts
 */
export interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
}

/**
 * Extended User type for frontend-specific fields
 * These fields are NOT returned by backend and must be handled separately or added to backend
 *
 * @see /docs-analisys/consistency-db-backend-frontend/correcciones/03-campos-faltantes-backend.md
 */
export interface UserExtended extends User {
  fullName: string;      // Derived from firstName/lastName/displayName
  tenantId?: string;     // TODO: Add to backend AuthResponse
  emailVerified: boolean; // TODO: Add to backend AuthResponse
  isActive?: boolean;    // TODO: Add to backend AuthResponse
  avatar?: string;       // TODO: Add to backend AuthResponse
  createdAt?: string;    // TODO: Add to backend AuthResponse
  updatedAt?: string;    // TODO: Add to backend AuthResponse
}

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
  refreshToken?: string;  // Backend marks as optional
  expiresIn: string;      // Backend returns this as required
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
  location: string;      // Backend uses 'location' instead of separate country/city
  createdAt: string;     // Backend returns as string
  lastActivity: string;  // Backend uses 'lastActivity' not 'lastActivityAt'
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
 * Convert backend User to UserExtended
 * Fills in missing fields with defaults
 *
 * @param user - User from backend
 * @param additionalData - Optional additional data not from backend
 * @returns UserExtended object
 */
export function toUserExtended(
  user: User,
  additionalData?: Partial<Omit<UserExtended, keyof User | 'fullName'>>
): UserExtended {
  return {
    ...user,
    fullName: getUserFullName(user),
    tenantId: additionalData?.tenantId,
    emailVerified: additionalData?.emailVerified ?? false,
    isActive: additionalData?.isActive ?? true,
    avatar: additionalData?.avatar,
    createdAt: additionalData?.createdAt,
    updatedAt: additionalData?.updatedAt,
  };
}
