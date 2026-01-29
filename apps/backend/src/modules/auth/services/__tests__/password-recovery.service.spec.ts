import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { PasswordRecoveryService } from '../password-recovery.service';
import { User, PasswordResetToken } from '../../entities';
import { MailService } from '@/modules/mail/mail.service';
import { SessionManagementService } from '../session-management.service';

/**
 * Tests para PasswordRecoveryService
 *
 * @description Validar funcionalidad de recuperación de contraseña
 *
 * @coverage
 * - requestReset: Generar token y enviar email
 * - resetPassword: Validar token y actualizar contraseña
 * - validateToken: Verificar validez de tokens
 */
describe('PasswordRecoveryService', () => {
  let service: PasswordRecoveryService;
  let _userRepository: Repository<User>;
  let _tokenRepository: Repository<PasswordResetToken>;
  let _mailService: MailService;

  // Mock repositories
  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockTokenRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockMailService = {
    sendPasswordResetEmail: jest.fn(),
  };

  const mockSessionManagementService = {
    revokeAllUserSessions: jest.fn().mockResolvedValue(undefined),
    revokeSessionById: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordRecoveryService,
        {
          provide: getRepositoryToken(User, 'auth'),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(PasswordResetToken, 'auth'),
          useValue: mockTokenRepository,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: SessionManagementService,
          useValue: mockSessionManagementService,
        },
      ],
    }).compile();

    service = module.get<PasswordRecoveryService>(PasswordRecoveryService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User, 'auth'));
    tokenRepository = module.get<Repository<PasswordResetToken>>(getRepositoryToken(PasswordResetToken, 'auth'));
    mailService = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('requestReset', () => {
    it('debería generar token y enviar email si usuario existe', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        encrypted_password: 'hashed-password',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockTokenRepository.update.mockResolvedValue({ affected: 0 });
      mockTokenRepository.create.mockReturnValue({
        id: 'token-123',
        user_id: mockUser.id,
        token: 'hashed-token',
        expires_at: new Date(),
      });
      mockTokenRepository.save.mockResolvedValue({});
      mockMailService.sendPasswordResetEmail.mockResolvedValue(undefined);

      // Act
      const result = await service.requestReset({ email: 'test@example.com' });

      // Assert
      expect(result.message).toContain('instrucciones');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockTokenRepository.save).toHaveBeenCalled();
      expect(mockMailService.sendPasswordResetEmail).toHaveBeenCalled();
    });

    it('no debería revelar si email no existe (seguridad)', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.requestReset({ email: 'noexiste@example.com' });

      // Assert
      expect(result.message).toContain('instrucciones');
      expect(mockTokenRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('debería actualizar contraseña con token válido', async () => {
      // Arrange
      const mockToken = {
        id: 'token-123',
        user_id: 'user-123',
        token: 'hashed-token',
        expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hora en futuro
        used_at: null,
        isValid: () => true,
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        encrypted_password: 'old-hashed-password',
      };

      mockTokenRepository.findOne.mockResolvedValue(mockToken);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockTokenRepository.update.mockResolvedValue({ affected: 1 });

      // Act
      const result = await service.resetPassword({
        token: 'plain-token',
        new_password: 'NewPassword123!',
      });

      // Assert
      expect(result.message).toContain('exitosamente');
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockTokenRepository.update).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ used_at: expect.any(Date) }),
      );
    });

    it('debería rechazar token inválido', async () => {
      // Arrange
      mockTokenRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.resetPassword({
          token: 'invalid-token',
          new_password: 'NewPassword123!',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debería rechazar token expirado', async () => {
      // Arrange
      const expiredToken = {
        id: 'token-123',
        user_id: 'user-123',
        token: 'hashed-token',
        expires_at: new Date(Date.now() - 60 * 60 * 1000), // 1 hora en pasado
        used_at: null,
        isValid: () => false,
      };

      mockTokenRepository.findOne.mockResolvedValue(expiredToken);

      // Act & Assert
      await expect(
        service.resetPassword({
          token: 'expired-token',
          new_password: 'NewPassword123!',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateToken', () => {
    it('debería retornar valid=true para token válido', async () => {
      // Arrange
      const mockToken = {
        id: 'token-123',
        user_id: 'user-123',
        token: 'hashed-token',
        expires_at: new Date(Date.now() + 60 * 60 * 1000),
        used_at: null,
        isValid: () => true,
      };

      mockTokenRepository.findOne.mockResolvedValue(mockToken);

      // Act
      const result = await service.validateToken('plain-token');

      // Assert
      expect(result.valid).toBe(true);
      expect(result.userId).toBe('user-123');
    });

    it('debería retornar valid=false para token inexistente', async () => {
      // Arrange
      mockTokenRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.validateToken('nonexistent-token');

      // Assert
      expect(result.valid).toBe(false);
      expect(result.userId).toBeUndefined();
    });
  });
});
