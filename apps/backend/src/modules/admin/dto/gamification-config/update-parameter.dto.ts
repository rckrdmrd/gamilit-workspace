import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

/**
 * Update Parameter DTO
 *
 * @description DTO for updating a single gamification parameter
 * @validation Value must be provided and will be validated against parameter constraints
 */
export class UpdateParameterDto {
  @ApiProperty({
    description: 'New value for the parameter (as string, will be parsed based on value_type)',
    example: '15',
  })
  @IsString()
  @IsNotEmpty()
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
