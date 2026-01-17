/**
 * AssignmentsService Unit Tests
 *
 * Tests for assignment management service.
 * Covers CRUD operations, distribution, grading, and exercise management.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AssignmentsService } from '../services/assignments.service';
import { Assignment } from '../entities/assignment.entity';
import { AssignmentClassroom } from '@/modules/social/entities/assignment-classroom.entity';
import { AssignmentExercise } from '../entities/assignment-exercise.entity';
import { AssignmentStudent } from '../entities/assignment-student.entity';
import { AssignmentSubmission } from '../entities/assignment-submission.entity';

describe('AssignmentsService', () => {
  let service: AssignmentsService;
  let assignmentRepo: jest.Mocked<Repository<Assignment>>;
  let assignmentClassroomRepo: jest.Mocked<Repository<AssignmentClassroom>>;
  let assignmentExerciseRepo: jest.Mocked<Repository<AssignmentExercise>>;
  let assignmentStudentRepo: jest.Mocked<Repository<AssignmentStudent>>;
  let submissionRepo: jest.Mocked<Repository<AssignmentSubmission>>;

  const mockAssignmentRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockAssignmentClassroomRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  const mockAssignmentExerciseRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  const mockAssignmentStudentRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockSubmissionRepo = {
    count: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockAssignment: Partial<Assignment> = {
    id: 'assignment-123',
    teacherId: 'teacher-456',
    title: 'Test Assignment',
    description: 'Test description',
    assignmentType: 'task' as any,
    totalPoints: 100,
    dueDate: new Date('2026-02-01'),
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSubmission: Partial<AssignmentSubmission> = {
    id: 'submission-789',
    assignmentId: 'assignment-123',
    studentId: 'student-abc',
    status: 'submitted' as any,
    submittedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentsService,
        {
          provide: getRepositoryToken(Assignment, 'educational'),
          useValue: mockAssignmentRepo,
        },
        {
          provide: getRepositoryToken(AssignmentClassroom, 'social'),
          useValue: mockAssignmentClassroomRepo,
        },
        {
          provide: getRepositoryToken(AssignmentExercise, 'educational'),
          useValue: mockAssignmentExerciseRepo,
        },
        {
          provide: getRepositoryToken(AssignmentStudent, 'educational'),
          useValue: mockAssignmentStudentRepo,
        },
        {
          provide: getRepositoryToken(AssignmentSubmission, 'educational'),
          useValue: mockSubmissionRepo,
        },
      ],
    }).compile();

    service = module.get<AssignmentsService>(AssignmentsService);
    assignmentRepo = module.get(getRepositoryToken(Assignment, 'educational'));
    assignmentClassroomRepo = module.get(getRepositoryToken(AssignmentClassroom, 'social'));
    assignmentExerciseRepo = module.get(getRepositoryToken(AssignmentExercise, 'educational'));
    assignmentStudentRepo = module.get(getRepositoryToken(AssignmentStudent, 'educational'));
    submissionRepo = module.get(getRepositoryToken(AssignmentSubmission, 'educational'));

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create', () => {
    it('should create a new assignment', async () => {
      const createDto = {
        title: 'New Assignment',
        description: '<p>Description</p>',
        assignmentType: 'task',
        totalPoints: 50,
        deadline: '2026-02-15',
      };

      const createdAssignment = { ...mockAssignment, ...createDto, isPublished: false };
      mockAssignmentRepo.create.mockReturnValue(createdAssignment as Assignment);
      mockAssignmentRepo.save.mockResolvedValue(createdAssignment as Assignment);

      const result = await service.create(createDto as any, 'teacher-456');

      expect(result.title).toBe('New Assignment');
      expect(result.isPublished).toBe(false);
      expect(mockAssignmentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Assignment',
          teacherId: 'teacher-456',
          isPublished: false,
        }),
      );
    });

    it('should sanitize HTML in description', async () => {
      const createDto = {
        title: 'Assignment',
        description: '<script>alert("xss")</script><p>Safe content</p>',
        assignmentType: 'task',
        totalPoints: 50,
      };

      mockAssignmentRepo.create.mockReturnValue(mockAssignment as Assignment);
      mockAssignmentRepo.save.mockResolvedValue(mockAssignment as Assignment);

      await service.create(createDto as any, 'teacher-456');

      expect(mockAssignmentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: expect.not.stringContaining('<script>'),
        }),
      );
    });

    it('should set dueDate from deadline string', async () => {
      const createDto = {
        title: 'Assignment',
        description: 'Test',
        assignmentType: 'task',
        totalPoints: 50,
        deadline: '2026-03-01T12:00:00Z',
      };

      mockAssignmentRepo.create.mockReturnValue(mockAssignment as Assignment);
      mockAssignmentRepo.save.mockResolvedValue(mockAssignment as Assignment);

      await service.create(createDto as any, 'teacher-456');

      expect(mockAssignmentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          dueDate: expect.any(Date),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all assignments for a teacher', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockAssignment]),
      };
      mockAssignmentRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll('teacher-456');

      expect(result).toHaveLength(1);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'assignment.teacherId = :teacherId',
        { teacherId: 'teacher-456' },
      );
    });

    it('should filter by isPublished', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      mockAssignmentRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findAll('teacher-456', { isPublished: true });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'assignment.isPublished = :isPublished',
        { isPublished: true },
      );
    });

    it('should filter by assignmentType', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      mockAssignmentRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findAll('teacher-456', { assignmentType: 'quiz' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'assignment.assignmentType = :assignmentType',
        { assignmentType: 'quiz' },
      );
    });

    it('should filter by search term', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      mockAssignmentRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findAll('teacher-456', { search: 'test' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('LOWER(assignment.title)'),
        { search: '%test%' },
      );
    });
  });

  describe('findOne', () => {
    it('should return assignment when found', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(mockAssignment as Assignment);

      const result = await service.findOne('assignment-123', 'teacher-456');

      expect(result).toEqual(mockAssignment);
      expect(mockAssignmentRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'assignment-123', teacherId: 'teacher-456', isPublished: true },
      });
    });

    it('should throw NotFoundException when not found', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent', 'teacher-456')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update assignment when no submissions exist', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(mockAssignment as Assignment);
      mockSubmissionRepo.count.mockResolvedValue(0);
      mockAssignmentRepo.save.mockResolvedValue({ ...mockAssignment, title: 'Updated' } as Assignment);

      const result = await service.update(
        'assignment-123',
        { title: 'Updated' } as any,
        'teacher-456',
      );

      expect(result.title).toBe('Updated');
    });

    it('should throw UnprocessableEntityException when submissions exist', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(mockAssignment as Assignment);
      mockSubmissionRepo.count.mockResolvedValue(5);

      await expect(
        service.update('assignment-123', { title: 'Updated' } as any, 'teacher-456'),
      ).rejects.toThrow(UnprocessableEntityException);
      await expect(
        service.update('assignment-123', { title: 'Updated' } as any, 'teacher-456'),
      ).rejects.toThrow('Cannot update assignment with existing submissions');
    });

    it('should sanitize HTML in description on update', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(mockAssignment as Assignment);
      mockSubmissionRepo.count.mockResolvedValue(0);
      mockAssignmentRepo.save.mockResolvedValue(mockAssignment as Assignment);

      await service.update(
        'assignment-123',
        { description: '<script>bad</script><p>good</p>' } as any,
        'teacher-456',
      );

      expect(mockAssignmentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          description: expect.not.stringContaining('<script>'),
        }),
      );
    });
  });

  describe('patchAssignment', () => {
    it('should allow partial update on non-critical fields with submissions', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(mockAssignment as Assignment);
      mockSubmissionRepo.count.mockResolvedValue(3);
      mockAssignmentRepo.save.mockResolvedValue({ ...mockAssignment, title: 'Patched' } as Assignment);

      const result = await service.patchAssignment(
        'assignment-123',
        { title: 'Patched' },
        'teacher-456',
      );

      expect(result.title).toBe('Patched');
    });

    it('should block critical field changes when submissions exist', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(mockAssignment as Assignment);
      mockSubmissionRepo.count.mockResolvedValue(3);

      await expect(
        service.patchAssignment(
          'assignment-123',
          { totalPoints: 200 },
          'teacher-456',
        ),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw NotFoundException when assignment not found', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.patchAssignment('non-existent', { title: 'Test' }, 'teacher-456'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete assignment by setting isPublished to false', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(mockAssignment as Assignment);
      mockAssignmentRepo.save.mockResolvedValue({ ...mockAssignment, isPublished: false } as Assignment);

      await service.remove('assignment-123', 'teacher-456');

      expect(mockAssignmentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ isPublished: false }),
      );
    });
  });

  describe('assignToClassrooms', () => {
    it('should assign assignment to classrooms', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(mockAssignment as Assignment);
      mockAssignmentClassroomRepo.findOne.mockResolvedValue(null);
      mockAssignmentClassroomRepo.create.mockReturnValue({} as any);
      mockAssignmentClassroomRepo.save.mockResolvedValue({} as any);

      const result = await service.assignToClassrooms(
        'assignment-123',
        { classrooms: [{ classroomId: 'class-1' }, { classroomId: 'class-2' }] } as any,
        'teacher-456',
      );

      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
    });

    it('should skip already assigned classrooms', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(mockAssignment as Assignment);
      mockAssignmentClassroomRepo.findOne.mockResolvedValue({} as any); // Already exists

      const result = await service.assignToClassrooms(
        'assignment-123',
        { classrooms: [{ classroomId: 'class-1' }] } as any,
        'teacher-456',
      );

      expect(result.success).toBe(0);
      expect(result.failed).toBe(1);
    });

    it('should count failures on save errors', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(mockAssignment as Assignment);
      mockAssignmentClassroomRepo.findOne.mockResolvedValue(null);
      mockAssignmentClassroomRepo.create.mockReturnValue({} as any);
      mockAssignmentClassroomRepo.save.mockRejectedValue(new Error('DB error'));

      const result = await service.assignToClassrooms(
        'assignment-123',
        { classrooms: [{ classroomId: 'class-1' }] } as any,
        'teacher-456',
      );

      expect(result.failed).toBe(1);
    });
  });

  describe('gradeSubmission', () => {
    it('should grade submission successfully', async () => {
      mockSubmissionRepo.findOne.mockResolvedValue(mockSubmission as AssignmentSubmission);
      mockAssignmentRepo.findOne.mockResolvedValue(mockAssignment as Assignment);
      mockSubmissionRepo.save.mockResolvedValue({
        ...mockSubmission,
        score: 85,
        status: 'graded',
      } as AssignmentSubmission);

      const result = await service.gradeSubmission(
        'submission-789',
        { score: 85, feedback: 'Good work!' } as any,
        'teacher-456',
      );

      expect(result.score).toBe(85);
      expect(result.status).toBe('graded');
    });

    it('should throw NotFoundException when submission not found', async () => {
      mockSubmissionRepo.findOne.mockResolvedValue(null);

      await expect(
        service.gradeSubmission('non-existent', { score: 50 } as any, 'teacher-456'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnprocessableEntityException when score exceeds max points', async () => {
      mockSubmissionRepo.findOne.mockResolvedValue(mockSubmission as AssignmentSubmission);
      mockAssignmentRepo.findOne.mockResolvedValue(mockAssignment as Assignment); // totalPoints: 100

      await expect(
        service.gradeSubmission('submission-789', { score: 150 } as any, 'teacher-456'),
      ).rejects.toThrow(UnprocessableEntityException);
      await expect(
        service.gradeSubmission('submission-789', { score: 150 } as any, 'teacher-456'),
      ).rejects.toThrow('Score cannot exceed max points');
    });
  });

  describe('addExercisesToAssignment', () => {
    it('should add exercises to assignment', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(mockAssignment as Assignment);
      mockAssignmentExerciseRepo.findOne.mockResolvedValue(null);
      mockAssignmentExerciseRepo.create.mockReturnValue({} as any);
      mockAssignmentExerciseRepo.save.mockResolvedValue({
        assignmentId: 'assignment-123',
        exerciseId: 'exercise-1',
        orderIndex: 1,
      } as any);

      const exercises = [
        { exerciseId: 'exercise-1', orderIndex: 1 },
        { exerciseId: 'exercise-2', orderIndex: 2 },
      ];

      const result = await service.addExercisesToAssignment(
        'assignment-123',
        exercises,
        'teacher-456',
      );

      expect(result).toHaveLength(2);
    });

    it('should skip already assigned exercises', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(mockAssignment as Assignment);
      mockAssignmentExerciseRepo.findOne.mockResolvedValue({} as any); // Already exists

      const result = await service.addExercisesToAssignment(
        'assignment-123',
        [{ exerciseId: 'exercise-1', orderIndex: 1 }],
        'teacher-456',
      );

      expect(result).toHaveLength(0);
    });
  });

  describe('removeExerciseFromAssignment', () => {
    it('should remove exercise from assignment', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(mockAssignment as Assignment);
      mockAssignmentExerciseRepo.delete.mockResolvedValue({ affected: 1 } as any);

      await service.removeExerciseFromAssignment(
        'assignment-123',
        'exercise-1',
        'teacher-456',
      );

      expect(mockAssignmentExerciseRepo.delete).toHaveBeenCalledWith({
        assignmentId: 'assignment-123',
        exerciseId: 'exercise-1',
      });
    });

    it('should throw NotFoundException when exercise not in assignment', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(mockAssignment as Assignment);
      mockAssignmentExerciseRepo.delete.mockResolvedValue({ affected: 0 } as any);

      await expect(
        service.removeExerciseFromAssignment('assignment-123', 'non-existent', 'teacher-456'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('reorderExercises', () => {
    it('should reorder exercises', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(mockAssignment as Assignment);
      mockAssignmentExerciseRepo.update.mockResolvedValue({ affected: 1 } as any);

      const orderedExercises = [
        { exerciseId: 'ex-1', orderIndex: 2 },
        { exerciseId: 'ex-2', orderIndex: 1 },
      ];

      await service.reorderExercises('assignment-123', orderedExercises, 'teacher-456');

      expect(mockAssignmentExerciseRepo.update).toHaveBeenCalledTimes(2);
    });
  });

  describe('getAssignmentExercises', () => {
    it('should return exercises for assignment ordered by index', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(mockAssignment as Assignment);
      mockAssignmentExerciseRepo.find.mockResolvedValue([
        { exerciseId: 'ex-1', orderIndex: 1 },
        { exerciseId: 'ex-2', orderIndex: 2 },
      ] as any);

      const result = await service.getAssignmentExercises('assignment-123', 'teacher-456');

      expect(result).toHaveLength(2);
      expect(mockAssignmentExerciseRepo.find).toHaveBeenCalledWith({
        where: { assignmentId: 'assignment-123' },
        order: { orderIndex: 'ASC' },
      });
    });
  });

  describe('duplicateAssignment', () => {
    it('should duplicate assignment with new title', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(mockAssignment as Assignment);
      mockAssignmentRepo.create.mockReturnValue({
        ...mockAssignment,
        id: 'new-assignment',
        title: 'Copy of Test Assignment',
        isPublished: false,
      } as Assignment);
      mockAssignmentRepo.save.mockResolvedValue({
        ...mockAssignment,
        id: 'new-assignment',
        title: 'Copy of Test Assignment',
      } as Assignment);
      mockAssignmentClassroomRepo.find.mockResolvedValue([]);
      mockAssignmentExerciseRepo.find.mockResolvedValue([]);

      const result = await service.duplicateAssignment(
        'assignment-123',
        {},
        'teacher-456',
      );

      expect(result.originalId).toBe('assignment-123');
      expect(result.isPublished).toBe(false);
    });

    it('should throw NotFoundException when original not found', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.duplicateAssignment('non-existent', {}, 'teacher-456'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should copy classroom assignments when requested', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(mockAssignment as Assignment);
      mockAssignmentRepo.create.mockReturnValue({ id: 'new-assignment' } as Assignment);
      mockAssignmentRepo.save.mockResolvedValue({ id: 'new-assignment' } as Assignment);
      mockAssignmentClassroomRepo.find.mockResolvedValue([
        { id: 'ac-1', classroom_id: 'class-1' },
      ] as any);
      mockAssignmentClassroomRepo.create.mockReturnValue({} as any);
      mockAssignmentClassroomRepo.save.mockResolvedValue({} as any);
      mockAssignmentExerciseRepo.find.mockResolvedValue([]);

      const result = await service.duplicateAssignment(
        'assignment-123',
        { copyClassroomAssignments: true },
        'teacher-456',
      );

      expect(result.classroomsCopied).toBe(1);
    });

    it('should copy exercises by default', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(mockAssignment as Assignment);
      mockAssignmentRepo.create.mockReturnValue({ id: 'new-assignment' } as Assignment);
      mockAssignmentRepo.save.mockResolvedValue({ id: 'new-assignment' } as Assignment);
      mockAssignmentClassroomRepo.find.mockResolvedValue([]);
      mockAssignmentExerciseRepo.find.mockResolvedValue([
        { exerciseId: 'ex-1', orderIndex: 1 },
        { exerciseId: 'ex-2', orderIndex: 2 },
      ] as any);
      mockAssignmentExerciseRepo.create.mockReturnValue({} as any);
      mockAssignmentExerciseRepo.save.mockResolvedValue({} as any);

      const result = await service.duplicateAssignment(
        'assignment-123',
        {},
        'teacher-456',
      );

      expect(result.exercisesCopied).toBe(2);
    });
  });
});
