import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from '../jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  describe('canActivate', () => {
    it('should be defined', () => {
      expect(guard).toBeDefined();
    });

    it('should extend AuthGuard', () => {
      // Verify the guard has canActivate method
      expect(typeof guard.canActivate).toBe('function');
    });

    it('should call super.canActivate with the execution context', async () => {
      // Create mock execution context
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
        user: { id: 'user-1', email: 'test@example.com', role: 'student' },
      };

      const mockExecutionContext: Partial<ExecutionContext> = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
          getResponse: jest.fn().mockReturnValue({}),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
        getType: jest.fn().mockReturnValue('http'),
      };

      // Mock the parent class canActivate to return true
      const superCanActivateSpy = jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
        .mockReturnValue(true);

      const result = guard.canActivate(mockExecutionContext as ExecutionContext);

      // The guard should delegate to the parent AuthGuard
      expect(superCanActivateSpy).toHaveBeenCalledWith(mockExecutionContext);

      superCanActivateSpy.mockRestore();
    });

    it('should return boolean, Promise<boolean>, or Observable<boolean>', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
      };

      const mockExecutionContext: Partial<ExecutionContext> = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
          getResponse: jest.fn().mockReturnValue({}),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
        getType: jest.fn().mockReturnValue('http'),
      };

      // Mock parent to return true
      jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
        .mockReturnValue(true);

      const result = guard.canActivate(mockExecutionContext as ExecutionContext);

      // Result should be boolean, Promise, or Observable
      const isValidType =
        typeof result === 'boolean' ||
        result instanceof Promise ||
        (result && typeof (result as any).subscribe === 'function');

      expect(isValidType).toBe(true);
    });

    it('should handle missing authorization header gracefully', async () => {
      const mockRequest = {
        headers: {},
      };

      const mockExecutionContext: Partial<ExecutionContext> = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
          getResponse: jest.fn().mockReturnValue({}),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
        getType: jest.fn().mockReturnValue('http'),
      };

      // Mock parent to return false (invalid/missing token)
      const superCanActivateSpy = jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
        .mockReturnValue(false);

      const result = guard.canActivate(mockExecutionContext as ExecutionContext);

      expect(result).toBe(false);

      superCanActivateSpy.mockRestore();
    });
  });

  describe('constructor', () => {
    it('should be instantiable', () => {
      const newGuard = new JwtAuthGuard();
      expect(newGuard).toBeInstanceOf(JwtAuthGuard);
    });
  });
});
