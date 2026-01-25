import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { AdminRolesService } from '../services/admin-roles.service';
import { Role } from '@modules/auth/entities/role.entity';
import { UserRole } from '@modules/auth/entities/user-role.entity';
import { UpdatePermissionsDto } from '../dto/roles';

describe('AdminRolesService', () => {
  let service: AdminRolesService;
  let _roleRepository: Repository<Role>;
  let _userRoleRepository: Repository<UserRole>;

  const mockRole: Partial<Role> = {
    id: 'role-1',
    name: 'admin',
    description: 'Administrator role',
    permissions: { can_create_content: true, can_edit_content: true, can_delete_content: true },
    is_active: true,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  };

  const mockStudentRole: Partial<Role> = {
    id: 'role-2',
    name: 'student',
    description: 'Student role',
    permissions: { can_view_content: true },
    is_active: true,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  };

  const mockRoleRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserRoleRepository = {
    count: jest.fn(),
    find: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn(),
        findOne: jest.fn(),
      },
    }),
    manager: {
      transaction: jest.fn(),
    },
    query: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminRolesService,
        {
          provide: getRepositoryToken(Role, 'auth'),
          useValue: mockRoleRepository,
        },
        {
          provide: getRepositoryToken(UserRole, 'auth'),
          useValue: mockUserRoleRepository,
        },
        {
          provide: getDataSourceToken('auth'),
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<AdminRolesService>(AdminRolesService);
    _roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role, 'auth'));
    _userRoleRepository = module.get<Repository<UserRole>>(getRepositoryToken(UserRole, 'auth'));

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =====================================================
  // GETROLES TESTS
  // =====================================================

  describe('getRoles', () => {
    it('should return all roles with user counts', async () => {
      const roles = [mockRole, mockStudentRole];
      mockRoleRepository.find.mockResolvedValue(roles);
      mockUserRoleRepository.count.mockResolvedValueOnce(5); // admin users
      mockUserRoleRepository.count.mockResolvedValueOnce(100); // student users

      const result = await service.getRoles();

      expect(mockRoleRepository.find).toHaveBeenCalledWith({
        order: { name: 'ASC' },
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'role-1',
        name: 'admin',
        description: 'Administrator role',
        permissions: { can_create_content: true, can_edit_content: true, can_delete_content: true },
        is_active: true,
        users_count: 5,
      });
      expect(result[1].users_count).toBe(100);
    });

    it('should map role names to enum values correctly', async () => {
      const teacherRole: Partial<Role> = {
        ...mockRole,
        id: 'role-3',
        name: 'teacher',
      };

      mockRoleRepository.find.mockResolvedValue([teacherRole]);
      mockUserRoleRepository.count.mockResolvedValue(10);

      await service.getRoles();

      // Should map 'teacher' to 'admin_teacher' enum value
      expect(mockUserRoleRepository.count).toHaveBeenCalledWith({
        where: {
          role: 'admin_teacher',
          is_active: true,
        },
      });
    });

    it('should handle user count errors gracefully', async () => {
      mockRoleRepository.find.mockResolvedValue([mockRole]);
      mockUserRoleRepository.count.mockRejectedValue(new Error('Database error'));

      const result = await service.getRoles();

      expect(result[0].users_count).toBe(0);
    });

    it('should return empty array when no roles exist', async () => {
      mockRoleRepository.find.mockResolvedValue([]);

      const result = await service.getRoles();

      expect(result).toEqual([]);
    });

    it('should format dates as ISO strings', async () => {
      mockRoleRepository.find.mockResolvedValue([mockRole]);
      mockUserRoleRepository.count.mockResolvedValue(5);

      const result = await service.getRoles();

      expect(result[0].created_at).toBe('2024-01-01T00:00:00.000Z');
      expect(result[0].updated_at).toBe('2024-01-01T00:00:00.000Z');
    });
  });

  // =====================================================
  // GETROLEPERMISSIONS TESTS
  // =====================================================

  describe('getRolePermissions', () => {
    it('should return permissions for a specific role', async () => {
      mockRoleRepository.findOne.mockResolvedValue(mockRole);

      const result = await service.getRolePermissions('role-1');

      expect(mockRoleRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'role-1' },
      });

      expect(result).toEqual({
        role_id: 'role-1',
        role_name: 'admin',
        permissions: { can_create_content: true, can_edit_content: true, can_delete_content: true },
        updated_at: '2024-01-01T00:00:00.000Z',
      });
    });

    it('should throw NotFoundException when role does not exist', async () => {
      mockRoleRepository.findOne.mockResolvedValue(null);

      await expect(service.getRolePermissions('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.getRolePermissions('non-existent')).rejects.toThrow('Role with ID non-existent not found');
    });

    it('should return empty permissions object if role has no permissions', async () => {
      const roleWithoutPerms = { ...mockRole, permissions: {} };
      mockRoleRepository.findOne.mockResolvedValue(roleWithoutPerms);

      const result = await service.getRolePermissions('role-1');

      expect(result.permissions).toEqual({});
    });
  });

  // =====================================================
  // UPDATEPERMISSIONS TESTS
  // =====================================================

  describe('updateRolePermissions', () => {
    const updateDto: UpdatePermissionsDto = {
      permissions: ['can_create_content', 'can_edit_content', 'can_view_analytics'],
    };

    it('should update role permissions successfully', async () => {
      const updatedRole = {
        ...mockRole,
        permissions: updateDto.permissions,
        updated_at: new Date('2024-12-05'),
      };

      mockRoleRepository.findOne.mockResolvedValue(mockRole);
      mockRoleRepository.save.mockResolvedValue(updatedRole);

      const result = await service.updateRolePermissions('role-1', updateDto);

      expect(mockRoleRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'role-1' },
      });

      expect(mockRoleRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          permissions: ['can_create_content', 'can_edit_content', 'can_view_analytics'],
        })
      );

      expect(result).toEqual({
        role_id: 'role-1',
        role_name: 'admin',
        permissions: ['can_create_content', 'can_edit_content', 'can_view_analytics'],
        updated_at: '2024-12-05T00:00:00.000Z',
      });
    });

    it('should throw NotFoundException when role does not exist', async () => {
      mockRoleRepository.findOne.mockResolvedValue(null);

      await expect(service.updateRolePermissions('non-existent', updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.updateRolePermissions('non-existent', updateDto)).rejects.toThrow('Role with ID non-existent not found');
    });

    it('should allow updating to empty permissions array', async () => {
      const emptyPermsDto: UpdatePermissionsDto = {
        permissions: [],
      };

      const updatedRole = {
        ...mockRole,
        permissions: [],
      };

      mockRoleRepository.findOne.mockResolvedValue(mockRole);
      mockRoleRepository.save.mockResolvedValue(updatedRole);

      const result = await service.updateRolePermissions('role-1', emptyPermsDto);

      expect(result.permissions).toEqual([]);
    });

    it('should replace all permissions, not merge them', async () => {
      const newPermsDto: UpdatePermissionsDto = {
        permissions: ['can_view_reports'],
      };

      const updatedRole = {
        ...mockRole,
        permissions: ['can_view_reports'],
      };

      mockRoleRepository.findOne.mockResolvedValue(mockRole);
      mockRoleRepository.save.mockResolvedValue(updatedRole);

      const result = await service.updateRolePermissions('role-1', newPermsDto);

      expect(result.permissions).toEqual(['can_view_reports']);
      expect(result.permissions).not.toContain('can_create_content');
    });

    it('should handle updating multiple permissions at once', async () => {
      const manyPermsDto: UpdatePermissionsDto = {
        permissions: [
          'can_create_content',
          'can_edit_content',
          'can_delete_content',
          'can_approve_content',
          'can_view_analytics',
          'can_generate_reports',
        ],
      };

      const updatedRole = {
        ...mockRole,
        permissions: manyPermsDto.permissions,
      };

      mockRoleRepository.findOne.mockResolvedValue(mockRole);
      mockRoleRepository.save.mockResolvedValue(updatedRole);

      const result = await service.updateRolePermissions('role-1', manyPermsDto);

      expect(result.permissions).toHaveLength(6);
    });
  });

  // =====================================================
  // GETAVAILABLEPERMISSIONS TESTS
  // =====================================================

  describe('getAvailablePermissions', () => {
    it('should return all available permissions in the system', async () => {
      const result = await service.getAvailablePermissions();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return permissions with correct structure', async () => {
      const result = await service.getAvailablePermissions();

      const firstPermission = result[0];
      expect(firstPermission).toHaveProperty('key');
      expect(firstPermission).toHaveProperty('displayName');
      expect(firstPermission).toHaveProperty('description');
      expect(firstPermission).toHaveProperty('category');
    });

    it('should include content permissions', async () => {
      const result = await service.getAvailablePermissions();

      const contentPermissions = result.filter(p => p.category === 'content');
      expect(contentPermissions.length).toBeGreaterThan(0);

      const canCreateContent = contentPermissions.find(p => p.key === 'can_create_content');
      expect(canCreateContent).toBeDefined();
      expect(canCreateContent?.displayName).toBe('Can Create Content');
    });

    it('should include user management permissions', async () => {
      const result = await service.getAvailablePermissions();

      const userPermissions = result.filter(p => p.category === 'users');
      expect(userPermissions.length).toBeGreaterThan(0);

      const canCreateUsers = userPermissions.find(p => p.key === 'can_create_users');
      expect(canCreateUsers).toBeDefined();
    });

    it('should include system permissions', async () => {
      const result = await service.getAvailablePermissions();

      const systemPermissions = result.filter(p => p.category === 'system');
      expect(systemPermissions.length).toBeGreaterThan(0);
    });

    it('should include reports permissions', async () => {
      const result = await service.getAvailablePermissions();

      const reportPermissions = result.filter(p => p.category === 'reports');
      expect(reportPermissions.length).toBeGreaterThan(0);

      const canViewReports = reportPermissions.find(p => p.key === 'can_view_reports');
      expect(canViewReports).toBeDefined();
    });

    it('should include admin permissions', async () => {
      const result = await service.getAvailablePermissions();

      const adminPermissions = result.filter(p => p.category === 'admin');
      expect(adminPermissions.length).toBeGreaterThan(0);

      const canAccessAdminPanel = adminPermissions.find(p => p.key === 'can_access_admin_panel');
      expect(canAccessAdminPanel).toBeDefined();
    });

    it('should include gamification permissions', async () => {
      const result = await service.getAvailablePermissions();

      const gamificationPerms = result.filter(p => p.category === 'gamification');
      expect(gamificationPerms.length).toBeGreaterThan(0);

      const canManageGamification = gamificationPerms.find(p => p.key === 'can_manage_gamification');
      expect(canManageGamification).toBeDefined();
    });

    it('should have unique permission keys', async () => {
      const result = await service.getAvailablePermissions();

      const keys = result.map(p => p.key);
      const uniqueKeys = new Set(keys);

      expect(uniqueKeys.size).toBe(keys.length);
    });

    it('should categorize all permissions', async () => {
      const result = await service.getAvailablePermissions();

      const validCategories = [
        'content',
        'users',
        'organizations',
        'system',
        'reports',
        'gamification',
        'analytics',
        'admin',
      ];

      result.forEach(permission => {
        expect(validCategories).toContain(permission.category);
      });
    });
  });

  // =====================================================
  // INTEGRATION SCENARIOS
  // =====================================================

  describe('integration scenarios', () => {
    it('should handle getting roles and then updating permissions', async () => {
      // Get roles
      mockRoleRepository.find.mockResolvedValue([mockRole]);
      mockUserRoleRepository.count.mockResolvedValue(5);

      const roles = await service.getRoles();
      const firstRole = roles[0];

      expect(firstRole.id).toBe('role-1');

      // Update permissions
      const updateDto: UpdatePermissionsDto = {
        permissions: ['can_view_analytics'],
      };

      mockRoleRepository.findOne.mockResolvedValue(mockRole);
      mockRoleRepository.save.mockResolvedValue({
        ...mockRole,
        permissions: updateDto.permissions,
      });

      const updated = await service.updateRolePermissions(firstRole.id, updateDto);

      expect(updated.permissions).toEqual(['can_view_analytics']);
    });

    it('should handle role name mapping edge cases', async () => {
      const superAdminRole: Partial<Role> = {
        ...mockRole,
        id: 'role-4',
        name: 'super_admin',
      };

      mockRoleRepository.find.mockResolvedValue([superAdminRole]);
      mockUserRoleRepository.count.mockResolvedValue(2);

      const _result = await service.getRoles();

      // super_admin should map to super_admin (same)
      expect(mockUserRoleRepository.count).toHaveBeenCalledWith({
        where: {
          role: 'super_admin',
          is_active: true,
        },
      });
    });
  });
});
