import { IsOptional, IsInt, Min, Max, IsEnum, ValidateIf } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { GamilityRoleEnum, MembershipStatusEnum } from '@shared/constants';

/**
 * FIX-2025-01-07 P0: Added @IsEnum validations to prevent SQL injection via filters
 */
export class GetOrganizationUsersDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
    page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
    limit?: number;

  /**
   * FIX-2025-01-07 P0: Validate role enum to prevent invalid values
   */
  @ApiPropertyOptional({
    description: 'Filter by role',
    example: 'student',
    enum: GamilityRoleEnum,
  })
  @IsOptional()
  @ValidateIf((o) => o.role !== undefined && o.role !== '')
  @IsEnum(GamilityRoleEnum, {
    message: 'Role must be one of: student, admin_teacher, super_admin',
  })
    role?: GamilityRoleEnum;

  /**
   * FIX-2025-01-07 P0: Validate status enum to prevent invalid values
   */
  @ApiPropertyOptional({
    description: 'Filter by membership status',
    example: 'active',
    enum: MembershipStatusEnum,
  })
  @IsOptional()
  @ValidateIf((o) => o.status !== undefined && o.status !== '')
  @IsEnum(MembershipStatusEnum, {
    message: 'Status must be one of: active, inactive, pending, suspended',
  })
    status?: MembershipStatusEnum;
}

export class OrganizationUserDto {
  @ApiProperty({ description: 'User ID' })
    user_id!: string;

  @ApiProperty({ description: 'User email' })
    email!: string;

  @ApiProperty({ description: 'Full name' })
    full_name?: string;

  @ApiProperty({ description: 'User role' })
    role!: string;

  @ApiProperty({ description: 'Membership role in organization' })
    membership_role!: string;

  @ApiProperty({ description: 'Membership status' })
    membership_status!: string;

  @ApiProperty({ description: 'Joined date' })
    joined_at!: Date;

  @ApiProperty({ description: 'Last active date' })
    last_active_at?: Date;
}

export class PaginatedOrganizationUsersDto {
  @ApiProperty({ description: 'List of users', type: [OrganizationUserDto] })
    data!: OrganizationUserDto[];

  @ApiProperty({ description: 'Total count' })
    total!: number;

  @ApiProperty({ description: 'Current page' })
    page!: number;

  @ApiProperty({ description: 'Items per page' })
    limit!: number;

  @ApiProperty({ description: 'Total pages' })
    total_pages!: number;
}
