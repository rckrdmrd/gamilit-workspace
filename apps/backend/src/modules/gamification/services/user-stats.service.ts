import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserStats } from '../entities';
import { DB_SCHEMAS } from '@shared/constants';

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
  // Configuración de niveles: XP requerida para cada nivel
  private readonly XP_PER_LEVEL = 100; // Base XP para el próximo nivel
  private readonly XP_SCALING = 1.1; // Multiplicador de dificultad

  // Rangos disponibles en el sistema (ordenado de menor a mayor)
  private readonly RANKS = ['Ajaw', 'Nacom', "Ah K'in", 'Halach Uinic', "K'uk'ulkan"];

  constructor(
    @InjectRepository(UserStats, 'gamification')
    private readonly userStatsRepo: Repository<UserStats>,
  ) {}

  /**
   * Encuentra estadísticas de usuario por ID
   */
  async findByUserId(userId: string): Promise<UserStats> {
    const stats = await this.userStatsRepo.findOne({
      where: { user_id: userId },
    });

    if (!stats) {
      throw new NotFoundException(`No stats found for user ${userId}`);
    }

    return stats;
  }

  /**
   * Crea un nuevo registro de estadísticas para un usuario
   */
  async create(userId: string, tenantId?: string): Promise<UserStats> {
    const existingStats = await this.userStatsRepo.findOne({
      where: { user_id: userId },
    });

    if (existingStats) {
      throw new BadRequestException(`User ${userId} already has stats`);
    }

    const newStats = this.userStatsRepo.create({
      user_id: userId,
      tenant_id: tenantId,
      level: 1,
      total_xp: 0,
      xp_to_next_level: this.calculateXpForLevel(1),
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

    return await this.userStatsRepo.save(newStats);
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
    return await this.userStatsRepo.save(stats);
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
      throw new BadRequestException(`Field ${field} is not numeric`);
    }

    (stats[field] as number) = (currentValue as number) + amount;
    return await this.userStatsRepo.save(stats);
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
   * Añade XP al usuario y verifica si sube de nivel
   */
  async addXp(userId: string, xpAmount: number): Promise<UserStats> {
    const stats = await this.findByUserId(userId);
    stats.total_xp += xpAmount;

    // Verificar si sube de nivel
    while (stats.total_xp >= stats.xp_to_next_level) {
      stats.total_xp -= stats.xp_to_next_level;
      stats.level += 1;
      stats.xp_to_next_level = this.calculateXpForLevel(stats.level);

      // Verificar promoción de rango
      await this.checkRankPromotion(stats);
    }

    return await this.userStatsRepo.save(stats);
  }

  /**
   * Verifica si el usuario debe ser promovido de rango
   * Lógica: cada X niveles, promoción a siguiente rango
   */
  private async checkRankPromotion(stats: UserStats): Promise<void> {
    const currentRankIndex = this.RANKS.indexOf(stats.current_rank);

    // Si ya está en el rango máximo, no hace nada
    if (currentRankIndex >= this.RANKS.length - 1) {
      return;
    }

    // Cada 5 niveles, promoción automática (ajustable)
    const levelThreshold = (currentRankIndex + 1) * 5;

    if (stats.level >= levelThreshold) {
      stats.current_rank = this.RANKS[currentRankIndex + 1];
      stats.rank_progress = 0;
    } else {
      // Calcular progreso hacia el siguiente rango
      const previousThreshold = currentRankIndex * 5;
      const nextThreshold = levelThreshold;
      stats.rank_progress =
        ((stats.level - previousThreshold) / (nextThreshold - previousThreshold)) * 100;
    }
  }

  /**
   * Calcula XP necesaria para alcanzar un nivel específico
   */
  private calculateXpForLevel(level: number): number {
    return Math.floor(this.XP_PER_LEVEL * Math.pow(this.XP_SCALING, level - 1));
  }

  /**
   * Obtiene ranking global basado en XP
   */
  async getGlobalRanking(limit: number = 100): Promise<UserStats[]> {
    return await this.userStatsRepo.find({
      order: { total_xp: 'DESC' },
      take: limit,
    });
  }

  /**
   * Obtiene ranking por tenant
   */
  async getTenantRanking(tenantId: string, limit: number = 100): Promise<UserStats[]> {
    return await this.userStatsRepo.find({
      where: { tenant_id: tenantId },
      order: { total_xp: 'DESC' },
      take: limit,
    });
  }

  /**
   * Obtiene top usuarios por nivel
   */
  async getTopByLevel(limit: number = 50): Promise<UserStats[]> {
    return await this.userStatsRepo.find({
      order: { level: 'DESC', total_xp: 'DESC' },
      take: limit,
    });
  }
}
