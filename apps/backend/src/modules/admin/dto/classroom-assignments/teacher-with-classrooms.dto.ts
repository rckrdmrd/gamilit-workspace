import { ApiProperty } from '@nestjs/swagger';

/**
 * Teacher basic info for nested responses
 */
export class TeacherBasicInfoDto {
  @ApiProperty({
    description: 'Teacher UUID',
    example: '550e8400-e29b-41d4-a716-446655440005',
  })
  id!: string;

  @ApiProperty({
    description: 'Teacher full name',
    example: 'María González',
  })
  full_name!: string;

  @ApiProperty({
    description: 'Teacher email',
    example: 'maria.gonzalez@school.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Teacher role in system',
    example: 'admin_teacher',
  })
  role!: string;
}

/**
 * Classroom info with assignment details
 */
export class ClassroomWithAssignmentDto {
  @ApiProperty({
    description: 'Classroom UUID',
    example: '770e8400-e29b-41d4-a716-446655440020',
  })
  id!: string;

  @ApiProperty({
    description: 'Classroom name',
    example: 'Matemáticas 6A',
  })
  name!: string;

  @ApiProperty({
    description: 'Grade level',
    example: '6',
  })
  grade!: string;

  @ApiProperty({
    description: 'Section identifier',
    example: 'A',
  })
  section!: string;

  @ApiProperty({
    description: 'Number of students in classroom',
    example: 25,
  })
  student_count!: number;

  @ApiProperty({
    description: 'Date assigned to teacher',
    example: '2025-11-24T10:00:00Z',
  })
  assigned_at!: Date;
}

/**
 * Response DTO for GET /admin/teachers/:teacherId/classrooms
 * Returns teacher info with list of assigned classrooms
 */
export class TeacherWithClassroomsDto {
  @ApiProperty({
    description: 'Teacher information',
    type: TeacherBasicInfoDto,
  })
  teacher!: TeacherBasicInfoDto;

  @ApiProperty({
    description: 'List of classrooms assigned to this teacher',
    type: [ClassroomWithAssignmentDto],
  })
  classrooms!: ClassroomWithAssignmentDto[];
}
