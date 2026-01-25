/**
 * AlertConfigService
 *
 * @description Service for managing teacher alert configurations.
 * Allows teachers to customize thresholds and notification preferences for alerts.
 *
 * @module teacher/services
 * @since US-PM-007
 */

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherAlertConfiguration } from '@modules/progress/entities/teacher-alert-configuration.entity';
import { Profile } from '@modules/auth/entities/profile.entity';
import { Classroom } from '@modules/social/entities/classroom.entity';
import {
  CreateAlertConfigDto,
  UpdateAlertConfigDto,
  GetAlertConfigQueryDto,
  AlertConfigResponseDto,
  AlertConfigDefaultsDto,
  AlertConfigType,
  ThresholdUnit,
} from '../dto/alert-config.dto';

/**
 * Default configurations for each alert type
 */
const ALERT_DEFAULTS: AlertConfigDefaultsDto[] = [
  {
    alert_type: AlertConfigType.NO_ACTIVITY,
    label: 'Sin Actividad',
    description: 'Alerta cuando un estudiante no ha tenido actividad en el periodo especificado',
    default_threshold_value: 7,
    default_threshold_unit: ThresholdUnit.DAYS,
    default_cooldown_hours: 24,
  },
  {
    alert_type: AlertConfigType.LOW_SCORE,
    label: 'Bajo Rendimiento',
    description: 'Alerta cuando el promedio de puntuacion cae por debajo del umbral',
    default_threshold_value: 60,
    default_threshold_unit: ThresholdUnit.PERCENTAGE,
    default_cooldown_hours: 48,
  },
  {
    alert_type: AlertConfigType.DECLINING_TREND,
    label: 'Tendencia Decreciente',
    description: 'Alerta cuando hay una tendencia negativa sostenida en el rendimiento',
    default_threshold_value: 15,
    default_threshold_unit: ThresholdUnit.PERCENTAGE,
    default_cooldown_hours: 72,
  },
  {
    alert_type: AlertConfigType.REPEATED_FAILURES,
    label: 'Fallos Repetidos',
    description: 'Alerta cuando un estudiante falla multiples veces el mismo ejercicio',
    default_threshold_value: 3,
    default_threshold_unit: ThresholdUnit.COUNT,
    default_cooldown_hours: 24,
  },
  {
    alert_type: AlertConfigType.EXCESSIVE_TIME,
    label: 'Tiempo Excesivo',
    description: 'Alerta cuando un estudiante tarda demasiado en completar ejercicios',
    default_threshold_value: 45,
    default_threshold_unit: ThresholdUnit.MINUTES,
    default_cooldown_hours: 24,
  },
  {
    alert_type: AlertConfigType.LOW_ENGAGEMENT,
    label: 'Bajo Engagement',
    description: 'Alerta cuando el nivel de participacion y engagement es bajo',
    default_threshold_value: 30,
    default_threshold_unit: ThresholdUnit.PERCENTAGE,
    default_cooldown_hours: 48,
  },
];

@Injectable()
export class AlertConfigService {
  constructor(
    @InjectRepository(TeacherAlertConfiguration, 'progress')
    private readonly alertConfigRepo: Repository<TeacherAlertConfiguration>,

    @InjectRepository(Profile, 'auth')
    private readonly profileRepo: Repository<Profile>,

    @InjectRepository(Classroom, 'social')
    private readonly classroomRepo: Repository<Classroom>,
  ) {}

  /**
   * Get all alert configurations for a teacher
   *
   * @param teacherId - Teacher ID
   * @param query - Optional filters
   * @returns List of configurations
   */
  async getConfigurations(
    teacherId: string,
    query?: GetAlertConfigQueryDto,
  ): Promise<{ data: AlertConfigResponseDto[]; total: number }> {
    const qb = this.alertConfigRepo.createQueryBuilder('config');

    qb.where('config.teacher_id = :teacherId', { teacherId });

    if (query?.classroom_id) {
      qb.andWhere('config.classroom_id = :classroomId', {
        classroomId: query.classroom_id,
      });
    }

    if (query?.alert_type) {
      qb.andWhere('config.alert_type = :alertType', {
        alertType: query.alert_type,
      });
    }

    if (query?.is_enabled !== undefined) {
      qb.andWhere('config.is_enabled = :isEnabled', {
        isEnabled: query.is_enabled,
      });
    }

    qb.orderBy('config.alert_type', 'ASC');

    const [configs, total] = await qb.getManyAndCount();

    // Enrich with classroom names
    const data = await Promise.all(
      configs.map((config) => this.formatConfigResponse(config)),
    );

    return { data, total };
  }

  /**
   * Get a single configuration by ID
   *
   * @param teacherId - Teacher ID
   * @param configId - Configuration ID
   * @returns Configuration details
   */
  async getConfiguration(
    teacherId: string,
    configId: string,
  ): Promise<AlertConfigResponseDto> {
    const config = await this.alertConfigRepo.findOne({
      where: { id: configId, teacher_id: teacherId },
    });

    if (!config) {
      throw new NotFoundException(`Configuration ${configId} not found`);
    }

    return this.formatConfigResponse(config);
  }

  /**
   * Create a new alert configuration
   *
   * @param teacherId - Teacher ID
   * @param tenantId - Tenant ID
   * @param dto - Configuration data
   * @returns Created configuration
   */
  async createConfiguration(
    teacherId: string,
    tenantId: string,
    dto: CreateAlertConfigDto,
  ): Promise<AlertConfigResponseDto> {
    // Check for existing configuration with same teacher/classroom/type
    const existing = await this.alertConfigRepo.findOne({
      where: {
        teacher_id: teacherId,
        classroom_id: dto.classroom_id || undefined,
        alert_type: dto.alert_type,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Configuration for alert type ${dto.alert_type} already exists${dto.classroom_id ? ' for this classroom' : ' globally'}`,
      );
    }

    const config = this.alertConfigRepo.create({
      teacher_id: teacherId,
      tenant_id: tenantId,
      classroom_id: dto.classroom_id,
      alert_type: dto.alert_type,
      is_enabled: dto.is_enabled ?? true,
      threshold_value: dto.threshold_value,
      threshold_unit: dto.threshold_unit,
      notify_email: dto.notify_email ?? false,
      notify_in_app: dto.notify_in_app ?? true,
      cooldown_hours: dto.cooldown_hours ?? 24,
      custom_settings: dto.custom_settings,
    });

    const saved = await this.alertConfigRepo.save(config);
    return this.formatConfigResponse(saved);
  }

  /**
   * Update an existing configuration
   *
   * @param teacherId - Teacher ID
   * @param configId - Configuration ID
   * @param dto - Update data
   * @returns Updated configuration
   */
  async updateConfiguration(
    teacherId: string,
    configId: string,
    dto: UpdateAlertConfigDto,
  ): Promise<AlertConfigResponseDto> {
    const config = await this.alertConfigRepo.findOne({
      where: { id: configId, teacher_id: teacherId },
    });

    if (!config) {
      throw new NotFoundException(`Configuration ${configId} not found`);
    }

    // Update only provided fields
    if (dto.is_enabled !== undefined) config.is_enabled = dto.is_enabled;
    if (dto.threshold_value !== undefined) config.threshold_value = dto.threshold_value;
    if (dto.threshold_unit !== undefined) config.threshold_unit = dto.threshold_unit;
    if (dto.notify_email !== undefined) config.notify_email = dto.notify_email;
    if (dto.notify_in_app !== undefined) config.notify_in_app = dto.notify_in_app;
    if (dto.cooldown_hours !== undefined) config.cooldown_hours = dto.cooldown_hours;
    if (dto.custom_settings !== undefined) config.custom_settings = dto.custom_settings;

    const saved = await this.alertConfigRepo.save(config);
    return this.formatConfigResponse(saved);
  }

  /**
   * Delete a configuration
   *
   * @param teacherId - Teacher ID
   * @param configId - Configuration ID
   */
  async deleteConfiguration(teacherId: string, configId: string): Promise<void> {
    const config = await this.alertConfigRepo.findOne({
      where: { id: configId, teacher_id: teacherId },
    });

    if (!config) {
      throw new NotFoundException(`Configuration ${configId} not found`);
    }

    await this.alertConfigRepo.remove(config);
  }

  /**
   * Get default configuration values for each alert type
   *
   * @returns Array of default configurations
   */
  getDefaultConfigurations(): AlertConfigDefaultsDto[] {
    return ALERT_DEFAULTS;
  }

  /**
   * Initialize default configurations for a teacher
   * Creates all alert types with default values if not exists
   *
   * @param teacherId - Teacher ID
   * @param tenantId - Tenant ID
   * @param classroomId - Optional classroom ID for classroom-specific configs
   */
  async initializeDefaults(
    teacherId: string,
    tenantId: string,
    classroomId?: string,
  ): Promise<AlertConfigResponseDto[]> {
    const results: AlertConfigResponseDto[] = [];

    for (const defaultConfig of ALERT_DEFAULTS) {
      // Check if already exists
      const existing = await this.alertConfigRepo.findOne({
        where: {
          teacher_id: teacherId,
          classroom_id: classroomId || undefined,
          alert_type: defaultConfig.alert_type,
        },
      });

      if (!existing) {
        const config = this.alertConfigRepo.create({
          teacher_id: teacherId,
          tenant_id: tenantId,
          classroom_id: classroomId,
          alert_type: defaultConfig.alert_type,
          is_enabled: true,
          threshold_value: defaultConfig.default_threshold_value,
          threshold_unit: defaultConfig.default_threshold_unit,
          notify_email: false,
          notify_in_app: true,
          cooldown_hours: defaultConfig.default_cooldown_hours,
        });

        const saved = await this.alertConfigRepo.save(config);
        results.push(await this.formatConfigResponse(saved));
      }
    }

    return results;
  }

  /**
   * Format a configuration entity to response DTO
   * @private
   */
  private async formatConfigResponse(
    config: TeacherAlertConfiguration,
  ): Promise<AlertConfigResponseDto> {
    let classroomName: string | null = null;

    if (config.classroom_id) {
      const classroom = await this.classroomRepo.findOne({
        where: { id: config.classroom_id },
      });
      classroomName = classroom?.name || null;
    }

    return {
      id: config.id,
      teacher_id: config.teacher_id,
      classroom_id: config.classroom_id || null,
      classroom_name: classroomName,
      alert_type: config.alert_type as AlertConfigType,
      is_enabled: config.is_enabled,
      threshold_value: config.threshold_value || null,
      threshold_unit: config.threshold_unit as ThresholdUnit || null,
      notify_email: config.notify_email,
      notify_in_app: config.notify_in_app,
      cooldown_hours: config.cooldown_hours,
      custom_settings: config.custom_settings || null,
      created_at: config.created_at.toISOString(),
      updated_at: config.updated_at.toISOString(),
    };
  }
}
