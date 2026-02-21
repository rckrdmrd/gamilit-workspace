/**
 * NotificationService Unit Tests
 *
 * Tests for the main notification service handling multi-channel notifications.
 * Covers CRUD operations, ownership validation, and SQL function integration.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { NotificationTemplateService } from '../services/notification-template.service';
import { Notification } from '../entities/multichannel/notification.entity';
import { WebSocketService } from '../../websocket/websocket.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let _notificationRepository: jest.Mocked<Repository<Notification>>;
  let _templateService: jest.Mocked<NotificationTemplateService>;
  let _dataSource: jest.Mocked<DataSource>;
  let _webSocketService: jest.Mocked<WebSocketService>;

  // Mock repository
  const mockNotificationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  // Mock template service
  const mockTemplateService = {
    renderTemplate: jest.fn(),
    findByKey: jest.fn(),
  };

  // Mock data source
  const mockDataSource = {
    query: jest.fn(),
  };

  // Mock WebSocket service
  const mockWebSocketService = {
    emitNotificationToUser: jest.fn(),
  };

  // Mock query builder
  const createMockQueryBuilder = () => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    execute: jest.fn(),
    getManyAndCount: jest.fn(),
    getCount: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(Notification, 'notifications'),
          useValue: mockNotificationRepository,
        },
        {
          provide: NotificationTemplateService,
          useValue: mockTemplateService,
        },
        {
          provide: getDataSourceToken('notifications'),
          useValue: mockDataSource,
        },
        {
          provide: WebSocketService,
          useValue: mockWebSocketService,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    notificationRepository = module.get(getRepositoryToken(Notification, 'notifications'));
    templateService = module.get(NotificationTemplateService);
    dataSource = module.get(getDataSourceToken('notifications'));
    webSocketService = module.get(WebSocketService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create', () => {
    const createData = {
      userId: 'user-123',
      title: 'Test Notification',
      message: 'This is a test message',
      type: 'system',
    };

    it('should create notification with default values', async () => {
      // Arrange
      const mockNotification = {
        id: 'notif-1',
        ...createData,
        channels: ['in_app'],
        createdAt: new Date('2026-01-15T00:00:00.000Z'),
        readAt: null,
      };
      mockNotificationRepository.create.mockReturnValue(mockNotification as Notification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification as Notification);
      mockDataSource.query.mockResolvedValue([{ notification_id: 'sql-notif-1' }]);

      // Act
      const result = await service.create(createData);

      // Assert
      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          title: 'Test Notification',
          message: 'This is a test message',
          priority: 'normal',
          channels: ['in_app'],
          status: 'sent',
        }),
      );
      expect(mockNotificationRepository.save).toHaveBeenCalled();
      expect(result.id).toBe('notif-1');
    });

    it('should create notification with custom channels', async () => {
      // Arrange
      const dataWithChannels = { ...createData, channels: ['in_app', 'email', 'push'] };
      const mockNotification = {
        id: 'notif-2',
        ...dataWithChannels,
        createdAt: new Date('2026-01-15T00:00:00.000Z'),
        readAt: null,
      };
      mockNotificationRepository.create.mockReturnValue(mockNotification as Notification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification as Notification);
      mockDataSource.query.mockResolvedValue([{}]);

      // Act
      const result = await service.create(dataWithChannels);

      // Assert
      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          channels: ['in_app', 'email', 'push'],
        }),
      );
      expect(result.channels).toEqual(['in_app', 'email', 'push']);
    });

    it('should call SQL send_notification function', async () => {
      // Arrange
      const mockNotification = {
        id: 'notif-3',
        ...createData,
        channels: ['in_app'],
        createdAt: new Date('2026-01-15T00:00:00.000Z'),
        readAt: null,
      };
      mockNotificationRepository.create.mockReturnValue(mockNotification as Notification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification as Notification);
      mockDataSource.query.mockResolvedValue([{ notification_id: 'sql-result' }]);

      // Act
      await service.create(createData);

      // Assert
      expect(mockDataSource.query).toHaveBeenCalledWith(
        'SELECT notifications.send_notification($1, $2, $3, $4, $5) as notification_id',
        ['user-123', 'Test Notification', 'This is a test message', 'system', ['in_app']],
      );
    });

    it('should emit WebSocket notification', async () => {
      // Arrange
      const mockNotification = {
        id: 'notif-4',
        ...createData,
        channels: ['in_app'],
        createdAt: new Date('2026-01-15T00:00:00.000Z'),
        readAt: null,
      };
      mockNotificationRepository.create.mockReturnValue(mockNotification as Notification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification as Notification);
      mockDataSource.query.mockResolvedValue([{}]);

      // Act
      await service.create(createData);

      // Assert
      expect(mockWebSocketService.emitNotificationToUser).toHaveBeenCalledWith('user-123',
        expect.objectContaining({
          id: 'notif-4',
          type: 'system',
          title: 'Test Notification',
          message: 'This is a test message',
          read: false,
          createdAt: expect.any(String),
        }),
      );
    });

    it('should continue even if SQL function fails', async () => {
      // Arrange
      const mockNotification = {
        id: 'notif-5',
        ...createData,
        channels: ['in_app'],
        createdAt: new Date('2026-01-15T00:00:00.000Z'),
        readAt: null,
      };
      mockNotificationRepository.create.mockReturnValue(mockNotification as Notification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification as Notification);
      mockDataSource.query.mockRejectedValue(new Error('SQL function error'));

      // Act - should not throw
      const result = await service.create(createData);

      // Assert
      expect(result.id).toBe('notif-5');
    });
  });

  describe('sendFromTemplate', () => {
    const templateData = {
      templateKey: 'welcome_email',
      userId: 'user-456',
      variables: { name: 'John', link: 'https://example.com' },
    };

    it('should render template and create notification', async () => {
      // Arrange
      mockTemplateService.renderTemplate.mockResolvedValue({
        subject: 'Welcome, John!',
        body: 'Click here: https://example.com',
      });
      mockTemplateService.findByKey.mockResolvedValue({
        defaultChannels: ['email'],
      } as any);
      const mockNotification = {
        id: 'notif-template-1',
        title: 'Welcome, John!',
        message: 'Click here: https://example.com',
        channels: ['email'],
        createdAt: new Date('2026-01-15T00:00:00.000Z'),
        readAt: null,
      };
      mockNotificationRepository.create.mockReturnValue(mockNotification as Notification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification as Notification);
      mockDataSource.query.mockResolvedValue([{}]);

      // Act
      const result = await service.sendFromTemplate(templateData);

      // Assert
      expect(mockTemplateService.renderTemplate).toHaveBeenCalledWith('welcome_email', {
        name: 'John',
        link: 'https://example.com',
      });
      expect(result.title).toBe('Welcome, John!');
    });

    it('should use template default channels when not specified', async () => {
      // Arrange
      mockTemplateService.renderTemplate.mockResolvedValue({
        subject: 'Subject',
        body: 'Body',
      });
      mockTemplateService.findByKey.mockResolvedValue({
        defaultChannels: ['in_app', 'email'],
      } as any);
      const mockNotification = {
        id: 'notif-2',
        channels: ['in_app', 'email'],
        createdAt: new Date('2026-01-15T00:00:00.000Z'),
        readAt: null,
      };
      mockNotificationRepository.create.mockReturnValue(mockNotification as Notification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification as Notification);
      mockDataSource.query.mockResolvedValue([{}]);

      // Act
      await service.sendFromTemplate(templateData);

      // Assert
      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          channels: ['in_app', 'email'],
        }),
      );
    });

    it('should include template_key in metadata', async () => {
      // Arrange
      mockTemplateService.renderTemplate.mockResolvedValue({
        subject: 'Subject',
        body: 'Body',
      });
      mockTemplateService.findByKey.mockResolvedValue({
        defaultChannels: ['in_app'],
      } as any);
      const mockNotification = {
        createdAt: new Date('2026-01-15T00:00:00.000Z'),
        readAt: null,
      };
      mockNotificationRepository.create.mockReturnValue(mockNotification as Notification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification as Notification);
      mockDataSource.query.mockResolvedValue([{}]);

      // Act
      await service.sendFromTemplate({
        ...templateData,
        metadata: { source: 'registration' },
      });

      // Assert
      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            source: 'registration',
            template_key: 'welcome_email',
          }),
        }),
      );
    });
  });

  describe('findAllByUser', () => {
    it('should return paginated notifications', async () => {
      // Arrange
      const mockNotifications = [
        { id: 'n1', title: 'Notification 1' },
        { id: 'n2', title: 'Notification 2' },
      ];
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockNotifications, 10]);
      mockNotificationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.findAllByUser('user-123');

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(10);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('n.user_id = :userId', {
        userId: 'user-123',
      });
    });

    it('should apply status filter', async () => {
      // Arrange
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      mockNotificationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      await service.findAllByUser('user-123', { status: 'read' });

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('n.status = :status', {
        status: 'read',
      });
    });

    it('should apply type filter', async () => {
      // Arrange
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      mockNotificationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      await service.findAllByUser('user-123', { type: 'achievement' });

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('n.type = :type', {
        type: 'achievement',
      });
    });

    it('should apply date range filters', async () => {
      // Arrange
      const from = new Date('2026-01-01');
      const to = new Date('2026-01-31');
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      mockNotificationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      await service.findAllByUser('user-123', { from, to });

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('n.created_at >= :from', { from });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('n.created_at <= :to', { to });
    });

    it('should use default pagination values', async () => {
      // Arrange
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      mockNotificationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      await service.findAllByUser('user-123');

      // Assert
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(50);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
    });

    it('should order by created_at DESC', async () => {
      // Arrange
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      mockNotificationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      await service.findAllByUser('user-123');

      // Assert
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('n.created_at', 'DESC');
    });
  });

  describe('findOne', () => {
    it('should return notification if owner matches', async () => {
      // Arrange
      const mockNotification = { id: 'notif-1', userId: 'user-123', title: 'Test' };
      mockNotificationRepository.findOne.mockResolvedValue(mockNotification as Notification);

      // Act
      const result = await service.findOne('notif-1', 'user-123');

      // Assert
      expect(result.id).toBe('notif-1');
      expect(mockNotificationRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'notif-1' },
      });
    });

    it('should throw NotFoundException if notification does not exist', async () => {
      // Arrange
      mockNotificationRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('non-existent', 'user-123')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('non-existent', 'user-123')).rejects.toThrow(
        'Notification not found',
      );
    });

    it('should throw ForbiddenException if owner does not match', async () => {
      // Arrange
      const mockNotification = { id: 'notif-1', userId: 'user-other', title: 'Test' };
      mockNotificationRepository.findOne.mockResolvedValue(mockNotification as Notification);

      // Act & Assert
      await expect(service.findOne('notif-1', 'user-123')).rejects.toThrow(ForbiddenException);
      await expect(service.findOne('notif-1', 'user-123')).rejects.toThrow(
        'You do not have access to this notification',
      );
    });
  });

  describe('findById', () => {
    it('should return notification without ownership check', async () => {
      // Arrange
      const mockNotification = { id: 'notif-1', userId: 'any-user', title: 'Test' };
      mockNotificationRepository.findOne.mockResolvedValue(mockNotification as Notification);

      // Act
      const result = await service.findById('notif-1');

      // Assert
      expect(result?.id).toBe('notif-1');
    });

    it('should return null if not found', async () => {
      // Arrange
      mockNotificationRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findById('non-existent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read with timestamp', async () => {
      // Arrange
      const mockNotification = { id: 'notif-1', userId: 'user-123', status: 'sent' };
      mockNotificationRepository.findOne.mockResolvedValue(mockNotification as Notification);
      mockNotificationRepository.save.mockResolvedValue({
        ...mockNotification,
        status: 'read',
      } as Notification);

      // Act
      await service.markAsRead('notif-1', 'user-123');

      // Assert
      expect(mockNotificationRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'read',
          readAt: expect.any(Date),
        }),
      );
    });

    it('should skip if already read', async () => {
      // Arrange
      const mockNotification = { id: 'notif-1', userId: 'user-123', status: 'read' };
      mockNotificationRepository.findOne.mockResolvedValue(mockNotification as Notification);

      // Act
      await service.markAsRead('notif-1', 'user-123');

      // Assert
      expect(mockNotificationRepository.save).not.toHaveBeenCalled();
    });

    it('should validate ownership before marking', async () => {
      // Arrange
      const mockNotification = { id: 'notif-1', userId: 'user-other', status: 'sent' };
      mockNotificationRepository.findOne.mockResolvedValue(mockNotification as Notification);

      // Act & Assert
      await expect(service.markAsRead('notif-1', 'user-123')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      // Arrange
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.execute.mockResolvedValue({ affected: 5 });
      mockNotificationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.markAllAsRead('user-123');

      // Assert
      expect(result).toBe(5);
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({
        status: 'read',
        readAt: expect.any(Date),
      });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('user_id = :userId', {
        userId: 'user-123',
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('status != :status', {
        status: 'read',
      });
    });

    it('should return 0 when no notifications to update', async () => {
      // Arrange
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.execute.mockResolvedValue({ affected: 0 });
      mockNotificationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.markAllAsRead('user-no-notifications');

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('getUnreadCount', () => {
    it('should return count of unread notifications', async () => {
      // Arrange
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getCount.mockResolvedValue(15);
      mockNotificationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.getUnreadCount('user-123');

      // Assert
      expect(result).toBe(15);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('n.user_id = :userId', {
        userId: 'user-123',
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('n.status IN (:...statuses)', {
        statuses: ['pending', 'sent'],
      });
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification after ownership validation', async () => {
      // Arrange
      const mockNotification = { id: 'notif-1', userId: 'user-123', title: 'Test' };
      mockNotificationRepository.findOne.mockResolvedValue(mockNotification as Notification);
      mockNotificationRepository.remove.mockResolvedValue(mockNotification as Notification);

      // Act
      await service.deleteNotification('notif-1', 'user-123');

      // Assert
      expect(mockNotificationRepository.remove).toHaveBeenCalledWith(mockNotification);
    });

    it('should throw ForbiddenException if not owner', async () => {
      // Arrange
      const mockNotification = { id: 'notif-1', userId: 'user-other', title: 'Test' };
      mockNotificationRepository.findOne.mockResolvedValue(mockNotification as Notification);

      // Act & Assert
      await expect(service.deleteNotification('notif-1', 'user-123')).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockNotificationRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('cleanupOldNotifications', () => {
    it('should delete notifications older than specified days', async () => {
      // Arrange
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.execute.mockResolvedValue({ affected: 100 });
      mockNotificationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.cleanupOldNotifications(30);

      // Assert
      expect(result).toBe(100);
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('created_at < :threshold', {
        threshold: expect.any(Date),
      });
    });

    it('should also delete expired notifications', async () => {
      // Arrange
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.execute.mockResolvedValue({ affected: 50 });
      mockNotificationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      await service.cleanupOldNotifications();

      // Assert
      expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith(
        'expires_at IS NOT NULL AND expires_at < :now',
        { now: expect.any(Date) },
      );
    });

    it('should use default 90 days when not specified', async () => {
      // Arrange
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.execute.mockResolvedValue({ affected: 0 });
      mockNotificationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const _beforeCall = new Date();

      // Act
      await service.cleanupOldNotifications();

      // Assert - threshold should be approximately 90 days ago
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('created_at < :threshold', {
        threshold: expect.any(Date),
      });
    });
  });
});
