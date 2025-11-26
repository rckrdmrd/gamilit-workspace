import { Test, TestingModule } from '@nestjs/testing';
import { ClassroomTeachersRestController } from '../controllers/classroom-teachers-rest.controller';
import { ClassroomAssignmentsService } from '../services/classroom-assignments.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

/**
 * Unit Tests for ClassroomTeachersRestController
 *
 * @description Tests for REST-compliant endpoints resolving US-AE-007 API discrepancy
 * @priority CRITICAL - Production blocker resolution
 *
 * Test Coverage:
 * - All 7 REST endpoints
 * - Success cases
 * - Error cases (404, 409, 400)
 * - Input validation
 * - Service method delegation
 */
describe('ClassroomTeachersRestController', () => {
  let controller: ClassroomTeachersRestController;
  let service: ClassroomAssignmentsService;

  // Test data
  const mockClassroomId = '770e8400-e29b-41d4-a716-446655440020';
  const mockTeacherId = '550e8400-e29b-41d4-a716-446655440005';
  const mockTeacherId2 = '550e8400-e29b-41d4-a716-446655440006';

  const mockClassroomWithTeachers = {
    classroom: {
      id: mockClassroomId,
      name: 'Matemáticas 6A',
      grade: '6',
      section: 'A',
    },
    teachers: [
      {
        id: mockTeacherId,
        full_name: 'María González',
        email: 'maria@school.com',
        role: 'admin_teacher',
        assigned_at: new Date('2025-11-24'),
      },
    ],
  };

  const mockTeacherWithClassrooms = {
    teacher: {
      id: mockTeacherId,
      full_name: 'María González',
      email: 'maria@school.com',
      role: 'admin_teacher',
    },
    classrooms: [
      {
        id: mockClassroomId,
        name: 'Matemáticas 6A',
        grade: '6',
        section: 'A',
        student_count: 25,
        assigned_at: new Date('2025-11-24'),
      },
    ],
  };

  const mockAssignment = {
    classroom_id: mockClassroomId,
    name: 'Matemáticas 6A',
    teacher_id: mockTeacherId,
    role: 'teacher',
    student_count: 25,
    assigned_at: new Date('2025-11-24'),
  };

  beforeEach(async () => {
    const mockService = {
      getClassroomWithTeachers: jest.fn(),
      assignClassroomToTeacher: jest.fn(),
      removeClassroomAssignment: jest.fn(),
      getTeacherWithClassrooms: jest.fn(),
      bulkAssignClassrooms: jest.fn(),
      listAllAssignmentsPaginated: jest.fn(),
      bulkAssignPairs: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassroomTeachersRestController],
      providers: [
        {
          provide: ClassroomAssignmentsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ClassroomTeachersRestController>(
      ClassroomTeachersRestController,
    );
    service = module.get<ClassroomAssignmentsService>(
      ClassroomAssignmentsService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  // =====================================================
  // ENDPOINT 1: GET /admin/classrooms/:classroomId/teachers
  // =====================================================
  describe('getClassroomTeachers', () => {
    it('should return classroom with teachers list', async () => {
      jest
        .spyOn(service, 'getClassroomWithTeachers')
        .mockResolvedValue(mockClassroomWithTeachers);

      const result = await controller.getClassroomTeachers(mockClassroomId);

      expect(result).toEqual(mockClassroomWithTeachers);
      expect(service.getClassroomWithTeachers).toHaveBeenCalledWith(
        mockClassroomId,
      );
      expect(service.getClassroomWithTeachers).toHaveBeenCalledTimes(1);
    });

    it('should return 404 if classroom not found', async () => {
      jest
        .spyOn(service, 'getClassroomWithTeachers')
        .mockRejectedValue(
          new NotFoundException(`Classroom ${mockClassroomId} not found`),
        );

      await expect(
        controller.getClassroomTeachers(mockClassroomId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle classroom with no teachers', async () => {
      const emptyResult = {
        ...mockClassroomWithTeachers,
        teachers: [],
      };

      jest
        .spyOn(service, 'getClassroomWithTeachers')
        .mockResolvedValue(emptyResult);

      const result = await controller.getClassroomTeachers(mockClassroomId);

      expect(result.teachers).toHaveLength(0);
    });
  });

  // =====================================================
  // ENDPOINT 2: POST /admin/classrooms/:classroomId/teachers
  // =====================================================
  describe('assignTeacherToClassroom', () => {
    const assignDto = {
      teacherId: mockTeacherId,
      notes: 'Main teacher',
    };

    it('should assign teacher successfully', async () => {
      jest
        .spyOn(service, 'assignClassroomToTeacher')
        .mockResolvedValue(mockAssignment);

      const result = await controller.assignTeacherToClassroom(
        mockClassroomId,
        assignDto,
      );

      expect(result).toEqual(mockAssignment);
      expect(service.assignClassroomToTeacher).toHaveBeenCalledWith({
        teacherId: assignDto.teacherId,
        classroomId: mockClassroomId,
        notes: assignDto.notes,
      });
    });

    it('should return 409 if teacher already assigned', async () => {
      jest
        .spyOn(service, 'assignClassroomToTeacher')
        .mockRejectedValue(
          new ConflictException(
            `Teacher ${mockTeacherId} is already assigned to classroom ${mockClassroomId}`,
          ),
        );

      await expect(
        controller.assignTeacherToClassroom(mockClassroomId, assignDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should return 404 if classroom not found', async () => {
      jest
        .spyOn(service, 'assignClassroomToTeacher')
        .mockRejectedValue(
          new NotFoundException(`Classroom ${mockClassroomId} not found`),
        );

      await expect(
        controller.assignTeacherToClassroom(mockClassroomId, assignDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should work without optional notes', async () => {
      const dtoWithoutNotes = { teacherId: mockTeacherId };

      jest
        .spyOn(service, 'assignClassroomToTeacher')
        .mockResolvedValue(mockAssignment);

      await controller.assignTeacherToClassroom(
        mockClassroomId,
        dtoWithoutNotes,
      );

      expect(service.assignClassroomToTeacher).toHaveBeenCalledWith({
        teacherId: mockTeacherId,
        classroomId: mockClassroomId,
        notes: undefined,
      });
    });
  });

  // =====================================================
  // ENDPOINT 3: DELETE /admin/classrooms/:classroomId/teachers/:teacherId
  // =====================================================
  describe('removeTeacherFromClassroom', () => {
    const removeDto = { force: false };

    it('should remove teacher successfully', async () => {
      const successMessage = {
        message: `Assignment removed successfully for teacher ${mockTeacherId} and classroom ${mockClassroomId}`,
      };

      jest
        .spyOn(service, 'removeClassroomAssignment')
        .mockResolvedValue(successMessage);

      const result = await controller.removeTeacherFromClassroom(
        mockClassroomId,
        mockTeacherId,
        removeDto,
      );

      expect(result).toEqual(successMessage);
      expect(service.removeClassroomAssignment).toHaveBeenCalledWith(
        mockTeacherId,
        mockClassroomId,
        removeDto,
      );
    });

    it('should return 400 if classroom has active students', async () => {
      jest
        .spyOn(service, 'removeClassroomAssignment')
        .mockRejectedValue(
          new BadRequestException(
            'Cannot remove assignment: classroom has 25 active students. Use force=true to override.',
          ),
        );

      await expect(
        controller.removeTeacherFromClassroom(
          mockClassroomId,
          mockTeacherId,
          removeDto,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow removal with force=true', async () => {
      const forcedDto = { force: true };
      const successMessage = { message: 'Assignment removed successfully' };

      jest
        .spyOn(service, 'removeClassroomAssignment')
        .mockResolvedValue(successMessage);

      const result = await controller.removeTeacherFromClassroom(
        mockClassroomId,
        mockTeacherId,
        forcedDto,
      );

      expect(result).toEqual(successMessage);
      expect(service.removeClassroomAssignment).toHaveBeenCalledWith(
        mockTeacherId,
        mockClassroomId,
        forcedDto,
      );
    });

    it('should return 404 if assignment not found', async () => {
      jest
        .spyOn(service, 'removeClassroomAssignment')
        .mockRejectedValue(
          new NotFoundException(
            `Assignment not found for teacher ${mockTeacherId} and classroom ${mockClassroomId}`,
          ),
        );

      await expect(
        controller.removeTeacherFromClassroom(
          mockClassroomId,
          mockTeacherId,
          removeDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // =====================================================
  // ENDPOINT 4: GET /admin/teachers/:teacherId/classrooms
  // =====================================================
  describe('getTeacherClassrooms', () => {
    it('should return teacher with classrooms list', async () => {
      jest
        .spyOn(service, 'getTeacherWithClassrooms')
        .mockResolvedValue(mockTeacherWithClassrooms);

      const result = await controller.getTeacherClassrooms(mockTeacherId);

      expect(result).toEqual(mockTeacherWithClassrooms);
      expect(service.getTeacherWithClassrooms).toHaveBeenCalledWith(
        mockTeacherId,
      );
    });

    it('should return 404 if teacher not found', async () => {
      jest
        .spyOn(service, 'getTeacherWithClassrooms')
        .mockRejectedValue(
          new NotFoundException(`Teacher ${mockTeacherId} not found`),
        );

      await expect(
        controller.getTeacherClassrooms(mockTeacherId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle teacher with no classrooms', async () => {
      const emptyResult = {
        ...mockTeacherWithClassrooms,
        classrooms: [],
      };

      jest
        .spyOn(service, 'getTeacherWithClassrooms')
        .mockResolvedValue(emptyResult);

      const result = await controller.getTeacherClassrooms(mockTeacherId);

      expect(result.classrooms).toHaveLength(0);
    });
  });

  // =====================================================
  // ENDPOINT 5: POST /admin/teachers/:teacherId/classrooms
  // =====================================================
  describe('assignClassroomsToTeacher', () => {
    const assignDto = {
      classroomIds: [mockClassroomId, '770e8400-e29b-41d4-a716-446655440021'],
    };

    const mockBulkResult = {
      successful: [
        {
          classroom_id: mockClassroomId,
          name: 'Matemáticas 6A',
          teacher_id: mockTeacherId,
          role: 'teacher',
          student_count: 25,
          assigned_at: new Date('2025-11-24'),
        },
        {
          classroom_id: '770e8400-e29b-41d4-a716-446655440021',
          name: 'Ciencias 6A',
          teacher_id: mockTeacherId,
          role: 'teacher',
          student_count: 30,
          assigned_at: new Date('2025-11-24'),
        },
      ],
      failed: [],
    };

    it('should assign multiple classrooms successfully', async () => {
      jest
        .spyOn(service, 'bulkAssignClassrooms')
        .mockResolvedValue(mockBulkResult);

      const result = await controller.assignClassroomsToTeacher(
        mockTeacherId,
        assignDto,
      );

      expect(result.assigned).toBe(2);
      expect(result.classrooms).toHaveLength(2);
      expect(result.classrooms[0]).toEqual({
        id: mockClassroomId,
        name: 'Matemáticas 6A',
      });
      expect(service.bulkAssignClassrooms).toHaveBeenCalledWith({
        teacherId: mockTeacherId,
        classroomIds: assignDto.classroomIds,
      });
    });

    it('should handle partial failures', async () => {
      const partialResult = {
        successful: [mockBulkResult.successful[0]],
        failed: [
          {
            classroom_id: '770e8400-e29b-41d4-a716-446655440021',
            reason: 'Classroom not found',
          },
        ],
      };

      jest
        .spyOn(service, 'bulkAssignClassrooms')
        .mockResolvedValue(partialResult);

      const result = await controller.assignClassroomsToTeacher(
        mockTeacherId,
        assignDto,
      );

      expect(result.assigned).toBe(1);
      expect(result.classrooms).toHaveLength(1);
    });

    it('should return 404 if teacher not found', async () => {
      jest
        .spyOn(service, 'bulkAssignClassrooms')
        .mockRejectedValue(
          new NotFoundException(`Teacher ${mockTeacherId} not found`),
        );

      await expect(
        controller.assignClassroomsToTeacher(mockTeacherId, assignDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // =====================================================
  // ENDPOINT 6: GET /admin/classroom-teachers
  // =====================================================
  describe('listAllAssignments', () => {
    const mockPaginatedResult = {
      data: [
        {
          id: 'assignment-1',
          classroom_id: mockClassroomId,
          classroom_name: 'Matemáticas 6A',
          teacher_id: mockTeacherId,
          teacher_name: 'María González',
          role: 'teacher',
          assigned_at: new Date('2025-11-24'),
        },
        {
          id: 'assignment-2',
          classroom_id: '770e8400-e29b-41d4-a716-446655440021',
          classroom_name: 'Ciencias 6A',
          teacher_id: mockTeacherId2,
          teacher_name: 'Juan Pérez',
          role: 'teacher',
          assigned_at: new Date('2025-11-23'),
        },
      ],
      total: 2,
      page: 1,
      limit: 20,
    };

    it('should list all assignments with default pagination', async () => {
      jest
        .spyOn(service, 'listAllAssignmentsPaginated')
        .mockResolvedValue(mockPaginatedResult);

      const result = await controller.listAllAssignments({});

      expect(result).toEqual(mockPaginatedResult);
      expect(service.listAllAssignmentsPaginated).toHaveBeenCalledWith({
        schoolId: undefined,
        page: 1,
        limit: 20,
      });
    });

    it('should support custom pagination', async () => {
      const query = { page: 2, limit: 10 };

      jest
        .spyOn(service, 'listAllAssignmentsPaginated')
        .mockResolvedValue({ ...mockPaginatedResult, page: 2, limit: 10 });

      const result = await controller.listAllAssignments(query);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(service.listAllAssignmentsPaginated).toHaveBeenCalledWith({
        schoolId: undefined,
        page: 2,
        limit: 10,
      });
    });

    it('should filter by schoolId', async () => {
      const schoolId = '123e4567-e89b-12d3-a456-426614174000';
      const query = { schoolId };

      jest
        .spyOn(service, 'listAllAssignmentsPaginated')
        .mockResolvedValue(mockPaginatedResult);

      await controller.listAllAssignments(query);

      expect(service.listAllAssignmentsPaginated).toHaveBeenCalledWith({
        schoolId,
        page: 1,
        limit: 20,
      });
    });
  });

  // =====================================================
  // ENDPOINT 7: POST /admin/classroom-teachers/bulk
  // =====================================================
  describe('bulkAssign', () => {
    const bulkDto = {
      assignments: [
        { teacherId: mockTeacherId, classroomId: mockClassroomId },
        {
          teacherId: mockTeacherId2,
          classroomId: '770e8400-e29b-41d4-a716-446655440021',
        },
      ],
    };

    const mockBulkPairsResult = {
      assigned: 2,
      successful: [
        {
          classroom_id: mockClassroomId,
          name: 'Matemáticas 6A',
          teacher_id: mockTeacherId,
          role: 'teacher',
          student_count: 25,
          assigned_at: new Date('2025-11-24'),
        },
        {
          classroom_id: '770e8400-e29b-41d4-a716-446655440021',
          name: 'Ciencias 6A',
          teacher_id: mockTeacherId2,
          role: 'teacher',
          student_count: 30,
          assigned_at: new Date('2025-11-24'),
        },
      ],
      failed: [],
    };

    it('should bulk assign multiple pairs successfully', async () => {
      jest
        .spyOn(service, 'bulkAssignPairs')
        .mockResolvedValue(mockBulkPairsResult);

      const result = await controller.bulkAssign(bulkDto);

      expect(result.assigned).toBe(2);
      expect(result.successful).toHaveLength(2);
      expect(result.failed).toHaveLength(0);
      expect(service.bulkAssignPairs).toHaveBeenCalledWith(bulkDto.assignments);
    });

    it('should handle partial failures in bulk assign', async () => {
      const partialResult = {
        assigned: 1,
        successful: [mockBulkPairsResult.successful[0]],
        failed: [
          {
            teacherId: mockTeacherId2,
            classroomId: '770e8400-e29b-41d4-a716-446655440021',
            reason: 'Classroom not found',
          },
        ],
      };

      jest.spyOn(service, 'bulkAssignPairs').mockResolvedValue(partialResult);

      const result = await controller.bulkAssign(bulkDto);

      expect(result.assigned).toBe(1);
      expect(result.successful).toHaveLength(1);
      expect(result.failed).toHaveLength(1);
    });

    it('should handle complete failure', async () => {
      const failedResult = {
        assigned: 0,
        successful: [],
        failed: bulkDto.assignments.map((a) => ({
          ...a,
          reason: 'Validation error',
        })),
      };

      jest.spyOn(service, 'bulkAssignPairs').mockResolvedValue(failedResult);

      const result = await controller.bulkAssign(bulkDto);

      expect(result.assigned).toBe(0);
      expect(result.successful).toHaveLength(0);
      expect(result.failed).toHaveLength(2);
    });
  });
});
