/**
 * Token Response Types
 *
 * ISSUE: #9 (P1) - Refresh Token Implementation
 * SPRINT: Sprint 0 - Día 2
 */

import { GamilityRoleEnum } from '@shared/constants';

/**
 * JWT Tokens response
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // Segundos
}

/**
 * User data without sensitive fields (password, etc.)
 * Used in API responses
 */
export interface SanitizedUser {
  id: string;
  email: string;
  role: GamilityRoleEnum;
  status: string;
  phone?: string;
  email_confirmed_at?: Date;
  phone_confirmed_at?: Date;
  is_super_admin: boolean;
  last_sign_in_at?: Date;
  raw_user_meta_data: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

/**
 * Auth response with tokens and user data
 */
export interface AuthResponse {
  user: SanitizedUser;
  tokens: TokenResponse;
}

/**
 * JWT Payload structure
 */
export interface JwtPayload {
  sub: string;      // User ID
  email: string;
  role: GamilityRoleEnum;
  iat?: number;     // Issued at
  exp?: number;     // Expiration
}

/**
 * Register DTO type
 */
export interface RegisterUserData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}
