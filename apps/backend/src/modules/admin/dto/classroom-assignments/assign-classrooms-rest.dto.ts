import { IsArray, IsUUID, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for assigning multiple classrooms to a teacher (REST endpoint)
 * Used by POST /admin/teachers/:teacherId/classrooms
 */
export class AssignClassroomsToTeacherRestDto {
  @ApiProperty({
    description: 'Array of classroom UUIDs to assign',
    example: [
      '770e8400-e29b-41d4-a716-446655440020',
      '770e8400-e29b-41d4-a716-446655440021',
    ],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsUUID('4', { each: true })
    classroomIds!: string[];
}
