import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { AdminRolesService } from '../services/admin-roles.service';
import {
  RoleDto,
  PermissionDto,
  UpdatePermissionsDto,
  RolePermissionsDto,
} from '../dto/roles';
import { CurrentUser, RequestUser } from '@shared/decorators/current-user.decorator';

@ApiTags('admin-public', 'Admin - Roles & Permissions')
@Controller('admin/roles')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminRolesController {
  constructor(private readonly adminRolesService: AdminRolesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all roles',
    description:
      'Retrieve all available roles in the system with their permissions and user counts',
  })
  async getRoles(): Promise<RoleDto[]> {
    return this.adminRolesService.getRoles();
  }

  @Get('permissions')
  @ApiOperation({
    summary: 'Get all available permissions',
    description:
      'Retrieve all available permissions in the system organized by category',
  })
  async getAvailablePermissions(): Promise<PermissionDto[]> {
    return this.adminRolesService.getAvailablePermissions();
  }

  @Get(':id/permissions')
  @ApiOperation({
    summary: 'Get permissions for a specific role',
    description: 'Retrieve the current permissions assigned to a specific role',
  })
  async getRolePermissions(
    @Param('id') id: string,
  ): Promise<RolePermissionsDto> {
    return this.adminRolesService.getRolePermissions(id);
  }

  /**
   * FIX-2025-01-07 P0: Added audit logging for permission changes
   * Now captures admin user info for accountability
   */
  @Put(':id/permissions')
  @ApiOperation({
    summary: 'Update permissions for a specific role',
    description:
      'Update the permissions assigned to a specific role. This affects all users with this role.',
  })
  async updateRolePermissions(
    @Param('id') id: string,
    @Body() updateDto: UpdatePermissionsDto,
    @CurrentUser() admin: RequestUser,
  ): Promise<RolePermissionsDto> {
    return this.adminRolesService.updateRolePermissions(id, updateDto, admin);
  }
}
