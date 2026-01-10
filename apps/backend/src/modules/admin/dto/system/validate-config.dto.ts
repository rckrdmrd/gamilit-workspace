/**
 * Validate Config DTOs
 *
 * DTOs for validating system configuration before applying changes.
 *
 * @author Claude Code Agent
 * @date 2026-01-07
 * @task TASK-SETTINGS-VALIDATE-CONFIG
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsBoolean,
  IsString,
  IsNumber,
  IsObject,
  Min,
  Max,
} from 'class-validator';

/**
 * DTO for validating system configuration
 */
export class ValidateConfigDto {
  @ApiPropertyOptional({ description: 'Enable/disable maintenance mode' })
  @IsOptional()
  @IsBoolean()
  maintenance_mode?: boolean;

  @ApiPropertyOptional({ description: 'Message shown during maintenance' })
  @IsOptional()
  @IsString()
  maintenance_message?: string;

  @ApiPropertyOptional({ description: 'Allow new user registrations' })
  @IsOptional()
  @IsBoolean()
  allow_registrations?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum login attempts before lockout',
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  max_login_attempts?: number;

  @ApiPropertyOptional({
    description: 'Account lockout duration in minutes',
    minimum: 1,
    maximum: 1440,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1440)
  lockout_duration_minutes?: number;

  @ApiPropertyOptional({
    description: 'Session timeout in minutes',
    minimum: 5,
    maximum: 10080,
  })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(10080)
  session_timeout_minutes?: number;

  @ApiPropertyOptional({
    description: 'Custom settings as key-value pairs',
  })
  @IsOptional()
  @IsObject()
  custom_settings?: Record<string, unknown>;
}

/**
 * Single validation error
 */
export class ConfigValidationError {
  @ApiProperty({ description: 'Field that has the error' })
  field: string;

  @ApiProperty({ description: 'Error message' })
  message: string;

  @ApiPropertyOptional({ description: 'The invalid value' })
  value?: unknown;
}

/**
 * Configuration validation result
 */
export class ConfigValidationResultDto {
  @ApiProperty({ description: 'Whether the configuration is valid' })
  valid: boolean;

  @ApiProperty({
    description: 'List of validation errors',
    type: [ConfigValidationError],
  })
  errors: ConfigValidationError[];

  @ApiProperty({
    description: 'List of warnings (non-blocking)',
    type: [String],
  })
  warnings: string[];
}
