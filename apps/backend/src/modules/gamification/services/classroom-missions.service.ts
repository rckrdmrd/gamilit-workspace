import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassroomMission, ClassroomMissionMetadata } from '../entities/classroom-mission.entity';
import { MissionObjective, MissionRewards } from '../entities/mission.entity';
import { Profile } from '@/modules/auth/entities/profile.entity';
import { AssignClassroomMissionDto } from '../dto/missions/assign-classroom-mission.dto';
import { ClassroomMissionResponseDto } from '../dto/missions/classroom-mission-response.dto';

/**
 * ClassroomMissionsService
 *
 * @description Gestión de misiones asignadas a aulas específicas
 *
 * Características principales:
 * - Asignación de misiones a aulas por profesores
 * - Configuración de bonificaciones adicionales por aula
 * - Control de misiones obligatorias vs opcionales
 * - Fechas de vencimiento personalizadas
 * - Consulta de misiones por aula o template
 * - Eliminación/desactivación de misiones
 *
 * Casos de uso:
 * - Profesor asigna misión diaria a su aula con bonus de 10 XP
 * - Profesor asigna misión especial obligatoria para evento
 * - Estudiantes consultan misiones activas de su aula
 * - Sistema verifica misiones vencidas
 *
 * @see Entity: ClassroomMission
 * @see DDL: /apps/database/ddl/schemas/gamification_system/tables/16-classroom_missions.sql
 * @see Reference: educational_content.classroom_modules
 */
@Injectable()
export class ClassroomMissionsService {
  private readonly logger = new Logger(ClassroomMissionsService.name);

  constructor(
    @InjectRepository(ClassroomMission, 'gamification')
    private readonly classroomMissionsRepo: Repository<ClassroomMission>,
    @InjectRepository(Profile, 'auth')
    private readonly profileRepo: Repository<Profile>,
  ) {}

  /**
   * Helper method to get profile.id from auth.users.id
   *
   * @param userId - auth.users.id (from JWT token)
   * @returns profiles.id
   * @throws NotFoundException if profile doesn't exist
   */
  private async getProfileId(userId: string): Promise<string> {
    const profile = await this.profileRepo.findOne({
      where: { user_id: userId },
      select: ['id'],
    });

    if (!profile) {
      throw new NotFoundException(`Profile not found for user ${userId}`);
    }

    return profile.id;
  }

  /**
   * Asigna una misión a un aula
   *
   * @description Crea una nueva asignación de misión para un aula específica.
   * El profesor puede configurar bonificaciones adicionales y fechas de vencimiento.
   *
   * @param classroomId - ID del aula (UUID)
   * @param teacherId - ID del profesor (auth.users.id, se convierte a profile.id internamente)
   * @param dto - Datos de la misión a asignar
   * @returns Misión asignada con cálculo de recompensas totales
   *
   * @throws {BadRequestException} Si la misión ya está asignada al aula
   * @throws {NotFoundException} Si el profesor no tiene perfil
   *
   * @example
   * const mission = await service.assignMissionToClassroom(
   *   classroomId,
   *   teacherId,
   *   {
   *     mission_template_id: 'daily_complete_exercises',
   *     title: 'Complete 3 exercises',
   *     mission_type: 'daily',
   *     objectives: [{type: 'complete_exercises', target: 3}],
   *     base_rewards: {ml_coins: 25, xp: 50},
   *     bonus_xp: 10,
   *     bonus_coins: 5,
   *     is_mandatory: false,
   *   }
   * );
   */
  async assignMissionToClassroom(
    classroomId: string,
    teacherId: string,
    dto: AssignClassroomMissionDto,
  ): Promise<ClassroomMissionResponseDto> {
    // Convert auth.users.id to profiles.id
    const profileId = await this.getProfileId(teacherId);

    // Verificar si la misión ya está asignada al aula
    const existing = await this.classroomMissionsRepo.findOne({
      where: {
        classroom_id: classroomId,
        mission_template_id: dto.mission_template_id,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Mission template '${dto.mission_template_id}' is already assigned to classroom ${classroomId}`,
      );
    }

    // Crear nueva asignación de misión
    const classroomMission = this.classroomMissionsRepo.create({
      classroom_id: classroomId,
      mission_template_id: dto.mission_template_id,
      assigned_by: profileId,
      title: dto.title,
      description: dto.description || null,
      mission_type: dto.mission_type,
      objectives: dto.objectives as MissionObjective[],
      base_rewards: dto.base_rewards as MissionRewards,
      bonus_xp: dto.bonus_xp || 0,
      bonus_coins: dto.bonus_coins || 0,
      due_date: dto.due_date ? new Date(dto.due_date) : null,
      is_mandatory: dto.is_mandatory || false,
      metadata: (dto.metadata || {}) as ClassroomMissionMetadata,
      is_active: true,
    });

    const saved = await this.classroomMissionsRepo.save(classroomMission);

    this.logger.log(
      `Mission '${dto.mission_template_id}' assigned to classroom ${classroomId} by teacher ${teacherId}`,
    );

    return ClassroomMissionResponseDto.fromEntity(saved);
  }

  /**
   * Obtiene todas las misiones de un aula
   *
   * @description Retorna todas las misiones activas asignadas a un aula específica.
   * Incluye cálculo de recompensas totales (base + bonificaciones).
   *
   * @param classroomId - ID del aula (UUID)
   * @returns Array de misiones del aula
   *
   * @example
   * const missions = await service.getClassroomMissions(classroomId);
   * // Retorna: [ClassroomMissionResponseDto, ...]
   */
  async getClassroomMissions(classroomId: string): Promise<ClassroomMissionResponseDto[]> {
    const missions = await this.classroomMissionsRepo.find({
      where: {
        classroom_id: classroomId,
        is_active: true,
      },
      order: {
        assigned_at: 'DESC',
      },
    });

    return missions.map((mission) => ClassroomMissionResponseDto.fromEntity(mission));
  }

  /**
   * Obtiene todas las aulas que usan un template de misión
   *
   * @description Retorna todas las asignaciones de un template de misión específico.
   * Útil para ver qué aulas tienen asignada una misión en particular.
   *
   * @param missionTemplateId - ID del template de misión
   * @returns Array de misiones usando ese template
   *
   * @example
   * const missions = await service.getMissionClassrooms('daily_complete_exercises');
   * // Retorna: [ClassroomMissionResponseDto, ...]
   */
  async getMissionClassrooms(missionTemplateId: string): Promise<ClassroomMissionResponseDto[]> {
    const missions = await this.classroomMissionsRepo.find({
      where: {
        mission_template_id: missionTemplateId,
        is_active: true,
      },
      order: {
        assigned_at: 'DESC',
      },
    });

    return missions.map((mission) => ClassroomMissionResponseDto.fromEntity(mission));
  }

  /**
   * Elimina (desactiva) una misión de un aula
   *
   * @description Desactiva una misión asignada a un aula (soft delete).
   * No elimina el registro, solo marca is_active = false.
   *
   * @param classroomId - ID del aula (UUID)
   * @param missionTemplateId - ID del template de misión
   * @returns Mensaje de confirmación
   *
   * @throws {NotFoundException} Si la misión no existe o ya está desactivada
   *
   * @example
   * const result = await service.removeMissionFromClassroom(
   *   classroomId,
   *   'daily_complete_exercises'
   * );
   * // result.message === 'Mission removed from classroom successfully'
   */
  async removeMissionFromClassroom(
    classroomId: string,
    missionTemplateId: string,
  ): Promise<{ message: string }> {
    const mission = await this.classroomMissionsRepo.findOne({
      where: {
        classroom_id: classroomId,
        mission_template_id: missionTemplateId,
        is_active: true,
      },
    });

    if (!mission) {
      throw new NotFoundException(
        `Active mission '${missionTemplateId}' not found in classroom ${classroomId}`,
      );
    }

    // Soft delete: marcar como inactiva
    mission.is_active = false;
    await this.classroomMissionsRepo.save(mission);

    this.logger.log(
      `Mission '${missionTemplateId}' removed from classroom ${classroomId}`,
    );

    return {
      message: 'Mission removed from classroom successfully',
    };
  }

  /**
   * Obtiene una misión específica de un aula
   *
   * @description Retorna una misión específica asignada a un aula.
   *
   * @param classroomId - ID del aula (UUID)
   * @param missionTemplateId - ID del template de misión
   * @returns Misión encontrada
   *
   * @throws {NotFoundException} Si la misión no existe o no está activa
   *
   * @example
   * const mission = await service.getClassroomMission(
   *   classroomId,
   *   'daily_complete_exercises'
   * );
   */
  async getClassroomMission(
    classroomId: string,
    missionTemplateId: string,
  ): Promise<ClassroomMissionResponseDto> {
    const mission = await this.classroomMissionsRepo.findOne({
      where: {
        classroom_id: classroomId,
        mission_template_id: missionTemplateId,
        is_active: true,
      },
    });

    if (!mission) {
      throw new NotFoundException(
        `Active mission '${missionTemplateId}' not found in classroom ${classroomId}`,
      );
    }

    return ClassroomMissionResponseDto.fromEntity(mission);
  }

  /**
   * Actualiza una misión de aula
   *
   * @description Actualiza configuración de una misión asignada a un aula.
   * Permite modificar bonificaciones, fechas de vencimiento, metadata, etc.
   *
   * @param classroomId - ID del aula (UUID)
   * @param missionTemplateId - ID del template de misión
   * @param updates - Campos a actualizar
   * @returns Misión actualizada
   *
   * @throws {NotFoundException} Si la misión no existe o no está activa
   *
   * @example
   * const updated = await service.updateClassroomMission(
   *   classroomId,
   *   'daily_complete_exercises',
   *   {
   *     bonus_xp: 20,
   *     is_mandatory: true,
   *     due_date: '2025-12-31T23:59:59Z',
   *   }
   * );
   */
  async updateClassroomMission(
    classroomId: string,
    missionTemplateId: string,
    updates: Partial<Pick<ClassroomMission, 'bonus_xp' | 'bonus_coins' | 'due_date' | 'is_mandatory' | 'metadata'>>,
  ): Promise<ClassroomMissionResponseDto> {
    const mission = await this.classroomMissionsRepo.findOne({
      where: {
        classroom_id: classroomId,
        mission_template_id: missionTemplateId,
        is_active: true,
      },
    });

    if (!mission) {
      throw new NotFoundException(
        `Active mission '${missionTemplateId}' not found in classroom ${classroomId}`,
      );
    }

    // Aplicar actualizaciones
    if (updates.bonus_xp !== undefined) {
      mission.bonus_xp = updates.bonus_xp;
    }
    if (updates.bonus_coins !== undefined) {
      mission.bonus_coins = updates.bonus_coins;
    }
    if (updates.due_date !== undefined) {
      mission.due_date = updates.due_date;
    }
    if (updates.is_mandatory !== undefined) {
      mission.is_mandatory = updates.is_mandatory;
    }
    if (updates.metadata !== undefined) {
      mission.metadata = updates.metadata;
    }

    const saved = await this.classroomMissionsRepo.save(mission);

    this.logger.log(
      `Mission '${missionTemplateId}' updated in classroom ${classroomId}`,
    );

    return ClassroomMissionResponseDto.fromEntity(saved);
  }
}
