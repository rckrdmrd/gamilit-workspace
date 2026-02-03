/**
 * Student Features Service
 *
 * @description Extracts features from dim_student dimension table.
 * Includes profile attributes, registration info, and current gamification state.
 *
 * Features extracted:
 * - days_since_registration: Account age in days
 * - current_rank_level: Maya rank (1-13)
 * - total_xp: Total experience points
 * - grade_level: School grade
 * - is_premium: Subscription status
 * - profile_completeness: Percentage of profile filled
 *
 * @module ML
 * @sprint 3.1 - Feature Engineering for ML Predictions
 * @created 2026-02-03
 */

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Feature, FeatureCategory } from '../../interfaces';
import { FeatureBaseService } from './feature-base.service';

/**
 * Service for extracting student profile features from dim_student
 */
@Injectable()
export class StudentFeaturesService extends FeatureBaseService {
  protected readonly category: FeatureCategory = 'student';

  /** Maya rank to numeric level mapping */
  private readonly rankLevelMap: Record<string, number> = {
    'Alumno': 1,
    'Aprendiz': 2,
    'Estudiante': 3,
    'Erudito': 4,
    'Explorador': 5,
    'Investigador': 6,
    'Artesano': 7,
    'Creador': 8,
    'Innovador': 9,
    'Experto': 10,
    'Maestro': 11,
    'Sabio': 12,
    'Guardian': 13,
  };

  constructor(
    @InjectDataSource('auth')
    private readonly dataSource: DataSource,
  ) {
    super(StudentFeaturesService.name);
  }

  /**
   * Extract student profile features
   *
   * @param studentId - Student identifier (profiles.id)
   * @param lookbackDays - Not used for student features (point-in-time)
   * @param _dateRange - Not used for student features
   * @returns Array of student features
   */
  async extractFeatures(
    studentId: string,
    lookbackDays: number,
    _dateRange?: { start: Date; end: Date },
  ): Promise<Feature[]> {
    this.logger.debug(`Extracting student features for: ${studentId}`);

    try {
      // Query dim_student for current student state
      const studentData = await this.queryStudentData(studentId);

      if (!studentData) {
        this.logger.warn(`Student ${studentId} not found in data warehouse`);
        return this.getDefaultFeatures();
      }

      const features: Feature[] = [];

      // Feature: days_since_registration
      features.push(
        this.createNumericFeature(
          'days_since_registration',
          studentData.days_since_registration,
          'Number of days since student account was created',
          'days',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 730, mean: 180, std: 90, q1: 30, q3: 365 },
          },
        ),
      );

      // Feature: current_rank_level
      const rankLevel = this.rankLevelMap[studentData.current_rank] || 1;
      features.push(
        this.createNumericFeature(
          'current_rank_level',
          rankLevel,
          'Maya rank level (1=Alumno to 13=Guardian)',
          'level',
          true,
          {
            method: 'min-max',
            stats: { min: 1, max: 13, mean: 4, std: 2.5, q1: 2, q3: 6 },
          },
        ),
      );

      // Feature: current_rank (categorical)
      features.push(
        this.createCategoricalFeature(
          'current_rank',
          studentData.current_rank || 'Alumno',
          'Maya rank name',
          Object.keys(this.rankLevelMap),
        ),
      );

      // Feature: total_xp
      features.push(
        this.createNumericFeature(
          'total_xp',
          studentData.total_xp,
          'Total experience points accumulated',
          'XP',
          true,
          {
            method: 'robust',
            stats: { min: 0, max: 100000, mean: 5000, std: 8000, q1: 500, q3: 10000 },
          },
        ),
      );

      // Feature: current_level
      features.push(
        this.createNumericFeature(
          'current_level',
          studentData.current_level,
          'Current player level',
          'level',
          true,
          {
            method: 'min-max',
            stats: { min: 1, max: 100, mean: 15, std: 12, q1: 5, q3: 25 },
          },
        ),
      );

      // Feature: ml_coins_balance
      features.push(
        this.createNumericFeature(
          'ml_coins_balance',
          studentData.ml_coins_balance,
          'Current ML Coins balance',
          'coins',
          true,
          {
            method: 'robust',
            stats: { min: 0, max: 50000, mean: 2000, std: 3000, q1: 200, q3: 4000 },
          },
        ),
      );

      // Feature: grade_level (parsed from text)
      const gradeLevel = this.parseGradeLevel(studentData.grade_level);
      features.push(
        this.createNumericFeature(
          'grade_level',
          gradeLevel,
          'School grade level (6-12)',
          'grade',
          true,
          {
            method: 'min-max',
            stats: { min: 6, max: 12, mean: 8, std: 1.5, q1: 7, q3: 9 },
          },
        ),
      );

      // Feature: is_premium
      features.push(
        this.createBooleanFeature(
          'is_premium',
          studentData.is_premium || false,
          'Whether student has premium subscription',
        ),
      );

      // Feature: is_active
      features.push(
        this.createBooleanFeature(
          'is_active',
          studentData.status === 'active',
          'Whether student account is active',
        ),
      );

      // Feature: profile_completeness
      const profileCompleteness = this.calculateProfileCompleteness(studentData);
      features.push(
        this.createNumericFeature(
          'profile_completeness',
          profileCompleteness,
          'Percentage of profile fields filled',
          '%',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 100, mean: 60, std: 25, q1: 40, q3: 80 },
          },
        ),
      );

      // Feature: has_school_association
      features.push(
        this.createBooleanFeature(
          'has_school_association',
          !!studentData.school_id,
          'Whether student is associated with a school',
        ),
      );

      // Feature: days_since_first_activity
      features.push(
        this.createNumericFeature(
          'days_since_first_activity',
          studentData.days_since_first_activity,
          'Days since first recorded activity',
          'days',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 365, mean: 90, std: 60, q1: 30, q3: 180 },
          },
        ),
      );

      this.logger.debug(
        `Extracted ${features.length} student features for ${studentId}`,
      );

      return features;
    } catch (error) {
      this.logger.error(
        `Error extracting student features for ${studentId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return this.getDefaultFeatures();
    }
  }

  /**
   * Query student data from data warehouse
   */
  private async queryStudentData(studentId: string): Promise<any | null> {
    // First try to get from data warehouse dim_student
    const dwQuery = `
      SELECT
        ds.student_id,
        ds.display_name,
        ds.email,
        ds.grade_level,
        ds.school_id,
        ds.school_name,
        ds.current_rank,
        ds.current_level,
        ds.total_xp,
        ds.ml_coins_balance,
        ds.status,
        ds.registration_date,
        ds.first_activity_date,
        ds.last_activity_date,
        EXTRACT(DAY FROM (CURRENT_DATE - ds.registration_date)) AS days_since_registration,
        EXTRACT(DAY FROM (CURRENT_DATE - ds.first_activity_date)) AS days_since_first_activity,
        ds.avatar_url IS NOT NULL AS has_avatar
      FROM data_warehouse.dim_student ds
      WHERE ds.student_id = $1
        AND ds.is_current = true
      LIMIT 1
    `;

    try {
      const result = await this.dataSource.query(dwQuery, [studentId]);

      if (result && result.length > 0) {
        return result[0];
      }
    } catch (error) {
      this.logger.debug(
        `Data warehouse query failed, falling back to operational data: ${error instanceof Error ? error.message : 'Unknown'}`,
      );
    }

    // Fallback: Query operational tables directly
    const opQuery = `
      SELECT
        p.id AS student_id,
        p.display_name,
        p.email,
        p.grade_level,
        p.school_id,
        p.role,
        p.status,
        p.created_at AS registration_date,
        p.first_activity_at AS first_activity_date,
        p.last_activity_at AS last_activity_date,
        p.avatar_url,
        EXTRACT(DAY FROM (CURRENT_DATE - p.created_at::date)) AS days_since_registration,
        EXTRACT(DAY FROM (CURRENT_DATE - COALESCE(p.first_activity_at, p.created_at)::date)) AS days_since_first_activity
      FROM auth_management.profiles p
      WHERE p.id = $1
      LIMIT 1
    `;

    try {
      const opResult = await this.dataSource.query(opQuery, [studentId]);

      if (opResult && opResult.length > 0) {
        // Try to get gamification stats
        const statsQuery = `
          SELECT
            us.level AS current_level,
            us.total_xp,
            us.ml_coins AS ml_coins_balance,
            us.current_rank
          FROM gamification_system.user_stats us
          WHERE us.user_id = $1
          LIMIT 1
        `;

        try {
          const statsResult = await this.dataSource.query(statsQuery, [studentId]);
          if (statsResult && statsResult.length > 0) {
            return { ...opResult[0], ...statsResult[0] };
          }
        } catch {
          // Continue with profile data only
        }

        return opResult[0];
      }
    } catch (error) {
      this.logger.error(
        `Operational query also failed: ${error instanceof Error ? error.message : 'Unknown'}`,
      );
    }

    return null;
  }

  /**
   * Parse grade level from text to numeric
   */
  private parseGradeLevel(gradeLevel: string | null | undefined): number {
    if (!gradeLevel) return 6;

    const parsed = parseInt(gradeLevel, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 12) {
      return parsed;
    }

    // Try to extract from text
    const match = gradeLevel.match(/\d+/);
    if (match) {
      const extracted = parseInt(match[0], 10);
      if (extracted >= 1 && extracted <= 12) {
        return extracted;
      }
    }

    return 6; // Default to 6th grade
  }

  /**
   * Calculate profile completeness percentage
   */
  private calculateProfileCompleteness(studentData: any): number {
    const fields = [
      'display_name',
      'email',
      'grade_level',
      'school_id',
      'avatar_url',
    ];

    let filledCount = 0;
    for (const field of fields) {
      if (studentData[field] !== null && studentData[field] !== undefined) {
        filledCount++;
      }
    }

    return this.safePercentage(filledCount, fields.length);
  }

  /**
   * Get default features when student data is unavailable
   */
  private getDefaultFeatures(): Feature[] {
    return [
      this.createNumericFeature('days_since_registration', 0, 'Account age', 'days'),
      this.createNumericFeature('current_rank_level', 1, 'Maya rank level', 'level'),
      this.createCategoricalFeature('current_rank', 'Alumno', 'Maya rank name'),
      this.createNumericFeature('total_xp', 0, 'Total XP', 'XP'),
      this.createNumericFeature('current_level', 1, 'Player level', 'level'),
      this.createNumericFeature('ml_coins_balance', 0, 'ML Coins', 'coins'),
      this.createNumericFeature('grade_level', 6, 'School grade', 'grade'),
      this.createBooleanFeature('is_premium', false, 'Premium status'),
      this.createBooleanFeature('is_active', true, 'Active status'),
      this.createNumericFeature('profile_completeness', 20, 'Profile completion', '%'),
      this.createBooleanFeature('has_school_association', false, 'School association'),
      this.createNumericFeature('days_since_first_activity', 0, 'Days since first activity', 'days'),
    ];
  }
}
