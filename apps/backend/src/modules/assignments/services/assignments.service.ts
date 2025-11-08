/**
 * Assignments Service
 *
 * Service for managing teacher assignments (tasks, quizzes, exams, projects)
 */

import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment, AssignmentStatus } from '../entities/assignment.entity';
import { AssignmentClassroom } from '../entities/assignment-classroom.entity';
import { AssignmentSubmission } from '../entities/assignment-submission.entity';
import { CreateAssignmentDto } from '../dto/create-assignment.dto';
import { UpdateAssignmentDto } from '../dto/update-assignment.dto';
import { AssignToClassroomsDto } from '../dto/assign-to-classrooms.dto';
import { GradeSubmissionDto } from '../dto/grade-submission.dto';

@Injectable()
export class AssignmentsService {
  private readonly logger = new Logger(AssignmentsService.name);

  constructor(
    @InjectRepository(Assignment, 'content')
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(AssignmentClassroom, 'content')
    private readonly assignmentClassroomRepository: Repository<AssignmentClassroom>,
    @InjectRepository(AssignmentSubmission, 'content')
    private readonly submissionRepository: Repository<AssignmentSubmission>,
  ) {}

  /**
   * Create a new assignment
   */
  async create(createDto: CreateAssignmentDto, teacherId: string): Promise<Assignment> {
    // Sanitize HTML in description and instructions
    const sanitizedDescription = this.sanitizeHtml(createDto.description);
    const sanitizedInstructions = this.sanitizeHtml(createDto.instructions);

    const assignment = this.assignmentRepository.create({
      ...createDto,
      teacherId,
      description: sanitizedDescription,
      instructions: sanitizedInstructions,
      deadline: createDto.deadline ? new Date(createDto.deadline) : null,
      status: AssignmentStatus.DRAFT,
      isActive: true,
    });

    const saved = await this.assignmentRepository.save(assignment);

    this.logger.log(`Assignment created: ${saved.id} by teacher ${teacherId}`);

    return saved;
  }

  /**
   * Get all assignments for a teacher
   */
  async findAll(teacherId: string, filters?: {
    status?: AssignmentStatus;
    assignmentType?: string;
    search?: string;
  }): Promise<Assignment[]> {
    const queryBuilder = this.assignmentRepository
      .createQueryBuilder('assignment')
      .where('assignment.teacherId = :teacherId', { teacherId })
      .andWhere('assignment.isActive = :isActive', { isActive: true });

    if (filters?.status) {
      queryBuilder.andWhere('assignment.status = :status', { status: filters.status });
    }

    if (filters?.assignmentType) {
      queryBuilder.andWhere('assignment.assignmentType = :assignmentType', {
        assignmentType: filters.assignmentType,
      });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(LOWER(assignment.title) LIKE LOWER(:search) OR LOWER(assignment.description) LIKE LOWER(:search))',
        { search: `%${filters.search}%` },
      );
    }

    queryBuilder.orderBy('assignment.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  /**
   * Get single assignment by ID
   */
  async findOne(id: string, teacherId: string): Promise<Assignment> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id, teacherId, isActive: true },
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }

    return assignment;
  }

  /**
   * Update assignment
   * REQ-TCH-028: Only allow if no submissions exist
   */
  async update(
    id: string,
    updateDto: UpdateAssignmentDto,
    teacherId: string,
  ): Promise<Assignment> {
    const assignment = await this.findOne(id, teacherId);

    // Check if assignment has submissions
    const submissionsCount = await this.submissionRepository.count({
      where: { assignmentId: id },
    });

    if (submissionsCount > 0) {
      throw new UnprocessableEntityException(
        'Cannot update assignment with existing submissions',
      );
    }

    // Sanitize HTML fields if provided
    if (updateDto.description !== undefined) {
      updateDto.description = this.sanitizeHtml(updateDto.description);
    }
    if (updateDto.instructions !== undefined) {
      updateDto.instructions = this.sanitizeHtml(updateDto.instructions);
    }

    // Update fields
    Object.assign(assignment, updateDto);

    if (updateDto.deadline) {
      assignment.deadline = new Date(updateDto.deadline);
    }

    const updated = await this.assignmentRepository.save(assignment);

    this.logger.log(`Assignment updated: ${id} by teacher ${teacherId}`);

    return updated;
  }

  /**
   * Soft delete assignment
   * REQ-TCH-037: Soft delete (is_active = false)
   */
  async remove(id: string, teacherId: string): Promise<void> {
    const assignment = await this.findOne(id, teacherId);

    assignment.isActive = false;
    await this.assignmentRepository.save(assignment);

    this.logger.log(`Assignment soft deleted: ${id} by teacher ${teacherId}`);
  }

  /**
   * Assign assignment to classrooms
   * REQ-TCH-031: Allow assignment to multiple classrooms
   */
  async assignToClassrooms(
    assignmentId: string,
    dto: AssignToClassroomsDto,
    teacherId: string,
  ): Promise<{ success: number; failed: number }> {
    // Verify ownership
    await this.findOne(assignmentId, teacherId);

    let successCount = 0;
    let failedCount = 0;

    for (const classroom of dto.classrooms) {
      try {
        // Check if already assigned
        const existing = await this.assignmentClassroomRepository.findOne({
          where: {
            assignmentId,
            classroomId: classroom.classroomId,
          },
        });

        if (existing) {
          failedCount++;
          continue;
        }

        // Create assignment-classroom relationship
        const assignmentClassroom = this.assignmentClassroomRepository.create({
          assignmentId,
          classroomId: classroom.classroomId,
          deadlineOverride: classroom.deadlineOverride
            ? new Date(classroom.deadlineOverride)
            : null,
          studentsCount: 0, // TODO: Calculate from classroom
        });

        await this.assignmentClassroomRepository.save(assignmentClassroom);
        successCount++;
      } catch (error) {
        this.logger.error(
          `Failed to assign to classroom ${classroom.classroomId}:`,
          error,
        );
        failedCount++;
      }
    }

    this.logger.log(
      `Assignment ${assignmentId} assigned to classrooms: ${successCount} success, ${failedCount} failed`,
    );

    return { success: successCount, failed: failedCount };
  }

  /**
   * Get all submissions for an assignment
   */
  async getSubmissions(
    assignmentId: string,
    teacherId: string,
    filters?: {
      status?: string;
      classroomId?: string;
    },
  ): Promise<AssignmentSubmission[]> {
    // Verify ownership
    await this.findOne(assignmentId, teacherId);

    const queryBuilder = this.submissionRepository
      .createQueryBuilder('submission')
      .where('submission.assignmentId = :assignmentId', { assignmentId });

    if (filters?.status) {
      queryBuilder.andWhere('submission.status = :status', { status: filters.status });
    }

    if (filters?.classroomId) {
      queryBuilder.andWhere('submission.classroomId = :classroomId', {
        classroomId: filters.classroomId,
      });
    }

    queryBuilder.orderBy('submission.submittedAt', 'DESC');

    return queryBuilder.getMany();
  }

  /**
   * Grade a submission
   */
  async gradeSubmission(
    submissionId: string,
    dto: GradeSubmissionDto,
    teacherId: string,
  ): Promise<AssignmentSubmission> {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException(`Submission with ID ${submissionId} not found`);
    }

    // Verify teacher owns the assignment
    await this.findOne(submission.assignmentId, teacherId);

    // Validate score doesn't exceed max points
    if (dto.score > submission.maxPoints) {
      throw new UnprocessableEntityException(
        `Score cannot exceed max points (${submission.maxPoints})`,
      );
    }

    // Update submission
    submission.score = dto.score;
    submission.feedback = dto.feedback || null;
    submission.gradedBy = teacherId;
    submission.gradedAt = new Date();
    submission.status = 'graded' as any;

    const graded = await this.submissionRepository.save(submission);

    this.logger.log(`Submission graded: ${submissionId} by teacher ${teacherId}`);

    return graded;
  }

  /**
   * Sanitize HTML to prevent XSS
   * REQ-TCH-021: HTML sanitization
   */
  private sanitizeHtml(html?: string): string | null {
    if (!html) return null;

    // Basic sanitization - in production use DOMPurify
    // For now, strip script tags and dangerous attributes
    let sanitized = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '');

    return sanitized;
  }
}
