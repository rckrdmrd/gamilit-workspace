/**
 * Feature Store Service
 *
 * @description Central service for feature management, caching, and orchestration.
 * Coordinates feature extraction from specialized services and manages Redis caching.
 *
 * Responsibilities:
 * - Orchestrate feature extraction from all feature services
 * - Cache computed features in Redis (TTL: 1 hour)
 * - Batch feature generation for training
 * - Real-time feature generation for inference
 * - Feature versioning support
 *
 * @module ML
 * @sprint 3.1 - Feature Engineering for ML Predictions
 * @created 2026-02-03
 */

import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  Feature,
  FeatureSet,
  FeatureConfig,
  FeatureCategory,
  FeatureSchema,
  BatchFeatureResult,
} from '../interfaces';
import {
  StudentFeaturesService,
  EngagementFeaturesService,
  PerformanceFeaturesService,
  TemporalFeaturesService,
} from './feature-engineering';

/**
 * Feature Store Service
 *
 * Central service for managing ML features with caching support.
 */
@Injectable()
export class FeatureStoreService {
  private readonly logger = new Logger(FeatureStoreService.name);

  /** Current feature schema version */
  private readonly FEATURE_VERSION = '1.0.0';

  /** Cache TTL in seconds (1 hour) */
  private readonly CACHE_TTL_SECONDS = 3600;

  /** Cache key prefix */
  private readonly CACHE_PREFIX = 'ml:features:';

  /** Maximum concurrent batch extractions */
  private readonly MAX_CONCURRENCY = 10;

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly studentFeaturesService: StudentFeaturesService,
    private readonly engagementFeaturesService: EngagementFeaturesService,
    private readonly performanceFeaturesService: PerformanceFeaturesService,
    private readonly temporalFeaturesService: TemporalFeaturesService,
  ) {}

  /**
   * Generate features for a single student
   *
   * @param studentId - Student identifier (profiles.id)
   * @param config - Feature generation configuration
   * @returns Complete feature set for the student
   */
  async generateFeatures(
    studentId: string,
    config: FeatureConfig,
  ): Promise<FeatureSet> {
    const startTime = Date.now();
    this.logger.debug(`Generating features for student: ${studentId}`);

    // Check cache first
    const cacheKey = this.buildCacheKey(studentId, config);
    const cachedFeatures = await this.getCachedFeatures(cacheKey);

    if (cachedFeatures) {
      this.logger.debug(`Cache hit for ${studentId}`);
      return cachedFeatures;
    }

    this.logger.debug(`Cache miss for ${studentId}, extracting features...`);

    try {
      // Determine which categories to include
      const categories = this.resolveCategories(config.includeCategories);

      // Calculate date range
      const dateRange = config.dateRange
        ? {
            start: new Date(config.dateRange.start),
            end: new Date(config.dateRange.end),
          }
        : undefined;

      // Extract features from each service in parallel
      const featurePromises: Promise<Feature[]>[] = [];

      if (categories.includes('student')) {
        featurePromises.push(
          this.studentFeaturesService.extractFeatures(
            studentId,
            config.lookbackDays,
            dateRange,
          ),
        );
      }

      if (categories.includes('engagement')) {
        featurePromises.push(
          this.engagementFeaturesService.extractFeatures(
            studentId,
            config.lookbackDays,
            dateRange,
          ),
        );
      }

      if (categories.includes('performance')) {
        featurePromises.push(
          this.performanceFeaturesService.extractFeatures(
            studentId,
            config.lookbackDays,
            dateRange,
          ),
        );
      }

      if (categories.includes('temporal')) {
        featurePromises.push(
          this.temporalFeaturesService.extractFeatures(
            studentId,
            config.lookbackDays,
            dateRange,
          ),
        );
      }

      // Wait for all feature extractions
      const featureArrays = await Promise.all(featurePromises);

      // Flatten and deduplicate features
      const allFeatures = featureArrays.flat();

      // Apply normalization if requested (features may already be normalized)
      const features = config.normalize
        ? this.ensureNormalization(allFeatures)
        : allFeatures;

      // Build feature set
      const generationTimeMs = Date.now() - startTime;
      const featureSet = this.buildFeatureSet(
        studentId,
        features,
        generationTimeMs,
        cacheKey,
      );

      // Cache the result
      await this.cacheFeatures(cacheKey, featureSet);

      this.logger.debug(
        `Generated ${features.length} features for ${studentId} in ${generationTimeMs}ms`,
      );

      return featureSet;
    } catch (error) {
      this.logger.error(
        `Error generating features for ${studentId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Generate features for multiple students in batch
   *
   * @param studentIds - Array of student identifiers
   * @param config - Feature generation configuration
   * @returns Batch result with feature sets and failures
   */
  async generateBatchFeatures(
    studentIds: string[],
    config: FeatureConfig,
  ): Promise<BatchFeatureResult> {
    const startTime = Date.now();
    this.logger.debug(`Generating batch features for ${studentIds.length} students`);

    const featureSets: FeatureSet[] = [];
    const failures: { studentId: string; error: string }[] = [];

    // Process in batches to avoid overwhelming the system
    const batchSize = this.MAX_CONCURRENCY;
    const batches = this.chunkArray(studentIds, batchSize);

    for (const batch of batches) {
      const batchPromises = batch.map(async (studentId) => {
        try {
          const featureSet = await this.generateFeatures(studentId, config);
          return { success: true, studentId, featureSet };
        } catch (error) {
          return {
            success: false,
            studentId,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      });

      const results = await Promise.all(batchPromises);

      for (const result of results) {
        if (result.success && 'featureSet' in result && result.featureSet) {
          featureSets.push(result.featureSet);
        } else if ('error' in result && result.error) {
          failures.push({ studentId: result.studentId, error: result.error });
        }
      }
    }

    const totalTimeMs = Date.now() - startTime;

    return {
      featureSets,
      failures,
      stats: {
        totalRequested: studentIds.length,
        successCount: featureSets.length,
        failureCount: failures.length,
        totalTimeMs,
        averageTimePerStudent:
          studentIds.length > 0 ? totalTimeMs / studentIds.length : 0,
      },
    };
  }

  /**
   * Get cached features for a student
   *
   * @param studentId - Student identifier
   * @param config - Optional config to match cache key
   * @returns Cached feature set or null
   */
  async getCachedFeaturesForStudent(
    studentId: string,
    config?: Partial<FeatureConfig>,
  ): Promise<FeatureSet | null> {
    const defaultConfig: FeatureConfig = {
      lookbackDays: 30,
      includeCategories: ['all'],
      normalize: true,
      ...config,
    };

    const cacheKey = this.buildCacheKey(studentId, defaultConfig);
    return this.getCachedFeatures(cacheKey);
  }

  /**
   * Invalidate cached features for a student
   *
   * @param studentId - Student identifier
   */
  async invalidateCache(studentId: string): Promise<void> {
    this.logger.debug(`Invalidating cache for student: ${studentId}`);

    try {
      // Invalidate all possible cache keys for this student
      const possibleConfigs: FeatureConfig[] = [
        { lookbackDays: 7, includeCategories: ['all'], normalize: true },
        { lookbackDays: 30, includeCategories: ['all'], normalize: true },
        { lookbackDays: 90, includeCategories: ['all'], normalize: true },
        { lookbackDays: 30, includeCategories: ['all'], normalize: false },
      ];

      const deletePromises = possibleConfigs.map((config) => {
        const cacheKey = this.buildCacheKey(studentId, config);
        return this.cacheManager.del(cacheKey);
      });

      await Promise.all(deletePromises);

      this.logger.debug(`Cache invalidated for student: ${studentId}`);
    } catch (error) {
      this.logger.warn(
        `Error invalidating cache for ${studentId}: ${error instanceof Error ? error.message : 'Unknown'}`,
      );
    }
  }

  /**
   * Get feature schema documentation
   *
   * @param category - Optional category filter
   * @param includeExperimental - Whether to include experimental features
   * @returns Array of feature schema definitions
   */
  getFeatureSchema(
    category?: Exclude<FeatureCategory, 'all'>,
    includeExperimental = false,
  ): FeatureSchema[] {
    const allSchemas = this.buildFeatureSchemas();

    let filtered = allSchemas;

    if (category) {
      filtered = filtered.filter((s) => s.category === category);
    }

    if (!includeExperimental) {
      filtered = filtered.filter((s) => !s.experimental);
    }

    return filtered;
  }

  /**
   * Get current feature version
   */
  getFeatureVersion(): string {
    return this.FEATURE_VERSION;
  }

  // =========================================================================
  // Private Methods
  // =========================================================================

  /**
   * Build cache key from student ID and config
   */
  private buildCacheKey(studentId: string, config: FeatureConfig): string {
    const categories = this.resolveCategories(config.includeCategories).sort().join(',');
    const normalized = config.normalize ? 'n' : 'u';
    return `${this.CACHE_PREFIX}${studentId}:${config.lookbackDays}:${categories}:${normalized}`;
  }

  /**
   * Get cached features from Redis
   */
  private async getCachedFeatures(cacheKey: string): Promise<FeatureSet | null> {
    try {
      const cached = await this.cacheManager.get<FeatureSet>(cacheKey);
      return cached || null;
    } catch (error) {
      this.logger.warn(`Cache read error: ${error instanceof Error ? error.message : 'Unknown'}`);
      return null;
    }
  }

  /**
   * Cache features in Redis
   */
  private async cacheFeatures(cacheKey: string, featureSet: FeatureSet): Promise<void> {
    try {
      await this.cacheManager.set(cacheKey, featureSet, this.CACHE_TTL_SECONDS * 1000);
    } catch (error) {
      this.logger.warn(`Cache write error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  }

  /**
   * Resolve 'all' category to specific categories
   */
  private resolveCategories(
    categories: FeatureCategory[],
  ): Exclude<FeatureCategory, 'all'>[] {
    if (categories.includes('all')) {
      return ['student', 'engagement', 'performance', 'temporal'];
    }
    return categories.filter((c) => c !== 'all') as Exclude<FeatureCategory, 'all'>[];
  }

  /**
   * Ensure all numeric features have normalization applied
   */
  private ensureNormalization(features: Feature[]): Feature[] {
    return features.map((feature) => {
      if (feature.type === 'numeric' && feature.normalized === undefined) {
        // Simple min-max normalization for features without explicit normalization
        const value = feature.value as number;
        feature.normalized = Math.max(0, Math.min(1, value / 100));
      }
      return feature;
    });
  }

  /**
   * Build feature set from extracted features
   */
  private buildFeatureSet(
    studentId: string,
    features: Feature[],
    generationTimeMs: number,
    cacheKey: string,
  ): FeatureSet {
    const numericCount = features.filter((f) => f.type === 'numeric').length;
    const categoricalCount = features.filter((f) => f.type === 'categorical').length;
    const booleanCount = features.filter((f) => f.type === 'boolean').length;

    return {
      studentId,
      timestamp: new Date(),
      features,
      metadata: {
        version: this.FEATURE_VERSION,
        generatedAt: new Date(),
        featureCount: features.length,
        numericFeatureCount: numericCount,
        categoricalFeatureCount: categoricalCount,
        booleanFeatureCount: booleanCount,
        generationTimeMs,
      },
      cacheKey,
    };
  }

  /**
   * Split array into chunks
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Build complete feature schema documentation
   */
  private buildFeatureSchemas(): FeatureSchema[] {
    return [
      // Student features
      {
        name: 'days_since_registration',
        category: 'student',
        type: 'numeric',
        description: 'Number of days since student account was created',
        range: { min: 0, max: 730 },
        source: 'data_warehouse.dim_student',
        addedInVersion: '1.0.0',
      },
      {
        name: 'current_rank_level',
        category: 'student',
        type: 'numeric',
        description: 'Maya rank level (1=Alumno to 13=Guardian)',
        range: { min: 1, max: 13 },
        source: 'data_warehouse.dim_student',
        addedInVersion: '1.0.0',
      },
      {
        name: 'total_xp',
        category: 'student',
        type: 'numeric',
        description: 'Total experience points accumulated',
        range: { min: 0, max: 100000 },
        source: 'data_warehouse.dim_student',
        addedInVersion: '1.0.0',
      },
      {
        name: 'grade_level',
        category: 'student',
        type: 'numeric',
        description: 'School grade level (6-12)',
        range: { min: 6, max: 12 },
        source: 'data_warehouse.dim_student',
        addedInVersion: '1.0.0',
      },
      {
        name: 'is_premium',
        category: 'student',
        type: 'boolean',
        description: 'Whether student has premium subscription',
        source: 'data_warehouse.dim_student',
        addedInVersion: '1.0.0',
      },
      {
        name: 'profile_completeness',
        category: 'student',
        type: 'numeric',
        description: 'Percentage of profile fields filled',
        range: { min: 0, max: 100 },
        source: 'data_warehouse.dim_student',
        addedInVersion: '1.0.0',
      },

      // Engagement features
      {
        name: 'login_frequency_7d',
        category: 'engagement',
        type: 'numeric',
        description: 'Number of logins in the last 7 days',
        range: { min: 0, max: 7 },
        source: 'data_warehouse.fact_daily_progress',
        addedInVersion: '1.0.0',
      },
      {
        name: 'login_frequency_30d',
        category: 'engagement',
        type: 'numeric',
        description: 'Number of logins in the last 30 days',
        range: { min: 0, max: 30 },
        source: 'data_warehouse.fact_daily_progress',
        addedInVersion: '1.0.0',
      },
      {
        name: 'avg_session_duration',
        category: 'engagement',
        type: 'numeric',
        description: 'Average session duration in minutes',
        range: { min: 0, max: 120 },
        source: 'data_warehouse.fact_daily_progress',
        addedInVersion: '1.0.0',
      },
      {
        name: 'streak_current',
        category: 'engagement',
        type: 'numeric',
        description: 'Current consecutive days active',
        range: { min: 0, max: 365 },
        source: 'data_warehouse.fact_daily_progress',
        addedInVersion: '1.0.0',
      },
      {
        name: 'streak_max',
        category: 'engagement',
        type: 'numeric',
        description: 'Maximum streak achieved',
        range: { min: 0, max: 365 },
        source: 'data_warehouse.fact_daily_progress',
        addedInVersion: '1.0.0',
      },
      {
        name: 'days_since_last_login',
        category: 'engagement',
        type: 'numeric',
        description: 'Days since last activity',
        range: { min: 0, max: 90 },
        source: 'data_warehouse.fact_daily_progress',
        addedInVersion: '1.0.0',
      },
      {
        name: 'weekend_activity_ratio',
        category: 'engagement',
        type: 'numeric',
        description: 'Ratio of weekend to total activity',
        range: { min: 0, max: 1 },
        source: 'data_warehouse.fact_daily_progress',
        addedInVersion: '1.0.0',
      },
      {
        name: 'preferred_time_slot',
        category: 'engagement',
        type: 'categorical',
        description: 'Most active time of day',
        possibleValues: ['morning', 'afternoon', 'evening', 'night'],
        source: 'data_warehouse.fact_daily_progress',
        addedInVersion: '1.0.0',
      },

      // Performance features
      {
        name: 'avg_score_7d',
        category: 'performance',
        type: 'numeric',
        description: 'Average score in last 7 days',
        range: { min: 0, max: 100 },
        source: 'data_warehouse.fact_exercise_completions',
        addedInVersion: '1.0.0',
      },
      {
        name: 'avg_score_30d',
        category: 'performance',
        type: 'numeric',
        description: 'Average score in last 30 days',
        range: { min: 0, max: 100 },
        source: 'data_warehouse.fact_exercise_completions',
        addedInVersion: '1.0.0',
      },
      {
        name: 'completion_rate_7d',
        category: 'performance',
        type: 'numeric',
        description: 'Exercise completion rate (7 days)',
        range: { min: 0, max: 100 },
        source: 'data_warehouse.fact_exercise_completions',
        addedInVersion: '1.0.0',
      },
      {
        name: 'improvement_trend',
        category: 'performance',
        type: 'numeric',
        description: 'Score improvement trend (slope)',
        range: { min: -10, max: 10 },
        source: 'data_warehouse.fact_exercise_completions',
        addedInVersion: '1.0.0',
      },
      {
        name: 'score_variance',
        category: 'performance',
        type: 'numeric',
        description: 'Variance in scores (consistency metric)',
        range: { min: 0, max: 1000 },
        source: 'data_warehouse.fact_exercise_completions',
        addedInVersion: '1.0.0',
      },

      // Temporal features
      {
        name: 'day_of_week_most_active',
        category: 'temporal',
        type: 'numeric',
        description: 'Most active day (0=Sunday to 6=Saturday)',
        range: { min: 0, max: 6 },
        source: 'data_warehouse.fact_exercise_completions',
        addedInVersion: '1.0.0',
      },
      {
        name: 'hour_of_day_most_active',
        category: 'temporal',
        type: 'numeric',
        description: 'Most active hour (0-23)',
        range: { min: 0, max: 23 },
        source: 'data_warehouse.fact_exercise_completions',
        addedInVersion: '1.0.0',
      },
      {
        name: 'activity_regularity_score',
        category: 'temporal',
        type: 'numeric',
        description: 'Consistency of daily activity (0=irregular, 1=very regular)',
        range: { min: 0, max: 1 },
        source: 'data_warehouse.fact_daily_progress',
        addedInVersion: '1.0.0',
      },
      {
        name: 'burst_activity_ratio',
        category: 'temporal',
        type: 'numeric',
        description: 'Ratio of activity in top 20% of days vs total (high=cramming)',
        range: { min: 0.2, max: 1 },
        source: 'data_warehouse.fact_daily_progress',
        addedInVersion: '1.0.0',
      },
    ];
  }
}
