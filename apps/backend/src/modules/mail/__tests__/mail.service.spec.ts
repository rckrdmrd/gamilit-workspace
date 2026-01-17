/**
 * MailService Unit Tests
 *
 * Tests for email service functionality.
 * Covers initialization, email sending, retry logic, and specific email types.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail.service';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(),
    verify: jest.fn((callback) => callback(null)),
  })),
}));

import * as nodemailer from 'nodemailer';

describe('MailService', () => {
  let service: MailService;
  let configService: jest.Mocked<ConfigService>;
  let mockTransporter: any;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Default config values
    mockConfigService.get.mockImplementation((key: string, defaultValue?: any) => {
      const config: Record<string, any> = {
        FRONTEND_URL: 'http://localhost:3000',
        SMTP_FROM: 'Test <test@example.com>',
        SMTP_HOST: 'smtp.test.com',
        SMTP_PORT: 587,
        SMTP_USER: 'user@test.com',
        SMTP_PASS: 'password123',
        SMTP_SECURE: false,
      };
      return config[key] ?? defaultValue;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    configService = module.get(ConfigService);
    mockTransporter = (nodemailer.createTransport as jest.Mock).mock.results[0]?.value;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with SMTP config when credentials provided', () => {
      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'smtp.test.com',
          port: 587,
          secure: false,
          auth: {
            user: 'user@test.com',
            pass: 'password123',
          },
        }),
      );
    });

    it('should initialize with SendGrid when API key is provided', async () => {
      jest.clearAllMocks();
      mockConfigService.get.mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'SENDGRID_API_KEY') return 'SG.test-api-key';
        if (key === 'FRONTEND_URL') return 'http://localhost:3000';
        if (key === 'SMTP_FROM') return 'Test <test@example.com>';
        return defaultValue;
      });

      const module = await Test.createTestingModule({
        providers: [
          MailService,
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      module.get<MailService>(MailService);

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'smtp.sendgrid.net',
          port: 587,
          auth: {
            user: 'apikey',
            pass: 'SG.test-api-key',
          },
        }),
      );
    });

    it('should not create transporter when SMTP credentials missing', async () => {
      jest.clearAllMocks();
      mockConfigService.get.mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'FRONTEND_URL') return 'http://localhost:3000';
        if (key === 'SMTP_FROM') return 'Test <test@example.com>';
        return defaultValue;
      });

      const module = await Test.createTestingModule({
        providers: [
          MailService,
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      const svc = module.get<MailService>(MailService);
      expect(svc.isAvailable()).toBe(false);
    });
  });

  describe('isAvailable', () => {
    it('should return true when transporter is initialized', () => {
      expect(service.isAvailable()).toBe(true);
    });
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-123' });

      const result = await service.sendEmail(
        'recipient@test.com',
        'Test Subject',
        '<p>Test content</p>',
      );

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'recipient@test.com',
          subject: 'Test Subject',
          html: '<p>Test content</p>',
        }),
      );
    });

    it('should accept array of recipients', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-456' });

      const recipients = ['user1@test.com', 'user2@test.com'];
      await service.sendEmail(recipients, 'Bulk Email', '<p>Content</p>');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: recipients,
        }),
      );
    });

    it('should generate text version from HTML', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-789' });

      await service.sendEmail(
        'recipient@test.com',
        'Subject',
        '<p>Hello World</p>',
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Hello World'),
        }),
      );
    });

    it('should use provided text when specified', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-abc' });

      await service.sendEmail(
        'recipient@test.com',
        'Subject',
        '<p>HTML Content</p>',
        'Plain text content',
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Plain text content',
        }),
      );
    });

    it('should retry on failure with exponential backoff', async () => {
      // Use real timers but mock the sleep to be instant
      const originalSleep = (service as any).sleep;
      (service as any).sleep = () => Promise.resolve();

      mockTransporter.sendMail
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ messageId: 'retry-success' });

      const result = await service.sendEmail(
        'recipient@test.com',
        'Subject',
        '<p>Content</p>',
      );

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(3);

      // Restore original sleep
      (service as any).sleep = originalSleep;
    });

    it('should throw after max retries exhausted', async () => {
      // Use real timers but mock the sleep to be instant
      const originalSleep = (service as any).sleep;
      (service as any).sleep = () => Promise.resolve();

      mockTransporter.sendMail.mockRejectedValue(new Error('Persistent failure'));

      await expect(
        service.sendEmail('recipient@test.com', 'Subject', '<p>Content</p>'),
      ).rejects.toThrow('Persistent failure');

      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(3);

      // Restore original sleep
      (service as any).sleep = originalSleep;
    });

    it('should return false and log when transporter not available', async () => {
      // Create service without transporter
      jest.clearAllMocks();
      mockConfigService.get.mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'FRONTEND_URL') return 'http://localhost:3000';
        if (key === 'SMTP_FROM') return 'Test <test@example.com>';
        return defaultValue;
      });

      const module = await Test.createTestingModule({
        providers: [
          MailService,
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      const svcNoTransporter = module.get<MailService>(MailService);
      const result = await svcNoTransporter.sendEmail(
        'test@test.com',
        'Subject',
        '<p>Content</p>',
      );

      expect(result).toBe(false);
    });
  });

  describe('sendNotificationEmail', () => {
    it('should send notification with action button', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'notif-123' });

      await service.sendNotificationEmail(
        'user@test.com',
        'New Notification',
        'You have a new message',
        'http://example.com/view',
        'View Message',
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          subject: 'New Notification',
          html: expect.stringContaining('View Message'),
        }),
      );
    });

    it('should send notification without action button', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'notif-456' });

      await service.sendNotificationEmail(
        'user@test.com',
        'Simple Notification',
        'Just a message',
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          subject: 'Simple Notification',
        }),
      );
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email with correct URL', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'reset-123' });

      await service.sendPasswordResetEmail(
        'user@test.com',
        'reset-token-abc',
        'John Doe',
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          subject: expect.stringContaining('Recuperacion de Contrasena'),
          html: expect.stringContaining('http://localhost:3000/reset-password/reset-token-abc'),
        }),
      );
    });

    it('should include user name in email', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'reset-456' });

      await service.sendPasswordResetEmail('user@test.com', 'token', 'Jane Smith');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Jane Smith'),
        }),
      );
    });

    it('should use default user name when not provided', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'reset-789' });

      await service.sendPasswordResetEmail('user@test.com', 'token');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Usuario'),
        }),
      );
    });
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email with correct URL', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'verify-123' });

      await service.sendVerificationEmail(
        'newuser@test.com',
        'verify-token-xyz',
        'New User',
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'newuser@test.com',
          subject: expect.stringContaining('Verifica tu Email'),
          html: expect.stringContaining('http://localhost:3000/verify-email/verify-token-xyz'),
        }),
      );
    });

    it('should include welcome message with user name', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'verify-456' });

      await service.sendVerificationEmail('user@test.com', 'token', 'Alice');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Bienvenido/a Alice'),
        }),
      );
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email for student role', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'welcome-123' });

      await service.sendWelcomeEmail('student@test.com', 'Student Name', 'student');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'student@test.com',
          subject: expect.stringContaining('Bienvenido'),
          html: expect.stringContaining('estudiante'),
        }),
      );
    });

    it('should send welcome email for teacher role', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'welcome-456' });

      await service.sendWelcomeEmail('teacher@test.com', 'Teacher Name', 'teacher');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'teacher@test.com',
          html: expect.stringContaining('profesor'),
        }),
      );
    });

    it('should include dashboard link', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'welcome-789' });

      await service.sendWelcomeEmail('user@test.com', 'User', 'student');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('http://localhost:3000/dashboard'),
        }),
      );
    });

    it('should include gamification features', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'welcome-abc' });

      await service.sendWelcomeEmail('user@test.com', 'User', 'student');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringMatching(/ML Coins|Rangos Maya|Modulos Educativos/),
        }),
      );
    });
  });
});
