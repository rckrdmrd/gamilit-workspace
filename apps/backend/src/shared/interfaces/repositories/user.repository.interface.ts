/**
 * User Repository Interface
 *
 * @description Interface for User repository operations.
 * Implementing this interface allows for easy mocking in tests
 * and potential future repository implementations.
 *
 * @example Testing:
 * ```typescript
 * const mockUserRepo: IUserRepository = {
 *   findById: jest.fn().mockResolvedValue(mockUser),
 *   findByEmail: jest.fn().mockResolvedValue(null),
 *   // ...
 * };
 * ```
 */

import { User } from '@/modules/auth/entities';

export interface IUserRepository {
  /**
   * Find user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Check if email exists
   */
  emailExists(email: string): Promise<boolean>;

  /**
   * Create new user
   */
  create(data: Partial<User>): Promise<User>;

  /**
   * Update user
   */
  update(id: string, data: Partial<User>): Promise<User | null>;

  /**
   * Soft delete user
   */
  softDelete(id: string): Promise<boolean>;
}

/**
 * Repository token for dependency injection
 */
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
