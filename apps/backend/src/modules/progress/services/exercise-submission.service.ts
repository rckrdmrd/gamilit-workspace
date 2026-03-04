import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository, InjectEntityManager } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { ExerciseSubmission } from '../entities';
import { CreateExerciseSubmissionDto } from '../dto';
import { ExerciseAnswerValidator, RuedaInferenciasAnswersDto } from '../dto/answers';
import { TransactionTypeEnum } from '@shared/constants/enums.constants';
import { Exercise } from '@/modules/educational/entities';
import { Profile } from '@/modules/auth/entities';
import { UserStatsService } from '@/modules/gamification/services/user-stats.service';
import { MLCoinsService } from '@/modules/gamification/services/ml-coins.service';
import { MissionsService } from '@/modules/gamification/services/missions.service';
import { AchievementsService } from '@/modules/gamification/services/achievements.service';
import { MissionTypeEnum } from '@/modules/gamification/enums/mission.enums';
import { NotificationService } from '@/modules/notifications/services/notification.service';
import { MailService } from '@/modules/mail/mail.service';
import { NotificationTypeEnum } from '@shared/constants/enums.constants';
// FIX GAP-LOW-003: WebSocket for real-time balance updates
import { WebSocketService } from '@/modules/websocket/websocket.service';

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
  private readonly logger = new Logger(ExerciseSubmissionService.name);

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
    private readonly missionsService: MissionsService,
    private readonly achievementsService: AchievementsService,
    private readonly notificationService: NotificationService,
    private readonly mailService: MailService,
    // FIX GAP-LOW-003: WebSocket for real-time balance updates
    private readonly webSocketService: WebSocketService,
  ) {}

  /**
   * Helper method to get profile.id from auth.users.id
   *
   * @description exercise_submissions table FK references profiles.id, but JWT contains auth.users.id.
   * This method converts auth.users.id → profiles.id
   *
   * DB-125: req.user.id IS already profile.id (set by JwtStrategy).
   * This helper validates that the profile exists in the database.
   *
   * @param profileId - profile.id (from req.user.id / JWT sub)
   * @returns profiles.id (same value, validated)
   * @throws NotFoundException if profile doesn't exist
   */
  private async getProfileId(profileId: string): Promise<string> {
    const profile = await this.profileRepo.findOne({
      where: { id: profileId },
      select: ['id'],
    });

    if (!profile) {
      throw new NotFoundException(`Profile not found: ${profileId}`);
    }

    return profile.id;
  }

  /**
   * DB-125: Validates profile.id exists (for controllers).
   * req.user.id IS already profile.id per JwtStrategy.
   *
   * @param profileId - profile.id (from req.user.id / JWT sub)
   * @returns profiles.id (validated)
   * @throws NotFoundException if profile doesn't exist
   */
  async getProfileIdFromAuthUser(profileId: string): Promise<string> {
    return this.getProfileId(profileId);
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

    return this.submissionRepo.save(newSubmission);
  }

  /**
   * Obtiene todos los envíos de un usuario
   * @param userId - ID del usuario
   * @returns Lista de envíos ordenados por fecha
   */
  async findByUserId(userId: string): Promise<ExerciseSubmission[]> {
    return this.submissionRepo.find({
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
    return this.submissionRepo.find({
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
    answers: Record<string, unknown>,
  ): Promise<ExerciseSubmission> {
    // CRITICAL FIX: Convert auth.users.id → profiles.id
    // exercise_submissions.user_id FK references profiles.id (NOT auth.users.id)
    const profileId = await this.getProfileId(userId);

    // FE-059: Get exercise to validate answer structure
    const exercise = await this.exerciseRepo.findOne({ where: { id: exerciseId } });
    if (!exercise) {
      throw new NotFoundException(`Exercise ${exerciseId} not found`);
    }

    // ✅ FIX 2025-11-24: Arquitectura dual - Validar tipo de ejercicio
    // Este servicio es SOLO para ejercicios que requieren revisión manual
    // Los ejercicios autocorregibles deben usar ExerciseAttemptService
    if (!exercise.requires_manual_grading) {
      throw new BadRequestException(
        'This exercise is auto-graded and allows multiple attempts. ' +
        'It should not use the submission service. ' +
        'This is a system configuration error - please report to support.',
      );
    }

    // BE-P2-009: Validación de requisitos mínimos para ejercicios Módulo 5
    if (exercise.exercise_type === 'diario_multimedia') {
      // Validar 150 palabras mínimas en el diario
      // FIX: DiarioMultimediaAnswerDto sends entries[], not top-level content
      // Raw answers use snake_case keys (apiClient.camelToSnake)
      const entries = (answers.entries || []) as Record<string, unknown>[];
      const totalWords = (answers.total_words || answers.totalWords || 0) as number;

      // Compute from entries if totalWords not provided
      const computedWords = totalWords > 0
        ? totalWords
        : entries.reduce((sum: number, e: Record<string, unknown>) => {
            const content = String(e.content || '');
            return sum + this.countWords(content);
          }, 0);

      if (computedWords < 150) {
        throw new BadRequestException(
          `El diario debe tener al menos 150 palabras. Actualmente tienes ${computedWords} palabras.`
        );
      }

      this.logger.log(`[BE-P2-009] Diario multimedia validation passed: ${computedWords} palabras`);
    }

    if (exercise.exercise_type === 'comic_digital') {
      // Validar mínimo de paneles en el cómic
      // FIX: Accept both camelCase (DTO) and snake_case (apiClient transforms all keys)
      const panels = (answers.panels || []) as Record<string, unknown>[];
      const minPanels = 4; // Mínimo 4 paneles para contar una historia

      if (panels.length < minPanels) {
        throw new BadRequestException(
          `El cómic debe tener al menos ${minPanels} paneles. Actualmente tienes ${panels.length} paneles.`
        );
      }

      // Validar que cada panel tenga contenido (diálogo/narración o imagen)
      const emptyPanels = panels.filter((panel) => {
        const dialogue = (panel.dialogue || panel.text || '') as string;
        const narration = (panel.narration || panel.text || '') as string;
        const hasDialogue = dialogue.trim().length > 0;
        const hasNarration = narration.trim().length > 0;
        const hasImage = panel.image_url || panel.imageUrl || panel.image;
        return !hasDialogue && !hasNarration && !hasImage;
      });

      if (emptyPanels.length > 0) {
        throw new BadRequestException(
          `Todos los paneles deben tener contenido (diálogo, narración o imagen). Tienes ${emptyPanels.length} panel(es) vacío(s).`
        );
      }

      this.logger.log(`[BE-P2-009] Comic digital validation passed: ${panels.length} paneles`);
    }

    if (exercise.exercise_type === 'video_carta') {
      // FIX: Raw request uses snake_case (apiClient.camelToSnake), DTO property is videoUrl (camelCase)
      const videoUrl = answers.video_url || answers.videoUrl || answers.url;

      if (!videoUrl) {
        throw new BadRequestException(
          `Debes subir o proporcionar la URL de tu video carta.`
        );
      }

      this.logger.log(`[BE-P2-009] Video carta validation passed: ${videoUrl}`);
    }

    // FE-059: Validate answer structure BEFORE saving to database
    this.logger.log(`[FE-059] Validating answer structure for exercise type: ${exercise.exercise_type}`);
    await ExerciseAnswerValidator.validate(exercise.exercise_type, answers);

    // Verificar si ya existe un envío previo
    const existingSubmission = await this.findByUserAndExercise(profileId, exerciseId);

    // ✅ CORR-010 v6 2026-01-07: Lógica de reenvío para ejercicios M3-M5
    // - Si status = 'submitted' (pendiente de revisión): PERMITIR actualización
    // - Si status = 'graded' o 'reviewed': BLOQUEAR reenvío
    // - Si status = 'draft': PERMITIR actualización
    let submission: ExerciseSubmission;

    if (existingSubmission) {
      const canResubmit = ['draft', 'submitted'].includes(existingSubmission.status);

      if (!canResubmit) {
        // Ya fue calificado por el teacher - no permitir reenvío
        throw new BadRequestException(
          'Este ejercicio ya fue calificado por tu maestro. ' +
          `Estado actual: ${existingSubmission.status}. ` +
          'No se permiten reenvíos después de la calificación.',
        );
      }

      // PERMITIR actualización - actualizar submission existente
      this.logger.log(`[CORR-010] Updating existing submission ${existingSubmission.id} (status: ${existingSubmission.status})`);

      // FIX DEAD-CODE: Check previous status BEFORE overwriting it
      const wasDraft = existingSubmission.status === 'draft';

      existingSubmission.answer_data = answers;
      existingSubmission.submitted_at = new Date();
      existingSubmission.status = 'submitted';
      // Incrementar número de intento si era draft
      if (wasDraft) {
        existingSubmission.attempt_number = (existingSubmission.attempt_number || 0) + 1;
      }

      submission = await this.submissionRepo.save(existingSubmission);
      this.logger.log(`[CORR-010] Submission ${submission.id} updated successfully`);
    } else {
      // No hay submission previa - crear nueva
      const submissionData: CreateExerciseSubmissionDto = {
        user_id: profileId,
        exercise_id: exerciseId,
        answer_data: answers,
        max_score: 100,
      };

      submission = await this.create(submissionData);
      this.logger.log(`[CORR-010] New submission ${submission.id} created`);
    }

    // ✅ FIX M3-M5 2026-01-07: Para ejercicios que requieren revisión manual del teacher
    // NO auto-grade, NO auto-claim rewards - solo notificar al teacher y esperar evaluación
    if (exercise.requires_manual_grading) {
      this.logger.log(`[M3-M5 FIX] Exercise ${exerciseId} requires manual grading - skipping auto-grade and rewards`);

      // ✅ FEATURE M3-M5 2026-01-08: Actualizar progreso del módulo al ENVIAR
      // El progreso se actualiza inmediatamente para que el estudiante vea su avance
      // Las recompensas (XP/ML Coins) se asignarán cuando el maestro califique
      try {
        await this.updateModuleProgressOnSubmission(profileId, exerciseId);
        this.logger.log(`[M3-M5 PROGRESS] Module progress updated for user ${profileId} on exercise ${exerciseId}`);
      } catch (error) {
        // Log error but don't fail submission - progress update is not critical
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`[M3-M5 PROGRESS] Failed to update module progress: ${errorMessage}`);
      }

      // BE-P2-008: Notificar al docente
      try {
        await this.notifyTeacherOfSubmission(submission, exercise, profileId);
        this.logger.log(`[M3-M5 FIX] Teacher notified for submission ${submission.id}`);
      } catch (error) {
        // Log error but don't fail submission
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`[BE-P2-008] Failed to notify teacher: ${errorMessage}`);
      }

      // Retornar submission con flag de revisión manual (NO rewards aún)
      // El frontend mostrará mensaje de "pendiente de evaluación del maestro"
      return Object.assign(submission, {
        requiresManualReview: true,
        message: 'Tu respuesta ha sido enviada para revisión del maestro. Recibirás tus recompensas cuando sea evaluada.',
      });
    }

    // Flujo normal para ejercicios autocorregibles (M1-M2)
    // Auto-grade si es posible
    submission = await this.gradeSubmission(submission.id);

    // ✅ FIX BUG-001: Auto-claim rewards después de calificar
    if (submission.is_correct && submission.status === 'graded') {
      this.logger.log(`[BUG-001 FIX] Auto-claiming rewards for submission ${submission.id}`);
      const rewards = await this.claimRewards(submission.id);

      // Los campos ya están persistidos en la submission por claimRewards()
      // Asignar rankUp si existe
      (submission as any).rankUp = rewards.rankUp;
    }

    return submission;
  }

  /**
   * Califica un envío automáticamente o manualmente
   * @param id - ID del envío
   * @param manualGrade - Calificación manual opcional (final_score, grader_id, feedback)
   * @returns Envío calificado
   */
  async gradeSubmission(
    id: string,
    manualGrade?: { final_score?: number; grader_id?: string; feedback?: string },
  ): Promise<ExerciseSubmission> {
    const submission = await this.submissionRepo.findOne({ where: { id } });

    if (!submission) {
      throw new NotFoundException(`Exercise submission with ID ${id} not found`);
    }

    if (submission.status === 'graded') {
      throw new BadRequestException('Submission already graded');
    }

    // P1-003: Check if manual grading is requested
    if (manualGrade?.final_score !== undefined) {
      this.logger.log(`[P1-003] Manual grading requested: score=${manualGrade.final_score}, grader=${manualGrade.grader_id}`);

      // Validate manual score range
      if (manualGrade.final_score < 0 || manualGrade.final_score > submission.max_score) {
        throw new BadRequestException(
          `Manual score must be between 0 and ${submission.max_score}`,
        );
      }

      // Apply manual grading
      submission.score = manualGrade.final_score;
      submission.is_correct = manualGrade.final_score >= (submission.max_score * 0.6); // 60% passing threshold
      submission.status = 'graded';
      submission.graded_at = new Date();

      // Store grader_id if provided
      if (manualGrade.grader_id) {
        (submission as any).grader_id = manualGrade.grader_id;
      }

      // Store manual feedback if provided
      if (manualGrade.feedback) {
        submission.feedback = manualGrade.feedback;
      } else {
        submission.feedback = `Calificación manual: ${manualGrade.final_score}/${submission.max_score}`;
      }

      this.logger.log(`[P1-003] Manual grading applied: ${submission.score}/${submission.max_score}, correct=${submission.is_correct}`);

      const savedSubmission = await this.submissionRepo.save(submission);

      // ✅ FIX M3-M5 2026-01-07: Auto-claim rewards después de calificación manual del teacher
      // Esto asegura que los rewards (XP, ML Coins) se distribuyan automáticamente
      // igual que en M1-M2 con auto-grading, pero basado en la evaluación del teacher
      if (savedSubmission.is_correct && savedSubmission.status === 'graded') {
        try {
          this.logger.log(`[M3-M5 FIX] Auto-claiming rewards after manual grading for submission ${savedSubmission.id}`);
          const rewards = await this.claimRewards(savedSubmission.id);

          // Asignar rankUp si existe
          (savedSubmission as any).rankUp = rewards.rankUp;
          (savedSubmission as any).rewards = {
            xp: rewards.xp_earned,
            mlCoins: rewards.ml_coins_earned,
          };

          this.logger.log(`[M3-M5 FIX] Rewards claimed: XP=${rewards.xp_earned}, MLCoins=${rewards.ml_coins_earned}`);
        } catch (rewardError) {
          // Log error but don't fail grading - rewards can be claimed manually later
          this.logger.error(`[M3-M5 FIX] Failed to auto-claim rewards: ${rewardError instanceof Error ? rewardError.message : String(rewardError)}`);
        }
      }

      // IMPL-004: Detectar y otorgar achievements después de calificación manual
      try {
        const earned = await this.achievementsService.detectAndGrantEarned(submission.user_id);
        if (earned.length > 0) {
          this.logger.log(`[IMPL-004] ✅ Granted ${earned.length} achievements to user ${submission.user_id} after manual grading`);
        }
      } catch (achievementError) {
        this.logger.error(`[IMPL-004] ❌ Error detecting achievements: ${achievementError instanceof Error ? achievementError.message : String(achievementError)}`);
      }

      return savedSubmission;
    }

    // Default: Auto-grading using SQL validate_and_audit()
    this.logger.log('[P1-003] No manual score provided - executing auto-grading');

    const { score, isCorrect, correctAnswers, totalQuestions, feedback, details, auditId } = await this.autoGrade(
      submission.user_id,       // userId (profiles.id)
      submission.exercise_id,
      submission.answer_data,
      submission.attempt_number || 1,
      {},                        // clientMetadata - can add IP, user-agent later
    );

    submission.score = score;
    submission.is_correct = isCorrect;
    submission.status = 'graded';
    submission.graded_at = new Date();

    // FE-059: Audit ID is stored in educational_content.exercise_validation_audit
    // Can be queried using: exercise_id + user_id + attempt_number
    this.logger.log(`[FE-059] Validation audit saved with ID: ${auditId}`);

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

    const savedSubmission = await this.submissionRepo.save(submission);

    // IMPL-004: Detectar y otorgar achievements después de auto-grading
    try {
      const earned = await this.achievementsService.detectAndGrantEarned(submission.user_id);
      if (earned.length > 0) {
        this.logger.log(`[IMPL-004] ✅ Granted ${earned.length} achievements to user ${submission.user_id} after auto-grading`);
      }
    } catch (achievementError) {
      this.logger.error(`[IMPL-004] ❌ Error detecting achievements: ${achievementError instanceof Error ? achievementError.message : String(achievementError)}`);
    }

    return savedSubmission;
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
    answerData: Record<string, unknown>,
    attemptNumber: number = 1,
    clientMetadata: Record<string, unknown> = {},
  ): Promise<{
      score: number;
      isCorrect: boolean;
      correctAnswers: number;
      totalQuestions: number;
      feedback: string;
      details: Record<string, unknown>;
      auditId: string;
    }> {
    // Get exercise to check type
    const exercise = await this.exerciseRepo.findOne({ where: { id: exerciseId } });
    if (!exercise) {
      throw new NotFoundException(`Exercise ${exerciseId} not found`);
    }

    // SPECIAL CASE: Completar Espacios - Anti-redundancy validation (Exercise 1.3)
    if (exercise.exercise_type === 'completar_espacios') {
      this.logger.log('[autoGrade] Checking anti-redundancy for Completar Espacios (Exercise 1.3)');

      // Check if blanks.5 and blanks.6 exist and are identical (case-insensitive)
      const blanks = (answerData.blanks || {}) as Record<string, unknown>;
      if (blanks['5'] && blanks['6']) {
        const space5 = String(blanks['5']).toLowerCase().trim();
        const space6 = String(blanks['6']).toLowerCase().trim();

        if (space5 === space6) {
          this.logger.log(`[autoGrade] REDUNDANCY DETECTED: space5="${space5}" === space6="${space6}"`);

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
                message: 'Los espacios 5 y 6 deben ser diferentes',
                espacios: ['5', '6'],
                valor_detectado: space5,
              },
            },
            auditId,
          };
        }
      }

      this.logger.log('[autoGrade] Anti-redundancy check passed, proceeding with normal validation');
    }

    // SPECIAL CASE: Rueda de Inferencias custom validation
    if (exercise.exercise_type === 'rueda_inferencias') {
      this.logger.log('[autoGrade] Using custom validation for Rueda de Inferencias');

      // Extract fragmentStates from answerData if available
      const fragmentStates = answerData.fragmentStates as FragmentState[] | undefined;

      // Validate using custom function
      const validationResult = this.validateRuedaInferencias(
        answerData as unknown as RuedaInferenciasAnswersDto,
        exercise,
        fragmentStates,
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
          maxScore: validationResult.maxScore,
        },
        auditId,
      };
    }

    // DEFAULT CASE: Use SQL validate_and_audit() for other exercise types
    this.logger.log(`[FE-059] Validating exercise ${exerciseId} using SQL validate_and_audit()`);

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
        JSON.stringify(clientMetadata),
      ]);

      if (!result || result.length === 0) {
        throw new InternalServerErrorException('Validation function returned no results');
      }

      const validation = result[0];

      this.logger.log(`[FE-059] Validation result: score=${validation.score}/${validation.max_score}, correct=${validation.is_correct}, audit_id=${validation.audit_id}`);

      return {
        score: validation.score,
        isCorrect: validation.is_correct,
        correctAnswers: validation.details?.correct_answers || 0,
        totalQuestions: validation.details?.total_questions || validation.details?.total_words || validation.details?.total_events || 1,
        feedback: validation.feedback || '',
        details: validation.details || {},
        auditId: validation.audit_id,
      };
    } catch (error) {
      this.logger.error('[FE-059] Error calling validate_and_audit():', error);
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
    feedback: Record<string, unknown>,
  ): Promise<ExerciseSubmission> {
    const submission = await this.submissionRepo.findOne({ where: { id } });

    if (!submission) {
      throw new NotFoundException(`Exercise submission with ID ${id} not found`);
    }

    submission.feedback = typeof feedback === 'string' ? feedback : JSON.stringify(feedback);
    submission.status = 'reviewed';

    return this.submissionRepo.save(submission);
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

    return this.submissionRepo.save(submission);
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
    return this.submissionRepo.find({
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
    fragmentStates?: FragmentState[],
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
    this.logger.log('[validateRuedaInferencias] Starting validation for Rueda de Inferencias exercise');

    // Cast solution to ExerciseSolution interface
    const solution = exercise.solution as unknown as ExerciseSolution;

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
        this.logger.log(`[validateRuedaInferencias] No answer provided for fragment ${fragment.id}, skipping`);
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

      this.logger.log(`[validateRuedaInferencias] Fragment ${fragment.id} using category: ${categoryId}`);

      // Get expectations for this category (with type safety)
      type CategoryId = 'cat-literal' | 'cat-inferencial' | 'cat-critico' | 'cat-creativo';
      let categoryExpectation = fragment.categoryExpectations?.[categoryId as CategoryId];

      if (!categoryExpectation) {
        this.logger.warn(`[validateRuedaInferencias] No expectations found for category ${categoryId} in fragment ${fragment.id}, using default`);
        // Fallback: use literal category if available
        categoryExpectation = fragment.categoryExpectations?.['cat-literal'];
        if (!categoryExpectation) {
          continue; // Skip this fragment if no valid expectations
        }
      }

      // Validate categoryExpectation structure
      if (!categoryExpectation.keywords || !Array.isArray(categoryExpectation.keywords)) {
        this.logger.warn(`[validateRuedaInferencias] Invalid category expectation for ${categoryId} in fragment ${fragment.id}`);
        continue;
      }

      maxScore += categoryExpectation.points;

      // Validate keywords (case-insensitive)
      const expectedKeywords = categoryExpectation.keywords;
      const userAnswerLower = userAnswer.toLowerCase().trim();

      const foundKeywords = expectedKeywords.filter((keyword: string) =>
        userAnswerLower.includes(keyword.toLowerCase()),
      );

      this.logger.log(`[validateRuedaInferencias] Fragment ${fragment.id}: Found ${foundKeywords.length}/${expectedKeywords.length} keywords`);

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

    this.logger.log(`[validateRuedaInferencias] Validation complete: ${totalScore}/${maxScore} points (${overallPercentage.toFixed(1)}%)`);

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
   * @returns Envío con información de rewards y rankUp si hubo promoción
   */
  async claimRewards(id: string): Promise<{
    submission: ExerciseSubmission;
    xp_earned: number;
    ml_coins_earned: number;
    rankUp: {
      newRank: string;
      previousRank: string;
      bonusMLCoins: number;
      newMultiplier: number;
    } | null;
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
        rankUp: null,
      };
    }

    // ✅ FIX GAM-002: Validar que rewards no fueron reclamados previamente
    // Esto previene duplicación de rewards si claimRewards() se llama múltiples veces
    if (submission.xp_earned > 0 || submission.ml_coins_earned > 0) {
      this.logger.warn(`[claimRewards] Rewards already claimed for submission ${id}. Returning existing values.`);
      return {
        submission,
        xp_earned: submission.xp_earned,
        ml_coins_earned: submission.ml_coins_earned,
        rankUp: null, // No hay nuevo rankUp si ya se reclamaron
      };
    }

    // Obtener exercise para usar su xp_reward configurado
    const exercise = await this.exerciseRepo.findOne({ where: { id: submission.exercise_id } });
    const baseXpReward = exercise?.xp_reward || 100; // Fallback a 100 si no existe
    const baseMlCoinsReward = exercise?.ml_coins_reward || 20; // Fallback a 20 si no existe

    // FIX 2025-11-29: Obtener multiplicador de rango del usuario desde maya_ranks
    // Ver: docs/90-transversal/correcciones/CORRECCION-GAMIFICACION-RANGOS-2025-11-29.md
    const rankMultiplier = await this.getRankXpMultiplier(submission.user_id);

    // Calcular rewards basado en score y rewards configurados del ejercicio
    const scoreMultiplier = submission.score / submission.max_score;
    // FIX 2025-11-29: Aplicar multiplicador de rango al XP ganado
    // Formula: xpEarned = base × score × rankMultiplier
    let xpEarned = Math.floor(baseXpReward * scoreMultiplier * rankMultiplier);
    let mlCoinsEarned = Math.floor(baseMlCoinsReward * scoreMultiplier);

    this.logger.log(`[claimRewards] XP calculation: base=${baseXpReward}, score=${scoreMultiplier.toFixed(2)}, rank=${rankMultiplier}x, total=${xpEarned}`);

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
    this.logger.log(`[BUG-001 FIX] Claiming rewards for user ${submission.user_id}: +${xpEarned} XP, +${mlCoinsEarned} ML Coins`);

    // Obtener rango ANTES de agregar XP
    const userStatsBefore = await this.userStatsService.findByUserId(submission.user_id);
    const previousRank = userStatsBefore.current_rank;

    await this.userStatsService.addXp(submission.user_id, xpEarned);
    await this.mlCoinsService.addCoins(
      submission.user_id,
      mlCoinsEarned,
      TransactionTypeEnum.EARNED_EXERCISE,
      `Ejercicio completado: ${submission.exercise_id}`,
      submission.exercise_id,
      'exercise',
    );

    // Verificar si hubo promoción de rango
    // FIX 2025-11-29: Usamos setImmediate + query directo para bypass de cache TypeORM.
    // El trigger trg_check_rank_promotion_on_xp_gain actualiza current_rank en DB,
    // pero TypeORM podría tener el valor anterior en cache.
    // Ver: docs/90-transversal/correcciones/CORRECCION-GAMIFICACION-RANGOS-2025-11-29.md
    await new Promise(resolve => setImmediate(resolve));

    // Query SQL directo sin cache para detectar cambio del trigger
    const userStatsAfter = await this.entityManager.query(`
      SELECT current_rank, total_xp, ml_coins
      FROM gamification_system.user_stats
      WHERE user_id = $1
    `, [submission.user_id]);

    const newRank = userStatsAfter[0]?.current_rank || previousRank;

    let rankUpData = null;
    if (previousRank !== newRank) {
      // Hubo promoción - obtener datos del nuevo rango desde maya_ranks (BD)
      // FIX FASE 0.1: Consultar BD en lugar de valores hard-coded
      // Ver: REFINAMIENTO-PLAN-2026-01-07.md
      const rankConfig = await this.getRankConfigFromDB(newRank);
      const bonusCoins = rankConfig.mlCoinsBonus;
      const newMultiplier = rankConfig.xpMultiplier;

      rankUpData = {
        newRank: newRank,
        previousRank: previousRank,
        bonusMLCoins: bonusCoins,
        newMultiplier: newMultiplier,
      };

      // ✅ FIX GAM-001: Agregar bonus ML Coins por promoción de rango
      // Los bonus se agregan directamente a mlCoinsEarned y se persisten
      // CORREGIDO: Usar EARNED_RANK (valor correcto del enum) en lugar de RANK_UP_BONUS
      if (bonusCoins > 0) {
        mlCoinsEarned += bonusCoins;
        await this.mlCoinsService.addCoins(
          submission.user_id,
          bonusCoins,
          TransactionTypeEnum.EARNED_RANK,
          `Bonus por ascenso a ${newRank}`,
          undefined,
          'rank_promotion',
        );
        this.logger.log(`[GAM-001 FIX] Added ${bonusCoins} bonus ML Coins for rank up to ${newRank}`);
      }

      this.logger.log(`[RANK UP] User ${submission.user_id} promoted from ${previousRank} to ${newRank}`);

      // FIX GAP-LOW-004: Enviar notificación in-app de promoción de rango
      try {
        await this.notificationService.create({
          userId: submission.user_id,
          type: NotificationTypeEnum.RANK_UP,
          title: `¡Felicidades! Ascendiste a ${newRank}`,
          message: `Has sido promovido de ${previousRank} a ${newRank}. Tu nuevo multiplicador de XP es ${newMultiplier}x. ¡Sigue así!`,
          metadata: {
            previousRank,
            newRank,
            bonusMLCoins: bonusCoins,
            newMultiplier: newMultiplier,
          },
        });
        this.logger.log(`[GAP-LOW-004] Rank up notification sent to user ${submission.user_id}`);
      } catch (notifError) {
        // Don't fail reward claiming if notification fails
        this.logger.warn(`[GAP-LOW-004] Failed to send rank up notification: ${notifError}`);
      }
    }

    // ✅ FIX BUG-002: Actualizar module_progress después de completar ejercicio
    await this.updateModuleProgressAfterCompletion(
      submission.user_id,
      submission.exercise_id,
      xpEarned,
      mlCoinsEarned,
    );

    // ✅ FIX BUG-003: Actualizar misiones después de completar ejercicio
    // NOTA: El trigger de BD también actualiza misiones, pero esta llamada
    // asegura redundancia en caso de que el trigger no se ejecute
    await this.updateMissionsProgressAfterCompletion(submission.user_id, xpEarned);

    // Persistir rewards en la submission
    submission.xp_earned = xpEarned;
    submission.ml_coins_earned = mlCoinsEarned;
    await this.submissionRepo.save(submission);

    // FIX GAP-LOW-003: Emit real-time balance updates via WebSocket
    try {
      // Obtener balance actualizado para emitir
      const updatedStats = userStatsAfter[0];
      const totalMlCoins = updatedStats?.ml_coins || 0;
      const totalXp = updatedStats?.total_xp || 0;

      // Emitir balance actualizado para la tienda
      this.webSocketService.emitBalanceUpdated(submission.user_id, {
        mlCoins: totalMlCoins,
        xp: totalXp,
        rank: newRank,
        source: 'exercise_completion',
      });

      // Emitir ML Coins ganados (para animaciones/notificaciones UI)
      if (mlCoinsEarned > 0) {
        this.webSocketService.emitMLCoinsEarned(submission.user_id, {
          amount: mlCoinsEarned,
          source: `Ejercicio completado: ${submission.exercise_id}`,
          totalCoins: totalMlCoins,
          bonusMultiplier: rankUpData?.newMultiplier,
        });
      }

      // Emitir XP ganado
      if (xpEarned > 0) {
        this.webSocketService.emitXpGained(submission.user_id, {
          amount: xpEarned,
          source: 'exercise_completion',
          totalXp: totalXp,
        });
      }

      // Emitir rank update si hubo promoción
      if (rankUpData) {
        this.webSocketService.emitRankUpdated(submission.user_id, {
          newRank: rankUpData.newRank,
          oldRank: rankUpData.previousRank,
        });
      }

      this.logger.log(`[GAP-LOW-003] WebSocket balance updates emitted for user ${submission.user_id}`);
    } catch (wsError) {
      // Don't fail reward claiming if WebSocket fails
      this.logger.warn(`[GAP-LOW-003] Failed to emit WebSocket updates: ${wsError}`);
    }

    return {
      submission,
      xp_earned: xpEarned,
      ml_coins_earned: mlCoinsEarned,
      rankUp: rankUpData,
    };
  }

  /**
   * Obtiene el multiplicador de XP del rango actual del usuario
   *
   * FIX 2025-11-29: Agregado para aplicar multiplicadores de XP por rango.
   * Los multiplicadores están definidos en gamification_system.maya_ranks.
   *
   * IMPORTANTE: NO eliminar este método. Es crítico para el sistema de rangos.
   * Ver: docs/90-transversal/correcciones/CORRECCION-GAMIFICACION-RANGOS-2025-11-29.md
   *
   * @param userId - ID del usuario
   * @returns Multiplicador de XP (1.00 - 1.25)
   */
  private async getRankXpMultiplier(userId: string): Promise<number> {
    try {
      const userStats = await this.userStatsService.findByUserId(userId);
      const currentRank = userStats.current_rank;

      // Consultar multiplicador desde maya_ranks table
      const result = await this.entityManager.query(`
        SELECT xp_multiplier
        FROM gamification_system.maya_ranks
        WHERE rank_name = $1 AND is_active = true
      `, [currentRank]);

      if (result && result.length > 0) {
        return parseFloat(result[0].xp_multiplier) || 1.00;
      }

      return 1.00; // Default si no encuentra
    } catch {
      this.logger.warn(`[getRankXpMultiplier] Error getting multiplier for user ${userId}, using 1.00`);
      return 1.00;
    }
  }

  /**
   * Obtiene la configuración completa de un rango desde la BD
   *
   * @description Consulta gamification_system.maya_ranks para obtener xp_multiplier y ml_coins_bonus.
   * Esto elimina la dependencia de valores hard-coded y permite actualizar rangos sin deploy.
   *
   * Ver: FASE 0.1 del plan de consolidación (REFINAMIENTO-PLAN-2026-01-07.md)
   *
   * @param rankName - Nombre del rango (ej: 'Ajaw', 'Nacom', etc.)
   * @returns Objeto con xp_multiplier y ml_coins_bonus, o valores por defecto si no encuentra
   */
  private async getRankConfigFromDB(rankName: string): Promise<{ xpMultiplier: number; mlCoinsBonus: number }> {
    try {
      const result = await this.entityManager.query(`
        SELECT xp_multiplier, ml_coins_bonus
        FROM gamification_system.maya_ranks
        WHERE rank_name = $1 AND is_active = true
      `, [rankName]);

      if (result && result.length > 0) {
        return {
          xpMultiplier: parseFloat(result[0].xp_multiplier) || 1.00,
          mlCoinsBonus: parseInt(result[0].ml_coins_bonus, 10) || 0,
        };
      }

      this.logger.warn(`[getRankConfigFromDB] Rank '${rankName}' not found in maya_ranks, using defaults`);
      return { xpMultiplier: 1.00, mlCoinsBonus: 0 };
    } catch (error) {
      this.logger.warn(`[getRankConfigFromDB] Error getting config for rank '${rankName}': ${error}`);
      return { xpMultiplier: 1.00, mlCoinsBonus: 0 };
    }
  }

  /**
   * Actualiza el progreso del módulo después de completar un ejercicio correctamente
   *
   * @description Esta función replica la lógica del trigger update_module_progress_on_exercise_complete
   * para exercise_submissions (ya que el trigger original solo funciona con exercise_attempts)
   *
   * @param userId - ID del usuario
   * @param exerciseId - ID del ejercicio completado
   * @param xpEarned - XP ganado en el ejercicio
   * @param mlCoinsEarned - ML Coins ganados en el ejercicio
   */
  private async updateModuleProgressAfterCompletion(
    userId: string,
    exerciseId: string,
    xpEarned: number,
    mlCoinsEarned: number,
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

      // Verificar si es el primer envío correcto para ESTE ejercicio específico
      const previousCorrectSubmissions = await this.submissionRepo.count({
        where: {
          user_id: userId,
          exercise_id: exerciseId,
          is_correct: true,
        },
      });

      // Si hay más de 1 (incluyendo el actual), no es el primero - solo actualizar timestamp
      if (previousCorrectSubmissions > 1) {
        await this.entityManager.query(`
          UPDATE progress_tracking.module_progress
          SET last_accessed_at = NOW(), updated_at = NOW()
          WHERE user_id = $1 AND module_id = $2
        `, [userId, moduleId]);
        this.logger.log('[BUG-002 FIX] Not first correct submission - only updated timestamps');
        return;
      }

      // Contar total de ejercicios activos en el módulo
      const totalExercisesResult = await this.exerciseRepo.count({
        where: { module_id: moduleId, is_active: true },
      });
      const totalExercises = totalExercisesResult || 0;

      // Contar ejercicios correctos ÚNICOS del usuario en este módulo
      const completedExercisesResult = await this.entityManager.query(`
        SELECT COUNT(DISTINCT es.exercise_id) as count
        FROM progress_tracking.exercise_submissions es
        JOIN educational_content.exercises e ON e.id = es.exercise_id
        WHERE es.user_id = $1
          AND e.module_id = $2
          AND es.is_correct = true
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

      this.logger.log('[BUG-002 FIX] ✅ Module progress updated successfully');

    } catch (error) {
      // Log error pero no bloquear el claim de rewards
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[BUG-002 FIX] ❌ Error updating module progress: ${errorMessage}`);
      // No throw - la actualización de progreso no debe bloquear la respuesta
    }
  }

  /**
   * Actualiza el progreso de misiones después de completar un ejercicio correctamente
   *
   * @description Esta función busca misiones activas del usuario con objetivo 'complete_exercises'
   * y actualiza su progreso. Complementa el trigger de BD para asegurar consistencia.
   *
   * NOTA: El trigger 25-trg_update_missions_on_submission también actualiza misiones,
   * pero esta función provee redundancia en caso de que el trigger no se ejecute.
   *
   * @param userId - ID del usuario (profiles.id)
   * @param xpEarned - XP ganado en el ejercicio (para actualizar misiones earn_xp)
   */
  private async updateMissionsProgressAfterCompletion(userId: string, xpEarned: number = 0): Promise<void> {
    try {
      this.logger.log(`[BUG-003 FIX] Updating missions progress for user ${userId}`);

      // Buscar misiones activas del usuario con objetivo 'complete_exercises'
      const missions = await this.missionsService.findByTypeAndUser(userId, MissionTypeEnum.DAILY);
      const weeklyMissions = await this.missionsService.findByTypeAndUser(userId, MissionTypeEnum.WEEKLY);
      const allMissions = [...missions, ...weeklyMissions];

      // Filtrar solo misiones que tienen objetivo 'complete_exercises' y no están completadas/claimed
      const activeMissions = allMissions.filter(mission =>
        mission.status !== 'completed' &&
        mission.status !== 'claimed' &&
        mission.objectives?.some((obj: any) => obj.type === 'complete_exercises'), // eslint-disable-line @typescript-eslint/no-explicit-any
      );

      if (activeMissions.length === 0) {
        this.logger.log('[BUG-003 FIX] No active missions with \'complete_exercises\' objective found');
        return;
      }

      // Actualizar cada misión activa
      for (const mission of activeMissions) {
        try {
          await this.missionsService.updateProgress(
            mission.id,
            userId,
            'complete_exercises',
            1, // Incrementar en 1 por cada ejercicio completado
          );
          this.logger.log(`[BUG-003 FIX] ✅ Mission ${mission.id} (complete_exercises) updated`);
        } catch (missionError) {
          // Log pero continuar con otras misiones
          const errorMessage = missionError instanceof Error ? missionError.message : String(missionError);
          this.logger.warn(`[BUG-003 FIX] ⚠️ Error updating mission ${mission.id}: ${errorMessage}`);
        }
      }

      // Actualizar misiones con objetivo 'earn_xp'
      if (xpEarned > 0) {
        const xpMissions = allMissions.filter(mission =>
          mission.status !== 'completed' &&
          mission.status !== 'claimed' &&
          mission.objectives?.some((obj: any) => obj.type === 'earn_xp'), // eslint-disable-line @typescript-eslint/no-explicit-any
        );

        for (const mission of xpMissions) {
          try {
            await this.missionsService.updateProgress(
              mission.id,
              userId,
              'earn_xp',
              xpEarned, // Incrementar por cantidad de XP ganado
            );
            this.logger.log(`[BUG-003 FIX] ✅ Mission ${mission.id} (earn_xp) updated with +${xpEarned} XP`);
          } catch (missionError) {
            const errorMessage = missionError instanceof Error ? missionError.message : String(missionError);
            this.logger.warn(`[BUG-003 FIX] ⚠️ Error updating earn_xp mission ${mission.id}: ${errorMessage}`);
          }
        }
      }

      this.logger.log('[BUG-003 FIX] ✅ Missions progress update completed');

    } catch (error) {
      // Log error pero no bloquear el claim de rewards
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[BUG-003 FIX] ❌ Error updating missions progress: ${errorMessage}`);
      // No throw - la actualización de misiones no debe bloquear la respuesta
    }
  }

  /**
   * Auto-guarda progreso parcial de un ejercicio
   *
   * @description Guarda el progreso parcial del estudiante para evitar pérdida de trabajo.
   * Crea o actualiza una submission con status 'draft' que puede ser recuperada después.
   *
   * Flujo:
   * 1. Buscar submission existente con status 'draft' para este usuario + ejercicio
   * 2. Si existe: actualizar con nuevos datos parciales
   * 3. Si no existe: crear nueva submission draft
   * 4. Actualizar timestamp de última modificación
   *
   * @param userId - ID del usuario (auth.users.id from JWT)
   * @param exerciseId - ID del ejercicio
   * @param partialAnswers - Respuestas parciales del estudiante
   * @param timeSpentSeconds - Tiempo transcurrido en segundos
   * @param metadata - Metadatos adicionales (hints, UI state, etc.)
   * @returns Submission draft actualizada
   */
  async autoSaveProgress(
    userId: string,
    exerciseId: string,
    partialAnswers?: Record<string, unknown>,
    timeSpentSeconds?: number,
    metadata?: Record<string, unknown>,
  ): Promise<ExerciseSubmission> {
    // Convert auth.users.id → profiles.id
    const profileId = await this.getProfileId(userId);

    // Buscar submission draft existente
    const submission = await this.submissionRepo.findOne({
      where: {
        user_id: profileId,
        exercise_id: exerciseId,
        status: 'draft',
      },
    });

    // Si no existe, crear nueva submission draft
    if (!submission) {
      const metadataTyped = metadata as { hints_used?: number; comodines_used?: string[] } | undefined;
      const newSubmission = this.submissionRepo.create({
        user_id: profileId,
        exercise_id: exerciseId,
        status: 'draft',
        answer_data: partialAnswers || {},
        time_spent_seconds: timeSpentSeconds || 0,
        started_at: new Date(),
        submitted_at: new Date(), // Requerido por schema
        score: 0,
        max_score: 100,
        hint_used: false,
        hints_count: metadataTyped?.hints_used || 0,
        comodines_used: metadataTyped?.comodines_used || [],
        ml_coins_spent: 0,
        attempt_number: 1,
      } as any) as unknown as ExerciseSubmission;
      return this.submissionRepo.save(newSubmission);
    }

    // Actualizar submission existente con nuevos datos parciales
    submission.answer_data = partialAnswers || submission.answer_data;
    submission.time_spent_seconds = timeSpentSeconds ?? submission.time_spent_seconds;

    // Merge metadata (preservar datos previos + agregar nuevos)
    if (metadata) {
      const metadataTyped = metadata as { hints_used?: number; comodines_used?: string[] };
      submission.hints_count = metadataTyped.hints_used ?? submission.hints_count;
      submission.comodines_used = metadataTyped.comodines_used ?? submission.comodines_used;
    }

    // Actualizar timestamp (updated_at se actualiza automáticamente por @UpdateDateColumn)

    // Guardar y retornar
    return this.submissionRepo.save(submission);
  }

  /**
   * Recupera progreso parcial guardado de un ejercicio
   *
   * @description Obtiene la submission draft más reciente del usuario para este ejercicio.
   * Si no existe, retorna null.
   *
   * @param userId - ID del usuario (auth.users.id from JWT)
   * @param exerciseId - ID del ejercicio
   * @returns Submission draft o null si no existe
   */
  async getAutoSavedProgress(
    userId: string,
    exerciseId: string,
  ): Promise<ExerciseSubmission | null> {
    // Convert auth.users.id → profiles.id
    const profileId = await this.getProfileId(userId);

    // Buscar submission draft más reciente
    const submission = await this.submissionRepo.findOne({
      where: {
        user_id: profileId,
        exercise_id: exerciseId,
        status: 'draft',
      },
      order: { updated_at: 'DESC' },
    });

    return submission;
  }

  /**
   * Convierte una submission draft en submission final
   *
   * @description Cuando el estudiante hace submit final del ejercicio,
   * convierte el draft guardado en submission oficial y aplica scoring.
   *
   * @param userId - ID del usuario (auth.users.id from JWT)
   * @param exerciseId - ID del ejercicio
   * @param finalAnswers - Respuestas finales del estudiante
   * @returns Submission procesada con score y rewards
   */
  async convertDraftToFinalSubmission(
    userId: string,
    exerciseId: string,
    finalAnswers: Record<string, unknown>,
  ): Promise<ExerciseSubmission> {
    // Buscar draft existente
    const draft = await this.getAutoSavedProgress(userId, exerciseId);

    if (draft) {
      // Actualizar draft con respuestas finales
      draft.answer_data = finalAnswers;
      draft.status = 'submitted';
      draft.submitted_at = new Date();

      await this.submissionRepo.save(draft);

      // Procesar submission (score, rewards, etc.)
      // Reutilizar lógica existente de submitExercise
      return draft;
    } else {
      // Si no hay draft, crear nueva submission desde cero
      return this.submitExercise(userId, exerciseId, finalAnswers);
    }
  }

  /**
   * Notifica al docente cuando un estudiante envía un ejercicio M4-M5
   *
   * @description BE-P2-008: Notificaciones Push/Email para Docentes
   *
   * Flujo:
   * 1. Obtener datos del estudiante (nombre, email)
   * 2. Obtener docente asignado desde classroom_members + teacher_classrooms
   * 3. Verificar preferencias del docente para email
   * 4. Enviar notificación in-app (siempre)
   * 5. Enviar email si está habilitado en preferencias
   *
   * @param submission - Submission recién creada
   * @param exercise - Ejercicio que requiere revisión manual
   * @param studentProfileId - ID del perfil del estudiante
   */
  private async notifyTeacherOfSubmission(
    submission: ExerciseSubmission,
    exercise: Exercise,
    studentProfileId: string,
  ): Promise<void> {
    this.logger.log(`[BE-P2-008] Notifying teacher about submission ${submission.id}`);

    // 1. Obtener datos del estudiante
    const studentProfile = await this.profileRepo.findOne({
      where: { id: studentProfileId },
      select: ['id', 'display_name', 'full_name', 'email'],
    });

    if (!studentProfile) {
      this.logger.warn(`[BE-P2-008] Student profile ${studentProfileId} not found - skipping notification`);
      return;
    }

    const studentName = studentProfile.display_name || studentProfile.full_name || 'Un estudiante';

    // 2. Obtener docente asignado desde classroom_members + teacher_classrooms
    // Query: Buscar classroom del estudiante y luego su teacher (role='owner' tiene prioridad)
    const teacherQuery = `
      SELECT DISTINCT ON (tc.teacher_id)
        p.id as teacher_id,
        p.display_name as teacher_name,
        p.email as teacher_email,
        p.preferences as teacher_preferences,
        c.name as classroom_name
      FROM social_features.classroom_members cm
      JOIN social_features.teacher_classrooms tc ON tc.classroom_id = cm.classroom_id
      JOIN auth_management.profiles p ON p.id = tc.teacher_id
      JOIN social_features.classrooms c ON c.id = cm.classroom_id
      WHERE cm.student_id = $1
        AND cm.status = 'active'
        AND cm.is_active = true
      ORDER BY tc.teacher_id, tc.role = 'owner' DESC, tc.assigned_at ASC
      LIMIT 1
    `;

    const teacherResult = await this.entityManager.query(teacherQuery, [studentProfileId]);

    if (!teacherResult || teacherResult.length === 0) {
      this.logger.warn(`[BE-P2-008] No active teacher found for student ${studentProfileId} - skipping notification`);
      return;
    }

    const teacher = teacherResult[0];
    const teacherId = teacher.teacher_id;
    const teacherEmail = teacher.teacher_email;
    const teacherName = teacher.teacher_name || 'Profesor';
    const classroomName = teacher.classroom_name || 'tu aula';
    const teacherPreferences = teacher.teacher_preferences || {};

    this.logger.log(`[BE-P2-008] Found teacher ${teacherId} (${teacherEmail}) for student ${studentProfileId}`);

    // 3. Construir URL de revisión
    const reviewUrl = `/teacher/reviews/${submission.id}`;

    // 4. Enviar notificación in-app (siempre)
    const notificationTitle = `Nuevo ejercicio para revisar`;
    const notificationMessage = `${studentName} ha enviado el ejercicio "${exercise.title}" (${exercise.exercise_type}) y está esperando tu revisión.`;

    try {
      // Migrado de NotificationsService (deprecated) a NotificationService (consolidado)
      await this.notificationService.create({
        userId: teacherId,
        type: NotificationTypeEnum.EXERCISE_FEEDBACK, // string compatible
        title: notificationTitle,
        message: notificationMessage,
        data: {
          submissionId: submission.id,
          exerciseId: exercise.id,
          exerciseTitle: exercise.title,
          exerciseType: exercise.exercise_type,
          studentId: studentProfileId,
          studentName: studentName,
          reviewUrl: reviewUrl,
          classroomName: classroomName,
        },
        metadata: {
          relatedEntityType: 'exercise_submission',
          relatedEntityId: submission.id,
        },
        priority: 'high',
      });

      this.logger.log(`[BE-P2-008] ✅ In-app notification sent to teacher ${teacherId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[BE-P2-008] ❌ Failed to send in-app notification: ${errorMessage}`);
    }

    // 5. Enviar email si está habilitado en preferencias
    const emailNotificationsEnabled = teacherPreferences?.notifications_enabled !== false;
    const exerciseFeedbackEmailEnabled = teacherPreferences?.email_notifications?.exercise_feedback !== false;

    if (emailNotificationsEnabled && exerciseFeedbackEmailEnabled && teacherEmail) {
      this.logger.log(`[BE-P2-008] Email notifications enabled for teacher ${teacherId} - sending email to ${teacherEmail}`);

      const emailSubject = `Nuevo ejercicio para revisar: ${exercise.title}`;
      const emailMessage = `
        <p>Hola <strong>${teacherName}</strong>,</p>
        <p><strong>${studentName}</strong> ha enviado el ejercicio <strong>"${exercise.title}"</strong> en ${classroomName}.</p>
        <p><strong>Tipo de ejercicio:</strong> ${this.getExerciseTypeDisplayName(exercise.exercise_type)}</p>
        <p>Este ejercicio requiere revisión manual. Por favor, revisa el trabajo del estudiante cuando tengas oportunidad.</p>
        <p>Puedes acceder a la revisión desde tu panel de docente.</p>
      `;

      try {
        const emailSent = await this.mailService.sendNotificationEmail(
          teacherEmail,
          emailSubject,
          emailMessage,
          reviewUrl,
          'Revisar ejercicio',
        );

        if (emailSent) {
          this.logger.log(`[BE-P2-008] ✅ Email notification sent to teacher ${teacherEmail}`);
        } else {
          this.logger.warn(`[BE-P2-008] ⚠️ Email notification logged but not sent (SMTP not configured)`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`[BE-P2-008] ❌ Failed to send email notification: ${errorMessage}`);
      }
    } else {
      this.logger.log(`[BE-P2-008] Email notifications disabled for teacher ${teacherId} - skipping email`);
    }

    this.logger.log(`[BE-P2-008] ✅ Teacher notification process completed for submission ${submission.id}`);
  }

  /**
   * Helper: Obtiene el nombre descriptivo del tipo de ejercicio
   *
   * @param exerciseType - Tipo de ejercicio (enum)
   * @returns Nombre legible en español
   */
  private getExerciseTypeDisplayName(exerciseType: string): string {
    const displayNames: Record<string, string> = {
      video_carta_curie: 'Video Carta Curie',
      diario_multimedia: 'Diario Multimedia',
      comic_digital: 'Cómic Digital',
      podcast_argumentativo: 'Podcast Argumentativo',
      debate_digital: 'Debate Digital',
      infografia_interactiva: 'Infografía Interactiva',
      // Agregar más según sea necesario
    };

    return displayNames[exerciseType] || exerciseType;
  }

  /**
   * FEATURE M3-M5 2026-01-08: Actualiza el progreso del módulo cuando se ENVÍA un ejercicio
   *
   * @description
   * Este método se llama inmediatamente al enviar un ejercicio (submitExercise),
   * NO cuando el maestro lo califica. Esto permite que el estudiante vea su
   * progreso actualizado de inmediato, aunque las recompensas (XP/ML Coins)
   * se asignen después de la calificación del maestro.
   *
   * Campos actualizados:
   * - submitted_exercises: Cuenta de ejercicios enviados únicos
   * - submitted_progress_percentage: Porcentaje basado en envíos
   * - progress_percentage: Usa el valor de submitted (para barra visual)
   * - status: Actualiza a in_progress o completed según porcentaje
   *
   * @param userId - ID del usuario
   * @param exerciseId - ID del ejercicio enviado
   */
  private async updateModuleProgressOnSubmission(
    userId: string,
    exerciseId: string,
  ): Promise<void> {
    try {
      // 1. Obtener module_id del ejercicio
      const exercise = await this.exerciseRepo.findOne({
        where: { id: exerciseId },
        select: ['id', 'module_id'],
      });

      if (!exercise?.module_id) {
        this.logger.warn(`[updateModuleProgressOnSubmission] Exercise ${exerciseId} has no module_id`);
        return;
      }

      const moduleId = exercise.module_id;

      // 2. Contar ejercicios enviados únicos en el módulo
      // Incluye: submitted, graded, reviewed (todos los estados post-envío)
      const submittedResult = await this.entityManager.query(`
        SELECT COUNT(DISTINCT es.exercise_id) as count
        FROM progress_tracking.exercise_submissions es
        JOIN educational_content.exercises e ON e.id = es.exercise_id
        WHERE es.user_id = $1
          AND e.module_id = $2
          AND es.status IN ('submitted', 'graded', 'reviewed')
      `, [userId, moduleId]);

      const submittedExercises = parseInt(submittedResult[0]?.count || '0', 10);

      // 3. Obtener total de ejercicios activos del módulo
      const totalExercises = await this.exerciseRepo.count({
        where: { module_id: moduleId, is_active: true },
      });

      if (totalExercises === 0) {
        this.logger.warn(`[updateModuleProgressOnSubmission] Module ${moduleId} has no active exercises`);
        return;
      }

      // 4. Calcular porcentaje (capped a 100)
      const submittedPercentage = Math.min(
        100,
        Math.round((submittedExercises / totalExercises) * 100 * 100) / 100
      );

      // 5. Determinar nuevo status basado en porcentaje
      // Nota: No degradamos status si ya es 'mastered' o 'reviewed'
      let newStatus: string;
      if (submittedPercentage >= 100) {
        newStatus = 'completed';
      } else if (submittedPercentage > 0) {
        newStatus = 'in_progress';
      } else {
        newStatus = 'not_started';
      }

      // 6. UPSERT module_progress
      // Nota: No sobreescribimos status si ya es 'mastered' o 'reviewed'
      await this.entityManager.query(`
        INSERT INTO progress_tracking.module_progress (
          user_id, module_id, status, progress_percentage,
          submitted_exercises, submitted_progress_percentage,
          total_exercises, started_at, last_accessed_at
        ) VALUES (
          $1, $2, $3::progress_tracking.progress_status, $4, $5, $4, $6,
          NOW(), NOW()
        )
        ON CONFLICT (user_id, module_id) DO UPDATE SET
          status = CASE
            WHEN progress_tracking.module_progress.status = 'mastered' THEN 'mastered'::progress_tracking.progress_status
            WHEN progress_tracking.module_progress.status = 'reviewed' THEN 'reviewed'::progress_tracking.progress_status
            ELSE $3::progress_tracking.progress_status
          END,
          progress_percentage = $4,
          submitted_exercises = $5,
          submitted_progress_percentage = $4,
          total_exercises = $6,
          last_accessed_at = NOW(),
          updated_at = NOW()
      `, [userId, moduleId, newStatus, submittedPercentage, submittedExercises, totalExercises]);

      this.logger.log(
        `[updateModuleProgressOnSubmission] User ${userId}, Module ${moduleId}: ` +
        `${submittedExercises}/${totalExercises} (${submittedPercentage}%) - ${newStatus}`
      );

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[updateModuleProgressOnSubmission] Error: ${errorMessage}`);
      // No lanzar error - no debe bloquear el envío del ejercicio
    }
  }

  /**
   * BE-P2-009: Cuenta el número de palabras en un texto
   *
   * @description Utilizado para validar requisitos de longitud mínima en ejercicios M5
   * (diario_multimedia, comic_digital, video_carta_curie)
   *
   * @param text - Texto a contar
   * @returns Número de palabras (excluyendo espacios en blanco)
   */
  private countWords(text: string): number {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
}
