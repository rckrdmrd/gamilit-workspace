/**
 * ETL Module
 *
 * @description NestJS module for ETL (Extract, Transform, Load) operations
 * @module etl
 * @version 3.0.0
 * @since Sprint 2.2 - ETL Pipeline Extraction
 * @updated Sprint 2.4 - ETL Pipeline Load
 *
 * This module provides:
 * - Data extraction from OLTP source tables (Sprint 2.2)
 * - CDC (Change Data Capture) for incremental extraction (Sprint 2.2)
 * - Data transformation and validation (Sprint 2.3)
 * - Dimension key lookups with caching (Sprint 2.3)
 * - Data loading into data warehouse (Sprint 2.4)
 * - SCD Type 2 dimension management (Sprint 2.4)
 * - Scheduled extraction jobs
 * - REST API for manual triggers and monitoring
 *
 * Source Schemas:
 * - educational_content: modules, exercises
 * - progress_tracking: exercise_attempts, module_progress
 * - gamification_system: user_points, user_achievements
 * - auth_management: profiles
 * - social_features: classrooms, teacher_classrooms
 *
 * Target Schema:
 * - data_warehouse: fact and dimension tables
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';

// Controllers
import { EtlController } from './controllers/etl.controller';
import {
  TransformController,
  ValidationController,
  CacheController,
} from './controllers/transform.controller';
import { EtlLoadController } from './controllers/etl-load.controller';

// Services - Extraction (Sprint 2.2)
import { ExtractionCoordinatorService } from './services/extraction-coordinator.service';

// Services - Transformation (Sprint 2.3)
import { TransformationCoordinatorService } from './services/transformation-coordinator.service';
import { DimensionLookupService } from './services/dimension-lookup.service';
import { DataQualityValidator } from './services/validators/data-quality.validator';
import {
  ExerciseCompletionTransformer,
  StudentTransformer,
  GamificationEventTransformer,
  DailyProgressTransformer,
} from './services/transformers';

// Services - Extractors
import {
  ExerciseCompletionExtractor,
  StudentExtractor,
  GamificationEventExtractor,
  TeacherMetricExtractor,
} from './services/extractors';

// Services - Load (Sprint 2.4)
import { LoadCoordinatorService } from './services/load-coordinator.service';
import {
  FactExerciseCompletionLoader,
  FactDailyProgressLoader,
  FactGamificationEventLoader,
  DimStudentLoader,
} from './services/loaders';

// Jobs
import { ExtractJob } from './jobs/extract.job';

/**
 * ETLModule
 *
 * @description Main module for ETL operations.
 * Registers all extractors, coordinator service, scheduled jobs, and API endpoints.
 *
 * Dependencies:
 * - ScheduleModule: For cron-based scheduled extraction
 * - ConfigModule: For environment-based configuration
 * - TypeOrmModule: For database connections (multiple datasources)
 *
 * @example
 * ```typescript
 * // Import in app.module.ts
 * @Module({
 *   imports: [ETLModule],
 * })
 * export class AppModule {}
 * ```
 */
@Module({
  imports: [
    // Schedule module for cron jobs
    ScheduleModule.forRoot(),

    // Config module for environment variables
    ConfigModule,

    // Note: TypeORM connections are injected via @InjectDataSource decorators
    // The datasources ('progress', 'auth', 'gamification', 'social', 'audit')
    // are configured in app.module.ts
  ],
  controllers: [
    // Extraction (Sprint 2.2)
    EtlController,
    // Transformation (Sprint 2.3)
    TransformController,
    ValidationController,
    CacheController,
    // Load (Sprint 2.4)
    EtlLoadController,
  ],
  providers: [
    // ============================================
    // EXTRACTION (Sprint 2.2)
    // ============================================

    // Coordinator service - orchestrates all extractors
    ExtractionCoordinatorService,

    // Individual extractors
    ExerciseCompletionExtractor,
    StudentExtractor,
    GamificationEventExtractor,
    TeacherMetricExtractor,

    // Scheduled jobs
    ExtractJob,

    // ============================================
    // TRANSFORMATION (Sprint 2.3)
    // ============================================

    // Coordinator service - orchestrates all transformers
    TransformationCoordinatorService,

    // Dimension lookup service with caching
    DimensionLookupService,

    // Data quality validator
    DataQualityValidator,

    // Individual transformers
    ExerciseCompletionTransformer,
    StudentTransformer,
    GamificationEventTransformer,
    DailyProgressTransformer,

    // ============================================
    // LOAD (Sprint 2.4)
    // ============================================

    // Load coordinator service
    LoadCoordinatorService,

    // Fact loaders
    FactExerciseCompletionLoader,
    FactDailyProgressLoader,
    FactGamificationEventLoader,

    // Dimension loaders
    DimStudentLoader,
  ],
  exports: [
    // ============================================
    // EXTRACTION EXPORTS (Sprint 2.2)
    // ============================================

    // Export coordinator for use in other modules if needed
    ExtractionCoordinatorService,

    // Export job for status queries
    ExtractJob,

    // Export extractors for direct usage
    ExerciseCompletionExtractor,
    StudentExtractor,
    GamificationEventExtractor,
    TeacherMetricExtractor,

    // ============================================
    // TRANSFORMATION EXPORTS (Sprint 2.3)
    // ============================================

    // Export coordinator for orchestration
    TransformationCoordinatorService,

    // Export dimension lookup for DW operations
    DimensionLookupService,

    // Export validator for data quality checks
    DataQualityValidator,

    // Export transformers for direct usage
    ExerciseCompletionTransformer,
    StudentTransformer,
    GamificationEventTransformer,
    DailyProgressTransformer,

    // ============================================
    // LOAD EXPORTS (Sprint 2.4)
    // ============================================

    // Export coordinator for orchestration
    LoadCoordinatorService,

    // Export loaders for direct usage
    FactExerciseCompletionLoader,
    FactDailyProgressLoader,
    FactGamificationEventLoader,
    DimStudentLoader,
  ],
})
export class ETLModule {}
