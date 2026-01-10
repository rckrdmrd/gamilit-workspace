/**
 * ExerciseGradingService
 *
 * @description Service for grading exercise submissions.
 * Extracted from ExerciseSubmissionService (P0-006: God Class division).
 *
 * Responsibilities:
 * - Auto-grading via SQL validate_and_audit() function
 * - Manual grading support for teacher-reviewed exercises
 * - Custom grading for Rueda de Inferencias exercise type
 * - Score calculation and feedback generation
 *
 * @see ExerciseSubmissionService - Orchestrates validation + grading + rewards
 * @see ExerciseValidatorService - Validates answers before grading
 */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository, InjectEntityManager } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Exercise } from '@/modules/educational/entities';
import { ExerciseSubmission } from '../../entities';

/**
 * Grading result structure
 */
export interface GradingResult {
  score: number;
  maxScore: number;
  isCorrect: boolean;
  correctAnswers: number;
  totalQuestions: number;
  feedback: string;
  details?: Record<string, unknown>;
  auditId?: string;
}

/**
 * Manual grading input
 */
export interface ManualGradeInput {
  finalScore: number;
  graderId?: string;
  feedback?: string;
}

/**
 * Rueda Inferencias fragment state
 */
interface FragmentState {
  fragmentId: string;
  categoryId: string;
  userText: string;
  timeSpent: number;
}

/**
 * Category expectation for Rueda Inferencias
 */
interface CategoryExpectation {
  keywords: string[];
  description: string;
  example: string;
  points: number;
}

/**
 * Fragment solution for Rueda Inferencias
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

@Injectable()
export class ExerciseGradingService {
  private readonly logger = new Logger(ExerciseGradingService.name);

  constructor(
    @InjectRepository(Exercise, 'educational')
    private readonly exerciseRepo: Repository<Exercise>,
    @InjectRepository(ExerciseSubmission, 'progress')
    private readonly submissionRepo: Repository<ExerciseSubmission>,
    @InjectEntityManager('progress')
    private readonly entityManager: EntityManager,
  ) {}

  /**
   * Auto-grades an exercise submission using SQL validate_and_audit() or custom logic
   *
   * @param userId - User ID (profiles.id)
   * @param exerciseId - Exercise ID
   * @param answerData - Submitted answers
   * @param attemptNumber - Attempt number (1, 2, 3, ...)
   * @param clientMetadata - Optional metadata (IP, user-agent, etc.)
   * @returns GradingResult
   */
  async autoGrade(
    userId: string,
    exerciseId: string,
    answerData: Record<string, unknown>,
    attemptNumber: number = 1,
    clientMetadata: Record<string, unknown> = {},
  ): Promise<GradingResult> {
    const exercise = await this.exerciseRepo.findOne({ where: { id: exerciseId } });
    if (!exercise) {
      throw new NotFoundException(`Exercise ${exerciseId} not found`);
    }

    // SPECIAL CASE: Rueda de Inferencias uses custom TypeScript validation
    if (exercise.exercise_type === 'rueda_inferencias') {
      this.logger.log('Using custom validation for Rueda de Inferencias');
      return this.gradeRuedaInferencias(
        answerData,
        exercise,
        answerData.fragmentStates as FragmentState[] | undefined,
      );
    }

    // CORR-009: Quiz TikTok auto-grading using solution.correctAnswers
    if (exercise.exercise_type === 'quiz_tiktok') {
      this.logger.log('Using custom validation for Quiz TikTok');
      return this.gradeQuizTiktok(answerData, exercise);
    }

    // DEFAULT CASE: Use SQL validate_and_audit() for other exercise types
    return this.gradeBySqlFunction(
      userId,
      exerciseId,
      answerData,
      attemptNumber,
      clientMetadata,
      100, // Exercise entity doesn't have max_score, using default
    );
  }

  /**
   * Applies manual grading to a submission
   *
   * @param submissionId - Submission ID
   * @param grade - Manual grade input
   * @returns Updated submission
   */
  async applyManualGrade(
    submissionId: string,
    grade: ManualGradeInput,
  ): Promise<ExerciseSubmission> {
    const submission = await this.submissionRepo.findOne({ where: { id: submissionId } });

    if (!submission) {
      throw new NotFoundException(`Submission ${submissionId} not found`);
    }

    if (submission.status === 'graded') {
      throw new BadRequestException('Submission already graded');
    }

    // Validate score range
    if (grade.finalScore < 0 || grade.finalScore > submission.max_score) {
      throw new BadRequestException(
        `Manual score must be between 0 and ${submission.max_score}`,
      );
    }

    // Apply manual grading
    const passingThreshold = 0.6; // 60%
    submission.score = grade.finalScore;
    submission.is_correct = grade.finalScore >= submission.max_score * passingThreshold;
    submission.status = 'graded';
    submission.graded_at = new Date();

    if (grade.graderId) {
      (submission as any).grader_id = grade.graderId;
    }

    submission.feedback = grade.feedback
      || `Calificacion manual: ${grade.finalScore}/${submission.max_score}`;

    this.logger.log(
      `Manual grading applied: ${submission.score}/${submission.max_score}, correct=${submission.is_correct}`,
    );

    return this.submissionRepo.save(submission);
  }

  /**
   * Grades using PostgreSQL validate_and_audit() function
   *
   * @private
   */
  private async gradeBySqlFunction(
    userId: string,
    exerciseId: string,
    answerData: Record<string, unknown>,
    attemptNumber: number,
    clientMetadata: Record<string, unknown>,
    maxScore: number,
  ): Promise<GradingResult> {
    this.logger.log(`Validating exercise ${exerciseId} using SQL validate_and_audit()`);

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

      this.logger.log(
        `Validation result: score=${validation.score}/${validation.max_score}, ` +
        `correct=${validation.is_correct}, audit_id=${validation.audit_id}`,
      );

      return {
        score: validation.score,
        maxScore: validation.max_score || maxScore,
        isCorrect: validation.is_correct,
        correctAnswers: validation.details?.correct_answers || 0,
        totalQuestions:
          validation.details?.total_questions ||
          validation.details?.total_words ||
          validation.details?.total_events ||
          1,
        feedback: validation.feedback || '',
        details: validation.details || {},
        auditId: validation.audit_id,
      };
    } catch (error) {
      this.logger.error(
        `SQL validation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new InternalServerErrorException(
        `Failed to validate exercise: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Custom grading for Rueda de Inferencias exercise type
   *
   * @description Validates category-specific text responses for each fragment
   *
   * @private
   */
  private gradeRuedaInferencias(
    answerData: Record<string, unknown>,
    exercise: Exercise,
    fragmentStates?: FragmentState[],
  ): GradingResult {
    const solution = exercise.solution as { fragments: FragmentSolution[] } | undefined;

    if (!solution?.fragments) {
      this.logger.warn('Exercise has no solution fragments configured');
      return {
        score: 0,
        maxScore: 100, // Exercise entity doesn't have max_score
        isCorrect: false,
        correctAnswers: 0,
        totalQuestions: 0,
        feedback: 'Exercise solution not configured',
        details: { error: 'No solution fragments' },
      };
    }

    const fragmentFeedback: Array<{
      fragmentId: string;
      categoryId: string;
      score: number;
      feedback: string;
    }> = [];

    let totalScore = 0;
    let maxPossibleScore = 0;

    // Process each fragment state from user
    if (fragmentStates && Array.isArray(fragmentStates)) {
      for (const state of fragmentStates) {
        const fragmentSolution = solution.fragments.find(
          (f) => f.id === state.fragmentId,
        );

        if (!fragmentSolution) {
          fragmentFeedback.push({
            fragmentId: state.fragmentId,
            categoryId: state.categoryId,
            score: 0,
            feedback: 'Fragment not found in solution',
          });
          continue;
        }

        const categoryKey = state.categoryId as keyof FragmentSolution['categoryExpectations'];
        const expectation = fragmentSolution.categoryExpectations[categoryKey];

        if (!expectation) {
          fragmentFeedback.push({
            fragmentId: state.fragmentId,
            categoryId: state.categoryId,
            score: 0,
            feedback: 'Category not configured',
          });
          continue;
        }

        maxPossibleScore += expectation.points;

        // Score based on keyword matching
        const { score, feedback } = this.scoreRuedaResponse(
          state.userText,
          expectation,
        );

        totalScore += score;
        fragmentFeedback.push({
          fragmentId: state.fragmentId,
          categoryId: state.categoryId,
          score,
          feedback,
        });
      }
    }

    // Normalize score to max_score scale
    const normalizedScore =
      maxPossibleScore > 0
        ? Math.round((totalScore / maxPossibleScore) * 100) // Exercise entity doesn't have max_score
        : 0;

    const isCorrect = normalizedScore >= (exercise.passing_score || 60);

    return {
      score: normalizedScore,
      maxScore: 100, // Exercise entity doesn't have max_score
      isCorrect,
      correctAnswers: fragmentFeedback.filter((f) => f.score > 0).length,
      totalQuestions: fragmentFeedback.length,
      feedback: isCorrect
        ? 'Buen trabajo! Has demostrado comprension de los diferentes niveles de inferencia.'
        : 'Revisa tus respuestas. Intenta profundizar mas en cada categoria.',
      details: {
        byFragment: fragmentFeedback,
        rawScore: totalScore,
        maxPossibleScore,
      },
    };
  }

  /**
   * Scores a single Rueda de Inferencias response
   *
   * @private
   */
  private scoreRuedaResponse(
    userText: string,
    expectation: CategoryExpectation,
  ): { score: number; feedback: string } {
    if (!userText || userText.trim().length === 0) {
      return { score: 0, feedback: 'Respuesta vacia' };
    }

    const normalizedText = userText.toLowerCase();
    let matchedKeywords = 0;

    for (const keyword of expectation.keywords) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        matchedKeywords++;
      }
    }

    // Score based on keyword coverage
    const coverage = matchedKeywords / expectation.keywords.length;
    let score = 0;
    let feedback = '';

    if (coverage >= 0.5) {
      score = expectation.points;
      feedback = 'Excelente! Capturaste los conceptos clave.';
    } else if (coverage >= 0.25) {
      score = Math.round(expectation.points * 0.5);
      feedback = 'Buen intento, pero faltan algunos conceptos importantes.';
    } else if (userText.length >= 20) {
      score = Math.round(expectation.points * 0.25);
      feedback = 'Tu respuesta necesita mas desarrollo. Considera: ' + expectation.example;
    } else {
      score = 0;
      feedback = 'Respuesta muy corta. Ejemplo: ' + expectation.example;
    }

    return { score, feedback };
  }

  /**
   * CORR-009: Auto-grades Quiz TikTok exercise type
   *
   * @description Validates multiple choice answers against solution.correctAnswers
   * Quiz TikTok has structure:
   *   - content.questions: array of {id, text, options, correct, timeLimit}
   *   - solution.correctAnswers: array of correct option indices [1, 1, 2]
   *   - answerData.answers: array of user selected indices
   *
   * @param answerData - User submitted answers { answers: number[] }
   * @param exercise - Exercise entity with solution
   * @returns GradingResult
   */
  private gradeQuizTiktok(
    answerData: Record<string, unknown>,
    exercise: Exercise,
  ): GradingResult {
    const solution = exercise.solution as {
      correctAnswers?: number[];
      totalQuestions?: number;
    } | undefined;

    if (!solution?.correctAnswers || !Array.isArray(solution.correctAnswers)) {
      this.logger.warn('Quiz TikTok exercise has no correctAnswers in solution');
      return {
        score: 0,
        maxScore: exercise.max_points || 100,
        isCorrect: false,
        correctAnswers: 0,
        totalQuestions: 0,
        feedback: 'Error: Exercise solution not configured correctly',
        details: { error: 'Missing correctAnswers in solution' },
      };
    }

    const userAnswers = answerData.answers as number[] | undefined;
    if (!userAnswers || !Array.isArray(userAnswers)) {
      this.logger.warn('Quiz TikTok submission has no answers array');
      return {
        score: 0,
        maxScore: exercise.max_points || 100,
        isCorrect: false,
        correctAnswers: 0,
        totalQuestions: solution.correctAnswers.length,
        feedback: 'No answers submitted',
        details: { error: 'Missing answers in submission' },
      };
    }

    const totalQuestions = solution.correctAnswers.length;
    let correctCount = 0;
    const questionResults: { questionIndex: number; userAnswer: number; correctAnswer: number; isCorrect: boolean }[] = [];

    for (let i = 0; i < totalQuestions; i++) {
      const correctAnswer = solution.correctAnswers[i];
      const userAnswer = userAnswers[i];
      const isCorrect = userAnswer === correctAnswer;

      if (isCorrect) {
        correctCount++;
      }

      questionResults.push({
        questionIndex: i,
        userAnswer: userAnswer ?? -1,
        correctAnswer,
        isCorrect,
      });
    }

    // Calculate score proportionally
    const maxScore = exercise.max_points || 100;
    const score = Math.round((correctCount / totalQuestions) * maxScore);
    const passingScore = exercise.passing_score || 70;
    const isPassing = score >= passingScore;

    // Generate feedback
    let feedback = '';
    if (correctCount === totalQuestions) {
      feedback = 'Excelente! Respondiste todas las preguntas correctamente. Eres un experto en Marie Curie!';
    } else if (isPassing) {
      feedback = `Buen trabajo! Respondiste ${correctCount} de ${totalQuestions} preguntas correctamente.`;
    } else {
      feedback = `Sigue practicando. Respondiste ${correctCount} de ${totalQuestions} correctamente. Revisa los datos sobre Marie Curie.`;
    }

    this.logger.log(
      `Quiz TikTok graded: ${correctCount}/${totalQuestions} correct, score=${score}/${maxScore}, passing=${isPassing}`,
    );

    return {
      score,
      maxScore,
      isCorrect: isPassing,
      correctAnswers: correctCount,
      totalQuestions,
      feedback,
      details: {
        questionResults,
        percentageCorrect: Math.round((correctCount / totalQuestions) * 100),
      },
    };
  }

  /**
   * Generates feedback message based on score and passing threshold
   *
   * @param score - Achieved score
   * @param maxScore - Maximum possible score
   * @param hintUsed - Whether hints were used
   * @returns Feedback message
   */
  generateFeedback(score: number, maxScore: number, hintUsed: boolean = false): string {
    const isPerfect = score === maxScore && !hintUsed;

    if (isPerfect) {
      return 'Perfect score! Excellent work!';
    }

    const percentage = (score / maxScore) * 100;

    if (percentage >= 90) {
      return 'Outstanding performance! Almost perfect!';
    }
    if (percentage >= 70) {
      return 'Good job! Exercise completed successfully.';
    }
    if (percentage >= 60) {
      return 'Nice effort! You passed the exercise.';
    }
    return 'Keep practicing. Review the material and try again.';
  }
}
