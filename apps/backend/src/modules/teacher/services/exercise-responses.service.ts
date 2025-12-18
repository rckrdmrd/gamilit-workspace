/**
 * Exercise Responses Service
 *
 * @description Handles student exercise attempts queries for teachers
 * @module teacher/services/exercise-responses
 */

import { Injectable, NotFoundException, ForbiddenException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ExerciseAttempt } from '@/modules/progress/entities/exercise-attempt.entity';
import { Profile } from '@/modules/auth/entities/profile.entity';
import {
  GetAttemptsQueryDto,
  AttemptResponseDto,
  AttemptDetailDto,
  AttemptsListResponseDto,
} from '../dto/exercise-responses.dto';

/**
 * Service for querying student exercise responses
 *
 * @description
 * Provides methods to retrieve student exercise attempts with proper RLS validation.
 * Teachers can only view attempts from students in their classrooms.
 *
 * RLS Implementation:
 * - Validates teacher access to student via classroom membership
 * - Supports both direct teacher_id and teacher_classrooms relationship
 * - Filters by classroom_id to ensure data isolation
 */
@Injectable()
export class ExerciseResponsesService {
  constructor(
    @InjectRepository(ExerciseAttempt, 'progress')
    private readonly attemptRepository: Repository<ExerciseAttempt>,
    @InjectRepository(Profile, 'auth')
    private readonly profileRepository: Repository<Profile>,
    @InjectDataSource('progress')
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Get teacher's profile from user_id
   * @param userId - User ID from auth.users
   * @returns Teacher's profile with id and tenant_id
   * @throws UnauthorizedException if profile not found
   */
  private async getTeacherProfile(userId: string): Promise<{ id: string; tenant_id: string }> {
    const profile = await this.profileRepository.findOne({
      where: { user_id: userId },
      select: ['id', 'tenant_id'],
    });

    if (!profile) {
      throw new UnauthorizedException('Teacher profile not found');
    }

    return { id: profile.id, tenant_id: profile.tenant_id };
  }

  /**
   * Get paginated list of exercise attempts with filters
   *
   * @param userId - Teacher's user ID (from auth.users)
   * @param query - Filter and pagination parameters
   * @returns Paginated list of attempts
   *
   * @example
   * const result = await service.getAttempts('user-uuid', {
   *   page: 1,
   *   limit: 20,
   *   classroom_id: 'classroom-uuid',
   *   is_correct: true,
   * });
   */
  async getAttempts(
    userId: string,
    query: GetAttemptsQueryDto,
  ): Promise<AttemptsListResponseDto> {
    try {
      // Get teacher's profile first
      const teacherProfile = await this.getTeacherProfile(userId);
      const teacherId = teacherProfile.id;
      const tenantId = teacherProfile.tenant_id;

      // Pagination
      const page = query.page || 1;
      const limit = query.limit || 20;
      const offset = (page - 1) * limit;

      // Sorting
      const sortField = query.sort_by === 'score'
        ? 'attempt.score'
        : query.sort_by === 'time'
          ? 'attempt.time_spent_seconds'
          : 'attempt.submitted_at';
      const sortOrder = query.sort_order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      // Build WHERE conditions dynamically
      const conditions: string[] = [
        '(c.teacher_id = $1 OR EXISTS (SELECT 1 FROM social_features.teacher_classrooms tc WHERE tc.teacher_id = $1 AND tc.classroom_id = c.id))',
        'profile.tenant_id = $2',
      ];
      const params: any[] = [teacherId, tenantId];
      let paramIndex = 3;

      if (query.student_id) {
        conditions.push(`profile.id = $${paramIndex}`);
        params.push(query.student_id);
        paramIndex++;
      }

      if (query.exercise_id) {
        conditions.push(`attempt.exercise_id = $${paramIndex}`);
        params.push(query.exercise_id);
        paramIndex++;
      }

      if (query.module_id) {
        conditions.push(`exercise.module_id = $${paramIndex}`);
        params.push(query.module_id);
        paramIndex++;
      }

      if (query.classroom_id) {
        conditions.push(`c.id = $${paramIndex}`);
        params.push(query.classroom_id);
        paramIndex++;
      }

      if (query.from_date) {
        conditions.push(`attempt.submitted_at >= $${paramIndex}`);
        params.push(query.from_date);
        paramIndex++;
      }

      if (query.to_date) {
        conditions.push(`attempt.submitted_at <= $${paramIndex}`);
        params.push(query.to_date);
        paramIndex++;
      }

      if (query.is_correct !== undefined) {
        conditions.push(`attempt.is_correct = $${paramIndex}`);
        params.push(query.is_correct);
        paramIndex++;
      }

      if (query.student_search) {
        const searchPattern = `%${query.student_search}%`;
        conditions.push(`(
          profile.first_name ILIKE $${paramIndex}
          OR profile.last_name ILIKE $${paramIndex}
          OR CONCAT(profile.first_name, ' ', profile.last_name) ILIKE $${paramIndex}
        )`);
        params.push(searchPattern);
        paramIndex++;
      }

      const whereClause = conditions.join(' AND ');

      // Main query using raw SQL for cross-schema JOINs
      const sql = `
        SELECT
          attempt.id AS attempt_id,
          attempt.user_id AS attempt_user_id,
          attempt.exercise_id AS attempt_exercise_id,
          attempt.attempt_number AS attempt_attempt_number,
          attempt.submitted_answers AS attempt_submitted_answers,
          attempt.is_correct AS attempt_is_correct,
          attempt.score AS attempt_score,
          attempt.time_spent_seconds AS attempt_time_spent_seconds,
          attempt.hints_used AS attempt_hints_used,
          attempt.comodines_used AS attempt_comodines_used,
          attempt.xp_earned AS attempt_xp_earned,
          attempt.ml_coins_earned AS attempt_ml_coins_earned,
          attempt.submitted_at AS attempt_submitted_at,
          profile.id AS profile_id,
          profile.first_name AS profile_first_name,
          profile.last_name AS profile_last_name,
          exercise.id AS exercise_id,
          exercise.title AS exercise_title,
          module.id AS module_id,
          module.title AS module_name
        FROM progress_tracking.exercise_attempts attempt
        LEFT JOIN auth_management.profiles profile ON profile.user_id = attempt.user_id
        LEFT JOIN educational_content.exercises exercise ON exercise.id = attempt.exercise_id
        LEFT JOIN educational_content.modules module ON module.id = exercise.module_id
        LEFT JOIN social_features.classroom_members cm ON cm.student_id = profile.id
        LEFT JOIN social_features.classrooms c ON c.id = cm.classroom_id
        WHERE ${whereClause}
        ORDER BY ${sortField} ${sortOrder}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      params.push(limit, offset);

      // Execute main query
      const rawResults = await this.dataSource.query(sql, params);

      // Count query (separate for efficiency)
      const countSql = `
        SELECT COUNT(DISTINCT attempt.id) as total
        FROM progress_tracking.exercise_attempts attempt
        LEFT JOIN auth_management.profiles profile ON profile.user_id = attempt.user_id
        LEFT JOIN social_features.classroom_members cm ON cm.student_id = profile.id
        LEFT JOIN social_features.classrooms c ON c.id = cm.classroom_id
        LEFT JOIN educational_content.exercises exercise ON exercise.id = attempt.exercise_id
        WHERE ${whereClause}
      `;

      // Remove LIMIT/OFFSET params for count query
      const countParams = params.slice(0, -2);
      const countResult = await this.dataSource.query(countSql, countParams);
      const total = parseInt(countResult[0]?.total || '0', 10);

      // Transform raw results to DTOs
      const data: AttemptResponseDto[] = rawResults.map((row: any) => ({
        id: row.attempt_id,
        student_id: row.attempt_user_id,
        student_name: `${row.profile_first_name || ''} ${row.profile_last_name || ''}`.trim() || 'Unknown',
        exercise_id: row.attempt_exercise_id,
        exercise_title: row.exercise_title || 'Unknown Exercise',
        module_name: row.module_name || 'Unknown Module',
        attempt_number: row.attempt_attempt_number,
        submitted_answers: row.attempt_submitted_answers,
        is_correct: row.attempt_is_correct ?? false,
        score: row.attempt_score ?? 0,
        time_spent_seconds: row.attempt_time_spent_seconds ?? 0,
        hints_used: row.attempt_hints_used,
        comodines_used: row.attempt_comodines_used,
        xp_earned: row.attempt_xp_earned,
        ml_coins_earned: row.attempt_ml_coins_earned,
        submitted_at: row.attempt_submitted_at ? new Date(row.attempt_submitted_at).toISOString() : new Date().toISOString(),
      }));

      return {
        data,
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      console.error('ExerciseResponsesService.getAttempts ERROR:', error);
      throw new InternalServerErrorException(
        `getAttempts failed: ${error?.message || String(error)}`,
      );
    }
  }

  /**
   * Get all attempts for a specific student
   *
   * @param userId - Teacher's user ID (from auth.users)
   * @param studentId - Student's profile ID
   * @returns List of student's attempts
   *
   * @throws ForbiddenException if teacher doesn't have access to the student
   */
  async getAttemptsByStudent(
    userId: string,
    studentId: string,
  ): Promise<AttemptResponseDto[]> {
    // Verify teacher has access to this student
    await this.verifyTeacherAccess(userId, studentId);

    const query: GetAttemptsQueryDto = {
      student_id: studentId,
      page: 1,
      limit: 1000, // Large limit for student-specific view
    };

    const result = await this.getAttempts(userId, query);
    return result.data;
  }

  /**
   * Get all responses for a specific exercise
   *
   * @param userId - Teacher's user ID (from auth.users)
   * @param exerciseId - Exercise ID
   * @returns Paginated list of attempts for the exercise
   */
  async getExerciseResponses(
    userId: string,
    exerciseId: string,
  ): Promise<AttemptsListResponseDto> {
    const query: GetAttemptsQueryDto = {
      exercise_id: exerciseId,
      page: 1,
      limit: 100,
    };

    return this.getAttempts(userId, query);
  }

  /**
   * Get detailed information for a specific attempt
   *
   * @param userId - Teacher's user ID (from auth.users)
   * @param attemptId - Attempt ID
   * @returns Detailed attempt information including correct answers
   *
   * @throws NotFoundException if attempt not found
   * @throws ForbiddenException if teacher doesn't have access
   */
  async getAttemptDetail(
    userId: string,
    attemptId: string,
  ): Promise<AttemptDetailDto> {
    // Get teacher's profile first
    const teacherProfile = await this.getTeacherProfile(userId);
    const teacherId = teacherProfile.id;
    const tenantId = teacherProfile.tenant_id;

    // Raw SQL query for cross-schema JOINs
    const sql = `
      SELECT
        attempt.id AS attempt_id,
        attempt.user_id AS attempt_user_id,
        attempt.exercise_id AS attempt_exercise_id,
        attempt.attempt_number AS attempt_attempt_number,
        attempt.submitted_answers AS attempt_submitted_answers,
        attempt.is_correct AS attempt_is_correct,
        attempt.score AS attempt_score,
        attempt.time_spent_seconds AS attempt_time_spent_seconds,
        attempt.hints_used AS attempt_hints_used,
        attempt.comodines_used AS attempt_comodines_used,
        attempt.xp_earned AS attempt_xp_earned,
        attempt.ml_coins_earned AS attempt_ml_coins_earned,
        attempt.submitted_at AS attempt_submitted_at,
        profile.id AS profile_id,
        profile.first_name AS profile_first_name,
        profile.last_name AS profile_last_name,
        exercise.id AS exercise_id,
        exercise.title AS exercise_title,
        exercise.exercise_type AS exercise_type,
        exercise.content AS exercise_content,
        exercise.max_points AS exercise_max_points,
        module.id AS module_id,
        module.title AS module_name
      FROM progress_tracking.exercise_attempts attempt
      LEFT JOIN auth_management.profiles profile ON profile.user_id = attempt.user_id
      LEFT JOIN educational_content.exercises exercise ON exercise.id = attempt.exercise_id
      LEFT JOIN educational_content.modules module ON module.id = exercise.module_id
      LEFT JOIN social_features.classroom_members cm ON cm.student_id = profile.id
      LEFT JOIN social_features.classrooms c ON c.id = cm.classroom_id
      WHERE attempt.id = $1
        AND profile.tenant_id = $2
        AND (c.teacher_id = $3 OR EXISTS (SELECT 1 FROM social_features.teacher_classrooms tc WHERE tc.teacher_id = $3 AND tc.classroom_id = c.id))
      LIMIT 1
    `;

    const results = await this.dataSource.query(sql, [attemptId, tenantId, teacherId]);
    const row = results[0];

    if (!row) {
      throw new NotFoundException(`Attempt ${attemptId} not found or access denied`);
    }

    // Parse exercise content if it's a string
    let exerciseContent: any = {};
    if (row.exercise_content) {
      try {
        exerciseContent = typeof row.exercise_content === 'string'
          ? JSON.parse(row.exercise_content)
          : row.exercise_content;
      } catch {
        exerciseContent = {};
      }
    }

    // Extract correct answers based on exercise type
    // Different exercise types store correct answers in different fields
    const correctAnswer = this.extractCorrectAnswers(exerciseContent, row.exercise_type);

    return {
      id: row.attempt_id,
      student_id: row.attempt_user_id,
      student_name: `${row.profile_first_name || ''} ${row.profile_last_name || ''}`.trim() || 'Unknown',
      exercise_id: row.attempt_exercise_id,
      exercise_title: row.exercise_title || 'Unknown Exercise',
      module_name: row.module_name || 'Unknown Module',
      attempt_number: row.attempt_attempt_number,
      submitted_answers: row.attempt_submitted_answers,
      is_correct: row.attempt_is_correct ?? false,
      score: row.attempt_score ?? 0,
      time_spent_seconds: row.attempt_time_spent_seconds ?? 0,
      hints_used: row.attempt_hints_used,
      comodines_used: row.attempt_comodines_used,
      xp_earned: row.attempt_xp_earned,
      ml_coins_earned: row.attempt_ml_coins_earned,
      submitted_at: row.attempt_submitted_at ? new Date(row.attempt_submitted_at).toISOString() : new Date().toISOString(),
      // Additional detail fields
      correct_answer: correctAnswer,
      exercise_type: row.exercise_type || 'unknown',
      max_score: row.exercise_max_points || 100,
    };
  }

  /**
   * Extract correct answers from exercise content based on exercise type
   * Different exercise types store correct answers in different fields
   */
  private extractCorrectAnswers(content: any, exerciseType: string): Record<string, unknown> {
    if (!content) return {};

    // Try common correct answer fields first
    if (content.correct_answers) {
      return { answers: content.correct_answers };
    }

    // Handle specific exercise types
    switch (exerciseType) {
      case 'verdadero_falso':
        // Extract correct answer from statements
        // Return with 'statements' key to match frontend format
        // DB stores: stmt.answer (boolean), not correctAnswer or isTrue
        if (content.statements && Array.isArray(content.statements)) {
          const statements: Record<string, boolean> = {};
          content.statements.forEach((stmt: any, idx: number) => {
            // Use stmt.id if available, otherwise use index+1
            const key = stmt.id ? String(stmt.id) : String(idx + 1);
            // Priority: answer (DB field) > correctAnswer > isTrue > false
            statements[key] = stmt.answer ?? stmt.correctAnswer ?? stmt.isTrue ?? false;
          });
          return { statements };
        }
        break;

      case 'completar_espacios':
        // Extract correctAnswer from blanks
        if (content.blanks && Array.isArray(content.blanks)) {
          const blanks: Record<string, string> = {};
          content.blanks.forEach((blank: any, idx: number) => {
            blanks[String(idx + 1)] = blank.correctAnswer || blank.answer || '';
          });
          return { blanks };
        }
        break;

      case 'crucigrama':
        // Return words/answers for crossword
        if (content.words) {
          return { words: content.words };
        }
        if (content.across_clues || content.down_clues) {
          const words: Record<string, string> = {};
          (content.across_clues || []).forEach((clue: any) => {
            if (clue.answer) words[`H${clue.number}`] = clue.answer;
          });
          (content.down_clues || []).forEach((clue: any) => {
            if (clue.answer) words[`V${clue.number}`] = clue.answer;
          });
          return { words };
        }
        break;

      case 'sopa_letras':
        // Return words to find
        if (content.words) {
          return { foundWords: content.words };
        }
        break;

      case 'lectura_inferencial':
      case 'prediccion_narrativa':
      case 'puzzle_contexto':
      case 'detective_textual':
      case 'rueda_inferencias':
      case 'causa_efecto':
        // Multiple choice - extract from questions
        if (content.questions && Array.isArray(content.questions)) {
          const answers: Record<string, string | number> = {};
          content.questions.forEach((q: any, idx: number) => {
            answers[`question_${idx + 1}`] = q.correctAnswer ?? q.correct_answer ?? '';
          });
          return answers;
        }
        break;

      case 'mapa_conceptual':
        // Return expected connections
        if (content.connections || content.expectedConnections) {
          return { connections: content.connections || content.expectedConnections };
        }
        break;

      case 'timeline':
        // Return correct order
        if (content.events || content.correctOrder) {
          return { events: content.correctOrder || content.events };
        }
        break;

      default:
        // Return full content for creative/multimedia exercises (modules 4, 5)
        // These don't have "correct" answers, just submitted content
        return content;
    }

    // Fallback: return the full content
    return content;
  }

  /**
   * Verify teacher has access to a specific student
   *
   * @param userId - Teacher's user ID (from auth.users)
   * @param studentId - Student's profile ID
   * @throws ForbiddenException if teacher doesn't have access
   */
  private async verifyTeacherAccess(
    userId: string,
    studentId: string,
  ): Promise<void> {
    // Get teacher's profile first
    const teacherProfile = await this.getTeacherProfile(userId);
    const teacherId = teacherProfile.id;
    const tenantId = teacherProfile.tenant_id;

    // Raw SQL for cross-schema verification
    const sql = `
      SELECT 1
      FROM auth_management.profiles profile
      LEFT JOIN social_features.classroom_members cm ON cm.student_id = profile.id
      LEFT JOIN social_features.classrooms c ON c.id = cm.classroom_id
      WHERE profile.id = $1
        AND profile.tenant_id = $2
        AND (c.teacher_id = $3 OR EXISTS (SELECT 1 FROM social_features.teacher_classrooms tc WHERE tc.teacher_id = $3 AND tc.classroom_id = c.id))
      LIMIT 1
    `;

    const results = await this.dataSource.query(sql, [studentId, tenantId, teacherId]);

    if (results.length === 0) {
      throw new ForbiddenException(
        `Teacher does not have access to student ${studentId}`,
      );
    }
  }
}
