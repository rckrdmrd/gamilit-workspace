import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for resolving an intervention alert
 */
export class ResolveInterventionDto {
  @ApiProperty({
    description: 'Resolution notes explaining actions taken (minimum 10 characters)',
    example: 'Met with student and parent. Created personalized study plan. Will monitor progress weekly.',
    minLength: 10,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10, { message: 'Resolution notes must be at least 10 characters long' })
  resolution_notes!: string;
}
