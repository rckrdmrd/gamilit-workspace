/**
 * Prediction Cache Service
 *
 * @description Caches ML predictions in Redis with TTL based on prediction type.
 * Supports cache warming for active users and invalidation on relevant events.
 *
 * TTL Configuration:
 * - Dropout risk: 6 hours (stable prediction, updated less frequently)
 * - Performance: 1 hour (changes with recent activity)
 * - Difficulty: 30 minutes (needs fresh recommendations)
 * - Engagement: 15 minutes (highly dynamic)
 *
 * @module ml/services
 * @sprint 3.3 - ML Prediction API
 * @created 2026-02-03
 */

import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * Prediction type for cache key generation
 */
export type PredictionCacheType =
  | 'dropout_risk'
  | 'performance'
  | 'difficulty'
  | 'engagement'
  | 'student_insights'
  | 'classroom_insights';

/**
 * Cache TTL configuration (in seconds)
 */
const CACHE_TTL: Record<PredictionCacheType, number> = {
  dropout_risk: 6 * 60 * 60, // 6 hours
  performance: 60 * 60, // 1 hour
  difficulty: 30 * 60, // 30 minutes
  engagement: 15 * 60, // 15 minutes
  student_insights: 30 * 60, // 30 minutes
  classroom_insights: 60 * 60, // 1 hour
};

/**
 * Cache key prefix
 */
const CACHE_PREFIX = 'ml:prediction:';

/**
 * Cache statistics
 */
interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  invalidations: number;
}

@Injectable()
export class PredictionCacheService {
  private readonly logger = new Logger(PredictionCacheService.name);
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    invalidations: 0,
  };

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /**
   * Generate cache key for a prediction
   *
   * @param type - Prediction type
   * @param studentId - Student ID
   * @param additionalKey - Optional additional key component (e.g., exerciseId, moduleId)
   * @returns Cache key string
   */
  private generateKey(
    type: PredictionCacheType,
    studentId: string,
    additionalKey?: string,
  ): string {
    const keyParts = [CACHE_PREFIX, type, studentId];
    if (additionalKey) {
      keyParts.push(additionalKey);
    }
    return keyParts.join(':');
  }

  /**
   * Get cached prediction if available
   *
   * @param type - Prediction type
   * @param studentId - Student ID
   * @param additionalKey - Optional additional key component
   * @returns Cached prediction or null if not found
   */
  async get<T>(
    type: PredictionCacheType,
    studentId: string,
    additionalKey?: string,
  ): Promise<T | null> {
    const key = this.generateKey(type, studentId, additionalKey);

    try {
      const cached = await this.cacheManager.get<T>(key);

      if (cached) {
        this.stats.hits++;
        this.logger.debug(`Cache HIT for ${key}`);
        return cached;
      }

      this.stats.misses++;
      this.logger.debug(`Cache MISS for ${key}`);
      return null;
    } catch (error) {
      this.logger.error(`Cache get error for ${key}: ${error}`);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Store prediction in cache
   *
   * @param type - Prediction type
   * @param studentId - Student ID
   * @param data - Prediction data to cache
   * @param additionalKey - Optional additional key component
   * @param customTtl - Optional custom TTL override (in seconds)
   */
  async set<T>(
    type: PredictionCacheType,
    studentId: string,
    data: T,
    additionalKey?: string,
    customTtl?: number,
  ): Promise<void> {
    const key = this.generateKey(type, studentId, additionalKey);
    const ttl = customTtl || CACHE_TTL[type];

    try {
      await this.cacheManager.set(key, data, ttl * 1000); // cache-manager uses ms
      this.stats.sets++;
      this.logger.debug(`Cache SET for ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      this.logger.error(`Cache set error for ${key}: ${error}`);
    }
  }

  /**
   * Invalidate cached prediction for a student
   *
   * @param type - Prediction type
   * @param studentId - Student ID
   * @param additionalKey - Optional additional key component
   */
  async invalidate(
    type: PredictionCacheType,
    studentId: string,
    additionalKey?: string,
  ): Promise<void> {
    const key = this.generateKey(type, studentId, additionalKey);

    try {
      await this.cacheManager.del(key);
      this.stats.invalidations++;
      this.logger.debug(`Cache INVALIDATE for ${key}`);
    } catch (error) {
      this.logger.error(`Cache invalidate error for ${key}: ${error}`);
    }
  }

  /**
   * Invalidate all predictions for a student
   *
   * @param studentId - Student ID
   */
  async invalidateAllForStudent(studentId: string): Promise<void> {
    const types: PredictionCacheType[] = [
      'dropout_risk',
      'performance',
      'difficulty',
      'engagement',
      'student_insights',
    ];

    for (const type of types) {
      await this.invalidate(type, studentId);
    }

    this.logger.log(`Invalidated all predictions for student ${studentId}`);
  }

  /**
   * Invalidate all predictions for a classroom
   *
   * @param classroomId - Classroom ID
   * @param studentIds - List of student IDs in the classroom
   */
  async invalidateClassroom(
    classroomId: string,
    studentIds: string[],
  ): Promise<void> {
    // Invalidate classroom insights
    await this.invalidate('classroom_insights', classroomId);

    // Invalidate each student's predictions
    for (const studentId of studentIds) {
      await this.invalidateAllForStudent(studentId);
    }

    this.logger.log(
      `Invalidated classroom ${classroomId} predictions for ${studentIds.length} students`,
    );
  }

  /**
   * Warm cache for a list of active users
   *
   * @param studentIds - List of student IDs
   * @param predictFunction - Function to generate predictions
   * @param type - Prediction type
   */
  async warmCache<T>(
    studentIds: string[],
    predictFunction: (studentId: string) => Promise<T>,
    type: PredictionCacheType,
  ): Promise<{ warmed: number; failed: number }> {
    let warmed = 0;
    let failed = 0;

    this.logger.log(
      `Starting cache warming for ${studentIds.length} students (type: ${type})`,
    );

    for (const studentId of studentIds) {
      try {
        // Check if already cached
        const existing = await this.get(type, studentId);
        if (existing) {
          continue;
        }

        // Generate and cache prediction
        const prediction = await predictFunction(studentId);
        await this.set(type, studentId, prediction);
        warmed++;
      } catch (error) {
        this.logger.error(
          `Cache warming failed for student ${studentId}: ${error}`,
        );
        failed++;
      }
    }

    this.logger.log(
      `Cache warming complete: ${warmed} warmed, ${failed} failed`,
    );

    return { warmed, failed };
  }

  /**
   * Get cache statistics
   *
   * @returns Cache statistics
   */
  getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;

    return {
      ...this.stats,
      hitRate: Number((hitRate * 100).toFixed(2)),
    };
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      invalidations: 0,
    };
  }

  /**
   * Get TTL for a prediction type
   *
   * @param type - Prediction type
   * @returns TTL in seconds
   */
  getTtl(type: PredictionCacheType): number {
    return CACHE_TTL[type];
  }

  /**
   * Clear all prediction cache
   *
   * @returns Number of keys cleared (approximate)
   */
  async clearAll(): Promise<number> {
    try {
      // Note: This is a simplified implementation
      // In production, you might want to use Redis SCAN with pattern matching
      // cache-manager v5+ uses stores or store for cache clearing
      const cacheStore = (this.cacheManager as unknown as { stores?: Array<{ clear?: () => Promise<void> }> }).stores?.[0];
      if (cacheStore?.clear) {
        await cacheStore.clear();
      }
      const previousSets = this.stats.sets;
      this.stats.invalidations += previousSets;
      this.logger.log('Cleared all prediction cache');
      return previousSets;
    } catch (error) {
      this.logger.error(`Error clearing cache: ${error}`);
      return 0;
    }
  }
}
