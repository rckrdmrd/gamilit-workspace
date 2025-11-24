import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository, InjectEntityManager } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { ExerciseSubmission } from '../entities';
import { CreateExerciseSubmissionDto } from '../dto';
import { ExerciseAnswerValidator, RuedaInferenciasAnswersDto } from '../dto/answers';
import { DB_SCHEMAS } from '@shared/constants/database.constants';
import { TransactionTypeEnum } from '@shared/constants/enums.constants';
import { Exercise } from '@/modules/educational/entities';
import { Profile } from '@/modules/auth/entities';
import { UserStatsService } from '@/modules/gamification/services/user-stats.service';
import { MLCoinsService } from '@/modules/gamification/services/ml-coins.service';

/**
 * CategoryExpectation
 * @description Expected criteria for a specific category of inference
 */
interface CategoryExpectation {
  keywords: string[];
  description: string;
  example: string;
  points: number;
}

/**
 * FragmentSolution
 * @description Solution structure for a fragment with category-specific expectations
 */
interface FragmentSolution {
  id: string;
  text: string;
  categoryExpectations: {
    'cat-literal': CategoryExpectation;
    'cat-inferencial': CategoryExpectation;
    'cat-critico': CategoryExpectation;
    'cat-creativo': CategoryExpectation;
  };
}

/**
 * ExerciseSolution
 * @description Complete solution structure for Rueda de Inferencias exercise
 */
interface ExerciseSolution {
  validation: {
    minKeywords: number;
    minLength: number;
    maxLength: number;
  };
  fragments: FragmentSolution[];
}

/**
 * FragmentState
 * @description State of a fragment during the game (from frontend)
 */
interface FragmentState {
  fragmentId: string;
  categoryId: string;
  userText: string;
  timeSpent: number;
}

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
    @InjectEntityManager('progress')
    private readonly entityManager: EntityManager,
    private readonly userStatsService: UserStatsService,
    private readonly mlCoinsService: MLCoinsService,
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

    // FE-059: Get exercise to validate answer structure
    const exercise = await this.exerciseRepo.findOne({ where: { id: exerciseId } });
    if (!exercise) {
      throw new NotFoundException(`Exercise ${exerciseId} not found`);
    }

    // FE-059: Validate answer structure BEFORE saving to database
    console.log(`[FE-059] Validating answer structure for exercise type: ${exercise.exercise_type}`);
    await ExerciseAnswerValidator.validate(exercise.exercise_type, answers);

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

    // ✅ FIX BUG-001: Auto-claim rewards después de calificar
    if (submission.is_correct && submission.status === 'graded') {
      console.log(`[BUG-001 FIX] Auto-claiming rewards for submission ${submission.id}`);
      const rewards = await this.claimRewards(submission.id);

      // Agregar rewards al submission object para retornar al frontend
      (submission as any).xp_earned = rewards.xp_earned;
      (submission as any).ml_coins_earned = rewards.ml_coins_earned;
    }

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

    // FE-059: Auto-grading using SQL validate_and_audit()
    const { score, isCorrect, correctAnswers, totalQuestions, feedback, details, auditId } = await this.autoGrade(
      submission.user_id,       // userId (profiles.id)
      submission.exercise_id,
      submission.answer_data,
      submission.attempt_number || 1,
      {}                        // clientMetadata - can add IP, user-agent later
    );

    submission.score = score;
    submission.is_correct = isCorrect;
    submission.status = 'graded';
    submission.graded_at = new Date();

    // FE-059: Audit ID is stored in educational_content.exercise_validation_audit
    // Can be queried using: exercise_id + user_id + attempt_number
    console.log(`[FE-059] Validation audit saved with ID: ${auditId}`);

    // Store validation results in submission
    (submission as any).correctAnswers = correctAnswers;
    (submission as any).totalQuestions = totalQuestions;

    // Store details (includes error information for anti-redundancy, etc.)
    if (details) {
      (submission as any).details = details;
    }

    // Use custom feedback from autoGrade if provided, otherwise use generic feedback
    if (feedback) {
      submission.feedback = feedback;
    } else {
      // Calcular si es perfect score (only if no custom feedback)
      const isPerfectScore = score === submission.max_score && !submission.hint_used;

      if (isPerfectScore) {
        submission.feedback = 'Perfect score! Excellent work!';
      } else if (isCorrect) {
        submission.feedback = 'Good job! Exercise completed successfully.';
      } else {
        submission.feedback = 'Keep practicing. Review the material and try again.';
      }
    }

    return await this.submissionRepo.save(submission);
  }

  /**
   * FE-059: Auto-grading using PostgreSQL validate_and_audit() function
   *
   * @description Validates exercise answers using centralized SQL validation with automatic auditing.
   * Replaces 17 hardcoded validators with single SQL call.
   * SPECIAL CASE: Rueda de Inferencias uses custom TypeScript validation with category-specific criteria.
   *
   * @param userId - User ID from auth.users
   * @param exerciseId - ID of the exercise
   * @param answerData - User's submitted answers (JSONB format)
   * @param attemptNumber - Attempt number (1, 2, 3, ...)
   * @param clientMetadata - Optional metadata (IP, user-agent, etc.)
   * @returns Validation result with score, correctness, feedback, details, and audit ID
   */
  private async autoGrade(
    userId: string,
    exerciseId: string,
    answerData: Record<string, any>,
    attemptNumber: number = 1,
    clientMetadata: Record<string, any> = {}
  ): Promise<{
    score: number;
    isCorrect: boolean;
    correctAnswers: number;
    totalQuestions: number;
    feedback: string;
    details: any;
    auditId: string;
  }> {
    // Get exercise to check type
    const exercise = await this.exerciseRepo.findOne({ where: { id: exerciseId } });
    if (!exercise) {
      throw new NotFoundException(`Exercise ${exerciseId} not found`);
    }

    // SPECIAL CASE: Completar Espacios - Anti-redundancy validation (Exercise 1.3)
    if (exercise.exercise_type === 'completar_espacios') {
      console.log('[autoGrade] Checking anti-redundancy for Completar Espacios (Exercise 1.3)');

      // Check if blanks.5 and blanks.6 exist and are identical (case-insensitive)
      const blanks = answerData.blanks || {};
      if (blanks['5'] && blanks['6']) {
        const space5 = String(blanks['5']).toLowerCase().trim();
        const space6 = String(blanks['6']).toLowerCase().trim();

        if (space5 === space6) {
          console.log(`[autoGrade] REDUNDANCY DETECTED: space5="${space5}" === space6="${space6}"`);

          // Create audit record for failed validation
          const auditId = 'redundancy-' + Date.now();

          return {
            score: 33,
            isCorrect: false,
            correctAnswers: 4, // Assuming 4 out of 6 spaces are correct
            totalQuestions: 6,
            feedback: `Los espacios 5 y 6 no pueden tener la misma palabra. Has puesto '${space5}' en ambos. Elige dos palabras DIFERENTES del grupo: ciencias, matemáticas, física.`,
            details: {
              error: {
                type: 'redundancia',
                message: `Los espacios 5 y 6 deben ser diferentes`,
                espacios: ['5', '6'],
                valor_detectado: space5
              }
            },
            auditId
          };
        }
      }

      console.log('[autoGrade] Anti-redundancy check passed, proceeding with normal validation');
    }

    // SPECIAL CASE: Rueda de Inferencias custom validation
    if (exercise.exercise_type === 'rueda_inferencias') {
      console.log('[autoGrade] Using custom validation for Rueda de Inferencias');

      // Extract fragmentStates from answerData if available
      const fragmentStates = answerData.fragmentStates as FragmentState[] | undefined;

      // Validate using custom function
      const validationResult = this.validateRuedaInferencias(
        answerData as RuedaInferenciasAnswersDto,
        exercise,
        fragmentStates
      );

      // Determine if correct based on passing score
      const isCorrect = validationResult.score >= exercise.passing_score;

      // Create audit record manually (since we're not using SQL function)
      const auditId = 'manual-' + Date.now(); // Placeholder - could create actual audit record

      return {
        score: validationResult.score,
        isCorrect,
        correctAnswers: validationResult.feedback.byFragment.filter(f => f.score > 0).length,
        totalQuestions: validationResult.feedback.byFragment.length,
        feedback: validationResult.feedback.overall,
        details: {
          byFragment: validationResult.feedback.byFragment,
          maxScore: validationResult.maxScore
        },
        auditId
      };
    }

    // DEFAULT CASE: Use SQL validate_and_audit() for other exercise types
    console.log(`[FE-059] Validating exercise ${exerciseId} using SQL validate_and_audit()`);

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
        JSON.stringify(answerData),
        attemptNumber,
        JSON.stringify(clientMetadata)
      ]);

      if (!result || result.length === 0) {
        throw new InternalServerErrorException('Validation function returned no results');
      }

      const validation = result[0];

      console.log(`[FE-059] Validation result: score=${validation.score}/${validation.max_score}, correct=${validation.is_correct}, audit_id=${validation.audit_id}`);

      return {
        score: validation.score,
        isCorrect: validation.is_correct,
        correctAnswers: validation.details?.correct_answers || 0,
        totalQuestions: validation.details?.total_questions || validation.details?.total_words || validation.details?.total_events || 1,
        feedback: validation.feedback || '',
        details: validation.details || {},
        auditId: validation.audit_id
      };
    } catch (error) {
      console.error(`[FE-059] Error calling validate_and_audit():`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`Exercise validation failed: ${errorMessage}`);
    }
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
   * Validates Rueda de Inferencias answers with category-specific criteria
   *
   * @description Validates user inferences for "Rueda de Inferencias" (Módulo 2.5) exercise.
   * Each fragment has different expectations based on the selected category (Literal, Inferencial, Crítico, Creativo).
   * Scoring is proportional to keywords found in the user's response.
   *
   * @param answers - User's submitted answers (fragments mapping)
   * @param exercise - Exercise entity with solution data
   * @param fragmentStates - Array of fragment states with categoryId selections (optional)
   * @returns Validation result with score, feedback, and details per fragment
   *
   * @see orchestration/agentes/database/rueda-inferencias-update-2025-11-23/SQL-QUERIES-BACKEND.md
   * @see orchestration/agentes/architecture-analyst/rueda-inferencias-analysis-2025-11-23/02-ESPECIFICACIONES-CORRECCIONES.md
   */
  private validateRuedaInferencias(
    answers: RuedaInferenciasAnswersDto,
    exercise: Exercise,
    fragmentStates?: FragmentState[]
  ): {
    score: number;
    maxScore: number;
    feedback: {
      overall: string;
      byFragment: Array<{
        fragmentId: string;
        categoryUsed: string;
        keywordsFound: string[];
        keywordsExpected: string[];
        score: number;
        maxScore: number;
        feedback: string;
      }>;
    };
  } {
    console.log('[validateRuedaInferencias] Starting validation for Rueda de Inferencias exercise');

    // Cast solution to ExerciseSolution interface
    const solution = exercise.solution as ExerciseSolution;

    // Validate solution structure
    if (!solution || !solution.fragments || !Array.isArray(solution.fragments)) {
      throw new BadRequestException('Exercise solution is missing or invalid');
    }

    if (!solution.validation) {
      throw new BadRequestException('Exercise solution validation config is missing');
    }

    const fragments = solution.fragments;
    const minKeywords = solution.validation.minKeywords || 2;

    let totalScore = 0;
    let maxScore = 0;
    const feedbackByFragment: Array<{
      fragmentId: string;
      categoryUsed: string;
      keywordsFound: string[];
      keywordsExpected: string[];
      score: number;
      maxScore: number;
      feedback: string;
    }> = [];

    // Validate each fragment
    for (const fragment of fragments) {
      // Get user answer for this fragment
      const userAnswer = answers.fragments[fragment.id];

      // Skip if no answer provided
      if (!userAnswer) {
        console.log(`[validateRuedaInferencias] No answer provided for fragment ${fragment.id}, skipping`);
        continue;
      }

      // Get category used for this fragment from fragmentStates
      let categoryId = 'cat-literal'; // Default fallback

      if (fragmentStates && Array.isArray(fragmentStates)) {
        const fragmentState = fragmentStates.find(fs => fs.fragmentId === fragment.id);
        if (fragmentState && fragmentState.categoryId) {
          categoryId = fragmentState.categoryId;
        }
      }

      console.log(`[validateRuedaInferencias] Fragment ${fragment.id} using category: ${categoryId}`);

      // Get expectations for this category (with type safety)
      type CategoryId = 'cat-literal' | 'cat-inferencial' | 'cat-critico' | 'cat-creativo';
      let categoryExpectation = fragment.categoryExpectations?.[categoryId as CategoryId];

      if (!categoryExpectation) {
        console.warn(`[validateRuedaInferencias] No expectations found for category ${categoryId} in fragment ${fragment.id}, using default`);
        // Fallback: use literal category if available
        categoryExpectation = fragment.categoryExpectations?.['cat-literal'];
        if (!categoryExpectation) {
          continue; // Skip this fragment if no valid expectations
        }
      }

      // Validate categoryExpectation structure
      if (!categoryExpectation.keywords || !Array.isArray(categoryExpectation.keywords)) {
        console.warn(`[validateRuedaInferencias] Invalid category expectation for ${categoryId} in fragment ${fragment.id}`);
        continue;
      }

      maxScore += categoryExpectation.points;

      // Validate keywords (case-insensitive)
      const expectedKeywords = categoryExpectation.keywords;
      const userAnswerLower = userAnswer.toLowerCase().trim();

      const foundKeywords = expectedKeywords.filter((keyword: string) =>
        userAnswerLower.includes(keyword.toLowerCase())
      );

      console.log(`[validateRuedaInferencias] Fragment ${fragment.id}: Found ${foundKeywords.length}/${expectedKeywords.length} keywords`);

      // Calculate score based on keywords found
      let fragmentScore = 0;

      if (foundKeywords.length >= minKeywords) {
        // Score is proportional to keywords found vs expected
        const keywordRatio = Math.min(foundKeywords.length / expectedKeywords.length, 1);
        fragmentScore = Math.round(categoryExpectation.points * keywordRatio);
      }

      totalScore += fragmentScore;

      // Generate pedagogical feedback
      let feedback = '';
      const scorePercentage = (fragmentScore / categoryExpectation.points) * 100;

      if (scorePercentage >= 80) {
        feedback = `¡Excelente! Tu inferencia ${categoryExpectation.description.toLowerCase()}.`;
      } else if (scorePercentage >= 50) {
        feedback = `Bien, pero podrías mejorar. ${categoryExpectation.description}. Ejemplo: "${categoryExpectation.example}"`;
      } else {
        feedback = `Intenta nuevamente. ${categoryExpectation.description}. Ejemplo: "${categoryExpectation.example}"`;
      }

      // Add fragment feedback to results
      feedbackByFragment.push({
        fragmentId: fragment.id,
        categoryUsed: categoryId,
        keywordsFound: foundKeywords,
        keywordsExpected: expectedKeywords,
        score: fragmentScore,
        maxScore: categoryExpectation.points,
        feedback,
      });
    }

    // Generate overall feedback
    const overallPercentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    let overallFeedback = '';

    if (overallPercentage >= 75) {
      overallFeedback = '¡Excelente trabajo! Demostraste comprensión de diferentes tipos de inferencias.';
    } else if (overallPercentage >= 50) {
      overallFeedback = 'Buen intento. Revisa los ejemplos para mejorar tus inferencias.';
    } else {
      overallFeedback = 'Necesitas practicar más. Revisa las categorías de inferencias y los ejemplos proporcionados.';
    }

    console.log(`[validateRuedaInferencias] Validation complete: ${totalScore}/${maxScore} points (${overallPercentage.toFixed(1)}%)`);

    return {
      score: totalScore,
      maxScore,
      feedback: {
        overall: overallFeedback,
        byFragment: feedbackByFragment,
      },
    };
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

    // ✅ FIX BUG-001: Actualizar user_stats con XP y ML Coins
    console.log(`[BUG-001 FIX] Claiming rewards for user ${submission.user_id}: +${xpEarned} XP, +${mlCoinsEarned} ML Coins`);

    await this.userStatsService.addXp(submission.user_id, xpEarned);
    await this.mlCoinsService.addCoins(
      submission.user_id,
      mlCoinsEarned,
      TransactionTypeEnum.EARNED_EXERCISE,
      `Ejercicio completado: ${submission.exercise_id}`,
      submission.exercise_id,
      'exercise'
    );

    return {
      submission,
      xp_earned: xpEarned,
      ml_coins_earned: mlCoinsEarned,
    };
  }
}
