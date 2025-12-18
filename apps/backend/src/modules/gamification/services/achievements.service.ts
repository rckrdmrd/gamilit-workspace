import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Achievement, UserAchievement, UserStats } from '../entities';
import { GrantAchievementDto } from '../dto';

/**
 * Interfaces para tipos de condiciones de achievements (alineadas con seeds)
 */
interface AchievementConditions {
  type: string;
  requirements: Record<string, unknown>;
}

interface ExerciseCompletionReqs {
  exercises_completed: number;
}

interface StreakReqs {
  consecutive_days: number;
}

interface ModuleCompletionReqs {
  module_id: string;
  completion_percentage: number;
}

interface AllModulesCompletionReqs {
  modules_completed: number;
  min_score_average: number;
}

interface PerfectScoreReqs {
  perfect_exercises: number;
  score_required: number;
}

interface SocialReqs {
  classrooms_joined?: number;
  social_activities?: number;
}

interface SpecialReqs {
  first_login?: boolean;
}

/**
 * AchievementsService
 *
 * Gestión completa del sistema de logros (achievements)
 * - CRUD de definiciones de logros
 * - Otorgamiento de logros a usuarios
 * - Seguimiento de progreso
 * - Detección automática de logros ganados
 */
@Injectable()
export class AchievementsService {
  private readonly logger = new Logger(AchievementsService.name);

  constructor(
    @InjectRepository(Achievement, 'gamification')
    private readonly achievementRepo: Repository<Achievement>,
    @InjectRepository(UserAchievement, 'gamification')
    private readonly userAchievementRepo: Repository<UserAchievement>,
    @InjectRepository(UserStats, 'gamification')
    private readonly userStatsRepo: Repository<UserStats>,
    @InjectDataSource('gamification')
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Obtiene todos los achievements activos
   */
  async findAll(includeSecret: boolean = false): Promise<Achievement[]> {
    const query = this.achievementRepo.createQueryBuilder('a').where('a.is_active = true');

    if (!includeSecret) {
      query.andWhere('a.is_secret = false');
    }

    return query.orderBy('a.order_index', 'ASC').addOrderBy('a.name', 'ASC').getMany();
  }

  /**
   * Busca un achievement por ID
   */
  async findById(achievementId: string): Promise<Achievement> {
    const achievement = await this.achievementRepo.findOne({
      where: { id: achievementId },
    });

    if (!achievement) {
      throw new NotFoundException(`Achievement ${achievementId} not found`);
    }

    return achievement;
  }

  /**
   * Busca achievements por categoría
   */
  async findByCategory(category: string): Promise<Achievement[]> {
    return this.achievementRepo.find({
      where: { category, is_active: true } as any,
      order: { order_index: 'ASC' },
    });
  }

  /**
   * Obtiene logros completados por un usuario
   */
  async getCompletedByUser(userId: string): Promise<UserAchievement[]> {
    return this.userAchievementRepo.find({
      where: {
        user_id: userId,
        is_completed: true,
      },
    });
  }

  /**
   * Obtiene logros en progreso para un usuario
   */
  async getInProgressByUser(userId: string): Promise<UserAchievement[]> {
    return this.userAchievementRepo.find({
      where: {
        user_id: userId,
        is_completed: false,
      },
    });
  }

  /**
   * Otorga un achievement a un usuario
   */
  async grantAchievement(
    userId: string,
    grantDto: GrantAchievementDto,
  ): Promise<UserAchievement> {
    // Validar que el achievement existe
    await this.findById(grantDto.achievement_id);

    // Buscar si ya existe el registro
    let userAchievement = await this.userAchievementRepo.findOne({
      where: {
        user_id: userId,
        achievement_id: grantDto.achievement_id,
      },
    });

    if (!userAchievement) {
      // Crear nuevo registro
      userAchievement = this.userAchievementRepo.create({
        user_id: userId,
        achievement_id: grantDto.achievement_id,
        progress: grantDto.progress || 0,
        max_progress: grantDto.max_progress || 100,
        is_completed: grantDto.is_completed || false,
        progress_data: grantDto.progress_data || {},
        metadata: grantDto.metadata || {},
      });
    } else {
      // Actualizar progreso
      if (grantDto.progress !== undefined) {
        userAchievement.progress = grantDto.progress;
      }
      if (grantDto.max_progress !== undefined) {
        userAchievement.max_progress = grantDto.max_progress;
      }
      if (grantDto.is_completed !== undefined) {
        userAchievement.is_completed = grantDto.is_completed;
      }
      if (grantDto.progress_data) {
        userAchievement.progress_data = grantDto.progress_data;
      }
      if (grantDto.metadata) {
        userAchievement.metadata = grantDto.metadata;
      }
    }

    // Actualizar completion_percentage
    userAchievement.completion_percentage = Number(
      ((userAchievement.progress / userAchievement.max_progress) * 100).toFixed(2),
    );

    // Si está completado, establecer fecha
    if (userAchievement.is_completed && !userAchievement.completed_at) {
      userAchievement.completed_at = new Date();
    }

    return this.userAchievementRepo.save(userAchievement);
  }

  /**
   * Verifica el progreso de un achievement específico
   */
  async checkProgress(userId: string, achievementId: string): Promise<UserAchievement> {
    const userAchievement = await this.userAchievementRepo.findOne({
      where: {
        user_id: userId,
        achievement_id: achievementId,
      },
    });

    if (!userAchievement) {
      throw new NotFoundException(
        `Achievement ${achievementId} not found for user ${userId}`,
      );
    }

    return userAchievement;
  }

  /**
   * Incrementa el progreso de un achievement
   */
  async incrementProgress(
    userId: string,
    achievementId: string,
    amount: number = 1,
  ): Promise<UserAchievement> {
    const userAchievement = await this.checkProgress(userId, achievementId);
    userAchievement.progress += amount;

    // Verificar si se completó
    if (userAchievement.progress >= userAchievement.max_progress && !userAchievement.is_completed) {
      userAchievement.progress = userAchievement.max_progress;
      userAchievement.is_completed = true;
      userAchievement.completed_at = new Date();
    }

    // Actualizar porcentaje
    userAchievement.completion_percentage = Number(
      ((userAchievement.progress / userAchievement.max_progress) * 100).toFixed(2),
    );

    return this.userAchievementRepo.save(userAchievement);
  }

  /**
   * Detecta y otorga logros automáticamente basado en estadísticas del usuario
   * Lógica de auto-detection según condiciones
   */
  async detectAndGrantEarned(userId: string): Promise<UserAchievement[]> {
    const userStats = await this.userStatsRepo.findOne({
      where: { user_id: userId },
    });

    if (!userStats) {
      throw new NotFoundException(`User stats not found for ${userId}`);
    }

    const grantedAchievements: UserAchievement[] = [];
    const allAchievements = await this.findAll();

    for (const achievement of allAchievements) {
      // Verificar si el usuario ya tiene este logro completado
      const existing = await this.userAchievementRepo.findOne({
        where: {
          user_id: userId,
          achievement_id: achievement.id,
          is_completed: true,
        },
      });

      if (!achievement.is_repeatable && existing) {
        continue; // Saltar si no es repetible y ya está completado
      }

      // Evaluar condiciones (ahora async para soportar queries complejas)
      const conditionsMet = await this.meetsConditions(userId, userStats, achievement.conditions);

      if (conditionsMet) {
        this.logger.log(`Achievement ${achievement.name} conditions met for user ${userId}`);

        const grantDto = new GrantAchievementDto();
        grantDto.user_id = userId;
        grantDto.achievement_id = achievement.id;
        const conditionsTyped = achievement.conditions as { requirements?: { exercises_completed?: number } };
        const reqs = conditionsTyped.requirements || {};
        grantDto.progress = reqs.exercises_completed || 100;
        grantDto.max_progress = reqs.exercises_completed || 100;
        grantDto.is_completed = true;
        grantDto.progress_data = { auto_detected: true, detected_at: new Date().toISOString() };

        const granted = await this.grantAchievement(userId, grantDto);
        grantedAchievements.push(granted);
      }
    }

    this.logger.log(`Detected and granted ${grantedAchievements.length} achievements for user ${userId}`);
    return grantedAchievements;
  }

  /**
   * Evalúa si las estadísticas del usuario cumplen con las condiciones del logro
   * ACTUALIZADO: Soporta todos los tipos definidos en seeds de achievements
   *
   * Tipos soportados:
   * - exercise_completion: Completar N ejercicios
   * - streak: Mantener racha de N días consecutivos
   * - module_completion: Completar un módulo específico
   * - all_modules_completion: Completar todos los módulos
   * - perfect_score: Obtener N puntuaciones perfectas
   * - social: Actividades sociales (unirse a aulas, etc.)
   * - special: Eventos especiales (primer login, etc.)
   */
  private async meetsConditions(
    userId: string,
    userStats: UserStats,
    conditions: Record<string, unknown>,
  ): Promise<boolean> {
    const cond = conditions as unknown as AchievementConditions;
    const type = cond.type || 'generic';
    const reqs = (cond.requirements || {}) as unknown as Record<string, unknown>;

    try {
      switch (type) {
        // =====================================================
        // TIPO: exercise_completion
        // Condición: Completar N ejercicios
        // =====================================================
        case 'exercise_completion': {
          const r = reqs as unknown as ExerciseCompletionReqs;
          const met = userStats.exercises_completed >= (r.exercises_completed || 0);
          this.logger.debug(`[exercise_completion] User has ${userStats.exercises_completed}, needs ${r.exercises_completed}: ${met}`);
          return met;
        }

        // =====================================================
        // TIPO: streak
        // Condición: Mantener racha de N días consecutivos
        // Seeds usan: consecutive_days (no min_streak)
        // =====================================================
        case 'streak': {
          const r = reqs as unknown as StreakReqs;
          const required = r.consecutive_days || 0;
          const met = userStats.current_streak >= required;
          this.logger.debug(`[streak] User has ${userStats.current_streak} days, needs ${required}: ${met}`);
          return met;
        }

        // =====================================================
        // TIPO: module_completion
        // Condición: Completar un módulo específico al 100%
        // Requiere query adicional a progress_tracking.module_progress
        // =====================================================
        case 'module_completion': {
          const r = reqs as unknown as ModuleCompletionReqs;

          const result = await this.dataSource.query(
            `
            SELECT mp.completion_percentage
            FROM progress_tracking.module_progress mp
            JOIN educational_content.modules m ON mp.module_id = m.id
            WHERE mp.user_id = $1
              AND m.slug = $2
            `,
            [userId, r.module_id],
          );

          if (!result || result.length === 0) {
            this.logger.debug(`[module_completion] No progress found for module ${r.module_id}`);
            return false;
          }

          const percentage = parseFloat(result[0].completion_percentage) || 0;
          const met = percentage >= (r.completion_percentage || 100);
          this.logger.debug(`[module_completion] Module ${r.module_id}: ${percentage}% / ${r.completion_percentage}%: ${met}`);
          return met;
        }

        // =====================================================
        // TIPO: all_modules_completion
        // Condición: Completar todos los módulos con score promedio mínimo
        // =====================================================
        case 'all_modules_completion': {
          const r = reqs as unknown as AllModulesCompletionReqs;
          const modulesRequired = r.modules_completed || 5;
          const scoreRequired = r.min_score_average || 70;

          const met =
            userStats.modules_completed >= modulesRequired &&
            (userStats.average_score || 0) >= scoreRequired;

          this.logger.debug(
            `[all_modules_completion] Modules: ${userStats.modules_completed}/${modulesRequired}, ` +
              `Score: ${userStats.average_score || 0}/${scoreRequired}: ${met}`,
          );
          return met;
        }

        // =====================================================
        // TIPO: perfect_score
        // Condición: Obtener N puntuaciones perfectas (100%)
        // =====================================================
        case 'perfect_score': {
          const r = reqs as unknown as PerfectScoreReqs;
          const required = r.perfect_exercises || 0;
          const met = userStats.perfect_scores >= required;
          this.logger.debug(`[perfect_score] User has ${userStats.perfect_scores}, needs ${required}: ${met}`);
          return met;
        }

        // =====================================================
        // TIPO: skill_mastery
        // Condición: Dominar un skill específico con score mínimo
        // Nota: Requiere consulta a exercise_responses por tipo de skill
        // Por ahora, simplificado a verificar perfect_scores
        // =====================================================
        case 'skill_mastery': {
          // TODO: Implementar consulta por skill_type cuando esté disponible en metadata
          this.logger.debug(`[skill_mastery] Type not fully implemented, checking perfect_scores`);
          return userStats.perfect_scores >= 10;
        }

        // =====================================================
        // TIPO: exploration
        // Condición: Explorar diferentes módulos o niveles de dificultad
        // Simplificado a verificar modules_completed > 0
        // =====================================================
        case 'exploration': {
          const met = userStats.modules_completed > 0 || userStats.exercises_completed >= 5;
          this.logger.debug(`[exploration] Modules: ${userStats.modules_completed}, Exercises: ${userStats.exercises_completed}: ${met}`);
          return met;
        }

        // =====================================================
        // TIPO: social
        // Condición: Actividades sociales (unirse a aulas, etc.)
        // Requiere query a social_features.classroom_members
        // =====================================================
        case 'social': {
          const r = reqs as unknown as SocialReqs;

          if (r.classrooms_joined !== undefined) {
            const result = await this.dataSource.query(
              `
              SELECT COUNT(*) as count
              FROM social_features.classroom_members
              WHERE user_id = $1 AND is_active = true
              `,
              [userId],
            );

            const count = parseInt(result[0]?.count || '0');
            const met = count >= (r.classrooms_joined || 1);
            this.logger.debug(`[social:classrooms] User in ${count} classrooms, needs ${r.classrooms_joined}: ${met}`);
            return met;
          }

          if (r.social_activities !== undefined) {
            // Contar total de actividades sociales (classroom + friendships)
            const result = await this.dataSource.query(
              `
              SELECT
                (SELECT COUNT(*) FROM social_features.classroom_members WHERE user_id = $1 AND is_active = true) +
                (SELECT COUNT(*) FROM social_features.friendships WHERE user_id = $1 AND status = 'accepted') as total
              `,
              [userId],
            );

            const total = parseInt(result[0]?.total || '0');
            const met = total >= (r.social_activities || 5);
            this.logger.debug(`[social:activities] Total social activities: ${total}, needs ${r.social_activities}: ${met}`);
            return met;
          }

          return false;
        }

        // =====================================================
        // TIPO: special
        // Condición: Eventos especiales (primer login)
        // =====================================================
        case 'special': {
          const r = reqs as SpecialReqs;

          if (r.first_login === true) {
            // Verificar si ya se otorgó este achievement antes
            // Si el usuario existe y tiene stats, asumimos que ya completó primer login
            const met = userStats.exercises_completed === 0 && !userStats.last_activity_at;
            this.logger.debug(`[special:first_login] First login check: ${met}`);
            // Para primer login, lo otorgamos si es usuario nuevo
            return !userStats.last_activity_at;
          }

          return false;
        }

        // =====================================================
        // TIPOS LEGACY (mantener compatibilidad)
        // =====================================================
        case 'progress':
          return (
            userStats.exercises_completed >= ((reqs as Record<string, number>).exercises_completed || 0) &&
            userStats.modules_completed >= ((reqs as Record<string, number>).modules_completed || 0)
          );

        case 'level':
          return userStats.level >= ((reqs as Record<string, number>).min_level || 0);

        case 'score':
          return (
            (userStats.average_score || 0) >= ((reqs as Record<string, number>).min_average_score || 0) &&
            userStats.perfect_scores >= ((reqs as Record<string, number>).min_perfect_scores || 0)
          );

        case 'rank':
          return this.userReachedRank(userStats.current_rank, (reqs as Record<string, string>).target_rank || '');

        case 'ml_coins':
          return userStats.ml_coins_earned_total >= ((reqs as Record<string, number>).min_coins_earned || 0);

        // =====================================================
        // DEFAULT: Tipo no reconocido
        // =====================================================
        default:
          this.logger.warn(`[meetsConditions] Unrecognized condition type: ${type}`);
          return false;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`[meetsConditions] Error evaluating ${type}: ${errorMsg}`);
      return false;
    }
  }

  /**
   * Helper: verifica si el usuario alcanzó un rango específico
   */
  private userReachedRank(currentRank: string, targetRank: string): boolean {
    const RANKS = ['Ajaw', 'Nacom', "Ah K'in", 'Halach Uinic', "K'uk'ulkan"];
    const currentIndex = RANKS.indexOf(currentRank);
    const targetIndex = RANKS.indexOf(targetRank);

    return currentIndex >= targetIndex;
  }

  /**
   * Reclamar recompensas de un achievement completado
   */
  async claimRewards(userId: string, achievementId: string): Promise<UserAchievement> {
    const userAchievement = await this.checkProgress(userId, achievementId);

    if (!userAchievement.is_completed) {
      throw new BadRequestException(`Achievement ${achievementId} is not completed yet`);
    }

    if (userAchievement.rewards_claimed) {
      throw new BadRequestException(`Rewards already claimed for achievement ${achievementId}`);
    }

    userAchievement.rewards_claimed = true;

    return this.userAchievementRepo.save(userAchievement);
  }

  /**
   * Obtiene estadísticas de logros para un usuario
   */
  async getUserAchievementStats(userId: string): Promise<{
    total_available: number;
    completed: number;
    completion_percentage: number;
    unclaimed_rewards: number;
  }> {
    const userStats = await this.userStatsRepo.findOne({
      where: { user_id: userId },
    });

    if (!userStats) {
      throw new NotFoundException(`User stats not found for ${userId}`);
    }

    const allAchievements = await this.findAll();
    const userAchievements = await this.userAchievementRepo.find({
      where: { user_id: userId },
    });

    const completed = userAchievements.filter((ua) => ua.is_completed).length;
    const unclaimedRewards = userAchievements.filter(
      (ua) => ua.is_completed && !ua.rewards_claimed,
    ).length;

    return {
      total_available: allAchievements.length,
      completed,
      completion_percentage: Number(
        ((completed / allAchievements.length) * 100).toFixed(2),
      ),
      unclaimed_rewards: unclaimedRewards,
    };
  }

  /**
   * Actualiza el estado activo/inactivo de un achievement
   */
  async updateAchievementStatus(id: string, isActive: boolean): Promise<Achievement> {
    const achievement = await this.findById(id);

    achievement.is_active = isActive;

    return this.achievementRepo.save(achievement);
  }
}
