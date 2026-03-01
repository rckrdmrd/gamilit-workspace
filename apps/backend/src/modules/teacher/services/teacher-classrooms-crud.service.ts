/**
 * Teacher Classrooms CRUD Service
 *
 * @description Service para operaciones CRUD de classrooms desde el portal teacher
 * @module modules/teacher/services/teacher-classrooms-crud
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { Classroom } from '@modules/social/entities/classroom.entity';
import {
  TeacherClassroom,
  TeacherClassroomRole,
} from '@modules/social/entities/teacher-classroom.entity';
import { ClassroomMember } from '@modules/social/entities/classroom-member.entity';
import { Profile } from '@modules/auth/entities/profile.entity';
import { User } from '@modules/auth/entities/user.entity';
import { ModuleProgress } from '@modules/progress/entities/module-progress.entity';
import { ExerciseSubmission } from '@modules/progress/entities/exercise-submission.entity';
import { Module } from '@modules/educational/entities/module.entity';
import { Exercise } from '@modules/educational/entities/exercise.entity';
import { UserStats } from '@modules/gamification/entities/user-stats.entity';
import { ClassroomMemberStatusEnum } from '@shared/constants/enums.constants';
import {
  CreateTeacherClassroomDto,
  UpdateTeacherClassroomDto,
  GetClassroomsQueryDto,
  GetClassroomStudentsQueryDto,
  TeacherClassroomResponseDto,
  TeacherClassroomDetailResponseDto,
  StudentInClassroomDto,
  ClassroomStatsDto,
  TeacherInClassroomDto,
  PaginatedTeacherClassroomsResponseDto,
  PaginatedStudentsResponseDto,
  ClassroomProgressResponseDto,
  ClassroomProgressDataDto,
  ModuleProgressItemDto,
} from '../dto';

/**
 * Service para gestión CRUD de classrooms por teachers
 *
 * @description
 * Implementa operaciones CRUD completas para classrooms desde el portal teacher.
 * Incluye validaciones de permisos (RLS) y multi-tenancy.
 *
 * @features
 * - CRUD completo de classrooms
 * - Filtrado por teacher_id (RLS)
 * - Paginación y búsqueda
 * - Estadísticas de classroom
 * - Gestión de estudiantes y teachers
 */
@Injectable()
export class TeacherClassroomsCrudService {
  constructor(
    @InjectRepository(Classroom, 'social')
    private readonly classroomRepo: Repository<Classroom>,

    @InjectRepository(TeacherClassroom, 'social')
    private readonly teacherClassroomRepo: Repository<TeacherClassroom>,

    @InjectRepository(ClassroomMember, 'social')
    private readonly classroomMemberRepo: Repository<ClassroomMember>,

    @InjectRepository(Profile, 'auth')
    private readonly profileRepo: Repository<Profile>,

    @InjectRepository(User, 'auth')
    private readonly userRepo: Repository<User>,

    @InjectRepository(ModuleProgress, 'progress')
    private readonly moduleProgressRepo: Repository<ModuleProgress>,

    @InjectRepository(ExerciseSubmission, 'progress')
    private readonly exerciseSubmissionRepo: Repository<ExerciseSubmission>,

    @InjectRepository(Module, 'educational')
    private readonly moduleRepo: Repository<Module>,

    @InjectRepository(Exercise, 'educational')
    private readonly exerciseRepo: Repository<Exercise>,

    @InjectRepository(UserStats, 'gamification')
    private readonly userStatsRepo: Repository<UserStats>,

    // FIX-2025-12-18: Inyectar DataSource para raw SQL en cross-schema joins
    // Ver: orchestration/reportes/ANALISIS-ROOT-CAUSE-TYPEORM-CROSSSCHEMA-2025-12-18.md
    @InjectDataSource('progress')
    private readonly dataSource: DataSource,
  ) {}

  // ============================================================================
  // READ OPERATIONS
  // ============================================================================

  /**
   * Obtiene todos los classrooms del teacher autenticado
   *
   * @param teacherId - ID del teacher (profiles.id per DB-125)
   * @param query - Parámetros de búsqueda y filtrado
   * @returns Lista paginada de classrooms
   *
   * @throws NotFoundException si el teacher no existe
   */
  async getClassrooms(
    teacherId: string,
    query: GetClassroomsQueryDto,
  ): Promise<PaginatedTeacherClassroomsResponseDto> {
    const { page = 1, limit = 10, search, status, grade_level, subject } = query;

    // DB-125: teacherId is profiles.id from JWT (req.user.id = profiles.id)
    // Validate teacher exists via profile lookup (not auth.users)
    const teacherProfile = await this.profileRepo.findOne({ where: { id: teacherId } });
    if (!teacherProfile) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }

    // Obtener IDs de classrooms del teacher
    const teacherClassrooms = await this.teacherClassroomRepo.find({
      where: { teacher_id: teacherId },
      select: ['classroom_id'],
    });

    const classroomIds = teacherClassrooms.map((tc) => tc.classroom_id);

    if (classroomIds.length === 0) {
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }

    // Construir query con filtros
    const queryBuilder = this.classroomRepo
      .createQueryBuilder('classroom')
      .where('classroom.id IN (:...classroomIds)', { classroomIds });

    // Filtro de búsqueda (nombre o código)
    if (search) {
      queryBuilder.andWhere(
        '(classroom.name ILIKE :search OR classroom.code ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filtro de estado
    if (status && status !== 'all') {
      if (status === 'active') {
        queryBuilder.andWhere('classroom.is_active = :isActive', { isActive: true });
        queryBuilder.andWhere('classroom.is_archived = :isArchived', { isArchived: false });
      } else if (status === 'inactive') {
        queryBuilder.andWhere('classroom.is_active = :isActive', { isActive: false });
      } else if (status === 'archived') {
        queryBuilder.andWhere('classroom.is_archived = :isArchived', { isArchived: true });
      }
    }

    // Filtro de nivel de grado
    if (grade_level) {
      queryBuilder.andWhere('classroom.grade_level = :gradeLevel', { gradeLevel: grade_level });
    }

    // Filtro de materia
    if (subject) {
      queryBuilder.andWhere('classroom.subject = :subject', { subject });
    }

    // Obtener total de registros
    const total = await queryBuilder.getCount();

    // Paginación
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Ordenar por fecha de creación (más recientes primero)
    queryBuilder.orderBy('classroom.created_at', 'DESC');

    // Ejecutar query
    const classrooms = await queryBuilder.getMany();

    // Mapear a DTO
    const data = classrooms.map((classroom) => this.mapToTeacherClassroomResponseDto(classroom));

    // Calcular paginación
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Obtiene un classroom específico por ID
   *
   * @param classroomId - ID del classroom
   * @param teacherId - ID del teacher (para validación de permisos)
   * @returns Classroom con información detallada
   *
   * @throws NotFoundException si el classroom no existe
   * @throws ForbiddenException si el teacher no tiene acceso
   */
  async getClassroomById(
    classroomId: string,
    teacherId: string,
  ): Promise<TeacherClassroomDetailResponseDto> {
    // Validar que el classroom existe
    const classroom = await this.classroomRepo.findOne({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new NotFoundException(`Classroom with ID ${classroomId} not found`);
    }

    // Validar que el teacher tiene acceso al classroom
    await this.validateTeacherAccess(teacherId, classroomId);

    return this.mapToTeacherClassroomDetailResponseDto(classroom);
  }

  /**
   * Obtiene estudiantes de un classroom
   *
   * FIX-2025-12-18: Corregido para que búsqueda se aplique ANTES de paginación
   * PROBLEMA ANTERIOR: La búsqueda se aplicaba en memoria DESPUÉS de paginar,
   * causando que usuarios en página 2 no aparezcan al buscar desde página 1
   * SOLUCIÓN: Usar raw SQL para aplicar filtros ANTES de paginar, luego calcular total correcto
   * Ver: orchestration/reportes/PLAN-CORRECCION-TEACHER-MONITORING-2025-12-18.md
   *
   * @param classroomId - ID del classroom
   * @param teacherId - ID del teacher (para validación)
   * @param query - Parámetros de búsqueda y filtrado
   * @returns Lista paginada de estudiantes
   *
   * @throws NotFoundException si el classroom no existe
   * @throws ForbiddenException si el teacher no tiene acceso
   */
  async getClassroomStudents(
    classroomId: string,
    teacherId: string,
    query: GetClassroomStudentsQueryDto,
  ): Promise<PaginatedStudentsResponseDto> {
    // Validar acceso
    await this.validateTeacherAccess(teacherId, classroomId);

    const { page = 1, limit = 100, search, status, sort_by = 'name', sort_order = 'asc' } = query;

    // FIX: Obtener estudiantes con búsqueda aplicada ANTES de paginación usando raw SQL
    const skip = (page - 1) * limit;
    const { students: members, total } = await this.getStudentsWithSearch(
      classroomId,
      search,
      status,
      skip,
      limit,
    );

    if (members.length === 0) {
      // No hay estudiantes que coincidan con los filtros
      const totalPages = Math.ceil(total / limit);
      return {
        data: [],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    }

    // Obtener IDs de estudiantes
    const studentIds = members.map((m) => m.student_id);

    // Obtener datos en paralelo: progreso, gamificacion, actividad actual y total de ejercicios
    const [progressData, userStatsData, currentActivityData, totalExercisesCount] = await Promise.all([
      this.getStudentsProgress(studentIds),
      this.getStudentsUserStats(studentIds),
      this.getStudentsCurrentActivity(studentIds),
      this.getTotalExercisesForClassroom(),
    ]);

    // Mapear a DTO con todos los datos (members ya incluye profile y user info)
    const data = members.map((member) => {
      const progress = progressData.get(member.student_id);
      const userStats = userStatsData.get(member.student_id);
      const currentActivity = currentActivityData.get(member.student_id);

      // Reconstruir Profile y User desde los datos del raw SQL
      // FIX: Convertir null a undefined para compatibilidad con TypeScript
      const profile: Partial<Profile> = {
        user_id: member.student_id,
        first_name: member.first_name ?? undefined,
        last_name: member.last_name ?? undefined,
        avatar_url: member.avatar_url ?? undefined,
      };

      const user: Partial<User> = {
        id: member.student_id,
        email: member.email ?? undefined,
      };

      // Reconstruir ClassroomMember desde los datos del raw SQL
      // FIX-2026-01-19: Cast status from raw SQL string to enum
      const classroomMember: Partial<ClassroomMember> = {
        student_id: member.student_id,
        classroom_id: classroomId,
        status: member.status as ClassroomMemberStatusEnum,
        enrollment_date: member.enrollment_date,
        attendance_percentage: member.attendance_percentage ?? undefined,
        teacher_notes: member.teacher_notes ?? undefined,
        updated_at: member.updated_at,
      };

      return this.mapToStudentInClassroomDto(
        classroomMember as ClassroomMember,
        profile as Profile,
        user as User,
        progress,
        userStats,
        currentActivity,
        totalExercisesCount,
      );
    });

    // Aplicar ordenamiento en memoria (después de tener todos los datos calculados)
    if (sort_by === 'name') {
      data.sort((a, b) => {
        const comparison = a.full_name.localeCompare(b.full_name);
        return sort_order === 'asc' ? comparison : -comparison;
      });
    } else if (sort_by === 'progress') {
      data.sort((a, b) => {
        const aProgress = a.progress_percentage || 0;
        const bProgress = b.progress_percentage || 0;
        const comparison = aProgress - bProgress;
        return sort_order === 'asc' ? comparison : -comparison;
      });
    } else if (sort_by === 'score') {
      data.sort((a, b) => {
        const aScore = a.score_average || 0;
        const bScore = b.score_average || 0;
        const comparison = aScore - bScore;
        return sort_order === 'asc' ? comparison : -comparison;
      });
    } else if (sort_by === 'last_activity') {
      data.sort((a, b) => {
        const aDate = a.last_activity ? new Date(a.last_activity).getTime() : 0;
        const bDate = b.last_activity ? new Date(b.last_activity).getTime() : 0;
        const comparison = aDate - bDate;
        return sort_order === 'asc' ? comparison : -comparison;
      });
    }

    // Calcular paginación con el total correcto (después de aplicar búsqueda)
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Obtiene estadísticas de un classroom
   *
   * @param classroomId - ID del classroom
   * @param teacherId - ID del teacher (para validación)
   * @returns Estadísticas del classroom
   *
   * @throws NotFoundException si el classroom no existe
   * @throws ForbiddenException si el teacher no tiene acceso
   */
  async getClassroomStats(classroomId: string, teacherId: string): Promise<ClassroomStatsDto> {
    // Validar acceso
    await this.validateTeacherAccess(teacherId, classroomId);

    // Total de estudiantes
    const totalStudents = await this.classroomMemberRepo.count({
      where: { classroom_id: classroomId },
    });

    // Estudiantes activos
    const activeStudents = await this.classroomMemberRepo.count({
      where: { classroom_id: classroomId, status: ClassroomMemberStatusEnum.ACTIVE },
    });

    // Obtener IDs de estudiantes activos
    const activeMembers = await this.classroomMemberRepo.find({
      where: { classroom_id: classroomId, status: ClassroomMemberStatusEnum.ACTIVE },
      select: ['student_id'],
    });

    const activeStudentIds = activeMembers.map((m) => m.student_id);

    // Calcular estadísticas de progreso
    let avgProgress = 0;
    let completionRate = 0;
    let avgScore = 0;

    if (activeStudentIds.length > 0) {
      const progressStats = await this.calculateProgressStats(activeStudentIds);
      avgProgress = progressStats.avgProgress;
      completionRate = progressStats.completionRate;
      avgScore = progressStats.avgScore;
    }

    // Calcular asistencia promedio (usando attendance_percentage de members)
    const attendanceResult = await this.classroomMemberRepo
      .createQueryBuilder('cm')
      .select('AVG(cm.attendance_percentage)', 'avg_attendance')
      .where('cm.classroom_id = :classroomId', { classroomId })
      .andWhere('cm.status = :status', { status: ClassroomMemberStatusEnum.ACTIVE })
      .getRawOne();

    const avgAttendance = parseFloat(attendanceResult?.avg_attendance || '0');

    // TASK-2026-01-19-004: Calcular engagement_rate
    // engagement_rate = (estudiantes con submissions en últimos 7 días / total) * 100
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Contar estudiantes únicos con submissions en los últimos 7 días
    let activeStudents7d = 0;
    if (activeStudentIds.length > 0) {
      const submissionsResult = await this.exerciseSubmissionRepo
        .createQueryBuilder('sub')
        .select('COUNT(DISTINCT sub.user_id)', 'count')
        .where('sub.user_id IN (:...studentIds)', { studentIds: activeStudentIds })
        .andWhere('sub.submitted_at >= :weekAgo', { weekAgo })
        .getRawOne();

      activeStudents7d = parseInt(submissionsResult?.count || '0', 10);
    }

    const engagementRate =
      totalStudents > 0 ? Math.round((activeStudents7d / totalStudents) * 100) : 0;

    return {
      classroom_id: classroomId,
      total_students: totalStudents,
      active_students: activeStudents,
      avg_progress: Math.round(avgProgress * 10) / 10,
      completion_rate: Math.round(completionRate * 10) / 10,
      avg_score: Math.round(avgScore * 10) / 10,
      avg_attendance: Math.round(avgAttendance * 10) / 10,
      engagement_rate: engagementRate,
    };
  }

  /**
   * Obtiene teachers asignados a un classroom
   *
   * @param classroomId - ID del classroom
   * @param teacherId - ID del teacher solicitante (para validación)
   * @returns Lista de teachers en el classroom
   *
   * @throws NotFoundException si el classroom no existe
   * @throws ForbiddenException si el teacher no tiene acceso
   */
  async getClassroomTeachers(
    classroomId: string,
    teacherId: string,
  ): Promise<TeacherInClassroomDto[]> {
    // Validar acceso
    await this.validateTeacherAccess(teacherId, classroomId);

    // Obtener relaciones teacher-classroom
    const teacherClassrooms = await this.teacherClassroomRepo.find({
      where: { classroom_id: classroomId },
    });

    if (teacherClassrooms.length === 0) {
      return [];
    }

    // Obtener IDs de teachers
    const teacherIds = teacherClassrooms.map((tc) => tc.teacher_id);

    // DB-125: teacherIds are profiles.id (teacher_classrooms.teacher_id = profiles.id)
    const profiles = await this.profileRepo.find({
      where: { id: In(teacherIds) },
    });

    // Derive real auth.users.id from profiles to fetch user records
    const userIds = profiles.map((p) => p.user_id).filter(Boolean);
    const users = userIds.length > 0
      ? await this.userRepo.find({ where: { id: In(userIds) } })
      : [];

    // Mapear a DTO
    return teacherClassrooms.map((tc) => {
      const profile = profiles.find((p) => p.id === tc.teacher_id);
      const user = profile ? users.find((u) => u.id === profile.user_id) : undefined;
      return this.mapToTeacherInClassroomDto(tc, profile, user);
    });
  }

  /**
   * Obtiene el progreso completo de un classroom
   *
   * @param classroomId - ID del classroom
   * @param teacherId - ID del teacher (para validación)
   * @returns Progreso del classroom con datos generales y progreso por módulo
   *
   * @throws NotFoundException si el classroom no existe
   * @throws ForbiddenException si el teacher no tiene acceso
   */
  async getClassroomProgress(
    classroomId: string,
    teacherId: string,
  ): Promise<ClassroomProgressResponseDto> {
    // Validar que el classroom existe y el teacher tiene acceso
    const classroom = await this.classroomRepo.findOne({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new NotFoundException(`Classroom with ID ${classroomId} not found`);
    }

    await this.validateTeacherAccess(teacherId, classroomId);

    // Obtener estudiantes del classroom
    const members = await this.classroomMemberRepo.find({
      where: { classroom_id: classroomId },
    });

    const studentIds = members.map((m) => m.student_id);
    const studentCount = studentIds.length;

    // Si no hay estudiantes, retornar respuesta con valores en 0
    if (studentCount === 0) {
      return {
        classroomData: {
          id: classroomId,
          name: classroom.name,
          student_count: 0,
          active_students: 0,
          average_completion: 0,
          average_score: 0,
          total_exercises: 0,
          completed_exercises: 0,
        },
        moduleProgress: [],
      };
    }

    // Calcular estudiantes activos (con actividad en últimos 7 días)
    // FIX-2026-01-08: Corregido para usar COUNT(DISTINCT) con raw SQL
    // PROBLEMA ANTERIOR: .getCount() NO respeta GROUP BY en TypeORM, contaba registros en lugar de usuarios únicos
    // SOLUCIÓN: Usar raw SQL con COUNT(DISTINCT user_id) para contar usuarios únicos correctamente
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // FIX-B2-2026-01-08: Eliminado filtro OR classroom_id IS NULL
    // Ahora solo cuenta estudiantes activos en el classroom especifico
    const activeStudentsResult = await this.dataSource.query(`
      SELECT COUNT(DISTINCT mp.user_id) as active_count
      FROM progress_tracking.module_progress mp
      WHERE mp.user_id = ANY($1)
        AND mp.last_accessed_at >= $2
        AND mp.classroom_id = $3
    `, [studentIds, sevenDaysAgo, classroomId]);
    const activeStudentsCount = parseInt(activeStudentsResult[0]?.active_count || '0');

    // Obtener todos los módulos publicados (disponibles para todos los classrooms)
    // NOTA: Actualmente no existe tabla classroom_modules, todos los módulos publicados están disponibles
    const allModules = await this.moduleRepo.find({
      where: { is_published: true },
      order: { order_index: 'ASC' },
    });

    // Calcular total de ejercicios disponibles
    const totalExercisesCount = await this.exerciseRepo
      .createQueryBuilder('e')
      .where('e.module_id IN (:...moduleIds)', {
        moduleIds: allModules.map((m) => m.id),
      })
      .andWhere('e.is_active = :isActive', { isActive: true })
      .getCount();

    // Calcular ejercicios completados por al menos 1 estudiante
    const completedExercisesResult = await this.exerciseSubmissionRepo
      .createQueryBuilder('es')
      .select('COUNT(DISTINCT es.exercise_id)', 'count')
      .where('es.user_id IN (:...studentIds)', { studentIds })
      .andWhere('es.is_correct = :isCorrect', { isCorrect: true })
      .getRawOne();

    const completedExercisesCount = parseInt(completedExercisesResult?.count || '0');

    // Calcular promedio de completación de ejercicios por estudiante
    // FIX-2026-01-08: Corregido para:
    // 1. Filtrar por classroom_id (antes no se filtraba, mezclando datos de múltiples classrooms)
    // 2. Calcular primero promedio por usuario, luego promedio global (antes promediaba registros directamente)
    // PROBLEMA ANTERIOR: Si estudiante tenía 3 módulos (100%, 50%, 0%) y otro 1 módulo (100%),
    // el promedio era (100+50+0+100)/4=62.5% en lugar del correcto (50%+100%)/2=75%
    // FIX-B2-2026-01-08: Eliminado filtro OR classroom_id IS NULL
    // Ahora solo promedia datos del classroom especifico
    const completionStats = await this.dataSource.query(`
      SELECT
        AVG(user_avg_completion) as avg_completion,
        AVG(user_avg_score) as avg_score
      FROM (
        SELECT
          mp.user_id,
          AVG(mp.progress_percentage) as user_avg_completion,
          AVG(mp.average_score) as user_avg_score
        FROM progress_tracking.module_progress mp
        WHERE mp.user_id = ANY($1)
          AND mp.classroom_id = $2
        GROUP BY mp.user_id
      ) user_stats
    `, [studentIds, classroomId]);

    const averageCompletion = parseFloat(completionStats[0]?.avg_completion || '0');
    const averageScore = parseFloat(completionStats[0]?.avg_score || '0');

    // Construir classroomData
    const classroomData: ClassroomProgressDataDto = {
      id: classroomId,
      name: classroom.name,
      student_count: studentCount,
      active_students: activeStudentsCount,
      average_completion: Math.round(averageCompletion * 10) / 10,
      average_score: Math.round(averageScore * 10) / 10,
      total_exercises: totalExercisesCount,
      completed_exercises: completedExercisesCount,
    };

    // Calcular progreso por módulo
    const moduleProgress: ModuleProgressItemDto[] = [];

    for (const module of allModules) {
      // Obtener progreso de estudiantes en este módulo
      // FIX-2026-01-08: Agregado filtro por classroom_id para evitar mezclar datos de múltiples classrooms
      const moduleProgressData = await this.moduleProgressRepo
        .createQueryBuilder('mp')
        .select('COUNT(*)', 'total_students')
        .addSelect(
          'SUM(CASE WHEN mp.status = :completed THEN 1 ELSE 0 END)',
          'completed_count',
        )
        .addSelect('AVG(mp.progress_percentage)', 'avg_progress')
        .addSelect('AVG(mp.average_score)', 'avg_score')
        .addSelect('AVG(EXTRACT(EPOCH FROM mp.time_spent) / 60)', 'avg_time_minutes')
        .where('mp.user_id IN (:...studentIds)', { studentIds })
        .andWhere('mp.module_id = :moduleId', { moduleId: module.id })
        .andWhere('mp.classroom_id = :classroomId', { classroomId })
        .setParameter('completed', 'completed')
        .getRawOne();

      const _totalStudentsInModule = parseInt(moduleProgressData?.total_students || '0');
      const completedCount = parseInt(moduleProgressData?.completed_count || '0');
      const _avgProgress = parseFloat(moduleProgressData?.avg_progress || '0');
      const avgScore = parseFloat(moduleProgressData?.avg_score || '0');
      const avgTimeMinutes = parseFloat(moduleProgressData?.avg_time_minutes || '0');

      // Calcular porcentaje de completación (estudiantes que completaron / total estudiantes)
      const completionPercentage =
        studentCount > 0 ? (completedCount / studentCount) * 100 : 0;

      moduleProgress.push({
        module_id: module.id,
        module_name: module.title,
        completion_percentage: Math.round(completionPercentage * 10) / 10,
        average_score: Math.round(avgScore * 10) / 10,
        students_completed: completedCount,
        students_total: studentCount,
        average_time_minutes: Math.round(avgTimeMinutes * 10) / 10,
      });
    }

    return {
      classroomData,
      moduleProgress,
    };
  }

  // ============================================================================
  // CREATE OPERATION
  // ============================================================================

  /**
   * Crea un nuevo classroom
   *
   * @param teacherId - ID del teacher que crea el classroom
   * @param dto - Datos del classroom a crear
   * @returns Classroom creado
   *
   * @throws ConflictException si el código ya existe
   * @throws NotFoundException si el teacher no existe
   */
  async createClassroom(
    teacherId: string,
    dto: CreateTeacherClassroomDto,
  ): Promise<TeacherClassroomResponseDto> {
    // DB-125: teacherId is profiles.id from JWT (req.user.id = profiles.id)
    // Single lookup — reuse result for both validation and tenant_id extraction
    let teacherProfile = await this.profileRepo.findOne({ where: { id: teacherId } });
    if (!teacherProfile) {
      // Fallback: teacherId might be auth.users.id
      teacherProfile = await this.profileRepo.findOne({ where: { user_id: teacherId } });
    }
    if (!teacherProfile) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }
    if (!teacherProfile.tenant_id) {
      throw new BadRequestException('Teacher profile tenant_id not found');
    }

    // Validar que el código no esté en uso (si se proporciona)
    if (dto.code) {
      const existingClassroom = await this.classroomRepo.findOne({
        where: { code: dto.code },
      });

      if (existingClassroom) {
        throw new ConflictException(`Classroom with code "${dto.code}" already exists`);
      }
    }

    // Desestructurar DTO para manejar settings separadamente
    // settings en DTO es ClassroomSettingsDto, pero Entity espera Record<string, unknown>
    const { settings, ...classroomData } = dto;

    // Crear classroom con conversión de tipos correcta
    const classroom = this.classroomRepo.create({
      ...classroomData,
      settings: (settings as Record<string, unknown>) ?? {},
      teacher_id: teacherId,
      tenant_id: teacherProfile.tenant_id,
      current_students_count: 0,
      is_active: true,
      is_archived: false,
    });

    const savedClassroom = await this.classroomRepo.save(classroom);

    // FIX-2026-01-08: El trigger trg_sync_teacher_classroom_on_insert
    // ahora crea automaticamente el registro en teacher_classrooms con rol 'owner'
    // cuando se inserta un nuevo classroom. El codigo anterior fue eliminado
    // para evitar errores de clave duplicada.
    // Ver: social_features/triggers/26-trg_sync_teacher_classroom.sql

    return this.mapToTeacherClassroomResponseDto(savedClassroom);
  }

  // ============================================================================
  // UPDATE OPERATION
  // ============================================================================

  /**
   * Actualiza un classroom existente
   *
   * @param classroomId - ID del classroom
   * @param teacherId - ID del teacher que actualiza
   * @param dto - Datos a actualizar
   * @returns Classroom actualizado
   *
   * @throws NotFoundException si el classroom no existe
   * @throws ForbiddenException si el teacher no tiene acceso
   * @throws ConflictException si el código ya existe
   */
  async updateClassroom(
    classroomId: string,
    teacherId: string,
    dto: UpdateTeacherClassroomDto,
  ): Promise<TeacherClassroomResponseDto> {
    // Validar que el classroom existe
    const classroom = await this.classroomRepo.findOne({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new NotFoundException(`Classroom with ID ${classroomId} not found`);
    }

    // Validar que el teacher tiene acceso (owner o teacher)
    await this.validateTeacherAccess(teacherId, classroomId);

    // Validar que el código no esté en uso (si se cambia)
    if (dto.code && dto.code !== classroom.code) {
      const existingClassroom = await this.classroomRepo.findOne({
        where: { code: dto.code },
      });

      if (existingClassroom) {
        throw new ConflictException(`Classroom with code "${dto.code}" already exists`);
      }
    }

    // Actualizar campos
    Object.assign(classroom, dto);

    const updatedClassroom = await this.classroomRepo.save(classroom);

    return this.mapToTeacherClassroomResponseDto(updatedClassroom);
  }

  // ============================================================================
  // DELETE OPERATION
  // ============================================================================

  /**
   * Elimina (soft delete) un classroom
   *
   * @param classroomId - ID del classroom
   * @param teacherId - ID del teacher que elimina
   * @returns Resultado de la operación
   *
   * @throws NotFoundException si el classroom no existe
   * @throws ForbiddenException si el teacher no tiene acceso
   * @throws BadRequestException si el classroom tiene estudiantes activos
   */
  async deleteClassroom(
    classroomId: string,
    teacherId: string,
  ): Promise<{ success: boolean; message: string }> {
    // Validar que el classroom existe
    const classroom = await this.classroomRepo.findOne({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new NotFoundException(`Classroom with ID ${classroomId} not found`);
    }

    // Validar que el teacher tiene acceso (owner)
    const teacherClassroom = await this.teacherClassroomRepo.findOne({
      where: { teacher_id: teacherId, classroom_id: classroomId },
    });

    if (!teacherClassroom || teacherClassroom.role !== TeacherClassroomRole.OWNER) {
      throw new ForbiddenException('Only the classroom owner can delete it');
    }

    // Validar que no tenga estudiantes activos
    const activeStudents = await this.classroomMemberRepo.count({
      where: { classroom_id: classroomId, status: ClassroomMemberStatusEnum.ACTIVE },
    });

    if (activeStudents > 0) {
      throw new BadRequestException(
        `Cannot delete classroom with ${activeStudents} active students. Please remove or transfer students first.`,
      );
    }

    // Soft delete: marcar como archivado e inactivo
    classroom.is_archived = true;
    classroom.is_active = false;

    await this.classroomRepo.save(classroom);

    return {
      success: true,
      message: `Classroom "${classroom.name}" has been archived successfully`,
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Obtiene estudiantes con búsqueda aplicada ANTES de paginación (raw SQL)
   *
   * FIX-2025-12-18: Nuevo método que usa raw SQL para cross-schema joins eficientes
   * TypeORM QueryBuilder NO soporta cross-schema joins correctamente
   * Ver: orchestration/reportes/ANALISIS-ROOT-CAUSE-TYPEORM-CROSSSCHEMA-2025-12-18.md
   *
   * @private
   * @param classroomId - ID del classroom
   * @param search - Término de búsqueda (nombre o email)
   * @param status - Filtro de estado (active, inactive, suspended, all)
   * @param skip - Número de registros a omitir (paginación)
   * @param limit - Número de registros a retornar
   * @returns Estudiantes filtrados y total de registros (después de aplicar búsqueda)
   */
  private async getStudentsWithSearch(
    classroomId: string,
    search: string | undefined,
    status: string | undefined,
    skip: number,
    limit: number,
  ): Promise<{
    students: Array<{
      student_id: string;
      status: string;
      enrollment_date: Date;
      attendance_percentage: number | null;
      teacher_notes: string | null;
      updated_at: Date;
      first_name: string | null;
      last_name: string | null;
      avatar_url: string | null;
      email: string | null;
    }>;
    total: number;
  }> {
    // Query para contar total (con filtros aplicados)
    const countSql = `
      SELECT COUNT(*) as total
      FROM social_features.classroom_members cm
      LEFT JOIN auth_management.profiles p ON p.id = cm.student_id
      LEFT JOIN auth.users u ON u.id = p.user_id
      WHERE cm.classroom_id = $1
        AND ($2::text IS NULL OR $2 = ''
             OR LOWER(COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '')) LIKE LOWER('%' || $2 || '%')
             OR LOWER(COALESCE(u.email, '')) LIKE LOWER('%' || $2 || '%'))
        AND ($3::text IS NULL OR $3 = 'all' OR cm.status = $3)
    `;

    // Query para obtener estudiantes (con filtros y paginación)
    const studentsSql = `
      SELECT
        cm.student_id,
        cm.status,
        cm.enrollment_date,
        cm.attendance_percentage,
        cm.teacher_notes,
        cm.updated_at,
        p.first_name,
        p.last_name,
        p.avatar_url,
        u.email
      FROM social_features.classroom_members cm
      LEFT JOIN auth_management.profiles p ON p.id = cm.student_id
      LEFT JOIN auth.users u ON u.id = p.user_id
      WHERE cm.classroom_id = $1
        AND ($2::text IS NULL OR $2 = ''
             OR LOWER(COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '')) LIKE LOWER('%' || $2 || '%')
             OR LOWER(COALESCE(u.email, '')) LIKE LOWER('%' || $2 || '%'))
        AND ($3::text IS NULL OR $3 = 'all' OR cm.status = $3)
      ORDER BY COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '')
      LIMIT $4 OFFSET $5
    `;

    // Preparar parámetros (manejar undefined como null)
    const searchParam = search || null;
    const statusParam = status || 'all';

    // Ejecutar queries en paralelo
    const [countResult, studentsResult] = await Promise.all([
      this.dataSource.query(countSql, [classroomId, searchParam, statusParam]),
      this.dataSource.query(studentsSql, [classroomId, searchParam, statusParam, limit, skip]),
    ]);

    const total = parseInt(countResult[0]?.total || '0');

    return {
      students: studentsResult,
      total,
    };
  }

  /**
   * Valida que un teacher tenga acceso a un classroom
   *
   * @private
   */
  private async validateTeacherAccess(teacherId: string, classroomId: string): Promise<void> {
    const teacherClassroom = await this.teacherClassroomRepo.findOne({
      where: { teacher_id: teacherId, classroom_id: classroomId },
    });

    if (!teacherClassroom) {
      throw new ForbiddenException('You do not have access to this classroom');
    }
  }

  /**
   * Obtiene progreso de estudiantes
   *
   * @private
   */
  private async getStudentsProgress(
    studentIds: string[],
  ): Promise<Map<string, { progress: number; score: number }>> {
    if (studentIds.length === 0) {
      return new Map();
    }

    const progressData = await this.moduleProgressRepo
      .createQueryBuilder('mp')
      .select('mp.user_id', 'user_id')
      .addSelect('AVG(mp.progress_percentage)', 'avg_progress')
      .addSelect('AVG(mp.average_score)', 'avg_score')  // Fixed: score_percentage → average_score (GAP-ST-001)
      .where('mp.user_id IN (:...studentIds)', { studentIds })
      .groupBy('mp.user_id')
      .getRawMany();

    const resultMap = new Map<string, { progress: number; score: number }>();

    progressData.forEach((row) => {
      resultMap.set(row.user_id, {
        progress: parseFloat(row.avg_progress || '0'),
        score: parseFloat(row.avg_score || '0'),
      });
    });

    return resultMap;
  }

  /**
   * Obtiene datos de gamificación de UserStats para estudiantes
   * CORR-2025-12-18: Nueva función para obtener datos de gamificación
   *
   * @private
   */
  private async getStudentsUserStats(
    studentIds: string[],
  ): Promise<Map<string, {
    ml_coins: number;
    current_rank: string;
    achievements_count: number;
    exercises_completed: number;
    time_spent_minutes: number;
    last_activity_at: Date | null;
  }>> {
    if (studentIds.length === 0) {
      return new Map();
    }

    const statsData = await this.userStatsRepo.find({
      where: { user_id: In(studentIds) },
      select: [
        'user_id',
        'ml_coins',
        'current_rank',
        'achievements_earned',
        'exercises_completed',
        'total_time_spent',
        'last_activity_at',
      ],
    });

    const resultMap = new Map<string, {
      ml_coins: number;
      current_rank: string;
      achievements_count: number;
      exercises_completed: number;
      time_spent_minutes: number;
      last_activity_at: Date | null;
    }>();

    statsData.forEach((stats) => {
      // Convertir interval total_time_spent a minutos
      // El formato es "HH:MM:SS" o "X days HH:MM:SS"
      let timeMinutes = 0;
      if (stats.total_time_spent) {
        const timeStr = String(stats.total_time_spent);
        // Parsear formato de interval PostgreSQL
        if (timeStr.includes('day')) {
          const dayMatch = timeStr.match(/(\d+)\s*day/);
          const days = dayMatch ? parseInt(dayMatch[1]) : 0;
          timeMinutes += days * 24 * 60;
        }
        const timeMatch = timeStr.match(/(\d+):(\d+):(\d+)/);
        if (timeMatch) {
          timeMinutes += parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
        }
      }

      resultMap.set(stats.user_id, {
        ml_coins: stats.ml_coins || 0,
        current_rank: stats.current_rank || 'Ajaw',
        achievements_count: stats.achievements_earned || 0,
        exercises_completed: stats.exercises_completed || 0,
        time_spent_minutes: timeMinutes,
        last_activity_at: stats.last_activity_at || null,
      });
    });

    return resultMap;
  }

  /**
   * Obtiene la actividad actual (módulo y ejercicio) de los estudiantes
   *
   * FIX-2025-12-18: Corregido para usar raw SQL en lugar de TypeORM QueryBuilder
   * PROBLEMA ANTERIOR: .innerJoin('schema.table', ...) NO funciona en TypeORM QueryBuilder
   * SOLUCION: Usar raw SQL con this.dataSource.query() para cross-schema joins
   * Ver: orchestration/reportes/ANALISIS-ROOT-CAUSE-TYPEORM-CROSSSCHEMA-2025-12-18.md
   *
   * @private
   */
  private async getStudentsCurrentActivity(
    studentIds: string[],
  ): Promise<Map<string, { current_module: string | null; current_exercise: string | null }>> {
    if (studentIds.length === 0) {
      return new Map();
    }

    // FIX: Usar raw SQL para cross-schema joins (progress_tracking -> educational_content)
    // TypeORM QueryBuilder NO soporta .innerJoin('schema.table', ...) directamente
    const sql = `
      SELECT DISTINCT ON (es.user_id)
        es.user_id,
        e.title as exercise_title,
        m.title as module_title
      FROM progress_tracking.exercise_submissions es
      LEFT JOIN educational_content.exercises e ON e.id = es.exercise_id
      LEFT JOIN educational_content.modules m ON m.id = e.module_id
      WHERE es.user_id = ANY($1)
      ORDER BY es.user_id, es.submitted_at DESC
    `;

    const latestSubmissions = await this.dataSource.query(sql, [studentIds]);

    const resultMap = new Map<string, { current_module: string | null; current_exercise: string | null }>();

    // Inicializar todos los estudiantes con valores null
    studentIds.forEach(id => {
      resultMap.set(id, { current_module: null, current_exercise: null });
    });

    // Actualizar con los datos obtenidos
    latestSubmissions.forEach((row: { user_id: string; module_title: string | null; exercise_title: string | null }) => {
      resultMap.set(row.user_id, {
        current_module: row.module_title || null,
        current_exercise: row.exercise_title || null,
      });
    });

    return resultMap;
  }

  /**
   * Obtiene el total de ejercicios activos disponibles
   * Cuenta todos los ejercicios activos de módulos publicados
   *
   * FIX-2026-01-08: Corregido para usar raw SQL en lugar de TypeORM QueryBuilder
   * PROBLEMA ANTERIOR: .innerJoin('e.module', 'm') fallaba porque la entidad Exercise
   * NO tiene una relación TypeORM definida hacia Module (solo tiene module_id como columna)
   * SOLUCION: Usar raw SQL con this.dataSource.query() para el join
   * Ver: orchestration/reportes/CORRECCION-ERRORES-RUNTIME-2026-01-07.md
   *
   * @private
   */
  private async getTotalExercisesForClassroom(): Promise<number> {
    // FIX: Usar raw SQL para join entre exercises y modules
    // TypeORM QueryBuilder NO soporta .innerJoin('e.module', ...) sin relación definida
    const sql = `
      SELECT COUNT(*) as count
      FROM educational_content.exercises e
      INNER JOIN educational_content.modules m ON m.id = e.module_id
      WHERE e.is_active = true
        AND m.is_published = true
    `;

    const result = await this.dataSource.query(sql);
    return parseInt(result[0]?.count || '0') || 50; // Fallback to 50 if no exercises found
  }

  /**
   * Calcula estadísticas de progreso
   *
   * @private
   */
  private async calculateProgressStats(
    studentIds: string[],
  ): Promise<{ avgProgress: number; completionRate: number; avgScore: number }> {
    const stats = await this.moduleProgressRepo
      .createQueryBuilder('mp')
      .select('AVG(mp.progress_percentage)', 'avg_progress')
      .addSelect('AVG(mp.average_score)', 'avg_score')  // Fixed: score_percentage → average_score (GAP-ST-001)
      .addSelect(
        'SUM(CASE WHEN mp.status = :completed THEN 1 ELSE 0 END)',
        'completed_count',
      )
      .addSelect('COUNT(*)', 'total_count')
      .where('mp.user_id IN (:...studentIds)', { studentIds })
      .setParameter('completed', 'completed')
      .getRawOne();

    const avgProgress = parseFloat(stats?.avg_progress || '0');
    const avgScore = parseFloat(stats?.avg_score || '0');
    const completedCount = parseInt(stats?.completed_count || '0');
    const totalCount = parseInt(stats?.total_count || '0');

    const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return {
      avgProgress,
      completionRate,
      avgScore,
    };
  }

  /**
   * Mapea Classroom entity a TeacherClassroomResponseDto
   *
   * @private
   */
  private mapToTeacherClassroomResponseDto(classroom: Classroom): TeacherClassroomResponseDto {
    return {
      id: classroom.id,
      tenant_id: classroom.tenant_id,
      name: classroom.name,
      code: classroom.code,
      description: classroom.description,
      grade_level: classroom.grade_level,
      section: classroom.section,
      subject: classroom.subject,
      academic_year: classroom.academic_year,
      teacher_id: classroom.teacher_id,
      capacity: classroom.capacity,
      current_students_count: classroom.current_students_count,
      schedule: classroom.schedule,
      is_active: classroom.is_active,
      is_archived: classroom.is_archived,
      start_date: classroom.start_date,
      end_date: classroom.end_date,
      created_at: classroom.created_at,
      updated_at: classroom.updated_at,
    };
  }

  /**
   * Mapea Classroom entity a TeacherClassroomDetailResponseDto
   *
   * @private
   */
  private mapToTeacherClassroomDetailResponseDto(classroom: Classroom): TeacherClassroomDetailResponseDto {
    return {
      ...this.mapToTeacherClassroomResponseDto(classroom),
      school_id: classroom.school_id,
      co_teachers: classroom.co_teachers,
      semester: classroom.semester,
      meeting_url: classroom.meeting_url,
      settings: classroom.settings,
      metadata: classroom.metadata,
    };
  }

  /**
   * Mapea ClassroomMember a StudentInClassroomDto
   * CORR-2025-12-18: Agregados campos de gamificación y actividad actual
   *
   * @private
   */
  private mapToStudentInClassroomDto(
    member: ClassroomMember,
    profile?: Profile,
    user?: User,
    progress?: { progress: number; score: number },
    userStats?: {
      ml_coins: number;
      current_rank: string;
      achievements_count: number;
      exercises_completed: number;
      time_spent_minutes: number;
      last_activity_at: Date | null;
    },
    currentActivity?: { current_module: string | null; current_exercise: string | null },
    totalExercisesInClassroom?: number,
  ): StudentInClassroomDto {
    const fullName = profile
      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
      : 'Unknown Student';

    // Use provided total or default to 50 as fallback
    const totalExercises = totalExercisesInClassroom ?? 50;

    return {
      user_id: member.student_id,
      full_name: fullName || 'Unknown Student',
      email: user?.email,
      avatar: profile?.avatar_url || undefined,
      enrollment_date: member.enrollment_date,
      status: member.status,
      progress_percentage: progress?.progress ?? 0,
      score_average: progress?.score ?? 0,
      // Usar last_activity_at de UserStats si está disponible, sino usar updated_at del member
      last_activity: userStats?.last_activity_at ?? member.updated_at,
      attendance_percentage: member.attendance_percentage || undefined,
      teacher_notes: member.teacher_notes || undefined,
      // CORR-2025-12-18: Nuevos campos de gamificación y actividad
      current_module: currentActivity?.current_module ?? null,
      current_exercise: currentActivity?.current_exercise ?? null,
      time_spent_minutes: userStats?.time_spent_minutes ?? 0,
      exercises_completed: userStats?.exercises_completed ?? 0,
      exercises_total: totalExercises,
      total_ml_coins: userStats?.ml_coins ?? 0,
      current_rank: userStats?.current_rank ?? null,
      achievements_count: userStats?.achievements_count ?? 0,
    };
  }

  /**
   * Mapea TeacherClassroom a TeacherInClassroomDto
   *
   * @private
   */
  private mapToTeacherInClassroomDto(
    teacherClassroom: TeacherClassroom,
    profile?: Profile,
    user?: User,
  ): TeacherInClassroomDto {
    const fullName = profile
      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
      : 'Unknown Teacher';

    return {
      user_id: teacherClassroom.teacher_id,
      full_name: fullName || 'Unknown Teacher',
      email: user?.email,
      role: teacherClassroom.role,
      assigned_at: teacherClassroom.assigned_at,
    };
  }
}
