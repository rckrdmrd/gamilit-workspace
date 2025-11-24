import { ApiProperty } from '@nestjs/swagger';

export { UpdateRolePermissionsDto as UpdatePermissionsDto } from '@shared/dto/permissions/update-role-permissions.dto';

export class RolePermissionsDto {
  @ApiProperty({
    description: 'Role ID',
    example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  })
  role_id!: string;

  @ApiProperty({
    description: 'Role name',
    example: 'teacher',
  })
  role_name!: string;

  @ApiProperty({
    description: 'Current permissions',
    example: {
      can_create_content: true,
      can_delete_users: false,
    },
  })
  permissions!: Record<string, boolean>;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-11-19T10:30:00Z',
  })
  updated_at!: string;
}
