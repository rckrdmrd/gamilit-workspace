import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../roles.guard';
import { GamilityRoleEnum } from '@/shared/constants';

/**
 * Tests para RolesGuard
 *
 * Nota: GamilityRoleEnum tiene los siguientes valores:
 * - STUDENT = 'student'
 * - ADMIN_TEACHER = 'admin_teacher'
 * - SUPER_ADMIN = 'super_admin'
 */
describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockExecutionContext = (user?: { role: GamilityRoleEnum }): ExecutionContext => {
    const mockRequest = user ? { user } : {};

    return {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getType: jest.fn().mockReturnValue('http'),
    } as unknown as ExecutionContext;
  };

  describe('canActivate', () => {
    it('should be defined', () => {
      expect(guard).toBeDefined();
    });

    it('should allow access when no roles are required', () => {
      // Arrange
      const mockContext = createMockExecutionContext({ role: GamilityRoleEnum.STUDENT });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should allow access when roles array is empty', () => {
      // Arrange
      const mockContext = createMockExecutionContext({ role: GamilityRoleEnum.STUDENT });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should deny access when user is not present in request', () => {
      // Arrange
      const mockContext = createMockExecutionContext(); // No user
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([GamilityRoleEnum.SUPER_ADMIN]);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(false);
    });

    it('should allow access when user has required role', () => {
      // Arrange
      const mockContext = createMockExecutionContext({ role: GamilityRoleEnum.SUPER_ADMIN });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([GamilityRoleEnum.SUPER_ADMIN]);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should deny access when user does not have required role', () => {
      // Arrange
      const mockContext = createMockExecutionContext({ role: GamilityRoleEnum.STUDENT });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([GamilityRoleEnum.SUPER_ADMIN]);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(false);
    });

    it('should allow access when user has one of multiple required roles', () => {
      // Arrange
      const mockContext = createMockExecutionContext({ role: GamilityRoleEnum.ADMIN_TEACHER });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
        GamilityRoleEnum.SUPER_ADMIN,
        GamilityRoleEnum.ADMIN_TEACHER,
      ]);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should deny access when user has none of multiple required roles', () => {
      // Arrange
      const mockContext = createMockExecutionContext({ role: GamilityRoleEnum.STUDENT });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
        GamilityRoleEnum.SUPER_ADMIN,
        GamilityRoleEnum.ADMIN_TEACHER,
      ]);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(false);
    });

    it('should use reflector to get roles from both handler and class', () => {
      // Arrange
      const mockContext = createMockExecutionContext({ role: GamilityRoleEnum.SUPER_ADMIN });
      const getAllAndOverrideSpy = jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([GamilityRoleEnum.SUPER_ADMIN]);

      // Act
      guard.canActivate(mockContext);

      // Assert
      expect(getAllAndOverrideSpy).toHaveBeenCalledWith('roles', [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
    });
  });

  describe('role hierarchy scenarios', () => {
    it('should not allow STUDENT to access SUPER_ADMIN routes', () => {
      const mockContext = createMockExecutionContext({ role: GamilityRoleEnum.STUDENT });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([GamilityRoleEnum.SUPER_ADMIN]);

      expect(guard.canActivate(mockContext)).toBe(false);
    });

    it('should not allow STUDENT to access ADMIN_TEACHER routes', () => {
      const mockContext = createMockExecutionContext({ role: GamilityRoleEnum.STUDENT });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([GamilityRoleEnum.ADMIN_TEACHER]);

      expect(guard.canActivate(mockContext)).toBe(false);
    });

    it('should not allow ADMIN_TEACHER to access SUPER_ADMIN routes', () => {
      const mockContext = createMockExecutionContext({ role: GamilityRoleEnum.ADMIN_TEACHER });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([GamilityRoleEnum.SUPER_ADMIN]);

      expect(guard.canActivate(mockContext)).toBe(false);
    });

    it('should allow SUPER_ADMIN to access SUPER_ADMIN routes', () => {
      const mockContext = createMockExecutionContext({ role: GamilityRoleEnum.SUPER_ADMIN });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([GamilityRoleEnum.SUPER_ADMIN]);

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should allow ADMIN_TEACHER to access ADMIN_TEACHER routes', () => {
      const mockContext = createMockExecutionContext({ role: GamilityRoleEnum.ADMIN_TEACHER });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([GamilityRoleEnum.ADMIN_TEACHER]);

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should allow STUDENT to access STUDENT routes', () => {
      const mockContext = createMockExecutionContext({ role: GamilityRoleEnum.STUDENT });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([GamilityRoleEnum.STUDENT]);

      expect(guard.canActivate(mockContext)).toBe(true);
    });
  });

  describe('multi-role routes', () => {
    it('should allow ADMIN_TEACHER on routes for STUDENT or ADMIN_TEACHER', () => {
      const mockContext = createMockExecutionContext({ role: GamilityRoleEnum.ADMIN_TEACHER });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
        GamilityRoleEnum.STUDENT,
        GamilityRoleEnum.ADMIN_TEACHER,
      ]);

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should allow STUDENT on routes for STUDENT or ADMIN_TEACHER', () => {
      const mockContext = createMockExecutionContext({ role: GamilityRoleEnum.STUDENT });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
        GamilityRoleEnum.STUDENT,
        GamilityRoleEnum.ADMIN_TEACHER,
      ]);

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should allow SUPER_ADMIN on routes for all roles', () => {
      const mockContext = createMockExecutionContext({ role: GamilityRoleEnum.SUPER_ADMIN });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
        GamilityRoleEnum.STUDENT,
        GamilityRoleEnum.ADMIN_TEACHER,
        GamilityRoleEnum.SUPER_ADMIN,
      ]);

      expect(guard.canActivate(mockContext)).toBe(true);
    });
  });

  describe('constructor', () => {
    it('should be instantiable with Reflector', () => {
      const newReflector = new Reflector();
      const newGuard = new RolesGuard(newReflector);
      expect(newGuard).toBeInstanceOf(RolesGuard);
    });
  });
});
