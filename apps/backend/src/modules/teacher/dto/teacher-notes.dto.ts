import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddTeacherNoteDto {
  @ApiProperty({
    description: 'The note content from teacher about the student',
    example: 'Student shows great improvement in reading comprehension. Needs more practice with writing.',
  })
  @IsString()
  @IsNotEmpty()
    note!: string;

  @ApiPropertyOptional({
    description: 'Classroom ID context for the note',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
    classroom_id?: string;
}

/**
 * StudentNoteResponseDto - Aligned with frontend StudentNote interface
 *
 * FIX TASK-2026-01-18-005: Alineado con frontend para resolver warning de React keys
 * @see apps/frontend/src/services/api/teacher/studentProgressApi.ts:96-106
 */
export class StudentNoteResponseDto {
  @ApiProperty({
    description: 'Unique ID for the note (composite key)',
    example: 'note-student123-classroom456',
  })
    id!: string;

  @ApiProperty({ description: 'Student ID' })
    student_id!: string;

  @ApiProperty({ description: 'Teacher ID who created the note' })
    teacher_id!: string;

  @ApiProperty({ description: 'Classroom ID' })
    classroom_id!: string;

  @ApiProperty({
    description: 'Note content (aligned with frontend "note" field)',
  })
    note!: string;

  @ApiPropertyOptional({
    description: 'Note category',
    enum: ['behavior', 'academic', 'attendance', 'general'],
  })
    category?: 'behavior' | 'academic' | 'attendance' | 'general';

  @ApiProperty({ description: 'Whether the note is private' })
    is_private!: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
    created_at!: Date;

  @ApiProperty({ description: 'Last updated timestamp' })
    updated_at!: Date;
}
