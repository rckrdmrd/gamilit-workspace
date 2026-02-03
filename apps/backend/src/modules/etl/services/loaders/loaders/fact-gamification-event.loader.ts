/**
 * Fact Gamification Event Loader - ETL Pipeline Load Phase
 *
 * @description Loads gamification event facts into the data warehouse.
 * Target: data_warehouse.fact_gamification_events
 * Mode: Append only (events are immutable)
 *
 * @module ETL
 * @see TASK-2026-02-03 Sprint 2.4 - ETL Pipeline Carga
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { FactLoaderService, DimensionReference } from '../fact-loader.service';
import { LoadResult } from '../../../interfaces';

/**
 * Gamification Event Types
 */
export enum GamificationFactEventType {
  XP_EARNED = 'xp_earned',
  COINS_EARNED = 'coins_earned',
  COINS_SPENT = 'coins_spent',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  LEVEL_UP = 'level_up',
  RANK_PROMOTION = 'rank_promotion',
  STREAK_MILESTONE = 'streak_milestone',
  MISSION_COMPLETED = 'mission_completed',
  COMODIN_PURCHASED = 'comodin_purchased',
  COMODIN_USED = 'comodin_used',
  SHOP_PURCHASE = 'shop_purchase',
  LEADERBOARD_CHANGE = 'leaderboard_change',
}

/**
 * Gamification Event Fact Record
 *
 * @description Represents a transformed gamification event record
 */
export interface GamificationEventFact {
  date_key: number;
  time_key: number;
  student_key: string;
  event_type_key: number;
  tenant_key?: string;

  // Event details
  event_type: GamificationFactEventType;
  event_name: string;
  event_description?: string;

  // Numeric values
  numeric_value?: number;
  previous_value?: number;
  delta_value?: number;

  // Context
  related_exercise_key?: string;
  related_module_key?: string;
  related_achievement_key?: string;
  related_mission_key?: string;
  related_item_key?: string;

  // State at event time
  level_at_event: number;
  xp_at_event: number;
  coins_at_event: number;
  rank_at_event: string;

  // Source tracking
  source_event_id?: string;
  source_table?: string;
  extracted_at: Date;
}

/**
 * Fact Gamification Event Loader
 *
 * @description Loads gamification events using append-only mode
 */
@Injectable()
export class FactGamificationEventLoader extends FactLoaderService<GamificationEventFact> {
  protected readonly logger = new Logger(FactGamificationEventLoader.name);
  protected readonly targetSchema = 'data_warehouse';
  protected readonly targetTable = 'fact_gamification_events';
  protected readonly defaultBatchSize = 1000;

  constructor(
    @InjectDataSource('data_warehouse')
    protected readonly dataSource: DataSource,
  ) {
    super();
  }

  /**
   * Define dimension references for validation
   */
  protected getDimensionReferences(): DimensionReference[] {
    return [
      {
        factColumn: 'date_key',
        dimensionTable: 'data_warehouse.dim_date',
        dimensionColumn: 'date_key',
        required: true,
      },
      {
        factColumn: 'time_key',
        dimensionTable: 'data_warehouse.dim_time',
        dimensionColumn: 'time_key',
        required: true,
      },
      {
        factColumn: 'student_key',
        dimensionTable: 'data_warehouse.dim_student',
        dimensionColumn: 'student_key',
        required: true,
      },
      {
        factColumn: 'event_type_key',
        dimensionTable: 'data_warehouse.dim_event_type',
        dimensionColumn: 'event_type_key',
        required: true,
      },
    ];
  }

  /**
   * Get columns for insert
   */
  protected getInsertColumns(): string[] {
    return [
      'date_key',
      'time_key',
      'student_key',
      'event_type_key',
      'tenant_key',
      'event_type',
      'event_name',
      'event_description',
      'numeric_value',
      'previous_value',
      'delta_value',
      'related_exercise_key',
      'related_module_key',
      'related_achievement_key',
      'related_mission_key',
      'related_item_key',
      'level_at_event',
      'xp_at_event',
      'coins_at_event',
      'rank_at_event',
      'source_event_id',
      'source_table',
      'extracted_at',
    ];
  }

  /**
   * Map a record to values for insert
   */
  protected mapRecordToValues(record: GamificationEventFact): unknown[] {
    return [
      record.date_key,
      record.time_key,
      record.student_key,
      record.event_type_key,
      record.tenant_key || null,
      record.event_type,
      record.event_name,
      record.event_description || null,
      record.numeric_value || null,
      record.previous_value || null,
      record.delta_value || null,
      record.related_exercise_key || null,
      record.related_module_key || null,
      record.related_achievement_key || null,
      record.related_mission_key || null,
      record.related_item_key || null,
      record.level_at_event,
      record.xp_at_event,
      record.coins_at_event,
      record.rank_at_event,
      record.source_event_id || null,
      record.source_table || null,
      record.extracted_at,
    ];
  }

  /**
   * Load gamification events
   *
   * @description Main entry point for loading gamification event data.
   * Events are immutable - append only.
   */
  async loadGamificationEvents(
    data: GamificationEventFact[],
    validateDimensions = true,
  ): Promise<LoadResult> {
    this.logger.log(
      `Loading ${data.length} gamification event facts`,
    );

    if (validateDimensions) {
      return this.loadWithValidation(data, { continueOnError: true });
    }

    return this.appendOnly(data);
  }

  /**
   * Load events by type (for incremental loads)
   */
  async loadEventsByType(
    data: GamificationEventFact[],
    eventType: GamificationFactEventType,
  ): Promise<LoadResult> {
    const filteredData = data.filter((e) => e.event_type === eventType);
    this.logger.log(
      `Loading ${filteredData.length} ${eventType} events`,
    );
    return this.appendOnly(filteredData);
  }
}
