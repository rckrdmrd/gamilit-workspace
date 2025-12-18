/**
 * Profile Repository Interface
 *
 * @description Interface for Profile repository operations.
 * Profiles are linked to auth.users and contain extended user data.
 */

import { Profile } from '@/modules/auth/entities';

export interface IProfileRepository {
  /**
   * Find profile by ID
   */
  findById(id: string): Promise<Profile | null>;

  /**
   * Find profile by user_id (auth.users.id)
   */
  findByUserId(userId: string): Promise<Profile | null>;

  /**
   * Find profile by email
   */
  findByEmail(email: string): Promise<Profile | null>;

  /**
   * Find profiles by tenant
   */
  findByTenant(tenantId: string, options?: { limit?: number; offset?: number }): Promise<Profile[]>;

  /**
   * Create new profile
   */
  create(data: Partial<Profile>): Promise<Profile>;

  /**
   * Update profile
   */
  update(id: string, data: Partial<Profile>): Promise<Profile | null>;

  /**
   * Get profile ID from user ID
   * @description Commonly needed conversion since JWT contains user_id but many FKs reference profile_id
   */
  getProfileIdFromUserId(userId: string): Promise<string | null>;
}

/**
 * Repository token for dependency injection
 */
export const PROFILE_REPOSITORY = Symbol('PROFILE_REPOSITORY');
