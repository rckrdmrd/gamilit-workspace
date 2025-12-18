import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureFlag } from '../entities/feature-flag.entity';
import { CreateFeatureFlagDto, UpdateFeatureFlagDto, FeatureFlagQueryDto, FeatureFlagCheckResultDto } from '../dto/feature-flags';
import { createHash } from 'crypto';

/**
 * FeatureFlagsService
 *
 * @description Servicio para gestión de feature flags con rollout gradual
 * @module AdminModule
 */
@Injectable()
export class FeatureFlagsService {
  constructor(
    @InjectRepository(FeatureFlag, 'auth')
    private readonly featureFlagRepo: Repository<FeatureFlag>,
  ) {}

  /**
   * Obtener todas las feature flags con filtros opcionales
   */
  async findAll(query?: FeatureFlagQueryDto): Promise<FeatureFlag[]> {
    const queryBuilder = this.featureFlagRepo.createQueryBuilder('ff');

    // Aplicar filtros
    if (query?.isEnabled !== undefined) {
      queryBuilder.andWhere('ff.is_enabled = :isEnabled', { isEnabled: query.isEnabled });
    }

    if (query?.category) {
      queryBuilder.andWhere('ff.metadata @> :category', {
        category: JSON.stringify({ category: query.category }),
      });
    }

    return queryBuilder
      .orderBy('ff.feature_name', 'ASC')
      .getMany();
  }

  /**
   * Obtener una feature flag por su key
   */
  async findOne(key: string): Promise<FeatureFlag> {
    const flag = await this.featureFlagRepo.findOne({
      where: { feature_key: key },
      relations: ['creator', 'updater'],
    });

    if (!flag) {
      throw new NotFoundException(`Feature flag with key "${key}" not found`);
    }

    return flag;
  }

  /**
   * Crear una nueva feature flag
   */
  async create(dto: CreateFeatureFlagDto, createdBy?: string): Promise<FeatureFlag> {
    // Verificar que no exista una flag con la misma key
    const existingFlag = await this.featureFlagRepo.findOne({
      where: { feature_key: dto.key },
    });

    if (existingFlag) {
      throw new ConflictException(`Feature flag with key "${dto.key}" already exists`);
    }

    const flag = this.featureFlagRepo.create({
      feature_key: dto.key,
      feature_name: dto.name,
      description: dto.description,
      is_enabled: dto.isEnabled ?? false,
      rollout_percentage: dto.rolloutPercentage ?? 0,
      target_users: dto.targetUsers,
      target_roles: dto.targetRoles,
      target_conditions: dto.targetConditions ?? {},
      metadata: {
        ...dto.metadata,
        category: dto.category,
      },
      created_by: createdBy,
    });

    return this.featureFlagRepo.save(flag);
  }

  /**
   * Actualizar una feature flag existente
   */
  async update(key: string, dto: UpdateFeatureFlagDto, updatedBy?: string): Promise<FeatureFlag> {
    const flag = await this.findOne(key);

    // Actualizar campos
    if (dto.name !== undefined) flag.feature_name = dto.name;
    if (dto.description !== undefined) flag.description = dto.description;
    if (dto.isEnabled !== undefined) flag.is_enabled = dto.isEnabled;
    if (dto.rolloutPercentage !== undefined) flag.rollout_percentage = dto.rolloutPercentage;
    if (dto.targetUsers !== undefined) flag.target_users = dto.targetUsers;
    if (dto.targetRoles !== undefined) flag.target_roles = dto.targetRoles;
    if (dto.targetConditions !== undefined) flag.target_conditions = dto.targetConditions;

    if (dto.metadata !== undefined || dto.category !== undefined) {
      flag.metadata = {
        ...flag.metadata,
        ...dto.metadata,
        ...(dto.category && { category: dto.category }),
      };
    }

    flag.updated_by = updatedBy;

    return this.featureFlagRepo.save(flag);
  }

  /**
   * Eliminar una feature flag
   */
  async remove(key: string): Promise<void> {
    const flag = await this.findOne(key);
    await this.featureFlagRepo.remove(flag);
  }

  /**
   * Verificar si una feature está habilitada para un usuario específico
   * Implementa lógica de rollout gradual basada en hash del userId
   *
   * @param key - Clave de la feature flag
   * @param userId - ID del usuario (opcional)
   * @param userRoles - Roles del usuario (opcional)
   * @returns Promise<FeatureFlagCheckResultDto>
   */
  async isEnabled(
    key: string,
    userId?: string,
    userRoles?: string[],
  ): Promise<FeatureFlagCheckResultDto> {
    try {
      const flag = await this.findOne(key);

      // 1. Verificar si la feature está habilitada globalmente
      if (!flag.is_enabled) {
        return {
          enabled: false,
          reason: 'Feature is disabled globally',
        };
      }

      // 2. Verificar si el usuario está en la lista de target_users (early access)
      if (userId && flag.target_users && flag.target_users.length > 0) {
        if (flag.target_users.includes(userId)) {
          return {
            enabled: true,
            reason: 'User is in target users list',
          };
        }
      }

      // 3. Verificar si el usuario tiene un rol objetivo
      if (userRoles && flag.target_roles && flag.target_roles.length > 0) {
        const hasTargetRole = userRoles.some(role => flag.target_roles?.includes(role as any));
        if (hasTargetRole) {
          return {
            enabled: true,
            reason: 'User has a target role',
          };
        }
      }

      // 4. Verificar rollout percentage
      if (flag.rollout_percentage === 100) {
        return {
          enabled: true,
          reason: 'Feature is enabled for 100% rollout',
        };
      }

      if (flag.rollout_percentage === 0) {
        return {
          enabled: false,
          reason: 'Feature is at 0% rollout',
        };
      }

      // 5. Hash del userId para rollout gradual consistente
      if (userId) {
        const hash = this.hashUserId(userId, key);
        const isInRollout = hash < flag.rollout_percentage;

        return {
          enabled: isInRollout,
          reason: isInRollout
            ? `User is in ${flag.rollout_percentage}% rollout group`
            : `User is not in ${flag.rollout_percentage}% rollout group`,
        };
      }

      // Si no hay userId, usar el rollout percentage como probabilidad
      return {
        enabled: Math.random() * 100 < flag.rollout_percentage,
        reason: `Random selection based on ${flag.rollout_percentage}% rollout`,
      };

    } catch (error) {
      // Si la feature flag no existe, retornar false
      if (error instanceof NotFoundException) {
        return {
          enabled: false,
          reason: 'Feature flag not found',
        };
      }
      throw error;
    }
  }

  /**
   * Generar un hash consistente del userId para rollout gradual
   * El hash es un número entre 0 y 100
   *
   * @param userId - ID del usuario
   * @param featureKey - Clave de la feature (para variar el hash por feature)
   * @returns Número entre 0 y 100
   */
  private hashUserId(userId: string, featureKey: string = ''): number {
    // Crear hash SHA256 del userId + featureKey
    const hash = createHash('sha256')
      .update(`${userId}:${featureKey}`)
      .digest('hex');

    // Tomar los primeros 8 caracteres y convertir a número
    const hashInt = parseInt(hash.substring(0, 8), 16);

    // Convertir a porcentaje (0-100)
    return hashInt % 101;
  }

  /**
   * Habilitar una feature flag
   */
  async enable(key: string, updatedBy?: string): Promise<FeatureFlag> {
    return this.update(key, { isEnabled: true }, updatedBy);
  }

  /**
   * Deshabilitar una feature flag
   */
  async disable(key: string, updatedBy?: string): Promise<FeatureFlag> {
    return this.update(key, { isEnabled: false }, updatedBy);
  }

  /**
   * Actualizar el rollout percentage de una feature flag
   */
  async updateRollout(key: string, percentage: number, updatedBy?: string): Promise<FeatureFlag> {
    return this.update(key, { rolloutPercentage: percentage }, updatedBy);
  }
}
