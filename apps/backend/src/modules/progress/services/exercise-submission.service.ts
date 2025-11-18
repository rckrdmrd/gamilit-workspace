import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExerciseSubmission } from '../entities';
import { CreateExerciseSubmissionDto } from '../dto';
import { DB_SCHEMAS } from '@shared/constants/database.constants';
import { Exercise } from '@/modules/educational/entities';
import { Profile } from '@/modules/auth-management/entities';

/**
 * ExerciseSubmissionService
 *
 * Gestión de envíos finales de ejercicios
 * - CRUD de submissions (diferente de attempts)
 * - Workflow de estados: draft → submitted → graded → reviewed
 * - Auto-grading y feedback manual
 * - Agregación de datos del mejor intento
 * - Distribución de rewards (XP/ML Coins)
 * - Tracking de perfect scores
 */
@Injectable()
export class ExerciseSubmissionService {
  constructor(
    @InjectRepository(ExerciseSubmission, 'progress')
    private readonly submissionRepo: Repository<ExerciseSubmission>,
    @InjectRepository(Exercise, 'educational')
    private readonly exerciseRepo: Repository<Exercise>,
    @InjectRepository(Profile, 'auth')
    private readonly profileRepo: Repository<Profile>,
  ) {}

  /**
   * Helper method to get profile.id from auth.users.id
   *
   * @description exercise_submissions table FK references profiles.id, but JWT contains auth.users.id.
   * This method converts auth.users.id → profiles.id
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
   * Crea un nuevo envío de ejercicio
   * @param dto - Datos del envío
   * @returns Nuevo envío creado
   */
  async create(dto: CreateExerciseSubmissionDto): Promise<ExerciseSubmission> {
    const newSubmission = this.submissionRepo.create({
      ...dto,
      status: 'submitted',
      submitted_at: new Date(),
      hint_used: dto.hint_used || false,
      hints_count: dto.hints_count || 0,
      comodines_used: dto.comodines_used || [],
      ml_coins_spent: dto.ml_coins_spent || 0,
      attempt_number: dto.attempt_number || 1,
      score: 0,
      max_score: dto.max_score || 100,
    });

    return await this.submissionRepo.save(newSubmission);
  }

  /**
   * Obtiene todos los envíos de un usuario
   * @param userId - ID del usuario
   * @returns Lista de envíos ordenados por fecha
   */
  async findByUserId(userId: string): Promise<ExerciseSubmission[]> {
    return await this.submissionRepo.find({
      where: { user_id: userId },
      order: { submitted_at: 'DESC' },
    });
  }

  /**
   * Obtiene todos los envíos de un ejercicio
   * @param exerciseId - ID del ejercicio
   * @returns Lista de envíos del ejercicio
   */
  async findByExerciseId(exerciseId: string): Promise<ExerciseSubmission[]> {
    return await this.submissionRepo.find({
      where: { exercise_id: exerciseId },
      order: { submitted_at: 'DESC' },
    });
  }

  /**
   * Obtiene el envío específico de un usuario en un ejercicio
   * @param userId - ID del usuario
   * @param exerciseId - ID del ejercicio
   * @returns Envío encontrado o null
   */
  async findByUserAndExercise(
    userId: string,
    exerciseId: string,
  ): Promise<ExerciseSubmission | null> {
    const submission = await this.submissionRepo.findOne({
      where: { user_id: userId, exercise_id: exerciseId },
      order: { submitted_at: 'DESC' },
    });

    return submission;
  }

  /**
   * Workflow completo de envío de ejercicio
   * @param userId - ID del usuario (auth.users.id from JWT)
   * @param exerciseId - ID del ejercicio
   * @param answers - Respuestas del ejercicio
   * @returns Envío creado y procesado
   */
  async submitExercise(
    userId: string,
    exerciseId: string,
    answers: Record<string, any>,
  ): Promise<ExerciseSubmission> {
    // CRITICAL FIX: Convert auth.users.id → profiles.id
    // exercise_submissions.user_id FK references profiles.id (NOT auth.users.id)
    const profileId = await this.getProfileId(userId);

    // Verificar si ya existe un envío previo
    const existingSubmission = await this.findByUserAndExercise(profileId, exerciseId);

    if (existingSubmission && existingSubmission.status === 'graded') {
      throw new BadRequestException(
        'Exercise already submitted and graded. Cannot resubmit.',
      );
    }

    // Crear o actualizar submission
    const submissionData: CreateExerciseSubmissionDto = {
      user_id: profileId,  // FIXED: usar profileId en lugar de userId
      exercise_id: exerciseId,
      answer_data: answers,
      max_score: 100,
    };

    let submission: ExerciseSubmission;

    if (existingSubmission) {
      // Actualizar submission existente
      Object.assign(existingSubmission, {
        answer_data: answers,
        submitted_at: new Date(),
        status: 'submitted',
      });
      submission = await this.submissionRepo.save(existingSubmission);
    } else {
      // Crear nuevo submission
      submission = await this.create(submissionData);
    }

    // Auto-grade si es posible
    submission = await this.gradeSubmission(submission.id);

    return submission;
  }

  /**
   * Califica un envío automáticamente o manualmente
   * @param id - ID del envío
   * @returns Envío calificado
   */
  async gradeSubmission(id: string): Promise<ExerciseSubmission> {
    const submission = await this.submissionRepo.findOne({ where: { id } });

    if (!submission) {
      throw new NotFoundException(`Exercise submission with ID ${id} not found`);
    }

    if (submission.status === 'graded') {
      throw new BadRequestException('Submission already graded');
    }

    // FE-055: Auto-grading with REAL validation
    const { score, isCorrect, correctAnswers, totalQuestions } = await this.autoGrade(
      submission.exercise_id,
      submission.answer_data,
      submission.max_score
    );

    submission.score = score;
    submission.is_correct = isCorrect;
    submission.status = 'graded';
    submission.graded_at = new Date();

    // Store validation results in submission
    (submission as any).correctAnswers = correctAnswers;
    (submission as any).totalQuestions = totalQuestions;

    // Calcular si es perfect score
    const isPerfectScore = score === submission.max_score && !submission.hint_used;

    if (isPerfectScore) {
      submission.feedback = 'Perfect score! Excellent work!';
    } else if (isCorrect) {
      submission.feedback = 'Good job! Exercise completed successfully.';
    } else {
      submission.feedback = 'Keep practicing. Review the material and try again.';
    }

    return await this.submissionRepo.save(submission);
  }

  /**
   * FE-055: Auto-grading with REAL answer validation
   * @param exerciseId - ID of the exercise
   * @param answerData - User's submitted answers
   * @param maxScore - Maximum score
   * @returns Score, correctness, and validation details
   */
  private async autoGrade(
    exerciseId: string,
    answerData: Record<string, any>,
    maxScore: number,
  ): Promise<{ score: number; isCorrect: boolean; correctAnswers: number; totalQuestions: number }> {
    // Get exercise with solution data
    const exercise = await this.exerciseRepo.findOne({ where: { id: exerciseId } });

    if (!exercise) {
      console.error(`[FE-055] Exercise ${exerciseId} not found for grading`);
      // Fallback to placeholder behavior
      return { score: maxScore, isCorrect: true, correctAnswers: 1, totalQuestions: 1 };
    }

    console.log(`[FE-055] Grading exercise ${exerciseId} of type: ${exercise.exercise_type}`);

    // Extract exercise solution
    const solution = exercise.solution || {};
    const content = exercise.content || {};
    const exerciseType = (exercise.exercise_type || '').toLowerCase();

    // Validate answers by exercise type
    let correctAnswers = 0;
    let totalQuestions = 0;

    try {
      switch (exerciseType) {
        case 'sopa_letras':
          ({ correctAnswers, totalQuestions } = this.validateSopaLetras(answerData, content, solution));
          break;

        case 'verdadero_falso':
          ({ correctAnswers, totalQuestions } = this.validateVerdaderoFalso(answerData, content, solution));
          break;

        case 'emparejamiento':
          ({ correctAnswers, totalQuestions } = this.validateEmparejamiento(answerData, content, solution));
          break;

        case 'crucigrama_cientifico':
        case 'crucigrama':
          ({ correctAnswers, totalQuestions } = this.validateCrucigrama(answerData, content, solution));
          break;

        case 'linea_tiempo':
        case 'timeline':
          ({ correctAnswers, totalQuestions } = this.validateTimeline(answerData, content, solution));
          break;

        case 'completar_espacios':
          ({ correctAnswers, totalQuestions } = this.validateCompletarEspacios(answerData, content, solution));
          break;

        case 'mapa_conceptual':
          ({ correctAnswers, totalQuestions } = this.validateMapaConceptual(answerData, content, solution));
          break;

        case 'detective_textual':
          ({ correctAnswers, totalQuestions } = this.validateDetectiveTextual(answerData, content, solution));
          break;

        case 'construccion_hipotesis':
          ({ correctAnswers, totalQuestions } = this.validateConstruccionHipotesis(answerData, content, solution));
          break;

        case 'prediccion_narrativa':
          ({ correctAnswers, totalQuestions } = this.validatePrediccionNarrativa(answerData, content, solution));
          break;

        case 'puzzle_contexto':
          ({ correctAnswers, totalQuestions } = this.validatePuzzleContexto(answerData, content, solution));
          break;

        case 'rueda_inferencias':
          ({ correctAnswers, totalQuestions } = this.validateRuedaInferencias(answerData, content, solution));
          break;

        default:
          console.warn(`[FE-055] Unknown exercise type: ${exerciseType}, using placeholder`);
          // Fallback for unknown types
          correctAnswers = 1;
          totalQuestions = 1;
      }
    } catch (error) {
      console.error(`[FE-055] Error validating ${exerciseType}:`, error);
      // Fallback on error
      correctAnswers = 1;
      totalQuestions = 1;
    }

    // Calculate score
    const scorePercentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const score = Math.round((scorePercentage / 100) * maxScore);
    const isCorrect = scorePercentage >= 60; // 60% threshold

    console.log(`[FE-055] Grading result: ${correctAnswers}/${totalQuestions} correct, score: ${score}/${maxScore}`);

    return { score, isCorrect, correctAnswers, totalQuestions };
  }

  /**
   * FE-055: Validate Sopa de Letras answers
   */
  private validateSopaLetras(
    answerData: Record<string, any>,
    content: Record<string, any>,
    solution: Record<string, any>
  ): { correctAnswers: number; totalQuestions: number } {
    const foundWords = answerData.foundWords || [];
    const validWords = content.words || [];

    const correctWords = foundWords.filter((word: string) =>
      validWords.some((w: any) => {
        const validWord = typeof w === 'string' ? w : w.word;
        return validWord.toUpperCase() === word.toUpperCase();
      })
    );

    return {
      correctAnswers: correctWords.length,
      totalQuestions: validWords.length
    };
  }

  /**
   * FE-055: Validate Verdadero/Falso answers
   */
  private validateVerdaderoFalso(
    answerData: Record<string, any>,
    content: Record<string, any>,
    solution: Record<string, any>
  ): { correctAnswers: number; totalQuestions: number } {
    const statements = content.statements || [];
    let correctCount = 0;

    statements.forEach((stmt: any) => {
      const userAnswer = answerData[stmt.id];
      const correctAnswer = stmt.correctAnswer;

      if (userAnswer === correctAnswer) {
        correctCount++;
      }
    });

    return {
      correctAnswers: correctCount,
      totalQuestions: statements.length
    };
  }

  /**
   * FE-055: Validate Emparejamiento answers
   */
  private validateEmparejamiento(
    answerData: Record<string, any>,
    content: Record<string, any>,
    solution: Record<string, any>
  ): { correctAnswers: number; totalQuestions: number } {
    const userMatches = answerData.matches || [];
    const pairs = content.pairs || [];

    let correctCount = 0;

    userMatches.forEach((match: any) => {
      const correctPair = pairs.find((pair: any) => {
        const leftMatch = pair.left.id === match.leftId;
        const rightMatch = pair.right.id === match.rightId;
        return leftMatch && rightMatch;
      });

      if (correctPair) {
        correctCount++;
      }
    });

    return {
      correctAnswers: correctCount,
      totalQuestions: pairs.length
    };
  }

  /**
   * FE-055: Validate Crucigrama answers
   */
  private validateCrucigrama(
    answerData: Record<string, any>,
    content: Record<string, any>,
    solution: Record<string, any>
  ): { correctAnswers: number; totalQuestions: number } {
    const userClues = answerData.clues || {};
    const clues = content.clues || [];

    let correctCount = 0;

    // Handle both array and object format for clues
    const cluesArray = Array.isArray(clues) ? clues : [
      ...(clues.horizontal || []),
      ...(clues.vertical || [])
    ];

    cluesArray.forEach((clue: any) => {
      const userAnswer = userClues[clue.id];
      const correctAnswer = clue.word || clue.answer;

      if (userAnswer && correctAnswer &&
          userAnswer.toUpperCase() === correctAnswer.toUpperCase()) {
        correctCount++;
      }
    });

    return {
      correctAnswers: correctCount,
      totalQuestions: cluesArray.length
    };
  }

  /**
   * FE-055: Validate Timeline answers
   */
  private validateTimeline(
    answerData: Record<string, any>,
    content: Record<string, any>,
    solution: Record<string, any>
  ): { correctAnswers: number; totalQuestions: number } {
    const userOrder = answerData.eventOrder || [];
    const events = content.events || [];

    // Calculate correct order by sorting events by year
    const correctOrder = [...events]
      .sort((a, b) => a.year - b.year)
      .map(event => event.id);

    // Count how many events are in correct position
    let correctCount = 0;
    userOrder.forEach((eventId: string, index: number) => {
      if (eventId === correctOrder[index]) {
        correctCount++;
      }
    });

    return {
      correctAnswers: correctCount,
      totalQuestions: events.length
    };
  }

  /**
   * FE-055: Validate Completar Espacios answers
   */
  private validateCompletarEspacios(
    answerData: Record<string, any>,
    content: Record<string, any>,
    solution: Record<string, any>
  ): { correctAnswers: number; totalQuestions: number } {
    const userBlanks = answerData.blanks || {};
    const blanks = content.blanks || [];

    let correctCount = 0;

    blanks.forEach((blank: any) => {
      const userAnswer = userBlanks[blank.id];
      const correctAnswer = blank.correctAnswer;
      const alternatives = blank.alternatives || [];

      if (userAnswer && correctAnswer) {
        const normalized = userAnswer.trim().toLowerCase();
        const correctNormalized = correctAnswer.toLowerCase();
        const alternativesNormalized = alternatives.map((a: string) => a.toLowerCase());

        if (normalized === correctNormalized || alternativesNormalized.includes(normalized)) {
          correctCount++;
        }
      }
    });

    return {
      correctAnswers: correctCount,
      totalQuestions: blanks.length
    };
  }

  /**
   * FE-055: Validate Mapa Conceptual answers
   */
  private validateMapaConceptual(
    answerData: Record<string, any>,
    content: Record<string, any>,
    solution: Record<string, any>
  ): { correctAnswers: number; totalQuestions: number } {
    const userConnections = answerData.connections || [];
    const correctConnections = content.correctConnections || solution.correctConnections || [];

    let correctCount = 0;

    userConnections.forEach((conn: string) => {
      if (correctConnections.includes(conn)) {
        correctCount++;
      }
    });

    return {
      correctAnswers: correctCount,
      totalQuestions: correctConnections.length
    };
  }

  /**
   * Agrega feedback manual a un envío
   * @param id - ID del envío
   * @param feedback - Feedback del profesor
   * @returns Envío actualizado
   */
  async provideFeedback(
    id: string,
    feedback: Record<string, any>,
  ): Promise<ExerciseSubmission> {
    const submission = await this.submissionRepo.findOne({ where: { id } });

    if (!submission) {
      throw new NotFoundException(`Exercise submission with ID ${id} not found`);
    }

    submission.feedback = typeof feedback === 'string' ? feedback : JSON.stringify(feedback);
    submission.status = 'reviewed';

    return await this.submissionRepo.save(submission);
  }

  /**
   * Actualiza el estado de un envío (state machine)
   * @param id - ID del envío
   * @param status - Nuevo estado
   * @returns Envío actualizado
   */
  async updateStatus(
    id: string,
    status: 'draft' | 'submitted' | 'graded' | 'reviewed',
  ): Promise<ExerciseSubmission> {
    const submission = await this.submissionRepo.findOne({ where: { id } });

    if (!submission) {
      throw new NotFoundException(`Exercise submission with ID ${id} not found`);
    }

    // Validar transiciones de estado válidas
    const validTransitions: Record<string, string[]> = {
      draft: ['submitted'],
      submitted: ['graded', 'draft'],
      graded: ['reviewed'],
      reviewed: [], // Estado final
    };

    const currentStatus = submission.status;
    if (!validTransitions[currentStatus]?.includes(status)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${status}`,
      );
    }

    submission.status = status;

    if (status === 'graded') {
      submission.graded_at = new Date();
    }

    return await this.submissionRepo.save(submission);
  }

  /**
   * Obtiene estadísticas de envíos de un usuario
   * @param userId - ID del usuario
   * @returns Estadísticas de completion rate, avg score, etc.
   */
  async getSubmissionStats(userId: string): Promise<{
    total_submissions: number;
    graded_submissions: number;
    completion_rate: number;
    average_score: number;
    perfect_scores_count: number;
    total_time_spent: number;
  }> {
    const submissions = await this.submissionRepo.find({
      where: { user_id: userId },
    });

    const gradedSubmissions = submissions.filter((s) => s.status === 'graded').length;
    const completionRate = submissions.length > 0 ? (gradedSubmissions / submissions.length) * 100 : 0;

    const validScores = submissions.filter((s) => s.score !== null && s.score !== undefined);
    const totalScore = validScores.reduce((sum, s) => sum + s.score, 0);
    const averageScore = validScores.length > 0 ? totalScore / validScores.length : 0;

    const perfectScoresCount = submissions.filter(
      (s) => s.score === s.max_score && !s.hint_used,
    ).length;

    const totalTimeSpent = submissions.reduce(
      (sum, s) => sum + (s.time_spent_seconds || 0),
      0,
    );

    return {
      total_submissions: submissions.length,
      graded_submissions: gradedSubmissions,
      completion_rate: Number(completionRate.toFixed(2)),
      average_score: Number(averageScore.toFixed(2)),
      perfect_scores_count: perfectScoresCount,
      total_time_spent: totalTimeSpent,
    };
  }

  /**
   * Obtiene envíos pendientes de revisión manual
   * @returns Lista de envíos que necesitan revisión
   */
  async findPendingReview(): Promise<ExerciseSubmission[]> {
    return await this.submissionRepo.find({
      where: { status: 'submitted' },
      order: { submitted_at: 'ASC' },
    });
  }

  /**
   * Distribuye rewards (XP/ML Coins) por completar ejercicio
   * @param id - ID del envío
   * @returns Envío con información de rewards
   */
  async claimRewards(id: string): Promise<{
    submission: ExerciseSubmission;
    xp_earned: number;
    ml_coins_earned: number;
  }> {
    const submission = await this.submissionRepo.findOne({ where: { id } });

    if (!submission) {
      throw new NotFoundException(`Exercise submission with ID ${id} not found`);
    }

    if (submission.status !== 'graded') {
      throw new BadRequestException('Submission must be graded before claiming rewards');
    }

    if (!submission.is_correct) {
      return {
        submission,
        xp_earned: 0,
        ml_coins_earned: 0,
      };
    }

    // Calcular rewards basado en score y hints usados
    const scorePercentage = (submission.score / submission.max_score) * 100;
    let xpEarned = Math.floor(scorePercentage);
    let mlCoinsEarned = Math.floor(scorePercentage / 10);

    // Bonificación por perfect score
    if (submission.score === submission.max_score && !submission.hint_used) {
      xpEarned += 50; // Bonus XP
      mlCoinsEarned += 10; // Bonus coins
    }

    // Penalizar por hints usados
    const hintPenalty = submission.hints_count * 5;
    xpEarned = Math.max(0, xpEarned - hintPenalty);

    // Restar ML Coins gastadas en comodines
    mlCoinsEarned = Math.max(0, mlCoinsEarned - submission.ml_coins_spent);

    // TODO: Integrar con GamificationService para actualizar user_stats
    // await this.userStatsService.addXp(submission.user_id, xpEarned);
    // await this.mlCoinsService.addCoins(submission.user_id, mlCoinsEarned, 'earned_exercise');

    return {
      submission,
      xp_earned: xpEarned,
      ml_coins_earned: mlCoinsEarned,
    };
  }

  /**
   * Validate Detective Textual (Module 2.1)
   * Multiple choice questions with correct answers in content
   */
  private validateDetectiveTextual(
    answerData: Record<string, any>,
    content: Record<string, any>,
    solution: Record<string, any>
  ): { correctAnswers: number; totalQuestions: number } {
    const questions = content.questions || [];
    let correctCount = 0;

    questions.forEach((question: any) => {
      const userAnswer = answerData[question.id];
      const correctAnswer = question.correctAnswer;

      if (userAnswer !== undefined && userAnswer === correctAnswer) {
        correctCount++;
      }
    });

    return {
      correctAnswers: correctCount,
      totalQuestions: questions.length
    };
  }

  /**
   * Validate Construcción de Hipótesis (Module 2.2)
   * Cause-effect matching: answerData = { causeId: [consequenceIds] }
   */
  private validateConstruccionHipotesis(
    answerData: Record<string, any>,
    content: Record<string, any>,
    solution: Record<string, any>
  ): { correctAnswers: number; totalQuestions: number } {
    const consequences = content.consequences || [];
    let correctCount = 0;
    let totalCount = 0;

    // For each consequence, check if it's assigned to the correct cause(s)
    consequences.forEach((consequence: any) => {
      if (!consequence.correctCauseIds || consequence.correctCauseIds.length === 0) {
        return; // Skip distractors
      }

      consequence.correctCauseIds.forEach((correctCauseId: string) => {
        totalCount++;
        // Check if user assigned this consequence to this cause
        const assignedConsequences = answerData[correctCauseId] || [];
        if (assignedConsequences.includes(consequence.id)) {
          correctCount++;
        }
      });
    });

    return {
      correctAnswers: correctCount,
      totalQuestions: totalCount
    };
  }

  /**
   * Validate Predicción Narrativa (Module 2.3)
   * Multiple scenarios with prediction selection
   */
  private validatePrediccionNarrativa(
    answerData: Record<string, any>,
    content: Record<string, any>,
    solution: Record<string, any>
  ): { correctAnswers: number; totalQuestions: number } {
    const scenarios = content.scenarios || [];
    let correctCount = 0;

    scenarios.forEach((scenario: any) => {
      const userAnswer = answerData[scenario.id];

      // Find the correct prediction
      const correctPrediction = scenario.predictions?.find((p: any) => p.isCorrect);

      if (userAnswer && correctPrediction && userAnswer === correctPrediction.id) {
        correctCount++;
      }
    });

    return {
      correctAnswers: correctCount,
      totalQuestions: scenarios.length
    };
  }

  /**
   * Validate Puzzle Contexto (Module 2.4)
   * Fragment ordering puzzle
   */
  private validatePuzzleContexto(
    answerData: Record<string, any>,
    content: Record<string, any>,
    solution: Record<string, any>
  ): { correctAnswers: number; totalQuestions: number } {
    const correctOrder = solution.correctOrder || [];
    let correctCount = 0;

    // answerData format: { fragmentId: position }
    // Check each fragment's position
    correctOrder.forEach((fragmentId: string, correctPosition: number) => {
      const userPosition = answerData[fragmentId];
      if (userPosition === correctPosition) {
        correctCount++;
      }
    });

    return {
      correctAnswers: correctCount,
      totalQuestions: correctOrder.length
    };
  }

  /**
   * Validate Rueda de Inferencias (Module 2.5)
   * Select correct inferences from a list
   */
  private validateRuedaInferencias(
    answerData: Record<string, any>,
    content: Record<string, any>,
    solution: Record<string, any>
  ): { correctAnswers: number; totalQuestions: number } {
    const correctInferences = solution.correctInferences || [];
    const incorrectInferences = solution.incorrectInferences || [];
    const totalInferences = [...correctInferences, ...incorrectInferences];

    // answerData should be an array of selected inference IDs
    const selectedInferences = answerData.selectedInferences || [];

    let correctCount = 0;

    // Count correct selections (selected a correct inference)
    selectedInferences.forEach((inferenceId: string) => {
      if (correctInferences.includes(inferenceId)) {
        correctCount++;
      }
    });

    // Penalize incorrect selections (selected an incorrect inference)
    selectedInferences.forEach((inferenceId: string) => {
      if (incorrectInferences.includes(inferenceId)) {
        correctCount--;
      }
    });

    // Penalize missed correct inferences (should have selected but didn't)
    correctInferences.forEach((correctId: string) => {
      if (!selectedInferences.includes(correctId)) {
        // Already counted as not correct by not including it
      }
    });

    // Ensure correctCount is not negative
    correctCount = Math.max(0, correctCount);

    return {
      correctAnswers: correctCount,
      totalQuestions: correctInferences.length
    };
  }
}
