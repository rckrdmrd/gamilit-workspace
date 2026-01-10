import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

/**
 * Update Parameter DTO
 *
 * @description DTO for updating a single gamification parameter
 * @validation Value must be provided and will be validated against parameter constraints
 * FIX-2025-01-07 P0: Added @MaxLength to prevent DoS attacks
 */
export class UpdateParameterDto {
  /**
   * FIX-2025-01-07 P0: Added @MaxLength(1000) to prevent resource exhaustion
   */
  @ApiProperty({
    description: 'New value for the parameter (as string, will be parsed based on value_type)',
    example: '15',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, { message: 'Value cannot exceed 1000 characters' })
    value!: string;
}

/**
 * Update Parameter Response DTO
 *
 * @description Response after updating a parameter
 */
export class UpdateParameterResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Parameter updated successfully',
  })
    message!: string;

  @ApiProperty({
    description: 'Updated parameter details',
  })
    parameter!: {
    id: string;
    setting_key: string;
    old_value: string;
    new_value: string;
    updated_at: string;
    updated_by: string;
  };
}
