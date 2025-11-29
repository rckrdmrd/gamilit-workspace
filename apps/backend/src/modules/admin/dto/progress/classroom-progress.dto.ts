import { ApiProperty } from '@nestjs/swagger';
import { StudentProgressSummaryDto } from './student-progress-summary.dto';

/**
 * DTO for detailed classroom progress
 * Includes classroom info and all students' progress
 */
export class ClassroomProgressDto {
  @ApiProperty({
    description: 'Classroom ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
    classroom_id!: string;

  @ApiProperty({
    description: 'Classroom name',
    example: 'Matemáticas 5to A',
  })
    classroom_name!: string;

  @ApiProperty({
    description: 'Teacher name',
    example: 'Prof. María González',
  })
    teacher_name!: string;

  @ApiProperty({
    description: 'Total number of students',
    example: 28,
  })
    total_students!: number;

  @ApiProperty({
    description: 'Number of active students',
    example: 25,
  })
    active_students!: number;

  @ApiProperty({
    description: 'Average progress percentage across the class',
    example: 67.8,
  })
    avg_class_progress_percent!: number;

  @ApiProperty({
    description: 'List of students with their progress',
    type: [StudentProgressSummaryDto],
  })
    students!: StudentProgressSummaryDto[];
}
