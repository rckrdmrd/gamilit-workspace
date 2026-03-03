import { Injectable } from '@nestjs/common';
import {
  UserStatsNotFoundError,
  ProfileNotFoundError,
  UserStatsAlreadyExistsError,
  NonNumericFieldError,
} from '../errors/gamification.errors';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserStats, MLCoinsTransaction } from '../entities';
import { UserGamificationSummaryDto } from '../dto/user-gamification-summary.dto';
// CORR-CASCADA-001: Import MayaRank para alinear con entity corregida
// ADR-052: Import TransactionTypeEnum for WELCOME_BONUS transaction
import { MayaRank, TransactionTypeEnum } from '@shared/constants/enums.constants';
// P0-001: Import Profile para validación de existencia
import { Profile } from '@/modules/auth/entities/profile.entity';

/**
 * UserStatsService
 *
 * Gestión de estadísticas de usuario en el sistema de gamificación
 * - CRUD de stats
 * - Lógica de promoción de rango
 * - Cálculo automático de nivel basado en XP
 */
@Injectable()
export class UserStatsService {
  // Configuración de niveles - Formula cuadrática (sincronizada con DB)
  // Ver: apps/database/ddl/schemas/gamification_system/functions/calculate_level_from_xp.sql
  // Formula DB: FLOOR(SQRT(XP / 100.0)) + 1
  private readonly XP_BASE = 100; // Base para cálculo cuadrático

  // Rangos disponibles en el sistema (ordenado de menor a mayor)
  // CORR-CASCADA-001: Usar valores de MayaRank enum
  private readonly RANKS: MayaRank[] = [
    MayaRank.AJAW,
    MayaRank.NACOM,
    MayaRank.AH_KIN,
    MayaRank.HALACH_UINIC,
    MayaRank.KUKULKAN,
  ];

  constructor(
    @InjectRepository(UserStats, 'gamification')
    private readonly userStatsRepo: Repository<UserStats>,
    // P0-001: Agregar Profile repository para validación
    @InjectRepository(Profile, 'auth')
    private readonly profileRepo: Repository<Profile>,
    // ADR-052: Inject MLCoinsTransaction repo for WELCOME_BONUS audit trail
    @InjectRepository(MLCoinsTransaction, 'gamification')
    private readonly transactionRepo: Repository<MLCoinsTransaction>,
  ) { }

  /**
   * P0-001: Verifica que el perfil existe antes de operaciones de gamificación
   *
   * CORR-GAM-002: Este método resuelve auth.users.id → profiles.id
   *
   * El frontend envía auth.users.id (o profiles.user_id), pero user_stats.user_id
   * referencia profiles.id (PK). Este método busca el profile por su FK a auth.users
   * y retorna el profile completo para que el caller pueda usar profile.id.
   *
   * @param authUserId - El ID del usuario en auth.users (= profiles.user_id FK)
   * @returns Profile si existe (usar profile.id para operaciones con user_stats)
   * @throws NotFoundException si el perfil no existe
   */
  private async validateProfileExists(authUserId: string): Promise<Profile> {
    // DB-125: Try profile.id first (JWT sub = profiles.id for registered users)
    const profileById = await this.profileRepo.findOne({
      where: { id: authUserId },
    });

    if (profileById) {
      return profileById;
    }

    // Fallback: authUserId might be auth.users.id (seeded users where profiles.id ≠ auth.users.id)
    const profileByUserId = await this.profileRepo.findOne({
      where: { user_id: authUserId },
    });

    if (!profileByUserId) {
      throw new ProfileNotFoundError(authUserId);
    }

    return profileByUserId;
  }

  /**
   * CORR-GAM-002: Resuelve auth.users.id → profiles.id
   *
   * @param authUserId - ID del usuario en auth.users (= profiles.user_id)
   * @returns profiles.id (PK) para usar con user_stats
   */
  private async resolveProfileId(authUserId: string): Promise<string> {
    const profile = await this.validateProfileExists(authUserId);
    return profile.id;
  }

  /**
   * Encuentra estadísticas de usuario por ID
   *
   * CORR-GAM-002: Resuelve auth.users.id → profiles.id antes de buscar
   *
   * @param authUserId - ID del usuario en auth.users (lo que envía el frontend)
   * @returns UserStats asociadas al profile
   */
  async findByUserId(authUserId: string): Promise<UserStats> {
    // CORR-GAM-002: Resolver auth.users.id → profiles.id
    const profileId = await this.resolveProfileId(authUserId);

    const stats = await this.userStatsRepo.findOne({
      where: { user_id: profileId },  // user_stats.user_id = profiles.id
    });

    if (!stats) {
      throw new UserStatsNotFoundError(authUserId);
    }

    return stats;
  }

  /**
   * Crea un nuevo registro de estadísticas para un usuario
   *
   * P0-001: Agregada validación de profile antes de crear
   * CORR-GAM-002: Usa profile.id (PK) para user_stats.user_id, no auth.users.id
   *
   * @param authUserId - ID del usuario en auth.users (lo que envía el frontend)
   * @param tenantId - Opcional, se usa el del profile si no se proporciona
   */
  async create(authUserId: string, tenantId?: string): Promise<UserStats> {
    // P0-001: Verificar que el profile existe y obtener su ID
    // CORR-GAM-002: validateProfileExists busca por profiles.user_id = authUserId
    const profile = await this.validateProfileExists(authUserId);

    // CORR-GAM-002: Buscar existente usando profile.id (PK), no authUserId
    const existingStats = await this.userStatsRepo.findOne({
      where: { user_id: profile.id },
    });

    if (existingStats) {
      throw new UserStatsAlreadyExistsError(authUserId);
    }

    // Usar tenant_id del profile si no se proporciona
    const effectiveTenantId = tenantId || profile.tenant_id;

    // CORR-GAM-002: Usar profile.id para user_stats.user_id (FK → profiles.id)
    const newStats = this.userStatsRepo.create({
      user_id: profile.id,  // profiles.id (PK), NO auth.users.id
      tenant_id: effectiveTenantId,
      level: 1,
      total_xp: 0,
      xp_to_next_level: this.calculateXpForLevel(2), // XP needed to reach level 2
      current_rank: this.RANKS[0],
      ml_coins: 100,
      ml_coins_earned_total: 100,
      ml_coins_spent_total: 0,
      current_streak: 0,
      max_streak: 0,
      days_active_total: 0,
      exercises_completed: 0,
      modules_completed: 0,
      total_score: 0,
      achievements_earned: 0,
      certificates_earned: 0,
      sessions_count: 0,
      metadata: {},
    });

    const savedStats = await this.userStatsRepo.save(newStats);

    // ADR-052: Create WELCOME_BONUS transaction record for audit trail
    // The ml_coins=100 is already set on user_stats; this record ensures
    // auditBalance() can reconcile without the legacy +100 hardcoded offset.
    const welcomeTransaction = this.transactionRepo.create({
      user_id: profile.id,
      amount: 100,
      balance_before: 0,
      balance_after: 100,
      transaction_type: TransactionTypeEnum.WELCOME_BONUS,
      description: 'Bonus de bienvenida - ML Coins iniciales',
      reference_type: 'welcome',
      metadata: {},
    });
    await this.transactionRepo.save(welcomeTransaction);

    return savedStats;
  }

  /**
   * Actualiza múltiples campos de estadísticas
   */
  async updateStats(
    userId: string,
    updates: Partial<UserStats>,
  ): Promise<UserStats> {
    const stats = await this.findByUserId(userId);
    Object.assign(stats, updates);
    return this.userStatsRepo.save(stats);
  }

  /**
   * Incrementa un campo numérico de estadísticas
   */
  async incrementField(
    userId: string,
    field: keyof UserStats,
    amount: number = 1,
  ): Promise<UserStats> {
    const stats = await this.findByUserId(userId);
    const currentValue = stats[field];

    if (typeof currentValue !== 'number') {
      throw new NonNumericFieldError(field as string);
    }

    (stats[field] as number) = (currentValue as number) + amount;
    return this.userStatsRepo.save(stats);
  }

  /**
   * Decrementa un campo numérico de estadísticas
   */
  async decrementField(
    userId: string,
    field: keyof UserStats,
    amount: number = 1,
  ): Promise<UserStats> {
    return this.incrementField(userId, field, -amount);
  }

  /**
   * Añade XP al usuario
   *
   * FIX 2025-11-24: Simplificado para solo acumular XP.
   * La promoción de rango es manejada automáticamente por el trigger
   * trg_check_rank_promotion_on_xp_gain en la base de datos.
   *
   * Ver: apps/database/ddl/schemas/gamification_system/triggers/trg_check_rank_promotion_on_xp_gain.sql
   * Documentación: docs/01-fase-alcance-inicial/EAI-003-gamificacion/especificaciones/ET-GAM-003-rangos-maya.md
   *
   * @param userId - ID del usuario
   * @param xpAmount - Cantidad de XP a añadir
   * @returns UserStats actualizado con nuevo total_xp
   */
  async addXp(userId: string, xpAmount: number): Promise<UserStats> {
    const stats = await this.findByUserId(userId);

    // Solo acumular XP total
    // El trigger de base de datos se encarga automáticamente de:
    // 1. Verificar si alcanzó umbral de próximo rango
    // 2. Llamar a check_rank_promotion()
    // 3. Promover con promote_to_next_rank() si corresponde
    // 4. Actualizar current_rank, otorgar ML Coins bonus, etc.
    stats.total_xp += xpAmount;

    // Guardar (el trigger AFTER UPDATE se ejecuta automáticamente)
    return this.userStatsRepo.save(stats);
  }

  /**
   * @deprecated 2025-11-24 - Ya no se usa. La promoción de rango es manejada
   * automáticamente por el trigger trg_check_rank_promotion_on_xp_gain en la base de datos.
   * Este método será eliminado en versiones futuras.
   *
   * Verifica si el usuario debe ser promovido de rango
   * Lógica: cada X niveles, promoción a siguiente rango
   */
  private async checkRankPromotion(stats: UserStats): Promise<void> {
    const currentRankIndex = this.RANKS.indexOf(stats.current_rank);

    // Calcular threshold del rank actual y siguiente
    const currentRankMinLevel = currentRankIndex * 5;
    const nextRankMinLevel = (currentRankIndex + 1) * 5;

    // FIX: Si el usuario está por debajo del nivel mínimo del rank actual, degradar
    if (stats.level < currentRankMinLevel && currentRankIndex > 0) {
      // Encontrar el rank correcto para el nivel actual
      const correctRankIndex = Math.floor(stats.level / 5);
      stats.current_rank = this.RANKS[correctRankIndex];

      // Recalcular con el rank correcto
      const newCurrentRankMinLevel = correctRankIndex * 5;
      const newNextRankMinLevel = (correctRankIndex + 1) * 5;
      stats.rank_progress = Math.max(0,
        ((stats.level - newCurrentRankMinLevel) / (newNextRankMinLevel - newCurrentRankMinLevel)) * 100,
      );
      return;
    }

    // Si ya está en el rango máximo, no hace nada
    if (currentRankIndex >= this.RANKS.length - 1) {
      stats.rank_progress = 100; // Máximo rank alcanzado
      return;
    }

    // Verificar si debe ser promovido
    if (stats.level >= nextRankMinLevel) {
      stats.current_rank = this.RANKS[currentRankIndex + 1];
      stats.rank_progress = 0;
    } else {
      // Calcular progreso hacia el siguiente rango
      // FIX: Usar Math.max para evitar valores negativos
      stats.rank_progress = Math.max(0,
        ((stats.level - currentRankMinLevel) / (nextRankMinLevel - currentRankMinLevel)) * 100,
      );
    }
  }

  /**
   * Calcula XP necesaria para alcanzar un nivel específico
   *
   * Formula sincronizada con DB (ADR-016):
   * - DB calcula nivel: FLOOR(SQRT(XP / 100)) + 1
   * - Backend calcula XP: 100 * (nivel - 1)^2
   *
   * @example
   * Nivel 1: 100 * (1-1)^2 = 0 XP
   * Nivel 2: 100 * (2-1)^2 = 100 XP
   * Nivel 3: 100 * (3-1)^2 = 400 XP
   * Nivel 4: 100 * (4-1)^2 = 900 XP
   * Nivel 5: 100 * (5-1)^2 = 1600 XP
   */
  private calculateXpForLevel(level: number): number {
    // Formula cuadrática: XP = BASE * (level - 1)^2
    return this.XP_BASE * Math.pow(level - 1, 2);
  }

  /**
   * Calcula el nivel basado en XP total
   *
   * Formula sincronizada con DB:
   * Level = FLOOR(SQRT(XP / 100)) + 1
   */
  private calculateLevelFromXp(xp: number): number {
    return Math.floor(Math.sqrt(xp / this.XP_BASE)) + 1;
  }

  /**
   * Obtiene ranking global basado en XP
   */
  async getGlobalRanking(limit: number = 100): Promise<UserStats[]> {
    return this.userStatsRepo.find({
      order: { total_xp: 'DESC' },
      take: limit,
    });
  }

  /**
   * Obtiene ranking por tenant
   */
  async getTenantRanking(tenantId: string, limit: number = 100): Promise<UserStats[]> {
    return this.userStatsRepo.find({
      where: { tenant_id: tenantId },
      order: { total_xp: 'DESC' },
      take: limit,
    });
  }

  /**
   * Obtiene top usuarios por nivel
   */
  async getTopByLevel(limit: number = 50): Promise<UserStats[]> {
    return this.userStatsRepo.find({
      order: { level: 'DESC', total_xp: 'DESC' },
      take: limit,
    });
  }

  /**
   * Obtiene resumen de gamificación del usuario
   *
   * @description Retorna un resumen consolidado de gamificación para uso en portales Admin/Teacher.
   * Si el usuario no tiene stats, crea un registro inicial automáticamente.
   *
   * @param userId - User UUID
   * @returns UserGamificationSummaryDto con estado actual de gamificación
   *
   * @usage Frontend: useUserGamification hook
   * @endpoint GET /api/v1/gamification/users/:userId/summary
   *
   * @example
   * const summary = await userStatsService.getUserGamificationSummary('550e8400-e29b-41d4-a716-446655440000');
   * // Returns: { userId, level: 5, totalXP: 2500, mlCoins: 150, rank: 'Nacom', ... }
   */
  async getUserGamificationSummary(userId: string): Promise<UserGamificationSummaryDto> {
    // 1. Obtener user_stats (o crear si no existe)
    let userStats: UserStats;

    try {
      userStats = await this.findByUserId(userId);
    } catch (error) {
      if (error instanceof UserStatsNotFoundError) {
        // Si no existe, crear registro inicial
        userStats = await this.create(userId);
      } else {
        throw error;
      }
    }

    // 2. Calcular progreso a siguiente nivel
    // XP acumulada desde el nivel actual
    const xpForCurrentLevel = this.calculateXpForLevel(userStats.level - 1);
    const xpForNextLevel = this.calculateXpForLevel(userStats.level);
    const xpInCurrentLevel = Math.max(0, userStats.total_xp - xpForCurrentLevel);
    const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
    const progressPercent = Math.min(100, Math.max(0, Math.floor((xpInCurrentLevel / xpNeededForLevel) * 100)));
    const xpToNext = Math.max(0, xpForNextLevel - userStats.total_xp);

    // 3. Obtener achievements (de user_achievements si existe)
    // FIXME: user_achievements table exists — integrate via AchievementsService to return actual achievements instead of empty array
    const achievements: string[] = [];
    const totalAchievements = userStats.achievements_earned || 0;

    // 4. Determinar color del rank (basado en current_rank)
    const rankColors: Record<string, string> = {
      'Ajaw': '#9E9E9E',           // Gris - Novato
      'Nacom': '#4CAF50',          // Verde - Explorador
      "Ah K'in": '#2196F3',        // Azul - Investigador
      'Halach Uinic': '#9C27B0',   // Morado - Maestro
      "K'uk'ulkan": '#FF9800',     // Naranja - Sabio/Leyenda
    };

    // 5. Construir y retornar DTO
    const summary: UserGamificationSummaryDto = {
      userId,
      level: userStats.level,
      totalXP: userStats.total_xp,
      mlCoins: userStats.ml_coins,
      rank: userStats.current_rank,
      rankColor: rankColors[userStats.current_rank] || '#9E9E9E',
      progressToNextLevel: progressPercent,
      xpToNextLevel: xpToNext,
      achievements,
      totalAchievements,
    };

    return summary;
  }
}
