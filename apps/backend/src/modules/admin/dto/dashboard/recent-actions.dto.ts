import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for querying recent admin actions
 */
export class RecentActionsQueryDto {
  @ApiPropertyOptional({
    description: 'Number of recent actions to retrieve',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

/**
 * DTO for a single recent admin action
 * Represents administrative actions like user creation, content approval, settings changes, etc.
 *
 * GAP-FE-001: Updated to match frontend expectations
 * Frontend expects: id, action, actionType, adminId, adminName, targetType, targetId, details, timestamp, success
 */
export class RecentActionDto {
  @ApiProperty({
    description: 'Unique identifier for this action',
    example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  })
  id!: string;

  @ApiProperty({
    description: 'Generic action category (create, update, delete, approve, reject)',
    example: 'create',
    enum: ['create', 'update', 'delete', 'approve', 'reject', 'suspend', 'restore'],
  })
  action!: string;

  @ApiProperty({
    description: 'Specific action type',
    example: 'user_created',
    enum: [
      'user_created',
      'user_updated',
      'user_deleted',
      'content_approved',
      'content_rejected',
      'settings_changed',
      'organization_created',
      'organization_updated',
      'role_assigned',
      'permission_changed',
    ],
  })
  actionType!: string;

  @ApiProperty({
    description: 'ID of the administrator who performed the action',
    example: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  })
  adminId!: string;

  @ApiProperty({
    description: 'Name of the administrator who performed the action',
    example: 'Super Admin',
  })
  adminName!: string;

  @ApiProperty({
    description: 'Type of entity affected (user, organization, content, etc.)',
    example: 'user',
    enum: ['user', 'organization', 'content', 'exercise', 'setting', 'role', 'permission'],
  })
  targetType!: string;

  @ApiProperty({
    description: 'ID of the entity affected',
    example: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
  })
  targetId!: string;

  @ApiProperty({
    description: 'Detailed description of the action',
    example: 'Usuario juan.perez@example.com creado con rol student',
  })
  details!: string;

  @ApiProperty({
    description: 'Timestamp when the action occurred',
    example: '2025-11-23T10:30:00Z',
  })
  timestamp!: Date;

  @ApiProperty({
    description: 'Whether the action completed successfully',
    example: true,
  })
  success!: boolean;
}
