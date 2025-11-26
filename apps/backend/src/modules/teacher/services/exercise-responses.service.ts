/**
 * Exercise Responses Service
 *
 * @description Handles student exercise attempts queries for teachers
 * @module teacher/services/exercise-responses
 */

import { Injectable, NotFoundException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    // Get teacher's profile first
    const teacherProfile = await this.getTeacherProfile(userId);
    const teacherId = teacherProfile.id;
    const tenantId = teacherProfile.tenant_id;

    const qb = this.attemptRepository
      .createQueryBuilder('attempt')
      .leftJoin('"auth_management"."profiles"', 'profile', 'profile.user_id = attempt.user_id')
      .leftJoin('"educational_content"."exercises"', 'exercise', 'exercise.id = attempt.exercise_id')
      .leftJoin('"educational_content"."modules"', 'module', 'module.id = exercise.module_id')
      .leftJoin(
        '"social_features"."classroom_members"',
        'cm',
        'cm.student_id = profile.id',
      )
      .leftJoin('"social_features"."classrooms"', 'c', 'c.id = cm.classroom_id')
      .where(
        '(c.teacher_id = :teacherId OR EXISTS (SELECT 1 FROM "social_features"."teacher_classrooms" tc WHERE tc.teacher_id = :teacherId AND tc.classroom_id = c.id))',
        { teacherId },
      )
      .andWhere('profile.tenant_id = :tenantId', { tenantId });

    // Filters
    if (query.student_id) {
      qb.andWhere('profile.id = :studentId', { studentId: query.student_id });
    }

    if (query.exercise_id) {
      qb.andWhere('attempt.exercise_id = :exerciseId', { exerciseId: query.exercise_id });
    }

    if (query.module_id) {
      qb.andWhere('exercise.module_id = :moduleId', { moduleId: query.module_id });
    }

    if (query.classroom_id) {
      qb.andWhere('c.id = :classroomId', { classroomId: query.classroom_id });
    }

    if (query.from_date) {
      qb.andWhere('attempt.submitted_at >= :fromDate', { fromDate: query.from_date });
    }

    if (query.to_date) {
      qb.andWhere('attempt.submitted_at <= :toDate', { toDate: query.to_date });
    }

    if (query.is_correct !== undefined) {
      qb.andWhere('attempt.is_correct = :isCorrect', { isCorrect: query.is_correct });
    }

    // Sorting
    const sortField = query.sort_by === 'score'
      ? 'attempt.score'
      : query.sort_by === 'time'
      ? 'attempt.time_spent_seconds'
      : 'attempt.submitted_at';

    const sortOrder = query.sort_order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    qb.orderBy(sortField, sortOrder);

    // Pagination
    const page = query.page || 1;
    const limit = query.limit || 20;
    qb.skip((page - 1) * limit).take(limit);

    // Select specific fields
    qb.select([
      'attempt.id',
      'attempt.user_id',
      'attempt.exercise_id',
      'attempt.attempt_number',
      'attempt.submitted_answers',
      'attempt.is_correct',
      'attempt.score',
      'attempt.time_spent_seconds',
      'attempt.hints_used',
      'attempt.comodines_used',
      'attempt.xp_earned',
      'attempt.ml_coins_earned',
      'attempt.submitted_at',
      'profile.id',
      'profile.first_name',
      'profile.last_name',
      'exercise.id',
      'exercise.title',
      'module.id',
      'module.name',
    ]);

    const [attempts, total] = await qb.getManyAndCount();

    // Transform to DTOs
    const data: AttemptResponseDto[] = attempts.map((attempt: any) => ({
      id: attempt.id,
      student_id: attempt.user_id,
      student_name: `${attempt.profile?.first_name || ''} ${attempt.profile?.last_name || ''}`.trim() || 'Unknown',
      exercise_id: attempt.exercise_id,
      exercise_title: attempt.exercise?.title || 'Unknown Exercise',
      module_name: attempt.exercise?.module?.name || 'Unknown Module',
      attempt_number: attempt.attempt_number,
      submitted_answers: attempt.submitted_answers,
      is_correct: attempt.is_correct ?? false,
      score: attempt.score ?? 0,
      time_spent_seconds: attempt.time_spent_seconds ?? 0,
      hints_used: attempt.hints_used,
      comodines_used: attempt.comodines_used,
      xp_earned: attempt.xp_earned,
      ml_coins_earned: attempt.ml_coins_earned,
      submitted_at: attempt.submitted_at.toISOString(),
    }));

    return {
      data,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
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

    const qb = this.attemptRepository
      .createQueryBuilder('attempt')
      .leftJoinAndSelect('"auth_management"."profiles"', 'profile', 'profile.user_id = attempt.user_id')
      .leftJoinAndSelect('"educational_content"."exercises"', 'exercise', 'exercise.id = attempt.exercise_id')
      .leftJoinAndSelect('"educational_content"."modules"', 'module', 'module.id = exercise.module_id')
      .leftJoin(
        '"social_features"."classroom_members"',
        'cm',
        'cm.student_id = profile.id',
      )
      .leftJoin('"social_features"."classrooms"', 'c', 'c.id = cm.classroom_id')
      .where('attempt.id = :attemptId', { attemptId })
      .andWhere('profile.tenant_id = :tenantId', { tenantId })
      .andWhere(
        '(c.teacher_id = :teacherId OR EXISTS (SELECT 1 FROM "social_features"."teacher_classrooms" tc WHERE tc.teacher_id = :teacherId AND tc.classroom_id = c.id))',
        { teacherId },
      );

    const attempt = await qb.getOne();

    if (!attempt) {
      throw new NotFoundException(`Attempt ${attemptId} not found or access denied`);
    }

    // Cast to any to access joined data
    const attemptData = attempt as any;

    return {
      id: attempt.id,
      student_id: attempt.user_id,
      student_name: `${attemptData.profile?.first_name || ''} ${attemptData.profile?.last_name || ''}`.trim() || 'Unknown',
      exercise_id: attempt.exercise_id,
      exercise_title: attemptData.exercise?.title || 'Unknown Exercise',
      module_name: attemptData.exercise?.module?.name || 'Unknown Module',
      attempt_number: attempt.attempt_number,
      submitted_answers: attempt.submitted_answers,
      is_correct: attempt.is_correct ?? false,
      score: attempt.score ?? 0,
      time_spent_seconds: attempt.time_spent_seconds ?? 0,
      hints_used: attempt.hints_used,
      comodines_used: attempt.comodines_used,
      xp_earned: attempt.xp_earned,
      ml_coins_earned: attempt.ml_coins_earned,
      submitted_at: attempt.submitted_at.toISOString(),
      // Additional detail fields
      correct_answer: attemptData.exercise?.correct_answer || {},
      exercise_type: attemptData.exercise?.exercise_type || 'unknown',
      max_score: attemptData.exercise?.max_score || 100,
    };
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

    const qb = this.attemptRepository
      .createQueryBuilder('attempt')
      .leftJoin('"auth_management"."profiles"', 'profile', 'profile.user_id = attempt.user_id')
      .leftJoin(
        '"social_features"."classroom_members"',
        'cm',
        'cm.student_id = profile.id',
      )
      .leftJoin('"social_features"."classrooms"', 'c', 'c.id = cm.classroom_id')
      .where('profile.id = :studentId', { studentId })
      .andWhere('profile.tenant_id = :tenantId', { tenantId })
      .andWhere(
        '(c.teacher_id = :teacherId OR EXISTS (SELECT 1 FROM "social_features"."teacher_classrooms" tc WHERE tc.teacher_id = :teacherId AND tc.classroom_id = c.id))',
        { teacherId },
      )
      .limit(1);

    const hasAccess = await qb.getCount();

    if (hasAccess === 0) {
      throw new ForbiddenException(
        `Teacher does not have access to student ${studentId}`,
      );
    }
  }
}
