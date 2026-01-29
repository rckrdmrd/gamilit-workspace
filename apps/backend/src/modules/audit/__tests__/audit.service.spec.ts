/**
 * AuditService Unit Tests
 *
 * Tests for the centralized audit logging service.
 * Covers all audit event logging methods and query functionality.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditService } from '../services/audit.service';
import { AuditLog, ActorType, Severity, Status } from '../entities/audit-log.entity';
import { CreateAuditLogDto } from '../dto/create-audit-log.dto';

describe('AuditService', () => {
  let service: AuditService;
  let _auditLogRepository: jest.Mocked<Repository<AuditLog>>;

  // Mock repository
  const mockAuditLogRepository = {
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  // Mock query builder
  const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    getCount: jest.fn(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(AuditLog, 'audit'),
          useValue: mockAuditLogRepository,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    _auditLogRepository = module.get(getRepositoryToken(AuditLog, 'audit'));

    // Reset mocks before each test
    jest.clearAllMocks();
    mockAuditLogRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('logEvent', () => {
    const baseEvent: CreateAuditLogDto = {
      eventType: 'test_event',
      action: 'test_action',
    };

    it('should create and save audit log with minimal data', async () => {
      // Arrange
      const mockAuditLog = { id: 'audit-1', ...baseEvent };
      mockAuditLogRepository.create.mockReturnValue(mockAuditLog as AuditLog);
      mockAuditLogRepository.save.mockResolvedValue(mockAuditLog as AuditLog);

      // Act
      await service.logEvent(baseEvent);

      // Assert
      expect(mockAuditLogRepository.create).toHaveBeenCalledWith({
        tenantId: null,
        eventType: 'test_event',
        action: 'test_action',
        resourceType: null,
        resourceId: null,
        actorId: null,
        actorType: ActorType.USER,
        actorIp: null,
        actorUserAgent: null,
        targetId: null,
        targetType: null,
        sessionId: null,
        description: null,
        oldValues: null,
        newValues: null,
        changes: null,
        severity: Severity.INFO,
        status: Status.SUCCESS,
        errorCode: null,
        errorMessage: null,
        stackTrace: null,
        requestId: null,
        correlationId: null,
        additionalData: null,
        tags: null,
      });
      expect(mockAuditLogRepository.save).toHaveBeenCalledWith(mockAuditLog);
    });

    it('should create audit log with all optional fields', async () => {
      // Arrange
      const fullEvent: CreateAuditLogDto = {
        tenantId: 'tenant-1',
        eventType: 'user_created',
        action: 'create',
        resourceType: 'user',
        resourceId: 'user-123',
        actorId: 'admin-1',
        actorType: ActorType.USER,
        actorIp: '192.168.1.1',
        actorUserAgent: 'Mozilla/5.0',
        targetId: 'target-1',
        targetType: 'user',
        sessionId: 'session-123',
        description: 'User created successfully',
        oldValues: null,
        newValues: { name: 'John' },
        changes: { name: { from: null, to: 'John' } },
        severity: Severity.INFO,
        status: Status.SUCCESS,
        requestId: 'req-123',
        correlationId: 'corr-456',
        additionalData: { extra: 'data' },
        tags: ['admin', 'user'],
      };

      const mockAuditLog = { id: 'audit-2', ...fullEvent };
      mockAuditLogRepository.create.mockReturnValue(mockAuditLog as AuditLog);
      mockAuditLogRepository.save.mockResolvedValue(mockAuditLog as AuditLog);

      // Act
      await service.logEvent(fullEvent);

      // Assert
      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'tenant-1',
          eventType: 'user_created',
          resourceType: 'user',
          actorId: 'admin-1',
          tags: ['admin', 'user'],
        }),
      );
    });

    it('should not throw error when save fails (silent failure)', async () => {
      // Arrange
      mockAuditLogRepository.create.mockReturnValue({} as AuditLog);
      mockAuditLogRepository.save.mockRejectedValue(new Error('Database error'));

      // Act & Assert - should not throw
      await expect(service.logEvent(baseEvent)).resolves.not.toThrow();
    });

    it('should use default values for optional enum fields', async () => {
      // Arrange
      mockAuditLogRepository.create.mockReturnValue({} as AuditLog);
      mockAuditLogRepository.save.mockResolvedValue({} as AuditLog);

      // Act
      await service.logEvent(baseEvent);

      // Assert
      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          actorType: ActorType.USER,
          severity: Severity.INFO,
          status: Status.SUCCESS,
        }),
      );
    });
  });

  describe('logOrganizationCreated', () => {
    it('should log organization creation with correct event type and tags', async () => {
      // Arrange
      const organizationId = 'org-123';
      const organizationData = { name: 'Test Org', slug: 'test-org' };
      const actorId = 'admin-1';
      const actorIp = '192.168.1.1';

      mockAuditLogRepository.create.mockReturnValue({} as AuditLog);
      mockAuditLogRepository.save.mockResolvedValue({} as AuditLog);

      // Act
      await service.logOrganizationCreated(organizationId, organizationData, actorId, actorIp);

      // Assert
      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'organization_created',
          action: 'create',
          resourceType: 'organization',
          resourceId: organizationId,
          actorId,
          actorIp,
          severity: Severity.INFO,
          status: Status.SUCCESS,
          newValues: organizationData,
          tags: ['admin', 'organization', 'create'],
        }),
      );
    });

    it('should include organization name in description', async () => {
      // Arrange
      mockAuditLogRepository.create.mockReturnValue({} as AuditLog);
      mockAuditLogRepository.save.mockResolvedValue({} as AuditLog);

      // Act
      await service.logOrganizationCreated('org-1', { name: 'My Company' }, 'admin-1');

      // Assert
      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Organization created: My Company',
        }),
      );
    });
  });

  describe('logOrganizationUpdated', () => {
    it('should log organization update with old and new values', async () => {
      // Arrange
      const organizationId = 'org-123';
      const oldValues = { name: 'Old Name', slug: 'old-slug' };
      const newValues = { name: 'New Name', slug: 'old-slug' };
      const actorId = 'admin-1';

      mockAuditLogRepository.create.mockReturnValue({} as AuditLog);
      mockAuditLogRepository.save.mockResolvedValue({} as AuditLog);

      // Act
      await service.logOrganizationUpdated(organizationId, oldValues, newValues, actorId);

      // Assert
      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'organization_updated',
          action: 'update',
          resourceType: 'organization',
          oldValues,
          newValues,
          changes: { name: { from: 'Old Name', to: 'New Name' } },
          tags: ['admin', 'organization', 'update'],
        }),
      );
    });

    it('should calculate only changed fields in changes object', async () => {
      // Arrange
      const oldValues = { name: 'Same', slug: 'same-slug', email: 'old@test.com' };
      const newValues = { name: 'Same', slug: 'same-slug', email: 'new@test.com' };

      mockAuditLogRepository.create.mockReturnValue({} as AuditLog);
      mockAuditLogRepository.save.mockResolvedValue({} as AuditLog);

      // Act
      await service.logOrganizationUpdated('org-1', oldValues, newValues, 'admin-1');

      // Assert
      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          changes: { email: { from: 'old@test.com', to: 'new@test.com' } },
        }),
      );
    });
  });

  describe('logOrganizationDeleted', () => {
    it('should log organization deletion with WARNING severity', async () => {
      // Arrange
      const organizationId = 'org-123';
      const organizationData = { name: 'Deleted Org' };
      const actorId = 'admin-1';

      mockAuditLogRepository.create.mockReturnValue({} as AuditLog);
      mockAuditLogRepository.save.mockResolvedValue({} as AuditLog);

      // Act
      await service.logOrganizationDeleted(organizationId, organizationData, actorId);

      // Assert
      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'organization_deleted',
          action: 'delete',
          severity: Severity.WARNING,
          oldValues: organizationData,
          tags: ['admin', 'organization', 'delete'],
        }),
      );
    });
  });

  describe('logUserRoleChanged', () => {
    it('should log role change with security tag', async () => {
      // Arrange
      const userId = 'user-123';
      const oldRole = 'student';
      const newRole = 'teacher';
      const actorId = 'admin-1';

      mockAuditLogRepository.create.mockReturnValue({} as AuditLog);
      mockAuditLogRepository.save.mockResolvedValue({} as AuditLog);

      // Act
      await service.logUserRoleChanged(userId, oldRole, newRole, actorId);

      // Assert
      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'user_role_changed',
          action: 'update_role',
          resourceType: 'user',
          resourceId: userId,
          severity: Severity.WARNING,
          oldValues: { role: oldRole },
          newValues: { role: newRole },
          changes: { role: { from: oldRole, to: newRole } },
          tags: ['admin', 'user', 'role', 'security'],
        }),
      );
    });

    it('should include descriptive message about role change', async () => {
      // Arrange
      mockAuditLogRepository.create.mockReturnValue({} as AuditLog);
      mockAuditLogRepository.save.mockResolvedValue({} as AuditLog);

      // Act
      await service.logUserRoleChanged('user-1', 'viewer', 'admin', 'actor-1');

      // Assert
      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'User role changed from viewer to admin',
        }),
      );
    });
  });

  describe('logUserStatusChanged', () => {
    it('should log status change correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const oldStatus = 'active';
      const newStatus = 'suspended';
      const actorId = 'admin-1';

      mockAuditLogRepository.create.mockReturnValue({} as AuditLog);
      mockAuditLogRepository.save.mockResolvedValue({} as AuditLog);

      // Act
      await service.logUserStatusChanged(userId, oldStatus, newStatus, actorId);

      // Assert
      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'user_status_changed',
          action: 'update_status',
          resourceType: 'user',
          changes: { status: { from: oldStatus, to: newStatus } },
          tags: ['admin', 'user', 'status'],
        }),
      );
    });
  });

  describe('logContentApproved', () => {
    it('should log content approval with correct resource type', async () => {
      // Arrange
      const contentId = 'content-123';
      const contentType = 'article';
      const actorId = 'moderator-1';

      mockAuditLogRepository.create.mockReturnValue({} as AuditLog);
      mockAuditLogRepository.save.mockResolvedValue({} as AuditLog);

      // Act
      await service.logContentApproved(contentId, contentType, actorId);

      // Assert
      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'content_approved',
          action: 'approve',
          resourceType: contentType,
          resourceId: contentId,
          description: 'article approved',
          tags: ['admin', 'content', 'approval'],
        }),
      );
    });
  });

  describe('logContentRejected', () => {
    it('should log content rejection with reason in additional data', async () => {
      // Arrange
      const contentId = 'content-123';
      const contentType = 'comment';
      const reason = 'Inappropriate language';
      const actorId = 'moderator-1';

      mockAuditLogRepository.create.mockReturnValue({} as AuditLog);
      mockAuditLogRepository.save.mockResolvedValue({} as AuditLog);

      // Act
      await service.logContentRejected(contentId, contentType, reason, actorId);

      // Assert
      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'content_rejected',
          action: 'reject',
          resourceType: contentType,
          description: 'comment rejected: Inappropriate language',
          additionalData: { rejection_reason: reason },
          tags: ['admin', 'content', 'rejection'],
        }),
      );
    });
  });

  describe('logFeatureFlagChanged', () => {
    it('should log feature flag toggle with WARNING severity', async () => {
      // Arrange
      const organizationId = 'org-123';
      const featureName = 'dark_mode';
      const oldValue = false;
      const newValue = true;
      const actorId = 'admin-1';

      mockAuditLogRepository.create.mockReturnValue({} as AuditLog);
      mockAuditLogRepository.save.mockResolvedValue({} as AuditLog);

      // Act
      await service.logFeatureFlagChanged(organizationId, featureName, oldValue, newValue, actorId);

      // Assert
      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'feature_flag_changed',
          action: 'toggle_feature',
          resourceType: 'organization',
          severity: Severity.WARNING,
          oldValues: { dark_mode: false },
          newValues: { dark_mode: true },
          changes: { dark_mode: { from: false, to: true } },
          tags: ['admin', 'feature_flag', 'configuration'],
        }),
      );
    });
  });

  describe('logSystemConfigChanged', () => {
    it('should log system configuration change', async () => {
      // Arrange
      const configKey = 'max_upload_size';
      const oldValue = 10;
      const newValue = 50;
      const actorId = 'admin-1';

      mockAuditLogRepository.create.mockReturnValue({} as AuditLog);
      mockAuditLogRepository.save.mockResolvedValue({} as AuditLog);

      // Act
      await service.logSystemConfigChanged(configKey, oldValue, newValue, actorId);

      // Assert
      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'system_config_changed',
          action: 'update_config',
          resourceType: 'system_config',
          severity: Severity.WARNING,
          description: "System configuration 'max_upload_size' changed",
          oldValues: { max_upload_size: 10 },
          newValues: { max_upload_size: 50 },
          tags: ['admin', 'system', 'configuration'],
        }),
      );
    });
  });

  describe('logAuthenticationAttempt', () => {
    it('should log successful authentication with INFO severity', async () => {
      // Arrange
      const email = 'user@test.com';
      const actorIp = '192.168.1.1';

      mockAuditLogRepository.create.mockReturnValue({} as AuditLog);
      mockAuditLogRepository.save.mockResolvedValue({} as AuditLog);

      // Act
      await service.logAuthenticationAttempt(email, true, actorIp);

      // Assert
      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'authentication_attempt',
          action: 'login',
          resourceType: 'auth',
          severity: Severity.INFO,
          status: Status.SUCCESS,
          description: 'Successful login: user@test.com',
          additionalData: { email },
          tags: ['auth', 'login', 'success'],
        }),
      );
    });

    it('should log failed authentication with WARNING severity', async () => {
      // Arrange
      const email = 'attacker@test.com';
      const actorIp = '10.0.0.1';
      const errorMessage = 'Invalid credentials';

      mockAuditLogRepository.create.mockReturnValue({} as AuditLog);
      mockAuditLogRepository.save.mockResolvedValue({} as AuditLog);

      // Act
      await service.logAuthenticationAttempt(email, false, actorIp, errorMessage);

      // Assert
      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'authentication_attempt',
          action: 'login',
          severity: Severity.WARNING,
          status: Status.FAILURE,
          description: 'Failed login attempt: attacker@test.com',
          errorMessage,
          tags: ['auth', 'login', 'failure'],
        }),
      );
    });
  });

  describe('getAuditLogs', () => {
    it('should return paginated audit logs with total count', async () => {
      // Arrange
      const mockLogs: Partial<AuditLog>[] = [
        { id: 'log-1', eventType: 'test' },
        { id: 'log-2', eventType: 'test' },
      ];
      mockQueryBuilder.getCount.mockResolvedValue(10);
      mockQueryBuilder.getMany.mockResolvedValue(mockLogs);

      // Act
      const result = await service.getAuditLogs({ limit: 2, offset: 0 });

      // Assert
      expect(result.logs).toEqual(mockLogs);
      expect(result.total).toBe(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(2);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('audit.createdAt', 'DESC');
    });

    it('should filter by tenantId', async () => {
      // Arrange
      mockQueryBuilder.getCount.mockResolvedValue(5);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      // Act
      await service.getAuditLogs({ tenantId: 'tenant-123' });

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('audit.tenantId = :tenantId', {
        tenantId: 'tenant-123',
      });
    });

    it('should filter by eventType', async () => {
      // Arrange
      mockQueryBuilder.getCount.mockResolvedValue(3);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      // Act
      await service.getAuditLogs({ eventType: 'user_created' });

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('audit.eventType = :eventType', {
        eventType: 'user_created',
      });
    });

    it('should filter by resourceType', async () => {
      // Arrange
      mockQueryBuilder.getCount.mockResolvedValue(2);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      // Act
      await service.getAuditLogs({ resourceType: 'organization' });

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('audit.resourceType = :resourceType', {
        resourceType: 'organization',
      });
    });

    it('should filter by actorId', async () => {
      // Arrange
      mockQueryBuilder.getCount.mockResolvedValue(7);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      // Act
      await service.getAuditLogs({ actorId: 'admin-1' });

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('audit.actorId = :actorId', {
        actorId: 'admin-1',
      });
    });

    it('should filter by severity', async () => {
      // Arrange
      mockQueryBuilder.getCount.mockResolvedValue(4);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      // Act
      await service.getAuditLogs({ severity: Severity.ERROR });

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('audit.severity = :severity', {
        severity: Severity.ERROR,
      });
    });

    it('should filter by date range', async () => {
      // Arrange
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');
      mockQueryBuilder.getCount.mockResolvedValue(15);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      // Act
      await service.getAuditLogs({ startDate, endDate });

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('audit.createdAt >= :startDate', {
        startDate,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('audit.createdAt <= :endDate', {
        endDate,
      });
    });

    it('should use default limit of 100 when not specified', async () => {
      // Arrange
      mockQueryBuilder.getCount.mockResolvedValue(200);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      // Act
      await service.getAuditLogs({});

      // Assert
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(100);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
    });

    it('should combine multiple filters', async () => {
      // Arrange
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      // Act
      await service.getAuditLogs({
        tenantId: 'tenant-1',
        eventType: 'user_role_changed',
        severity: Severity.WARNING,
        limit: 50,
        offset: 10,
      });

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(3);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(50);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
    });

    it('should throw error when query fails', async () => {
      // Arrange
      mockQueryBuilder.getCount.mockRejectedValue(new Error('Database connection lost'));

      // Act & Assert
      await expect(service.getAuditLogs({})).rejects.toThrow('Database connection lost');
    });
  });
});
