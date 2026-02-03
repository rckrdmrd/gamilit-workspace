/**
 * Student Transformer
 *
 * @description Transforms OLTP student profiles to DW dimension format
 * with SCD Type 2 (Slowly Changing Dimension) logic.
 * Tracks changes in rank and level attributes with effective dates.
 *
 * @module etl/services/transformers
 * @since 2026-02-03
 */

import { Injectable } from '@nestjs/common';
import {
  TransformerBaseService,
  PreValidationResult,
  validResult,
  invalidResult,
} from './transformer-base.service';
import {
  ValidationResult,
  ValidationSeverity,
} from '../../interfaces/validation-result.interface';
import { DataQualityValidator } from '../validators/data-quality.validator';
import { DimensionLookupService } from '../dimension-lookup.service';
import { TransformerConfig, SCDChange } from '../../interfaces';

/**
 * Source: OLTP Student Profile + Stats
 */
export interface StudentProfileSource {
  id: string;
  tenant_id: string;
  display_name: string | null;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string;
  avatar_url: string | null;
  grade_level: string | null;
  student_id: string | null;
  school_id: string | null;
  role: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  // From user_stats
  level: number;
  total_xp: number;
  current_rank: string;
  ml_coins: number;
  exercises_completed: number;
  modules_completed: number;
  current_streak: number;
  max_streak: number;
}

/**
 * Target: DW Dimension Student Record (SCD Type 2)
 */
export interface DimStudent {
  /** Surrogate key */
  student_key: number;
  /** Natural key from OLTP */
  student_id: string;
  /** Tenant for multi-tenancy */
  tenant_id: string;
  /** Display name (processed) */
  display_name: string;
  /** Full name (processed) */
  full_name: string;
  /** First name (processed) */
  first_name: string;
  /** Last name (processed) */
  last_name: string;
  /** Email (lowercase) */
  email: string;
  /** Grade level */
  grade_level: string | null;
  /** School ID */
  school_id: string | null;
  /** Current level (SCD tracked) */
  level: number;
  /** Current rank (SCD tracked) */
  current_rank: string;
  /** Total XP */
  total_xp: number;
  /** ML Coins balance */
  ml_coins: number;
  /** Exercises completed */
  exercises_completed: number;
  /** Modules completed */
  modules_completed: number;
  /** Current streak */
  current_streak: number;
  /** Max streak achieved */
  max_streak: number;
  /** Account status */
  status: string;
  /** SCD Type 2: Effective from date */
  effective_date: Date;
  /** SCD Type 2: Expiration date (null = current) */
  expiration_date: Date | null;
  /** SCD Type 2: Is this the current record */
  is_current: boolean;
  /** Version number for this student */
  version_number: number;
  /** ETL batch ID */
  etl_batch_id: string;
  /** ETL load timestamp */
  etl_loaded_at: Date;
}

/**
 * SCD Type 2 Tracked Fields
 * Changes to these fields create new dimension records
 */
const SCD_TRACKED_FIELDS = ['level', 'current_rank'] as const;

/**
 * StudentTransformer
 * @description Transforms student profiles with SCD Type 2 handling
 */
@Injectable()
export class StudentTransformer extends TransformerBaseService<
  StudentProfileSource,
  DimStudent
> {
  private studentKeyCounter = 200000;
  private currentBatchId = '';

  // In-memory store for existing dimension records (in production, query DW)
  private existingDimensions = new Map<
    string,
    { record: DimStudent; version: number }
  >();

  constructor(
    private readonly validator: DataQualityValidator,
    private readonly dimensionLookup: DimensionLookupService,
    config?: Partial<TransformerConfig>,
  ) {
    super('StudentTransformer', config);
  }

  /**
   * Validate source data before transformation
   */
  validate(data: StudentProfileSource[]): ValidationResult {
    return this.validator.validate(data, {
      rules: [
        // Required fields
        DataQualityValidator.requiredRule('id'),
        DataQualityValidator.requiredRule('tenant_id'),
        DataQualityValidator.requiredRule('email'),

        // UUID validations
        DataQualityValidator.uuidRule('id'),
        DataQualityValidator.uuidRule('tenant_id'),

        // Type validations
        DataQualityValidator.typeRule('email', 'string'),
        DataQualityValidator.typeRule('level', 'number', ValidationSeverity.WARNING),
        DataQualityValidator.typeRule('total_xp', 'number', ValidationSeverity.WARNING),

        // Range validations
        DataQualityValidator.rangeRule('level', 1, 100, ValidationSeverity.WARNING),
        DataQualityValidator.rangeRule('total_xp', 0, undefined, ValidationSeverity.WARNING),
        DataQualityValidator.rangeRule('ml_coins', 0, undefined, ValidationSeverity.WARNING),
        DataQualityValidator.rangeRule('exercises_completed', 0, undefined, ValidationSeverity.WARNING),
        DataQualityValidator.rangeRule('current_streak', 0, 365, ValidationSeverity.WARNING),
      ],
      duplicateKeyFields: ['id'],
      failFast: false,
      maxErrors: 500,
      referenceTables: {
        tenant_id: 'auth_management.tenants',
        school_id: 'social_features.schools',
      },
    });
  }

  /**
   * Validate a single record before transformation
   */
  protected validateRecord(record: StudentProfileSource): PreValidationResult {
    if (!record.id) {
      return invalidResult('Missing student ID', 'MISSING_ID', 'id');
    }

    if (!record.email) {
      return invalidResult('Missing email', 'MISSING_EMAIL', 'email');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(record.email)) {
      return invalidResult('Invalid email format', 'INVALID_EMAIL', 'email');
    }

    if (!record.tenant_id) {
      return invalidResult('Missing tenant ID', 'MISSING_TENANT_ID', 'tenant_id');
    }

    // Validate role is student
    if (record.role && record.role !== 'student') {
      return invalidResult(
        'Only student profiles should be transformed',
        'INVALID_ROLE',
        'role',
      );
    }

    return validResult();
  }

  /**
   * Transform a single student record with SCD Type 2 logic
   */
  protected async transformRecord(
    record: StudentProfileSource,
  ): Promise<DimStudent | null> {
    // Check for existing dimension record
    const existing = this.existingDimensions.get(record.id);
    const now = new Date();

    // Detect SCD changes
    if (existing) {
      const changes = this.detectSCDChanges(record, existing.record);

      if (changes.length > 0) {
        // Log the changes
        this.logger.log(
          `SCD changes detected for student ${record.id}: ${changes.map((c) => c.changedField).join(', ')}`,
        );

        // Create new version (expire old record would happen during load)
        const newVersion = existing.version + 1;
        const newKey = this.studentKeyCounter++;

        const dimStudent = this.createDimStudent(record, newKey, now, null, true, newVersion);

        // Update cache
        this.existingDimensions.set(record.id, {
          record: dimStudent,
          version: newVersion,
        });

        return dimStudent;
      }

      // No changes, skip (or optionally update non-SCD fields)
      return null;
    }

    // New student - create first version
    const studentKey = this.studentKeyCounter++;
    const dimStudent = this.createDimStudent(record, studentKey, now, null, true, 1);

    // Cache the new record
    this.existingDimensions.set(record.id, { record: dimStudent, version: 1 });

    return dimStudent;
  }

  /**
   * Create a dimension student record
   */
  private createDimStudent(
    source: StudentProfileSource,
    studentKey: number,
    effectiveDate: Date,
    expirationDate: Date | null,
    isCurrent: boolean,
    version: number,
  ): DimStudent {
    return {
      student_key: studentKey,
      student_id: source.id,
      tenant_id: source.tenant_id,
      display_name: this.normalizeString(source.display_name || ''),
      full_name: this.normalizeString(source.full_name || ''),
      first_name: this.normalizeString(source.first_name || ''),
      last_name: this.normalizeString(source.last_name || ''),
      email: source.email.toLowerCase().trim(),
      grade_level: source.grade_level,
      school_id: source.school_id,
      level: this.withDefault(source.level, 1),
      current_rank: source.current_rank || 'Ajaw',
      total_xp: this.withDefault(source.total_xp, 0),
      ml_coins: this.withDefault(source.ml_coins, 0),
      exercises_completed: this.withDefault(source.exercises_completed, 0),
      modules_completed: this.withDefault(source.modules_completed, 0),
      current_streak: this.withDefault(source.current_streak, 0),
      max_streak: this.withDefault(source.max_streak, 0),
      status: source.status || 'active',
      effective_date: effectiveDate,
      expiration_date: expirationDate,
      is_current: isCurrent,
      version_number: version,
      etl_batch_id: this.currentBatchId,
      etl_loaded_at: new Date(),
    };
  }

  /**
   * Detect SCD Type 2 changes between source and existing dimension
   */
  private detectSCDChanges(
    source: StudentProfileSource,
    existing: DimStudent,
  ): SCDChange[] {
    const changes: SCDChange[] = [];
    const now = new Date();

    for (const field of SCD_TRACKED_FIELDS) {
      const sourceValue = source[field];
      const existingValue = existing[field];

      if (sourceValue !== existingValue) {
        changes.push({
          studentId: source.id,
          changedField: field,
          oldValue: existingValue,
          newValue: sourceValue,
          detectedAt: now,
        });
      }
    }

    return changes;
  }

  /**
   * Override transform to set batch ID
   */
  async transform(
    data: StudentProfileSource[],
    batchId: string,
  ): Promise<import('../../interfaces').TransformationResult<DimStudent>> {
    this.currentBatchId = batchId;
    return super.transform(data, batchId);
  }

  /**
   * Load existing dimension records for SCD comparison
   * @param existingRecords - Records from DW dim_student table
   */
  loadExistingDimensions(
    existingRecords: Array<{ student_id: string; record: DimStudent; version: number }>,
  ): void {
    this.existingDimensions.clear();
    for (const rec of existingRecords) {
      this.existingDimensions.set(rec.student_id, {
        record: rec.record,
        version: rec.version,
      });
    }
    this.logger.log(`Loaded ${existingRecords.length} existing dimension records`);
  }

  /**
   * Get records that need expiration (old versions)
   * @returns Array of student keys to expire
   */
  getRecordsToExpire(): number[] {
    // In a real implementation, this would return keys of records
    // whose is_current should be set to false
    return [];
  }
}
