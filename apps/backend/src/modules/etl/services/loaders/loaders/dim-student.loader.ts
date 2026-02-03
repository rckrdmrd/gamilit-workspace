/**
 * Dimension Student Loader - ETL Pipeline Load Phase
 *
 * @description Loads student dimension data into the data warehouse.
 * Target: data_warehouse.dim_student
 * Mode: SCD Type 2 upsert (handles versioning)
 *
 * @module ETL
 * @see TASK-2026-02-03 Sprint 2.4 - ETL Pipeline Carga
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  DimensionLoaderService,
  SCD2Config,
  DEFAULT_SCD2_CONFIG,
} from '../dimension-loader.service';
import { LoadResult, SCDLoadResult } from '../../../interfaces';

/**
 * Student Dimension Record
 *
 * @description Represents a transformed student dimension record
 */
export interface StudentDimension {
  student_key: string;
  source_user_id: string;
  source_profile_id: string;
  tenant_key?: string;

  // Demographics
  display_name: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  grade_level?: string;
  birth_year?: number;

  // Organization
  school_key?: string;
  school_name?: string;
  classroom_key?: string;
  classroom_name?: string;

  // Account info
  role: string;
  account_status: string;
  registration_date: Date;
  last_login_date?: Date;

  // Gamification state (snapshot)
  current_level: number;
  current_xp: number;
  current_rank: string;
  current_coins: number;
  total_achievements: number;

  // Preferences
  language_preference?: string;
  timezone?: string;
  theme_preference?: string;

  // Flags
  is_active: boolean;
  has_parent_link: boolean;
  email_verified: boolean;

  // Metadata
  extracted_at: Date;
}

/**
 * Dimension Student Loader
 *
 * @description Loads student dimension with SCD Type 2 versioning.
 * Tracks changes in key attributes over time.
 */
@Injectable()
export class DimStudentLoader extends DimensionLoaderService<StudentDimension> {
  protected readonly logger = new Logger(DimStudentLoader.name);
  protected readonly targetSchema = 'data_warehouse';
  protected readonly targetTable = 'dim_student';
  protected readonly defaultBatchSize = 500;

  constructor(
    @InjectDataSource('data_warehouse')
    protected readonly dataSource: DataSource,
  ) {
    super();
  }

  /**
   * Get SCD2 configuration
   */
  protected getSCD2Config(): SCD2Config {
    return {
      ...DEFAULT_SCD2_CONFIG,
      naturalKeyColumns: ['source_profile_id'],
      trackedColumns: [
        'display_name',
        'email',
        'first_name',
        'last_name',
        'grade_level',
        'school_key',
        'school_name',
        'classroom_key',
        'classroom_name',
        'role',
        'account_status',
        'current_level',
        'current_rank',
        'is_active',
        'has_parent_link',
      ],
      effectiveFromColumn: 'effective_from',
      effectiveToColumn: 'effective_to',
      isCurrentColumn: 'is_current',
      surrogateKeyColumn: 'student_key',
    };
  }

  /**
   * Get columns for insert
   */
  protected getInsertColumns(): string[] {
    return [
      'student_key',
      'source_user_id',
      'source_profile_id',
      'tenant_key',
      'display_name',
      'email',
      'first_name',
      'last_name',
      'grade_level',
      'birth_year',
      'school_key',
      'school_name',
      'classroom_key',
      'classroom_name',
      'role',
      'account_status',
      'registration_date',
      'last_login_date',
      'current_level',
      'current_xp',
      'current_rank',
      'current_coins',
      'total_achievements',
      'language_preference',
      'timezone',
      'theme_preference',
      'is_active',
      'has_parent_link',
      'email_verified',
      'extracted_at',
      'effective_from',
      'effective_to',
      'is_current',
    ];
  }

  /**
   * Map a record to values for insert
   */
  protected mapRecordToValues(record: StudentDimension): unknown[] {
    return [
      record.student_key,
      record.source_user_id,
      record.source_profile_id,
      record.tenant_key || null,
      record.display_name,
      record.email || null,
      record.first_name || null,
      record.last_name || null,
      record.grade_level || null,
      record.birth_year || null,
      record.school_key || null,
      record.school_name || null,
      record.classroom_key || null,
      record.classroom_name || null,
      record.role,
      record.account_status,
      record.registration_date,
      record.last_login_date || null,
      record.current_level,
      record.current_xp,
      record.current_rank,
      record.current_coins,
      record.total_achievements,
      record.language_preference || null,
      record.timezone || null,
      record.theme_preference || null,
      record.is_active,
      record.has_parent_link,
      record.email_verified,
      record.extracted_at,
      new Date(), // effective_from
      null, // effective_to
      true, // is_current
    ];
  }

  /**
   * Load student dimension with SCD Type 2
   *
   * @description Main entry point. Handles versioning:
   * - New students get inserted with is_current=true
   * - Changed students get new version, old version expires
   * - Unchanged students are skipped
   */
  async loadStudentDimension(data: StudentDimension[]): Promise<SCDLoadResult> {
    this.logger.log(
      `Loading ${data.length} student dimension records (SCD Type 2)`,
    );

    const config = this.getSCD2Config();
    return this.loadWithSCD2(data, config.naturalKeyColumns);
  }

  /**
   * Simple load without SCD (for initial bulk load)
   */
  async bulkLoadStudents(data: StudentDimension[]): Promise<LoadResult> {
    this.logger.log(
      `Bulk loading ${data.length} student dimension records`,
    );
    return this.simpleUpsert(data, ['source_profile_id']);
  }

  /**
   * Get current student key for a source profile ID
   */
  async getCurrentStudentKey(sourceProfileId: string): Promise<string | null> {
    const result = await this.dataSource.query(
      `SELECT student_key FROM ${this.targetSchema}.${this.targetTable}
       WHERE source_profile_id = $1 AND is_current = true`,
      [sourceProfileId],
    );
    return result.length > 0 ? result[0].student_key : null;
  }

  /**
   * Get student key mapping for multiple profile IDs
   */
  async getStudentKeyMapping(
    profileIds: string[],
  ): Promise<Map<string, string>> {
    if (profileIds.length === 0) return new Map();

    const placeholders = profileIds.map((_, i) => `$${i + 1}`).join(', ');
    const result = await this.dataSource.query(
      `SELECT source_profile_id, student_key
       FROM ${this.targetSchema}.${this.targetTable}
       WHERE source_profile_id IN (${placeholders}) AND is_current = true`,
      profileIds,
    );

    const mapping = new Map<string, string>();
    result.forEach((row: { source_profile_id: string; student_key: string }) => {
      mapping.set(row.source_profile_id, row.student_key);
    });
    return mapping;
  }
}
