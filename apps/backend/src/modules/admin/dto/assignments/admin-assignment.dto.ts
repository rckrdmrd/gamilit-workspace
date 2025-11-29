import { ApiProperty } from '@nestjs/swagger';

/**
 * Admin Assignment Response DTO
 *
 * @description Detailed assignment information for admin view
 */
export class AdminAssignmentDto {
  @ApiProperty({
    description: 'Assignment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
    id!: string;

  @ApiProperty({
    description: 'Teacher ID who created the assignment',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
    teacher_id!: string;

  @ApiProperty({
    description: 'Teacher name',
    example: 'Prof. María García',
  })
    teacher_name!: string;

  @ApiProperty({
    description: 'Assignment title',
    example: 'Comprensión Lectora - Semana 1',
  })
    title!: string;

  @ApiProperty({
    description: 'Assignment description',
    example: 'Ejercicios de comprensión de textos literarios',
    nullable: true,
  })
    description!: string | null;

  @ApiProperty({
    description: 'Assignment type',
    enum: ['practice', 'quiz', 'exam', 'homework'],
    example: 'homework',
  })
    assignment_type!: string;

  @ApiProperty({
    description: 'Total points available',
    example: 100,
  })
    total_points!: number;

  @ApiProperty({
    description: 'Due date',
    example: '2025-12-15T23:59:59Z',
    nullable: true,
  })
    due_date!: Date | null;

  @ApiProperty({
    description: 'Is assignment published',
    example: true,
  })
    is_published!: boolean;

  @ApiProperty({
    description: 'Number of classrooms assigned',
    example: 3,
  })
    classrooms_count!: number;

  @ApiProperty({
    description: 'Number of students assigned',
    example: 45,
  })
    students_count!: number;

  @ApiProperty({
    description: 'Number of submissions',
    example: 38,
  })
    submissions_count!: number;

  @ApiProperty({
    description: 'Number of graded submissions',
    example: 30,
  })
    graded_count!: number;

  @ApiProperty({
    description: 'Creation date',
    example: '2025-11-01T10:00:00Z',
  })
    created_at!: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2025-11-15T14:30:00Z',
  })
    updated_at!: Date;
}

/**
 * Admin Assignment Detail Response DTO
 *
 * @description Extended assignment information including submissions and students
 */
export class AdminAssignmentDetailDto extends AdminAssignmentDto {
  @ApiProperty({
    description: 'Assigned classrooms',
    type: [Object],
    example: [
      {
        classroom_id: '123e4567-e89b-12d3-a456-426614174000',
        classroom_name: 'Aula 5-A',
        assigned_at: '2025-11-01T10:00:00Z',
      },
    ],
  })
    classrooms!: Array<{
    classroom_id: string;
    classroom_name: string;
    assigned_at: Date;
  }>;

  @ApiProperty({
    description: 'Recent submissions',
    type: [Object],
    example: [
      {
        student_id: '123e4567-e89b-12d3-a456-426614174000',
        student_name: 'Juan Pérez',
        submitted_at: '2025-11-10T15:30:00Z',
        status: 'submitted',
        score: 85.5,
      },
    ],
  })
    recent_submissions!: Array<{
    student_id: string;
    student_name: string;
    submitted_at: Date | null;
    status: string;
    score: number | null;
  }>;
}

/**
 * Paginated Admin Assignments Response DTO
 */
export class PaginatedAdminAssignmentsDto {
  @ApiProperty({
    description: 'List of assignments',
    type: [AdminAssignmentDto],
  })
    data!: AdminAssignmentDto[];

  @ApiProperty({
    description: 'Total number of assignments matching filters',
    example: 150,
  })
    total!: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
    page!: number;

  @ApiProperty({
    description: 'Items per page',
    example: 20,
  })
    limit!: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 8,
  })
    total_pages!: number;
}
