import { IsUUID, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for assigning a teacher to a classroom (REST endpoint)
 * Used by POST /admin/classrooms/:classroomId/teachers
 */
export class AssignTeacherToClassroomRestDto {
  @ApiProperty({
    description: 'Teacher UUID to assign',
    example: '550e8400-e29b-41d4-a716-446655440005',
  })
  @IsUUID()
  teacherId!: string;

  @ApiPropertyOptional({
    description: 'Optional notes about the assignment',
    example: 'Main teacher for this classroom',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
