import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRank } from '../entities';
import { UserStatsService } from './user-stats.service';
import { MLCoinsService } from './ml-coins.service';
import { CreateUserRankDto, UpdateUserRankDto } from '../dto/user-ranks';
import { MayaRank, TransactionTypeEnum } from '@shared/constants/enums.constants';

/**
 * RankConfig Interface
 * Configuración de cada rango maya
 */
interface RankConfig {
  xp_min: number;
  xp_max: number;
  ml_coins_bonus: number;
  next_rank: MayaRank | null;
  name: string;
  description: string;
  order: number;
}

/**
 * RankProgressDto Interface
 * Información de progreso hacia el siguiente rango
 */
export interface RankProgressDto {
  current_rank: MayaRank;
  next_rank: MayaRank | null;
  progress_percentage: number;
  xp_current: number;
  xp_required: number;
  xp_remaining: number;
  ml_coins_bonus_on_promotion: number;
  is_max_rank: boolean;
}

/**
 * RanksService
 *
 * Servicio para gestión del sistema de rangos maya
 * - Progresión de rangos basada en XP
 * - Promoción automática entre rangos
 * - Historial de rangos del usuario
 * - Cálculo de progreso y bonos
 */
@Injectable()
export class RanksService {
  private readonly logger = new Logger(RanksService.name);

  /**
   * Configuración de rangos maya v2.1
   * Define XP requerida, bonos y progresión
   *
   * FIX 2025-11-29: Actualizado a v2.1 para coincidir con DB.
   * - Halach Uinic xp_max: 2249 → 1899
   * - K'uk'ulkan xp_min: 2250 → 1900
   *
   * IMPORTANTE: Estos valores DEBEN coincidir con:
   * - apps/database/seeds/prod/gamification_system/03-maya_ranks.sql
   * Ver: docs/90-transversal/correcciones/CORRECCION-GAMIFICACION-RANGOS-2025-11-29.md
   *
   * VERSIÓN: 2.1 (2025-11-29)
   */
  private readonly RANK_CONFIG: Record<MayaRank, RankConfig> = {
    [MayaRank.AJAW]: {
      xp_min: 0,
      xp_max: 499,
      ml_coins_bonus: 0,
      next_rank: MayaRank.NACOM,
      name: 'Ajaw',
      description: 'Señor - Inicio del camino del conocimiento',
      order: 1,
    },
    [MayaRank.NACOM]: {
      xp_min: 500,
      xp_max: 999,
      ml_coins_bonus: 100,
      next_rank: MayaRank.AH_KIN,
      name: 'Nacom',
      description: 'Capitán de Guerra - Guerrero en entrenamiento',
      order: 2,
    },
    [MayaRank.AH_KIN]: {
      xp_min: 1000,
      xp_max: 1499,
      ml_coins_bonus: 250,
      next_rank: MayaRank.HALACH_UINIC,
      name: "Ah K'in",
      description: 'Sacerdote del Sol - Guía del conocimiento',
      order: 3,
    },
    [MayaRank.HALACH_UINIC]: {
      xp_min: 1500,
      xp_max: 1899,
      ml_coins_bonus: 500,
      next_rank: MayaRank.KUKULKAN,
      name: 'Halach Uinic',
      description: 'Hombre Verdadero - Líder de la comunidad',
      order: 4,
    },
    [MayaRank.KUKULKAN]: {
      xp_min: 1900,
      xp_max: Infinity,
      ml_coins_bonus: 1000,
      next_rank: null,
      name: "K'uk'ulkan",
      description: 'Serpiente Emplumada - Maestro legendario',
      order: 5,
    },
  };

  constructor(
    @InjectRepository(UserRank, 'gamification')
    private readonly userRankRepo: Repository<UserRank>,
    private readonly userStatsService: UserStatsService,
    private readonly mlCoinsService: MLCoinsService,
  ) {}

  /**
   * Obtiene el rango actual del usuario
   * FIX 2026-01-04: Si no existe, crea rango por defecto en lugar de lanzar NotFoundException
   * @param userId - ID del usuario
   * @returns Rango actual (is_current = true)
   */
  async getCurrentRank(userId: string): Promise<UserRank> {
    const currentRank = await this.userRankRepo.findOne({
      where: {
        user_id: userId,
        is_current: true,
      },
    });

    if (!currentRank) {
      // FIX 2026-01-04: Crear rango por defecto en lugar de lanzar NotFoundException
      // Esto previene que el dashboard falle completamente si el usuario no fue inicializado
      this.logger.warn(
        `User ${userId} has no current rank. Creating default rank (Ajaw).`,
      );
      return this.initializeDefaultRank(userId);
    }

    return currentRank;
  }

  /**
   * Inicializa el rango por defecto (Ajaw) para un usuario sin rango
   * FIX 2026-01-04: Creado para manejar usuarios con datos de gamificacion incompletos
   * @param userId - ID del usuario
   * @returns Nuevo registro de rango
   */
  private async initializeDefaultRank(userId: string): Promise<UserRank> {
    // Verificar si ya existe algun rango (aunque no sea current)
    const existingRank = await this.userRankRepo.findOne({
      where: { user_id: userId },
      order: { achieved_at: 'DESC' },
    });

    if (existingRank) {
      // Hay rango pero no es current, marcarlo como current
      existingRank.is_current = true;
      const saved = await this.userRankRepo.save(existingRank);
      this.logger.log(
        `User ${userId} rank ${existingRank.current_rank} marked as current`,
      );
      return saved;
    }

    // No hay ningun rango, crear Ajaw por defecto
    const newRank = this.userRankRepo.create({
      user_id: userId,
      current_rank: MayaRank.AJAW,
      is_current: true,
      achieved_at: new Date(),
      rank_progress_percentage: 0,
      xp_earned_for_rank: 0,
      ml_coins_bonus: 0,
      rank_metadata: {
        created_by: 'auto_initialize',
        reason: 'User had no rank on getCurrentRank call',
        created_at: new Date().toISOString(),
      },
    });

    const savedRank = await this.userRankRepo.save(newRank);
    this.logger.log(
      `User ${userId} initialized with default rank Ajaw (auto-created)`,
    );
    return savedRank;
  }

  /**
   * Obtiene el historial completo de rangos del usuario
   * @param userId - ID del usuario
   * @returns Array de rangos ordenados por fecha
   */
  async getUserRankHistory(userId: string): Promise<UserRank[]> {
    return this.userRankRepo.find({
      where: { user_id: userId },
      order: { achieved_at: 'DESC' },
    });
  }

  /**
   * Calcula el progreso del usuario hacia el siguiente rango
   * @param userId - ID del usuario
   * @returns Información de progreso detallada
   */
  async calculateRankProgress(userId: string): Promise<RankProgressDto> {
    const currentRank = await this.getCurrentRank(userId);
    const userStats = await this.userStatsService.findByUserId(userId);

    const currentXP = userStats.total_xp;
    const rankConfig = this.getRankConfig(currentRank.current_rank);
    const nextRank = rankConfig.next_rank;

    // Si ya está en el rango máximo
    if (!nextRank) {
      return {
        current_rank: currentRank.current_rank,
        next_rank: null,
        progress_percentage: 100,
        xp_current: currentXP,
        xp_required: rankConfig.xp_max,
        xp_remaining: 0,
        ml_coins_bonus_on_promotion: 0,
        is_max_rank: true,
      };
    }

    const nextRankConfig = this.getRankConfig(nextRank);
    const xpRequired = nextRankConfig.xp_min;
    const xpRemaining = Math.max(0, xpRequired - currentXP);

    // Calcular porcentaje de progreso
    const xpRangeStart = rankConfig.xp_min;
    const xpRangeEnd = nextRankConfig.xp_min;
    const xpInRange = currentXP - xpRangeStart;
    const xpRangeTotal = xpRangeEnd - xpRangeStart;
    const progressPercentage = Math.min(
      100,
      Math.max(0, Math.floor((xpInRange / xpRangeTotal) * 100)),
    );

    return {
      current_rank: currentRank.current_rank,
      next_rank: nextRank,
      progress_percentage: progressPercentage,
      xp_current: currentXP,
      xp_required: xpRequired,
      xp_remaining: xpRemaining,
      ml_coins_bonus_on_promotion: nextRankConfig.ml_coins_bonus,
      is_max_rank: false,
    };
  }

  /**
   * Verifica si el usuario cumple los requisitos para promoción
   * @param userId - ID del usuario
   * @returns true si cumple requisitos, false en caso contrario
   */
  async checkPromotionEligibility(userId: string): Promise<boolean> {
    try {
      const progress = await this.calculateRankProgress(userId);

      // No puede promocionar si ya está en rango máximo
      if (progress.is_max_rank) {
        return false;
      }

      // Puede promocionar si tiene 0 XP restante
      return progress.xp_remaining === 0;
    } catch (error: any) {
      this.logger.error(
        `Error checking promotion eligibility for user ${userId}: ${error?.message || error}`,
      );
      return false;
    }
  }

  /**
   * Promueve al usuario al siguiente rango
   * @param userId - ID del usuario
   * @returns Nuevo registro de rango
   * @throws BadRequestException si no cumple requisitos
   */
  async promoteToNextRank(userId: string): Promise<UserRank> {
    const currentRank = await this.getCurrentRank(userId);
    const isEligible = await this.checkPromotionEligibility(userId);

    if (!isEligible) {
      throw new BadRequestException(
        `User ${userId} is not eligible for promotion. Check XP requirements.`,
      );
    }

    const currentRankConfig = this.getRankConfig(currentRank.current_rank);
    const nextRank = currentRankConfig.next_rank;

    if (!nextRank) {
      throw new BadRequestException(
        `User ${userId} is already at maximum rank.`,
      );
    }

    const userStats = await this.userStatsService.findByUserId(userId);
    const nextRankConfig = this.getRankConfig(nextRank);

    // Iniciar transacción: marcar rango anterior como no actual
    currentRank.is_current = false;
    await this.userRankRepo.save(currentRank);

    // Crear nuevo registro de rango
    const newRank = this.userRankRepo.create({
      user_id: userId,
      tenant_id: currentRank.tenant_id,
      current_rank: nextRank,
      previous_rank: currentRank.current_rank,
      rank_progress_percentage: 0,
      xp_earned_for_rank: userStats.total_xp,
      ml_coins_bonus: nextRankConfig.ml_coins_bonus,
      achieved_at: new Date(),
      previous_rank_achieved_at: currentRank.achieved_at,
      is_current: true,
      rank_metadata: {
        promoted_at: new Date().toISOString(),
        previous_rank: currentRank.current_rank,
        xp_at_promotion: userStats.total_xp,
      },
    });

    const savedRank = await this.userRankRepo.save(newRank);

    // Otorgar bono de ML Coins por promoción
    if (nextRankConfig.ml_coins_bonus > 0) {
      await this.mlCoinsService.addCoins(
        userId,
        nextRankConfig.ml_coins_bonus,
        TransactionTypeEnum.EARNED_RANK,
        `Rank promotion to ${nextRank}`,
        savedRank.id,
        'user_rank',
      );

      this.logger.log(
        `User ${userId} promoted to ${nextRank}. Awarded ${nextRankConfig.ml_coins_bonus} ML Coins.`,
      );
    }

    // Actualizar current_rank en UserStats
    await this.userStatsService.updateStats(userId, {
      current_rank: nextRank,
    });

    return savedRank;
  }

  /**
   * Obtiene la configuración de un rango específico
   * @param rank - Rango maya
   * @returns Configuración del rango
   */
  getRankConfig(rank: MayaRank): RankConfig {
    const config = this.RANK_CONFIG[rank];
    if (!config) {
      throw new BadRequestException(`Invalid rank: ${rank}`);
    }
    return config;
  }

  /**
   * Obtiene la configuración de todos los rangos
   * @returns Array con metadata de todos los rangos
   */
  getAllRanksConfig(): RankConfig[] {
    return Object.values(this.RANK_CONFIG).sort((a, b) => a.order - b.order);
  }

  // =========================================================================
  // MÉTODOS ADMIN
  // =========================================================================

  /**
   * Crea un nuevo registro de rango manualmente (admin)
   * @param createDto - DTO con datos del rango
   * @returns Registro de rango creado
   */
  async createRank(createDto: CreateUserRankDto): Promise<UserRank> {
    // Si is_current=true, marcar otros rangos del usuario como no actuales
    if (createDto.is_current) {
      await this.userRankRepo
        .createQueryBuilder()
        .update(UserRank)
        .set({ is_current: false })
        .where('user_id = :userId AND is_current = :isCurrent', {
          userId: createDto.user_id,
          isCurrent: true,
        })
        .execute();
    }

    const newRank = this.userRankRepo.create(createDto as any);
    const saved = await this.userRankRepo.save(newRank);
    return saved as unknown as UserRank;
  }

  /**
   * Actualiza un registro de rango manualmente (admin)
   * @param rankId - ID del registro de rango
   * @param updateDto - DTO con datos a actualizar
   * @returns Registro de rango actualizado
   */
  async updateRank(
    rankId: string,
    updateDto: UpdateUserRankDto,
  ): Promise<UserRank> {
    const rank = await this.userRankRepo.findOne({
      where: { id: rankId },
    });

    if (!rank) {
      throw new NotFoundException(`Rank record ${rankId} not found`);
    }

    // Si se está marcando como actual, desmarcar otros del mismo usuario
    if (updateDto.is_current === true) {
      await this.userRankRepo
        .createQueryBuilder()
        .update(UserRank)
        .set({ is_current: false })
        .where('user_id = :userId AND is_current = :isCurrent', {
          userId: rank.user_id,
          isCurrent: true,
        })
        .execute();
    }

    Object.assign(rank, updateDto);
    return this.userRankRepo.save(rank);
  }

  /**
   * Elimina un registro de rango (admin)
   * @param rankId - ID del registro de rango
   * @throws BadRequestException si intenta eliminar el rango actual
   */
  async deleteRank(rankId: string): Promise<void> {
    const rank = await this.userRankRepo.findOne({
      where: { id: rankId },
    });

    if (!rank) {
      throw new NotFoundException(`Rank record ${rankId} not found`);
    }

    if (rank.is_current) {
      throw new BadRequestException(
        'Cannot delete current rank. Set another rank as current first.',
      );
    }

    await this.userRankRepo.delete({ id: rankId });
    this.logger.log(`Rank record ${rankId} deleted`);
  }

  /**
   * Obtiene un registro de rango por ID
   * @param rankId - ID del registro de rango
   * @returns Registro de rango
   */
  async findById(rankId: string): Promise<UserRank> {
    const rank = await this.userRankRepo.findOne({
      where: { id: rankId },
    });

    if (!rank) {
      throw new NotFoundException(`Rank record ${rankId} not found`);
    }

    return rank;
  }

  // =========================================================================
  // MÉTODOS COMPUESTOS PARA FRONTEND
  // =========================================================================

  /**
   * Obtiene el progreso completo del usuario con todos los campos que el frontend necesita
   *
   * @task TASK-2026-01-17-002 - FASE 1
   * @description Compone datos de UserStats + UserRank + campos calculados
   * @param userId - ID del usuario
   * @returns UserRankProgressResponseDto con todos los campos necesarios
   */
  async getFullUserProgress(userId: string): Promise<{
    userId: string;
    currentRank: MayaRank;
    nextRank: MayaRank | null;
    level: number;
    totalXp: number;
    xpToNextLevel: number;
    mlCoinsEarned: number;
    rankProgressPercentage: number;
    xpRequiredForNextRank: number;
    xpRemainingForNextRank: number;
    canRankUp: boolean;
    isMaxRank: boolean;
    activityStreak: number;
    lastActivityAt: Date | null;
    lastRankUp: Date | null;
    mlCoinsBonusOnPromotion: number;
    multiplier: number;
  }> {
    // Get base data
    const userStats = await this.userStatsService.findByUserId(userId);
    const rankProgress = await this.calculateRankProgress(userId);
    const currentRankEntity = await this.getCurrentRank(userId);

    // Get rank config for multiplier
    const rankConfig = this.getRankConfig(userStats.current_rank as MayaRank);

    // Calculate multiplier (base from rank + potential streak bonus)
    const baseMultiplier = this.calculateMultiplierForRank(userStats.current_rank as MayaRank);
    const streakBonus = this.calculateStreakBonus(userStats.current_streak);
    const totalMultiplier = Number((baseMultiplier + streakBonus).toFixed(2));

    return {
      userId,
      currentRank: userStats.current_rank as MayaRank,
      nextRank: rankProgress.next_rank,
      level: userStats.level,
      totalXp: userStats.total_xp,
      xpToNextLevel: userStats.xp_to_next_level,
      mlCoinsEarned: userStats.ml_coins_earned_total,
      rankProgressPercentage: rankProgress.progress_percentage,
      xpRequiredForNextRank: rankProgress.xp_required,
      xpRemainingForNextRank: rankProgress.xp_remaining,
      canRankUp: rankProgress.xp_remaining === 0 && !rankProgress.is_max_rank,
      isMaxRank: rankProgress.is_max_rank,
      activityStreak: userStats.current_streak,
      lastActivityAt: userStats.last_activity_at ?? null,
      lastRankUp: currentRankEntity.achieved_at ?? null,
      mlCoinsBonusOnPromotion: rankProgress.ml_coins_bonus_on_promotion,
      multiplier: totalMultiplier,
    };
  }

  /**
   * Calculate base multiplier for a rank
   */
  private calculateMultiplierForRank(rank: MayaRank): number {
    const multipliers: Record<MayaRank, number> = {
      [MayaRank.AJAW]: 1.0,
      [MayaRank.NACOM]: 1.1,
      [MayaRank.AH_KIN]: 1.25,
      [MayaRank.HALACH_UINIC]: 1.5,
      [MayaRank.KUKULKAN]: 2.0,
    };
    return multipliers[rank] ?? 1.0;
  }

  /**
   * Calculate streak bonus (0.01 per day, max 0.25)
   */
  private calculateStreakBonus(streak: number): number {
    const bonusPerDay = 0.01;
    const maxBonus = 0.25;
    return Math.min(streak * bonusPerDay, maxBonus);
  }

  /**
   * Get multiplier breakdown for a user
   *
   * @task TASK-2026-01-17-002 - FASE 1
   * @description Returns detailed breakdown of all multiplier sources
   * @param userId - ID del usuario
   * @returns Object with multiplier breakdown data
   */
  async getMultiplierBreakdown(userId: string): Promise<{
    userId: string;
    rankName: string;
    rankMultiplier: number;
    streakBonus: number;
    currentStreak: number;
  }> {
    const userStats = await this.userStatsService.findByUserId(userId);
    const rank = userStats.current_rank as MayaRank;
    const rankConfig = this.getRankConfig(rank);

    const rankMultiplier = this.calculateMultiplierForRank(rank);
    const streakBonus = this.calculateStreakBonus(userStats.current_streak);

    return {
      userId,
      rankName: rankConfig.name,
      rankMultiplier,
      streakBonus,
      currentStreak: userStats.current_streak,
    };
  }
}
