import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsNotEmpty } from 'class-validator';

/**
 * DTO for updating role permissions
 *
 * @description Used by admins to update permissions for a role
 */
export class UpdateRolePermissionsDto {
  @ApiProperty({
    description: 'Updated permissions in JSON format',
    example: {
      can_create_content: true,
      can_delete_users: false,
      can_manage_settings: true,
      can_view_reports: true,
    },
  })
  @IsObject()
  @IsNotEmpty()
  permissions!: Record<string, boolean>;
}
