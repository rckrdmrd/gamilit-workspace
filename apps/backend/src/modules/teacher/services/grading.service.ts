/**
 * Grading Service
 *
 * Handles submission grading and feedback
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExerciseSubmission } from '@/modules/progress/entities/exercise-submission.entity';
import { SubmitFeedbackDto, GetSubmissionsQueryDto, BulkGradeDto } from '../dto';

@Injectable()
export class GradingService {
  constructor(
    @InjectRepository(ExerciseSubmission, 'progress')
    private readonly submissionRepository: Repository<ExerciseSubmission>,
  ) {}

  /**
   * Get submission by ID
   */
  async getSubmissionById(id: string) {
    const submission = await this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect(
        'auth_management.profiles',
        'profile',
        'profile.user_id = submission.user_id',
      )
      .leftJoinAndSelect(
        'educational_content.exercises',
        'exercise',
        'exercise.id = submission.exercise_id',
      )
      .where('submission.id = :id', { id })
      .getOne();

    if (!submission) {
      throw new NotFoundException(`Submission ${id} not found`);
    }

    return submission;
  }

  /**
   * Get submissions with filters
   */
  async getSubmissions(query: GetSubmissionsQueryDto) {
    const qb = this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect(
        'auth_management.profiles',
        'profile',
        'profile.user_id = submission.user_id',
      )
      .leftJoinAndSelect(
        'educational_content.exercises',
        'exercise',
        'exercise.id = submission.exercise_id',
      );

    // Status filter
    if (query.status) {
      qb.andWhere('submission.status = :status', { status: query.status });
    }

    // Student filter
    if (query.student_id) {
      qb.andWhere('profile.id = :studentId', { studentId: query.student_id });
    }

    // Assignment filter (via exercise -> assignment relationship)
    if (query.assignment_id) {
      qb.leftJoin(
        'educational_content.assignment_submissions',
        'assignment_submission',
        'assignment_submission.assignment_id = :assignmentId AND assignment_submission.student_id = profile.id',
        { assignmentId: query.assignment_id },
      );
      qb.andWhere('assignment_submission.id IS NOT NULL');
    }

    // Classroom filter (via assignment -> classroom relationship)
    if (query.classroom_id) {
      qb.leftJoin(
        'educational_content.assignments',
        'assignment',
        'assignment.classroom_id = :classroomId',
        { classroomId: query.classroom_id },
      );
      qb.leftJoin(
        'educational_content.assignment_submissions',
        'class_assignment_sub',
        'class_assignment_sub.assignment_id = assignment.id AND class_assignment_sub.student_id = profile.id',
      );
      qb.andWhere('class_assignment_sub.id IS NOT NULL');
    }

    // Module filter
    if (query.module_id) {
      qb.andWhere('exercise.module_id = :moduleId', { moduleId: query.module_id });
    }

    const sortField = query.sort_by === 'score' ? 'score' : query.sort_by === 'time' ? 'time_spent_seconds' : 'submitted_at';
    qb.orderBy(`submission.${sortField}`, 'DESC');

    const page = query.page || 1;
    const limit = query.limit || 20;
    qb.skip((page - 1) * limit).take(limit);

    const [submissions, total] = await qb.getManyAndCount();

    return { submissions, total, page, limit };
  }

  /**
   * Submit feedback for a submission
   */
  async submitFeedback(submissionId: string, feedbackDto: SubmitFeedbackDto) {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException(`Submission ${submissionId} not found`);
    }

    submission.feedback = feedbackDto.feedback;
    if (feedbackDto.adjusted_score !== undefined) {
      submission.score = Math.round((feedbackDto.adjusted_score / 100) * submission.max_score);
    }
    submission.status = 'graded';
    submission.graded_at = new Date();

    await this.submissionRepository.save(submission);

    return { success: true, submission };
  }

  /**
   * Bulk grade submissions
   */
  async bulkGrade(bulkDto: BulkGradeDto) {
    const submissions = await this.submissionRepository.findByIds(
      bulkDto.submission_ids,
    );

    for (const submission of submissions) {
      submission.feedback = bulkDto.feedback;
      if (bulkDto.adjusted_score !== undefined) {
        submission.score = Math.round((bulkDto.adjusted_score / 100) * submission.max_score);
      }
      submission.status = 'graded';
      submission.graded_at = new Date();
    }

    await this.submissionRepository.save(submissions);

    return { success: true, updated_count: submissions.length };
  }
}
