import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository, InjectEntityManager } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { ExerciseAttempt } from '../entities';
import { CreateExerciseAttemptDto } from '../dto';
import { DB_SCHEMAS } from '@shared/constants/database.constants';
import { TransactionTypeEnum } from '@shared/constants/enums.constants';
import { MLCoinsService } from '@/modules/gamification/services/ml-coins.service';
import { UserStatsService } from '@/modules/gamification/services/user-stats.service';
import { MissionsService } from '@/modules/gamification/services/missions.service';
import { MissionTypeEnum } from '@/modules/gamification/entities/mission.entity';
import { Exercise } from '@/modules/educational/entities';

/**
 * ExerciseAttemptService
 *
 * Gestión de intentos individuales de ejercicios
 * - CRUD de intentos
 * - Auto-incremento de número de intento
 * - Scoring y validación de respuestas
 * - Tracking de hints y comodines
 * - Cálculo de estadísticas de rendimiento
 * - Awarding de rewards (XP/ML Coins) automático al completar
 */
@Injectable()
export class ExerciseAttemptService {
  private readonly logger = new Logger(ExerciseAttemptService.name);

  constructor(
    @InjectRepository(ExerciseAttempt, 'progress')
    private readonly attemptRepo: Repository<ExerciseAttempt>,
    @InjectRepository(Exercise, 'educational')
    private readonly exerciseRepo: Repository<Exercise>,
    private readonly mlCoinsService: MLCoinsService,
    private readonly userStatsService: UserStatsService,
    private readonly missionsService: MissionsService,
    @InjectEntityManager('progress')
    private readonly entityManager: EntityManager,
  ) {}

  /**
   * Crea un nuevo intento de ejercicio
   * @param dto - Datos del intento
   * @returns Nuevo intento creado
   */
  async create(dto: CreateExerciseAttemptDto): Promise<ExerciseAttempt> {
    // Obtener el próximo número de intento
    const attemptNumber = await this.getNextAttemptNumber(dto.user_id, dto.exercise_id);

    const newAttempt = this.attemptRepo.create({
      ...dto,
      attempt_number: attemptNumber,
      submitted_at: new Date(),
      hints_used: dto.hints_used || 0,
      comodines_used: dto.comodines_used || [],
      xp_earned: dto.xp_earned || 0,
      ml_coins_earned: dto.ml_coins_earned || 0,
      metadata: dto.metadata || {
        browser: null,
        device_type: null,
        response_pattern: [],
      },
    });

    const savedAttempt = await this.attemptRepo.save(newAttempt);

    // ✅ FIX BUG-002: Actualizar module_progress después de crear el intento
    // Solo actualizar si el intento fue correcto y hubo rewards
    if (savedAttempt.is_correct && (savedAttempt.xp_earned > 0 || savedAttempt.ml_coins_earned > 0)) {
      await this.updateModuleProgressAfterCompletion(
        savedAttempt.user_id,
        savedAttempt.exercise_id,
        savedAttempt.xp_earned,
        savedAttempt.ml_coins_earned,
      );

      // Actualizar progreso de misiones diarias/semanales
      await this.updateMissionsProgress(savedAttempt.user_id, savedAttempt.is_correct);
    }

    return savedAttempt;
  }

  /**
   * Obtiene todos los intentos de un usuario
   * @param userId - ID del usuario
   * @returns Lista de intentos ordenados por fecha
   */
  async findByUserId(userId: string): Promise<ExerciseAttempt[]> {
    return await this.attemptRepo.find({
      where: { user_id: userId },
      order: { submitted_at: 'DESC' },
    });
  }

  /**
   * Obtiene todos los intentos de un ejercicio específico
   * @param exerciseId - ID del ejercicio
   * @returns Lista de intentos del ejercicio
   */
  async findByExerciseId(exerciseId: string): Promise<ExerciseAttempt[]> {
    return await this.attemptRepo.find({
      where: { exercise_id: exerciseId },
      order: { submitted_at: 'DESC' },
    });
  }

  /**
   * Obtiene todos los intentos de un usuario en un ejercicio específico
   * @param userId - ID del usuario
   * @param exerciseId - ID del ejercicio
   * @returns Lista de intentos del usuario en el ejercicio
   */
  async findByUserAndExercise(userId: string, exerciseId: string): Promise<ExerciseAttempt[]> {
    return await this.attemptRepo.find({
      where: { user_id: userId, exercise_id: exerciseId },
      order: { attempt_number: 'ASC' },
    });
  }

  /**
   * Obtiene el próximo número de intento para un usuario en un ejercicio
   * @param userId - ID del usuario
   * @param exerciseId - ID del ejercicio
   * @returns Número del próximo intento (1 si es el primero)
   */
  async getNextAttemptNumber(userId: string, exerciseId: string): Promise<number> {
    const lastAttempt = await this.attemptRepo.findOne({
      where: { user_id: userId, exercise_id: exerciseId },
      order: { attempt_number: 'DESC' },
    });

    return lastAttempt ? lastAttempt.attempt_number + 1 : 1;
  }

  /**
   * Envía un intento y calcula el score
   * @param id - ID del intento
   * @param answers - Respuestas enviadas
   * @returns Intento actualizado con score
   */
  async submitAttempt(
    id: string,
    answers: Record<string, any>,
  ): Promise<ExerciseAttempt> {
    const attempt = await this.attemptRepo.findOne({ where: { id } });

    if (!attempt) {
      throw new NotFoundException(`Exercise attempt with ID ${id} not found`);
    }

    attempt.submitted_answers = answers;
    attempt.submitted_at = new Date();

    // FE-059: Use SQL validate_and_audit() for scoring (replaces placeholder)
    const { score, isCorrect, feedback, details, auditId } = await this.calculateScore(
      attempt.user_id,
      attempt.exercise_id,
      answers,
      attempt.attempt_number
    );

    attempt.score = score;
    attempt.is_correct = isCorrect;

    // FE-059: Audit ID is stored in educational_content.exercise_validation_audit
    // Can be queried using: exercise_id + user_id + attempt_number
    this.logger.log(`[FE-059] Validation audit saved with ID: ${auditId}`);

    // Calcular rewards (XP y ML Coins)
    if (isCorrect) {
      attempt.xp_earned = this.calculateXpReward(score, attempt.hints_used);
      attempt.ml_coins_earned = this.calculateCoinsReward(score, attempt.comodines_used.length);
    }

    const savedAttempt = await this.attemptRepo.save(attempt);

    // Otorgar recompensas automáticamente si el intento fue correcto
    if (isCorrect && (attempt.xp_earned > 0 || attempt.ml_coins_earned > 0)) {
      await this.awardRewards(attempt.user_id, attempt.exercise_id, attempt.xp_earned, attempt.ml_coins_earned);
    }

    return savedAttempt;
  }

  /**
   * FE-059: Calcula el score usando PostgreSQL validate_and_audit()
   *
   * @description Reemplaza el placeholder que siempre retornaba 100/true.
   * Ahora usa el sistema de validación centralizado en SQL con auditoría automática.
   *
   * @param userId - ID del usuario (profiles.id)
   * @param exerciseId - ID del ejercicio
   * @param answers - Respuestas enviadas
   * @param attemptNumber - Número de intento
   * @returns Score, correctness, feedback, details, y audit ID
   */
  private async calculateScore(
    userId: string,
    exerciseId: string,
    answers: Record<string, any>,
    attemptNumber: number,
  ): Promise<{
    score: number;
    isCorrect: boolean;
    feedback: string;
    details: any;
    auditId: string;
  }> {
    this.logger.log(`[FE-059] Validating attempt #${attemptNumber} for exercise ${exerciseId}`);

    // Call PostgreSQL validate_and_audit() function
    const query = `
      SELECT * FROM educational_content.validate_and_audit(
        $1::uuid,    -- exercise_id
        $2::uuid,    -- user_id
        $3::jsonb,   -- submitted_answer
        $4::integer, -- attempt_number
        $5::jsonb    -- client_metadata
      )
    `;

    try {
      const result = await this.entityManager.query(query, [
        exerciseId,
        userId,
        JSON.stringify(answers),
        attemptNumber,
        JSON.stringify({})
      ]);

      if (!result || result.length === 0) {
        throw new InternalServerErrorException('Validation function returned no results');
      }

      const validation = result[0];

      this.logger.log(
        `[FE-059] Validation result: score=${validation.score}/${validation.max_score}, ` +
        `correct=${validation.is_correct}, audit_id=${validation.audit_id}`
      );

      return {
        score: validation.score,
        isCorrect: validation.is_correct,
        feedback: validation.feedback || '',
        details: validation.details || {},
        auditId: validation.audit_id
      };
    } catch (error) {
      this.logger.error(`[FE-059] Error calling validate_and_audit():`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`Exercise validation failed: ${errorMessage}`);
    }
  }

  /**
   * Calcula XP ganada basada en score y hints usados
   * @param score - Score obtenido
   * @param hintsUsed - Cantidad de hints usados
   * @returns XP ganada
   */
  private calculateXpReward(score: number, hintsUsed: number): number {
    let baseXp = score; // 1:1 ratio por defecto

    // Penalizar por hints usados
    const hintPenalty = hintsUsed * 10;
    baseXp = Math.max(0, baseXp - hintPenalty);

    return baseXp;
  }

  /**
   * Calcula ML Coins ganadas basada en score y comodines usados
   * @param score - Score obtenido
   * @param comodinesUsed - Cantidad de comodines usados
   * @returns ML Coins ganadas
   */
  private calculateCoinsReward(score: number, comodinesUsed: number): number {
    let baseCoins = Math.floor(score / 10); // 10 coins por cada 100 puntos

    // Penalizar por comodines usados
    const comodinPenalty = comodinesUsed * 2;
    baseCoins = Math.max(0, baseCoins - comodinPenalty);

    return baseCoins;
  }

  /**
   * Obtiene estadísticas de intentos de un usuario
   * @param userId - ID del usuario
   * @returns Estadísticas de accuracy, score promedio, etc.
   */
  async getAttemptStats(userId: string): Promise<{
    total_attempts: number;
    correct_attempts: number;
    accuracy_rate: number;
    average_score: number;
    total_xp_earned: number;
    total_coins_earned: number;
    hints_used_total: number;
    comodines_used_total: number;
  }> {
    const attempts = await this.attemptRepo.find({
      where: { user_id: userId },
    });

    const correctAttempts = attempts.filter((a) => a.is_correct === true).length;
    const accuracyRate = attempts.length > 0 ? (correctAttempts / attempts.length) * 100 : 0;

    const validScores = attempts.filter((a) => a.score !== null && a.score !== undefined);
    const totalScore = validScores.reduce((sum, a) => sum + (a.score || 0), 0);
    const averageScore = validScores.length > 0 ? totalScore / validScores.length : 0;

    const totalXp = attempts.reduce((sum, a) => sum + a.xp_earned, 0);
    const totalCoins = attempts.reduce((sum, a) => sum + a.ml_coins_earned, 0);
    const totalHints = attempts.reduce((sum, a) => sum + a.hints_used, 0);
    const totalComodines = attempts.reduce((sum, a) => sum + a.comodines_used.length, 0);

    return {
      total_attempts: attempts.length,
      correct_attempts: correctAttempts,
      accuracy_rate: Number(accuracyRate.toFixed(2)),
      average_score: Number(averageScore.toFixed(2)),
      total_xp_earned: totalXp,
      total_coins_earned: totalCoins,
      hints_used_total: totalHints,
      comodines_used_total: totalComodines,
    };
  }

  /**
   * Obtiene el mejor intento de un usuario en un ejercicio
   * @param userId - ID del usuario
   * @param exerciseId - ID del ejercicio
   * @returns Mejor intento (score más alto)
   */
  async getBestAttempt(userId: string, exerciseId: string): Promise<ExerciseAttempt | null> {
    const attempts = await this.findByUserAndExercise(userId, exerciseId);

    if (attempts.length === 0) {
      return null;
    }

    // Encontrar intento con score más alto
    const bestAttempt = attempts.reduce((best, current) => {
      if (!current.score) return best;
      if (!best.score) return current;
      return current.score > best.score ? current : best;
    });

    return bestAttempt;
  }

  /**
   * Registra el uso de comodines en un intento
   * @param id - ID del intento
   * @param comodines - Lista de comodines usados
   * @returns Intento actualizado
   */
  async trackComodinesUsage(id: string, comodines: string[]): Promise<ExerciseAttempt> {
    const attempt = await this.attemptRepo.findOne({ where: { id } });

    if (!attempt) {
      throw new NotFoundException(`Exercise attempt with ID ${id} not found`);
    }

    attempt.comodines_used = [...new Set([...attempt.comodines_used, ...comodines])];
    return await this.attemptRepo.save(attempt);
  }

  /**
   * Otorga recompensas (XP y ML Coins) al usuario por completar un ejercicio
   *
   * @description Método privado que se ejecuta automáticamente después de
   * un intento correcto. Integra con MLCoinsService y UserStatsService
   * para otorgar las recompensas calculadas.
   *
   * @param userId - ID del usuario
   * @param exerciseId - ID del ejercicio completado
   * @param xpEarned - XP ganada (calculada con penalizaciones por hints)
   * @param mlCoinsEarned - ML Coins ganadas (calculadas con penalizaciones por comodines)
   *
   * @private
   */
  private async awardRewards(
    userId: string,
    exerciseId: string,
    xpEarned: number,
    mlCoinsEarned: number,
  ): Promise<void> {
    // Otorgar ML Coins
    if (mlCoinsEarned > 0) {
      try {
        await this.mlCoinsService.addCoins(
          userId,
          mlCoinsEarned,
          TransactionTypeEnum.EARNED_EXERCISE,
          `Exercise completed: ${exerciseId}`,
          exerciseId,
          'exercise',
        );
        this.logger.log(
          `Awarded ${mlCoinsEarned} ML Coins to user ${userId} for completing exercise ${exerciseId}`,
        );
      } catch (error: unknown) {
        this.logger.error(
          `Failed to award ML Coins for exercise ${exerciseId}: ${error instanceof Error ? error.message : String(error)}`,
        );
        // Continue execution - don't fail the entire operation
      }
    }

    // Otorgar XP
    if (xpEarned > 0) {
      try {
        await this.userStatsService.addXp(userId, xpEarned);
        this.logger.log(
          `Awarded ${xpEarned} XP to user ${userId} for completing exercise ${exerciseId}`,
        );
      } catch (error: unknown) {
        this.logger.error(
          `Failed to award XP for exercise ${exerciseId}: ${error instanceof Error ? error.message : String(error)}`,
        );
        // Continue execution - don't fail the entire operation
      }
    }

    // ✅ FIX BUG-002: Actualizar module_progress después de completar ejercicio
    await this.updateModuleProgressAfterCompletion(userId, exerciseId, xpEarned, mlCoinsEarned);
  }

  /**
   * Actualiza el progreso del módulo después de completar un ejercicio correctamente
   *
   * @description Esta función replica la lógica del trigger update_module_progress_on_exercise_complete
   * para garantizar que el progreso se actualice correctamente después de cada ejercicio.
   *
   * @param userId - ID del usuario (profiles.id)
   * @param exerciseId - ID del ejercicio completado
   * @param xpEarned - XP ganado en el ejercicio
   * @param mlCoinsEarned - ML Coins ganados en el ejercicio
   *
   * @private
   */
  private async updateModuleProgressAfterCompletion(
    userId: string,
    exerciseId: string,
    xpEarned: number,
    mlCoinsEarned: number
  ): Promise<void> {
    try {
      // Obtener module_id del ejercicio
      const exercise = await this.exerciseRepo.findOne({ where: { id: exerciseId } });
      if (!exercise?.module_id) {
        this.logger.warn(`[BUG-002 FIX] Exercise ${exerciseId} has no module_id - skipping progress update`);
        return;
      }

      const moduleId = exercise.module_id;
      this.logger.log(`[BUG-002 FIX] Updating module progress for user ${userId}, module ${moduleId}`);

      // Verificar si es el primer intento correcto para ESTE ejercicio específico
      const previousCorrectAttempts = await this.attemptRepo.count({
        where: {
          user_id: userId,
          exercise_id: exerciseId,
          is_correct: true,
        }
      });

      // Si hay más de 1 (incluyendo el actual), no es el primero - solo actualizar timestamp
      if (previousCorrectAttempts > 1) {
        await this.entityManager.query(`
          UPDATE progress_tracking.module_progress
          SET last_accessed_at = NOW(), updated_at = NOW()
          WHERE user_id = $1 AND module_id = $2
        `, [userId, moduleId]);
        this.logger.log(`[BUG-002 FIX] Not first correct attempt - only updated timestamps`);
        return;
      }

      // Contar total de ejercicios activos en el módulo
      const totalExercisesResult = await this.exerciseRepo.count({
        where: { module_id: moduleId, is_active: true }
      });
      const totalExercises = totalExercisesResult || 0;

      // Contar ejercicios correctos ÚNICOS del usuario en este módulo (usando exercise_attempts)
      const completedExercisesResult = await this.entityManager.query(`
        SELECT COUNT(DISTINCT ea.exercise_id) as count
        FROM progress_tracking.exercise_attempts ea
        JOIN educational_content.exercises e ON e.id = ea.exercise_id
        WHERE ea.user_id = $1
          AND e.module_id = $2
          AND ea.is_correct = true
      `, [userId, moduleId]);
      const completedExercises = parseInt(completedExercisesResult[0]?.count || '0', 10);

      // Calcular porcentaje de progreso
      const progressPercentage = totalExercises > 0
        ? Math.round((completedExercises / totalExercises) * 100 * 100) / 100
        : 0;

      // Determinar nuevo status
      let newStatus: string;
      if (progressPercentage >= 100) {
        newStatus = 'completed';
      } else if (progressPercentage > 0) {
        newStatus = 'in_progress';
      } else {
        newStatus = 'not_started';
      }

      this.logger.log(`[BUG-002 FIX] Module progress: ${completedExercises}/${totalExercises} (${progressPercentage}%) - Status: ${newStatus}`);

      // Actualizar o insertar module_progress usando UPSERT
      await this.entityManager.query(`
        INSERT INTO progress_tracking.module_progress (
          user_id,
          module_id,
          status,
          progress_percentage,
          completed_exercises,
          total_exercises,
          total_xp_earned,
          total_ml_coins_earned,
          started_at,
          last_accessed_at,
          completed_at
        ) VALUES (
          $1, $2, $3::progress_tracking.progress_status, $4, $5, $6, $7, $8, NOW(), NOW(),
          CASE WHEN $3 = 'completed' THEN NOW() ELSE NULL END
        )
        ON CONFLICT (user_id, module_id) DO UPDATE SET
          status = $3::progress_tracking.progress_status,
          progress_percentage = $4,
          completed_exercises = $5,
          total_exercises = $6,
          total_xp_earned = progress_tracking.module_progress.total_xp_earned + $7,
          total_ml_coins_earned = progress_tracking.module_progress.total_ml_coins_earned + $8,
          last_accessed_at = NOW(),
          completed_at = CASE
            WHEN $3 = 'completed' AND progress_tracking.module_progress.completed_at IS NULL
            THEN NOW()
            ELSE progress_tracking.module_progress.completed_at
          END,
          updated_at = NOW()
      `, [userId, moduleId, newStatus, progressPercentage, completedExercises, totalExercises, xpEarned, mlCoinsEarned]);

      this.logger.log(`[BUG-002 FIX] ✅ Module progress updated successfully`);

    } catch (error) {
      // Log error pero no bloquear el claim de rewards
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[BUG-002 FIX] ❌ Error updating module progress: ${errorMessage}`);
      // No throw - la actualización de progreso no debe bloquear la respuesta
    }
  }

  /**
   * Actualiza el progreso de misiones después de completar un ejercicio correctamente
   * @param userId - ID del usuario (auth.users.id - será convertido a profiles.id internamente)
   * @param isCorrect - Si el ejercicio fue completado correctamente
   */
  private async updateMissionsProgress(userId: string, isCorrect: boolean): Promise<void> {
    if (!isCorrect) return;

    try {
      // Obtener misiones diarias y semanales activas del usuario
      const [dailyMissions, weeklyMissions] = await Promise.all([
        this.missionsService.findByTypeAndUser(userId, MissionTypeEnum.DAILY),
        this.missionsService.findByTypeAndUser(userId, MissionTypeEnum.WEEKLY),
      ]);

      const allMissions = [...dailyMissions, ...weeklyMissions];

      // Actualizar cada misión que tenga objetivo 'complete_exercises'
      for (const mission of allMissions) {
        // Solo procesar misiones activas o en progreso
        if (mission.status !== 'active' && mission.status !== 'in_progress') continue;

        // Verificar si la misión tiene objetivo de completar ejercicios
        const hasExerciseObjective = mission.objectives.some(
          obj => obj.type === 'complete_exercises',
        );

        if (hasExerciseObjective) {
          try {
            await this.missionsService.updateProgress(
              mission.id,
              userId,
              'complete_exercises',
              1,
            );
            this.logger.log(`Mission ${mission.id} progress updated for user ${userId}`);
          } catch (missionError) {
            // Log pero no bloquear si una misión específica falla
            this.logger.warn(`Failed to update mission ${mission.id}`, missionError);
          }
        }
      }
    } catch (error) {
      // No bloquear el flujo principal si falla la actualización de misiones
      this.logger.warn(`Failed to update missions progress for user ${userId}`, error);
    }
  }
}
