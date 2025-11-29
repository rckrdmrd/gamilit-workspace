import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserActivity } from '../entities';
import { CreateActivityDto } from '../dto';

/**
 * UserActivitiesService
 *
 * Gestión de actividades de usuarios para el Activity Feed
 * - Registro de actividades (achievements, level_ups, exercises, etc.)
 * - Obtención de actividades propias
 * - Feed de actividades de amigos
 */
@Injectable()
export class UserActivitiesService {
  constructor(
    @InjectRepository(UserActivity, 'social')
    private readonly activityRepo: Repository<UserActivity>,
  ) {}

  /**
   * Obtiene las actividades de un usuario específico
   * @param userId - ID del usuario
   * @param limit - Número máximo de actividades a retornar (default: 20)
   * @returns Lista de actividades ordenadas por fecha de creación (más recientes primero)
   */
  async getUserActivities(userId: string, limit: number = 20): Promise<UserActivity[]> {
    return this.activityRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  /**
   * Obtiene el feed de actividades de amigos
   * @param friendIds - Array de IDs de amigos
   * @param limit - Número máximo de actividades a retornar (default: 20)
   * @returns Lista de actividades públicas de amigos ordenadas por fecha
   */
  async getFeedActivities(friendIds: string[], limit: number = 20): Promise<UserActivity[]> {
    if (!friendIds || friendIds.length === 0) {
      return [];
    }

    return this.activityRepo.find({
      where: {
        user_id: In(friendIds),
        is_public: true,
      },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  /**
   * Crea una nueva actividad de usuario
   * @param createActivityDto - Datos de la actividad a crear
   * @returns Actividad creada
   *
   * Este método es llamado automáticamente por el sistema cuando:
   * - Usuario desbloquea un logro
   * - Usuario sube de nivel
   * - Usuario completa un ejercicio
   * - Usuario completa un desafío
   * - Usuario se une a un gremio
   * - Usuario sube de rango
   * - Usuario mantiene una racha
   */
  async createActivity(createActivityDto: CreateActivityDto): Promise<UserActivity> {
    const activity = this.activityRepo.create(createActivityDto);
    return this.activityRepo.save(activity);
  }

  /**
   * Obtiene una actividad por ID
   * @param activityId - ID de la actividad
   * @returns Actividad encontrada
   * @throws NotFoundException si la actividad no existe
   */
  async findById(activityId: string): Promise<UserActivity> {
    const activity = await this.activityRepo.findOne({
      where: { activity_id: activityId },
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${activityId} not found`);
    }

    return activity;
  }

  /**
   * Obtiene actividades públicas recientes de todos los usuarios
   * @param limit - Número máximo de actividades a retornar (default: 50)
   * @returns Lista de actividades públicas ordenadas por fecha
   *
   * Útil para feeds globales o explorar actividad de la comunidad
   */
  async getPublicActivities(limit: number = 50): Promise<UserActivity[]> {
    return this.activityRepo.find({
      where: { is_public: true },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  /**
   * Obtiene el conteo de actividades de un usuario
   * @param userId - ID del usuario
   * @returns Número total de actividades registradas
   */
  async getUserActivityCount(userId: string): Promise<number> {
    return this.activityRepo.count({
      where: { user_id: userId },
    });
  }

  /**
   * Obtiene actividades por tipo
   * @param userId - ID del usuario
   * @param activityType - Tipo de actividad a filtrar
   * @param limit - Número máximo de actividades a retornar (default: 20)
   * @returns Lista de actividades del tipo especificado
   */
  async getActivitiesByType(
    userId: string,
    activityType: string,
    limit: number = 20,
  ): Promise<UserActivity[]> {
    return this.activityRepo.find({
      where: {
        user_id: userId,
        activity_type: activityType,
      },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }
}
