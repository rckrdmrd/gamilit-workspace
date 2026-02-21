/**
 * ParentPreferencesService
 *
 * EXT-010 Parent Notifications - Preferences Management
 *
 * @description Manages notification preferences for parent accounts including
 * email frequency settings, alert thresholds, and report formats.
 *
 * @see ET-PAR-001-weekly-reports.md
 * @created 2026-01-27
 */

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParentAccount } from '@/modules/auth/entities/parent-account.entity';
import { NotificationFrequency, ReportFormat, RelationshipType } from '@/modules/parents/enums/parent-account.enums';
import { Profile } from '@/modules/auth/entities/profile.entity';

/**
 * Update Preferences DTO
 */
export interface UpdatePreferencesDto {
  notificationFrequency?: NotificationFrequency;
  alertOnLowPerformance?: boolean;
  alertOnInactivityDays?: number;
  alertOnAchievementUnlocked?: boolean;
  alertOnRankPromotion?: boolean;
  preferredReportFormat?: ReportFormat;
  preferredLanguage?: string;
  dashboardWidgets?: string[];
  canViewDetailedProgress?: boolean;
  canViewExerciseAttempts?: boolean;
  canReceiveAlerts?: boolean;
  canDownloadReports?: boolean;
}

/**
 * Parent Preferences Response
 */
export interface ParentPreferencesResponse {
  id: string;
  profileId: string;
  relationshipType: RelationshipType | null;

  // Notification Settings
  notificationFrequency: NotificationFrequency;
  preferredReportFormat: ReportFormat;
  preferredLanguage: string;

  // Alert Settings
  alertOnLowPerformance: boolean;
  alertOnInactivityDays: number;
  alertOnAchievementUnlocked: boolean;
  alertOnRankPromotion: boolean;
  canReceiveAlerts: boolean;

  // View Permissions
  canViewDetailedProgress: boolean;
  canViewExerciseAttempts: boolean;
  canDownloadReports: boolean;

  // Dashboard
  dashboardWidgets: string[];

  // Status
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt: Date | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Available Dashboard Widgets
 */
export const AVAILABLE_WIDGETS = [
  'progress', // Overall progress summary
  'achievements', // Recent achievements
  'activity', // Activity timeline
  'recommendations', // Personalized recommendations
  'streaks', // Streak tracking
  'leaderboard', // Class/school ranking
  'modules', // Module completion status
  'exercises', // Recent exercise performance
  'calendar', // Activity calendar
  'alerts', // Active alerts
] as const;

@Injectable()
export class ParentPreferencesService {
  private readonly logger = new Logger(ParentPreferencesService.name);

  constructor(
    @InjectRepository(ParentAccount, 'auth')
    private readonly parentAccountRepo: Repository<ParentAccount>,
    @InjectRepository(Profile, 'auth')
    private readonly profileRepo: Repository<Profile>,
  ) {}

  /**
   * Get parent preferences by parent account ID
   *
   * @param parentId - Parent account ID
   * @returns Parent preferences
   */
  async getPreferences(parentId: string): Promise<ParentPreferencesResponse> {
    const parent = await this.parentAccountRepo.findOne({
      where: { id: parentId },
    });

    if (!parent) {
      throw new NotFoundException(`Parent account ${parentId} not found`);
    }

    return this.mapToResponse(parent);
  }

  /**
   * Get parent preferences by profile ID
   *
   * @param profileId - Profile ID
   * @returns Parent preferences
   */
  async getPreferencesByProfile(profileId: string): Promise<ParentPreferencesResponse> {
    const parent = await this.parentAccountRepo.findOne({
      where: { profileId },
    });

    if (!parent) {
      throw new NotFoundException(`Parent account for profile ${profileId} not found`);
    }

    return this.mapToResponse(parent);
  }

  /**
   * Update parent preferences
   *
   * @param parentId - Parent account ID
   * @param updates - Preferences to update
   * @returns Updated preferences
   */
  async updatePreferences(
    parentId: string,
    updates: UpdatePreferencesDto,
  ): Promise<ParentPreferencesResponse> {
    const parent = await this.parentAccountRepo.findOne({
      where: { id: parentId },
    });

    if (!parent) {
      throw new NotFoundException(`Parent account ${parentId} not found`);
    }

    // Validate dashboard widgets if provided
    if (updates.dashboardWidgets) {
      this.validateDashboardWidgets(updates.dashboardWidgets);
    }

    // Validate inactivity days if provided
    if (updates.alertOnInactivityDays !== undefined) {
      if (updates.alertOnInactivityDays < 1 || updates.alertOnInactivityDays > 30) {
        throw new BadRequestException('Inactivity days must be between 1 and 30');
      }
    }

    // Apply updates
    Object.assign(parent, updates);

    const saved = await this.parentAccountRepo.save(parent);

    this.logger.log(`Parent preferences updated for ${parentId}`);

    return this.mapToResponse(saved);
  }

  /**
   * Set notification frequency
   *
   * @param parentId - Parent account ID
   * @param frequency - Notification frequency
   * @returns Updated preferences
   */
  async setNotificationFrequency(
    parentId: string,
    frequency: NotificationFrequency,
  ): Promise<ParentPreferencesResponse> {
    return this.updatePreferences(parentId, { notificationFrequency: frequency });
  }

  /**
   * Set report format preference
   *
   * @param parentId - Parent account ID
   * @param format - Report format preference
   * @returns Updated preferences
   */
  async setReportFormat(
    parentId: string,
    format: ReportFormat,
  ): Promise<ParentPreferencesResponse> {
    return this.updatePreferences(parentId, { preferredReportFormat: format });
  }

  /**
   * Configure alert settings
   *
   * @param parentId - Parent account ID
   * @param settings - Alert settings
   * @returns Updated preferences
   */
  async configureAlerts(
    parentId: string,
    settings: {
      lowPerformance?: boolean;
      inactivityDays?: number;
      achievementUnlocked?: boolean;
      rankPromotion?: boolean;
      receiveAlerts?: boolean;
    },
  ): Promise<ParentPreferencesResponse> {
    return this.updatePreferences(parentId, {
      alertOnLowPerformance: settings.lowPerformance,
      alertOnInactivityDays: settings.inactivityDays,
      alertOnAchievementUnlocked: settings.achievementUnlocked,
      alertOnRankPromotion: settings.rankPromotion,
      canReceiveAlerts: settings.receiveAlerts,
    });
  }

  /**
   * Update dashboard widget configuration
   *
   * @param parentId - Parent account ID
   * @param widgets - Widget IDs to display
   * @returns Updated preferences
   */
  async updateDashboardWidgets(
    parentId: string,
    widgets: string[],
  ): Promise<ParentPreferencesResponse> {
    this.validateDashboardWidgets(widgets);
    return this.updatePreferences(parentId, { dashboardWidgets: widgets });
  }

  /**
   * Add a dashboard widget
   *
   * @param parentId - Parent account ID
   * @param widget - Widget ID to add
   * @returns Updated preferences
   */
  async addDashboardWidget(
    parentId: string,
    widget: string,
  ): Promise<ParentPreferencesResponse> {
    if (!AVAILABLE_WIDGETS.includes(widget as any)) {
      throw new BadRequestException(`Invalid widget: ${widget}`);
    }

    const parent = await this.parentAccountRepo.findOne({
      where: { id: parentId },
    });

    if (!parent) {
      throw new NotFoundException(`Parent account ${parentId} not found`);
    }

    const widgets = [...new Set([...parent.dashboardWidgets, widget])];
    return this.updatePreferences(parentId, { dashboardWidgets: widgets });
  }

  /**
   * Remove a dashboard widget
   *
   * @param parentId - Parent account ID
   * @param widget - Widget ID to remove
   * @returns Updated preferences
   */
  async removeDashboardWidget(
    parentId: string,
    widget: string,
  ): Promise<ParentPreferencesResponse> {
    const parent = await this.parentAccountRepo.findOne({
      where: { id: parentId },
    });

    if (!parent) {
      throw new NotFoundException(`Parent account ${parentId} not found`);
    }

    const widgets = parent.dashboardWidgets.filter((w) => w !== widget);
    return this.updatePreferences(parentId, { dashboardWidgets: widgets });
  }

  /**
   * Reset preferences to defaults
   *
   * @param parentId - Parent account ID
   * @returns Updated preferences
   */
  async resetToDefaults(parentId: string): Promise<ParentPreferencesResponse> {
    const defaults: UpdatePreferencesDto = {
      notificationFrequency: NotificationFrequency.WEEKLY,
      alertOnLowPerformance: true,
      alertOnInactivityDays: 7,
      alertOnAchievementUnlocked: true,
      alertOnRankPromotion: true,
      preferredReportFormat: ReportFormat.EMAIL,
      preferredLanguage: 'es-MX',
      dashboardWidgets: ['progress', 'achievements', 'activity', 'recommendations'],
      canViewDetailedProgress: true,
      canViewExerciseAttempts: true,
      canReceiveAlerts: true,
      canDownloadReports: true,
    };

    return this.updatePreferences(parentId, defaults);
  }

  /**
   * Disable all notifications
   *
   * @param parentId - Parent account ID
   * @returns Updated preferences
   */
  async disableAllNotifications(parentId: string): Promise<ParentPreferencesResponse> {
    return this.updatePreferences(parentId, {
      notificationFrequency: NotificationFrequency.ON_DEMAND,
      alertOnLowPerformance: false,
      alertOnAchievementUnlocked: false,
      alertOnRankPromotion: false,
      canReceiveAlerts: false,
    });
  }

  /**
   * Get available widgets
   *
   * @returns List of available widget configurations
   */
  getAvailableWidgets(): Array<{ id: string; name: string; description: string }> {
    return [
      { id: 'progress', name: 'Progreso General', description: 'Resumen del progreso semanal' },
      { id: 'achievements', name: 'Logros Recientes', description: 'Logros desbloqueados recientemente' },
      { id: 'activity', name: 'Actividad', description: 'Timeline de actividad reciente' },
      { id: 'recommendations', name: 'Recomendaciones', description: 'Sugerencias personalizadas' },
      { id: 'streaks', name: 'Rachas', description: 'Seguimiento de rachas de estudio' },
      { id: 'leaderboard', name: 'Clasificacion', description: 'Ranking en clase o escuela' },
      { id: 'modules', name: 'Modulos', description: 'Estado de completado de modulos' },
      { id: 'exercises', name: 'Ejercicios', description: 'Rendimiento en ejercicios recientes' },
      { id: 'calendar', name: 'Calendario', description: 'Calendario de actividad' },
      { id: 'alerts', name: 'Alertas', description: 'Alertas activas' },
    ];
  }

  /**
   * Get available notification frequencies
   *
   * @returns List of available notification frequencies
   */
  getAvailableFrequencies(): Array<{ id: string; name: string; description: string }> {
    return [
      { id: 'realtime', name: 'Tiempo Real', description: 'Notificaciones inmediatas' },
      { id: 'daily', name: 'Diario', description: 'Resumen diario de actividad' },
      { id: 'weekly', name: 'Semanal', description: 'Reporte semanal cada domingo' },
      { id: 'monthly', name: 'Mensual', description: 'Reporte mensual' },
      { id: 'on_demand', name: 'Bajo Demanda', description: 'Solo cuando lo solicites' },
    ];
  }

  /**
   * Validate dashboard widgets
   */
  private validateDashboardWidgets(widgets: string[]): void {
    const invalid = widgets.filter((w) => !AVAILABLE_WIDGETS.includes(w as any));
    if (invalid.length > 0) {
      throw new BadRequestException(`Invalid widgets: ${invalid.join(', ')}`);
    }
  }

  /**
   * Map entity to response
   */
  private mapToResponse(parent: ParentAccount): ParentPreferencesResponse {
    return {
      id: parent.id,
      profileId: parent.profileId,
      relationshipType: parent.relationshipType,

      // Notification Settings
      notificationFrequency: parent.notificationFrequency,
      preferredReportFormat: parent.preferredReportFormat,
      preferredLanguage: parent.preferredLanguage,

      // Alert Settings
      alertOnLowPerformance: parent.alertOnLowPerformance,
      alertOnInactivityDays: parent.alertOnInactivityDays,
      alertOnAchievementUnlocked: parent.alertOnAchievementUnlocked,
      alertOnRankPromotion: parent.alertOnRankPromotion,
      canReceiveAlerts: parent.canReceiveAlerts,

      // View Permissions
      canViewDetailedProgress: parent.canViewDetailedProgress,
      canViewExerciseAttempts: parent.canViewExerciseAttempts,
      canDownloadReports: parent.canDownloadReports,

      // Dashboard
      dashboardWidgets: parent.dashboardWidgets,

      // Status
      isVerified: parent.isVerified,
      isActive: parent.isActive,
      lastLoginAt: parent.lastLoginAt,

      // Timestamps
      createdAt: parent.createdAt,
      updatedAt: parent.updatedAt,
    };
  }
}
