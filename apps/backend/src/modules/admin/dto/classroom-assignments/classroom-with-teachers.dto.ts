import { ApiProperty } from '@nestjs/swagger';

/**
 * Classroom basic info for nested responses
 */
export class ClassroomInfoDto {
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
}

/**
 * Teacher info with assignment details
 */
export class TeacherInfoDto {
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

  @ApiProperty({
    description: 'Date assigned to classroom',
    example: '2025-11-24T10:00:00Z',
  })
    assigned_at!: Date;
}

/**
 * Response DTO for GET /admin/classrooms/:classroomId/teachers
 * Returns classroom info with list of assigned teachers
 */
export class ClassroomWithTeachersDto {
  @ApiProperty({
    description: 'Classroom information',
    type: ClassroomInfoDto,
  })
    classroom!: ClassroomInfoDto;

  @ApiProperty({
    description: 'List of teachers assigned to this classroom',
    type: [TeacherInfoDto],
  })
    teachers!: TeacherInfoDto[];
}
