import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import {
  AdminActionDto,
  RecentActivityQueryDto,
  PaginatedActivityDto,
  RecentActionDto,
} from '../../dto/dashboard';
import { AdminQueryBuilder } from '../query-builders/admin.query-builder';

/**
 * Service responsible for tracking and retrieving recent user activity.
 * Handles activity logging, recent actions, and activity pagination.
 *
 * Responsibilities:
 * - Query recent activity from database views
 * - Provide paginated activity feeds
 * - Track administrative actions
 * - Format activity data for frontend consumption
 */
@Injectable()
export class RecentActivityService {
  private readonly logger = new Logger(RecentActivityService.name);

  constructor(
    @InjectDataSource('auth')
    private readonly authConnection: DataSource,
    private readonly queryBuilder: AdminQueryBuilder,
  ) {}

  /**
   * Get recent activity from admin_dashboard.recent_activity view.
   * Provides paginated list of recent user activities.
   *
   * @param query - Query parameters (limit, filters)
   * @returns Paginated activity data
   */
  async getRecentActivity(
    query: RecentActivityQueryDto,
  ): Promise<PaginatedActivityDto> {
    const limit = query.limit || 20;
    const activities = await this.getRecentActivityInternal(limit);

    // Get total count from activity log
    const countResult = await this.authConnection.query(
      'SELECT COUNT(*) as count FROM audit_logging.activity_log',
    );
    const total = parseInt(countResult[0]?.count || '0', 10);

    return {
      data: activities,
      total,
      limit,
    };
  }

  /**
   * Get recent activity from DB view (internal).
   * Queries the admin_dashboard.recent_activity materialized view for optimized performance.
   *
   * @param limit - Maximum number of activities to return
   * @returns Array of recent activities
   */
  async getRecentActivityInternal(limit: number): Promise<AdminActionDto[]> {
    try {
      const results = await this.authConnection.query(
        `SELECT
          id,
          user_id,
          email,
          first_name,
          last_name,
          action_type,
          description,
          metadata,
          created_at
         FROM admin_dashboard.recent_activity
         ORDER BY created_at DESC
         LIMIT $1`,
        [limit],
      );

      return results.map((row: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
        id: row.id,
        user_id: row.user_id,
        email: row.email,
        first_name: row.first_name,
        last_name: row.last_name,
        action_type: row.action_type,
        description: row.description,
        metadata: row.metadata,
        created_at: row.created_at instanceof Date
          ? row.created_at.toISOString()
          : row.created_at,
      }));
    } catch (error) {
      this.logger.error(`Error fetching recent activity from view: ${error instanceof Error ? error.message : error}`);
      // Fallback to empty array if view doesn't exist or query fails
      return [];
    }
  }

  /**
   * Get recent administrative actions.
   * Returns actions like user creation, organization updates, etc.
   *
   * @param limit - Maximum number of actions to return (default: 10, max: 50)
   * @returns Array of recent administrative actions
   */
  async getRecentActions(limit: number = 10): Promise<RecentActionDto[]> {
    try {
      // Query recent user creations from auth.users
      const recentUserCreations = await this.authConnection.query(
        `SELECT
          gen_random_uuid() as id,
          'create' as action,
          'user_created' as action_type,
          u.id as target_id,
          'user' as target_type,
          u.id as admin_id,
          'Sistema' as admin_name,
          'Usuario ' || u.email || ' creado' as details,
          u.created_at as timestamp
        FROM auth.users u
        WHERE u.created_at >= NOW() - INTERVAL '7 days'
        ORDER BY u.created_at DESC
        LIMIT $1`,
        [Math.min(limit, 50)],
      );

      // Query recent organization updates
      const recentOrgUpdates = await this.authConnection.query(
        `SELECT
          gen_random_uuid() as id,
          'update' as action,
          'organization_updated' as action_type,
          t.id as target_id,
          'organization' as target_type,
          t.id as admin_id,
          'Sistema' as admin_name,
          'Organización ' || t.name || ' actualizada' as details,
          t.updated_at as timestamp
        FROM auth_management.tenants t
        WHERE t.updated_at >= NOW() - INTERVAL '7 days'
        AND t.updated_at != t.created_at
        ORDER BY t.updated_at DESC
        LIMIT $1`,
        [Math.min(limit, 50)],
      );

      // Combine and sort all actions by timestamp
      const allActions = [...recentUserCreations, ...recentOrgUpdates]
        .sort((a, b) => {
          const dateA = new Date(a.timestamp).getTime();
          const dateB = new Date(b.timestamp).getTime();
          return dateB - dateA;
        })
        .slice(0, limit);

      return allActions.map(action => ({
        id: action.id,
        action: action.action,
        actionType: action.action_type,
        adminId: action.admin_id,
        adminName: action.admin_name,
        targetType: action.target_type,
        targetId: action.target_id,
        details: action.details,
        timestamp: action.timestamp instanceof Date
          ? action.timestamp
          : new Date(action.timestamp),
        success: true, // All actions in DB are successful
      }));
    } catch (error) {
      this.logger.error(`Error fetching recent actions: ${error instanceof Error ? error.message : error}`);
      // Return empty array on error to prevent UI breaking
      return [];
    }
  }

  /**
   * Get activity count for a specific time period.
   *
   * @param hours - Number of hours to look back (validated: 1-720)
   * @returns Count of activities in the time period
   *
   * @security FIX-2025-01-07: Changed from string interpolation to parameterized query
   *           to prevent SQL injection vulnerability.
   */
  async getActivityCount(hours: number): Promise<number> {
    try {
      // Validate hours to prevent invalid interval values (max 30 days = 720 hours)
      const safeHours = Math.max(1, Math.min(Math.floor(hours), 720));

      const result = await this.authConnection.query(
        `SELECT COUNT(*) as count
         FROM audit_logging.activity_log
         WHERE created_at >= NOW() - make_interval(hours => $1)`,
        [safeHours],
      );

      return parseInt(result[0]?.count || '0', 10);
    } catch (error) {
      this.logger.error(`Error fetching activity count: ${error instanceof Error ? error.message : error}`);
      return 0;
    }
  }
}
