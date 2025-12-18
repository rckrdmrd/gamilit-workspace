/**
 * Repository Factory - Centralized repository creation
 *
 * @description Provides a factory pattern for TypeORM repositories,
 * enabling better testability through dependency injection.
 *
 * This factory replaces direct @InjectRepository usage with a more
 * flexible pattern that supports:
 * - Easy mocking in tests
 * - Runtime repository switching
 * - Centralized connection management
 * - Custom repository implementations
 *
 * @usage
 * ```typescript
 * // Instead of:
 * @InjectRepository(User, 'auth')
 * private readonly userRepo: Repository<User>
 *
 * // Use:
 * constructor(private readonly repoFactory: RepositoryFactory) {}
 *
 * private get userRepo() {
 *   return this.repoFactory.getRepository(User, 'auth');
 * }
 * ```
 *
 * @migration See /docs/migrations/REPOSITORY-FACTORY-MIGRATION.md
 */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository, ObjectLiteral, EntityTarget } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

/**
 * Connection names used in the application
 */
export type ConnectionName =
  | 'auth'
  | 'educational'
  | 'progress'
  | 'gamification'
  | 'social'
  | 'notifications';

/**
 * Repository cache key type
 */
type RepositoryCacheKey = `${string}:${ConnectionName}`;

@Injectable()
export class RepositoryFactory {
  private repositoryCache = new Map<RepositoryCacheKey, Repository<any>>();

  constructor(
    @InjectDataSource('auth')
    private readonly authDataSource: DataSource,

    @InjectDataSource('educational')
    private readonly educationalDataSource: DataSource,

    @InjectDataSource('progress')
    private readonly progressDataSource: DataSource,

    @InjectDataSource('gamification')
    private readonly gamificationDataSource: DataSource,

    @InjectDataSource('social')
    private readonly socialDataSource: DataSource,

    @InjectDataSource('notifications')
    private readonly notificationsDataSource: DataSource,
  ) {}

  /**
   * Get repository for an entity
   *
   * @param entity - Entity class
   * @param connection - Connection name (schema)
   * @returns TypeORM Repository
   *
   * @example
   * ```typescript
   * const userRepo = this.repoFactory.getRepository(User, 'auth');
   * const profile = await userRepo.findOne({ where: { id } });
   * ```
   */
  getRepository<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    connection: ConnectionName,
  ): Repository<T> {
    const entityName = typeof entity === 'function' ? entity.name : String(entity);
    const cacheKey: RepositoryCacheKey = `${entityName}:${connection}`;

    // Check cache first
    if (this.repositoryCache.has(cacheKey)) {
      return this.repositoryCache.get(cacheKey)!;
    }

    // Get data source for connection
    const dataSource = this.getDataSource(connection);

    // Create and cache repository
    const repository = dataSource.getRepository(entity);
    this.repositoryCache.set(cacheKey, repository);

    return repository;
  }

  /**
   * Get data source by connection name
   */
  private getDataSource(connection: ConnectionName): DataSource {
    switch (connection) {
      case 'auth':
        return this.authDataSource;
      case 'educational':
        return this.educationalDataSource;
      case 'progress':
        return this.progressDataSource;
      case 'gamification':
        return this.gamificationDataSource;
      case 'social':
        return this.socialDataSource;
      case 'notifications':
        return this.notificationsDataSource;
      default:
        throw new Error(`Unknown connection: ${connection}`);
    }
  }

  /**
   * Clear repository cache (useful for testing)
   */
  clearCache(): void {
    this.repositoryCache.clear();
  }

  /**
   * Get all available connection names
   */
  getConnectionNames(): ConnectionName[] {
    return ['auth', 'educational', 'progress', 'gamification', 'social', 'notifications'];
  }
}
