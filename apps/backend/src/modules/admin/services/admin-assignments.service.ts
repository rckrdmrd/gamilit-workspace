import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from '@modules/assignments/entities/assignment.entity';
import { AssignmentStudent } from '@modules/assignments/entities/assignment-student.entity';
import { AssignmentSubmission, SubmissionStatus } from '@modules/assignments/entities/assignment-submission.entity';
import { AssignmentClassroom } from '@modules/social/entities/assignment-classroom.entity';
import { Profile } from '@modules/auth/entities/profile.entity';
import { Classroom } from '@modules/social/entities/classroom.entity';
import {
  AdminAssignmentFiltersDto,
  AdminAssignmentDto,
  AdminAssignmentDetailDto,
  PaginatedAdminAssignmentsDto,
  AdminAssignmentStatsDto,
} from '../dto/assignments';

/**
 * Admin Assignments Service
 *
 * @description Service for admin assignments management
 * Provides read-only access to all assignments in the system
 */
@Injectable()
export class AdminAssignmentsService {
  constructor(
    @InjectRepository(Assignment, 'educational')
    private readonly assignmentRepo: Repository<Assignment>,

    @InjectRepository(AssignmentStudent, 'educational')
    private readonly assignmentStudentRepo: Repository<AssignmentStudent>,

    @InjectRepository(AssignmentSubmission, 'educational')
    private readonly submissionRepo: Repository<AssignmentSubmission>,

    @InjectRepository(AssignmentClassroom, 'social')
    private readonly assignmentClassroomRepo: Repository<AssignmentClassroom>,

    @InjectRepository(Profile, 'auth')
    private readonly profileRepo: Repository<Profile>,

    @InjectRepository(Classroom, 'social')
    private readonly classroomRepo: Repository<Classroom>,
  ) {}

  /**
   * Get all assignments with filters and pagination
   *
   * @param filters - Query filters for assignments
   * @returns Paginated list of assignments
   */
  async findAll(
    filters: AdminAssignmentFiltersDto,
  ): Promise<PaginatedAdminAssignmentsDto> {
    const { page = 1, limit = 20, classroom_id, teacher_id, student_id, status, date_from, date_to } = filters;

    const query = this.assignmentRepo
      .createQueryBuilder('assignment')
      .leftJoin(Profile, 'teacher', 'teacher.user_id = assignment.teacher_id')
      .leftJoin(
        AssignmentClassroom,
        'ac',
        'ac.assignment_id = assignment.id',
      )
      .leftJoin(
        AssignmentStudent,
        'ast',
        'ast.assignment_id = assignment.id',
      )
      .leftJoin(
        AssignmentSubmission,
        'sub',
        'sub.assignment_id = assignment.id',
      )
      .select([
        'assignment.id AS id',
        'assignment.teacher_id AS teacher_id',
        'COALESCE(teacher.first_name || \' \' || teacher.last_name, \'Unknown\') AS teacher_name',
        'assignment.title AS title',
        'assignment.description AS description',
        'assignment.assignment_type AS assignment_type',
        'assignment.total_points AS total_points',
        'assignment.due_date AS due_date',
        'assignment.is_published AS is_published',
        'assignment.created_at AS created_at',
        'assignment.updated_at AS updated_at',
        'COUNT(DISTINCT ac.classroom_id) AS classrooms_count',
        'COUNT(DISTINCT ast.student_id) AS students_count',
        'COUNT(DISTINCT sub.id) AS submissions_count',
        'COUNT(DISTINCT CASE WHEN sub.status = \'graded\' THEN sub.id END) AS graded_count',
      ])
      .groupBy('assignment.id')
      .addGroupBy('teacher.first_name')
      .addGroupBy('teacher.last_name');

    // Apply filters
    if (classroom_id) {
      query.andWhere('ac.classroom_id = :classroom_id', { classroom_id });
    }

    if (teacher_id) {
      query.andWhere('assignment.teacher_id = :teacher_id', { teacher_id });
    }

    if (student_id) {
      query.andWhere('ast.student_id = :student_id', { student_id });
    }

    if (status) {
      query.andWhere('sub.status = :status', { status });
    }

    if (date_from) {
      query.andWhere('assignment.created_at >= :date_from', { date_from });
    }

    if (date_to) {
      query.andWhere('assignment.created_at <= :date_to', { date_to });
    }

    // Get total count
    const totalQuery = query.clone();
    const totalResult = await totalQuery.getRawMany();
    const total = totalResult.length;

    // Apply pagination
    const offset = (page - 1) * limit;
    query.offset(offset).limit(limit);

    // Order by creation date
    query.orderBy('assignment.created_at', 'DESC');

    const results = await query.getRawMany();

    // Map results to DTO
    const data: AdminAssignmentDto[] = results.map((row) => ({
      id: row.id,
      teacher_id: row.teacher_id,
      teacher_name: row.teacher_name,
      title: row.title,
      description: row.description,
      assignment_type: row.assignment_type,
      total_points: row.total_points,
      due_date: row.due_date,
      is_published: row.is_published,
      classrooms_count: parseInt(row.classrooms_count, 10) || 0,
      students_count: parseInt(row.students_count, 10) || 0,
      submissions_count: parseInt(row.submissions_count, 10) || 0,
      graded_count: parseInt(row.graded_count, 10) || 0,
      created_at: row.created_at,
      updated_at: row.updated_at,
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
   * Get assignment statistics
   *
   * @returns Global assignment statistics
   */
  async getStats(): Promise<AdminAssignmentStatsDto> {
    // Total assignments
    const totalAssignments = await this.assignmentRepo.count();

    // Published vs drafts
    const publishedAssignments = await this.assignmentRepo.count({
      where: { isPublished: true },
    });
    const draftAssignments = totalAssignments - publishedAssignments;

    // Submission statistics
    const totalSubmissions = await this.submissionRepo.count();
    const pendingSubmissions = await this.submissionRepo.count({
      where: { status: SubmissionStatus.NOT_STARTED },
    });
    const gradedSubmissions = await this.submissionRepo.count({
      where: { status: SubmissionStatus.GRADED },
    });

    // Late submissions (submitted after due date)
    const lateSubmissionsQuery = await this.submissionRepo
      .createQueryBuilder('sub')
      .innerJoin(Assignment, 'a', 'a.id = sub.assignment_id')
      .where('sub.submitted_at > a.due_date')
      .andWhere('a.due_date IS NOT NULL')
      .getCount();

    // Average score
    const avgScoreResult = await this.submissionRepo
      .createQueryBuilder('sub')
      .select('AVG(sub.score)', 'avg_score')
      .where('sub.score IS NOT NULL')
      .getRawOne();

    const averageScore = avgScoreResult?.avg_score
      ? parseFloat(avgScoreResult.avg_score)
      : 0;

    // Stats by type
    const byTypeResults = await this.assignmentRepo
      .createQueryBuilder('assignment')
      .select('assignment.assignment_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('assignment.assignment_type')
      .getRawMany();

    const byType = byTypeResults.map((row) => ({
      type: row.type,
      count: parseInt(row.count, 10),
      percentage: totalAssignments > 0
        ? Math.round((parseInt(row.count, 10) / totalAssignments) * 100)
        : 0,
    }));

    // Top teachers
    const topTeachersResults = await this.assignmentRepo
      .createQueryBuilder('assignment')
      .leftJoin(Profile, 'teacher', 'teacher.user_id = assignment.teacher_id')
      .select([
        'assignment.teacher_id AS teacher_id',
        'COALESCE(teacher.first_name || \' \' || teacher.last_name, \'Unknown\') AS teacher_name',
        'COUNT(*) AS assignments_count',
      ])
      .groupBy('assignment.teacher_id')
      .addGroupBy('teacher.first_name')
      .addGroupBy('teacher.last_name')
      .orderBy('COUNT(*)', 'DESC')
      .limit(5)
      .getRawMany();

    const topTeachers = topTeachersResults.map((row) => ({
      teacher_id: row.teacher_id,
      teacher_name: row.teacher_name,
      assignments_count: parseInt(row.assignments_count, 10),
    }));

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newAssignments = await this.assignmentRepo
      .createQueryBuilder('a')
      .where('a.created_at >= :thirtyDaysAgo', { thirtyDaysAgo })
      .getCount();

    const newSubmissions = await this.submissionRepo
      .createQueryBuilder('s')
      .where('s.submitted_at >= :thirtyDaysAgo', { thirtyDaysAgo })
      .getCount();

    const recentGradedSubmissions = await this.submissionRepo
      .createQueryBuilder('s')
      .where('s.graded_at >= :thirtyDaysAgo', { thirtyDaysAgo })
      .getCount();

    return {
      total_assignments: totalAssignments,
      published_assignments: publishedAssignments,
      draft_assignments: draftAssignments,
      total_submissions: totalSubmissions,
      pending_submissions: pendingSubmissions,
      graded_submissions: gradedSubmissions,
      late_submissions: lateSubmissionsQuery,
      average_score: Math.round(averageScore * 10) / 10,
      by_type: byType,
      top_teachers: topTeachers,
      recent_activity: {
        new_assignments: newAssignments,
        new_submissions: newSubmissions,
        graded_submissions: recentGradedSubmissions,
      },
    };
  }

  /**
   * Get assignment by ID with detailed information
   *
   * @param id - Assignment UUID
   * @returns Detailed assignment information
   * @throws NotFoundException if assignment not found
   */
  async findOne(id: string): Promise<AdminAssignmentDetailDto> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id },
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }

    // Get teacher info
    const teacher = await this.profileRepo.findOne({
      where: { user_id: assignment.teacherId },
    });

    // Get classrooms
    const classroomsData = await this.assignmentClassroomRepo
      .createQueryBuilder('ac')
      .innerJoin(Classroom, 'c', 'c.id = ac.classroom_id')
      .where('ac.assignment_id = :id', { id })
      .select([
        'ac.classroom_id AS classroom_id',
        'c.name AS classroom_name',
        'ac.assigned_at AS assigned_at',
      ])
      .getRawMany();

    const classrooms = classroomsData.map((row) => ({
      classroom_id: row.classroom_id,
      classroom_name: row.classroom_name,
      assigned_at: row.assigned_at,
    }));

    // Get recent submissions (last 10)
    const submissionsData = await this.submissionRepo
      .createQueryBuilder('sub')
      .innerJoin(Profile, 'student', 'student.user_id = sub.student_id')
      .where('sub.assignment_id = :id', { id })
      .select([
        'sub.student_id AS student_id',
        'COALESCE(student.first_name || \' \' || student.last_name, \'Unknown\') AS student_name',
        'sub.submitted_at AS submitted_at',
        'sub.status AS status',
        'sub.score AS score',
      ])
      .orderBy('sub.submitted_at', 'DESC')
      .limit(10)
      .getRawMany();

    const recentSubmissions = submissionsData.map((row) => ({
      student_id: row.student_id,
      student_name: row.student_name,
      submitted_at: row.submitted_at,
      status: row.status,
      score: row.score ? parseFloat(row.score) : null,
    }));

    // Get counts
    const classroomsCount = classrooms.length;
    const studentsCount = await this.assignmentStudentRepo.count({
      where: { assignmentId: id },
    });
    const submissionsCount = await this.submissionRepo.count({
      where: { assignmentId: id },
    });
    const gradedCount = await this.submissionRepo.count({
      where: { assignmentId: id, status: SubmissionStatus.GRADED },
    });

    return {
      id: assignment.id,
      teacher_id: assignment.teacherId,
      teacher_name: teacher
        ? `${teacher.first_name} ${teacher.last_name}`
        : 'Unknown',
      title: assignment.title,
      description: assignment.description,
      assignment_type: assignment.assignmentType,
      total_points: assignment.totalPoints,
      due_date: assignment.dueDate,
      is_published: assignment.isPublished,
      classrooms_count: classroomsCount,
      students_count: studentsCount,
      submissions_count: submissionsCount,
      graded_count: gradedCount,
      created_at: assignment.createdAt,
      updated_at: assignment.updatedAt,
      classrooms,
      recent_submissions: recentSubmissions,
    };
  }

  /**
   * Get assignments by classroom
   *
   * @param classroomId - Classroom UUID
   * @returns List of assignments for the classroom
   */
  async getByClassroom(classroomId: string): Promise<AdminAssignmentDto[]> {
    const results = await this.assignmentRepo
      .createQueryBuilder('assignment')
      .innerJoin(
        AssignmentClassroom,
        'ac',
        'ac.assignment_id = assignment.id AND ac.classroom_id = :classroomId',
        { classroomId },
      )
      .leftJoin(Profile, 'teacher', 'teacher.user_id = assignment.teacher_id')
      .leftJoin(
        AssignmentStudent,
        'ast',
        'ast.assignment_id = assignment.id',
      )
      .leftJoin(
        AssignmentSubmission,
        'sub',
        'sub.assignment_id = assignment.id',
      )
      .select([
        'assignment.id AS id',
        'assignment.teacher_id AS teacher_id',
        'COALESCE(teacher.first_name || \' \' || teacher.last_name, \'Unknown\') AS teacher_name',
        'assignment.title AS title',
        'assignment.description AS description',
        'assignment.assignment_type AS assignment_type',
        'assignment.total_points AS total_points',
        'assignment.due_date AS due_date',
        'assignment.is_published AS is_published',
        'assignment.created_at AS created_at',
        'assignment.updated_at AS updated_at',
        'COUNT(DISTINCT ac.classroom_id) AS classrooms_count',
        'COUNT(DISTINCT ast.student_id) AS students_count',
        'COUNT(DISTINCT sub.id) AS submissions_count',
        'COUNT(DISTINCT CASE WHEN sub.status = \'graded\' THEN sub.id END) AS graded_count',
      ])
      .groupBy('assignment.id')
      .addGroupBy('teacher.first_name')
      .addGroupBy('teacher.last_name')
      .orderBy('assignment.created_at', 'DESC')
      .getRawMany();

    return results.map((row) => ({
      id: row.id,
      teacher_id: row.teacher_id,
      teacher_name: row.teacher_name,
      title: row.title,
      description: row.description,
      assignment_type: row.assignment_type,
      total_points: row.total_points,
      due_date: row.due_date,
      is_published: row.is_published,
      classrooms_count: parseInt(row.classrooms_count, 10) || 0,
      students_count: parseInt(row.students_count, 10) || 0,
      submissions_count: parseInt(row.submissions_count, 10) || 0,
      graded_count: parseInt(row.graded_count, 10) || 0,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  }

  /**
   * Export assignments to CSV
   *
   * Reuses the same query logic as findAll() but without pagination,
   * then serialises the result to a CSV string.
   *
   * CSV columns: id, title, teacher_name, assignment_type, due_date,
   *              is_published, classrooms_count, submissions_count, created_at
   *
   * @param filters  - Same filter DTO used by findAll (page/limit ignored)
   * @param tenantId - Tenant UUID (reserved for future RLS-aware queries)
   * @returns UTF-8 CSV string ready to be streamed to the client
   */
  async exportToCsv(
    filters: AdminAssignmentFiltersDto,
    tenantId: string, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<string> {
    const { classroom_id, teacher_id, student_id, status, date_from, date_to } = filters;

    const query = this.assignmentRepo
      .createQueryBuilder('assignment')
      .leftJoin(Profile, 'teacher', 'teacher.user_id = assignment.teacher_id')
      .leftJoin(
        AssignmentClassroom,
        'ac',
        'ac.assignment_id = assignment.id',
      )
      .leftJoin(
        AssignmentStudent,
        'ast',
        'ast.assignment_id = assignment.id',
      )
      .leftJoin(
        AssignmentSubmission,
        'sub',
        'sub.assignment_id = assignment.id',
      )
      .select([
        'assignment.id AS id',
        'assignment.title AS title',
        'COALESCE(teacher.first_name || \' \' || teacher.last_name, \'Unknown\') AS teacher_name',
        'assignment.assignment_type AS assignment_type',
        'assignment.due_date AS due_date',
        'assignment.is_published AS is_published',
        'assignment.created_at AS created_at',
        'COUNT(DISTINCT ac.classroom_id) AS classrooms_count',
        'COUNT(DISTINCT sub.id) AS submissions_count',
      ])
      .groupBy('assignment.id')
      .addGroupBy('teacher.first_name')
      .addGroupBy('teacher.last_name')
      .orderBy('assignment.created_at', 'DESC');

    if (classroom_id) {
      query.andWhere('ac.classroom_id = :classroom_id', { classroom_id });
    }

    if (teacher_id) {
      query.andWhere('assignment.teacher_id = :teacher_id', { teacher_id });
    }

    if (student_id) {
      query.andWhere('ast.student_id = :student_id', { student_id });
    }

    if (status) {
      query.andWhere('sub.status = :status', { status });
    }

    if (date_from) {
      query.andWhere('assignment.created_at >= :date_from', { date_from });
    }

    if (date_to) {
      query.andWhere('assignment.created_at <= :date_to', { date_to });
    }

    const rows = await query.getRawMany();

    /**
     * Escape a single CSV cell value:
     *   - null/undefined  → empty string
     *   - Contains comma, double-quote, or newline → wrap in double-quotes
     *     and escape inner double-quotes by doubling them (RFC 4180)
     */
    const escapeCell = (value: unknown): string => {
      if (value === null || value === undefined) {
        return '';
      }
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const header = [
      'id',
      'title',
      'teacher_name',
      'assignment_type',
      'due_date',
      'is_published',
      'classrooms_count',
      'submissions_count',
      'created_at',
    ].join(',');

    const dataLines = rows.map((row) =>
      [
        escapeCell(row.id),
        escapeCell(row.title),
        escapeCell(row.teacher_name),
        escapeCell(row.assignment_type),
        escapeCell(row.due_date),
        escapeCell(row.is_published),
        escapeCell(parseInt(row.classrooms_count, 10) || 0),
        escapeCell(parseInt(row.submissions_count, 10) || 0),
        escapeCell(row.created_at),
      ].join(','),
    );

    return [header, ...dataLines].join('\n');
  }

  /**
   * Get assignments by student
   *
   * @param studentId - Student UUID
   * @returns List of assignments for the student
   */
  async getByStudent(studentId: string): Promise<AdminAssignmentDto[]> {
    const results = await this.assignmentRepo
      .createQueryBuilder('assignment')
      .innerJoin(
        AssignmentStudent,
        'ast',
        'ast.assignment_id = assignment.id AND ast.student_id = :studentId',
        { studentId },
      )
      .leftJoin(Profile, 'teacher', 'teacher.user_id = assignment.teacher_id')
      .leftJoin(
        AssignmentClassroom,
        'ac',
        'ac.assignment_id = assignment.id',
      )
      .leftJoin(
        AssignmentSubmission,
        'sub',
        'sub.assignment_id = assignment.id',
      )
      .select([
        'assignment.id AS id',
        'assignment.teacher_id AS teacher_id',
        'COALESCE(teacher.first_name || \' \' || teacher.last_name, \'Unknown\') AS teacher_name',
        'assignment.title AS title',
        'assignment.description AS description',
        'assignment.assignment_type AS assignment_type',
        'assignment.total_points AS total_points',
        'assignment.due_date AS due_date',
        'assignment.is_published AS is_published',
        'assignment.created_at AS created_at',
        'assignment.updated_at AS updated_at',
        'COUNT(DISTINCT ac.classroom_id) AS classrooms_count',
        'COUNT(DISTINCT ast.student_id) AS students_count',
        'COUNT(DISTINCT sub.id) AS submissions_count',
        'COUNT(DISTINCT CASE WHEN sub.status = \'graded\' THEN sub.id END) AS graded_count',
      ])
      .groupBy('assignment.id')
      .addGroupBy('teacher.first_name')
      .addGroupBy('teacher.last_name')
      .orderBy('assignment.created_at', 'DESC')
      .getRawMany();

    return results.map((row) => ({
      id: row.id,
      teacher_id: row.teacher_id,
      teacher_name: row.teacher_name,
      title: row.title,
      description: row.description,
      assignment_type: row.assignment_type,
      total_points: row.total_points,
      due_date: row.due_date,
      is_published: row.is_published,
      classrooms_count: parseInt(row.classrooms_count, 10) || 0,
      students_count: parseInt(row.students_count, 10) || 0,
      submissions_count: parseInt(row.submissions_count, 10) || 0,
      graded_count: parseInt(row.graded_count, 10) || 0,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  }
}
