import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull, Not } from 'typeorm';
import { Classroom } from '@modules/social/entities/classroom.entity';
import { TeacherClassroom, TeacherClassroomRole } from '@modules/social/entities/teacher-classroom.entity';
import { Profile } from '@modules/auth/entities/profile.entity';
import { UserRole } from '@modules/auth/entities/user-role.entity';
import { GamilityRoleEnum } from '@shared/constants/enums.constants';
import {
  AssignClassroomDto,
  BulkAssignClassroomsDto,
  RemoveAssignmentDto,
  ReassignClassroomDto,
  AvailableClassroomsFiltersDto,
  ClassroomAssignmentResponseDto,
  AssignmentHistoryResponseDto,
  ClassroomListItemDto,
  TeacherListItemDto,
  ListClassroomsQueryDto,
  ListTeachersQueryDto,
} from '../dto/classroom-assignments';

/**
 * ClassroomAssignmentsService
 *
 * @description Service para gestionar asignaciones de aulas a profesores
 * @module admin
 *
 * Funcionalidades:
 * - Asignación individual y masiva de aulas
 * - Remoción de asignaciones con validaciones
 * - Reasignación entre profesores
 * - Consulta de historial y aulas disponibles
 * - Validaciones de roles y estado de aulas
 */
@Injectable()
export class ClassroomAssignmentsService {
  constructor(
    @InjectRepository(Classroom, 'social')
    private readonly classroomRepo: Repository<Classroom>,

    @InjectRepository(TeacherClassroom, 'social')
    private readonly teacherClassroomRepo: Repository<TeacherClassroom>,

    @InjectRepository(Profile, 'auth')
    private readonly profileRepo: Repository<Profile>,

    @InjectRepository(UserRole, 'auth')
    private readonly userRoleRepo: Repository<UserRole>,
  ) {}

  /**
   * Asigna un aula a un profesor
   *
   * @param dto Datos de asignación
   * @returns Información de la asignación creada
   * @throws NotFoundException Si el profesor o aula no existe
   * @throws BadRequestException Si el usuario no es profesor
   * @throws ConflictException Si ya existe la asignación
   */
  async assignClassroomToTeacher(
    dto: AssignClassroomDto,
  ): Promise<ClassroomAssignmentResponseDto> {
    // 1. Validar que el profesor existe y tiene rol de profesor
    await this.validateTeacher(dto.teacherId);

    // 2. Validar que el aula existe y está activa
    const classroom = await this.validateClassroom(dto.classroomId);

    // 3. Verificar que no exista ya una asignación activa
    const existingAssignment = await this.teacherClassroomRepo.findOne({
      where: {
        teacher_id: dto.teacherId,
        classroom_id: dto.classroomId,
      },
    });

    if (existingAssignment) {
      throw new ConflictException(
        `Teacher ${dto.teacherId} is already assigned to classroom ${dto.classroomId}`,
      );
    }

    // 4. Crear la asignación
    const assignment = this.teacherClassroomRepo.create({
      teacher_id: dto.teacherId,
      classroom_id: dto.classroomId,
      role: TeacherClassroomRole.TEACHER,
      assigned_at: new Date(),
    });

    const savedAssignment = await this.teacherClassroomRepo.save(assignment);

    // 5. Retornar respuesta formateada
    return {
      classroom_id: classroom.id,
      name: classroom.name,
      teacher_id: dto.teacherId,
      role: savedAssignment.role,
      student_count: classroom.current_students_count || 0,
      assigned_at: savedAssignment.assigned_at,
    };
  }

  /**
   * Asigna múltiples aulas a un profesor de forma masiva
   *
   * @param dto Datos de asignación masiva
   * @returns Lista de asignaciones creadas y errores
   * @throws NotFoundException Si el profesor no existe
   * @throws BadRequestException Si el usuario no es profesor
   */
  async bulkAssignClassrooms(dto: BulkAssignClassroomsDto): Promise<{
    successful: ClassroomAssignmentResponseDto[];
    failed: Array<{ classroom_id: string; reason: string }>;
  }> {
    // 1. Validar que el profesor existe y tiene rol de profesor
    await this.validateTeacher(dto.teacherId);

    // 2. Obtener todas las aulas solicitadas
    const classrooms = await this.classroomRepo.find({
      where: {
        id: In(dto.classroomIds),
        is_active: true,
      },
    });

    const successful: ClassroomAssignmentResponseDto[] = [];
    const failed: Array<{ classroom_id: string; reason: string }> = [];

    // 3. Procesar cada aula
    for (const classroomId of dto.classroomIds) {
      try {
        const classroom = classrooms.find((c) => c.id === classroomId);

        if (!classroom) {
          failed.push({
            classroom_id: classroomId,
            reason: 'Classroom not found or inactive',
          });
          continue;
        }

        // Verificar si ya existe la asignación
        const existingAssignment = await this.teacherClassroomRepo.findOne({
          where: {
            teacher_id: dto.teacherId,
            classroom_id: classroomId,
          },
        });

        if (existingAssignment) {
          failed.push({
            classroom_id: classroomId,
            reason: 'Assignment already exists',
          });
          continue;
        }

        // Crear la asignación
        const assignment = this.teacherClassroomRepo.create({
          teacher_id: dto.teacherId,
          classroom_id: classroomId,
          role: TeacherClassroomRole.TEACHER,
          assigned_at: new Date(),
        });

        const savedAssignment = await this.teacherClassroomRepo.save(assignment);

        successful.push({
          classroom_id: classroom.id,
          name: classroom.name,
          teacher_id: dto.teacherId,
          role: savedAssignment.role,
          student_count: classroom.current_students_count || 0,
          assigned_at: savedAssignment.assigned_at,
        });
      } catch (error) {
        failed.push({
          classroom_id: classroomId,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { successful, failed };
  }

  /**
   * Remueve la asignación de un aula a un profesor
   *
   * @param teacherId ID del profesor
   * @param classroomId ID del aula
   * @param dto Opciones de remoción
   * @throws NotFoundException Si no existe la asignación
   * @throws BadRequestException Si el aula tiene estudiantes activos
   */
  async removeClassroomAssignment(
    teacherId: string,
    classroomId: string,
    dto: RemoveAssignmentDto,
  ): Promise<{ message: string }> {
    // 1. Buscar la asignación
    const assignment = await this.teacherClassroomRepo.findOne({
      where: {
        teacher_id: teacherId,
        classroom_id: classroomId,
      },
    });

    if (!assignment) {
      throw new NotFoundException(
        `Assignment not found for teacher ${teacherId} and classroom ${classroomId}`,
      );
    }

    // 2. Verificar si el aula tiene estudiantes activos
    const classroom = await this.classroomRepo.findOne({
      where: { id: classroomId },
    });

    if (classroom && classroom.current_students_count > 0 && !dto.force) {
      throw new BadRequestException(
        `Cannot remove assignment: classroom has ${classroom.current_students_count} active students. Use force=true to override.`,
      );
    }

    // 3. Eliminar la asignación
    await this.teacherClassroomRepo.remove(assignment);

    return {
      message: `Assignment removed successfully for teacher ${teacherId} and classroom ${classroomId}`,
    };
  }

  /**
   * Reasigna un aula de un profesor a otro
   *
   * @param dto Datos de reasignación
   * @returns Información de la nueva asignación
   * @throws NotFoundException Si no existe la asignación original
   * @throws BadRequestException Si los profesores no son válidos
   */
  async reassignClassroom(
    dto: ReassignClassroomDto,
  ): Promise<ClassroomAssignmentResponseDto> {
    // 1. Validar ambos profesores
    await this.validateTeacher(dto.fromTeacherId);
    await this.validateTeacher(dto.toTeacherId);

    // 2. Validar el aula
    const classroom = await this.validateClassroom(dto.classroomId);

    // 3. Verificar que existe la asignación original
    const originalAssignment = await this.teacherClassroomRepo.findOne({
      where: {
        teacher_id: dto.fromTeacherId,
        classroom_id: dto.classroomId,
      },
    });

    if (!originalAssignment) {
      throw new NotFoundException(
        `Assignment not found for teacher ${dto.fromTeacherId} and classroom ${dto.classroomId}`,
      );
    }

    // 4. Verificar que el nuevo profesor no esté ya asignado
    const newAssignmentExists = await this.teacherClassroomRepo.findOne({
      where: {
        teacher_id: dto.toTeacherId,
        classroom_id: dto.classroomId,
      },
    });

    if (newAssignmentExists) {
      throw new ConflictException(
        `Teacher ${dto.toTeacherId} is already assigned to classroom ${dto.classroomId}`,
      );
    }

    // 5. Eliminar la asignación original
    await this.teacherClassroomRepo.remove(originalAssignment);

    // 6. Crear la nueva asignación
    const newAssignment = this.teacherClassroomRepo.create({
      teacher_id: dto.toTeacherId,
      classroom_id: dto.classroomId,
      role: originalAssignment.role, // Mantener el mismo rol
      assigned_at: new Date(),
    });

    const savedAssignment = await this.teacherClassroomRepo.save(newAssignment);

    return {
      classroom_id: classroom.id,
      name: classroom.name,
      teacher_id: dto.toTeacherId,
      role: savedAssignment.role,
      student_count: classroom.current_students_count || 0,
      assigned_at: savedAssignment.assigned_at,
    };
  }

  /**
   * Obtiene todas las aulas asignadas a un profesor
   *
   * @param teacherId ID del profesor
   * @returns Lista de aulas asignadas
   */
  async getTeacherClassrooms(
    teacherId: string,
  ): Promise<ClassroomAssignmentResponseDto[]> {
    // 1. Validar que el profesor existe
    await this.validateTeacher(teacherId);

    // 2. Obtener todas las asignaciones del profesor
    const assignments = await this.teacherClassroomRepo.find({
      where: { teacher_id: teacherId },
      relations: ['classroom'],
    });

    // 3. Obtener los detalles de las aulas
    const classroomIds = assignments.map((a) => a.classroom_id);
    const classrooms = await this.classroomRepo.find({
      where: { id: In(classroomIds) },
    });

    // 4. Mapear las respuestas
    return assignments.map((assignment) => {
      const classroom = classrooms.find((c) => c.id === assignment.classroom_id);
      return {
        classroom_id: assignment.classroom_id,
        name: classroom?.name || 'Unknown',
        teacher_id: teacherId,
        role: assignment.role,
        student_count: classroom?.current_students_count || 0,
        assigned_at: assignment.assigned_at,
      };
    });
  }

  /**
   * Obtiene las aulas disponibles (sin asignar o con cupo)
   *
   * @param filters Filtros de búsqueda
   * @returns Lista de aulas disponibles
   */
  async getAvailableClassrooms(
    filters: AvailableClassroomsFiltersDto,
  ): Promise<Classroom[]> {
    const { search, level, activeOnly = true } = filters;

    const queryBuilder = this.classroomRepo.createQueryBuilder('classroom');

    // Filtrar solo aulas activas si se solicita
    if (activeOnly) {
      queryBuilder.where('classroom.is_active = :isActive', { isActive: true });
    }

    // Filtrar por búsqueda de nombre
    if (search) {
      queryBuilder.andWhere('classroom.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    // Filtrar por nivel educativo
    if (level) {
      queryBuilder.andWhere('classroom.grade_level = :level', { level });
    }

    // Ordenar por nombre
    queryBuilder.orderBy('classroom.name', 'ASC');

    return await queryBuilder.getMany();
  }

  /**
   * Obtiene el historial de asignaciones de un aula
   *
   * @param classroomId ID del aula
   * @returns Historial de asignaciones
   */
  async getAssignmentHistory(
    classroomId: string,
  ): Promise<AssignmentHistoryResponseDto[]> {
    // 1. Validar que el aula existe
    await this.validateClassroom(classroomId);

    // 2. Obtener todas las asignaciones (actuales e históricas)
    const assignments = await this.teacherClassroomRepo.find({
      where: { classroom_id: classroomId },
      order: { assigned_at: 'DESC' },
    });

    // 3. Obtener los datos de los profesores
    const teacherIds = assignments.map((a) => a.teacher_id);
    const profiles = await this.profileRepo.find({
      where: { id: In(teacherIds) },
    });

    // 4. Obtener el aula para el nombre
    const classroom = await this.classroomRepo.findOne({
      where: { id: classroomId },
    });

    // 5. Mapear el historial
    return assignments.map((assignment) => {
      const profile = profiles.find((p) => p.id === assignment.teacher_id);
      return {
        classroom_id: classroomId,
        classroom_name: classroom?.name || 'Unknown',
        teacher_id: assignment.teacher_id,
        teacher_name: profile?.full_name || profile?.display_name || 'Unknown',
        action: 'assigned', // Por ahora solo tenemos 'assigned'
        role: assignment.role,
        assigned_at: assignment.assigned_at,
        removed_at: undefined, // TODO: Implementar cuando tengamos soft delete
      };
    });
  }

  /**
   * Valida que un usuario existe y tiene rol de profesor
   *
   * @param teacherId ID del profesor
   * @throws NotFoundException Si el profesor no existe
   * @throws BadRequestException Si el usuario no es profesor
   */
  private async validateTeacher(teacherId: string): Promise<Profile> {
    const profile = await this.profileRepo.findOne({
      where: { id: teacherId },
    });

    if (!profile) {
      throw new NotFoundException(`Teacher ${teacherId} not found`);
    }

    // Verificar que tiene rol de profesor (admin_teacher o super_admin)
    if (
      profile.role !== GamilityRoleEnum.ADMIN_TEACHER &&
      profile.role !== GamilityRoleEnum.SUPER_ADMIN
    ) {
      throw new BadRequestException(
        `User ${teacherId} is not a teacher (role: ${profile.role})`,
      );
    }

    return profile;
  }

  /**
   * Valida que un aula existe y está activa
   *
   * @param classroomId ID del aula
   * @throws NotFoundException Si el aula no existe
   * @throws BadRequestException Si el aula está inactiva
   */
  private async validateClassroom(classroomId: string): Promise<Classroom> {
    const classroom = await this.classroomRepo.findOne({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new NotFoundException(`Classroom ${classroomId} not found`);
    }

    if (!classroom.is_active) {
      throw new BadRequestException(
        `Classroom ${classroomId} is inactive and cannot be assigned`,
      );
    }

    return classroom;
  }

  // =====================================================
  // REST ENDPOINT HELPER METHODS (NEW - US-AE-007)
  // =====================================================

  /**
   * Get all teachers assigned to a classroom
   * Helper method for REST endpoint GET /admin/classrooms/:classroomId/teachers
   *
   * @param classroomId Classroom UUID
   * @returns Classroom info with list of teachers
   */
  async getClassroomWithTeachers(classroomId: string): Promise<{
    classroom: {
      id: string;
      name: string;
      grade: string;
      section: string;
    };
    teachers: Array<{
      id: string;
      full_name: string;
      email: string;
      role: string;
      assigned_at: Date;
    }>;
  }> {
    // 1. Validate classroom exists
    const classroom = await this.validateClassroom(classroomId);

    // 2. Get all assignments for this classroom
    const assignments = await this.teacherClassroomRepo.find({
      where: { classroom_id: classroomId },
      order: { assigned_at: 'DESC' },
    });

    // 3. Get teacher profiles
    const teacherIds = assignments.map((a) => a.teacher_id);
    const teachers =
      teacherIds.length > 0
        ? await this.profileRepo.find({
            where: { id: In(teacherIds) },
          })
        : [];

    // 4. Map to response format
    const teachersData = assignments.map((assignment) => {
      const teacher = teachers.find((t) => t.id === assignment.teacher_id);
      return {
        id: teacher?.id || assignment.teacher_id,
        full_name: teacher?.full_name || teacher?.display_name || 'Unknown',
        email: teacher?.email || '',
        role: teacher?.role || '',
        assigned_at: assignment.assigned_at,
      };
    });

    return {
      classroom: {
        id: classroom.id,
        name: classroom.name,
        grade: classroom.grade_level || '',
        section: classroom.section || '',
      },
      teachers: teachersData,
    };
  }

  /**
   * Get all classrooms assigned to a teacher with teacher info
   * Helper method for REST endpoint GET /admin/teachers/:teacherId/classrooms
   *
   * @param teacherId Teacher UUID
   * @returns Teacher info with list of classrooms
   */
  async getTeacherWithClassrooms(teacherId: string): Promise<{
    teacher: {
      id: string;
      full_name: string;
      email: string;
      role: string;
    };
    classrooms: Array<{
      id: string;
      name: string;
      grade: string;
      section: string;
      student_count: number;
      assigned_at: Date;
    }>;
  }> {
    // 1. Validate teacher exists
    const teacher = await this.validateTeacher(teacherId);

    // 2. Get all assignments for this teacher
    const assignments = await this.teacherClassroomRepo.find({
      where: { teacher_id: teacherId },
      order: { assigned_at: 'DESC' },
    });

    // 3. Get classroom details
    const classroomIds = assignments.map((a) => a.classroom_id);
    const classrooms =
      classroomIds.length > 0
        ? await this.classroomRepo.find({
            where: { id: In(classroomIds) },
          })
        : [];

    // 4. Map to response format
    const classroomsData = assignments.map((assignment) => {
      const classroom = classrooms.find((c) => c.id === assignment.classroom_id);
      return {
        id: assignment.classroom_id,
        name: classroom?.name || 'Unknown',
        grade: classroom?.grade_level || '',
        section: classroom?.section || '',
        student_count: classroom?.current_students_count || 0,
        assigned_at: assignment.assigned_at,
      };
    });

    return {
      teacher: {
        id: teacher.id,
        full_name: teacher.full_name || teacher.display_name || 'Unknown',
        email: teacher.email || '',
        role: teacher.role || '',
      },
      classrooms: classroomsData,
    };
  }

  /**
   * List all classroom-teacher assignments with pagination
   * Helper method for REST endpoint GET /admin/classroom-teachers
   *
   * @param query Query parameters (schoolId, page, limit)
   * @returns Paginated list of assignments
   */
  async listAllAssignmentsPaginated(query: {
    schoolId?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Array<{
      id: string;
      classroom_id: string;
      classroom_name: string;
      teacher_id: string;
      teacher_name: string;
      role: string;
      assigned_at: Date;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // Build query
    const queryBuilder = this.teacherClassroomRepo
      .createQueryBuilder('tc')
      .skip(skip)
      .take(limit)
      .orderBy('tc.assigned_at', 'DESC');

    // Filter by school/tenant if provided (join with classroom to get tenant_id)
    if (query.schoolId) {
      queryBuilder
        .innerJoin('tc.classroom', 'classroom')
        .andWhere('classroom.tenant_id = :schoolId', {
          schoolId: query.schoolId,
        });
    }

    const [assignments, total] = await queryBuilder.getManyAndCount();

    // Get classroom and teacher details
    const classroomIds = assignments.map((a) => a.classroom_id);
    const teacherIds = assignments.map((a) => a.teacher_id);

    const classrooms =
      classroomIds.length > 0
        ? await this.classroomRepo.find({
            where: { id: In(classroomIds) },
          })
        : [];

    const teachers =
      teacherIds.length > 0
        ? await this.profileRepo.find({
            where: { id: In(teacherIds) },
          })
        : [];

    // Map to response format
    const data = assignments.map((assignment) => {
      const classroom = classrooms.find((c) => c.id === assignment.classroom_id);
      const teacher = teachers.find((t) => t.id === assignment.teacher_id);

      return {
        id: assignment.id,
        classroom_id: assignment.classroom_id,
        classroom_name: classroom?.name || 'Unknown',
        teacher_id: assignment.teacher_id,
        teacher_name: teacher?.full_name || teacher?.display_name || 'Unknown',
        role: assignment.role,
        assigned_at: assignment.assigned_at,
      };
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Bulk assign multiple teacher-classroom pairs
   * Helper method for REST endpoint POST /admin/classroom-teachers/bulk
   *
   * @param assignments Array of teacher-classroom pairs
   * @returns Results with successful and failed assignments
   */
  async bulkAssignPairs(
    assignments: Array<{ teacherId: string; classroomId: string }>,
  ): Promise<{
    assigned: number;
    successful: any[];
    failed: Array<{ teacherId: string; classroomId: string; reason: string }>;
  }> {
    const successful: any[] = [];
    const failed: Array<{
      teacherId: string;
      classroomId: string;
      reason: string;
    }> = [];

    for (const pair of assignments) {
      try {
        const result = await this.assignClassroomToTeacher({
          teacherId: pair.teacherId,
          classroomId: pair.classroomId,
        });
        successful.push(result);
      } catch (error) {
        failed.push({
          teacherId: pair.teacherId,
          classroomId: pair.classroomId,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      assigned: successful.length,
      successful,
      failed,
    };
  }

  // =====================================================
  // LIST ENDPOINTS FOR DROPDOWNS (NEW)
  // =====================================================

  /**
   * List all classrooms for dropdown/select
   * Helper method for REST endpoint GET /admin/classrooms/list
   *
   * @param query Query parameters (search, limit, schoolId)
   * @returns Simplified list of classrooms
   */
  async listClassrooms(
    query: ListClassroomsQueryDto,
  ): Promise<ClassroomListItemDto[]> {
    const limit = query.limit || 50;
    const queryBuilder = this.classroomRepo
      .createQueryBuilder('classroom')
      .where('classroom.is_active = :isActive', { isActive: true })
      .orderBy('classroom.name', 'ASC')
      .take(limit);

    // Filter by search (name)
    if (query.search) {
      queryBuilder.andWhere('classroom.name ILIKE :search', {
        search: `%${query.search}%`,
      });
    }

    // Filter by school/tenant if provided
    if (query.schoolId) {
      queryBuilder.andWhere('classroom.tenant_id = :schoolId', {
        schoolId: query.schoolId,
      });
    }

    const classrooms = await queryBuilder.getMany();

    // Map to simplified DTO
    return classrooms.map((classroom) => ({
      id: classroom.id,
      name: classroom.name,
      grade: classroom.grade_level,
      section: classroom.section,
      school_name: undefined, // TODO: Add school join if needed
      student_count: classroom.current_students_count || 0,
    }));
  }

  /**
   * List all teachers for dropdown/select
   * Helper method for REST endpoint GET /admin/teachers/list
   *
   * @param query Query parameters (search, limit, schoolId)
   * @returns Simplified list of teachers
   */
  async listTeachers(
    query: ListTeachersQueryDto,
  ): Promise<TeacherListItemDto[]> {
    const limit = query.limit || 50;
    const queryBuilder = this.profileRepo
      .createQueryBuilder('profile')
      .where('profile.role IN (:...roles)', {
        roles: [GamilityRoleEnum.ADMIN_TEACHER, GamilityRoleEnum.SUPER_ADMIN],
      })
      .orderBy('profile.full_name', 'ASC')
      .take(limit);

    // Filter by search (name or email)
    if (query.search) {
      queryBuilder.andWhere(
        '(profile.full_name ILIKE :search OR profile.display_name ILIKE :search OR profile.email ILIKE :search)',
        {
          search: `%${query.search}%`,
        },
      );
    }

    // Filter by school/tenant if provided
    if (query.schoolId) {
      queryBuilder.andWhere('profile.tenant_id = :schoolId', {
        schoolId: query.schoolId,
      });
    }

    const teachers = await queryBuilder.getMany();

    // Map to simplified DTO
    return teachers.map((teacher) => ({
      id: teacher.id,
      display_name: teacher.full_name || teacher.display_name || 'Unknown',
      email: teacher.email,
      role: teacher.role,
    }));
  }
}
