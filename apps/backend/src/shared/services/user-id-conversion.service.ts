import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '@/modules/auth/entities';

/**
 * UserIdConversionService
 *
 * @description Servicio centralizado para la conversión de IDs de usuario.
 * Resuelve el problema de que muchas tablas tienen FK a profiles.id,
 * pero el JWT contiene auth.users.id.
 *
 * Este servicio evita la duplicación del método getProfileId() que existía
 * en múltiples servicios: MissionsService, ExerciseSubmissionService,
 * ClassroomMissionsService, ExercisesController, etc.
 *
 * @usage
 * ```typescript
 * // En cualquier servicio o controller que necesite convertir userId → profileId
 * constructor(
 *   private readonly userIdConversion: UserIdConversionService,
 * ) {}
 *
 * async someMethod(userId: string) {
 *   const profileId = await this.userIdConversion.getProfileId(userId);
 *   // usar profileId para operaciones con tablas que tienen FK a profiles.id
 * }
 * ```
 *
 * @see Entity: Profile (@/modules/auth/entities/profile.entity)
 * @see DDL: /apps/database/ddl/schemas/auth_management/tables/03-profiles.sql
 */
@Injectable()
export class UserIdConversionService {
  constructor(
    @InjectRepository(Profile, 'auth')
    private readonly profileRepo: Repository<Profile>,
  ) {}

  /**
   * Convierte auth.users.id a profiles.id
   *
   * @description Muchas tablas del sistema (missions, exercise_submissions, etc.)
   * tienen FK a profiles.id, pero el JWT contiene auth.users.id. Este método
   * realiza la conversión necesaria.
   *
   * @param userId - auth.users.id (extraído del JWT token)
   * @returns profiles.id correspondiente
   * @throws NotFoundException si el perfil no existe para el userId dado
   *
   * @example
   * ```typescript
   * const profileId = await this.userIdConversion.getProfileId(req.user.id);
   * // profileId ahora puede usarse para queries a tablas con FK a profiles
   * ```
   */
  async getProfileId(userId: string): Promise<string> {
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
   * Convierte auth.users.id a profile completo
   *
   * @description Similar a getProfileId pero retorna el perfil completo
   * cuando se necesitan más datos además del ID.
   *
   * @param userId - auth.users.id (extraído del JWT token)
   * @returns Entidad Profile completa
   * @throws NotFoundException si el perfil no existe
   */
  async getProfile(userId: string): Promise<Profile> {
    const profile = await this.profileRepo.findOne({
      where: { user_id: userId },
    });

    if (!profile) {
      throw new NotFoundException(`Profile not found for user ${userId}`);
    }

    return profile;
  }

  /**
   * Convierte múltiples auth.users.id a profiles.id
   *
   * @description Útil cuando se necesita convertir varios IDs de una vez
   * (ej: lista de estudiantes en una clase).
   *
   * @param userIds - Array de auth.users.id
   * @returns Map<userId, profileId>
   */
  async getProfileIds(userIds: string[]): Promise<Map<string, string>> {
    if (userIds.length === 0) {
      return new Map();
    }

    const profiles = await this.profileRepo
      .createQueryBuilder('profile')
      .select(['profile.id', 'profile.user_id'])
      .where('profile.user_id IN (:...userIds)', { userIds })
      .getMany();

    const result = new Map<string, string>();
    for (const profile of profiles) {
      // user_id no puede ser null porque filtramos por user_id IN (:...userIds)
      // Validación explícita para satisfacer TypeScript
      if (profile.user_id) {
        result.set(profile.user_id, profile.id);
      }
    }

    return result;
  }

  /**
   * Verifica si existe un perfil para el userId dado
   *
   * @param userId - auth.users.id
   * @returns true si existe, false si no
   */
  async profileExists(userId: string): Promise<boolean> {
    const count = await this.profileRepo.count({
      where: { user_id: userId },
    });
    return count > 0;
  }
}
