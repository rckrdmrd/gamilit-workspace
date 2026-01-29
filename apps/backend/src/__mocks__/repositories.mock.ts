/**
 * TypeORM Repository Mocks
 *
 * @description Reusable mock implementations for TypeORM repositories.
 * Provides consistent mocking patterns across all test suites.
 *
 * Sprint 0 - P0-008: Test Infrastructure
 */

import { Repository, SelectQueryBuilder, ObjectLiteral } from 'typeorm';

/**
 * Creates a mock TypeORM Repository with all common methods
 *
 * @template T - Entity type
 * @returns Mocked Repository<T>
 */
export function createMockRepository<T extends ObjectLiteral>(): jest.Mocked<Repository<T>> {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    findAndCount: jest.fn(),
    findBy: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn(),
    createQueryBuilder: jest.fn(() => createMockQueryBuilder<T>()),
    manager: {} as unknown,
    metadata: {} as unknown,
    target: {} as unknown,
    query: jest.fn(),
    clear: jest.fn(),
    getId: jest.fn(),
    hasId: jest.fn(),
    insert: jest.fn(),
    preload: jest.fn(),
    recover: jest.fn(),
    restore: jest.fn(),
    softDelete: jest.fn(),
    softRemove: jest.fn(),
    extend: jest.fn(),
    findOneOrFail: jest.fn(),
    findOneByOrFail: jest.fn(),
    exist: jest.fn(),
    existsBy: jest.fn(),
  } as unknown as jest.Mocked<Repository<T>>;
}

/**
 * Creates a mock SelectQueryBuilder
 *
 * @template T - Entity type
 * @returns Mocked SelectQueryBuilder<T>
 */
export function createMockQueryBuilder<T extends ObjectLiteral>(): jest.Mocked<SelectQueryBuilder<T>> {
  const queryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    having: jest.fn().mockReturnThis(),
    andHaving: jest.fn().mockReturnThis(),
    orHaving: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getMany: jest.fn(),
    getManyAndCount: jest.fn(),
    getRawOne: jest.fn().mockResolvedValue(null),
    getRawMany: jest.fn().mockResolvedValue([]),
    getCount: jest.fn(),
    execute: jest.fn(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    into: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
  } as unknown as jest.Mocked<SelectQueryBuilder<T>>;

  return queryBuilder;
}

/**
 * Helper: Reset all mocks in a repository
 */
export function resetRepositoryMocks(repository: Record<string, jest.Mock | unknown>): void {
  Object.keys(repository).forEach((key) => {
    const value = repository[key];
    if (value && typeof value === 'function' && 'mockReset' in value) {
      (value as jest.Mock).mockReset();
    }
  });
}
