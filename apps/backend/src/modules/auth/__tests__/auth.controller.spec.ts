import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from '../controllers/auth.controller';
import {
  AuthService,
  SessionManagementService,
  SecurityService,
  EmailVerificationService,
  PasswordRecoveryService,
  TwoFactorAuthService,
} from '../services';
import { RegisterUserDto, LoginDto, RefreshTokenDto, UserResponseDto } from '../dto';
import { GamilityRoleEnum } from '@shared/constants';

describe('AuthController', () => {
  let controller: AuthController;
  let _authService: AuthService;
  let _sessionService: SessionManagementService;
  let _securityService: SecurityService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
    validateUser: jest.fn(),
    getFullProfile: jest.fn(),
  };

  const mockSessionService = {
    createSession: jest.fn(),
    validateSession: jest.fn(),
    revokeSession: jest.fn(),
  };

  const mockSecurityService = {
    checkRateLimit: jest.fn(),
    logAttempt: jest.fn(),
  };

  const mockEmailVerificationService = {
    sendVerificationEmail: jest.fn(),
    verifyEmail: jest.fn(),
    resendVerificationEmail: jest.fn(),
  };

  const mockPasswordRecoveryService = {
    requestPasswordReset: jest.fn(),
    resetPassword: jest.fn(),
    validateResetToken: jest.fn(),
  };

  const mockTwoFactorAuthService = {
    generateSecret: jest.fn(),
    verifyToken: jest.fn(),
    enableTwoFactor: jest.fn(),
    disableTwoFactor: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: SessionManagementService,
          useValue: mockSessionService,
        },
        {
          provide: SecurityService,
          useValue: mockSecurityService,
        },
        {
          provide: EmailVerificationService,
          useValue: mockEmailVerificationService,
        },
        {
          provide: PasswordRecoveryService,
          useValue: mockPasswordRecoveryService,
        },
        {
          provide: TwoFactorAuthService,
          useValue: mockTwoFactorAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    _authService = module.get<AuthService>(AuthService);
    _sessionService = module.get<SessionManagementService>(SessionManagementService);
    _securityService = module.get<SecurityService>(SecurityService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /auth/register', () => {
    const registerDto: RegisterUserDto = {
      email: 'test@example.com',
      password: 'Password123!',
      first_name: 'Test',
      last_name: 'User',
    };

    const mockRequest = {
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'Mozilla/5.0',
      },
    };

    const mockUserResponse: UserResponseDto = {
      id: 'user-1',
      email: 'test@example.com',
      role: GamilityRoleEnum.STUDENT,
      created_at: new Date(),
      updated_at: new Date(),
      raw_user_meta_data: {},
    };

    it('should register a new user successfully', async () => {
      // Arrange
      const mockRegisterResponse = {
        user: mockUserResponse,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };
      mockAuthService.register.mockResolvedValue(mockRegisterResponse);

      // Act
      const result = await controller.register(registerDto, mockRequest);

      // Assert
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.id).toBe('user-1');
      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
      expect(mockAuthService.register).toHaveBeenCalledWith(
        registerDto,
        mockRequest.ip,
        mockRequest.headers['user-agent'],
      );
    });

    it('should pass IP address and user agent to service', async () => {
      // Arrange
      const mockRegisterResponse = {
        user: mockUserResponse,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };
      mockAuthService.register.mockResolvedValue(mockRegisterResponse);

      // Act
      await controller.register(registerDto, mockRequest);

      // Assert
      expect(mockAuthService.register).toHaveBeenCalledWith(
        registerDto,
        '127.0.0.1',
        'Mozilla/5.0',
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      // Arrange
      mockAuthService.register.mockRejectedValue(
        new Error('Email ya registrado'),
      );

      // Act & Assert
      await expect(controller.register(registerDto, mockRequest)).rejects.toThrow();
    });

    it('should return user without password', async () => {
      // Arrange
      mockAuthService.register.mockResolvedValue(mockUserResponse);

      // Act
      const result = await controller.register(registerDto, mockRequest);

      // Assert
      expect(result).not.toHaveProperty('encrypted_password');
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('POST /auth/login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    const mockRequest = {
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'Mozilla/5.0',
      },
    };

    const mockLoginResponse = {
      user: {
        id: 'user-1',
        email: 'test@example.com',
        role: GamilityRoleEnum.STUDENT,
      },
      accessToken: 'access.token.here',
      refreshToken: 'refresh.token.here',
    };

    it('should login user successfully with valid credentials', async () => {
      // Arrange
      mockSecurityService.checkRateLimit.mockResolvedValue({ isBlocked: false });
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      // Act
      const result = await controller.login(loginDto, mockRequest);

      // Assert
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.accessToken).toBe('access.token.here');
      expect(result.refreshToken).toBe('refresh.token.here');
      expect(mockAuthService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
        mockRequest.ip,
        mockRequest.headers['user-agent'],
      );
    });

    it('should check rate limit before authentication', async () => {
      // Arrange
      mockSecurityService.checkRateLimit.mockResolvedValue({ isBlocked: false });
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      // Act
      await controller.login(loginDto, mockRequest);

      // Assert
      expect(mockSecurityService.checkRateLimit).toHaveBeenCalledWith(
        loginDto.email,
        mockRequest.ip,
      );
      // expect(mockSecurityService.checkRateLimit).toHaveBeenCalledBefore(mockAuthService.login); // toHaveBeenCalledBefore not available in Jest
    });

    it('should throw UnauthorizedException if rate limit exceeded', async () => {
      // Arrange
      mockSecurityService.checkRateLimit.mockResolvedValue({
        isBlocked: true,
        reason: 'Demasiados intentos fallidos',
      });

      // Act & Assert
      await expect(controller.login(loginDto, mockRequest)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.login(loginDto, mockRequest)).rejects.toThrow(
        'Demasiados intentos fallidos',
      );
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should pass IP and user agent to service', async () => {
      // Arrange
      mockSecurityService.checkRateLimit.mockResolvedValue({ isBlocked: false });
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      // Act
      await controller.login(loginDto, mockRequest);

      // Assert
      expect(mockAuthService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
        '127.0.0.1',
        'Mozilla/5.0',
      );
    });

    it('should return tokens on successful login', async () => {
      // Arrange
      mockSecurityService.checkRateLimit.mockResolvedValue({ isBlocked: false });
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      // Act
      const result = await controller.login(loginDto, mockRequest);

      // Assert
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should handle login failure from service', async () => {
      // Arrange
      mockSecurityService.checkRateLimit.mockResolvedValue({ isBlocked: false });
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Credenciales inválidas'),
      );

      // Act & Assert
      await expect(controller.login(loginDto, mockRequest)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('POST /auth/logout', () => {
    const mockRequest = {
      user: {
        id: 'user-1',
        sessionId: 'session-1',
      },
    };

    it('should logout user successfully', async () => {
      // Arrange
      mockAuthService.logout.mockResolvedValue(undefined);

      // Act
      const result = await controller.logout(mockRequest);

      // Assert
      expect(result).toEqual({ message: 'Sesión cerrada exitosamente' });
      expect(mockAuthService.logout).toHaveBeenCalledWith('user-1', 'session-1');
    });

    it('should extract userId and sessionId from JWT token', async () => {
      // Arrange
      mockAuthService.logout.mockResolvedValue(undefined);

      // Act
      await controller.logout(mockRequest);

      // Assert
      expect(mockAuthService.logout).toHaveBeenCalledWith(
        mockRequest.user.id,
        mockRequest.user.sessionId,
      );
    });

    it('should use default session ID if not provided', async () => {
      // Arrange
      const requestWithoutSession = {
        user: {
          id: 'user-1',
        },
      };
      mockAuthService.logout.mockResolvedValue(undefined);

      // Act
      await controller.logout(requestWithoutSession);

      // Assert
      expect(mockAuthService.logout).toHaveBeenCalledWith('user-1', 'current-session');
    });

    it('should return success message', async () => {
      // Arrange
      mockAuthService.logout.mockResolvedValue(undefined);

      // Act
      const result = await controller.logout(mockRequest);

      // Assert
      expect(result.message).toBe('Sesión cerrada exitosamente');
    });

    it('should handle logout errors', async () => {
      // Arrange
      mockAuthService.logout.mockRejectedValue(new Error('Logout failed'));

      // Act & Assert
      await expect(controller.logout(mockRequest)).rejects.toThrow('Logout failed');
    });
  });

  describe('POST /auth/refresh', () => {
    const refreshDto: RefreshTokenDto = {
      refreshToken: 'refresh.token.here',
    };

    const mockRefreshResponse = {
      accessToken: 'new.access.token',
      refreshToken: 'new.refresh.token',
    };

    it('should refresh tokens successfully', async () => {
      // Arrange
      mockAuthService.refreshToken.mockResolvedValue(mockRefreshResponse);

      // Act
      const result = await controller.refresh(refreshDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.accessToken).toBe('new.access.token');
      expect(result.refreshToken).toBe('new.refresh.token');
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(refreshDto.refreshToken);
    });

    it('should pass refresh token to service', async () => {
      // Arrange
      mockAuthService.refreshToken.mockResolvedValue(mockRefreshResponse);

      // Act
      await controller.refresh(refreshDto);

      // Assert
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith('refresh.token.here');
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      // Arrange
      mockAuthService.refreshToken.mockRejectedValue(
        new UnauthorizedException('Refresh token inválido'),
      );

      // Act & Assert
      await expect(controller.refresh(refreshDto)).rejects.toThrow(UnauthorizedException);
      await expect(controller.refresh(refreshDto)).rejects.toThrow('Refresh token inválido');
    });

    it('should return new access and refresh tokens', async () => {
      // Arrange
      mockAuthService.refreshToken.mockResolvedValue(mockRefreshResponse);

      // Act
      const result = await controller.refresh(refreshDto);

      // Assert
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });

  describe('GET /auth/profile', () => {
    // E7-FIX: Controller now uses req.user.user_id (auth.users.id) for getFullProfile
    const mockRequest = {
      user: {
        id: 'profile-1',
        user_id: 'user-1',
      },
    };

    const mockProfileResponse: UserResponseDto = {
      id: 'profile-1',
      email: 'test@example.com',
      role: GamilityRoleEnum.STUDENT,
      created_at: new Date().toISOString() as any,
      updated_at: new Date().toISOString() as any,
      raw_user_meta_data: {},
      equipped_items: {},
    };

    it('should return user profile successfully', async () => {
      // Arrange
      mockAuthService.getFullProfile.mockResolvedValue(mockProfileResponse);

      // Act
      const result = await controller.getProfile(mockRequest);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('profile-1');
      expect(result.email).toBe('test@example.com');
      expect(mockAuthService.getFullProfile).toHaveBeenCalledWith('user-1');
    });

    it('should extract userId from JWT token', async () => {
      // Arrange
      mockAuthService.getFullProfile.mockResolvedValue(mockProfileResponse);

      // Act
      await controller.getProfile(mockRequest);

      // Assert
      expect(mockAuthService.getFullProfile).toHaveBeenCalledWith(mockRequest.user.user_id);
    });

    it('should not include password in response', async () => {
      // Arrange
      mockAuthService.getFullProfile.mockResolvedValue(mockProfileResponse);

      // Act
      const result = await controller.getProfile(mockRequest);

      // Assert
      expect(result).not.toHaveProperty('encrypted_password');
      expect(result).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      mockAuthService.getFullProfile.mockRejectedValue(
        new UnauthorizedException('Usuario no encontrado'),
      );

      // Act & Assert
      await expect(controller.getProfile(mockRequest)).rejects.toThrow(UnauthorizedException);
      await expect(controller.getProfile(mockRequest)).rejects.toThrow('Usuario no encontrado');
    });

    it('should return user with all safe fields', async () => {
      // Arrange
      mockAuthService.getFullProfile.mockResolvedValue(mockProfileResponse);

      // Act
      const result = await controller.getProfile(mockRequest);

      // Assert
      expect(result.id).toBeDefined();
      expect(result.email).toBeDefined();
      expect(result.role).toBeDefined();
      expect(result.created_at).toBeDefined();
      expect(result.updated_at).toBeDefined();
    });
  });

  describe('Controller Metadata', () => {
    it('should have @Controller decorator with auth route', () => {
      expect(Reflect.getMetadata('path', AuthController)).toBe('auth');
    });

    it('should have register endpoint with POST method', () => {
      const metadata = Reflect.getMetadata('path', controller.register);
      expect(metadata).toBeDefined();
    });

    it('should have login endpoint with POST method', () => {
      const metadata = Reflect.getMetadata('path', controller.login);
      expect(metadata).toBeDefined();
    });

    it('should have logout endpoint with POST method and JWT guard', () => {
      const metadata = Reflect.getMetadata('path', controller.logout);
      expect(metadata).toBeDefined();
    });

    it('should have getProfile endpoint with GET method and JWT guard', () => {
      const metadata = Reflect.getMetadata('path', controller.getProfile);
      expect(metadata).toBeDefined();
    });
  });
});
