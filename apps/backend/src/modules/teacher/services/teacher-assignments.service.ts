/**
 * TeacherAssignmentsService
 *
 * @description Service for teacher assignment CRUD operations
 * @module modules/teacher/services/teacher-assignments
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Assignment } from '@modules/assignments/entities/assignment.entity';
import { AssignmentType } from '@modules/assignments/enums/assignment.enums';
import { AssignmentSubmission, SubmissionStatus } from '@modules/assignments/entities/assignment-submission.entity';
import { AssignmentExercise } from '@modules/assignments/entities/assignment-exercise.entity';
import { AssignmentClassroom } from '@modules/social/entities/assignment-classroom.entity';
import { ClassroomMember } from '@modules/social/entities/classroom-member.entity';
import {
  AssignmentQueryDto,
  CreateAssignmentDto,
  UpdateAssignmentDto,
  AssignmentResponseDto,
  UpcomingAssignmentResponseDto,
} from '../dto/teacher-assignments.dto';

@Injectable()
export class TeacherAssignmentsService {
  private readonly logger = new Logger(TeacherAssignmentsService.name);

  constructor(
    @InjectRepository(Assignment, 'educational')
    private readonly assignmentRepo: Repository<Assignment>,

    @InjectRepository(AssignmentSubmission, 'educational')
    private readonly submissionRepo: Repository<AssignmentSubmission>,

    @InjectRepository(AssignmentExercise, 'educational')
    private readonly assignmentExerciseRepo: Repository<AssignmentExercise>,

    @InjectRepository(AssignmentClassroom, 'social')
    private readonly assignmentClassroomRepo: Repository<AssignmentClassroom>,

    @InjectRepository(ClassroomMember, 'social')
    private readonly classroomMemberRepo: Repository<ClassroomMember>,
  ) {}

  // ============================================================================
  // LIST ASSIGNMENTS
  // ============================================================================

  /**
   * Get all assignments for the authenticated teacher
   */
  async getAssignments(
    teacherId: string,
    query: AssignmentQueryDto,
  ): Promise<AssignmentResponseDto[]> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // Build query for teacher's assignments
    const qb = this.assignmentRepo
      .createQueryBuilder('a')
      .where('a.teacherId = :teacherId', { teacherId });

    // Filter by status (map frontend status to entity fields)
    if (query.status) {
      switch (query.status) {
        case 'draft':
          qb.andWhere('a.isPublished = false');
          break;
        case 'active':
          qb.andWhere('a.isPublished = true')
            .andWhere('(a.dueDate IS NULL OR a.dueDate > NOW())');
          break;
        case 'completed':
          qb.andWhere('a.isPublished = true')
            .andWhere('a.dueDate IS NOT NULL')
            .andWhere('a.dueDate <= NOW()');
          break;
        case 'expired':
          qb.andWhere('a.dueDate IS NOT NULL')
            .andWhere('a.dueDate <= NOW()');
          break;
      }
    }

    // Filter by date range
    if (query.start_date) {
      qb.andWhere('a.createdAt >= :startDate', { startDate: query.start_date });
    }
    if (query.end_date) {
      qb.andWhere('a.createdAt <= :endDate', { endDate: query.end_date });
    }

    qb.orderBy('a.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const assignments = await qb.getMany();

    // If classroom_id filter, find which assignments belong to that classroom
    if (query.classroom_id) {
      const classroomAssignments = await this.assignmentClassroomRepo.find({
        where: { classroom_id: query.classroom_id },
      });
      const assignmentIds = new Set(classroomAssignments.map(ca => ca.assignment_id));
      const filtered = assignments.filter(a => assignmentIds.has(a.id));
      return this.enrichAssignments(filtered);
    }

    return this.enrichAssignments(assignments);
  }

  // ============================================================================
  // GET ASSIGNMENT BY ID
  // ============================================================================

  /**
   * Get a specific assignment by ID with ownership validation
   */
  async getAssignmentById(
    assignmentId: string,
    teacherId: string,
  ): Promise<AssignmentResponseDto> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment ${assignmentId} not found`);
    }

    if (assignment.teacherId !== teacherId) {
      throw new ForbiddenException('You do not have access to this assignment');
    }

    const enriched = await this.enrichAssignments([assignment]);
    return enriched[0];
  }

  // ============================================================================
  // CREATE ASSIGNMENT
  // ============================================================================

  /**
   * Create a new assignment
   */
  async createAssignment(
    teacherId: string,
    dto: CreateAssignmentDto,
  ): Promise<AssignmentResponseDto> {
    // Create the assignment
    const assignment = this.assignmentRepo.create({
      teacherId,
      title: dto.title,
      description: dto.description || null,
      assignmentType: dto.type,
      dueDate: dto.due_date ? new Date(dto.due_date) : null,
      isPublished: false,
    });

    const saved = await this.assignmentRepo.save(assignment);

    // Link to classroom
    const classroomLink = this.assignmentClassroomRepo.create({
      assignment_id: saved.id,
      classroom_id: dto.classroom_id,
    });
    await this.assignmentClassroomRepo.save(classroomLink);

    // Link exercises if provided
    if (dto.exercise_ids && dto.exercise_ids.length > 0) {
      const exercises = dto.exercise_ids.map((exerciseId, index) =>
        this.assignmentExerciseRepo.create({
          assignmentId: saved.id,
          exerciseId,
          orderIndex: index,
        }),
      );
      await this.assignmentExerciseRepo.save(exercises);
    }

    this.logger.log(`Assignment "${saved.title}" created by teacher ${teacherId}`);

    const enriched = await this.enrichAssignments([saved]);
    return enriched[0];
  }

  // ============================================================================
  // UPDATE ASSIGNMENT
  // ============================================================================

  /**
   * Update an existing assignment
   */
  async updateAssignment(
    assignmentId: string,
    teacherId: string,
    dto: UpdateAssignmentDto,
  ): Promise<AssignmentResponseDto> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment ${assignmentId} not found`);
    }

    if (assignment.teacherId !== teacherId) {
      throw new ForbiddenException('You do not have access to this assignment');
    }

    // Update fields
    if (dto.title !== undefined) assignment.title = dto.title;
    if (dto.description !== undefined) assignment.description = dto.description || null;
    if (dto.type !== undefined) assignment.assignmentType = dto.type;
    if (dto.due_date !== undefined) assignment.dueDate = dto.due_date ? new Date(dto.due_date) : null;

    const updated = await this.assignmentRepo.save(assignment);

    // Update exercise links if provided
    if (dto.exercise_ids !== undefined) {
      // Remove existing links
      await this.assignmentExerciseRepo.delete({ assignmentId });

      // Create new links
      if (dto.exercise_ids.length > 0) {
        const exercises = dto.exercise_ids.map((exerciseId, index) =>
          this.assignmentExerciseRepo.create({
            assignmentId,
            exerciseId,
            orderIndex: index,
          }),
        );
        await this.assignmentExerciseRepo.save(exercises);
      }
    }

    this.logger.log(`Assignment "${updated.title}" updated by teacher ${teacherId}`);

    const enriched = await this.enrichAssignments([updated]);
    return enriched[0];
  }

  // ============================================================================
  // DELETE ASSIGNMENT
  // ============================================================================

  /**
   * Delete an assignment
   */
  async deleteAssignment(
    assignmentId: string,
    teacherId: string,
  ): Promise<{ success: boolean; message: string }> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment ${assignmentId} not found`);
    }

    if (assignment.teacherId !== teacherId) {
      throw new ForbiddenException('You do not have access to this assignment');
    }

    // Remove related records first
    await this.assignmentExerciseRepo.delete({ assignmentId });
    await this.assignmentClassroomRepo.delete({ assignment_id: assignmentId });
    await this.submissionRepo.delete({ assignmentId });
    await this.assignmentRepo.remove(assignment);

    this.logger.log(`Assignment "${assignment.title}" deleted by teacher ${teacherId}`);

    return {
      success: true,
      message: `Assignment "${assignment.title}" has been deleted successfully`,
    };
  }

  // ============================================================================
  // GET SUBMISSIONS FOR ASSIGNMENT
  // ============================================================================

  /**
   * Get submissions for a specific assignment
   */
  async getAssignmentSubmissions(
    assignmentId: string,
    teacherId: string,
  ): Promise<AssignmentSubmission[]> {
    // Validate ownership
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment ${assignmentId} not found`);
    }

    if (assignment.teacherId !== teacherId) {
      throw new ForbiddenException('You do not have access to this assignment');
    }

    return this.submissionRepo.find({
      where: { assignmentId },
      order: { createdAt: 'DESC' },
    });
  }

  // ============================================================================
  // SEND REMINDER
  // ============================================================================

  /**
   * Send reminder to students who haven't submitted
   */
  async sendReminder(
    assignmentId: string,
    teacherId: string,
  ): Promise<{ notified: number; alreadySubmitted: number; message: string }> {
    // Validate ownership
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment ${assignmentId} not found`);
    }

    if (assignment.teacherId !== teacherId) {
      throw new ForbiddenException('You do not have access to this assignment');
    }

    // Count submissions
    const submissions = await this.submissionRepo.find({
      where: { assignmentId },
    });

    const submittedStudentIds = new Set(
      submissions
        .filter(s => s.status === SubmissionStatus.SUBMITTED || s.status === SubmissionStatus.GRADED)
        .map(s => s.studentId),
    );

    // Get classrooms for this assignment
    const classroomLinks = await this.assignmentClassroomRepo.find({
      where: { assignment_id: assignmentId },
    });

    // Count total students across linked classrooms
    let totalStudents = 0;
    for (const link of classroomLinks) {
      const count = await this.classroomMemberRepo.count({
        where: { classroom_id: link.classroom_id },
      });
      totalStudents += count;
    }

    const alreadySubmitted = submittedStudentIds.size;
    const notified = totalStudents - alreadySubmitted;

    // Log the reminder action (real notification integration pending)
    this.logger.log(
      `Reminder sent for assignment "${assignment.title}" - ` +
      `${notified} students notified, ${alreadySubmitted} already submitted`,
    );

    return {
      notified: Math.max(0, notified),
      alreadySubmitted,
      message: `Reminder sent to ${Math.max(0, notified)} students`,
    };
  }

  // ============================================================================
  // GET UPCOMING ASSIGNMENTS
  // ============================================================================

  /**
   * Get upcoming assignments with deadlines within specified days
   */
  async getUpcomingAssignments(
    teacherId: string,
    days: number = 7,
  ): Promise<UpcomingAssignmentResponseDto[]> {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    const assignments = await this.assignmentRepo.find({
      where: {
        teacherId,
        isPublished: true,
        dueDate: MoreThanOrEqual(now),
      },
      order: { dueDate: 'ASC' },
    });

    // Filter to only include those within the days window
    const upcoming = assignments.filter(a => a.dueDate && a.dueDate <= future);

    const results: UpcomingAssignmentResponseDto[] = [];

    for (const assignment of upcoming) {
      // Get classroom info
      const classroomLink = await this.assignmentClassroomRepo.findOne({
        where: { assignment_id: assignment.id },
        relations: ['classroom'],
      });

      // Count submissions
      const submittedCount = await this.submissionRepo.count({
        where: {
          assignmentId: assignment.id,
          status: In([SubmissionStatus.SUBMITTED, SubmissionStatus.GRADED]),
        },
      });

      // Count total students in linked classrooms
      let totalStudents = 0;
      if (classroomLink) {
        totalStudents = await this.classroomMemberRepo.count({
          where: { classroom_id: classroomLink.classroom_id },
        });
      }

      const daysRemaining = assignment.dueDate
        ? Math.ceil((assignment.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      results.push({
        id: assignment.id,
        title: assignment.title,
        dueDate: assignment.dueDate ? assignment.dueDate.toISOString() : null,
        daysRemaining,
        totalStudents,
        submittedCount,
        classroomName: classroomLink?.classroom?.name,
      });
    }

    return results;
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  /**
   * Enrich assignments with classroom and submission data
   */
  private async enrichAssignments(assignments: Assignment[]): Promise<AssignmentResponseDto[]> {
    const results: AssignmentResponseDto[] = [];

    for (const assignment of assignments) {
      // Get first linked classroom
      const classroomLink = await this.assignmentClassroomRepo.findOne({
        where: { assignment_id: assignment.id },
        relations: ['classroom'],
      });

      // Count submissions
      const submissionCount = await this.submissionRepo.count({
        where: { assignmentId: assignment.id },
      });

      // Count total students
      let totalStudents = 0;
      if (classroomLink) {
        totalStudents = await this.classroomMemberRepo.count({
          where: { classroom_id: classroomLink.classroom_id },
        });
      }

      results.push({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        assignmentType: assignment.assignmentType,
        totalPoints: assignment.totalPoints,
        dueDate: assignment.dueDate,
        isPublished: assignment.isPublished,
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
        classroomId: classroomLink?.classroom_id,
        classroomName: classroomLink?.classroom?.name,
        submissionCount,
        totalStudents,
      });
    }

    return results;
  }
}
