/**
 * Assignments Service
 *
 * Service for managing teacher assignments (tasks, quizzes, exams, projects)
 */

import {
  Injectable,
  Logger,
  NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from '../entities/assignment.entity';
import { AssignmentClassroom } from '@/modules/social/entities/assignment-classroom.entity';
import { AssignmentExercise } from '../entities/assignment-exercise.entity';
import { AssignmentStudent } from '../entities/assignment-student.entity';
import { AssignmentSubmission } from '../entities/assignment-submission.entity';
import { CreateAssignmentDto } from '../dto/create-assignment.dto';
import { UpdateAssignmentDto } from '../dto/update-assignment.dto';
import { AssignToClassroomsDto } from '../dto/assign-to-classrooms.dto';
import { AssignmentGradeDto } from '../dto/grade-submission.dto';
// TASK-2026-01-19-008: NotificationService for assignment notifications
import { NotificationService } from '@/modules/notifications/services/notification.service';
import { NotificationTypeEnum } from '@/shared/constants/enums.constants';

@Injectable()
export class AssignmentsService {
  private readonly logger = new Logger(AssignmentsService.name);

  constructor(
    // Datasource 'educational' para entidades de educational_content schema
    @InjectRepository(Assignment, 'educational')
    private readonly assignmentRepository: Repository<Assignment>,
    // Datasource 'social' para AssignmentClassroom (social_features schema)
    @InjectRepository(AssignmentClassroom, 'social')
    private readonly assignmentClassroomRepository: Repository<AssignmentClassroom>,
    @InjectRepository(AssignmentExercise, 'educational')
    private readonly assignmentExerciseRepository: Repository<AssignmentExercise>,
    @InjectRepository(AssignmentStudent, 'educational')
    private readonly assignmentStudentRepository: Repository<AssignmentStudent>,
    @InjectRepository(AssignmentSubmission, 'educational')
    private readonly submissionRepository: Repository<AssignmentSubmission>,
    // TASK-2026-01-19-008: NotificationService for assignment notifications
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Create a new assignment
   */
  async create(createDto: CreateAssignmentDto, teacherId: string): Promise<Assignment> {
    // Sanitize HTML in description
    const sanitizedDescription = this.sanitizeHtml(createDto.description);

    const assignment = this.assignmentRepository.create({
      ...createDto,
      teacherId,
      description: sanitizedDescription,
      dueDate: createDto.deadline ? new Date(createDto.deadline) : null,
      isPublished: false, // New assignments start as drafts
    });

    const saved = await this.assignmentRepository.save(assignment);

    this.logger.log(`Assignment created: ${saved.id} by teacher ${teacherId}`);

    return saved;
  }

  /**
   * Get all assignments for a teacher
   */
  async findAll(teacherId: string, filters?: {
    isPublished?: boolean;
    assignmentType?: string;
    search?: string;
  }): Promise<Assignment[]> {
    const queryBuilder = this.assignmentRepository
      .createQueryBuilder('assignment')
      .where('assignment.teacherId = :teacherId', { teacherId });

    if (filters?.isPublished !== undefined) {
      queryBuilder.andWhere('assignment.isPublished = :isPublished', { isPublished: filters.isPublished });
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
      where: { id, teacherId, isPublished: true },
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
      updateDto.description = this.sanitizeHtml(updateDto.description) || undefined;
    }
    // TODO: Handle instructions field if/when added to entity
    // if (updateDto.instructions !== undefined) {
    //   updateDto.instructions = this.sanitizeHtml(updateDto.instructions);
    // }

    // Update fields
    Object.assign(assignment, updateDto);

    if (updateDto.deadline) {
      assignment.dueDate = new Date(updateDto.deadline);
    }

    const updated = await this.assignmentRepository.save(assignment);

    this.logger.log(`Assignment updated: ${id} by teacher ${teacherId}`);

    return updated;
  }

  /**
   * Patch assignment (partial update)
   * Allows updates even with submissions, but blocks critical fields
   * REQ-TCH-091: Partial updates permitted
   */
  async patchAssignment(
    id: string,
    patchDto: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    teacherId: string,
  ): Promise<Assignment> {
    // 1. Verify ownership
    const assignment = await this.assignmentRepository.findOne({
      where: { id, teacherId },
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found or access denied`);
    }

    // 2. Check for submissions
    const submissionsCount = await this.submissionRepository.count({
      where: { assignmentId: id },
    });

    // 3. Block critical field changes if submissions exist
    if (submissionsCount > 0) {
      const blockedFields = [];
      if (patchDto.assignmentType !== undefined) blockedFields.push('assignmentType');
      if (patchDto.totalPoints !== undefined) blockedFields.push('totalPoints');
      if (patchDto.dueDate !== undefined) blockedFields.push('dueDate');

      if (blockedFields.length > 0) {
        throw new UnprocessableEntityException(
          `Cannot change ${blockedFields.join(', ')} when submissions exist (${submissionsCount} submissions)`,
        );
      }
    }

    // 4. Sanitize HTML fields
    if (patchDto.description !== undefined) {
      patchDto.description = this.sanitizeHtml(patchDto.description) || undefined;
    }
    if (patchDto.instructions !== undefined) {
      patchDto.instructions = this.sanitizeHtml(patchDto.instructions) || undefined;
    }

    // 5. Apply partial update
    Object.keys(patchDto).forEach((key) => {
      if (patchDto[key] !== undefined) {
        if (key === 'dueDate') {
          assignment.dueDate = new Date(patchDto.dueDate);
        } else {
          (assignment as any)[key] = patchDto[key]; // eslint-disable-line @typescript-eslint/no-explicit-any
        }
      }
    });

    const updated = await this.assignmentRepository.save(assignment);

    this.logger.log(`Assignment patched: ${id} by teacher ${teacherId} (${submissionsCount} submissions)`);

    return updated;
  }

  /**
   * Distribute assignment to classrooms and/or students
   * Enhanced version of assignToClassrooms with more options
   * REQ-TCH-091: Assignment distribution
   */
  async distributeAssignment(
    assignmentId: string,
    dto: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    teacherId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    // 1. Verify ownership
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId, teacherId },
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${assignmentId} not found or access denied`);
    }

    const result: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
      classroomsSuccess: 0,
      classroomsFailed: 0,
      studentsSuccess: 0,
      studentsFailed: 0,
      published: assignment.isPublished,
      notificationsSent: false,
    };

    // 2. Distribute to classrooms
    for (const classroom of dto.classrooms) {
      try {
        // Validate deadline override is in future
        if (classroom.deadlineOverride) {
          const overrideDate = new Date(classroom.deadlineOverride);
          if (overrideDate < new Date()) {
            this.logger.warn(`Deadline override for classroom ${classroom.classroomId} is in the past`);
            result.classroomsFailed++;
            continue;
          }
        }

        // Check if already assigned
        const existing = await this.assignmentClassroomRepository.findOne({
          where: {
            assignment_id: assignmentId,
            classroom_id: classroom.classroomId,
          },
        });

        if (existing) {
          this.logger.warn(`Assignment already distributed to classroom ${classroom.classroomId}`);
          result.classroomsFailed++;
          continue;
        }

        // Create distribution
        const assignmentClassroom = this.assignmentClassroomRepository.create({
          assignment_id: assignmentId,
          classroom_id: classroom.classroomId,
        });

        await this.assignmentClassroomRepository.save(assignmentClassroom);
        result.classroomsSuccess++;
      } catch (error) {
        this.logger.error(`Failed to distribute to classroom ${classroom.classroomId}:`, error);
        result.classroomsFailed++;
      }
    }

    // 3. Distribute to individual students (if provided)
    if (dto.studentIds && dto.studentIds.length > 0) {
      for (const studentId of dto.studentIds) {
        try {
          const existing = await this.assignmentStudentRepository.findOne({
            where: { assignmentId, studentId },
          });

          if (existing) {
            result.studentsFailed++;
            continue;
          }

          const assignmentStudent = this.assignmentStudentRepository.create({
            assignmentId,
            studentId,
          });

          await this.assignmentStudentRepository.save(assignmentStudent);
          result.studentsSuccess++;
        } catch (error) {
          this.logger.error(`Failed to distribute to student ${studentId}:`, error);
          result.studentsFailed++;
        }
      }
    }

    // 4. Publish if requested
    if (dto.publishOnDistribute && !assignment.isPublished) {
      assignment.isPublished = true;
      await this.assignmentRepository.save(assignment);
      result.published = true;
      result.publishedAt = new Date().toISOString();
    }

    // 5. Send notifications - TASK-2026-01-19-008: Implemented
    if (dto.sendNotifications && result.studentsSuccess > 0) {
      try {
        // Get assignment details for notification
        const assignment = await this.assignmentRepository.findOne({
          where: { id: assignmentId },
        });

        if (assignment) {
          // Get assigned students
          const assignedStudents = await this.assignmentStudentRepository.find({
            where: { assignmentId },
          });

          // Send notification to each student
          await Promise.all(assignedStudents.map(student =>
            this.notificationService.create({
              userId: student.studentId,
              type: NotificationTypeEnum.SYSTEM_ANNOUNCEMENT,
              title: `📚 Nueva tarea asignada: ${assignment.title}`,
              message: `Se te ha asignado una nueva tarea: "${assignment.title}"${assignment.dueDate ? `. Fecha límite: ${new Date(assignment.dueDate).toLocaleDateString('es-MX')}` : ''}`,
              data: {
                assignmentId,
                assignmentTitle: assignment.title,
                dueDate: assignment.dueDate?.toISOString() || null,
                action: {
                  type: 'navigate',
                  url: `/student/assignments/${assignmentId}`,
                },
              },
              priority: 'normal',
            }),
          ));

          result.notificationsSent = true;
          this.logger.log(`✅ Notifications sent to ${assignedStudents.length} students for assignment ${assignmentId}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Failed to send assignment notifications: ${errorMessage}`);
        // Don't fail the distribution if notifications fail
        result.notificationsSent = false;
      }
    }

    this.logger.log(
      `Assignment ${assignmentId} distributed: ${result.classroomsSuccess} classrooms, ${result.studentsSuccess} students`,
    );

    return result;
  }

  /**
   * Duplicate assignment with optional modifications
   * Creates a new assignment with same properties but new ID
   * REQ-TCH-091: Assignment duplication
   */
  async duplicateAssignment(
    originalId: string,
    dto: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    teacherId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    // 1. Get original assignment and verify ownership
    const original = await this.assignmentRepository.findOne({
      where: { id: originalId, teacherId },
    });

    if (!original) {
      throw new NotFoundException(`Assignment with ID ${originalId} not found or access denied`);
    }

    // 2. Create duplicate (omit id, timestamps)
    const newTitle = dto.newTitle || `Copy of ${original.title}`;
    const newDueDate = dto.newDueDate ? new Date(dto.newDueDate) : original.dueDate;

    const duplicate = this.assignmentRepository.create({
      teacherId: original.teacherId,
      title: newTitle,
      description: original.description,
      assignmentType: original.assignmentType,
      totalPoints: original.totalPoints,
      dueDate: newDueDate,
      isPublished: false, // Always start as draft
    });

    const saved = await this.assignmentRepository.save(duplicate);

    const response: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
      id: saved.id,
      title: saved.title,
      originalId: originalId,
      classroomsCopied: 0,
      exercisesCopied: 0,
      isPublished: false,
    };

    // 3. Copy classroom assignments if requested
    if (dto.copyClassroomAssignments) {
      const classrooms = await this.assignmentClassroomRepository.find({
        where: { assignment_id: originalId },
      });

      for (const ac of classrooms) {
        try {
          const newAC = this.assignmentClassroomRepository.create({
            assignment_id: saved.id,
            classroom_id: ac.classroom_id,
          });
          await this.assignmentClassroomRepository.save(newAC);
          response.classroomsCopied++;
        } catch (error) {
          this.logger.error(`Failed to copy classroom assignment ${ac.id}:`, error);
        }
      }
    }

    // 4. Copy exercises if requested (default: true)
    if (dto.copyExercises !== false) {
      const exercises = await this.assignmentExerciseRepository.find({
        where: { assignmentId: originalId },
        order: { orderIndex: 'ASC' },
      });

      for (const ex of exercises) {
        try {
          const newEx = this.assignmentExerciseRepository.create({
            assignmentId: saved.id,
            exerciseId: ex.exerciseId,
            orderIndex: ex.orderIndex,
            pointsOverride: ex.pointsOverride,
            isRequired: ex.isRequired,
          });
          await this.assignmentExerciseRepository.save(newEx);
          response.exercisesCopied++;
        } catch (error) {
          this.logger.error(`Failed to copy exercise ${ex.id}:`, error);
        }
      }
    }

    this.logger.log(
      `Assignment ${originalId} duplicated to ${saved.id} (${response.classroomsCopied} classrooms, ${response.exercisesCopied} exercises)`,
    );

    return response;
  }

  /**
   * Soft delete assignment
   * REQ-TCH-037: Soft delete (is_active = false)
   */
  async remove(id: string, teacherId: string): Promise<void> {
    const assignment = await this.findOne(id, teacherId);

    assignment.isPublished = false;
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
            assignment_id: assignmentId,
            classroom_id: classroom.classroomId,
          },
        });

        if (existing) {
          failedCount++;
          continue;
        }

        // Create assignment-classroom relationship
        const assignmentClassroom = this.assignmentClassroomRepository.create({
          assignment_id: assignmentId,
          classroom_id: classroom.classroomId,
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
    dto: AssignmentGradeDto,
    teacherId: string,
  ): Promise<AssignmentSubmission> {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException(`Submission with ID ${submissionId} not found`);
    }

    // Verify teacher owns the assignment and get total points
    const assignment = await this.findOne(submission.assignmentId, teacherId);

    // Validate score doesn't exceed max points
    if (dto.score > assignment.totalPoints) {
      throw new UnprocessableEntityException(
        `Score cannot exceed max points (${assignment.totalPoints})`,
      );
    }

    // Update submission
    submission.score = dto.score;
    submission.feedback = dto.feedback || null;
    submission.gradedBy = teacherId;
    submission.gradedAt = new Date();
    submission.status = 'graded' as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    const graded = await this.submissionRepository.save(submission);

    this.logger.log(`Submission graded: ${submissionId} by teacher ${teacherId}`);

    return graded;
  }

  /**
   * Add exercises to an assignment
   * Creates M2M relationships in assignment_exercises table
   */
  async addExercisesToAssignment(
    assignmentId: string,
    exerciseIds: Array<{
      exerciseId: string;
      orderIndex: number;
      pointsOverride?: number;
      isRequired?: boolean;
    }>,
    teacherId: string,
  ): Promise<AssignmentExercise[]> {
    // Verify ownership
    await this.findOne(assignmentId, teacherId);

    const createdExercises: AssignmentExercise[] = [];

    for (const exerciseData of exerciseIds) {
      // Check if already assigned
      const existing = await this.assignmentExerciseRepository.findOne({
        where: {
          assignmentId,
          exerciseId: exerciseData.exerciseId,
        },
      });

      if (existing) {
        this.logger.warn(
          `Exercise ${exerciseData.exerciseId} already assigned to ${assignmentId}`,
        );
        continue;
      }

      const assignmentExercise = this.assignmentExerciseRepository.create({
        assignmentId,
        exerciseId: exerciseData.exerciseId,
        orderIndex: exerciseData.orderIndex,
        pointsOverride: exerciseData.pointsOverride || null,
        isRequired: exerciseData.isRequired !== undefined ? exerciseData.isRequired : true,
      });

      const saved = await this.assignmentExerciseRepository.save(assignmentExercise);
      createdExercises.push(saved);
    }

    this.logger.log(
      `Added ${createdExercises.length} exercises to assignment ${assignmentId}`,
    );

    return createdExercises;
  }

  /**
   * Remove exercise from assignment
   */
  async removeExerciseFromAssignment(
    assignmentId: string,
    exerciseId: string,
    teacherId: string,
  ): Promise<void> {
    // Verify ownership
    await this.findOne(assignmentId, teacherId);

    const result = await this.assignmentExerciseRepository.delete({
      assignmentId,
      exerciseId,
    });

    if (result.affected === 0) {
      throw new NotFoundException(
        `Exercise ${exerciseId} not found in assignment ${assignmentId}`,
      );
    }

    this.logger.log(`Removed exercise ${exerciseId} from assignment ${assignmentId}`);
  }

  /**
   * Reorder exercises in an assignment
   */
  async reorderExercises(
    assignmentId: string,
    orderedExerciseIds: Array<{ exerciseId: string; orderIndex: number }>,
    teacherId: string,
  ): Promise<void> {
    // Verify ownership
    await this.findOne(assignmentId, teacherId);

    for (const { exerciseId, orderIndex } of orderedExerciseIds) {
      await this.assignmentExerciseRepository.update(
        { assignmentId, exerciseId },
        { orderIndex },
      );
    }

    this.logger.log(`Reordered exercises for assignment ${assignmentId}`);
  }

  /**
   * Get all exercises for an assignment
   */
  async getAssignmentExercises(
    assignmentId: string,
    teacherId: string,
  ): Promise<AssignmentExercise[]> {
    // Verify ownership
    await this.findOne(assignmentId, teacherId);

    return this.assignmentExerciseRepository.find({
      where: { assignmentId },
      order: { orderIndex: 'ASC' },
    });
  }

  /**
   * Assign assignment to individual students
   * Used for remedial or advanced assignments
   */
  async assignToStudents(
    assignmentId: string,
    studentIds: string[],
    teacherId: string,
  ): Promise<{ success: number; failed: number }> {
    // Verify ownership
    await this.findOne(assignmentId, teacherId);

    let successCount = 0;
    let failedCount = 0;

    for (const studentId of studentIds) {
      try {
        // Check if already assigned
        const existing = await this.assignmentStudentRepository.findOne({
          where: {
            assignmentId,
            studentId,
          },
        });

        if (existing) {
          failedCount++;
          continue;
        }

        const assignmentStudent = this.assignmentStudentRepository.create({
          assignmentId,
          studentId,
        });

        await this.assignmentStudentRepository.save(assignmentStudent);
        successCount++;
      } catch (error) {
        this.logger.error(`Failed to assign to student ${studentId}:`, error);
        failedCount++;
      }
    }

    this.logger.log(
      `Assignment ${assignmentId} assigned to students: ${successCount} success, ${failedCount} failed`,
    );

    return { success: successCount, failed: failedCount };
  }

  /**
   * Remove student from assignment
   */
  async removeStudentAssignment(
    assignmentId: string,
    studentId: string,
    teacherId: string,
  ): Promise<void> {
    // Verify ownership
    await this.findOne(assignmentId, teacherId);

    const result = await this.assignmentStudentRepository.delete({
      assignmentId,
      studentId,
    });

    if (result.affected === 0) {
      throw new NotFoundException(
        `Student ${studentId} not assigned to ${assignmentId}`,
      );
    }

    this.logger.log(`Removed student ${studentId} from assignment ${assignmentId}`);
  }

  /**
   * Get all students assigned to an assignment
   */
  async getAssignedStudents(
    assignmentId: string,
    teacherId: string,
  ): Promise<AssignmentStudent[]> {
    // Verify ownership
    await this.findOne(assignmentId, teacherId);

    return this.assignmentStudentRepository.find({
      where: { assignmentId },
      order: { assignedAt: 'ASC' },
    });
  }

  /**
   * Publish an assignment
   * Changes status from draft to published
   * REQ-TCH-092: Assignment publication
   */
  async publishAssignment(
    assignmentId: string,
    teacherId: string,
    notifyStudents: boolean = false,
  ): Promise<Assignment> {
    // Verify ownership
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId, teacherId },
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${assignmentId} not found or access denied`);
    }

    // Check if already published
    if (assignment.isPublished) {
      this.logger.warn(`Assignment ${assignmentId} is already published`);
      return assignment;
    }

    // Publish assignment
    assignment.isPublished = true;
    const published = await this.assignmentRepository.save(assignment);

    this.logger.log(`Assignment ${assignmentId} published by teacher ${teacherId}`);

    // TASK-2026-01-19-008: Implemented notification integration
    if (notifyStudents) {
      try {
        // Get assigned students
        const assignedStudents = await this.assignmentStudentRepository.find({
          where: { assignmentId },
        });

        if (assignedStudents.length > 0) {
          await Promise.all(assignedStudents.map(student =>
            this.notificationService.create({
              userId: student.studentId,
              type: NotificationTypeEnum.SYSTEM_ANNOUNCEMENT,
              title: `📢 Tarea publicada: ${published.title}`,
              message: `La tarea "${published.title}" ya está disponible${published.dueDate ? `. Fecha límite: ${new Date(published.dueDate).toLocaleDateString('es-MX')}` : ''}`,
              data: {
                assignmentId,
                assignmentTitle: published.title,
                dueDate: published.dueDate?.toISOString() || null,
                action: {
                  type: 'navigate',
                  url: `/student/assignments/${assignmentId}`,
                },
              },
              priority: 'normal',
            }),
          ));

          this.logger.log(`✅ Publish notifications sent to ${assignedStudents.length} students for assignment ${assignmentId}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Failed to send publish notifications: ${errorMessage}`);
        // Don't fail the publish if notifications fail
      }
    }

    return published;
  }

  /**
   * Close an assignment
   * Prevents new submissions after due date
   * REQ-TCH-093: Assignment closure
   */
  async closeAssignment(
    assignmentId: string,
    teacherId: string,
  ): Promise<Assignment> {
    // Verify ownership
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId, teacherId },
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${assignmentId} not found or access denied`);
    }

    // Set due date to now to effectively close it
    // Note: You might want to add a separate 'status' field (open/closed) in the entity
    // For now, we'll set isPublished to false to prevent further submissions
    assignment.isPublished = false;
    const closed = await this.assignmentRepository.save(assignment);

    this.logger.log(`Assignment ${assignmentId} closed by teacher ${teacherId}`);

    return closed;
  }

  // =====================================================
  // STUDENT-FACING METHODS (P1-002)
  // =====================================================

  /**
   * Find all assignments for a student
   * Returns assignments assigned via classroom or directly
   * @param studentId - The student's user ID
   * @param filters - Optional filters (status, classroomId)
   */
  async findStudentAssignments(
    studentId: string,
    _filters?: { status?: string; classroomId?: string },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any[]> {
    // Get direct student assignments (without relation join - relations commented out)
    const studentAssignments = await this.assignmentStudentRepository.find({
      where: { studentId },
    });

    if (studentAssignments.length === 0) {
      return [];
    }

    // Get assignment IDs
    const assignmentIds = studentAssignments.map((sa) => sa.assignmentId);

    // Get assignments separately (since relation is not defined)
    const assignmentsQuery = this.assignmentRepository
      .createQueryBuilder('assignment')
      .where('assignment.id IN (:...ids)', { ids: assignmentIds })
      .andWhere('assignment.isPublished = true');

    const assignments = await assignmentsQuery.getMany();
    const assignmentMap = new Map(assignments.map((a) => [a.id, a]));

    // Get submissions for score/feedback
    const submissions = await this.submissionRepository.find({
      where: { studentId },
    });
    const submissionMap = new Map(submissions.map((s) => [s.assignmentId, s]));

    // Map to response format
    const results = studentAssignments
      .filter((sa) => assignmentMap.has(sa.assignmentId)) // Only published
      .map((sa) => {
        const assignment = assignmentMap.get(sa.assignmentId);
        const submission = submissionMap.get(sa.assignmentId);
        return {
          id: sa.id,
          assignment: {
            id: assignment?.id,
            title: assignment?.title,
            description: assignment?.description,
            assignmentType: assignment?.assignmentType,
            dueDate: assignment?.dueDate,
            totalPoints: assignment?.totalPoints,
          },
          status: submission?.status || 'assigned',
          assignedAt: sa.assignedAt,
          score: submission?.score || null,
          feedback: submission?.feedback || null,
        };
      });

    this.logger.log(`Found ${results.length} assignments for student ${studentId}`);

    return results;
  }

  /**
   * Find a specific assignment for a student by ID
   * @param assignmentStudentId - The assignment_students.id
   * @param studentId - The student's user ID (for authorization)
   */
  async findStudentAssignmentById(
    assignmentStudentId: string,
    studentId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    // Get student assignment record
    const assignmentStudent = await this.assignmentStudentRepository.findOne({
      where: { id: assignmentStudentId, studentId },
    });

    if (!assignmentStudent) {
      throw new NotFoundException(
        `Assignment ${assignmentStudentId} not found or not assigned to this student`,
      );
    }

    // Get assignment details separately (relation commented out)
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentStudent.assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment data not found');
    }

    // Get exercises for this assignment
    const exercises = await this.assignmentExerciseRepository.find({
      where: { assignmentId: assignmentStudent.assignmentId },
      order: { orderIndex: 'ASC' },
    });

    // Get submission if exists
    const submission = await this.submissionRepository.findOne({
      where: {
        assignmentId: assignmentStudent.assignmentId,
        studentId,
      },
    });

    return {
      id: assignmentStudent.id,
      assignment: {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        assignmentType: assignment.assignmentType,
        dueDate: assignment.dueDate,
        totalPoints: assignment.totalPoints,
      },
      status: submission?.status || 'assigned',
      assignedAt: assignmentStudent.assignedAt,
      exercises: exercises.map((e) => ({
        id: e.id,
        exerciseId: e.exerciseId,
        orderIndex: e.orderIndex,
        pointsOverride: e.pointsOverride,
        isRequired: e.isRequired,
      })),
      submission: submission
        ? {
          id: submission.id,
          status: submission.status,
          submittedAt: submission.submittedAt,
          score: submission.score,
          feedback: submission.feedback,
          gradedAt: submission.gradedAt,
        }
        : null,
    };
  }

  /**
   * Get grades summary for a student
   * @param studentId - The student's user ID
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getStudentGradesSummary(studentId: string): Promise<any> {
    // Get all assignments for student
    const studentAssignments = await this.assignmentStudentRepository.find({
      where: { studentId },
    });

    // Get all submissions for student (without relation join)
    const submissions = await this.submissionRepository.find({
      where: { studentId },
    });

    const gradedSubmissions = submissions.filter(
      (s) => s.status === 'graded' && s.score !== null,
    );

    // Get assignment details for graded submissions
    const assignmentIds = gradedSubmissions.map((s) => s.assignmentId);
    let assignmentMap = new Map<string, Assignment>();

    if (assignmentIds.length > 0) {
      const assignments = await this.assignmentRepository
        .createQueryBuilder('a')
        .where('a.id IN (:...ids)', { ids: assignmentIds })
        .getMany();
      assignmentMap = new Map(assignments.map((a) => [a.id, a]));
    }

    const totalScore = gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0);
    const totalMaxScore = gradedSubmissions.reduce((sum, s) => {
      const assignment = assignmentMap.get(s.assignmentId);
      return sum + (assignment?.totalPoints || 0);
    }, 0);

    const averageScore =
      gradedSubmissions.length > 0 && totalMaxScore > 0
        ? Math.round((totalScore / totalMaxScore) * 100 * 10) / 10
        : 0;

    return {
      totalAssignments: studentAssignments.length,
      completed: gradedSubmissions.length,
      pending: studentAssignments.length - gradedSubmissions.length,
      averageScore,
      grades: gradedSubmissions.map((s) => {
        const assignment = assignmentMap.get(s.assignmentId);
        return {
          assignmentTitle: assignment?.title || 'Unknown',
          score: s.score,
          maxScore: assignment?.totalPoints,
          gradedAt: s.gradedAt?.toISOString().split('T')[0],
          feedback: s.feedback,
        };
      }),
    };
  }

  /**
   * Get upcoming assignments with deadlines within specified days
   * BAJO-008: Upcoming assignments for Teacher Dashboard
   *
   * @param teacherId - The teacher's user ID
   * @param daysAhead - Number of days to look ahead (default: 7)
   * @returns Array of upcoming assignments with submission stats
   */
  async getUpcomingAssignments(
    teacherId: string,
    daysAhead: number = 7,
  ): Promise<Array<{
    id: string;
    title: string;
    dueDate: Date | null;
    daysRemaining: number;
    totalStudents: number;
    submittedCount: number;
    classroomName?: string;
  }>> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + daysAhead);

    // Get published assignments with upcoming due dates
    const assignments = await this.assignmentRepository
      .createQueryBuilder('assignment')
      .where('assignment.teacherId = :teacherId', { teacherId })
      .andWhere('assignment.isPublished = true')
      .andWhere('assignment.dueDate IS NOT NULL')
      .andWhere('assignment.dueDate >= :now', { now })
      .andWhere('assignment.dueDate <= :futureDate', { futureDate })
      .orderBy('assignment.dueDate', 'ASC')
      .getMany();

    // Get stats for each assignment
    const results = await Promise.all(
      assignments.map(async (assignment) => {
        // Get total assigned students
        const totalStudents = await this.assignmentStudentRepository.count({
          where: { assignmentId: assignment.id },
        });

        // Get submitted count
        const submittedCount = await this.submissionRepository.count({
          where: { assignmentId: assignment.id },
        });

        // Calculate days remaining
        const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
        const daysRemaining = dueDate
          ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        return {
          id: assignment.id,
          title: assignment.title,
          dueDate: assignment.dueDate,
          daysRemaining,
          totalStudents,
          submittedCount,
        };
      }),
    );

    this.logger.log(`Found ${results.length} upcoming assignments for teacher ${teacherId}`);

    return results;
  }

  /**
   * Send reminder notifications to students who haven't submitted
   * MEDIO-005: Assignment reminder functionality
   *
   * @param assignmentId - The assignment ID
   * @param teacherId - The teacher's user ID (for authorization)
   * @returns Count of students notified
   */
  async sendReminder(
    assignmentId: string,
    teacherId: string,
  ): Promise<{ notified: number; alreadySubmitted: number; message: string }> {
    // Verify ownership
    const assignment = await this.findOne(assignmentId, teacherId);

    // Get all students assigned to this assignment
    const assignedStudents = await this.assignmentStudentRepository.find({
      where: { assignmentId },
    });

    if (assignedStudents.length === 0) {
      return {
        notified: 0,
        alreadySubmitted: 0,
        message: 'No hay estudiantes asignados a esta tarea',
      };
    }

    // Get students who have already submitted
    const submissions = await this.submissionRepository.find({
      where: { assignmentId },
    });
    const submittedStudentIds = new Set(submissions.map((s) => s.studentId));

    // Filter students who haven't submitted
    const studentsToNotify = assignedStudents.filter(
      (s) => !submittedStudentIds.has(s.studentId),
    );

    const alreadySubmitted = assignedStudents.length - studentsToNotify.length;

    if (studentsToNotify.length === 0) {
      return {
        notified: 0,
        alreadySubmitted,
        message: 'Todos los estudiantes ya han entregado esta tarea',
      };
    }

    // TASK-2026-01-19-008: Implemented notification integration
    const dueDate = assignment.dueDate
      ? new Date(assignment.dueDate).toLocaleDateString('es-MX')
      : 'Sin fecha límite';

    try {
      await Promise.all(studentsToNotify.map(student =>
        this.notificationService.create({
          userId: student.studentId,
          type: NotificationTypeEnum.SYSTEM_ANNOUNCEMENT,
          title: `⏰ Recordatorio: ${assignment.title}`,
          message: `Aún no has entregado la tarea "${assignment.title}". Fecha límite: ${dueDate}`,
          data: {
            assignmentId,
            assignmentTitle: assignment.title,
            dueDate: assignment.dueDate?.toISOString() || null,
            action: {
              type: 'navigate',
              url: `/student/assignments/${assignmentId}`,
            },
          },
          priority: assignment.dueDate && new Date(assignment.dueDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
            ? 'high'
            : 'normal',
        }),
      ));

      this.logger.log(`✅ Reminder sent for assignment ${assignmentId}: ${studentsToNotify.length} students notified`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send reminder notifications: ${errorMessage}`);
      // Don't fail if notifications fail
    }

    return {
      notified: studentsToNotify.length,
      alreadySubmitted,
      message: `Recordatorio enviado a ${studentsToNotify.length} estudiante(s). Tarea: "${assignment.title}" - Fecha límite: ${dueDate}`,
    };
  }

  /**
   * Sanitize HTML to prevent XSS
   * REQ-TCH-021: HTML sanitization
   */
  private sanitizeHtml(html?: string): string | null {
    if (!html) return null;

    // Basic sanitization - in production use DOMPurify
    // For now, strip script tags and dangerous attributes
    const sanitized = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '');

    return sanitized;
  }
}
