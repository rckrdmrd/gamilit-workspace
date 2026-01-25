import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

/**
 * DTO for creating a new role
 *
 * Validation rules:
 * - name: Required, 3-50 chars, alphanumeric with underscores
 * - description: Optional, max 500 chars
 * - permissions: Optional, defaults to empty object
 *
 * @example
 * {
 *   "name": "content_reviewer",
 *   "description": "Can review and approve content submissions",
 *   "permissions": { "can_approve_content": true, "can_view_reports": true }
 * }
 */
export class CreateRoleDto {
  @ApiProperty({
    description: 'Role name (unique identifier)',
    example: 'content_reviewer',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'Role name is required' })
  @MinLength(3, { message: 'Role name must be at least 3 characters' })
  @MaxLength(50, { message: 'Role name must not exceed 50 characters' })
  @Matches(/^[a-z][a-z0-9_]*$/, {
    message:
      'Role name must start with lowercase letter and contain only lowercase letters, numbers, and underscores',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Role description',
    example: 'Can review and approve content submissions',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Initial permissions for the role',
    example: { can_approve_content: true, can_view_reports: true },
    default: {},
  })
  @IsObject()
  @IsOptional()
  permissions?: Record<string, boolean>;
}

/**
 * Response DTO for role creation
 */
export class CreateRoleResponseDto {
  @ApiProperty({
    description: 'Created role ID',
    example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  })
  id!: string;

  @ApiProperty({
    description: 'Role name',
    example: 'content_reviewer',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Role description',
  })
  description?: string;

  @ApiProperty({
    description: 'Role permissions',
  })
  permissions!: Record<string, boolean>;

  @ApiProperty({
    description: 'Whether the role is active',
    example: true,
  })
  is_active!: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
  })
  created_at!: string;
}

/**
 * Response DTO for role deletion
 */
export class DeleteRoleResponseDto {
  @ApiProperty({
    description: 'Whether the deletion was successful',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Deletion message',
    example: 'Role "content_reviewer" has been deactivated',
  })
  message!: string;

  @ApiProperty({
    description: 'Deleted role ID',
    example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  })
  role_id!: string;
}
