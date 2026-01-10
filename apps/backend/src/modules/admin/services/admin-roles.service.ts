import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Role } from '@modules/auth/entities/role.entity';
import { UserRole } from '@modules/auth/entities/user-role.entity';
import { ActivityLog } from '../entities/activity-log.entity';
import {
  RoleDto,
  PermissionDto,
  UpdatePermissionsDto,
  RolePermissionsDto,
} from '../dto/roles';
import { RequestUser } from '@shared/decorators/current-user.decorator';
import { PermissionKeyEnum } from '@shared/constants';

/**
 * FIX-2025-01-07 P0: Permission Metadata Registry
 *
 * ============================================================================
 * ARQUITECTURA DEL SISTEMA DE PERMISOS
 * ============================================================================
 *
 * FUENTE ÚNICA DE VERDAD:
 * - PermissionKeyEnum (enums.constants.ts) define las claves válidas
 * - PERMISSION_METADATA (abajo) define display names, descripciones y categorías
 * - UpdateRolePermissionsDto valida contra VALID_PERMISSION_KEYS
 *
 * FLUJO DE ADICIÓN DE NUEVOS PERMISOS:
 * 1. Agregar a PermissionKeyEnum en @shared/constants/enums.constants.ts
 * 2. Agregar metadata en PERMISSION_METADATA abajo
 * 3. El DTO automáticamente validará la nueva clave
 *
 * ALMACENAMIENTO:
 * - Role.permissions: Record<string, boolean> en auth_management.roles
 * - Se guarda como JSONB, permite permisos custom por rol
 *
 * VALIDACIÓN:
 * - UpdateRolePermissionsDto usa ValidPermissionsConstraint
 * - Solo acepta claves de PermissionKeyEnum con valores booleanos
 *
 * AUDITORÍA:
 * - Cambios se registran en audit_logging.activity_log
 * - Incluye before/after state y admin que hizo el cambio
 *
 * @see PermissionKeyEnum - Claves de permisos válidas
 * @see ValidPermissionsConstraint - Validador del DTO
 * @see ActivityLog - Tabla de auditoría
 * ============================================================================
 */
const PERMISSION_METADATA: Record<
  string,
  { displayName: string; description: string; category: string }
> = {
  // Content permissions
  [PermissionKeyEnum.CAN_CREATE_CONTENT]: {
    displayName: 'Can Create Content',
    description: 'Allows user to create new content in the platform',
    category: 'content',
  },
  [PermissionKeyEnum.CAN_EDIT_CONTENT]: {
    displayName: 'Can Edit Content',
    description: 'Allows user to edit existing content',
    category: 'content',
  },
  [PermissionKeyEnum.CAN_DELETE_CONTENT]: {
    displayName: 'Can Delete Content',
    description: 'Allows user to delete content',
    category: 'content',
  },
  [PermissionKeyEnum.CAN_APPROVE_CONTENT]: {
    displayName: 'Can Approve Content',
    description: 'Allows user to approve content for publication',
    category: 'content',
  },

  // User management permissions
  [PermissionKeyEnum.CAN_CREATE_USERS]: {
    displayName: 'Can Create Users',
    description: 'Allows user to create new user accounts',
    category: 'users',
  },
  [PermissionKeyEnum.CAN_EDIT_USERS]: {
    displayName: 'Can Edit Users',
    description: 'Allows user to edit user information',
    category: 'users',
  },
  [PermissionKeyEnum.CAN_DELETE_USERS]: {
    displayName: 'Can Delete Users',
    description: 'Allows user to delete user accounts',
    category: 'users',
  },
  [PermissionKeyEnum.CAN_SUSPEND_USERS]: {
    displayName: 'Can Suspend Users',
    description: 'Allows user to suspend or ban users',
    category: 'users',
  },

  // Organization permissions
  [PermissionKeyEnum.CAN_MANAGE_ORGANIZATIONS]: {
    displayName: 'Can Manage Organizations',
    description: 'Allows user to manage organizations/tenants',
    category: 'organizations',
  },

  // System permissions
  [PermissionKeyEnum.CAN_MANAGE_SETTINGS]: {
    displayName: 'Can Manage Settings',
    description: 'Allows user to modify system settings',
    category: 'system',
  },

  // Reports permissions
  [PermissionKeyEnum.CAN_VIEW_REPORTS]: {
    displayName: 'Can View Reports',
    description: 'Allows user to view system reports',
    category: 'reports',
  },
  [PermissionKeyEnum.CAN_GENERATE_REPORTS]: {
    displayName: 'Can Generate Reports',
    description: 'Allows user to generate custom reports',
    category: 'reports',
  },

  // Gamification permissions
  [PermissionKeyEnum.CAN_MANAGE_GAMIFICATION]: {
    displayName: 'Can Manage Gamification',
    description: 'Allows user to configure gamification settings',
    category: 'gamification',
  },

  // Analytics permissions
  [PermissionKeyEnum.CAN_VIEW_ANALYTICS]: {
    displayName: 'Can View Analytics',
    description: 'Allows user to view platform analytics',
    category: 'analytics',
  },

  // Admin permissions
  [PermissionKeyEnum.CAN_ACCESS_ADMIN_PANEL]: {
    displayName: 'Can Access Admin Panel',
    description: 'Allows user to access the admin panel',
    category: 'admin',
  },
  [PermissionKeyEnum.CAN_MANAGE_ROLES]: {
    displayName: 'Can Manage Roles',
    description: 'Allows user to manage roles and permissions',
    category: 'admin',
  },
};

@Injectable()
export class AdminRolesService {
  private readonly logger = new Logger(AdminRolesService.name);

  constructor(
    @InjectRepository(Role, 'auth')
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(UserRole, 'auth')
    private readonly userRoleRepo: Repository<UserRole>,
    @InjectDataSource('auth')
    private readonly authDataSource: DataSource,
  ) {}

  /**
   * Get all available roles with their permissions
   */
  async getRoles(): Promise<RoleDto[]> {
    const roles = await this.roleRepo.find({
      order: { name: 'ASC' },
    });

    // Map role names from Role entity to GamilityRoleEnum values for UserRole queries
    const roleNameToEnum: Record<string, string> = {
      'student': 'student',
      'teacher': 'admin_teacher',
      'admin': 'super_admin',
      'super_admin': 'super_admin',
      'admin_teacher': 'admin_teacher',
    };

    // Get user counts for each role
    const rolesWithCounts = await Promise.all(
      roles.map(async (role) => {
        // Map the role name to the corresponding GamilityRoleEnum value
        const enumValue = roleNameToEnum[role.name] || role.name;

        let usersCount = 0;
        try {
          usersCount = await this.userRoleRepo.count({
            where: {
              role: enumValue as any,
              is_active: true,
            },
          });
        } catch (error) {
          // If role name doesn't match GamilityRoleEnum, default to 0
          console.warn(`Could not count users for role ${role.name}:`, error);
          usersCount = 0;
        }

        return {
          id: role.id,
          name: role.name,
          description: role.description,
          permissions: role.permissions,
          is_active: role.is_active,
          users_count: usersCount,
          created_at: role.created_at.toISOString(),
          updated_at: role.updated_at.toISOString(),
        };
      }),
    );

    return rolesWithCounts;
  }

  /**
   * Get permissions for a specific role
   */
  async getRolePermissions(roleId: string): Promise<RolePermissionsDto> {
    const role = await this.roleRepo.findOne({ where: { id: roleId } });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    return {
      role_id: role.id,
      role_name: role.name,
      permissions: role.permissions,
      updated_at: role.updated_at.toISOString(),
    };
  }

  /**
   * Update permissions for a specific role
   * FIX-2025-01-07 P0: Added audit logging for permission changes
   *
   * @param roleId - The role ID to update
   * @param updateDto - The permissions to update
   * @param admin - The admin user making the change (for audit trail)
   */
  async updateRolePermissions(
    roleId: string,
    updateDto: UpdatePermissionsDto,
    admin?: RequestUser,
  ): Promise<RolePermissionsDto> {
    const role = await this.roleRepo.findOne({ where: { id: roleId } });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    // FIX-2025-01-07 P0: Capture before state for audit
    const previousPermissions = { ...role.permissions };

    // Update permissions
    role.permissions = updateDto.permissions;
    const updatedRole = await this.roleRepo.save(role);

    // FIX-2025-01-07 P0: Create audit log entry
    await this.logPermissionChange(
      admin,
      roleId,
      role.name,
      previousPermissions,
      updateDto.permissions,
    );

    return {
      role_id: updatedRole.id,
      role_name: updatedRole.name,
      permissions: updatedRole.permissions,
      updated_at: updatedRole.updated_at.toISOString(),
    };
  }

  /**
   * FIX-2025-01-07 P0: Log permission change to audit_logging.activity_log
   * Creates an audit trail of who changed what permissions and when
   *
   * @param admin - The admin user who made the change
   * @param roleId - The role that was modified
   * @param roleName - The role name for description
   * @param previousPermissions - The permissions before the change
   * @param newPermissions - The permissions after the change
   */
  private async logPermissionChange(
    admin: RequestUser | undefined,
    roleId: string,
    roleName: string,
    previousPermissions: Record<string, boolean>,
    newPermissions: Record<string, boolean>,
  ): Promise<void> {
    try {
      // Calculate what changed
      const changes = this.calculatePermissionChanges(
        previousPermissions,
        newPermissions,
      );

      const adminId = admin?.sub || 'system';
      const adminEmail = admin?.email || 'system@gamilit.com';

      // Insert audit log using raw query (cross-schema)
      await this.authDataSource.query(
        `INSERT INTO audit_logging.activity_log
          (user_id, action_type, entity_type, entity_id, description, metadata)
         VALUES
          ($1, $2, $3, $4, $5, $6)`,
        [
          adminId,
          'role_permissions_updated',
          'role',
          roleId,
          `Admin ${adminEmail} updated permissions for role "${roleName}". ` +
            `Added: ${changes.added.length}, Removed: ${changes.removed.length}, Changed: ${changes.changed.length}`,
          JSON.stringify({
            role_id: roleId,
            role_name: roleName,
            admin_id: adminId,
            admin_email: adminEmail,
            previous_permissions: previousPermissions,
            new_permissions: newPermissions,
            changes: {
              added: changes.added,
              removed: changes.removed,
              changed: changes.changed,
            },
            timestamp: new Date().toISOString(),
          }),
        ],
      );

      this.logger.log(
        `Permission change audit logged: role=${roleName}, admin=${adminEmail}, ` +
          `added=${changes.added.length}, removed=${changes.removed.length}, changed=${changes.changed.length}`,
      );
    } catch (error) {
      // Don't fail the main operation if audit logging fails
      this.logger.error('Failed to log permission change to audit log', error);
    }
  }

  /**
   * Calculate what permissions changed between two permission objects
   */
  private calculatePermissionChanges(
    previous: Record<string, boolean>,
    current: Record<string, boolean>,
  ): {
    added: string[];
    removed: string[];
    changed: Array<{ key: string; from: boolean; to: boolean }>;
  } {
    const previousKeys = Object.keys(previous);
    const currentKeys = Object.keys(current);

    // Permissions added (in current but not in previous)
    const added = currentKeys.filter(
      (key) => !(key in previous) && current[key] === true,
    );

    // Permissions removed (in previous but not in current)
    const removed = previousKeys.filter(
      (key) => !(key in current) && previous[key] === true,
    );

    // Permissions whose value changed
    const changed: Array<{ key: string; from: boolean; to: boolean }> = [];
    for (const key of currentKeys) {
      if (key in previous && previous[key] !== current[key]) {
        changed.push({ key, from: previous[key], to: current[key] });
      }
    }

    return { added, removed, changed };
  }

  /**
   * Get all available permissions in the system
   * FIX-2025-01-07 P0: Refactored to use PermissionKeyEnum as single source of truth
   *
   * @returns Array of all available permissions with metadata
   * @see PERMISSION_METADATA - Contains display names, descriptions and categories
   * @see PermissionKeyEnum - Defines all valid permission keys
   */
  async getAvailablePermissions(): Promise<PermissionDto[]> {
    // Generate permissions list from PermissionKeyEnum + PERMISSION_METADATA
    // This ensures synchronization between:
    // - Valid permission keys (PermissionKeyEnum)
    // - Permission metadata (PERMISSION_METADATA)
    // - DTO validation (VALID_PERMISSION_KEYS)
    const permissions: PermissionDto[] = Object.values(PermissionKeyEnum).map(
      (key) => {
        const metadata = PERMISSION_METADATA[key];
        if (!metadata) {
          // Fallback for permissions without metadata (shouldn't happen if properly maintained)
          this.logger.warn(
            `Permission "${key}" is missing metadata. Please add it to PERMISSION_METADATA.`,
          );
          return {
            key,
            displayName: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
            description: `Permission: ${key}`,
            category: 'uncategorized',
          };
        }
        return {
          key,
          ...metadata,
        };
      },
    );

    return permissions;
  }
}
