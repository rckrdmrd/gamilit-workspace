import { IsArray, ValidateNested, ArrayMinSize, ArrayMaxSize, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Individual assignment pair for bulk operations
 */
export class AssignmentPairDto {
  @ApiProperty({
    description: 'Teacher UUID',
    example: '550e8400-e29b-41d4-a716-446655440005',
  })
  @IsUUID()
    teacherId!: string;

  @ApiProperty({
    description: 'Classroom UUID',
    example: '770e8400-e29b-41d4-a716-446655440020',
  })
  @IsUUID()
    classroomId!: string;
}

/**
 * DTO for bulk assigning multiple teacher-classroom pairs
 * Used by POST /admin/classroom-teachers/bulk
 */
export class BulkAssignRestDto {
  @ApiProperty({
    description: 'Array of teacher-classroom assignment pairs',
    type: [AssignmentPairDto],
    example: [
      {
        teacherId: '550e8400-e29b-41d4-a716-446655440005',
        classroomId: '770e8400-e29b-41d4-a716-446655440020',
      },
      {
        teacherId: '550e8400-e29b-41d4-a716-446655440006',
        classroomId: '770e8400-e29b-41d4-a716-446655440021',
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => AssignmentPairDto)
    assignments!: AssignmentPairDto[];
}
