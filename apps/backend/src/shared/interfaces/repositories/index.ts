/**
 * Repository Interfaces
 *
 * @description Export all repository interfaces for dependency injection.
 * Using interfaces allows for:
 * - Easy mocking in unit tests
 * - Swappable implementations
 * - Clear contract definition
 *
 * @usage
 * ```typescript
 * import { IUserRepository, USER_REPOSITORY } from '@shared/interfaces/repositories';
 *
 * @Injectable()
 * export class AuthService {
 *   constructor(
 *     @Inject(USER_REPOSITORY)
 *     private readonly userRepo: IUserRepository,
 *   ) {}
 * }
 * ```
 */

export { IUserRepository, USER_REPOSITORY } from './user.repository.interface';
export { IProfileRepository, PROFILE_REPOSITORY } from './profile.repository.interface';
