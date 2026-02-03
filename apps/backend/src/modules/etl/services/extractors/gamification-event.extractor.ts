/**
 * Gamification Event Extractor
 *
 * @description Extracts gamification event data from OLTP source tables
 * @module etl/services/extractors
 * @version 1.0.0
 * @since Sprint 2.2 - ETL Pipeline Extraction
 *
 * Source Tables:
 * - gamification_system.ml_coins_transactions (points/coins changes)
 * - gamification_system.user_achievements (achievement unlocks)
 *
 * Target: Data Warehouse fact_gamification_events
 */

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner, SelectQueryBuilder } from 'typeorm';
import { ExtractorBaseService } from '../extractor-base.service';
import { ExtractionConfig } from '../../interfaces';

/**
 * Gamification Event Type
 */
export type GamificationEventType =
  | 'points_earned'
  | 'points_spent'
  | 'achievement_unlocked'
  | 'rank_up'
  | 'level_up';

/**
 * Gamification Event Data Interface
 *
 * @description Shape of extracted gamification event data
 */
export interface GamificationEventData {
  /** Unique event ID */
  event_id: string;
  /** Event type */
  event_type: GamificationEventType;
  /** User/student ID */
  user_id: string;
  /** Points change (positive or negative) */
  points_change: number;
  /** Achievement ID (if applicable) */
  achievement_id: string | null;
  /** Achievement name (if applicable) */
  achievement_name: string | null;
  /** Transaction type (for points events) */
  transaction_type: string | null;
  /** Reference ID (e.g., exercise_id, module_id) */
  reference_id: string | null;
  /** Reference type (e.g., 'exercise', 'module') */
  reference_type: string | null;
  /** Event timestamp */
  event_timestamp: Date;
  /** Additional metadata */
  metadata: string;
  /** Source table identifier */
  source_table: string;
}

/**
 * GamificationEventExtractor
 *
 * @description Extractor for gamification events.
 * Combines data from multiple gamification tables using UNION ALL.
 */
@Injectable()
export class GamificationEventExtractor extends ExtractorBaseService<GamificationEventData> {
  constructor(
    @InjectDataSource('gamification')
    dataSource: DataSource,
  ) {
    super(
      dataSource,
      'gamification-event-extractor',
      [
        'gamification_system.ml_coins_transactions',
        'gamification_system.user_achievements',
      ],
    );
  }

  /**
   * Build the extraction query for gamification events
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
  ): SelectQueryBuilder<GamificationEventData> {
    // Build separate queries for each source and combine with UNION ALL
    // This is done using raw SQL because TypeORM's query builder
    // doesn't support UNION ALL directly

    const tenantFilter = config.tenantId
      ? `AND EXISTS (
          SELECT 1 FROM auth_management.profiles p
          WHERE p.id = user_id AND p.tenant_id = '${config.tenantId}'
        )`
      : '';

    const unionQuery = `
      -- ML Coins Transactions (points earned/spent)
      SELECT
        mct.id::text AS event_id,
        CASE
          WHEN mct.amount >= 0 THEN 'points_earned'
          ELSE 'points_spent'
        END AS event_type,
        mct.user_id::text AS user_id,
        mct.amount AS points_change,
        NULL::text AS achievement_id,
        NULL::text AS achievement_name,
        mct.transaction_type AS transaction_type,
        mct.reference_id::text AS reference_id,
        mct.reference_type AS reference_type,
        mct.created_at AS event_timestamp,
        COALESCE(mct.metadata::text, '{}') AS metadata,
        'ml_coins_transactions' AS source_table
      FROM gamification_system.ml_coins_transactions mct
      WHERE mct.created_at >= $1
        AND mct.created_at < $2
        ${tenantFilter.replace('user_id', 'mct.user_id')}

      UNION ALL

      -- User Achievements (achievement unlocks)
      SELECT
        ua.id::text AS event_id,
        'achievement_unlocked' AS event_type,
        ua.user_id::text AS user_id,
        0 AS points_change,
        ua.achievement_id::text AS achievement_id,
        a.name AS achievement_name,
        NULL AS transaction_type,
        ua.achievement_id::text AS reference_id,
        'achievement' AS reference_type,
        COALESCE(ua.completed_at, ua.created_at) AS event_timestamp,
        COALESCE(ua.metadata::text, '{}') AS metadata,
        'user_achievements' AS source_table
      FROM gamification_system.user_achievements ua
      LEFT JOIN gamification_system.achievements a ON a.id = ua.achievement_id
      WHERE ua.is_completed = true
        AND COALESCE(ua.completed_at, ua.created_at) >= $1
        AND COALESCE(ua.completed_at, ua.created_at) < $2
        ${tenantFilter.replace('user_id', 'ua.user_id')}

      ORDER BY event_timestamp ${config.orderDirection ?? 'ASC'}
      LIMIT $3
      OFFSET $4
    `;

    // Create a query builder that executes the raw SQL
    // We use createQueryBuilder to get the proper type, but execute raw SQL
    const query = queryRunner.manager
      .createQueryBuilder()
      .select('*')
      .from(
        `(${unionQuery})`,
        'gamification_events',
      )
      .setParameters([
        startTimestamp,
        endTimestamp,
        config.batchSize,
        config.offset ?? 0,
      ]);

    return query as unknown as SelectQueryBuilder<GamificationEventData>;
  }

  /**
   * Override extract to use raw query for UNION ALL support
   */
  protected async performExtraction(
    queryRunner: QueryRunner,
    config: ExtractionConfig,
  ): Promise<{
    data: GamificationEventData[];
    rowCount: number;
    extractedAt: Date;
    startTimestamp: Date;
    endTimestamp: Date;
    hasMore: boolean;
    metadata: {
      queryTimeMs: number;
      custom: Record<string, unknown>;
    };
  }> {
    const startTimestamp = await this.determineStartTimestamp(config);
    const endTimestamp = config.endDate ?? new Date();

    this.logger.debug(
      `Extraction window: ${startTimestamp.toISOString()} to ${endTimestamp.toISOString()}`,
    );

    const queryStartTime = Date.now();

    const tenantFilter = config.tenantId
      ? `AND EXISTS (
          SELECT 1 FROM auth_management.profiles p
          WHERE p.id = sub.user_id AND p.tenant_id = $5
        )`
      : '';

    const unionQuery = `
      SELECT * FROM (
        -- ML Coins Transactions
        SELECT
          mct.id::text AS event_id,
          CASE
            WHEN mct.amount >= 0 THEN 'points_earned'
            ELSE 'points_spent'
          END AS event_type,
          mct.user_id::text AS user_id,
          mct.amount AS points_change,
          NULL::text AS achievement_id,
          NULL::text AS achievement_name,
          mct.transaction_type AS transaction_type,
          mct.reference_id::text AS reference_id,
          mct.reference_type AS reference_type,
          mct.created_at AS event_timestamp,
          COALESCE(mct.metadata::text, '{}') AS metadata,
          'ml_coins_transactions' AS source_table
        FROM gamification_system.ml_coins_transactions mct
        WHERE mct.created_at >= $1
          AND mct.created_at < $2

        UNION ALL

        -- User Achievements
        SELECT
          ua.id::text AS event_id,
          'achievement_unlocked' AS event_type,
          ua.user_id::text AS user_id,
          0 AS points_change,
          ua.achievement_id::text AS achievement_id,
          a.name AS achievement_name,
          NULL AS transaction_type,
          ua.achievement_id::text AS reference_id,
          'achievement' AS reference_type,
          COALESCE(ua.completed_at, ua.created_at) AS event_timestamp,
          COALESCE(ua.metadata::text, '{}') AS metadata,
          'user_achievements' AS source_table
        FROM gamification_system.user_achievements ua
        LEFT JOIN gamification_system.achievements a ON a.id = ua.achievement_id
        WHERE ua.is_completed = true
          AND COALESCE(ua.completed_at, ua.created_at) >= $1
          AND COALESCE(ua.completed_at, ua.created_at) < $2
      ) sub
      ${tenantFilter ? `WHERE 1=1 ${tenantFilter}` : ''}
      ORDER BY event_timestamp ${config.orderDirection ?? 'ASC'}
      LIMIT $3
      OFFSET $4
    `;

    const params: unknown[] = [
      startTimestamp,
      endTimestamp,
      config.batchSize,
      config.offset ?? 0,
    ];

    if (config.tenantId) {
      params.push(config.tenantId);
    }

    const data = await queryRunner.manager.query(unionQuery, params) as GamificationEventData[];
    const queryTime = Date.now() - queryStartTime;

    const hasMore = data.length === config.batchSize;

    return {
      data,
      rowCount: data.length,
      extractedAt: new Date(),
      startTimestamp,
      endTimestamp,
      hasMore,
      metadata: {
        queryTimeMs: queryTime,
        custom: {
          incremental: config.incremental,
          offset: config.offset ?? 0,
          sources: ['ml_coins_transactions', 'user_achievements'],
        },
      },
    };
  }
}
