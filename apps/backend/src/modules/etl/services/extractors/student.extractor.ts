/**
 * Student Extractor
 *
 * @description Extracts student data from OLTP source tables for SCD Type 2 dimension
 * @module etl/services/extractors
 * @version 1.0.0
 * @since Sprint 2.2 - ETL Pipeline Extraction
 *
 * Source Tables:
 * - auth_management.profiles (primary)
 * - gamification_system.user_stats (optional join for rank)
 *
 * Target: Data Warehouse dim_student (SCD Type 2)
 */

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner, SelectQueryBuilder } from 'typeorm';
import { ExtractorBaseService } from '../extractor-base.service';
import { ExtractionConfig } from '../../interfaces';

/**
 * Student Data Interface
 *
 * @description Shape of extracted student data
 */
export interface StudentData {
  /** Student/profile ID */
  student_id: string;
  /** Auth user ID (may differ from profile ID) */
  user_id: string | null;
  /** Tenant ID */
  tenant_id: string;
  /** Email address */
  email: string;
  /** Full display name */
  full_name: string | null;
  /** First name */
  first_name: string | null;
  /** Last name */
  last_name: string | null;
  /** Grade level (e.g., '3rd', '4th') */
  grade_level: string | null;
  /** Role (should be 'student') */
  role: string;
  /** Account status (active, inactive, etc.) */
  status: string;
  /** School ID if assigned */
  school_id: string | null;
  /** Current Maya rank */
  current_rank: string | null;
  /** Current level */
  current_level: number | null;
  /** Total XP */
  total_xp: number | null;
  /** When the profile was created */
  created_at: Date;
  /** When the profile was last updated */
  updated_at: Date;
  /** Last login timestamp */
  last_sign_in_at: Date | null;
  /** Last activity timestamp */
  last_activity_at: Date | null;
}

/**
 * StudentExtractor
 *
 * @description Extractor for student dimension data.
 * Filters to only extract profiles with role = 'student'.
 * Joins with user_stats to include gamification data.
 */
@Injectable()
export class StudentExtractor extends ExtractorBaseService<StudentData> {
  constructor(
    @InjectDataSource('auth')
    dataSource: DataSource,
  ) {
    super(
      dataSource,
      'student-extractor',
      [
        'auth_management.profiles',
        'gamification_system.user_stats',
      ],
    );
  }

  /**
   * Build the extraction query for students
   *
   * @param queryRunner - TypeORM query runner
   * @param config - Extraction configuration
   * @param startTimestamp - Start of extraction window
   * @param endTimestamp - End of extraction window
   * @returns Configured query builder
   */
  protected buildQuery(
    queryRunner: QueryRunner,
    config: ExtractionConfig,
    startTimestamp: Date,
    endTimestamp: Date,
  ): SelectQueryBuilder<StudentData> {
    const query = queryRunner.manager
      .createQueryBuilder()
      .select([
        'p.id AS student_id',
        'p.user_id AS user_id',
        'p.tenant_id AS tenant_id',
        'p.email AS email',
        'COALESCE(p.full_name, CONCAT(p.first_name, \' \', p.last_name)) AS full_name',
        'p.first_name AS first_name',
        'p.last_name AS last_name',
        'p.grade_level AS grade_level',
        'p.role AS role',
        'p.status AS status',
        'p.school_id AS school_id',
        'us.current_rank AS current_rank',
        'us.level AS current_level',
        'us.total_xp AS total_xp',
        'p.created_at AS created_at',
        'p.updated_at AS updated_at',
        'p.last_sign_in_at AS last_sign_in_at',
        'p.last_activity_at AS last_activity_at',
      ])
      .from('auth_management.profiles', 'p')
      .leftJoin(
        'gamification_system.user_stats',
        'us',
        'us.user_id = p.id',
      );

    // Filter for students only
    query.where('p.role = :role', { role: 'student' });

    // Apply CDC timestamp filter
    query.andWhere('p.updated_at >= :startTimestamp', { startTimestamp });
    query.andWhere('p.updated_at < :endTimestamp', { endTimestamp });

    // Optionally include deleted records
    if (!config.includeDeleted) {
      query.andWhere('p.status != :deletedStatus', { deletedStatus: 'deleted' });
    }

    // Apply optional tenant filter
    if (config.tenantId) {
      query.andWhere('p.tenant_id = :tenantId', { tenantId: config.tenantId });
    }

    // Apply custom filters
    if (config.filters) {
      if (config.filters['school_id']) {
        query.andWhere('p.school_id = :schoolId', {
          schoolId: config.filters['school_id'],
        });
      }
      if (config.filters['grade_level']) {
        query.andWhere('p.grade_level = :gradeLevel', {
          gradeLevel: config.filters['grade_level'],
        });
      }
      if (config.filters['status']) {
        query.andWhere('p.status = :status', {
          status: config.filters['status'],
        });
      }
    }

    // Order by updated_at for consistent CDC
    query.orderBy('p.updated_at', config.orderDirection ?? 'ASC');

    return query as unknown as SelectQueryBuilder<StudentData>;
  }
}
