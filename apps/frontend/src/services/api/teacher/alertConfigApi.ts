/**
 * Alert Configuration API Service
 *
 * Provides methods to manage teacher alert configurations.
 * Allows teachers to customize thresholds and notification preferences.
 *
 * @module services/api/teacher/alertConfigApi
 * @since US-PM-007
 */

import { apiClient } from '../apiClient';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Alert types that can be configured
 */
export enum AlertConfigType {
  NO_ACTIVITY = 'no_activity',
  LOW_SCORE = 'low_score',
  DECLINING_TREND = 'declining_trend',
  REPEATED_FAILURES = 'repeated_failures',
  EXCESSIVE_TIME = 'excessive_time',
  LOW_ENGAGEMENT = 'low_engagement',
}

/**
 * Threshold units
 */
export enum ThresholdUnit {
  PERCENTAGE = 'percentage',
  DAYS = 'days',
  COUNT = 'count',
  MINUTES = 'minutes',
}

/**
 * DTO for creating a configuration
 */
export interface CreateAlertConfigDto {
  classroom_id?: string;
  alert_type: AlertConfigType;
  is_enabled?: boolean;
  threshold_value?: number;
  threshold_unit?: ThresholdUnit;
  notify_email?: boolean;
  notify_in_app?: boolean;
  cooldown_hours?: number;
  custom_settings?: Record<string, unknown>;
}

/**
 * DTO for updating a configuration
 */
export interface UpdateAlertConfigDto {
  is_enabled?: boolean;
  threshold_value?: number;
  threshold_unit?: ThresholdUnit;
  notify_email?: boolean;
  notify_in_app?: boolean;
  cooldown_hours?: number;
  custom_settings?: Record<string, unknown>;
}

/**
 * Query parameters for listing configurations
 */
export interface GetAlertConfigQueryDto {
  classroom_id?: string;
  alert_type?: AlertConfigType;
  is_enabled?: boolean;
}

/**
 * Configuration response
 */
export interface AlertConfigResponse {
  id: string;
  teacher_id: string;
  classroom_id?: string | null;
  classroom_name?: string | null;
  alert_type: AlertConfigType;
  is_enabled: boolean;
  threshold_value?: number | null;
  threshold_unit?: ThresholdUnit | null;
  notify_email: boolean;
  notify_in_app: boolean;
  cooldown_hours: number;
  custom_settings?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/**
 * Default configuration values
 */
export interface AlertConfigDefaults {
  alert_type: AlertConfigType;
  label: string;
  description: string;
  default_threshold_value: number;
  default_threshold_unit: ThresholdUnit;
  default_cooldown_hours: number;
}

/**
 * List response
 */
export interface AlertConfigListResponse {
  data: AlertConfigResponse[];
  total: number;
}

// ============================================================================
// API CLASS
// ============================================================================

/**
 * Alert Configuration API Service
 */
class AlertConfigAPI {
  private readonly basePath = '/teacher/alert-config';

  /**
   * Get all configurations for the current teacher
   */
  async getConfigurations(
    query?: GetAlertConfigQueryDto,
  ): Promise<AlertConfigListResponse> {
    try {
      const { data } = await apiClient.get<AlertConfigListResponse>(
        this.basePath,
        { params: query },
      );
      return data;
    } catch (error) {
      console.error('[AlertConfigAPI] Error fetching configurations:', error);
      throw error;
    }
  }

  /**
   * Get default configuration values
   */
  async getDefaults(): Promise<AlertConfigDefaults[]> {
    try {
      const { data } = await apiClient.get<AlertConfigDefaults[]>(
        `${this.basePath}/defaults`,
      );
      return data;
    } catch (error) {
      console.error('[AlertConfigAPI] Error fetching defaults:', error);
      throw error;
    }
  }

  /**
   * Get a single configuration by ID
   */
  async getConfiguration(id: string): Promise<AlertConfigResponse> {
    try {
      const { data } = await apiClient.get<AlertConfigResponse>(
        `${this.basePath}/${id}`,
      );
      return data;
    } catch (error) {
      console.error('[AlertConfigAPI] Error fetching configuration:', error);
      throw error;
    }
  }

  /**
   * Create a new configuration
   */
  async createConfiguration(
    dto: CreateAlertConfigDto,
  ): Promise<AlertConfigResponse> {
    try {
      const { data } = await apiClient.post<AlertConfigResponse>(
        this.basePath,
        dto,
      );
      return data;
    } catch (error) {
      console.error('[AlertConfigAPI] Error creating configuration:', error);
      throw error;
    }
  }

  /**
   * Initialize default configurations
   */
  async initializeDefaults(classroomId?: string): Promise<AlertConfigResponse[]> {
    try {
      const params = classroomId ? { classroom_id: classroomId } : undefined;
      const { data } = await apiClient.post<AlertConfigResponse[]>(
        `${this.basePath}/initialize`,
        {},
        { params },
      );
      return data;
    } catch (error) {
      console.error('[AlertConfigAPI] Error initializing defaults:', error);
      throw error;
    }
  }

  /**
   * Update a configuration
   */
  async updateConfiguration(
    id: string,
    dto: UpdateAlertConfigDto,
  ): Promise<AlertConfigResponse> {
    try {
      const { data } = await apiClient.put<AlertConfigResponse>(
        `${this.basePath}/${id}`,
        dto,
      );
      return data;
    } catch (error) {
      console.error('[AlertConfigAPI] Error updating configuration:', error);
      throw error;
    }
  }

  /**
   * Delete a configuration
   */
  async deleteConfiguration(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.basePath}/${id}`);
    } catch (error) {
      console.error('[AlertConfigAPI] Error deleting configuration:', error);
      throw error;
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Singleton instance
 */
export const alertConfigApi = new AlertConfigAPI();

/**
 * Export class for testing
 */
export { AlertConfigAPI };
