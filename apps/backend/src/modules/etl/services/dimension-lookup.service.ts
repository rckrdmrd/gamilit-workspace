/**
 * Dimension Lookup Service
 *
 * @description Service for resolving dimension keys from natural keys.
 * Provides caching for efficient lookups and handles surrogate key generation.
 *
 * @module etl/services
 * @since 2026-02-03
 */

import { Injectable, Logger } from '@nestjs/common';
import { IDimensionLookup } from '../interfaces';

/**
 * Cache Entry
 * @description Entry in the dimension cache
 */
interface CacheEntry {
  key: number;
  expiresAt: number;
}

/**
 * DimensionLookupService
 * @description Manages dimension key lookups with in-memory caching
 */
@Injectable()
export class DimensionLookupService implements IDimensionLookup {
  private readonly logger = new Logger(DimensionLookupService.name);

  // In-memory caches for dimension lookups
  private readonly studentKeyCache = new Map<string, CacheEntry>();
  private readonly exerciseKeyCache = new Map<string, CacheEntry>();
  private readonly moduleKeyCache = new Map<string, CacheEntry>();
  private readonly achievementKeyCache = new Map<string, CacheEntry>();
  private readonly rankKeyCache = new Map<string, CacheEntry>();

  // Auto-increment counters for surrogate keys (in production, these would be DB sequences)
  private studentKeyCounter = 1000;
  private exerciseKeyCounter = 2000;
  private moduleKeyCounter = 3000;
  private achievementKeyCounter = 4000;
  private rankKeyCounter = 5000;

  // Cache TTL in milliseconds (5 minutes)
  private readonly CACHE_TTL_MS = 5 * 60 * 1000;

  /**
   * Get date dimension key (YYYYMMDD format)
   * @param date - Date to convert
   * @returns Numeric key in YYYYMMDD format
   */
  getDateKey(date: Date): number {
    const utcDate = new Date(date.toISOString());
    const year = utcDate.getUTCFullYear();
    const month = String(utcDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(utcDate.getUTCDate()).padStart(2, '0');
    return parseInt(`${year}${month}${day}`, 10);
  }

  /**
   * Get time dimension key (HHMM format)
   * @param date - Date containing time to convert
   * @returns Numeric key in HHMM format
   */
  getTimeKey(date: Date): number {
    const utcDate = new Date(date.toISOString());
    const hours = String(utcDate.getUTCHours()).padStart(2, '0');
    const minutes = String(utcDate.getUTCMinutes()).padStart(2, '0');
    return parseInt(`${hours}${minutes}`, 10);
  }

  /**
   * Get or create student surrogate key
   * @param studentId - Natural key (UUID) from OLTP
   * @returns Promise with surrogate key
   */
  async getOrCreateStudentKey(studentId: string): Promise<number> {
    // Check cache first
    const cached = this.getCachedKey(this.studentKeyCache, studentId);
    if (cached !== null) {
      return cached;
    }

    // In production: Query DW to check if student exists, if not create dimension record
    // For now, generate a new key
    const newKey = this.studentKeyCounter++;

    // Cache the result
    this.setCachedKey(this.studentKeyCache, studentId, newKey);

    this.logger.debug(`Created new student key ${newKey} for ${studentId}`);
    return newKey;
  }

  /**
   * Get exercise surrogate key
   * @param exerciseId - Natural key (UUID) from OLTP
   * @returns Promise with surrogate key (or null if not found)
   */
  async getExerciseKey(exerciseId: string): Promise<number | null> {
    // Check cache first
    const cached = this.getCachedKey(this.exerciseKeyCache, exerciseId);
    if (cached !== null) {
      return cached;
    }

    // In production: Query DW dim_exercise table
    // For now, create a new key (assuming exercise exists)
    const newKey = this.exerciseKeyCounter++;

    // Cache the result
    this.setCachedKey(this.exerciseKeyCache, exerciseId, newKey);

    return newKey;
  }

  /**
   * Get module surrogate key
   * @param moduleId - Natural key (UUID) from OLTP
   * @returns Promise with surrogate key (or null if not found)
   */
  async getModuleKey(moduleId: string): Promise<number | null> {
    // Check cache first
    const cached = this.getCachedKey(this.moduleKeyCache, moduleId);
    if (cached !== null) {
      return cached;
    }

    // In production: Query DW dim_module table
    const newKey = this.moduleKeyCounter++;

    // Cache the result
    this.setCachedKey(this.moduleKeyCache, moduleId, newKey);

    return newKey;
  }

  /**
   * Get achievement surrogate key
   * @param achievementId - Natural key (UUID) from OLTP
   * @returns Promise with surrogate key (or null if not found)
   */
  async getAchievementKey(achievementId: string): Promise<number | null> {
    // Check cache first
    const cached = this.getCachedKey(this.achievementKeyCache, achievementId);
    if (cached !== null) {
      return cached;
    }

    // In production: Query DW dim_achievement table
    const newKey = this.achievementKeyCounter++;

    // Cache the result
    this.setCachedKey(this.achievementKeyCache, achievementId, newKey);

    return newKey;
  }

  /**
   * Get rank surrogate key
   * @param rankName - Maya rank name
   * @returns Promise with surrogate key (or null if not found)
   */
  async getRankKey(rankName: string): Promise<number | null> {
    // Normalize rank name for consistency
    const normalizedRank = rankName.toLowerCase().trim();

    // Check cache first
    const cached = this.getCachedKey(this.rankKeyCache, normalizedRank);
    if (cached !== null) {
      return cached;
    }

    // In production: Query DW dim_rank table
    const newKey = this.rankKeyCounter++;

    // Cache the result
    this.setCachedKey(this.rankKeyCache, normalizedRank, newKey);

    return newKey;
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.studentKeyCache.clear();
    this.exerciseKeyCache.clear();
    this.moduleKeyCache.clear();
    this.achievementKeyCache.clear();
    this.rankKeyCache.clear();
    this.logger.log('All dimension caches cleared');
  }

  /**
   * Get cache statistics
   * @returns Cache statistics object
   */
  getCacheStats(): Record<string, { size: number; hitRate: number }> {
    return {
      student: { size: this.studentKeyCache.size, hitRate: 0 },
      exercise: { size: this.exerciseKeyCache.size, hitRate: 0 },
      module: { size: this.moduleKeyCache.size, hitRate: 0 },
      achievement: { size: this.achievementKeyCache.size, hitRate: 0 },
      rank: { size: this.rankKeyCache.size, hitRate: 0 },
    };
  }

  /**
   * Bulk load student keys into cache
   * @param students - Array of {naturalKey, surrogateKey} pairs
   */
  async preloadStudentKeys(
    students: Array<{ naturalKey: string; surrogateKey: number }>,
  ): Promise<void> {
    for (const student of students) {
      this.setCachedKey(this.studentKeyCache, student.naturalKey, student.surrogateKey);
    }
    this.logger.log(`Preloaded ${students.length} student keys into cache`);
  }

  /**
   * Bulk load exercise keys into cache
   * @param exercises - Array of {naturalKey, surrogateKey} pairs
   */
  async preloadExerciseKeys(
    exercises: Array<{ naturalKey: string; surrogateKey: number }>,
  ): Promise<void> {
    for (const exercise of exercises) {
      this.setCachedKey(this.exerciseKeyCache, exercise.naturalKey, exercise.surrogateKey);
    }
    this.logger.log(`Preloaded ${exercises.length} exercise keys into cache`);
  }

  // ==========================================
  // PRIVATE HELPER METHODS
  // ==========================================

  /**
   * Get cached key if valid
   * @param cache - Cache map to check
   * @param naturalKey - Natural key to look up
   * @returns Cached key or null if not found/expired
   */
  private getCachedKey(
    cache: Map<string, CacheEntry>,
    naturalKey: string,
  ): number | null {
    const entry = cache.get(naturalKey);
    if (!entry) return null;

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      cache.delete(naturalKey);
      return null;
    }

    return entry.key;
  }

  /**
   * Set cached key with TTL
   * @param cache - Cache map to update
   * @param naturalKey - Natural key
   * @param surrogateKey - Surrogate key to cache
   */
  private setCachedKey(
    cache: Map<string, CacheEntry>,
    naturalKey: string,
    surrogateKey: number,
  ): void {
    cache.set(naturalKey, {
      key: surrogateKey,
      expiresAt: Date.now() + this.CACHE_TTL_MS,
    });
  }

  /**
   * Clean expired cache entries
   * @param cache - Cache map to clean
   */
  private cleanExpiredEntries(cache: Map<string, CacheEntry>): void {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
      if (now > entry.expiresAt) {
        cache.delete(key);
      }
    }
  }

  /**
   * Periodic cache cleanup (called by scheduler)
   */
  cleanupCaches(): void {
    this.cleanExpiredEntries(this.studentKeyCache);
    this.cleanExpiredEntries(this.exerciseKeyCache);
    this.cleanExpiredEntries(this.moduleKeyCache);
    this.cleanExpiredEntries(this.achievementKeyCache);
    this.cleanExpiredEntries(this.rankKeyCache);
    this.logger.debug('Cache cleanup completed');
  }
}
