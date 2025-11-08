import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExerciseAttempt } from '../entities';
import { CreateExerciseAttemptDto } from '../dto';
import { DB_SCHEMAS } from '@shared/constants/database.constants';

/**
 * ExerciseAttemptService
 *
 * Gestión de intentos individuales de ejercicios
 * - CRUD de intentos
 * - Auto-incremento de número de intento
 * - Scoring y validación de respuestas
 * - Tracking de hints y comodines
 * - Cálculo de estadísticas de rendimiento
 * - Trigger de rewards (XP/ML Coins)
 */
@Injectable()
export class ExerciseAttemptService {
  constructor(
    @InjectRepository(ExerciseAttempt, 'progress')
    private readonly attemptRepo: Repository<ExerciseAttempt>,
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
      xp_earned: 0,
      ml_coins_earned: 0,
      metadata: dto.metadata || {
        browser: null,
        device_type: null,
        response_pattern: [],
      },
    });

    return await this.attemptRepo.save(newAttempt);
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

    // TODO: Implementar lógica de scoring real basada en tipo de ejercicio
    // Por ahora, este es un placeholder
    const { score, isCorrect } = this.calculateScore(answers, attempt);
    attempt.score = score;
    attempt.is_correct = isCorrect;

    // Calcular rewards (XP y ML Coins)
    if (isCorrect) {
      attempt.xp_earned = this.calculateXpReward(score, attempt.hints_used);
      attempt.ml_coins_earned = this.calculateCoinsReward(score, attempt.comodines_used.length);
    }

    return await this.attemptRepo.save(attempt);
  }

  /**
   * Calcula el score de un intento (placeholder - debe ser implementado según tipo de ejercicio)
   * @param answers - Respuestas enviadas
   * @param attempt - Intento actual
   * @returns Score y si es correcto
   */
  private calculateScore(
    answers: Record<string, any>,
    attempt: ExerciseAttempt,
  ): { score: number; isCorrect: boolean } {
    // Placeholder: lógica simple
    // En producción, esto debe evaluar según el tipo de ejercicio y respuestas correctas
    const score = 100; // Por ahora, asumir score perfecto
    const isCorrect = score >= 60;

    return { score, isCorrect };
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
}
