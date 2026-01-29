/**
 * PushNotificationService Unit Tests
 *
 * Tests for Web Push API notification service using VAPID.
 * Covers initialization, sending to subscriptions/devices/users,
 * and handling of expired subscriptions.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  PushNotificationService,
  InvalidSubscriptionError,
} from '../services/push-notification.service';
import { UserDeviceService } from '../services/user-device.service';
import * as webpush from 'web-push';

// Mock web-push library
jest.mock('web-push', () => ({
  setVapidDetails: jest.fn(),
  sendNotification: jest.fn(),
  generateVAPIDKeys: jest.fn(),
}));

describe('PushNotificationService', () => {
  let service: PushNotificationService;
  let _configService: jest.Mocked<ConfigService>;
  let _userDeviceService: jest.Mocked<UserDeviceService>;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockUserDeviceService = {
    getActiveDevicesByUser: jest.fn(),
    updateLastUsed: jest.fn(),
    invalidateDevice: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PushNotificationService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: UserDeviceService,
          useValue: mockUserDeviceService,
        },
      ],
    }).compile();

    service = module.get<PushNotificationService>(PushNotificationService);
    _configService = module.get(ConfigService);
    _userDeviceService = module.get(UserDeviceService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('onModuleInit / initialization', () => {
    it('should initialize web push with VAPID keys from config', async () => {
      // Arrange
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'VAPID_PUBLIC_KEY') return 'BNtest-public-key';
        if (key === 'VAPID_PRIVATE_KEY') return 'test-private-key';
        if (key === 'VAPID_SUBJECT') return 'mailto:test@gamilit.com';
        return null;
      });

      // Act
      await service.onModuleInit();

      // Assert
      expect(webpush.setVapidDetails).toHaveBeenCalledWith(
        'mailto:test@gamilit.com',
        'BNtest-public-key',
        'test-private-key',
      );
      expect(service.isAvailable()).toBe(true);
    });

    it('should use default subject when not configured', async () => {
      // Arrange
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'VAPID_PUBLIC_KEY') return 'BNtest-public-key';
        if (key === 'VAPID_PRIVATE_KEY') return 'test-private-key';
        return null;
      });

      // Act
      await service.onModuleInit();

      // Assert
      expect(webpush.setVapidDetails).toHaveBeenCalledWith(
        'mailto:admin@gamilit.com',
        expect.any(String),
        expect.any(String),
      );
    });

    it('should remain disabled when VAPID keys are missing', async () => {
      // Arrange
      mockConfigService.get.mockReturnValue(null);

      // Act
      await service.onModuleInit();

      // Assert
      expect(webpush.setVapidDetails).not.toHaveBeenCalled();
      expect(service.isAvailable()).toBe(false);
    });

    it('should remain disabled when only public key is provided', async () => {
      // Arrange
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'VAPID_PUBLIC_KEY') return 'BNtest-public-key';
        return null;
      });

      // Act
      await service.onModuleInit();

      // Assert
      expect(service.isAvailable()).toBe(false);
    });
  });

  describe('isAvailable', () => {
    it('should return true when initialized', async () => {
      // Arrange
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'VAPID_PUBLIC_KEY') return 'BNtest-public-key';
        if (key === 'VAPID_PRIVATE_KEY') return 'test-private-key';
        return null;
      });
      await service.onModuleInit();

      // Assert
      expect(service.isAvailable()).toBe(true);
    });

    it('should return false when not initialized', () => {
      // Assert (no init called)
      expect(service.isAvailable()).toBe(false);
    });
  });

  describe('getVapidPublicKey', () => {
    it('should return public key from config', () => {
      // Arrange
      mockConfigService.get.mockReturnValue('BNtest-public-key-123');

      // Act
      const result = service.getVapidPublicKey();

      // Assert
      expect(result).toBe('BNtest-public-key-123');
      expect(mockConfigService.get).toHaveBeenCalledWith('VAPID_PUBLIC_KEY');
    });

    it('should return null when not configured', () => {
      // Arrange
      mockConfigService.get.mockReturnValue(undefined);

      // Act
      const result = service.getVapidPublicKey();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('sendToSubscription', () => {
    const mockSubscription = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/abc123',
      keys: {
        p256dh: 'BNtest...',
        auth: 'authtest...',
      },
    };

    const mockPayload = {
      title: 'Test Notification',
      body: 'This is a test',
    };

    beforeEach(async () => {
      // Initialize service
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'VAPID_PUBLIC_KEY') return 'BNtest-public-key';
        if (key === 'VAPID_PRIVATE_KEY') return 'test-private-key';
        return null;
      });
      await service.onModuleInit();
    });

    it('should send notification successfully', async () => {
      // Arrange
      (webpush.sendNotification as jest.Mock).mockResolvedValue({});

      // Act
      const result = await service.sendToSubscription(mockSubscription, mockPayload);

      // Assert
      expect(result).toBe(true);
      expect(webpush.sendNotification).toHaveBeenCalledWith(
        mockSubscription,
        expect.stringContaining('"title":"Test Notification"'),
      );
    });

    it('should include all payload fields in notification', async () => {
      // Arrange
      (webpush.sendNotification as jest.Mock).mockResolvedValue({});
      const fullPayload = {
        title: 'Achievement Unlocked',
        body: 'You earned the Explorer badge',
        icon: '/badges/explorer.png',
        badge: '/custom-badge.png',
        tag: 'achievement',
        data: { achievementId: 'exp-001' },
      };

      // Act
      await service.sendToSubscription(mockSubscription, fullPayload);

      // Assert
      const sentPayload = JSON.parse(
        (webpush.sendNotification as jest.Mock).mock.calls[0][1],
      );
      expect(sentPayload.title).toBe('Achievement Unlocked');
      expect(sentPayload.body).toBe('You earned the Explorer badge');
      expect(sentPayload.icon).toBe('/badges/explorer.png');
      expect(sentPayload.badge).toBe('/custom-badge.png');
      expect(sentPayload.tag).toBe('achievement');
      expect(sentPayload.data.achievementId).toBe('exp-001');
    });

    it('should use default icon and badge when not provided', async () => {
      // Arrange
      (webpush.sendNotification as jest.Mock).mockResolvedValue({});

      // Act
      await service.sendToSubscription(mockSubscription, mockPayload);

      // Assert
      const sentPayload = JSON.parse(
        (webpush.sendNotification as jest.Mock).mock.calls[0][1],
      );
      expect(sentPayload.icon).toBe('/icons/icon-192x192.png');
      expect(sentPayload.badge).toBe('/icons/badge-72x72.png');
      expect(sentPayload.tag).toBe('gamilit-notification');
    });

    it('should include vibration pattern', async () => {
      // Arrange
      (webpush.sendNotification as jest.Mock).mockResolvedValue({});

      // Act
      await service.sendToSubscription(mockSubscription, mockPayload);

      // Assert
      const sentPayload = JSON.parse(
        (webpush.sendNotification as jest.Mock).mock.calls[0][1],
      );
      expect(sentPayload.vibrate).toEqual([200, 100, 200]);
    });

    it('should return false when not initialized', async () => {
      // Arrange - create new service without init
      const uninitializedService = new PushNotificationService(
        mockConfigService as any,
        mockUserDeviceService as any,
      );

      // Act
      const result = await uninitializedService.sendToSubscription(
        mockSubscription,
        mockPayload,
      );

      // Assert
      expect(result).toBe(false);
      expect(webpush.sendNotification).not.toHaveBeenCalled();
    });

    it('should throw InvalidSubscriptionError on 410 Gone', async () => {
      // Arrange
      const error = new Error('Subscription expired');
      (error as any).statusCode = 410;
      (webpush.sendNotification as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(service.sendToSubscription(mockSubscription, mockPayload)).rejects.toThrow(
        InvalidSubscriptionError,
      );
      await expect(service.sendToSubscription(mockSubscription, mockPayload)).rejects.toThrow(
        'Invalid or expired subscription (status: 410)',
      );
    });

    it('should throw InvalidSubscriptionError on 404 Not Found', async () => {
      // Arrange
      const error = new Error('Subscription not found');
      (error as any).statusCode = 404;
      (webpush.sendNotification as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(service.sendToSubscription(mockSubscription, mockPayload)).rejects.toThrow(
        InvalidSubscriptionError,
      );
    });

    it('should propagate other errors', async () => {
      // Arrange
      const error = new Error('Network error');
      (error as any).statusCode = 500;
      (webpush.sendNotification as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(service.sendToSubscription(mockSubscription, mockPayload)).rejects.toThrow(
        'Network error',
      );
    });
  });

  describe('sendToDevice', () => {
    const mockPayload = {
      title: 'Device Test',
      body: 'Testing device token',
    };

    beforeEach(async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'VAPID_PUBLIC_KEY') return 'BNtest-public-key';
        if (key === 'VAPID_PRIVATE_KEY') return 'test-private-key';
        return null;
      });
      await service.onModuleInit();
    });

    it('should parse JSON token and send notification', async () => {
      // Arrange
      const deviceToken = JSON.stringify({
        endpoint: 'https://fcm.googleapis.com/fcm/send/xyz',
        keys: { p256dh: 'key1', auth: 'key2' },
      });
      (webpush.sendNotification as jest.Mock).mockResolvedValue({});

      // Act
      const result = await service.sendToDevice(deviceToken, mockPayload);

      // Assert
      expect(result).toBe(true);
      expect(webpush.sendNotification).toHaveBeenCalled();
    });

    it('should throw InvalidSubscriptionError for invalid JSON', async () => {
      // Arrange
      const invalidToken = 'not-valid-json';

      // Act & Assert
      await expect(service.sendToDevice(invalidToken, mockPayload)).rejects.toThrow(
        InvalidSubscriptionError,
      );
    });
  });

  describe('sendToUser', () => {
    const mockPayload = {
      title: 'User Notification',
      body: 'Message for user',
    };

    beforeEach(async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'VAPID_PUBLIC_KEY') return 'BNtest-public-key';
        if (key === 'VAPID_PRIVATE_KEY') return 'test-private-key';
        return null;
      });
      await service.onModuleInit();
    });

    it('should send to all active user devices', async () => {
      // Arrange
      const devices = [
        {
          id: 'device-1',
          deviceToken: JSON.stringify({ endpoint: 'https://endpoint1', keys: {} }),
        },
        {
          id: 'device-2',
          deviceToken: JSON.stringify({ endpoint: 'https://endpoint2', keys: {} }),
        },
      ];
      mockUserDeviceService.getActiveDevicesByUser.mockResolvedValue(devices);
      (webpush.sendNotification as jest.Mock).mockResolvedValue({});

      // Act
      const result = await service.sendToUser('user-123', mockPayload);

      // Assert
      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(0);
      expect(result.invalidTokens).toHaveLength(0);
      expect(mockUserDeviceService.updateLastUsed).toHaveBeenCalledTimes(2);
    });

    it('should return zeros when user has no devices', async () => {
      // Arrange
      mockUserDeviceService.getActiveDevicesByUser.mockResolvedValue([]);

      // Act
      const result = await service.sendToUser('user-no-devices', mockPayload);

      // Assert
      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(0);
      expect(result.invalidTokens).toHaveLength(0);
    });

    it('should handle partial failures', async () => {
      // Arrange
      const devices = [
        {
          id: 'device-1',
          deviceToken: JSON.stringify({ endpoint: 'https://valid', keys: {} }),
        },
        {
          id: 'device-2',
          deviceToken: JSON.stringify({ endpoint: 'https://invalid', keys: {} }),
        },
      ];
      mockUserDeviceService.getActiveDevicesByUser.mockResolvedValue(devices);
      (webpush.sendNotification as jest.Mock)
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(new Error('Failed'));

      // Act
      const result = await service.sendToUser('user-123', mockPayload);

      // Assert
      expect(result.successCount).toBe(1);
      expect(result.failureCount).toBe(1);
    });

    it('should invalidate expired subscriptions', async () => {
      // Arrange
      const devices = [
        {
          id: 'device-expired',
          deviceToken: JSON.stringify({ endpoint: 'https://expired', keys: {} }),
        },
      ];
      mockUserDeviceService.getActiveDevicesByUser.mockResolvedValue(devices);
      const error = new Error('Expired');
      (error as any).statusCode = 410;
      (webpush.sendNotification as jest.Mock).mockRejectedValue(error);

      // Act
      const result = await service.sendToUser('user-123', mockPayload);

      // Assert
      expect(result.failureCount).toBe(1);
      expect(result.invalidTokens).toHaveLength(1);
      expect(mockUserDeviceService.invalidateDevice).toHaveBeenCalledWith(
        'user-123',
        devices[0].deviceToken,
      );
    });
  });

  describe('generateVapidKeys (static)', () => {
    it('should call web-push generateVAPIDKeys', () => {
      // Arrange
      const mockKeys = {
        publicKey: 'BNgenerated-public',
        privateKey: 'generated-private',
      };
      (webpush.generateVAPIDKeys as jest.Mock).mockReturnValue(mockKeys);

      // Act
      const result = PushNotificationService.generateVapidKeys();

      // Assert
      expect(result).toEqual(mockKeys);
      expect(webpush.generateVAPIDKeys).toHaveBeenCalled();
    });
  });

  describe('InvalidSubscriptionError', () => {
    it('should have correct name and message', () => {
      // Act
      const error = new InvalidSubscriptionError(410);

      // Assert
      expect(error.name).toBe('InvalidSubscriptionError');
      expect(error.message).toBe('Invalid or expired subscription (status: 410)');
      expect(error.statusCode).toBe(410);
    });
  });
});
