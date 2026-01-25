import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { AdminRolesService } from '../services/admin-roles.service';
import {
  RoleDto,
  PermissionDto,
  UpdatePermissionsDto,
  RolePermissionsDto,
  CreateRoleDto,
  CreateRoleResponseDto,
  DeleteRoleResponseDto,
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

  /**
   * GAP-BE-006: Create a new custom role
   * Allows administrators to create custom roles with specific permissions.
   * System roles (student, admin_teacher, super_admin) are predefined and cannot be recreated.
   */
  @Post()
  @ApiOperation({
    summary: 'Create a new role',
    description:
      'Create a new custom role with specified permissions. Role names must be unique and follow naming conventions.',
  })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully',
    type: CreateRoleResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Role with this name already exists',
  })
  async createRole(
    @Body() createDto: CreateRoleDto,
    @CurrentUser() admin: RequestUser,
  ): Promise<CreateRoleResponseDto> {
    return this.adminRolesService.createRole(createDto, admin);
  }

  /**
   * GAP-BE-006: Delete (deactivate) a role
   * Soft-deletes a role by setting is_active to false.
   * System roles cannot be deleted.
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a role',
    description:
      'Deactivate a custom role. System roles (student, admin_teacher, super_admin) cannot be deleted.',
  })
  @ApiResponse({
    status: 200,
    description: 'Role deactivated successfully',
    type: DeleteRoleResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete system role',
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  async deleteRole(
    @Param('id') id: string,
    @CurrentUser() admin: RequestUser,
  ): Promise<DeleteRoleResponseDto> {
    return this.adminRolesService.deleteRole(id, admin);
  }
}
